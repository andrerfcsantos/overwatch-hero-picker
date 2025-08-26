'use client';

import { useState, useEffect } from 'react';
import { Hero, HeroRole } from '@/types/heroes';
import { useHeroes } from '@/hooks/useHeroes';
import HeroCard from './HeroCard';
import Image from 'next/image';
import Link from 'next/link';

export default function PickerContent() {
  const {
    toggleHero,
    selectByRole,
    unselectByRole,
    selectJustRole,
    getHeroesByRole,
    getSelectedHeroes,
    getRandomHero,
    getRandomHeroPerks,
  } = useHeroes();

  const [selectedHero, setSelectedHero] = useState<Hero | null>(null);
  const [perks, setPerks] = useState<[string, string]>(['', '']);
  const [heroCount, setHeroCount] = useState(0);
  const [showPortrait, setShowPortrait] = useState(true);
  const [showPerks, setShowPerks] = useState(true);

  // Load preferences from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedShowPortrait = localStorage.getItem('showPortrait');
      const savedShowPerks = localStorage.getItem('showPerks');

      if (savedShowPortrait !== null) {
        setShowPortrait(savedShowPortrait === 'true');
      }

      if (savedShowPerks !== null) {
        setShowPerks(savedShowPerks === 'true');
      }

      // Set initial random hero
      const randomHero = getRandomHero();
      setSelectedHero(randomHero);
      if (randomHero) {
        setPerks(getRandomHeroPerks(randomHero.key));
      }
    }
  }, [getRandomHero, getRandomHeroPerks]);

  // Save preferences to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('showPortrait', showPortrait.toString());
    }
  }, [showPortrait]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('showPerks', showPerks.toString());
    }
  }, [showPerks]);

  const handleRandomHero = () => {
    const newHero = getRandomHero();
    setSelectedHero(newHero);
    setHeroCount(prev => prev + 1);
    if (newHero) {
      setPerks(getRandomHeroPerks(newHero.key));
    }
  };

  const handleRandomPerks = () => {
    if (selectedHero) {
      setPerks(getRandomHeroPerks(selectedHero.key));
    }
  };

  const selectedHeroes = getSelectedHeroes();
  const numberOfSelectedHeroes = selectedHeroes.length;

  const roleButtons = (
    role: HeroRole,
    roleDisplayName: string,
    roleIcon: string
  ) => (
    <div className="flex items-center mb-4">
      <Image
        src={roleIcon}
        alt={`${roleDisplayName} role icon`}
        width={32}
        height={32}
        className="max-h-8 mr-2"
        unoptimized
      />
      <h2 className="text-2xl mr-4">{roleDisplayName}</h2>
      <button
        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 mx-1 text-lg transform -skew-x-3 hover:cursor-pointer active:translate-x-px active:translate-y-px"
        onClick={() => selectByRole(role)}
      >
        Select All
      </button>
      <button
        className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 mx-1 text-lg transform -skew-x-3 hover:cursor-pointer active:translate-x-px active:translate-y-px"
        onClick={() => unselectByRole(role)}
      >
        Unselect All
      </button>
      <button
        className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 mx-1 text-lg transform -skew-x-3 hover:cursor-pointer active:translate-x-px active:translate-y-px"
        onClick={() => selectJustRole(role)}
      >
        Just this role
      </button>
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row w-full min-h-screen p-0 m-0 bg-primary text-white unselectable">
      {/* Left Content */}
      <div className="flex flex-col lg:w-1/4 px-6 py-4">
        <h1 className="text-3xl mb-4 underline">You should play</h1>

        <div className="mb-4">
          <label className="inline-flex items-center mr-4">
            <input
              type="checkbox"
              checked={showPortrait}
              onChange={e => setShowPortrait(e.target.checked)}
              className="mr-2"
            />
            <span>Show hero portrait</span>
          </label>

          <label className="inline-flex items-center">
            <input
              type="checkbox"
              checked={showPerks}
              onChange={e => setShowPerks(e.target.checked)}
              className="mr-2"
            />
            <span>Randomize perks</span>
          </label>
        </div>

        {showPortrait && selectedHero && (
          <Image
            src={`/assets/imgs/heroes/portraits/${selectedHero.key}.png`}
            alt={`${selectedHero.name} portrait`}
            width={200}
            height={200}
            className="max-w-3/4 mx-auto mb-4"
            unoptimized
          />
        )}

        {selectedHero && (
          <div
            key={`hero-name-${selectedHero.name}-${heroCount}`}
            className="mb-4"
          >
            <h2 className="text-2xl font-bold">
              {selectedHero.name}
              {showPerks && (
                <div className="text-base leading-tight mt-2">
                  <span className="text-sm">
                    {perks[0]} | {perks[1]}
                  </span>
                  <br />
                  <span
                    className="text-base text-orange-600 underline cursor-pointer hover:text-orange-500"
                    onClick={handleRandomPerks}
                  >
                    New perks
                  </span>
                </div>
              )}
            </h2>
          </div>
        )}

        <button
          className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded text-xl"
          onClick={handleRandomHero}
        >
          Get Random Hero
        </button>
      </div>

      {/* Right Content */}
      <div className="lg:w-3/4 px-6 py-4 text-left lg:text-left text-center">
        <h1 className="text-3xl mb-4 underline">Filter Heroes</h1>

        <p className="text-base font-bold mb-2">
          Select the heroes you wish to play and click in the &quot;Get Random
          Hero&quot; button to get a random hero from the selected ones.
        </p>

        <p className="text-base font-bold mb-4">
          Playing as a group?{' '}
          <Link
            href="/squad"
            className="text-orange-500 underline hover:text-orange-600"
          >
            Get random heroes for your team
          </Link>
        </p>

        <div className="text-lg text-orange-500 font-bold mb-4">
          {numberOfSelectedHeroes === 0 && (
            <p>
              You have no heroes selected, so all heroes are being considered by
              default.
            </p>
          )}
          {numberOfSelectedHeroes === 1 && (
            <p>You have {numberOfSelectedHeroes} hero selected.</p>
          )}
          {numberOfSelectedHeroes > 1 && (
            <p>You have {numberOfSelectedHeroes} heroes selected.</p>
          )}
        </div>

        {/* Tank Heroes */}
        {roleButtons('TANK', 'Tank', '/assets/imgs/roles/tank.png')}
        <div className="flex flex-wrap justify-start mb-6">
          {getHeroesByRole('TANK').map(hero => (
            <HeroCard key={hero.key} hero={hero} onToggle={toggleHero} />
          ))}
        </div>

        {/* Damage Heroes */}
        {roleButtons('DAMAGE', 'Damage', '/assets/imgs/roles/damage.png')}
        <div className="flex flex-wrap justify-start mb-6">
          {getHeroesByRole('DAMAGE').map(hero => (
            <HeroCard key={hero.key} hero={hero} onToggle={toggleHero} />
          ))}
        </div>

        {/* Support Heroes */}
        {roleButtons('SUPPORT', 'Support', '/assets/imgs/roles/support.png')}
        <div className="flex flex-wrap justify-start mb-6">
          {getHeroesByRole('SUPPORT').map(hero => (
            <HeroCard key={hero.key} hero={hero} onToggle={toggleHero} />
          ))}
        </div>
      </div>
    </div>
  );
}
