<template>
  <div>
    <Navbar />
    <b-alert show dismissible fade variant="success">
      <span
        >Overwatch Hero Picker now has a new look! I would love to hear your
        thoughts, please send any feedback to owheropicker@gmail.com. You can
        still visit the old version
        <a href="https://legacy.owheropicker.com">here</a>.</span
      >
    </b-alert>
    <router-view />
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
#picker-page-container {
  padding: 0;
}
</style>
