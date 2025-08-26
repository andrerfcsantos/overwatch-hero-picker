'use client';

import { Hero } from '@/types/heroes';
import Image from 'next/image';

interface HeroCardProps {
  hero: Hero;
  onToggle: (heroKey: string) => void;
}

export default function HeroCard({ hero, onToggle }: HeroCardProps) {
  const handleClick = () => {
    onToggle(hero.key);
  };

  return (
    <div
      className={`
        inline-flex items-center m-1 w-48 h-10 cursor-pointer
        transition-all duration-200 ease-in-out
        ${
          hero.selected
            ? 'bg-green-600 hover:bg-green-700'
            : 'bg-blue-600 hover:bg-blue-700'
        }
        hover:shadow-lg hover:shadow-blue-300/50
        active:translate-x-px active:translate-y-px
        font-overwatch text-white
        lg:w-52 md:w-48 sm:w-full
      `}
      onClick={handleClick}
    >
      <Image
        src={`/assets/imgs/heroes/icons/${hero.key}.png`}
        alt={`${hero.name} icon`}
        width={40}
        height={40}
        className="h-10 bg-gray-700"
        unoptimized
      />
      <div className="px-2 text-xl md:text-2xl whitespace-nowrap overflow-hidden text-ellipsis">
        {hero.name}
      </div>
    </div>
  );
}
