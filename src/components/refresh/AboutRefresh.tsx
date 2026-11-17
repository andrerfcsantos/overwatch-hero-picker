import FeedbackBanner from "./FeedbackBanner";
import ui from "./ui.module.css";
import styles from "./AboutRefresh.module.css";

const DISCORD_URL = "https://discord.gg/rwQMrCa";
const DONATE_URL = "https://www.buymeacoffee.com/heropickers";

/**
 * The about page in the new design. Unlike the picker it has nothing to keep
 * in reach while it is read, so it is one column read from the top: what the
 * site is, why it exists, how to reach and support it, and the fine print.
 *
 * `only-refresh` keeps it out of the classic design (see the page).
 */
export default function AboutRefresh() {
  return (
    <main className={`only-refresh ${ui.page} ${styles.app}`}>
      <article className={styles.column}>
        <FeedbackBanner />

        <header className={styles.intro}>
          <h1 className={styles.title}>About this site</h1>
          <p className={styles.subtitle}>
            A fan-made random hero picker for Overwatch.
          </p>
        </header>

        <section className={styles.section} aria-labelledby="about-what">
          <h2 id="about-what" className={styles.heading}>
            What is it for?
          </h2>
          <p>
            In Overwatch, there are moments when you don&apos;t know which hero
            you want to play. At those moments, sometimes you wish a hero could
            be chosen for you at random. But even when you don&apos;t know what
            you want to play, you often have a good idea of what you{" "}
            <em>don&apos;t</em> want to play.
          </p>
          <p>
            This site was built to help you in those moments. It allows you to
            get a random hero to play, but only from a selection of heroes you
            actually want to play with. It&apos;s Mystery Heroes, but with your
            own rules.
          </p>
          <p>
            Use it to encourage you to practice new heroes, diversify the heroes
            you play in a session, or just to make every game mode be Mystery
            Heroes.
          </p>
        </section>

        <section className={styles.section} aria-labelledby="about-why">
          <h2 id="about-why" className={styles.heading}>
            Why another hero picker?
          </h2>
          <p>
            There are other random hero pickers for Overwatch. Most of the ones
            I found were either too simple, with no way to choose which heroes
            are in the running, or too complicated. With this one I tried to
            make something simple that is still useful.
          </p>
        </section>

        <section className={styles.section} aria-labelledby="about-contact">
          <h2 id="about-contact" className={styles.heading}>
            Get in touch
          </h2>
          <p>
            Feedback, ideas and bug reports are welcome on Discord, or by email
            at heropickers [at] gmail [dot] com.
          </p>
          <a
            className={`${ui.btn} ${styles.action}`}
            href={DISCORD_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            Join the Discord
          </a>
        </section>

        <section className={styles.section} aria-labelledby="about-support">
          <h2 id="about-support" className={styles.heading}>
            Support us
          </h2>
          <p>
            The site is free and has no ads. Donations cover what it costs to
            keep it up, as a one-time gift or a monthly one.
          </p>
          <a
            className={`${ui.btn} ${styles.action}`}
            href={DONATE_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            Buy me a coffee
          </a>
        </section>

        <section className={styles.section} aria-labelledby="about-others">
          <h2 id="about-others" className={styles.heading}>
            Other pickers
          </h2>
          <p>
            This site is part of{" "}
            <a href="https://heropickers.com" target="_blank" rel="noopener">
              Hero Pickers
            </a>
            , which is also home to the{" "}
            <a
              href="https://www.valorantpicker.com"
              target="_blank"
              rel="noopener"
            >
              Valorant Agent Picker
            </a>
            : the same idea, for Valorant.
          </p>
          <p>
            This site follows the current game, which brought in new heroes and
            changed the role of some existing ones. The picker for Overwatch 1
            is still online at{" "}
            <a href="https://ow1.owheropicker.com">ow1.owheropicker.com</a>.
          </p>
        </section>

        <footer className={styles.fine} aria-labelledby="about-disclaimer">
          <h2 id="about-disclaimer" className={styles.fineTitle}>
            Disclaimer
          </h2>
          <p>
            This is a fan site for Overwatch and is not affiliated with Blizzard
            Entertainment. All rights belong to their respective owners. These
            are the relevant copyright notices.
          </p>
          <p>
            <strong>Blizzard Entertainment&reg;</strong> &reg;2016 Blizzard
            Entertainment, Inc. All rights reserved. Overwatch is a trademark or
            registered trademark of Blizzard Entertainment, Inc. in the U.S.
            and/or other countries.
          </p>
          <p>
            <strong>Overwatch&trade;</strong> Overwatch&trade;&reg;2016 Blizzard
            Entertainment, Inc. All rights reserved. Overwatch is a trademark or
            registered trademark of Blizzard Entertainment, Inc. in the U.S.
            and/or other countries.
          </p>
        </footer>
      </article>
    </main>
  );
}
