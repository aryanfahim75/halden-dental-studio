"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { resetStageState, SHADES, stageState } from "@/lib/three/stageState";

interface Stage3DProps {
  id?: string;
}

export function Stage3D({ id = "stage" }: Stage3DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  const S = stageState;

  let renderer: THREE.WebGLRenderer | null = null;
  let scene: THREE.Scene | null = null;
  let camera: THREE.PerspectiveCamera | null = null;
  let root: THREE.Group | null = null;
  let crown: THREE.Mesh | null = null;
  let abut: THREE.Group | null = null;
  let impl: THREE.Group | null = null;
  let crownMat: THREE.MeshPhysicalMaterial | null = null;
  let ring: THREE.Mesh | null = null;
  let ringMat: THREE.MeshBasicMaterial | null = null;
  let axis: THREE.Line | null = null;
  let axisMat: THREE.LineDashedMaterial | null = null;
  let keyL: THREE.DirectionalLight | null = null;
  let tags: HTMLElement[] = [];

  const mobile = () => typeof window !== "undefined" && window.innerWidth <= 760;
  const reduce = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Geometry creation functions (ported from original)
  function crownGeo() {
    const W = 180, H = 140;
    const g = new THREE.SphereGeometry(1, W, H);
    const p = g.attributes.position;
    const cols = new Float32Array(p.count * 3);
    const cusps = [
      [-0.5, -0.47, 1.0],
      [0.5, -0.5, 0.86],
      [-0.48, 0.5, 0.9],
      [0.52, 0.48, 1.04],
      [0.02, 0.62, 0.5],
    ];
    const sm = (a: number, b: number, x: number) => {
      const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
      return t * t * (3 - 2 * t);
    };

    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
      const r = Math.max(1e-5, Math.hypot(x, z));
      const ang = Math.atan2(z, x);
      const out = 1 / Math.pow(Math.pow(Math.abs(Math.cos(ang)), 3.4) + Math.pow(Math.abs(Math.sin(ang)), 3.4), 1 / 3.4);
      const lobe = 1 + 0.04 * Math.cos(ang * 4 + 0.7) + 0.015 * Math.cos(ang * 2);
      const R = Math.pow(r, 0.3 + 0.2 * sm(-0.1, 0.5, y)) * (1 + (out - 1) * 0.72) * lobe;
      let nx = Math.cos(ang) * R, nz = Math.sin(ang) * R, Y: number, shade = 1;
      const belly = 1 + 0.055 * Math.cos(Math.PI * Math.max(-1, Math.min(1, y * 0.95)));
      nx *= belly; nz *= belly;

      if (y >= 0) {
        const face = sm(0.12, 0.7, y);
        let b = 0;
        for (const c of cusps) {
          b = Math.max(b, c[2] * Math.exp(-((nx - c[0]) ** 2 + (nz - c[1]) ** 2) / 0.1));
        }
        const fis = Math.exp(-(nx * nx) / 0.008) + Math.exp(-(nz * nz) / 0.008) * 0.85;
        const pits = Math.exp(-(nx * nx + nz * nz) / 0.03) * 0.14;
        Y = 0.2 + 0.42 * y + face * (b * 0.42 - fis * 0.09 - pits);
        shade = 1 - face * Math.min(0.5, fis * 0.3 + (1 - b) * 0.16 + pits * 1.4);
      } else {
        const k = -y;
        const neck = 1 - 0.26 * Math.pow(k, 1.7);
        nx *= neck; nz *= neck;
        Y = 0.2 - k * 0.92;
      }

      const warm = sm(0.25, -0.8, y);
      cols[i * 3] = shade * (1 - 0.02 * warm);
      cols[i * 3 + 1] = shade * (1 - 0.08 * warm) * (1 - (1 - shade) * 0.1);
      cols[i * 3 + 2] = shade * (1 - 0.2 * warm) * (1 - (1 - shade) * 0.26);
      p.setXYZ(i, nx * 0.98, Y, nz * 0.9);
    }

    g.setAttribute("color", new THREE.BufferAttribute(cols, 3));
    g.computeVertexNormals();

    const n = g.attributes.normal;
    for (let r = 0; r <= H; r++) {
      const a = r * (W + 1), b = a + W;
      const v = new THREE.Vector3(
        n.getX(a) + n.getX(b),
        n.getY(a) + n.getY(b),
        n.getZ(a) + n.getZ(b)
      ).normalize();
      n.setXYZ(a, v.x, v.y, v.z);
      n.setXYZ(b, v.x, v.y, v.z);
    }
    return g;
  }

  function implantGeo() {
    const U = 128, V = 1000, LEN = 2.5;
    const pos: number[] = [], idx: number[] = [];
    const pitch = 11;
    const smooth = (a: number, b: number, x: number) => {
      const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
      return t * t * (3 - 2 * t);
    };

    for (let v = 0; v <= V; v++) {
      const t = v / V;
      for (let u = 0; u <= U; u++) {
        const a = (u / U) * Math.PI * 2;
        const core = 0.36 - 0.12 * Math.pow(t, 1.5);
        const ph = (t * pitch - a / (Math.PI * 2));
        const f = ph - Math.floor(ph);
        const profile = f < 0.72 ? f / 0.72 : (1 - f) / 0.28;
        const th = Math.pow(profile, 1.25) * 0.11 * smooth(0.03, 0.1, t) * (1 - smooth(0.9, 1, t));
        let r = core + th;
        if (t > 0.975) r *= 1 - smooth(0.975, 1, t) * 0.999;
        pos.push(Math.cos(a) * r, -t * LEN, Math.sin(a) * r);
      }
    }

    for (let v = 0; v < V; v++) {
      for (let u = 0; u < U; u++) {
        const a = v * (U + 1) + u;
        const b = a + U + 1;
        idx.push(a, a + 1, b, b, a + 1, b + 1);
      }
    }

    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setIndex(idx);
    g.computeVertexNormals();

    const n = g.attributes.normal;
    for (let r = 0; r <= V; r++) {
      const a = r * (U + 1), b = a + U;
      const v = new THREE.Vector3(
        n.getX(a) + n.getX(b),
        n.getY(a) + n.getY(b),
        n.getZ(a) + n.getZ(b)
      ).normalize();
      n.setXYZ(a, v.x, v.y, v.z);
      n.setXYZ(b, v.x, v.y, v.z);
    }
    return g;
  }

  function lathe(points: number[][], seg = 128) {
    return new THREE.LatheGeometry(
      points
        .slice()
        .reverse()
        .map((p) => new THREE.Vector2(p[0], p[1])),
      seg
    );
  }

  function round(pts: number[][], steps = 90) {
    const c = new THREE.SplineCurve(pts.map((p) => new THREE.Vector2(p[0], p[1])));
    return c.getPoints(steps).map((v) => [Math.max(0.0001, v.x), v.y]);
  }

  function envOf(renderer: THREE.WebGLRenderer) {
    const s = new THREE.Scene();
    const room = new THREE.Mesh(
      new THREE.BoxGeometry(30, 30, 30),
      new THREE.MeshBasicMaterial({ color: 0x46504e, side: THREE.BackSide })
    );
    s.add(room);

    const panel = (w: number, h: number, x: number, y: number, z: number, v: number, col?: number) => {
      const m = new THREE.Mesh(
        new THREE.PlaneGeometry(w, h),
        new THREE.MeshBasicMaterial({
          color: new THREE.Color(col || 0xffffff).multiplyScalar(v),
          side: THREE.DoubleSide,
        })
      );
      m.position.set(x, y, z);
      m.lookAt(0, 0, 0);
      s.add(m);
    };

    panel(16, 10, 0, 14, 2, 3.4);
    panel(6, 16, -13, 2, 5, 3);
    panel(4, 14, 13, 3, 3, 2.2);
    panel(10, 2.2, 0, -2, 14, 1.3);
    panel(3, 18, -6, 0, -13, 0.02, 0x111111);
    panel(3, 18, 7, 0, -13, 0.02, 0x111111);
    panel(2, 18, 12.5, -2, -5, 0.03, 0x111111);
    panel(2, 18, -12.8, -4, -3, 0.03, 0x111111);
    panel(18, 3, 0, -14, 0, 0.1, 0x223330);

    const pm = new THREE.PMREMGenerator(renderer);
    const t = pm.fromScene(s, 0.03).texture;
    pm.dispose();
    return t;
  }

  function init3D() {
    const canvas = canvasRef.current;
    if (!canvas) return false;

    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
        preserveDrawingBuffer: true,
      });

      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile() ? 1.6 : 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 0.92;

      scene = new THREE.Scene();
      scene.environment = envOf(renderer);

      camera = new THREE.PerspectiveCamera(26, 1, 0.1, 60);

      root = new THREE.Group();
      scene.add(root);

      keyL = new THREE.DirectionalLight(0xffffff, 0.55);
      keyL.position.set(3, 6, 5);
      scene.add(keyL);

      const rim = new THREE.DirectionalLight(0xfff0d8, 0.5);
      rim.position.set(-5, 1, -4);
      scene.add(rim);

      crownMat = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color("#F7F2E6"),
        roughness: 0.34,
        metalness: 0,
        clearcoat: 0.85,
        clearcoatRoughness: 0.14,
        reflectivity: 0.5,
        envMapIntensity: 1,
        vertexColors: true,
        emissive: new THREE.Color("#7A7062"),
        emissiveIntensity: 0.2,
      });

      crown = new THREE.Mesh(crownGeo(), crownMat);

      const ti = new THREE.MeshStandardMaterial({
        color: new THREE.Color("#C6CBCD"),
        metalness: 1,
        roughness: 0.3,
        envMapIntensity: 1.25,
      });

      const gold = new THREE.MeshStandardMaterial({
        color: new THREE.Color("#D6B98A"),
        metalness: 1,
        roughness: 0.17,
        envMapIntensity: 1.3,
      });

      abut = new THREE.Group();
      abut.add(
        new THREE.Mesh(
          lathe(
            round([
              [0.001, 0.86],
              [0.2, 0.85],
              [0.25, 0.8],
              [0.3, 0.25],
              [0.33, 0.06],
              [0.46, -0.08],
              [0.47, -0.13],
              [0.36, -0.2],
              [0.31, -0.27],
              [0.3, -0.42],
            ], 120)
          ),
          gold
        )
      );

      impl = new THREE.Group();
      const collar = new THREE.Mesh(
        lathe(
          round([
            [0.001, 0.2],
            [0.3, 0.2],
            [0.38, 0.17],
            [0.41, 0.1],
            [0.42, 0.0],
            [0.4, -0.12],
            [0.37, -0.2],
          ], 70)
        ),
        ti
      );
      const body = new THREE.Mesh(implantGeo(), ti);
      body.position.y = -0.18;
      impl.add(collar, body);

      // Thin gold ring that travels down the crown during the crown chapter.
      ringMat = new THREE.MeshBasicMaterial({
        color: 0xf4be9b,
        transparent: true,
        opacity: 0,
        depthWrite: false,
      });
      ring = new THREE.Mesh(new THREE.TorusGeometry(1.22, 0.0065, 10, 180), ringMat);
      ring.rotation.x = Math.PI / 2;

      // Dashed gold axis through the exploded parts.
      axisMat = new THREE.LineDashedMaterial({
        color: 0xf4be9b,
        transparent: true,
        opacity: 0,
        dashSize: 0.07,
        gapSize: 0.07,
      });
      axis = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(0, 3.6, 0),
          new THREE.Vector3(0, -3.5, 0),
        ]),
        axisMat
      );
      axis.computeLineDistances();

      root!.add(crown, abut, impl, ring, axis);

      tags = ["tagA", "tagB", "tagC"].map((id) => document.getElementById(id)!).filter(Boolean);

      size();
      return true;
    } catch (e) {
      console.error("Three.js init failed:", e);
      return false;
    }
  }

  function size() {
    if (!renderer || !camera) return;
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  }

  const col = new THREE.Color();
  const cA = new THREE.Color();
  const cB = new THREE.Color();
  const v3 = new THREE.Vector3();

  function place(el: HTMLElement | undefined, obj: THREE.Object3D | null, dy: number, side: number, o: number) {
    if (!el || !obj || !camera) return;
    v3.set(0, dy, 0);
    obj.localToWorld(v3);
    v3.project(camera);
    const x = ((v3.x + 1) / 2) * window.innerWidth;
    const y = ((1 - v3.y) / 2) * window.innerHeight;
    const w = el.offsetWidth;
    el.style.flexDirection = side > 0 ? "row" : "row-reverse";
    const tx = side > 0 ? x + (mobile() ? 14 : 70) : x - (mobile() ? 14 : 70) - w;
    el.style.transform = `translate(${Math.round(tx)}px,${Math.round(y - 20)}px)`;
    el.style.opacity = String(o);
  }

  let t0 = performance.now();
  let mx = 0, my = 0, cmx = 0, cmy = 0;
  let vel = 0;

  function onPointerMove(e: PointerEvent) {
    mx = e.clientX / window.innerWidth - 0.5;
    my = e.clientY / window.innerHeight - 0.5;
  }

  function draw() {
    const t = (performance.now() - t0) / 1000;
    const idle = reduce ? 0 : t;

    if (reduce) {
      cmx = 0;
      cmy = 0;
    } else {
      cmx += (mx - cmx) * 0.05;
      cmy += (my - cmy) * 0.05;
    }

    const m = mobile() ? 1 : 0;
    const aspectBoost = m ? 1.5 : 1;

    // Scroll velocity tilt: max 0.22 rad on Y, easing out when scrolling stops.
    const velTarget = reduce ? 0 : Math.max(-1, Math.min(1, S.velT));
    vel += (velTarget - vel) * 0.08;
    S.velT *= 0.9;

    if (camera) {
      camera.position.set(cmx * 0.35, 0.15 - cmy * 0.25, S.camZ * aspectBoost);
      camera.lookAt(0, 0, 0);
    }

    if (root) {
      root.position.set(
        m ? S.offX * 0.1 : S.offX,
        (m ? 1.05 : 0) * (1 - Math.min(1, S.pine)) + S.offY + Math.sin(idle * 0.8) * 0.05,
        0
      );
      // Leave with the manifesto: one viewport of vertical travel.
      root.position.y +=
        S.exit * 2 * Math.tan((13 * Math.PI) / 180) * (camera?.position.z ?? S.camZ);
      root.rotation.set(
        S.rotX + cmy * 0.1 + vel * 0.1,
        S.rotY + cmx * 0.2 + vel * 0.22,
        S.tilt + vel * 0.05
      );
    }

    if (keyL) {
      keyL.position.set(Math.cos(S.rotY * 0.8) * 6, 6, Math.sin(S.rotY * 0.8) * 6 + 2);
    }

    if (crown) crown.position.y = S.crownY;
    if (abut) abut.position.y = S.abutY;
    if (impl) impl.position.y = S.implY;

    if (ring) {
      ring.position.y = S.ringY;
      ring.scale.set(S.ringS, S.ringS, 1);
      ring.visible = S.ringO > 0.003;
    }
    if (ringMat) ringMat.opacity = S.ringO;
    if (axis) axis.visible = S.axis > 0.003;
    if (axisMat) axisMat.opacity = S.axis * 0.7;

    const idx = Math.max(0, Math.min(SHADES.length - 1.001, S.hue));
    const i = Math.floor(idx);
    const fr = idx - i;
    cA.set(SHADES[i][1]);
    cB.set(SHADES[i + 1][1]);
    col.copy(cA).lerp(cB, fr);
    if (crownMat) crownMat.color.copy(col);

    if (renderer && scene && camera) {
      renderer.render(scene, camera);
    }

    if (root) root.updateMatrixWorld(true);

    place(tags[0], crown, 0.5, 1, S.tags);
    place(tags[1], abut, 0.3, -1, S.tags);
    place(tags[2], impl, -1, 1, S.tags);

    const shadeEls = document.querySelectorAll("#shades span");
    shadeEls.forEach((e, k) => e.classList.toggle("on", Math.round(S.hue) === k));
  }

  // Snapshot function for treatment cards
  function snap(id: string, o: any, w: number, h: number, bg: string) {
    if (!renderer || !camera || !scene) return;
    const keep = { ...S };
    Object.assign(S, o);

    const pr = renderer.getPixelRatio();
    renderer.setPixelRatio(1);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();

    const omx = mx;
    cmx = cmy = 0;

    if (root) {
      root.position.set(S.offX, S.offY, 0);
      root.rotation.set(S.rotX, S.rotY, S.tilt);
    }
    if (crown) crown.position.y = S.crownY;
    if (abut) abut.position.y = S.abutY;
    if (impl) impl.position.y = S.implY;

    camera.position.set(0, 0.15, S.camZ);
    camera.lookAt(0, 0, 0);

    if (crownMat) crownMat.color.set(o.color || "#F7F2E6");
    if (o.fov) {
      camera.fov = o.fov;
      camera.updateProjectionMatrix();
    }

    scene.background = new THREE.Color(bg);
    renderer.render(scene, camera);

    const img = document.getElementById(id) as HTMLImageElement;
    if (img) img.src = canvasRef.current!.toDataURL("image/jpeg", 0.9);

    scene.background = null;
    camera.fov = 26;
    Object.assign(S, keep);
    renderer.setPixelRatio(pr);
    size();
    mx = omx;
  }

  useEffect(() => {
    resetStageState();
    t0 = performance.now();
    vel = 0;

    const ok = init3D();
    if (!ok) {
      const canvas = canvasRef.current;
      if (canvas) canvas.hidden = true;
      return;
    }

    (window as unknown as { __S?: typeof stageState }).__S = stageState;

    // Initial state matching new design: crown only, metal parts hidden
    S.abutY = -13;
    S.implY = -16;
    S.crownY = 0;
    S.offY = 0.8;
    S.offX = 1.05;

    // Generate treatment card images matching new design
    snap("s1", { rotY: 0.8, rotX: 1.12, crownY: -0.2, abutY: -30, implY: -30, camZ: 6.6, offX: 0, offY: 0.55 }, 780, 900, "#D8E4E1");
    snap("s2", { rotY: 0.7, rotX: 0.5, crownY: 0.1, abutY: -30, implY: -30, camZ: 8, offX: 0, offY: 0.62 }, 780, 900, "#0E4F55");
    snap("s3", { rotY: -0.5, rotX: 0.66, crownY: 0.1, abutY: -30, implY: -30, camZ: 8.6, offX: 0, offY: 0.72, color: "#FBFAF4" }, 780, 900, "#EFE6DA");
    snap("s4", { rotY: 0.2, rotX: 0.1, tilt: 0.45, crownY: 40, abutY: 40, implY: 1.2, camZ: 4.4, offX: 0.1, offY: 0.62 }, 780, 900, "#145F64");
    snap("s5", { rotY: -0.9, rotX: 0.38, tilt: 0.24, crownY: 0, abutY: -30, implY: -30, camZ: 11, offX: 0, offY: 0.75, color: "#FBFAF4" }, 780, 900, "#E6E2DA");

    // Animation loop
    let on = true;
    const cover = document.getElementById("treat");
    const loop = () => {
      const past = cover ? cover.getBoundingClientRect().top < -20 : false;
      if (!past) {
        if (!on) {
          on = true;
          if (canvasRef.current) canvasRef.current.style.visibility = "visible";
        }
        draw();
      } else if (on) {
        on = false;
        if (canvasRef.current) canvasRef.current.style.visibility = "hidden";
      }
      animationRef.current = requestAnimationFrame(loop);
    };

    animationRef.current = requestAnimationFrame(loop);
    draw();
    window.addEventListener("resize", size);
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      window.removeEventListener("resize", size);
      window.removeEventListener("pointermove", onPointerMove);
      renderer?.dispose();
    };
  }, []);

  return <canvas id={id} ref={canvasRef} aria-hidden="true" />;
}