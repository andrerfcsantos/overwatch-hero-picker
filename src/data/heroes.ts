import { Hero, HeroRole, HeroSubRole } from "@/types/hero";

export const ROLES: { key: HeroRole; label: string }[] = [
  { key: "TANK", label: "Tank" },
  { key: "DAMAGE", label: "Damage" },
  { key: "SUPPORT", label: "Support" },
];

/**
 * Sub-role metadata, in the order the game groups them: the three Tank
 * sub-roles, then Damage, then Support. The built-in presets are generated
 * from this list in this order, so reordering it reorders them for anyone who
 * has not saved their own order yet.
 */
export const SUB_ROLES: {
  key: HeroSubRole;
  label: string;
  role: HeroRole;
  description: string;
}[] = [
  {
    key: "BRUISER",
    label: "Bruiser",
    role: "TANK",
    description:
      "Tanks that go straight at the enemy front line, trading damage up close and soaking what comes back.",
  },
  {
    key: "INITIATOR",
    label: "Initiator",
    role: "TANK",
    description:
      "Mobile tanks that open a fight by diving the enemy's key targets.",
  },
  {
    key: "STALWART",
    label: "Stalwart",
    role: "TANK",
    description:
      "Tanks that hold space for the team, most of them behind a barrier.",
  },
  {
    key: "FLANKER",
    label: "Flanker",
    role: "DAMAGE",
    description:
      "Fast damage heroes that get around the enemy and delete low-health targets.",
  },
  {
    key: "RECON",
    label: "Recon",
    role: "DAMAGE",
    description:
      "Damage heroes that keep their distance and find out where the enemy is.",
  },
  {
    key: "SHARPSHOOTER",
    label: "Sharpshooter",
    role: "DAMAGE",
    description:
      "Long-range damage heroes that hold an angle and win on headshots.",
  },
  {
    key: "SPECIALIST",
    label: "Specialist",
    role: "DAMAGE",
    description:
      "Damage heroes built around area denial and all-round utility.",
  },
  {
    key: "MEDIC",
    label: "Medic",
    role: "SUPPORT",
    description:
      "Supports whose weapon heals on primary fire and whose kit is built around keeping people alive.",
  },
  {
    key: "SURVIVOR",
    label: "Survivor",
    role: "SUPPORT",
    description:
      "Squishy supports with the movement to start a fight or walk away from one.",
  },
  {
    key: "TACTICIAN",
    label: "Tactician",
    role: "SUPPORT",
    description:
      "Supports that pair steady healing with utility for the team or debuffs for the enemy.",
  },
];

/**
 * The heroes. `subRole` follows the game's sub-role assignment and is the only
 * place it is recorded, so a hero moving sub-role is a one-line change here.
 * `rankedEligible: false` marks a hero that cannot be picked in Competitive
 * Play; everyone else is eligible.
 */
const heroDefinitions: Record<string, Hero> = {
  dva: {
    name: "D.Va",
    role: "TANK",
    subRole: "INITIATOR",
    selected: true,
    key: "dva",
  },
  orisa: {
    name: "Orisa",
    role: "TANK",
    subRole: "BRUISER",
    selected: true,
    key: "orisa",
  },
  reinhardt: {
    name: "Reinhardt",
    role: "TANK",
    subRole: "STALWART",
    selected: true,
    key: "reinhardt",
  },
  roadhog: {
    name: "Roadhog",
    role: "TANK",
    subRole: "BRUISER",
    selected: true,
    key: "roadhog",
  },
  winston: {
    name: "Winston",
    role: "TANK",
    subRole: "INITIATOR",
    selected: true,
    key: "winston",
  },
  wreckingball: {
    name: "Wrecking Ball",
    role: "TANK",
    subRole: "INITIATOR",
    selected: true,
    key: "wreckingball",
  },
  zarya: {
    name: "Zarya",
    role: "TANK",
    subRole: "BRUISER",
    selected: true,
    key: "zarya",
  },
  doomfist: {
    name: "Doomfist",
    role: "TANK",
    subRole: "INITIATOR",
    selected: true,
    key: "doomfist",
  },
  sigma: {
    name: "Sigma",
    role: "TANK",
    subRole: "STALWART",
    selected: true,
    key: "sigma",
  },
  junkerqueen: {
    name: "Junker Queen",
    role: "TANK",
    subRole: "STALWART",
    selected: true,
    key: "junkerqueen",
  },
  ramattra: {
    name: "Ramattra",
    role: "TANK",
    subRole: "STALWART",
    selected: true,
    key: "ramattra",
  },
  mauga: {
    name: "Mauga",
    role: "TANK",
    subRole: "BRUISER",
    selected: true,
    key: "mauga",
  },
  hazard: {
    name: "Hazard",
    role: "TANK",
    subRole: "INITIATOR",
    selected: true,
    key: "hazard",
  },
  domina: {
    name: "Domina",
    role: "TANK",
    subRole: "STALWART",
    selected: true,
    key: "domina",
  },
  dmon: {
    name: "D.Mon",
    role: "TANK",
    subRole: "STALWART",
    selected: true,
    key: "dmon",
    rankedEligible: false,
  },
  bastion: {
    name: "Bastion",
    role: "DAMAGE",
    subRole: "SPECIALIST",
    selected: true,
    key: "bastion",
  },
  genji: {
    name: "Genji",
    role: "DAMAGE",
    subRole: "FLANKER",
    selected: true,
    key: "genji",
  },
  hanzo: {
    name: "Hanzo",
    role: "DAMAGE",
    subRole: "SHARPSHOOTER",
    selected: true,
    key: "hanzo",
  },
  junkrat: {
    name: "Junkrat",
    role: "DAMAGE",
    subRole: "SPECIALIST",
    selected: true,
    key: "junkrat",
  },
  cassidy: {
    name: "Cassidy",
    role: "DAMAGE",
    subRole: "SHARPSHOOTER",
    selected: true,
    key: "cassidy",
  },
  mei: {
    name: "Mei",
    role: "DAMAGE",
    subRole: "SPECIALIST",
    selected: true,
    key: "mei",
  },
  pharah: {
    name: "Pharah",
    role: "DAMAGE",
    subRole: "RECON",
    selected: true,
    key: "pharah",
  },
  reaper: {
    name: "Reaper",
    role: "DAMAGE",
    subRole: "FLANKER",
    selected: true,
    key: "reaper",
  },
  shion: {
    name: "Shion",
    role: "DAMAGE",
    subRole: "FLANKER",
    selected: true,
    key: "shion",
  },
  sierra: {
    name: "Sierra",
    role: "DAMAGE",
    subRole: "RECON",
    selected: true,
    key: "sierra",
  },
  soldier76: {
    name: "Soldier: 76",
    role: "DAMAGE",
    subRole: "SPECIALIST",
    selected: true,
    key: "soldier76",
  },
  sombra: {
    name: "Sombra",
    role: "DAMAGE",
    subRole: "RECON",
    selected: true,
    key: "sombra",
  },
  symmetra: {
    name: "Symmetra",
    role: "DAMAGE",
    subRole: "SPECIALIST",
    selected: true,
    key: "symmetra",
  },
  torbjorn: {
    name: "Torbjörn",
    role: "DAMAGE",
    subRole: "SPECIALIST",
    selected: true,
    key: "torbjorn",
  },
  tracer: {
    name: "Tracer",
    role: "DAMAGE",
    subRole: "FLANKER",
    selected: true,
    key: "tracer",
  },
  widowmaker: {
    name: "Widowmaker",
    role: "DAMAGE",
    subRole: "SHARPSHOOTER",
    selected: true,
    key: "widowmaker",
  },
  ashe: {
    name: "Ashe",
    role: "DAMAGE",
    subRole: "SHARPSHOOTER",
    selected: true,
    key: "ashe",
  },
  echo: {
    name: "Echo",
    role: "DAMAGE",
    subRole: "RECON",
    selected: true,
    key: "echo",
  },
  sojourn: {
    name: "Sojourn",
    role: "DAMAGE",
    subRole: "SHARPSHOOTER",
    selected: true,
    key: "sojourn",
  },
  venture: {
    name: "Venture",
    role: "DAMAGE",
    subRole: "FLANKER",
    selected: true,
    key: "venture",
  },
  freja: {
    name: "Freja",
    role: "DAMAGE",
    subRole: "RECON",
    selected: true,
    key: "freja",
  },
  anran: {
    name: "Anran",
    role: "DAMAGE",
    subRole: "FLANKER",
    selected: true,
    key: "anran",
  },
  emre: {
    name: "Emre",
    role: "DAMAGE",
    subRole: "SPECIALIST",
    selected: true,
    key: "emre",
  },
  vendetta: {
    name: "Vendetta",
    role: "DAMAGE",
    subRole: "FLANKER",
    selected: true,
    key: "vendetta",
  },
  ana: {
    name: "Ana",
    role: "SUPPORT",
    subRole: "TACTICIAN",
    selected: true,
    key: "ana",
  },
  brigitte: {
    name: "Brigitte",
    role: "SUPPORT",
    subRole: "SURVIVOR",
    selected: true,
    key: "brigitte",
  },
  lucio: {
    name: "Lúcio",
    role: "SUPPORT",
    subRole: "TACTICIAN",
    selected: true,
    key: "lucio",
  },
  mercy: {
    name: "Mercy",
    role: "SUPPORT",
    subRole: "MEDIC",
    selected: true,
    key: "mercy",
  },
  moira: {
    name: "Moira",
    role: "SUPPORT",
    subRole: "MEDIC",
    selected: true,
    key: "moira",
  },
  zenyatta: {
    name: "Zenyatta",
    role: "SUPPORT",
    subRole: "TACTICIAN",
    selected: true,
    key: "zenyatta",
  },
  baptiste: {
    name: "Baptiste",
    role: "SUPPORT",
    subRole: "TACTICIAN",
    selected: true,
    key: "baptiste",
  },
  kiriko: {
    name: "Kiriko",
    role: "SUPPORT",
    subRole: "MEDIC",
    selected: true,
    key: "kiriko",
  },
  lifeweaver: {
    name: "Lifeweaver",
    role: "SUPPORT",
    subRole: "MEDIC",
    selected: true,
    key: "lifeweaver",
  },
  illari: {
    name: "Illari",
    role: "SUPPORT",
    subRole: "SURVIVOR",
    selected: true,
    key: "illari",
  },
  juno: {
    name: "Juno",
    role: "SUPPORT",
    subRole: "SURVIVOR",
    selected: true,
    key: "juno",
  },
  jetpackcat: {
    name: "Jetpack Cat",
    role: "SUPPORT",
    subRole: "TACTICIAN",
    selected: true,
    key: "jetpackcat",
    rankedEligible: false,
  },
  mizuki: {
    name: "Mizuki",
    role: "SUPPORT",
    subRole: "SURVIVOR",
    selected: true,
    key: "mizuki",
  },
  wuyang: {
    name: "Wuyang",
    role: "SUPPORT",
    subRole: "SURVIVOR",
    selected: true,
    key: "wuyang",
  },
};

export function getInitialHeroes(): Record<string, Hero> {
  return JSON.parse(JSON.stringify(heroDefinitions));
}

export const heroKeys = Object.keys(heroDefinitions);

export function getAllHeroes(): Hero[] {
  return Object.values(heroDefinitions)
    .map((h) => ({ ...h }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function getHeroesByRole(role: HeroRole): Hero[] {
  return getAllHeroes().filter((h) => h.role === role);
}

export function getHeroesBySubRole(subRole: HeroSubRole): Hero[] {
  return getAllHeroes().filter((h) => h.subRole === subRole);
}

/** Heroes that can be picked in Competitive Play. */
export function getRankedHeroes(): Hero[] {
  return getAllHeroes().filter((h) => h.rankedEligible !== false);
}
