import SpriteIcon from "@/components/SpriteIcon";
import FeedbackBanner from "./FeedbackBanner";
import ui from "./ui.module.css";
import styles from "./AboutRefresh.module.css";

const DISCORD_URL = "https://discord.gg/rwQMrCa";
const DONATE_URL = "https://www.buymeacoffee.com/heropickers";

type FaceState = "in" | "out" | "rolled";

/**
 * The site's idea drawn in its own terms: a pool with some heroes in and some
 * left out, and the roll landing on one of the heroes that are in.
 */
const EXAMPLE_POOL: { key: string; state: FaceState }[] = [
  { key: "reinhardt", state: "in" },
  { key: "tracer", state: "out" },
  { key: "ana", state: "in" },
  { key: "kiriko", state: "rolled" },
  { key: "genji", state: "out" },
  { key: "winston", state: "in" },
];

const LEGEND: { state: FaceState; label: string }[] = [
  { state: "in", label: "In your pool" },
  { state: "out", label: "Left out" },
  { state: "rolled", label: "The roll" },
];

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
          <h1 className={styles.title}>
            <span className={styles.eyebrow}>About this site</span>
            <span className={styles.thesis}>
              A random hero, from the ones you want to play
            </span>
          </h1>

          <figure className={styles.figure}>
            <div
              className={styles.pool}
              // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- six slices of a sprite sheet that make one picture
              role="img"
              aria-label="A pool of six heroes. Four are in it and two are left out. One of the four has been rolled."
            >
              {EXAMPLE_POOL.map(({ key, state }) => (
                <span key={key} className={`${styles.face} ${styles[state]}`}>
                  <SpriteIcon
                    heroKey={key}
                    type="icon"
                    alt=""
                    className={styles.faceImage}
                  />
                </span>
              ))}
            </div>
            <figcaption className={styles.legend}>
              {LEGEND.map(({ state, label }) => (
                <span key={state} className={styles.legendItem}>
                  <span
                    className={`${styles.swatch} ${styles[state]}`}
                    aria-hidden="true"
                  />
                  {label}
                </span>
              ))}
            </figcaption>
          </figure>
        </header>

        <section className={styles.section} aria-labelledby="about-what">
          <h2 id="about-what" className={styles.heading}>
            What it&apos;s for
          </h2>
          <p>
            Everyone who plays Overwatch knows the moment: the match is about to
            start, and you still don&apos;t know who to play.
          </p>
          <p>
            You could leave it to chance. But a hero drawn from the whole roster
            is often one you have no wish to play, so the choice should only be
            random among the heroes you&apos;d be happy with.
          </p>
          <p>
            That is what this site does. Put the heroes you want in the pool and
            roll, and you get one of them. It also works as a way to find
            someone new to try or to get better at, a bit like the Mystery
            Heroes game mode.
          </p>
        </section>

        <section className={styles.section} aria-labelledby="about-why">
          <h2 id="about-why" className={styles.heading}>
            Why another hero picker
          </h2>
          <p>
            There are other random hero pickers for Overwatch. Most of the ones
            I found were either too simple, with no way to choose which heroes
            are in the running, or too complicated. With this one I tried to
            make something simple that is still useful.
          </p>
        </section>

        <section className={styles.section} aria-labelledby="about-reach">
          <h2 id="about-reach" className={styles.heading}>
            Get in touch, or help out
          </h2>
          <div className={styles.cards}>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Feedback</h3>
              <p>
                Ideas and bug reports are welcome on Discord, or by email at
                heropickers [at] gmail [dot] com.
              </p>
              <a
                className={ui.btn}
                href={DISCORD_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                Join the Discord
              </a>
            </div>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Support</h3>
              <p>
                The site is free and has no ads. Donations cover what it costs
                to keep it up, as a one-time gift or a monthly one.
              </p>
              <a
                className={ui.btn}
                href={DONATE_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                Buy me a coffee
              </a>
            </div>
          </div>
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
