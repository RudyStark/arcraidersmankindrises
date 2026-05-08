"use client";
import { useRef, useEffect } from "react";

// Canvas 2D dust — screen blend mode = zero halos on dark bg
// screen formula: result = 1-(1-src)(1-dst). On near-black dst≈0, result≈src.
// Overlapping particles add luminosity naturally, exactly like real dust.

export default function DustFX() {
  const ref = useRef<HTMLCanvasElement>(null);
  const raf = useRef<number>(0);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width  = canvas.offsetWidth  || 600;
      canvas.height = canvas.offsetHeight || 800;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    interface Mote {
      x: number; y: number;
      vx: number; vy: number;
      radius: number;
      age: number; life: number;
      bright: number; // 0–1
      layer: number;  // 0=bg 1=mid 2=fg
    }

    const make = (): Mote => {
      const W = canvas.width; const H = canvas.height;
      const layer = Math.random() < 0.52 ? 0 : Math.random() < 0.62 ? 1 : 2;
      const spd   = 0.03 + layer * 0.045 + Math.random() * 0.055;
      return {
        x:      Math.random() * W,
        y:      H * 0.48 + Math.random() * H * 0.52,
        vx:     (Math.random() - 0.5) * spd * 0.55,
        vy:     -(spd * 0.5 + Math.random() * spd),
        radius: 0.35 + Math.random() * 0.55 + layer * 0.12,
        age:    0,
        life:   240 + Math.random() * 440,
        bright: 0.52 + Math.random() * 0.42,
        layer,
      };
    };

    const motes: Mote[] = Array.from({ length: 320 }, () => {
      const m = make();
      m.age = Math.random() * m.life;
      return m;
    });

    const tick = () => {
      const W = canvas.width; const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      // ── screen blend: particles add light without creating halos ──
      ctx.globalCompositeOperation = "screen";

      for (const m of motes) {
        m.age++;
        if (m.age >= m.life || m.y < -4 || m.x < -4 || m.x > W + 4) {
          Object.assign(m, make()); m.age = 0; continue;
        }

        // Brownian micro-turbulence
        m.vx += (Math.random() - 0.5) * 0.004;
        m.vy += (Math.random() - 0.5) * 0.002;
        m.vx *= 0.993;
        m.vy *= 0.999;
        m.x  += m.vx;
        m.y  += m.vy;

        // Smooth lifecycle opacity
        const t    = m.age / m.life;
        const fade = t < 0.1 ? t / 0.1 : t > 0.8 ? (1 - t) / 0.2 : 1;

        // Max opacity per layer — very conservative so char stays visible
        const maxOp = m.layer === 0 ? 0.14
                    : m.layer === 1 ? 0.28
                    :                 0.42;
        const op = maxOp * fade * m.bright;
        if (op < 0.008) continue;

        // Warm sandy tones — R > G > B
        const b  = Math.round(m.bright * 215);
        const cr = b;
        const cg = Math.round(b * 0.84);
        const cb = Math.round(b * 0.64);

        // Single crisp circle — NO gradient, NO shadow = NO halo
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${cr},${cg},${cb},${op.toFixed(3)})`;
        ctx.fill();
      }

      ctx.globalCompositeOperation = "source-over";
      raf.current = requestAnimationFrame(tick);
    };

    raf.current = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf.current); ro.disconnect(); };
  }, []);

  return (
    <canvas
      ref={ref}
      style={{
        position: "absolute", inset: 0,
        width: "100%", height: "100%",
        zIndex: 17, pointerEvents: "none",
      }}
    />
  );
}
