"use client";

import { useEffect, useRef, useState } from "react";
import { geoOrthographic, geoPath, GeoPermissibleObjects } from "d3-geo";
import { feature } from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";

interface VoteLocation {
  lat: number;
  lng: number;
}

// Cache topology so it's fetched only once
let topoCache: Topology | null = null;

export default function WorldMap({ votes }: { votes: VoteLocation[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rotRef    = useRef<[number, number, number]>([-20, -20, 0]);
  const isDraggingRef = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const rafRef    = useRef<number>(0);
  const worldRef  = useRef<GeoPermissibleObjects | null>(null);
  const votesRef  = useRef(votes);
  const [isDragging, setIsDragging] = useState(false);

  // Keep votesRef in sync without restarting the loop
  useEffect(() => { votesRef.current = votes; }, [votes]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const SIZE   = canvas.width;
    const cx     = SIZE / 2;
    const cy     = SIZE / 2;
    const radius = SIZE / 2 - 2;

    const projection = geoOrthographic()
      .scale(radius)
      .translate([cx, cy])
      .clipAngle(90);

    const pathGen = geoPath(projection);

    const draw = (ctx: CanvasRenderingContext2D) => {
      ctx.clearRect(0, 0, SIZE, SIZE);

      projection.rotate(rotRef.current);

      // ── Ocean background ────────────────────────────────────────────────────
      const grad = ctx.createRadialGradient(cx * 0.76, cy * 0.64, 0, cx, cy, radius);
      grad.addColorStop(0, "#12151f");
      grad.addColorStop(1, "#06080d");

      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      // ── Globe border (rim) ──────────────────────────────────────────────────
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(249,115,22,0.18)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // ── Graticule ──────────────────────────────────────────────────────────
      const graticule: GeoPermissibleObjects = {
        type: "FeatureCollection",
        features: [] as GeoPermissibleObjects[],
      } as unknown as GeoPermissibleObjects;

      // Simple lat/lng grid lines via d3 graticule
      ctx.save();
      ctx.strokeStyle = "rgba(249,115,22,0.07)";
      ctx.lineWidth = 0.4;
      for (let lat = -80; lat <= 80; lat += 20) {
        const pts: [number, number][] = [];
        for (let lng = -180; lng <= 180; lng += 2) {
          const p = projection([lng, lat]);
          if (p) pts.push(p);
        }
        if (pts.length > 1) {
          ctx.beginPath();
          ctx.moveTo(pts[0][0], pts[0][1]);
          pts.forEach(p => ctx.lineTo(p[0], p[1]));
          ctx.stroke();
        }
      }
      for (let lng = -180; lng <= 180; lng += 20) {
        const pts: [number, number][] = [];
        for (let lat = -90; lat <= 90; lat += 2) {
          const p = projection([lng, lat]);
          if (p) pts.push(p);
        }
        if (pts.length > 1) {
          ctx.beginPath();
          ctx.moveTo(pts[0][0], pts[0][1]);
          pts.forEach(p => ctx.lineTo(p[0], p[1]));
          ctx.stroke();
        }
      }
      ctx.restore();

      // ── Continents ─────────────────────────────────────────────────────────
      if (worldRef.current) {
        // Fill
        ctx.save();
        ctx.beginPath();
        const p2d = pathGen.context(ctx);
        p2d(worldRef.current);
        ctx.fillStyle = "rgba(249,115,22,0.06)";
        ctx.fill();
        ctx.restore();

        // Stroke with glow
        ctx.save();
        ctx.shadowColor  = "#fb923c";
        ctx.shadowBlur   = 8;
        ctx.strokeStyle  = "#fb923c";
        ctx.lineWidth    = 0.6;
        ctx.beginPath();
        const p2dStroke = pathGen.context(ctx);
        p2dStroke(worldRef.current);
        ctx.stroke();
        // Second pass — tighter brighter core
        ctx.shadowBlur  = 2;
        ctx.lineWidth   = 0.35;
        ctx.strokeStyle = "rgba(255,200,100,0.9)";
        ctx.beginPath();
        const p2dCore = pathGen.context(ctx);
        p2dCore(worldRef.current);
        ctx.stroke();
        ctx.restore();
      }

      // ── Vote dots ──────────────────────────────────────────────────────────
      votesRef.current.forEach(vote => {
        const proj = projection([vote.lng, vote.lat]);
        if (!proj) return;
        const [x, y] = proj;

        // Check if on visible hemisphere (dot product with view center)
        const [rotLng, rotLat] = rotRef.current;
        const viewLng = -rotLng * Math.PI / 180;
        const viewLat = -rotLat * Math.PI / 180;
        const voteLng = vote.lng * Math.PI / 180;
        const voteLat = vote.lat * Math.PI / 180;
        const dot =
          Math.cos(viewLat) * Math.cos(voteLat) * Math.cos(voteLng - viewLng) +
          Math.sin(viewLat) * Math.sin(voteLat);
        if (dot < 0) return; // behind the globe

        ctx.save();
        ctx.shadowColor = "#3b82f6";
        ctx.shadowBlur  = 12;
        ctx.beginPath();
        ctx.arc(x, y, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = "#60a5fa";
        ctx.fill();
        // white core
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.arc(x, y, 1.2, 0, Math.PI * 2);
        ctx.fillStyle = "#fff";
        ctx.fill();
        ctx.restore();
      });

      // ── Rim light ──────────────────────────────────────────────────────────
      const rimGrad = ctx.createRadialGradient(cx, cy, radius * 0.82, cx, cy, radius);
      rimGrad.addColorStop(0, "transparent");
      rimGrad.addColorStop(1, "rgba(249,115,22,0.22)");
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fillStyle = rimGrad;
      ctx.fill();
    };

    let lastTime = performance.now();
    let ctx: CanvasRenderingContext2D | null = null;

    const animate = (time: number) => {
      if (!ctx) ctx = canvas.getContext("2d");
      if (!ctx) return;

      const delta = time - lastTime;
      lastTime = time;

      if (!isDraggingRef.current) {
        rotRef.current = [
          rotRef.current[0] + 0.007 * delta, // horizontal uniquement
          rotRef.current[1],                  // phi figé — pas de dérive verticale
          rotRef.current[2],
        ];
      }

      draw(ctx);
      rafRef.current = requestAnimationFrame(animate);
    };

    const loadAndStart = async () => {
      if (!topoCache) {
        const res = await fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json");
        topoCache = await res.json() as Topology;
      }
      worldRef.current = feature(
        topoCache,
        (topoCache.objects as Record<string, GeometryCollection>).countries
      ) as unknown as GeoPermissibleObjects;

      rafRef.current = requestAnimationFrame(animate);
    };

    loadAndStart();
    return () => cancelAnimationFrame(rafRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
      rotRef.current[0] + dx * 0.4,  // droite → montre droite
      rotRef.current[1] - dy * 0.4,  // haut → montre nord
      rotRef.current[2],
    ];
    dragStart.current = { x, y };
  };

  const stopDrag = () => {
    isDraggingRef.current = false;
    setIsDragging(false);
  };

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 240,
        margin: "0 auto",
        cursor: isDragging ? "grabbing" : "grab",
      }}
      onMouseDown={(e) => startDrag(e.clientX, e.clientY)}
      onMouseMove={(e) => moveDrag(e.clientX, e.clientY)}
      onMouseUp={stopDrag}
      onMouseLeave={stopDrag}
      onTouchStart={(e) => startDrag(e.touches[0].clientX, e.touches[0].clientY)}
      onTouchMove={(e) => { e.preventDefault(); moveDrag(e.touches[0].clientX, e.touches[0].clientY); }}
      onTouchEnd={stopDrag}
    >
      <canvas
        ref={canvasRef}
        width={500}
        height={500}
        style={{ width: "100%", height: "auto", display: "block" }}
      />
    </div>
  );
}
