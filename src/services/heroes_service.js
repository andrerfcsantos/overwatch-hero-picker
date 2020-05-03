import store from "../store";

export function randomHero() {
  const selected = store.getters["heroes/getSelected"];

  if (selected.length === 0) {
    const all_heroes = store.getters["heroes/getHeroes"];
    return all_heroes[Math.floor(Math.random() * all_heroes.length)];
  }

  return selected[Math.floor(Math.random() * selected.length)];
}

export function getSelectedLSHeroes() {
  let selected_heroes = localStorage.getItem("selectedHeroes");
  if (selected_heroes) {
    selected_heroes = JSON.parse(selected_heroes);
  }
  if (Array.isArray(selected_heroes)) {
    selected_heroes.forEach((hero) => {
      store.dispatch("heroes/setHeroSelectedStatus", {
        hero_key: hero.key,
        selected: hero.selected,
      });
    });
  }
}

export function saveSelectedHeroesToLS() {
  const selected = store.getters["heroes/getSelected"];
  localStorage.setItem("selectedHeroes", JSON.stringify(selected));
}

export function getHeroesByRole(role) {
  return store.getters["heroes/getByRole"](role);
}

export function toggleHero(hero_key) {
  store.dispatch("heroes/toggleHero", hero_key);
}

export function selectByRole(role) {
  store.dispatch(`heroes/selectByRole`, role);
}

export function unselectByRole(role) {
  store.dispatch(`heroes/unselectByRole`, role);
}
