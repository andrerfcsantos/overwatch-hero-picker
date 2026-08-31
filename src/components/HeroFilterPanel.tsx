"use client";

import posthog from "posthog-js";
import { useHeroes } from "@/context/HeroContext";
import PresetBar from "./PresetBar";
import RoleSection from "./RoleSection";
import ShareButton from "./ShareButton";

interface HeroFilterPanelProps {
  /** Supplied by the picker, which owns the options the preset also carries. */
  buildPresetUrl?: () => string;
}

export default function HeroFilterPanel({
  buildPresetUrl,
}: HeroFilterPanelProps) {
  const { getSelected, selectAll, unselectAll } = useHeroes();
  const numberOfSelected = getSelected().length;

  return (
    <div className="block text-start max-[991.98px]:text-center max-[991.98px]:px-[3%] pr-[3%]">
      <h1 className="text-white max-[991.98px]:mt-[5%]">Filter Heroes</h1>

      <div className="mt-3 mb-1">
        <p className="text-gray-400 m-0 mb-2">
          Select which heroes you want to include for the random selection, then
          hit <strong>Randomize Hero</strong> to get your pick.
          <br />
          You can select/unselect heroes individually or by role. Keyboard
          shortcuts are available — click <strong>?</strong> on the bottom of
          the page to see the full list.
        </p>
      </div>

      <div className="text-[1.05rem] text-orange-400 mt-2 font-bold font-sans">
        {numberOfSelected === 0 ? (
          <p className="m-0">
            You have no heroes selected, so all heroes are being considered by
            default.
          </p>
        ) : numberOfSelected === 1 ? (
          <p className="m-0">You have {numberOfSelected} hero selected.</p>
        ) : (
          <p className="m-0">You have {numberOfSelected} heroes selected.</p>
        )}
      </div>

      <div className="flex flex-row flex-wrap gap-1 mt-2 mb-1">
        <button
          className="action-button"
          onClick={() => {
            selectAll();
            if (posthog.__loaded) {
              posthog.capture("hero_filters_changed", { action: "select_all" });
            }
          }}
        >
          Select All
        </button>
        <button
          className="action-button"
          onClick={() => {
            unselectAll();
            if (posthog.__loaded) {
              posthog.capture("hero_filters_changed", {
                action: "unselect_all",
              });
            }
          }}
        >
          Unselect All
        </button>
        {buildPresetUrl && (
          <ShareButton
            buildUrl={buildPresetUrl}
            label="Share these filters"
            copiedLabel="Filter link copied!"
            title="Copy a link that sets up these filters and options"
          />
        )}
      </div>

      <PresetBar />

      <RoleSection heroRole="TANK" roleName="Tank" />
      <RoleSection heroRole="DAMAGE" roleName="Damage" />
      <RoleSection heroRole="SUPPORT" roleName="Support" />
    </div>
  );
}
