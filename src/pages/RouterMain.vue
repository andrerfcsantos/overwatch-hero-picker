<template>
  <div>
    <Navbar />
    <router-view />
    <footer>
      <div class="container text-center">
        <p>
          <small>
            This is a fan-site for Overwatch and it is not in any way associated
            with Blizzard Entertainment
          </small>
        </p>
      </div>
    </footer>
  </div>
</template>

<script>
import Navbar from "../components/Navbar";

export default {
  name: "PickerPage",
  components: {
    Navbar,
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
span,
span a {
  font-family: Arial, Helvetica, sans-serif;
}

p {
  font-size: 1.25em;
  margin-bottom: 0.15em;
}

footer {
  color: grey;
}

@media (max-width: 1220px) {
  footer {
    margin-top: 5em;
  }
}
</style>
