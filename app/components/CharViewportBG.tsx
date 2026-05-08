"use client";
import { useRef, useEffect } from "react";

function hexToRgb(hex: string) {
  const h = hex.replace("#", "");
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

interface Spark {
  x: number; y: number; vx: number; vy: number;
  r: number; age: number; life: number; cold: boolean;
}

export default function CharViewportBG({ color }: { color: string }) {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const rafRef     = useRef<number>(0);
  const colorRef   = useRef(color);
  colorRef.current = color;

  useEffect(() => {
    const canvas = canvasRef.current;
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

    const floorTex = new Image();
    floorTex.src = "/floor-texture.png";

    const makeSpark = (W: number, H: number): Spark => {
      const cold = Math.random() < 0.38;
      return {
        x: W*0.3 + Math.random()*W*0.4,
        y: H*0.72 + Math.random()*H*0.22,
        vx: (Math.random()-0.5)*(cold?0.4:0.28),
        vy: -(cold?0.12+Math.random()*0.5:0.06+Math.random()*0.22),
        r: cold?0.4+Math.random()*0.7:0.5+Math.random()*1.0,
        age:0, life:cold?120+Math.random()*200:200+Math.random()*380, cold,
      };
    };

    const sparks: Spark[] = Array.from({length:110}, ()=>{ const s=makeSpark(canvas.width,canvas.height); s.age=Math.random()*s.life; return s; });
    const t0 = performance.now();

    const tick = (now: number) => {
      const W = canvas.width, H = canvas.height;
      const t = (now - t0) / 1000;
      const {r:cr,g:cg,b:cb} = hexToRgb(colorRef.current.startsWith("#")?colorRef.current:"#f97316");
      const CA = (a:number)=>`rgba(${cr},${cg},${cb},${a.toFixed(3)})`;
      const CC = (a:number)=>`rgba(80,220,255,${a.toFixed(3)})`;

      ctx.clearRect(0,0,W,H);

      const vx        = W*0.5;
      const floorY    = H*0.63;
      const footY     = H*0.87;
      const pulse     = 0.5+0.5*Math.sin(t*0.72);
      const pulseFast = 0.5+0.5*Math.sin(t*2.1);

      // ── DARK BASE ─────────────────────────────────────────────────────────
      ctx.fillStyle="rgba(5,7,10,1)"; ctx.fillRect(0,0,W,H);

      // ── FLOOR TEXTURE ─────────────────────────────────────────────────────
      if (floorTex.complete && floorTex.naturalWidth>0) {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(vx-W*0.275,floorY); ctx.lineTo(vx+W*0.275,floorY);
        ctx.lineTo(W,H); ctx.lineTo(0,H); ctx.closePath(); ctx.clip();
        ctx.globalAlpha=0.35;
        ctx.drawImage(floorTex,0,floorY,W,H-floorY);
        ctx.globalAlpha=1;
        ctx.restore();
      }
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(vx-W*0.275,floorY); ctx.lineTo(vx+W*0.275,floorY);
      ctx.lineTo(W,H); ctx.lineTo(0,H); ctx.closePath(); ctx.clip();
      const fg=ctx.createLinearGradient(0,floorY,0,H);
      fg.addColorStop(0,"rgba(8,10,16,0.82)"); fg.addColorStop(1,"rgba(4,4,6,0.88)");
      ctx.fillStyle=fg; ctx.fillRect(0,floorY,W,H-floorY);
      ctx.restore();

      // ── WORN CONCRETE GRID ────────────────────────────────────────────────
      ctx.save(); ctx.beginPath(); ctx.rect(0,floorY,W,H-floorY); ctx.clip();
      for (let i=-12;i<=12;i++) {
        const xFar=vx+(i/12)*W*1.55, xNear=vx+(i/12)*W*0.42;
        const op=(1-Math.abs(i)/12*0.88)*0.07; if(op<0.006) continue;
        ctx.beginPath(); ctx.moveTo(xFar,floorY); ctx.lineTo(xNear,H);
        ctx.strokeStyle=`rgba(100,120,160,${op.toFixed(3)})`; ctx.lineWidth=0.4; ctx.stroke();
      }
      for (let i=1;i<=14;i++) {
        const p=i/14, y=floorY+(H-floorY)*Math.pow(p,0.35);
        const hw=W*0.42*p+W*1.55*(1-p);
        ctx.beginPath(); ctx.moveTo(Math.max(0,vx-hw),y); ctx.lineTo(Math.min(W,vx+hw),y);
        ctx.strokeStyle=`rgba(100,120,160,${(0.025+p*0.055).toFixed(3)})`; ctx.lineWidth=0.35; ctx.stroke();
      }
      ctx.restore();

      // ── ARC ENERGY GROUND RINGS ───────────────────────────────────────────
      for (let ring=0;ring<3;ring++) {
        const phase=((t/2.8+ring*0.33)%1+1)%1;
        const rx=Math.max(0, phase*W*0.48), ry=rx*0.14;
        const op=(1-phase)*(0.65+pulseFast*0.15);
        ctx.beginPath(); ctx.ellipse(vx,footY,rx,ry,0,0,Math.PI*2);
        ctx.strokeStyle=CC(op); ctx.lineWidth=1.5*(1-phase*0.7); ctx.stroke();
      }
      const arcCore=ctx.createRadialGradient(vx,footY,0,vx,footY,W*0.18);
      arcCore.addColorStop(0,CC(0.35+pulse*0.15)); arcCore.addColorStop(1,CC(0));
      ctx.fillStyle=arcCore; ctx.fillRect(vx-W*0.22,footY-H*0.06,W*0.44,H*0.1);

      // ── HORIZON LINE ──────────────────────────────────────────────────────
      const hg=ctx.createLinearGradient(0,0,W,0);
      hg.addColorStop(0,CC(0)); hg.addColorStop(0.15,CC(0.08));
      hg.addColorStop(0.5,CC(0.35+pulse*0.1)); hg.addColorStop(0.85,CC(0.08)); hg.addColorStop(1,CC(0));
      ctx.beginPath(); ctx.moveTo(0,floorY); ctx.lineTo(W,floorY);
      ctx.strokeStyle=hg; ctx.lineWidth=1.2; ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0,floorY); ctx.lineTo(W,floorY);
      ctx.strokeStyle=CC(0.055); ctx.lineWidth=9; ctx.stroke();

      // ── WARM FLOOR POOL ───────────────────────────────────────────────────
      const pool=ctx.createRadialGradient(vx,footY,0,vx,footY,W*0.5);
      pool.addColorStop(0,`rgba(255,160,45,${(0.18+pulse*0.06).toFixed(3)})`);
      pool.addColorStop(0.5,`rgba(255,130,30,${(0.05+pulse*0.02).toFixed(3)})`);
      pool.addColorStop(1,"rgba(0,0,0,0)");
      ctx.fillStyle=pool; ctx.fillRect(0,floorY,W,H-floorY);
      const contact=ctx.createRadialGradient(vx,footY+2,0,vx,footY+2,W*0.12);
      contact.addColorStop(0,CA(0.60+pulse*0.18)); contact.addColorStop(1,CA(0));
      ctx.fillStyle=contact; ctx.fillRect(vx-W*0.16,footY-H*0.05,W*0.32,H*0.1);

      // ── SPARKS ────────────────────────────────────────────────────────────
      ctx.save(); ctx.globalCompositeOperation="screen";
      for (const s of sparks) {
        s.age++;
        if (s.age>=s.life||s.y<H*0.48||s.x<-4||s.x>W+4) { Object.assign(s,makeSpark(W,H)); s.age=0; continue; }
        s.vx+=(Math.random()-0.5)*(s.cold?0.006:0.003); s.vx*=0.994; s.vy*=0.998; s.x+=s.vx; s.y+=s.vy;
        const lt=s.age/s.life, fade=lt<0.08?lt/0.08:lt>0.72?(1-lt)/0.28:1;
        if (s.cold) {
          const op=0.55*fade; if(op<0.01) continue;
          const bv=200+Math.round(fade*55);
          ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2);
          ctx.fillStyle=`rgba(${Math.round(bv*0.38)},${Math.round(bv*0.88)},${bv},${op.toFixed(3)})`; ctx.fill();
        } else {
          const op=0.38*fade; if(op<0.01) continue;
          const bv=180+Math.round(fade*50);
          ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2);
          ctx.fillStyle=`rgba(${bv},${Math.round(bv*0.55)},${Math.round(bv*0.15)},${op.toFixed(3)})`; ctx.fill();
        }
      }
      ctx.globalCompositeOperation="source-over"; ctx.restore();

      // ── ATMOSPHERIC BACK-GLOW ─────────────────────────────────────────────
      const ag=ctx.createRadialGradient(vx,H*0.34,0,vx,H*0.34,H*0.52);
      ag.addColorStop(0,CA(0.030+pulse*0.016)); ag.addColorStop(1,CA(0));
      ctx.fillStyle=ag; ctx.fillRect(0,0,W,H);

      // ── CEILING SPOTLIGHT ─────────────────────────────────────────────────
      const lx=vx+W*0.03*Math.sin(t*0.16), sW=W*0.28;
      const spotG=ctx.createLinearGradient(0,0,0,H*0.68);
      spotG.addColorStop(0,`rgba(255,210,110,${(0.052+pulse*0.016).toFixed(3)})`);
      spotG.addColorStop(0.42,"rgba(255,185,70,0.010)"); spotG.addColorStop(1,"rgba(0,0,0,0)");
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(lx-sW*0.06,0); ctx.lineTo(lx+sW*0.06,0);
      ctx.lineTo(lx+sW,H*0.68); ctx.lineTo(lx-sW,H*0.68);
      ctx.closePath(); ctx.fillStyle=spotG; ctx.fill();
      ctx.restore();

      // ── VHS CHROMATIC ABERRATION ──────────────────────────────────────────
      const cw=W*0.22;
      const cL=ctx.createLinearGradient(0,0,cw,0);
      cL.addColorStop(0,"rgba(255,30,20,0.022)"); cL.addColorStop(1,"rgba(0,0,0,0)");
      ctx.fillStyle=cL; ctx.fillRect(0,0,cw,H);
      const cR=ctx.createLinearGradient(W-cw,0,W,0);
      cR.addColorStop(0,"rgba(0,0,0,0)"); cR.addColorStop(1,"rgba(0,210,255,0.018)");
      ctx.fillStyle=cR; ctx.fillRect(W-cw,0,cw,H);

      // ── VIGNETTE ──────────────────────────────────────────────────────────
      const vg=ctx.createRadialGradient(vx,H*0.46,H*0.1,vx,H*0.46,H*0.92);
      vg.addColorStop(0,"rgba(0,0,0,0)"); vg.addColorStop(0.7,"rgba(0,0,0,0.18)"); vg.addColorStop(1,"rgba(0,0,0,0.88)");
      ctx.fillStyle=vg; ctx.fillRect(0,0,W,H);

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(rafRef.current); ro.disconnect(); };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position:"absolute", inset:0, width:"100%", height:"100%", zIndex:4, pointerEvents:"none" }}
    />
  );
}
