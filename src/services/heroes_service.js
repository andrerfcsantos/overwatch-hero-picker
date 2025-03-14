import store from "../store";

const heroPerks = {
  dva: {
    minor: ["Bunny Stomp", "Ejection Suit"],
    major: ["Shield System", "Heavy Rockets"],
  },
  orisa: {
    minor: ["Heat Dissipator", "Fleeting Bulwark"],
    major: ["Charged Javelin", "Protective Barrier"],
  },
  reinhardt: {
    minor: ["Crusader's Resolve", "Fiery Uptake"],
    major: ["Shield Slam", "Crushing Victory"],
  },
  roadhog: {
    minor: ["Scrap Hook", "Hog Toss"],
    major: ["Invigorate", "Hogdrogen Exposure"],
  },
  winston: {
    minor: ["Short Circuit", "Heavy Landing"],
    major: ["Chain Lightning", "Revitalizing Barrier"],
  },
  wreckingball: {
    minor: ["Steamroller", "Pack Rat"],
    major: ["Hang Time", "Transfer Efficiency"],
  },
  zarya: {
    minor: ["Jump-Ups", "Graviton Crush"],
    major: ["Energy Lance", "Spotter"],
  },
  bastion: {
    minor: ["Smart Bomb", "Armored Artillery"],
    major: ["Self-Repair", "Lindholm Explosives"],
  },
  doomfist: {
    minor: ["One-Two", "Survival of the Fittest"],
    major: ["Seismic Empowerment", "Power Matrix"],
  },
  genji: {
    minor: ["Acrobatics", "Dragon's Thirst"],
    major: ["Meditation", "Blade Twisting"],
  },
  hanzo: {
    minor: ["Sonic Disruption", "Scatter Arrows"],
    major: ["Yamagami Technique", "Dragon Fury"],
  },
  junkrat: {
    minor: ["Aluminium Frame", "Nitro Boost"],
    major: ["Frag Cannon", "Tick Tock"],
  },
  cassidy: {
    minor: ["Past Noon", "Quick Draw"],
    major: ["Bang Bang", "Gun Slingin'"],
  },
  mei: {
    minor: ["Chilling Reach", "Permafrost"],
    major: ["Cryo-Storm", "Biting Cold"],
  },
  pharah: {
    minor: ["Helix Shields", "Drift Thrusters"],
    major: ["Fuel Stores", "Concussive Implosion"],
  },
  reaper: {
    minor: ["Soul Reaving", "Death's Shadow"],
    major: ["Dire Triggers", "Ravenous Wraith"],
  },
  soldier76: {
    minor: ["Field Emergency", "Recycled Pulse Munitions"],
    major: ["Stim Pack", "Agility Training"],
  },
  sombra: {
    minor: ["CTRL ALT ESC", "Viral Efficacy"],
    major: ["White Hat", "Stack Overflow"],
  },
  symmetra: {
    minor: ["Advanced Teleportation", "Sentry Capacity"],
    major: ["Perfect Alignment", "Shield Battery"],
  },
  torbjorn: {
    minor: ["Fully Loaded", "Craftsman"],
    major: ["Overloaded Turret", "Anchor Bolts"],
  },
  tracer: {
    minor: ["Blast from the Past", "Blink Packs"],
    major: ["Quantum Entanglement", "Flashback"],
  },
  widowmaker: {
    minor: ["Focused Aim", "Scoped Efficiency"],
    major: ["Escape Plan", "Deadly Deux"],
  },
  ana: {
    minor: ["Groggy", "Biotic Bounce"],
    major: ["Headhunter", "Shrike"],
  },
  brigitte: {
    minor: ["Barrier Restoration", "Morale Boost"],
    major: ["Quick Fix", "Whiplash"],
  },
  lucio: {
    minor: ["Bass Blowout", "Groovin'"],
    major: ["Noise Violation", "Accelerando"],
  },
  mercy: {
    minor: ["Angelic Recovery", "Winged Reach"],
    major: ["Chain Boost", "Flash Heal"],
  },
  moira: {
    minor: ["Vanish", "Uprush"],
    major: ["Ethical Nourishment", "Contamination"],
  },
  zenyatta: {
    minor: ["Zenith Kick", "Ascendance"],
    major: ["Focused Destruction", "Duality"],
  },
  baptiste: {
    minor: ["Field Medicine", "Automated Healing"],
    major: ["Assault Burst", "Rocket Boots"],
  },
  sigma: {
    minor: ["Kinetic Cycle", "Massive Impact"],
    major: ["Hyper Strike", "Levitation"],
  },
  ashe: {
    minor: ["Sidewinder", "Rapid Fire"],
    major: ["Airburst", "Viper's Sting"],
  },
  echo: {
    minor: ["Friendly Imaging", "Enhanced Duplication"],
    major: ["High Beams", "Full Salvo"],
  },
  sojourn: {
    minor: ["Extended Mag", "Overcharged"],
    major: ["Dual Thrusters", "Adhesive Siphon"],
  },
  freja: {
    minor: ["Tracking Bolts", "Bounty Collection"],
    major: ["Bounty Collection", "Job's Done"],
  },
  junkerqueen: {
    minor: ["Rending Recall", "Battle Shout"],
    major: ["Deep Wounds", "Savage Satiation"],
  },
  kiriko: {
    minor: ["Urgent Care", "Fortune Teller"],
    major: ["Shuffling", "Foxtrot"],
  },
  ramattra: {
    minor: ["Void Surge", "Prolonged Barrier"],
    major: ["Nanite Repair", "Vengeful Vortex"],
  },
  lifeweaver: {
    minor: ["Cleansing Grasp", "Life Cycle"],
    major: ["Lifeweaving", "Superbloom"],
  },
  illari: {
    minor: ["Rapid Construction", "Summer Solstice"],
    major: ["Solar Power", "Sunburn"],
  },
  mauga: {
    minor: ["Kinetic Bandolier", "Two Hearts"],
    major: ["Firewalker", "Combat Fuel"],
  },
  venture: {
    minor: ["Seismic Sense", "Excavation Exhilaration"],
    major: ["SMART-R Excavator", "Covered in Dirt"],
  },
  juno: {
    minor: ["Familiar Vitals", "Hyper Boost"],
    major: ["Master Blaster", "Re-Boots"],
  },
  hazard: {
    minor: ["Off The Top", "Reconstitution"],
    major: ["Anarchic Zeal", "Deep Leap"],
  },
};

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

export function getRandomHeroPerks(hero) {
  const perks = heroPerks[hero];
  return [randomFromList(perks.minor), randomFromList(perks.major)];
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
    for (let i = 0; i < 5; i++) {
      rolesToGenerate.push(randomFromList(roleSet));
    }
  }

  for (let i = 0; i < 5; i++) {
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
  return randomSquadClassic(["TANK", "DAMAGE", "DAMAGE", "SUPPORT", "SUPPORT"]);
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
