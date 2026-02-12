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
    minor: ["Crusader's Fire", "Crusader's Resolve"],
    major: ["Shield Slam", "Ignited Fury"],
  },
  roadhog: {
    minor: ["Scrap Hook", "Shrapnel Launcher"],
    major: ["Invigorate", "Pulled Pork"],
  },
  winston: {
    minor: ["Heavy Landing", "Electric Charge"],
    major: ["Chain Lightning", "Revitalizing Barrier"],
  },
  wreckingball: {
    minor: ["Multi-Ball", "Steamroller"],
    major: ["Hang Time", "Adaptive Barrier"],
  },
  zarya: {
    minor: ["Jump-Ups", "Spotter"],
    major: ["Energy Lance", "Extra Oomph"],
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
    minor: ["Sonic Disruption", "Dragon Fury"],
    major: ["Frost Arrow", "Scatter Arrows"],
  },
  junkrat: {
    minor: ["Mine Recycling", "Nitro Boost"],
    major: ["Frag Cannon", "Bomb Voyage"],
  },
  cassidy: {
    minor: ["Even the Odds", "Bang Bang"],
    major: ["Silver Bullet", "Rollin' Round-Ups"],
  },
  mei: {
    minor: ["Skating Rink", "Glacial Propulsion"],
    major: ["Cryo-Storm", "Deep Freeze"],
  },
  pharah: {
    minor: ["Helix Shields", "Drift Thrusters"],
    major: ["Fuel Stores", "Rocket Salvo"],
  },
  reaper: {
    minor: ["Soul Reaving", "Lingering Wraith"],
    major: ["Shadow Blink", "Dire Triggers"],
  },
  soldier76: {
    minor: ["Tactical Salvo", "Helix Propulsion"],
    major: ["Stim Pack", "Agility Training"],
  },
  sombra: {
    minor: ["CTRL ALT ESC", "Encrypted Upload"],
    major: ["High-Speed Bandwidth", "Viral Replication"],
  },
  symmetra: {
    minor: ["Perfect Alignment", "Sentry Capacity"],
    major: ["Hovering Barrier", "Shield Battery"],
  },
  torbjorn: {
    minor: ["Pre-Heated", "Hammer Time"],
    major: ["Overloaded Turret", "Anchor Bolts"],
  },
  tracer: {
    minor: ["Kinetic Reload", "Chronal Dash"],
    major: ["Quantum Entanglement", "Blink Packs"],
  },
  widowmaker: {
    minor: ["Sniper's Instinct", "Scoped Efficiency"],
    major: ["Widow’s Bite", "Seeker Mine"],
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
    minor: ["Destruction's Divide", "Ethical Nourishment"],
    major: ["Phantom Step", "Reversal"],
  },
  zenyatta: {
    minor: ["Discordant Repair", "Ascendance"],
    major: ["Focused Destruction", "Dual Harmony"],
  },
  baptiste: {
    minor: ["Assault Burst", "Expanded Field"],
    major: ["Automated Healing", "Rocket Boots"],
  },
  sigma: {
    minor: ["Kinetic Cycle", "Hyper Regeneration"],
    major: ["Hyper Strike", "Levitation"],
  },
  ashe: {
    minor: ["Remote Detonator", "Double-Barreled"],
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
    minor: ["Petal Protection", "Dashing Escape"],
    major: ["Sow the Seed", "Superbloom"],
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
    major: ["Smart Extender", "Covered in Dirt"],
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
    minor: ["Momentum Boost", "Relentless Barrage"],
    major: ["Rising Winds", "Aerial Recovery"],
  },
  anran: {
    minor: ["Smoulder", "Heat Shield"],
    major: ["Short Fuse", "Hungering Blaze"],
  },
  domina: {
    minor: ["Efficient Design", "Extended Power"],
    major: ["Disruptive Detonation", "Power Move"],
  },
  emre: {
    minor: ["Suppressive Security", "Enhanced Agility"],
    major: ["Heat Sink", "Cyber Adhesion"],
  },
  jetpackcat: {
    minor: ["Claws Out", "Transport Shielding"],
    major: ["Headbutt", "Territorial"],
  },
  mizuki: {
    minor: ["Wellspring", "Exposed Soul"],
    major: ["Resonant Return", "Quickstep"],
  },
  wuyang: {
    minor: ["Overflow", "Balance"],
    major: ["Ebb and Flow", "Falling Rain"],
  },
  vendetta: {
    minor: ["Extra Edge", "Siphoning Strike"],
    major: ["Relentless", "Raging Storm"],
  },
};

export function randomHero(options = {}) {
  const { preventRepeat = false, previousHeroKey = "" } = options;
  const selected = store.getters["heroes/getSelected"];
  const allHeroes = store.getters["heroes/getHeroes"];

  const heroPool = selected.length > 0 ? selected : allHeroes;
  let availableHeroes = heroPool;

  if (preventRepeat && previousHeroKey && heroPool.length > 1) {
    const filteredHeroes = heroPool.filter(
      (hero) => hero.key !== previousHeroKey
    );

    if (filteredHeroes.length > 0) {
      availableHeroes = filteredHeroes;
    }
  }

  return availableHeroes[Math.floor(Math.random() * availableHeroes.length)];
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
