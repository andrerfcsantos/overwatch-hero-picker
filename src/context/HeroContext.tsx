"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import { track } from "@/lib/analytics";
import { Hero, HeroRole } from "@/types/hero";
import { getInitialHeroes } from "@/data/heroes";
import { getJsonFromLS, setJsonToLS } from "@/lib/localStorage";
import { tryDecodeShare } from "@/lib/share/codec";
import { PickerPreset } from "@/lib/share/types";
import { readShareParam, stripShareParam } from "@/lib/share/urls";

interface HeroState {
  heroes: Record<string, Hero>;
}

type HeroAction =
  | { type: "TOGGLE_HERO"; key: string }
  | { type: "SET_ROLE_SELECTED"; role: HeroRole; selected: boolean }
  | { type: "SELECT_JUST_ROLE"; role: HeroRole }
  | { type: "SELECT_ALL" }
  | { type: "UNSELECT_ALL" }
  | { type: "SET_HERO_STATUS"; key: string; selected: boolean }
  | { type: "SET_SELECTIONS"; selected: Set<string> }
  | {
      type: "RESTORE_SELECTIONS";
      selections: { key: string; selected: boolean }[];
    };

interface HeroContextValue {
  heroes: Hero[];
  getByRole: (role: HeroRole) => Hero[];
  getSelected: () => Hero[];
  getSelectedByRole: (role: HeroRole) => Hero[];
  getHeroSelected: (key: string) => boolean;
  toggleHero: (key: string) => void;
  selectByRole: (role: HeroRole) => void;
  unselectByRole: (role: HeroRole) => void;
  selectJustRole: (role: HeroRole) => void;
  selectAll: () => void;
  unselectAll: () => void;
  /** Replaces the whole selection at once, as applying a preset does. */
  setSelected: (keys: string[]) => void;
  isHydrated: boolean;
  /** Options that came with a shared preset on this page load, if any. */
  sharedPreset: PickerPreset | null;
  /** True while the shared-preset notice should be shown. */
  sharedPresetApplied: boolean;
  /** Puts back the filters the shared preset replaced. */
  undoSharedPreset: () => void;
  /** Hides the shared-preset notice without changing the filters. */
  dismissSharedPreset: () => void;
}

const HeroContext = createContext<HeroContextValue | null>(null);

function heroReducer(state: HeroState, action: HeroAction): HeroState {
  switch (action.type) {
    case "TOGGLE_HERO": {
      const hero = state.heroes[action.key];
      if (!hero) return state;
      return {
        heroes: {
          ...state.heroes,
          [action.key]: { ...hero, selected: !hero.selected },
        },
      };
    }
    case "SET_ROLE_SELECTED": {
      const updated = { ...state.heroes };
      for (const key in updated) {
        if (updated[key].role === action.role) {
          updated[key] = { ...updated[key], selected: action.selected };
        }
      }
      return { heroes: updated };
    }
    case "SELECT_JUST_ROLE": {
      const updated = { ...state.heroes };
      for (const key in updated) {
        updated[key] = {
          ...updated[key],
          selected: updated[key].role === action.role,
        };
      }
      return { heroes: updated };
    }
    case "SELECT_ALL": {
      const updated = { ...state.heroes };
      for (const key in updated) {
        updated[key] = { ...updated[key], selected: true };
      }
      return { heroes: updated };
    }
    case "UNSELECT_ALL": {
      const updated = { ...state.heroes };
      for (const key in updated) {
        updated[key] = { ...updated[key], selected: false };
      }
      return { heroes: updated };
    }
    case "SET_HERO_STATUS": {
      const hero = state.heroes[action.key];
      if (!hero) return state;
      return {
        heroes: {
          ...state.heroes,
          [action.key]: { ...hero, selected: action.selected },
        },
      };
    }
    case "SET_SELECTIONS": {
      const updated = { ...state.heroes };
      for (const key in updated) {
        updated[key] = { ...updated[key], selected: action.selected.has(key) };
      }
      return { heroes: updated };
    }
    case "RESTORE_SELECTIONS": {
      const updated = { ...state.heroes };
      for (const { key, selected } of action.selections) {
        if (updated[key]) {
          updated[key] = { ...updated[key], selected };
        }
      }
      return { heroes: updated };
    }
    default:
      return state;
  }
}

const initialState: HeroState = { heroes: getInitialHeroes() };

export function HeroProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(heroReducer, initialState);
  const isHydrated = useRef(false);
  const hydrated = useRef(false);
  const [sharedPreset, setSharedPreset] = useState<PickerPreset | null>(null);
  const [noticeOpen, setNoticeOpen] = useState(false);
  const replacedSelections = useRef<{ key: string; selected: boolean }[]>([]);

  // Restore from localStorage on mount, unless the URL carries a shared preset.
  // This is the only place the URL is read, so no other component can race it.
  useEffect(() => {
    const saved =
      getJsonFromLS<{ key: string; selected: boolean }[]>("selectedHeroes");
    const raw = readShareParam(window.location.search);
    const shared = tryDecodeShare(raw);

    if (shared.ok && shared.payload.kind === "picker-preset") {
      replacedSelections.current = Array.isArray(saved) ? saved : [];
      dispatch({
        type: "SET_SELECTIONS",
        selected: new Set(shared.payload.picker.selected),
      });
      setSharedPreset(shared.payload.picker);
      setNoticeOpen(true);
      stripShareParam();
      track("shared_link_opened", { share_type: "picker_preset", valid: true });
    } else {
      if (raw && !shared.ok && window.location.pathname === "/") {
        // Broken links elsewhere are reported by the page that renders the
        // error; this provider mounts everywhere, so it only speaks for "/".
        track("shared_link_opened", {
          share_type: "unknown",
          valid: false,
          invalid_reason: shared.reason,
        });
      }
      if (saved && Array.isArray(saved)) {
        dispatch({ type: "RESTORE_SELECTIONS", selections: saved });
      }
    }

    isHydrated.current = true;
    hydrated.current = true;
  }, []);

  const undoSharedPreset = useCallback(() => {
    // Reset to the app default first: heroes that did not exist when the saved
    // selection was written are not in it, and default to selected.
    dispatch({ type: "SELECT_ALL" });
    dispatch({
      type: "RESTORE_SELECTIONS",
      selections: replacedSelections.current,
    });
    setNoticeOpen(false);
  }, []);

  const dismissSharedPreset = useCallback(() => setNoticeOpen(false), []);

  // Persist to localStorage on changes (skip initial render)
  useEffect(() => {
    if (!hydrated.current) return;
    const selections = Object.values(state.heroes).map((h) => ({
      key: h.key,
      selected: h.selected,
    }));
    setJsonToLS("selectedHeroes", selections);
  }, [state.heroes]);

  const heroes = useMemo(
    () =>
      Object.values(state.heroes).sort((a, b) => a.name.localeCompare(b.name)),
    [state.heroes],
  );

  const getByRole = useCallback(
    (role: HeroRole) => heroes.filter((h) => h.role === role),
    [heroes],
  );

  const getSelected = useCallback(
    () => heroes.filter((h) => h.selected),
    [heroes],
  );

  const getSelectedByRole = useCallback(
    (role: HeroRole) => heroes.filter((h) => h.role === role && h.selected),
    [heroes],
  );

  const getHeroSelected = useCallback(
    (key: string) => state.heroes[key]?.selected ?? false,
    [state.heroes],
  );

  const toggleHero = useCallback(
    (key: string) => dispatch({ type: "TOGGLE_HERO", key }),
    [],
  );

  const selectByRole = useCallback(
    (role: HeroRole) =>
      dispatch({ type: "SET_ROLE_SELECTED", role, selected: true }),
    [],
  );

  const unselectByRole = useCallback(
    (role: HeroRole) =>
      dispatch({ type: "SET_ROLE_SELECTED", role, selected: false }),
    [],
  );

  const selectJustRole = useCallback(
    (role: HeroRole) => dispatch({ type: "SELECT_JUST_ROLE", role }),
    [],
  );

  const selectAll = useCallback(() => dispatch({ type: "SELECT_ALL" }), []);

  const unselectAll = useCallback(() => dispatch({ type: "UNSELECT_ALL" }), []);

  const setSelected = useCallback(
    (keys: string[]) =>
      dispatch({ type: "SET_SELECTIONS", selected: new Set(keys) }),
    [],
  );

  const value = useMemo(
    () => ({
      heroes,
      getByRole,
      getSelected,
      getSelectedByRole,
      getHeroSelected,
      toggleHero,
      selectByRole,
      unselectByRole,
      selectJustRole,
      selectAll,
      unselectAll,
      setSelected,
      isHydrated: isHydrated.current,
      sharedPreset,
      sharedPresetApplied: noticeOpen,
      undoSharedPreset,
      dismissSharedPreset,
    }),
    [
      heroes,
      getByRole,
      getSelected,
      getSelectedByRole,
      getHeroSelected,
      toggleHero,
      selectByRole,
      unselectByRole,
      selectJustRole,
      selectAll,
      unselectAll,
      setSelected,
      sharedPreset,
      noticeOpen,
      undoSharedPreset,
      dismissSharedPreset,
    ],
  );

  return <HeroContext.Provider value={value}>{children}</HeroContext.Provider>;
}

export function useHeroes() {
  const context = useContext(HeroContext);
  if (!context) throw new Error("useHeroes must be used within HeroProvider");
  return context;
}
