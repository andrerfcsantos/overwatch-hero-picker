"use client";

import { HeroRole } from "@/types/hero";
import { useHeroes } from "@/context/HeroContext";
import HeroCard from "./HeroCard";
import RoleSpriteIcon from "./RoleSpriteIcon";

interface RoleSectionProps {
  role: HeroRole;
  roleName: string;
}

export default function RoleSection({ role, roleName }: RoleSectionProps) {
  const { getByRole, selectByRole, unselectByRole, selectJustRole } =
    useHeroes();
  const heroes = getByRole(role);

  return (
    <>
      <div className="flex flex-row items-center">
        <RoleSpriteIcon
          className="h-[2em] aspect-[175/150]"
          roleKey={role}
          alt={`${roleName} role icon`}
        />
        <h2 className="m-[0.5em] ml-0">{roleName}</h2>
        <button className="action-button" onClick={() => selectByRole(role)}>
          Select All
        </button>
        <button className="action-button" onClick={() => unselectByRole(role)}>
          Unselect All
        </button>
        <button className="action-button" onClick={() => selectJustRole(role)}>
          Just this role
        </button>
      </div>
      <div className="flex flex-wrap justify-start">
        {heroes.map((h) => (
          <HeroCard key={h.key} hero={h} />
        ))}
      </div>
    </>
  );
}
