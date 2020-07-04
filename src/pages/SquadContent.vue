<template>
  <div class="main-container col-12 h-100 m-0 p-0 unselectable">
    <div class="row col-12 m-0 p-0">
      <div class="left-content col-lg-3">
        <h1 class="left-title">
          Team Generator
        </h1>

        <div class="squad">
          <div class="force222">
            <input
              id="checkbox-force222"
              v-model="force222"
              type="checkbox"
              name="checkbox-force222"
              :value="true"
            />
            <label
              id="force222-label"
              for="checkbox-force222"
              class="force222-label"
              >Force 2-2-2</label
            >
          </div>

          <ul class="role-list-squad">
            <li v-for="h of squad.tanks" :key="h.key">
              <img
                class="role-icon-squad"
                alt="Damage role icon"
                src="assets/imgs/roles/tank.png"
              />
              <img
                class="hero-image-squad"
                :alt="h.name + ' icon'"
                :src="'assets/imgs/heroes/icons/' + h.key + '.png'"
              />
              <span class="hero-name-squad">{{ h.name }}</span>
            </li>
          </ul>

          <ul class="role-list-squad">
            <li v-for="h of squad.damage" :key="h.key">
              <img
                class="role-icon-squad"
                alt="Damage role icon"
                src="assets/imgs/roles/damage.png"
              />
              <img
                class="hero-image-squad"
                :alt="h.name + ' icon'"
                :src="'assets/imgs/heroes/icons/' + h.key + '.png'"
              />
              <span class="hero-name-squad">{{ h.name }}</span>
            </li>
          </ul>

          <ul class="role-list-squad">
            <li v-for="h of squad.supports" :key="h.key">
              <img
                class="role-icon-squad"
                alt="Damage role icon"
                src="assets/imgs/roles/support.png"
              />
              <img
                class="hero-image-squad"
                :alt="h.name + ' icon'"
                :src="'assets/imgs/heroes/icons/' + h.key + '.png'"
              />
              <span class="hero-name-squad">{{ h.name }}</span>
            </li>
          </ul>
        </div>

        <div
          type="button"
          class="random-hero-button"
          @click="randomSquadHandler"
        >
          Get Random Team
        </div>
      </div>

      <div class="right-content col-lg-9">
        <h1 class="right-title">
          Filter Heroes
        </h1>

        <p class="filter-description">
          Select the heroes you wish to include in your squad and click in the
          "Get Random Team" button to get a random team which will include the
          selected heroes.
        </p>

        <p class="filter-description">
          Playing solo?
          <router-link to="/">Get a random hero just for you</router-link>
        </p>

        <div class="filter-description selected-heroes-info">
          <p
            v-if="numberOfSelectedHeroes === 0"
            class="filter-description selected-heroes-text"
          >
            You have no heroes selected, so all heroes are being considered by
            default.
          </p>
          <p
            v-else-if="numberOfSelectedHeroes === 1"
            class="filter-description selected-heroes-text"
          >
            You have {{ numberOfSelectedHeroes }} hero selected.
          </p>
          <p v-else class="filter-description selected-heroes-text">
            You have {{ numberOfSelectedHeroes }} heroes selected.
          </p>
        </div>

        <div class="filter-header">
          <img
            class="role-icon"
            alt="Tank role icon"
            src="assets/imgs/roles/tank.png"
          />
          <h2 class="role-header">
            Tank
          </h2>
          <button
            class="all-button select-all-button"
            @click="selectByRole('TANK')"
          >
            Select All
          </button>
          <button
            class="all-button unselect-all-button"
            @click="unselectByRole('TANK')"
          >
            Unselect All
          </button>
        </div>

        <HeroCard v-for="h in getHeroesByRole('TANK')" :key="h.key" :hero="h" />

        <div class="filter-header">
          <img
            class="role-icon"
            alt="Damage role icon"
            src="assets/imgs/roles/damage.png"
          />
          <h2 class="role-header">
            Damage
          </h2>
          <button
            class="all-button select-all-button"
            @click="selectByRole('DAMAGE')"
          >
            Select All
          </button>
          <button
            class="all-button unselect-all-button"
            @click="unselectByRole('DAMAGE')"
          >
            Unselect All
          </button>
        </div>

        <HeroCard
          v-for="h in getHeroesByRole('DAMAGE')"
          :key="h.key"
          :hero="h"
        />

        <div class="filter-header">
          <img
            class="role-icon"
            alt="Support role icon"
            src="assets/imgs/roles/support.png"
          />
          <h2 class="role-header">
            Support
          </h2>
          <button
            class="all-button select-all-button"
            @click="selectByRole('SUPPORT')"
          >
            Select All
          </button>
          <button
            class="all-button unselect-all-button"
            @click="unselectByRole('SUPPORT')"
          >
            Unselect All
          </button>
        </div>
        <HeroCard
          v-for="h in getHeroesByRole('SUPPORT')"
          :key="h.key"
          :hero="h"
        />
      </div>
    </div>
  </div>
</template>

<script>
import {
  randomHero,
  randomSquad,
  getHeroesByRole,
  selectByRole,
  unselectByRole,
  saveSelectedHeroesToLS,
  getSelectedLSHeroes,
  getSelected,
  randomSquadClassic,
} from "../services/heroes_service";
import HeroCard from "@/components/HeroCard";
import { sendEvent } from "../services/events";

export default {
  name: "SquadPageContent",
  components: {
    HeroCard,
  },
  data() {
    return {
      squad: {
        tanks: [],
        supports: [],
        damage: [],
      },
      selectedHero: {
        name: "",
        role: "",
        selected: false,
        key: "",
      },
      force222: true,
    };
  },
  computed: {
    simpleSquad: function () {
      return {
        DAMAGE: this.squad.damage.map((h) => h.name),
        SUPPORT: this.squad.supports.map((h) => h.name),
        TANK: this.squad.tanks.map((h) => h.name),
      };
    },
    selectedHeroes: function () {
      return getSelected().map((h) => h.name);
    },
    numberOfSelectedHeroes: function () {
      return this.selectedHeroes.length;
    },
  },
  watch: {
    force222: function (newValue) {
      sendEvent("Option", "ToggleForce222", newValue);
    },
  },
  created() {
    window.document.title = "Team Picker | Overwatch Random Hero Picker";
    getSelectedLSHeroes();
    this.randomSquad();
  },
  methods: {
    randomSquadHandler: function () {
      this.randomSquad();
      sendEvent("Squad", "GetRandom", JSON.stringify(this.simpleSquad));
    },
    randomSquad: function () {
      var squad;

      if (this.force222) {
        squad = randomSquad();
      } else {
        squad = randomSquadClassic();
      }

      this.squad.damage = squad["DAMAGE"];
      this.squad.supports = squad["SUPPORT"];
      this.squad.tanks = squad["TANK"];
    },
    randomHero: function () {
      this.selectedHero = randomHero();
      this.heroCount += 1;
    },
    getHeroesByRole(role) {
      return getHeroesByRole(role);
    },
    selectByRole(role) {
      selectByRole(role);
      saveSelectedHeroesToLS();
      sendEvent("Filter", "SelectRole", role);
    },
    unselectByRole(role) {
      unselectByRole(role);
      saveSelectedHeroesToLS();
      sendEvent("Filter", "UnselectRole", role);
    },
  },
};
</script>

<style scoped>
.main-container {
  overflow-x: hidden;
  background-color: #2c3e50;
  color: white;
  display: flex;
}

.left-content {
  display: flex;
  flex-direction: column;
  padding: 0 3% 0 3%;
}

.left-title,
.right-title {
  color: white;
  text-decoration: underline;
}

.left-content .chosen-hero-image {
  max-width: 75%;
  margin-left: auto;
  margin-right: auto;
}

.chosen-hero-name {
  margin: 1rem 1rem;
}

.random-hero-button,
.random-hero-button:hover,
.random-hero-button:focus,
.random-hero-button:active {
  font-size: 1.5rem;
  color: white;
  background-color: orangered;
  border-color: orangered;
}

.right-content {
  display: block;
  text-align: start;
}

.selected-heroes-info {
  font-size: 1.5rem;
  color: orange;
  margin: 1rem 0 0 0;
  font-weight: bold;
}
.selected-heroes-text {
  margin: 0;
  font-color: orange;
}

/** Large breakpoint or smaller */
@media (max-width: 991.98px) {
  .right-content {
    text-align: center;
  }

  .right-title {
    margin-top: 5%;
  }
}

.filter-description {
  display: block;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 1rem;
  user-select: text;
  margin: 0;
  font-weight: bold;
}

.role-list-squad {
  list-style: none;
}

.role-icon-squad {
  max-height: 2em;
}

.hero-image-squad {
  max-height: 2em;
  margin-right: 0.5rem;
}
.hero-name-squad {
  font-size: 2em;
  vertical-align: middle;
}

.squad {
  text-align: start;
}

/** Filter header */
.role-icon {
  max-height: 2em;
}
.role-header {
  margin: 0.5em 0.5em 0.5em 0;
}
.filter-header {
  display: flex;
  flex-direction: row;
  align-items: center;
}

/** Select / Unselect all buttons */
.all-button {
  color: white;
  border: none;
  font-size: 1.25rem;
  background-color: #0192c7;
  outline: none;
  padding: 0 0.3em;
  margin: 0 0.1em;
  height: min-content;
  transform: skewX(-10deg);
}

.all-button:active {
  transform: skewX(-10deg) translate(1px, 1px);
}

.select-all-button {
  background-color: rgb(51, 150, 31);
}

.unselect-all-button {
  background-color: rgb(231, 117, 9);
}

.all-button:hover {
  cursor: pointer;
}

.random-hero-button,
.random-hero-button:hover,
.random-hero-button:active,
.random-hero-button:focus,
.random-hero-button:enabled {
  border-radius: 0.25rem;
  padding: 0.25rem;
  font-size: 1.75rem;
  -webkit-appearance: none;
}

.hero-name-transition-enter-active {
  transition: all 0.1s ease-out;
}

.hero-name-transition-leave-active {
  transition: all 0.1s ease-in;
}

.hero-name-transition-enter,
.hero-name-transition-leave-to {
  transform: scaleY(0) translateZ(0);
  opacity: 0;
}

.hero-name-transition-enter-to {
  transform: scaleY(1) translateZ(0);
  opacity: 1;
}

.force222-label {
  margin: 0 0 0 1%;
}

.force222 {
  text-align: center;
  font-size: 1.25rem;
}
</style>
