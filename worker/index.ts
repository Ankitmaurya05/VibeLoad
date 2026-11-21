type Env = { ASSETS: { fetch(request: Request): Promise<Response> } };

const MAX_PAGE_BYTES = 1_000_000;
const MAX_DOWNLOAD_BYTES = 500 * 1024 * 1024;
const MEDIA_EXT = /\.(mp4|webm|mov|m4v|ogv|mp3|m4a|wav|ogg)(?:$|[?#])/i;
const MEDIA_TYPE = /^(video\/(mp4|webm|quicktime|ogg)|audio\/(mpeg|mp4|wav|ogg|webm))(?:\s*;|$)/i;
const BLOCKED_HOSTS = new Set(["localhost", "metadata.google.internal"]);

function validTarget(raw: string): URL {
  const u = new URL(raw);
  if (!["http:", "https:"].includes(u.protocol) || u.username || u.password) throw new Error("Only public HTTP(S) URLs are supported.");
  const h = u.hostname.toLowerCase().replace(/\.$/, "");
  if (!h || h === "localhost" || h.endsWith(".localhost") || h.endsWith(".local") || h.endsWith(".internal") || BLOCKED_HOSTS.has(h)) throw new Error("Private and local hosts are not supported.");
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(h) || h.startsWith("[") || !h.includes(".")) throw new Error("IP-literal and local host URLs are not supported.");
  return u;
}

function platformFor(host: string): string | null {
  const entries: Record<string, string> = {
    "youtube.com": "YouTube", "youtu.be": "YouTube", "youtube-nocookie.com": "YouTube",
    "instagram.com": "Instagram", "tiktok.com": "TikTok", "facebook.com": "Facebook",
    "fb.watch": "Facebook", "x.com": "X", "twitter.com": "X", "vimeo.com": "Vimeo"
  };
  const h = host.toLowerCase().replace(/^www\./, "");
  return Object.entries(entries).find(([d]) => h === d || h.endsWith("." + d))?.[1] ?? null;
}

function decodeHtml(s: string): string {
  return s.replace(/&amp;/g, "&").replace(/&#x2F;/gi, "/").replace(/&quot;/g, '"').replace(/&#39;/g, "'");
}

function qualityFor(name: string): string {
  const match = name.match(/(?:^|[^0-9])(2160|1440|1080|720|480|360|240)p?(?:[^0-9]|$)/i);
  return match ? match[1] + "p" : "Original quality";
}

function pageMetadata(html: string): { title?: string; thumbnail?: string; creator?: string } {
  const meta = (key: string) => {
    const escaped = key.replace(/[.*+?^$\{\}()|[\]\\]/g, "\\function extractMedia(html: string, base: URL): Array<{ url: string; type: string; label: string; quality: string }> {");
    const re = new RegExp('<meta[^>]+(?:property|name)=["\\\']' + escaped + '["\\\'][^>]+content=["\\\']([^"\\\']+)["\\\']', 'i');
    const reverse = new RegExp('<meta[^>]+content=["\\\']([^"\\\']+)["\\\'][^>]+(?:property|name)=["\\\']' + escaped + '["\\\']', 'i');
    return decodeHtml((html.match(re) || html.match(reverse) || [])[1] || "").slice(0, 300);
  };
  const title = meta("og:title") || meta("twitter:title") || decodeHtml((html.match(/<title[^>]*>([^<]+)<\/title>/i) || [])[1] || "").slice(0, 200);
  const thumbnail = meta("og:image") || meta("twitter:image");
  const creator = meta("author") || meta("og:site_name");
  return { ...(title ? { title } : {}), ...(thumbnail ? { thumbnail } : {}), ...(creator ? { creator } : {}) };
}

function extractMedia(html: string, base: URL): Array<{ url: string; type: string; label: string }> {
  const found = new Map<string, { url: string; type: string; label: string; quality: string }>();
  const patterns = [
    /<meta[^>]+(?:property|name)=["'](?:og:video(?::secure_url)?|twitter:player:stream)["'][^>]+content=["']([^"']+)["'][^>]*>/gi,
    /<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["'](?:og:video(?::secure_url)?|twitter:player:stream)["'][^>]*>/gi,
    /<(?:video|source)[^>]+src=["']([^"']+)["'][^>]*>/gi,
    /<link[^>]+href=["']([^"']+)["'][^>]+type=["'](?:video|audio)\//gi,
    /["']contentUrl["']\s*:\s*["']([^"']+)["']/gi
  ];
  for (const re of patterns) {
    for (const m of html.matchAll(re)) {
      try {
        const u = validTarget(new URL(decodeHtml(m[1]), base).href);
        if (MEDIA_EXT.test(u.href) && !found.has(u.href)) found.set(u.href, { url: u.href, type: "media", label: u.pathname.split("/").pop() || "Video file", quality: qualityFor(u.pathname) });
      } catch { /* ignore malformed or disallowed candidates */ }
    }
  }
  return [...found.values()].slice(0, 8);
}

async function fetchPublic(url: URL, method: "GET" | "HEAD" = "GET"): Promise<Response> {
  let current = url;
  for (let i = 0; i < 4; i++) {
    validTarget(current.href);
    const res = await fetch(current.href, { method, redirect: "manual", headers: { "User-Agent": "VibeLoad/1.0 (+https://vibeload.pages.dev)" } });
    if ([301, 302, 303, 307, 308].includes(res.status)) {
      const location = res.headers.get("location");
      if (!location) return res;
      current = validTarget(new URL(location, current).href);
      continue;
    }
    return res;
  }
  throw new Error("Too many redirects from the source.");
}

function json(data: unknown, status = 200): Response {
  return Response.json(data, { status, headers: { "Cache-Control": "no-store" } });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin");
    if (origin && origin !== url.origin) return json({ error: "Cross-origin requests are not allowed." }, 403);
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: { "Allow": "GET, POST, OPTIONS" } });

    if (url.pathname === "/api/health") return json({ ok: true, service: "VibeLoad", mode: "public-media-only" });

    if (url.pathname === "/api/inspect" && request.method === "POST") {
      try {
        const body = await request.json() as { url?: string };
        if (!body.url || body.url.length > 4096) return json({ error: "Provide a valid URL (maximum 4,096 characters)." }, 400);
        const target = validTarget(body.url);
        const platform = platformFor(target.hostname);
        if (platform === "YouTube") return json({ platform, items: [], message: "YouTube does not expose a general public video-download endpoint. Use YouTube's official download or creator export options." });
        if (MEDIA_EXT.test(target.href)) return json({ platform: platform || "Direct media", items: [{ url: target.href, type: "media", label: target.pathname.split("/").pop() || "Media file", quality: qualityFor(target.pathname) }] });

        const res = await fetchPublic(target);
        if (!res.ok) return json({ platform, items: [], message: `The source returned HTTP ${res.status}.` }, 422);
        const contentType = res.headers.get("content-type") || "";
        if (!contentType.includes("text/html")) {
          if (MEDIA_TYPE.test(contentType)) return json({ platform, items: [{ url: target.href, type: contentType, label: target.pathname.split("/").pop() || "Media file" }] });
          return json({ platform, items: [], message: "The source did not return a supported media file or HTML page." }, 422);
        }
        const declared = Number(res.headers.get("content-length") || 0);
        if (declared > MAX_PAGE_BYTES) return json({ platform, items: [], message: "The source page is too large to inspect." }, 413);
        const html = (await res.text()).slice(0, MAX_PAGE_BYTES);
        const items = extractMedia(html, target);
        const preview = pageMetadata(html);
        return json({ platform, preview, items, message: items.length ? "Found publicly exposed media file link(s)." : "No direct downloadable media file was exposed by this page. Protected, segmented or login-only streams are not extracted." });
      } catch (e) {
        return json({ error: e instanceof Error ? e.message : "Could not inspect this URL." }, 400);
      }
    }

    if (url.pathname === "/api/download" && request.method === "GET") {
      try {
        const raw = url.searchParams.get("url");
        if (!raw || raw.length > 4096) return json({ error: "Missing or invalid media URL." }, 400);
        const target = validTarget(raw);
        const upstream = await fetchPublic(target);
        if (!upstream.ok) return json({ error: `Source returned HTTP ${upstream.status}.` }, 502);
        const type = upstream.headers.get("content-type") || "";
        if (!MEDIA_TYPE.test(type) && !MEDIA_EXT.test(target.href)) return json({ error: "The source did not return a recognized direct media file." }, 415);
        const length = Number(upstream.headers.get("content-length") || 0);
        if (length > MAX_DOWNLOAD_BYTES) return json({ error: "Files larger than 500 MB are not supported." }, 413);
        const filename = (target.pathname.split("/").pop() || "vibeload-media").replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 100);
        const headers = new Headers();
        headers.set("Content-Type", type || "application/octet-stream");
        headers.set("Content-Disposition", `attachment; filename="${filename}"`);
        headers.set("Cache-Control", "no-store");
        if (length) headers.set("Content-Length", String(length));
        return new Response(upstream.body, { status: 200, headers });
      } catch (e) {
        return json({ error: e instanceof Error ? e.message : "Download failed." }, 400);
      }
    }

    return env.ASSETS.fetch(request);
  }
};
