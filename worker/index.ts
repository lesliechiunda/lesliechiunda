/** Cloudflare Worker entry point for Leslie Chiunda's multi-surface platform. */
import {
  handleImageOptimization,
  DEFAULT_DEVICE_SIZES,
  DEFAULT_IMAGE_SIZES,
} from "vinext/server/image-optimization";
import handler from "vinext/server/app-router-entry";

interface Env {
  ASSETS: Fetcher;
  DB: D1Database;
  MEDIA: R2Bucket;
  IMAGES: {
    input(stream: ReadableStream): {
      transform(options: Record<string, unknown>): {
        output(options: { format: string; quality: number }): Promise<{ response(): Response }>;
      };
    };
  };
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

const RESERVED_SUBDOMAINS = new Set(["www", "admin", "api", "preview"]);

function rewriteBusinessSubdomain(request: Request) {
  const url = new URL(request.url);
  const suffix = ".lesliechiunda.com";
  if (!url.hostname.endsWith(suffix)) return request;

  const slug = url.hostname.slice(0, -suffix.length).toLowerCase();
  if (!slug || slug.includes(".") || RESERVED_SUBDOMAINS.has(slug)) return request;

  const isAppAsset =
    url.pathname.startsWith("/_next/") ||
    url.pathname.startsWith("/_vinext/") ||
    /\.[a-z0-9]{2,5}$/i.test(url.pathname);
  if (isAppAsset) return request;

  url.pathname = `/preview/${slug}`;
  return new Request(url, request);
}

const worker = {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/_vinext/image") {
      const allowedWidths = [...DEFAULT_DEVICE_SIZES, ...DEFAULT_IMAGE_SIZES];
      return handleImageOptimization(
        request,
        {
          fetchAsset: (path) => env.ASSETS.fetch(new Request(new URL(path, request.url))),
          transformImage: async (body, { width, format, quality }) => {
            const result = await env.IMAGES.input(body)
              .transform(width > 0 ? { width } : {})
              .output({ format, quality });
            return result.response();
          },
        },
        allowedWidths,
      );
    }

    return handler.fetch(rewriteBusinessSubdomain(request), env, ctx);
  },
};

export default worker;
