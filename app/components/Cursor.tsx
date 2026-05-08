"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useSpring } from "framer-motion";
import { useMousePosition } from "../hooks/useMousePosition";

export default function Cursor() {
  const { x: mouseX, y: mouseY } = useMousePosition();
  const [visible, setVisible] = useState(false);
  const [pressing, setPressing] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [label, setLabel] = useState("");
  const lastEl = useRef<Element | null>(null);

  const dotX = useSpring(mouseX, { stiffness: 600, damping: 35 });
  const dotY = useSpring(mouseY, { stiffness: 600, damping: 35 });
  const ringX = useSpring(mouseX, { stiffness: 120, damping: 22 });
  const ringY = useSpring(mouseY, { stiffness: 120, damping: 22 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      setVisible(true);
      const el = document.elementFromPoint(e.clientX, e.clientY);
      if (el === lastEl.current) return;
      lastEl.current = el;
      const interactive = el?.closest("button, a, [data-cursor]");
      setHovering(!!interactive);
      setLabel((interactive as HTMLElement)?.dataset?.cursor ?? "");
    };
    const onDown = () => setPressing(true);
    const onUp = () => setPressing(false);
    const onLeave = () => setVisible(false);
    const onEnter = () => setVisible(true);

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseenter", onEnter);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseenter", onEnter);
    };
  }, []);

  if (!visible) return null;

  const ringSize = hovering ? 56 : 34;
  const dotSize = pressing ? 4 : 7;

  return (
    <>
      {/* Inner dot — instant */}
      <motion.div
        style={{
          position: "fixed", top: 0, left: 0, zIndex: 999999,
          pointerEvents: "none", borderRadius: "50%",
          width: dotSize, height: dotSize,
          background: hovering ? "#f97316" : "#fff",
          x: dotX, y: dotY,
          translateX: "-50%", translateY: "-50%",
          mixBlendMode: "difference",
        }}
        animate={{ scale: pressing ? 0.6 : 1 }}
        transition={{ duration: 0.1 }}
      />

      {/* Outer ring — spring lag */}
      <motion.div
        style={{
          position: "fixed", top: 0, left: 0, zIndex: 999998,
          pointerEvents: "none", borderRadius: "50%",
          width: ringSize, height: ringSize,
          border: hovering ? "1.5px solid rgba(249,115,22,0.9)" : "1.5px solid rgba(249,115,22,0.5)",
          background: hovering ? "rgba(249,115,22,0.08)" : "transparent",
          x: ringX, y: ringY,
          translateX: "-50%", translateY: "-50%",
        }}
        animate={{ scale: pressing ? 0.85 : 1 }}
        transition={{ duration: 0.15, ease: "easeOut" }}
      >
        {label && (
          <span style={{
            position: "absolute", inset: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "'Orbitron',sans-serif", fontSize: 7,
            fontWeight: 700, letterSpacing: "0.12em",
            color: "#fb923c", textTransform: "uppercase",
          }}>
            {label}
          </span>
        )}
      </motion.div>
    </>
  );
}
