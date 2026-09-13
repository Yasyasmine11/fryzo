import { useEffect, useRef } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";
import { LoopOnce } from "three";

const NEUTRAL = { name: "neutral", key: 0 };

// Pour chaque émotion : mots-clés d'animation à chercher (par ordre de préférence)
const EMOTION_PATTERNS = {
  happy: ["thumbsup", "wave", "jump", "dance", "happy", "cheer"],
  excited: ["jump", "dance", "thumbsup", "wave", "happy"],
  wave: ["wave", "waving", "hello", "hi"],
  hello: ["wave", "waving", "hello"],
  yes: ["yes", "nod", "thumbsup", "agree"],
  agree: ["yes", "thumbsup", "nod"],
  thumbsup: ["thumbsup", "yes"],
  no: ["no", "shake", "decline"],
  disagree: ["no", "shake"],
  dance: ["dance"],
  jump: ["jump"],
  sad: ["sad", "cry", "death", "no"],
};

function findClip(names, patterns) {
  for (const p of patterns) {
    const match = names.find((n) => n.toLowerCase().includes(p));
    if (match) return match;
  }
  return null;
}

export function FryzoAvatar({ url, emotion = NEUTRAL, ...props }) {
  const group = useRef();
  const { scene, animations } = useGLTF(url);
  const { actions, names, mixer } = useAnimations(animations, group);
  const idleName = useRef(null);

  // Animation d'attente au chargement
  useEffect(() => {
    if (!names || names.length === 0) return;
    console.log("🎬 Animations dispo pour ce modèle :", names); // DEBUG
    idleName.current = names.find((n) => /idle/i.test(n)) || names[0];
    const idle = actions[idleName.current];
    idle?.reset().fadeIn(0.3).play();
    return () => idle?.fadeOut(0.3);
  }, [actions, names]);

  // Réaction à chaque nouvelle émotion
  useEffect(() => {
    if (!names || names.length === 0) return;
    const name = emotion?.name;
    if (!name || name === "neutral") return;

    const clipName = findClip(names, EMOTION_PATTERNS[name] || [name]);
    console.log(`🎭 Émotion reçue : "${name}" → animation trouvée :`, clipName); // DEBUG

    if (!clipName || clipName === idleName.current) return;

    const idle = actions[idleName.current];
    const action = actions[clipName];
    if (!action) return;

    action.reset();
    action.setLoop(LoopOnce, 1);
    idle?.fadeOut(0.2);
    action.fadeIn(0.2).play();

    const onFinished = (e) => {
      if (e.action === action) {
        action.fadeOut(0.3);
        idle?.reset().fadeIn(0.3).play();
        mixer.removeEventListener("finished", onFinished);
      }
    };
    mixer.addEventListener("finished", onFinished);
    return () => mixer.removeEventListener("finished", onFinished);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emotion]);

  return (
    <group ref={group} {...props}>
      <primitive object={scene} />
    </group>
  );
}