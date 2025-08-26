'use client';

import { useState, useEffect } from 'react';
import { Hero } from '@/types/heroes';
import { useHeroes } from '@/hooks/useHeroes';
import HeroCard from '@/components/HeroCard';
import Image from 'next/image';
import Link from 'next/link';

interface Squad {
  tanks: Hero[];
  damage: Hero[];
  supports: Hero[];
}

export default function SquadPage() {
  const {
    toggleHero,
    selectByRole,
    unselectByRole,
    selectJustRole,
    getHeroesByRole,
    getSelectedHeroes,
    getRandomSquad,
    getRandomSquadClassic,
  } = useHeroes();

  const [squad, setSquad] = useState<Squad>({
    tanks: [],
    damage: [],
    supports: [],
  });
  const [force122, setForce122] = useState(true);
  const [copyButtonText, setCopyButtonText] = useState('Copy to clipboard');

  useEffect(() => {
    // Set page title
    document.title = 'Team Generator | Overwatch 2 Random Hero Picker';

    // Generate initial squad
    handleRandomSquad();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRandomSquad = () => {
    const newSquad = force122 ? getRandomSquad() : getRandomSquadClassic();
    setSquad(newSquad);
  };

  const handleCopyToClipboard = async () => {
    const allHeroes = [
      ...squad.tanks.map(h => h.name),
      ...squad.damage.map(h => h.name),
      ...squad.supports.map(h => h.name),
    ];

    const text = allHeroes.join(' | ');

    try {
      await navigator.clipboard.writeText(text);
      setCopyButtonText('Copied!');
      setTimeout(() => {
        setCopyButtonText('Copy to clipboard');
      }, 1500);
    } catch (err) {
      setCopyButtonText('Error copying :(');
      setTimeout(() => {
        setCopyButtonText('Copy to clipboard');
      }, 1500);
    }
  };

  const selectedHeroes = getSelectedHeroes();
  const numberOfSelectedHeroes = selectedHeroes.length;

  const roleButtons = (
    role: 'TANK' | 'DAMAGE' | 'SUPPORT',
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

  const SquadList = ({
    heroes,
    roleIcon,
    roleName,
  }: {
    heroes: Hero[];
    roleIcon: string;
    roleName: string;
  }) => (
    <ul className="list-none mb-4">
      {heroes.map(hero => (
        <li key={hero.key} className="flex items-center mb-2">
          <Image
            src={roleIcon}
            alt={`${roleName} role icon`}
            width={32}
            height={32}
            className="max-h-8 mr-2"
            unoptimized
          />
          <Image
            src={`/assets/imgs/heroes/icons/${hero.key}.png`}
            alt={`${hero.name} icon`}
            width={32}
            height={32}
            className="max-h-8 mr-2"
            unoptimized
          />
          <span className="text-2xl align-middle">{hero.name}</span>
        </li>
      ))}
    </ul>
  );

  return (
    <div className="flex flex-col lg:flex-row w-full min-h-screen p-0 m-0 bg-primary text-white unselectable">
      {/* Left Content */}
      <div className="flex flex-col lg:w-1/4 px-6 py-4">
        <h1 className="text-3xl mb-4 underline">Team Generator</h1>

        <div className="text-left mb-6">
          <div className="text-center text-xl mb-4">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={force122}
                onChange={e => setForce122(e.target.checked)}
                className="mr-2"
              />
              <span>Force 1-2-2</span>
            </label>
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 ml-2 text-base transform -skew-x-3 hover:cursor-pointer active:translate-x-px active:translate-y-px min-w-[120px]"
              onClick={handleCopyToClipboard}
            >
              {copyButtonText}
            </button>
          </div>

          <SquadList
            heroes={squad.tanks}
            roleIcon="/assets/imgs/roles/tank.png"
            roleName="Tank"
          />
          <SquadList
            heroes={squad.damage}
            roleIcon="/assets/imgs/roles/damage.png"
            roleName="Damage"
          />
          <SquadList
            heroes={squad.supports}
            roleIcon="/assets/imgs/roles/support.png"
            roleName="Support"
          />
        </div>

        <button
          className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded text-xl"
          onClick={handleRandomSquad}
        >
          Get Random Team
        </button>
      </div>

      {/* Right Content */}
      <div className="lg:w-3/4 px-6 py-4 text-left lg:text-left text-center">
        <h1 className="text-3xl mb-4 underline">Filter Heroes</h1>

        <p className="text-base font-bold mb-2">
          Select the heroes you wish to include in your squad and click in the
          &quot;Get Random Team&quot; button to get a random team which will
          include the selected heroes.
        </p>

        <p className="text-base font-bold mb-4">
          Playing solo?{' '}
          <Link
            href="/"
            className="text-orange-500 underline hover:text-orange-600"
          >
            Get a random hero just for you
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
