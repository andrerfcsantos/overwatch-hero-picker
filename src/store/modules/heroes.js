const state = {
  heroes: {
    dva: {
      name: "D.Va",
      role: "TANK",
      selected: false,
      key: "dva",
    },
    orisa: {
      name: "Orisa",
      role: "TANK",
      selected: false,
      key: "orisa",
    },
    reinhardt: {
      name: "Reinhardt",
      role: "TANK",
      selected: false,
      key: "reinhardt",
    },
    roadhog: {
      name: "Roadhog",
      role: "TANK",
      selected: false,
      key: "roadhog",
    },
    winston: {
      name: "Winston",
      role: "TANK",
      selected: false,
      key: "winston",
    },
    wreckingball: {
      name: "Wrecking Ball",
      role: "TANK",
      selected: false,
      key: "wreckingball",
    },
    zarya: {
      name: "Zarya",
      role: "TANK",
      selected: false,
      key: "zarya",
    },
    bastion: {
      name: "Bastion",
      role: "DAMAGE",
      selected: false,
      key: "bastion",
    },
    doomfist: {
      name: "Doomfist",
      role: "DAMAGE",
      selected: false,
      key: "doomfist",
    },
    genji: {
      name: "Genji",
      role: "DAMAGE",
      selected: false,
      key: "genji",
    },
    hanzo: {
      name: "Hanzo",
      role: "DAMAGE",
      selected: false,
      key: "hanzo",
    },
    junkrat: {
      name: "Junkrat",
      role: "DAMAGE",
      selected: false,
      key: "junkrat",
    },
    mccree: {
      name: "McCree",
      role: "DAMAGE",
      selected: false,
      key: "mccree",
    },
    mei: {
      name: "Mei",
      role: "DAMAGE",
      selected: false,
      key: "mei",
    },
    pharah: {
      name: "Pharah",
      role: "DAMAGE",
      selected: false,
      key: "pharah",
    },
    reaper: {
      name: "Reaper",
      role: "DAMAGE",
      selected: false,
      key: "reaper",
    },
    soldier76: {
      name: "Soldier: 76",
      role: "DAMAGE",
      selected: false,
      key: "soldier76",
    },
    sombra: {
      name: "Sombra",
      role: "DAMAGE",
      selected: false,
      key: "sombra",
    },
    symmetra: {
      name: "Symmetra",
      role: "DAMAGE",
      selected: false,
      key: "symmetra",
    },
    torbjorn: {
      name: "Torbjörn",
      role: "DAMAGE",
      selected: false,
      key: "torbjorn",
    },
    tracer: {
      name: "Tracer",
      role: "DAMAGE",
      selected: false,
      key: "tracer",
    },
    widowmaker: {
      name: "Widowmaker",
      role: "DAMAGE",
      selected: false,
      key: "widowmaker",
    },
    ana: {
      name: "Ana",
      role: "SUPPORT",
      selected: false,
      key: "ana",
    },
    brigitte: {
      name: "Brigitte",
      role: "SUPPORT",
      selected: false,
      key: "brigitte",
    },
    lucio: {
      name: "Lúcio",
      role: "SUPPORT",
      selected: false,
      key: "lucio",
    },
    mercy: {
      name: "Mercy",
      role: "SUPPORT",
      selected: false,
      key: "mercy",
    },
    moira: {
      name: "Moira",
      role: "SUPPORT",
      selected: false,
      key: "moira",
    },
    zenyatta: {
      name: "Zenyatta",
      role: "SUPPORT",
      selected: false,
      key: "zenyatta",
    },
    baptiste: {
      name: "Baptiste",
      role: "SUPPORT",
      selected: false,
      key: "baptiste",
    },
    sigma: {
      name: "Sigma",
      role: "TANK",
      selected: false,
      key: "sigma",
    },
    ashe: {
      name: "Ashe",
      role: "DAMAGE",
      selected: false,
      key: "ashe",
    },
    echo: {
      name: "Echo",
      role: "DAMAGE",
      selected: false,
      key: "echo",
    },
  },
};

function hero_comparator_by_key(hero1, hero2) {
  return hero1.name.localeCompare(hero2.name);
}

const getters = {
  getHeroes: (state) => {
    return Object.keys(state.heroes)
      .map((key) => state.heroes[key])
      .sort(hero_comparator_by_key);
  },
  getByRole: (state, getters) => (role) => {
    return getters.getHeroes.filter((hero) => hero.role == role);
  },
  getTanks: (state, getters) => {
    return getters.getByRole("TANK");
  },
  getSupport: (state, getters) => {
    return getters.getByRole("SUPPORT");
  },
  getDamage: (state, getters) => {
    return getters.getByRole("DAMAGE");
  },
  getSelected: (state, getters) => {
    return getters.getBySelectedStatus(true);
  },
  getBySelectedStatus: (state) => (selected) => {
    return Object.keys(state.heroes)
      .map((key) => state.heroes[key])
      .filter((hero) => hero.selected == selected)
      .sort(hero_comparator_by_key);
  },
};

// actions
const actions = {
  toggleHero({ commit }, hero_key) {
    commit("toggleHero", hero_key);
  },
  selectByRole({ commit }, role) {
    commit("setStateByRole", { role: role, selectedState: true });
  },
  unselectByRole({ commit }, role) {
    commit("setStateByRole", { role: role, selectedState: false });
  },
};

// mutations
const mutations = {
  toggleHero(state, hero_key) {
    state.heroes[hero_key].selected = !state.heroes[hero_key].selected;
  },
  setStateByRole(state, { role, selectedState }) {
    for (let hero_key in state.heroes) {
      if (state.heroes[hero_key].role === role) {
        state.heroes[hero_key].selected = selectedState;
      }
    }
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
