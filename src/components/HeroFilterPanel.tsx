"use client";

import { useHeroes } from "@/context/HeroContext";
import RoleSection from "./RoleSection";

export default function HeroFilterPanel() {
  const { getSelected } = useHeroes();
  const numberOfSelected = getSelected().length;

  return (
    <div className="block text-start max-[991.98px]:text-center max-[991.98px]:px-[3%] pr-[3%]">
      <h1 className="text-white max-[991.98px]:mt-[5%]">
        Filter Heroes
      </h1>

      <div className="text-[1.05rem] text-orange-400 mt-2 font-bold font-sans">
        {numberOfSelected === 0 ? (
          <p className="m-0">
            You have no heroes selected, so all heroes are being considered by
            default.
          </p>
        ) : numberOfSelected === 1 ? (
          <p className="m-0">
            You have {numberOfSelected} hero selected.
          </p>
        ) : (
          <p className="m-0">
            You have {numberOfSelected} heroes selected.
          </p>
        )}
      </div>

      <RoleSection
        role="TANK"
        roleName="Tank"
        roleIcon="/assets/imgs/roles/tank.webp"
      />
      <RoleSection
        role="DAMAGE"
        roleName="Damage"
        roleIcon="/assets/imgs/roles/damage.webp"
      />
      <RoleSection
        role="SUPPORT"
        roleName="Support"
        roleIcon="/assets/imgs/roles/support.webp"
      />
    </div>
  );
}
