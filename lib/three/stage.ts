import * as THREE from "three";

export type Stage = {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  envMap: THREE.Texture;
  dispose: () => void;
};

export function createStage(canvas: HTMLCanvasElement, phone: boolean): Stage {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: "high-performance"
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, phone ? 1.5 : 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 40);
  camera.position.set(0, 1.4, 9.4);
  camera.lookAt(0, 0, 0);

  const scene = new THREE.Scene();

  const envScene = new THREE.Scene();
  envScene.background = new THREE.Color("#070D1C");
  const panels: Array<[string, number, number, number, number, number, number]> = [
    ["#FFFFFF", 6, 3, 0, 3.5, 2.5, 0],
    ["#BFD0FF", 4, 2, -4.5, 1, -1, Math.PI / 2.6],
    ["#93A5FF", 4, 2, 4.5, 1.5, -1.5, -Math.PI / 2.6]
  ];
  for (const [color, w, h, x, y, z, ry] of panels) {
    const panel = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide })
    );
    panel.position.set(x, y, z);
    panel.rotation.y = ry;
    envScene.add(panel);
  }
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envMap = pmrem.fromScene(envScene, 0.05).texture;
  pmrem.dispose();
  envScene.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (mesh.isMesh) {
      mesh.geometry.dispose();
      (mesh.material as THREE.Material).dispose();
    }
  });

  const key = new THREE.DirectionalLight("#FFFFFF", 1.4);
  key.position.set(3, 5, 6);
  scene.add(key);

  const rim = new THREE.DirectionalLight("#93A5FF", 0.8);
  rim.position.set(-5, 1, -4);
  scene.add(rim);

  return {
    renderer,
    scene,
    camera,
    envMap,
    dispose: () => {
      envMap.dispose();
      renderer.dispose();
    }
  };
}
