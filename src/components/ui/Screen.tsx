"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";
import { useAtelierMotion } from "@/lib/motion";

interface ScreenProps {
  children?: ReactNode;
}

export function Screen({ children }: ScreenProps) {
  const motionProps = useAtelierMotion();
  return (
    <motion.div
      className="mx-auto flex w-full max-w-2xl flex-col px-5 pb-8"
      initial={motionProps.initial}
      animate={motionProps.animate}
      transition={motionProps.transition}
    >
      {children}
    </motion.div>
  );
}
