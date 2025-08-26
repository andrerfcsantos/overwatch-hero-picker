'use client';

import { useState, useCallback, useEffect } from 'react';
import { Hero, HeroRole } from '@/types/heroes';
import { heroesData } from '@/lib/heroes-data';
import { heroPerks } from '@/lib/hero-perks';

export const useHeroes = () => {
  const [heroes, setHeroes] = useState<Record<string, Hero>>(heroesData);

  // Load selected heroes from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedHeroes = localStorage.getItem('selectedHeroes');
      if (savedHeroes) {
        try {
          const parsedHeroes = JSON.parse(savedHeroes) as Hero[];
          if (Array.isArray(parsedHeroes)) {
            setHeroes(prev => {
              const updated = { ...prev };
              parsedHeroes.forEach(hero => {
                if (updated[hero.key]) {
                  updated[hero.key] = {
                    ...updated[hero.key],
                    selected: hero.selected,
                  };
                }
              });
              return updated;
            });
          }
        } catch (error) {
          console.error('Error loading heroes from localStorage:', error);
        }
      }
    }
  }, []);

  // Save selected heroes to localStorage
  const saveToLocalStorage = useCallback(
    (heroesState: Record<string, Hero>) => {
      if (typeof window !== 'undefined') {
        const selectedHeroes = Object.values(heroesState).filter(
          hero => hero.selected
        );
        localStorage.setItem('selectedHeroes', JSON.stringify(selectedHeroes));
      }
    },
    []
  );

  const toggleHero = useCallback(
    (heroKey: string) => {
      setHeroes(prev => {
        const updated = {
          ...prev,
          [heroKey]: {
            ...prev[heroKey],
            selected: !prev[heroKey].selected,
          },
        };
        saveToLocalStorage(updated);
        return updated;
      });
    },
    [saveToLocalStorage]
  );

  const selectByRole = useCallback(
    (role: HeroRole) => {
      setHeroes(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(key => {
          if (updated[key].role === role) {
            updated[key] = { ...updated[key], selected: true };
          }
        });
        saveToLocalStorage(updated);
        return updated;
      });
    },
    [saveToLocalStorage]
  );

  const unselectByRole = useCallback(
    (role: HeroRole) => {
      setHeroes(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(key => {
          if (updated[key].role === role) {
            updated[key] = { ...updated[key], selected: false };
          }
        });
        saveToLocalStorage(updated);
        return updated;
      });
    },
    [saveToLocalStorage]
  );

  const selectJustRole = useCallback(
    (role: HeroRole) => {
      setHeroes(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(key => {
          updated[key] = {
            ...updated[key],
            selected: updated[key].role === role,
          };
        });
        saveToLocalStorage(updated);
        return updated;
      });
    },
    [saveToLocalStorage]
  );

  // Getters
  const getAllHeroes = useCallback(() => {
    return Object.values(heroes).sort((a, b) => a.name.localeCompare(b.name));
  }, [heroes]);

  const getHeroesByRole = useCallback(
    (role: HeroRole) => {
      return getAllHeroes().filter(hero => hero.role === role);
    },
    [getAllHeroes]
  );

  const getSelectedHeroes = useCallback(() => {
    return getAllHeroes().filter(hero => hero.selected);
  }, [getAllHeroes]);

  const getRandomHero = useCallback(() => {
    const selected = getSelectedHeroes();
    const heroPool = selected.length > 0 ? selected : getAllHeroes();
    return heroPool[Math.floor(Math.random() * heroPool.length)];
  }, [getSelectedHeroes, getAllHeroes]);

  const getRandomHeroPerks = useCallback(
    (heroKey: string): [string, string] => {
      const perks = heroPerks[heroKey];
      if (!perks) return ['', ''];

      const randomMinor =
        perks.minor[Math.floor(Math.random() * perks.minor.length)];
      const randomMajor =
        perks.major[Math.floor(Math.random() * perks.major.length)];

      return [randomMinor, randomMajor];
    },
    []
  );

  const getRandomSquad = useCallback(() => {
    // Modern Overwatch 2 composition: 1 Tank, 2 Damage, 2 Support
    const selected = getSelectedHeroes();
    const allHeroes = getAllHeroes();

    const getHeroesForRole = (role: HeroRole, count: number) => {
      const selectedForRole = selected.filter(hero => hero.role === role);
      const allForRole = allHeroes.filter(hero => hero.role === role);
      const pool =
        selectedForRole.length >= count ? selectedForRole : allForRole;

      const result = [];
      const poolCopy = [...pool];

      for (let i = 0; i < count && poolCopy.length > 0; i++) {
        const randomIndex = Math.floor(Math.random() * poolCopy.length);
        result.push(poolCopy.splice(randomIndex, 1)[0]);
      }

      return result;
    };

    return {
      tanks: getHeroesForRole('TANK', 1),
      damage: getHeroesForRole('DAMAGE', 2),
      supports: getHeroesForRole('SUPPORT', 2),
    };
  }, [getSelectedHeroes, getAllHeroes]);

  const getRandomSquadClassic = useCallback(() => {
    // Classic random composition: 5 random heroes from any role
    const selected = getSelectedHeroes();
    const allHeroes = getAllHeroes();
    const heroPool = selected.length > 0 ? selected : allHeroes;

    const result: { tanks: Hero[]; damage: Hero[]; supports: Hero[] } = {
      tanks: [],
      damage: [],
      supports: [],
    };

    const poolCopy = [...heroPool];
    const roles: HeroRole[] = ['TANK', 'DAMAGE', 'SUPPORT'];

    for (let i = 0; i < 5 && poolCopy.length > 0; i++) {
      const randomIndex = Math.floor(Math.random() * poolCopy.length);
      const hero = poolCopy.splice(randomIndex, 1)[0];

      if (hero.role === 'TANK') {
        result.tanks.push(hero);
      } else if (hero.role === 'DAMAGE') {
        result.damage.push(hero);
      } else {
        result.supports.push(hero);
      }
    }

    return result;
  }, [getSelectedHeroes, getAllHeroes]);

  return {
    heroes,
    toggleHero,
    selectByRole,
    unselectByRole,
    selectJustRole,
    getAllHeroes,
    getHeroesByRole,
    getSelectedHeroes,
    getRandomHero,
    getRandomHeroPerks,
    getRandomSquad,
    getRandomSquadClassic,
  };
};
