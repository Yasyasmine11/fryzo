import { useEffect, useRef } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";

export function FryzoAvatar(props) {
  const group = useRef();
  const { scene, animations } = useGLTF("/RobotExpressive.glb");
  const { actions } = useAnimations(animations, group);

  useEffect(() => {
    // Lance l'animation d'attente en boucle
    const idle = actions?.Idle;
    idle?.reset().fadeIn(0.3).play();
    return () => idle?.fadeOut(0.3);
  }, [actions]);

  return (
    <group ref={group} {...props}>
      <primitive object={scene} />
    </group>
  );
}

useGLTF.preload("/RobotExpressive.glb");