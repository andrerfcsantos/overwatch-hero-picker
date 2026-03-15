import { Hero, HeroRole } from "@/types/hero";

export const ROLES: { key: HeroRole; label: string; icon: string }[] = [
  { key: "TANK", label: "Tank", icon: "/assets/imgs/roles/tank.webp" },
  { key: "DAMAGE", label: "Damage", icon: "/assets/imgs/roles/damage.webp" },
  { key: "SUPPORT", label: "Support", icon: "/assets/imgs/roles/support.webp" },
];

const heroDefinitions: Record<string, Hero> = {
  dva: { name: "D.Va", role: "TANK", selected: true, key: "dva" },
  orisa: { name: "Orisa", role: "TANK", selected: true, key: "orisa" },
  reinhardt: {
    name: "Reinhardt",
    role: "TANK",
    selected: true,
    key: "reinhardt",
  },
  roadhog: { name: "Roadhog", role: "TANK", selected: true, key: "roadhog" },
  winston: { name: "Winston", role: "TANK", selected: true, key: "winston" },
  wreckingball: {
    name: "Wrecking Ball",
    role: "TANK",
    selected: true,
    key: "wreckingball",
  },
  zarya: { name: "Zarya", role: "TANK", selected: true, key: "zarya" },
  doomfist: {
    name: "Doomfist",
    role: "TANK",
    selected: true,
    key: "doomfist",
  },
  sigma: { name: "Sigma", role: "TANK", selected: true, key: "sigma" },
  junkerqueen: {
    name: "Junker Queen",
    role: "TANK",
    selected: true,
    key: "junkerqueen",
  },
  ramattra: {
    name: "Ramattra",
    role: "TANK",
    selected: true,
    key: "ramattra",
  },
  mauga: { name: "Mauga", role: "TANK", selected: true, key: "mauga" },
  hazard: { name: "Hazard", role: "TANK", selected: true, key: "hazard" },
  domina: { name: "Domina", role: "TANK", selected: true, key: "domina" },
  bastion: {
    name: "Bastion",
    role: "DAMAGE",
    selected: true,
    key: "bastion",
  },
  genji: { name: "Genji", role: "DAMAGE", selected: true, key: "genji" },
  hanzo: { name: "Hanzo", role: "DAMAGE", selected: true, key: "hanzo" },
  junkrat: {
    name: "Junkrat",
    role: "DAMAGE",
    selected: true,
    key: "junkrat",
  },
  cassidy: {
    name: "Cassidy",
    role: "DAMAGE",
    selected: true,
    key: "cassidy",
  },
  mei: { name: "Mei", role: "DAMAGE", selected: true, key: "mei" },
  pharah: { name: "Pharah", role: "DAMAGE", selected: true, key: "pharah" },
  reaper: { name: "Reaper", role: "DAMAGE", selected: true, key: "reaper" },
  soldier76: {
    name: "Soldier: 76",
    role: "DAMAGE",
    selected: true,
    key: "soldier76",
  },
  sombra: { name: "Sombra", role: "DAMAGE", selected: true, key: "sombra" },
  symmetra: {
    name: "Symmetra",
    role: "DAMAGE",
    selected: true,
    key: "symmetra",
  },
  torbjorn: {
    name: "Torbjörn",
    role: "DAMAGE",
    selected: true,
    key: "torbjorn",
  },
  tracer: { name: "Tracer", role: "DAMAGE", selected: true, key: "tracer" },
  widowmaker: {
    name: "Widowmaker",
    role: "DAMAGE",
    selected: true,
    key: "widowmaker",
  },
  ashe: { name: "Ashe", role: "DAMAGE", selected: true, key: "ashe" },
  echo: { name: "Echo", role: "DAMAGE", selected: true, key: "echo" },
  sojourn: {
    name: "Sojourn",
    role: "DAMAGE",
    selected: true,
    key: "sojourn",
  },
  venture: {
    name: "Venture",
    role: "DAMAGE",
    selected: true,
    key: "venture",
  },
  freja: { name: "Freja", role: "DAMAGE", selected: true, key: "freja" },
  anran: { name: "Anran", role: "DAMAGE", selected: true, key: "anran" },
  emre: { name: "Emre", role: "DAMAGE", selected: true, key: "emre" },
  vendetta: {
    name: "Vendetta",
    role: "DAMAGE",
    selected: true,
    key: "vendetta",
  },
  ana: { name: "Ana", role: "SUPPORT", selected: true, key: "ana" },
  brigitte: {
    name: "Brigitte",
    role: "SUPPORT",
    selected: true,
    key: "brigitte",
  },
  lucio: { name: "Lúcio", role: "SUPPORT", selected: true, key: "lucio" },
  mercy: { name: "Mercy", role: "SUPPORT", selected: true, key: "mercy" },
  moira: { name: "Moira", role: "SUPPORT", selected: true, key: "moira" },
  zenyatta: {
    name: "Zenyatta",
    role: "SUPPORT",
    selected: true,
    key: "zenyatta",
  },
  baptiste: {
    name: "Baptiste",
    role: "SUPPORT",
    selected: true,
    key: "baptiste",
  },
  kiriko: { name: "Kiriko", role: "SUPPORT", selected: true, key: "kiriko" },
  lifeweaver: {
    name: "Lifeweaver",
    role: "SUPPORT",
    selected: true,
    key: "lifeweaver",
  },
  illari: { name: "Illari", role: "SUPPORT", selected: true, key: "illari" },
  juno: { name: "Juno", role: "SUPPORT", selected: true, key: "juno" },
  jetpackcat: {
    name: "Jetpack Cat",
    role: "SUPPORT",
    selected: true,
    key: "jetpackcat",
  },
  mizuki: { name: "Mizuki", role: "SUPPORT", selected: true, key: "mizuki" },
  wuyang: { name: "Wuyang", role: "SUPPORT", selected: true, key: "wuyang" },
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
