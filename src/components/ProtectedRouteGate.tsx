import React from 'react';
import { NavTab } from './Navigation';
import { useAuth } from '../context/AuthContext';
import {
  Lock,
  Sparkles,
  Compass,
  Bookmark,
  BookOpen,
  UserCheck,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface ProtectedRouteGateProps {
  target: 'dashboard' | 'journal' | 'saved';
  onNavigate: (tab: NavTab) => void;
}

export const ProtectedRouteGate: React.FC<ProtectedRouteGateProps> = ({ target, onNavigate }) => {
  const { openAuthModal } = useAuth();

  const config = {
    dashboard: {
      title: 'Personal Exploration Dashboard',
      badge: 'Protected Exploration Suite',
      icon: UserCheck,
      description:
        'Your personal dashboard aggregates your saved nature sanctuaries, field journal observations, and Singapore microclimate telemetry into a unified personal record.',
      callout:
        'Create a free account or sign in to synchronize your observations across all your devices with end-to-end security.',
    },
    journal: {
      title: 'Field Observation Journal',
      badge: 'Protected Nature Journal',
      icon: BookOpen,
      description:
        'The nature journal allows you to log native bird sightings, catalog tropical flora, document microclimates, and build a persistent photographic record of Singapore biodiversity.',
      callout:
        'Create an account to save your observations securely to our persistent database with Row Level Security.',
    },
    saved: {
      title: 'Curated Sanctuaries & Saved Places',
      badge: 'Protected Personal Sanctuaries',
      icon: Bookmark,
      description:
        'Your saved places collection lets you curate personal refuges from Singapore’s 18 primary reserves, national parks, and coastal trails for quick access and directions.',
      callout:
        'Create an account to bookmark your favourite green spaces and access your collection on any device.',
    },
  }[target];

  const Icon = config.icon;

  return (
    <div className="w-full min-h-[calc(100vh-4.5rem)] bg-[#0E120F] text-[#F4F3EC] py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-2xl w-full mx-auto text-center space-y-8 animate-in fade-in zoom-in-95 duration-300">
        {/* Glow & Icon */}
        <div className="relative inline-flex items-center justify-center">
          <div className="w-20 h-20 rounded-3xl bg-[#151A16] border border-[#25352A] flex items-center justify-center text-[#727B5A] shadow-2xl relative z-10">
            <Icon className="w-9 h-9" />
          </div>
          <div className="absolute inset-0 bg-[#727B5A]/20 blur-2xl rounded-full" />
        </div>

        {/* Header Text */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-[0.2em] bg-[#151A16] border border-[#25352A] text-[#AAB29A]">
            <Lock className="w-3.5 h-3.5 text-[#727B5A]" />
            <span>{config.badge}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-medium tracking-tight text-[#F4F3EC]">
            {config.title}
          </h1>

          <p className="text-sm text-[#777B70] max-w-lg mx-auto leading-relaxed">
            {config.description}
          </p>
        </div>

        {/* Feature Explanation Card */}
        <div className="rounded-3xl bg-[#151A16] border border-[#25352A] p-6 text-left max-w-lg mx-auto space-y-4 shadow-xl">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-[#727B5A] flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#F4F3EC]">
                Account Requirement
              </h4>
              <p className="text-xs text-[#AAB29A] leading-relaxed">
                {config.callout}
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-[#25352A]/60 flex items-center justify-between text-[11px] text-[#777B70]">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#727B5A]" />
              <span>Row Level Security Enforced</span>
            </span>
            <span className="text-[#AAB29A]">Free & Instant</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() =>
              openAuthModal({
                mode: 'signup',
                prompt: `Create an account to access ${config.title.toLowerCase()}.`,
                returnTab: target,
              })
            }
            className="w-full sm:w-auto px-6 py-3 rounded-full text-xs font-semibold bg-[#F4F3EC] text-[#252820] hover:bg-white transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-[#727B5A]" />
            <span>Create Free Account</span>
          </button>

          <button
            onClick={() =>
              openAuthModal({
                mode: 'signin',
                prompt: `Sign in to access your ${config.title.toLowerCase()}.`,
                returnTab: target,
              })
            }
            className="w-full sm:w-auto px-6 py-3 rounded-full text-xs font-medium bg-[#1C231E] text-[#F4F3EC] hover:bg-[#25352A] border border-[#25352A] transition-colors cursor-pointer"
          >
            <span>Sign In to Existing Account</span>
          </button>
        </div>

        {/* Public Browsing Return Link */}
        <div className="pt-4">
          <button
            onClick={() => onNavigate('map')}
            className="text-xs text-[#777B70] hover:text-[#AAB29A] transition-colors inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Compass className="w-3.5 h-3.5 text-[#727B5A]" />
            <span>Continue browsing the public Living Map</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
