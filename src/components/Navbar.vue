<template>
  <b-navbar toggleable="lg" type="dark" variant="dark">
    <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

    <b-collapse id="nav-collapse" is-nav>
      <b-navbar-brand to="/">
        <img class="ow-logo img-fluid" src="assets/imgs/navbar/ow2-logo.png" />
        <span class="title-text">Overwatch 2 Hero Picker</span>
      </b-navbar-brand>
      <!-- Right aligned nav items -->
      <b-navbar-nav class="ml-auto">
        <b-nav-item to="/about">About</b-nav-item>
        <b-nav-item
          href="https://github.com/andrerfcsantos/overwatch-hero-picker"
          target="_blank"
        >
          Github
        </b-nav-item>
        <b-nav-item
          href="https://www.buymeacoffee.com/heropickers"
          target="_blank"
        >
          <img class="bmc-logo img-fluid" src="assets/imgs/navbar/bmc.svg" />
        </b-nav-item>
      </b-navbar-nav>
    </b-collapse>
  </b-navbar>
</template>

<script>
export default {
  name: "Navbar",
};
</script>

<style scoped>
a,
a:active,
a:focus,
a:hover,
a:visited,
a:visited:hover {
  text-decoration: none !important;
  color: white;
}

b-navbar {
  min-height: 5vh;
}

.title-text {
  font-size: 1.5rem;
  text-decoration: none;
}

li {
  font-size: 1.25em;
}

img {
  max-height: 2em;
}

img.bmc-logo {
  height: 1.5em;
  max-height: initial;
}

.ow-logo {
  padding-right: 0.5em;
}

.separator {
  color: grey;
}
</style>
