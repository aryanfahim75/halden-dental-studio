import * as THREE from "three";

export type ToothKind = "incisor" | "canine" | "premolar" | "molar";

export type ToothShapeSpec = {
  kind: ToothKind;
  halfWidth: number;
  halfDepth: number;
  crownHeight: number;
  rootLength: number;
};

const square = (v: number): number => Math.sign(v) * Math.abs(v) ** 0.72;

const CUSPS: Record<"premolar" | "molar", Array<[number, number]>> = {
  premolar: [
    [0, -0.5],
    [0, 0.5]
  ],
  molar: [
    [-0.5, -0.5],
    [0.5, -0.5],
    [-0.5, 0.5],
    [0.5, 0.5]
  ]
};

export function buildToothGeometry(spec: ToothShapeSpec): THREE.BufferGeometry {
  const geo = new THREE.SphereGeometry(1, 44, 36);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const crown = spec.crownHeight;
  const root = spec.rootLength;

  for (let i = 0; i < pos.count; i++) {
    const sx = pos.getX(i);
    const sy = pos.getY(i);
    const sz = pos.getZ(i);

    let nx = square(sx);
    let nz = square(sz);
    let y = sy >= 0 ? sy * crown : sy * (crown + root);

    if (sy < 0) {
      const taper = 1 - 0.62 * (-sy) ** 1.4;
      nx *= taper;
      nz *= taper;
    } else {
      const belly = 1 + 0.1 * Math.sin(Math.PI * sy);
      nx *= belly;
      nz *= belly;
    }

    if (spec.kind === "incisor" && sy > 0) {
      nz *= 1 - 0.6 * sy * sy;
      y = crown * Math.min(sy * 1.25, 1);
    }

    if (spec.kind === "canine" && sy > 0) {
      const point = 1 - 0.75 * sy ** 1.6;
      nx *= point;
      nz *= point;
      y *= 1.15;
    }

    if ((spec.kind === "premolar" || spec.kind === "molar") && sy > 0.2) {
      const cusps = CUSPS[spec.kind];
      let bump = 0;
      for (const [cx, cz] of cusps) {
        bump += Math.exp(-((nx - cx) ** 2 + (nz - cz) ** 2) / 0.12);
      }
      y = crown * sy ** 0.7 + (bump * 0.35 - 0.2) * crown * ((sy - 0.2) / 0.8);
    }

    pos.setXYZ(i, nx * spec.halfWidth, y, nz * spec.halfDepth);
  }

  pos.needsUpdate = true;
  geo.computeVertexNormals();

  const normal = geo.attributes.normal as THREE.BufferAttribute;
  const cols = 45;
  const rows = 37;
  for (let r = 0; r < rows; r++) {
    const a = r * cols;
    const b = r * cols + (cols - 1);
    const avgX = (normal.getX(a) + normal.getX(b)) / 2;
    const avgY = (normal.getY(a) + normal.getY(b)) / 2;
    const avgZ = (normal.getZ(a) + normal.getZ(b)) / 2;
    normal.setXYZ(a, avgX, avgY, avgZ);
    normal.setXYZ(b, avgX, avgY, avgZ);
  }
  normal.needsUpdate = true;

  geo.deleteAttribute("uv");
  return geo;
}
