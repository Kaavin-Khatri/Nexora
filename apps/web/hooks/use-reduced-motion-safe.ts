"use client";

import { useReducedMotion } from "motion/react";

/**
 * Hook to determine if animations should be disabled.
 * Returns true if the user has requested reduced motion.
 */
export function useReducedMotionSafe() {
  const shouldReduceMotion = useReducedMotion();
  return shouldReduceMotion === true;
}
