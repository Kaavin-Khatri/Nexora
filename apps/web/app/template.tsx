"use client";

import { motion } from "motion/react";

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 20,
        mass: 1,
      }}
      className="flex flex-1 flex-col"
    >
      <div>{children}</div>
    </motion.div>
  );
}

