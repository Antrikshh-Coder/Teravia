import React, { useState, useEffect, useCallback } from 'react';
import { SINGAPORE_GREEN_SPACES } from '../data/singaporePlaces';
import { GreenSpace } from '../types';
import { getSavedPlaces, toggleSavePlace } from '../services/storage';
import { api } from '../services/apiClient';
import {
  Bookmark,
  MapPin,
  ExternalLink,
  Trash2,
  TreePine,
  Sparkles,
  ArrowRight,
  Compass,
  Database,
  CloudCheck,
} from 'lucide-react';

interface SavedPlacesProps {
  onNavigateToMap: (placeId?: string) => void;
  onSelectForJournal: (placeName: string) => void;
  onSavedChange?: () => void;
}

export const SavedPlaces: React.FC<SavedPlacesProps> = ({
  onNavigateToMap,
  onSelectForJournal,
  onSavedChange,
}) => {
  const [savedPlaces, setSavedPlaces] = useState<GreenSpace[]>([]);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'local' | 'loading'>('loading');

  const loadSaved = useCallback(async () => {
    // 1. Initial quick load from local storage
    const localIds = getSavedPlaces();
    const localFiltered = SINGAPORE_GREEN_SPACES.filter((p) => localIds.includes(p.id));
    setSavedPlaces(localFiltered);

    // 2. Fetch from backend database
    try {
      const serverData = await api.getSavedPlaces();
      if (serverData && Array.isArray(serverData.saved_ids)) {
        const places = SINGAPORE_GREEN_SPACES.filter((p) => serverData.saved_ids.includes(p.id));
        setSavedPlaces(places);
        localStorage.setItem('teravia_saved_places_v1', JSON.stringify(serverData.saved_ids));
        setSyncStatus('synced');
      } else {
        setSyncStatus('local');
      }
    } catch (err) {
      console.warn('Backend saved places query failed, relying on local cache:', err);
      setSyncStatus('local');
    }
  }, []);

  useEffect(() => {
    loadSaved();
  }, [loadSaved]);

  const handleRemove = async (placeId: string) => {
    // Optimistic local update
    toggleSavePlace(placeId);
    setSavedPlaces((prev) => prev.filter((p) => p.id !== placeId));
    onSavedChange?.();

    try {
      await api.removeSavedPlace(placeId);
    } catch (err) {
      console.warn('Backend remove saved place error:', err);
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-4.5rem)] bg-[#0E120F] text-[#F4F3EC] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#25352A]">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#727B5A]">
              <Bookmark className="w-4 h-4 fill-current" />
              <span>Personal Sanctuaries</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-[#F4F3EC]">
              Saved Places
            </h1>
            <p className="text-xs sm:text-sm text-[#777B70]">
              Your curated collection of Singapore parks, reserves, and coastal habitats.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <span
              className={`px-2.5 py-1 rounded-full text-[11px] font-medium border flex items-center gap-1.5 ${
                syncStatus === 'synced'
                  ? 'bg-emerald-950/30 text-emerald-400 border-emerald-800/40'
                  : 'bg-[#151A16] text-[#777B70] border-[#25352A]'
              }`}
              title={syncStatus === 'synced' ? 'Synchronized with persistent database' : 'Local storage offline mode'}
            >
              {syncStatus === 'synced' ? (
                <>
                  <CloudCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Cloud Synced</span>
                </>
              ) : (
                <>
                  <Database className="w-3.5 h-3.5" />
                  <span>Local Cache</span>
                </>
              )}
            </span>
            <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-[#151A16] border border-[#25352A] text-[#AAB29A]">
              {savedPlaces.length} Bookmarked Space{savedPlaces.length === 1 ? '' : 's'}
            </span>
            <button
              onClick={() => onNavigateToMap()}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#25352A] text-[#F4F3EC] hover:bg-[#41483A] transition-colors flex items-center gap-2"
            >
              <Compass className="w-3.5 h-3.5 text-[#AAB29A]" />
              <span>Explore More on Map</span>
            </button>
          </div>
        </div>

        {/* Empty State */}
        {savedPlaces.length === 0 ? (
          <div className="rounded-3xl bg-[#151A16] border border-[#25352A] p-12 text-center flex flex-col items-center justify-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#1C231E] border border-[#25352A] flex items-center justify-center text-[#777B70]">
              <Bookmark className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-medium text-[#F4F3EC]">No saved places yet</h3>
            <p className="text-xs text-[#777B70] max-w-sm leading-relaxed">
              When exploring the Living Map or Neighbourhood Explorer, tap the bookmark icon on any green space to save it here for quick access.
            </p>
            <button
              onClick={() => onNavigateToMap()}
              className="mt-2 px-5 py-2 rounded-xl text-xs font-semibold bg-[#F4F3EC] text-[#252820] hover:bg-white transition-all shadow-md flex items-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#727B5A]" />
              <span>Launch Living Map</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedPlaces.map((place) => (
              <div
                key={place.id}
                className="group rounded-3xl bg-[#151A16] border border-[#25352A] hover:border-[#727B5A] transition-all overflow-hidden shadow-xl flex flex-col justify-between"
              >
                {/* Photo header */}
                <div className="relative h-48 w-full bg-[#1C231E] overflow-hidden">
                  <img
                    src={place.imageUrl}
                    alt={place.name}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#151A16] via-transparent to-black/30" />
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-[#0E120F]/80 text-[#AAB29A] backdrop-blur-md">
                    {place.category}
                  </span>
                  <button
                    onClick={() => handleRemove(place.id)}
                    className="absolute top-3 right-3 p-1.5 rounded-full bg-black/60 text-[#777B70] hover:text-rose-400 hover:bg-black/90 transition-colors"
                    title="Remove from saved"
                    aria-label="Remove from saved places"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <span className="absolute bottom-3 left-3 px-2 py-0.5 rounded text-[10px] font-medium bg-black/50 text-[#F4F3EC] backdrop-blur-md">
                    {place.region} Region • {place.sizeHectares} ha
                  </span>
                </div>

                {/* Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-[#F4F3EC] group-hover:text-white transition-colors">
                      {place.name}
                    </h3>
                    <p className="text-xs text-[#777B70] line-clamp-2 mt-1 leading-relaxed">
                      {place.shortDescription}
                    </p>
                  </div>

                  {/* Amenities */}
                  <div className="flex flex-wrap gap-1.5 text-[10.5px] text-[#AAB29A]">
                    {place.amenities.slice(0, 3).map((a, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded bg-[#1C231E] border border-[#25352A]"
                      >
                        {a}
                      </span>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-[#25352A]/60 flex items-center justify-between gap-2">
                    <button
                      onClick={() => onSelectForJournal(place.name)}
                      className="px-3 py-1.5 rounded-xl text-xs text-[#AAB29A] hover:text-white bg-[#1C231E] hover:bg-[#25352A] border border-[#25352A] transition-colors flex items-center gap-1.5"
                    >
                      <TreePine className="w-3.5 h-3.5 text-[#727B5A]" />
                      <span>Log Observation</span>
                    </button>

                    <button
                      onClick={() => onNavigateToMap(place.id)}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#25352A] hover:bg-[#F4F3EC] text-[#F4F3EC] hover:text-[#252820] transition-colors flex items-center gap-1.5"
                    >
                      <span>View on Map</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
