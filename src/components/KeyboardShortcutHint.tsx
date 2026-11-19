"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useDesign } from "@/context/DesignContext";

const soloShortcuts = [
  { key: "R", description: "Randomize hero" },
  { key: "T", description: "Toggle all Tanks" },
  { key: "D", description: "Toggle all Damage" },
  { key: "S", description: "Toggle all Support" },
  { key: "U", description: "Unselect all heroes" },
  { key: "P", description: "Randomize perks" },
  { key: "1–0", description: "Apply preset 1 to 10" },
];

const squadShortcuts = [
  { key: "R", description: "Randomize squad" },
  { key: "Ctrl+C", description: "Copy squad to clipboard" },
];

// The new design names the same actions the way its buttons do.
const soloShortcutsRefresh = [
  { key: "R", description: "Roll a hero" },
  { key: "P", description: "Reroll perks" },
  { key: "T", description: "Add or remove all tanks" },
  { key: "D", description: "Add or remove all damage" },
  { key: "S", description: "Add or remove all supports" },
  { key: "U", description: "Clear selection" },
  { key: "1–0", description: "Apply preset 1 to 10" },
];

const squadShortcutsRefresh = [
  { key: "R", description: "Roll the squad" },
  { key: "Ctrl+C", description: "Copy the squad as text" },
];

export default function KeyboardShortcutHint() {
  const [open, setOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const { design } = useDesign();

  const onSquad = pathname === "/squad";
  const shortcuts =
    design === "refresh"
      ? onSquad
        ? squadShortcutsRefresh
        : soloShortcutsRefresh
      : onSquad
        ? squadShortcuts
        : soloShortcuts;

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(e: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }

    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  return (
    <div ref={popoverRef} className="shortcut-hint-container">
      {open && (
        <div className="shortcut-popover">
          <h3 className="shortcut-popover-title">Keyboard Shortcuts</h3>
          <div className="shortcut-list">
            {shortcuts.map(({ key, description }) => (
              <div key={key} className="shortcut-row">
                <kbd className="shortcut-kbd">{key}</kbd>
                <span className="shortcut-desc">{description}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      <button
        className="shortcut-hint-button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Keyboard shortcuts"
        title="Keyboard shortcuts"
      >
        ?
      </button>
    </div>
  );
}
