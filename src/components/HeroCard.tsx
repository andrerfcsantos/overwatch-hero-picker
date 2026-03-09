"use client";

import { Hero } from "@/types/hero";
import { useHeroes } from "@/context/HeroContext";
import SpriteIcon from "@/components/SpriteIcon";

interface HeroCardProps {
  hero: Hero;
}

export default function HeroCard({ hero }: HeroCardProps) {
  const { getHeroSelected, toggleHero } = useHeroes();
  const selected = getHeroSelected(hero.key);

  return (
    <div
      className={`hero-card ${selected ? "selected" : ""}`}
      onClick={() => toggleHero(hero.key)}
    >
      <SpriteIcon
        className="hero-card-image"
        heroKey={hero.key}
        type="icon"
        alt={`${hero.name} icon`}
      />
      <div className="hero-card-name">{hero.name}</div>
    </div>
  );
}
