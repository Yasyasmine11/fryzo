import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { Bounds, OrbitControls } from "@react-three/drei";
import { FryzoAvatar } from "./FryzoAvatar";

export function AvatarScene() {
  return (
    <Canvas camera={{ position: [0, 0, 8], fov: 35 }}>
      <ambientLight intensity={0.9} />
      <directionalLight position={[3, 5, 2]} intensity={1.4} />

      <Suspense fallback={null}>
        <Bounds fit clip observe margin={1.2}>
          <FryzoAvatar position={[0, 0, 0]} />
        </Bounds>
      </Suspense>

      <OrbitControls
        makeDefault
        enablePan={false}
        enableZoom={false}
        minPolarAngle={Math.PI / 2.6}
        maxPolarAngle={Math.PI / 2}
      />
    </Canvas>
  );
}