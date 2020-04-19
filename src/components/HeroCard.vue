<template>
  <div
    class="hero-card"
    :class="{ selected: heroSelectedState }"
    @click="toggleHeroAction"
  >
    <img
      class="hero-image"
      :alt="hero.name + ' icon'"
      :src="`${publicPath}assets/imgs/heroes/icons/` + hero.key + '.webp'"
    >
    <div
      class="hero-name"
      :class="{ selected: heroSelectedState }"
    >
      {{ hero.name }}
    </div>
  </div>
</template>

<script>
    import { toggleHero } from "../services/heroes_service";

    export default  {
      name: "HeroCard",
      props: {
        hero: {
          type: Object,
          required: true
        }
      },
      data() {
        return {
          publicPath: process.env.BASE_URL
        };
      },
      computed: {
        heroSelectedState() {
          return this.$store.state.heroes.heroes[this.hero.key].selected
        }
      },
      methods: {
        toggleHeroAction: function (event) {
          toggleHero(this.hero.key);
        }
      },
    }
</script>

<style scoped>
  .hero-card {
    display: inline-flex;
    margin: 0.25em;
    width: 13em;
    background-color: #0192c7;
    align-items: center;
    cursor: pointer;
  }


  .hero-card.selected {
    background-color: green;
  }

  .hero-card:hover {
    box-shadow: 0px 0px 0.5em #21c0fa;
  }

  .hero-card:active {
    transform: translate(1px, 1px);
  }

  /*  ------- */

  .hero-image {
    height: 3em;
    vertical-align: bottom;
    background: black;
  }

  /*  ------- */

  .hero-name {
    min-height: 100%;
    padding: 0 0.2em;
    font-size: 2em;
    white-space: nowrap;
    outline: none;
  }

  /*  ------- */

  @media (max-width: 1375px) {
    .hero-card {
      width: 13em;
    }
    .hero-name {
      font-size: 1.75em;
    }
    .hero-image {
      height: 2.75em;
    }
  }

  @media (max-width: 1090px) {
    .hero-card {
      width: 12em;
    }
    .hero-name {
      font-size: 1.75em;
    }
    .hero-image {
      height: 2.75em;
    }
  }

  @media (max-width: 710px) {
    .hero-image {
      height: 2.75em;
    }
  }

  @media (max-width: 420px) {
    .hero-card {
      width: 100%;
    }
  }

  @media (max-width: 320px) {
    .hero-card {
      width: 100%;
    }
    .hero-name {
      font-size: 1.5em;
    }
  }
</style>
