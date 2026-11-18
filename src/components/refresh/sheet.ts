import type { MouseEvent } from "react";

/**
 * Closes a sheet when the press was on its backdrop. A press on the sheet's
 * own empty space, below content shorter than the window, also lands on the
 * dialog element itself, so where the press was is what tells the two apart:
 * the backdrop is everything outside the dialog's box.
 */
export function closeOnBackdrop(event: MouseEvent<HTMLDialogElement>): void {
  const dialog = event.currentTarget;
  if (event.target !== dialog) return;
  const box = dialog.getBoundingClientRect();
  const inside =
    event.clientX >= box.left &&
    event.clientX <= box.right &&
    event.clientY >= box.top &&
    event.clientY <= box.bottom;
  if (!inside) dialog.close();
}
