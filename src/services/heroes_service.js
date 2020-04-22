import store from "../store";

export function randomHero() {
  const selected = store.getters["heroes/getSelected"];

  if (selected.length === 0) {
    const all_heroes = store.getters["heroes/getHeroes"];
    return all_heroes[Math.floor(Math.random() * all_heroes.length)];
  }

  return selected[Math.floor(Math.random() * selected.length)];
}

export function getTanks() {
  return store.getters["heroes/getTanks"];
}

export function getDamage() {
  return store.getters["heroes/getDamage"];
}

export function getSupport() {
  return store.getters["heroes/getSupport"];
}

export function toggleHero(hero_key) {
  store.dispatch("heroes/toggleHero", hero_key);
}

export function selectAllTanks() {
  store.dispatch("heroes/selectTanks");
}

export function selectAllSupports() {
  store.dispatch("heroes/selectSupports");
}

export function selectAllDamage() {
  store.dispatch("heroes/selectDamage");
}

export function unselectAllTanks() {
  store.dispatch("heroes/unselectTanks");
}

export function unselectAllSupports() {
  store.dispatch("heroes/unselectSupports");
}

export function unselectAllDamage() {
  store.dispatch("heroes/unselectDamage");
}
