"use client";

// Every deploy of the static export re-hashes the chunk filenames and swaps the
// whole asset set. A tab that still holds the previous HTML then asks for a
// chunk the deploy already removed, gets the 404 page back, and the router
// throws. Without recovery the visitor is stuck on a dead page.
const RELOAD_MARKER = "chunk-reload-at";

// A reload that fails again within this window means the asset is genuinely
// gone, so we stop instead of looping. A stale chunk from a later deploy in the
// same session sits well outside the window and still recovers.
const RELOAD_WINDOW_MS = 10_000;

function isChunkLoadError(error: Error): boolean {
  return (
    error.name === "ChunkLoadError" ||
    /Loading chunk [^ ]+ failed/i.test(error.message) ||
    /Failed to fetch dynamically imported module/i.test(error.message) ||
    /error loading dynamically imported module/i.test(error.message)
  );
}

function recoverFromStaleChunk(error: Error): void {
  if (typeof window === "undefined" || !isChunkLoadError(error)) return;
  const lastReload = Number(sessionStorage.getItem(RELOAD_MARKER)) || 0;
  if (Date.now() - lastReload < RELOAD_WINDOW_MS) return;
  sessionStorage.setItem(RELOAD_MARKER, String(Date.now()));
  window.location.reload();
}

export default function GlobalError({ error }: { error: Error }) {
  // A hard reload pulls the current HTML and the chunk names it points at.
  // Guarded so a genuinely missing asset shows the fallback instead of looping.
  recoverFromStaleChunk(error);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1.5rem",
          padding: "2rem",
          textAlign: "center",
          backgroundColor: "#2c3e50",
          color: "white",
          fontFamily: "Arial, Helvetica, sans-serif",
        }}
      >
        <h1 style={{ fontSize: "2rem", margin: 0 }}>Something went wrong</h1>
        <p style={{ maxWidth: 420 }}>
          The page could not finish loading. Reload to get the latest version.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          style={{
            padding: "0.6rem 1.4rem",
            fontSize: "1.1rem",
            color: "white",
            backgroundColor: "#e67e22",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
          }}
        >
          Reload
        </button>
      </body>
    </html>
  );
}
