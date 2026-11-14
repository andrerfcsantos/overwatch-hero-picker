import { Hero } from "@/types/hero";
import RoleSpriteIcon from "./RoleSpriteIcon";
import SpriteIcon from "./SpriteIcon";
import styles from "./OverlayContent.module.css";

interface OverlayCardProps {
  hero: Hero;
  /** Null when the link leaves perks off. */
  perks: { minor: string; major: string } | null;
  showPortrait: boolean;
  /** The new design's card; it has to sit inside an element with `refresh`. */
  refresh: boolean;
}

/**
 * The card the stream overlay draws. Its sizes are multiples of `--u`, so it
 * has to sit inside an element that sets it: the overlay page's root, or the
 * setup panel's preview (`scaled`). Being one component, the preview cannot
 * drift from what OBS will show.
 */
export default function OverlayCard({
  hero,
  perks,
  showPortrait,
  refresh,
}: OverlayCardProps) {
  return (
    <div className={styles.card} data-hero={hero.key}>
      {showPortrait && (
        <SpriteIcon
          heroKey={hero.key}
          type="portrait"
          className={styles.portrait}
          alt={`${hero.name} portrait`}
        />
      )}
      <div className={styles.text}>
        <span className={styles.label}>Random hero</span>
        <span className={styles.name}>
          <RoleSpriteIcon
            roleKey={hero.role}
            alt={hero.role}
            className={styles.roleIcon}
          />
          {hero.name}
        </span>
        {perks &&
          (refresh ? (
            // Named rather than colour-coded, as on the site.
            <dl className={styles.perkList}>
              <dt>Minor</dt>
              <dd>{perks.minor}</dd>
              <dt>Major</dt>
              <dd>{perks.major}</dd>
            </dl>
          ) : (
            <span className={styles.perks}>
              <span className={styles.minorPerk}>{perks.minor}</span>
              <span className={styles.perkDivider}>|</span>
              <span className={styles.majorPerk}>{perks.major}</span>
            </span>
          ))}
      </div>
    </div>
  );
}
