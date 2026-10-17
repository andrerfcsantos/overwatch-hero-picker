/**
 * Whether a WebSocket handshake's Origin may open a room socket.
 *
 * `allowed` is a comma-separated list. An entry is either an exact origin
 * (`https://owheropicker.com`) or a host suffix starting with a dot
 * (`.main-4a3.workers.dev`), which allows any https subdomain of it. Browsers
 * always send Origin on a WebSocket handshake, so a missing one is refused.
 */
export function isOriginAllowed(
  origin: string | null,
  allowed: string,
): boolean {
  if (!origin) return false;
  let url: URL;
  try {
    url = new URL(origin);
  } catch {
    return false;
  }
  for (const entry of allowed.split(",").map((part) => part.trim())) {
    if (!entry) continue;
    if (entry.startsWith(".")) {
      if (url.protocol === "https:" && url.hostname.endsWith(entry)) {
        return true;
      }
    } else if (url.origin === entry) {
      return true;
    }
  }
  return false;
}
