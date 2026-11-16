import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  X,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  TreePine,
  Wind,
  Compass,
} from 'lucide-react';
import { NavTab } from './Navigation';

interface ImmersiveExperienceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: NavTab) => void;
}

interface StoryChapter {
  id: number;
  tagline: string;
  title: string;
  description: string;
  imageUrl: string;
  insightLabel: string;
  insightValue: string;
}

const CHAPTERS: StoryChapter[] = [
  {
    id: 1,
    tagline: 'Chapter 01 • Spatial Sanctuaries',
    title: 'The Forest Heart in the City',
    description:
      'From the 165-year botanical heritage of the Singapore Botanic Gardens to the ancient dipterocarp canopies of MacRitchie and Bukit Timah, Singapore preserves over 18 major terrestrial, wetland, and coastal sanctuaries woven together through ecological corridors.',
    imageUrl:
      'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=1400&q=80',
    insightLabel: 'Protected Green Cover',
    insightValue: '46.5% terrestrial canopy',
  },
  {
    id: 2,
    tagline: 'Chapter 02 • Microclimate Dynamics',
    title: 'The Living Shield Against Urban Heat',
    description:
      'Mature rain trees and multi-tiered understorey vegetation transpire hundreds of litres of moisture daily, creating microclimate buffers that reduce ground radiation by up to 18°C and ambient air temperatures by 2.8°C compared to concrete canyons.',
    imageUrl:
      'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1400&q=80',
    insightLabel: 'Canopy Thermal Offset',
    insightValue: '-2.8°C to -4.1°C boundary cooling',
  },
  {
    id: 3,
    tagline: 'Chapter 03 • Citizen Phenology',
    title: 'Observing Without Leaving a Trace',
    description:
      'True environmental intelligence begins with attentive, mindful observation. By timestamping encounters with native birds, pollinators, and ferns, citizens create a living record of tropical phenology while respecting fragile habitats.',
    imageUrl:
      'https://images.unsplash.com/photo-1544979590-37e9b47eb705?auto=format&fit=crop&w=1400&q=80',
    insightLabel: 'Recorded Taxa in Atlas',
    insightValue: '180+ monitored species',
  },
];

export const ImmersiveExperienceModal: React.FC<ImmersiveExperienceModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const [currentChapter, setCurrentChapter] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<any>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Keyboard escape listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') nextChapter();
      if (e.key === 'ArrowLeft') prevChapter();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentChapter]);

  // Gentle procedural ambient audio synthesis (wind in trees & distant water resonance)
  useEffect(() => {
    if (!isOpen) {
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
        audioContextRef.current = null;
      }
      return;
    }

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx && !audioContextRef.current) {
        const ctx = new AudioCtx();
        audioContextRef.current = ctx;

        // Create pink noise buffer for forest wind simulation
        const bufferSize = ctx.sampleRate * 2;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          output[i] = (b0 + b1 + b2) * 0.04;
        }

        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        // Filter for soft rustling breeze
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 320;

        const gainNode = ctx.createGain();
        gainNode.gain.value = isMuted ? 0 : 0.08;

        whiteNoise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(ctx.destination);

        whiteNoise.start();
        oscillatorRef.current = whiteNoise;
        gainNodeRef.current = gainNode;
      }
    } catch {
      // Audio autoplay gracefully suppressed if user hasn't interacted
    }

    return () => {
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
        audioContextRef.current = null;
      }
    };
  }, [isOpen]);

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (gainNodeRef.current && audioContextRef.current) {
      gainNodeRef.current.gain.setValueAtTime(
        nextMuted ? 0 : 0.08,
        audioContextRef.current.currentTime
      );
    }
  };

  const nextChapter = () => {
    setCurrentChapter((prev) => (prev + 1) % CHAPTERS.length);
  };

  const prevChapter = () => {
    setCurrentChapter((prev) => (prev - 1 + CHAPTERS.length) % CHAPTERS.length);
  };

  if (!isOpen) return null;

  const chapter = CHAPTERS[currentChapter];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={onClose}
      className="fixed inset-0 z-[2100] flex items-center justify-center bg-[#070A08]/95 backdrop-blur-xl p-4 sm:p-6 animate-in fade-in duration-300"
    >
      <div
        className="relative w-full max-w-4xl h-[85vh] max-h-[720px] rounded-3xl overflow-hidden border border-[#727B5A]/40 bg-[#0E120F] flex flex-col justify-between shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Background Ambient Imagery with Fade Transition */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img
            key={chapter.id}
            src={chapter.imageUrl}
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover transition-opacity duration-700 opacity-35 scale-105"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0E120F] via-[#0E120F]/70 to-[#0E120F]/40" />
        </div>

        {/* Top Controls Bar */}
        <div className="relative z-10 p-6 flex items-center justify-between border-b border-[#25352A]/60">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#AAB29A]">
            <Sparkles className="w-4 h-4 text-[#727B5A]" />
            <span>TERAVIA • Immersive Platform Tour</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleMute}
              className="p-2 rounded-xl bg-black/50 text-[#AAB29A] hover:text-white border border-[#25352A] transition-colors cursor-pointer"
              aria-label={isMuted ? 'Unmute ambient soundscape' : 'Mute soundscape'}
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-black/50 text-[#AAB29A] hover:text-white border border-[#25352A] transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Story Chapter Content */}
        <div className="relative z-10 px-6 sm:px-12 py-6 flex-1 flex flex-col justify-center max-w-2xl space-y-4">
          <span className="text-xs uppercase tracking-[0.25em] font-semibold text-[#727B5A]">
            {chapter.tagline}
          </span>
          <h2
            id="modal-title"
            className="text-2xl sm:text-4xl font-normal text-white tracking-tight leading-snug"
          >
            {chapter.title}
          </h2>
          <p className="text-xs sm:text-sm text-[#AAB29A] leading-relaxed">
            {chapter.description}
          </p>

          <div className="pt-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1C231E]/80 border border-[#727B5A]/40 text-xs text-[#F4F3EC]">
              <TreePine className="w-3.5 h-3.5 text-[#727B5A]" />
              <span className="text-[#777B70]">{chapter.insightLabel}:</span>
              <strong className="text-[#F4F3EC]">{chapter.insightValue}</strong>
            </div>
          </div>
        </div>

        {/* Bottom Interactive Navigation & Action Bar */}
        <div className="relative z-10 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#25352A]/60 bg-[#0E120F]/80">
          {/* Chapter dots & arrows */}
          <div className="flex items-center gap-3">
            <button
              onClick={prevChapter}
              className="p-2 rounded-xl bg-[#1C231E] text-[#AAB29A] hover:text-white border border-[#25352A] transition-colors cursor-pointer"
              aria-label="Previous chapter"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1.5">
              {CHAPTERS.map((ch, idx) => (
                <button
                  key={ch.id}
                  onClick={() => setCurrentChapter(idx)}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    currentChapter === idx
                      ? 'w-8 bg-[#AAB29A]'
                      : 'w-2 bg-[#25352A] hover:bg-[#727B5A]'
                  }`}
                  aria-label={`Go to chapter ${idx + 1}`}
                />
              ))}
            </div>

            <button
              onClick={nextChapter}
              className="p-2 rounded-xl bg-[#1C231E] text-[#AAB29A] hover:text-white border border-[#25352A] transition-colors cursor-pointer"
              aria-label="Next chapter"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Launch Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                onClose();
                onNavigate('journal');
              }}
              className="px-4 py-2 rounded-xl text-xs font-medium text-[#AAB29A] hover:text-white transition-colors"
            >
              Open Journal
            </button>
            <button
              onClick={() => {
                onClose();
                onNavigate('map');
              }}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-[#F4F3EC] text-[#252820] hover:bg-white shadow-md flex items-center gap-2 cursor-pointer transition-all"
            >
              <Compass className="w-3.5 h-3.5 text-[#727B5A]" />
              <span>Explore the Living Map</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
