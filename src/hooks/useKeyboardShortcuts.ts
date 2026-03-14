"use client";

import { useEffect, useRef } from "react";

type ShortcutMap = Record<string, () => void>;

export function useKeyboardShortcuts(shortcuts: ShortcutMap) {
  const shortcutsRef = useRef(shortcuts);
  shortcutsRef.current = shortcuts;

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName;
      const isInput = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
      const isEditable = (e.target as HTMLElement).isContentEditable;

      // Check ctrl+ shortcuts first (allowed even in inputs for things like ctrl+c)
      if (e.ctrlKey && !e.metaKey && !e.altKey) {
        const combo = `ctrl+${e.key.toLowerCase()}`;
        const handler = shortcutsRef.current[combo];
        if (handler) {
          e.preventDefault();
          handler();
          return;
        }
      }

      // Plain key shortcuts — skip if modifier held or in input
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (isInput || isEditable) return;

      const handler = shortcutsRef.current[e.key.toLowerCase()];
      if (handler) {
        e.preventDefault();
        handler();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);
}
