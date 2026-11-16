import React, { useEffect, useState, useCallback } from 'react';
import { NavTab } from './Navigation';
import { SylvaHero } from '@designcodeio/threeui';
import '@designcodeio/threeui/style.css';
import {
  Compass,
  MapPin,
  BarChart3,
  BookOpen,
  ArrowRight,
  Sparkles,
  TreePine,
  Wind,
  Droplets,
  Thermometer,
  ShieldCheck,
  ChevronDown,
  Play,
  RotateCcw,
  Activity,
  Layers,
} from 'lucide-react';
import { SINGAPORE_GREEN_SPACES } from '../data/singaporePlaces';
import { REGIONAL_SUMMARIES } from '../data/environmentalData';
import { useAuth } from '../context/AuthContext';
import { ImmersiveExperienceModal } from './ImmersiveExperienceModal';
import { api, EnvironmentalSnapshotData } from '../services/apiClient';
import { MicroclimateSimulator } from './MicroclimateSimulator';
import { EcologicalCorridors } from './EcologicalCorridors';
import { EnvironmentalAdvisory } from './EnvironmentalAdvisory';

interface OverviewProps {
  onNavigate: (tab: NavTab, placeId?: string) => void;
  onReplayIntro?: () => void;
}

export const Overview: React.FC<OverviewProps> = ({ onNavigate, onReplayIntro }) => {
  const { user, openAuthModal } = useAuth();
  const [isExperienceModalOpen, setIsExperienceModalOpen] = useState(false);
  const [liveTelemetry, setLiveTelemetry] = useState<EnvironmentalSnapshotData | null>(null);
  const [telemetryTime, setTelemetryTime] = useState<string>('Connecting to live NEA & Open-Meteo telemetry...');

  // Fetch real-time environmental snapshot from backend
  const loadLiveTelemetry = useCallback(async () => {
    try {
      const data = await api.getLiveEnvironmental();
      if (data) {
        setLiveTelemetry(data);
        const timeStr = new Date(data.retrieved_at).toLocaleTimeString();
        setTelemetryTime(`Live sync: ${timeStr} SGT • ${data.provider}`);
      }
    } catch (err) {
      console.warn('Live telemetry fetch fallback to baseline:', err);
      setTelemetryTime('Baseline reference telemetry');
    }
  }, []);

  useEffect(() => {
    loadLiveTelemetry();
  }, [loadLiveTelemetry]);

  // Listen for navigation messages dispatched from within the 3D scene iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'TERAVIA_NAVIGATE') {
        const page = event.data.page;
        if (page === 'discover' || page === 'film' || page === 'play') {
          setIsExperienceModalOpen(true);
        } else if (
          ['overview', 'map', 'insights', 'explorer', 'journal', 'stories', 'saved', 'dashboard'].includes(
            page
          )
        ) {
          onNavigate(page as NavTab);
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onNavigate]);

  const centralBaseline = REGIONAL_SUMMARIES.Central;
  const centralPm25 = liveTelemetry?.pm25?.Central ?? centralBaseline.pm25;
  const centralTemp = liveTelemetry?.air_temperature?.Central ?? centralBaseline.temperature;
  const centralHumidity = liveTelemetry?.relative_humidity?.Central ?? centralBaseline.humidity;

  const spotlightPlaces = SINGAPORE_GREEN_SPACES.slice(0, 3);

  return (
    <div className="w-full flex flex-col bg-[#0E120F]">
      {/* ── Immersive 3D Cinematic Hero ── */}
      <section className="relative w-full h-[78vh] sm:h-[88vh] min-h-[500px] sm:min-h-[620px] max-h-[920px] overflow-hidden bg-[#0E120F]">
        <div className="shader-frame w-full h-full">
          <SylvaHero
            variant="living-green"
            headingFont="lexend"
            bodyFont="lexend"
            headingWeight="300"
            bodyWeight="300"
            primaryColor="#ffffff"
            headingSize={63}
            bodySize={16.5}
            headingLetterSpacing={-0.006}
          />
        </div>

        {/* Ambient bottom action bar */}
        <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-20 pointer-events-auto flex items-center gap-2 sm:gap-3 px-3">
          <button
            onClick={() => {
              const el = document.getElementById('overview-content');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#151A16]/90 hover:bg-[#1C231E] border border-[#25352A] text-xs text-[#AAB29A] hover:text-white backdrop-blur-md transition-all cursor-pointer group shadow-xl"
            aria-label="Scroll to discover TERAVIA"
          >
            <span className="text-[11px] uppercase tracking-[0.2em] font-medium">
              Explore Platform
            </span>
            <ChevronDown className="w-3.5 h-3.5 group-hover:translate-y-0.5 transition-transform text-[#727B5A]" />
          </button>

          {onReplayIntro && (
            <button
              onClick={onReplayIntro}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#151A16]/80 hover:bg-[#1C231E] border border-[#25352A] text-[11px] text-[#777B70] hover:text-[#AAB29A] backdrop-blur-md transition-all cursor-pointer shadow-lg"
              title="Replay 5.6s cinematic introduction"
            >
              <RotateCcw className="w-3 h-3 text-[#727B5A]" />
              <span>Intro</span>
            </button>
          )}
        </div>
      </section>

      {/* Immersive Platform Introduction Modal */}
      <ImmersiveExperienceModal
        isOpen={isExperienceModalOpen}
        onClose={() => setIsExperienceModalOpen(false)}
        onNavigate={onNavigate}
      />

      {/* ── Below-Hero Overview Content ── */}
      <div id="overview-content" className="w-full scroll-mt-20">
        {/* ── Section 1: Three Interactive Cards ── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 relative z-10 mb-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Card 1: Living Landscapes */}
            <div className="editorial-card animate-float-gentle group rounded-3xl bg-[#151A16]/95 border border-[#25352A] p-6 sm:p-7 backdrop-blur-md shadow-2xl hover:border-[#727B5A]/60 hover:bg-[#1C231E] transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#727B5A]">
                    01 • Living Landscapes
                  </span>
                  <div className="w-8 h-8 rounded-full bg-[#25352A] flex items-center justify-center text-[#AAB29A] group-hover:scale-110 transition-transform">
                    <MapPin className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="text-xl font-medium text-[#F4F3EC] tracking-tight">
                  Living Landscapes
                </h3>
                <p className="text-xs text-[#777B70] leading-relaxed">
                  Discover parks, gardens, and natural spaces across Singapore with accessibility details, monitored biodiversity, and trail maps.
                </p>
              </div>
              <div className="pt-6">
                <button
                  onClick={() => onNavigate('map')}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-[#25352A] text-[#F4F3EC] hover:bg-[#F4F3EC] hover:text-[#252820] transition-colors flex items-center justify-between group/btn cursor-pointer"
                >
                  <span>Explore places</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* Card 2: Environmental Insights */}
            <div className="editorial-card animate-float-delayed group rounded-3xl bg-[#151A16]/95 border border-[#25352A] p-6 sm:p-7 backdrop-blur-md shadow-2xl hover:border-[#727B5A]/60 hover:bg-[#1C231E] transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#727B5A]">
                    02 • Environmental Insights
                  </span>
                  <div className="w-8 h-8 rounded-full bg-[#25352A] flex items-center justify-center text-[#AAB29A] group-hover:scale-110 transition-transform">
                    <BarChart3 className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="text-xl font-medium text-[#F4F3EC] tracking-tight">
                  Environmental Insights
                </h3>
                <p className="text-xs text-[#777B70] leading-relaxed">
                  Explore genuine environmental measurements, ambient temperature variations, relative humidity, and canopy heat mitigation trends.
                </p>
              </div>
              <div className="pt-6">
                <button
                  onClick={() => onNavigate('insights')}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-[#25352A] text-[#F4F3EC] hover:bg-[#F4F3EC] hover:text-[#252820] transition-colors flex items-center justify-between group/btn cursor-pointer"
                >
                  <span>View insights</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* Card 3: Field Journal */}
            <div className="editorial-card animate-float-gentle group rounded-3xl bg-[#151A16]/95 border border-[#25352A] p-6 sm:p-7 backdrop-blur-md shadow-2xl hover:border-[#727B5A]/60 hover:bg-[#1C231E] transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#727B5A]">
                    03 • Field Journal
                  </span>
                  <div className="w-8 h-8 rounded-full bg-[#25352A] flex items-center justify-center text-[#AAB29A] group-hover:scale-110 transition-transform">
                    <BookOpen className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="text-xl font-medium text-[#F4F3EC] tracking-tight">
                  Field Journal
                </h3>
                <p className="text-xs text-[#777B70] leading-relaxed">
                  Document and revisit your encounters with nature. Record species sightings, weather conditions, and photos safely in your browser.
                </p>
              </div>
              <div className="pt-6">
                <button
                  onClick={() => {
                    if (user) {
                      onNavigate('journal');
                    } else {
                      openAuthModal({
                        mode: 'signup',
                        prompt: 'Create an account to save your favourite green spaces and keep your nature observations.',
                        returnTab: 'journal',
                      });
                    }
                  }}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-[#25352A] text-[#F4F3EC] hover:bg-[#F4F3EC] hover:text-[#252820] transition-colors flex items-center justify-between group/btn cursor-pointer"
                >
                  <span>{user ? 'Open journal' : 'Start nature journal'}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ── Section 2: Core Philosophy & Real Environmental Highlights ── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-[#25352A]/60">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 space-y-4">
              <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#727B5A]">
                Computational Ecology & Spatial Science
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-normal text-[#F4F3EC] tracking-tight leading-tight">
                Real-Time Sensor Telemetry & Canopy Thermodynamics.
              </h2>
              <p className="text-xs sm:text-sm text-[#777B70] leading-relaxed">
                TERAVIA unifies open sensor networks from Singapore's National Environment Agency (Data.gov.sg), Open-Meteo atmospheric models, and high-resolution urban canopy coverage. Observe the subtle environmental pulses that shape Singapore's tropical biodiversity.
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => onNavigate('map')}
                  className="px-5 py-2.5 rounded-full text-xs font-semibold bg-[#F4F3EC] text-[#252820] hover:bg-white transition-colors cursor-pointer"
                >
                  Explore the Living Map
                </button>
                <button
                  onClick={() => onNavigate('insights')}
                  className="px-5 py-2.5 rounded-full text-xs font-medium bg-[#1C231E] text-[#AAB29A] hover:text-white border border-[#25352A] transition-colors cursor-pointer"
                >
                  Telemetry Insights
                </button>
              </div>
            </div>

            {/* Environmental Baseline Indicators with Live Data Integration */}
            <div className="lg:col-span-7 bg-[#151A16] rounded-3xl p-6 sm:p-8 border border-[#25352A] shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-[#25352A]">
                <div>
                  <h4 className="text-sm font-medium text-[#F4F3EC]">
                    Singapore Environmental Snapshot
                  </h4>
                  <p className="text-[11px] text-[#777B70]">
                    {telemetryTime}
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-950/40 text-emerald-400 border border-emerald-800/40 self-start sm:self-auto flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Real Telemetry Feed</span>
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-[#1C231E] p-4 rounded-2xl border border-[#25352A]/80">
                  <div className="flex items-center gap-1.5 text-[#727B5A] text-xs mb-1">
                    <Wind className="w-3.5 h-3.5" />
                    <span className="text-[10px] uppercase tracking-wider">PM2.5</span>
                  </div>
                  <div className="text-2xl font-semibold text-[#F4F3EC]">
                    {centralPm25 !== null ? Math.round(centralPm25) : '--'}
                  </div>
                  <div className="text-[10px] text-[#AAB29A] mt-0.5">µg/m³ • Central</div>
                </div>

                <div className="bg-[#1C231E] p-4 rounded-2xl border border-[#25352A]/80">
                  <div className="flex items-center gap-1.5 text-[#727B5A] text-xs mb-1">
                    <Thermometer className="w-3.5 h-3.5" />
                    <span className="text-[10px] uppercase tracking-wider">Temperature</span>
                  </div>
                  <div className="text-2xl font-semibold text-[#F4F3EC]">
                    {centralTemp !== null ? Number(centralTemp).toFixed(1) : '--'}°C
                  </div>
                  <div className="text-[10px] text-[#AAB29A] mt-0.5">Open-Meteo Sensor</div>
                </div>

                <div className="bg-[#1C231E] p-4 rounded-2xl border border-[#25352A]/80">
                  <div className="flex items-center gap-1.5 text-[#727B5A] text-xs mb-1">
                    <Droplets className="w-3.5 h-3.5" />
                    <span className="text-[10px] uppercase tracking-wider">Humidity</span>
                  </div>
                  <div className="text-2xl font-semibold text-[#F4F3EC]">
                    {centralHumidity !== null ? Math.round(centralHumidity) : '--'}%
                  </div>
                  <div className="text-[10px] text-[#AAB29A] mt-0.5">Relative Moisture</div>
                </div>

                <div className="bg-[#1C231E] p-4 rounded-2xl border border-[#25352A]/80">
                  <div className="flex items-center gap-1.5 text-[#727B5A] text-xs mb-1">
                    <TreePine className="w-3.5 h-3.5" />
                    <span className="text-[10px] uppercase tracking-wider">Canopy Buffer</span>
                  </div>
                  <div className="text-2xl font-semibold text-[#F4F3EC]">-2.8°C</div>
                  <div className="text-[10px] text-[#AAB29A] mt-0.5">Vegetation Cooling</div>
                </div>
              </div>

              <div className="mt-5 p-3 rounded-xl bg-[#121714] border border-[#25352A]/60 flex items-start gap-2.5 text-[11px] text-[#777B70]">
                <ShieldCheck className="w-4 h-4 text-[#727B5A] flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Data Provenance:</strong> Microclimate indicators are queried from Singapore National Environment Agency (Data.gov.sg) public API and Open-Meteo meteorological models.
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ── Real-Time Biometeorological Advisory ── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <EnvironmentalAdvisory
            telemetry={liveTelemetry}
            onExploreSanctuary={() => onNavigate('map', 'macritchie')}
          />
        </section>

        {/* ── Section: Interactive Canopy Cooling & Microclimate Simulator ── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 border-t border-[#25352A]/60">
          <MicroclimateSimulator onExploreMap={() => onNavigate('map')} />
        </section>

        {/* ── Section 3: Spotlight Living Sanctuaries (Living Map Preview) ── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-[#25352A]/60">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <span className="text-[11px] uppercase tracking-[0.2em] font-semibold text-[#727B5A]">
                Living Sanctuaries
              </span>
              <h2 className="text-2xl sm:text-3xl font-medium text-[#F4F3EC] tracking-tight mt-1">
                Featured Singapore Green Spaces
              </h2>
            </div>
            <button
              onClick={() => onNavigate('map')}
              className="text-xs font-semibold text-[#AAB29A] hover:text-white flex items-center gap-1.5 group self-start sm:self-auto cursor-pointer"
            >
              <span>Explore all locations on Living Map</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-[#727B5A]" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {spotlightPlaces.map((place) => (
              <div
                key={place.id}
                onClick={() => onNavigate('map', place.id)}
                className="group rounded-3xl bg-[#151A16] border border-[#25352A] overflow-hidden hover:border-[#727B5A] transition-all cursor-pointer shadow-lg flex flex-col justify-between"
              >
                <div className="relative h-48 w-full overflow-hidden bg-[#1C231E]">
                  <img
                    src={place.imageUrl}
                    alt={place.name}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#151A16] via-transparent to-black/30" />
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-[#0E120F]/80 text-[#AAB29A] backdrop-blur-md">
                    {place.category}
                  </span>
                  <span className="absolute bottom-3 right-3 px-2 py-0.5 rounded text-[10px] font-medium bg-black/60 text-[#F4F3EC] backdrop-blur-md">
                    {place.region} • {place.sizeHectares} ha
                  </span>
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="text-base font-semibold text-[#F4F3EC] group-hover:text-white transition-colors">
                      {place.name}
                    </h3>
                    <p className="text-xs text-[#777B70] line-clamp-2 mt-1 leading-relaxed">
                      {place.shortDescription}
                    </p>
                  </div>
                  <div className="pt-2 flex items-center justify-between text-xs border-t border-[#25352A]/60 text-[#AAB29A]">
                    <span className="truncate">{place.amenities.slice(0, 2).join(' • ')}</span>
                    <span className="text-[11px] text-[#727B5A] group-hover:translate-x-1 transition-transform flex items-center gap-1 font-medium">
                      Inspect on Map <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Section: Singapore Ecological Corridors & Wildlife Connectivity ── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 border-t border-[#25352A]/60">
          <EcologicalCorridors
            onSelectPark={(parkId) => onNavigate('map', parkId)}
            onNavigateToMap={() => onNavigate('map')}
          />
        </section>

        {/* ── Section 4: Environmental Insights Preview ── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-[#25352A]/60">
          <div className="rounded-3xl bg-[#151A16] border border-[#25352A] p-6 sm:p-10 shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-6 space-y-4">
                <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#727B5A]">
                  Environmental Insights Preview
                </span>
                <h3 className="text-2xl sm:text-3xl font-normal text-[#F4F3EC] tracking-tight">
                  Microclimate variance across Singapore’s five regions.
                </h3>
                <p className="text-xs sm:text-sm text-[#777B70] leading-relaxed">
                  Discover how dense urban canopies create thermal buffers, reduce radiant heat, and moderate relative moisture across Central, North, South, East, and West districts.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => onNavigate('insights')}
                    className="px-6 py-3 rounded-full text-xs font-semibold bg-[#25352A] text-white hover:bg-[#F4F3EC] hover:text-[#252820] transition-colors flex items-center gap-2 cursor-pointer shadow-md"
                  >
                    <BarChart3 className="w-4 h-4 text-[#727B5A]" />
                    <span>Open Environmental Insights Dashboard</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </button>
                </div>
              </div>

              <div className="lg:col-span-6 grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-[#1C231E] border border-[#25352A]">
                  <div className="text-[10px] uppercase tracking-wider text-[#727B5A] font-semibold">
                    Air Quality Index
                  </div>
                  <div className="text-xl font-medium text-[#F4F3EC] mt-1">PM2.5 Realtime</div>
                  <p className="text-[11px] text-[#777B70] mt-1">
                    Continuous monitoring with regional breakdown and 24-hour trends.
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-[#1C231E] border border-[#25352A]">
                  <div className="text-[10px] uppercase tracking-wider text-[#727B5A] font-semibold">
                    Microclimates
                  </div>
                  <div className="text-xl font-medium text-[#F4F3EC] mt-1">Thermal Buffer</div>
                  <p className="text-[11px] text-[#777B70] mt-1">
                    Quantified cooling benefit of Singapore’s urban canopy.
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-[#1C231E] border border-[#25352A]">
                  <div className="text-[10px] uppercase tracking-wider text-[#727B5A] font-semibold">
                    Cartography
                  </div>
                  <div className="text-xl font-medium text-[#F4F3EC] mt-1">Living Map</div>
                  <p className="text-[11px] text-[#777B70] mt-1">
                    Interactive coordinates, trail conditions, and accessibility guides.
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-[#1C231E] border border-[#25352A]">
                  <div className="text-[10px] uppercase tracking-wider text-[#727B5A] font-semibold">
                    Citizen Science
                  </div>
                  <div className="text-xl font-medium text-[#F4F3EC] mt-1">Field Journal</div>
                  <p className="text-[11px] text-[#777B70] mt-1">
                    Document species sightings with photos and weather context.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Section 5: Launch CTA Banner ── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="rounded-3xl bg-gradient-to-br from-[#25352A] to-[#151A16] border border-[#727B5A]/40 p-8 sm:p-12 text-center relative overflow-hidden shadow-2xl">
            <div className="max-w-2xl mx-auto space-y-4 relative z-10">
              <span className="px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-[#1C231E]/80 text-[#AAB29A] border border-[#727B5A]/30">
                Explore the Living World
              </span>
              <h2 className="text-2xl sm:text-4xl font-normal text-[#F4F3EC] tracking-tight">
                Ready to see your surroundings differently?
              </h2>
              <p className="text-xs sm:text-sm text-[#AAB29A] leading-relaxed max-w-xl mx-auto">
                Step into the living map of Singapore, monitor regional microclimate variance, or start logging your field observations.
              </p>
              <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => onNavigate('map')}
                  className="px-6 py-3 rounded-full text-xs font-semibold bg-[#F4F3EC] text-[#252820] hover:bg-white transition-all shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-[#727B5A]" />
                  <span>Launch Living Map</span>
                </button>
                <button
                  onClick={() => {
                    if (user) {
                      onNavigate('journal');
                    } else {
                      openAuthModal({
                        mode: 'signup',
                        prompt: 'Create an account to save your favourite green spaces and keep your nature observations.',
                        returnTab: 'journal',
                      });
                    }
                  }}
                  className="px-6 py-3 rounded-full text-xs font-medium bg-[#1C231E] text-[#F4F3EC] hover:bg-[#25352A] border border-[#727B5A]/40 transition-colors cursor-pointer"
                >
                  <span>{user ? 'Open Nature Journal' : 'Create Free Account'}</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
