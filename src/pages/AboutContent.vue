<template>
  <div class="about-main-container col-10">
    <h2 class="title">About this site</h2>

    <p class="paragraph-text">
      When playing Overwatch, we all had those moments where we are unsure about
      which hero to play.
    </p>

    <p class="paragraph-text">
      In those moments you may want a hero to be chosen for you! But more often
      than not, you don't want the hero chosen to be completely random. It would
      be nice if the random selection was between heroes you actually want to
      play.
    </p>

    <p class="paragraph-text">
      That's where this site comes in. Using this hero picker you can select the
      heroes you want to play and get a random one from the selection. You can
      also use this site as a way to get new heroes to try/improve, a bit like
      the "mystery heroes" game mode.
    </p>

    <h2 class="title">Why another Hero Picker?</h2>

    <p class="paragraph-text">
      There are several other random hero pickers/generators for Overwatch, but
      I found most of them too be either too simple - without the option to
      filter heroes - or too complicated. With this hero picker, I tried to make
      something simple but useful.
    </p>

    <h2 class="title">Discord</h2>

    <p class="paragraph-text">
      Join the discord server:
      <a href="https://discord.gg/rwQMrCa">https://discord.gg/rwQMrCa</a>
    </p>

    <h2 class="title">Overwatch 1 Legacy Site</h2>

    <p class="paragraph-text">
      The current site is for Overwatch 2 which introduced new heroes and
      changed the role of some existing ones. If you want to access the site for
      Overwatch 1, it is still accessible at <a href="https://ow1.owheropicker.com">ow1.owheropicker.com</a>
    </p>

    <h2 class="title">Donate</h2>

    <p class="paragraph-text">
      If you like this project, consider making a donation by clicking on the
      image below (or
      <a href="https://www.buymeacoffee.com/heropickers" target="_blank">here</a
      >)! You can choose to make a one-time donation or become a member and
      donate monthly/anually. The money will be used to cover the costs of
      keeping the site up, free for everyone and with no ads.
    </p>

    <a href="https://www.buymeacoffee.com/heropickers" target="_blank">
      <img
        class="bmc-logo img-fluid"
        src="../../public/assets/imgs/navbar/bmc.svg"
      />
    </a>

    <h2 class="title disclaimer-header">Contact me</h2>

    <p class="paragraph-text">
      If you have feedback, suggestions, comments about the site or you just
      want to say something to me, reach out at heropickers [at] gmail [dot]
      com. You can also contact me via the
      <a href="https://discord.gg/rwQMrCa">discord server</a>.
    </p>

    <h2 class="title disclaimer-header">Disclaimer</h2>

    <p class="paragraph-text">
      This is a fan-site for Overwatch and it is not affiliated with Blizzard
      Entertainment. All rights belong to their respective owners. Below are the
      relevant copyright notices:
    </p>

    <h3 class="copyright-notice-header">Blizzard Entertainment®</h3>
    <p class="paragraph-text copyright-notice">
      ®2016 Blizzard Entertainment, Inc. All rights reserved. Overwatch is a
      trademark or registered trademark of Blizzard Entertainment, Inc. in the
      U.S. and/or other countries.
    </p>

    <h3 class="copyright-notice-header">Overwatch™</h3>

    <p class="paragraph-text copyright-notice">
      Overwatch™®2016 Blizzard Entertainment, Inc. All rights reserved.
      Overwatch is a trademark or registered trademark of Blizzard
      Entertainment, Inc. in the U.S. and/or other countries.
    </p>
  </div>
</template>

<script>
import { sendEvent } from "../services/events";

export default {
  name: "AboutContent",
  created() {
    window.document.title = "About - Overwatch Hero Picker";
    sendEvent("Page", "Visit", "About");
  },
};
</script>

<style scoped>
p,
.copyright-notice-header {
  text-align: start;
}

a {
  font-family: inherit;
}

/* unvisited link */
a:link {
  color: orange;
}

/* visited link */
a:visited {
  color: orange;
}

/* mouse over link */
a:hover {
  color: orange;
}

/* selected link */
a:active {
  color: orange;
}

.about-main-container {
  color: white;
  display: flex;
  flex-direction: column;
  max-width: 100%;
  padding-left: 20%;
  padding-right: 20%;
  padding-top: 2em;
  margin-bottom: 3em;
}

@media (max-width: 1000px) {
  .about-main-container {
    max-width: 100%;
    padding-left: 1.5em;
    padding-right: 1.5em;
  }
}

.title {
  color: rgb(248, 158, 74);
  text-decoration: underline;
  text-align: start;
}

.paragraph-text {
  font-size: 1.1em;
  font-family: Verdana, Geneva, Tahoma, sans-serif;
}

.copyright-notice {
  font-family: Arial, Helvetica, sans-serif;
  font-size: 0.9em;
}

.copyright-notice-header {
  font-family: Arial, Helvetica, sans-serif;
  font-size: 1em;
  font-weight: bold;
}

img {
  width: 20em;
}
</style>
