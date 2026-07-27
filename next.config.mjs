import { withSentryConfig } from "@sentry/nextjs";
import ContentSecurityPolicy from "./csp.config.mjs";

// const withBundleAnalyzer = bundleAnalyzer({
//   enabled: process.env.ANALYZE === "true",
// });

const pkg = await import("./package.json", { with: { type: "json" } });
const version = pkg.default.version;

/** @type {import('next').NextConfig} */
const moduleExports = {
  basePath: process.env.NEXT_PUBLIC_BASE_PATH,
  crossOrigin: "anonymous",
  pageExtensions: ["js", "jsx", "mdx", "ts", "tsx", "md"],
  poweredByHeader: false,
  bundlePagesRouterDependencies: true,
  productionBrowserSourceMaps: process.env.PRODUCTION_SOURCE_MAPS === "1",

  // This causes double-renders of pages in developement to avoid concurrency bugs!
  reactStrictMode: process.env.NODE_ENV !== "production",

  images: {
    // The Docs CMS host resolves to a private IP from inside our hosting network
    // (internal routing / split-horizon DNS). Next 16 added an SSRF check that rejects
    // upstream images resolving to private IPs with a 400 "url parameter is not allowed",
    // even when the host matches remotePatterns below. Hosts are still restricted to the
    // patterns below, so re-allow private IPs here.
    dangerouslyAllowLocalIP: true,
    remotePatterns: [
      { protocol: "https", hostname: "**.gouv.fr", pathname: "/**" },
      ...(process.env.DOCS_CMS_URL
        ? [new URL(process.env.DOCS_CMS_URL.replace(/\/+$/, "") + "/**")]
        : []),
    ],
  },

  env: {
    NEXT_PUBLIC_APP_VERSION: version,
    NEXT_PUBLIC_APP_VERSION_COMMIT: process.env.GITHUB_SHA || process.env.CONTAINER_VERSION,
    CONTENT_SECURITY_POLICY: ContentSecurityPolicy,
  },
  onDemandEntries: {
    // Keep compiled pages in memory longer
    maxInactiveAge: 24 * 3600 * 1000,
    pagesBufferLength: 100,
  },
  transpilePackages: ["@codegouvfr/react-dsfr", "tss-react"],
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [{ key: "Cross-Origin-Opener-Policy", value: "same-origin" }],
      },
    ];
  },
};

export default withSentryConfig(moduleExports, { silent: true });
