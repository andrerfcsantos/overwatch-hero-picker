import { SUB_ROLES, getHeroesBySubRole, getRankedHeroes } from "@/data/heroes";
import { SavedPreset } from "./types";

/**
 * Built-in presets get stable ids so restoring the defaults can tell which of
 * them are already in the list instead of adding a second copy.
 */
export const DEFAULT_PRESET_ID_PREFIX = "default:";

const defaultId = (suffix: string) => `${DEFAULT_PRESET_ID_PREFIX}${suffix}`;

/**
 * The presets every visitor starts with: the Competitive Play pool, then one
 * per sub-role. They are ordinary presets once seeded — renaming, editing,
 * reordering and deleting them all work like any other.
 */
export function buildDefaultPresets(): SavedPreset[] {
  return [
    {
      id: defaultId("ranked"),
      name: "Ranked",
      heroes: getRankedHeroes().map((h) => h.key),
    },
    ...SUB_ROLES.map((subRole) => ({
      id: defaultId(subRole.key.toLowerCase()),
      name: subRole.label,
      heroes: getHeroesBySubRole(subRole.key).map((h) => h.key),
    })),
  ];
}
