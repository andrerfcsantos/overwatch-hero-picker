import { SavedPreset } from "./types";

/**
 * Puts `preset` back in `presets` just below the preset `afterId`, or at the
 * top when that is null or no longer in the list. This is how a delete is
 * undone.
 *
 * A preset already in the list with the same id gives way to it. That only
 * happens to a built-in preset restored after it was deleted: the restored
 * one is the stock version, and the one being put back is the visitor's own,
 * with whatever they had renamed or changed, so theirs is the one kept.
 */
export function insertAfter(
  presets: SavedPreset[],
  preset: SavedPreset,
  afterId: string | null,
): SavedPreset[] {
  const next = presets.filter((existing) => existing.id !== preset.id);
  const anchor = afterId
    ? next.findIndex((existing) => existing.id === afterId)
    : -1;
  next.splice(anchor + 1, 0, preset);
  return next;
}
