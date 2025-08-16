import { getImageProps } from "next/image";
import { cache, CacheEntry, isExpired } from "../cache";
import { DocsChild, DocsChildrenResponse, DocsContentResponse } from "./client";
import { htmlComponents } from "./components";

const getDocsBaseUrl = (): string => {
  const baseUrl = process.env.DOCS_CMS_URL || "";
  return baseUrl.replace(/\/$/, "");
};

const getDocsApiUrl = (path: string): string => {
  return `${getDocsBaseUrl()}/api/v1.0${path}`;
};

// Cached fetch function with 10-minute (600s) expiry and 5-second timeout for stale cache
// Returns parsed JSON directly instead of Response object
async function cachedFetch(
  url: string,
  options: RequestInit = {},
  forceRefresh: boolean = false,
): Promise<object> {
  const cacheKey = `url:${url}`;

  let cacheEntry: CacheEntry | null = null;

  // If force refresh is requested, delete the cache entry and fetch fresh
  if (!forceRefresh) {
    cacheEntry = await cache.get(cacheKey);

    // If we have cached data and it's not expired, return it immediately
    // Cache for 4000 seconds (1h+)
    if (cacheEntry && !isExpired(cacheEntry, 4000)) {
      return JSON.parse(cacheEntry.value.toString());
    }
  }

  // If we have stale cache data, try to fetch fresh data with a 5-second timeout
  if (cacheEntry) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const freshResponse = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (freshResponse.ok) {
        const freshData = await freshResponse.json();
        const buffer = Buffer.from(JSON.stringify(freshData));
        await cache.set(cacheKey, buffer);
        return freshData;
      }
    } catch (error) {
      // If fetch fails or times out, return stale cache
      if (error.name === "AbortError") {
        console.warn(`Using stale cache for ${url} due to timeout`);
        return JSON.parse(cacheEntry.value.toString());
      }
    }
  }

  // No cache or fresh fetch required
  const response = await fetch(url, options);

  if (response.ok) {
    const data = await response.json();
    const buffer = Buffer.from(JSON.stringify(data));
    await cache.set(cacheKey, buffer);
    return data;
  }

  throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
}

export async function fetchDocumentContent(
  docId: string,
  forceRefresh: boolean = false,
): Promise<DocsContentResponse> {
  const url = getDocsApiUrl(`/documents/${docId}/content/?content_format=html`);

  const data = await cachedFetch(
    url,
    {
      headers: {
        Accept: "application/json",
      },
    },
    forceRefresh,
  );

  return data as DocsContentResponse;
}

export async function fetchDocumentChildren(
  parentId: string,
  forceRefresh: boolean = false,
): Promise<DocsChildrenResponse> {
  const url = getDocsApiUrl(`/documents/${parentId}/children/`);

  const data = await cachedFetch(
    url,
    {
      headers: {
        Accept: "application/json",
      },
    },
    forceRefresh,
  );

  return data as DocsChildrenResponse;
}

export async function getDocument(
  docId: string,
  forceRefresh: boolean = false,
): Promise<DocsContentResponse> {
  const document = await fetchDocumentContent(docId, forceRefresh);
  document.frontmatter = {};

  if (!document.content) return document;

  // Extract frontmatter from the document content
  const frontmatter = document.content.match(
    /^<p>---<\/p>((<p>[a-z0-9_-]+\:\s.+?<\/p>)+)<p>---<\/p>/,
  );
  if (frontmatter && frontmatter[1]) {
    document.frontmatter =
      frontmatter[1]
        .match(/<p>([a-z0-9]+)\:\s(.+?)<\/p>/g)
        ?.reduce((acc: Record<string, string>, curr: string) => {
          const match = curr.match(/<p>([a-z0-9]+)\:\s(.+?)<\/p>/);
          if (match) {
            const [, key, value] = match;
            acc[key.toLowerCase()] = value;
          }
          return acc;
        }, {}) || {};
    document.content = document.content.slice(frontmatter[0].length);
  }

  // Convert custom tags to components (must have a "-" in the name)
  Object.keys(htmlComponents).forEach((component) => {
    if (component.includes("-")) {
      document.content = document.content.replace(
        new RegExp(`<p>&lt;${component}&gt;<\/p>(.*?)<p>&lt;\/${component}&gt;<\/p>`, "g"),
        `<${component}>$1</${component}>`,
      );
    }
  });

  // Extract an image URL if it's right after the frontmatter
  if (!document.frontmatter.image) {
    const image = document.content.match(/^<img\s+[^>]*src="([^"]+)"/);
    if (image) {
      document.frontmatter.image = getImageProps({
        src: image[1],
        alt: "",
        width: 800,
        height: 600,
      }).props.src;
    }
  }

  return document;
}

export async function getDocumentChildren(
  parentId: string,
  forceRefresh: boolean = false,
): Promise<DocsChild[]> {
  const response = await fetchDocumentChildren(parentId, forceRefresh);

  for (const doc of response.results) {
    doc.document = await getDocument(doc.id, forceRefresh);
  }

  return response.results;
}
