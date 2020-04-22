import Vue from "vue";
import App from "./App.vue";
import VueLocalStorage from "vue-localstorage";
import { BootstrapVue } from "bootstrap-vue";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue/dist/bootstrap-vue.css";
import "es6-promise/auto";
import store from "./store";
import VueRouter from "vue-router";
import { routes } from "./router/routes";

Vue.config.productionTip = false;

// Install BootstrapVue
Vue.use(BootstrapVue);
// Vue router
Vue.use(VueRouter);

const router = new VueRouter({
  routes,
});

// Use localstorage and create computed members
Vue.use(VueLocalStorage, {
  bind: true,
});

// Local storage old keys cleanup
let old_keys = ["someNumber"];
old_keys.forEach((key) => localStorage.removeItem(key));

new Vue({
  render: (h) => h(App),
  router,
  store,
}).$mount("#app");
