"use client";

import Link from "next/link";
import { useHeroes } from "@/context/HeroContext";
import RoleSection from "./RoleSection";

interface HeroFilterPanelProps {
  description: string;
  linkTo: string;
  linkText: string;
  linkPrefix?: string;
}

export default function HeroFilterPanel({
  description,
  linkTo,
  linkText,
  linkPrefix,
}: HeroFilterPanelProps) {
  const { getSelected } = useHeroes();
  const numberOfSelected = getSelected().length;

  return (
    <div className="block text-start max-[991.98px]:text-center">
      <h1 className="text-white underline max-[991.98px]:mt-[5%]">
        Filter Heroes
      </h1>

      <p className="filter-description">{description}</p>

      <p className="filter-description">
        {linkPrefix && <>{linkPrefix} </>}
        <Link href={linkTo}>{linkText}</Link>
      </p>

      <div className="text-[1.5rem] text-orange-400 mt-4 font-bold">
        {numberOfSelected === 0 ? (
          <p className="filter-description m-0">
            You have no heroes selected, so all heroes are being considered by
            default.
          </p>
        ) : numberOfSelected === 1 ? (
          <p className="filter-description m-0">
            You have {numberOfSelected} hero selected.
          </p>
        ) : (
          <p className="filter-description m-0">
            You have {numberOfSelected} heroes selected.
          </p>
        )}
      </div>

      <RoleSection
        role="TANK"
        roleName="Tank"
        roleIcon="/assets/imgs/roles/tank.png"
      />
      <RoleSection
        role="DAMAGE"
        roleName="Damage"
        roleIcon="/assets/imgs/roles/damage.png"
      />
      <RoleSection
        role="SUPPORT"
        roleName="Support"
        roleIcon="/assets/imgs/roles/support.png"
      />
    </div>
  );
}
