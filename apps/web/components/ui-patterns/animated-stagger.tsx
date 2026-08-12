"use client";

import { motion, type Variants } from "motion/react";
import React from "react";

export function AnimatedStagger({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className={className}
    >
      <div>{children}</div>
    </motion.div>
  );
}

export function AnimatedStaggerItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20,
      },
    },
  };

  return (
    <motion.div variants={itemVariants} className={className}>
      <div>{children}</div>
    </motion.div>
  );
}
