// Shared state between the 3D stage renderer and the scroll-driven story timeline.
// A single mutable object lets GSAP tween the values while the render loop reads them.

export type StageState = {
  crownY: number;
  abutY: number;
  implY: number;
  spread: number;
  rotY: number;
  rotX: number;
  tilt: number;
  camZ: number;
  offX: number;
  offY: number;
  ringY: number;
  ringS: number;
  ringO: number;
  axis: number;
  exit: number;
  hue: number;
  pine: number;
  tags: number;
  opacity: number;
  /** Normalised scroll velocity, written by the story timeline and decayed in the render loop. */
  velT: number;
};

export const initialStageState: StageState = {
  crownY: 0,
  abutY: -7,
  implY: -10,
  spread: 0,
  rotY: 0.5,
  rotX: 0.42,
  tilt: 0,
  camZ: 9.5,
  offX: 1,
  offY: 0.42,
  ringY: 1.25,
  ringS: 1,
  ringO: 0,
  axis: 0,
  exit: 0,
  hue: 0,
  pine: 0,
  tags: 0,
  opacity: 1,
  velT: 0,
};

// Module singleton (one scene per page).
export const stageState: StageState = { ...initialStageState };

export const SHADES: ReadonlyArray<readonly [string, string]> = [
  ["BL2", "#FBFAF4"],
  ["B1", "#F7F2E6"],
  ["A1", "#F3EBD8"],
  ["A2", "#EDDFC2"],
  ["A3", "#E4D0A8"],
  ["A3.5", "#DCC498"],
];

export function resetStageState() {
  Object.assign(stageState, initialStageState);
}
