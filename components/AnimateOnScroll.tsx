"use client";

import { motion } from "framer-motion";
import React from "react";

type Direction = "up" | "left" | "right";

export default function AnimateOnScroll({
  children,
  direction = "up",
  delay = 0,
}: {
  children: React.ReactNode;
  direction?: Direction;
  delay?: number;
}) {
  const initial =
    direction === "left"
      ? { opacity: 0, x: 30 }
      : direction === "right"
      ? { opacity: 0, x: -30 }
      : { opacity: 0, y: 30 };

  return (
    <motion.div
      initial={initial}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      viewport={{ once: true, amount: 0.2 }}
    >
      {children}
    </motion.div>
  );
}
