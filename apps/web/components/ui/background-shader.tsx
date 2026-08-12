"use client";

import { motion } from "motion/react";

export function BackgroundShader() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 h-full w-full overflow-hidden bg-[#0A0A0C]">
      {/* Primary Violet Glow (Top Left) */}
      <motion.div
        animate={{
          scale: [1, 1.1, 0.9, 1],
          x: [0, 30, -20, 0],
          y: [0, -30, 20, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -top-[20%] -left-[10%] h-[80vh] w-[80vw] rounded-full mix-blend-screen opacity-15 blur-[120px]"
        style={{
          background: "radial-gradient(circle, #d0bcff 0%, transparent 70%)",
        }}
      />

      {/* Secondary Cyan Glow (Bottom Right) */}
      <motion.div
        animate={{
          scale: [1, 1.2, 0.8, 1],
          x: [0, -40, 30, 0],
          y: [0, 40, -30, 0],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-[40%] -right-[10%] h-[80vh] w-[80vw] rounded-full mix-blend-screen opacity-15 blur-[120px]"
        style={{
          background: "radial-gradient(circle, #4cd7f6 0%, transparent 70%)",
        }}
      />
    </div>
  );
}
