"use client";

import {
  useState, useEffect, useRef, useCallback,
} from "react";
import {
  motion, AnimatePresence,
  useSpring, useTransform,
  useInView, useMotionValue,
} from "framer-motion";
import dynamic from "next/dynamic";
import { BookOpen, Shield, Film, Radio, Play, ExternalLink, X, Monitor, Cpu, Clock, ArrowRight, Database, Youtube, Instagram, type LucideIcon } from "lucide-react";
import { useMousePosition } from "./hooks/useMousePosition";
const DustFX        = dynamic(() => import("./components/DustFX"),        { ssr: false });
const CharViewportBG = dynamic(() => import("./components/CharViewportBG"), { ssr: false });

const WorldMap    = dynamic(() => import("./components/WorldMap"),    { ssr: false });
const IntroScreen = dynamic(() => import("./components/IntroScreen"), { ssr: false });

// ─── Types ────────────────────────────────────────────────────────────────────
type Lang = "en" | "fr";
type ActivePanel = "lore" | "characters" | "episodes" | "soundtracks" | "enlist" | "codex" | null;
interface RatingItem { label: string; value: number; }
interface SpecItem   { icon: LucideIcon; label: string; value: string; }
interface CharSkill  { label: string; value: number; }
interface CharData   {
  id: string; name: string; fileNum: string;
  role: string; clearance: string; statusLabel: string;
  bio: string; quote?: string;
  image?: string;
  bgImage?: boolean;
  color: string;
}
interface EpisodeData { num: number; title: string; status: string; locked: boolean; synopsis?: string; }

// ─── Translations ─────────────────────────────────────────────────────────────
const T: Record<Lang, {
  langBtn: string; comingSoon: string;
  tagline: string; joinBtn: string;
  loreLabel: string; charsLabel: string; epLabel: string; soundLabel: string;
  terminal: string[];
  hypeTitle: string; hypeBtn: string; hypeDone: string;
  charTitle: string; chars: CharData[];
  aboutTitle: string; aboutText: string;
  ratings: RatingItem[]; specs: SpecItem[];
  epTitle: string; episodes: EpisodeData[];
  ctaSub: string; ytBtn: string; igBtn: string;
  footerDisclaimer: string;
}> = {
  en: {
    langBtn: "FR",
    comingSoon: "COMING SOON",
    tagline: "The future hasn't fallen.\nIt's waiting for our rise.",
    joinBtn: "ENLIST",
    loreLabel: "LORE",
    charsLabel: "CHARACTERS",
    epLabel: "EPISODES",
    soundLabel: "SOUNDTRACKS",
    terminal: [
      "> INITIALISING RAIDER_LINK...",
      "> LOCATION: SPERANZA — TOLEDO, SOUTH CALABRETTA",
      "> ORBITER STRIKE IN: 19:42",
      "> THREAT LEVEL: ██ CRITICAL",
      "> EPISODE_01 [EXODUS] — LOADING...",
    ],
    hypeTitle: "HOW MANY RAIDERS ARE WAITING?",
    hypeBtn: "I'M WAITING FOR THIS",
    hypeDone: "COUNTED — THANK YOU, RAIDER",
    charTitle: "OPERATIVE FILES",
    chars: [
      {
        id: "jax", name: "JAX", fileNum: "JAX-001",
        role: "Rogue Squad Leader", clearance: "ROGUE", statusLabel: "HOSTILE",
        color: "#f97316",
        image: "/char-jax.png",
        bio: "Exiled to the Topside. Operates a rogue squad outside Speranza jurisdiction. No allegiance, no negotiation. Subject and squad now considered high-level threat. Last known heading: unknown.",
      },
      {
        id: "nerowbis", name: "NEROWBIS", fileNum: "NEROWBIS-002",
        role: "Tactical Marksman", clearance: "ROGUE", statusLabel: "HOSTILE",
        color: "#60a5fa",
        image: "/char-nerowbis.png",
        bio: "Tactical brain of the squad. Expert marksman — confirmed long-range eliminations under extreme conditions. Considered a decisive tactical asset. Do not underestimate.",
      },
      {
        id: "nemesis", name: "NEMESIS", fileNum: "NEMESIS-003",
        role: "Unidentified Threat", clearance: "ROGUE", statusLabel: "HOSTILE",
        color: "#e2e8f0",
        image: "/char-nemesis.png",
        bio: "Zero intelligence profile. No records, no prior affiliations, no known identity before surface contact. Subject displays extreme lethality under all conditions. Do not engage alone.",
      },
      {
        id: "celeste", name: "CELESTE", fileNum: "CEL-004",
        role: "Raider Leader — Speranza", clearance: "COMMAND", statusLabel: "ACTIVE",
        color: "#eab308",
        image: "/char-celeste.png",
        bio: "Survivor of the First Wave. Fought at Victory Ridge alongside ████████████ at age seventeen. Founded and built Speranza into humanity's last underground stronghold. Currently managing overpopulation, political unrest, and resource collapse. Preparing contingency evacuation protocols. ████████████████████████.",
      },
    ],
    aboutTitle: "ABOUT THE SERIES",
    aboutText: "In 2180, deep beneath the Rust Belt of South Calabretta, Italy, the underground city-state of Toledo clings to survival. A group of Raiders from Speranza — the oldest contrada — unearth a truth buried beneath twenty years of rust and blood: the ARC machines descending from orbit aren't random. Someone is sending them.",
    ratings: [
      { label: "Action",         value: 92 },
      { label: "Lore Depth",     value: 88 },
      { label: "Visual FX",      value: 82 },
      { label: "World Building", value: 95 },
    ],
    specs: [
      { icon: Monitor, label: "Format",    value: "Fan Series — YouTube"               },
      { icon: Film,    label: "Genre",    value: "Sci-Fi / Action / Post-Apocalyptic"  },
      { icon: Clock,   label: "Episodes", value: "Season 1 — 6 Episodes"              },
      { icon: Cpu,     label: "Setting",  value: "Toledo, South Calabretta — 2180"    },
    ],
    epTitle: "SEASON 1 — EPISODES",
    episodes: [
      { num: 1, title: "EXODUS",            status: "POST-PRODUCTION", locked: false, synopsis: "2054. EXODUS — the secret evacuation of the elites to orbit. Billions abandoned on Earth.\n\n2180. A Raider infiltrates the ruins of the Acerra Spaceport. What he uncovers was never meant to surface again." },
      { num: 2, title: "THE FIRST DESCENT", status: "CLASSIFIED",      locked: true  },
      { num: 3, title: "RUST AND IRON",     status: "CLASSIFIED",      locked: true  },
      { num: 4, title: "SPERANZA BURNS",    status: "CLASSIFIED",      locked: true  },
      { num: 5, title: "MACHINE GOSPEL",    status: "CLASSIFIED",      locked: true  },
      { num: 6, title: "MANKIND RISES",     status: "CLASSIFIED",      locked: true  },
    ],
    ctaSub: "Follow us and get notified when the first episode drops.",
    ytBtn: "YOUTUBE",
    igBtn: "INSTAGRAM",
    footerDisclaimer: "Arc Raiders: Mankind Rises is an unofficial fan series. ARC Raiders and all related content are the property of Embark Studios. No copyright infringement intended.",
  },
  fr: {
    langBtn: "EN",
    comingSoon: "BIENTÔT DISPONIBLE",
    tagline: "Le futur n'est pas tombé.\nIl attend notre relèvement.",
    joinBtn: "S'ENRÔLER",
    loreLabel: "LORE",
    charsLabel: "PERSONNAGES",
    epLabel: "ÉPISODES",
    soundLabel: "SOUNDTRACKS",
    terminal: [
      "> INITIALISATION DU RÉSEAU ARC...",
      "> LOCALISATION: SPERANZA — TOLEDO, CALABRETTA SUD",
      "> FRAPPE ORBITEUR DANS: 19:42",
      "> NIVEAU DE MENACE: ██ CRITIQUE",
      "> EPISODE_01 [EXODUS] — CHARGEMENT...",
    ],
    hypeTitle: "COMBIEN DE RAIDERS ATTENDENT ?",
    hypeBtn: "J'ATTENDS ÇA",
    hypeDone: "COMPTABILISÉ — MERCI, RAIDER",
    charTitle: "FICHIERS OPÉRATEURS",
    chars: [
      {
        id: "jax", name: "JAX", fileNum: "JAX-001",
        role: "Chef d'Escouade Renégat", clearance: "ROGUE", statusLabel: "HOSTILE",
        color: "#f97316",
        image: "/char-jax.png",
        bio: "Exilé en Surface. Opère une escouade hors de la juridiction de Speranza. Aucune allégeance, aucune négociation. Le sujet et son escouade sont considérés comme une menace de haute priorité. Dernier cap connu : inconnu.",
      },
      {
        id: "nerowbis", name: "NEROWBIS", fileNum: "NEROWBIS-002",
        role: "Tireur de Précision", clearance: "ROGUE", statusLabel: "HOSTILE",
        color: "#60a5fa",
        image: "/char-nerowbis.png",
        bio: "Cerveau tactique de l'escouade. Tireur d'élite confirmé — éliminations longue portée sous conditions extrêmes. Atout tactique décisif. Ne pas sous-estimer.",
      },
      {
        id: "nemesis", name: "NEMESIS", fileNum: "NEMESIS-003",
        role: "Menace Non Identifiée", clearance: "ROGUE", statusLabel: "HOSTILE",
        color: "#e2e8f0",
        image: "/char-nemesis.png",
        bio: "Aucun profil de renseignement. Aucun dossier, aucune affiliation antérieure, aucune identité connue avant le contact de surface. Létalité extrême dans toutes les conditions. Ne pas engager seul.",
      },
      {
        id: "celeste", name: "CELESTE", fileNum: "CEL-004",
        role: "Cheffe de Raid — Speranza", clearance: "COMMAND", statusLabel: "ACTIVE",
        color: "#eab308",
        image: "/char-celeste.png",
        bio: "Survivante de la Première Vague. A combattu à Victory Ridge aux côtés de ████████████ à dix-sept ans. A fondé et construit Speranza en dernier bastion souterrain de l'humanité. Gère actuellement la surpopulation, l'instabilité politique et l'effondrement des ressources. Prépare des protocoles d'évacuation d'urgence. ████████████████████████.",
      },
    ],
    aboutTitle: "À PROPOS DE LA SÉRIE",
    aboutText: "En 2180, au plus profond du Rust Belt de Calabretta Sud, Italie, la cité-État souterraine de Toledo s'accroche à la survie. Un groupe de Raiders de Speranza — la plus ancienne contrada — met au jour une vérité enfouie sous vingt ans de rouille et de sang : les machines ARC qui descendent de l'orbite ne sont pas aléatoires. Quelqu'un les envoie.",
    ratings: [
      { label: "Action",         value: 92 },
      { label: "Profondeur",     value: 88 },
      { label: "Effets Visuels", value: 82 },
      { label: "World Building", value: 95 },
    ],
    specs: [
      { icon: Monitor, label: "Format",    value: "Série Fan — YouTube"                  },
      { icon: Film,    label: "Genre",    value: "Sci-Fi / Action / Post-Apocalyptique" },
      { icon: Clock,   label: "Épisodes", value: "Saison 1 — 6 Épisodes"                },
      { icon: Cpu,     label: "Cadre",    value: "Toledo, Calabretta Sud — 2180"         },
    ],
    epTitle: "SAISON 1 — ÉPISODES",
    episodes: [
      { num: 1, title: "EXODUS",               status: "POST-PRODUCTION", locked: false, synopsis: "2054. EXODUS — l'évacuation secrète des élites vers l'orbite. Des milliards abandonnés sur Terre.\n\n2180. Un Raider s'infiltre dans les ruines du Spaceport d'Acerra. Ce qu'il découvre ne devait jamais refaire surface." },
      { num: 2, title: "LA PREMIÈRE DESCENTE", status: "CLASSIFIÉ",       locked: true  },
      { num: 3, title: "ROUILLE ET ACIER",     status: "CLASSIFIÉ",       locked: true  },
      { num: 4, title: "SPERANZA BRÛLE",       status: "CLASSIFIÉ",       locked: true  },
      { num: 5, title: "ÉVANGILE MACHINE",     status: "CLASSIFIÉ",       locked: true  },
      { num: 6, title: "MANKIND RISES",        status: "CLASSIFIÉ",       locked: true  },
    ],
    ctaSub: "Suivez-nous pour ne pas manquer le premier épisode.",
    ytBtn: "YOUTUBE",
    igBtn: "INSTAGRAM",
    footerDisclaimer: "Arc Raiders: Mankind Rises est une série fan non officielle. ARC Raiders et tout contenu associé sont la propriété d'Embark Studios.",
  },
};

// ─── Variants ─────────────────────────────────────────────────────────────────
const fadeUp = {
  hidden:  { opacity: 0, y: 28 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.7, delay: i * 0.1, ease: "easeOut" as const } }),
};
const stagger = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.1 } },
};
const staggerItem = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" as const } },
};

// ─── Particles ────────────────────────────────────────────────────────────────
interface Particle { id: number; x: number; y: number; size: number; duration: number; delay: number; color: string; drift: number; }
function Particles({ count = 28 }: { count?: number }) {
  const [pts, setPts] = useState<Particle[]>([]);
  useEffect(() => {
    setPts(Array.from({ length: count }, (_, i) => ({
      id: i, x: Math.random() * 100, y: Math.random() * 100,
      size: Math.random() * 2.4 + 0.4,
      duration: Math.random() * 22 + 14,
      delay: Math.random() * 12,
      drift: (Math.random() - 0.5) * 40,
      color: Math.random() > 0.55 ? "rgba(255,150,80,0.55)" : Math.random() > 0.5 ? "rgba(255,200,100,0.3)" : "rgba(255,255,255,0.18)",
    })));
  }, [count]);
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      {pts.map((p) => (
        <motion.div key={p.id}
          style={{ position: "absolute", borderRadius: "50%", left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size, background: p.color }}
          animate={{ y: [-8, -60, -8], x: [0, p.drift, 0], opacity: [0, 0.9, 0] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

// ─── HUD Corner ───────────────────────────────────────────────────────────────
function HudCorner({ pos }: { pos: "tl" | "tr" | "bl" | "br" }) {
  const s: React.CSSProperties = { position: "absolute", width: 28, height: 28, pointerEvents: "none", borderStyle: "solid", borderColor: "rgba(255,150,80,0.3)", borderWidth: 0, zIndex: 20 };
  if (pos === "tl") { s.top = 16; s.left = 16; s.borderTopWidth = 1.5; s.borderLeftWidth = 1.5; }
  if (pos === "tr") { s.top = 16; s.right = 16; s.borderTopWidth = 1.5; s.borderRightWidth = 1.5; }
  if (pos === "bl") { s.bottom = 16; s.left = 16; s.borderBottomWidth = 1.5; s.borderLeftWidth = 1.5; }
  if (pos === "br") { s.bottom = 16; s.right = 16; s.borderBottomWidth = 1.5; s.borderRightWidth = 1.5; }
  return <div style={s} />;
}

// ─── Hype Button ──────────────────────────────────────────────────────────────
function HypeButton({ label, doneLabel, onVote }: { label: string; doneLabel: string; onVote: () => void }) {
  const [voted, setVoted] = useState(false);
  const [burst, setBurst] = useState(false);
  useEffect(() => { setVoted(localStorage.getItem("arc_voted") === "1"); }, []);
  const handle = () => {
    if (voted) return;
    localStorage.setItem("arc_voted", "1");
    setVoted(true); setBurst(true); onVote();
    setTimeout(() => setBurst(false), 1000);
  };
  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <motion.button onClick={handle} disabled={voted}
        className={!voted ? "btn-pulse" : ""}
        style={{ position: "relative", padding: "13px 34px", fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#fff", background: voted ? "linear-gradient(135deg,#16a34a,#15803d)" : "linear-gradient(135deg,#f97316,#ea580c)", clipPath: "polygon(14px 0%,100% 0%,calc(100% - 14px) 100%,0% 100%)", border: "none", cursor: voted ? "default" : "pointer", overflow: "hidden", fontFamily: "'Orbitron',sans-serif" }}
        whileHover={!voted ? { scale: 1.04 } : {}} whileTap={!voted ? { scale: 0.96 } : {}}
      >
        {!voted && <motion.div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.25),transparent)", transform: "skewX(-14deg)", pointerEvents: "none" }} animate={{ x: ["-150%","250%"] }} transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 2 }} />}
        <span style={{ position: "relative", zIndex: 1 }}>{voted ? doneLabel : label}</span>
      </motion.button>
      <AnimatePresence>
        {burst && Array.from({ length: 16 }).map((_, i) => {
          const a = (i / 16) * Math.PI * 2;
          return (
            <motion.div key={i}
              style={{ position: "absolute", left: "50%", top: "50%", width: i % 3 === 0 ? 6 : 4, height: i % 3 === 0 ? 6 : 4, marginLeft: -3, marginTop: -3, borderRadius: "50%", background: i % 2 === 0 ? "#f97316" : "#fbbf24", pointerEvents: "none" }}
              initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
              animate={{ x: Math.cos(a) * (65 + Math.random() * 30), y: Math.sin(a) * (65 + Math.random() * 30), opacity: 0, scale: 0 }}
              transition={{ duration: 0.85, ease: "easeOut" }} exit={{ opacity: 0 }}
            />
          );
        })}
      </AnimatePresence>
    </div>
  );
}

// ─── Terminal ─────────────────────────────────────────────────────────────────
function Terminal({ lines }: { lines: string[] }) {
  const [shown, setShown] = useState<string[]>([]);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  useEffect(() => {
    if (!inView) return;
    setShown([]);
    let i = 0;
    const next = () => { if (i >= lines.length) return; setShown((p) => [...p, lines[i++]]); setTimeout(next, 350); };
    const t = setTimeout(next, 150);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);
  return (
    <div ref={ref} style={{ fontFamily: "monospace", fontSize: 11, letterSpacing: "0.06em", display: "flex", flexDirection: "column", gap: 9 }}>
      {shown.map((line, i) => (
        <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }}
          style={{ color: i === shown.length - 1 ? "#fb923c" : "rgba(255,150,80,0.42)" }}
        >
          {line}{i === shown.length - 1 && shown.length < lines.length && <span className="cursor-blink" style={{ marginLeft: 4, color: "#f97316" }}>▌</span>}
        </motion.div>
      ))}
      {shown.length === lines.length && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="cursor-blink" style={{ color: "#f97316" }}>▌</motion.span>}
    </div>
  );
}

// ─── Character SVGs ───────────────────────────────────────────────────────────
const charSVG: Record<string, (size?: number) => React.ReactNode> = {
  jax: (s = 160) => (
    <svg viewBox="0 0 80 130" style={{ width: s * 0.62, height: s }} aria-hidden>
      <ellipse cx="40" cy="20" rx="13" ry="13" fill="rgba(249,115,22,0.2)" stroke="#f97316" strokeWidth="1.3"/>
      <path d="M18 48 Q40 38 62 48 L67 98 Q40 106 13 98Z" fill="rgba(249,115,22,0.12)" stroke="#f97316" strokeWidth="1.1"/>
      <line x1="40" y1="33" x2="40" y2="48" stroke="#f97316" strokeWidth="1.6"/>
      <line x1="18" y1="58" x2="5"  y2="80" stroke="#f97316" strokeWidth="1.3"/>
      <line x1="62" y1="58" x2="75" y2="80" stroke="#f97316" strokeWidth="1.3"/>
      <line x1="26" y1="98" x2="23" y2="126" stroke="#f97316" strokeWidth="1.3"/>
      <line x1="54" y1="98" x2="57" y2="126" stroke="#f97316" strokeWidth="1.3"/>
      <rect x="28" y="62" width="24" height="9" rx="2" fill="rgba(249,115,22,0.28)" stroke="#f97316" strokeWidth="0.9"/>
    </svg>
  ),
  kira: (s = 160) => (
    <svg viewBox="0 0 80 130" style={{ width: s * 0.62, height: s }} aria-hidden>
      <ellipse cx="40" cy="20" rx="12" ry="12" fill="rgba(96,165,250,0.2)" stroke="#60a5fa" strokeWidth="1.3"/>
      <path d="M20 50 Q40 40 60 50 L64 96 Q40 104 16 96Z" fill="rgba(96,165,250,0.12)" stroke="#60a5fa" strokeWidth="1.1"/>
      <line x1="40" y1="32" x2="40" y2="50" stroke="#60a5fa" strokeWidth="1.6"/>
      <line x1="20" y1="60" x2="8"  y2="78" stroke="#60a5fa" strokeWidth="1.3"/>
      <line x1="60" y1="60" x2="72" y2="78" stroke="#60a5fa" strokeWidth="1.3"/>
      <line x1="28" y1="96" x2="26" y2="126" stroke="#60a5fa" strokeWidth="1.3"/>
      <line x1="52" y1="96" x2="54" y2="126" stroke="#60a5fa" strokeWidth="1.3"/>
      <circle cx="72" cy="76" r="7" fill="none" stroke="#60a5fa" strokeWidth="1.1" strokeDasharray="2.5 2.5"/>
      <circle cx="72" cy="76" r="2.5" fill="#60a5fa" opacity="0.75"/>
    </svg>
  ),
  nerowbis: (s = 160) => (
    <svg viewBox="0 0 80 130" style={{ width: s * 0.62, height: s }} aria-hidden>
      <ellipse cx="40" cy="20" rx="12" ry="12" fill="rgba(96,165,250,0.2)" stroke="#60a5fa" strokeWidth="1.3"/>
      <path d="M20 50 Q40 40 60 50 L64 96 Q40 104 16 96Z" fill="rgba(96,165,250,0.12)" stroke="#60a5fa" strokeWidth="1.1"/>
      <line x1="40" y1="32" x2="40" y2="50" stroke="#60a5fa" strokeWidth="1.6"/>
      <line x1="20" y1="60" x2="8"  y2="78" stroke="#60a5fa" strokeWidth="1.3"/>
      <line x1="60" y1="60" x2="72" y2="78" stroke="#60a5fa" strokeWidth="1.3"/>
      <line x1="28" y1="96" x2="26" y2="126" stroke="#60a5fa" strokeWidth="1.3"/>
      <line x1="52" y1="96" x2="54" y2="126" stroke="#60a5fa" strokeWidth="1.3"/>
      <circle cx="72" cy="76" r="7" fill="none" stroke="#60a5fa" strokeWidth="1.1" strokeDasharray="2.5 2.5"/>
      <circle cx="72" cy="76" r="2.5" fill="#60a5fa" opacity="0.75"/>
    </svg>
  ),
  solen: (s = 160) => (
    <svg viewBox="0 0 80 130" style={{ width: s * 0.62, height: s }} aria-hidden>
      <ellipse cx="40" cy="20" rx="13" ry="13" fill="rgba(167,139,250,0.2)" stroke="#a78bfa" strokeWidth="1.3"/>
      <path d="M17 48 Q40 37 63 48 L68 96 Q40 104 12 96Z" fill="rgba(167,139,250,0.12)" stroke="#a78bfa" strokeWidth="1.1"/>
      <line x1="40" y1="33" x2="40" y2="48" stroke="#a78bfa" strokeWidth="1.6"/>
      <line x1="17" y1="58" x2="4"  y2="82" stroke="#a78bfa" strokeWidth="1.3"/>
      <line x1="63" y1="58" x2="76" y2="82" stroke="#a78bfa" strokeWidth="1.3"/>
      <line x1="25" y1="96" x2="22" y2="126" stroke="#a78bfa" strokeWidth="1.3"/>
      <line x1="55" y1="96" x2="58" y2="126" stroke="#a78bfa" strokeWidth="1.3"/>
      <rect x="62" y="74" width="20" height="5" rx="1" fill="rgba(167,139,250,0.32)" stroke="#a78bfa" strokeWidth="0.9"/>
      <line x1="82" y1="76.5" x2="89" y2="76.5" stroke="#a78bfa" strokeWidth="2.2"/>
    </svg>
  ),
  celeste: (s = 160) => (
    <svg viewBox="0 0 80 130" style={{ width: s * 0.62, height: s }} aria-hidden>
      <ellipse cx="40" cy="20" rx="13" ry="13" fill="rgba(234,179,8,0.2)" stroke="#eab308" strokeWidth="1.3"/>
      <path d="M18 48 Q40 38 62 48 L67 98 Q40 106 13 98Z" fill="rgba(234,179,8,0.12)" stroke="#eab308" strokeWidth="1.1"/>
      <line x1="40" y1="33" x2="40" y2="48" stroke="#eab308" strokeWidth="1.6"/>
      <line x1="18" y1="58" x2="5"  y2="80" stroke="#eab308" strokeWidth="1.3"/>
      <line x1="62" y1="58" x2="75" y2="80" stroke="#eab308" strokeWidth="1.3"/>
      <line x1="26" y1="98" x2="23" y2="126" stroke="#eab308" strokeWidth="1.3"/>
      <line x1="54" y1="98" x2="57" y2="126" stroke="#eab308" strokeWidth="1.3"/>
      <rect x="28" y="62" width="24" height="9" rx="2" fill="rgba(234,179,8,0.28)" stroke="#eab308" strokeWidth="0.9"/>
    </svg>
  ),
};

// ─── Character Modal ──────────────────────────────────────────────────────────
function CharModal({ char, onClose, isWide = true }: { char: CharData; onClose: () => void; isWide?: boolean }) {
  const [barsVisible, setBarsVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setBarsVisible(true), 500);
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => { clearTimeout(t); window.removeEventListener("keydown", onKey); };
  }, [onClose]);

  const clearColor: Record<string, string> = { ALPHA: "#f97316", BETA: "#60a5fa", GAMMA: "#a78bfa" };
  const cc = clearColor[char.clearance] ?? char.color;
  const isWanted = char.statusLabel === "WANTED" || char.statusLabel === "RECHERCHÉE";

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      onClick={onClose}
      style={{ position: "fixed", inset: 0, zIndex: 99000, background: "rgba(0,0,0,0.9)", backdropFilter: "blur(16px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}
    >
      <motion.div
        initial={{ scale: 0.88, opacity: 0, y: 28, filter: "blur(12px)" }}
        animate={{ scale: 1, opacity: 1, y: 0, filter: "blur(0px)" }}
        exit={{ scale: 0.92, opacity: 0, y: -16, filter: "blur(8px)" }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        style={{ position: "relative", width: "100%", maxWidth: 860, maxHeight: "88vh", background: "#070709", border: `1px solid ${char.color}44`, borderRadius: 6, overflow: "hidden" }}
      >
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 10, backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.06) 3px,rgba(0,0,0,0.06) 4px)" }} />
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: `radial-gradient(ellipse at 20% 50%,${char.color}16 0%,transparent 60%)` }} />

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 22px", borderBottom: `1px solid ${char.color}1e`, background: "rgba(0,0,0,0.5)", position: "relative", zIndex: 11 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ fontFamily: "monospace", fontSize: 8, letterSpacing: "0.4em", color: "rgba(255,150,80,0.45)", textTransform: "uppercase" }}>▓ CLASSIFIED DOSSIER</span>
            <span style={{ fontFamily: "monospace", fontSize: 8, padding: "2px 10px", letterSpacing: "0.28em", background: `${cc}1e`, border: `1px solid ${cc}44`, color: cc, textTransform: "uppercase" }}>{char.clearance}</span>
          </div>
          <motion.button onClick={onClose}
            style={{ background: "none", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 4, padding: "5px 7px", color: "rgba(255,255,255,0.45)", cursor: "pointer", display: "flex", alignItems: "center" }}
            whileHover={{ borderColor: "rgba(249,115,22,0.5)", color: "#fff" }} whileTap={{ scale: 0.92 }}
          >
            <X style={{ width: 13, height: 13 }} />
          </motion.button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: isWide ? "200px 1fr" : "1fr", position: "relative", zIndex: 11, overflowY: "auto", maxHeight: "calc(88vh - 48px)" }} className="hide-scrollbar">
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "36px 20px", borderRight: isWide ? `1px solid ${char.color}1e` : "none", background: `${char.color}05`, minHeight: 320 }}>
            <div style={{ position: "relative" }}>
              <div style={{ position: "absolute", inset: -28, background: `radial-gradient(circle,${char.color}22 0%,transparent 70%)`, borderRadius: "50%", filter: "blur(18px)" }} />
              <motion.div style={{ position: "absolute", left: 0, right: 0, height: 2, background: `linear-gradient(90deg,transparent,${char.color}88,transparent)`, zIndex: 2 }}
                animate={{ top: ["0%","100%","0%"] }} transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }}
              />
              <div style={{ position: "relative", zIndex: 1 }}>{charSVG[char.id] ? charSVG[char.id](190) : null}</div>
            </div>
            <div style={{ marginTop: 18, fontFamily: "monospace", fontSize: 9, letterSpacing: "0.22em", color: `${char.color}66`, textTransform: "uppercase" }}>FILE #{char.fileNum}</div>
          </div>

          <div style={{ padding: "28px 26px 28px", display: "flex", flexDirection: "column", gap: 18 }}>
            <div>
              <motion.p initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15, duration: 0.5 }}
                style={{ fontFamily: "monospace", fontSize: 8, letterSpacing: "0.36em", color: char.color, textTransform: "uppercase", marginBottom: 5 }}
              >{char.role}</motion.p>
              <motion.h2 initial={{ opacity: 0, x: -18 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2, duration: 0.5 }}
                style={{ fontFamily: "'Orbitron',sans-serif", fontSize: "clamp(24px,3.5vw,36px)", fontWeight: 900, letterSpacing: "0.08em", color: "#f0e8d8", marginBottom: 10, lineHeight: 1 }}
              >{char.name}</motion.h2>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                style={{ display: "flex", alignItems: "center", gap: 8 }}
              >
                <motion.div style={{ width: 6, height: 6, borderRadius: "50%", background: isWanted ? "#ef4444" : "#22c55e" }}
                  animate={{ scale: [1,1.5,1], opacity: [1,0.4,1] }} transition={{ duration: 1.8, repeat: Infinity }}
                />
                <span style={{ fontFamily: "monospace", fontSize: 9, letterSpacing: "0.22em", color: isWanted ? "#ef4444" : "#22c55e", textTransform: "uppercase" }}>{char.statusLabel}</span>
              </motion.div>
            </div>

            <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.35, duration: 0.6 }}
              style={{ height: 1, background: `linear-gradient(90deg,${char.color}55,transparent)`, transformOrigin: "0%" }}
            />

            <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.5 }}
              style={{ fontSize: 13, lineHeight: 1.85, color: "rgba(200,192,180,0.72)", paddingLeft: 12, borderLeft: `2px solid ${char.color}38` }}
            >{char.bio}</motion.p>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}>
            </motion.div>

            <div style={{ height: 1, background: "rgba(255,255,255,0.04)" }} />

            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.5 }}
              style={{ fontFamily: "'Orbitron',sans-serif", fontSize: "clamp(10px,1.4vw,12px)", fontWeight: 700, fontStyle: "italic", color: "rgba(240,232,220,0.45)", lineHeight: 1.6 }}
            >{char.quote}</motion.div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Character Card ───────────────────────────────────────────────────────────
function CharCard({ char, onClick }: { char: CharData; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  const isWanted = char.statusLabel === "WANTED" || char.statusLabel === "RECHERCHÉE";

  return (
    <motion.div
      onClick={onClick}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileHover={{ y: -6, boxShadow: `0 0 36px ${char.color}2e, 0 0 72px ${char.color}0e, inset 0 0 0 1px ${char.color}38` }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      style={{ position: "relative", background: "#070709", border: `1px solid ${char.color}1e`, borderRadius: 6, overflow: "hidden", cursor: "pointer", userSelect: "none" }}
    >
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 10, backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.04) 3px,rgba(0,0,0,0.04) 4px)" }} />

      <AnimatePresence>
        {hovered && (
          <motion.div initial={{ top: "-30%" }} animate={{ top: "120%" }} exit={{ opacity: 0 }}
            transition={{ duration: 0.65, ease: "easeInOut" }}
            style={{ position: "absolute", left: 0, right: 0, height: "30%", background: `linear-gradient(to bottom,transparent,${char.color}10,transparent)`, pointerEvents: "none", zIndex: 9 }}
          />
        )}
      </AnimatePresence>

      <div style={{ position: "absolute", top: 0, right: 0, width: 36, height: 36, pointerEvents: "none", borderBottom: `1px solid ${char.color}38`, borderLeft: `1px solid ${char.color}38`, borderBottomLeftRadius: 8 }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, width: 36, height: 36, pointerEvents: "none", borderTop: `1px solid ${char.color}38`, borderRight: `1px solid ${char.color}38`, borderTopRightRadius: 8 }} />

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px 8px", borderBottom: `1px solid ${char.color}12` }}>
        <span style={{ fontFamily: "monospace", fontSize: 8, letterSpacing: "0.32em", color: `${char.color}77`, textTransform: "uppercase" }}>// FILE #{char.fileNum} //</span>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <motion.div style={{ width: 5, height: 5, borderRadius: "50%", background: isWanted ? "#ef4444" : "#22c55e" }}
            animate={{ opacity: [1,0.3,1], scale: [1,1.4,1] }} transition={{ duration: 2.2, repeat: Infinity }}
          />
          <span style={{ fontFamily: "monospace", fontSize: 7, letterSpacing: "0.18em", color: isWanted ? "#ef4444" : "#22c55e", textTransform: "uppercase" }}>{char.statusLabel}</span>
        </div>
      </div>

      <div style={{ position: "relative", display: "flex", justifyContent: "center", alignItems: "flex-end", padding: "22px 0 8px", minHeight: 170 }}>
        <div style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "80%", height: "60%", background: `radial-gradient(ellipse at 50% 100%,${char.color}18 0%,transparent 70%)`, filter: "blur(10px)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Orbitron',sans-serif", fontSize: "clamp(34px,5vw,48px)", fontWeight: 900, letterSpacing: "0.12em", color: `${char.color}08`, pointerEvents: "none", userSelect: "none" }}>{char.name}</div>
        <div style={{ position: "relative", zIndex: 1 }}>{charSVG[char.id] ? charSVG[char.id](160) : null}</div>
        <AnimatePresence>
          {hovered && (
            <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.92 }}
              style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.52)", backdropFilter: "blur(3px)", zIndex: 20 }}
            >
              <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 9, letterSpacing: "0.4em", color: char.color, textTransform: "uppercase", padding: "8px 18px", border: `1px solid ${char.color}77`, clipPath: "polygon(7px 0%,100% 0%,calc(100% - 7px) 100%,0% 100%)" }}>
                OPEN DOSSIER ▶
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div style={{ borderTop: `1px solid ${char.color}12`, padding: "12px 16px" }}>
        <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: "clamp(15px,2vw,18px)", fontWeight: 900, letterSpacing: "0.08em", color: "#f0e8d8", marginBottom: 3 }}>{char.name}</div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontFamily: "monospace", fontSize: 8, letterSpacing: "0.22em", color: char.color, textTransform: "uppercase" }}>{char.role}</span>
          <span style={{ fontFamily: "monospace", fontSize: 7, letterSpacing: "0.2em", padding: "2px 7px", background: `${char.color}14`, border: `1px solid ${char.color}38`, color: char.color }}>{char.clearance}</span>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Magnetic Button ──────────────────────────────────────────────────────────
function MagBtn({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const { x: mx, y: my } = useMousePosition();
  const x = useSpring(0, { stiffness: 180, damping: 18 });
  const y = useSpring(0, { stiffness: 180, damping: 18 });
  const onMove = (e: React.MouseEvent) => { if (!ref.current) return; const r = ref.current.getBoundingClientRect(); x.set((e.clientX - r.left - r.width / 2) * 0.36); y.set((e.clientY - r.top - r.height / 2) * 0.36); };
  const onLeave = () => { x.set(0); y.set(0); };
  return <motion.div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave} style={{ x, y, display: "inline-block" }}>{children}</motion.div>;
}

// ─── Arc Link Button ──────────────────────────────────────────────────────────
function ArcBtn({ href, filled, icon, label }: { href: string; filled?: boolean; icon?: React.ReactNode; label: string }) {
  return (
    <MagBtn>
      <motion.a href={href} target="_blank" rel="noopener noreferrer"
        style={{ display: "flex", alignItems: "center", gap: 9, padding: "13px 28px", fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", textDecoration: "none", cursor: "pointer", fontFamily: "'Orbitron',sans-serif", position: "relative", overflow: "hidden", clipPath: "polygon(12px 0%,100% 0%,calc(100% - 12px) 100%,0% 100%)", color: "#fff", background: filled ? "linear-gradient(135deg,#f97316,#ea580c)" : "transparent", border: filled ? "none" : "1px solid rgba(249,115,22,0.4)", boxShadow: filled ? "0 0 32px rgba(249,115,22,0.5)" : "none" }}
        whileHover={{ scale: 1.04, boxShadow: filled ? "0 0 56px rgba(249,115,22,0.7)" : "0 0 24px rgba(249,115,22,0.25)" }}
        whileTap={{ scale: 0.96 }}
      >
        {filled && <motion.div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.22),transparent)", transform: "skewX(-14deg)", pointerEvents: "none" }} animate={{ x: ["-150%","250%"] }} transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 3.5 }} />}
        {icon && <span style={{ position: "relative", zIndex: 1 }}>{icon}</span>}
        <span style={{ position: "relative", zIndex: 1 }}>{label}</span>
        <ExternalLink style={{ width: 10, height: 10, position: "relative", zIndex: 1, opacity: 0.45 }} />
      </motion.a>
    </MagBtn>
  );
}

// ─── Ambient Glow ─────────────────────────────────────────────────────────────
function AmbientGlow() {
  const { x, y } = useMousePosition();
  const sx = useSpring(x, { stiffness: 50, damping: 20 });
  const sy = useSpring(y, { stiffness: 50, damping: 20 });
  return <motion.div style={{ position: "fixed", top: 0, left: 0, width: 800, height: 800, borderRadius: "50%", background: "radial-gradient(circle,rgba(249,115,22,0.08) 0%,transparent 70%)", x: sx, y: sy, translateX: "-50%", translateY: "-50%", pointerEvents: "none", zIndex: 1, filter: "blur(20px)" }} />;
}

// ─── Menu Item ────────────────────────────────────────────────────────────────
function MenuItem({ icon: Icon, label, num, active, onClick }: {
  icon: LucideIcon; label: string; num: string; active: boolean; onClick: () => void;
}) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const [hovered, setHovered] = useState(false);
  const rawX = useMotionValue(50); const rawY = useMotionValue(50);
  const glowX = useSpring(rawX, { stiffness: 220, damping: 20 });
  const glowY = useSpring(rawY, { stiffness: 220, damping: 20 });
  const glowBg = useTransform([glowX, glowY], ([x, y]: number[]) =>
    `radial-gradient(ellipse at ${x}% ${y}%, rgba(249,115,22,0.24) 0%, rgba(249,115,22,0.04) 55%, transparent 75%)`
  );
  const onMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect();
    rawX.set(((e.clientX - r.left) / r.width) * 100);
    rawY.set(((e.clientY - r.top) / r.height) * 100);
  };
  const lit = active || hovered;

  return (
    <motion.button
      ref={btnRef} onClick={onClick} onMouseMove={onMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); rawX.set(50); rawY.set(50); }}
      whileTap={{ scale: 0.97 }}
      style={{
        display: "flex", alignItems: "stretch", width: "100%",
        cursor: "pointer", position: "relative",
        background: lit ? "rgba(249,115,22,0.1)" : "rgba(0,0,0,0.52)",
        border: `1px solid ${lit ? "rgba(249,115,22,0.52)" : "rgba(255,255,255,0.09)"}`,
        borderRadius: 4, overflow: "hidden", backdropFilter: "blur(10px)",
        boxShadow: lit ? "0 0 18px rgba(249,115,22,0.1), inset 0 0 16px rgba(249,115,22,0.04)" : "none",
        transition: "background 0.2s, border-color 0.2s, box-shadow 0.2s",
      }}
    >
      {/* Mouse-tracking glow */}
      <motion.div style={{ position: "absolute", inset: 0, background: glowBg, opacity: hovered ? 1 : 0, transition: "opacity 0.25s", pointerEvents: "none" }} />

      {/* Scan sweep */}
      {hovered && (
        <motion.div key="sweep"
          style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg,transparent,rgba(249,115,22,0.26),transparent)", transform: "skewX(-14deg)", pointerEvents: "none", zIndex: 2 }}
          initial={{ x: "-160%" }} animate={{ x: "220%" }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        />
      )}

      {/* Left edge glow */}
      <motion.div
        animate={{ opacity: lit ? 1 : 0, boxShadow: lit ? "0 0 12px rgba(249,115,22,1), 0 0 28px rgba(249,115,22,0.5)" : "none" }}
        transition={{ duration: 0.2 }}
        style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 2.5, background: "linear-gradient(to bottom,transparent,#f97316,transparent)", pointerEvents: "none", zIndex: 3 }}
      />

      {/* HUD corner brackets */}
      <motion.span animate={{ opacity: hovered ? 1 : 0, x: hovered ? 0 : -3, y: hovered ? 0 : -3 }} transition={{ duration: 0.16 }}
        style={{ position: "absolute", top: 3, left: 4, width: 5, height: 5, borderTop: "1px solid rgba(249,115,22,0.9)", borderLeft: "1px solid rgba(249,115,22,0.9)", pointerEvents: "none", zIndex: 3 }} />
      <motion.span animate={{ opacity: hovered ? 1 : 0, x: hovered ? 0 : 3, y: hovered ? 0 : 3 }} transition={{ duration: 0.16 }}
        style={{ position: "absolute", bottom: 3, right: 4, width: 5, height: 5, borderBottom: "1px solid rgba(249,115,22,0.9)", borderRight: "1px solid rgba(249,115,22,0.9)", pointerEvents: "none", zIndex: 3 }} />

      {/* Active pulse */}
      {active && (
        <motion.div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 28px 50%,rgba(249,115,22,0.18) 0%,transparent 60%)", pointerEvents: "none" }}
          animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 2.4, repeat: Infinity }} />
      )}

      {/* Icon box */}
      <div style={{ width: 52, minHeight: 52, display: "flex", alignItems: "center", justifyContent: "center", borderRight: `1px solid ${lit ? "rgba(249,115,22,0.22)" : "rgba(255,255,255,0.06)"}`, background: lit ? "rgba(249,115,22,0.1)" : "rgba(255,255,255,0.022)", flexShrink: 0, transition: "background 0.2s, border-color 0.2s", position: "relative", zIndex: 1 }}>
        <motion.div animate={{ filter: hovered ? "drop-shadow(0 0 6px rgba(249,115,22,0.9))" : "none" }} transition={{ duration: 0.2 }}>
          <Icon size={18} color={lit ? "#f97316" : "rgba(200,185,168,0.42)"} />
        </motion.div>
      </div>

      {/* Label */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", padding: "0 16px", position: "relative", zIndex: 1 }}>
        <span className="g-hover" data-text={label}
          style={{ fontFamily: "'Orbitron',sans-serif", fontSize: "clamp(9px,1vw,11px)", fontWeight: 700, letterSpacing: "0.22em", color: lit ? "#f0e8d8" : "rgba(175,162,148,0.68)", textTransform: "uppercase", transition: "color 0.2s" }}>
          {label}
        </span>
      </div>

      {/* Number */}
      <span style={{ display: "flex", alignItems: "center", padding: "0 14px", fontFamily: "monospace", fontSize: 10, letterSpacing: "0.08em", color: lit ? "rgba(249,115,22,0.9)" : "rgba(249,115,22,0.35)", flexShrink: 0, transition: "color 0.2s", position: "relative", zIndex: 1 }}>
        {num}
      </span>
    </motion.button>
  );
}

// ─── Right HUD Column (desktop home) ─────────────────────────────────────────
function RightHUD({ hypeCount, lang }: { hypeCount: number | null; lang: Lang }) {
  const ref = useRef<HTMLDivElement>(null);
  const rawX = useMotionValue(0); const rawY = useMotionValue(0);
  const rotX = useSpring(rawX, { stiffness: 90, damping: 20 });
  const rotY = useSpring(rawY, { stiffness: 90, damping: 20 });
  const countdown = useCountdown(EP1_RELEASE);
  const today = new Date();
  const dateStr = `${today.getFullYear()}.${String(today.getMonth()+1).padStart(2,"0")}.${String(today.getDate()).padStart(2,"0")}`;
  const timeStr = `${String(today.getUTCHours()).padStart(2,"0")}:${String(today.getUTCMinutes()).padStart(2,"0")} UTC`;

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    rawX.set(((e.clientY - r.top) / r.height - 0.5) * -10);
    rawY.set(((e.clientX - r.left) / r.width - 0.5) * 10);
  };

  const padT = (n: number) => String(n).padStart(2, "0");

  return (
    <motion.div ref={ref} onMouseMove={onMove} onMouseLeave={() => { rawX.set(0); rawY.set(0); }}
      style={{ rotateX: rotX, rotateY: rotY, transformStyle: "preserve-3d", perspective: "900px", display: "flex", flexDirection: "column", gap: 10, width: 290 }}
    >

      {/* ── Block 1: EPISODE COUNTDOWN ── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 0.6, ease: [0.16,1,0.3,1] }}
        style={{ position: "relative", background: "rgba(4,2,0,0.94)", border: "1px solid rgba(249,115,22,0.35)", borderRadius: 8, overflow: "hidden",
          boxShadow: "0 0 40px rgba(249,115,22,0.1), inset 0 1px 0 rgba(255,180,80,0.06)",
          clipPath: "polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))" }}
      >
        {/* Ambient glow */}
        <motion.div animate={{ opacity: [0.3,0.7,0.3] }} transition={{ duration: 3.5, repeat: Infinity }}
          style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 0%, rgba(249,115,22,0.14) 0%, transparent 65%)", pointerEvents: "none" }} />
        {/* Scan line */}
        <motion.div style={{ position: "absolute", left: 0, right: 0, height: 1, background: "linear-gradient(90deg,transparent,rgba(249,115,22,0.5),rgba(255,200,80,0.7),rgba(249,115,22,0.5),transparent)", pointerEvents: "none", zIndex: 4 }}
          animate={{ top: ["-2px","102%"] }} transition={{ duration: 4, repeat: Infinity, ease: "linear", repeatDelay: 2.5 }} />
        {/* Corner brackets */}
        <span style={{ position:"absolute",top:4,left:4,width:9,height:9,borderTop:"1px solid rgba(249,115,22,0.9)",borderLeft:"1px solid rgba(249,115,22,0.9)",pointerEvents:"none",zIndex:5 }} />
        <span style={{ position:"absolute",top:4,right:4,width:9,height:9,borderTop:"1px solid rgba(249,115,22,0.5)",borderRight:"1px solid rgba(249,115,22,0.5)",pointerEvents:"none",zIndex:5 }} />
        <span style={{ position:"absolute",bottom:4,left:4,width:9,height:9,borderBottom:"1px solid rgba(249,115,22,0.5)",borderLeft:"1px solid rgba(249,115,22,0.5)",pointerEvents:"none",zIndex:5 }} />
        <span style={{ position:"absolute",bottom:4,right:4,width:9,height:9,borderBottom:"1px solid rgba(249,115,22,0.9)",borderRight:"1px solid rgba(249,115,22,0.9)",pointerEvents:"none",zIndex:5 }} />

        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"8px 14px", borderBottom:"1px solid rgba(249,115,22,0.12)", background:"rgba(249,115,22,0.05)", position:"relative", zIndex:2 }}>
          <div style={{ display:"flex", alignItems:"center", gap:7 }}>
            <motion.span animate={{ opacity:[1,0.2,1] }} transition={{ duration:1.6, repeat:Infinity }}
              style={{ width:5,height:5,borderRadius:"50%",background:"#f97316",display:"inline-block",boxShadow:"0 0 6px #f97316" }} />
            <span style={{ fontFamily:"monospace",fontSize:7,letterSpacing:"0.36em",color:"rgba(249,115,22,0.85)",textTransform:"uppercase" }}>
              {lang==="fr" ? "ÉPISODE 01 — ARRIVÉE" : "EPISODE 01 — INCOMING"}
            </span>
          </div>
          <span style={{ fontFamily:"monospace",fontSize:6.5,letterSpacing:"0.2em",color:"rgba(255,150,80,0.45)" }}>2026.05.28</span>
        </div>

        {/* Countdown digits */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:6, padding:"16px 14px 14px", position:"relative", zIndex:2 }}>
          {[
            { v: padT(countdown.days),    l: lang==="fr"?"JOURS":"DAYS" },
            { v: padT(countdown.hours),   l: lang==="fr"?"HRES":"HRS" },
            { v: padT(countdown.minutes), l: "MIN" },
            { v: padT(countdown.seconds), l: "SEC" },
          ].map((item, i) => (
            <div key={i} style={{ textAlign:"center", position:"relative" }}>
              <div style={{ position:"absolute",inset:0,background:"rgba(249,115,22,0.04)",border:"1px solid rgba(249,115,22,0.12)",borderRadius:4 }} />
              <motion.div
                key={item.v}
                initial={{ opacity:0.5, y:-4 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.25 }}
                style={{ fontFamily:"'Orbitron',sans-serif",fontSize:22,fontWeight:900,color:"#fff",lineHeight:1,paddingTop:8,
                  textShadow:"0 0 20px rgba(249,115,22,0.7)",position:"relative",zIndex:1 }}
              >{item.v}</motion.div>
              <div style={{ fontFamily:"monospace",fontSize:6,letterSpacing:"0.3em",color:"rgba(255,150,80,0.4)",textTransform:"uppercase",paddingBottom:7,position:"relative",zIndex:1 }}>{item.l}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Block 2: LAST UPDATE ── */}
      <motion.div
        initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.85, duration:0.6, ease:[0.16,1,0.3,1] }}
        style={{ position:"relative", background:"rgba(4,2,0,0.92)", border:"1px solid rgba(249,115,22,0.22)", borderRadius:8, overflow:"hidden",
          boxShadow:"0 0 24px rgba(249,115,22,0.06), inset 0 1px 0 rgba(255,180,80,0.04)",
          clipPath:"polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%)" }}
      >
        <div style={{ position:"absolute",inset:0,backgroundImage:"repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.07) 2px,rgba(0,0,0,0.07) 4px)",pointerEvents:"none",zIndex:3 }} />
        <span style={{ position:"absolute",top:3,left:3,width:7,height:7,borderTop:"1px solid rgba(249,115,22,0.7)",borderLeft:"1px solid rgba(249,115,22,0.7)",pointerEvents:"none",zIndex:5 }} />
        <span style={{ position:"absolute",bottom:3,right:3,width:7,height:7,borderBottom:"1px solid rgba(56,189,248,0.5)",borderRight:"1px solid rgba(56,189,248,0.5)",pointerEvents:"none",zIndex:5 }} />
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"7px 12px", borderBottom:"1px solid rgba(249,115,22,0.1)", position:"relative", zIndex:2 }}>
          <div style={{ display:"flex",alignItems:"center",gap:7 }}>
            <motion.span animate={{ opacity:[1,0.2,1],boxShadow:["0 0 5px #f97316","0 0 2px #f97316","0 0 8px #f97316"] }} transition={{ duration:1.8,repeat:Infinity }}
              style={{ width:4,height:4,borderRadius:"50%",background:"#f97316",display:"inline-block" }} />
            <span style={{ fontFamily:"monospace",fontSize:7,letterSpacing:"0.36em",color:"rgba(249,115,22,0.75)",textTransform:"uppercase" }}>LAST UPDATE</span>
          </div>
          <span style={{ fontFamily:"monospace",fontSize:6.5,letterSpacing:"0.18em",color:"rgba(56,189,248,0.55)" }}>v2.5.0</span>
        </div>
        <div style={{ padding:"12px 12px 8px", position:"relative", zIndex:2 }}>
          <motion.div animate={{ textShadow:["0 0 16px rgba(249,115,22,0.5)","0 0 28px rgba(249,115,22,0.85)","0 0 16px rgba(249,115,22,0.5)"] }} transition={{ duration:3, repeat:Infinity }}
            style={{ fontFamily:"'Orbitron',sans-serif",fontSize:20,fontWeight:900,color:"#fff",letterSpacing:"0.08em",lineHeight:1,marginBottom:5 }}>
            {dateStr}
          </motion.div>
          <div style={{ height:1,background:"linear-gradient(90deg,rgba(249,115,22,0.6),rgba(56,189,248,0.3),transparent)",marginBottom:5 }} />
          <span style={{ fontFamily:"monospace",fontSize:7,letterSpacing:"0.26em",color:"rgba(255,200,100,0.5)" }}>SYS // {timeStr}</span>
        </div>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",borderTop:"1px solid rgba(249,115,22,0.08)",position:"relative",zIndex:2 }}>
          <div style={{ padding:"6px 12px",borderRight:"1px solid rgba(249,115,22,0.08)" }}>
            <div style={{ fontFamily:"monospace",fontSize:6,letterSpacing:"0.28em",color:"rgba(249,115,22,0.35)",textTransform:"uppercase",marginBottom:2 }}>NEXT EP</div>
            <div style={{ fontFamily:"monospace",fontSize:8,fontWeight:700,letterSpacing:"0.18em",color:"rgba(255,200,100,0.85)" }}>
              {countdown.done ? "EP.01 LIVE" : `EP.01 J-${countdown.days}`}
            </div>
          </div>
          <div style={{ padding:"6px 12px" }}>
            <div style={{ fontFamily:"monospace",fontSize:6,letterSpacing:"0.28em",color:"rgba(56,189,248,0.35)",textTransform:"uppercase",marginBottom:2 }}>STATUS</div>
            <div style={{ display:"flex",alignItems:"center",gap:4 }}>
              <motion.span animate={{ opacity:[1,0.3,1] }} transition={{ duration:1.4,repeat:Infinity }}
                style={{ width:4,height:4,borderRadius:"50%",background:"#22c55e",display:"inline-block",boxShadow:"0 0 5px #22c55e" }} />
              <span style={{ fontFamily:"monospace",fontSize:8,fontWeight:700,letterSpacing:"0.18em",color:"#22c55e" }}>ACTIVE</span>
            </div>
          </div>
        </div>
        {/* data stream */}
        <div style={{ padding:"4px 12px",borderTop:"1px solid rgba(249,115,22,0.07)",background:"rgba(0,0,0,0.25)",overflow:"hidden",position:"relative",zIndex:2 }}>
          <motion.div animate={{ x:["0%","-50%"] }} transition={{ duration:16,repeat:Infinity,ease:"linear" }}
            style={{ display:"flex",gap:24,whiteSpace:"nowrap" }}>
            {["ARC-NET::ONLINE","SIGNAL::LOCKED","SPERANZA::ACTIVE","RESIST.GRID::OK","ARC-NET::ONLINE","SIGNAL::LOCKED","SPERANZA::ACTIVE","RESIST.GRID::OK"].map((txt,i)=>(
              <span key={i} style={{ fontFamily:"monospace",fontSize:6,letterSpacing:"0.22em",color:"rgba(249,115,22,0.22)",textTransform:"uppercase" }}>{txt}</span>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* ── Block 3: RAIDERS READY ── */}
      <motion.div
        initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:1.0, duration:0.6, ease:[0.16,1,0.3,1] }}
        style={{ position:"relative", background:"rgba(4,2,0,0.92)", border:"1px solid rgba(249,115,22,0.18)", borderRadius:8, overflow:"hidden",
          boxShadow:"0 0 20px rgba(249,115,22,0.05)" }}
      >
        <motion.div animate={{ opacity:[0.2,0.5,0.2] }} transition={{ duration:4,repeat:Infinity }}
          style={{ position:"absolute",inset:0,background:"radial-gradient(ellipse at 50% 50%,rgba(249,115,22,0.08) 0%,transparent 70%)",pointerEvents:"none" }} />
        <span style={{ position:"absolute",top:3,left:3,width:6,height:6,borderTop:"1px solid rgba(249,115,22,0.6)",borderLeft:"1px solid rgba(249,115,22,0.6)",pointerEvents:"none",zIndex:5 }} />
        <span style={{ position:"absolute",bottom:3,right:3,width:6,height:6,borderBottom:"1px solid rgba(249,115,22,0.6)",borderRight:"1px solid rgba(249,115,22,0.6)",pointerEvents:"none",zIndex:5 }} />
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 14px",position:"relative",zIndex:2 }}>
          <div>
            <div style={{ fontFamily:"monospace",fontSize:6.5,letterSpacing:"0.32em",color:"rgba(255,150,80,0.4)",textTransform:"uppercase",marginBottom:4 }}>
              {lang==="fr" ? "RAIDERS PRÊTS" : "RAIDERS READY"}
            </div>
            <motion.div
              key={hypeCount}
              initial={{ scale:1.1,opacity:0.4 }} animate={{ scale:1,opacity:1 }} transition={{ duration:0.45 }}
              style={{ fontFamily:"'Orbitron',sans-serif",fontSize:28,fontWeight:900,color:"#fff",lineHeight:1,textShadow:"0 0 22px rgba(255,150,80,0.6)" }}
            >
              {hypeCount === null ? "—" : hypeCount.toLocaleString("en-US")}
            </motion.div>
          </div>
          {/* Signal bars */}
          <div style={{ display:"flex",alignItems:"flex-end",gap:2 }}>
            {[4,7,10,13,9].map((h,i)=>(
              <motion.span key={i}
                animate={{ height:[h,h+4,h],opacity:[0.5,1,0.5] }}
                transition={{ duration:1.4,repeat:Infinity,delay:i*0.25,ease:"easeInOut" }}
                style={{ width:3,background:i<4?"rgba(249,115,22,0.7)":"rgba(249,115,22,0.2)",borderRadius:1,display:"inline-block" }} />
            ))}
          </div>
        </div>
      </motion.div>

    </motion.div>
  );
}

// ─── Last Update Widget ───────────────────────────────────────────────────────
function LastUpdateWidget({ mobile = false }: { mobile?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const rawX = useMotionValue(0); const rawY = useMotionValue(0);
  const rotX = useSpring(rawX, { stiffness: 120, damping: 22 });
  const rotY = useSpring(rawY, { stiffness: 120, damping: 22 });
  const glowX = useMotionValue(50); const glowY = useMotionValue(50);
  const glowBg = useTransform([glowX, glowY], ([x, y]: number[]) =>
    `radial-gradient(ellipse at ${x}% ${y}%, rgba(249,115,22,0.18) 0%, rgba(56,189,248,0.06) 50%, transparent 72%)`
  );

  const countdown = useCountdown(EP1_RELEASE);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current || mobile) return;
    const r = ref.current.getBoundingClientRect();
    const cx = (e.clientX - r.left) / r.width;
    const cy = (e.clientY - r.top) / r.height;
    rawX.set((cy - 0.5) * -14);
    rawY.set((cx - 0.5) * 14);
    glowX.set(cx * 100); glowY.set(cy * 100);
  };
  const onLeave = () => { rawX.set(0); rawY.set(0); };

  const today = new Date();
  const dateStr = `${today.getFullYear()}.${String(today.getMonth()+1).padStart(2,"0")}.${String(today.getDate()).padStart(2,"0")}`;
  const timeStr = `${String(today.getUTCHours()).padStart(2,"0")}:${String(today.getUTCMinutes()).padStart(2,"0")} UTC`;
  const epLabel = countdown.done ? "EP.01 — LIVE" : `EP.01 — J-${countdown.days}`;

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={mobile ? {} : {
        rotateX: rotX, rotateY: rotY,
        transformStyle: "preserve-3d", perspective: "800px",
      }}
      animate={mobile ? {} : { opacity: [0.85, 1, 0.85] }}
      transition={mobile ? {} : { duration: 5, repeat: Infinity, ease: "easeInOut" }}
    >
      <motion.div
        style={{
          position: "relative",
          width: mobile ? "100%" : 310,
          background: "rgba(4,3,1,0.92)",
          backdropFilter: "blur(18px)",
          border: "1px solid rgba(249,115,22,0.28)",
          borderRadius: mobile ? 10 : 8,
          overflow: "hidden",
          boxShadow: "0 0 32px rgba(249,115,22,0.08), 0 0 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,180,80,0.06)",
          clipPath: mobile ? "none" : "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 0 100%)",
        }}
      >
        {/* Animated bg glow */}
        <motion.div style={{ position: "absolute", inset: 0, background: glowBg, pointerEvents: "none" }} />

        {/* Moving scanline */}
        <motion.div
          style={{ position: "absolute", left: 0, right: 0, height: 1, background: "linear-gradient(90deg,transparent,rgba(249,115,22,0.35),rgba(255,200,80,0.55),rgba(249,115,22,0.35),transparent)", pointerEvents: "none", zIndex: 4 }}
          animate={{ top: ["-2px", "110%"] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "linear", repeatDelay: 2 }}
        />

        {/* CRT scanlines overlay */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.08) 2px,rgba(0,0,0,0.08) 4px)", pointerEvents: "none", zIndex: 3 }} />

        {/* Corner decorations */}
        <span style={{ position: "absolute", top: 4, left: 4, width: 8, height: 8, borderTop: "1px solid rgba(249,115,22,0.8)", borderLeft: "1px solid rgba(249,115,22,0.8)", pointerEvents: "none", zIndex: 5 }} />
        <span style={{ position: "absolute", bottom: 4, right: 4, width: 8, height: 8, borderBottom: "1px solid rgba(56,189,248,0.6)", borderRight: "1px solid rgba(56,189,248,0.6)", pointerEvents: "none", zIndex: 5 }} />
        <span style={{ position: "absolute", bottom: 4, left: 4, width: 8, height: 8, borderBottom: "1px solid rgba(249,115,22,0.4)", borderLeft: "1px solid rgba(249,115,22,0.4)", pointerEvents: "none", zIndex: 5 }} />

        {/* Header bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 12px", borderBottom: "1px solid rgba(249,115,22,0.12)", background: "rgba(249,115,22,0.05)", position: "relative", zIndex: 2 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <motion.span
              animate={{ opacity: [1, 0.2, 1], boxShadow: ["0 0 5px #f97316","0 0 2px #f97316","0 0 8px #f97316"] }}
              transition={{ duration: 1.8, repeat: Infinity }}
              style={{ width: 5, height: 5, borderRadius: "50%", background: "#f97316", display: "inline-block" }}
            />
            <span style={{ fontFamily: "monospace", fontSize: 7, letterSpacing: "0.36em", color: "rgba(249,115,22,0.75)", textTransform: "uppercase" }}>LAST UPDATE</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
            <span style={{ fontFamily: "monospace", fontSize: 6.5, letterSpacing: "0.18em", color: "rgba(56,189,248,0.55)" }}>v2.5.0</span>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 1.5, marginLeft: 5 }}>
              {[3,5,7,4].map((h, i) => (
                <motion.span key={i}
                  animate={{ height: [h, h+3, h], opacity: [0.5,1,0.5] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: i*0.2, ease: "easeInOut" }}
                  style={{ width: 2.5, background: i < 3 ? "rgba(249,115,22,0.7)" : "rgba(249,115,22,0.2)", borderRadius: 1, display: "inline-block" }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Main date block */}
        <div style={{ padding: mobile ? "14px 14px 10px" : "16px 14px 10px", position: "relative", zIndex: 2 }}>
          <motion.div
            animate={{ textShadow: ["0 0 18px rgba(249,115,22,0.5)","0 0 32px rgba(249,115,22,0.85)","0 0 18px rgba(249,115,22,0.5)"] }}
            transition={{ duration: 3, repeat: Infinity }}
            style={{ fontFamily: "'Orbitron',sans-serif", fontSize: mobile ? 18 : 26, fontWeight: 900, color: "#fff", letterSpacing: "0.08em", lineHeight: 1, marginBottom: 6 }}
          >
            {dateStr}
          </motion.div>
          <div style={{ height: 1, background: "linear-gradient(90deg,rgba(249,115,22,0.6),rgba(56,189,248,0.3),transparent)", marginBottom: 7 }} />
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontFamily: "monospace", fontSize: 7.5, letterSpacing: "0.26em", color: "rgba(255,200,100,0.55)", textTransform: "uppercase" }}>SYS // {timeStr}</span>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderTop: "1px solid rgba(249,115,22,0.1)", position: "relative", zIndex: 2 }}>
          <div style={{ padding: "8px 12px", borderRight: "1px solid rgba(249,115,22,0.08)" }}>
            <div style={{ fontFamily: "monospace", fontSize: 6.5, letterSpacing: "0.28em", color: "rgba(249,115,22,0.35)", textTransform: "uppercase", marginBottom: 3 }}>NEXT EP</div>
            <motion.div
              animate={{ color: countdown.done ? "#22c55e" : ["rgba(255,200,100,0.9)","rgba(249,115,22,0.9)","rgba(255,200,100,0.9)"] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              style={{ fontFamily: "monospace", fontSize: 9, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase" }}
            >
              {epLabel}
            </motion.div>
          </div>
          <div style={{ padding: "8px 12px" }}>
            <div style={{ fontFamily: "monospace", fontSize: 6.5, letterSpacing: "0.28em", color: "rgba(56,189,248,0.35)", textTransform: "uppercase", marginBottom: 3 }}>STATUS</div>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <motion.span animate={{ opacity: [1,0.3,1] }} transition={{ duration: 1.4, repeat: Infinity }}
                style={{ width: 4, height: 4, borderRadius: "50%", background: "#22c55e", display: "inline-block", boxShadow: "0 0 6px #22c55e" }} />
              <span style={{ fontFamily: "monospace", fontSize: 9, fontWeight: 700, letterSpacing: "0.18em", color: "#22c55e" }}>ACTIVE</span>
            </div>
          </div>
        </div>

        {/* Data stream bottom */}
        <div style={{ padding: "5px 12px", borderTop: "1px solid rgba(249,115,22,0.08)", background: "rgba(0,0,0,0.3)", overflow: "hidden", position: "relative", zIndex: 2 }}>
          <motion.div
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
            style={{ display: "flex", gap: 28, whiteSpace: "nowrap" }}
          >
            {["ARC-NET::ONLINE","SIGNAL::LOCKED","SPERANZA::ACTIVE","RESIST.GRID::OK","ARC-NET::ONLINE","SIGNAL::LOCKED","SPERANZA::ACTIVE","RESIST.GRID::OK"].map((t, i) => (
              <span key={i} style={{ fontFamily: "monospace", fontSize: 6.5, letterSpacing: "0.22em", color: "rgba(249,115,22,0.25)", textTransform: "uppercase" }}>{t}</span>
            ))}
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Sidebar Enlist Button ────────────────────────────────────────────────────
function SidebarEnlistBtn({ sidebarHovered, lang, isActive, onClick }: { sidebarHovered: boolean; lang: Lang; isActive: boolean; onClick: () => void }) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const [hovered, setHovered] = useState(false);
  const rawX = useMotionValue(50); const rawY = useMotionValue(50);
  const glowX = useSpring(rawX, { stiffness: 220, damping: 20 });
  const glowY = useSpring(rawY, { stiffness: 220, damping: 20 });
  const glowBg = useTransform([glowX, glowY], ([x, y]: number[]) =>
    `radial-gradient(ellipse at ${x}% ${y}%, rgba(249,115,22,0.32) 0%, rgba(249,115,22,0.06) 55%, transparent 75%)`
  );
  const onMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect();
    rawX.set(((e.clientX - r.left) / r.width) * 100);
    rawY.set(((e.clientY - r.top) / r.height) * 100);
  };
  const lit = isActive || hovered;
  return (
    <motion.button ref={btnRef} onClick={onClick} onMouseMove={onMove}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => { setHovered(false); rawX.set(50); rawY.set(50); }}
      initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.32 }}
      whileTap={{ scale: 0.95 }}
      style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", minHeight: 46, padding: "0 10px", marginTop: 6,
        background: lit ? "rgba(249,115,22,0.18)" : "rgba(249,115,22,0.05)",
        border: `1px solid rgba(249,115,22,${lit ? "0.7" : "0.35"})`,
        borderRadius: 6, cursor: "pointer", position: "relative", overflow: "hidden",
        boxShadow: lit ? "0 0 22px rgba(249,115,22,0.2), inset 0 0 18px rgba(249,115,22,0.06)" : "none",
        transition: "background 0.2s, border-color 0.2s, box-shadow 0.2s" }}
    >
      <motion.div style={{ position: "absolute", inset: 0, background: glowBg, opacity: hovered ? 1 : 0, transition: "opacity 0.25s", pointerEvents: "none" }} />
      {hovered && (
        <motion.div key="sweep" style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg,transparent,rgba(249,115,22,0.35),transparent)", transform: "skewX(-14deg)", pointerEvents: "none", zIndex: 2 }}
          initial={{ x: "-160%" }} animate={{ x: "220%" }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} />
      )}
      <motion.div animate={{ opacity: lit ? 1 : 0, boxShadow: lit ? "0 0 14px rgba(249,115,22,1), 0 0 32px rgba(249,115,22,0.5)" : "none" }} transition={{ duration: 0.2 }}
        style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 2.5, background: "linear-gradient(to bottom,transparent,#f97316,transparent)", pointerEvents: "none", zIndex: 3 }} />
      <motion.span animate={{ opacity: hovered ? 1 : 0, x: hovered ? 0 : -3, y: hovered ? 0 : -3 }} transition={{ duration: 0.16 }}
        style={{ position: "absolute", top: 3, left: 4, width: 5, height: 5, borderTop: "1px solid rgba(249,115,22,0.9)", borderLeft: "1px solid rgba(249,115,22,0.9)", pointerEvents: "none", zIndex: 3 }} />
      <motion.span animate={{ opacity: hovered ? 1 : 0, x: hovered ? 0 : 3, y: hovered ? 0 : 3 }} transition={{ duration: 0.16 }}
        style={{ position: "absolute", bottom: 3, right: 4, width: 5, height: 5, borderBottom: "1px solid rgba(249,115,22,0.9)", borderRight: "1px solid rgba(249,115,22,0.9)", pointerEvents: "none", zIndex: 3 }} />
      <div style={{ width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, position: "relative", zIndex: 1 }}>
        <motion.div animate={{ filter: hovered ? "drop-shadow(0 0 8px rgba(249,115,22,1))" : "none" }} transition={{ duration: 0.2 }}>
          <ArrowRight style={{ width: 15, height: 15, color: "#f97316" }} />
        </motion.div>
      </div>
      <AnimatePresence>
        {sidebarHovered && (
          <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.22, delay: 0.2 }}
            className="g-hover" data-text={lang === "fr" ? "S'ENRÔLER" : "ENLIST"}
            style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 8, fontWeight: 700, letterSpacing: "0.2em", color: "#f97316", textTransform: "uppercase", whiteSpace: "nowrap", position: "relative", zIndex: 1 }}>
            {lang === "fr" ? "S'ENRÔLER" : "ENLIST"}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

// ─── Sidebar Item (collapsed nav) ─────────────────────────────────────────────
interface SidebarItemData { id: string; icon: LucideIcon; labelFr: string; labelEn: string; num: string; }
function SidebarItem({ item, isActive, sidebarHovered, lang, onClick, delay }: {
  item: SidebarItemData; isActive: boolean; sidebarHovered: boolean;
  lang: Lang; onClick: () => void; delay: number;
}) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const [hovered, setHovered] = useState(false);
  const rawX = useMotionValue(50);
  const rawY = useMotionValue(50);
  const glowX = useSpring(rawX, { stiffness: 220, damping: 20 });
  const glowY = useSpring(rawY, { stiffness: 220, damping: 20 });
  const glowBg = useTransform([glowX, glowY], ([x, y]: number[]) =>
    `radial-gradient(ellipse at ${x}% ${y}%, rgba(249,115,22,0.24) 0%, rgba(249,115,22,0.04) 55%, transparent 75%)`
  );
  const onMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect();
    rawX.set(((e.clientX - r.left) / r.width) * 100);
    rawY.set(((e.clientY - r.top) / r.height) * 100);
  };
  const lit = isActive || hovered;

  return (
    <motion.button
      ref={btnRef}
      onClick={onClick}
      onMouseMove={onMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); rawX.set(50); rawY.set(50); }}
      initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.4 }}
      whileTap={{ scale: 0.95 }}
      style={{
        display: "flex", alignItems: "center", gap: 12,
        width: "100%", minHeight: 48, padding: "0 10px",
        background: lit ? "rgba(249,115,22,0.1)" : "rgba(255,255,255,0.025)",
        border: `1px solid ${lit ? "rgba(249,115,22,0.52)" : "rgba(255,255,255,0.06)"}`,
        borderRadius: 6, cursor: "pointer", position: "relative", overflow: "hidden",
        transition: "background 0.2s, border-color 0.2s, box-shadow 0.2s",
        boxShadow: lit ? "0 0 18px rgba(249,115,22,0.1), inset 0 0 16px rgba(249,115,22,0.04)" : "none",
      }}
    >
      {/* Mouse-tracking glow */}
      <motion.div style={{ position: "absolute", inset: 0, background: glowBg, opacity: hovered ? 1 : 0, transition: "opacity 0.25s", pointerEvents: "none" }} />

      {/* Scan sweep */}
      {hovered && (
        <motion.div key="sweep"
          style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg,transparent,rgba(249,115,22,0.26),transparent)", transform: "skewX(-14deg)", pointerEvents: "none", zIndex: 2 }}
          initial={{ x: "-160%" }} animate={{ x: "220%" }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        />
      )}

      {/* Left edge glow */}
      <motion.div
        animate={{ opacity: lit ? 1 : 0, boxShadow: lit ? "0 0 12px rgba(249,115,22,1), 0 0 28px rgba(249,115,22,0.5)" : "none" }}
        transition={{ duration: 0.2 }}
        style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 2.5, background: "linear-gradient(to bottom,transparent,#f97316,transparent)", pointerEvents: "none", zIndex: 3 }}
      />

      {/* HUD corner brackets */}
      <motion.span animate={{ opacity: hovered ? 1 : 0, x: hovered ? 0 : -3, y: hovered ? 0 : -3 }} transition={{ duration: 0.16 }}
        style={{ position: "absolute", top: 3, left: 4, width: 5, height: 5, borderTop: "1px solid rgba(249,115,22,0.9)", borderLeft: "1px solid rgba(249,115,22,0.9)", pointerEvents: "none", zIndex: 3 }} />
      <motion.span animate={{ opacity: hovered ? 1 : 0, x: hovered ? 0 : 3, y: hovered ? 0 : 3 }} transition={{ duration: 0.16 }}
        style={{ position: "absolute", bottom: 3, right: 4, width: 5, height: 5, borderBottom: "1px solid rgba(249,115,22,0.9)", borderRight: "1px solid rgba(249,115,22,0.9)", pointerEvents: "none", zIndex: 3 }} />

      {/* Active pulse */}
      {isActive && (
        <motion.div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 24px 50%,rgba(249,115,22,0.18) 0%,transparent 60%)", pointerEvents: "none" }}
          animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 2.4, repeat: Infinity }} />
      )}

      {/* Icon */}
      <div style={{ width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, position: "relative", zIndex: 1 }}>
        <motion.div animate={{ filter: hovered ? "drop-shadow(0 0 6px rgba(249,115,22,0.9))" : "none" }} transition={{ duration: 0.2 }}>
          <item.icon style={{ width: 16, height: 16, color: lit ? "#f97316" : "rgba(200,185,168,0.42)", transition: "color 0.18s" }} />
        </motion.div>
      </div>

      {/* Label + number (expanded) */}
      <AnimatePresence>
        {sidebarHovered && (
          <motion.div
            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.22, delay: delay * 0.5 }}
            style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flex: 1, overflow: "hidden", position: "relative", zIndex: 1 }}
          >
            <span className="g-hover" data-text={lang === "fr" ? item.labelFr : item.labelEn}
              style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "0.2em", color: lit ? "#f0e8d8" : "rgba(175,162,148,0.62)", textTransform: "uppercase", whiteSpace: "nowrap" }}>
              {lang === "fr" ? item.labelFr : item.labelEn}
            </span>
            <span style={{ fontFamily: "monospace", fontSize: 9, color: lit ? "rgba(249,115,22,0.9)" : "rgba(249,115,22,0.3)", flexShrink: 0, marginLeft: 6 }}>
              {item.num}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

// ─── Panel Header ─────────────────────────────────────────────────────────────
function PanelHeader({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, paddingBottom: 14, borderBottom: "1px solid rgba(249,115,22,0.14)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 3, height: 16, background: "linear-gradient(to bottom,#f97316,transparent)" }} />
        <h2 style={{ fontFamily: "'Orbitron',sans-serif", fontSize: "clamp(11px,1.3vw,14px)", fontWeight: 900, letterSpacing: "0.26em", textTransform: "uppercase", color: "#fb923c" }}>{title}</h2>
      </div>
      <motion.button onClick={onClose}
        style={{ background: "none", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 4, padding: "5px 7px", color: "rgba(255,255,255,0.38)", cursor: "pointer", display: "flex", alignItems: "center" }}
        whileHover={{ borderColor: "rgba(249,115,22,0.5)", color: "#fff" }} whileTap={{ scale: 0.92 }}
      >
        <X style={{ width: 12, height: 12 }} />
      </motion.button>
    </div>
  );
}

// ─── Top Nav (full-screen panel navigation bar) ───────────────────────────────
function TopNav({ title, onBack, lang }: { title: string; onBack: () => void; lang: Lang }) {
  return (
    <motion.div
      initial={{ y: -64, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -48, opacity: 0 }}
      transition={{ duration: 0.45, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 300,
        display: "flex", alignItems: "center", gap: 18,
        padding: "0 clamp(18px,3vw,40px)",
        height: 58,
        background: "rgba(0,0,0,0.78)",
        backdropFilter: "blur(22px)",
        borderBottom: "1px solid rgba(249,115,22,0.14)",
      }}
    >
      {/* Back button */}
      <motion.button onClick={onBack}
        whileHover={{ x: -3, borderColor: "rgba(249,115,22,0.7)", color: "#f97316" }}
        whileTap={{ scale: 0.94 }}
        style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "1px solid rgba(249,115,22,0.28)", borderRadius: 4, padding: "7px 16px", cursor: "pointer", color: "rgba(249,115,22,0.75)", fontFamily: "'Orbitron',sans-serif", fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase", flexShrink: 0, transition: "color 0.18s, border-color 0.18s" }}
      >
        <svg viewBox="0 0 10 10" style={{ width: 9, height: 9 }} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <path d="M7 1 L2 5 L7 9" />
        </svg>
        {lang === "fr" ? "RETOUR" : "BACK"}
      </motion.button>

      {/* Divider */}
      <div style={{ width: 1, height: 22, background: "rgba(249,115,22,0.18)", flexShrink: 0 }} />

      {/* Logo */}
      <img src="/arc-raiders-logo.png" alt="ARC Raiders" style={{ height: 28, width: "auto", opacity: 0.72, filter: "drop-shadow(0 0 8px rgba(249,115,22,0.4))", flexShrink: 0 }} />

      {/* Divider */}
      <div style={{ width: 1, height: 22, background: "rgba(249,115,22,0.18)", flexShrink: 0 }} />

      {/* Section title */}
      <motion.span
        initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.28, duration: 0.4 }}
        style={{ fontFamily: "'Orbitron',sans-serif", fontSize: "clamp(10px,1.2vw,13px)", fontWeight: 900, letterSpacing: "0.32em", color: "rgba(249,115,22,0.88)", textTransform: "uppercase" }}
      >
        {title}
      </motion.span>

      {/* Right spacer + blink signal */}
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 7 }}>
        <motion.div style={{ width: 5, height: 5, borderRadius: "50%", background: "#22c55e" }}
          animate={{ opacity: [1,0.3,1], scale: [1,1.4,1] }} transition={{ duration: 2, repeat: Infinity }}
        />
        <span style={{ fontFamily: "monospace", fontSize: 8, letterSpacing: "0.28em", color: "rgba(34,197,94,0.55)", textTransform: "uppercase" }}>SIGNAL // OK</span>
      </div>
    </motion.div>
  );
}

// ─── Lore Timeline data ───────────────────────────────────────────────────────
const LORE_TIMELINE = [
  {
    year: "~2054",
    tag: "THE COLLAPSE / THE EXODUS", tagFr: "L'EFFONDREMENT / L'EXODE",
    type: "dawn" as const,
    dot: "rgba(255,210,80,0.9)",
    glow: "rgba(255,210,80,0.45)",
    en: "The Ecological Collapse devastates Earth. Floods, fires, earthquakes, and global disasters shatter civilization, wiping out most of humanity. Around this same era, a handful of survivors — likely the wealthy, powerful, or technologically privileged — escape Earth through the Exodus. Acerra Spaceport and its launch towers remain as monuments to that desperate departure. The exact date is not canon, but ~2054 is one of the most plausible fan estimates.",
    fr: "L'Effondrement Écologique ravage la Terre. Inondations, incendies, séismes et catastrophes mondiales brisent la civilisation, décimant la majeure partie de l'humanité. À cette même époque, une poignée de survivants — probablement les plus riches, les plus puissants ou les plus avantagés technologiquement — quitte la Terre lors de l'Exode. Le spatioport d'Acerra et ses tours de lancement restent les monuments de ce départ désespéré. La date exacte n'est pas canon, mais ~2054 est l'une des estimations fan les plus plausibles.",
  },
  {
    year: "~2120–2140",
    tag: "SUNRISE ERA", tagFr: "L'ÈRE SUNRISE",
    type: "victory" as const,
    dot: "rgba(80,200,100,0.9)",
    glow: "rgba(80,200,100,0.4)",
    en: "After generations of darkness, the short-lived Sunrise era begins. Earth's ecology shows signs of recovery, old technology is rediscovered, and surface communities start to rebuild. Around the Rust Belt, settlers gather near the Alcantara Dam, build hydroponic domes, restore old solar panels, and believe that humanity may finally have survived the worst.",
    fr: "Après des générations d'obscurité, la brève ère Sunrise commence. L'écologie terrestre montre des signes de rétablissement, d'anciennes technologies sont redécouvertes et des communautés de surface commencent à se reconstruire. Autour de la Rust Belt, des colons se rassemblent près du barrage d'Alcantara, construisent des dômes hydroponiques, restaurent d'anciens panneaux solaires et pensent que l'humanité a enfin survécu au pire.",
  },
  {
    year: "~2150",
    tag: "FIRST ARC WAVE", tagFr: "PREMIÈRE VAGUE ARC",
    type: "attack" as const,
    dot: "rgba(249,115,22,0.9)",
    glow: "rgba(249,115,22,0.45)",
    en: "Just as the world begins to recover, ARC machines start falling from the sky. Their origin and purpose remain unknown. The First Wave machines are more rudimentary than later ARC designs, but still devastating. Surface settlers unite into early Raider groups, building defenses and outposts around the Rust Belt to resist the machines.",
    fr: "Alors que le monde commence à se relever, les machines ARC se mettent à tomber du ciel. Leur origine et leur objectif restent inconnus. Les machines de la Première Vague sont plus rudimentaires que les modèles ARC ultérieurs, mais demeurent dévastatrices. Les colons de surface s'unissent en premiers groupes de Raiders, construisant défenses et avant-postes dans la Rust Belt pour résister aux machines.",
  },
  {
    year: "~2162–2164",
    tag: "VICTORY RIDGE", tagFr: "VICTORY RIDGE",
    type: "victory" as const,
    dot: "rgba(255,180,50,0.9)",
    glow: "rgba(255,180,50,0.45)",
    en: "After more than a decade of war, scattered Raider groups unite under Major Aiva for a final stand at Victory Ridge, west of the Alcantara Dam. The battle lasts for days and ends with the destruction of the last major ARC pocket of the First Wave. Humanity wins, but at a terrible cost: Major Aiva dies, many Raiders never return, and the unity of the survivors collapses into rivalries and mistrust.",
    fr: "Après plus de dix ans de guerre, des groupes dispersés de Raiders s'unissent sous le commandement du Major Aiva pour un dernier combat à Victory Ridge, à l'ouest du barrage d'Alcantara. La bataille dure plusieurs jours et se termine par la destruction de la dernière grande poche ARC de la Première Vague. L'humanité l'emporte, mais à un prix terrible : le Major Aiva meurt, de nombreux Raiders ne reviennent jamais, et l'unité des survivants s'effondre en rivalités et en méfiance.",
  },
  {
    year: "~2167–2170",
    tag: "SECOND WAVE", tagFr: "SECONDE VAGUE",
    type: "attack" as const,
    dot: "rgba(220,40,40,0.9)",
    glow: "rgba(220,40,40,0.45)",
    en: "After only a few years of fragile peace, ARC returns. The Second Wave is far more dangerous: newer machines are smarter, faster, better coordinated, and more specialized. Some designs are so advanced that Raiders classify them as entirely new threats, including Barons and Queens. Human defenses collapse, and survival on the surface becomes nearly impossible.",
    fr: "Après seulement quelques années d'une paix fragile, l'ARC revient. La Seconde Vague est bien plus dangereuse : les nouvelles machines sont plus intelligentes, plus rapides, mieux coordonnées et plus spécialisées. Certains modèles sont si avancés que les Raiders les considèrent comme de toutes nouvelles menaces, notamment les Barons et les Queens. Les défenses humaines s'effondrent, et survivre à la surface devient presque impossible.",
  },
  {
    year: "2170s",
    tag: "TOLEDO & SPERANZA", tagFr: "TOLEDO & SPERANZA",
    type: "refuge" as const,
    dot: "rgba(80,150,255,0.9)",
    glow: "rgba(80,150,255,0.4)",
    en: "Driven underground by the Second Wave, survivors build and expand Toledo, a vast subterranean city made of isolated contradas. Speranza becomes the oldest and most important of these underground communities. Celeste is part of the early group that shapes Speranza and eventually becomes its central leader. The city's survival depends on Raiders who risk everything by going Topside to scavenge supplies, old-world technology, and destroyed ARC components.",
    fr: "Chassés sous terre par la Seconde Vague, les survivants construisent et agrandissent Toledo, une vaste cité souterraine composée de contradas isolées. Speranza devient la plus ancienne et la plus importante de ces communautés souterraines. Celeste fait partie du groupe initial qui façonne Speranza et finit par devenir sa figure centrale. La survie de la ville dépend des Raiders, qui risquent tout en remontant à la surface pour récupérer des ressources, des technologies de l'Ancien Monde et des composants ARC détruits.",
  },
  {
    year: "2180",
    tag: "PRESENT DAY", tagFr: "AUJOURD'HUI",
    type: "now" as const,
    dot: "rgba(249,115,22,1)",
    glow: "rgba(249,115,22,0.7)",
    en: "The year is 2180. The surface, known as the Rust Belt, is a lethal zone dominated by ARC machines. Raiders from Speranza and Toledo ascend through extraction shafts to scavenge, fight, and survive. The Orbiter watches from above, threatening those who fail to extract in time. The true origin of ARC remains unconfirmed, but the strongest fan theory suggests they may not be alien at all: they could be human-made machines tied to the lost Exodus era, an automated orbital system built to survey, harvest, reclaim, or cleanse Earth without regard for the humans left behind.",
    fr: "Nous sommes en 2180. La surface, connue sous le nom de Rust Belt, est une zone mortelle dominée par les machines ARC. Les Raiders de Speranza et de Toledo remontent par les puits d'extraction pour récupérer, combattre et survivre. L'Orbiteur observe depuis le ciel, menaçant ceux qui n'extraient pas à temps. La véritable origine de l'ARC reste non confirmée, mais la théorie fan la plus solide suggère qu'ils ne seraient peut-être pas extraterrestres : il pourrait s'agir de machines d'origine humaine liées à l'ère perdue de l'Exode, un système orbital automatisé conçu pour surveiller, exploiter, reconquérir ou nettoyer la Terre sans considération pour les humains restés sur place.",
  },
];

// ─── Timeline: event type icons ───────────────────────────────────────────────
function TLIcon({ type, color, size = 15 }: { type: string; color: string; size?: number }) {
  const c = color;
  if (type === "dawn") return (
    <svg viewBox="0 0 20 20" width={size} height={size} fill="none">
      <path d="M4 15a6 6 0 0 1 12 0" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="10" cy="15" r="2.5" stroke={c} strokeWidth="1.4"/>
      <line x1="10" y1="2" x2="10" y2="4.5" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="3.2" y1="5.2" x2="4.8" y2="6.8" stroke={c} strokeWidth="1.4" strokeLinecap="round"/>
      <line x1="16.8" y1="5.2" x2="15.2" y2="6.8" stroke={c} strokeWidth="1.4" strokeLinecap="round"/>
      <line x1="1" y1="15" x2="3" y2="15" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="17" y1="15" x2="19" y2="15" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
  if (type === "attack") return (
    <svg viewBox="0 0 20 20" width={size} height={size} fill="none">
      <path d="M10 2 L2 18 h16 Z" stroke={c} strokeWidth="1.4" strokeLinejoin="round"/>
      <line x1="10" y1="8" x2="10" y2="13" stroke={c} strokeWidth="1.8" strokeLinecap="round"/>
      <circle cx="10" cy="15.5" r="0.9" fill={c}/>
    </svg>
  );
  if (type === "victory") return (
    <svg viewBox="0 0 20 20" width={size} height={size} fill="none">
      <path d="M10 1.5 L12.6 7.2 l6.2 0.9 -4.5 4.4 1.1 6.2 -5.4-2.8 -5.4 2.8 1.1-6.2 -4.5-4.4 6.2-0.9 Z" stroke={c} strokeWidth="1.4" strokeLinejoin="round"/>
    </svg>
  );
  if (type === "refuge") return (
    <svg viewBox="0 0 20 20" width={size} height={size} fill="none">
      <path d="M2 9l8-7 8 7v9a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1z" stroke={c} strokeWidth="1.4" strokeLinejoin="round"/>
      <path d="M7 19v-7h6v7" stroke={c} strokeWidth="1.4" strokeLinejoin="round"/>
    </svg>
  );
  if (type === "society") return (
    <svg viewBox="0 0 20 20" width={size} height={size} fill="none">
      <circle cx="10" cy="10" r="8" stroke={c} strokeWidth="1.3"/>
      <path d="M2 10h16M10 2c-3 2.5-4 5-4 8s1 5.5 4 8M10 2c3 2.5 4 5 4 8s-1 5.5-4 8" stroke={c} strokeWidth="1.1"/>
    </svg>
  );
  return (
    <svg viewBox="0 0 20 20" width={size} height={size} fill="none">
      <circle cx="10" cy="10" r="7.5" stroke={c} strokeWidth="1.3"/>
      <circle cx="10" cy="10" r="3.5" stroke={c} strokeWidth="1.1"/>
      <circle cx="10" cy="10" r="1" fill={c}/>
      <line x1="10" y1="1" x2="10" y2="3.5" stroke={c} strokeWidth="1.4" strokeLinecap="round"/>
      <line x1="10" y1="16.5" x2="10" y2="19" stroke={c} strokeWidth="1.4" strokeLinecap="round"/>
      <line x1="1" y1="10" x2="3.5" y2="10" stroke={c} strokeWidth="1.4" strokeLinecap="round"/>
      <line x1="16.5" y1="10" x2="19" y2="10" stroke={c} strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  );
}

// ─── Timeline: per-event metrics ──────────────────────────────────────────────
const TL_METRICS: Record<string, { l: string; lFr: string; v: number }[]> = {
  dawn:    [{ l: "SURVIVORS",    lFr: "SURVIVANTS",    v: 38 }, { l: "STABILITY",    lFr: "STABILITÉ",    v: 22 }, { l: "THREAT LVL",   lFr: "NIV. MENACE",  v: 15 }],
  attack:  [{ l: "ARC UNITS",   lFr: "UNITÉS ARC",    v: 80 }, { l: "CASUALTIES",   lFr: "PERTES",        v: 88 }, { l: "THREAT LVL",   lFr: "NIV. MENACE",  v: 84 }],
  society: [{ l: "ELITE FLED",  lFr: "ÉLITE FUIE",    v: 92 }, { l: "LEFT BEHIND",  lFr: "ABANDONNÉS",    v: 98 }, { l: "RESENTMENT",   lFr: "RESSENTIMENT", v: 95 }],
  victory: [{ l: "HUMAN FORCES",lFr: "FORCES HUMAINES",v: 68},{ l: "ARC LOSSES",   lFr: "PERTES ARC",    v: 62 }, { l: "HOPE INDEX",   lFr: "IDX. ESPOIR",  v: 71 }],
  refuge:  [{ l: "DISPLACED",   lFr: "DÉPLACÉS",      v: 96 }, { l: "SURVIVAL",     lFr: "SURVIE",        v: 54 }, { l: "THREAT LVL",   lFr: "NIV. MENACE",  v: 93 }],
  now:     [{ l: "ACTIVE RAIDERS",lFr:"RAIDERS ACTIFS",v: 47}, { l: "ARC PRESENCE", lFr: "PRÉSENCE ARC",  v: 97 }, { l: "THREAT LVL",   lFr: "NIV. MENACE",  v: 100 }],
};

// ─── Timeline: HUD grid background ────────────────────────────────────────────
function TLGrid({ color }: { color: string }) {
  const uid = color.replace(/[^a-z0-9]/gi, "").slice(0, 8);
  return (
    <svg viewBox="0 0 480 320" preserveAspectRatio="xMidYMid slice"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
    >
      <defs>
        <radialGradient id={"rg" + uid} cx="50%" cy="50%">
          <stop offset="0%" stopColor={color} stopOpacity="0.22"/>
          <stop offset="75%" stopColor={color} stopOpacity="0"/>
        </radialGradient>
      </defs>
      {Array.from({ length: 9 }, (_, i) => (
        <line key={"h" + i} x1="0" y1={i * 40} x2="480" y2={i * 40} stroke={color} strokeWidth="0.35" opacity="0.22"/>
      ))}
      {Array.from({ length: 13 }, (_, i) => (
        <line key={"v" + i} x1={i * 40} y1="0" x2={i * 40} y2="320" stroke={color} strokeWidth="0.35" opacity="0.22"/>
      ))}
      <ellipse cx="240" cy="160" rx="200" ry="130" fill={"url(#rg" + uid + ")"}/>
      <path d="M8 20 L8 8 L20 8" stroke={color} strokeWidth="1.2" fill="none" opacity="0.5"/>
      <path d="M460 20 L460 8 L448 8" stroke={color} strokeWidth="1.2" fill="none" opacity="0.5"/>
      <path d="M8 300 L8 312 L20 312" stroke={color} strokeWidth="1.2" fill="none" opacity="0.5"/>
      <path d="M460 300 L460 312 L448 312" stroke={color} strokeWidth="1.2" fill="none" opacity="0.5"/>
      <ellipse cx="240" cy="160" rx="140" ry="90" stroke={color} strokeWidth="0.5" fill="none" opacity="0.16"/>
      <ellipse cx="240" cy="160" rx="80" ry="52" stroke={color} strokeWidth="0.5" fill="none" opacity="0.10"/>
    </svg>
  );
}

// ─── Lore Timeline component ──────────────────────────────────────────────────
function LoreTimeline({ lang }: { lang: Lang }) {
  const [active, setActive]           = useState(0);
  const [typed,  setTyped]            = useState("");
  const [barsOn, setBarsOn]           = useState(false);
  const [glitch, setGlitch]           = useState(false);
  const [burstKey, setBurstKey]       = useState(0);
  const [burstOrigin, setBurstOrigin] = useState({ x: 0, y: 0 });
  const [metricsKey, setMetricsKey]   = useState(0);
  const [isMobileT, setIsMobileT]     = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cardRef  = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const check = () => setIsMobileT(window.innerWidth < 640 || (window.innerWidth < 900 && window.innerHeight < 500));
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const rotX  = useSpring(0, { stiffness: 220, damping: 28 });
  const rotY  = useSpring(0, { stiffness: 220, damping: 28 });
  const glowX = useSpring(50, { stiffness: 90, damping: 18 });
  const glowY = useSpring(50, { stiffness: 90, damping: 18 });

  const ev      = LORE_TIMELINE[active];
  const desc    = lang === "fr" ? ev.fr : ev.en;
  const N       = LORE_TIMELINE.length;
  const metrics = TL_METRICS[ev.type] ?? TL_METRICS.now;
  const al      = (col: string, opacity: number) => col.replace(/[\d.]+\)$/, `${opacity})`);

  const solidColor = ev.dot.replace(/,[\d.]+\)$/, ",1)");

  const selectEvent = useCallback((i: number, nodeEl?: HTMLButtonElement | null) => {
    if (i === active) return;
    if (nodeEl) {
      const r = nodeEl.getBoundingClientRect();
      setBurstOrigin({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
    }
    setGlitch(true);
    setBurstKey(k => k + 1);
    setTimeout(() => {
      setActive(i);
      setGlitch(false);
      setBarsOn(false);
      setMetricsKey(k => k + 1);
      setTimeout(() => setBarsOn(true), 520);
    }, 180);
  }, [active]);

  // Typewriter
  useEffect(() => {
    setTyped("");
    setBarsOn(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    let i = 0;
    const tick = () => {
      i++;
      setTyped(desc.slice(0, i));
      if (i < desc.length) timerRef.current = setTimeout(tick, 11);
      else setTimeout(() => setBarsOn(true), 100);
    };
    timerRef.current = setTimeout(tick, 380);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, lang]);

  // Keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") selectEvent(Math.min(N - 1, active + 1));
      if (e.key === "ArrowLeft")  selectEvent(Math.max(0, active - 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, N, selectEvent]);

  // Card 3D tilt on mouse
  const onCardMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const r  = cardRef.current.getBoundingClientRect();
    const cx = (e.clientX - r.left) / r.width;
    const cy = (e.clientY - r.top)  / r.height;
    rotY.set((cx - 0.5) * 16);
    rotX.set(-(cy - 0.5) * 9);
    glowX.set(cx * 100);
    glowY.set(cy * 100);
  };
  const onCardLeave = () => { rotX.set(0); rotY.set(0); glowX.set(50); glowY.set(50); };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>

      {/* ── HEADER ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22 }}>
        <div style={{ width: 2.5, height: 16, background: `linear-gradient(to bottom,${ev.dot},transparent)`, transition: "background 0.5s", flexShrink: 0 }} />
        <span style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 8, fontWeight: 700, letterSpacing: "0.48em", color: "rgba(255,150,80,0.42)", textTransform: "uppercase" }}>
          CHRONO NEXUS — RAIDER_LINK
        </span>
        <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg,rgba(249,115,22,0.18),transparent)" }} />
        <motion.span key={active} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
          style={{ fontFamily: "monospace", fontSize: 8, color: al(ev.dot, 0.55), letterSpacing: "0.16em" }}
        >
          EVT {String(active + 1).padStart(2, "0")}&thinsp;/&thinsp;{String(N).padStart(2, "0")}
        </motion.span>
      </div>

      {/* ── MOBILE HORIZONTAL EVENT SELECTOR ── */}
      {isMobileT && (
        <div className="hide-scrollbar" style={{ overflowX: "auto", display: "flex", gap: 8, paddingBottom: 14, marginBottom: 4 }}>
          {LORE_TIMELINE.map((item, i) => {
            const isAct = active === i;
            const solidC = item.dot.replace(/,[\d.]+\)$/, ",1)");
            const al2 = (col: string, op: number) => col.replace(/[\d.]+\)$/, `${op})`);
            return (
              <motion.button
                key={i}
                onClick={(e) => selectEvent(i, e.currentTarget)}
                whileTap={{ scale: 0.94 }}
                style={{
                  flexShrink: 0,
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 5,
                  padding: "10px 12px",
                  background: isAct ? al2(item.dot, 0.12) : "rgba(255,255,255,0.03)",
                  border: `1px solid ${isAct ? al2(item.dot, 0.55) : "rgba(255,255,255,0.07)"}`,
                  borderRadius: 8, cursor: "pointer", position: "relative", overflow: "hidden",
                  minWidth: 64,
                  transition: "background 0.25s, border-color 0.25s",
                }}
              >
                {/* Active top bar */}
                {isAct && (
                  <motion.div
                    layoutId="tl-active-bar"
                    style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,transparent,${solidC},transparent)` }}
                  />
                )}
                {/* Icon */}
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: isAct ? al2(item.dot, 0.15) : "rgba(255,255,255,0.04)", border: `1px solid ${isAct ? al2(item.dot, 0.4) : "rgba(255,255,255,0.08)"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <TLIcon type={item.type} color={isAct ? solidC : "rgba(200,185,168,0.35)"} size={12} />
                </div>
                {/* Year */}
                <span style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 9, fontWeight: 900, letterSpacing: "0.04em", color: isAct ? solidC : "rgba(200,185,168,0.38)", lineHeight: 1 }}>
                  {item.year}
                </span>
                {/* Short tag */}
                <span style={{ fontFamily: "monospace", fontSize: 6, letterSpacing: "0.08em", color: isAct ? al2(item.dot, 0.65) : "rgba(200,185,168,0.25)", textTransform: "uppercase", textAlign: "center", lineHeight: 1.3, maxWidth: 56, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                  {lang === "fr" ? item.tagFr : item.tag}
                </span>
              </motion.button>
            );
          })}
        </div>
      )}

      {/* ── MAIN GRID ── */}
      <div style={{ display: "grid", gridTemplateColumns: isMobileT ? "1fr" : "clamp(160px,18vw,220px) 1fr", gap: "clamp(14px,2vw,26px)", alignItems: "stretch" }}>

        {/* ═══ LEFT: Vertical Node Track — desktop only ═══ */}
        {!isMobileT && <div style={{ position: "relative", display: "flex", flexDirection: "column" }}>

          {/* Vertical connector line */}
          <div style={{ position: "absolute", left: 24, top: 20, bottom: 36, width: 1, background: "linear-gradient(to bottom,transparent,rgba(249,115,22,0.14) 8%,rgba(249,115,22,0.14) 92%,transparent)", zIndex: 0 }} />

          {/* Animated data packet flowing down */}
          <motion.div
            animate={{ top: ["0%", "100%"] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear", repeatDelay: 2 }}
            style={{ position: "absolute", left: 21, width: 7, height: 7, borderRadius: "50%", background: solidColor, boxShadow: `0 0 9px ${solidColor}`, zIndex: 2, pointerEvents: "none", transition: "background 0.5s" }}
          />

          {/* Nodes */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            {LORE_TIMELINE.map((item, i) => {
              const isAct = active === i;
              const isPst = i < active;
              const isFut = i > active;
              return (
                <motion.button key={i}
                  onClick={(e) => selectEvent(i, e.currentTarget)}
                  initial={{ opacity: 0, x: -18 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  whileHover={{ x: 5 }}
                  whileTap={{ scale: 0.96 }}
                  style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 8px 11px 0", background: "none", border: "none", cursor: "pointer", textAlign: "left", position: "relative", zIndex: 3 }}
                >
                  {/* Node circle */}
                  <div style={{ position: "relative", flexShrink: 0, width: 48, height: 48, display: "flex", alignItems: "center", justifyContent: "center" }}>

                    {/* Orbit ring */}
                    <AnimatePresence>
                      {isAct && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1, rotate: 360 }}
                          exit={{ opacity: 0, scale: 0.5 }}
                          transition={{ opacity: { duration: 0.3 }, scale: { duration: 0.4 }, rotate: { duration: 12, repeat: Infinity, ease: "linear" } }}
                          style={{ position: "absolute", inset: -6, borderRadius: "50%", border: `1.5px dashed ${al(item.dot, 0.55)}`, pointerEvents: "none" }}
                        />
                      )}
                    </AnimatePresence>

                    {/* Pulse ring 1 */}
                    <AnimatePresence>
                      {isAct && (
                        <motion.div
                          animate={{ scale: [1, 2.8, 1], opacity: [0.35, 0, 0.35] }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut" }}
                          style={{ position: "absolute", width: 22, height: 22, borderRadius: "50%", background: al(item.dot, 0.5), pointerEvents: "none" }}
                        />
                      )}
                    </AnimatePresence>

                    {/* Pulse ring 2 */}
                    <AnimatePresence>
                      {isAct && (
                        <motion.div
                          animate={{ scale: [1, 3.4, 1], opacity: [0.2, 0, 0.2] }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut", delay: 0.7 }}
                          style={{ position: "absolute", width: 16, height: 16, borderRadius: "50%", background: al(item.dot, 0.3), pointerEvents: "none" }}
                        />
                      )}
                    </AnimatePresence>

                    {/* Main node */}
                    <motion.div
                      animate={{
                        borderColor: isAct ? item.dot : isPst ? "rgba(249,115,22,0.4)" : "rgba(255,255,255,0.08)",
                        background: isAct ? al(item.dot, 0.14) : isPst ? "rgba(249,115,22,0.04)" : "rgba(255,255,255,0.02)",
                        boxShadow: isAct ? `0 0 0 2px rgba(0,0,0,0.55),0 0 22px ${al(item.dot, 0.7)},0 0 44px ${al(item.dot, 0.22)}` : "none",
                      }}
                      transition={{ duration: 0.35 }}
                      style={{ width: 38, height: 38, borderRadius: "50%", border: "1.5px solid", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", zIndex: 1 }}
                    >
                      <motion.div animate={{ opacity: isAct ? 1 : isPst ? 0.55 : 0.2 }} transition={{ duration: 0.28 }}>
                        <TLIcon type={item.type} color={isAct ? item.dot.replace(/,[\d.]+\)$/, ",1)") : isPst ? "#f97316" : "rgba(255,255,255,0.45)"} size={14} />
                      </motion.div>
                      {isFut && <div style={{ position: "absolute", width: 4, height: 4, borderRadius: "50%", background: "rgba(255,255,255,0.1)" }} />}
                    </motion.div>
                  </div>

                  {/* Label */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <motion.div
                      animate={{ color: isAct ? "#f0e8d8" : isPst ? "rgba(240,232,220,0.45)" : "rgba(255,255,255,0.16)" }}
                      transition={{ duration: 0.28 }}
                      style={{ fontFamily: "'Orbitron',sans-serif", fontSize: "clamp(8px,0.85vw,10px)", fontWeight: 700, letterSpacing: "0.06em", marginBottom: 3 }}
                    >
                      {item.year}
                    </motion.div>
                    <motion.div
                      animate={{ color: isAct ? al(item.dot, 0.95) : isPst ? "rgba(249,115,22,0.35)" : "rgba(255,255,255,0.1)" }}
                      transition={{ duration: 0.28 }}
                      style={{ fontFamily: "'Orbitron',sans-serif", fontSize: "clamp(5.5px,0.6vw,7px)", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", lineHeight: 1.4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                    >
                      {lang === "fr" ? item.tagFr : item.tag}
                    </motion.div>
                    {isAct && (
                      <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                        style={{ height: 1.5, background: `linear-gradient(90deg,${ev.dot},transparent)`, marginTop: 4, transformOrigin: "left" }}
                      />
                    )}
                  </div>

                  {isAct && (
                    <motion.div initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
                      style={{ width: 5, height: 5, borderTop: `1.5px solid ${al(item.dot, 0.7)}`, borderRight: `1.5px solid ${al(item.dot, 0.7)}`, transform: "rotate(45deg)", flexShrink: 0 }}
                    />
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Dot pager */}
          <div style={{ display: "flex", gap: 4, alignItems: "center", paddingLeft: 8, marginTop: 8 }}>
            {LORE_TIMELINE.map((_, i) => (
              <motion.button key={i} onClick={() => selectEvent(i)}
                animate={{ width: i === active ? 18 : 4, background: i === active ? solidColor : i < active ? "rgba(249,115,22,0.4)" : "rgba(255,255,255,0.08)" }}
                transition={{ duration: 0.28 }}
                style={{ height: 2.5, borderRadius: 2, cursor: "pointer", border: "none", padding: 0 }}
              />
            ))}
          </div>
        </div>}

        {/* ═══ RIGHT: 3D Holographic Detail Card ═══ */}
        <motion.div ref={isMobileT ? undefined : cardRef} onMouseMove={isMobileT ? undefined : onCardMove} onMouseLeave={isMobileT ? undefined : onCardLeave}
          style={isMobileT ? {} : { rotateX: rotX, rotateY: rotY, transformStyle: "preserve-3d", perspective: "1000px" }}
        >
          <AnimatePresence mode="wait">
            <motion.div key={active}
              initial={{ opacity: 0, scale: 0.96, filter: "blur(12px)" }}
              animate={{ opacity: 1, scale: 1,    filter: "blur(0px)" }}
              exit={{    opacity: 0, scale: 0.98,  filter: "blur(6px)" }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              style={{ position: "relative", overflow: "hidden", borderRadius: 8, background: "rgba(4,4,8,0.84)", border: `1px solid ${al(ev.dot, 0.22)}`, backdropFilter: "blur(24px)", minHeight: isMobileT ? 320 : "clamp(280px,34vh,400px)", display: "flex", flexDirection: "column" }}
            >
              {/* Background grid */}
              <TLGrid color={al(ev.dot, 0.8)} />

              {/* Mouse-reactive surface glow */}
              <motion.div style={{
                position: "absolute", inset: 0, pointerEvents: "none", zIndex: 1, borderRadius: 8,
                background: useTransform([glowX, glowY], ([x, y]: number[]) =>
                  `radial-gradient(circle at ${x}% ${y}%, ${al(ev.dot, 0.15)} 0%, transparent 58%)`
                ),
              }} />

              {/* Glitch flash on transition */}
              <AnimatePresence>
                {glitch && (
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: [0, 0.8, 0, 0.6, 0] }} exit={{ opacity: 0 }}
                    transition={{ duration: 0.2, times: [0, 0.2, 0.5, 0.7, 1] }}
                    style={{ position: "absolute", inset: 0, zIndex: 20, pointerEvents: "none", background: al(ev.dot, 0.2), mixBlendMode: "screen" }}
                  />
                )}
              </AnimatePresence>

              {/* Scan sweep */}
              <motion.div key={active + "_s"}
                initial={{ top: "-5%" }} animate={{ top: "110%" }}
                transition={{ duration: 0.55, ease: "easeIn" }}
                style={{ position: "absolute", left: 0, right: 0, height: "45%", zIndex: 2, pointerEvents: "none", background: `linear-gradient(to bottom,${al(ev.dot, 0.1)},${al(ev.dot, 0.03)},transparent)` }}
              />

              {/* Content */}
              <div style={{ position: "relative", zIndex: 3, display: "flex", flexDirection: "column", height: "100%", padding: "clamp(16px,2vw,22px)" }}>

                {/* Badge row */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 4, background: al(ev.dot, 0.12), border: `1px solid ${al(ev.dot, 0.3)}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <TLIcon type={ev.type} color={solidColor} size={14} />
                    </div>
                    <div>
                      <div style={{ fontFamily: "monospace", fontSize: 7, letterSpacing: "0.3em", color: al(ev.dot, 0.5), textTransform: "uppercase", marginBottom: 2 }}>RAIDER_LINK — EVENT LOG</div>
                      <motion.div key={active} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
                        style={{ fontFamily: "'Orbitron',sans-serif", fontSize: "clamp(9px,1.1vw,12px)", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#f0e8d8" }}
                      >
                        {lang === "fr" ? ev.tagFr : ev.tag}
                      </motion.div>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontFamily: "monospace", fontSize: 7, letterSpacing: "0.22em", color: al(ev.dot, 0.4), marginBottom: 3 }}>[EVT-{String(active + 1).padStart(2, "0")}]</div>
                    <div style={{ fontFamily: "monospace", fontSize: 7.5, padding: "2px 8px", background: al(ev.dot, 0.1), border: `1px solid ${al(ev.dot, 0.3)}`, color: al(ev.dot, 0.9), letterSpacing: "0.2em", textTransform: "uppercase" }}>
                      {ev.type.toUpperCase()}
                    </div>
                  </div>
                </div>

                {/* Year display */}
                <motion.div key={active + "_y"} initial={{ opacity: 0, y: 14, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: 0.08, duration: 0.52, ease: [0.16, 1, 0.3, 1] }}
                  style={{ position: "relative", marginBottom: 12 }}
                >
                  <div style={{ position: "absolute", right: 0, top: -6, fontFamily: "'Orbitron',sans-serif", fontSize: "clamp(42px,6.5vw,76px)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1, color: al(ev.dot, 0.035), userSelect: "none", pointerEvents: "none" }}>
                    {ev.year}
                  </div>
                  <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: "clamp(26px,4vw,50px)", fontWeight: 900, letterSpacing: "-0.03em", lineHeight: 1, color: solidColor, textShadow: `0 0 30px ${al(ev.dot, 0.8)},0 0 60px ${al(ev.dot, 0.28)}`, position: "relative", zIndex: 1 }}>
                    {ev.year}
                  </div>
                  <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.2, duration: 0.52, ease: [0.16, 1, 0.3, 1] }}
                    style={{ height: 1.5, width: "55%", background: `linear-gradient(90deg,${al(ev.dot, 0.7)},transparent)`, transformOrigin: "left", marginTop: 5 }}
                  />
                </motion.div>

                {/* Typewriter text */}
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.22 }}
                  style={{ fontFamily: "Arial,Helvetica,sans-serif", fontSize: "clamp(12px,1.1vw,13.5px)", lineHeight: 1.9, color: "rgba(200,190,176,0.88)", margin: 0, flex: 1, minHeight: "4.5em", paddingLeft: 12, borderLeft: `2px solid ${al(ev.dot, 0.28)}` }}
                >
                  {typed}
                  {typed.length < desc.length && <span className="cursor-blink" style={{ color: solidColor, marginLeft: 1 }}>▌</span>}
                </motion.p>

                {/* Metrics bars */}
                <div style={{ marginTop: 14, paddingTop: 12, borderTop: `1px solid ${al(ev.dot, 0.1)}` }}>
                  <div style={{ fontFamily: "monospace", fontSize: 7, letterSpacing: "0.35em", color: al(ev.dot, 0.38), textTransform: "uppercase", marginBottom: 10 }}>
                    DATA ASSESSMENT
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {metrics.map((m, i) => (
                      <div key={metricsKey + "_" + i}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3, fontFamily: "monospace", fontSize: 7.5, letterSpacing: "0.08em" }}>
                          <span style={{ color: "rgba(160,150,138,0.65)" }}>{lang === "fr" ? m.lFr : m.l}</span>
                          <span style={{ color: al(ev.dot, 0.8) }}>{String(m.v).padStart(3, "0")}</span>
                        </div>
                        <div style={{ height: 2.5, background: "rgba(255,255,255,0.05)", borderRadius: 99, overflow: "hidden" }}>
                          <motion.div
                            style={{ height: "100%", borderRadius: 99, background: `linear-gradient(90deg,${al(ev.dot, 0.85)},${al(ev.dot, 0.45)})`, boxShadow: `0 0 6px ${al(ev.dot, 0.5)}` }}
                            initial={{ width: 0 }}
                            animate={{ width: barsOn ? `${m.v}%` : 0 }}
                            transition={{ duration: 0.9, delay: i * 0.13, ease: [0.16, 1, 0.3, 1] }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom nav */}
                {isMobileT ? (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 14, paddingTop: 10, borderTop: `1px solid ${al(ev.dot, 0.08)}`, gap: 8 }}>
                    <motion.button
                      onClick={() => active > 0 && selectEvent(active - 1)}
                      whileTap={active > 0 ? { scale: 0.94 } : {}}
                      style={{ flex: 1, padding: "13px 0", background: active === 0 ? "rgba(255,255,255,0.02)" : al(ev.dot, 0.06), border: `1px solid ${al(ev.dot, active === 0 ? 0.06 : 0.3)}`, borderRadius: 6, cursor: active === 0 ? "default" : "pointer", fontFamily: "'Orbitron',sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", color: active === 0 ? "rgba(255,255,255,0.1)" : al(ev.dot, 0.7) }}
                    >← PRÉC</motion.button>
                    <span style={{ fontFamily: "monospace", fontSize: 9, color: al(ev.dot, 0.4), letterSpacing: "0.1em", flexShrink: 0 }}>
                      {String(active + 1).padStart(2,"0")}/{String(N).padStart(2,"0")}
                    </span>
                    <motion.button
                      onClick={() => active < N - 1 && selectEvent(active + 1)}
                      whileTap={active < N - 1 ? { scale: 0.94 } : {}}
                      style={{ flex: 1, padding: "13px 0", background: active === N - 1 ? "rgba(255,255,255,0.02)" : al(ev.dot, 0.09), border: `1px solid ${al(ev.dot, active === N - 1 ? 0.06 : 0.45)}`, borderRadius: 6, cursor: active === N - 1 ? "default" : "pointer", fontFamily: "'Orbitron',sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", color: active === N - 1 ? "rgba(255,255,255,0.1)" : solidColor }}
                    >SUIV →</motion.button>
                  </div>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 14, paddingTop: 10, borderTop: `1px solid ${al(ev.dot, 0.08)}` }}>
                    <span style={{ fontFamily: "monospace", fontSize: 7, letterSpacing: "0.26em", color: "rgba(249,115,22,0.2)" }}>← → NAVIGATE</span>
                    <div style={{ display: "flex", gap: 8 }}>
                      {([{ d: -1, dis: active === 0, lbl: "← PREV" }, { d: 1, dis: active === N - 1, lbl: "NEXT →" }] as const).map(({ d, dis, lbl }) => (
                        <motion.button key={d}
                          onClick={() => !dis && selectEvent(active + d)}
                          whileHover={!dis ? { borderColor: al(ev.dot, 0.65), background: al(ev.dot, 0.08), y: -1 } : {}}
                          whileTap={!dis ? { scale: 0.95 } : {}}
                          style={{ padding: "6px 14px", background: d > 0 ? al(ev.dot, 0.05) : "transparent", border: `1px solid ${al(ev.dot, dis ? 0.08 : d > 0 ? 0.38 : 0.2)}`, borderRadius: 3, cursor: dis ? "default" : "pointer", fontFamily: "'Orbitron',sans-serif", fontSize: 7, fontWeight: 700, letterSpacing: "0.18em", color: dis ? "rgba(255,255,255,0.08)" : d > 0 ? solidColor : al(ev.dot, 0.65), transition: "border-color 0.2s,background 0.2s" }}
                        >{lbl}</motion.button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Particle burst on node click */}
      <AnimatePresence>
        {burstKey > 0 && Array.from({ length: 18 }).map((_, i) => {
          const angle = (i / 18) * Math.PI * 2;
          const dist  = 35 + Math.random() * 28;
          return (
            <motion.div key={`b_${burstKey}_${i}`}
              style={{ position: "fixed", left: burstOrigin.x, top: burstOrigin.y, width: i % 4 === 0 ? 5 : 3, height: i % 4 === 0 ? 5 : 3, borderRadius: "50%", background: solidColor, pointerEvents: "none", zIndex: 99999, marginLeft: -2, marginTop: -2 }}
              initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
              animate={{ x: Math.cos(angle) * dist, y: Math.sin(angle) * dist, opacity: 0, scale: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          );
        })}
      </AnimatePresence>
    </div>
  );
}

// ─── Lore Panel ───────────────────────────────────────────────────────────────
function LorePanel({ t, lang, onClose }: { t: typeof T["en"]; lang: Lang; onClose: () => void }) {
  return (
    <motion.div variants={stagger} initial="hidden" animate="visible">
      {/* Section heading */}
      <motion.div variants={staggerItem} style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 8 }}>
          <div style={{ width: 3, height: 20, background: "linear-gradient(to bottom,#f97316,transparent)" }} />
          <h2 style={{ fontFamily: "'Orbitron',sans-serif", fontSize: "clamp(14px,1.8vw,22px)", fontWeight: 900, letterSpacing: "0.28em", textTransform: "uppercase", color: "#fb923c" }}>{t.aboutTitle}</h2>
        </div>
        <div style={{ height: 1, background: "linear-gradient(90deg,rgba(249,115,22,0.35),transparent)", marginLeft: 17 }} />
      </motion.div>

      {/* Two-column layout on wide screens, single column on mobile */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap: "clamp(20px,3vw,52px)" }}>
        {/* Left col: about text */}
        <motion.p variants={staggerItem}
          style={{ color: "rgba(205,195,182,0.82)", lineHeight: 1.95, paddingLeft: 16, borderLeft: "2px solid rgba(249,115,22,0.38)", fontSize: "clamp(13px,1.4vw,15px)", alignSelf: "start" }}
        >
          {t.aboutText}
        </motion.p>

        {/* Right col: specs */}
        <motion.div variants={staggerItem}>
          <p style={{ fontFamily: "monospace", fontSize: 9, letterSpacing: "0.38em", color: "rgba(255,150,80,0.4)", textTransform: "uppercase", marginBottom: 14 }}>SERIES DATA</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {t.specs.map((s) => (
              <motion.div key={s.label}
                whileHover={{ x: 4, borderColor: "rgba(249,115,22,0.28)" }}
                style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 18px", border: "1px solid rgba(255,255,255,0.06)", background: "rgba(0,0,0,0.38)", borderRadius: 6, cursor: "default", backdropFilter: "blur(8px)", transition: "border-color 0.2s" }}
              >
                <div style={{ width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 6, background: "rgba(249,115,22,0.09)", border: "1px solid rgba(249,115,22,0.16)", flexShrink: 0 }}>
                  <s.icon size={17} color="#fb923c" />
                </div>
                <div>
                  <div style={{ fontSize: 8, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(140,130,118,0.65)", marginBottom: 3, fontFamily: "monospace" }}>{s.label}</div>
                  <div style={{ fontSize: "clamp(12px,1.4vw,14px)", fontWeight: 600, color: "rgba(235,225,210,0.9)" }}>{s.value}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Interactive timeline — full width */}
      <motion.div variants={staggerItem} style={{
        marginTop: 40,
        background: "rgba(0,0,0,0.45)", border: "1px solid rgba(249,115,22,0.1)",
        borderRadius: 8, padding: "24px 28px", backdropFilter: "blur(10px)",
      }}>
        <LoreTimeline lang={lang} />
      </motion.div>
    </motion.div>
  );
}

// ─── Characters Panel ─────────────────────────────────────────────────────────
// Per-character detailed SVG silhouettes
const CHAR_SVG: Record<string, (color: string) => React.ReactNode> = {
  jax: (c) => (
    <svg viewBox="0 0 160 300" style={{ width: "100%", height: "100%", display: "block" }} fill="none">
      {/* Hat brim */}
      <ellipse cx="80" cy="28" rx="34" ry="7" fill={c} opacity="0.55" />
      {/* Hat crown */}
      <path d="M58 28 Q60 8 80 6 Q100 8 102 28Z" fill={c} opacity="0.6" />
      {/* Head */}
      <ellipse cx="80" cy="40" rx="14" ry="16" fill={c} opacity="0.55" />
      {/* Neck */}
      <rect x="74" y="54" width="12" height="10" rx="3" fill={c} opacity="0.45" />
      {/* Coat body */}
      <path d="M48 64 Q80 56 112 64 L118 160 Q100 168 80 166 Q60 168 42 160 Z" fill={c} opacity="0.42" />
      {/* Coat lapels */}
      <path d="M80 64 L72 90 L68 64Z" fill={c} opacity="0.25" />
      <path d="M80 64 L88 90 L92 64Z" fill={c} opacity="0.25" />
      {/* Left arm (holding rifle) */}
      <path d="M48 70 Q34 85 28 130 Q26 148 34 152 L42 148 Q38 125 46 100 L56 78Z" fill={c} opacity="0.4" />
      {/* Right arm */}
      <path d="M112 70 Q126 85 132 130 Q134 148 126 152 L118 148 Q122 125 114 100 L104 78Z" fill={c} opacity="0.4" />
      {/* Rifle */}
      <path d="M28 128 L12 124 L10 130 L28 134Z" fill={c} opacity="0.6" />
      <rect x="28" y="126" width="50" height="6" rx="2" fill={c} opacity="0.55" />
      <rect x="56" y="121" width="8" height="16" rx="1" fill={c} opacity="0.45" />
      {/* Left leg */}
      <path d="M55 160 Q52 210 50 255 Q48 268 56 270 H70 Q74 268 72 255 L74 160Z" fill={c} opacity="0.45" />
      {/* Right leg */}
      <path d="M105 160 Q108 210 110 255 Q112 268 104 270 H90 Q86 268 88 255 L86 160Z" fill={c} opacity="0.45" />
      {/* Belt */}
      <rect x="48" y="152" width="64" height="8" rx="2" fill={c} opacity="0.35" />
      {/* Boots */}
      <path d="M50 255 Q46 275 44 285 H72 L72 255Z" fill={c} opacity="0.35" />
      <path d="M110 255 Q114 275 116 285 H88 L88 255Z" fill={c} opacity="0.35" />
    </svg>
  ),
  nerowbis: (c) => (
    <svg viewBox="0 0 160 300" style={{ width: "100%", height: "100%", display: "block" }} fill="none">
      {/* Tech helmet */}
      <ellipse cx="80" cy="30" rx="18" ry="20" fill={c} opacity="0.55" />
      <path d="M64 24 Q80 16 96 24 L100 36 Q80 42 60 36Z" fill={c} opacity="0.35" />
      {/* Visor */}
      <path d="M66 28 Q80 24 94 28 L92 36 Q80 40 68 36Z" fill={c} opacity="0.7" />
      {/* Antenna */}
      <line x1="92" y1="16" x2="100" y2="6" stroke={c} strokeWidth="1.5" opacity="0.7" />
      <circle cx="101" cy="5" r="2" fill={c} opacity="0.8" />
      {/* Neck */}
      <rect x="74" y="50" width="12" height="10" rx="2" fill={c} opacity="0.45" />
      {/* Body / suit */}
      <path d="M52 60 Q80 53 108 60 L112 148 Q96 156 80 154 Q64 156 48 148Z" fill={c} opacity="0.4" />
      {/* Chest panel */}
      <rect x="68" y="68" width="24" height="32" rx="3" fill={c} opacity="0.25" />
      <rect x="72" y="72" width="7" height="4" rx="1" fill={c} opacity="0.6" />
      <rect x="81" y="72" width="7" height="4" rx="1" fill={c} opacity="0.4" />
      {/* Backpack */}
      <rect x="104" y="64" width="20" height="40" rx="4" fill={c} opacity="0.38" />
      <rect x="106" y="68" width="16" height="8" rx="2" fill={c} opacity="0.2" />
      {/* Left arm */}
      <path d="M52 66 Q36 82 32 118 Q30 136 38 140 L46 136 Q42 115 50 92 L58 74Z" fill={c} opacity="0.4" />
      {/* Gauntlet tool */}
      <rect x="30" y="132" width="18" height="10" rx="3" fill={c} opacity="0.6" />
      <circle cx="38" cy="137" r="4" fill={c} opacity="0.4" />
      {/* Right arm */}
      <path d="M108 66 Q122 80 126 116 Q128 134 122 138 L114 134 Q118 113 110 92 L102 74Z" fill={c} opacity="0.4" />
      {/* Left leg */}
      <path d="M58 148 Q55 200 53 248 Q51 262 59 264 H73 Q77 262 75 248 L76 148Z" fill={c} opacity="0.42" />
      {/* Right leg */}
      <path d="M102 148 Q105 200 107 248 Q109 262 101 264 H87 Q83 262 85 248 L84 148Z" fill={c} opacity="0.42" />
      {/* Knee pads */}
      <ellipse cx="65" cy="210" rx="9" ry="6" fill={c} opacity="0.35" />
      <ellipse cx="95" cy="210" rx="9" ry="6" fill={c} opacity="0.35" />
    </svg>
  ),
  kira: (c) => (
    <svg viewBox="0 0 160 300" style={{ width: "100%", height: "100%", display: "block" }} fill="none">
      {/* Tech helmet */}
      <ellipse cx="80" cy="30" rx="18" ry="20" fill={c} opacity="0.55" />
      <path d="M64 24 Q80 16 96 24 L100 36 Q80 42 60 36Z" fill={c} opacity="0.35" />
      {/* Visor */}
      <path d="M66 28 Q80 24 94 28 L92 36 Q80 40 68 36Z" fill={c} opacity="0.7" />
      {/* Antenna */}
      <line x1="92" y1="16" x2="100" y2="6" stroke={c} strokeWidth="1.5" opacity="0.7" />
      <circle cx="101" cy="5" r="2" fill={c} opacity="0.8" />
      {/* Neck */}
      <rect x="74" y="50" width="12" height="10" rx="2" fill={c} opacity="0.45" />
      {/* Body / suit */}
      <path d="M52 60 Q80 53 108 60 L112 148 Q96 156 80 154 Q64 156 48 148Z" fill={c} opacity="0.4" />
      {/* Chest panel */}
      <rect x="68" y="68" width="24" height="32" rx="3" fill={c} opacity="0.25" />
      <rect x="72" y="72" width="7" height="4" rx="1" fill={c} opacity="0.6" />
      <rect x="81" y="72" width="7" height="4" rx="1" fill={c} opacity="0.4" />
      {/* Backpack */}
      <rect x="104" y="64" width="20" height="40" rx="4" fill={c} opacity="0.38" />
      <rect x="106" y="68" width="16" height="8" rx="2" fill={c} opacity="0.2" />
      {/* Left arm */}
      <path d="M52 66 Q36 82 32 118 Q30 136 38 140 L46 136 Q42 115 50 92 L58 74Z" fill={c} opacity="0.4" />
      {/* Gauntlet tool */}
      <rect x="30" y="132" width="18" height="10" rx="3" fill={c} opacity="0.6" />
      <circle cx="38" cy="137" r="4" fill={c} opacity="0.4" />
      {/* Right arm */}
      <path d="M108 66 Q122 80 126 116 Q128 134 122 138 L114 134 Q118 113 110 92 L102 74Z" fill={c} opacity="0.4" />
      {/* Left leg */}
      <path d="M58 148 Q55 200 53 248 Q51 262 59 264 H73 Q77 262 75 248 L76 148Z" fill={c} opacity="0.42" />
      {/* Right leg */}
      <path d="M102 148 Q105 200 107 248 Q109 262 101 264 H87 Q83 262 85 248 L84 148Z" fill={c} opacity="0.42" />
      {/* Knee pads */}
      <ellipse cx="65" cy="210" rx="9" ry="6" fill={c} opacity="0.35" />
      <ellipse cx="95" cy="210" rx="9" ry="6" fill={c} opacity="0.35" />
    </svg>
  ),
  nemesis: (c) => (
    <svg viewBox="0 0 160 300" style={{ width: "100%", height: "100%", display: "block" }} fill="none">
      {/* Heavy helmet */}
      <ellipse cx="80" cy="28" rx="20" ry="22" fill={c} opacity="0.52" />
      <path d="M60 18 Q80 10 100 18 L104 32 Q80 40 56 32Z" fill={c} opacity="0.3" />
      {/* Visor slit */}
      <rect x="66" y="26" width="28" height="6" rx="2" fill={c} opacity="0.65" />
      {/* Neck guard */}
      <rect x="70" y="50" width="20" height="12" rx="2" fill={c} opacity="0.45" />
      {/* Heavy shoulder pads */}
      <ellipse cx="42" cy="68" rx="18" ry="10" fill={c} opacity="0.5" />
      <ellipse cx="118" cy="68" rx="18" ry="10" fill={c} opacity="0.5" />
      {/* Torso armor */}
      <path d="M46 62 Q80 54 114 62 L120 158 Q100 166 80 164 Q60 166 40 158Z" fill={c} opacity="0.42" />
      {/* Chest plates */}
      <path d="M60 68 Q80 62 100 68 L98 100 Q80 106 62 100Z" fill={c} opacity="0.28" />
      {/* Arms — bulky */}
      <path d="M46 70 Q28 88 24 132 Q22 150 32 154 L44 150 Q38 126 48 100 L58 76Z" fill={c} opacity="0.45" />
      <path d="M114 70 Q132 88 136 132 Q138 150 128 154 L116 150 Q122 126 112 100 L102 76Z" fill={c} opacity="0.45" />
      {/* SMG / weapon */}
      <rect x="24" y="130" width="48" height="8" rx="2" fill={c} opacity="0.6" />
      <rect x="34" y="122" width="8" height="18" rx="1" fill={c} opacity="0.45" />
      <rect x="20" y="132" width="6" height="4" rx="1" fill={c} opacity="0.6" />
      {/* Left leg — armored */}
      <path d="M52 158 Q48 208 46 254 Q44 268 54 270 H70 Q74 268 72 254 L74 158Z" fill={c} opacity="0.45" />
      {/* Right leg */}
      <path d="M108 158 Q112 208 114 254 Q116 268 106 270 H90 Q86 268 88 254 L86 158Z" fill={c} opacity="0.45" />
      {/* Knee / shin armor */}
      <rect x="46" y="195" width="24" height="18" rx="3" fill={c} opacity="0.38" />
      <rect x="90" y="195" width="24" height="18" rx="3" fill={c} opacity="0.38" />
      {/* Boots — heavy */}
      <path d="M45 254 Q41 276 40 288 H72 L72 254Z" fill={c} opacity="0.4" />
      <path d="M115 254 Q119 276 120 288 H88 L88 254Z" fill={c} opacity="0.4" />
    </svg>
  ),
  celeste: (c) => (
    <svg viewBox="0 0 160 300" style={{ width: "100%", height: "100%", display: "block" }} fill="none">
      {/* Head */}
      <ellipse cx="80" cy="36" rx="15" ry="17" fill={c} opacity="0.52" />
      {/* Short hair */}
      <path d="M65 30 Q80 18 95 30 L97 38 Q80 44 63 38Z" fill={c} opacity="0.35" />
      {/* Neck */}
      <rect x="73" y="53" width="14" height="11" rx="3" fill={c} opacity="0.42" />
      {/* Collar tech */}
      <rect x="68" y="60" width="24" height="6" rx="2" fill={c} opacity="0.55" />
      {/* Bomber jacket */}
      <path d="M44 68 Q80 58 116 68 L120 162 Q100 170 80 168 Q60 170 40 162Z" fill={c} opacity="0.38" />
      {/* Jacket lapels */}
      <path d="M80 68 L74 94 L70 68Z" fill={c} opacity="0.22" />
      <path d="M80 68 L86 94 L90 68Z" fill={c} opacity="0.22" />
      {/* Belt */}
      <rect x="46" y="158" width="68" height="10" rx="2" fill={c} opacity="0.45" />
      {/* Left arm */}
      <path d="M44 74 Q28 92 24 136 Q22 154 32 157 L44 153 Q38 128 48 102 L58 80Z" fill={c} opacity="0.38" />
      {/* Right arm */}
      <path d="M116 74 Q132 92 136 136 Q138 154 128 157 L116 153 Q122 128 112 102 L102 80Z" fill={c} opacity="0.38" />
      {/* Pants — tactical stripe */}
      <path d="M54 168 Q50 218 48 260 Q46 274 56 276 H72 Q76 274 74 260 L76 168Z" fill={c} opacity="0.42" />
      <path d="M106 168 Q110 218 112 260 Q114 274 104 276 H88 Q84 274 86 260 L84 168Z" fill={c} opacity="0.42" />
      {/* Side stripes */}
      <rect x="48" y="175" width="5" height="80" rx="2" fill={c} opacity="0.22" />
      <rect x="107" y="175" width="5" height="80" rx="2" fill={c} opacity="0.22" />
      {/* Knee pads */}
      <rect x="48" y="210" width="24" height="16" rx="3" fill={c} opacity="0.35" />
      <rect x="88" y="210" width="24" height="16" rx="3" fill={c} opacity="0.35" />
      {/* Boots */}
      <path d="M47 260 Q43 278 42 290 H74 L74 260Z" fill={c} opacity="0.38" />
      <path d="M113 260 Q117 278 118 290 H86 L86 260Z" fill={c} opacity="0.38" />
    </svg>
  ),
};

function CharSilhouette({ id, color }: { id: string; color: string }) {
  const render = CHAR_SVG[id];
  if (!render) return null;
  return <>{render(color)}</>;
}

function AttrBar({ label, value, color, delay }: { label: string; value: number; color: string; delay: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <span style={{ fontFamily: "monospace", fontSize: 7.5, letterSpacing: "0.18em", color: "rgba(200,185,160,0.5)", textTransform: "uppercase", width: 82, flexShrink: 0 }}>{label}</span>
      <div style={{ flex: 1, height: 4, background: "rgba(255,255,255,0.05)", borderRadius: 2, overflow: "hidden", position: "relative" }}>
        <motion.div
          initial={{ width: "0%" }}
          animate={{ width: value + "%" }}
          transition={{ duration: 1.1, delay: delay / 1000, ease: [0.16, 1, 0.3, 1] }}
          style={{ height: "100%", background: `linear-gradient(90deg,${color}88,${color})`, borderRadius: 2, position: "relative" }}
        >
          {/* Glowing tip */}
          <motion.div animate={{ opacity: [0.6,1,0.6] }} transition={{ duration: 1.4, repeat: Infinity }}
            style={{ position: "absolute", right: -1, top: -2, width: 4, height: 8, borderRadius: 2, background: color, boxShadow: `0 0 8px ${color}` }} />
        </motion.div>
      </div>
      <motion.span
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: delay / 1000 + 0.8 }}
        style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 10, fontWeight: 900, color, width: 26, textAlign: "right", flexShrink: 0, textShadow: `0 0 12px ${color}88` }}
      >{value}</motion.span>
    </div>
  );
}

// Per-character mobile image positioning (vw-based, device-independent)
// Calculated from actual PNG pixel bounds: scale so char fills ~85vw, head at 45px
const CHAR_MOBILE_IMG: Record<string, { width: string; left: string; top: string }> = {
  jax:      { width: "124vw", left: "-13.4vw", top: "calc(45px - 14.5vw)" },
  nerowbis: { width: "110vw", left: "-5vw",    top: "calc(45px - 4.3vw)"  },
  nemesis:  { width: "171vw", left: "-32.1vw", top: "calc(45px - 13.1vw)" },
  celeste:  { width: "195vw", left: "-42.6vw", top: "calc(45px - 10.5vw)" },
};

function CharactersPanel({ t, onClose, setActiveChar }: { t: typeof T["en"]; onClose: () => void; setActiveChar: (c: CharData) => void }) {
  const [selected, setSelected] = useState<CharData>(t.chars[0]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640 || (window.innerWidth < 900 && window.innerHeight < 500));
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const statusColor = (s: string) => s === "HOSTILE" ? "#ef4444" : ["ACTIVE","ACTIF"].includes(s) ? "#22c55e" : "#f97316";

  useEffect(() => {
    setSelected(prev => t.chars.find(c => c.id === prev.id) ?? t.chars[0]);
  }, [t]);

  const handleSelect = (char: CharData) => {
    setSelected(char);
  };


  return (
    <div style={{
      display: "flex",
      flexDirection: isMobile ? "column" : "row",
      height: isMobile ? "calc(100dvh - 56px)" : "calc(100vh - 180px)",
      minHeight: isMobile ? 480 : 520,
      margin: "calc(-1 * clamp(22px,4vh,44px)) calc(-1 * clamp(20px,4vw,60px)) -52px",
      overflow: "hidden",
    }}>

      {/* ══ MOBILE: horizontal selector ══ */}
      {isMobile && (
        <div className="hide-scrollbar" style={{ display: "flex", gap: 8, overflowX: "auto", padding: "10px 12px", borderBottom: "1px solid rgba(249,115,22,0.1)", background: "rgba(4,2,1,0.92)", flexShrink: 0 }}>
          {t.chars.map((char) => {
            const isActive = char.id === selected.id;
            const sc = statusColor(char.statusLabel);
            return (
              <button key={char.id} onClick={() => handleSelect(char)}
                style={{ flexShrink: 0, width: 72, height: 96, position: "relative", overflow: "hidden", border: `1px solid ${isActive ? char.color + "80" : "rgba(249,115,22,0.14)"}`, borderRadius: 6, padding: 0, cursor: "pointer", background: "rgba(4,2,1,0.8)", transition: "border-color 0.2s" }}>
                {char.image && (
                  <img src={char.image} alt={char.name} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center", opacity: isActive ? 0.8 : 0.45 }} />
                )}
                <div style={{ position: "absolute", inset: 0, background: isActive ? `linear-gradient(to top, ${char.color}55 0%, transparent 60%)` : "linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 55%)" }} />
                <div style={{ position: "absolute", top: 5, right: 5, width: 5, height: 5, borderRadius: "50%", background: sc, boxShadow: `0 0 6px ${sc}` }} />
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "4px 5px 5px" }}>
                  <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 7.5, fontWeight: 900, letterSpacing: "0.1em", color: isActive ? "#fff" : "rgba(240,232,216,0.6)", textTransform: "uppercase", textAlign: "center", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{char.name}</div>
                </div>
                {isActive && <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, background: char.color }} />}
              </button>
            );
          })}
        </div>
      )}

      {/* ══ DESKTOP: Sidebar ══ */}
      {!isMobile && (
        <div style={{ width: 250, flexShrink: 0, borderRight: "1px solid rgba(249,115,22,0.12)", display: "flex", flexDirection: "column", overflow: "hidden", background: "rgba(4,2,1,0.72)" }}>
          {/* Header */}
          <div style={{ padding: "20px 16px 14px", borderBottom: "1px solid rgba(249,115,22,0.08)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <div style={{ width: 3, height: 16, background: "#f97316", borderRadius: 1 }} />
              <span style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 10, fontWeight: 900, letterSpacing: "0.2em", color: "#fb923c" }}>OPERATIVE FILES</span>
            </div>
            <div style={{ fontFamily: "monospace", fontSize: 7, letterSpacing: "0.32em", color: "rgba(249,115,22,0.32)", textTransform: "uppercase", paddingLeft: 11 }}>SELECT A RAIDER</div>
          </div>
          {/* Char cards */}
          <div className="hide-scrollbar" style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8, padding: "12px 10px" }}>
            {t.chars.map((char) => {
              const isActive = char.id === selected.id;
              const sc = statusColor(char.statusLabel);
              return (
                <button key={char.id}
                  onClick={() => handleSelect(char)}
                  style={{
                    background: isActive ? char.color + "18" : "rgba(6,4,1,0.6)",
                    border: `1px solid ${isActive ? char.color + "60" : "rgba(249,115,22,0.1)"}`,
                    borderRadius: 6, padding: 0, cursor: "pointer", overflow: "hidden",
                    textAlign: "left", position: "relative", width: "100%",
                    transition: "border-color 0.2s, background 0.2s",
                    display: "block",
                  }}
                >
                  {isActive && <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 2, background: char.color, zIndex: 3 }} />}
                  <div style={{ height: 110, position: "relative", overflow: "hidden", background: `radial-gradient(ellipse at 50% 80%, ${char.color}18 0%, rgba(4,3,1,0.97) 70%)` }}>
                    {char.image ? (
                      <img src={char.image} alt={char.name} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center", opacity: 0.82, filter: `drop-shadow(0 0 10px ${char.color}44)` }} />
                    ) : (
                      <div style={{ position: "absolute", inset: 0, opacity: 0.26 }}><CharSilhouette id={char.id} color={char.color} /></div>
                    )}
                    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 56, background: "linear-gradient(transparent,rgba(3,2,1,0.98))" }} />
                    <div style={{ position: "absolute", top: 6, right: 7, display: "flex", alignItems: "center", gap: 3, zIndex: 2 }}>
                      <div style={{ width: 4, height: 4, borderRadius: "50%", background: sc }} />
                      <span style={{ fontFamily: "monospace", fontSize: 6, letterSpacing: "0.14em", color: sc }}>{char.statusLabel}</span>
                    </div>
                    <div style={{ position: "absolute", bottom: 8, left: 12, right: 8, zIndex: 2 }}>
                      <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 11, fontWeight: 900, letterSpacing: "0.12em", color: isActive ? "#fff" : "rgba(240,232,216,0.82)", textTransform: "uppercase", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{char.name}</div>
                      <div style={{ fontFamily: "monospace", fontSize: 6.5, letterSpacing: "0.16em", color: char.color + "cc", textTransform: "uppercase", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{char.role}</div>
                      <div style={{ fontFamily: "monospace", fontSize: 6, letterSpacing: "0.1em", color: "rgba(249,115,22,0.4)", marginTop: 2 }}>{char.fileNum}</div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          {/* Sidebar footer */}
          <div style={{ padding: "10px 14px", borderTop: "1px solid rgba(249,115,22,0.08)", display: "flex", alignItems: "center", gap: 6 }}>
            <motion.div animate={{ opacity: [1,0.3,1] }} transition={{ duration: 1.8, repeat: Infinity }} style={{ width: 5, height: 5, borderRadius: "50%", background: "#22c55e" }} />
            <span style={{ fontFamily: "monospace", fontSize: 7, letterSpacing: "0.22em", color: "rgba(34,197,94,0.7)" }}>SPERANZA NETWORK — ONLINE</span>
          </div>
        </div>
      )}

      {/* ══ CENTRAL ZONE: Character dominates ══ */}
      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>

        {/* ── BG canvas layer ── */}
        <CharViewportBG color={selected.color} />

        {/* ── Ambient pulse ── */}
        <motion.div animate={{ opacity: [0, 0.12, 0] }} transition={{ duration: 3.5, repeat: Infinity }}
          style={{ position: "absolute", inset: 0, zIndex: 6, pointerEvents: "none",
            background: `radial-gradient(ellipse at 60% 30%, ${selected.color}40 0%, transparent 55%)`, mixBlendMode: "screen" }} />

        {/* ── Dust particles ── */}
        <div style={{ position: "absolute", inset: 0, zIndex: 7 }}><DustFX /></div>

        {/* ── HUD grid overlay ── */}
        <div style={{ position: "absolute", inset: 0, zIndex: 8, pointerEvents: "none",
          backgroundImage: `linear-gradient(rgba(249,115,22,0.022) 1px,transparent 1px),linear-gradient(90deg,rgba(249,115,22,0.022) 1px,transparent 1px)`,
          backgroundSize: "40px 40px" }} />

        {/* ── Top HUD bar ── */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 25, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 16px", background: "rgba(3,1,0,0.55)", backdropFilter: "blur(6px)", borderBottom: "1px solid rgba(249,115,22,0.1)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <motion.div animate={{ opacity: [1,0.2,1] }} transition={{ duration: 1.5, repeat: Infinity }}
              style={{ width: 5, height: 5, borderRadius: "50%", background: "#f97316" }} />
            <span style={{ fontFamily: "monospace", fontSize: 8, letterSpacing: "0.28em", color: "rgba(249,115,22,0.6)", textTransform: "uppercase" }}>FILE #{selected.fileNum}</span>
          </div>
          <AnimatePresence mode="wait">
            <motion.span key={selected.id + "-scan"}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
              style={{ fontFamily: "monospace", fontSize: 7, letterSpacing: "0.3em", color: "rgba(249,115,22,0.38)", textTransform: "uppercase" }}>
              SCAN ▶ {selected.statusLabel}
            </motion.span>
          </AnimatePresence>
        </div>

        {/* ── Corner HUD brackets ── */}
        {([["top","left"],["top","right"],["bottom","left"],["bottom","right"]] as [string,string][]).map(([v,h]) => (
          <motion.div key={v+h}
            initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.25 }}
            style={{ position: "absolute", [v]: 10, [h]: 10, width: 20, height: 20, zIndex: 26,
              borderTop: v === "top" ? `2px solid ${selected.color}80` : "none",
              borderBottom: v === "bottom" ? `2px solid ${selected.color}80` : "none",
              borderLeft: h === "left" ? `2px solid ${selected.color}80` : "none",
              borderRight: h === "right" ? `2px solid ${selected.color}80` : "none",
            }} />
        ))}

        {/* ── Scanning beam ── */}
        <motion.div animate={{ top: ["12%", "90%", "12%"] }} transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
          style={{ position: "absolute", left: 0, right: 0, height: 1.5, zIndex: 15, pointerEvents: "none",
            background: `linear-gradient(90deg,transparent,${selected.color}55,${selected.color}cc,${selected.color}55,transparent)`,
            boxShadow: `0 0 14px ${selected.color}55` }} />

        {/* ── Glitch line ── */}
        <motion.div
          animate={{ opacity: [0,0,0,0.6,0,0.4,0,0,0,0], top: ["32%","32%","32%","46%","46%","63%","63%","63%","63%","63%"] }}
          transition={{ duration: 9, repeat: Infinity, times: [0,0.58,0.70,0.72,0.74,0.80,0.82,0.88,0.94,1] }}
          style={{ position: "absolute", left: 0, right: 0, height: 1, zIndex: 24, pointerEvents: "none",
            background: `linear-gradient(90deg,transparent 5%,${selected.color}55 30%,rgba(255,255,255,0.35) 50%,${selected.color}55 70%,transparent 95%)` }}
        />

        {/* ── Character image ── */}
        <AnimatePresence mode="wait">
          <motion.div key={selected.id + "-img"}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            style={{ position: "absolute", inset: 0, zIndex: 5 }}
          >
            {selected.image ? (
              isMobile ? (
                /* Mobile: per-character vw sizing — character fills ~85vw, head always at 45px */
                <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
                  {(() => { const s = CHAR_MOBILE_IMG[selected.id]; return (
                    <img src={selected.image} alt={selected.name}
                      style={{
                        position: "absolute",
                        width: s?.width ?? "100%",
                        height: "auto",
                        maxWidth: "none",
                        left: s?.left ?? 0,
                        top: s?.top ?? 0,
                        display: "block",
                        filter: `drop-shadow(0 0 60px ${selected.color}30)`,
                      }} />
                  ); })()}
                </div>
              ) : (
                <img src={selected.image} alt={selected.name}
                  style={{ width: "100%", height: "100%", display: "block", objectFit: "cover",
                    objectPosition: (selected.id === "nerowbis" || selected.id === "celeste") ? "50% 0%" : "50% 5%",
                    filter: `drop-shadow(0 0 60px ${selected.color}30)` }} />
              )
            ) : (
              <div style={{ position: "absolute", inset: 0, display: "flex", justifyContent: "center", alignItems: "flex-end", paddingBottom: "4%" }}>
                <div style={{ width: "42%", height: "88%", opacity: 0.55 }}><CharSilhouette id={selected.id} color={selected.color} /></div>
              </div>
            )}
            {!isMobile && <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "linear-gradient(to right, rgba(3,2,1,0.55) 0%, transparent 30%)" }} />}
            <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: isMobile
              ? "linear-gradient(to top, rgba(3,2,1,0.98) 0%, rgba(3,2,1,0.82) 28%, rgba(3,2,1,0.2) 50%, transparent 70%)"
              : "linear-gradient(to top, rgba(3,2,1,0.7) 0%, transparent 35%)" }} />
            {!isMobile && <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "linear-gradient(to left, rgba(3,2,1,0.82) 0%, rgba(3,2,1,0.55) 32%, transparent 55%)" }} />}
          </motion.div>
        </AnimatePresence>

        {/* ── Info overlay — right 1/3 desktop / bottom mobile ── */}
        <AnimatePresence mode="wait">
          <motion.div key={selected.id + "-overlay"}
            initial={{ opacity: 0, y: isMobile ? 16 : 0, x: isMobile ? 0 : 24 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: isMobile ? 8 : 0, x: isMobile ? 0 : 16 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="hide-scrollbar"
            style={{
              position: "absolute",
              ...(isMobile ? { left: 0, right: 0, bottom: 0, top: "auto" }
                          : { top: "10%", right: 0, bottom: 32, width: "clamp(260px, 38%, 380px)" }),
              zIndex: 20, overflowY: "auto",
              display: "flex", flexDirection: "column", justifyContent: "flex-end",
              padding: isMobile ? "0 20px 20px" : "0 28px 24px",
              gap: isMobile ? 10 : 14,
              maxHeight: isMobile ? "50%" : "unset",
            }}
          >
            <div>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }}
                style={{ fontFamily: "monospace", fontSize: 8, letterSpacing: "0.35em", color: selected.color, textTransform: "uppercase", marginBottom: 6, opacity: 0.75 }}>
                ▸ {selected.role.toUpperCase()}
              </motion.div>
              <motion.h2 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08, ease: [0.16,1,0.3,1] }}
                style={{ fontFamily: "'Orbitron',sans-serif", fontSize: isMobile ? `${Math.max(22, Math.min(42, Math.round(210 / selected.name.length)))}px` : `clamp(22px, ${4.8 / (selected.name.length / 5)}vw, 64px)`, fontWeight: 900, letterSpacing: "0.04em", color: "#fff", textShadow: `0 0 60px ${selected.color}88, 0 2px 4px rgba(0,0,0,0.9)`, margin: 0, lineHeight: 0.95, textTransform: "uppercase", whiteSpace: "nowrap" }}>
                {selected.name}
              </motion.h2>
              <div style={{ height: 2, width: 40, background: selected.color, marginTop: 10, borderRadius: 1, boxShadow: `0 0 12px ${selected.color}` }} />
            </div>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.18 }}
              style={{ fontFamily: "monospace", fontSize: isMobile ? 9 : 9.5, letterSpacing: "0.05em", color: "rgba(200,185,160,0.72)", lineHeight: 1.75, margin: 0 }}>
              {selected.bio}
            </motion.p>
          </motion.div>
        </AnimatePresence>

        {/* ── CLEARANCE: GRANTED — desktop only ── */}
        {!isMobile && (
          <div style={{ position: "absolute", bottom: 10, left: 0, right: 0, textAlign: "center", zIndex: 22, pointerEvents: "none" }}>
            <motion.span animate={{ opacity: [0.4, 0.9, 0.4] }} transition={{ duration: 2.8, repeat: Infinity }}
              style={{ fontFamily: "monospace", fontSize: 8, letterSpacing: "0.55em", color: selected.color, textShadow: `0 0 16px ${selected.color}88`, textTransform: "uppercase" }}>
              CLEARANCE: GRANTED
            </motion.span>
          </div>
        )}

      </div>

      {/* ══ FOOTER — desktop only ══ */}
      {!isMobile && <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        height: 32, zIndex: 30,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 20px",
        borderTop: "1px solid rgba(249,115,22,0.1)",
        background: "rgba(4,2,1,0.85)",
        backdropFilter: "blur(8px)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <svg viewBox="0 0 14 14" style={{ width: 9, height: 9, opacity: 0.55 }} fill="none" stroke="rgba(249,115,22,0.8)" strokeWidth="1.2"><path d="M7 1L9 5H13L10 8L11.5 12L7 9.5L2.5 12L4 8L1 5H5Z" /></svg>
          <span style={{ fontFamily: "monospace", fontSize: 7, letterSpacing: "0.22em", color: "rgba(249,115,22,0.45)", textTransform: "uppercase" }}>ARC SYSTEMS</span>
        </div>
        {!isMobile && <span style={{ fontFamily: "monospace", fontSize: 7, letterSpacing: "0.18em", color: "rgba(249,115,22,0.22)", textTransform: "uppercase" }}>STAY SHARP. STAY QUIET. SURVIVE TOGETHER.</span>}
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ fontFamily: "monospace", fontSize: 7, letterSpacing: "0.16em", color: "rgba(249,115,22,0.38)", textTransform: "uppercase" }}>RAIDER_2180</span>
          <motion.div animate={{ opacity: [1,0.3,1] }} transition={{ duration: 2.2, repeat: Infinity }} style={{ width: 5, height: 5, borderRadius: "50%", background: "#f97316" }} />
        </div>
      </div>}

    </div>
  );
}

// ─── Episodes Panel ───────────────────────────────────────────────────────────
// ─── Episode 3D Card ──────────────────────────────────────────────────────────
const EP1_RELEASE = new Date("2026-05-28T18:00:00");

function useCountdown(target: Date) {
  const calc = () => {
    const diff = target.getTime() - Date.now();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, done: true };
    const s = Math.floor(diff / 1000);
    return {
      days:    Math.floor(s / 86400),
      hours:   Math.floor((s % 86400) / 3600),
      minutes: Math.floor((s % 3600) / 60),
      seconds: s % 60,
      done: false,
    };
  };
  const [state, setState] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setState(calc()), 1000);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return state;
}

function EpCard3D({ ep, lang, featured = false, index = 0, onTeaser }: {
  ep: EpisodeData; lang: Lang; featured?: boolean; index?: number; onTeaser?: () => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const rawX  = useMotionValue(0);
  const rawY  = useMotionValue(0);
  const rotX  = useSpring(rawX, { stiffness: 145, damping: 20 });
  const rotY  = useSpring(rawY, { stiffness: 145, damping: 20 });
  const glowX = useMotionValue(50);
  const glowY = useMotionValue(50);
  const [hovered, setHovered] = useState(false);
  const countdown = useCountdown(EP1_RELEASE);
  const [isMobileEp, setIsMobileEp] = useState(false);
  useEffect(() => {
    const check = () => setIsMobileEp(window.innerWidth < 640 || (window.innerWidth < 900 && window.innerHeight < 500));
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const glowBg = useTransform(
    [glowX, glowY],
    ([x, y]: number[]) =>
      `radial-gradient(circle at ${x}% ${y}%, rgba(249,115,22,${ep.locked ? 0.04 : 0.17}) 0%, transparent 58%)`
  );

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const r = cardRef.current.getBoundingClientRect();
    const cx = (e.clientX - r.left) / r.width;
    const cy = (e.clientY - r.top) / r.height;
    rawY.set((cx - 0.5) * (featured ? 16 : 26));
    rawX.set(-(cy - 0.5) * (featured ? 11 : 18));
    glowX.set(cx * 100);
    glowY.set(cy * 100);
  };
  const onLeave = () => { rawX.set(0); rawY.set(0); glowX.set(50); glowY.set(50); setHovered(false); };

  const accentAlpha = ep.locked ? 0.1 : hovered ? 0.65 : 0.3;

  return (
    /* Entrance wrapper: 3D flip from side */
    <motion.div
      initial={{ opacity: 0, rotateY: featured ? -12 : (index % 2 === 0 ? -72 : 72), y: featured ? 40 : 20, filter: "blur(8px)" }}
      animate={{ opacity: 1, rotateY: 0, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.68, ease: [0.16, 1, 0.3, 1], delay: index * 0.1 }}
      style={{ perspective: "1100px", transformStyle: "preserve-3d" }}
    >
    <motion.div
      ref={cardRef}
      className="ep-card"
      onMouseMove={onMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={onLeave}
      style={{
        rotateX: rotX, rotateY: rotY,
        transformStyle: "preserve-3d", perspective: "1100px",
        position: "relative", overflow: "hidden",
        display: featured && ep.num === 1 && isMobileEp ? "flex" : "block",
        flexDirection: "column" as const,
        background: ep.locked ? "rgba(7,5,3,0.82)" : "rgba(10,6,2,0.9)",
        border: `1px solid rgba(249,115,22,${accentAlpha})`,
        borderRadius: featured ? 12 : 10,
        backdropFilter: "blur(16px)",
        cursor: ep.locked ? "default" : "pointer",
        minHeight: featured ? (ep.num === 1 ? (isMobileEp ? "auto" : 280) : 200) : 136,
        boxShadow: hovered && !ep.locked
          ? "0 0 48px rgba(249,115,22,0.22), 0 16px 48px rgba(0,0,0,0.7), 0 0 0 1px rgba(249,115,22,0.2)"
          : "0 6px 28px rgba(0,0,0,0.5)",
        transition: "box-shadow 0.3s",
      }}
    >
      {/* Mouse glow */}
      <motion.div style={{ position: "absolute", inset: 0, background: glowBg, pointerEvents: "none", zIndex: 1 }} />

      {/* HUD grid */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0,
        backgroundImage: "linear-gradient(rgba(249,115,22,1) 1px,transparent 1px),linear-gradient(90deg,rgba(249,115,22,1) 1px,transparent 1px)",
        backgroundSize: "36px 36px",
        opacity: ep.locked ? 0.018 : 0.038,
      }} />

      {/* Corner brackets */}
      {([[0,0,"top","left"],[0,1,"top","right"],[1,0,"bottom","left"],[1,1,"bottom","right"]] as const).map(([tb,lr,tbK,lrK],i) => (
        <div key={i} style={{
          position: "absolute", [tbK]: 0, [lrK]: 0, width: 12, height: 12, zIndex: 5,
          [`border${tbK.charAt(0).toUpperCase()+tbK.slice(1)}`]: `1px solid rgba(249,115,22,${ep.locked ? 0.14 : 0.5})`,
          [`border${lrK.charAt(0).toUpperCase()+lrK.slice(1)}`]: `1px solid rgba(249,115,22,${ep.locked ? 0.14 : 0.5})`,
        }} />
      ))}

      {/* Large watermark number */}
      <div style={{
        position: "absolute", bottom: -8, right: 12,
        fontFamily: "'Orbitron',sans-serif",
        fontSize: featured ? "clamp(90px,11vw,130px)" : "clamp(64px,8vw,96px)",
        fontWeight: 900, lineHeight: 1, letterSpacing: "-0.04em",
        color: ep.locked ? "rgba(255,255,255,0.022)" : "rgba(249,115,22,0.07)",
        userSelect: "none", pointerEvents: "none", zIndex: 0,
      }}>
        {String(ep.num).padStart(2, "0")}
      </div>

      {/* EP01 featured: cover image — desktop: left column / mobile: top band */}
      {featured && ep.num === 1 && (
        isMobileEp ? (
          /* MOBILE: full-width image band on top */
          <div style={{ position: "relative", width: "100%", height: 170, overflow: "hidden", zIndex: 2, flexShrink: 0 }}>
            <img
              src="/ep1-cover.png"
              alt="Episode 1 Cover"
              style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 40%", display: "block" }}
            />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(10,6,2,0.2) 0%, transparent 40%, rgba(10,6,2,0.98) 100%)" }} />
            <div style={{ position: "absolute", top: 10, left: 12, fontFamily: "monospace", fontSize: 7, letterSpacing: "0.4em", color: "rgba(249,115,22,0.75)", textTransform: "uppercase", background: "rgba(0,0,0,0.55)", padding: "3px 7px", borderRadius: 3, border: "1px solid rgba(249,115,22,0.25)" }}>
              EP 01
            </div>
          </div>
        ) : (
          /* DESKTOP: absolute left column */
          <div style={{ position: "absolute", top: 0, left: 0, width: "38%", bottom: 0, zIndex: 2, overflow: "hidden" }}>
            <img
              src="/ep1-cover.png"
              alt="Episode 1 Cover"
              style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center center", display: "block" }}
            />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, transparent 55%, rgba(10,6,2,0.95) 100%)" }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(10,6,2,0.35) 0%, transparent 30%, transparent 70%, rgba(10,6,2,0.55) 100%)" }} />
            <div style={{ position: "absolute", top: 14, left: 14, fontFamily: "monospace", fontSize: 7, letterSpacing: "0.4em", color: "rgba(249,115,22,0.75)", textTransform: "uppercase", background: "rgba(0,0,0,0.55)", padding: "4px 8px", borderRadius: 3, backdropFilter: "blur(6px)", border: "1px solid rgba(249,115,22,0.25)" }}>
              EP 01
            </div>
          </div>
        )
      )}

      {/* Content */}
      <div style={{
        position: "relative", zIndex: 2,
        padding: featured ? (isMobileEp ? "14px 16px 16px" : "20px 24px 18px") : "14px 18px 14px",
        ...(featured && ep.num === 1 && !isMobileEp ? { marginLeft: "38%" } : {}),
        height: "100%", display: "flex", flexDirection: "column", gap: featured ? (isMobileEp ? 10 : 12) : 8,
      }}>

        {/* Top row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontFamily: "monospace", fontSize: 7.5, letterSpacing: "0.44em", color: "rgba(249,115,22,0.48)", textTransform: "uppercase" }}>
            EP&nbsp;{String(ep.num).padStart(2,"0")}{featured ? " — SEASON 01" : ""}
          </span>
          {/* Status badge */}
          <div style={{
            display: "flex", alignItems: "center", gap: 5, padding: "3px 8px",
            background: ep.locked ? "rgba(180,40,40,0.09)" : ep.status === "POST-PRODUCTION" ? "rgba(249,115,22,0.09)" : "rgba(34,197,94,0.09)",
            border: `1px solid ${ep.locked ? "rgba(180,40,40,0.28)" : ep.status === "POST-PRODUCTION" ? "rgba(249,115,22,0.45)" : "rgba(34,197,94,0.28)"}`,
            borderRadius: 3,
          }}>
            {!ep.locked ? (
              <motion.div animate={{ scale:[1,1.6,1], opacity:[1,0.4,1] }} transition={{ duration: 1.8, repeat: Infinity }}
                style={{ width: 4, height: 4, borderRadius: "50%", background: ep.status === "POST-PRODUCTION" ? "#f97316" : "#22c55e", flexShrink: 0 }}
              />
            ) : (
              <svg viewBox="0 0 10 12" style={{ width: 6, height: 8 }} fill="none">
                <rect x="0.5" y="4" width="9" height="7.5" rx="1.2" stroke="rgba(180,40,40,0.7)" strokeWidth="1"/>
                <path d="M3 4V3a2 2 0 1 1 4 0v1" stroke="rgba(180,40,40,0.7)" strokeWidth="1"/>
              </svg>
            )}
            <span style={{ fontFamily: "monospace", fontSize: 6.5, letterSpacing: "0.28em", textTransform: "uppercase", color: ep.locked ? "rgba(180,60,60,0.75)" : ep.status === "POST-PRODUCTION" ? "#f97316" : "#22c55e" }}>
              {ep.status}
            </span>
          </div>
        </div>

        {/* Separator */}
        <div style={{ height: 1, background: `linear-gradient(90deg,rgba(249,115,22,${ep.locked ? 0.06 : 0.22}),transparent)` }} />

        {/* Title */}
        <div style={{
          fontFamily: "'Orbitron',sans-serif",
          fontSize: featured ? "clamp(20px,2.8vw,32px)" : "clamp(11px,1.35vw,14px)",
          fontWeight: 900, letterSpacing: featured ? "0.08em" : "0.12em",
          color: ep.locked ? "rgba(240,232,220,0.14)" : "#f0e8d8",
          textTransform: "uppercase", lineHeight: 1.2,
        }}>
          {ep.locked ? (
            <span style={{ fontFamily: "monospace", letterSpacing: "0.08em" }}>
              {"█".repeat(Math.ceil(ep.title.length * 0.65))}&nbsp;{"█".repeat(Math.floor(ep.title.length * 0.35))}
            </span>
          ) : ep.title}
        </div>

        {/* Synopsis */}
        {featured && !ep.locked && ep.synopsis && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {ep.synopsis.split("\n\n").map((para, i) => (
              <p key={i} style={{ fontFamily: "Georgia,serif", fontStyle: "italic", fontSize: "clamp(11px,1.1vw,13px)", color: "rgba(215,195,165,0.62)", lineHeight: 1.85, margin: 0 }}>
                {para}
              </p>
            ))}
          </div>
        )}

        {/* Countdown — EP01 featured only, before release */}
        {featured && ep.num === 1 && !countdown.done && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            style={{
              position: "relative", overflow: "hidden",
              background: "rgba(249,115,22,0.05)",
              border: "1px solid rgba(249,115,22,0.22)",
              borderRadius: 8, padding: "14px 18px",
              display: "inline-flex", flexDirection: "column",
              alignSelf: "flex-start",
            }}
          >
            {/* inner glow pulse */}
            <motion.div
              animate={{ opacity: [0.3, 0.65, 0.3] }}
              transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
              style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 100%, rgba(249,115,22,0.12) 0%, transparent 70%)", pointerEvents: "none" }}
            />
            {/* scanline */}
            <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.03) 3px,rgba(0,0,0,0.03) 4px)" }} />

            {/* label */}
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 12 }}>
              <motion.div
                animate={{ opacity: [1, 0.15, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
                style={{ width: 5, height: 5, borderRadius: "50%", background: "#f97316", flexShrink: 0 }}
              />
              <span style={{ fontFamily: "monospace", fontSize: 7, letterSpacing: "0.38em", color: "rgba(249,115,22,0.55)", textTransform: "uppercase" }}>
                {lang === "fr" ? "DIFFUSION PRÉVUE — 28.05.2026" : "BROADCAST SCHEDULED — MAY 28, 2026"}
              </span>
            </div>

            {/* digit row */}
            <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
              {[
                { v: countdown.days,    label: lang === "fr" ? "JOURS" : "DAYS"    },
                { v: countdown.hours,   label: lang === "fr" ? "HEURES" : "HOURS"  },
                { v: countdown.minutes, label: lang === "fr" ? "MIN" : "MIN"       },
                { v: countdown.seconds, label: lang === "fr" ? "SEC" : "SEC"       },
              ].map(({ v, label }, i) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: i < 3 ? 8 : 0 }}>
                  <div style={{ textAlign: "center" }}>
                    <motion.div
                      key={v}
                      initial={{ y: -6, opacity: 0.4 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.2 }}
                      style={{
                        fontFamily: "'Orbitron',sans-serif",
                        fontSize: "clamp(22px,3.2vw,36px)",
                        fontWeight: 900, lineHeight: 1,
                        color: "#fff",
                        textShadow: "0 0 24px rgba(249,115,22,0.7), 0 0 8px rgba(249,115,22,0.4)",
                        letterSpacing: "0.04em",
                        minWidth: "2ch", display: "block", textAlign: "center",
                      }}
                    >
                      {String(v).padStart(2, "0")}
                    </motion.div>
                    <div style={{ fontFamily: "monospace", fontSize: 6.5, letterSpacing: "0.28em", color: "rgba(249,115,22,0.42)", textTransform: "uppercase", marginTop: 5 }}>
                      {label}
                    </div>
                  </div>
                  {i < 3 && (
                    <motion.span
                      animate={{ opacity: [1, 0.1, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      style={{ fontFamily: "'Orbitron',sans-serif", fontSize: "clamp(18px,2.6vw,28px)", fontWeight: 900, color: "rgba(249,115,22,0.45)", lineHeight: 1, marginBottom: 16, flexShrink: 0 }}
                    >:</motion.span>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Featured CTAs */}
        {featured && !ep.locked && (
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {/* TEASER button — active */}
            <motion.button
              onClick={onTeaser}
              whileHover={{ scale: 1.05, boxShadow: "0 0 32px rgba(249,115,22,0.55)" }}
              whileTap={{ scale: 0.95 }}
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "9px 20px",
                background: "rgba(249,115,22,0.14)",
                border: "1px solid rgba(249,115,22,0.65)",
                borderRadius: 4, cursor: "pointer",
                clipPath: "polygon(10px 0%,100% 0%,calc(100% - 10px) 100%,0% 100%)",
                color: "inherit",
              }}
            >
              <svg viewBox="0 0 12 12" fill="#f97316" style={{ width: 10, height: 10 }}><path d="M2 1.5l8 4.5-8 4.5z"/></svg>
              <span style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 8.5, fontWeight: 700, letterSpacing: "0.3em", color: "#f97316", textTransform: "uppercase" }}>
                TEASER
              </span>
            </motion.button>

            {/* WATCH NOW — disabled, not yet online */}
            <div
              title={lang === "fr" ? "Disponible à la sortie de l'épisode" : "Available when episode is released"}
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "9px 20px",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 4, cursor: "not-allowed",
                clipPath: "polygon(10px 0%,100% 0%,calc(100% - 10px) 100%,0% 100%)",
                opacity: 0.35,
              }}
            >
              <svg viewBox="0 0 12 12" fill="rgba(255,255,255,0.4)" style={{ width: 10, height: 10 }}><path d="M2 1.5l8 4.5-8 4.5z"/></svg>
              <span style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 8.5, fontWeight: 700, letterSpacing: "0.3em", color: "rgba(255,255,255,0.4)", textTransform: "uppercase" }}>
                {lang === "fr" ? "REGARDER" : "WATCH NOW"}
              </span>
            </div>
          </div>
        )}

        {/* Locked footer */}
        {ep.locked && (
          <div style={{ fontFamily: "monospace", fontSize: 7, letterSpacing: "0.32em", color: "rgba(180,40,40,0.4)", textTransform: "uppercase" }}>
            ▪ {lang === "fr" ? "DATE INCONNUE" : "DATE UNKNOWN"} ▪
          </div>
        )}
      </div>

      {/* Bottom edge glow */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: 1.5, zIndex: 5,
        background: `linear-gradient(90deg,transparent,rgba(249,115,22,${ep.locked ? 0.08 : 0.65}),transparent)`,
      }} />

      {/* Locked noise overlay */}
      {ep.locked && (
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none", zIndex: 3, opacity: 0.35, mixBlendMode: "overlay",
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E\")",
          backgroundSize: "200px 200px",
        }} />
      )}

      {/* Scan sweep on hover (active only) */}
      {!ep.locked && hovered && (
        <motion.div
          key="ep-sweep"
          initial={{ top: "-3px", opacity: 0 }}
          animate={{ top: "103%", opacity: [0, 0.6, 0.6, 0] }}
          transition={{ duration: 0.55, ease: "easeIn" }}
          style={{ position: "absolute", left: 0, right: 0, height: 2, background: "linear-gradient(90deg,transparent,rgba(249,115,22,0.7),transparent)", pointerEvents: "none", zIndex: 10 }}
        />
      )}

      {/* Hover 3D depth edge — visible on hover */}
      <motion.div
        animate={{ opacity: hovered && !ep.locked ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        style={{
          position: "absolute", inset: 0, borderRadius: "inherit",
          boxShadow: "inset 0 0 0 1px rgba(249,115,22,0.25), inset 0 -4px 12px rgba(249,115,22,0.08)",
          pointerEvents: "none", zIndex: 6,
        }}
      />
    </motion.div>
    </motion.div>
  );
}

// ─── Episodes Panel ───────────────────────────────────────────────────────────
function EpisodesPanel({ t, lang, onClose, onTeaser }: { t: typeof T["en"]; lang: Lang; onClose: () => void; onTeaser: () => void }) {
  const unlocked = t.episodes.filter(ep => !ep.locked).length;

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible" style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* ── Header ── */}
      <motion.div variants={staggerItem}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 8 }}>
          <div style={{ width: 3, height: 20, background: "linear-gradient(to bottom,#f97316,transparent)" }} />
          <h2 style={{ fontFamily: "'Orbitron',sans-serif", fontSize: "clamp(14px,1.8vw,22px)", fontWeight: 900, letterSpacing: "0.28em", textTransform: "uppercase", color: "#fb923c" }}>{t.epTitle}</h2>
        </div>
        <div style={{ height: 1, background: "linear-gradient(90deg,rgba(249,115,22,0.35),transparent)", marginLeft: 17 }} />
      </motion.div>

      {/* ── Season stats bar ── */}
      <motion.div variants={staggerItem} style={{
        display: "flex", alignItems: "center", gap: 0,
        background: "rgba(0,0,0,0.55)", border: "1px solid rgba(249,115,22,0.14)",
        borderRadius: 8, overflow: "hidden", backdropFilter: "blur(10px)",
      }}>
        {[
          { label: lang === "fr" ? "SAISON" : "SEASON",   value: "01" },
          { label: lang === "fr" ? "ÉPISODES" : "EPISODES", value: `${t.episodes.length}` },
          { label: lang === "fr" ? "DISPONIBLES" : "AVAILABLE", value: `${unlocked} / ${t.episodes.length}` },
          { label: "STATUS", value: lang === "fr" ? "EN PROD." : "IN PROD.", pulse: true },
        ].map((item, i) => (
          <div key={i} style={{
            flex: 1, padding: "10px 14px", textAlign: "center",
            borderRight: i < 3 ? "1px solid rgba(249,115,22,0.1)" : "none",
          }}>
            <div style={{ fontFamily: "monospace", fontSize: 7, letterSpacing: "0.35em", color: "rgba(249,115,22,0.38)", textTransform: "uppercase", marginBottom: 4 }}>
              {item.label}
            </div>
            <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: "clamp(10px,1.3vw,13px)", fontWeight: 700, letterSpacing: "0.1em", color: "#f0e8d8" }}>
              {item.pulse ? <span className="hud-blink" style={{ color: "#22c55e" }}>{item.value}</span> : item.value}
            </div>
          </div>
        ))}
      </motion.div>

      {/* ── Transmission progress bar ── */}
      <motion.div variants={staggerItem}>
        <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "monospace", fontSize: 7.5, letterSpacing: "0.3em", color: "rgba(249,115,22,0.38)", textTransform: "uppercase", marginBottom: 7 }}>
          <span>{lang === "fr" ? "SIGNAL TRANSMIS" : "SIGNAL TRANSMITTED"}</span>
          <span>{unlocked}/{t.episodes.length}</span>
        </div>
        <div style={{ height: 3, background: "rgba(249,115,22,0.1)", borderRadius: 99, overflow: "hidden" }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(unlocked / t.episodes.length) * 100}%` }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
            style={{ height: "100%", background: "linear-gradient(90deg,#f97316,#fbbf24)", borderRadius: 99 }}
          />
        </div>
      </motion.div>

      {/* ── Featured episode (EP01) ── */}
      <EpCard3D ep={t.episodes[0]} lang={lang} featured index={0} onTeaser={onTeaser} />

      {/* ── Episode grid (EP02-06) ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(clamp(200px,22%,260px),1fr))", gap: 14 }}>
        {t.episodes.slice(1).map((ep, i) => (
          <EpCard3D key={ep.num} ep={ep} lang={lang} index={i + 1} />
        ))}
      </div>

    </motion.div>
  );
}

// ─── Soundtrack: Waveform Bars ────────────────────────────────────────────────
function WaveformBars({ isPlaying }: { isPlaying: boolean }) {
  const count = 20;
  return (
    <div style={{ flex: 1, display: "flex", alignItems: "flex-end", gap: 2.5, height: 38 }}>
      {Array.from({ length: count }, (_, i) => {
        const base = 0.15 + Math.abs(Math.sin((i / count) * Math.PI)) * 0.7;
        return (
          <motion.div key={i}
            style={{ flex: 1, background: `linear-gradient(to top, #f97316, rgba(251,191,36,0.65))`, borderRadius: "2px 2px 0 0", originY: 1, height: 38 }}
            animate={isPlaying
              ? { scaleY: [base, base + 0.3 * Math.sin(i), base - 0.15, base + 0.2, base] }
              : { scaleY: 0.1 }
            }
            transition={isPlaying
              ? { duration: 0.45 + (i % 4) * 0.12, delay: i * 0.025, repeat: Infinity, ease: "easeInOut" }
              : { duration: 0.4 }
            }
          />
        );
      })}
    </div>
  );
}

// ─── Soundtrack: Control Button ───────────────────────────────────────────────
function CtrlBtn({ onClick, children, large }: { onClick: () => void; children: React.ReactNode; large?: boolean }) {
  return (
    <motion.button onClick={onClick}
      whileHover={{ scale: 1.12, borderColor: "rgba(249,115,22,0.65)" }}
      whileTap={{ scale: 0.9 }}
      style={{ width: large ? 52 : 36, height: large ? 52 : 36, borderRadius: "50%", border: `1.5px solid ${large ? "#f97316" : "rgba(249,115,22,0.3)"}`, background: large ? "transparent" : "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: large ? "#f97316" : "rgba(255,150,80,0.6)", fontSize: large ? 20 : 14, flexShrink: 0, transition: "border-color 0.2s, color 0.2s" }}
    >
      {children}
    </motion.button>
  );
}

// ─── Soundtrack: Lance Silhouette SVG ─────────────────────────────────────────
function LanceSVG() {
  const c = "rgba(249,115,22,";
  return (
    <svg viewBox="0 0 140 260" style={{ width: "100%", height: "100%", maxWidth: 180 }} aria-label="Lance">
      {/* Glow */}
      <ellipse cx="70" cy="200" rx="55" ry="18" fill={c+"0.08)"} style={{ filter: "blur(8px)" }} />
      {/* Head + helmet */}
      <ellipse cx="70" cy="24" rx="17" ry="18" fill={c+"0.14)"} stroke={c+"0.5)"} strokeWidth="1.4"/>
      <path d="M53 20 Q70 8 87 20" fill={c+"0.22)"} stroke={c+"0.65)"} strokeWidth="1.3"/>
      <line x1="68" y1="28" x2="68" y2="34" stroke={c+"0.4)"} strokeWidth="1.2" strokeDasharray="1 1"/>
      {/* Visor glow */}
      <line x1="56" y1="22" x2="84" y2="22" stroke={c+"0.55)"} strokeWidth="1.5" opacity="0.8"/>
      {/* Neck */}
      <line x1="70" y1="42" x2="70" y2="54" stroke={c+"0.45)"} strokeWidth="2"/>
      {/* Body */}
      <path d="M30 58 Q70 44 110 58 L116 136 Q70 148 24 136Z" fill={c+"0.1)"} stroke={c+"0.38)"} strokeWidth="1.4"/>
      {/* Cape left */}
      <path d="M30 58 Q10 108 14 188 Q22 200 34 192 Q32 120 44 88" fill={c+"0.07)"} stroke={c+"0.28)"} strokeWidth="1.2"/>
      {/* Cape right */}
      <path d="M110 58 Q130 108 126 188 Q118 200 106 192 Q108 120 96 88" fill={c+"0.07)"} stroke={c+"0.28)"} strokeWidth="1.2"/>
      {/* Left arm */}
      <line x1="30" y1="72" x2="10" y2="106" stroke={c+"0.42)"} strokeWidth="2"/>
      <line x1="10" y1="106" x2="6" y2="128" stroke={c+"0.32)"} strokeWidth="1.5"/>
      {/* Right arm + rifle */}
      <line x1="110" y1="72" x2="130" y2="100" stroke={c+"0.42)"} strokeWidth="2"/>
      <line x1="130" y1="100" x2="134" y2="122" stroke={c+"0.32)"} strokeWidth="1.5"/>
      {/* Rifle */}
      <rect x="108" y="90" width="38" height="6" rx="2.5" fill={c+"0.2)"} stroke={c+"0.5)"} strokeWidth="1.1"/>
      <rect x="144" y="88" width="10" height="3" rx="1" fill={c+"0.45)"}/>
      <rect x="116" y="86" width="8" height="4" rx="1" fill={c+"0.18)"} stroke={c+"0.35)"} strokeWidth="0.8"/>
      {/* Chest tech plate */}
      <rect x="54" y="72" width="32" height="20" rx="3" fill={c+"0.18)"} stroke={c+"0.45)"} strokeWidth="1.1"/>
      <rect x="58" y="76" width="24" height="3" rx="1" fill={c+"0.3)"}/>
      <circle cx="70" cy="83" r="3.5" fill={c+"0.22)"} stroke={c+"0.7)"} strokeWidth="1"/>
      <circle cx="70" cy="83" r="1.5" fill="#f97316" opacity="0.9"/>
      {/* Belt */}
      <rect x="42" y="132" width="56" height="7" rx="2" fill={c+"0.12)"} stroke={c+"0.3)"} strokeWidth="1"/>
      {/* Legs */}
      <line x1="52" y1="140" x2="48" y2="248" stroke={c+"0.4)"} strokeWidth="2.5"/>
      <line x1="88" y1="140" x2="92" y2="248" stroke={c+"0.4)"} strokeWidth="2.5"/>
      {/* Boots */}
      <rect x="36" y="242" width="20" height="10" rx="3" fill={c+"0.18)"} stroke={c+"0.45)"} strokeWidth="1.1"/>
      <rect x="80" y="242" width="20" height="10" rx="3" fill={c+"0.18)"} stroke={c+"0.45)"} strokeWidth="1.1"/>
      {/* Shoulder pads */}
      <ellipse cx="28" cy="64" rx="10" ry="7" fill={c+"0.16)"} stroke={c+"0.45)"} strokeWidth="1.1" transform="rotate(-20 28 64)"/>
      <ellipse cx="112" cy="64" rx="10" ry="7" fill={c+"0.16)"} stroke={c+"0.45)"} strokeWidth="1.1" transform="rotate(20 112 64)"/>
    </svg>
  );
}

// ─── Soundtrack Panel ─────────────────────────────────────────────────────────
// ─── Soundtrack: Cassette SVG ────────────────────────────────────────────────
function CassetteSVG({ playing }: { playing: boolean }) {
  const reelSpokes = [0, 72, 144, 216, 288];
  return (
    <div style={{ position: "relative", width: "100%", aspectRatio: "240/152" }}>

      {/* Static cassette body */}
      <svg viewBox="0 0 240 152" fill="none" style={{ width: "100%", height: "100%", display: "block" }}>
        {/* Outer body */}
        <rect x="2" y="2" width="236" height="148" rx="10" fill="#0c0805" stroke="rgba(249,115,22,0.65)" strokeWidth="1.5"/>
        {/* Inner body relief */}
        <rect x="8" y="8" width="224" height="136" rx="7" fill="none" stroke="rgba(249,115,22,0.08)" strokeWidth="0.6"/>

        {/* Write-protect notches (top) */}
        <rect x="22" y="1" width="14" height="8" rx="2" fill="#100a04" stroke="rgba(249,115,22,0.28)" strokeWidth="0.8"/>
        <rect x="204" y="1" width="14" height="8" rx="2" fill="#100a04" stroke="rgba(249,115,22,0.28)" strokeWidth="0.8"/>

        {/* Corner screws */}
        {([[14,14],[226,14],[14,138],[226,138]] as [number,number][]).map(([cx,cy],i) => (
          <g key={i}>
            <circle cx={cx} cy={cy} r="5.5" fill="#0e0805" stroke="rgba(249,115,22,0.4)" strokeWidth="1"/>
            <line x1={cx-3} y1={cy-3} x2={cx+3} y2={cy+3} stroke="rgba(249,115,22,0.3)" strokeWidth="0.9"/>
            <line x1={cx+3} y1={cy-3} x2={cx-3} y2={cy+3} stroke="rgba(249,115,22,0.3)" strokeWidth="0.9"/>
          </g>
        ))}

        {/* Label area */}
        <rect x="30" y="11" width="180" height="60" rx="4" fill="rgba(28,13,3,0.95)" stroke="rgba(249,115,22,0.3)" strokeWidth="0.8"/>
        <rect x="32" y="13" width="176" height="56" rx="3" fill="url(#labelGrad)"/>
        <defs>
          <linearGradient id="labelGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="rgba(40,18,4,0.9)"/>
            <stop offset="50%" stopColor="rgba(22,10,2,0.95)"/>
            <stop offset="100%" stopColor="rgba(35,15,3,0.9)"/>
          </linearGradient>
        </defs>
        {/* Label decorative stripes */}
        <line x1="32" y1="32" x2="208" y2="32" stroke="rgba(249,115,22,0.18)" strokeWidth="0.7"/>
        <line x1="32" y1="56" x2="208" y2="56" stroke="rgba(249,115,22,0.12)" strokeWidth="0.5"/>
        {/* Label top line */}
        <line x1="32" y1="20" x2="208" y2="20" stroke="rgba(249,115,22,0.35)" strokeWidth="1"/>
        {/* Label text */}
        <text x="120" y="28" textAnchor="middle" fill="rgba(249,115,22,0.72)" fontFamily="monospace" fontSize="7" letterSpacing="5">ARC RAIDERS</text>
        <text x="120" y="47" textAnchor="middle" fill="#f0e4cc" fontFamily="sans-serif" fontWeight="bold" fontSize="13" letterSpacing="2">MANKIND RISES</text>
        <text x="50" y="63" textAnchor="start" fill="rgba(255,150,80,0.4)" fontFamily="monospace" fontSize="6" letterSpacing="2">ORIGINAL SCORE</text>
        <text x="34" y="28" textAnchor="start" fill="rgba(249,115,22,0.35)" fontFamily="monospace" fontSize="5.5">C-60</text>
        <text x="206" y="63" textAnchor="end" fill="rgba(249,115,22,0.58)" fontFamily="monospace" fontSize="7" letterSpacing="1">SIDE A ▶</text>

        {/* Tape window frame */}
        <rect x="21" y="77" width="198" height="67" rx="6" fill="#060402" stroke="rgba(249,115,22,0.22)" strokeWidth="0.8"/>
        {/* Window inner shadow */}
        <rect x="23" y="79" width="194" height="63" rx="5" fill="none" stroke="rgba(0,0,0,0.8)" strokeWidth="1.5"/>

        {/* Reel hole backgrounds (static) */}
        <circle cx="68" cy="110" r="26.5" fill="#060402" stroke="rgba(249,115,22,0.18)" strokeWidth="0.8"/>
        <circle cx="172" cy="110" r="26.5" fill="#060402" stroke="rgba(249,115,22,0.18)" strokeWidth="0.8"/>

        {/* Tape path across bottom of window */}
        <path d="M46 135 C52 139 60 140 68 140 L172 140 C180 140 188 139 194 135" stroke="#1e0e04" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        {/* Tape guide edges */}
        <path d="M46 135 C52 137 60 138 68 138 L172 138 C180 138 188 137 194 135" stroke="rgba(80,40,10,0.6)" strokeWidth="0.8" fill="none"/>

        {/* Guide rollers */}
        <circle cx="46" cy="133" r="4" fill="#0e0805" stroke="rgba(249,115,22,0.45)" strokeWidth="1"/>
        <circle cx="60" cy="137" r="3" fill="#0e0805" stroke="rgba(249,115,22,0.35)" strokeWidth="0.8"/>
        <circle cx="180" cy="137" r="3" fill="#0e0805" stroke="rgba(249,115,22,0.35)" strokeWidth="0.8"/>
        <circle cx="194" cy="133" r="4" fill="#0e0805" stroke="rgba(249,115,22,0.45)" strokeWidth="1"/>
        {/* Roller pin dots */}
        <circle cx="46" cy="133" r="1.2" fill="rgba(249,115,22,0.6)"/>
        <circle cx="194" cy="133" r="1.2" fill="rgba(249,115,22,0.6)"/>

        {/* Capstan opening */}
        <rect x="108" y="138" width="24" height="8" rx="2" fill="#0e0805" stroke="rgba(249,115,22,0.2)" strokeWidth="0.7"/>
        <rect x="119" y="136" width="2" height="12" rx="0.5" fill="rgba(249,115,22,0.25)"/>

        {/* Bottom alignment notches */}
        <rect x="98" y="146" width="10" height="4" rx="1.5" fill="#100a04" stroke="rgba(249,115,22,0.2)" strokeWidth="0.7"/>
        <rect x="132" y="146" width="10" height="4" rx="1.5" fill="#100a04" stroke="rgba(249,115,22,0.2)" strokeWidth="0.7"/>

        {/* Side text */}
        <text x="14" y="100" fill="rgba(249,115,22,0.18)" fontFamily="monospace" fontSize="5" transform="rotate(-90 14 100)" textAnchor="middle">TYPE II</text>
        <text x="226" y="100" fill="rgba(249,115,22,0.18)" fontFamily="monospace" fontSize="5" transform="rotate(90 226 100)" textAnchor="middle">TYPE II</text>

        {/* Specular highlight */}
        <rect x="10" y="4" width="80" height="2" rx="1" fill="rgba(255,200,120,0.06)"/>
      </svg>

      {/* ── Left reel overlay (animated) ── */}
      <div style={{ position: "absolute", left: "17.08%", top: "54.6%", width: "22.08%", aspectRatio: "1/1" }}>
        <motion.div
          animate={playing ? { rotate: 360 } : {}}
          transition={{ duration: 2.6, repeat: Infinity, ease: "linear" }}
          style={{ width: "100%", height: "100%" }}
        >
          <svg viewBox="0 0 53 53" fill="none" style={{ width: "100%", height: "100%" }}>
            <circle cx="26.5" cy="26.5" r="25" fill="#070402" stroke="rgba(249,115,22,0.22)" strokeWidth="1"/>
            {reelSpokes.map((angle) => {
              const rad = (angle - 90) * Math.PI / 180;
              return (
                <line key={angle}
                  x1={26.5 + Math.cos(rad) * 8} y1={26.5 + Math.sin(rad) * 8}
                  x2={26.5 + Math.cos(rad) * 22} y2={26.5 + Math.sin(rad) * 22}
                  stroke="rgba(249,115,22,0.55)" strokeWidth="1.4" strokeLinecap="round"
                />
              );
            })}
            <circle cx="26.5" cy="26.5" r="9" fill="#0a0603" stroke="rgba(249,115,22,0.45)" strokeWidth="1"/>
            <circle cx="26.5" cy="26.5" r="4" fill="rgba(249,115,22,0.65)"/>
            <circle cx="26.5" cy="26.5" r="1.8" fill="#f97316"/>
          </svg>
        </motion.div>
      </div>

      {/* ── Right reel overlay (counter-spin) ── */}
      <div style={{ position: "absolute", left: "60.83%", top: "54.6%", width: "22.08%", aspectRatio: "1/1" }}>
        <motion.div
          animate={playing ? { rotate: -360 } : {}}
          transition={{ duration: 2.6, repeat: Infinity, ease: "linear" }}
          style={{ width: "100%", height: "100%" }}
        >
          <svg viewBox="0 0 53 53" fill="none" style={{ width: "100%", height: "100%" }}>
            <circle cx="26.5" cy="26.5" r="25" fill="#070402" stroke="rgba(249,115,22,0.22)" strokeWidth="1"/>
            {reelSpokes.map((angle) => {
              const rad = (angle - 90) * Math.PI / 180;
              return (
                <line key={angle}
                  x1={26.5 + Math.cos(rad) * 8} y1={26.5 + Math.sin(rad) * 8}
                  x2={26.5 + Math.cos(rad) * 22} y2={26.5 + Math.sin(rad) * 22}
                  stroke="rgba(249,115,22,0.55)" strokeWidth="1.4" strokeLinecap="round"
                />
              );
            })}
            <circle cx="26.5" cy="26.5" r="9" fill="#0a0603" stroke="rgba(249,115,22,0.45)" strokeWidth="1"/>
            <circle cx="26.5" cy="26.5" r="4" fill="rgba(249,115,22,0.65)"/>
            <circle cx="26.5" cy="26.5" r="1.8" fill="#f97316"/>
          </svg>
        </motion.div>
      </div>

      {/* Playing glow overlay on reels */}
      {playing && (
        <motion.div
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute", left: "17.08%", top: "54.6%", width: "22.08%", aspectRatio: "1/1",
            borderRadius: "50%",
            background: "radial-gradient(circle,rgba(249,115,22,0.3) 0%,transparent 70%)",
            filter: "blur(4px)", pointerEvents: "none",
          }}
        />
      )}
    </div>
  );
}

// ─── Soundtrack: Spectrum Visualizer ─────────────────────────────────────────
function SpectrumViz({ isPlaying }: { isPlaying: boolean }) {
  const count = 52;
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 1.5, height: 48, width: "100%" }}>
      {Array.from({ length: count }, (_, i) => {
        const pos = i / count;
        const base = 0.07 + Math.abs(Math.sin(pos * Math.PI * 2.6)) * (pos > 0.15 && pos < 0.85 ? 0.78 : 0.38);
        const col = i % 9 === 0 ? "rgba(255,220,100,0.82)" : i % 4 === 0 ? "rgba(251,146,60,0.88)" : "rgba(249,115,22,0.74)";
        return (
          <motion.div key={i}
            style={{ flex: 1, borderRadius: "1.5px 1.5px 0 0", background: col, originY: 1, height: "100%" }}
            animate={isPlaying
              ? { scaleY: [base, base + Math.sin(i * 0.85) * 0.38 + 0.28, base - 0.04, base + 0.32, base] }
              : { scaleY: 0.06 }
            }
            transition={isPlaying
              ? { duration: 0.36 + (i % 5) * 0.11, delay: i * 0.011, repeat: Infinity, ease: "easeInOut", repeatType: "mirror" }
              : { duration: 0.55, ease: "easeOut" }
            }
          />
        );
      })}
    </div>
  );
}

const OST_TRACKS = [
  { id: 1, title: "THEME OPENING",  duration: "0:55", seconds: 55,  src: "/ost/01-theme-opening.mp3" },
  { id: 2, title: "THE COLLAPSE",   duration: "2:58", seconds: 178, src: "/ost/02-the-collapse.mp3"  },
  { id: 3, title: "MARA",           duration: "3:17", seconds: 197, src: "/ost/03-mara.mp3"          },
  { id: 4, title: "EXODUS",         duration: "4:02", seconds: 242, src: "/ost/04-exodus.mp3"        },
];

function SoundtrackPanel({ onClose, lang }: { onClose: () => void; lang: Lang }) {
  const [cur, setCur]           = useState(0);
  const [playing, setPlaying]   = useState(false);
  const [progress, setProgress] = useState(0);
  const [trackKey, setTrackKey] = useState(0);
  const [isMobileS, setIsMobileS] = useState(false);
  const audioRef  = useRef<HTMLAudioElement>(null);
  const vinylRef  = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const check = () => setIsMobileS(window.innerWidth < 640 || (window.innerWidth < 900 && window.innerHeight < 500));
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const track      = OST_TRACKS[cur];
  const elapsed    = Math.round((progress / 100) * track.seconds);
  const elapsedStr = `${Math.floor(elapsed / 60)}:${String(elapsed % 60).padStart(2, "0")}`;

  // 3D tilt springs for vinyl
  const rawTX = useMotionValue(0);
  const rawTY = useMotionValue(0);
  const rotTX = useSpring(rawTX, { stiffness: 190, damping: 26 });
  const rotTY = useSpring(rawTY, { stiffness: 190, damping: 26 });

  // Load new track when cur changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.src = OST_TRACKS[cur].src;
    audio.load();
    setProgress(0);
    if (playing) audio.play().catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cur]);

  // Play / pause
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) { audio.play().catch(() => setPlaying(false)); }
    else { audio.pause(); }
  }, [playing]);

  // Keyboard shortcuts
  useEffect(() => {
    const goNextK = () => { setCur((c) => (c + 1) % OST_TRACKS.length); setTrackKey((k) => k + 1); };
    const goPrevK = () => { setCur((c) => (c - 1 + OST_TRACKS.length) % OST_TRACKS.length); setTrackKey((k) => k + 1); };
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === "INPUT") return;
      if (e.code === "Space") { e.preventDefault(); setPlaying((p) => !p); }
      if (e.key === "ArrowLeft")  goPrevK();
      if (e.key === "ArrowRight") goNextK();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const goNext = () => { setCur((c) => (c + 1) % OST_TRACKS.length); setTrackKey((k) => k + 1); };
  const goPrev = () => { setCur((c) => (c - 1 + OST_TRACKS.length) % OST_TRACKS.length); setTrackKey((k) => k + 1); };

  const onVinylMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!vinylRef.current) return;
    const r = vinylRef.current.getBoundingClientRect();
    const cx = (e.clientX - r.left) / r.width - 0.5;
    const cy = (e.clientY - r.top) / r.height - 0.5;
    rawTY.set(cx * 22);
    rawTX.set(-cy * 15);
  };
  const onVinylLeave = () => { rawTX.set(0); rawTY.set(0); };

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible">

      {/* Real audio element */}
      <audio
        ref={audioRef}
        src={track.src}
        onTimeUpdate={() => {
          const a = audioRef.current;
          if (a && a.duration) setProgress((a.currentTime / a.duration) * 100);
        }}
        onEnded={() => {
          setCur((c) => (c + 1) % OST_TRACKS.length);
          setTrackKey((k) => k + 1);
        }}
      />

      {/* ── Header ── */}
      <motion.div variants={staggerItem} style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 8 }}>
          <div style={{ width: 3, height: 20, background: "linear-gradient(to bottom,#f97316,transparent)" }} />
          <h2 style={{ fontFamily: "'Orbitron',sans-serif", fontSize: "clamp(14px,1.8vw,22px)", fontWeight: 900, letterSpacing: "0.28em", textTransform: "uppercase", color: "#fb923c" }}>
            {lang === "fr" ? "BANDE ORIGINALE" : "SOUNDTRACK"}
          </h2>
        </div>
        <div style={{ height: 1, background: "linear-gradient(90deg,rgba(249,115,22,0.35),transparent)", marginLeft: 17 }} />
      </motion.div>

      {/* ── Main player (cassette left + info right, stacks on mobile) ── */}
      <div style={{ display: "grid", gridTemplateColumns: isMobileS ? "1fr" : "auto 1fr", gap: "clamp(16px,2.5vw,36px)", alignItems: "start", marginBottom: 20 }}>

        {/* ── CASSETTE ── */}
        <motion.div variants={staggerItem} style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>

          {/* Deck housing */}
          <div style={{
            background: "rgba(5,3,1,0.95)",
            border: "1px solid rgba(249,115,22,0.4)",
            borderRadius: 12,
            padding: "0 10px 10px",
            position: "relative",
            boxShadow: playing ? "0 0 28px rgba(249,115,22,0.22), inset 0 0 20px rgba(0,0,0,0.9)" : "inset 0 0 20px rgba(0,0,0,0.9)",
            transition: "box-shadow 0.5s",
          }}>
            {/* Deck top strip (slot opening label) */}
            <div style={{
              borderBottom: "1px solid rgba(249,115,22,0.25)",
              padding: "6px 8px 5px",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              marginBottom: 8,
            }}>
              <span style={{ fontFamily: "monospace", fontSize: 6.5, letterSpacing: "0.35em", color: "rgba(249,115,22,0.45)", textTransform: "uppercase" }}>LANCE-DECK 01</span>
              {/* LED indicator */}
              <motion.div
                animate={playing ? { opacity: [1, 0.2, 1], backgroundColor: ["#f97316","#ff6600","#f97316"] } : { opacity: 0.3, backgroundColor: "#3a1505" }}
                transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }}
                style={{ width: 7, height: 7, borderRadius: "50%", background: "#f97316", boxShadow: playing ? "0 0 8px rgba(249,115,22,0.9)" : "none" }}
              />
            </div>

            {/* Slot window — overflow:hidden causes the insert animation */}
            <div style={{ overflow: "hidden", borderRadius: 6, border: "1px solid rgba(249,115,22,0.15)", background: "rgba(2,1,0,0.98)" }}>
              {/* Insertion animation wrapper */}
              <motion.div
                initial={{ y: "-115%" }}
                animate={{ y: "0%" }}
                transition={{ duration: 0.88, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
              >
                {/* 3D tilt wrapper */}
                <motion.div
                  ref={vinylRef}
                  onMouseMove={onVinylMove}
                  onMouseLeave={onVinylLeave}
                  onClick={() => setPlaying((p) => !p)}
                  style={{
                    rotateX: rotTX, rotateY: rotTY,
                    transformStyle: "preserve-3d", perspective: "900px",
                    width: "clamp(200px,21vw,258px)",
                    cursor: "pointer", display: "block",
                  }}
                >
                  <CassetteSVG playing={playing} />
                </motion.div>
              </motion.div>
            </div>

            {/* Deck bottom controls row */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8, padding: "0 4px" }}>
              <div style={{ fontFamily: "monospace", fontSize: 6.5, letterSpacing: "0.28em", color: "rgba(249,115,22,0.32)", textTransform: "uppercase" }}>
                {playing ? <span className="hud-blink">◉ PLAYING</span> : "◎ STOPPED"}
              </div>
              {/* Capstan light */}
              <div style={{ display: "flex", gap: 4 }}>
                {[0,1,2].map(i => (
                  <motion.div key={i}
                    animate={playing ? { opacity: [0.2, 0.8, 0.2] } : { opacity: 0.12 }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.18, ease: "easeInOut" }}
                    style={{ width: 3, height: 8, borderRadius: 1, background: "#f97316" }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Ambient glow under deck */}
          <motion.div
            animate={playing ? { opacity: [0.25, 0.5, 0.25] } : { opacity: 0.08 }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            style={{
              position: "absolute", bottom: -12, left: "10%", right: "10%", height: 20,
              background: "rgba(249,115,22,0.6)", filter: "blur(14px)",
              borderRadius: "50%", pointerEvents: "none",
            }}
          />
        </motion.div>

        {/* ── TRACK INFO + CONTROLS ── */}
        <motion.div variants={staggerItem} style={{
          background: "rgba(0,0,0,0.6)", border: "1px solid rgba(249,115,22,0.18)",
          borderRadius: 10, padding: "clamp(14px,2vw,24px)",
          backdropFilter: "blur(16px)",
          display: "flex", flexDirection: "column", gap: 14,
          position: "relative", overflow: "hidden",
        }}>
          {/* HUD corner brackets */}
          <div style={{ position: "absolute", top: 0, left: 0, width: 14, height: 14, borderTop: "1px solid rgba(249,115,22,0.5)", borderLeft: "1px solid rgba(249,115,22,0.5)" }} />
          <div style={{ position: "absolute", top: 0, right: 0, width: 14, height: 14, borderTop: "1px solid rgba(249,115,22,0.5)", borderRight: "1px solid rgba(249,115,22,0.5)" }} />
          <div style={{ position: "absolute", bottom: 0, left: 0, width: 14, height: 14, borderBottom: "1px solid rgba(249,115,22,0.5)", borderLeft: "1px solid rgba(249,115,22,0.5)" }} />
          <div style={{ position: "absolute", bottom: 0, right: 0, width: 14, height: 14, borderBottom: "1px solid rgba(249,115,22,0.5)", borderRight: "1px solid rgba(249,115,22,0.5)" }} />
          {/* Scan sweep */}
          <motion.div
            style={{ position: "absolute", left: 0, right: 0, height: 1.5, background: "linear-gradient(90deg,transparent,rgba(249,115,22,0.28),transparent)", pointerEvents: "none", zIndex: 2 }}
            animate={{ top: ["-2px","101%"] }}
            transition={{ duration: 3.8, repeat: Infinity, ease: "linear", repeatDelay: 2 }}
          />

          {/* Status */}
          <div style={{ fontFamily: "monospace", fontSize: 8.5, letterSpacing: "0.36em", color: "rgba(249,115,22,0.55)", textTransform: "uppercase" }}>
            {playing ? <span className="hud-blink">◉ NOW PLAYING</span> : <span>◎ PAUSED</span>}
            &nbsp;—&nbsp;{String(cur + 1).padStart(2, "0")}&nbsp;/&nbsp;{OST_TRACKS.length}
          </div>

          {/* Track title — AnimatePresence on change */}
          <div style={{ overflow: "hidden", minHeight: "clamp(28px,3.8vw,48px)" }}>
            <AnimatePresence mode="wait">
              <motion.div key={trackKey}
                initial={{ opacity: 0, y: 16, filter: "blur(7px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -12, filter: "blur(5px)" }}
                transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
              >
                <div style={{
                  fontFamily: "'Orbitron',sans-serif",
                  fontSize: "clamp(13px,2vw,22px)", fontWeight: 900,
                  letterSpacing: "0.07em", color: "#f0e8d8",
                  textTransform: "uppercase", lineHeight: 1.15,
                  textShadow: playing ? "0 0 26px rgba(249,115,22,0.32)" : "none",
                  transition: "text-shadow 0.4s",
                }}>
                  {track.title}
                </div>
                <div style={{ fontFamily: "monospace", fontSize: 8, letterSpacing: "0.18em", color: "rgba(255,150,80,0.32)", marginTop: 5 }}>
                  MANKIND RISES — ORIGINAL SCORE
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Spectrum visualizer */}
          <SpectrumViz isPlaying={playing} />

          {/* Progress bar */}
          <div>
            <div
              style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 99, overflow: "hidden", cursor: "pointer", marginBottom: 6 }}
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const pct = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
                setProgress(pct);
                if (audioRef.current && audioRef.current.duration) {
                  audioRef.current.currentTime = (pct / 100) * audioRef.current.duration;
                }
              }}
            >
              <motion.div
                style={{
                  height: "100%", borderRadius: 99, originX: 0,
                  background: "linear-gradient(90deg,#f97316,#fbbf24,#f97316)",
                  backgroundSize: "200% 100%",
                }}
                animate={{
                  width: `${progress}%`,
                  backgroundPosition: playing ? ["0% 0%","100% 0%"] : "0% 0%",
                }}
                transition={{ width: { duration: 0.1 }, backgroundPosition: { duration: 2, repeat: Infinity, ease: "linear" } }}
              />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "monospace", fontSize: 8, color: "rgba(255,150,80,0.38)", letterSpacing: "0.06em" }}>
              <span>{elapsedStr}</span><span>{track.duration}</span>
            </div>
          </div>

          {/* Controls */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14 }}>
            <CtrlBtn onClick={goPrev}>⏮</CtrlBtn>
            <motion.button
              onClick={() => setPlaying((p) => !p)}
              whileHover={{ scale: 1.08, boxShadow: "0 0 42px rgba(249,115,22,0.72)" }}
              whileTap={{ scale: 0.92 }}
              style={{
                width: 60, height: 60, borderRadius: "50%",
                border: "1.5px solid #f97316",
                background: playing ? "#f97316" : "transparent",
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                color: playing ? "#000" : "#f97316", fontSize: 22,
                boxShadow: playing ? "0 0 32px rgba(249,115,22,0.62)" : "none",
                transition: "background 0.25s, box-shadow 0.25s, color 0.25s",
              }}
            >{playing ? "⏸" : "▶"}</motion.button>
            <CtrlBtn onClick={goNext}>⏭</CtrlBtn>
          </div>

          {/* Keyboard hints */}
          <div style={{ textAlign: "center", fontFamily: "monospace", fontSize: 7.5, letterSpacing: "0.28em", color: "rgba(249,115,22,0.2)", textTransform: "uppercase" }}>
            SPACE&nbsp;&nbsp;·&nbsp;&nbsp;← &nbsp;→
          </div>
        </motion.div>
      </div>

      {/* ── PLAYLIST ── */}
      <motion.div variants={staggerItem} style={{
        background: "rgba(0,0,0,0.52)", border: "1px solid rgba(249,115,22,0.12)",
        borderRadius: 10, overflow: "hidden", backdropFilter: "blur(12px)",
      }}>
        {/* Playlist header */}
        <div style={{
          padding: "10px 18px 8px", borderBottom: "1px solid rgba(249,115,22,0.08)",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          fontFamily: "monospace", fontSize: 7.5, letterSpacing: "0.38em",
          color: "rgba(255,150,80,0.32)", textTransform: "uppercase",
        }}>
          <span>PLAYLIST</span>
          <span>{OST_TRACKS.length} TRACKS</span>
        </div>

        {OST_TRACKS.map((tr, i) => {
          const isActive  = cur === i;
          const isPlaying_ = isActive && playing;
          return (
            <motion.button
              key={tr.id}
              className="ep-card"
              onClick={() => { setCur(i); setTrackKey((k) => k + 1); setPlaying(true); }}
              whileHover={{ background: "rgba(249,115,22,0.065)" }}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: 16,
                padding: "14px 18px",
                borderBottom: i < OST_TRACKS.length - 1 ? "1px solid rgba(255,255,255,0.028)" : "none",
                cursor: "pointer", background: isActive ? "rgba(249,115,22,0.062)" : "transparent",
                border: "none", borderLeft: `3px solid ${isActive ? "#f97316" : "transparent"}`,
                transition: "background 0.18s, border-color 0.18s", textAlign: "left",
              }}
            >
              {/* Playing animation / track number */}
              <div style={{ width: 22, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {isPlaying_ ? (
                  <div style={{ display: "flex", alignItems: "flex-end", gap: 1.5, height: 14 }}>
                    {[0, 1, 2].map((b) => (
                      <motion.div key={b}
                        animate={{ scaleY: [0.3, 1, 0.3] }}
                        transition={{ duration: 0.48, repeat: Infinity, delay: b * 0.15, ease: "easeInOut" }}
                        style={{ width: 3, height: 14, background: "#f97316", borderRadius: 1, originY: 1 }}
                      />
                    ))}
                  </div>
                ) : (
                  <span style={{ fontFamily: "monospace", fontSize: 9, color: isActive ? "#f97316" : "rgba(255,150,80,0.28)", letterSpacing: "0.04em" }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                )}
              </div>

              {/* Title */}
              <span style={{
                flex: 1, fontFamily: "'Orbitron',sans-serif",
                fontSize: "clamp(8px,0.95vw,10px)", fontWeight: 700,
                letterSpacing: "0.14em", textTransform: "uppercase",
                color: isActive ? "#f0e8d8" : "rgba(155,144,130,0.52)",
                transition: "color 0.2s",
              }}>
                {tr.title}
              </span>

              {/* Duration */}
              <span style={{ fontFamily: "monospace", fontSize: 8, color: "rgba(255,150,80,0.3)", letterSpacing: "0.08em", flexShrink: 0 }}>
                {tr.duration}
              </span>
            </motion.button>
          );
        })}
      </motion.div>

    </motion.div>
  );
}

// ─── Resistance Panel ─────────────────────────────────────────────────────────
function ResistancePanel({ t, onClose, hypeCount, votes, onVote }: {
  t: typeof T["en"]; onClose: () => void;
  hypeCount: number | null;
  votes: { lat: number; lng: number }[];
  onVote: () => void;
}) {
  return (
    <motion.div variants={stagger} initial="hidden" animate="visible">
      <motion.div variants={staggerItem} style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 8 }}>
          <div style={{ width: 3, height: 20, background: "linear-gradient(to bottom,#f97316,transparent)" }} />
          <h2 style={{ fontFamily: "'Orbitron',sans-serif", fontSize: "clamp(14px,1.8vw,22px)", fontWeight: 900, letterSpacing: "0.28em", textTransform: "uppercase", color: "#fb923c" }}>{t.hypeTitle}</h2>
        </div>
        <div style={{ height: 1, background: "linear-gradient(90deg,rgba(249,115,22,0.35),transparent)", marginLeft: 17 }} />
      </motion.div>

      {/* Two-column layout, collapses on mobile */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap: "clamp(20px,3vw,52px)" }}>

        {/* LEFT: hype counter + terminal */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <motion.div variants={staggerItem} style={{ textAlign: "center", background: "rgba(0,0,0,0.52)", border: "1px solid rgba(249,115,22,0.16)", borderRadius: 8, padding: "32px 24px", backdropFilter: "blur(12px)" }}>
            <motion.div key={hypeCount}
              initial={{ scale: 1.18, opacity: 0.5, filter: "blur(5px)" }}
              animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
              transition={{ duration: 0.5 }}
              style={{ fontFamily: "'Orbitron',sans-serif", fontSize: "clamp(52px,8vw,88px)", fontWeight: 900, color: "#fff", textShadow: "0 0 36px rgba(255,150,80,0.65),0 0 72px rgba(255,100,40,0.28)", lineHeight: 1, marginBottom: 10 }}
            >
              {hypeCount === null ? "—" : hypeCount.toLocaleString("en-US")}
            </motion.div>
            <div style={{ fontFamily: "monospace", fontSize: 8, letterSpacing: "0.32em", color: "rgba(255,150,80,0.4)", textTransform: "uppercase", marginBottom: 24 }}>RAIDERS WAITING</div>
            <HypeButton label={t.hypeBtn} doneLabel={t.hypeDone} onVote={onVote} />
          </motion.div>

          <motion.div variants={staggerItem} style={{ background: "rgba(0,0,0,0.62)", border: "1px solid rgba(249,115,22,0.16)", borderRadius: 8, padding: "18px 20px 22px", backdropFilter: "blur(10px)" }}>
            <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
              {["#ff5f57","#febc2e","#28c840"].map((c, i) => <div key={i} style={{ width: 9, height: 9, borderRadius: "50%", background: c, opacity: 0.7 }} />)}
              <span style={{ marginLeft: 6, fontFamily: "monospace", fontSize: 9, color: "rgba(249,115,22,0.35)", letterSpacing: "0.1em" }}>arc_network_broadcast_v2.1</span>
            </div>
            <Terminal lines={t.terminal} />
          </motion.div>
        </div>

        {/* RIGHT: social follow */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <motion.div variants={staggerItem} style={{ background: "rgba(0,0,0,0.52)", border: "1px solid rgba(249,115,22,0.14)", borderRadius: 8, padding: "28px 24px", backdropFilter: "blur(12px)" }}>
            <p style={{ fontFamily: "monospace", fontSize: 9, letterSpacing: "0.3em", color: "rgba(255,150,80,0.38)", textTransform: "uppercase", marginBottom: 16 }}>FOLLOW THE SERIES</p>
            <p style={{ color: "rgba(155,148,138,0.75)", marginBottom: 24, fontSize: "clamp(13px,1.4vw,15px)", lineHeight: 1.8 }}>{t.ctaSub}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <ArcBtn href="https://youtube.com/@arcraidersmankindrises?si=gBZQD3b1g7ekAD2H" filled icon={<Play style={{ width: 13, height: 13 }} />} label={t.ytBtn} />
              <ArcBtn href="https://www.instagram.com/arcraidersmankindrises/"
                icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13 }}><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>}
                label={t.igBtn}
              />
            </div>
          </motion.div>
        </div>

      </div>

      {/* World map — full width row */}
      <motion.div variants={staggerItem} style={{ marginTop: 28, background: "rgba(0,0,0,0.52)", border: "1px solid rgba(249,115,22,0.14)", borderRadius: 8, overflow: "hidden", backdropFilter: "blur(8px)" }}>
        <div style={{ padding: "12px 16px 8px", borderBottom: "1px solid rgba(249,115,22,0.08)", fontFamily: "monospace", fontSize: 7.5, letterSpacing: "0.38em", color: "rgba(255,150,80,0.32)", textTransform: "uppercase" }}>
          RAIDER LOCATIONS — GLOBAL NETWORK
        </div>
        <div style={{ height: 320 }}>
          <WorldMap votes={votes} />
        </div>
      </motion.div>

    </motion.div>
  );
}

// ─── ENLIST PANEL ─────────────────────────────────────────────────────────────

function EnlistPanel({ lang, onClose }: { lang: Lang; onClose: () => void }) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => setTick((k) => k + 1), 900);
    return () => clearInterval(iv);
  }, []);

  const chars = lang === "fr"
    ? "PROGRAMME D'ENRÔLEMENT — EN COURS DE DÉPLOIEMENT"
    : "ENLISTMENT PROGRAM — DEPLOYMENT IN PROGRESS";

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible"
      style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", textAlign: "center" }}
    >
      <motion.div variants={staggerItem} style={{ fontFamily: "monospace", fontSize: 9, letterSpacing: "0.38em", color: "rgba(249,115,22,0.45)", textTransform: "uppercase", marginBottom: 48 }}>
        {chars}<span className="cursor-blink" style={{ color: "#f97316", marginLeft: 4 }}>▌</span>
      </motion.div>

      <motion.div variants={staggerItem}
        animate={{ filter: ["drop-shadow(0 0 18px rgba(249,115,22,0.4))","drop-shadow(0 0 42px rgba(249,115,22,0.75))","drop-shadow(0 0 18px rgba(249,115,22,0.4))"] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
        style={{ marginBottom: 40 }}
      >
        <svg viewBox="0 0 80 80" style={{ width: 80, height: 80, opacity: 0.72 }} fill="none">
          <polygon points="40,4 76,20 76,60 40,76 4,60 4,20" stroke="rgba(249,115,22,0.55)" strokeWidth="1.2" />
          <polygon points="40,14 66,26 66,54 40,66 14,54 14,26" stroke="rgba(249,115,22,0.3)" strokeWidth="0.8" />
          <line x1="40" y1="24" x2="40" y2="56" stroke="#f97316" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="28" y1="36" x2="52" y2="36" stroke="#f97316" strokeWidth="1.5" strokeLinecap="round"/>
          <circle cx="40" cy="36" r="6" stroke="#f97316" strokeWidth="1.2" />
        </svg>
      </motion.div>

      <motion.h2 variants={staggerItem}
        style={{ fontFamily: "'Orbitron',sans-serif", fontSize: "clamp(22px,3.5vw,46px)", fontWeight: 900, letterSpacing: "0.22em", textTransform: "uppercase", color: "#fff", textShadow: "0 0 40px rgba(249,115,22,0.45)", marginBottom: 20, lineHeight: 1.15 }}
      >
        {lang === "fr" ? "BIENTÔT DISPONIBLE" : "COMING SOON"}
      </motion.h2>

      <motion.p variants={staggerItem}
        style={{ fontFamily: "Georgia,serif", fontStyle: "italic", fontSize: "clamp(13px,1.5vw,16px)", color: "rgba(215,202,185,0.6)", maxWidth: 480, lineHeight: 1.75, marginBottom: 52 }}
      >
        {lang === "fr"
          ? "Le programme d'enrôlement de la Résistance est en cours de préparation. Revenez bientôt pour rejoindre les rangs."
          : "The Resistance enlistment program is being prepared. Return soon to join the ranks."}
      </motion.p>

      <motion.div variants={staggerItem} style={{ width: "min(380px,80%)", marginBottom: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontFamily: "monospace", fontSize: 8, letterSpacing: "0.28em", color: "rgba(249,115,22,0.38)", textTransform: "uppercase" }}>
          <span>{lang === "fr" ? "PROGRESSION" : "PROGRESS"}</span>
          <span className="hud-blink">{tick % 2 === 0 ? "—" : "██"} 00%</span>
        </div>
        <div style={{ height: 2, background: "rgba(249,115,22,0.1)", borderRadius: 1, overflow: "hidden" }}>
          <motion.div
            animate={{ width: ["0%","12%","8%","18%","14%"] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            style={{ height: "100%", background: "linear-gradient(90deg,#f97316,#fbbf24)" }}
          />
        </div>
      </motion.div>

      <motion.div variants={staggerItem}
        style={{ background: "rgba(0,0,0,0.6)", border: "1px solid rgba(249,115,22,0.12)", borderRadius: 6, padding: "14px 22px", fontFamily: "monospace", fontSize: 10, color: "rgba(255,150,80,0.38)", letterSpacing: "0.12em", backdropFilter: "blur(10px)" }}
      >
        &gt; {lang === "fr" ? "MODULE EN ATTENTE DE DÉPLOIEMENT..." : "MODULE AWAITING DEPLOYMENT..."}<span className="cursor-blink" style={{ marginLeft: 4, color: "#f97316" }}>▌</span>
      </motion.div>
    </motion.div>
  );
}

// ─── CODEX PANEL ─────────────────────────────────────────────────────────────

interface CodexLinkCardProps {
  icon: React.ReactNode;
  label: string;
  sub: string;
  href: string;
  index: number;
  accentColor: string;
}

function CodexLinkCard({ icon, label, sub, href, index, accentColor }: CodexLinkCardProps) {
  const ref = useRef<HTMLAnchorElement>(null);
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const rotX = useSpring(rawX, { stiffness: 160, damping: 22 });
  const rotY = useSpring(rawY, { stiffness: 160, damping: 22 });
  const glowX = useMotionValue(50);
  const glowY = useMotionValue(50);
  const glowBg = useTransform([glowX, glowY], ([x, y]: number[]) =>
    `radial-gradient(circle at ${x}% ${y}%, ${accentColor}28 0%, transparent 62%)`
  );

  const onMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const cx = (e.clientX - r.left) / r.width - 0.5;
    const cy = (e.clientY - r.top) / r.height - 0.5;
    rawY.set(cx * 20);
    rawX.set(-cy * 12);
    glowX.set((cx + 0.5) * 100);
    glowY.set((cy + 0.5) * 100);
  };
  const onLeave = () => { rawX.set(0); rawY.set(0); };

  return (
    <motion.a
      ref={ref}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, rotateY: index % 2 === 0 ? -55 : 55, y: 24, filter: "blur(6px)" }}
      animate={{ opacity: 1, rotateY: 0, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.6, delay: index * 0.12, ease: [0.16, 1, 0.3, 1] }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      whileHover={{ scale: 1.03 }}
      style={{
        display: "flex", alignItems: "center", gap: 18,
        padding: "18px 22px",
        background: "rgba(8,6,2,0.88)",
        border: `1px solid ${accentColor}44`,
        borderRadius: 10,
        textDecoration: "none",
        cursor: "pointer",
        position: "relative",
        overflow: "hidden",
        rotateX: rotX, rotateY: rotY,
        transformStyle: "preserve-3d",
        perspective: "800px",
        boxShadow: `0 4px 32px rgba(0,0,0,0.4), 0 0 0 0px ${accentColor}`,
        transition: "box-shadow 0.3s ease",
      }}
    >
      {/* glow */}
      <motion.div style={{ position: "absolute", inset: 0, background: glowBg, pointerEvents: "none", borderRadius: "inherit" }} />
      {/* icon */}
      <motion.div
        animate={{ filter: [`drop-shadow(0 0 6px ${accentColor}66)`, `drop-shadow(0 0 18px ${accentColor}cc)`, `drop-shadow(0 0 6px ${accentColor}66)`] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        style={{ color: accentColor, flexShrink: 0, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        {icon}
      </motion.div>
      {/* text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: "clamp(11px,1.2vw,14px)", fontWeight: 700, letterSpacing: "0.18em", color: "#f0e8d8", textTransform: "uppercase" }}>{label}</div>
        <div style={{ fontFamily: "monospace", fontSize: 10, letterSpacing: "0.12em", color: "rgba(215,190,155,0.45)", marginTop: 4, textTransform: "uppercase" }}>{sub}</div>
      </div>
      {/* arrow */}
      <motion.div whileHover={{ x: 4 }} style={{ color: `${accentColor}88`, flexShrink: 0 }}>
        <ArrowRight size={16} />
      </motion.div>
      {/* corner accent */}
      <div style={{ position: "absolute", top: 0, right: 0, width: 18, height: 18, borderTop: `2px solid ${accentColor}66`, borderRight: `2px solid ${accentColor}66`, borderTopRightRadius: 10, pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, width: 18, height: 18, borderBottom: `2px solid ${accentColor}33`, borderLeft: `2px solid ${accentColor}33`, borderBottomLeftRadius: 10, pointerEvents: "none" }} />
    </motion.a>
  );
}

const SUPPORTERS = [
  { handle: "arcraider_clips",  href: "https://www.instagram.com/arcraider_clips/" },
  { handle: "olivesassafras",   href: "https://www.instagram.com/olivesassafras/" },
  { handle: "4rtraiders",       href: "https://www.instagram.com/4rtraiders/" },
  { handle: "missm.arcphotos",  href: "https://www.instagram.com/missm.arcphotos/" },
  { handle: "arcdrop.news",     href: "https://www.instagram.com/arcdrop.news/" },
  { handle: "i.zoeyskylr",      href: "https://www.instagram.com/i.zoeyskylr/" },
];

function SupporterCard({ handle, href, index, isMobile }: { handle: string; href: string; index: number; isMobile: boolean }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const rotX = useSpring(rawX, { stiffness: 200, damping: 24 });
  const rotY = useSpring(rawY, { stiffness: 200, damping: 24 });
  const glowX = useMotionValue(50);
  const glowY = useMotionValue(50);
  const glowBg = useTransform([glowX, glowY], ([x, y]: number[]) =>
    `radial-gradient(circle at ${x}% ${y}%, rgba(192,38,211,0.22) 0%, rgba(249,115,22,0.10) 55%, transparent 75%)`
  );

  const onMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const cx = (e.clientX - r.left) / r.width - 0.5;
    const cy = (e.clientY - r.top) / r.height - 0.5;
    rawY.set(cx * 22);
    rawX.set(-cy * 14);
    glowX.set((cx + 0.5) * 100);
    glowY.set((cy + 0.5) * 100);
  };
  const onLeave = () => { rawX.set(0); rawY.set(0); };

  return (
    <motion.a
      ref={ref}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 18, filter: "blur(5px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.5, delay: 0.4 + index * 0.07, ease: [0.16, 1, 0.3, 1] }}
      onMouseMove={isMobile ? undefined : onMove}
      onMouseLeave={isMobile ? undefined : onLeave}
      whileHover={{ scale: 1.04, zIndex: 10 }}
      style={{
        display: "flex", alignItems: "center", gap: isMobile ? 6 : 10,
        padding: isMobile ? "8px 8px" : "10px 13px",
        background: "rgba(8,4,12,0.85)",
        border: "1px solid rgba(192,38,211,0.22)",
        borderRadius: 8,
        textDecoration: "none",
        cursor: "pointer",
        position: "relative",
        overflow: "hidden",
        ...(isMobile ? {} : { rotateX: rotX, rotateY: rotY, transformStyle: "preserve-3d" as const, perspective: "600px" }),
      }}
    >
      {/* dynamic glow */}
      <motion.div style={{ position: "absolute", inset: 0, background: glowBg, pointerEvents: "none", borderRadius: "inherit" }} />

      {/* corner accents */}
      <div style={{ position: "absolute", top: 0, right: 0, width: 12, height: 12, borderTop: "1.5px solid rgba(249,115,22,0.55)", borderRight: "1.5px solid rgba(249,115,22,0.55)", borderTopRightRadius: 8, pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, width: 12, height: 12, borderBottom: "1.5px solid rgba(192,38,211,0.35)", borderLeft: "1.5px solid rgba(192,38,211,0.35)", borderBottomLeftRadius: 8, pointerEvents: "none" }} />

      {/* Instagram gradient icon */}
      <motion.div
        animate={{ filter: ["drop-shadow(0 0 4px rgba(192,38,211,0.5))", "drop-shadow(0 0 10px rgba(249,115,22,0.7))", "drop-shadow(0 0 4px rgba(192,38,211,0.5))"] }}
        transition={{ duration: 2.8 + index * 0.3, repeat: Infinity, ease: "easeInOut" }}
        style={{ flexShrink: 0, width: isMobile ? 16 : 22, height: isMobile ? 16 : 22 }}
      >
        <svg viewBox="0 0 24 24" width={isMobile ? 16 : 22} height={isMobile ? 16 : 22} fill="none">
          <defs>
            <linearGradient id={`ig-grad-${index}`} x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f97316" />
              <stop offset="50%" stopColor="#c026d3" />
              <stop offset="100%" stopColor="#7c3aed" />
            </linearGradient>
          </defs>
          <rect x="2" y="2" width="20" height="20" rx="5.5" stroke={`url(#ig-grad-${index})`} strokeWidth="1.6" />
          <circle cx="12" cy="12" r="4.5" stroke={`url(#ig-grad-${index})`} strokeWidth="1.4" />
          <circle cx="17.5" cy="6.5" r="1" fill={`url(#ig-grad-${index})`} />
        </svg>
      </motion.div>

      {/* handle */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: "monospace", fontSize: isMobile ? 8 : "clamp(9px,0.85vw,11px)",
          letterSpacing: "0.04em", color: "rgba(235,220,205,0.88)",
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>@{handle}</div>
      </div>

      {/* arrow — hidden on mobile to save space */}
      {!isMobile && (
        <motion.div
          whileHover={{ x: 3 }}
          style={{ color: "rgba(249,115,22,0.45)", flexShrink: 0, fontSize: 10, lineHeight: 1 }}
        >
          ›
        </motion.div>
      )}
    </motion.a>
  );
}

function SpecialThanksBlock({ lang, isMobile }: { lang: Lang; isMobile: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const rotX = useSpring(rawX, { stiffness: 100, damping: 22 });
  const rotY = useSpring(rawY, { stiffness: 100, damping: 22 });

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const cx = (e.clientX - r.left) / r.width - 0.5;
    const cy = (e.clientY - r.top) / r.height - 0.5;
    rawY.set(cx * 8);
    rawX.set(-cy * 5);
  };
  const onLeave = () => { rawX.set(0); rawY.set(0); };

  return (
    <div>
      <div style={{ fontFamily: "monospace", fontSize: 8, letterSpacing: "0.36em", color: "rgba(192,38,211,0.5)", textTransform: "uppercase", marginBottom: 18 }}>
        {lang === "fr" ? "▸ REMERCIEMENTS" : "▸ SPECIAL THANKS"}
      </div>

      <motion.div
        ref={ref}
        onMouseMove={isMobile ? undefined : onMove}
        onMouseLeave={isMobile ? undefined : onLeave}
        style={{
          ...(isMobile ? {} : { rotateX: rotX, rotateY: rotY, transformStyle: "preserve-3d" as const, perspective: "1200px" }),
          background: "rgba(6,3,10,0.90)",
          border: "1px solid rgba(192,38,211,0.28)",
          borderRadius: 12,
          padding: "20px 18px 18px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* ambient background pulse */}
        <motion.div
          animate={{ opacity: [0.18, 0.38, 0.18] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
          style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 60% 30%, rgba(192,38,211,0.09) 0%, rgba(249,115,22,0.06) 50%, transparent 80%)", pointerEvents: "none" }}
        />

        {/* scanline overlay */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.025) 3px,rgba(0,0,0,0.025) 4px)", borderRadius: "inherit" }} />

        {/* corner accents */}
        {([["top","left"],["top","right"],["bottom","left"],["bottom","right"]] as const).map(([v,h]) => (
          <div key={v+h} style={{
            position: "absolute", [v]: 0, [h]: 0, width: 16, height: 16, pointerEvents: "none",
            [`border${v.charAt(0).toUpperCase()+v.slice(1)}`]: "2px solid rgba(192,38,211,0.50)",
            [`border${h.charAt(0).toUpperCase()+h.slice(1)}`]: "2px solid rgba(192,38,211,0.50)",
            [`border${v.charAt(0).toUpperCase()+v.slice(1)}${h.charAt(0).toUpperCase()+h.slice(1)}Radius`]: 12,
          }} />
        ))}

        {/* header */}
        <div style={{ position: "relative", zIndex: 2, display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          {/* pulsing star icon */}
          <motion.div
            animate={{ scale: [1, 1.25, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,rgba(192,38,211,0.25),rgba(249,115,22,0.18))", border: "1px solid rgba(192,38,211,0.38)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
          >
            <svg viewBox="0 0 16 16" width="13" height="13" fill="none">
              <path d="M8 1l1.8 4.2L14 6.1l-3 2.9.7 4.1L8 11l-3.7 2.1.7-4.1-3-2.9 4.2-.9z" fill="rgba(249,115,22,0.85)" stroke="rgba(249,115,22,0.4)" strokeWidth="0.5" strokeLinejoin="round" />
            </svg>
          </motion.div>
          <div>
            <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: "clamp(9px,0.9vw,11px)", fontWeight: 700, letterSpacing: "0.22em", color: "#f0e8d8", textTransform: "uppercase", lineHeight: 1.2 }}>
              {lang === "fr" ? "Supporters" : "Supporters"}
            </div>
            <div style={{ fontFamily: "monospace", fontSize: 7.5, letterSpacing: "0.26em", color: "rgba(192,38,211,0.5)", textTransform: "uppercase", marginTop: 2 }}>
              {lang === "fr" ? "Merci pour votre soutien" : "Thank you for your support"}
            </div>
          </div>
        </div>

        {/* separator */}
        <div style={{ height: 1, background: "linear-gradient(90deg,rgba(192,38,211,0.35),rgba(249,115,22,0.2),transparent)", marginBottom: 14, position: "relative", zIndex: 2 }} />

        {/* supporter grid */}
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr 1fr" : "1fr 1fr", gap: 8, position: "relative", zIndex: 2 }}>
          {SUPPORTERS.map((s, i) => (
            <SupporterCard key={s.handle} {...s} index={i} isMobile={isMobile} />
          ))}
        </div>
      </motion.div>
    </div>
  );
}

const CONTACT_EMAIL = "contact@arcraiders-mankindrises.com";

const CONTACT_TOPICS_FR = [
  { icon: "◈", label: "Bug & Problème technique",  sub: "Erreur d'affichage, lien cassé, dysfonctionnement" },
  { icon: "◇", label: "Informations & Presse",      sub: "Demandes médias, partenariats, collaborations" },
  { icon: "⬡", label: "Contenu & Suggestions",      sub: "Idées, retours sur les épisodes, fanart" },
  { icon: "◉", label: "Autre demande",              sub: "Toute autre question ou message" },
];
const CONTACT_TOPICS_EN = [
  { icon: "◈", label: "Bug & Technical Issue",      sub: "Display error, broken link, malfunction" },
  { icon: "◇", label: "Press & Information",         sub: "Media inquiries, partnerships, collaborations" },
  { icon: "⬡", label: "Content & Suggestions",      sub: "Ideas, episode feedback, fanart" },
  { icon: "◉", label: "Other Request",              sub: "Any other question or message" },
];

function ContactBlock({ lang }: { lang: Lang }) {
  const topics = lang === "fr" ? CONTACT_TOPICS_FR : CONTACT_TOPICS_EN;
  const [copied, setCopied] = useState(false);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const blockRef = useRef<HTMLDivElement>(null);
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const rotX = useSpring(rawX, { stiffness: 120, damping: 22 });
  const rotY = useSpring(rawY, { stiffness: 120, damping: 22 });
  const glowX = useMotionValue(50);
  const glowY = useMotionValue(50);
  const glowBg = useTransform([glowX, glowY], ([x, y]: number[]) =>
    `radial-gradient(circle at ${x}% ${y}%, rgba(249,115,22,0.11) 0%, rgba(56,189,248,0.05) 50%, transparent 72%)`
  );

  const [isMobileContact, setIsMobileContact] = useState(false);
  useEffect(() => {
    const check = () => setIsMobileContact(window.innerWidth < 640 || (window.innerWidth < 900 && window.innerHeight < 500));
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!blockRef.current || isMobileContact) return;
    const r = blockRef.current.getBoundingClientRect();
    const cx = (e.clientX - r.left) / r.width - 0.5;
    const cy = (e.clientY - r.top) / r.height - 0.5;
    rawY.set(cx * 7);
    rawX.set(-cy * 4);
    glowX.set((cx + 0.5) * 100);
    glowY.set((cy + 0.5) * 100);
  };
  const onLeave = () => { rawX.set(0); rawY.set(0); };

  const copyEmail = () => {
    const done = () => { setCopied(true); setTimeout(() => setCopied(false), 2200); };
    const fallback = () => {
      const el = document.createElement("textarea");
      el.value = CONTACT_EMAIL;
      el.style.cssText = "position:fixed;top:-9999px;left:-9999px;opacity:0";
      document.body.appendChild(el);
      el.focus(); el.select();
      try { document.execCommand("copy"); done(); } catch {}
      document.body.removeChild(el);
    };
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(CONTACT_EMAIL).then(done).catch(fallback);
    } else {
      fallback();
    }
  };

  return (
    <motion.div
      ref={blockRef}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{
        ...(isMobileContact ? {} : { rotateX: rotX, rotateY: rotY, transformStyle: "preserve-3d" as const, perspective: "1400px" }),
        background: "rgba(4,6,10,0.92)",
        border: "1px solid rgba(249,115,22,0.22)",
        borderRadius: 14,
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* animated glow layer */}
      <motion.div style={{ position: "absolute", inset: 0, background: glowBg, pointerEvents: "none", zIndex: 0 }} />

      {/* scanlines */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 1, background: "repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.025) 3px,rgba(0,0,0,0.025) 4px)", borderRadius: "inherit" }} />

      {/* ambient pulse top-right */}
      <motion.div
        animate={{ opacity: [0.15, 0.32, 0.15], scale: [1, 1.06, 1] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        style={{ position: "absolute", top: -60, right: -60, width: 220, height: 220, borderRadius: "50%", background: "radial-gradient(circle, rgba(56,189,248,0.07) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }}
      />

      {/* corner accents */}
      {([["top","left"],["top","right"],["bottom","left"],["bottom","right"]] as const).map(([v,h]) => (
        <div key={v+h} style={{
          position: "absolute", [v]: 0, [h]: 0, width: 18, height: 18, zIndex: 2, pointerEvents: "none",
          [`border${v.charAt(0).toUpperCase()+v.slice(1)}`]: "1.5px solid rgba(249,115,22,0.45)",
          [`border${h.charAt(0).toUpperCase()+h.slice(1)}`]: "1.5px solid rgba(249,115,22,0.45)",
          [`border${v.charAt(0).toUpperCase()+v.slice(1)}${h.charAt(0).toUpperCase()+h.slice(1)}Radius`]: 14,
        }} />
      ))}

      {/* ── TOP BAND: email CTA ── */}
      <div style={{ position: "relative", zIndex: 3, padding: isMobileContact ? "18px 18px 16px" : "22px 26px 20px", borderBottom: "1px solid rgba(249,115,22,0.1)" }}>

        {isMobileContact ? (
          /* ── MOBILE layout: stacked ── */
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {/* Row 1: icon + label */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <motion.div
                animate={{ boxShadow: ["0 0 12px rgba(249,115,22,0.22)", "0 0 24px rgba(249,115,22,0.45)", "0 0 12px rgba(249,115,22,0.22)"] }}
                transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
                style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.35)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
              >
                <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="rgba(249,115,22,0.85)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="16" height="13" rx="2" />
                  <path d="M2 7l8 5 8-5" />
                </svg>
              </motion.div>
              <div style={{ fontFamily: "monospace", fontSize: 7, letterSpacing: "0.28em", color: "rgba(249,115,22,0.45)", textTransform: "uppercase" }}>
                {lang === "fr" ? "TRANSMISSION — RAIDER_LINK" : "TRANSMISSION — RAIDER_LINK"}
              </div>
            </div>
            {/* Row 2: email pill */}
            <div style={{ background: "rgba(249,115,22,0.05)", border: "1px solid rgba(249,115,22,0.18)", borderRadius: 8, padding: "10px 14px" }}>
              <div style={{ fontFamily: "monospace", fontSize: 10, letterSpacing: "0.05em", color: "#f0e8d8", textAlign: "center", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {CONTACT_EMAIL}
              </div>
            </div>
            {/* Row 3: buttons */}
            <div style={{ display: "flex", gap: 8 }}>
              <motion.button
                onClick={copyEmail}
                whileTap={{ scale: 0.93 }}
                animate={copied ? { borderColor: "rgba(74,222,128,0.7)" } : { borderColor: "rgba(249,115,22,0.4)" }}
                style={{
                  flex: 1, background: copied ? "rgba(74,222,128,0.08)" : "rgba(249,115,22,0.06)",
                  border: "1px solid rgba(249,115,22,0.4)", borderRadius: 6, padding: "10px 0",
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  fontFamily: "'Orbitron',sans-serif", fontSize: 8, fontWeight: 700,
                  letterSpacing: "0.16em", textTransform: "uppercase",
                  color: copied ? "rgba(74,222,128,0.9)" : "rgba(249,115,22,0.8)",
                  transition: "color 0.3s, background 0.3s",
                }}
              >
                {copied
                  ? <svg viewBox="0 0 14 14" width="11" height="11" fill="none" stroke="rgba(74,222,128,0.9)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 7l3.5 3.5L12 3" /></svg>
                  : <svg viewBox="0 0 14 14" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="5" width="7" height="7" rx="1.2"/><path d="M2 9V3a1 1 0 011-1h6"/></svg>
                }
                {copied ? (lang === "fr" ? "Copié !" : "Copied!") : (lang === "fr" ? "Copier" : "Copy")}
              </motion.button>
              <motion.a
                href={`mailto:${CONTACT_EMAIL}`}
                whileTap={{ scale: 0.93 }}
                className="btn-pulse"
                style={{
                  flex: 1, background: "rgba(249,115,22,0.10)", border: "1px solid rgba(249,115,22,0.55)",
                  borderRadius: 6, padding: "10px 0",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  textDecoration: "none",
                  fontFamily: "'Orbitron',sans-serif", fontSize: 8, fontWeight: 700,
                  letterSpacing: "0.16em", textTransform: "uppercase", color: "#f97316",
                }}
              >
                <svg viewBox="0 0 14 14" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 1v8M3.5 5.5L7 1l3.5 4.5" /><path d="M2 10h10v2H2z" />
                </svg>
                {lang === "fr" ? "Envoyer" : "Send"}
              </motion.a>
            </div>
          </div>
        ) : (
          /* ── DESKTOP layout: single row ── */
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <motion.div
              animate={{ boxShadow: ["0 0 14px rgba(249,115,22,0.25)", "0 0 30px rgba(249,115,22,0.5)", "0 0 14px rgba(249,115,22,0.25)"] }}
              transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
              style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.35)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
            >
              <svg viewBox="0 0 20 20" width="20" height="20" fill="none" stroke="rgba(249,115,22,0.85)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="16" height="13" rx="2" />
                <path d="M2 7l8 5 8-5" />
              </svg>
            </motion.div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: "monospace", fontSize: 7.5, letterSpacing: "0.32em", color: "rgba(249,115,22,0.45)", textTransform: "uppercase", marginBottom: 6 }}>
                {lang === "fr" ? "TRANSMISSION DIRECTE — RAIDER_LINK SÉCURISÉ" : "DIRECT TRANSMISSION — SECURE RAIDER_LINK"}
              </div>
              <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: "clamp(10px,1.15vw,13px)", fontWeight: 700, letterSpacing: "0.12em", color: "#f0e8d8" }}>
                {CONTACT_EMAIL}
              </div>
            </div>
            <motion.button
              onClick={copyEmail}
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.93 }}
              animate={copied ? { borderColor: "rgba(74,222,128,0.7)" } : { borderColor: "rgba(249,115,22,0.4)" }}
              style={{
                background: copied ? "rgba(74,222,128,0.08)" : "rgba(249,115,22,0.06)",
                border: "1px solid rgba(249,115,22,0.4)", borderRadius: 6, padding: "9px 16px",
                cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center", gap: 7,
                fontFamily: "'Orbitron',sans-serif", fontSize: 8, fontWeight: 700,
                letterSpacing: "0.2em", textTransform: "uppercase",
                color: copied ? "rgba(74,222,128,0.9)" : "rgba(249,115,22,0.8)",
                transition: "color 0.3s, background 0.3s",
              }}
            >
              <motion.div animate={{ rotate: copied ? 360 : 0 }} transition={{ duration: 0.4 }}>
                {copied
                  ? <svg viewBox="0 0 14 14" width="12" height="12" fill="none" stroke="rgba(74,222,128,0.9)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 7l3.5 3.5L12 3" /></svg>
                  : <svg viewBox="0 0 14 14" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="5" width="7" height="7" rx="1.2"/><path d="M2 9V3a1 1 0 011-1h6"/></svg>
                }
              </motion.div>
              {copied ? (lang === "fr" ? "Copié !" : "Copied!") : (lang === "fr" ? "Copier" : "Copy")}
            </motion.button>
            <motion.a
              href={`mailto:${CONTACT_EMAIL}`}
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.93 }}
              className="btn-pulse"
              style={{
                background: "rgba(249,115,22,0.10)", border: "1px solid rgba(249,115,22,0.55)",
                borderRadius: 6, padding: "9px 18px",
                display: "flex", alignItems: "center", gap: 7, textDecoration: "none", flexShrink: 0,
                fontFamily: "'Orbitron',sans-serif", fontSize: 8, fontWeight: 700,
                letterSpacing: "0.2em", textTransform: "uppercase", color: "#f97316",
                clipPath: "polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%)",
              }}
            >
              <svg viewBox="0 0 14 14" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 1v8M3.5 5.5L7 1l3.5 4.5" /><path d="M2 10h10v2H2z" />
              </svg>
              {lang === "fr" ? "Envoyer" : "Send"}
            </motion.a>
          </div>
        )}
      </div>

      {/* ── BOTTOM: topic grid ── */}
      <div style={{ position: "relative", zIndex: 3, padding: "18px 26px 22px" }}>
        <div style={{ fontFamily: "monospace", fontSize: 7.5, letterSpacing: "0.3em", color: "rgba(249,115,22,0.3)", textTransform: "uppercase", marginBottom: 14 }}>
          {lang === "fr" ? "▸ SUJETS DE CONTACT" : "▸ CONTACT TOPICS"}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: isMobileContact ? "1fr" : "1fr 1fr", gap: 10 }}>
          {topics.map((t, i) => (
            <motion.div
              key={t.label}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.07, duration: 0.4 }}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
              style={{
                display: "flex", alignItems: "flex-start", gap: 12,
                padding: "12px 14px",
                background: hoveredIdx === i ? "rgba(249,115,22,0.06)" : "rgba(249,115,22,0.02)",
                border: `1px solid ${hoveredIdx === i ? "rgba(249,115,22,0.22)" : "rgba(249,115,22,0.07)"}`,
                borderRadius: 8,
                cursor: "default",
                transition: "background 0.25s, border-color 0.25s",
              }}
            >
              <span style={{ fontFamily: "monospace", fontSize: 15, color: "rgba(249,115,22,0.5)", lineHeight: 1.3, flexShrink: 0 }}>{t.icon}</span>
              <div>
                <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: "clamp(8px,0.85vw,10px)", fontWeight: 700, letterSpacing: "0.15em", color: "#f0e8d8", textTransform: "uppercase", marginBottom: 4 }}>{t.label}</div>
                <div style={{ fontFamily: "monospace", fontSize: "clamp(8px,0.78vw,9.5px)", letterSpacing: "0.06em", color: "rgba(200,185,165,0.42)", lineHeight: 1.6 }}>{t.sub}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function CodexPanel({ lang, onClose, hypeCount, votes, onVote }: {
  lang: Lang; onClose: () => void;
  hypeCount: number | null;
  votes: { lat: number; lng: number }[];
  onVote: () => void;
}) {
  const CREDITS_FR = [
    { role: "CRÉATEUR & RÉALISATEUR",  name: "Rudy Saksik"    },
    { role: "SCÉNARIO",                name: "Rudy Saksik"    },
    { role: "DIRECTION ARTISTIQUE",    name: "ARC Raiders: Mankind Rises Team" },
    { role: "MUSIQUE ORIGINALE",       name: "À CONFIRMER"    },
    { role: "INSPIRÉ DE",              name: "ARC Raiders — Embark Studios" },
  ];
  const CREDITS_EN = [
    { role: "CREATOR & DIRECTOR",      name: "Rudy Saksik"    },
    { role: "SCREENPLAY",              name: "Rudy Saksik"    },
    { role: "ART DIRECTION",           name: "ARC Raiders: Mankind Rises Team" },
    { role: "ORIGINAL SCORE",          name: "TBD"            },
    { role: "INSPIRED BY",             name: "ARC Raiders — Embark Studios" },
  ];
  const credits = lang === "fr" ? CREDITS_FR : CREDITS_EN;

  const [isMobileC, setIsMobileC] = useState(false);
  useEffect(() => {
    const check = () => setIsMobileC(window.innerWidth < 640 || (window.innerWidth < 900 && window.innerHeight < 500));
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const links = [
    {
      icon: <Youtube size={22} />,
      label: "YouTube",
      sub: lang === "fr" ? "Regarder les épisodes" : "Watch the episodes",
      href: "https://youtube.com/@arcraidersmankindrises?si=gBZQD3b1g7ekAD2H",
      accentColor: "#ff3d00",
    },
    {
      icon: <Instagram size={22} />,
      label: "Instagram",
      sub: lang === "fr" ? "Suivre les coulisses" : "Follow behind the scenes",
      href: "https://www.instagram.com/arcraidersmankindrises/",
      accentColor: "#c026d3",
    },
  ];

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible"
      style={{ display: "flex", flexDirection: "column", gap: 48, maxWidth: 860, margin: "0 auto" }}
    >
      {/* ── Header ── */}
      <motion.div variants={staggerItem}>
        <div style={{ fontFamily: "monospace", fontSize: 9, letterSpacing: "0.42em", color: "rgba(249,115,22,0.45)", textTransform: "uppercase", marginBottom: 14 }}>
          RAIDER_LINK — KNOWLEDGE REPOSITORY v1.0<span className="cursor-blink" style={{ color: "#f97316", marginLeft: 4 }}>▌</span>
        </div>
        <h2 style={{ fontFamily: "'Orbitron',sans-serif", fontSize: "clamp(26px,4vw,54px)", fontWeight: 900, letterSpacing: "0.2em", color: "#fff", textShadow: "0 0 60px rgba(249,115,22,0.35)", margin: 0, lineHeight: 1.1 }}>
          CODEX
        </h2>
        <div style={{ marginTop: 14, height: 1, background: "linear-gradient(90deg,rgba(249,115,22,0.6),rgba(249,115,22,0.08),transparent)" }} />
      </motion.div>

      {/* ── Social links + Special Thanks ── */}
      <motion.div variants={staggerItem}>
        <div style={{ display: "grid", gridTemplateColumns: isMobileC ? "1fr" : "1fr 1fr", gap: isMobileC ? 28 : 20, alignItems: "start" }}>

          {/* LEFT (or top on mobile): Broadcast channels */}
          <div>
            <div style={{ fontFamily: "monospace", fontSize: 8, letterSpacing: "0.36em", color: "rgba(249,115,22,0.38)", textTransform: "uppercase", marginBottom: 18 }}>
              {lang === "fr" ? "▸ CANAUX DE DIFFUSION" : "▸ BROADCAST CHANNELS"}
            </div>
            <div style={{ display: "flex", flexDirection: isMobileC ? "column" : "column", gap: 14 }}>
              {links.map((lnk, i) => (
                <CodexLinkCard key={lnk.label} {...lnk} index={i} />
              ))}
            </div>
          </div>

          {/* RIGHT (or bottom on mobile): Special Thanks */}
          <SpecialThanksBlock lang={lang} isMobile={isMobileC} />

        </div>
      </motion.div>

      {/* ── Resistance: HUD Intelligence Terminal ── */}
      <motion.div variants={staggerItem}>
        <motion.div
          style={{
            position: "relative", borderRadius: 12, overflow: "hidden",
            background: "rgba(5,3,1,0.92)",
            border: "1px solid rgba(249,115,22,0.22)",
            boxShadow: "0 0 40px rgba(249,115,22,0.06), inset 0 0 60px rgba(249,115,22,0.03)",
          }}
        >
          {/* Animated background glow */}
          <motion.div
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 70% 50%, rgba(249,115,22,0.07) 0%, transparent 65%)", pointerEvents: "none" }}
          />

          {/* HUD corner brackets */}
          {[["top:4px","left:4px","borderTop","borderLeft"],["top:4px","right:4px","borderTop","borderRight"],["bottom:4px","left:4px","borderBottom","borderLeft"],["bottom:4px","right:4px","borderBottom","borderRight"]].map(([a,b,c,d],i) => (
            <span key={i} style={{ position:"absolute", ...Object.fromEntries([[a.split(":")[0],a.split(":")[1]],[b.split(":")[0],b.split(":")[1]]]), width:10, height:10, [c]:"1px solid rgba(249,115,22,0.7)", [d]:"1px solid rgba(249,115,22,0.7)", pointerEvents:"none", zIndex:5 }} />
          ))}

          {/* ── HUD Header bar ── */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", borderBottom: "1px solid rgba(249,115,22,0.12)", background: "rgba(249,115,22,0.04)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {/* Live dot */}
              <motion.span
                animate={{ opacity: [1, 0.2, 1], boxShadow: ["0 0 6px #22c55e", "0 0 2px #22c55e", "0 0 8px #22c55e"] }}
                transition={{ duration: 1.6, repeat: Infinity }}
                style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", display: "inline-block" }}
              />
              <span style={{ fontFamily: "monospace", fontSize: 8, letterSpacing: "0.36em", color: "rgba(249,115,22,0.85)", textTransform: "uppercase" }}>
                {lang === "fr" ? "LA RÉSISTANCE — RÉSEAU MONDIAL" : "THE RESISTANCE — GLOBAL NETWORK"}
              </span>
            </div>
            {/* Signal bars */}
            <div style={{ display: "flex", alignItems: "flex-end", gap: 2 }}>
              {[3,5,7,9].map((h, i) => (
                <motion.span key={i}
                  animate={{ opacity: i < 3 ? 1 : [0.3, 0.9, 0.3] }}
                  transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.4 }}
                  style={{ width: 3, height: h, background: i < 3 ? "rgba(249,115,22,0.8)" : "rgba(249,115,22,0.2)", borderRadius: 1, display: "inline-block" }}
                />
              ))}
              <span style={{ fontFamily: "monospace", fontSize: 7, color: "rgba(249,115,22,0.45)", marginLeft: 5, letterSpacing: "0.12em" }}>SIG</span>
            </div>
          </div>

          {/* ── Main content: counter + globe ── */}
          <div style={{ display: "grid", gridTemplateColumns: isMobileC ? "1fr" : "200px 1fr", gap: 0 }}>

            {/* Left: counter + CTA */}
            <div style={{ padding: "24px 20px", borderRight: isMobileC ? "none" : "1px solid rgba(249,115,22,0.1)", borderBottom: isMobileC ? "1px solid rgba(249,115,22,0.1)" : "none", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 18, position: "relative" }}>
              <motion.div
                animate={{ opacity: [0.15, 0.35, 0.15] }}
                transition={{ duration: 3, repeat: Infinity }}
                style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 60%, rgba(249,115,22,0.1) 0%, transparent 70%)", pointerEvents: "none" }}
              />
              <div style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
                <div style={{ fontFamily: "monospace", fontSize: 7, letterSpacing: "0.38em", color: "rgba(255,150,80,0.45)", textTransform: "uppercase", marginBottom: 8 }}>
                  {lang === "fr" ? "RAIDERS PRÊTS" : "RAIDERS READY"}
                </div>
                <motion.div
                  key={hypeCount}
                  initial={{ scale: 1.14, opacity: 0.3, filter: "blur(6px)" }}
                  animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
                  transition={{ duration: 0.55 }}
                  style={{ fontFamily: "'Orbitron',sans-serif", fontSize: "clamp(28px,3.5vw,46px)", fontWeight: 900, color: "#fff", lineHeight: 1, letterSpacing: "0.04em", textShadow: "0 0 28px rgba(255,150,80,0.65), 0 0 60px rgba(249,115,22,0.2)" }}
                >
                  {hypeCount === null ? "—" : hypeCount.toLocaleString("en-US")}
                </motion.div>
                {/* Progress bar under counter */}
                <div style={{ marginTop: 10, height: 2, width: "100%", background: "rgba(249,115,22,0.1)", borderRadius: 2, overflow: "hidden" }}>
                  <motion.div
                    animate={{ width: ["0%", "100%", "60%"] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    style={{ height: "100%", background: "linear-gradient(90deg,#f97316,#fbbf24)", borderRadius: 2, boxShadow: "0 0 8px rgba(249,115,22,0.6)" }}
                  />
                </div>
              </div>
              <div style={{ position: "relative", zIndex: 1, width: "100%" }}>
                <HypeButton label={lang === "fr" ? "JE SUIS PRÊT" : "I AM READY"} doneLabel={lang === "fr" ? "SIGNAL ENVOYÉ" : "SIGNAL SENT"} onVote={onVote} />
              </div>
            </div>

            {/* Right: globe */}
            <div style={{ position: "relative", padding: "12px 8px 8px" }}>
              <div style={{ fontFamily: "monospace", fontSize: 7, letterSpacing: "0.3em", color: "rgba(249,115,22,0.28)", textTransform: "uppercase", marginBottom: 4, paddingLeft: 8 }}>
                {lang === "fr" ? "POSITIONS DES RAIDERS" : "RAIDER LOCATIONS"}
              </div>
              <WorldMap votes={votes} />
            </div>
          </div>

          {/* ── Data strip footer ── */}
          <div style={{ display: "flex", alignItems: "center", gap: 0, padding: "7px 16px", borderTop: "1px solid rgba(249,115,22,0.1)", background: "rgba(0,0,0,0.3)" }}>
            {[
              { label: lang === "fr" ? "NŒUDS" : "NODES",  value: votes.length.toString().padStart(3,"0") },
              { label: "STATUS", value: "ONLINE" },
              { label: "NET",    value: "ARC-RESIST-1" },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, paddingRight: 18, marginRight: 18, borderRight: i < 2 ? "1px solid rgba(249,115,22,0.1)" : "none" }}>
                <span style={{ fontFamily: "monospace", fontSize: 7, letterSpacing: "0.28em", color: "rgba(249,115,22,0.32)", textTransform: "uppercase" }}>{item.label}</span>
                <span style={{ fontFamily: "monospace", fontSize: 7, letterSpacing: "0.22em", color: "rgba(255,200,100,0.7)", textTransform: "uppercase" }}>{item.value}</span>
              </div>
            ))}
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
              <motion.span animate={{ opacity: [1,0.3,1] }} transition={{ duration: 1.4, repeat: Infinity }}
                style={{ fontFamily: "monospace", fontSize: 7, letterSpacing: "0.22em", color: "#22c55e", textTransform: "uppercase" }}>● LIVE</motion.span>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* ── About the project ── */}
      <motion.div variants={staggerItem}
        style={{ position: "relative", padding: "28px 32px", background: "rgba(6,4,1,0.85)", border: "1px solid rgba(249,115,22,0.14)", borderRadius: 12, overflow: "hidden" }}
      >
        {/* animated glow bg */}
        <motion.div
          animate={{ opacity: [0.3, 0.55, 0.3] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 30% 50%, rgba(249,115,22,0.06) 0%, transparent 65%)", pointerEvents: "none" }}
        />
        <div style={{ fontFamily: "monospace", fontSize: 8, letterSpacing: "0.36em", color: "rgba(249,115,22,0.38)", textTransform: "uppercase", marginBottom: 16 }}>
          {lang === "fr" ? "▸ À PROPOS DU PROJET" : "▸ ABOUT THE PROJECT"}
        </div>
        <p style={{ fontFamily: "Georgia,serif", fontStyle: "italic", fontSize: "clamp(13px,1.4vw,15px)", color: "rgba(215,202,185,0.72)", lineHeight: 1.85, margin: 0 }}>
          {lang === "fr"
            ? "ARC Raiders: Mankind Rises est une série fan non-officielle inspirée de l'univers du jeu ARC Raiders d'Embark Studios. Elle suit des survivants dans les ruines de 2180, tandis que la résistance de Speranza tente de survivre aux machines de l'ARC. Ce projet est réalisé avec passion, sans affiliation commerciale."
            : "ARC Raiders: Mankind Rises is an unofficial fan-made series inspired by the ARC Raiders universe created by Embark Studios. It follows survivors in the ruins of 2180, as Speranza's resistance fights to endure the ARC machines. This project is made with passion, with no commercial affiliation."}
        </p>
      </motion.div>

      {/* ── Credits ── */}
      <motion.div variants={staggerItem}>
        <div style={{ fontFamily: "monospace", fontSize: 8, letterSpacing: "0.36em", color: "rgba(249,115,22,0.38)", textTransform: "uppercase", marginBottom: 18 }}>
          {lang === "fr" ? "▸ CRÉDITS" : "▸ CREDITS"}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {credits.map((c, i) => (
            <motion.div
              key={c.role}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.08, duration: 0.4 }}
              style={{
                display: "flex", alignItems: "baseline", justifyContent: "space-between",
                padding: "11px 0",
                borderBottom: i < credits.length - 1 ? "1px solid rgba(249,115,22,0.07)" : "none",
                gap: 16,
              }}
            >
              <span style={{ fontFamily: "monospace", fontSize: 9, letterSpacing: "0.26em", color: "rgba(249,115,22,0.5)", textTransform: "uppercase", flexShrink: 0 }}>{c.role}</span>
              <span style={{ fontFamily: "'Orbitron',sans-serif", fontSize: "clamp(10px,1.1vw,12px)", fontWeight: 600, letterSpacing: "0.14em", color: "#f0e8d8", textAlign: "right" }}>{c.name}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ── Contact ── */}
      <motion.div variants={staggerItem}>
        <div style={{ fontFamily: "monospace", fontSize: 8, letterSpacing: "0.36em", color: "rgba(249,115,22,0.38)", textTransform: "uppercase", marginBottom: 18 }}>
          {lang === "fr" ? "▸ CONTACT & SIGNALEMENT" : "▸ CONTACT & REPORTS"}
        </div>

        <ContactBlock lang={lang} />
      </motion.div>

      {/* ── Legal disclaimer ── */}
      <motion.div variants={staggerItem}
        style={{ fontFamily: "monospace", fontSize: 8.5, letterSpacing: "0.1em", color: "rgba(180,160,130,0.3)", lineHeight: 1.8, borderTop: "1px solid rgba(249,115,22,0.07)", paddingTop: 24, textTransform: "uppercase" }}
      >
        {lang === "fr"
          ? "FAN PRODUCTION NON OFFICIELLE — ARC RAIDERS EST UNE MARQUE D'EMBARK STUDIOS. CE PROJET N'EST PAS AFFILIÉ, SPONSORISÉ OU APPROUVÉ PAR EMBARK STUDIOS."
          : "UNOFFICIAL FAN PRODUCTION — ARC RAIDERS IS A TRADEMARK OF EMBARK STUDIOS. THIS PROJECT IS NOT AFFILIATED WITH, SPONSORED BY, OR ENDORSED BY EMBARK STUDIOS."}
      </motion.div>

    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TEASER VIDEO MODAL
// ═══════════════════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════════════════
// DONATION MODAL
// ═══════════════════════════════════════════════════════════════════════════════

const DONATION_LINK = "https://buymeacoffee.com/mankindrises";

function DonationModal({ onClose, lang }: { onClose: () => void; lang: Lang }) {
  const ref = useRef<HTMLDivElement>(null);
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const rotX = useSpring(rawX, { stiffness: 100, damping: 20 });
  const rotY = useSpring(rawY, { stiffness: 100, damping: 20 });
  const glowX = useMotionValue(50);
  const glowY = useMotionValue(50);
  const glowBg = useTransform([glowX, glowY], ([x, y]: number[]) =>
    `radial-gradient(circle at ${x}% ${y}%, rgba(249,115,22,0.12) 0%, transparent 65%)`
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const cx = (e.clientX - r.left) / r.width - 0.5;
    const cy = (e.clientY - r.top) / r.height - 0.5;
    rawY.set(cx * 8);
    rawX.set(-cy * 5);
    glowX.set((cx + 0.5) * 100);
    glowY.set((cy + 0.5) * 100);
  };
  const onLeave = () => { rawX.set(0); rawY.set(0); };

  const sections = lang === "fr" ? [
    {
      title: "Crédits de génération IA",
      text: "Générer des vidéos cinématiques à l'aide de modèles IA haut de gamme (comme Kling AI et Seedance) consomme des crédits serveur à une vitesse folle. Il faut souvent relancer la génération des dizaines de fois pour obtenir le plan parfait et sans défaut.",
      icon: "⬡",
    },
    {
      title: "Audio et Voix",
      text: "Financer les abonnements aux IA vocales premium (comme ElevenLabs) et le design sonore professionnel pour donner vie à des personnages comme Jax.",
      icon: "◈",
    },
    {
      title: "Upscaling et Post-Production",
      text: "Les logiciels et la puissance de calcul nécessaires pour upscaler les générations IA en une résolution 4K nette, digne d'un blockbuster.",
      icon: "◇",
    },
    {
      title: "Hébergement du site",
      text: "Maintenir ce site et nos espaces communautaires en ligne et fonctionnels.",
      icon: "◉",
    },
  ] : [
    {
      title: "AI Generation Credits",
      text: "Generating cinematic videos using top-tier AI models (like Kling AI and Seedance) burns through server credits at a staggering rate. We often need to regenerate scenes dozens of times to get a flawless, perfect shot.",
      icon: "⬡",
    },
    {
      title: "Audio & Voice",
      text: "Funding subscriptions to premium AI voice platforms (like ElevenLabs) and professional sound design to bring characters like Jax to life.",
      icon: "◈",
    },
    {
      title: "Upscaling & Post-Production",
      text: "The software and computing power required to upscale AI generations to crisp, blockbuster-worthy 4K resolution.",
      icon: "◇",
    },
    {
      title: "Website Hosting",
      text: "Keeping this site and our community spaces online and running smoothly.",
      icon: "◉",
    },
  ];

  return (
    <motion.div
      key="donation-modal"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 99600,
        background: "rgba(0,0,0,0.92)",
        backdropFilter: "blur(14px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "20px",
      }}
    >
      {/* 3D Panel */}
      <motion.div
        ref={ref}
        initial={{ scale: 0.84, rotateX: -22, y: 50, opacity: 0, filter: "blur(18px)" }}
        animate={{ scale: 1, rotateX: 0, y: 0, opacity: 1, filter: "blur(0px)" }}
        exit={{ scale: 0.88, rotateX: 14, y: -30, opacity: 0, filter: "blur(10px)" }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        onClick={(e) => e.stopPropagation()}
        style={{
          rotateX: rotX, rotateY: rotY,
          transformStyle: "preserve-3d",
          perspective: "1400px",
          width: "min(780px, 94vw)",
          maxHeight: "88vh",
          background: "rgba(5,3,1,0.97)",
          border: "1px solid rgba(249,115,22,0.4)",
          borderRadius: 16,
          overflow: "hidden",
          position: "relative",
          boxShadow: "0 0 100px rgba(249,115,22,0.15), 0 50px 100px rgba(0,0,0,0.8)",
          display: "flex", flexDirection: "column",
        }}
      >
        {/* Glow layer */}
        <motion.div style={{ position: "absolute", inset: 0, background: glowBg, pointerEvents: "none", zIndex: 0 }} />

        {/* Scanline */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none", zIndex: 1,
          background: "repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.03) 3px,rgba(0,0,0,0.03) 4px)",
        }} />

        {/* Corner accents */}
        {[["top","left"],["top","right"],["bottom","left"],["bottom","right"]].map(([v,h]) => (
          <div key={v+h} style={{
            position: "absolute", [v]: 0, [h]: 0, width: 22, height: 22, zIndex: 2, pointerEvents: "none",
            [`border${v.charAt(0).toUpperCase()+v.slice(1)}`]: "2px solid rgba(249,115,22,0.55)",
            [`border${h.charAt(0).toUpperCase()+h.slice(1)}`]: "2px solid rgba(249,115,22,0.55)",
            [`border${v.charAt(0).toUpperCase()+v.slice(1)}${h.charAt(0).toUpperCase()+h.slice(1)}Radius`]: 16,
          }} />
        ))}

        {/* ── Header ── */}
        <div style={{ position: "relative", zIndex: 3, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderBottom: "1px solid rgba(249,115,22,0.15)", background: "rgba(249,115,22,0.04)", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <motion.div animate={{ opacity: [1,0.2,1] }} transition={{ duration: 1.4, repeat: Infinity }}
              style={{ width: 7, height: 7, borderRadius: "50%", background: "#f97316" }}
            />
            <span style={{ fontFamily: "monospace", fontSize: 8, letterSpacing: "0.4em", color: "rgba(249,115,22,0.6)", textTransform: "uppercase" }}>
              RAIDER_LINK — {lang === "fr" ? "CANAL DE SOUTIEN // SÉCURISÉ" : "SUPPORT CHANNEL // SECURE"}
            </span>
          </div>
          <motion.button onClick={onClose}
            whileHover={{ scale: 1.15, color: "#f97316" }} whileTap={{ scale: 0.9 }}
            style={{ background: "none", border: "1px solid rgba(249,115,22,0.28)", borderRadius: 4, width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "rgba(249,115,22,0.55)", fontSize: 13, lineHeight: 1 }}
          >✕</motion.button>
        </div>

        {/* ── Scrollable content ── */}
        <div className="hide-scrollbar" style={{ position: "relative", zIndex: 3, overflowY: "auto", flex: 1, padding: "0 0 24px" }}>

          {/* Hero band: Scrappy image + title */}
          <div style={{ position: "relative", overflow: "hidden", height: "clamp(160px,28vw,240px)", flexShrink: 0 }}>
            <motion.img
              src="/scrappy.avif"
              alt="Scrappy — Ferrailleur de la Rust Belt"
              initial={{ scale: 1.08, filter: "blur(4px)" }}
              animate={{ scale: 1, filter: "blur(0px)" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 30%", display: "block" }}
            />
            {/* Gradient overlay */}
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 30%, rgba(5,3,1,0.97) 100%)" }} />
            {/* Orange edge glow */}
            <motion.div
              animate={{ opacity: [0.4, 0.75, 0.4] }}
              transition={{ duration: 3, repeat: Infinity }}
              style={{ position: "absolute", inset: 0, boxShadow: "inset 0 0 60px rgba(249,115,22,0.18)", pointerEvents: "none" }}
            />
            {/* Title over image */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              style={{ position: "absolute", bottom: 20, left: 24, right: 24 }}
            >
              <div style={{ fontFamily: "monospace", fontSize: 8, letterSpacing: "0.4em", color: "rgba(249,115,22,0.6)", textTransform: "uppercase", marginBottom: 8 }}>▸ {lang === "fr" ? "TRANSMISSION SÉCURISÉE — SPERANZA" : "SECURE TRANSMISSION — SPERANZA"}</div>
              <h2 style={{ fontFamily: "'Orbitron',sans-serif", fontSize: "clamp(14px,2.2vw,22px)", fontWeight: 900, letterSpacing: "0.12em", color: "#fff", textShadow: "0 0 40px rgba(249,115,22,0.5)", margin: 0, lineHeight: 1.25 }}>
                {lang === "fr" ? <>Soutenez la Résistance :<br/><span style={{ color: "#fb923c" }}>Aidez à financer Mankind Rises</span></> : <>Support the Resistance:<br/><span style={{ color: "#fb923c" }}>Help fund Mankind Rises</span></>}
              </h2>
            </motion.div>
          </div>

          <div style={{ padding: "0 24px" }}>
            {/* Intro */}
            <motion.p
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.5 }}
              style={{ fontFamily: "Georgia,serif", fontStyle: "italic", fontSize: "clamp(13px,1.3vw,15px)", color: "rgba(215,202,185,0.72)", lineHeight: 1.85, margin: "20px 0 28px" }}
            >
              {lang === "fr"
                ? <>Mankind Rises est une web-série cinématique créée par des fans, 100&nbsp;% à but non lucratif, née d'une pure passion pour l'univers d'ARC Raiders. Notre objectif est simple&nbsp;: offrir à la communauté une histoire immersive et de haute qualité se déroulant dans le monde brutal et magnifique de la Rust Belt.</>
                : <>Mankind Rises is a fan-made cinematic web series, 100% non-profit, born from a pure passion for the ARC Raiders universe. Our goal is simple: give the community an immersive, high-quality story set in the brutal and beautiful world of the Rust Belt.</>
              }
            </motion.p>

            {/* Why we need help */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
              <div style={{ fontFamily: "monospace", fontSize: 8, letterSpacing: "0.36em", color: "rgba(249,115,22,0.45)", textTransform: "uppercase", marginBottom: 14 }}>▸ {lang === "fr" ? "POURQUOI NOUS AVONS BESOIN DE VOTRE AIDE" : "WHY WE NEED YOUR HELP"}</div>
              <p style={{ fontFamily: "Georgia,serif", fontStyle: "italic", fontSize: "clamp(12px,1.2vw,14px)", color: "rgba(200,185,165,0.65)", lineHeight: 1.85, marginBottom: 20 }}>
                {lang === "fr"
                  ? "Jusqu'à présent, ce projet a été entièrement auto-financé de ma propre poche. Donner vie à une série avant-gardiste en tant que réalisateur solo nécessite une utilisation massive d'outils avancés de génération vidéo et audio par IA. Vos dons ne seront jamais utilisés pour un profit personnel. Chaque dollar est directement réinvesti dans la production."
                  : "So far, this project has been entirely self-funded out of my own pocket. Bringing a cutting-edge series to life as a solo director requires massive use of advanced AI video and audio generation tools. Your donations will never be used for personal profit — every dollar goes directly back into production."
                }
              </p>
            </motion.div>

            {/* Cost sections */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 28 }}>
              {sections.map((s, i) => (
                <motion.div
                  key={s.title}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.08, duration: 0.4 }}
                  style={{ display: "flex", gap: 14, padding: "14px 16px", background: "rgba(249,115,22,0.04)", border: "1px solid rgba(249,115,22,0.1)", borderRadius: 8 }}
                >
                  <div style={{ fontFamily: "monospace", fontSize: 16, color: "rgba(249,115,22,0.5)", flexShrink: 0, lineHeight: 1.4 }}>{s.icon}</div>
                  <div>
                    <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: "clamp(9px,1vw,11px)", fontWeight: 700, letterSpacing: "0.16em", color: "#fb923c", textTransform: "uppercase", marginBottom: 6 }}>{s.title}</div>
                    <p style={{ fontFamily: "Georgia,serif", fontStyle: "italic", fontSize: "clamp(11px,1.1vw,13px)", color: "rgba(200,185,165,0.6)", lineHeight: 1.75, margin: 0 }}>{s.text}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Promise box */}
            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.85 }}
              style={{ position: "relative", padding: "20px 20px", marginBottom: 20, background: "rgba(249,115,22,0.06)", border: "1px solid rgba(249,115,22,0.25)", borderRadius: 10, overflow: "hidden" }}
            >
              <motion.div animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 3.5, repeat: Infinity }}
                style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 20% 50%, rgba(249,115,22,0.08) 0%, transparent 65%)", pointerEvents: "none" }}
              />
              <div style={{ fontFamily: "monospace", fontSize: 8, letterSpacing: "0.36em", color: "rgba(249,115,22,0.5)", textTransform: "uppercase", marginBottom: 12 }}>▸ {lang === "fr" ? "NOTRE PROMESSE" : "OUR PROMISE"}</div>
              <p style={{ fontFamily: "Georgia,serif", fontStyle: "italic", fontSize: "clamp(12px,1.2vw,14px)", color: "rgba(215,202,185,0.72)", lineHeight: 1.85, margin: "0 0 12px" }}>
                {lang === "fr"
                  ? <> Mankind Rises sera toujours <strong style={{ color: "#fb923c" }}>100&nbsp;% gratuit</strong> à regarder. Il n'y aura jamais de contenu payant. Nous sommes juste des fans qui créent de l'art pour les fans.</>
                  : <> Mankind Rises will always be <strong style={{ color: "#fb923c" }}>100% free</strong> to watch. There will never be any paid content. We are simply fans creating art for fans.</>
                }
              </p>
              <p style={{ fontFamily: "Georgia,serif", fontStyle: "italic", fontSize: "clamp(12px,1.2vw,14px)", color: "rgba(215,202,185,0.72)", lineHeight: 1.85, margin: 0 }}>
                {lang === "fr"
                  ? <> En guise d'immense remerciement, tous les donateurs verront leur nom immortalisé dans le générique de fin de nos prochains épisodes en tant que <strong style={{ color: "#fb923c" }}>"Ferrailleur Officiel de la Rust Belt"</strong>.</>
                  : <> As a huge thank-you, all donors will have their name immortalized in the end credits of our upcoming episodes as an official <strong style={{ color: "#fb923c" }}>"Rust Belt Scavenger"</strong>.</>
                }
              </p>
            </motion.div>

            {/* Closing note */}
            <motion.p
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
              style={{ fontFamily: "Georgia,serif", fontStyle: "italic", fontSize: "clamp(11px,1.1vw,13px)", color: "rgba(180,165,145,0.5)", lineHeight: 1.85, marginBottom: 28, textAlign: "center" }}
            >
              {lang === "fr"
                ? <>Si vous n'avez pas les moyens de faire un don, nous comprenons parfaitement.<br/>Survivre dans la Rust Belt est déjà assez difficile&nbsp;! Le simple fait de regarder, d'aimer et de partager nos épisodes est tout aussi précieux.</>
                : <>If you're not in a position to donate, we completely understand.<br/>Surviving the Rust Belt is already hard enough! Simply watching, liking and sharing our episodes means just as much.</>
              }
            </motion.p>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.05 }}
              style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}
            >
              {DONATION_LINK ? (
                <motion.a
                  href={DONATION_LINK} target="_blank" rel="noopener noreferrer"
                  className="btn-pulse"
                  whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                  style={{ display: "flex", alignItems: "center", gap: 10, padding: "13px 32px", background: "rgba(249,115,22,0.12)", border: "1px solid rgba(249,115,22,0.65)", borderRadius: 6, cursor: "pointer", fontFamily: "'Orbitron',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.22em", color: "#f97316", textDecoration: "none", clipPath: "polygon(12px 0%,100% 0%,calc(100% - 12px) 100%,0% 100%)", textTransform: "uppercase" }}
                >
                  <svg viewBox="0 0 16 16" style={{ width: 14, height: 14 }} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8 1.5C4.4 1.5 1.5 4.4 1.5 8S4.4 14.5 8 14.5 14.5 11.6 14.5 8 11.6 1.5 8 1.5z"/>
                    <path d="M8 5v3l2 2"/>
                  </svg>
                  {lang === "fr" ? "Soutenir la Production" : "Support the Production"}
                </motion.a>
              ) : (
                <div style={{ fontFamily: "monospace", fontSize: 9, letterSpacing: "0.3em", color: "rgba(249,115,22,0.35)", textTransform: "uppercase", textAlign: "center" }}>
                  {lang === "fr" ? "LIEN DE DON — BIENTÔT DISPONIBLE" : "DONATION LINK — COMING SOON"}<span className="cursor-blink" style={{ marginLeft: 4, color: "#f97316" }}>▌</span>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Local video path (served from /public). Set to "" to use YouTube instead.
const TEASER_VIDEO_PATH = "";
// YouTube video ID — used when TEASER_VIDEO_PATH is empty
const TEASER_VIDEO_ID = "mY14F1UiRJ8";

function TeaserModal({ onClose, lang }: { onClose: () => void; lang: Lang }) {
  const hasLocalVideo = TEASER_VIDEO_PATH.length > 0;
  const hasYouTube = !hasLocalVideo && TEASER_VIDEO_ID.length > 0;
  const hasVideo = hasLocalVideo || hasYouTube;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <motion.div
      key="teaser-modal"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 99500,
        background: "rgba(0,0,0,0.94)",
        backdropFilter: "blur(10px)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
    >
      {/* Panel */}
      <motion.div
        initial={{ scale: 0.86, rotateX: -18, y: 40, opacity: 0, filter: "blur(14px)" }}
        animate={{ scale: 1, rotateX: 0, y: 0, opacity: 1, filter: "blur(0px)" }}
        exit={{ scale: 0.9, rotateX: 12, y: -20, opacity: 0, filter: "blur(8px)" }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(900px, 92vw)",
          background: "rgba(6,4,2,0.97)",
          border: "1px solid rgba(249,115,22,0.55)",
          borderRadius: 14,
          overflow: "hidden",
          position: "relative",
          boxShadow: "0 0 80px rgba(249,115,22,0.18), 0 40px 80px rgba(0,0,0,0.7)",
          transformStyle: "preserve-3d",
          perspective: "1200px",
        }}
      >
        {/* ── HUD Header bar ── */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "10px 18px",
          borderBottom: "1px solid rgba(249,115,22,0.18)",
          background: "rgba(249,115,22,0.04)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <motion.div
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.2, repeat: Infinity }}
              style={{ width: 7, height: 7, borderRadius: "50%", background: "#f97316" }}
            />
            <span style={{ fontFamily: "monospace", fontSize: 8, letterSpacing: "0.42em", color: "rgba(249,115,22,0.65)", textTransform: "uppercase" }}>
              ARC RAIDERS: MANKIND RISES — EP.01 EXODUS
            </span>
          </div>
          <motion.button
            onClick={onClose}
            whileHover={{ scale: 1.15, color: "#f97316" }}
            whileTap={{ scale: 0.9 }}
            style={{ background: "none", border: "1px solid rgba(249,115,22,0.3)", borderRadius: 4, width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "rgba(249,115,22,0.6)", fontSize: 14, lineHeight: 1 }}
          >
            ✕
          </motion.button>
        </div>

        {/* ── Video area ── */}
        {hasVideo ? (
          <div style={{ position: "relative", paddingBottom: "56.25%", background: "#000" }}>
            {hasLocalVideo ? (
              <video
                src={TEASER_VIDEO_PATH}
                autoPlay
                controls
                playsInline
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", background: "#000" }}
              />
            ) : (
              <iframe
                src={`https://www.youtube.com/embed/${TEASER_VIDEO_ID}?autoplay=1&rel=0&modestbranding=1`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }}
              />
            )}
          </div>
        ) : (
          /* ── Coming soon state ── */
          <div style={{
            position: "relative",
            aspectRatio: "16/9",
            background: "rgba(4,3,1,0.98)",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            overflow: "hidden",
          }}>
            {/* Background grid */}
            <div style={{
              position: "absolute", inset: 0,
              backgroundImage: "linear-gradient(rgba(249,115,22,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(249,115,22,0.04) 1px,transparent 1px)",
              backgroundSize: "48px 48px",
            }} />
            {/* Radial vignette */}
            <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 70% 70% at 50% 50%,transparent 30%,rgba(0,0,0,0.75) 100%)" }} />
            {/* Ambient scan */}
            <motion.div
              animate={{ top: ["-2px","101%"] }}
              transition={{ duration: 5, repeat: Infinity, ease: "linear", repeatDelay: 2 }}
              style={{ position: "absolute", left: 0, right: 0, height: 2, background: "linear-gradient(90deg,transparent,rgba(249,115,22,0.4),transparent)", pointerEvents: "none" }}
            />

            {/* Play icon ring */}
            <motion.div
              animate={{ scale: [1,1.07,1], opacity: [0.6,1,0.6] }}
              transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
              style={{
                width: 80, height: 80, borderRadius: "50%",
                border: "1.5px solid rgba(249,115,22,0.45)",
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: 32, position: "relative", zIndex: 2,
                boxShadow: "0 0 40px rgba(249,115,22,0.15)",
              }}
            >
              <motion.div
                animate={{ scale: [1,1.12,1], opacity: [0.5,0.9,0.5] }}
                transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
                style={{ position: "absolute", inset: -14, borderRadius: "50%", border: "1px solid rgba(249,115,22,0.15)" }}
              />
              <svg viewBox="0 0 24 24" fill="rgba(249,115,22,0.7)" style={{ width: 28, height: 28, marginLeft: 4 }}>
                <path d="M5 3l14 9-14 9V3z"/>
              </svg>
            </motion.div>

            {/* Text */}
            <div style={{ position: "relative", zIndex: 2, textAlign: "center" }}>
              <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: "clamp(16px,2.5vw,26px)", fontWeight: 900, letterSpacing: "0.18em", color: "#f0e8d8", textTransform: "uppercase", marginBottom: 10 }}>
                {lang === "fr" ? "TEASER EN APPROCHE" : "TEASER INCOMING"}
              </div>
              <div style={{ fontFamily: "monospace", fontSize: 9, letterSpacing: "0.38em", color: "rgba(249,115,22,0.5)", marginBottom: 28 }}>
                {lang === "fr" ? "SIGNAL EN COURS DE TRANSMISSION" : "SIGNAL BEING TRANSMITTED"}
                <span className="cursor-blink" style={{ marginLeft: 4, color: "#f97316" }}>▌</span>
              </div>
              <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 28 }}>
                {[
                  lang === "fr" ? "> ÉPISODE 01 — EXODUS" : "> EPISODE 01 — EXODUS",
                  "> POST-PRODUCTION",
                  lang === "fr" ? "> TOLEDO, 2180" : "> TOLEDO, 2180",
                ].map((line, i) => (
                  <motion.div key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.2 }}
                    style={{ fontFamily: "monospace", fontSize: 8, letterSpacing: "0.16em", color: `rgba(249,115,22,${0.55 - i * 0.1})` }}
                  />
                ))}
              </div>
              {/* Terminal lines */}
              <div style={{ fontFamily: "monospace", fontSize: 8, letterSpacing: "0.16em", display: "flex", flexDirection: "column", gap: 6, alignItems: "center" }}>
                {[
                  lang === "fr" ? "> ÉPISODE 01 — EXODUS" : "> EPISODE 01 — EXODUS",
                  "> TOLEDO, SOUTH CALABRETTA — 2180",
                  "> POST-PRODUCTION EN COURS...",
                ].map((line, i) => (
                  <motion.div key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.25 }}
                    style={{ color: i === 0 ? "rgba(249,115,22,0.7)" : "rgba(249,115,22,0.38)" }}
                  >
                    {line}
                  </motion.div>
                ))}
              </div>
              {/* Follow button */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
                style={{ marginTop: 30 }}
              >
                <a
                  href="https://youtube.com/@arcraidersmankindrises?si=gBZQD3b1g7ekAD2H"
                  target="_blank" rel="noopener noreferrer"
                  style={{ textDecoration: "none" }}
                >
                  <motion.div
                    whileHover={{ scale: 1.05, boxShadow: "0 0 28px rgba(249,115,22,0.5)" }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 8,
                      padding: "10px 22px",
                      background: "rgba(249,115,22,0.12)",
                      border: "1px solid rgba(249,115,22,0.55)",
                      borderRadius: 4, cursor: "pointer",
                      clipPath: "polygon(12px 0%,100% 0%,calc(100% - 12px) 100%,0% 100%)",
                    }}
                  >
                    <svg viewBox="0 0 16 16" fill="#f97316" style={{ width: 11, height: 11 }}><path d="M2 2l12 6-12 6z"/></svg>
                    <span style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 8.5, fontWeight: 700, letterSpacing: "0.3em", color: "#f97316", textTransform: "uppercase" }}>
                      {lang === "fr" ? "SUIVRE SUR YOUTUBE" : "FOLLOW ON YOUTUBE"}
                    </span>
                  </motion.div>
                </a>
              </motion.div>
            </div>
          </div>
        )}

        {/* ── HUD footer ── */}
        <div style={{
          padding: "8px 18px", borderTop: "1px solid rgba(249,115,22,0.12)",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          background: "rgba(249,115,22,0.02)",
        }}>
          <span style={{ fontFamily: "monospace", fontSize: 7, letterSpacing: "0.3em", color: "rgba(249,115,22,0.28)", textTransform: "uppercase" }}>
            ARC RAIDERS: MANKIND RISES — FAN SERIES
          </span>
          <span style={{ fontFamily: "monospace", fontSize: 7, letterSpacing: "0.25em", color: "rgba(249,115,22,0.2)" }}>
            {lang === "fr" ? "APPUYEZ SUR ESC POUR FERMER" : "PRESS ESC TO CLOSE"}
          </span>
        </div>

        {/* Corner brackets */}
        <div style={{ position: "absolute", top: 0, left: 0, width: 18, height: 18, borderTop: "2px solid rgba(249,115,22,0.65)", borderLeft: "2px solid rgba(249,115,22,0.65)" }} />
        <div style={{ position: "absolute", top: 0, right: 0, width: 18, height: 18, borderTop: "2px solid rgba(249,115,22,0.65)", borderRight: "2px solid rgba(249,115,22,0.65)" }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, width: 18, height: 18, borderBottom: "2px solid rgba(249,115,22,0.65)", borderLeft: "2px solid rgba(249,115,22,0.65)" }} />
        <div style={{ position: "absolute", bottom: 0, right: 0, width: 18, height: 18, borderBottom: "2px solid rgba(249,115,22,0.65)", borderRight: "2px solid rgba(249,115,22,0.65)" }} />
      </motion.div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// GAME TRANSITION OVERLAY
// ═══════════════════════════════════════════════════════════════════════════════
function GameTransitionOverlay({ label, phase }: {
  label: string;
  phase: "in" | "hold" | "out";
}) {
  const chars = label.split("");
  const jawEase = [0.76, 0, 0.24, 1] as const;
  const revealEase = [0.16, 1, 0.3, 1] as const;

  const topY    = phase === "out" ? "-100%" : "0%";
  const botY    = phase === "out" ? "100%"  : "0%";
  const topDur  = phase === "out" ? 0.58 : 0.50;
  const botDur  = phase === "out" ? 0.58 : 0.52;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9850, pointerEvents: "none", overflow: "hidden" }}>

      {/* ── TOP JAW ── */}
      <motion.div
        initial={{ y: "-100%" }}
        animate={{ y: topY }}
        transition={{ y: { duration: topDur, ease: jawEase } }}
        style={{
          position: "absolute", left: 0, right: 0, top: 0,
          height: "51.5%",
          background: "#04040a",
          clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 calc(100% - 28px))",
          borderBottom: "none",
          willChange: "transform",
        }}
      >
        {/* inner grid */}
        <div style={{
          position: "absolute", inset: 0, opacity: 0.5,
          backgroundImage: "linear-gradient(rgba(249,115,22,0.055) 1px,transparent 1px),linear-gradient(90deg,rgba(249,115,22,0.055) 1px,transparent 1px)",
          backgroundSize: "56px 56px",
        }} />
        {/* radial gradient center glow */}
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse 80% 120% at 50% 100%,rgba(249,115,22,0.09) 0%,transparent 70%)",
        }} />
        {/* TL corner bracket */}
        <svg style={{ position:"absolute", top:14, left:16, opacity:0.65 }} width="28" height="28" viewBox="0 0 28 28" fill="none">
          <path d="M0 28 L0 0 L28 0" stroke="#f97316" strokeWidth="1.5"/>
        </svg>
        {/* TR corner bracket */}
        <svg style={{ position:"absolute", top:14, right:16, opacity:0.65 }} width="28" height="28" viewBox="0 0 28 28" fill="none">
          <path d="M28 28 L28 0 L0 0" stroke="#f97316" strokeWidth="1.5"/>
        </svg>
        {/* Horizontal rule at bottom */}
        <div style={{
          position: "absolute", bottom: 28, left: 0, right: 0, height: 1,
          background: "linear-gradient(90deg,transparent 0%,rgba(249,115,22,0.35) 20%,rgba(249,115,22,0.6) 50%,rgba(249,115,22,0.35) 80%,transparent 100%)",
        }} />
        {/* Status text TL */}
        <div style={{
          position: "absolute", top: 18, left: 54,
          fontFamily: "monospace", fontSize: 8, letterSpacing: "0.35em",
          color: "rgba(249,115,22,0.45)", textTransform: "uppercase",
        }}>
          SPERANZA NETWORK // SPERANZA-7
        </div>
        {/* Status text TR */}
        <div style={{
          position: "absolute", top: 18, right: 54,
          fontFamily: "monospace", fontSize: 8, letterSpacing: "0.3em",
          color: "rgba(249,115,22,0.35)", textTransform: "uppercase",
        }}>
          SECTION LOAD
        </div>
        {/* Side scan bar (right) */}
        <motion.div
          animate={phase !== "out" ? { opacity: [0.4, 0.9, 0.4] } : { opacity: 0 }}
          transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute", right: 0, top: 0, width: 2, height: "100%",
            background: "linear-gradient(to bottom,transparent,rgba(249,115,22,0.7),transparent)",
          }}
        />
      </motion.div>

      {/* ── BOTTOM JAW ── */}
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: botY }}
        transition={{ y: { duration: botDur, ease: jawEase, delay: phase === "in" ? 0.02 : 0 } }}
        style={{
          position: "absolute", left: 0, right: 0, bottom: 0,
          height: "51.5%",
          background: "#04040a",
          clipPath: "polygon(0 0, 100% 28px, 100% 100%, 0 100%)",
          willChange: "transform",
        }}
      >
        {/* inner grid */}
        <div style={{
          position: "absolute", inset: 0, opacity: 0.5,
          backgroundImage: "linear-gradient(rgba(249,115,22,0.055) 1px,transparent 1px),linear-gradient(90deg,rgba(249,115,22,0.055) 1px,transparent 1px)",
          backgroundSize: "56px 56px",
        }} />
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse 80% 120% at 50% 0%,rgba(249,115,22,0.09) 0%,transparent 70%)",
        }} />
        {/* BL corner bracket */}
        <svg style={{ position:"absolute", bottom:14, left:16, opacity:0.65 }} width="28" height="28" viewBox="0 0 28 28" fill="none">
          <path d="M0 0 L0 28 L28 28" stroke="#f97316" strokeWidth="1.5"/>
        </svg>
        {/* BR corner bracket */}
        <svg style={{ position:"absolute", bottom:14, right:16, opacity:0.65 }} width="28" height="28" viewBox="0 0 28 28" fill="none">
          <path d="M28 0 L28 28 L0 28" stroke="#f97316" strokeWidth="1.5"/>
        </svg>
        {/* Horizontal rule at top */}
        <div style={{
          position: "absolute", top: 28, left: 0, right: 0, height: 1,
          background: "linear-gradient(90deg,transparent 0%,rgba(249,115,22,0.35) 20%,rgba(249,115,22,0.6) 50%,rgba(249,115,22,0.35) 80%,transparent 100%)",
        }} />
        {/* Coord text BL */}
        <div style={{
          position: "absolute", bottom: 18, left: 54,
          fontFamily: "monospace", fontSize: 8, letterSpacing: "0.3em",
          color: "rgba(249,115,22,0.4)", textTransform: "uppercase",
        }}>
          TOLEDO — 2180.XX.XX
        </div>
        {/* Side scan bar (left) */}
        <motion.div
          animate={phase !== "out" ? { opacity: [0.4, 0.9, 0.4] } : { opacity: 0 }}
          transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut", delay: 0.45 }}
          style={{
            position: "absolute", left: 0, top: 0, width: 2, height: "100%",
            background: "linear-gradient(to top,transparent,rgba(249,115,22,0.7),transparent)",
          }}
        />
      </motion.div>

      {/* ── CENTER SEAM GLOW LINE ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: phase === "out" ? 0 : 1 }}
        transition={{ duration: 0.22, delay: phase === "in" ? 0.36 : 0 }}
        style={{
          position: "absolute", left: 0, right: 0,
          top: "calc(50% - 1px)", height: 2,
          background: "linear-gradient(90deg,transparent 0%,rgba(249,115,22,0.5) 15%,rgba(255,220,140,0.95) 50%,rgba(249,115,22,0.5) 85%,transparent 100%)",
          boxShadow: "0 0 18px rgba(249,115,22,0.8), 0 0 40px rgba(249,115,22,0.4)",
          zIndex: 5,
        }}
      />

      {/* ── SECTION NAME ── */}
      <AnimatePresence>
        {phase === "hold" && (
          <motion.div
            key="label"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, filter: "blur(6px)" }}
            transition={{ duration: 0.18 }}
            style={{
              position: "absolute", inset: 0, zIndex: 10,
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", gap: 14,
            }}
          >
            {/* Small prefix */}
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: revealEase }}
              style={{
                fontFamily: "monospace", fontSize: 9, letterSpacing: "0.55em",
                color: "rgba(249,115,22,0.6)", textTransform: "uppercase",
              }}
            >
              // ACCESSING //
            </motion.div>

            {/* Main label — character stagger */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.04em" }}>
              {chars.map((ch, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: -18, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ delay: 0.04 + i * 0.038, duration: 0.28, ease: revealEase }}
                  style={{
                    fontFamily: "'Orbitron', sans-serif",
                    fontSize: "clamp(26px, 4.5vw, 58px)",
                    fontWeight: 900,
                    letterSpacing: "0.18em",
                    color: "#fb923c",
                    textShadow: "0 0 32px rgba(249,115,22,0.85), 0 0 72px rgba(249,115,22,0.38)",
                    display: "inline-block",
                  }}
                >
                  {ch === " " ? "\u00A0" : ch}
                </motion.span>
              ))}
            </div>

            {/* Bottom rule */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.05 + chars.length * 0.038, duration: 0.38, ease: revealEase }}
              style={{
                width: "min(340px, 60vw)", height: 1,
                background: "linear-gradient(90deg,transparent,rgba(249,115,22,0.7),transparent)",
                transformOrigin: "center",
              }}
            />

            {/* Loading dots */}
            <div style={{ display: "flex", gap: 6 }}>
              {[0, 1, 2].map(i => (
                <motion.div key={i}
                  animate={{ opacity: [0.2, 1, 0.2] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.18, ease: "easeInOut" }}
                  style={{ width: 4, height: 4, borderRadius: "50%", background: "#f97316" }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── GLITCH SCAN SWEEP (entry flash) ── */}
      <AnimatePresence>
        {phase === "in" && (
          <motion.div
            key="glitch-sweep"
            initial={{ top: "-3px", opacity: 0 }}
            animate={{ top: "103%", opacity: [0, 1, 1, 0.4, 0] }}
            transition={{ duration: 0.38, ease: [0.4, 0, 0.6, 1] }}
            style={{
              position: "absolute", left: 0, right: 0, height: 3, zIndex: 20,
              background: "linear-gradient(90deg,transparent,#f97316,rgba(255,220,150,0.9),#f97316,transparent)",
              boxShadow: "0 0 22px rgba(249,115,22,1), 0 0 50px rgba(249,115,22,0.5)",
            }}
          />
        )}
      </AnimatePresence>

      {/* ── GLITCH FRAGMENTS (3 random horizontal strips) ── */}
      {phase === "in" && [0.12, 0.41, 0.73].map((pos, i) => (
        <motion.div
          key={i}
          initial={{ x: i % 2 === 0 ? "-100%" : "100%", opacity: 0.8 }}
          animate={{ x: "0%", opacity: 0 }}
          transition={{ duration: 0.28 + i * 0.06, ease: "easeOut" }}
          style={{
            position: "absolute", left: 0, right: 0, zIndex: 6,
            top: `${pos * 100}%`,
            height: `${6 + i * 3}px`,
            background: i === 1
              ? "rgba(64,192,255,0.22)"
              : "rgba(249,115,22,0.18)",
            clipPath: i % 2 === 0
              ? "polygon(0 0,100% 0,98% 100%,2% 100%)"
              : "polygon(2% 0,98% 0,100% 100%,0 100%)",
          }}
        />
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export default function Home() {
  const [lang, setLang]             = useState<Lang>("fr");
  const [isMobile, setIsMobile]       = useState(false);
  const [isLandscape, setIsLandscape] = useState(false);
  const [isWide, setIsWide]           = useState(true);
  const [mounted, setMounted]       = useState(false);
  const [introOk, setIntroOk]       = useState(false);
  const [hypeCount, setHypeCount]   = useState<number | null>(null);
  const [votes, setVotes]           = useState<{ lat: number; lng: number }[]>([]);
  const [hudCoords, setHudCoords]   = useState("48.8566°N 2.3522°E");
  const [activeChar, setActiveChar] = useState<CharData | null>(null);
  const [activePanel, setActivePanel] = useState<ActivePanel>(null);
  const [scanKey, setScanKey]       = useState(0);
  const [sidebarHovered, setSidebarHovered] = useState(false);
  const [panelFullW, setPanelFullW] = useState(420);
  const [panelTransition, setPanelTransition] = useState<{
    active: boolean; label: string; phase: "in" | "hold" | "out";
  }>({ active: false, label: "", phase: "in" });
  const [showTeaser, setShowTeaser]     = useState(false);
  const [showDonation, setShowDonation] = useState(false);

  const t = T[lang];

  const BG_MAP: Record<string, { src: string; pos: string; filt: string; tint: string }> = {
    default:    { src: "/hero-bg.png",       pos: "center top",    filt: "brightness(0.68) saturate(0.9)", tint: "transparent" },
    lore:       { src: "/bg-lore.jpg",       pos: "center center", filt: "brightness(0.52) saturate(0.8)", tint: "rgba(140,70,10,0.18)" },
    characters: { src: "/bg-characters.jpg", pos: "center center", filt: "brightness(0.55) saturate(0.85)",tint: "rgba(20,10,0,0.22)" },
    episodes:   { src: "/bg-episodes.jpg",   pos: "center center", filt: "brightness(0.5)  saturate(0.9)", tint: "rgba(10,10,20,0.25)" },
    soundtracks:{ src: "/bg-soundtracks.jpg",pos: "center center", filt: "brightness(0.52) saturate(0.88)",tint: "rgba(30,15,0,0.2)" },
    enlist:     { src: "/hero-bg.png",        pos: "center top",    filt: "brightness(0.38) saturate(0.7)", tint: "rgba(0,20,40,0.35)" },
    codex:      { src: "/bg-codex.jpg",        pos: "center center", filt: "brightness(0.38) saturate(0.72)", tint: "rgba(10,5,0,0.42)" },
  };
  const currentBg = BG_MAP[activePanel ?? "default"] ?? BG_MAP.default;

  const PANEL_TITLES: Record<string, string> = {
    lore:        lang === "fr" ? "LORE" : "LORE",
    characters:  lang === "fr" ? "PERSONNAGES" : "CHARACTERS",
    episodes:    lang === "fr" ? "ÉPISODES"    : "EPISODES",
    soundtracks: "SOUNDTRACKS",
    enlist:      lang === "fr" ? "S'ENRÔLER"      : "ENLIST",
    codex:       "CODEX",
  };

  // Collapsed sidebar width / expanded sidebar width
  const SIDEBAR_COLLAPSED = 70;
  const SIDEBAR_EXPANDED  = 280;
  const sidebarW = activePanel ? (sidebarHovered ? SIDEBAR_EXPANDED : SIDEBAR_COLLAPSED) : panelFullW;

  // Mouse parallax for home background — 3 depth layers
  const { x: mouseX, y: mouseY } = useMousePosition();
  const bgParX  = useSpring(useTransform(mouseX, [0, 1440], [-18, 18]), { stiffness: 32, damping: 24 });
  const bgParY  = useSpring(useTransform(mouseY, [0, 900],  [-11, 11]), { stiffness: 32, damping: 24 });
  const midParX = useSpring(useTransform(mouseX, [0, 1440], [-36, 36]), { stiffness: 42, damping: 20 });
  const midParY = useSpring(useTransform(mouseY, [0, 900],  [-22, 22]), { stiffness: 42, damping: 20 });
  const fgParX  = useSpring(useTransform(mouseX, [0, 1440], [-56, 56]), { stiffness: 55, damping: 18 });
  const fgParY  = useSpring(useTransform(mouseY, [0, 900],  [-34, 34]), { stiffness: 55, damping: 18 });

  useEffect(() => {
    setMounted(true);
    const w = window.innerWidth, h = window.innerHeight;
    setIsWide(w >= 768);
    setIsMobile(w < 640 || (w < 900 && h < 500));
    setIsLandscape(w < 900 && w > h && h < 500);
    setPanelFullW(Math.min(488, Math.max(300, w * 0.38)));
    if (sessionStorage.getItem("arc_intro")) setIntroOk(true);
    const storedLang = localStorage.getItem("arc_lang") as Lang | null;
    if (storedLang === "en" || storedLang === "fr") setLang(storedLang);

    fetch("/api/hype")
      .then((r) => r.json())
      .then((d) => { setHypeCount(d.count); setVotes(d.votes ?? []); })
      .catch(() => setHypeCount(0));

    const onResize = () => {
      const rw = window.innerWidth, rh = window.innerHeight;
      setIsWide(rw >= 768);
      setIsMobile(rw < 640 || (rw < 900 && rh < 500));
      setIsLandscape(rw < 900 && rw > rh && rh < 500);
      setPanelFullW(Math.min(488, Math.max(300, rw * 0.38)));
    };
    window.addEventListener("resize", onResize);

    const hud = setInterval(() => {
      setHudCoords(`${(48 + Math.random() * 0.004 - 0.002).toFixed(4)}°N ${(2.35 + Math.random() * 0.004 - 0.002).toFixed(4)}°E`);
    }, 3000);

    return () => { window.removeEventListener("resize", onResize); clearInterval(hud); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleLang = useCallback(() => {
    const next: Lang = lang === "en" ? "fr" : "en";
    setLang(next);
    localStorage.setItem("arc_lang", next);
  }, [lang]);

  const handleVote = useCallback(() => {
    fetch("/api/hype", { method: "POST" })
      .then((r) => r.json())
      .then((d) => setHypeCount(d.count))
      .catch(() => setHypeCount((c) => (c ?? 0) + 1));
  }, []);

  const changingPanel = useCallback((id: ActivePanel) => {
    const newPanel: ActivePanel = activePanel === id ? null : id;
    const labelMap: Partial<Record<NonNullable<ActivePanel>, { en: string; fr: string }>> = {
      lore:        { en: "LORE",            fr: "LORE"            },
      characters:  { en: "CHARACTERS",      fr: "PERSONNAGES"     },
      episodes:    { en: "EPISODES",        fr: "ÉPISODES"        },
      soundtracks: { en: "SOUNDTRACKS",     fr: "SOUNDTRACKS"     },
      enlist:      { en: "ENLIST",           fr: "S'ENRÔLER"       },
      codex:       { en: "CODEX",            fr: "CODEX"           },
    };
    const label = newPanel ? (labelMap[newPanel]?.[lang] ?? newPanel.toUpperCase()) : "HOME";

    setSidebarHovered(false);
    setPanelTransition({ active: true, label, phase: "in" });

    setTimeout(() => {
      setScanKey((k) => k + 1);
      setActivePanel(newPanel);
      setPanelTransition((t) => ({ ...t, phase: "hold" }));
    }, 560);

    setTimeout(() => setPanelTransition((t) => ({ ...t, phase: "out" })), 1560);
    setTimeout(() => setPanelTransition({ active: false, label: "", phase: "in" }), 2220);
  }, [activePanel, lang]);

  const menuItems = [
    { id: "lore"        as const, icon: BookOpen,  labelFr: "LORE",  labelEn: "LORE",  mobileFr: "LORE",  mobileEn: "LORE",  num: "01" },
    { id: "characters"  as const, icon: Shield,    labelFr: "PERSONNAGES", labelEn: "CHARACTERS", mobileFr: "PERSO", mobileEn: "SQUAD", num: "02" },
    { id: "episodes"    as const, icon: Film,      labelFr: "ÉPISODES",    labelEn: "EPISODES",   mobileFr: "VOIR",  mobileEn: "WATCH", num: "03" },
    { id: "soundtracks" as const, icon: Radio,     labelFr: "SOUNDTRACKS", labelEn: "SOUNDTRACKS",mobileFr: "OST",   mobileEn: "OST",   num: "04" },
    { id: "codex"       as const, icon: Database,  labelFr: "CODEX",       labelEn: "CODEX",      mobileFr: "CODEX", mobileEn: "CODEX", num: "05" },
  ];

  return (
    <>
      <div className="noise-overlay" aria-hidden />
      <div className="crt-lines"    aria-hidden />
      <div className="crt-vignette" aria-hidden />

      {mounted && <AmbientGlow />}
      {mounted && !introOk && <IntroScreen onComplete={() => setIntroOk(true)} />}

      <AnimatePresence>
        {activeChar && <CharModal char={activeChar} onClose={() => setActiveChar(null)} isWide={isWide} />}
      </AnimatePresence>

      {/* Teaser modal */}
      <AnimatePresence>
        {showTeaser && (
          <TeaserModal key="teaser" onClose={() => setShowTeaser(false)} lang={lang} />
        )}
      </AnimatePresence>

      {/* Donation modal */}
      <AnimatePresence>
        {showDonation && (
          <DonationModal key="donation" onClose={() => setShowDonation(false)} lang={lang} />
        )}
      </AnimatePresence>

      {/* Donation floating button — always visible */}
      {mounted && !(isMobile && !!activePanel) && (
        <motion.button
          onClick={() => setShowDonation(true)}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.2, duration: 0.4 }}
          whileHover={{ scale: 1.08, boxShadow: "0 0 28px rgba(249,115,22,0.55)" }}
          whileTap={{ scale: 0.92 }}
          title="Soutenir la production"
          style={{
            position: "fixed", bottom: 22, right: 18, zIndex: 9700,
            width: 52, height: 52, borderRadius: "50%",
            background: "rgba(5,3,1,0.92)",
            border: "1.5px solid rgba(249,115,22,0.55)",
            cursor: "pointer",
            padding: 0, overflow: "hidden",
            boxShadow: "0 0 18px rgba(249,115,22,0.25)",
          }}
        >
          {/* Pulse ring */}
          <motion.div
            animate={{ scale: [1, 1.55, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut" }}
            style={{ position: "absolute", inset: -4, borderRadius: "50%", border: "1.5px solid rgba(249,115,22,0.4)", pointerEvents: "none" }}
          />
          <img
            src="/scrappy.avif"
            alt="Soutenir"
            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", display: "block" }}
          />
        </motion.button>
      )}

      {/* Game transition overlay */}
      <AnimatePresence>
        {panelTransition.active && (
          <GameTransitionOverlay
            key="panel-transition"
            label={panelTransition.label}
            phase={panelTransition.phase}
          />
        )}
      </AnimatePresence>

      {/* Lang toggle */}
      <motion.button onClick={toggleLang}
        style={{ position: "fixed", top: 16, right: 16, zIndex: 9600, padding: "7px 14px", fontFamily: "'Orbitron',sans-serif", border: "1px solid rgba(255,150,80,0.28)", background: "rgba(0,0,0,0.75)", backdropFilter: "blur(10px)", clipPath: "polygon(7px 0%,100% 0%,calc(100% - 7px) 100%,0% 100%)", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
        whileHover={{ borderColor: "rgba(255,150,80,0.65)" }}
        whileTap={{ scale: 0.93 }}
      >
        <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.22em", color: lang === "en" ? "#fb923c" : "rgba(255,150,80,0.28)" }}>EN</span>
        <span style={{ fontSize: 8, color: "rgba(255,150,80,0.22)", lineHeight: 1 }}>|</span>
        <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.22em", color: lang === "fr" ? "#fb923c" : "rgba(255,150,80,0.28)" }}>FR</span>
      </motion.button>

      {/* ══════════════════════════════════════ FIXED HERO CONTAINER */}
      <div style={{ position: "fixed", inset: 0, overflow: "hidden", background: "#000" }}>

        {/* ── Background (morphs per section) ── */}
        <AnimatePresence mode="sync">
          <motion.div
            key={activePanel ?? "home"}
            initial={{ opacity: 0, scale: 1.07 }}
            animate={{
              opacity: 1,
              scale: 1,
              filter: activePanel
                ? [currentBg.filt]
                : [
                    "brightness(0.62) saturate(0.80) hue-rotate(-4deg)",
                    "brightness(0.72) saturate(1.05) hue-rotate(4deg)",
                    "brightness(0.65) saturate(0.88) hue-rotate(0deg)",
                    "brightness(0.72) saturate(1.05) hue-rotate(4deg)",
                    "brightness(0.62) saturate(0.80) hue-rotate(-4deg)",
                  ],
            }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={!activePanel ? {
              opacity:   { duration: 0.65, ease: "easeInOut" },
              scale:     { duration: 0.65, ease: "easeInOut" },
              filter:    { duration: 9, repeat: Infinity, ease: "easeInOut" },
            } : { duration: 0.65, ease: "easeInOut" }}
            style={{
              position: "absolute", inset: "-4% -3%",
              willChange: "transform, opacity, filter",
              overflow: "hidden",
              x: activePanel ? 0 : bgParX,
              y: activePanel ? 0 : bgParY,
            }}>
            <img
              src={activePanel
                ? currentBg.src
                : mounted && isMobile ? "/hero-bg-mobile.png" : "/hero-bg.png"}
              alt=""
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: activePanel ? currentBg.pos : "center center",
                display: "block",
              }}
            />
          </motion.div>
        </AnimatePresence>

        {/* ── Parallax mid layer — atmospheric glow drifts at 2× ── */}
        {!activePanel && (
          <motion.div
            style={{
              position: "absolute", inset: "-6% -5%",
              background: "radial-gradient(ellipse at 55% 55%, rgba(249,115,22,0.09) 0%, rgba(30,60,120,0.06) 45%, transparent 70%)",
              pointerEvents: "none", zIndex: 1,
              x: midParX, y: midParY,
            }}
          />
        )}

        {/* ── Parallax fg layer — vignette edge drifts at 3× ── */}
        {!activePanel && (
          <motion.div
            style={{
              position: "absolute", inset: "-8% -6%",
              background: "radial-gradient(ellipse at 50% 48%, transparent 30%, rgba(0,0,0,0.55) 75%, rgba(0,0,0,0.82) 100%)",
              pointerEvents: "none", zIndex: 2,
              x: fgParX, y: fgParY,
            }}
          />
        )}

        {/* Per-section tint overlay */}
        <AnimatePresence mode="sync">
          <motion.div
            key={(activePanel ?? "home") + "-tint"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
            style={{ position: "absolute", inset: 0, background: currentBg.tint, zIndex: 1, pointerEvents: "none" }}
          />
        </AnimatePresence>


        {/* Gradient overlays */}
        <motion.div
          animate={{ background: activePanel
            ? "linear-gradient(to bottom,rgba(0,0,0,0.78) 0%,rgba(0,0,0,0.38) 40%,rgba(0,0,0,0.65) 100%)"
            : "linear-gradient(90deg,rgba(0,0,0,0.94) 0%,rgba(0,0,0,0.7) 30%,rgba(0,0,0,0.22) 60%,rgba(0,0,0,0.04) 100%)"
          }}
          transition={{ duration: 0.7 }}
          style={{ position: "absolute", inset: 0 }}
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom,rgba(0,0,0,0.52) 0%,transparent 15%,transparent 80%,rgba(0,0,0,0.7) 100%)" }} />

        {/* Grid */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", backgroundImage: "linear-gradient(rgba(249,115,22,0.016) 1px,transparent 1px),linear-gradient(90deg,rgba(249,115,22,0.016) 1px,transparent 1px)", backgroundSize: "72px 72px", maskImage: "linear-gradient(90deg,black 0%,black 25%,transparent 60%)" }} />

        {/* Ambient scan line */}
        <motion.div
          style={{ position: "absolute", left: 0, right: 0, height: 1.5, background: "linear-gradient(90deg,transparent,rgba(255,150,80,0.32),rgba(255,210,120,0.5),rgba(255,150,80,0.32),transparent)", pointerEvents: "none", zIndex: 2 }}
          animate={{ top: ["-2px","100%"] }}
          transition={{ duration: 7, repeat: Infinity, ease: "linear", repeatDelay: 3 }}
        />

        {/* Transition scan wipe */}
        <AnimatePresence>
          {mounted && scanKey > 0 && (
            <motion.div key={scanKey}
              style={{ position: "absolute", left: 0, right: 0, height: 3, background: "linear-gradient(90deg,transparent,#f97316,rgba(255,220,150,0.92),#f97316,transparent)", zIndex: 75, boxShadow: "0 0 28px rgba(249,115,22,0.9),0 0 64px rgba(249,115,22,0.3)", pointerEvents: "none" }}
              initial={{ top: "-3px", opacity: 0 }}
              animate={{ top: "102%", opacity: [0, 1, 1, 0] }}
              transition={{ duration: 0.5, ease: [0.4, 0, 0.6, 1] }}
            />
          )}
        </AnimatePresence>

        {/* ── Ambient Light Breathing overlay (home only) ── */}
        {!activePanel && (
          <motion.div
            style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 8 }}
            animate={{
              background: [
                "radial-gradient(ellipse at 50% 60%, rgba(249,115,22,0.10) 0%, rgba(0,0,0,0) 65%)",
                "radial-gradient(ellipse at 50% 60%, rgba(80,160,255,0.07) 0%, rgba(0,0,0,0) 65%)",
                "radial-gradient(ellipse at 50% 60%, rgba(249,115,22,0.12) 0%, rgba(0,0,0,0) 65%)",
                "radial-gradient(ellipse at 50% 60%, rgba(80,160,255,0.07) 0%, rgba(0,0,0,0) 65%)",
                "radial-gradient(ellipse at 50% 60%, rgba(249,115,22,0.10) 0%, rgba(0,0,0,0) 65%)",
              ],
            }}
            transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
          />
        )}

        {mounted && <Particles count={activePanel ? 14 : 28} />}
        <HudCorner pos="tl" /><HudCorner pos="tr" /><HudCorner pos="bl" /><HudCorner pos="br" />

        {/* ── Last Update Widget — desktop right side ── */}
        <AnimatePresence>
          {mounted && !isMobile && !activePanel && (
            <div style={{ position: "absolute", right: 32, top: "50%", transform: "translateY(-50%)", zIndex: 55 }}>
              <motion.div
                key="last-update-desktop"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 30 }}
                transition={{ duration: 0.6, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
              >
                <RightHUD hypeCount={hypeCount} lang={lang} />
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ══════════════════════════════════════ LEFT SIDEBAR
            — Full panel when no section active
            — Collapses to icon strip (SIDEBAR_COLLAPSED px) when section opens
            — Hover expands to SIDEBAR_EXPANDED px showing icon + label
        */}
        <motion.div
          onMouseEnter={() => { if (activePanel) setSidebarHovered(true); }}
          onMouseLeave={() => setSidebarHovered(false)}
          animate={{ width: isMobile ? 0 : sidebarW, opacity: 1, x: 0 }}
          transition={{
            width:   { type: "spring", stiffness: 320, damping: 32, mass: 0.9 },
            opacity: { duration: 0.6, delay: 0.2 },
            x:       { duration: 0.75, delay: 0.1, ease: [0.16, 1, 0.3, 1] },
          }}
          initial={{ opacity: 0, x: -40 }}
          className="hide-scrollbar"
          style={{
            position: "absolute", left: 0, top: 0, bottom: 0,
            overflow: "hidden", zIndex: 50,
            background: activePanel
              ? "rgba(3,3,6,0.88)"
              : "transparent",
            backdropFilter: activePanel ? "blur(22px)" : "none",
            borderRight: activePanel ? "1px solid rgba(249,115,22,0.1)" : "none",
            transition: "background 0.5s, backdrop-filter 0.5s, border-color 0.5s",
          }}
        >
          <AnimatePresence mode="wait">

            {/* ─── FULL PANEL (home state) ─── */}
            {!activePanel && (
              <motion.div
                key="full"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -36, filter: "blur(4px)" }}
                transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                className="hide-scrollbar"
                style={{
                  display: "flex", flexDirection: "column",
                  justifyContent: isWide ? "center" : "flex-end",
                  padding: isWide ? "clamp(28px,4vh,56px) clamp(22px,3vw,46px)" : "20px 20px 88px",
                  height: "100%", overflowY: "auto", width: panelFullW,
                }}
              >
                {/* Logo */}
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }}
                  style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}
                >
                  <img src="/arc-raiders-logo.png" alt="ARC Raiders" style={{ height: "clamp(28px,3.5vw,40px)", width: "auto", filter: "drop-shadow(0 0 10px rgba(249,115,22,0.55))", opacity: 0.88 }} />
                  <div style={{ height: 1, width: "clamp(32px,4vw,52px)", background: "linear-gradient(90deg,rgba(249,115,22,0.55),transparent)" }} />
                </motion.div>

                {/* MANKIND RISES glitch title */}
                <motion.div initial={{ opacity: 0, y: 14, filter: "blur(8px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ delay: 0.55, duration: 0.7 }}
                  className="glitch-img"
                  style={{ width: "clamp(160px,24vw,320px)", aspectRatio: "1547/161", marginBottom: 24, filter: "drop-shadow(0 3px 18px rgba(0,0,0,0.95))" }}
                  aria-label="MANKIND RISES"
                />

                {/* Tagline */}
                <motion.div initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.68, duration: 0.6 }}
                  style={{ borderLeft: "2px solid rgba(249,115,22,0.65)", paddingLeft: 12, marginBottom: isWide ? 28 : 20 }}
                >
                  {t.tagline.split("\n").map((line, i) => (
                    <p key={i} style={{ fontFamily: "Georgia,serif", fontStyle: "italic", fontSize: "clamp(11px,1.3vw,13px)", lineHeight: 1.65, color: "rgba(215,202,185,0.7)", margin: 0 }}>{line}</p>
                  ))}
                </motion.div>

                {/* Menu items */}
                <div style={{ display: "flex", flexDirection: "column", gap: isWide ? 8 : 6, marginBottom: isWide ? 20 : 14 }}>
                  {menuItems.map((item, i) => (
                    <motion.div key={item.id}
                      initial={{ opacity: 0, x: -22 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.78 + i * 0.07, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <MenuItem icon={item.icon} label={lang === "fr" ? item.labelFr : item.labelEn} num={item.num} active={false} onClick={() => changingPanel(item.id)} />
                    </motion.div>
                  ))}
                </div>

                {/* CTA button */}
                <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.12, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>
                  <MagBtn>
                    <motion.button
                      onClick={() => changingPanel("enlist")}
                      style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "13px 20px", background: "rgba(249,115,22,0.07)", border: "1px solid rgba(249,115,22,0.48)", cursor: "pointer", fontFamily: "'Orbitron',sans-serif", fontSize: "clamp(8px,0.9vw,10px)", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#f97316", clipPath: "polygon(11px 0%,100% 0%,calc(100% - 11px) 100%,0% 100%)", position: "relative", overflow: "hidden" }}
                      whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(249,115,22,0.32)" }} whileTap={{ scale: 0.97 }}
                    >
                      <motion.div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.14),transparent)", transform: "skewX(-14deg)", pointerEvents: "none" }} animate={{ x: ["-150%","250%"] }} transition={{ duration: 2.8, repeat: Infinity, repeatDelay: 3.2 }} />
                      <span style={{ position: "relative", zIndex: 1, opacity: 0.55 }}>+</span>
                      <span style={{ position: "relative", zIndex: 1, flex: 1 }}>{t.joinBtn}</span>
                      <ArrowRight style={{ width: 13, height: 13, position: "relative", zIndex: 1, opacity: 0.65 }} />
                    </motion.button>
                  </MagBtn>
                </motion.div>

                {/* Bottom HUD (inside full panel) */}
                {mounted && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }}
                    style={{ position: "absolute", bottom: 52, left: "clamp(22px,3vw,46px)", display: "flex", alignItems: "center", gap: 7, pointerEvents: "none" }}
                  >
                    <motion.div style={{ width: 5, height: 5, borderRadius: "50%", background: "#22c55e" }} animate={{ opacity: [1,0.3,1], scale: [1,1.5,1] }} transition={{ duration: 2.2, repeat: Infinity }} />
                    <span style={{ fontFamily: "monospace", fontSize: 8, letterSpacing: "0.28em", color: "rgba(34,197,94,0.6)", textTransform: "uppercase" }}>SIGNAL // OK</span>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* ─── COLLAPSED ICON STRIP (section active) ─── */}
            {activePanel && (
              <motion.div
                key="collapsed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", height: "100%", padding: "0 11px", paddingTop: 24, paddingBottom: 24, gap: 0 }}
              >
                {/* Logo icon */}
                <motion.div
                  initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                  style={{ display: "flex", justifyContent: "center", alignItems: "center", width: "100%", marginBottom: 14, paddingLeft: sidebarHovered ? 0 : 0 }}
                >
                  <img src="/arc-raiders-logo.png" alt="ARC Raiders" style={{ height: 26, width: "auto", opacity: 0.75, filter: "drop-shadow(0 0 8px rgba(249,115,22,0.4))", flexShrink: 0 }} />
                  <AnimatePresence>
                    {sidebarHovered && (
                      <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.2 }}
                        className="glitch-img"
                        style={{ width: 110, aspectRatio: "1547/161", marginLeft: 10, flexShrink: 0 }}
                        aria-label="MANKIND RISES"
                      />
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Divider */}
                <div style={{ width: "100%", height: 1, background: "linear-gradient(90deg,rgba(249,115,22,0.22),transparent)", marginBottom: 14 }} />

                {/* Icon menu items */}
                <div style={{ display: "flex", flexDirection: "column", gap: 6, width: "100%", flex: 1 }}>
                  {menuItems.map((item, i) => (
                    <SidebarItem
                      key={item.id}
                      item={item}
                      isActive={activePanel === item.id}
                      sidebarHovered={sidebarHovered}
                      lang={lang}
                      onClick={() => changingPanel(item.id)}
                      delay={0.1 + i * 0.055}
                    />
                  ))}

                  {/* Enlist / CTA icon button */}
                  <SidebarEnlistBtn sidebarHovered={sidebarHovered} lang={lang} isActive={activePanel === "enlist"} onClick={() => changingPanel("enlist")} />
                </div>

                {/* Collapse hint (only when not hovered) */}
                <AnimatePresence>
                  {!sidebarHovered && (
                    <motion.div
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      style={{ display: "flex", justifyContent: "center", width: "100%", paddingTop: 16 }}
                    >
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                        {[0,1,2].map((i) => (
                          <motion.div key={i} style={{ width: 3, height: 3, borderRadius: "50%", background: "rgba(249,115,22,0.3)" }}
                            animate={{ opacity: [0.3, 0.8, 0.3] }} transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.25 }}
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

          </AnimatePresence>
        </motion.div>

        {/* ══════════════════════════════════════ CONTENT PANEL
            Starts at SIDEBAR_COLLAPSED when panel active, full width otherwise
        */}
        <AnimatePresence mode="wait">
          {activePanel && (
            <motion.div
              key={activePanel}
              initial={{ opacity: 0, x: 48, filter: "blur(14px)" }}
              animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, x: -24, filter: "blur(8px)" }}
              transition={{ duration: 0.5, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="hide-scrollbar"
              style={{
                position: "absolute",
                left: isMobile ? 0 : SIDEBAR_COLLAPSED,
                top: 0, right: 0, bottom: isMobile ? (isLandscape ? 40 : 56) : 0,
                overflowY: "auto",
                background: "linear-gradient(to right,rgba(0,0,0,0.7) 0%,rgba(0,0,0,0.32) 30%,rgba(0,0,0,0.55) 100%)",
              }}
            >
              {/* Section header bar */}
              <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "18px clamp(20px,3.5vw,52px) 14px", borderBottom: "1px solid rgba(249,115,22,0.08)", position: "sticky", top: 0, zIndex: 20, background: "rgba(0,0,0,0.52)", backdropFilter: "blur(18px)" }}>
                <div style={{ width: 2.5, height: 22, background: "linear-gradient(to bottom,transparent,#f97316,transparent)", flexShrink: 0 }} />
                <motion.span
                  key={activePanel}
                  initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.35, delay: 0.28 }}
                  style={{ fontFamily: "'Orbitron',sans-serif", fontSize: "clamp(11px,1.4vw,16px)", fontWeight: 900, letterSpacing: "0.35em", color: "rgba(249,115,22,0.88)", textTransform: "uppercase" }}
                >
                  {PANEL_TITLES[activePanel]}
                </motion.span>
                <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg,rgba(249,115,22,0.25),transparent)" }} />
                {mounted && (
                  <span style={{ fontFamily: "monospace", fontSize: 8, letterSpacing: "0.22em", color: "rgba(255,150,80,0.28)", textTransform: "uppercase", flexShrink: 0 }}>2180.XX.XX</span>
                )}
              </div>

              {/* Panel content */}
              <div style={{ padding: "clamp(22px,4vh,44px) clamp(20px,4vw,60px) 52px" }}>
                {activePanel === "lore"        && <LorePanel       t={t} lang={lang} onClose={() => changingPanel("lore")} />}
                {activePanel === "characters"  && <CharactersPanel t={t} onClose={() => changingPanel("characters")} setActiveChar={setActiveChar} />}
                {activePanel === "episodes"    && <EpisodesPanel   t={t} lang={lang} onClose={() => changingPanel("episodes")} onTeaser={() => setShowTeaser(true)} />}
                {activePanel === "soundtracks" && <SoundtrackPanel    onClose={() => changingPanel("soundtracks")} lang={lang} />}
                {activePanel === "enlist"      && <EnlistPanel lang={lang} onClose={() => changingPanel("enlist")} />}
                {activePanel === "codex"       && <CodexPanel lang={lang} onClose={() => changingPanel("codex")} hypeCount={hypeCount} votes={votes} onVote={handleVote} />}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ══════════════════════════════════════ MOBILE HOME OVERLAY — moved to fixed, see below */}
        <AnimatePresence>
          {mounted && isMobile && !activePanel && (
            <motion.div
              key="mobile-home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: 20, filter: "blur(8px)" }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="hide-scrollbar"
              style={{
                position: "fixed", inset: 0, zIndex: 9100,
                overflowY: "auto",
                display: "flex", flexDirection: "column",
                background: "linear-gradient(to bottom,rgba(0,0,0,0.18) 0%,rgba(0,0,0,0.62) 38%,rgba(0,0,0,0.94) 68%,rgba(0,0,0,0.98) 100%)",
              }}
            >
              {/* Top spacer — widget overlaid at bottom, no extra scroll */}
              <div style={{ flex: isLandscape ? "0 0 12vh" : "0 0 30vh", position: "relative", flexShrink: 0 }}>
                {!isLandscape && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.5 }}
                    style={{ position: "absolute", bottom: 10, left: 20, right: 88 }}
                  >
                    <LastUpdateWidget mobile />
                  </motion.div>
                )}
              </div>

              {/* Content card */}
              <div style={{ padding: isLandscape ? "0 24px 16px" : "0 24px 32px", display: "flex", flexDirection: "column", gap: 0 }}>
              {/* Logo row */}
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.5 }}
                  style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: isLandscape ? 10 : 18 }}
                >
                  <img src="/arc-raiders-logo.png" alt="ARC Raiders" style={{ height: 32, width: "auto", filter: "drop-shadow(0 0 12px rgba(249,115,22,0.6))", opacity: 0.9 }} />
                  <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg,rgba(249,115,22,0.45),transparent)" }} />
                </motion.div>

                {/* MANKIND RISES glitch title */}
                <motion.div initial={{ opacity: 0, y: 14, filter: "blur(8px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ delay: 0.28, duration: 0.6 }}
                  className="glitch-img"
                  style={{ width: "min(290px, 80vw)", aspectRatio: "1547/161", marginBottom: isLandscape ? 10 : 20, filter: "drop-shadow(0 3px 22px rgba(0,0,0,0.95))" }}
                  aria-label="MANKIND RISES"
                />

                {/* Tagline — hidden in landscape to save space */}
                {!isLandscape && (
                  <motion.div initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4, duration: 0.55 }}
                    style={{ borderLeft: "2px solid rgba(249,115,22,0.6)", paddingLeft: 12, marginBottom: 28 }}
                  >
                    {t.tagline.split("\n").map((line: string, i: number) => (
                      <p key={i} style={{ fontFamily: "Georgia,serif", fontStyle: "italic", fontSize: 12, lineHeight: 1.6, color: "rgba(215,202,185,0.68)", margin: 0 }}>{line}</p>
                    ))}
                  </motion.div>
                )}

                {/* Menu grid — 2 cols portrait / 3 cols landscape */}
                <div style={{ display: "grid", gridTemplateColumns: isLandscape ? "repeat(3, 1fr)" : "1fr 1fr", gap: isLandscape ? 6 : 8, marginBottom: isLandscape ? 8 : 16 }}>
                  {menuItems.map((item, i) => (
                    <motion.button
                      key={item.id}
                      onClick={() => changingPanel(item.id)}
                      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.48 + i * 0.06, duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
                      whileTap={{ scale: 0.95 }}
                      style={{
                        display: "flex", alignItems: "center", gap: 10,
                        padding: isLandscape ? "8px 10px" : "12px 14px",
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(249,115,22,0.22)",
                        borderRadius: 8, cursor: "pointer",
                        position: "relative", overflow: "hidden",
                      }}
                    >
                      <item.icon style={{ width: 15, height: 15, color: "#f97316", flexShrink: 0 }} />
                      <span style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "0.2em", color: "rgba(240,230,215,0.82)", textTransform: "uppercase", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {lang === "fr" ? item.labelFr : item.labelEn}
                      </span>
                      <span style={{ position: "absolute", top: 6, right: 8, fontFamily: "monospace", fontSize: 8, color: "rgba(249,115,22,0.35)" }}>{item.num}</span>
                    </motion.button>
                  ))}
                </div>

                {/* ENLIST CTA */}
                <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.82, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}>
                  <motion.button
                    onClick={() => changingPanel("enlist")}
                    whileTap={{ scale: 0.97 }}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 10, width: "100%",
                      padding: isLandscape ? "9px 20px" : "15px 20px",
                      background: "rgba(249,115,22,0.1)",
                      border: "1px solid rgba(249,115,22,0.55)",
                      borderRadius: 8, cursor: "pointer",
                      fontFamily: "'Orbitron',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.22em",
                      textTransform: "uppercase", color: "#f97316",
                      position: "relative", overflow: "hidden",
                      boxShadow: "0 0 24px rgba(249,115,22,0.18)",
                    }}
                  >
                    <motion.div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.1),transparent)", pointerEvents: "none" }} animate={{ x: ["-150%","250%"] }} transition={{ duration: 2.8, repeat: Infinity, repeatDelay: 2.8 }} />
                    <span style={{ position: "relative", zIndex: 1 }}>{t.joinBtn}</span>
                    <ArrowRight style={{ width: 14, height: 14, position: "relative", zIndex: 1, opacity: 0.7 }} />
                  </motion.button>
                </motion.div>

                {/* Signal status */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }}
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, marginTop: 18, pointerEvents: "none" }}
                >
                  <motion.div style={{ width: 5, height: 5, borderRadius: "50%", background: "#22c55e" }} animate={{ opacity: [1,0.3,1], scale: [1,1.5,1] }} transition={{ duration: 2.2, repeat: Infinity }} />
                  <span style={{ fontFamily: "monospace", fontSize: 8, letterSpacing: "0.28em", color: "rgba(34,197,94,0.5)", textTransform: "uppercase" }}>SIGNAL // OK</span>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ══════════════════════════════════════ MOBILE BOTTOM NAV + FAB */}
        <AnimatePresence>
          {mounted && isMobile && !!activePanel && (
            <motion.div
              key="mobile-nav"
              initial={{ opacity: 0, y: 80 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 80 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              style={{
                position: "fixed", bottom: 0, left: 0, right: 0,
                height: isLandscape ? 40 : 56,
                zIndex: 9200,
                background: "rgba(3,3,6,0.97)",
                borderTop: "1px solid rgba(249,115,22,0.16)",
                backdropFilter: "blur(24px)",
                display: "flex", alignItems: "stretch",
                overflow: "visible",
              }}
            >
              {/* ── LEFT GROUP: HOME + lore + characters ── */}
              <div style={{ display: "flex", flex: 1, alignItems: "stretch" }}>
                <button onClick={() => changingPanel(activePanel)} style={{
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: isLandscape ? 1 : 3,
                  flex: 1, padding: "0 2px", background: "none", border: "none",
                  borderRight: "1px solid rgba(249,115,22,0.07)", cursor: "pointer",
                }}>
                  <svg viewBox="0 0 14 14" style={{ width: isLandscape ? 11 : 13, height: isLandscape ? 11 : 13 }} fill="none" stroke="rgba(249,115,22,0.62)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 6.5L7 1l6 5.5" /><path d="M2.5 5.5V12h3V8.5h3V12h3V5.5" />
                  </svg>
                  {!isLandscape && <span style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 6, fontWeight: 700, letterSpacing: "0.14em", color: "rgba(249,115,22,0.52)", textTransform: "uppercase" }}>HOME</span>}
                </button>
                {menuItems.slice(0, 2).map((item) => {
                  const isAct = activePanel === item.id;
                  return (
                    <button key={item.id} onClick={() => changingPanel(item.id)} style={{
                      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: isLandscape ? 1 : 3,
                      flex: 1, padding: "0 2px",
                      background: isAct ? "rgba(249,115,22,0.07)" : "none",
                      border: "none", borderRight: "1px solid rgba(249,115,22,0.07)",
                      cursor: "pointer", position: "relative",
                    }}>
                      {isAct && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg,transparent,#f97316,transparent)" }} />}
                      <item.icon style={{ width: isLandscape ? 11 : 13, height: isLandscape ? 11 : 13, color: isAct ? "#f97316" : "rgba(200,185,168,0.32)" }} />
                      {!isLandscape && <span style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 6, fontWeight: 700, letterSpacing: "0.12em", color: isAct ? "#f97316" : "rgba(200,185,168,0.3)", textTransform: "uppercase", whiteSpace: "nowrap" }}>
                        {lang === "fr" ? item.mobileFr : item.mobileEn}
                      </span>}
                    </button>
                  );
                })}
              </div>

              {/* ── CENTER SPACER ── */}
              <div style={{ flex: "0 0 64px", position: "relative", pointerEvents: "none" }} />

              {/* ── RIGHT GROUP: episodes + soundtracks + codex + enlist ── */}
              <div style={{ display: "flex", flex: 1, alignItems: "stretch" }}>
                {menuItems.slice(2).map((item) => {
                  const isAct = activePanel === item.id;
                  return (
                    <button key={item.id} onClick={() => changingPanel(item.id)} style={{
                      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: isLandscape ? 1 : 3,
                      flex: 1, padding: "0 2px",
                      background: isAct ? "rgba(249,115,22,0.07)" : "none",
                      border: "none", borderLeft: "1px solid rgba(249,115,22,0.07)",
                      cursor: "pointer", position: "relative",
                    }}>
                      {isAct && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg,transparent,#f97316,transparent)" }} />}
                      <item.icon style={{ width: isLandscape ? 11 : 13, height: isLandscape ? 11 : 13, color: isAct ? "#f97316" : "rgba(200,185,168,0.32)" }} />
                      {!isLandscape && <span style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 6, fontWeight: 700, letterSpacing: "0.12em", color: isAct ? "#f97316" : "rgba(200,185,168,0.3)", textTransform: "uppercase", whiteSpace: "nowrap" }}>
                        {lang === "fr" ? item.mobileFr : item.mobileEn}
                      </span>}
                    </button>
                  );
                })}
                <button onClick={() => changingPanel("enlist")} style={{
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: isLandscape ? 1 : 3,
                  flex: 1, padding: "0 2px",
                  background: activePanel === "enlist" ? "rgba(249,115,22,0.07)" : "none",
                  border: "none", borderLeft: "1px solid rgba(249,115,22,0.07)",
                  cursor: "pointer", position: "relative",
                }}>
                  {activePanel === "enlist" && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg,transparent,#f97316,transparent)" }} />}
                  <ArrowRight style={{ width: isLandscape ? 11 : 13, height: isLandscape ? 11 : 13, color: activePanel === "enlist" ? "#f97316" : "rgba(200,185,168,0.32)" }} />
                  {!isLandscape && <span style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 6, fontWeight: 700, letterSpacing: "0.12em", color: activePanel === "enlist" ? "#f97316" : "rgba(200,185,168,0.3)", textTransform: "uppercase" }}>
                    {lang === "fr" ? "CORPS" : "JOIN"}
                  </span>}
                </button>
              </div>

              {/* ── FAB: Donation button centered in nav ── */}
              <div style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                pointerEvents: "none",
                zIndex: 20,
              }}>
                <motion.div
                  animate={{ y: showDonation ? -96 : 0 }}
                  transition={{ type: "spring", stiffness: 260, damping: 22, mass: 0.9 }}
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}
                >
                  {/* Outer pulse ring */}
                  <motion.div
                    animate={{ scale: [1, 1.7, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2.8, repeat: Infinity, ease: "easeOut" }}
                    style={{ position: "absolute", width: 70, height: 70, borderRadius: "50%", border: "1.5px solid rgba(249,115,22,0.45)", pointerEvents: "none" }}
                  />
                  {/* Inner pulse ring */}
                  <motion.div
                    animate={{ scale: [1, 1.35, 1], opacity: [0.3, 0, 0.3] }}
                    transition={{ duration: 2.8, repeat: Infinity, ease: "easeOut", delay: 0.7 }}
                    style={{ position: "absolute", width: 60, height: 60, borderRadius: "50%", border: "1px solid rgba(249,115,22,0.28)", pointerEvents: "none" }}
                  />

                  {/* Button */}
                  <motion.button
                    onClick={() => setShowDonation(true)}
                    whileTap={{ scale: 0.86, rotate: -6 }}
                    animate={{
                      y: [0, -5, 0],
                      boxShadow: [
                        "0 0 18px rgba(249,115,22,0.38), 0 6px 24px rgba(0,0,0,0.9)",
                        "0 0 32px rgba(249,115,22,0.65), 0 10px 32px rgba(0,0,0,0.95)",
                        "0 0 18px rgba(249,115,22,0.38), 0 6px 24px rgba(0,0,0,0.9)",
                      ],
                    }}
                    transition={{
                      y: { duration: 2.8, repeat: Infinity, ease: "easeInOut" },
                      boxShadow: { duration: 2.8, repeat: Infinity, ease: "easeInOut" },
                    }}
                    style={{
                      width: isLandscape ? 36 : 52, height: isLandscape ? 36 : 52, borderRadius: "50%",
                      border: "1.5px solid rgba(249,115,22,0.68)",
                      background: "rgba(5,3,1,0.98)",
                      cursor: "pointer", padding: 0, overflow: "hidden",
                      position: "relative", zIndex: 1, pointerEvents: "auto",
                    }}
                  >
                    {/* Inner accent ring */}
                    <div style={{ position: "absolute", inset: 2.5, borderRadius: "50%", border: "1px solid rgba(249,115,22,0.22)", zIndex: 2, pointerEvents: "none" }} />
                    {/* Shimmer sweep */}
                    <motion.div
                      animate={{ x: ["-160%", "260%"] }}
                      transition={{ duration: 3.8, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" }}
                      style={{ position: "absolute", inset: 0, background: "linear-gradient(105deg,transparent 25%,rgba(255,255,255,0.2) 50%,transparent 75%)", zIndex: 3, pointerEvents: "none", borderRadius: "50%" }}
                    />
                    <img src="/scrappy.avif" alt="Soutenir" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", display: "block" }} />
                  </motion.button>
                </motion.div>
              </div>

            </motion.div>
          )}
        </AnimatePresence>

        {/* ══════════════════════════════════════ BOTTOM HUD (home state only) */}
        <AnimatePresence>
          {mounted && !activePanel && (
            <motion.div key="hud" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 20 }}>
              <div style={{ position: "absolute", bottom: 16, right: 22, display: "flex", alignItems: "center", gap: 7 }}>
                <span style={{ fontFamily: "monospace", fontSize: 8, letterSpacing: "0.22em", color: "rgba(255,150,80,0.32)", textTransform: "uppercase" }}>EST. 2180</span>
                <svg viewBox="0 0 16 16" style={{ width: 11, height: 11, opacity: 0.3 }} fill="none" stroke="rgba(255,150,80,0.8)" strokeWidth="1.1"><circle cx="8" cy="8" r="6.5"/><ellipse cx="8" cy="8" rx="3.5" ry="6.5"/><line x1="1.5" y1="8" x2="14.5" y2="8"/></svg>
              </div>

              {isWide && (
                <div style={{ position: "absolute", top: 20, left: 22, fontFamily: "monospace", fontSize: 9, letterSpacing: "0.22em", color: "rgba(255,150,80,0.38)", lineHeight: 2.2 }}>
                  <div className="hud-blink">[2180.XX.XX] — SIGNAL: {lang === "fr" ? "ACTIF" : "ACTIVE"}</div>
                  <div style={{ color: "rgba(255,150,80,0.2)" }}>COORD: {hudCoords}</div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── HOME mini button (visible only when a panel is open, desktop only) ── */}
        <AnimatePresence>
          {mounted && !!activePanel && !isMobile && (
            <motion.div
              key="home-btn"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
              style={{ position: "absolute", top: 58, ...(isMobile ? { left: 12 } : { right: 22 }), zIndex: 200 }}
            >
              <motion.button
                onClick={() => changingPanel(activePanel)}
                whileHover={{ scale: 1.06, boxShadow: "0 0 20px rgba(249,115,22,0.4)" }}
                whileTap={{ scale: 0.93 }}
                style={{
                  display: "flex", alignItems: "center", gap: 7,
                  padding: "7px 13px",
                  background: "rgba(6,4,1,0.75)",
                  border: "1px solid rgba(249,115,22,0.35)",
                  borderRadius: 4,
                  cursor: "pointer",
                  clipPath: "polygon(7px 0%,100% 0%,calc(100% - 7px) 100%,0% 100%)",
                  backdropFilter: "blur(10px)",
                  position: "relative", overflow: "hidden",
                }}
              >
                <svg viewBox="0 0 14 14" style={{ width: 10, height: 10, flexShrink: 0 }} fill="none" stroke="rgba(249,115,22,0.8)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 6.5L7 1l6 5.5" /><path d="M2.5 5.5V12h3V8.5h3V12h3V5.5" />
                </svg>
                <span style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 7.5, fontWeight: 700, letterSpacing: "0.22em", color: "rgba(249,115,22,0.85)", textTransform: "uppercase" }}>
                  HOME
                </span>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        {mounted && !activePanel && (
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "4px 20px 6px", textAlign: "center", zIndex: 15, background: "linear-gradient(transparent,rgba(0,0,0,0.6))", pointerEvents: "none" }}>
            <p style={{ color: "rgba(70,65,60,0.55)", fontSize: 9, fontFamily: "monospace", lineHeight: 1.5 }}>{t.footerDisclaimer}</p>
          </div>
        )}
      </div>
    </>
  );
}
