"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Phase = "boot" | "title" | "sweep" | "done";

const BOOT_LINES = [
  "ARC NETWORK — INITIALISING...",
  "CONNECTING TO SPERANZA...",
  "THREAT LEVEL: CRITICAL",
  "LOADING BROADCAST SIGNAL...",
];

export default function IntroScreen({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<Phase>("boot");
  const [progress, setProgress] = useState(0);
  const [bootLines, setBootLines] = useState<string[]>([]);

  useEffect(() => {
    if (sessionStorage.getItem("arc_intro")) {
      onComplete();
      return;
    }

    // Show boot lines one by one
    let i = 0;
    const showLine = () => {
      if (i < BOOT_LINES.length) {
        setBootLines((p) => [...p, BOOT_LINES[i]]);
        i++;
        setTimeout(showLine, 320);
      }
    };
    setTimeout(showLine, 200);

    // Fill progress bar
    let p = 0;
    const fill = setInterval(() => {
      p += Math.random() * 14 + 4;
      if (p >= 100) {
        p = 100;
        clearInterval(fill);
        setTimeout(() => setPhase("title"), 300);
      }
      setProgress(Math.min(p, 100));
    }, 90);

    return () => clearInterval(fill);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (phase === "title") {
      const t = setTimeout(() => {
        setPhase("sweep");
        setTimeout(() => {
          setPhase("done");
          sessionStorage.setItem("arc_intro", "1");
          onComplete();
        }, 750);
      }, 1800);
      return () => clearTimeout(t);
    }
  }, [phase, onComplete]);

  if (phase === "done") return null;

  return (
    <AnimatePresence>
      <motion.div
        key="intro"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
        style={{
          position: "fixed", inset: 0, zIndex: 999990,
          background: "#000",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {/* Grid overlay */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage: "linear-gradient(rgba(249,115,22,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(249,115,22,0.03) 1px,transparent 1px)",
          backgroundSize: "48px 48px",
        }} />

        {phase === "boot" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: "left", width: "min(400px,85vw)" }}>
            <div style={{ fontFamily: "monospace", fontSize: 11, letterSpacing: "0.35em", color: "#f97316", marginBottom: 32, textTransform: "uppercase" }}>
              ARC_RAIDERS — MANKIND RISES v1.0
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 36 }}>
              {bootLines.map((line, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }}
                  style={{ fontFamily: "monospace", fontSize: 12, color: i === bootLines.length - 1 ? "rgba(249,115,22,0.9)" : "rgba(255,150,80,0.45)", letterSpacing: "0.06em" }}
                >
                  &gt; {line}
                  {i === bootLines.length - 1 && bootLines.length < BOOT_LINES.length && (
                    <span className="cursor-blink" style={{ marginLeft: 4, color: "#f97316" }}>▌</span>
                  )}
                </motion.div>
              ))}
            </div>

            <div style={{ width: "100%", height: 2, background: "rgba(249,115,22,0.12)", borderRadius: 1, overflow: "hidden" }}>
              <motion.div style={{ height: "100%", background: "linear-gradient(90deg,#f97316,#fbbf24,#f97316)", backgroundSize: "200% 100%", width: `${progress}%` }}
                animate={{ backgroundPosition: ["0% 0%", "100% 0%"] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              />
            </div>
            <div style={{ marginTop: 8, fontFamily: "monospace", fontSize: 10, color: "rgba(249,115,22,0.4)", letterSpacing: "0.2em" }}>
              {Math.round(progress)}%
            </div>
          </motion.div>
        )}

        {(phase === "title" || phase === "sweep") && (
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}
            style={{ textAlign: "center" }}
          >
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              style={{ fontFamily: "'Orbitron',sans-serif", fontSize: "clamp(10px,1.8vw,13px)", letterSpacing: "0.55em", color: "rgba(249,115,22,0.6)", marginBottom: 24, textTransform: "uppercase" }}
            >
              ARC RAIDERS
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 18, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="glitch-img"
              style={{ width: "min(75vw,680px)", aspectRatio: "1547/161" }}
              aria-label="MANKIND RISES"
            />
            <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.5, duration: 0.6 }}
              style={{ width: "100%", height: 1, background: "linear-gradient(90deg,transparent,#f97316,transparent)", marginTop: 28 }}
            />
          </motion.div>
        )}

        {/* Sweep wipe */}
        {phase === "sweep" && (
          <motion.div
            initial={{ y: 0 }}
            animate={{ y: "-100%" }}
            transition={{ duration: 0.65, ease: [0.76, 0, 0.24, 1], delay: 0.05 }}
            style={{ position: "absolute", inset: 0, background: "#000", transformOrigin: "top" }}
          />
        )}

        {/* Sweep line */}
        {phase === "sweep" && (
          <motion.div
            initial={{ top: "100%", opacity: 0 }}
            animate={{ top: "-4px", opacity: [0, 1, 1, 0] }}
            transition={{ duration: 0.65, ease: [0.76, 0, 0.24, 1] }}
            style={{ position: "absolute", left: 0, right: 0, height: 2, background: "linear-gradient(90deg,transparent,#f97316,rgba(255,200,100,0.8),#f97316,transparent)", boxShadow: "0 0 20px rgba(249,115,22,0.8),0 0 40px rgba(249,115,22,0.4)", pointerEvents: "none" }}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
}
