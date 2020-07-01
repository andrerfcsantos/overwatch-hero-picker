import store from "../store";

export function randomHero() {
  const selected = store.getters["heroes/getSelected"];

  if (selected.length === 0) {
    const all_heroes = store.getters["heroes/getHeroes"];
    return all_heroes[Math.floor(Math.random() * all_heroes.length)];
  }

  return selected[Math.floor(Math.random() * selected.length)];
}

function popNRandomFromArray(heroList, n) {
  let res = [];
  let heroListCopy = [...heroList];

  while (n > 0 && heroListCopy.length > 0) {
    res.push(popRandomFromArray(heroListCopy));
    n--;
  }

  return res;
}

function popRandomFromArray(heroList) {
  let nHeroes = heroList.length;
  let idx = Math.floor(Math.random() * nHeroes);
  let hero = heroList.splice(idx, 1);
  return hero[0];
}

function randomFromList(l) {
  let size = l.length;
  let idx = Math.floor(Math.random() * size);
  return l[idx];
}

function removeHeroFromObjList(l, key) {
  let idx = l.findIndex((h) => h.key == key);
  l.splice(idx, 1);
}

export function randomSquadClassic(roles = []) {
  const roleSet = ["TANK", "DAMAGE", "SUPPORT"];

  let heroes = {
    TANK: [...store.getters["heroes/getTanks"]],
    SUPPORT: [...store.getters["heroes/getSupport"]],
    DAMAGE: [...store.getters["heroes/getDamage"]],
  };
  let selectedHeroes = {
    TANK: heroes.TANK.filter((h) => h.selected),
    SUPPORT: heroes.SUPPORT.filter((h) => h.selected),
    DAMAGE: heroes.DAMAGE.filter((h) => h.selected),
  };
  let res = {
    TANK: [],
    SUPPORT: [],
    DAMAGE: [],
  };

  let rolesToGenerate = [];

  if (roles.length > 0) {
    rolesToGenerate = roles;
  } else {
    for (let i = 0; i < 6; i++) {
      rolesToGenerate.push(randomFromList(roleSet));
    }
  }

  for (let i = 0; i < 6; i++) {
    let role = popRandomFromArray(rolesToGenerate);
    let hero = undefined;

    if (selectedHeroes[role].length > 0) {
      hero = popRandomFromArray(selectedHeroes[role]);
      removeHeroFromObjList(heroes[role], hero.key);
    } else {
      hero = popRandomFromArray(heroes[role]);
    }

    res[role].push(hero);
  }
  return res;
}

export function randomSquad() {
  return randomSquadClassic([
    "TANK",
    "TANK",
    "DAMAGE",
    "DAMAGE",
    "SUPPORT",
    "SUPPORT",
  ]);
}

export function randomSquadOld() {
  let res = {
    TANK: [],
    SUPPORT: [],
    DAMAGE: [],
  };

  const all_heroes = store.getters["heroes/getHeroes"];
  const selected = store.getters["heroes/getSelected"];

  // Tanks
  let selectedTanks = selected.filter((h) => h.role === "TANK");

  if (selectedTanks.length < 2) {
    selectedTanks = all_heroes.filter((h) => h.role === "TANK");
  }

  res.TANK = popNRandomFromArray(selectedTanks, 2);

  // Supports
  let selectedSupports = selected.filter((h) => h.role === "SUPPORT");

  if (selectedSupports.length < 2) {
    selectedSupports = all_heroes.filter((h) => h.role === "SUPPORT");
  }

  res.SUPPORT = popNRandomFromArray(selectedSupports, 2);

  //Damage
  let selectedDamage = selected.filter((h) => h.role === "DAMAGE");

  if (selectedDamage.length < 2) {
    selectedDamage = all_heroes.filter((h) => h.role === "DAMAGE");
  }

  res.DAMAGE = popNRandomFromArray(selectedDamage, 2);

  return res;
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

export function getSelected() {
  return store.getters["heroes/getSelected"];
}

export function getSelectedByRole(role) {
  return store.getters["heroes/getSelectedByRole"](role);
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
