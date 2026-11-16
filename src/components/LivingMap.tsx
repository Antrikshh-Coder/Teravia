import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search,
  MapPin,
  Bookmark,
  ExternalLink,
  Info,
  Check,
  Compass,
  List,
  Map as MapIcon,
  Accessibility,
  Clock,
  Sparkles,
  TreePine,
  X,
  Share2,
  Navigation,
} from 'lucide-react';
import { SINGAPORE_GREEN_SPACES } from '../data/singaporePlaces';
import { GreenSpace, GreenSpaceCategory } from '../types';
import { toggleSavePlace, isPlaceSaved, getSavedPlaces } from '../services/storage';
import { api } from '../services/apiClient';
import { useAuth } from '../context/AuthContext';

interface LivingMapProps {
  onSelectPlaceForJournal?: (placeName: string) => void;
  initialSelectedPlaceId?: string | null;
  onSavedChange?: () => void;
}

const CATEGORIES: ('All' | GreenSpaceCategory)[] = [
  'All',
  'Gardens',
  'Nature Reserves',
  'Parks',
  'Nature Trails',
  'Waterfront Green Spaces',
];

export const LivingMap: React.FC<LivingMapProps> = ({
  onSelectPlaceForJournal,
  initialSelectedPlaceId,
  onSavedChange,
}) => {
  const { user, openAuthModal } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<'All' | GreenSpaceCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlace, setSelectedPlace] = useState<GreenSpace | null>(null);
  const [viewMode, setViewMode] = useState<'split' | 'list'>('split');
  const [mobileTab, setMobileTab] = useState<'map' | 'list'>('map');
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const markersRef = useRef<Record<string, any>>({});

  // Invalidate map size on mobileTab or viewMode switch
  useEffect(() => {
    if (leafletMapRef.current) {
      const timer1 = setTimeout(() => leafletMapRef.current?.invalidateSize(), 50);
      const timer2 = setTimeout(() => leafletMapRef.current?.invalidateSize(), 300);
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [mobileTab, viewMode]);

  // Sync saved IDs on mount
  useEffect(() => {
    const list = getSavedPlaces();
    setSavedIds(list);

    api.getSavedPlaces()
      .then((res) => {
        if (res && Array.isArray(res.saved_ids)) {
          setSavedIds(res.saved_ids);
          localStorage.setItem('teravia_saved_places_v1', JSON.stringify(res.saved_ids));
        }
      })
      .catch((err) => {
        console.warn('Backend saved-places sync error:', err);
      });
  }, []);

  // Handle initial selected place if provided
  useEffect(() => {
    if (initialSelectedPlaceId) {
      const found = SINGAPORE_GREEN_SPACES.find((p) => p.id === initialSelectedPlaceId);
      if (found) {
        setSelectedPlace(found);
      }
    }
  }, [initialSelectedPlaceId]);

  // Close place details on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedPlace(null);
      }
    };
    if (selectedPlace) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPlace]);

  // Filtered places
  const filteredPlaces = useMemo(() => {
    return SINGAPORE_GREEN_SPACES.filter((place) => {
      const matchesCategory =
        selectedCategory === 'All' || place.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        place.name.toLowerCase().includes(q) ||
        place.description.toLowerCase().includes(q) ||
        place.region.toLowerCase().includes(q) ||
        place.amenities.some((a) => a.toLowerCase().includes(q)) ||
        place.highlights.some((h) => h.toLowerCase().includes(q));
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  // Initialize or re-render Leaflet Map
  useEffect(() => {
    if (viewMode !== 'split' || !mapContainerRef.current) return;

    const L = (window as any).L;
    if (!L) {
      console.warn('Leaflet library is still loading or not available on window.L');
      return;
    }

    // Initialize map if not already done
    if (!leafletMapRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [1.3521, 103.8198],
        zoom: 12,
        zoomControl: false,
        attributionControl: true,
      });

      // Add zoom control to bottom right
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // OpenStreetMap tiles with custom TERAVIA dark-forest filter
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        className: 'teravia-map-tiles',
        maxZoom: 19,
      }).addTo(map);

      leafletMapRef.current = map;
    }

    const map = leafletMapRef.current;

    // Clear previous markers
    Object.values(markersRef.current).forEach((m: any) => map.removeLayer(m));
    markersRef.current = {};

    // Add markers for current filtered places
    filteredPlaces.forEach((place) => {
      const isSelected = selectedPlace?.id === place.id;
      const isSaved = savedIds.includes(place.id);

      // Category colour accent
      const catColor =
        place.category === 'Nature Reserves'
          ? '#727B5A'
          : place.category === 'Gardens'
          ? '#AAB29A'
          : place.category === 'Waterfront Green Spaces'
          ? '#5E8B7E'
          : place.category === 'Nature Trails'
          ? '#C2C9B2'
          : '#41483A';

      const customIcon = L.divIcon({
        className: 'custom-teravia-pin',
        html: `
          <div style="
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            width: ${isSelected ? '38px' : '28px'};
            height: ${isSelected ? '38px' : '28px'};
            background: ${isSelected ? '#F4F3EC' : '#1C231E'};
            border: 2px solid ${isSelected ? '#727B5A' : catColor};
            border-radius: 50%;
            box-shadow: 0 4px 14px rgba(0,0,0,0.6);
            cursor: pointer;
            transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          ">
            <div style="
              width: ${isSelected ? '12px' : '8px'};
              height: ${isSelected ? '12px' : '8px'};
              background: ${isSelected ? '#25352A' : catColor};
              border-radius: 50%;
            "></div>
            ${
              isSaved
                ? `<div style="position:absolute; top:-3px; right:-3px; width:8px; height:8px; background:#727B5A; border-radius:50%; border:1px solid #1C231E;"></div>`
                : ''
            }
          </div>
        `,
        iconSize: [isSelected ? 38 : 28, isSelected ? 38 : 28],
        iconAnchor: [isSelected ? 19 : 14, isSelected ? 19 : 14],
      });

      const marker = L.marker(place.coordinates, { icon: customIcon }).addTo(map);

      marker.on('click', () => {
        setSelectedPlace(place);
        if (window.innerWidth >= 1024) {
          setIsDetailDrawerOpen(true);
        }
        map.flyTo(place.coordinates, 13, { duration: 0.8 });
      });

      marker.bindTooltip(
        `<div style="font-family:'Lexend',sans-serif; font-size:11px; font-weight:500; color:#F4F3EC; padding:2px 4px;">
           <span style="color:#AAB29A; text-transform:uppercase; font-size:9px; letter-spacing:0.5px;">${place.category}</span><br/>
           ${place.name}
         </div>`,
        { direction: 'top', offset: [0, -12], opacity: 0.95 }
      );

      markersRef.current[place.id] = marker;
    });

    // If a place is selected, pan to it
    if (selectedPlace) {
      map.flyTo(selectedPlace.coordinates, 13, { duration: 0.8 });
    }
  }, [filteredPlaces, selectedPlace, viewMode, savedIds]);

  const handleToggleSave = async (placeId: string, placeName: string) => {
    // Intercept unauthenticated users with clear contextual explanation
    if (!user) {
      openAuthModal({
        mode: 'signup',
        prompt: 'Create an account to save your favourite green spaces and keep your nature observations.',
        onComplete: () => {
          handleToggleSave(placeId, placeName);
        },
      });
      return;
    }

    const isCurrentlySaved = savedIds.includes(placeId);
    const { isSaved, updated } = toggleSavePlace(placeId);
    setSavedIds(updated);
    setToastMessage(isSaved ? `Added "${placeName}" to your saved places.` : `Removed "${placeName}" from saved.`);
    setTimeout(() => setToastMessage(null), 3000);
    onSavedChange?.();

    try {
      if (isCurrentlySaved) {
        await api.removeSavedPlace(placeId);
      } else {
        await api.savePlace(placeId);
      }
    } catch (err) {
      console.warn('Backend sync error for saved place:', err);
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-4.5rem)] flex flex-col bg-[#0E120F] relative">
      {/* Search and Category Control Bar */}
      <div className="border-b border-[#25352A] bg-[#121714]/90 backdrop-blur-md px-4 sm:px-6 py-3.5 sticky top-18 z-20 space-y-3">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#777B70]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Singapore parks, trails, amenities, flora..."
              className="w-full pl-10 pr-4 py-2 text-xs bg-[#1C231E] border border-[#25352A] rounded-full text-[#F4F3EC] placeholder-[#777B70] focus:outline-none focus:border-[#727B5A] focus:ring-1 focus:ring-[#727B5A] transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#777B70] hover:text-[#F4F3EC]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Mobile Segments: Map vs Sanctuaries (visible only on mobile/tablet < lg) */}
          <div className="flex lg:hidden items-center p-1 rounded-xl bg-[#1C231E] border border-[#25352A] w-full">
            <button
              onClick={() => {
                setMobileTab('map');
                setViewMode('split');
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                mobileTab === 'map'
                  ? 'bg-[#25352A] text-white shadow-sm border border-[#727B5A]/40'
                  : 'text-[#AAB29A] hover:text-white'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5 text-[#727B5A]" />
              <span>Interactive Map</span>
            </button>
            <button
              onClick={() => setMobileTab('list')}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                mobileTab === 'list'
                  ? 'bg-[#25352A] text-white shadow-sm border border-[#727B5A]/40'
                  : 'text-[#AAB29A] hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5 text-[#727B5A]" />
              <span>Sanctuaries ({filteredPlaces.length})</span>
            </button>
          </div>

          {/* Categories Pill Navigation */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 lg:pb-0 scroll-smooth -mx-1 px-1">
            {CATEGORIES.map((cat) => {
              const count =
                cat === 'All'
                  ? SINGAPORE_GREEN_SPACES.length
                  : SINGAPORE_GREEN_SPACES.filter((p) => p.category === cat).length;
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-all flex items-center gap-1.5 flex-shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-[#F4F3EC] text-[#252820] font-semibold shadow-sm'
                      : 'bg-[#1C231E] text-[#AAB29A] hover:bg-[#25352A] hover:text-white border border-[#25352A]'
                  }`}
                >
                  <span>{cat}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isActive ? 'bg-[#252820]/15 text-[#252820]' : 'bg-[#121714] text-[#777B70]'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
            {(searchQuery || selectedCategory !== 'All') && (
              <button
                onClick={() => {
                  setSelectedCategory('All');
                  setSearchQuery('');
                }}
                className="px-2.5 py-1 text-[11px] rounded-full text-[#AAB29A] hover:text-white bg-[#1C231E] border border-[#25352A] flex items-center gap-1 cursor-pointer transition-colors whitespace-nowrap flex-shrink-0"
                title="Reset all search and category filters"
              >
                <X className="w-3 h-3" />
                <span>Clear filters</span>
              </button>
            )}
          </div>

          {/* Desktop View Switcher Toggle */}
          <div className="hidden lg:flex items-center gap-1 bg-[#1C231E] p-1 rounded-full border border-[#25352A]">
            <button
              onClick={() => setViewMode('split')}
              className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                viewMode === 'split'
                  ? 'bg-[#25352A] text-white shadow-sm'
                  : 'text-[#AAB29A] hover:text-white'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>Map & List</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-[#25352A] text-white shadow-sm'
                  : 'text-[#AAB29A] hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Grid View</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Left Side: Place List / Cards */}
        <div
          className={`${
            viewMode === 'split' ? 'w-full lg:w-[420px] xl:w-[460px]' : 'w-full max-w-7xl mx-auto'
          } ${
            mobileTab === 'list' || viewMode === 'list' ? 'flex' : 'hidden lg:flex'
          } flex-col border-r border-[#25352A] bg-[#0E120F] overflow-y-auto z-10`}
          style={{ maxHeight: viewMode === 'split' ? 'calc(100vh - 8.5rem)' : 'none' }}
        >
          {/* Header count info */}
          <div className="px-5 py-3 border-b border-[#25352A]/60 flex items-center justify-between text-xs text-[#777B70]">
            <span>
              Showing <strong className="text-[#F4F3EC]">{filteredPlaces.length}</strong> living sanctuaries
            </span>
            <span className="text-[11px] text-[#AAB29A]">Singapore Baseline Cartography</span>
          </div>

          {/* Empty State */}
          {filteredPlaces.length === 0 && (
            <div className="p-12 text-center flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-2xl bg-[#1C231E] border border-[#25352A] flex items-center justify-center text-[#777B70] mb-3">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-medium text-[#F4F3EC] mb-1">No green spaces match your criteria</h3>
              <p className="text-xs text-[#777B70] max-w-xs mb-4">
                Try searching for a different area like "MacRitchie", or reset the category filter.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('All');
                  setSearchQuery('');
                }}
                className="px-4 py-1.5 text-xs rounded-full bg-[#25352A] text-[#F4F3EC] hover:bg-[#41483A]"
              >
                Reset Filters
              </button>
            </div>
          )}

          {/* Cards Grid / List */}
          <div
            className={`p-4 gap-3.5 ${
              viewMode === 'list'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                : 'flex flex-col'
            }`}
          >
            {filteredPlaces.map((place) => {
              const isSelected = selectedPlace?.id === place.id;
              const isSaved = savedIds.includes(place.id);

              return (
                <div
                  key={place.id}
                  onClick={() => {
                    setSelectedPlace(place);
                    setIsDetailDrawerOpen(true);
                    if (viewMode === 'split' && leafletMapRef.current) {
                      leafletMapRef.current.flyTo(place.coordinates, 13, { duration: 0.8 });
                    }
                  }}
                  className={`group relative rounded-2xl p-3.5 transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-[#1C231E] border-[#727B5A] shadow-lg ring-1 ring-[#727B5A]/50'
                      : 'bg-[#151A16] border-[#25352A] hover:border-[#41483A] hover:bg-[#1C231E]/80'
                  }`}
                >
                  <div className="flex gap-3.5">
                    {/* Thumbnail Image */}
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden flex-shrink-0 relative bg-[#121714]">
                      <img
                        src={place.imageUrl}
                        alt={place.name}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          // Fallback to placeholder green tone
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-medium bg-[#0E120F]/80 text-[#AAB29A] backdrop-blur-sm">
                        {place.region}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-1">
                          <span className="text-[10px] uppercase tracking-wider text-[#727B5A] font-semibold">
                            {place.category}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleSave(place.id, place.name);
                            }}
                            className={`p-1 rounded-md transition-colors ${
                              isSaved
                                ? 'text-[#727B5A] hover:text-white'
                                : 'text-[#777B70] hover:text-[#F4F3EC]'
                            }`}
                            aria-label={isSaved ? 'Remove from saved' : 'Save place'}
                          >
                            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
                          </button>
                        </div>
                        <h4 className="text-xs font-semibold text-[#F4F3EC] group-hover:text-white truncate">
                          {place.name}
                        </h4>
                        <p className="text-[11px] text-[#777B70] line-clamp-2 mt-0.5 leading-snug">
                          {place.shortDescription}
                        </p>
                      </div>

                      {/* Amenities preview */}
                      <div className="flex items-center gap-2 mt-2 text-[10px] text-[#AAB29A]">
                        <span>{place.sizeHectares} ha</span>
                        <span>•</span>
                        <span className="truncate">{place.amenities.slice(0, 2).join(', ')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Interactive Leaflet Map (In split mode) */}
        {viewMode === 'split' && (
          <div
            className={`flex-1 ${
              mobileTab === 'map' ? 'block h-[calc(100vh-14rem)] min-h-[460px]' : 'hidden'
            } lg:block lg:h-auto relative bg-[#121714]`}
          >
            <div ref={mapContainerRef} className="w-full h-full min-h-[460px]" />

            {/* Map Legend overlay */}
            <div className="absolute top-4 left-4 z-[400] bg-[#1C231E]/90 backdrop-blur-md px-3 py-2 rounded-xl border border-[#25352A] text-[11px] text-[#AAB29A] hidden sm:flex items-center gap-3 shadow-lg pointer-events-none">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#727B5A]" /> Nature Reserves
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#AAB29A]" /> Gardens
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#5E8B7E]" /> Waterfront
              </span>
            </div>

            {/* Mobile Floating Selected Sanctuary Preview Card */}
            {mobileTab === 'map' && selectedPlace && (
              <div className="lg:hidden absolute bottom-4 left-4 right-4 z-[450] bg-[#151A16]/95 backdrop-blur-xl p-3.5 rounded-2xl border border-[#727B5A]/50 shadow-2xl flex items-center justify-between gap-3 animate-in slide-in-from-bottom-2">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={selectedPlace.imageUrl}
                    alt={selectedPlace.name}
                    className="w-12 h-12 rounded-xl object-cover flex-shrink-0 bg-[#1C231E]"
                  />
                  <div className="min-w-0">
                    <span className="text-[9px] uppercase tracking-wider text-[#727B5A] font-semibold block">
                      {selectedPlace.category} • {selectedPlace.region}
                    </span>
                    <h4 className="text-xs font-semibold text-[#F4F3EC] truncate">
                      {selectedPlace.name}
                    </h4>
                    <span className="text-[10px] text-[#AAB29A]">
                      {selectedPlace.sizeHectares} ha
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setIsDetailDrawerOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-[#25352A] text-[#F4F3EC] text-xs font-semibold whitespace-nowrap hover:bg-[#F4F3EC] hover:text-[#252820] transition-colors cursor-pointer flex-shrink-0 border border-[#727B5A]/40"
                >
                  Details
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Selected Location Detail Drawer / Modal */}
      {selectedPlace && isDetailDrawerOpen && (
        <div
          className="fixed inset-0 z-[2000] flex items-end sm:items-center justify-center sm:justify-end bg-black/75 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200"
          onClick={() => {
            setIsDetailDrawerOpen(false);
          }}
          role="dialog"
          aria-modal="true"
          aria-label={selectedPlace.name}
        >
          <div
            className="w-full max-w-lg h-[88vh] sm:h-[90vh] sm:max-h-[860px] bg-[#151A16] border-t sm:border border-[#25352A] rounded-t-3xl sm:rounded-3xl flex flex-col shadow-2xl overflow-hidden relative z-10 animate-in slide-in-from-bottom-4 sm:slide-in-from-right-4 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile Drag Indicator Handle */}
            <div className="w-12 h-1.5 rounded-full bg-white/20 mx-auto my-2.5 sm:hidden flex-shrink-0" />
            {/* Modal Image Header */}
            <div className="relative h-56 sm:h-64 w-full bg-[#1C231E] flex-shrink-0">
              <img
                src={selectedPlace.imageUrl}
                alt={selectedPlace.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#151A16] via-black/40 to-black/20" />

              {/* Close Button */}
              <button
                onClick={() => setIsDetailDrawerOpen(false)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center transition-all focus:outline-none border border-white/20 hover:scale-105 shadow-lg cursor-pointer"
                aria-label="Close details"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Category & Region badges */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-[#25352A] text-[#AAB29A] border border-[#727B5A]/40 backdrop-blur-md">
                    {selectedPlace.category}
                  </span>
                  <span className="px-2 py-1 rounded-full text-[10px] font-medium bg-black/50 text-[#F4F3EC] backdrop-blur-md">
                    {selectedPlace.region} Region • {selectedPlace.sizeHectares} ha
                  </span>
                </div>

                <button
                  onClick={() => handleToggleSave(selectedPlace.id, selectedPlace.name)}
                  className={`p-2 rounded-full backdrop-blur-md border transition-all ${
                    savedIds.includes(selectedPlace.id)
                      ? 'bg-[#727B5A] text-white border-[#AAB29A]'
                      : 'bg-black/60 text-white border-white/20 hover:bg-black/80'
                  }`}
                  aria-label="Save this space"
                >
                  <Bookmark
                    className={`w-4 h-4 ${savedIds.includes(selectedPlace.id) ? 'fill-current' : ''}`}
                  />
                </button>
              </div>
            </div>

            {/* Modal Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 text-xs">
              <div>
                <h3 className="text-xl font-medium text-[#F4F3EC] tracking-tight mb-1">
                  {selectedPlace.name}
                </h3>
                <p className="text-[#AAB29A] text-[13px] leading-relaxed">
                  {selectedPlace.shortDescription}
                </p>
              </div>

              {/* Full Description */}
              <div className="bg-[#1C231E]/80 rounded-xl p-4 border border-[#25352A] space-y-2">
                <h5 className="text-[11px] uppercase tracking-wider text-[#727B5A] font-semibold flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5" />
                  Ecosystem & Heritage
                </h5>
                <p className="text-[#F4F3EC]/90 text-[12px] leading-relaxed">
                  {selectedPlace.description}
                </p>
              </div>

              {/* Key Highlights */}
              <div>
                <h5 className="text-[11px] uppercase tracking-wider text-[#AAB29A] font-semibold mb-2">
                  Key Natural Highlights
                </h5>
                <div className="grid grid-cols-2 gap-2">
                  {selectedPlace.highlights.map((h, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 p-2 rounded-lg bg-[#1C231E] border border-[#25352A] text-[11px] text-[#F4F3EC]"
                    >
                      <Sparkles className="w-3 h-3 text-[#727B5A] flex-shrink-0" />
                      <span className="truncate">{h}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Native Flora & Fauna Monitored */}
              <div>
                <h5 className="text-[11px] uppercase tracking-wider text-[#AAB29A] font-semibold mb-2 flex items-center gap-1.5">
                  <TreePine className="w-3.5 h-3.5 text-[#727B5A]" />
                  Monitored Native Flora & Fauna
                </h5>
                <div className="flex flex-wrap gap-1.5">
                  {selectedPlace.nativeFloraFauna.map((item, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-md bg-[#25352A]/60 border border-[#727B5A]/30 text-[11px] text-[#F4F3EC]"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              {/* Amenities */}
              <div>
                <h5 className="text-[11px] uppercase tracking-wider text-[#AAB29A] font-semibold mb-2">
                  Available Facilities & Amenities
                </h5>
                <div className="flex flex-wrap gap-1.5">
                  {selectedPlace.amenities.map((amenity, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#1C231E] border border-[#25352A] text-[11px] text-[#F4F3EC]"
                    >
                      <Check className="w-3 h-3 text-[#727B5A]" />
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>

              {/* Accessibility Information */}
              <div className="bg-[#1C231E] rounded-xl p-4 border border-[#25352A] space-y-1.5">
                <h5 className="text-[11px] uppercase tracking-wider text-[#AAB29A] font-semibold flex items-center gap-1.5">
                  <Accessibility className="w-3.5 h-3.5 text-[#727B5A]" />
                  Accessibility & Path Grading
                </h5>
                <p className="text-[11.5px] text-[#777B70] leading-relaxed">
                  {selectedPlace.accessibilityInfo}
                </p>
              </div>

              {/* Opening Hours */}
              <div className="flex items-center gap-2 text-xs text-[#AAB29A]">
                <Clock className="w-4 h-4 text-[#727B5A]" />
                <span>{selectedPlace.openingHours}</span>
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="p-4 sm:p-5 border-t border-[#25352A] bg-[#121714] flex flex-col sm:flex-row items-center gap-2.5 flex-shrink-0">
              <a
                href={selectedPlace.directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold bg-[#F4F3EC] text-[#252820] hover:bg-white transition-colors flex items-center justify-center gap-2"
              >
                <Navigation className="w-3.5 h-3.5 text-[#25352A]" />
                <span>Get Directions (Maps)</span>
                <ExternalLink className="w-3 h-3 opacity-60" />
              </a>

              {onSelectPlaceForJournal && (
                <button
                  onClick={() => {
                    if (!user) {
                      openAuthModal({
                        mode: 'signup',
                        prompt: 'Create an account to keep your field observations in the nature journal.',
                        returnTab: 'journal',
                        onComplete: () => {
                          onSelectPlaceForJournal(selectedPlace.name);
                        },
                      });
                      return;
                    }
                    onSelectPlaceForJournal(selectedPlace.name);
                    setSelectedPlace(null);
                  }}
                  className="w-full sm:w-auto py-2.5 px-4 rounded-xl text-xs font-medium bg-[#25352A] text-[#F4F3EC] hover:bg-[#41483A] transition-colors flex items-center justify-center gap-2 border border-[#727B5A]/40 cursor-pointer"
                >
                  <TreePine className="w-3.5 h-3.5 text-[#AAB29A]" />
                  <span>Log in Nature Journal</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[2050] bg-[#1C231E] border border-[#727B5A] text-[#F4F3EC] px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-xs animate-in slide-in-from-bottom duration-300">
          <Bookmark className="w-4 h-4 text-[#727B5A] fill-current" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
