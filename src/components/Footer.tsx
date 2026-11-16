import React from 'react';
import { NavTab } from './Navigation';
import { ShieldCheck, Heart, ExternalLink } from 'lucide-react';

interface FooterProps {
  onTabChange: (tab: NavTab) => void;
}

export const Footer: React.FC<FooterProps> = ({ onTabChange }) => {
  return (
    <footer className="w-full border-t border-[#25352A] bg-[#0E120F] text-[#777B70] text-xs pt-12 pb-16 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-[#25352A]/60">
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2 text-[#F4F3EC]">
              <div className="w-7 h-7 rounded-lg bg-[#25352A] border border-[#727B5A]/40 flex items-center justify-center text-[#AAB29A]">
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                </svg>
              </div>
              <span className="font-medium tracking-[0.16em] text-base text-[#F4F3EC]">TERAVIA</span>
            </div>
            <p className="text-[12px] leading-relaxed text-[#AAB29A]/80">
              An interactive environmental intelligence platform uniting spatial cartography, microclimate thermodynamics, and field phenology.
            </p>
            <div className="flex items-center gap-2 pt-1 text-[11px] text-[#AAB29A]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#727B5A]" />
              <span>Local-first & privacy protected</span>
            </div>
          </div>

          {/* Platform Navigation */}
          <div>
            <h4 className="text-[11px] uppercase tracking-wider text-[#F4F3EC] font-semibold mb-3">
              Platform Features
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onTabChange('map')}
                  className="hover:text-[#F4F3EC] transition-colors text-left"
                >
                  Living Map of Singapore
                </button>
              </li>
              <li>
                <button
                  onClick={() => onTabChange('insights')}
                  className="hover:text-[#F4F3EC] transition-colors text-left"
                >
                  Environmental Insights Dashboard
                </button>
              </li>
              <li>
                <button
                  onClick={() => onTabChange('explorer')}
                  className="hover:text-[#F4F3EC] transition-colors text-left"
                >
                  Neighbourhood Explorer
                </button>
              </li>
              <li>
                <button
                  onClick={() => onTabChange('journal')}
                  className="hover:text-[#F4F3EC] transition-colors text-left"
                >
                  Nature Journal & Observations
                </button>
              </li>
              <li>
                <button
                  onClick={() => onTabChange('saved')}
                  className="hover:text-[#F4F3EC] transition-colors text-left"
                >
                  Saved Spaces & Bookmarks
                </button>
              </li>
            </ul>
          </div>

          {/* Environmental Knowledge */}
          <div>
            <h4 className="text-[11px] uppercase tracking-wider text-[#F4F3EC] font-semibold mb-3">
              Editorial & Science
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onTabChange('stories')}
                  className="hover:text-[#F4F3EC] transition-colors text-left"
                >
                  Urban Canopy & Heat Mitigation
                </button>
              </li>
              <li>
                <button
                  onClick={() => onTabChange('stories')}
                  className="hover:text-[#F4F3EC] transition-colors text-left"
                >
                  Park Connectors & Biodiversity
                </button>
              </li>
              <li>
                <button
                  onClick={() => onTabChange('stories')}
                  className="hover:text-[#F4F3EC] transition-colors text-left"
                >
                  Air Quality Microclimates
                </button>
              </li>
              <li>
                <button
                  onClick={() => onTabChange('stories')}
                  className="hover:text-[#F4F3EC] transition-colors text-left"
                >
                  Ethical Field Observation
                </button>
              </li>
            </ul>
          </div>

          {/* Data Sources and Provenance */}
          <div>
            <h4 className="text-[11px] uppercase tracking-wider text-[#F4F3EC] font-semibold mb-3">
              Data Governance
            </h4>
            <p className="text-[11px] leading-relaxed text-[#777B70] mb-2.5">
              Geospatial parameters and environmental indicators are structured around verified open frameworks from:
            </p>
            <div className="space-y-1.5 text-[11px] text-[#AAB29A]">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#727B5A]" />
                <span>National Environment Agency (NEA)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#727B5A]" />
                <span>Meteorological Service Singapore (MSS)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#727B5A]" />
                <span>National Parks Board (NParks)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#727B5A]" />
                <span>Singapore Open Data License v1.0</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
          <p>© 2026 TERAVIA Platform. See your world differently.</p>
          <div className="flex items-center gap-6">
            <span className="text-[#AAB29A]/60">Singapore Microclimate Edition</span>
            <span>•</span>
            <span className="text-[#777B70]">Demonstration Release</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
