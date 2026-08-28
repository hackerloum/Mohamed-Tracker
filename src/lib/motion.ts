import { useReducedMotion } from "motion/react";

export const MOTION_MS = { min: 150, typical: 220, max: 350 } as const;

export function useAtelierMotion() {
  const reduce = useReducedMotion();
  return {
    initial: reduce ? false : { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    transition: {
      duration: reduce ? 0 : MOTION_MS.typical / 1000,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  };
}
