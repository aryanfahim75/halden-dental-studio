export type ArchPosition = {
  angle: number;
  x: number;
  y: number;
  z: number;
  halfWidth: number;
  halfDepth: number;
  crownHeight: number;
  rootLength: number;
};

export type DigitShape = {
  halfWidth: number;
  halfDepth: number;
  crownHeight: number;
  rootLength: number;
};

export const DIGIT_SHAPES: Record<number, DigitShape> = {
  1: { halfWidth: 0.21, halfDepth: 0.12, crownHeight: 0.38, rootLength: 0.5 },
  2: { halfWidth: 0.18, halfDepth: 0.11, crownHeight: 0.34, rootLength: 0.46 },
  3: { halfWidth: 0.2, halfDepth: 0.18, crownHeight: 0.42, rootLength: 0.62 },
  4: { halfWidth: 0.2, halfDepth: 0.23, crownHeight: 0.34, rootLength: 0.48 },
  5: { halfWidth: 0.2, halfDepth: 0.23, crownHeight: 0.33, rootLength: 0.46 },
  6: { halfWidth: 0.28, halfDepth: 0.29, crownHeight: 0.32, rootLength: 0.44 },
  7: { halfWidth: 0.27, halfDepth: 0.28, crownHeight: 0.31, rootLength: 0.42 },
  8: { halfWidth: 0.25, halfDepth: 0.26, crownHeight: 0.29, rootLength: 0.36 }
};

const GAP = 0.02;
const UPSCALE = 1.04;
const ARCH_Y = 0.75;

const radiiFor = (arch: "upper" | "lower") =>
  arch === "upper" ? { rx: 1.75 * UPSCALE, rz: 2.3 * UPSCALE } : { rx: 1.75, rz: 2.3 };

const centreDistance = (a: DigitShape, b: DigitShape): number =>
  a.halfWidth + b.halfWidth + GAP;

const MIDLINE_OFFSET = DIGIT_SHAPES[1].halfWidth + GAP / 2;

const angleForArc = (
  radii: { rx: number; rz: number },
  target: number
): number => {
  const step = 0.0025;
  let a = 0;
  let acc = 0;
  while (acc < target && a < Math.PI / 2 + 0.5) {
    const dx = radii.rx * Math.cos(a) * step;
    const dz = radii.rz * Math.sin(a) * step;
    acc += Math.sqrt(dx * dx + dz * dz);
    a += step;
  }
  return a;
};

export const archAngles = (
  arch: "upper" | "lower"
): Record<1 | 2 | 3 | 4 | 5 | 6 | 7 | 8, number> => {
  const radii = radiiFor(arch);
  const angles = {} as Record<number, number>;
  let cumulative = MIDLINE_OFFSET;
  for (let digit = 1; digit <= 8; digit++) {
    angles[digit] = angleForArc(radii, cumulative);
    cumulative += centreDistance(DIGIT_SHAPES[digit], DIGIT_SHAPES[Math.min(digit + 1, 8)]);
  }
  return angles as Record<1 | 2 | 3 | 4 | 5 | 6 | 7 | 8, number>;
};

export function toothPosition(
  quadrant: 1 | 2 | 3 | 4,
  digit: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8
): ArchPosition {
  const arch: "upper" | "lower" = quadrant <= 2 ? "upper" : "lower";
  const isRight = quadrant === 1 || quadrant === 4;
  const sign = isRight ? -1 : 1;
  const radii = radiiFor(arch);
  const angles = archAngles(arch);
  const angle = sign * angles[digit];
  const shape = DIGIT_SHAPES[digit];
  return {
    angle,
    x: radii.rx * Math.sin(angle),
    y: arch === "upper" ? ARCH_Y : -ARCH_Y,
    z: radii.rz * Math.cos(angle),
    halfWidth: shape.halfWidth,
    halfDepth: shape.halfDepth,
    crownHeight: shape.crownHeight,
    rootLength: shape.rootLength
  };
}
