<template>
  <nav
    class="navbar navbar-expand-md navbar-dark bg-dark align-items-center justify-content-between m-0"
  >
    <!-- left column -->
    <div class="nav-item">
      <router-link to="/">
        <img
          class="ow-logo img-fluid"
          src="../../public/assets/imgs/navbar/ow-logo.svg"
        />
        <span class="title-text">Overwatch Hero Picker</span>
      </router-link>
    </div>

    <div class="nav-item">
      <router-link to="/about">
        <img
          src="../../public/assets/imgs/navbar/icons8-info.svg"
          alt="about"
        />
      </router-link>
      <a
        href="https://github.com/andrerfcsantos/overwatch-hero-picker"
        target="_blank"
      >
        <img
          src="../../public/assets/imgs/navbar/icons8-github.svg"
          alt="github"
        />
      </a>
    </div>
  </nav>
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
a:hover {
  text-decoration: none !important;
  color: white;
}

nav {
  color: white;
  min-height: 5vh;
}

.title-text {
  font-size: 1.5rem;
  text-decoration: none;
}

img {
  max-height: 2em;
}

.ow-logo {
  padding-right: 0.5em;
}
</style>
