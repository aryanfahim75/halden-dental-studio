"use client";

import * as THREE from "three";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { createStage } from "@/lib/three/stage";
import { buildToothGeometry } from "@/lib/three/toothGeometry";
import { toothPosition } from "@/lib/three/arch";

const SHADE_COLORS = [
  "#FBFAF4",
  "#F6F1E3",
  "#F2E9D3",
  "#EFE2C2",
  "#EBDAB6",
  "#E3CFA3",
  "#DCC394",
  "#CFB283"
];

export default function ShadeCanvas({ step }: { step: number }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const runtimeRef = useRef<{ setStep: (n: number) => void; dispose: () => void } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || runtimeRef.current) return;

    let stage: ReturnType<typeof createStage>;
    try {
      stage = createStage(canvas, window.innerWidth < 768);
    } catch {
      return;
    }
    const { scene, envMap } = stage;

    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 40);
    camera.position.set(0, 0.35, 5.2);
    camera.lookAt(0, 0, 0);

    const group = new THREE.Group();
    scene.add(group);

    const geometry = buildToothGeometry({
      kind: "incisor",
      halfWidth: 0.21,
      halfDepth: 0.12,
      crownHeight: 0.38,
      rootLength: 0.5
    });

    const materials: THREE.MeshPhysicalMaterial[] = [];
    for (let i = 9; i >= 0; i--) {
      const side: 1 | 2 = i < 5 ? 1 : 2;
      const digit = (i % 5) + 1;
      const p = toothPosition(side, digit as 1 | 2 | 3 | 4 | 5);
      const material = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(SHADE_COLORS[4]),
        roughness: 0.28,
        metalness: 0,
        clearcoat: 1,
        clearcoatRoughness: 0.15,
        envMap,
        envMapIntensity: 1.1
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(p.x * 1.5, 0, p.z * 0.6);
      group.add(mesh);
      materials.push(material);
    }

    const arc = new THREE.Mesh(
      new THREE.TorusGeometry(2.5, 0.6, 16, 80, Math.PI * 0.8),
      new THREE.MeshBasicMaterial({ color: "#38101F" })
    );
    arc.position.set(0, -0.1, -1.6);
    arc.rotation.z = 0.32;
    group.add(arc);

    const key = new THREE.DirectionalLight("#FFFFFF", 1.2);
    key.position.set(2, 3, 6);
    scene.add(key);

    let visible = true;
    let documentHidden = document.hidden;
    let disposed = false;
    let raf = 0;
    let last = performance.now();

    const ro = new ResizeObserver(() => {
      const wrap = canvas.parentElement;
      if (!wrap) return;
      const w = wrap.clientWidth;
      const h = wrap.clientHeight;
      if (!w || !h) return;
      stage.renderer.setSize(w, h, false);
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
      last = now;
      stage.renderer.render(scene, camera);
    };
    raf = requestAnimationFrame(loop);

    runtimeRef.current = {
      setStep: (n: number) => {
        const target = new THREE.Color(SHADE_COLORS[n - 1]);
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        for (const material of materials) {
          const from = material.color.clone();
          if (reduced) {
            material.color.copy(target);
            continue;
          }
          const proxy = { t: 0 };
          gsap.killTweensOf(proxy);
          gsap.to(proxy, {
            t: 1,
            duration: 0.4,
            ease: "power2.out",
            onUpdate: () => material.color.copy(from).lerp(target, proxy.t)
          });
        }
      },
      dispose: () => {
        disposed = true;
        cancelAnimationFrame(raf);
        ro.disconnect();
        io.disconnect();
        document.removeEventListener("visibilitychange", onVis);
        for (const material of materials) material.dispose();
        geometry.dispose();
        arc.geometry.dispose();
        (arc.material as THREE.Material).dispose();
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
    runtimeRef.current?.setStep(step);
  }, [step]);

  return <canvas ref={canvasRef} className="shade-canvas" aria-hidden="true" />;
}
