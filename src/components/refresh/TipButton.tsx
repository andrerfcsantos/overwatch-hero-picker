"use client";

import { type ComponentProps, useId, useState } from "react";
import styles from "./TipButton.module.css";

interface TipButtonProps extends ComponentProps<"button"> {
  /** A sentence on what the button does, shown on hover and keyboard focus. */
  tip: string | null;
}

/**
 * A button with a tooltip, for controls too small to say what they do.
 *
 * The tip shows on hover and on keyboard focus, stays while the pointer is on
 * it, and Escape puts it away, so it never sits over something the visitor
 * wants to read. The button still needs its own short name (`aria-label`
 * when it is only an icon); the tip adds to that and is read out as its
 * description.
 */
export default function TipButton({
  tip,
  onKeyDown,
  ...props
}: TipButtonProps) {
  const id = useId();
  const [dismissed, setDismissed] = useState(false);

  return (
    <span
      className={styles.anchor}
      data-dismissed={dismissed || undefined}
      onPointerLeave={() => setDismissed(false)}
      onBlur={() => setDismissed(false)}
    >
      <button
        type="button"
        {...props}
        aria-describedby={tip ? id : undefined}
        onKeyDown={(event) => {
          if (event.key === "Escape") setDismissed(true);
          onKeyDown?.(event);
        }}
      />
      {tip && (
        <span id={id} role="tooltip" className={styles.tip}>
          {tip}
        </span>
      )}
    </span>
  );
}
