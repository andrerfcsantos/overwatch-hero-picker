import Vue from "vue";
import App from "./App.vue";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue/dist/bootstrap-vue.css";
import "es6-promise/auto";
import store from "./store";
import VueRouter from "vue-router";
import { routes } from "./router/routes";
import { NavbarPlugin } from "bootstrap-vue";
import Clipboard from "v-clipboard";
import { inject } from "@vercel/analytics";

inject();

Vue.config.productionTip = false;

// Vue router
Vue.use(VueRouter);
Vue.use(NavbarPlugin);
Vue.use(Clipboard);

const router = new VueRouter({
  routes,
});

// Local storage old keys cleanup
let old_keys = ["someNumber", "alertDismissed"];
old_keys.forEach((key) => localStorage.removeItem(key));

new Vue({
  render: (h) => h(App),
  router,
  store,
}).$mount("#app");
