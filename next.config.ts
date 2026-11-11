import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const isDev = process.env.NODE_ENV !== "production";

// Product share links (https://www.sribeesonline.com/p/{id}) are served by the
// backend: it writes the Open Graph tags Facebook and WhatsApp read, draws the
// preview picture, and sends phones on to the app. The web site only passes
// them through, so the shared address is the shop's own.
const apiOrigin = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_API_URL?.trim() || "").origin;
  } catch {
    return "";
  }
})();

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "devapionline.sribees.com",
      },
      {
        protocol: "https",
        hostname: "api.sribeesonline.com",
      },
      // Local development image server support (only enabled in development)
      ...(isDev
        ? [
            {
              protocol: "http" as const,
              hostname: "localhost",
            },
          ]
        : []),
    ],
  },
  async rewrites() {
    if (!apiOrigin) return [];
    return [
      { source: "/p/:path*", destination: `${apiOrigin}/p/:path*` },
      // App Links / Universal Links proof, so the app opens www links itself.
      {
        source: "/.well-known/assetlinks.json",
        destination: `${apiOrigin}/.well-known/assetlinks.json`,
      },
      {
        source: "/.well-known/apple-app-site-association",
        destination: `${apiOrigin}/.well-known/apple-app-site-association`,
      },
    ];
  },
  async redirects() {
    return [
      { source: "/home", destination: "/shop", permanent: true },
      { source: "/partner", destination: "/become-partner", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(self)",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              // Google sign-in (Identity Services): its script, button
              // frame, styles and FedCM calls all live under /gsi/.
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com/gsi/client",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://accounts.google.com/gsi/style",
              "frame-src https://accounts.google.com/gsi/",
              "font-src 'self' https://fonts.gstatic.com data:",
              "img-src 'self' data: blob: https://images.unsplash.com https://devapionline.sribees.com https://api.sribeesonline.com",
              "connect-src 'self' https://accounts.google.com/gsi/ https://devapionline.sribees.com https://api.sribeesonline.com http://localhost:8000 http://localhost:3000",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
