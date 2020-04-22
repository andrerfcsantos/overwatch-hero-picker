<template>
  <div id="app" class="container-fluid">
    <PickerPage />
  </div>
</template>

<script>
import PickerPage from "./pages/RouterMain";

export default {
  name: "App",
  components: {
    PickerPage,
  },
};
</script>

<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin: 0;
  padding: 0;
  background-color: #2c3e50;
}

html {
  background-color: #2c3e50;
}

body {
  margin: 0;
  padding: 0;
  overflow-x: hidden;
}

* {
  font-family: "Big Noodle Titling", Arial, Helvetica, sans-serif;
}

@font-face {
  font-family: "Big Noodle Titling";
  src: local("Big Noodle Titling"),
    url("../public/assets/fonts/big_noodle_titling-webfont.woff2")
      format("woff2"),
    url("../public/assets/fonts/big_noodle_titling-webfont.woff") format("woff"),
    url("../public/assets/fonts/big_noodle_titling-webfont.ttf")
      format("truetype"),
    url("../public/assets/fonts/big_noodle_titling-webfont.svg#bignoodletitlingregular")
      format("svg");
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}

.unselectable {
  -moz-user-select: none;
  -khtml-user-select: none;
  -webkit-user-select: none;
  -o-user-select: none;
  user-select: none;
}
</style>
