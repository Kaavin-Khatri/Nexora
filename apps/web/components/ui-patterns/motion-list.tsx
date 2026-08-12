"use client";

import { motion } from "motion/react";
import { useReducedMotionSafe } from "@/hooks/use-reduced-motion-safe";
import React from "react";

export function MotionList({ children, className }: { children: React.ReactNode, className?: string }) {
  const reduceMotion = useReducedMotionSafe();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: {
            staggerChildren: 0.05,
          }
        }
      }}
    >
      <div>{children}</div>
    </motion.div>
  );
}

export function MotionListItem({ children, className }: { children: React.ReactNode, className?: string }) {
  const reduceMotion = useReducedMotionSafe();
  
  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 10 },
        visible: { 
          opacity: 1, 
          y: 0,
          transition: { duration: 0.25, ease: "easeOut" }
        }
      }}
    >
      <div>{children}</div>
    </motion.div>
  );
}
