export const MEDIA_EXTENSIONS = new Set(['mp4','webm','mov','m4v','ogv','mp3','m4a','wav','ogg']);
export const MEDIA_MIME = /^(video\/(mp4|webm|quicktime|ogg)|audio\/(mpeg|mp4|wav|ogg|webm))$/i;

export type LinkClassification =
  | { kind: 'direct-media'; url: URL; extension: string }
  | { kind: 'platform'; url: URL; platform: string; label: string }
  | { kind: 'webpage'; url: URL };

const PLATFORM_HOSTS: Array<[string, string[]]> = [
  ['YouTube', ['youtube.com','youtu.be','youtube-nocookie.com']],
  ['Instagram', ['instagram.com']], ['TikTok', ['tiktok.com']],
  ['Facebook', ['facebook.com','fb.watch']], ['X', ['x.com','twitter.com']],
  ['Vimeo', ['vimeo.com']], ['Pinterest', ['pinterest.com','pin.it']],
  ['Threads', ['threads.net']]
];

export function parseSafeHttpUrl(raw: string): URL {
  const value = raw.trim();
  if (!value) throw new Error('Paste a link first.');
  let url: URL;
  try { url = new URL(value.includes('://') ? value : `https://${value}`); }
  catch { throw new Error('That does not look like a valid URL.'); }
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Only public HTTP or HTTPS links are supported.');
  if (url.username || url.password) throw new Error('Links containing embedded credentials are not accepted.');
  const host = url.hostname.toLowerCase().replace(/\.$/, '');
  const ipv4Private = /^(0|10|127|192\.168|169\.254|192\.0\.0|198\.18|198\.19|22[4-9]|23\d|24\d|25[0-5])\./.test(host) || /^172\.(1[6-9]|2\d|3[01])\./.test(host) || /^100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\./.test(host);
  const ipv6 = host.startsWith('[') ? host.slice(1, -1) : '';
  const ipv6Private = !!ipv6 && (ipv6 === '::' || ipv6 === '::1' || /^(fc|fd|fe[89ab])/i.test(ipv6) || /^::ffff:/i.test(ipv6));
  if (host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.local') || ipv4Private || ipv6Private) {
    throw new Error('Private or local network addresses are not supported.');
  }
  return url;
}

export function classifyLink(raw: string): LinkClassification {
  const url = parseSafeHttpUrl(raw);
  const hostname = url.hostname.toLowerCase().replace(/^www\./, '');
  const platform = PLATFORM_HOSTS.find(([, hosts]) => hosts.some(host => hostname === host || hostname.endsWith(`.${host}`)));
  if (platform) return { kind: 'platform', url, platform: platform[0], label: platform[0] };
  const last = url.pathname.split('/').pop() ?? '';
  const extension = last.includes('.') ? last.split('.').pop()!.toLowerCase() : '';
  if (MEDIA_EXTENSIONS.has(extension)) return { kind: 'direct-media', url, extension };
  return { kind: 'webpage', url };
}

export function safeFilename(url: URL, extension: string): string {
  let raw = url.pathname.split('/').filter(Boolean).pop() || 'vibeload-media';
  try { raw = decodeURIComponent(raw); } catch { /* keep the raw URL segment if it contains malformed escapes */ }
  const base = raw.replace(/[^a-zA-Z0-9._-]/g, '-').slice(0, 90).replace(/\.+$/, '');
  return base.includes('.') ? base : `${base || 'vibeload-media'}.${extension}`;
}
