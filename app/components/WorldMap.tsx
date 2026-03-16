"use client";

import { useState, useEffect, useRef } from "react";
import { ComposableMap, Geographies, Geography, Marker, Sphere, Graticule } from "react-simple-maps";

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

interface VoteLocation {
  lat: number;
  lng: number;
}

export default function WorldMap({ votes }: { votes: VoteLocation[] }) {
  const [rotation, setRotation] = useState<[number, number, number]>([-20, -20, 0]);
  const [isDragging, setIsDragging] = useState(false);

  // Refs — no stale closures, no effect re-creation
  const rotRef = useRef<[number, number, number]>([-20, -20, 0]);
  const isDraggingRef = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number>(0);

  // Single rAF loop — runs once, never re-created
  useEffect(() => {
    let lastTime = performance.now();

    const animate = (time: number) => {
      const delta = time - lastTime;
      lastTime = time;

      if (!isDraggingRef.current) {
        rotRef.current = [
          rotRef.current[0] - 0.007 * delta, // ~7°/sec
          rotRef.current[1],
          rotRef.current[2],
        ];
        setRotation([...rotRef.current]);
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const startDrag = (x: number, y: number) => {
    isDraggingRef.current = true;
    setIsDragging(true);
    dragStart.current = { x, y };
  };

  const moveDrag = (x: number, y: number) => {
    if (!isDraggingRef.current) return;
    const dx = x - dragStart.current.x;
    const dy = y - dragStart.current.y;
    rotRef.current = [
      rotRef.current[0] - dx * 0.4,
      rotRef.current[1] + dy * 0.4,
      rotRef.current[2],
    ];
    setRotation([...rotRef.current]);
    dragStart.current = { x, y };
  };

  const stopDrag = () => {
    isDraggingRef.current = false;
    setIsDragging(false);
  };

  return (
    <div
      style={{ width: "100%", maxWidth: 480, margin: "0 auto", cursor: isDragging ? "grabbing" : "grab" }}
      onMouseDown={(e) => startDrag(e.clientX, e.clientY)}
      onMouseMove={(e) => moveDrag(e.clientX, e.clientY)}
      onMouseUp={stopDrag}
      onMouseLeave={stopDrag}
      onTouchStart={(e) => startDrag(e.touches[0].clientX, e.touches[0].clientY)}
      onTouchMove={(e) => moveDrag(e.touches[0].clientX, e.touches[0].clientY)}
      onTouchEnd={stopDrag}
    >
      <ComposableMap
        projection="geoOrthographic"
        projectionConfig={{ rotate: rotation, scale: 220 }}
        width={500}
        height={500}
        style={{ width: "100%", height: "auto", display: "block" }}
      >
        <defs>
          <radialGradient id="globe-bg" cx="38%" cy="32%" r="65%">
            <stop offset="0%" stopColor="#12151f" />
            <stop offset="100%" stopColor="#06080d" />
          </radialGradient>

          <filter id="continent-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur-wide" />
            <feColorMatrix
              in="blur-wide" type="matrix"
              values="1 0.5 0 0 0  0.4 0.2 0 0 0  0 0 0 0 0  0 0 0 0.8 0"
              result="orange-halo"
            />
            <feGaussianBlur in="SourceGraphic" stdDeviation="0.8" result="blur-tight" />
            <feMerge>
              <feMergeNode in="orange-halo" />
              <feMergeNode in="blur-tight" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="dot-glow" x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3.5" result="blur" />
            <feColorMatrix
              in="blur" type="matrix"
              values="0 0 0 0 0.2  0 0 0 0 0.5  1 1 1 0 1  0 0 0 1.5 0"
              result="blue-glow"
            />
            <feMerge>
              <feMergeNode in="blue-glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <radialGradient id="rim-light" cx="50%" cy="50%" r="50%">
            <stop offset="82%" stopColor="transparent" />
            <stop offset="100%" stopColor="rgba(249,115,22,0.18)" />
          </radialGradient>
        </defs>

        <Sphere id="ocean" fill="url(#globe-bg)" stroke="rgba(249,115,22,0.12)" strokeWidth={0.8} />
        <Graticule stroke="rgba(249,115,22,0.06)" strokeWidth={0.4} />

        <Geographies geography={GEO_URL}>
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                fill="rgba(249,115,22,0.05)"
                stroke="#fb923c"
                strokeWidth={0.55}
                filter="url(#continent-glow)"
                style={{
                  default: { outline: "none" },
                  hover:   { outline: "none" },
                  pressed: { outline: "none" },
                }}
              />
            ))
          }
        </Geographies>

        {votes.map((vote, i) => (
          <Marker key={i} coordinates={[vote.lng, vote.lat]}>
            <circle r={5} fill="rgba(59,130,246,0.2)" filter="url(#dot-glow)" />
            <circle r={2.5} fill="#60a5fa" />
            <circle r={1} fill="#fff" />
          </Marker>
        ))}

        <Sphere id="rim" fill="url(#rim-light)" stroke="none" strokeWidth={0} />
      </ComposableMap>
    </div>
  );
}
