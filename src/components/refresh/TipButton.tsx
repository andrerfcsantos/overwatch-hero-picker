"use client";

import { type ComponentProps, useId, useRef, useState } from "react";
import styles from "./TipButton.module.css";

interface TipButtonProps extends ComponentProps<"button"> {
  /** A sentence on what the button does, shown on hover and keyboard focus. */
  tip: string | null;
  /**
   * Set when the tip only repeats the button's own name, as the tip of an
   * icon does. It is then left out of what a screen reader is told, which
   * would otherwise be the same words twice.
   */
  tipIsName?: boolean;
}

/** How close to the window's edge a tip may come, in pixels. */
const EDGE = 8;

/**
 * A button with a tooltip, for controls too small to say what they do.
 *
 * The tip shows on hover and on keyboard focus, stays while the pointer is on
 * it, and Escape puts it away, so it never sits over something the visitor
 * wants to read. It is centred under the button, or as near to that as the
 * window's edges allow. The button still needs its own short name
 * (`aria-label` when it is only an icon); the tip adds to that and is read
 * out as its description.
 */
export default function TipButton({
  tip,
  tipIsName = false,
  onKeyDown,
  ...props
}: TipButtonProps) {
  const id = useId();
  const tipRef = useRef<HTMLSpanElement>(null);
  const [dismissed, setDismissed] = useState(false);

  // Runs as the tip is about to show, when it already has its size: a tip
  // that would cross an edge of the window is moved back inside it.
  const place = () => {
    const node = tipRef.current;
    if (!node) return;
    node.style.setProperty("--tip-shift", "0px");
    const { left, right } = node.getBoundingClientRect();
    const max = document.documentElement.clientWidth - EDGE;
    const shift = right > max ? max - right : left < EDGE ? EDGE - left : 0;
    node.style.setProperty("--tip-shift", `${Math.round(shift)}px`);
  };

  return (
    <span
      className={styles.anchor}
      data-dismissed={dismissed || undefined}
      onPointerEnter={place}
      onFocus={place}
      onPointerLeave={() => setDismissed(false)}
      onBlur={() => setDismissed(false)}
    >
      <button
        type="button"
        {...props}
        aria-describedby={tip && !tipIsName ? id : undefined}
        onKeyDown={(event) => {
          if (event.key === "Escape") setDismissed(true);
          onKeyDown?.(event);
        }}
      />
      {tip && (
        <span
          ref={tipRef}
          id={id}
          role="tooltip"
          aria-hidden={tipIsName || undefined}
          className={styles.tip}
        >
          {tip}
        </span>
      )}
    </span>
  );
}
