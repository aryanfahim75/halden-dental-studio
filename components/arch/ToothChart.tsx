"use client";

import { chartTopRow, chartBottomRow, teethById } from "@/content/teeth";

function Row({
  cells,
  selectedId,
  onSelect
}: {
  cells: string[][];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="tooth-chart__row">
      {cells.map((quadrant, qi) => (
        <span className="tooth-chart__quadrant" key={qi}>
          {quadrant.map((id) => (
            <button
              key={id}
              type="button"
              className="tooth-chart__btn"
              data-selected={selectedId === id || undefined}
              aria-pressed={selectedId === id}
              aria-label={`${id}, ${teethById[id].name}`}
              onClick={() => onSelect(id)}
            >
              {id}
            </button>
          ))}
          {qi === 0 ? <span className="tooth-chart__gap" aria-hidden="true" /> : null}
        </span>
      ))}
    </div>
  );
}

export function ToothChart({
  selectedId,
  onSelect
}: {
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="tooth-chart" role="group" aria-label="Pick the tooth that is bothering you">
      <Row cells={chartTopRow} selectedId={selectedId} onSelect={onSelect} />
      <Row cells={chartBottomRow} selectedId={selectedId} onSelect={onSelect} />
    </div>
  );
}
