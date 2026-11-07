"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useAppState, appStore } from "@/lib/store";
import { track } from "@/lib/analytics";

const ArchCanvas = dynamic(() => import("./ArchCanvasInner"), { ssr: false });

export function HeroArch() {
  const [ready, setReady] = useState(false);
  const [webgl, setWebgl] = useState(true);
  const { toothId } = useAppState();

  return (
    <div className="arch__stage" data-ready={ready || undefined}>
      {webgl ? (
        <>
          <div className={`arch__poster${ready ? " is-hidden" : ""}`} aria-hidden="true">
            <p className="arch__poster-hint">The arch is loading</p>
          </div>
          <ArchCanvas
            selectedId={toothId ?? ""}
            onSelect={(id) => {
              appStore.setTooth(id);
              track("tooth_selected", { id });
            }}
            onReady={() => setReady(true)}
            onUnavailable={() => setWebgl(false)}
          />
        </>
      ) : null}
    </div>
  );
}
