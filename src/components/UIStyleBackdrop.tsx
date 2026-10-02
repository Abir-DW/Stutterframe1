import React, { useEffect, useRef } from 'react';
import { useSettings } from '../context/SettingsContext';

interface UIStyleBackdropProps {
  currentRoute: string;
}

export const UIStyleBackdrop: React.FC<UIStyleBackdropProps> = ({ currentRoute }) => {
  const { uiStyle } = useSettings();
  const matrixCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const particleCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const staticCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // 1. THE MATRIX: Real-time Green Digital Rain Canvas
  useEffect(() => {
    if (uiStyle !== 'matrix-code') return;

    const canvas = matrixCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const characters = '0123456789ABCDEFﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍ';
    const fontSize = 14;
    const columns = Math.floor(width / fontSize);
    const drops: number[] = [];

    for (let i = 0; i < columns; i++) {
      drops[i] = Math.floor(Math.random() * -100);
    }

    let lastTime = 0;
    const interval = 45;

    const render = (currentTime: number) => {
      animationFrameId = requestAnimationFrame(render);
      if (currentTime - lastTime < interval) return;
      lastTime = currentTime;

      ctx.fillStyle = 'rgba(2, 6, 4, 0.12)';
      ctx.fillRect(0, 0, width, height);

      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = characters.charAt(Math.floor(Math.random() * characters.length));
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        if (Math.random() > 0.85) {
          ctx.fillStyle = '#a7f3d0';
        } else {
          ctx.fillStyle = 'rgba(16, 185, 129, 0.7)';
        }

        ctx.fillText(text, x, y);

        if (y > height && Math.random() > 0.985) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [uiStyle]);

  // 2. OBSESSION: Real-time Analog TV Static Noise Canvas
  useEffect(() => {
    if (uiStyle !== 'obsession') return;

    const canvas = staticCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    // Lower resolution for fast grain rendering
    const w = (canvas.width = Math.min(window.innerWidth / 2, 600));
    const h = (canvas.height = Math.min(window.innerHeight / 2, 400));

    const imgData = ctx.createImageData(w, h);
    const buffer32 = new Uint32Array(imgData.data.buffer);

    let lastTime = 0;
    const interval = 50; // ~20fps vintage TV static

    const render = (currentTime: number) => {
      animId = requestAnimationFrame(render);
      if (currentTime - lastTime < interval) return;
      lastTime = currentTime;

      const len = buffer32.length;
      for (let i = 0; i < len; i++) {
        if (Math.random() > 0.88) {
          // Black, dark gray, or white static grain
          const val = Math.random() > 0.5 ? 255 : 40;
          buffer32[i] = (255 << 24) | (val << 16) | (val << 8) | val;
        } else {
          buffer32[i] = 0;
        }
      }

      ctx.putImageData(imgData, 0, 0);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [uiStyle]);

  // 3. DYNAMIC PARTICLES ENGINE (Dune spice, Avatar spores, Batman rain & flying bats, Interstellar stars, Busan fog)
  useEffect(() => {
    const supportedStyles = ['dune', 'avatar', 'batman', 'interstellar', 'train-to-busan'];
    if (!supportedStyles.includes(uiStyle)) return;

    const canvas = particleCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Particle types
    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      alpha: number;
      color: string;
      wobble?: number;
      z?: number; // for 3D stars
    }

    interface Bat {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      wingAngle: number;
      wingSpeed: number;
    }

    const particles: Particle[] = [];
    const bats: Bat[] = [];

    if (uiStyle === 'batman') {
      // Rain streaks
      for (let i = 0; i < 60; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: -1.4,
          vy: 14 + Math.random() * 8,
          size: 14 + Math.random() * 16,
          alpha: 0.18 + Math.random() * 0.22,
          color: '#e2e8f0',
        });
      }
      // Animated bats flying in night sky
      for (let i = 0; i < 7; i++) {
        bats.push({
          x: Math.random() * width,
          y: 40 + Math.random() * (height * 0.45),
          vx: -(1.5 + Math.random() * 2),
          vy: (Math.random() - 0.5) * 0.8,
          size: 10 + Math.random() * 8,
          wingAngle: Math.random() * Math.PI * 2,
          wingSpeed: 0.18 + Math.random() * 0.1,
        });
      }
    } else if (uiStyle === 'interstellar') {
      // 3D Starfield streaming
      for (let i = 0; i < 90; i++) {
        particles.push({
          x: (Math.random() - 0.5) * width * 1.5,
          y: (Math.random() - 0.5) * height * 1.5,
          vx: 0,
          vy: 0,
          size: 1 + Math.random() * 1.8,
          alpha: 0.3 + Math.random() * 0.7,
          color: Math.random() > 0.3 ? '#e0f2fe' : '#38bdf8',
          z: Math.random() * 1000 + 1,
        });
      }
    } else if (uiStyle === 'train-to-busan') {
      // Drifting foggy rail ash & mist
      for (let i = 0; i < 40; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: 0.6 + Math.random() * 0.8,
          vy: -0.15 + (Math.random() - 0.5) * 0.3,
          size: 2 + Math.random() * 4,
          alpha: 0.08 + Math.random() * 0.15,
          color: '#94a3b8',
          wobble: Math.random() * Math.PI * 2,
        });
      }
    } else if (uiStyle === 'dune') {
      for (let i = 0; i < 45; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: 0.5 + Math.random() * 0.9,
          vy: -0.15 + (Math.random() - 0.5) * 0.3,
          size: 1 + Math.random() * 2.2,
          alpha: 0.2 + Math.random() * 0.6,
          color: Math.random() > 0.3 ? '#f59e0b' : '#fbbf24',
          wobble: Math.random() * Math.PI * 2,
        });
      }
    } else if (uiStyle === 'avatar') {
      for (let i = 0; i < 35; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.4,
          vy: -0.3 - Math.random() * 0.6,
          size: 2 + Math.random() * 3.5,
          alpha: 0.3 + Math.random() * 0.6,
          color: Math.random() > 0.4 ? '#38bdf8' : '#c084fc',
          wobble: Math.random() * Math.PI * 2,
        });
      }
    }

    const render = () => {
      animId = requestAnimationFrame(render);
      ctx.clearRect(0, 0, width, height);

      // Render Interstellar 3D starfield
      if (uiStyle === 'interstellar') {
        const cx = width / 2;
        const cy = height / 2;

        for (let p of particles) {
          if (p.z === undefined) p.z = 1000;
          p.z -= 4; // Warp forward speed

          if (p.z <= 0) {
            p.z = 1000;
            p.x = (Math.random() - 0.5) * width * 1.5;
            p.y = (Math.random() - 0.5) * height * 1.5;
          }

          const k = 250 / p.z;
          const px = p.x * k + cx;
          const py = p.y * k + cy;

          if (px >= 0 && px < width && py >= 0 && py < height) {
            const rad = Math.max(0.5, (1 - p.z / 1000) * p.size * 2);
            ctx.fillStyle = p.color;
            ctx.globalAlpha = Math.min(1, (1 - p.z / 1000) * p.alpha + 0.2);
            ctx.beginPath();
            ctx.arc(px, py, rad, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        return;
      }

      // Render Batman Rain & Flying Bats
      if (uiStyle === 'batman') {
        // Rain
        for (let p of particles) {
          ctx.strokeStyle = p.color;
          ctx.globalAlpha = p.alpha;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + p.vx, p.y + p.size);
          ctx.stroke();

          p.x += p.vx;
          p.y += p.vy;

          if (p.y > height) {
            p.y = -20;
            p.x = Math.random() * (width + 100);
          }
        }

        // Flying Bats with flapping wings
        for (let b of bats) {
          b.wingAngle += b.wingSpeed;
          const flap = Math.sin(b.wingAngle) * (b.size * 0.6);

          ctx.fillStyle = '#0a0a0f';
          ctx.strokeStyle = '#27272a';
          ctx.lineWidth = 0.8;
          ctx.globalAlpha = 0.75;

          ctx.beginPath();
          // Head and Body with pointed ears
          ctx.arc(b.x, b.y, b.size * 0.22, 0, Math.PI * 2);
          // Pointed ears
          ctx.moveTo(b.x - b.size * 0.15, b.y - b.size * 0.15);
          ctx.lineTo(b.x - b.size * 0.1, b.y - b.size * 0.4);
          ctx.lineTo(b.x - b.size * 0.02, b.y - b.size * 0.15);
          ctx.moveTo(b.x + b.size * 0.02, b.y - b.size * 0.15);
          ctx.lineTo(b.x + b.size * 0.1, b.y - b.size * 0.4);
          ctx.lineTo(b.x + b.size * 0.15, b.y - b.size * 0.15);
          // Left Wing with sharp scalloped arches
          ctx.moveTo(b.x, b.y);
          ctx.quadraticCurveTo(b.x - b.size * 0.5, b.y - flap - b.size * 0.2, b.x - b.size, b.y - flap);
          ctx.quadraticCurveTo(b.x - b.size * 0.7, b.y - flap * 0.3 + b.size * 0.2, b.x - b.size * 0.45, b.y + b.size * 0.12);
          ctx.quadraticCurveTo(b.x - b.size * 0.25, b.y + b.size * 0.2, b.x, b.y + b.size * 0.25);
          // Right Wing with sharp scalloped arches
          ctx.quadraticCurveTo(b.x + b.size * 0.25, b.y + b.size * 0.2, b.x + b.size * 0.45, b.y + b.size * 0.12);
          ctx.quadraticCurveTo(b.x + b.size * 0.7, b.y - flap * 0.3 + b.size * 0.2, b.x + b.size, b.y - flap);
          ctx.quadraticCurveTo(b.x + b.size * 0.5, b.y - flap - b.size * 0.2, b.x, b.y);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          b.x += b.vx;
          b.y += b.vy + Math.sin(b.wingAngle * 0.5) * 0.5;

          if (b.x < -40) {
            b.x = width + 40;
            b.y = 40 + Math.random() * (height * 0.5);
          }
        }
        return;
      }

      // Render standard particle drift (Dune, Avatar, Busan)
      for (let p of particles) {
        if (p.wobble !== undefined) {
          p.wobble += 0.02;
          p.x += Math.sin(p.wobble) * 0.3 + p.vx;
        } else {
          p.x += p.vx;
        }
        p.y += p.vy;

        if (p.y < -10) p.y = height + 10;
        if (p.y > height + 10) p.y = -10;
        if (p.x > width + 10) p.x = -10;
        if (p.x < -10) p.x = width + 10;

        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        if (uiStyle === 'avatar') {
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.alpha * 0.3;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [uiStyle]);

  // -----------------------------------------------------------------------
  // RENDER DEDICATED MOVIE BACKDROPS
  // -----------------------------------------------------------------------

  // 1. THE GODFATHER (Red & White Gothic Mafia Noir)
  if (uiStyle === 'godfather') {
    return (
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
        <div className="absolute inset-0 bg-gradient-to-b from-[#18090a]/50 via-transparent to-[#0a0405]/85" />
        {/* Ornate Victorian Filigree Corner Ornaments in Crimson */}
        <svg className="absolute top-2 left-2 w-16 h-16 text-red-600/35" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M5 5 H40 M5 5 V40 M12 12 H30 M12 12 V30 M5 5 L35 35 M20 5 A 15 15 0 0 1 5 20" />
        </svg>
        <svg className="absolute top-2 right-2 w-16 h-16 text-red-600/35 rotate-90" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M5 5 H40 M5 5 V40 M12 12 H30 M12 12 V30 M5 5 L35 35 M20 5 A 15 15 0 0 1 5 20" />
        </svg>
        <svg className="absolute bottom-2 left-2 w-16 h-16 text-red-600/35 -rotate-90" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M5 5 H40 M5 5 V40 M12 12 H30 M12 12 V30 M5 5 L35 35 M20 5 A 15 15 0 0 1 5 20" />
        </svg>
        <svg className="absolute bottom-2 right-2 w-16 h-16 text-red-600/35 rotate-180" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M5 5 H40 M5 5 V40 M12 12 H30 M12 12 V30 M5 5 L35 35 M20 5 A 15 15 0 0 1 5 20" />
        </svg>
      </div>
    );
  }

  // 2. THE BATMAN: DARK KNIGHT (Gotham Rain & Animated Bats)
  if (uiStyle === 'batman') {
    return (
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
        {/* Gotham Rain & Bats Canvas */}
        <canvas ref={particleCanvasRef} className="absolute inset-0" />
        {/* Bat-Signal Searchlight Beam in Red/Orange Haze */}
        <div className="absolute -top-40 right-1/4 w-[300px] h-[700px] bg-gradient-to-b from-orange-500/15 via-red-500/5 to-transparent blur-3xl rotate-[35deg] transform-gpu pointer-events-none" />
        {/* Wayne Tower Tactical Grid */}
        <div className="absolute top-4 left-4 text-[9px] font-mono tracking-widest text-orange-500/50 uppercase">
          [GOTHAM_PD // FREQ_44.8 // TACTICAL BAT-HUD]
        </div>
        <div className="absolute bottom-4 right-4 text-[9px] font-mono tracking-widest text-zinc-500 uppercase">
          WAYNE ENTERPRISES // CRIMSON HUD
        </div>
      </div>
    );
  }

  // 3. INTERSTELLAR (Endurance Mission & Accretion Disk Glow)
  if (uiStyle === 'interstellar') {
    return (
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
        {/* 3D Starfield Canvas */}
        <canvas ref={particleCanvasRef} className="absolute inset-0" />
        {/* Gargantua Accretion Lens Glow in Center */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[160px] rounded-full bg-gradient-to-r from-transparent via-amber-500/10 to-transparent blur-[70px] pointer-events-none rotate-[-12deg]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[220px] h-[220px] rounded-full border border-sky-400/20 shadow-[0_0_50px_rgba(56,189,248,0.15)] pointer-events-none" />
        {/* Endurance Telemetry */}
        <div className="absolute top-4 left-6 text-[10px] font-mono tracking-[0.25em] text-sky-400/60 uppercase">
          [ENDURANCE // MISSION_03 // TIME DILATION: 1 HR = 7 YRS]
        </div>
        <div className="absolute bottom-4 right-6 text-[9px] font-mono tracking-widest text-sky-500/40 uppercase">
          GARGANTUA SYSTEM // GRAVITATIONAL SINGULARITY
        </div>
      </div>
    );
  }

  // 4. TRAIN TO BUSAN (Muted Biohazard Horror & KTX Railyard)
  if (uiStyle === 'train-to-busan') {
    return (
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
        {/* Mist canvas */}
        <canvas ref={particleCanvasRef} className="absolute inset-0" />
        {/* Foggy muted desaturated cast */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#18181b]/40 via-transparent to-[#0c0a09]/70" />
        {/* Railyard tracks silhouette at bottom */}
        <svg className="absolute bottom-0 inset-x-0 w-full h-24 text-zinc-800/40 opacity-50" preserveAspectRatio="none" viewBox="0 0 1000 100" fill="none">
          <line x1="0" y1="80" x2="1000" y2="80" stroke="currentColor" strokeWidth="3" />
          <line x1="0" y1="92" x2="1000" y2="92" stroke="currentColor" strokeWidth="3" />
          {/* Railroad ties */}
          {Array.from({ length: 25 }).map((_, i) => (
            <line key={i} x1={i * 42} y1="74" x2={i * 42 + 8} y2="98" stroke="currentColor" strokeWidth="2.5" />
          ))}
        </svg>
        {/* KTX Biohazard Telemetry */}
        <div className="absolute top-4 left-6 flex items-center gap-2 font-mono text-[10px] text-red-600/70 tracking-widest uppercase">
          <span className="w-2 h-2 rounded-full bg-red-700 animate-pulse" />
          <span>[KTX 101 // SEOUL -&gt; BUSAN // INFECTION PROTOCOL]</span>
        </div>
      </div>
    );
  }

  // 5. OBSESSION (Psychological Vertigo Noir & Analog TV Static)
  if (uiStyle === 'obsession') {
    return (
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
        {/* Analog TV Static Noise Canvas */}
        <canvas ref={staticCanvasRef} className="absolute inset-0 w-full h-full opacity-20 mix-blend-screen" />
        {/* Hypnotic Vertigo Concentric Surveillance Circles */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-white/5 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] rounded-full border border-red-500/10 pointer-events-none animate-pulse duration-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[180px] h-[180px] rounded-full border border-cyan-400/10 pointer-events-none" />
        {/* Surveillance Telemetry */}
        <div className="absolute top-4 left-6 font-mono text-[10px] tracking-[0.2em] text-red-500/60 uppercase">
          [SUBJECT: OBSESSION // PSYCHOLOGICAL SURVEILLANCE // FEED 04]
        </div>
      </div>
    );
  }

  // 6. DUNE: ARRAKIS (Spice Storm & Ancient Glyphs)
  if (uiStyle === 'dune') {
    return (
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
        <canvas ref={particleCanvasRef} className="absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#140b05]/30 via-transparent to-[#1a0e06]/60" />
        <div className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-3 text-[9px] font-mono tracking-[0.3em] uppercase text-amber-500/40">
          <span>&loz; SECTOR: ARRAKIS &bull; CANOPUS A &loz;</span>
        </div>
      </div>
    );
  }

  // 7. AVATAR: PANDORA (Bioluminescent Spores & Cyan Aura)
  if (uiStyle === 'avatar') {
    return (
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
        <canvas ref={particleCanvasRef} className="absolute inset-0" />
        <div className="absolute top-1/4 -left-32 w-[600px] h-[600px] rounded-full bg-cyan-600/10 blur-[140px]" />
        <div className="absolute bottom-1/4 -right-32 w-[600px] h-[600px] rounded-full bg-purple-600/10 blur-[150px]" />
        <div className="absolute bottom-4 left-6 hidden sm:flex items-center gap-2 text-[10px] font-sans tracking-widest text-cyan-400/40 uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
          <span>EYWA BIOLINK // ACTIVE PROTOCOL</span>
        </div>
      </div>
    );
  }

  // 8. THE MATRIX: Phosphor Terminal with Live Digital Rain
  if (uiStyle === 'matrix-code') {
    return (
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
        <canvas ref={matrixCanvasRef} className="absolute inset-0 opacity-40" />
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.6) 50%), linear-gradient(90deg, rgba(0, 255, 128, 0.04), rgba(0, 255, 64, 0.01), rgba(0, 255, 128, 0.04))',
            backgroundSize: '100% 4px, 6px 100%',
          }}
        />
      </div>
    );
  }

  // 9. RESIDENT EVIL: RACCOON CITY
  if (uiStyle === 'resident-evil') {
    return (
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
        <div className="absolute inset-0 bg-red-950/15" />
        <div
          className="absolute top-0 inset-x-0 h-2 opacity-60"
          style={{
            backgroundImage:
              'repeating-linear-gradient(45deg, #ef4444 0, #ef4444 10px, #000 10px, #000 20px)',
          }}
        />
        <div
          className="absolute bottom-0 inset-x-0 h-2 opacity-60"
          style={{
            backgroundImage:
              'repeating-linear-gradient(45deg, #ef4444 0, #ef4444 10px, #000 10px, #000 20px)',
          }}
        />
        <div className="absolute top-4 right-6 text-red-500/50 font-mono text-[10px] tracking-widest uppercase flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
          <span>[UMBRELLA CORP // T-VIRUS CONTAINMENT: BREACHED]</span>
        </div>
      </div>
    );
  }

  // 10. THE BACKROOMS (Level 0 Liminal Horror)
  if (uiStyle === 'backrooms') {
    return (
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: `radial-gradient(circle at 50% 50%, #ca8a04 15%, transparent 16%), radial-gradient(circle at 0% 0%, #ca8a04 15%, transparent 16%), radial-gradient(circle at 100% 100%, #ca8a04 15%, transparent 16%)`,
            backgroundSize: '40px 40px',
          }}
        />
        <div className="absolute inset-0 bg-[#221e0e]/30" />
        <div className="absolute top-4 left-6 flex items-center gap-3 font-mono text-[11px] text-yellow-400/70 tracking-widest uppercase">
          <span className="flex items-center gap-1.5 text-red-500">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
            <span>REC</span>
          </span>
          <span>SP &bull; 00:14:27 &bull; LEVEL 0</span>
        </div>
      </div>
    );
  }

  // 11. ONCE UPON A TIME IN HOLLYWOOD (1969 Sunset Strip)
  if (uiStyle === 'hollywood-1969') {
    return (
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-32 left-1/3 w-[600px] h-[500px] rounded-full bg-amber-500/15 blur-[130px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[400px] rounded-full bg-orange-600/10 blur-[120px]" />
        <div className="absolute top-3 left-1/2 -translate-x-1/2 px-4 py-0.5 rounded-full border border-amber-500/30 text-[10px] font-mono text-amber-400/60 uppercase tracking-widest">
          &starf; HOLLYWOOD, CA &bull; SUMMER OF 1969 &bull; CINEMA 35MM &starf;
        </div>
      </div>
    );
  }

  // 12. BLADE RUNNER 2049
  if (uiStyle === 'blade-runner') {
    return (
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
        <div className="absolute inset-0 bg-gradient-to-b from-orange-950/15 via-transparent to-amber-950/20" />
        <div className="absolute top-4 left-4 text-orange-500/30 font-mono text-[10px] tracking-widest uppercase">
          [SYS.2049_EXT // SECTOR_07]
        </div>
      </div>
    );
  }

  // 13. APPLE CUPERTINO FROSTED GLASS
  if (uiStyle === 'apple-glass') {
    return (
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-32 left-1/4 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-transparent blur-[120px] animate-pulse duration-1000" />
        <div className="absolute top-1/3 -right-24 w-[450px] h-[450px] rounded-full bg-gradient-to-bl from-indigo-500/8 via-cyan-400/5 to-transparent blur-[100px]" />
      </div>
    );
  }

  // 14. WES ANDERSON: Grand Budapest Hotel
  if (uiStyle === 'grand-budapest') {
    return (
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
        <div className="absolute inset-0 bg-[#0d0909]/40" />
        <div className="absolute top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 border border-amber-600/30 text-[10px] font-serif text-amber-500/50 uppercase tracking-widest">
          &mdash; The StutterFrame Society of Cinematographers &bull; Est. 1932 &mdash;
        </div>
      </div>
    );
  }

  // 15. 2001: A SPACE ODYSSEY
  if (uiStyle === 'kubrick-space') {
    return (
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
        <div className="absolute inset-0 bg-[#020204]" />
        <div className="fixed top-18 right-6 z-20 hidden md:flex items-center gap-2.5 px-3 py-1.5 rounded-sm bg-black/80 border border-red-500/30 backdrop-blur-md">
          <div className="relative w-3.5 h-3.5 rounded-full bg-red-950 flex items-center justify-center border border-red-500/50 shadow-[0_0_8px_rgba(239,68,68,0.8)]">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping opacity-75" />
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 absolute" />
          </div>
          <span className="font-mono text-[9px] text-red-400 tracking-widest uppercase font-bold">
            HAL 9000 &bull; ONLINE
          </span>
        </div>
      </div>
    );
  }

  // 16. NETFLIX 1:1 CINEMATIC PLATFORM
  if (uiStyle === 'netflix') {
    return (
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[450px] rounded-full bg-red-600/10 blur-[160px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#141414]/30 to-[#141414]" />
      </div>
    );
  }

  // 17. AMAZON PRIME VIDEO 1:1 PLATFORM
  if (uiStyle === 'amazon-prime') {
    return (
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-32 left-1/3 w-[650px] h-[450px] rounded-full bg-[#00a8e1]/10 blur-[160px]" />
        <div className="absolute top-1/2 -right-32 w-[550px] h-[450px] rounded-full bg-[#1a98ff]/8 blur-[150px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0f172a]/20 via-transparent to-[#0f172a]" />
      </div>
    );
  }

  // DEFAULT: Celluloid Classic Cinema
  return null;
};
