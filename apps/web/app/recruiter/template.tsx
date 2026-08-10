"use client";

import { motion } from "motion/react";
import { useReducedMotionSafe } from "@/hooks/use-reduced-motion-safe";

export default function Template({ children }: { children: React.ReactNode }) {
  const reduceMotion = useReducedMotionSafe();

  if (reduceMotion) {
    return <>{children}</>;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
