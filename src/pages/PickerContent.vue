<template>
  <div class="main-container col-12 h-100 m-0 p-0 unselectable">
    <div class="row col-12 m-0 p-0">
      <div class="left-content col-lg-3">
        <h1 class="left-title">
          You should play
        </h1>

        <div>
          <input
            id="checkbox-show-portrait"
            v-model="showPortrait"
            type="checkbox"
            name="checkbox-show-portrait"
            :value="true"
          />
          <label
            id="show-portrait-label"
            for="checkbox-show-portrait"
            class="show-portrait-label"
            >Show hero portrait</label
          >
        </div>

        <img
          v-if="showPortrait"
          key="hero-image"
          class="chosen-hero-image img-fluid"
          :src="'assets/imgs/heroes/portraits/' + selectedHero.key + '.png'"
        />

        <transition name="hero-name-transition" mode="out-in">
          <h2
            :key="`hero-name-${selectedHero.name}-${heroCount}`"
            class="chosen-hero-name"
          >
            {{ selectedHero.name }}
          </h2>
        </transition>

        <div
          type="button"
          class="random-hero-button"
          @click="randomHeroHandler"
        >
          Get Random Hero
        </div>
      </div>

      <div class="right-content col-lg-9">
        <h1 class="right-title">
          Filter Heroes
        </h1>

        <p class="filter-description">
          Select the heroes you wish to play and click in the "Get Random Hero"
          button to get a random hero from the selected ones.
        </p>

        <p class="filter-description">
          Playing as a group?
          <router-link to="/squad">Get random heroes for your team</router-link>
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
  getHeroesByRole,
  selectByRole,
  unselectByRole,
  saveSelectedHeroesToLS,
  getSelectedLSHeroes,
  getSelected,
} from "../services/heroes_service";
import HeroCard from "@/components/HeroCard";
import { sendEvent } from "../services/events";

export default {
  name: "PickerPageContent",
  components: {
    HeroCard,
  },
  data() {
    return {
      selectedHero: {
        name: "",
        role: "",
        selected: false,
        key: "",
      },
      heroCount: 0,
      showPortrait: true,
    };
  },
  computed: {
    selectedHeroes: function () {
      return getSelected().map((h) => h.name);
    },
    numberOfSelectedHeroes: function () {
      return this.selectedHeroes.length;
    },
  },
  watch: {
    showPortrait: function (newValue) {
      localStorage.setItem("showPortrait", newValue);
      sendEvent("Option", "ToggleShowPortrait", newValue);
    },
  },
  created() {
    window.document.title =
      "Overwatch Random Hero Picker | For teams and solo players";
    getSelectedLSHeroes();
    this.selectedHero = randomHero();
    let showPortraitLS = localStorage.getItem("showPortrait");

    if (showPortraitLS !== null) {
      this.showPortrait = showPortraitLS === "true";
    } else {
      localStorage.setItem("showPortrait", this.showPortrait);
    }
  },
  methods: {
    randomHeroHandler() {
      this.randomHero();
      sendEvent("Hero", "GetRandom", this.selectedHero.name);
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
  width: 99%;
  min-height: 85vh;
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

.show-portrait-label {
  margin: 0 0 0 1%;
}
</style>
