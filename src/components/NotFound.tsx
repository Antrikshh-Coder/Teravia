import React from 'react';
import { Compass, MapPin, ArrowLeft } from 'lucide-react';
import { NavTab } from './Navigation';

interface NotFoundProps {
  onNavigateHome: () => void;
  onNavigateTab: (tab: NavTab) => void;
}

export const NotFound: React.FC<NotFoundProps> = ({ onNavigateHome, onNavigateTab }) => {
  return (
    <div className="w-full min-h-[calc(100vh-12rem)] flex items-center justify-center bg-[#0E120F] text-[#F4F3EC] px-4 py-16">
      <div className="max-w-md w-full rounded-3xl bg-[#151A16] border border-[#25352A] p-8 text-center space-y-5 shadow-2xl">
        <div className="w-14 h-14 rounded-2xl bg-[#1C231E] border border-[#727B5A]/40 text-[#727B5A] flex items-center justify-center mx-auto">
          <Compass className="w-7 h-7" />
        </div>
        <div className="space-y-2">
          <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#727B5A]">
            Error 404 • Coordinate Lost
          </span>
          <h2 className="text-2xl font-medium tracking-tight text-[#F4F3EC]">
            Terrain Not Found
          </h2>
          <p className="text-xs text-[#777B70] leading-relaxed">
            The trail or route you requested does not exist in the TERAVIA atlas. Use the navigation above or return to the living map.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onNavigateHome}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-semibold bg-[#25352A] text-[#F4F3EC] hover:bg-[#41483A] transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Overview</span>
          </button>
          <button
            onClick={() => onNavigateTab('map')}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-semibold bg-[#F4F3EC] text-[#252820] hover:bg-white transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <MapPin className="w-3.5 h-3.5 text-[#727B5A]" />
            <span>Explore Living Map</span>
          </button>
        </div>
      </div>
    </div>
  );
};
