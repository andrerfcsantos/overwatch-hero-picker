<template>
  <div class="about-main-container col-10">
    <h2 class="title">
      About this site
    </h2>

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
      That's where this site comes in. Just select the heroes you want to play
      and get a random one from that selection. You can also use this site to
      select heroes you are not confortable playing and get a random one to
      try/improve.
    </p>

    <h2 class="title">
      Why another Hero Picker?
    </h2>

    <p class="paragraph-text">
      There are several other random hero pickers/generators for Overwatch, but
      I found most of them too be either too simple - without the option to
      filter heroes - or too complicated. With this hero picker, I tried to make
      something simple but useful.
    </p>

    <p class="paragraph-text">
      The majority of other hero pickers I tried also have ads. This is an
      annoyance, especially on mobile devices. To ensure the smoothest
      experience possible, this site has no ads and I have no intention to add
      them in the future.
    </p>

    <h2 class="title">
      Donate
    </h2>

    <p class="paragraph-text">
      If you like this project, consider making a donation! This helps me cover
      the maintenance costs of the server and keep the site up. When donating,
      you can choose to which part of the site your money should go to. You can
      also give me a tip and and suggest where I should spend the money. I'll do
      my best to honor your request :)
    </p>

    <form
      action="https://www.paypal.com/cgi-bin/webscr"
      method="post"
      target="_top"
    >
      <input type="hidden" name="cmd" value="_s-xclick" />
      <input type="hidden" name="hosted_button_id" value="DQ3Y6X8C8V4BA" />
      <input
        type="image"
        src="https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif"
        border="0"
        name="submit"
        title="PayPal - The safer, easier way to pay online!"
        alt="Donate with PayPal button"
      />
      <img
        alt=""
        border="0"
        src="https://www.paypal.com/en_PT/i/scr/pixel.gif"
        width="1"
        height="1"
      />
    </form>

    <h2 class="title disclaimer-header">
      Contact me
    </h2>

    <p class="paragraph-text">
      If you have feedback, suggestions, comments about the site or you just
      want to say something to me, reach out at owheropicker [at] gmail [dot]
      com
    </p>

    <h2 class="title disclaimer-header">
      Disclaimer
    </h2>

    <p class="paragraph-text">
      This is a fan-site for Overwatch and it's not in any way affilliated with
      Blizzard Entertainment. All rights belong to their respective owners.
    </p>

    <p class="paragraph-text copyright-notice">
      ®2016 Blizzard Entertainment, Inc. All rights reserved. Overwatch is a
      trademark or registered trademark of Blizzard Entertainment, Inc. in the
      U.S. and/or other countries.
    </p>
  </div>
</template>

<script>
export default {
  name: "AboutContent"
};
</script>

<style scoped>
p {
  text-align: start;
}

.about-main-container {
  color: white;
  display: flex;
  flex-direction: column;
}

@media (max-width: 1000px) {
  .about-main-container {
    max-width: 100%;
  }
}

.title {
  color: rgb(248, 158, 74);
  text-decoration: underline;
}

.paragraph-text {
  font-size: 1.1em;
  font-family: Verdana, Geneva, Tahoma, sans-serif;
}

.copyright-notice {
  font-family: Arial, Helvetica, sans-serif;
}

form {
  text-align: center;
}
</style>
