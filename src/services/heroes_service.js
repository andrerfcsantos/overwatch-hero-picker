import store from "../store";

const heroPerks = {
  dva: {
    minor: ["Bunny Power", "Extended Boosters"],
    major: ["Shield System", "Precision Fusion"],
  },
  orisa: {
    minor: ["Defense Protocol", "Mobile Fortification"],
    major: ["Charged Javelin", "Protective Barrier"],
  },
  reinhardt: {
    minor: ["Barrier Re-Charge", "Crusader's Fire"],
    major: ["Shield Slam", "Ignited Fury"],
  },
  roadhog: {
    minor: ["Scrap Hook", "Shrapnel Launcher"],
    major: ["Invigorate", "Pulled Pork"],
  },
  winston: {
    minor: ["Barrier Toss", "Heavy Landing"],
    major: ["Chain Lightning", "Revitalizing Barrier"],
  },
  wreckingball: {
    minor: ["Steamroller", "Pack Rat"],
    major: ["Hang Time", "Adaptive Barrier"],
  },
  zarya: {
    minor: ["Jump-Ups", "Energy Converter"],
    major: ["Energy Lance", "Spotter"],
  },
  bastion: {
    minor: ["Configuration Reload", "Armored Artillery"],
    major: ["Self-Repair", "Lindholm Explosives"],
  },
  doomfist: {
    minor: ["One-Two", "Survival of the Fittest"],
    major: ["Aftershock", "Power Matrix"],
  },
  genji: {
    minor: ["Swift Cuts", "Dragon's Thirst"],
    major: ["Meditation", "Blade Twisting"],
  },
  hanzo: {
    minor: ["Swift Lunge", "Sonic Disruption"],
    major: ["Scatter Arrows", "Dragon Fury"],
  },
  junkrat: {
    minor: ["Mine Recycling", "Nitro Boost"],
    major: ["Frag Cannon", "Bomb Voyage"],
  },
  cassidy: {
    minor: ["Even the Odds", "Bang Bang"],
    major: ["Silver Bullet", "Gun Slingin'"],
  },
  mei: {
    minor: ["Skating Rink", "Glacial Propulsion"],
    major: ["Cryo-Storm", "Deep Freeze"],
  },
  pharah: {
    minor: ["Helix Shields", "Drift Thrusters"],
    major: ["Fuel Stores", "Sky Spy"],
  },
  reaper: {
    minor: ["Soul Reaving", "Lingering Wraith"],
    major: ["Shadow Blink", "Dire Triggers"],
  },
  soldier76: {
    minor: ["Tactical Salvo", "Recycled Pulse Munitions"],
    major: ["Stim Pack", "Agility Training"],
  },
  sombra: {
    minor: ["CTRL ALT ESC", "Encrypted Upload"],
    major: ["Adept Hacker", "Viral Replication"],
  },
  symmetra: {
    minor: ["Perfect Alignment", "Sentry Capacity"],
    major: ["Hovering Barrier", "Shield Battery"],
  },
  torbjorn: {
    minor: ["Fully Loaded", "Hammer Time"],
    major: ["Overloaded Turret", "Anchor Bolts"],
  },
  tracer: {
    minor: ["Kinetic Reload", "Blink Packs"],
    major: ["Quantum Entanglement", "Flashback"],
  },
  widowmaker: {
    minor: ["Sniper’s Instinct", "Scoped Efficiency"],
    major: ["Escape Plan", "Seeker Mine"],
  },
  ana: {
    minor: ["Speed Serum", "Groggy"],
    major: ["Headhunter", "Biotic Bounce"],
  },
  brigitte: {
    minor: ["Combat Medic", "Morale Boost"],
    major: ["Inspiring Strike", "Whiplash"],
  },
  lucio: {
    minor: ["Soundwave Rider", "Beat Drop"],
    major: ["Noise Violation", "Accelerando"],
  },
  mercy: {
    minor: ["Angelic Resurrection", "Divine Momentum"],
    major: ["Chain Boost", "Flash Heal"],
  },
  moira: {
    minor: ["Destruction’s Divide", "Ethical Nourishment"],
    major: ["Phantom Step", "Reversal"],
  },
  zenyatta: {
    minor: ["Transcendent Condemnation", "Ascendance"],
    major: ["Focused Destruction", "Dual Harmony"],
  },
  baptiste: {
    minor: ["Biotic Reloader", "Automated Healing"],
    major: ["Assault Burst", "Rocket Boots"],
  },
  sigma: {
    minor: ["Kinetic Cycle", "Hyper Regeneration"],
    major: ["Hyper Strike", "Levitation"],
  },
  ashe: {
    minor: ["Sidewinder", "Remote Detonator"],
    major: ["Airburst", "Viper's Sting"],
  },
  echo: {
    minor: ["Focused Rush", "Partial Scan"],
    major: ["High Beams", "Full Salvo"],
  },
  sojourn: {
    minor: ["Deceleration Field", "Overcharged"],
    major: ["Dual Thrusters", "Friction Generators"],
  },
  junkerqueen: {
    minor: ["Rampant Change", "Battle Shout"],
    major: ["Savage Satiation", "Willy-Willy"],
  },
  kiriko: {
    minor: ["Urgent Care", "Fortune Teller"],
    major: ["Ready Step", "Foxtrot"],
  },
  ramattra: {
    minor: ["Void Surge", "Relentless Form"],
    major: ["Nanite Repair", "Vengeful Vortex"],
  },
  lifeweaver: {
    minor: ["Cleansing Grasp", "Lifeweaving"],
    major: ["Petal Power", "Superbloom"],
  },
  illari: {
    minor: ["Rapid Construction", "Summer Solstice"],
    major: ["Solar Flare", "Sunburn"],
  },
  mauga: {
    minor: ["Kinetic Bandolier", "Pyromaniac"],
    major: ["Firewalker", "Combat Fuel"],
  },
  venture: {
    minor: ["Deep Burrow", "Excavation Exhilaration"],
    major: ["SMART Extender", "Covered in Dirt"],
  },
  juno: {
    minor: ["Familiar Vitals", "Locked On"],
    major: ["Lift Off", "Faster Blaster"],
  },
  hazard: {
    minor: ["Deep Leap", "Anarchic Zeal"],
    major: ["Reconstitution", "Explosive Impalements"],
  },
  freja: {
    minor: ["Hunters Instinct", "Momentum Boost"],
    major: ["Aerial Recovery", "Relentless Barrage"],
  },
  wuyang: {
    minor: ["Overflow", "Balance"],
    major: ["Ebb and Flow", "Falling Rain"],
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
export function selectJustRole(role) {
  store.dispatch(`heroes/selectJustRole`, role);
}

export function unselectByRole(role) {
  store.dispatch(`heroes/unselectByRole`, role);
}
