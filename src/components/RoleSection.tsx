"use client";

import { HeroRole } from "@/types/hero";
import { useHeroes } from "@/context/HeroContext";
import HeroCard from "./HeroCard";

interface RoleSectionProps {
  role: HeroRole;
  roleName: string;
  roleIcon: string;
}

export default function RoleSection({
  role,
  roleName,
  roleIcon,
}: RoleSectionProps) {
  const { getByRole, selectByRole, unselectByRole, selectJustRole } =
    useHeroes();
  const heroes = getByRole(role);

  return (
    <>
      <div className="flex flex-row items-center">
        <img className="max-h-[2em]" alt={`${roleName} role icon`} src={roleIcon} />
        <h2 className="m-[0.5em] ml-0">{roleName}</h2>
        <button
          className="skew-button bg-[rgb(51,150,31)]"
          onClick={() => selectByRole(role)}
        >
          Select All
        </button>
        <button
          className="skew-button bg-[rgb(240,100,20)] btn-orange"
          onClick={() => unselectByRole(role)}
        >
          Unselect All
        </button>
        <button
          className="skew-button bg-[rgb(131,125,125)]"
          onClick={() => selectJustRole(role)}
        >
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
