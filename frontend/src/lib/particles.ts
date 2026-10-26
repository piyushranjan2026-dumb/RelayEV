/**
 * RelayEV Canvas Particle Burst & Confetti Engine
 * Pure Canvas API - Zero External Dependencies
 */

export function triggerCyberParticles(originX?: number, originY?: number, theme: "emerald" | "electric" | "solar" = "emerald") {
  if (typeof window === "undefined") return;

  const canvas = document.createElement("canvas");
  canvas.style.position = "fixed";
  canvas.style.top = "0";
  canvas.style.left = "0";
  canvas.style.width = "100vw";
  canvas.style.height = "100vh";
  canvas.style.pointerEvents = "none";
  canvas.style.zIndex = "99999";
  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    canvas.remove();
    return;
  }

  const dpr = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  ctx.scale(dpr, dpr);

  const startX = originX !== undefined ? originX : window.innerWidth / 2;
  const startY = originY !== undefined ? originY : window.innerHeight / 2;

  const colors = theme === "solar"
    ? ["#fbbf24", "#f59e0b", "#10b981", "#34d399", "#fef08a"]
    : theme === "electric"
    ? ["#06b6d4", "#3b82f6", "#8b5cf6", "#38bdf8", "#ffffff"]
    : ["#10b981", "#34d399", "#059669", "#6ee7b7", "#a7f3d0"];

  interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    color: string;
    alpha: number;
    decay: number;
    gravity: number;
    shape: "circle" | "spark" | "rect";
  }

  const particleCount = 48;
  const particles: Particle[] = [];

  for (let i = 0; i < particleCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 2.5 + Math.random() * 6.5;
    particles.push({
      x: startX,
      y: startY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 2.0,
      size: 2.5 + Math.random() * 3.5,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: 1.0,
      decay: 0.015 + Math.random() * 0.02,
      gravity: 0.18,
      shape: Math.random() > 0.4 ? "circle" : "spark",
    });
  }

  let animationFrame: number;
  const render = () => {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    let activeCount = 0;
    for (const p of particles) {
      if (p.alpha <= 0.01) continue;
      activeCount++;

      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.vx *= 0.98;
      p.alpha -= p.decay;

      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 8;

      if (p.shape === "circle") {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Spark line
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - p.vx * 2, p.y - p.vy * 2);
        ctx.lineWidth = p.size;
        ctx.strokeStyle = p.color;
        ctx.stroke();
      }
      ctx.restore();
    }

    if (activeCount > 0) {
      animationFrame = requestAnimationFrame(render);
    } else {
      cancelAnimationFrame(animationFrame);
      canvas.remove();
    }
  };

  animationFrame = requestAnimationFrame(render);
}
