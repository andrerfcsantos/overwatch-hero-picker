import Vue from "vue";
import Vuex from "vuex";
import heroes from "./modules/heroes.js";

Vue.use(Vuex);

const debug = process.env.NODE_ENV !== "production";

export default new Vuex.Store({
  modules: {
    heroes,
  },
  strict: debug,
});
