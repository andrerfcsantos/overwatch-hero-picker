<template>
  <div class="main-container col-12 h-100 m-0 p-0 unselectable">
    <b-alert
      variant="danger"
      dismissible
      fade
      :show="showDismissibleAlert"
      @dismissed="showDismissibleAlert = false"
    >
      Dismissible Alert!
    </b-alert>

    <div class="row col-12 m-0 p-0">
      <div class="left-content col-lg-3">
        <h1 class="left-title">
          You should play
        </h1>

        <b-form-checkbox
          id="checkbox-show-portrait"
          v-model="showPortrait"
          name="checkbox-show-portrait"
          :value="true"
          :unchecked-value="false"
        >
          <span
            id="show-portrait-text"
            class="show-portrait-text"
          >Show hero portrait</span>
          <sup>
            <b-icon-info-fill
              id="show-portrait-help"
              v-b-tooltip.hover.bottom="
                'Show/hide the hero portrait. Hiding the portrait can be useful for slow connections.'
              "
            />
          </sup>
        </b-form-checkbox>

        <img
          v-if="showPortrait"
          key="hero-image"
          class="chosen-hero-image img-fluid"
          :src="'assets/imgs/heroes/portraits/' + selectedHero.key + '.webp'"
        >
        <h2
          key="hero-name"
          class="chosen-hero-name"
        >
          {{ selectedHero.name }}
        </h2>

        <div
          type="button"
          class="random-hero-button btn"
          @click="randomHero"
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
          If no hero is selected, all heroes are taken into account.
        </p>

        <div class="filter-header">
          <img
            class="role-icon"
            alt="Tank role icon"
            src="assets/imgs/roles/tank.png"
          >
          <h2 class="role-header">
            Tank
          </h2>
          <button
            class="all-button select-all-button"
            @click="selectAllTankHeroes"
          >
            Select All
          </button>
          <button
            class="all-button unselect-all-button"
            @click="unselectAllTankHeroes"
          >
            Unselect All
          </button>
        </div>

        <hero-card
          v-for="h in getTankHeroes()"
          :key="h.key"
          :hero="h"
        />

        <div class="filter-header">
          <img
            class="role-icon"
            alt="Damage role icon"
            src="assets/imgs/roles/damage.png"
          >
          <h2 class="role-header">
            Damage
          </h2>
          <button
            class="all-button select-all-button"
            @click="selectAllDamageHeroes"
          >
            Select All
          </button>
          <button
            class="all-button unselect-all-button"
            @click="unselectAllDamageHeroes"
          >
            Unselect All
          </button>
        </div>

        <hero-card
          v-for="h in getDamageHeroes()"
          :key="h.key"
          :hero="h"
        />

        <div class="filter-header">
          <img
            class="role-icon"
            alt="Support role icon"
            src="assets/imgs/roles/support.png"
          >
          <h2 class="role-header">
            Support
          </h2>
          <button
            class="all-button select-all-button"
            @click="selectAllSupportHeroes"
          >
            Select All
          </button>
          <button
            class="all-button unselect-all-button"
            @click="unselectAllSupportHeroes"
          >
            Unselect All
          </button>
        </div>
        <hero-card
          v-for="h in getSupportHeroes()"
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
  getDamage,
  getSupport,
  getTanks,
  selectAllDamage,
  selectAllSupports,
  selectAllTanks,
  unselectAllDamage,
  unselectAllSupports,
  unselectAllTanks
} from "../services/heroes_service";
import HeroCard from "@/components/HeroCard";
import { BIconInfoFill } from "bootstrap-vue";

export default {
  name: "PickerPageContent",
  components: {
    HeroCard,
    BIconInfoFill
  },
  data() {
    return {
      selectedHero: {
        name: "",
        role: "",
        selected: false,
        key: ""
      },
      showPortrait: true
    };
  },
  watch: {
    showPortrait: function(newValue) {
      localStorage.setItem("showPortrait", newValue);
    }
  },
  created() {
    this.selectedHero = randomHero();
    let showPortraitLS = localStorage.getItem("showPortrait");

    if (showPortraitLS !== null) {
      this.showPortrait = showPortraitLS === "true";
    } else {
      localStorage.setItem("showPortrait", this.showPortrait);
    }
  },
  methods: {
    randomHero: function(event) {
      this.selectedHero = randomHero();
    },
    getDamageHeroes: function() {
      return getDamage();
    },
    getTankHeroes: function() {
      return getTanks();
    },
    getSupportHeroes: function() {
      return getSupport();
    },
    selectAllDamageHeroes: function() {
      selectAllDamage();
    },
    selectAllSupportHeroes: function() {
      selectAllSupports();
    },
    selectAllTankHeroes: function() {
      selectAllTanks();
    },
    unselectAllDamageHeroes: function() {
      unselectAllDamage();
    },
    unselectAllSupportHeroes: function() {
      unselectAllSupports();
    },
    unselectAllTankHeroes: function() {
      unselectAllTanks();
    }
  }
};
</script>

<style scoped>
.main-container {
  overflow-x: hidden;
  min-height: 95vh;
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
  font-size: 1.3rem;
  margin: 0;
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

/*

  .select-all-button {
    background-color: rgb(51, 150, 31);
  }

  .unselect-all-button {
    background-color: rgb(231, 117, 9);
  }
  */

.select-all-button {
  background-color: rgb(51, 150, 31);
}

.unselect-all-button {
  background-color: rgb(231, 117, 9);
}

.all-button:hover {
  cursor: pointer;
}

.random-hero-button {
  margin-bottom: 5%;
}
</style>
