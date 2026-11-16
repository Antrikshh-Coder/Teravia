import React, { useState } from 'react';
import { NEIGHBOURHOOD_PROFILES } from '../data/neighbourhoodsData';
import { SINGAPORE_GREEN_SPACES } from '../data/singaporePlaces';
import { NeighbourhoodProfile } from '../types';
import {
  Layers,
  Search,
  Check,
  Plus,
  X,
  MapPin,
  ExternalLink,
  Info,
  ShieldCheck,
  TreePine,
  Thermometer,
  Wind,
  Footprints,
} from 'lucide-react';

interface NeighbourhoodExplorerProps {
  onNavigateToMap: (placeId?: string) => void;
}

export const NeighbourhoodExplorer: React.FC<NeighbourhoodExplorerProps> = ({
  onNavigateToMap,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([
    'bishan-ang-mo-kio',
    'marina-bay',
  ]);

  const filteredNeighbourhoods = NEIGHBOURHOOD_PROFILES.filter((item) => {
    const q = searchQuery.toLowerCase().trim();
    return (
      !q ||
      item.name.toLowerCase().includes(q) ||
      item.planningArea.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q)
    );
  });

  const selectedProfiles = NEIGHBOURHOOD_PROFILES.filter((item) =>
    selectedIds.includes(item.id)
  );

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      if (selectedIds.length > 1) {
        setSelectedIds(selectedIds.filter((item) => item !== id));
      }
    } else {
      if (selectedIds.length < 3) {
        setSelectedIds([...selectedIds, id]);
      }
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-4.5rem)] bg-[#0E120F] text-[#F4F3EC] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#727B5A]">
            <Layers className="w-4 h-4" />
            <span>Spatial Urban Ecology</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-[#F4F3EC]">
            Neighbourhood Explorer
          </h1>
          <p className="text-xs sm:text-sm text-[#777B70] max-w-2xl leading-relaxed">
            Select and compare up to three Singapore districts side-by-side to understand park accessibility, canopy shelter, and microclimate heat mitigation.
          </p>
        </div>

        {/* Selection Strip */}
        <div className="rounded-3xl bg-[#151A16] border border-[#25352A] p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#25352A]">
            <span className="text-xs font-medium text-[#AAB29A]">
              Selected to compare ({selectedIds.length}/3 max):
            </span>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#777B70]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter districts..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#1C231E] border border-[#25352A] rounded-full text-[#F4F3EC] focus:outline-none focus:border-[#727B5A]"
              />
            </div>
          </div>

          {/* District selector buttons */}
          <div className="flex flex-wrap gap-2">
            {filteredNeighbourhoods.map((district) => {
              const isSelected = selectedIds.includes(district.id);
              const isDisabled = !isSelected && selectedIds.length >= 3;
              return (
                <button
                  key={district.id}
                  disabled={isDisabled}
                  onClick={() => toggleSelect(district.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-2 border ${
                    isSelected
                      ? 'bg-[#25352A] text-white border-[#727B5A] shadow-sm'
                      : isDisabled
                      ? 'bg-[#151A16] text-[#777B70]/40 border-[#25352A]/50 cursor-not-allowed'
                      : 'bg-[#1C231E] text-[#AAB29A] border-[#25352A] hover:border-[#41483A] hover:text-white'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-[#AAB29A]' : 'bg-[#777B70]'}`} />
                  <span>{district.name}</span>
                  {isSelected ? (
                    <X className="w-3.5 h-3.5 ml-1 opacity-70 hover:opacity-100" />
                  ) : (
                    <Plus className="w-3.5 h-3.5 ml-1 opacity-50" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Side-by-Side Comparison Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {selectedProfiles.map((district) => {
            const nearbySpaces = SINGAPORE_GREEN_SPACES.filter((space) =>
              district.nearbySpaces.includes(space.id)
            );

            return (
              <div
                key={district.id}
                className="rounded-3xl bg-[#151A16] border border-[#25352A] p-6 flex flex-col justify-between space-y-6 shadow-xl"
              >
                {/* Header */}
                <div className="space-y-1 pb-4 border-b border-[#25352A]">
                  <div className="flex items-start justify-between">
                    <span className="text-[10px] uppercase tracking-wider text-[#727B5A] font-semibold">
                      {district.planningArea}
                    </span>
                    <button
                      onClick={() => toggleSelect(district.id)}
                      className="text-[#777B70] hover:text-white p-1"
                      aria-label="Remove from comparison"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <h3 className="text-xl font-medium text-[#F4F3EC]">{district.name}</h3>
                  <p className="text-xs text-[#777B70] leading-relaxed pt-1">
                    {district.description}
                  </p>
                </div>

                {/* Metrics Breakdown */}
                <div className="space-y-3 text-xs">
                  {/* Park Proximity */}
                  <div className="p-3 rounded-2xl bg-[#1C231E] border border-[#25352A] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Footprints className="w-4 h-4 text-[#727B5A]" />
                      <span className="text-[#AAB29A]">Park Access (&lt;400m)</span>
                    </div>
                    <span className="font-semibold text-[#F4F3EC]">
                      {district.parkProximityPct}%
                    </span>
                  </div>

                  {/* Canopy Cover */}
                  <div className="p-3 rounded-2xl bg-[#1C231E] border border-[#25352A] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TreePine className="w-4 h-4 text-[#727B5A]" />
                      <span className="text-[#AAB29A]">Tree Canopy Cover</span>
                    </div>
                    <span className="font-semibold text-[#F4F3EC]">
                      {district.canopyCoverPct}%
                    </span>
                  </div>

                  {/* Thermal Cooling Offset */}
                  <div className="p-3 rounded-2xl bg-[#1C231E] border border-[#25352A] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Thermometer className="w-4 h-4 text-[#727B5A]" />
                      <span className="text-[#AAB29A]">Vegetation Heat Offset</span>
                    </div>
                    <span className="font-semibold text-[#AAB29A]">
                      -{district.coolingOffsetC}°C
                    </span>
                  </div>

                  {/* Average PM2.5 */}
                  <div className="p-3 rounded-2xl bg-[#1C231E] border border-[#25352A] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Wind className="w-4 h-4 text-[#727B5A]" />
                      <span className="text-[#AAB29A]">Mean PM2.5 Level</span>
                    </div>
                    <span className="font-semibold text-[#F4F3EC]">
                      {district.avgPm25} µg/m³
                    </span>
                  </div>

                  {/* Park Connectors */}
                  <div className="p-3 rounded-2xl bg-[#1C231E] border border-[#25352A] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-[#727B5A]" />
                      <span className="text-[#AAB29A]">Active Connectors</span>
                    </div>
                    <span className="font-semibold text-[#F4F3EC]">
                      {district.connectorLengthKm} km
                    </span>
                  </div>
                </div>

                {/* Dominant Habitat */}
                <div className="text-xs space-y-1">
                  <span className="text-[11px] uppercase tracking-wider text-[#727B5A] font-semibold">
                    Dominant Habitat Type
                  </span>
                  <p className="text-[11.5px] text-[#AAB29A] leading-relaxed">
                    {district.dominantHabitat}
                  </p>
                </div>

                {/* Nearby Green Spaces with Jump Links */}
                <div className="space-y-2 pt-2 border-t border-[#25352A]/60">
                  <span className="text-[11px] uppercase tracking-wider text-[#AAB29A] font-semibold">
                    Connected Green Spaces
                  </span>
                  <div className="space-y-1.5">
                    {nearbySpaces.map((space) => (
                      <button
                        key={space.id}
                        onClick={() => onNavigateToMap(space.id)}
                        className="w-full p-2.5 rounded-xl bg-[#1C231E] hover:bg-[#25352A] transition-colors border border-[#25352A] flex items-center justify-between text-left text-xs group cursor-pointer"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <MapPin className="w-3.5 h-3.5 text-[#727B5A]" />
                          <span className="text-[#F4F3EC] truncate">{space.name}</span>
                        </div>
                        <span className="text-[10px] text-[#AAB29A] group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                          Map <ExternalLink className="w-2.5 h-2.5" />
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Limitations Note */}
                <div className="p-3 rounded-xl bg-[#121714] border border-[#25352A]/60 text-[10.5px] text-[#777B70] leading-snug">
                  <span className="font-medium text-[#AAB29A]">Telemetry Note: </span>
                  {district.limitationsNote}
                </div>
              </div>
            );
          })}
        </div>

        {/* Methodology & Limitations Transparency Section */}
        <div className="rounded-3xl bg-[#151A16] border border-[#25352A] p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#AAB29A]">
            <ShieldCheck className="w-4 h-4 text-[#727B5A]" />
            <span>Methodological Integrity & Limitations</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-[#777B70] leading-relaxed">
            <div className="space-y-2">
              <h4 className="font-medium text-[#F4F3EC]">Why TERAVIA Avoids a Single Aggregate Score</h4>
              <p>
                Environmental quality is multi-dimensional. Condensing air particulate loading, canopy shade, and wetland biodiversity into a single superficial numerical score (e.g. "82/100") conceals critical trade-offs. A waterfront area may experience lower tree canopy but benefit from sea breeze dispersion; an urban heartland may exhibit higher particulates alongside extensive park connectivity.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-[#F4F3EC]">Distinguishing Measured vs Derived Values</h4>
              <p>
                Ambient temperature and PM2.5 represent spatial telemetry averages derived from station networks. Park proximity and canopy density are geospatial calculations derived from high-resolution satellite spectral indices. All parameters are transparently isolated to preserve scientific clarity.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
