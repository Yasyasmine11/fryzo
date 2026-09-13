import { useEffect, useRef } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";

export function FryzoAvatar({ url, ...props }) {
  const group = useRef();
  const { scene, animations } = useGLTF(url);
  const { actions, names } = useAnimations(animations, group);

  useEffect(() => {
    if (!names || names.length === 0) return; // modèle sans animation
    // Cherche une animation "idle", sinon prend la première
    const idleName = names.find((n) => /idle/i.test(n)) || names[0];
    const action = actions[idleName];
    action?.reset().fadeIn(0.3).play();
    return () => action?.fadeOut(0.3);
  }, [actions, names]);

  return (
    <group ref={group} {...props}>
      <primitive object={scene} />
    </group>
  );
}