"use client";

import {
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { track } from "@/lib/analytics";
import { ROLES, getAllHeroes, getHeroesByRole } from "@/data/heroes";
import { useHeroes } from "@/context/HeroContext";
import { usePresets } from "@/context/PresetContext";
import { buildDefaultPresets } from "@/lib/presets/defaults";
import { presetShareUrl } from "@/lib/presets/share";
import { SavedPreset, shortcutForIndex } from "@/lib/presets/types";
import { HeroRole } from "@/types/hero";
import RoleSpriteIcon from "@/components/RoleSpriteIcon";
import ShareButton from "@/components/ShareButton";
import SpriteIcon from "@/components/SpriteIcon";
import PoolEditor from "./PoolEditor";
import ui from "./ui.module.css";
import styles from "./PresetManager.module.css";

const ALL_HEROES = getAllHeroes();

const ROLE_GROUPS = ROLES.map((role) => ({
  ...role,
  heroes: getHeroesByRole(role.key),
}));

/** Hero keys in roster order, so a preset reads the same however it was built. */
function inRosterOrder(keys: Set<string>): string[] {
  return ALL_HEROES.filter((hero) => keys.has(hero.key)).map(
    (hero) => hero.key,
  );
}

function heroCount(count: number): string {
  if (count === 0) return "No heroes";
  return count === 1 ? "1 hero" : `${count} heroes`;
}

/** What presets are, said once wherever the manager is shown. */
export function PresetIntro({ className }: { className?: string }) {
  return (
    <div className={className}>
      <p>
        A preset is a hero pool saved under a name, in this browser. Applying
        one sets the pool to its heroes.
      </p>
      <p className={styles.keysNote}>
        The first ten also answer to the number keys, in the order they are
        listed.
      </p>
    </div>
  );
}

/**
 * Who a preset holds, at a glance, said the way a player would say it. A role
 * it holds all of is a count. One it holds most of is "all but" the few left
 * out, drawn hollow as they are in the roster. One it holds a few of is those
 * few. So the line stays short however large the preset is, and a large one
 * shows the thing worth knowing about it, which is who is missing.
 */
function Roster({ preset }: { preset: SavedPreset }) {
  const held = new Set(preset.heroes);
  const groups = ROLE_GROUPS.map((group) => ({
    ...group,
    members: group.heroes.filter((hero) => held.has(hero.key)),
    missing: group.heroes.filter((hero) => !held.has(hero.key)),
  })).filter((group) => group.members.length > 0);

  if (groups.length === 0) {
    return <p className={styles.none}>Empty, so rolls use every hero.</p>;
  }

  return (
    <ul className={styles.roster} aria-label={`Heroes in ${preset.name}`}>
      {groups.map(({ key, label, heroes, members, missing }) => {
        const all = missing.length === 0;
        const most = !all && members.length > heroes.length / 2;
        return (
          <li key={key} className={styles.rosterRole}>
            <span className={styles.rosterCount}>
              <RoleSpriteIcon roleKey={key} alt="" className={ui.roleIcon} />
              <span className={ui.vh}>{label}: </span>
              {all ? `All ${heroes.length}` : members.length}
              {most && ", all but"}
            </span>
            {!all &&
              (most ? missing : members).map((hero) => (
                <span
                  key={hero.key}
                  className={`${styles.face} ${most ? styles.faceOut : ""}`}
                  title={hero.name}
                >
                  <SpriteIcon
                    heroKey={hero.key}
                    type="icon"
                    alt={hero.name}
                    className={styles.faceImage}
                  />
                </span>
              ))}
          </li>
        );
      })}
    </ul>
  );
}

interface PresetNameProps {
  preset: SavedPreset;
  position: number;
  onRename: (name: string) => void;
}

/**
 * The name is its own text field, so renaming needs no mode: point at it and
 * type. Enter or leaving the field saves, Escape puts the old name back, and
 * an empty name is never saved.
 */
function PresetName({ preset, position, onRename }: PresetNameProps) {
  const [draft, setDraft] = useState(preset.name);

  const commit = () => {
    const name = draft.trim();
    if (!name) {
      setDraft(preset.name);
      return;
    }
    setDraft(name);
    if (name !== preset.name) onRename(name);
  };

  return (
    <input
      className={styles.name}
      type="text"
      data-control="name"
      value={draft}
      aria-label={`Name of preset ${position}`}
      // A browser's saved text is other fields' answers, not preset names.
      autoComplete="off"
      spellCheck={false}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        // Saves and stays put: blurring here would drop focus to the page.
        if (e.key === "Enter") commit();
        // Only while there is something to take back. Otherwise Escape is
        // left alone, and closes the sheet the field may be in.
        if (e.key === "Escape" && draft !== preset.name) {
          e.preventDefault();
          setDraft(preset.name);
        }
      }}
    />
  );
}

function Chevron({ up = false }: { up?: boolean }) {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
      <path
        d={up ? "M3 10.5l5-5 5 5" : "M3 5.5l5 5 5-5"}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const NEWEST = Symbol("newest preset");

/** A control inside a preset's row, as the manager asks for it to be focused. */
type Control = "up" | "down" | "name" | "apply" | "edit";

interface Deleted {
  preset: SavedPreset;
  /** The preset it sat below, or null for the top of the list. */
  afterId: string | null;
  wasApplied: boolean;
}

interface PresetManagerProps {
  /** Runs after a preset is applied, to go and look at the pool it set. */
  onApplied?: () => void;
}

/**
 * Everything done to presets once they exist: reordering, renaming, changing
 * who is in them, copying, sharing and deleting. The list is the overview; a
 * preset opens in place for the rest, on the same roster the picker uses.
 *
 * Shown in a sheet over the picker, and as the /presets page.
 */
export default function PresetManager({ onApplied }: PresetManagerProps) {
  const { getSelected } = useHeroes();
  const {
    presets,
    appliedId,
    isDirty,
    isHydrated,
    applyPreset,
    savePreset,
    renamePreset,
    duplicatePreset,
    deletePreset,
    insertPreset,
    setPresetHeroes,
    movePreset,
    restoreDefaults,
  } = usePresets();

  const [openId, setOpenId] = useState<string | null>(null);
  const [deleted, setDeleted] = useState<Deleted | null>(null);
  const [status, setStatus] = useState("");
  const panelPrefix = useId();

  const rows = useRef(new Map<string, HTMLLIElement>());
  const undoRef = useRef<HTMLButtonElement>(null);
  // Where focus goes once the list has caught up with what was asked of it.
  // NEWEST stands for a preset that is about to exist and has no id yet.
  const focusNext = useRef<{
    id: string | typeof NEWEST;
    control: Control;
  } | null>(null);
  const knownIds = useRef(new Set<string>());
  const lastTops = useRef(new Map<string, number>());
  const lastOrder = useRef("");
  // Presets whose heroes were changed here, so each is reported once.
  const edited = useRef(new Set<string>());

  const missingDefaults = useMemo(() => {
    const present = new Set(presets.map((preset) => preset.id));
    return buildDefaultPresets().filter((preset) => !present.has(preset.id))
      .length;
  }, [presets]);

  // Rows slide to their new place, so a move, a delete and an undo each show
  // what they did to the order. Measured on every render to have the layout
  // from just before a change, and played only when the order itself changed:
  // a preset opening pushes the rows under it down, and that needs no help.
  useLayoutEffect(() => {
    const order = presets.map((preset) => preset.id).join("\n");
    const moved = lastOrder.current !== "" && lastOrder.current !== order;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const tops = new Map<string, number>();
    for (const [id, row] of rows.current) {
      tops.set(id, row.offsetTop);
      const before = lastTops.current.get(id);
      if (!moved || still || before === undefined) continue;
      const delta = before - row.offsetTop;
      if (delta !== 0) {
        row.animate(
          [{ transform: `translateY(${delta}px)` }, { transform: "none" }],
          { duration: 200, easing: "ease-out" },
        );
      }
    }
    lastTops.current = tops;
    lastOrder.current = order;
  });

  useEffect(() => {
    const target = focusNext.current;
    if (target) {
      const id =
        target.id === NEWEST
          ? presets.find((preset) => !knownIds.current.has(preset.id))?.id
          : target.id;
      const row = id ? rows.current.get(id) : undefined;
      if (row) {
        focusNext.current = null;
        // A preset moved to an end of the list has that arrow switched off,
        // so focus takes the other one rather than being dropped.
        const control =
          row.querySelector<HTMLElement>(
            `[data-control="${target.control}"]:not(:disabled)`,
          ) ?? row.querySelector<HTMLElement>("[data-control]:not(:disabled)");
        control?.focus();
        if (control instanceof HTMLInputElement) control.select();
      }
    }
    knownIds.current = new Set(presets.map((preset) => preset.id));
  }, [presets]);

  // The row that held focus is gone; the way to bring it back takes over.
  useEffect(() => {
    if (deleted) undoRef.current?.focus();
  }, [deleted]);

  if (!isHydrated) return null;

  const focusControl = (id: string, control: Control) => {
    const target = rows.current
      .get(id)
      ?.querySelector<HTMLElement>(`[data-control="${control}"]`);
    target?.focus();
    if (target instanceof HTMLInputElement) target.select();
  };

  const total = ALL_HEROES.length;

  const move = (preset: SavedPreset, index: number, offset: number) => {
    focusNext.current = { id: preset.id, control: offset < 0 ? "up" : "down" };
    movePreset(preset.id, offset);
    setStatus(
      `${preset.name} moved to position ${index + offset + 1} of ${presets.length}.`,
    );
  };

  const apply = (preset: SavedPreset) => {
    applyPreset(preset.id, "manage_page");
    setStatus(`${preset.name} applied.`);
    onApplied?.();
  };

  const duplicate = (preset: SavedPreset) => {
    focusNext.current = { id: NEWEST, control: "name" };
    setOpenId(null);
    duplicatePreset(preset.id);
    setStatus(`${preset.name} duplicated. Name the copy.`);
  };

  const remove = (preset: SavedPreset, index: number) => {
    setDeleted({
      preset,
      afterId: index > 0 ? presets[index - 1].id : null,
      wasApplied: preset.id === appliedId,
    });
    setOpenId(null);
    deletePreset(preset.id);
    setStatus(`${preset.name} deleted.`);
  };

  const undoDelete = () => {
    if (!deleted) return;
    const anchor = deleted.afterId
      ? presets.findIndex((preset) => preset.id === deleted.afterId)
      : -1;
    focusNext.current = { id: deleted.preset.id, control: "edit" };
    insertPreset(
      deleted.preset,
      anchor + 1,
      // Not if another preset was applied in the meantime.
      deleted.wasApplied && appliedId === null,
    );
    setStatus(`${deleted.preset.name} is back.`);
    setDeleted(null);
  };

  const saveCurrent = () => {
    focusNext.current = { id: NEWEST, control: "name" };
    setOpenId(null);
    savePreset(heroCount(getSelected().length));
    setStatus("Saved the current pool as a preset. Name it.");
  };

  const setHeroes = (preset: SavedPreset, keys: Set<string>) => {
    if (!edited.current.has(preset.id)) {
      edited.current.add(preset.id);
      track("preset_managed", { action: "heroes_edited" });
    }
    setPresetHeroes(preset.id, inRosterOrder(keys));
  };

  const toggleHero = (preset: SavedPreset, heroKey: string) => {
    const next = new Set(preset.heroes);
    if (next.has(heroKey)) next.delete(heroKey);
    else next.add(heroKey);
    setHeroes(preset, next);
  };

  const setRole = (preset: SavedPreset, role: HeroRole, inPreset: boolean) => {
    const next = new Set(preset.heroes);
    for (const hero of ALL_HEROES) {
      if (hero.role !== role) continue;
      if (inPreset) next.add(hero.key);
      else next.delete(hero.key);
    }
    setHeroes(preset, next);
  };

  const onlyRole = (preset: SavedPreset, role: HeroRole) => {
    setHeroes(
      preset,
      new Set(
        ALL_HEROES.filter((hero) => hero.role === role).map((hero) => hero.key),
      ),
    );
  };

  const undoNotice = deleted && (
    <li key="deleted" className={styles.gone}>
      <span>“{deleted.preset.name}” was deleted.</span>
      <button
        ref={undoRef}
        type="button"
        className={ui.link}
        aria-label={`Undo deleting ${deleted.preset.name}`}
        onClick={undoDelete}
      >
        Undo
      </button>
    </li>
  );

  return (
    <div className={styles.manager}>
      {presets.length === 0 && !deleted && (
        <p className={styles.empty}>
          No presets yet. Save the pool you have now to roll from it again
          later.
        </p>
      )}

      <ol className={styles.list}>
        {deleted?.afterId === null && undoNotice}
        {presets.flatMap((preset, index) => {
          const shortcut = shortcutForIndex(index);
          const applied = preset.id === appliedId;
          const following = applied && !isDirty;
          const open = preset.id === openId;
          const count = preset.heroes.length;
          const panelId = `${panelPrefix}-${index}`;

          const row = (
            <li
              key={preset.id}
              ref={(node) => {
                if (node) rows.current.set(preset.id, node);
                else rows.current.delete(preset.id);
              }}
              className={`${styles.slot} ${applied ? styles.applied : ""}`}
            >
              <div className={styles.row}>
                <div className={styles.order}>
                  <button
                    type="button"
                    className={styles.move}
                    data-control="up"
                    disabled={index === 0}
                    aria-label={`Move ${preset.name} up`}
                    title="Move up"
                    onClick={() => move(preset, index, -1)}
                  >
                    <Chevron up />
                  </button>
                  {shortcut && (
                    <kbd
                      className={styles.key}
                      title={`Press ${shortcut} on the picker to apply`}
                    >
                      {shortcut}
                    </kbd>
                  )}
                  <button
                    type="button"
                    className={styles.move}
                    data-control="down"
                    disabled={index === presets.length - 1}
                    aria-label={`Move ${preset.name} down`}
                    title="Move down"
                    onClick={() => move(preset, index, 1)}
                  >
                    <Chevron />
                  </button>
                </div>

                <div className={styles.main}>
                  <div className={styles.top}>
                    <PresetName
                      preset={preset}
                      position={index + 1}
                      onRename={(name) => renamePreset(preset.id, name)}
                    />
                    <span className={styles.count}>{heroCount(count)}</span>
                    <div className={styles.actions}>
                      {applied && (
                        <span className={styles.state}>
                          {following ? "Applied" : "Applied, pool edited since"}
                        </span>
                      )}
                      {!following && (
                        <button
                          type="button"
                          className={ui.btn}
                          data-control="apply"
                          aria-label={`Apply ${preset.name}`}
                          title="Set the pool to this preset's heroes"
                          onClick={() => apply(preset)}
                        >
                          Apply
                        </button>
                      )}
                      <button
                        type="button"
                        className={`${ui.btn} ${ui.caret}`}
                        data-control="edit"
                        aria-expanded={open}
                        aria-controls={panelId}
                        aria-label={`Edit ${preset.name}`}
                        onClick={() => setOpenId(open ? null : preset.id)}
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                  <Roster preset={preset} />
                </div>
              </div>

              {open && (
                <div id={panelId} className={styles.panel}>
                  <div className={styles.panelActions}>
                    <button
                      type="button"
                      className={ui.link}
                      onClick={() => focusControl(preset.id, "name")}
                    >
                      Rename
                    </button>
                    <button
                      type="button"
                      className={ui.link}
                      onClick={() => duplicate(preset)}
                    >
                      Duplicate
                    </button>
                    <ShareButton
                      className={ui.link}
                      buildUrl={() => presetShareUrl(preset.heroes)}
                      shareType="preset"
                      shareSource="manage_page"
                      label="Copy link"
                      copiedLabel="Link copied"
                      title="Copy a link that sets up the picker with these heroes"
                    />
                    <button
                      type="button"
                      className={`${ui.link} ${styles.danger}`}
                      onClick={() => remove(preset, index)}
                    >
                      Delete
                    </button>
                  </div>

                  <div className={styles.panelHead}>
                    <span>
                      {count === 0
                        ? "Nobody is in this preset, so rolls use every hero."
                        : count === total
                          ? `All ${total} heroes are in this preset.`
                          : `${count} of ${total} heroes are in this preset.`}
                      {following && " The pool follows your changes."}
                    </span>
                    {count < total && (
                      <button
                        type="button"
                        className={ui.link}
                        onClick={() =>
                          setHeroes(
                            preset,
                            new Set(ALL_HEROES.map((hero) => hero.key)),
                          )
                        }
                      >
                        Add everyone
                      </button>
                    )}
                    {count > 0 && (
                      <button
                        type="button"
                        className={ui.link}
                        onClick={() => setHeroes(preset, new Set())}
                      >
                        Clear the preset
                      </button>
                    )}
                  </div>

                  <PoolEditor
                    compact
                    label={preset.name}
                    isIn={(heroKey) => preset.heroes.includes(heroKey)}
                    onToggleHero={(heroKey) => toggleHero(preset, heroKey)}
                    onSetRole={(role, inPreset) =>
                      setRole(preset, role, inPreset)
                    }
                    onOnlyRole={(role) => onlyRole(preset, role)}
                  />
                </div>
              )}
            </li>
          );

          return deleted?.afterId === preset.id ? [row, undoNotice] : [row];
        })}
      </ol>

      <div className={styles.tools}>
        <button type="button" className={ui.link} onClick={saveCurrent}>
          Save the current pool as a preset
        </button>
        {missingDefaults > 0 && (
          <button
            type="button"
            className={ui.link}
            onClick={() => {
              restoreDefaults();
              setStatus(
                missingDefaults === 1
                  ? "The built-in preset is back, at the end of the list."
                  : `${missingDefaults} built-in presets are back, at the end of the list.`,
              );
            }}
          >
            {missingDefaults === 1
              ? "Restore the built-in preset you deleted"
              : `Restore the ${missingDefaults} built-in presets you deleted`}
          </button>
        )}
      </div>

      {/* oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- says what each change did, not the result of a form */}
      <p className={ui.vh} role="status">
        {status}
      </p>
    </div>
  );
}
