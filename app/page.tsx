"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";

const WorldMap = dynamic(() => import("./components/WorldMap"), { ssr: false });
import {
  ChevronDown,
  Play,
  ExternalLink,
  Star,
  Film,
  Globe,
  Clock,
  Monitor,
  Cpu,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type Lang = "en" | "fr";

interface RatingItem {
  label: string;
  value: number;
}

interface SpecItem {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any;
  label: string;
  value: string;
}

// ─── Translations ─────────────────────────────────────────────────────────────
const translations: Record<
  Lang,
  {
    langBtn: string;
    heroSuper: string;
    heroTitle: string;
    comingSoon: string;
    hudSignal: string;
    hypeTitle: string;
    hypeBtn: string;
    hypeDone: string;
    aboutTitle: string;
    aboutText: string;
    ratings: RatingItem[];
    specs: SpecItem[];
    quote: string;
    quoteAuthor: string;
    notifyTitle: string;
    notifySubtitle: string;
    ytBtn: string;
    igBtn: string;
    footerDisclaimer: string;
    footerCopy: string;
  }
> = {
  en: {
    langBtn: "FR",
    heroSuper: "ARC RAIDERS",
    heroTitle: "MANKIND RISES",
    comingSoon: "COMING SOON",
    // tagline: "When machines silence the sky, humanity digs deeper.",
    hudSignal: "[2180.XX.XX] — SIGNAL: ACTIVE",
    hypeTitle: "HOW MANY RAIDERS ARE WAITING?",
    hypeBtn: "I'm waiting for this!",
    hypeDone: "Already counted!",
    aboutTitle: "ABOUT THE SERIES",
    aboutText:
      "In 2180, on an Earth ravaged by ruthless machines, a group of renegade Raiders and the leader of an underground colony unearth a truth buried beneath the rust for a century: the extinction of humanity isn't a tragedy, it's a cleansing that has yet to be finished.",
    ratings: [
      { label: "Action", value: 92 },
      { label: "Lore Depth", value: 88 },
      { label: "Visual FX", value: 82 },
      { label: "World Building", value: 95 },
    ],
    specs: [
      { icon: Monitor, label: "Format", value: "Fan Series — Youtube" },
      { icon: Film, label: "Genre", value: "Sci-Fi / Action / Post-Apocalyptic" },
      { icon: Clock, label: "Episodes", value: "Season 1 — 6 Episodes" },
      { icon: Cpu, label: "Universe", value: "Arc Raiders™ by Embark Studios" },
    ],
    quote: `"Survival is not enough. We fight — or we vanish."`,
    quoteAuthor: "— Jax",
    notifyTitle: "BE THE FIRST TO KNOW",
    notifySubtitle: "Follow us and get notified when the first episode is out!",
    ytBtn: "YouTube",
    igBtn: "Instagram",
    footerDisclaimer:
      "Arc Raiders: Mankind Rises is an unofficial fan series. ARC Raiders and all related content are the property of Embark Studios. No copyright infringement intended.",
    footerCopy: "© 2026 Arc Raiders: Mankind Rises Fan Series",
  },
  fr: {
    langBtn: "EN",
    heroSuper: "ARC RAIDERS",
    heroTitle: "MANKIND RISES",
    comingSoon: "BIENTÔT DISPONIBLE",
    hudSignal: "[2180.XX.XX] — SIGNAL: ACTIF",
    hypeTitle: "COMBIEN DE RAIDERS ATTENDENT ?",
    hypeBtn: "J'attends ça !",
    hypeDone: "Déjà comptabilisé !",
    aboutTitle: "À PROPOS DE LA SÉRIE",
    aboutText:
      "En 2180, sur une Terre ravagée par des machines impitoyables, un groupe de Raiders renégats et la dirigeante d'une colonie souterraine mettent au jour une vérité enfouie sous la rouille depuis un siècle : l'extinction de l'humanité n'est pas une tragédie, c'est une purge qui n'a pas encore été achevée.",
    ratings: [
      { label: "Action", value: 92 },
      { label: "Profondeur", value: 88 },
      { label: "Effets Visuels", value: 82 },
      { label: "World Building", value: 95 },
    ],
    specs: [
      { icon: Monitor, label: "Format", value: "Série Fan — YouTube" },
      { icon: Film, label: "Genre", value: "Sci-Fi / Action / Post-Apocalyptique" },
      { icon: Clock, label: "Épisodes", value: "Saison 1 — 6 Épisodes" },
      { icon: Cpu, label: "Univers", value: "Arc Raiders™ par Embark Studios" },
    ],
    quote: `"Survivre ne suffit pas. Nous combattons — ou nous disparaissons."`,
    quoteAuthor: "— Jax",
    notifyTitle: "SUIVRE LE PROJET",
    notifySubtitle: "Ne manquez pas le premier épisode.",
    ytBtn: "YouTube",
    igBtn: "Instagram",
    footerDisclaimer:
      "Arc Raiders: Mankind Rises est une série fan non officielle. ARC Raiders et tout le contenu associé sont la propriété d'Embark Studios. Aucune violation de droits d'auteur n'est intentionnelle.",
    footerCopy: "© 2026 Production Fan — Non affilié à Embark Studios",
  },
};

// ─── Animation variants ───────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 36 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.1 },
  }),
};

// ─── Particles ────────────────────────────────────────────────────────────────
interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  color: string;
}

function ParticlesBg() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    setParticles(
      Array.from({ length: 38 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2.5 + 0.5,
        duration: Math.random() * 18 + 12,
        delay: Math.random() * 8,
        color:
          Math.random() > 0.5
            ? "rgba(255,150,80,0.55)"
            : "rgba(255,255,255,0.22)",
      }))
    );
  }, []);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      {particles.map((p) => (
        <motion.div
          key={p.id}
          style={{
            position: "absolute",
            borderRadius: "50%",
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: p.color,
          }}
          animate={{ y: [-8, -45, -8], opacity: [0, 1, 0] }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

// ─── Hype Button ──────────────────────────────────────────────────────────────
function HypeButton({
  label,
  doneLabel,
  onVote,
}: {
  label: string;
  doneLabel: string;
  onVote: () => void;
}) {
  const [voted, setVoted] = useState(false);
  const [burst, setBurst] = useState(false);

  useEffect(() => {
    setVoted(localStorage.getItem("arc_voted") === "1");
  }, []);

  const handleClick = () => {
    if (voted) return;
    localStorage.setItem("arc_voted", "1");
    setVoted(true);
    setBurst(true);
    onVote();
    setTimeout(() => setBurst(false), 900);
  };

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <motion.button
        onClick={handleClick}
        disabled={voted}
        style={{
          position: "relative",
          padding: "11px 28px",
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "#fff",
          background: voted
            ? "linear-gradient(135deg, #16a34a, #15803d)"
            : "linear-gradient(135deg, #f97316, #ea580c)",
          clipPath:
            "polygon(14px 0%, 100% 0%, calc(100% - 14px) 100%, 0% 100%)",
          boxShadow: voted
            ? "0 0 24px rgba(34,197,94,0.35)"
            : "0 0 32px rgba(249,115,22,0.45)",
          border: "none",
          cursor: voted ? "default" : "pointer",
          overflow: "hidden",
          fontFamily: "'Orbitron', sans-serif",
        }}
        whileHover={
          !voted
            ? { scale: 1.03, boxShadow: "0 0 50px rgba(249,115,22,0.65)" }
            : {}
        }
        whileTap={!voted ? { scale: 0.97 } : {}}
      >
        {/* Shimmer */}
        {!voted && (
          <motion.div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(90deg, transparent, rgba(255,255,255,0.22), transparent)",
              transform: "skewX(-12deg)",
              pointerEvents: "none",
            }}
            animate={{ x: ["-150%", "250%"] }}
            transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 2.5 }}
          />
        )}
        <span style={{ position: "relative", zIndex: 1 }}>
          {voted ? doneLabel : label}
        </span>
      </motion.button>

      {/* Burst */}
      <AnimatePresence>
        {burst &&
          Array.from({ length: 14 }).map((_, i) => {
            const angle = (i / 14) * Math.PI * 2;
            return (
              <motion.div
                key={i}
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  width: i % 3 === 0 ? 6 : 4,
                  height: i % 3 === 0 ? 6 : 4,
                  marginLeft: i % 3 === 0 ? -3 : -2,
                  marginTop: i % 3 === 0 ? -3 : -2,
                  borderRadius: "50%",
                  background:
                    i % 2 === 0 ? "rgba(255,150,80,0.9)" : "rgba(255,200,100,0.7)",
                  pointerEvents: "none",
                }}
                initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                animate={{
                  x: Math.cos(angle) * (65 + Math.random() * 25),
                  y: Math.sin(angle) * (65 + Math.random() * 25),
                  opacity: 0,
                  scale: 0,
                }}
                transition={{ duration: 0.85, ease: "easeOut" }}
                exit={{ opacity: 0 }}
              />
            );
          })}
      </AnimatePresence>
    </div>
  );
}

// ─── HUD Corner ───────────────────────────────────────────────────────────────
function HudCorner({ pos }: { pos: "tl" | "tr" | "bl" | "br" }) {
  const s: React.CSSProperties = {
    position: "absolute",
    width: 28,
    height: 28,
    pointerEvents: "none",
    borderStyle: "solid",
    borderColor: "rgba(255,150,80,0.35)",
    borderWidth: 0,
  };
  if (pos === "tl") { s.top = 16; s.left = 16; s.borderTopWidth = 1; s.borderLeftWidth = 1; }
  if (pos === "tr") { s.top = 16; s.right = 16; s.borderTopWidth = 1; s.borderRightWidth = 1; }
  if (pos === "bl") { s.bottom = 16; s.left = 16; s.borderBottomWidth = 1; s.borderLeftWidth = 1; }
  if (pos === "br") { s.bottom = 16; s.right = 16; s.borderBottomWidth = 1; s.borderRightWidth = 1; }
  return <div style={s} />;
}

// ─── Metal Tech Engraved Title (SVG) ─────────────────────────────────────────
// Bronze/copper surface with PCB circuit traces engraved into the letters
function TechTitle({ text }: { text: string }) {
  const FONT = "'Stick No Bills', sans-serif";
  const FS   = 102;   // font-size
  const BL   = 96;    // text baseline y
  const W    = 1000;  // viewBox width
  const H    = 115;   // viewBox height

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      style={{ width: "100%", maxWidth: 860, overflow: "visible" }}
      aria-label={text}
      role="img"
    >
      <defs>
        {/* ── Bronze gradient: bright top face → dark bottom ── */}
        <linearGradient id="bmg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#DEB96A" />
          <stop offset="28%"  stopColor="#C8A050" />
          <stop offset="62%"  stopColor="#A87C3A" />
          <stop offset="100%" stopColor="#7A5020" />
        </linearGradient>

        {/*
          ── PCB circuit trace tile 40×40 ──
          Each tile has: 1 main horizontal trace, 2 vertical branches,
          2 diagonal 45° connectors, junction pads, terminal squares.
          The dark traces will multiply over the bronze → engraved look.
        */}
        <pattern id="pcb" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
          {/* Main horizontal trace */}
          <line x1="0"  y1="20" x2="40" y2="20" stroke="rgba(16,5,0,0.60)" strokeWidth="1.3" />
          {/* Vertical branch — up */}
          <line x1="20" y1="0"  x2="20" y2="15" stroke="rgba(16,5,0,0.52)" strokeWidth="1.0" />
          {/* Vertical branch — down */}
          <line x1="20" y1="25" x2="20" y2="40" stroke="rgba(16,5,0,0.52)" strokeWidth="1.0" />
          {/* 45° spur — top-left → junction */}
          <line x1="0"  y1="6"  x2="13" y2="6"  stroke="rgba(16,5,0,0.44)" strokeWidth="0.9" />
          <line x1="13" y1="6"  x2="20" y2="15" stroke="rgba(16,5,0,0.44)" strokeWidth="0.9" />
          {/* 45° spur — junction → bottom-right */}
          <line x1="20" y1="25" x2="27" y2="33" stroke="rgba(16,5,0,0.44)" strokeWidth="0.9" />
          <line x1="27" y1="33" x2="40" y2="33" stroke="rgba(16,5,0,0.44)" strokeWidth="0.9" />
          {/* Junction pads (round) */}
          <circle cx="20" cy="20" r="2.5" fill="rgba(16,5,0,0.62)" />
          <circle cx="20" cy="15" r="1.7" fill="rgba(16,5,0,0.50)" />
          <circle cx="20" cy="25" r="1.7" fill="rgba(16,5,0,0.50)" />
          <circle cx="0"  cy="20" r="1.3" fill="rgba(16,5,0,0.38)" />
          <circle cx="40" cy="20" r="1.3" fill="rgba(16,5,0,0.38)" />
          {/* Terminal pads (square) */}
          <rect x="0"  y="4"  width="4" height="4" rx="0.5" fill="rgba(16,5,0,0.50)" />
          <rect x="36" y="31" width="4" height="4" rx="0.5" fill="rgba(16,5,0,0.50)" />
        </pattern>

        {/* ── Clip path = letter shapes, used to mask the circuit overlay ── */}
        <clipPath id="lclip">
          <text
            fontFamily={FONT} fontWeight="800"
            fontSize={FS} x="500" y={BL} textAnchor="middle"
          >{text}</text>
        </clipPath>

        {/*
          ── Horizontal brushed-metal micro-texture ──
          Very faint horizontal streaks — brossé metal feel.
          Low opacity so it doesn't alter the base color significantly.
        */}
        <filter id="hbrush" x="-1%" y="-5%" width="102%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0 1.5"
            numOctaves="2" seed="5" result="str" />
          <feColorMatrix in="str" type="matrix"
            values="0 0 0 0 0.07  0 0 0 0 0.04  0 0 0 0 0  0 0 0 0.17 0"
            result="faint" />
          <feComposite in="faint" in2="SourceGraphic" operator="in" result="masked" />
          <feBlend in="SourceGraphic" in2="masked" mode="multiply" />
        </filter>
      </defs>

      {/* ── 3D Extrusion: 9 offset copies, darkest deepest ── */}
      {[9, 8, 7, 6, 5, 4, 3, 2, 1].map((n) => (
        <text
          key={n}
          fontFamily={FONT} fontWeight="800" fontSize={FS}
          x="500" y={BL + n} textAnchor="middle"
          fill={
            n >= 7 ? "#1E0E02" :
            n >= 4 ? "#3A1C06" :
            n >= 2 ? "#582E0E" : "#7A4A1A"
          }
        >{text}</text>
      ))}

      {/* ── Main bronze face with brushed metal filter ── */}
      <text
        fontFamily={FONT} fontWeight="800" fontSize={FS}
        x="500" y={BL} textAnchor="middle"
        fill="url(#bmg)"
        filter="url(#hbrush)"
        textRendering="optimizeLegibility"
      >{text}</text>

      {/*
        ── PCB circuit engraving overlay ──
        Dark circuit traces multiplied over bronze face = incised/engraved effect.
        Clipped strictly to letter shapes so no trace appears outside letters.
      */}
      <rect
        x="-60" y="0" width="1120" height={H}
        fill="url(#pcb)"
        clipPath="url(#lclip)"
        opacity="0.88"
        style={{ mixBlendMode: "multiply" as const }}
      />
    </svg>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Home() {
  const [lang, setLang] = useState<Lang>("fr");
  const [scrollY, setScrollY] = useState(0);
  const [isWide, setIsWide] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [hypeCount, setHypeCount] = useState<number | null>(null);
  const [votes, setVotes] = useState<{ lat: number; lng: number }[]>([]);
  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _heroRef = useRef<HTMLElement>(null);

  const t = translations[lang];

  useEffect(() => {
    setMounted(true);
    setIsWide(window.innerWidth >= 768);
    setIsMobile(window.innerWidth < 640);
    const storedLang = localStorage.getItem("arc_lang") as Lang | null;
    if (storedLang === "en" || storedLang === "fr") setLang(storedLang);

    // Fetch count + vote locations
    fetch("/api/hype")
      .then((r) => r.json())
      .then((data) => {
        setHypeCount(data.count);
        setVotes(data.votes ?? []);
      })
      .catch(() => setHypeCount(0));
  }, []);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    const onResize = () => {
      setIsWide(window.innerWidth >= 768);
      setIsMobile(window.innerWidth < 640);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const toggleLang = () => {
    const next: Lang = lang === "en" ? "fr" : "en";
    setLang(next);
    localStorage.setItem("arc_lang", next);
  };

  return (
    <main style={{ background: "#000", color: "#fff", overflowX: "hidden" }}>

      {/* ── SVG Filter: Stone grain + worn edges + top lighting ── */}
      <svg
        style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}
        aria-hidden="true"
      >
        <defs>
          <filter
            id="stone-filter"
            x="-2%"
            y="-5%"
            width="104%"
            height="115%"
            colorInterpolationFilters="sRGB"
          >
            {/*
              BRUSHED METAL effect:
              Key: baseFrequency X=0.004 (very low → long horizontal streaks)
                              Y=0.85  (high     → fine vertical variation)
              This creates the characteristic horizontal lines of brushed metal.
              mode="overlay" creates both lighter AND darker streaks
              (< 0.5 gray → darkens, > 0.5 gray → lightens) = realistic brush marks.
            */}

            {/* Layer 1 — coarse horizontal brush strokes */}
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.004 0.85"
              numOctaves="4"
              seed="5"
              result="brush-coarse"
            />
            {/* Map noise → subtle gray variations around midpoint (0.35–0.65) */}
            <feColorMatrix
              in="brush-coarse"
              type="matrix"
              values="0.3 0 0 0 0.35
                      0.3 0 0 0 0.35
                      0.3 0 0 0 0.35
                      0   0 0 1 0"
              result="brush-gray"
            />
            {/* Clip to letter shapes */}
            <feComposite
              in="brush-gray"
              in2="SourceGraphic"
              operator="in"
              result="brush-masked"
            />
            {/* Overlay: creates real light/dark streaks on bronze surface */}
            <feBlend
              in="SourceGraphic"
              in2="brush-masked"
              mode="overlay"
              result="brushed"
            />

            {/* Layer 2 — fine micro-scratches on top */}
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.008 2.2"
              numOctaves="2"
              seed="11"
              result="micro-scratch"
            />
            <feColorMatrix
              in="micro-scratch"
              type="matrix"
              values="0.15 0 0 0 0.42
                      0.15 0 0 0 0.42
                      0.15 0 0 0 0.42
                      0    0 0 1 0"
              result="micro-gray"
            />
            <feComposite
              in="micro-gray"
              in2="brushed"
              operator="in"
              result="micro-masked"
            />
            <feBlend
              in="brushed"
              in2="micro-masked"
              mode="overlay"
            />
          </filter>
        </defs>
      </svg>

      {/* ── Language Switcher ──────────────────────────────────────────────── */}
      <motion.button
        onClick={toggleLang}
        style={{
          position: "fixed",
          top: 16,
          right: 16,
          zIndex: 50,
          padding: "8px 18px",
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          fontFamily: "'Orbitron', sans-serif",
          color: "rgba(255,150,80,0.85)",
          border: "1px solid rgba(255,150,80,0.4)",
          background: "rgba(0,0,0,0.65)",
          backdropFilter: "blur(8px)",
          clipPath: "polygon(7px 0%, 100% 0%, calc(100% - 7px) 100%, 0% 100%)",
          cursor: "pointer",
        }}
        whileHover={{ borderColor: "rgba(255,150,80,0.8)", color: "#fff" }}
        whileTap={{ scale: 0.95 }}
      >
        {t.langBtn}
      </motion.button>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* HERO                                                                  */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <section
        style={{
          position: "relative",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          overflow: "hidden",
          background: "#000",
        }}
      >
        {/* Hero background image */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: isMobile ? "url('/hero-bg-mobile.png')" : "url('/hero-bg.png')",
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center top",
            filter: "brightness(0.78) saturate(0.88)",
            transform:
              mounted && isWide
                ? `translateY(${scrollY * 0.3}px)`
                : undefined,
            willChange: "transform",
          }}
        />

        {/* Vignette: darkens top (title readability) + bottom (badge readability) */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.38) 20%, transparent 38%, transparent 52%, rgba(0,0,0,0.6) 75%, rgba(0,0,0,0.97) 100%)",
          }}
        />

        {/* Subtle side vignettes */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background:
              "linear-gradient(to right, rgba(0,0,0,0.35) 0%, transparent 20%, transparent 80%, rgba(0,0,0,0.35) 100%)",
          }}
        />

        {mounted && <ParticlesBg />}

        {/* Scan line */}
        <motion.div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            height: 1,
            background:
              "linear-gradient(90deg, transparent, rgba(255,150,80,0.55), transparent)",
            pointerEvents: "none",
            zIndex: 2,
          }}
          animate={{ top: ["-1px", "100%"] }}
          transition={{
            duration: 4.5,
            repeat: Infinity,
            ease: "linear",
            repeatDelay: 0.8,
          }}
        />

        {/* HUD Corners */}
        <HudCorner pos="tl" />
        <HudCorner pos="tr" />
        <HudCorner pos="bl" />
        <HudCorner pos="br" />

        {/* HUD info */}
        {mounted && isWide && (
          <div
            style={{
              position: "absolute",
              top: 22,
              left: 20,
              fontFamily: "monospace",
              fontSize: 11,
              letterSpacing: "0.2em",
              color: "rgba(255,150,80,0.38)",
              pointerEvents: "none",
              zIndex: 3,
            }}
          >
            {t.hudSignal}
          </div>
        )}

        {/* ── TOP: Title block with glitch effect ── */}
        <div
          style={{
            position: "relative",
            zIndex: 10,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            padding: "clamp(32px, 6vh, 64px) 24px 0",
          }}
        >
          {/* MANKIND RISES — PNG title with glitch effect */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, delay: 0.5 }}
            className="glitch-img"
            style={{
              width: "90vw",
              maxWidth: 1400,
              aspectRatio: "1547 / 161",
              filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.9))",
              marginTop: isMobile ? 24 : 0,
            }}
            aria-label={t.heroTitle}
          />
        </div>

        {/* ── BOTTOM: Badge + tagline ── */}
        <div
          style={{
            position: "relative",
            zIndex: 10,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            padding: "0 24px clamp(72px, 10vh, 100px)",
            gap: 14,
          }}
        >
          {/* Separator */}
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ duration: 0.9, delay: 1.0 }}
            style={{
              width: 180,
              height: 1,
              background:
                "linear-gradient(90deg, transparent, #ff9650, transparent)",
            }}
          />

          {/* COMING SOON badge */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 1.2 }}
            style={{
              fontFamily: "'Orbitron', sans-serif",
              fontSize: 10,
              letterSpacing: "0.4em",
              fontWeight: 700,
              color: "#fb923c",
              border: "1px solid rgba(249,115,22,0.42)",
              background: "rgba(0,0,0,0.55)",
              backdropFilter: "blur(6px)",
              padding: "9px 28px",
              clipPath:
                "polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%)",
            }}
          >
            {t.comingSoon}
          </motion.div>


          {/* Fan-made disclaimer + ARC Raiders logo */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 1.6 }}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span
              style={{
                fontFamily: "'Orbitron', sans-serif",
                fontSize: "clamp(9px, 2.2vw, 11px)",
                letterSpacing: "0.22em",
                fontWeight: 400,
                color: "rgba(255,255,255,0.5)",
                textTransform: "uppercase",
                textShadow: "0 0 16px rgba(0,0,0,0.9)",
              }}
            >
              A Fan-Made Series set in the universe of
            </span>
            <img
              src="/arc-raiders-logo.png"
              alt="ARC Raiders"
              style={{
                height: "clamp(22px, 7vw, 44px)",
                width: "auto",
                filter: "drop-shadow(0 2px 10px rgba(0,0,0,0.85)) brightness(0.9)",
                opacity: 0.85,
              }}
            />
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          style={{
            position: "absolute",
            bottom: 24,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 20,
          }}
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown style={{ color: "rgba(255,150,80,0.5)", width: 22, height: 22 }} />
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* HYPE COUNTER                                                          */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <section
        style={{
          position: "relative",
          padding: "clamp(56px, 10vw, 112px) clamp(16px, 4vw, 24px)",
          textAlign: "center",
          background: "#060608",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 1,
            background:
              "linear-gradient(90deg, transparent, rgba(255,150,80,0.2), transparent)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background:
              "radial-gradient(ellipse at 50% 60%, rgba(255,120,50,0.07) 0%, transparent 65%)",
          }}
        />

        {/* Two-column layout: left = counter, right = map */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1fr 1.6fr",
            gap: isMobile ? 40 : 56,
            alignItems: "center",
            maxWidth: 1100,
            margin: "0 auto",
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* Left: title + number + button */}
          <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <motion.p
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              style={{
                fontFamily: "'Orbitron', sans-serif",
                fontSize: 10,
                letterSpacing: "0.4em",
                textTransform: "uppercase",
                color: "#fb923c",
                marginBottom: 16,
              }}
            >
              {t.hypeTitle}
            </motion.p>

            <motion.div
              key={hypeCount}
              initial={{ scale: 1.18, opacity: 0.6 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              style={{
                fontFamily: "'Orbitron', sans-serif",
                fontSize: "clamp(40px, 7vw, 64px)",
                fontWeight: 900,
                color: "#fff",
                textShadow:
                  "0 0 30px rgba(255,150,80,0.65), 0 0 70px rgba(255,100,40,0.28)",
                marginBottom: 40,
              }}
            >
              {hypeCount === null ? "—" : hypeCount.toLocaleString("en-US")}
            </motion.div>

            <HypeButton
              label={t.hypeBtn}
              doneLabel={t.hypeDone}
              onVote={() => {
                fetch("/api/hype", { method: "POST" })
                  .then((r) => r.json())
                  .then((data) => setHypeCount(data.count))
                  .catch(() => setHypeCount((c) => (c ?? 0) + 1));
              }}
            />
          </div>

          {/* Right: world map */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <WorldMap votes={votes} />
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* ABOUT + SPECS                                                         */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <section
        style={{
          position: "relative",
          padding: "clamp(56px, 10vw, 112px) clamp(16px, 4vw, 24px)",
          background: "#080a0f",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 1,
            background: "rgba(255,255,255,0.05)",
          }}
        />
        <div style={{ maxWidth: 960, margin: "0 auto" }}>

          {/* Title */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            style={{ textAlign: "center", marginBottom: isMobile ? 36 : 64 }}
          >
            <h2
              style={{
                fontFamily: "'Orbitron', sans-serif",
                fontSize: "clamp(18px, 2.5vw, 24px)",
                fontWeight: 900,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "#fb923c",
                marginBottom: 16,
              }}
            >
              {t.aboutTitle}
            </h2>
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.65, delay: 0.2 }}
              style={{
                width: 72,
                height: 2,
                margin: "0 auto",
                background: "linear-gradient(90deg, transparent, #ff9650, transparent)",
              }}
            />
          </motion.div>

          {/* Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(280px, 1fr))",
              gap: isMobile ? 32 : 56,
              alignItems: "start",
            }}
          >
            {/* Left: text + rating bars */}
            <div>
              <motion.p
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                style={{
                  color: "rgba(210,200,190,0.85)",
                  lineHeight: 1.85,
                  marginBottom: 40,
                  paddingLeft: 16,
                  borderLeft: "2px solid rgba(255,150,80,0.38)",
                  fontSize: 15,
                }}
              >
                {t.aboutText}
              </motion.p>

              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {t.ratings.map((r, i) => (
                  <motion.div
                    key={r.label}
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="visible"
                    custom={i}
                    viewport={{ once: true }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 6,
                        fontSize: 11,
                        fontFamily: "monospace",
                        letterSpacing: "0.08em",
                      }}
                    >
                      <span style={{ color: "rgba(180,170,160,0.7)" }}>{r.label}</span>
                      <span style={{ color: "#fb923c" }}>{r.value}%</span>
                    </div>
                    <div
                      style={{
                        height: 4,
                        borderRadius: 99,
                        background: "rgba(255,255,255,0.06)",
                        overflow: "hidden",
                      }}
                    >
                      <motion.div
                        style={{
                          height: "100%",
                          borderRadius: 99,
                          background: "linear-gradient(90deg, #f97316, #fbbf24)",
                        }}
                        initial={{ width: 0 }}
                        whileInView={{ width: `${r.value}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.1, delay: i * 0.13, ease: "easeOut" }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Right: spec cards */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              {t.specs.map((spec, i) => (
                <motion.div
                  key={spec.label}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  custom={i}
                  viewport={{ once: true }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    padding: "18px 20px",
                    border: "1px solid rgba(255,255,255,0.07)",
                    background: "rgba(255,255,255,0.02)",
                    borderRadius: 8,
                  }}
                >
                  {/* Icon box */}
                  <div
                    style={{
                      flexShrink: 0,
                      width: 52,
                      height: 52,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: 8,
                      background: "rgba(249,115,22,0.12)",
                      border: "1px solid rgba(249,115,22,0.2)",
                    }}
                  >
                    <spec.icon style={{ width: 22, height: 22, color: "#fb923c" }} />
                  </div>
                  {/* Label + value */}
                  <div>
                    <div
                      style={{
                        fontSize: 11,
                        letterSpacing: "0.18em",
                        textTransform: "uppercase",
                        color: "rgba(150,140,128,0.75)",
                        marginBottom: 5,
                        fontFamily: "monospace",
                      }}
                    >
                      {spec.label}
                    </div>
                    <div
                      style={{
                        fontSize: "clamp(14px, 3.5vw, 17px)",
                        fontWeight: 600,
                        color: "rgba(240,232,220,0.92)",
                      }}
                    >
                      {spec.value}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* QUOTE CINEMATIC                                                       */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <section
        style={{
          position: "relative",
          padding: "clamp(56px, 10vw, 130px) clamp(16px, 4vw, 24px)",
          textAlign: "center",
          background: "#000",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background:
              "radial-gradient(ellipse at 50% 50%, rgba(255,100,30,0.07) 0%, transparent 60%)",
          }}
        />
        <div style={{ maxWidth: 860, margin: "0 auto", position: "relative" }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{
              fontFamily: "serif",
              fontSize: 80,
              lineHeight: 0.6,
              color: "rgba(255,150,80,0.18)",
              marginBottom: 24,
              userSelect: "none",
            }}
          >
            "
          </motion.div>

          <motion.blockquote
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            style={{
              fontSize: "clamp(20px, 4vw, 42px)",
              fontWeight: 800,
              fontStyle: "italic",
              color: "#f0e8d8",
              lineHeight: 1.3,
              marginBottom: 28,
              textShadow:
                "0 0 40px rgba(255,150,80,0.32), 0 0 90px rgba(255,100,40,0.12)",
            }}
          >
            {t.quote}
          </motion.blockquote>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            custom={1}
            viewport={{ once: true }}
            style={{
              fontFamily: "'Orbitron', sans-serif",
              fontSize: 10,
              letterSpacing: "0.22em",
              color: "rgba(255,150,80,0.55)",
              textTransform: "uppercase",
            }}
          >
            {t.quoteAuthor}
          </motion.p>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* CTA / NOTIFY                                                          */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <section
        style={{
          position: "relative",
          padding: "clamp(56px, 10vw, 112px) clamp(16px, 4vw, 24px)",
          textAlign: "center",
          background: "#000",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 1,
            background:
              "linear-gradient(90deg, transparent, rgba(255,150,80,0.22), transparent)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background:
              "radial-gradient(ellipse at 50% 38%, rgba(255,120,50,0.09) 0%, transparent 62%)",
          }}
        />
        {mounted && <ParticlesBg />}

        <div
          style={{
            position: "relative",
            zIndex: 10,
            maxWidth: 560,
            margin: "0 auto",
          }}
        >
          <motion.h2
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            style={{
              fontFamily: "'Orbitron', sans-serif",
              fontSize: "clamp(18px, 2.5vw, 24px)",
              fontWeight: 900,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#fb923c",
              marginBottom: 12,
            }}
          >
            {t.notifyTitle}
          </motion.h2>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            custom={1}
            viewport={{ once: true }}
            style={{ color: "rgba(160,152,140,0.75)", marginBottom: 40, fontSize: 15 }}
          >
            {t.notifySubtitle}
          </motion.p>

          <div
            style={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              flexWrap: "wrap",
              gap: 16,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {/* YouTube */}
            <motion.a
              href="#"
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              custom={2}
              viewport={{ once: true }}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                padding: "16px 32px",
                width: isMobile ? "100%" : "auto",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "#fff",
                textDecoration: "none",
                background: "linear-gradient(135deg, #f97316, #ea580c)",
                clipPath:
                  "polygon(12px 0%, 100% 0%, calc(100% - 12px) 100%, 0% 100%)",
                boxShadow: "0 0 32px rgba(249,115,22,0.5)",
                position: "relative",
                overflow: "hidden",
                fontFamily: "'Orbitron', sans-serif",
              }}
              whileHover={{ scale: 1.03, boxShadow: "0 0 55px rgba(249,115,22,0.7)" }}
              whileTap={{ scale: 0.97 }}
            >
              <motion.div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(90deg, transparent, rgba(255,255,255,0.22), transparent)",
                  transform: "skewX(-12deg)",
                  pointerEvents: "none",
                }}
                animate={{ x: ["-150%", "250%"] }}
                transition={{ duration: 2.8, repeat: Infinity, repeatDelay: 3 }}
              />
              <Play style={{ width: 14, height: 14, position: "relative" }} />
              <span style={{ position: "relative" }}>{t.ytBtn}</span>
              <ExternalLink style={{ width: 11, height: 11, position: "relative", opacity: 0.6 }} />
            </motion.a>

            {/* Instagram */}
            <motion.a
              href="#"
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              custom={3}
              viewport={{ once: true }}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                padding: "16px 32px",
                width: isMobile ? "100%" : "auto",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "rgba(255,180,120,0.85)",
                textDecoration: "none",
                border: "1px solid rgba(249,115,22,0.38)",
                clipPath:
                  "polygon(12px 0%, 100% 0%, calc(100% - 12px) 100%, 0% 100%)",
                fontFamily: "'Orbitron', sans-serif",
              }}
              whileHover={{
                borderColor: "rgba(249,115,22,0.7)",
                boxShadow: "0 0 28px rgba(249,115,22,0.28)",
                color: "#fff",
              }}
              whileTap={{ scale: 0.97 }}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ width: 14, height: 14 }}
              >
                <rect x="2" y="2" width="20" height="20" rx="5" />
                <circle cx="12" cy="12" r="5" />
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
              </svg>
              <span>{t.igBtn}</span>
            </motion.a>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* FOOTER                                                                */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <footer
        style={{
          padding: "40px 24px",
          textAlign: "center",
          background: "#000",
          borderTop: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <p
          style={{
            color: "rgba(85,80,75,0.7)",
            fontSize: 11,
            maxWidth: 600,
            margin: "0 auto 8px",
            lineHeight: 1.75,
            fontFamily: "monospace",
          }}
        >
          {t.footerDisclaimer}
        </p>
        <p
          style={{
            color: "rgba(55,52,48,0.65)",
            fontSize: 10,
            fontFamily: "monospace",
            letterSpacing: "0.06em",
          }}
        >
          {t.footerCopy}
        </p>
      </footer>
    </main>
  );
}
