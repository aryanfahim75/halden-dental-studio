"use client";

import { track } from "@/lib/analytics";

export function Chip({
  label,
  pressed,
  onClick
}: {
  label: string;
  pressed: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="chip"
      aria-pressed={pressed}
      onClick={() => {
        onClick();
        track("booking_step_view", { chip: label });
      }}
    >
      {label}
    </button>
  );
}
