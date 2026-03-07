"use client";

import { Hero } from "@/types/hero";
import { useHeroes } from "@/context/HeroContext";

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
      <img
        className="hero-card-image"
        alt={`${hero.name} icon`}
        src={`/assets/imgs/heroes/icons/${hero.key}.png`}
      />
      <div className="hero-card-name">{hero.name}</div>
    </div>
  );
}
