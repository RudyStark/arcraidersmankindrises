"use client";

import { useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

interface TiltCardProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
  intensity?: number;
}

export default function TiltCard({ children, style, className, intensity = 14 }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const [shine, setShine] = useState({ x: 50, y: 50, op: 0 });

  const rotX = useSpring(rawX, { stiffness: 160, damping: 22 });
  const rotY = useSpring(rawY, { stiffness: 160, damping: 22 });

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const cx = (e.clientX - rect.left) / rect.width - 0.5;
    const cy = (e.clientY - rect.top) / rect.height - 0.5;
    rawY.set(cx * intensity * 2);
    rawX.set(-cy * intensity);
    setShine({ x: (cx + 0.5) * 100, y: (cy + 0.5) * 100, op: 1 });
  };

  const onLeave = () => {
    rawX.set(0);
    rawY.set(0);
    setShine((s) => ({ ...s, op: 0 }));
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ ...style, rotateX: rotX, rotateY: rotY, transformStyle: "preserve-3d", perspective: "900px", position: "relative" }}
      className={className}
    >
      {children}
      {/* Shine highlight */}
      <div
        style={{
          position: "absolute", inset: 0, borderRadius: "inherit",
          pointerEvents: "none",
          background: `radial-gradient(circle at ${shine.x}% ${shine.y}%, rgba(255,150,80,0.18) 0%, transparent 60%)`,
          opacity: shine.op,
          transition: "opacity 0.3s ease",
          mixBlendMode: "screen",
        }}
      />
    </motion.div>
  );
}
