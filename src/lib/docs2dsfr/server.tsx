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

async function fetchUrl(
  url: string,
  options: RequestInit = {},
  timeout: number = 5,
  requiredKey: string | null = null,
  retries: number = 2,
): Promise<object | null> {
  try {
    for (let i = 0; i < retries; i++) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout * 1000);

      const freshResponse = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (freshResponse.ok) {
        const freshData = await freshResponse.json();
        if (!requiredKey || freshData[requiredKey]) {
          return freshData;
        }
      }
    }

    return null;
  } catch (error) {
    console.error(
      `Error fetching ${url}: ${error instanceof Error ? error.message : String(error)}`,
    );
    return null;
  }
}

// Cached fetch function with expiry and timeout for stale cache
// Returns parsed JSON directly instead of Response object
async function cachedFetch(
  url: string,
  options: RequestInit = {},
  forceRefresh: boolean = false,
  requiredKey: string | null = null,
  cacheTTL: number = 4000,
  staleCacheTimeout: number = 5,
  requestTimeout: number = 10,
  retries: number = 2,
): Promise<object> {
  const cacheKey = `url:${url}`;

  let cacheEntry: CacheEntry | null = null;

  // If force refresh is requested, don't read from the cache
  if (!forceRefresh) {
    cacheEntry = await cache.get(cacheKey);

    // If we have cached data and it's not expired, return it immediately
    // Cache for 4000 seconds (1h+)
    if (cacheEntry && !isExpired(cacheEntry, cacheTTL)) {
      return JSON.parse(cacheEntry.value.toString());
    }
  }

  const freshData = await fetchUrl(
    url,
    options,
    cacheEntry ? staleCacheTimeout : requestTimeout,
    requiredKey,
    retries,
  );
  if (freshData) {
    const buffer = Buffer.from(JSON.stringify(freshData));
    await cache.set(cacheKey, buffer);
    return freshData;
  } else if (cacheEntry) {
    console.warn(`Using stale cache for ${url} due to timeout or error`);
    return JSON.parse(cacheEntry.value.toString());
  } else {
    throw new Error(`Failed to fetch ${url}`);
  }
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
    "content",
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
    "results",
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

  if (document.frontmatter.date) {
    // Make sure the date formatting always happens on the server side to avoid hydration errors
    document.frontmatter.dateFormatted = new Date(document.frontmatter.date).toLocaleDateString(
      "fr-FR",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
      },
    );
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

  // Remove blank paragraphs at the top
  document.content = document.content.replace(/^<p><\/p>/, "");

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
