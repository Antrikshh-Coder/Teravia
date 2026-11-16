import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Sparkles, X, ChevronRight } from 'lucide-react';

interface CinematicIntroProps {
  onComplete: () => void;
  forcePlay?: boolean;
}

export const CinematicIntro: React.FC<CinematicIntroProps> = ({
  onComplete,
  forcePlay = false,
}) => {
  const [stage, setStage] = useState<'scene1' | 'scene2' | 'scene3' | 'scene4' | 'exiting'>('scene1');
  const [elapsed, setElapsed] = useState<number>(0);
  const [isDismissing, setIsDismissing] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const finishIntro = useCallback(() => {
    setIsDismissing(true);
    try {
      sessionStorage.setItem('teravia_intro_played', 'true');
    } catch {
      // Ignore storage errors in restricted private browsing
    }
    setTimeout(() => {
      onComplete();
    }, 450);
  }, [onComplete]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        finishIntro();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [finishIntro]);

  // Check prefers-reduced-motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches && !forcePlay) {
      finishIntro();
    }
  }, [finishIntro, forcePlay]);

  // Main 5.6-second timeline engine
  useEffect(() => {
    const TOTAL_DURATION_MS = 5600;

    const tick = (now: number) => {
      if (!startTimeRef.current) startTimeRef.current = now;
      const progressMs = now - startTimeRef.current;
      const progressSec = progressMs / 1000;
      setElapsed(progressSec);

      if (progressSec < 1.4) {
        setStage('scene1');
      } else if (progressSec < 2.9) {
        setStage('scene2');
      } else if (progressSec < 4.4) {
        setStage('scene3');
      } else if (progressSec < 5.5) {
        setStage('scene4');
      } else {
        finishIntro();
        return;
      }

      animationFrameRef.current = requestAnimationFrame(tick);
    };

    animationFrameRef.current = requestAnimationFrame(tick);

    // Guaranteed failsafe timeout so intro NEVER locks user out
    const failsafe = setTimeout(() => {
      finishIntro();
    }, 6200);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      clearTimeout(failsafe);
    };
  }, [finishIntro]);

  // Gentle organic floating particles canvas (spores / canopy light motes)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const particleCount = 45;
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2.2 + 0.8,
      speedY: Math.random() * 0.45 + 0.15,
      speedX: (Math.random() - 0.5) * 0.3,
      alpha: Math.random() * 0.6 + 0.2,
      pulseSpeed: Math.random() * 0.02 + 0.01,
      angle: Math.random() * Math.PI * 2,
    }));

    let animId: number;
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.y -= p.speedY;
        p.x += Math.sin(p.angle) * 0.4;
        p.angle += p.pulseSpeed;

        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(168, 185, 150, ${p.alpha * 0.7})`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = 'rgba(114, 123, 90, 0.4)';
        ctx.fill();
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div
      role="region"
      aria-label="Cinematic introduction"
      className={`fixed inset-0 z-[3000] flex items-center justify-center bg-[#070B08] text-[#F4F3EC] select-none transition-opacity duration-500 ease-out ${
        isDismissing ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'
      }`}
    >
      {/* Background Particle Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none opacity-80"
        aria-hidden="true"
      />

      {/* Atmospheric light ray glow */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-1000 ease-in-out"
        style={{
          background:
            'radial-gradient(circle at 50% 45%, rgba(114, 123, 90, 0.22) 0%, rgba(37, 53, 42, 0.12) 40%, rgba(7, 11, 8, 0.95) 75%)',
          opacity: stage === 'scene1' ? 0.6 : stage === 'scene2' ? 0.85 : 0.4,
        }}
        aria-hidden="true"
      />

      {/* Subtle organic forest texture layer for Scene 3 */}
      <div
        className="absolute inset-0 pointer-events-none bg-cover bg-center transition-opacity duration-1000 ease-in-out"
        style={{
          backgroundImage:
            'url("https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=1920&q=80")',
          opacity: stage === 'scene3' || stage === 'scene4' ? 0.18 : 0,
          filter: 'saturate(0.7) brightness(0.6)',
        }}
        aria-hidden="true"
      />

      {/* Skip Intro Button */}
      <button
        onClick={finishIntro}
        className="absolute top-6 right-6 sm:top-8 sm:right-8 z-50 px-4 py-2 rounded-full bg-[#151A16]/80 hover:bg-[#1C231E] border border-[#25352A] text-xs text-[#AAB29A] hover:text-white backdrop-blur-md transition-all cursor-pointer flex items-center gap-1.5 shadow-xl group"
        aria-label="Skip cinematic introduction"
      >
        <span className="text-[11px] uppercase tracking-[0.16em] font-medium">Skip Intro</span>
        <span className="text-[10px] text-[#777B70] group-hover:text-[#AAB29A] font-mono">[ESC]</span>
        <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform text-[#727B5A]" />
      </button>

      {/* Progress pill indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-40 w-32 h-1 bg-[#151A16] rounded-full overflow-hidden border border-[#25352A]/50">
        <div
          className="h-full bg-gradient-to-r from-[#727B5A] to-[#AAB29A] transition-all duration-100 ease-linear"
          style={{ width: `${Math.min(100, (elapsed / 5.5) * 100)}%` }}
        />
      </div>

      {/* Center Cinematic Content */}
      <div className="relative z-30 max-w-xl mx-auto px-6 text-center flex flex-col items-center justify-center space-y-6">
        {/* SCENE 1: 0 - 1.5s (Deep Forest Awakening) */}
        {stage === 'scene1' && (
          <div className="space-y-4 animate-in fade-in zoom-in-95 duration-1000">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#151A16]/70 border border-[#727B5A]/30 text-[10px] tracking-[0.3em] uppercase text-[#727B5A]">
              <Sparkles className="w-3 h-3 text-[#727B5A]" />
              <span>Computational Nature</span>
            </div>
            <p className="text-xs uppercase tracking-[0.25em] text-[#777B70] font-light">
              Environmental Intelligence Platform
            </p>
          </div>
        )}

        {/* SCENE 2: 1.5 - 3.0s (Wordmark & Tagline Reveal) */}
        {stage === 'scene2' && (
          <div className="space-y-4 animate-in fade-in zoom-in-95 duration-800">
            {/* Minimal Brand Seal */}
            <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-[#25352A] to-[#151A16] border border-[#727B5A]/50 flex items-center justify-center text-[#AAB29A] shadow-2xl">
              <svg viewBox="0 0 24 24" className="w-7 h-7 fill-current" aria-hidden="true">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
              </svg>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-light tracking-[0.22em] text-[#F4F3EC] uppercase">
              TERAVIA
            </h1>

            <div className="pt-1">
              <p className="text-sm sm:text-base font-serif italic text-[#AAB29A] tracking-wider">
                &ldquo;See your world differently.&rdquo;
              </p>
            </div>
          </div>
        )}

        {/* SCENE 3: 3.0 - 4.5s (Nature-inspired Visual & Coordinates) */}
        {stage === 'scene3' && (
          <div className="space-y-5 animate-in fade-in zoom-in-95 duration-800">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1C231E]/90 border border-[#25352A] text-[11px] font-mono text-[#727B5A]">
              <span>1.3521° N, 103.8198° E</span>
              <span>•</span>
              <span className="text-[#AAB29A]">Singapore Living Biome</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-light tracking-tight text-[#F4F3EC]">
              Where Conservation Meets Spatial Telemetry
            </h2>

            <p className="text-xs sm:text-sm text-[#777B70] max-w-md mx-auto leading-relaxed">
              Synthesizing real-time air quality, microclimate buffering, and citizen phenology.
            </p>
          </div>
        )}

        {/* SCENE 4: 4.5 - 5.6s (Smooth dissolve into Hero section) */}
        {stage === 'scene4' && (
          <div className="space-y-3 animate-in fade-in duration-600">
            <span className="text-[11px] uppercase tracking-[0.3em] font-medium text-[#727B5A]">
              Entering Platform
            </span>
            <div className="text-lg font-light tracking-wide text-[#F4F3EC]">
              Initializing Living Map & Telemetry...
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
