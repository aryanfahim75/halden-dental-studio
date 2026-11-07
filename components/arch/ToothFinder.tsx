"use client";

import { useEffect, useState } from "react";
import { appStore } from "@/lib/store";
import { isToothId, teethById } from "@/content/teeth";
import { track } from "@/lib/analytics";
import { ToothChart } from "./ToothChart";
import { ToothPanel } from "./ToothPanel";

export function ToothFinder() {
  const [selected, setSelected] = useState("36");

  useEffect(() => {
    const stored = appStore.get().toothId;
    if (stored && isToothId(stored)) setSelected(stored);
  }, []);

  const pick = (id: string) => {
    setSelected(id);
    appStore.setTooth(id);
    track("tooth_selected", { id, source: "chart" });
  };

  return (
    <div className="finder grid12">
      <div className="finder__chart" data-rise>
        <ToothChart selectedId={selected} onSelect={pick} />
      </div>
      <div className="finder__panel" data-rise>
        <div aria-live="polite">
          <ToothPanel tooth={teethById[selected]} />
        </div>
      </div>
    </div>
  );
}
