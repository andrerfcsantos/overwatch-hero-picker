"use client";

import { useEffect, useEffectEvent } from "react";
import { track } from "@/lib/analytics";

type ShortcutMap = Record<string, () => void>;

export function useKeyboardShortcuts(shortcuts: ShortcutMap) {
  // Reads the latest shortcuts without re-subscribing on every render.
  const handleKeyDown = useEffectEvent((e: KeyboardEvent) => {
    const tag = (e.target as HTMLElement).tagName;
    const isInput = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
    const isEditable = (e.target as HTMLElement).isContentEditable;

    // Check ctrl+ shortcuts first (allowed even in inputs for things like ctrl+c)
    if (e.ctrlKey && !e.metaKey && !e.altKey) {
      const combo = `ctrl+${e.key.toLowerCase()}`;
      const handler = shortcuts[combo];
      if (handler) {
        e.preventDefault();
        handler();
        track("keyboard_shortcut_used", { key: combo });
        return;
      }
    }

    // Plain key shortcuts — skip if modifier held or in input
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (isInput || isEditable) return;

    const key = e.key.toLowerCase();
    const handler = shortcuts[key];
    if (handler) {
      e.preventDefault();
      handler();
      track("keyboard_shortcut_used", { key });
    }
  });

  useEffect(() => {
    // Effect Events have no stable identity, so subscribe a wrapper that the
    // cleanup can remove.
    const listener = (e: KeyboardEvent) => handleKeyDown(e);
    document.addEventListener("keydown", listener);
    return () => document.removeEventListener("keydown", listener);
  }, []);
}
