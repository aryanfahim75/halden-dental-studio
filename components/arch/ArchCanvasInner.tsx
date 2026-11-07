"use client";

import * as THREE from "three";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { createStage } from "@/lib/three/stage";
import { buildToothGeometry } from "@/lib/three/toothGeometry";
import { toothPosition } from "@/lib/three/arch";
import { teeth, type ToothKind } from "@/content/teeth";

type Props = {
  selectedId: string;
  onSelect: (id: string) => void;
  onReady: () => void;
  onUnavailable: () => void;
};

const kindByDigit: Record<number, ToothKind> = {
  1: "incisor",
  2: "incisor",
  3: "canine",
  4: "premolar",
  5: "premolar",
  6: "molar",
  7: "molar",
  8: "molar"
};

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

type Runtime = {
  setSelected: (id: string) => void;
  dispose: () => void;
};

export default function ArchCanvasInner({ selectedId, onSelect, onReady, onUnavailable }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const runtimeRef = useRef<Runtime | null>(null);
  const promoRef = useRef<[() => void, () => void, (id: string) => void]>([onReady, onUnavailable, onSelect]);
  promoRef.current = [onReady, onUnavailable, onSelect];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || runtimeRef.current) return;

    let stage: ReturnType<typeof createStage>;
    try {
      stage = createStage(canvas, window.innerWidth < 768);
    } catch {
      promoRef.current[1]();
      return;
    }

    const { scene, camera, renderer, envMap } = stage;

    const group = new THREE.Group();
    group.position.z = -0.3;
    scene.add(group);

    const geometries: THREE.BufferGeometry[] = [];
    const geometryByDigit = new Map<number, THREE.BufferGeometry>();
    for (const digit of [1, 2, 3, 4, 5, 6, 7, 8] as const) {
      const shape = toothPosition(1, digit);
      const geo = buildToothGeometry({
        kind: kindByDigit[digit],
        halfWidth: shape.halfWidth,
        halfDepth: shape.halfDepth,
        crownHeight: shape.crownHeight,
        rootLength: shape.rootLength
      });
      geometryByDigit.set(digit, geo);
      geometries.push(geo);
    }

    const meshes = new Map<string, THREE.Mesh>();
    const materials = new Map<string, THREE.MeshPhysicalMaterial>();
    const baseY = new Map<string, number>();

    for (const tooth of teeth) {
      const p = toothPosition(tooth.quadrant, tooth.digit);
      const material = new THREE.MeshPhysicalMaterial({
        color: "#F6F1E3",
        roughness: 0.28,
        metalness: 0,
        clearcoat: 1,
        clearcoatRoughness: 0.15,
        envMap,
        envMapIntensity: 1.1,
        emissive: new THREE.Color("#2B40DF"),
        emissiveIntensity: 0
      });
      const mesh = new THREE.Mesh(geometryByDigit.get(tooth.digit)!, material);
      mesh.name = tooth.id;
      mesh.rotation.order = "YXZ";
      if (tooth.arch === "upper") mesh.rotation.x = Math.PI;
      mesh.rotation.y = p.angle;
      mesh.position.set(p.x, p.y, p.z);
      group.add(mesh);
      meshes.set(tooth.id, mesh);
      materials.set(tooth.id, material);
      baseY.set(tooth.id, p.y);
    }

    let selected: string | null = null;
    let hovered: string | null = null;
    let entryDone = false;

    const emissiveFor = (id: string | null): number => {
      if (!id) return 0;
      if (selected === id) return 0.45;
      if (hovered === id) return 0.18;
      return 0;
    };
    const applyEmissive = (id: string | null) => {
      if (!id) return;
      const material = materials.get(id);
      if (material) material.emissiveIntensity = emissiveFor(id);
    };

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
      entryDone = true;
    } else {
      let left = teeth.length;
      const oneDone = () => {
        left -= 1;
        if (left === 0) entryDone = true;
      };
      for (const tooth of teeth) {
        const mesh = meshes.get(tooth.id)!;
        const targetY = baseY.get(tooth.id)!;
        const delay = (tooth.digit - 1) * 0.045 + (tooth.arch === "lower" ? 0 : 0.36);
        gsap.fromTo(
          mesh.position,
          { y: targetY - 0.9 },
          { y: targetY, duration: 0.9, ease: "back.out(1.4)", delay, onComplete: oneDone }
        );
        gsap.fromTo(
          mesh.scale,
          { x: 0.6, y: 0.6, z: 0.6 },
          { x: 1, y: 1, z: 1, duration: 0.9, ease: "back.out(1.4)", delay }
        );
      }
    }

    let visible = true;
    let documentHidden = document.hidden;
    let disposed = false;
    let readySent = false;
    let raf = 0;
    let last = performance.now();
    let t = 0;
    let targetRot = 0;
    let velocity = 0;
    let amp = 0;
    let dragging = false;
    let lastX = 0;
    let moved = 0;
    let idleUntil = 0;

    const raycaster = new THREE.Raycaster();
    const ndc = new THREE.Vector2();

    const raycastAt = (clientX: number, clientY: number): string | null => {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return null;
      ndc.set(((clientX - rect.left) / rect.width) * 2 - 1, -((clientY - rect.top) / rect.height) * 2 + 1);
      raycaster.setFromCamera(ndc, camera);
      const hits = raycaster.intersectObjects(group.children, false);
      return hits.length ? hits[0].object.name : null;
    };

    const onSelectRef = () => promoRef.current[2];

    const onPointerMove = (e: PointerEvent) => {
      if (dragging) {
        const dx = e.clientX - lastX;
        lastX = e.clientX;
        targetRot = clamp(targetRot + dx * 0.006, -1.1, 1.1);
        velocity = dx * 0.006;
        moved += Math.abs(dx);
        idleUntil = performance.now() + 3000;
        return;
      }
      const id = raycastAt(e.clientX, e.clientY);
      if (hovered !== id) {
        const previous = hovered;
        hovered = id;
        applyEmissive(previous);
        applyEmissive(id);
        canvas.style.cursor = id ? "pointer" : "grab";
      }
    };

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      dragging = true;
      lastX = e.clientX;
      moved = 0;
      velocity = 0;
      canvas.setPointerCapture(e.pointerId);
      canvas.style.cursor = "grabbing";
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      canvas.releasePointerCapture(e.pointerId);
      idleUntil = performance.now() + 3000;
      if (moved < 6) {
        const id = raycastAt(e.clientX, e.clientY);
        if (id) {
          const previous = selected;
          selected = id;
          applyEmissive(previous);
          applyEmissive(id);
          onSelectRef()(id);
        }
      }
      canvas.style.cursor = hovered ? "pointer" : "grab";
    };

    const onPointerCancel = () => {
      dragging = false;
      canvas.style.cursor = hovered ? "pointer" : "grab";
    };

    canvas.style.cursor = "grab";
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointercancel", onPointerCancel);

    const ro = new ResizeObserver(() => {
      const wrap = canvas.parentElement;
      if (!wrap) return;
      const w = wrap.clientWidth;
      const h = wrap.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    });
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    const io = new IntersectionObserver((entries) => {
      visible = entries.some((e) => e.isIntersecting);
    });
    io.observe(canvas);

    const onVis = () => {
      documentHidden = document.hidden;
    };
    document.addEventListener("visibilitychange", onVis);

    const loop = (now: number) => {
      if (disposed) return;
      raf = requestAnimationFrame(loop);
      if (!visible || documentHidden) {
        last = now;
        return;
      }
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      t += dt;
      const isIdle = !dragging && now >= idleUntil;
      amp += ((isIdle ? 0.28 : 0) - amp) * Math.min(1, dt * 2.5);
      if (!dragging && Math.abs(velocity) > 0.0001) {
        targetRot = clamp(targetRot + velocity, -1.1, 1.1);
        velocity *= 0.92;
      }
      group.rotation.y = targetRot + Math.sin((t * Math.PI * 2) / 14) * amp;
      renderer.render(scene, camera);
      if (!readySent) {
        readySent = true;
        promoRef.current[0]();
      }
    };
    raf = requestAnimationFrame(loop);

    runtimeRef.current = {
      setSelected: (id: string) => {
        const previous = selected;
        selected = id;
        const applyOne = (toothId: string | null) => {
          if (!toothId) return;
          const material = materials.get(toothId);
          if (!material) return;
          const intensity = emissiveFor(toothId);
          if (material.emissiveIntensity !== intensity) {
            material.emissiveIntensity = intensity;
          }
        };
        applyOne(previous);
        applyOne(id);
        if (entryDone && id) {
          const mesh = meshes.get(id);
          if (mesh) {
            const base = baseY.get(id)!;
            gsap.to(mesh.position, { y: base + 0.08, duration: 0.3, ease: "power2.out" });
          }
        }
        if (entryDone && previous && previous !== id) {
          const prevMesh = meshes.get(previous);
          if (prevMesh) {
            gsap.to(prevMesh.position, { y: baseY.get(previous)!, duration: 0.3, ease: "power2.out" });
          }
        }
      },
      dispose: () => {
        disposed = true;
        cancelAnimationFrame(raf);
        ro.disconnect();
        io.disconnect();
        document.removeEventListener("visibilitychange", onVis);
        canvas.removeEventListener("pointermove", onPointerMove);
        canvas.removeEventListener("pointerdown", onPointerDown);
        canvas.removeEventListener("pointerup", onPointerUp);
        canvas.removeEventListener("pointercancel", onPointerCancel);
        for (const mesh of meshes.values()) {
          gsap.killTweensOf(mesh.position);
          gsap.killTweensOf(mesh.scale);
        }
        for (const material of materials.values()) material.dispose();
        for (const geo of geometries) geo.dispose();
        scene.clear();
        stage.dispose();
      }
    };

    return () => {
      runtimeRef.current?.dispose();
      runtimeRef.current = null;
    };
  }, []);

  useEffect(() => {
    runtimeRef.current?.setSelected(selectedId);
  }, [selectedId]);

  return <canvas ref={canvasRef} className="arch-canvas" aria-hidden="true" />;
}
