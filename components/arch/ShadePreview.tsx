"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

const ShadeCanvas = dynamic(() => import("./ShadeCanvas"), { ssr: false });

const SHADES = ["BL2", "B1", "A1", "B2", "A2", "A3", "A3.5", "A4"];

export function ShadePreview() {
  const [step, setStep] = useState(5);
  return (
    <div className="shade">
      <div className="shade__canvas-wrap">
        <ShadeCanvas step={step} />
      </div>
      <p className="shade__label" aria-live="polite">
        Shade {SHADES[step - 1]}
      </p>
      <label className="vh" htmlFor="shade-range">
        Tooth shade from brightest to darkest
      </label>
      <input
        id="shade-range"
        className="shade__range"
        type="range"
        min={1}
        max={8}
        step={1}
        value={step}
        onChange={(e) => setStep(Number(e.target.value))}
      />
      <div className="shade__scale" aria-hidden="true">
        <span>BL2</span>
        <span>A4</span>
      </div>
    </div>
  );
}
