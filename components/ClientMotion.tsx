// ClientMotion.tsx (CLIENT COMPONENT)
"use client";

import { motion } from "framer-motion";
import React, { useState, useEffect } from "react";
type AnimationDirection =
  | "up"
  | "down"
  | "left"
  | "right"
  | "fade"
  | "scale"

interface ClientMotionProps {
  children: React.ReactNode;
  direction: AnimationDirection;
  delay: number;
  duration: number;
  threshold: number;
  once: boolean;
  className: string;
}

// Easing constants
const EASING: [number, number, number, number] = [0.22, 1, 0.36, 1];

export default function ClientMotion({
  children,
  direction,
  delay,
  duration,
  threshold,
  once,
  className,
}: ClientMotionProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Check user motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Get initial animation based on direction
  const getInitial = () => {
    if (prefersReducedMotion) return { opacity: 1, x: 0, y: 0, scale: 1 };

    switch (direction) {
      case 'left':
        return { opacity: 0, x: -30 };
      case 'right':
        return { opacity: 0, x: 30 };
      case 'down':
        return { opacity: 0, y: -30 };
      case 'fade':
        return { opacity: 0 };
      case 'scale':
        return { opacity: 0, scale: 0.9 };
      case 'up':
      default:
        return { opacity: 0, y: 30 };
    }
  };

  // If user prefers reduced motion, don't animate
  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={getInitial()}
      whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      transition={{ duration, delay, ease: EASING }}
      viewport={{ once, amount: threshold }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
