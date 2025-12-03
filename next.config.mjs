import { withSentryConfig } from "@sentry/nextjs";
import webpack from "webpack";
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
    remotePatterns: process.env.DOCS_CMS_URL ? [new URL(process.env.DOCS_CMS_URL + "/**")] : [],
  },

  webpack: (config) => {
    config.module.rules.push({
      test: /\.(woff2|webmanifest)$/,
      type: "asset/resource",
    });
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /\.d\.ts$/,
      }),
    );
    return config;
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
