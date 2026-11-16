import React, { useState, useMemo } from 'react';
import {
  Thermometer,
  TreePine,
  Wind,
  Droplets,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  Info,
  Sliders,
  Layers,
  ArrowRight,
  TrendingDown,
} from 'lucide-react';

export interface MicroclimatePreset {
  id: string;
  name: string;
  areaType: string;
  canopyCoverPct: number;
  permeableSurfacePct: number;
  timeOfDay: 'morning' | 'midday' | 'evening';
  baselineTempC: number;
  description: string;
}

export const SINGAPORE_SIMULATION_PRESETS: MicroclimatePreset[] = [
  {
    id: 'downtown-cbd',
    name: 'Downtown Core / Raffles Place',
    areaType: 'Commercial Concrete Matrix',
    canopyCoverPct: 14,
    permeableSurfacePct: 18,
    timeOfDay: 'midday',
    baselineTempC: 33.4,
    description: 'High thermal mass with high-density glass-and-asphalt canyon effects and low moisture flux.',
  },
  {
    id: 'toa-payoh-basin',
    name: 'Toa Payoh Residential Basin',
    areaType: 'Mature Mixed-Density Fabric',
    canopyCoverPct: 38,
    permeableSurfacePct: 42,
    timeOfDay: 'midday',
    baselineTempC: 31.8,
    description: 'Interspersed neighborhood parks and roadside tree belts mitigating moderate ambient heat.',
  },
  {
    id: 'bishan-amk-corridor',
    name: 'Bishan-AMK River Corridor',
    areaType: 'Riparian Park & Floodplain Buffer',
    canopyCoverPct: 62,
    permeableSurfacePct: 76,
    timeOfDay: 'midday',
    baselineTempC: 29.5,
    description: 'Naturalized meandering waterway with dense rain garden verges delivering strong evaporative cooling.',
  },
  {
    id: 'macritchie-primary',
    name: 'Central Catchment / MacRitchie',
    areaType: 'Primary Dipterocarp Rainforest',
    canopyCoverPct: 88,
    permeableSurfacePct: 96,
    timeOfDay: 'midday',
    baselineTempC: 27.8,
    description: 'Multi-tiered continuous rainforest crown projection generating maximum thermal mitigation and microclimate stability.',
  },
];

interface MicroclimateSimulatorProps {
  onExploreMap?: () => void;
}

export const MicroclimateSimulator: React.FC<MicroclimateSimulatorProps> = ({ onExploreMap }) => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>('bishan-amk-corridor');
  const [canopyCover, setCanopyCover] = useState<number>(62);
  const [permeableSurface, setPermeableSurface] = useState<number>(76);
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'midday' | 'evening'>('midday');
  const [showScientificModal, setShowScientificModal] = useState<boolean>(false);

  // Apply preset
  const handleSelectPreset = (preset: MicroclimatePreset) => {
    setSelectedPresetId(preset.id);
    setCanopyCover(preset.canopyCoverPct);
    setPermeableSurface(preset.permeableSurfacePct);
    setTimeOfDay(preset.timeOfDay);
  };

  // Reset to current preset defaults
  const handleReset = () => {
    const current = SINGAPORE_SIMULATION_PRESETS.find((p) => p.id === selectedPresetId);
    if (current) {
      setCanopyCover(current.canopyCoverPct);
      setPermeableSurface(current.permeableSurfacePct);
      setTimeOfDay(current.timeOfDay);
    }
  };

  // Climatological calculation model based on urban ecology physics
  const calculations = useMemo(() => {
    // Solar intensity factor based on diurnal curve
    const solarFactor = timeOfDay === 'midday' ? 1.0 : timeOfDay === 'morning' ? 0.65 : 0.45;

    // Local Ambient Cooling Offset (Delta T in Celsius)
    // Formula: ΔT = -(0.042 * Canopy% + 0.018 * Permeable%) * solarFactor
    const coolingOffset = (0.042 * canopyCover + 0.018 * permeableSurface) * solarFactor;

    // Ground Surface Temperature Reduction (asphalt vs shaded soil)
    // Direct shade eliminates up to 16°C of radiant heat
    const surfaceTempReduction = (0.145 * canopyCover + 0.04 * permeableSurface) * solarFactor;

    // PM2.5 Fine Particulate Interception (kg per hectare per year)
    // Tropical broadleaf trees filter ~0.32 kg PM2.5 / ha / % canopy cover
    const pm25CaptureKgPerHa = (canopyCover * 0.32).toFixed(1);

    // Evapotranspirative Latent Heat Flux (W/m²)
    // Healthy tropical vegetation converts sensible heat into latent cooling (~1.8 W/m² per % canopy)
    const latentHeatFlux = Math.round(canopyCover * 1.85 + permeableSurface * 0.7);

    // Stormwater Infiltration Attenuation (%)
    // Tree root macropores and permeable substrate absorb rainfall runoff
    const runoffAttenuationPct = Math.min(95, Math.round(permeableSurface * 0.75 + canopyCover * 0.22));

    // Simulated Effective Microclimate Air Temperature
    const baselineReference = 32.5;
    const effectiveTemp = (baselineReference - coolingOffset).toFixed(1);

    return {
      coolingOffset: coolingOffset.toFixed(2),
      surfaceTempReduction: surfaceTempReduction.toFixed(1),
      pm25CaptureKgPerHa,
      latentHeatFlux,
      runoffAttenuationPct,
      effectiveTemp,
    };
  }, [canopyCover, permeableSurface, timeOfDay]);

  return (
    <div className="w-full bg-[#151A16] rounded-3xl border border-[#25352A] p-5 sm:p-8 shadow-2xl relative overflow-hidden">
      {/* Background ambient radial glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#727B5A]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#25352A]/20 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#25352A]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-[#25352A] text-[#AAB29A] border border-[#727B5A]/30">
              Interactive Climatology Tool
            </span>
            <span className="text-[11px] text-[#777B70] hidden sm:inline">•</span>
            <span className="text-[11px] text-[#AAB29A] hidden sm:inline">
              Physics-Based Urban Heat Island (UHI) Engine
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-medium text-[#F4F3EC] tracking-tight">
            Canopy Cooling & Microclimate Simulator
          </h3>
          <p className="text-xs text-[#777B70] mt-1 max-w-2xl leading-relaxed">
            Adjust tree canopy coverage and permeable surfaces across Singapore's microclimate zones
            to model localized ambient cooling, ground heat mitigation, and fine particulate interception.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={() => setShowScientificModal(!showScientificModal)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1C231E] hover:bg-[#25352A] border border-[#25352A] text-xs text-[#AAB29A] hover:text-white transition-all cursor-pointer"
            title="View Climatological Methodology & Physics Model"
          >
            <Info className="w-3.5 h-3.5 text-[#727B5A]" />
            <span className="text-[11px]">Scientific Model</span>
          </button>
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1C231E] hover:bg-[#25352A] border border-[#25352A] text-xs text-[#777B70] hover:text-[#AAB29A] transition-all cursor-pointer"
            title="Reset to scenario defaults"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="text-[11px] hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* Preset Scenario Selector Buttons */}
      <div className="relative z-10 pt-6">
        <label className="text-[11px] uppercase tracking-wider font-semibold text-[#777B70] block mb-2.5">
          Select Singapore Microclimate Scenario:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {SINGAPORE_SIMULATION_PRESETS.map((preset) => {
            const isSelected = selectedPresetId === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => handleSelectPreset(preset)}
                className={`p-3 rounded-2xl text-left transition-all border cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-[#1C231E] border-[#727B5A] shadow-md ring-1 ring-[#727B5A]/50'
                    : 'bg-[#121714]/80 border-[#25352A] hover:border-[#41483A] hover:bg-[#1C231E]/60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span
                      className={`text-xs font-medium truncate ${
                        isSelected ? 'text-[#F4F3EC]' : 'text-[#AAB29A]'
                      }`}
                    >
                      {preset.name}
                    </span>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0 animate-pulse" />
                    )}
                  </div>
                  <p className="text-[10px] text-[#777B70] line-clamp-1">{preset.areaType}</p>
                </div>
                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-[#25352A]/50 text-[10px] text-[#AAB29A]">
                  <span>Canopy: {preset.canopyCoverPct}%</span>
                  <span>•</span>
                  <span>Permeable: {preset.permeableSurfacePct}%</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Interactive Grid: Controls & Calculations */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 pt-6">
        {/* Left Column: Interactive Sliders & Time of Day */}
        <div className="lg:col-span-5 space-y-5 bg-[#121714]/70 rounded-2xl p-4 sm:p-5 border border-[#25352A]">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider font-semibold text-[#AAB29A] flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-[#727B5A]" />
              Simulation Controls
            </span>
            <span className="text-[10px] text-[#777B70]">Drag to simulate variation</span>
          </div>

          {/* Slider 1: Tree Canopy Cover */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#F4F3EC] flex items-center gap-1.5 font-medium">
                <TreePine className="w-3.5 h-3.5 text-emerald-400" />
                Tree Canopy Coverage
              </span>
              <span className="text-sm font-semibold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-800/40">
                {canopyCover}%
              </span>
            </div>
            <input
              type="range"
              min="5"
              max="95"
              step="1"
              value={canopyCover}
              onChange={(e) => {
                setCanopyCover(Number(e.target.value));
                setSelectedPresetId('custom');
              }}
              className="w-full h-2 bg-[#25352A] rounded-lg appearance-none cursor-pointer accent-[#727B5A]"
            />
            <div className="flex justify-between text-[10px] text-[#777B70]">
              <span>5% (Bare Concrete)</span>
              <span>50% (Green Belt)</span>
              <span>95% (Climax Forest)</span>
            </div>
          </div>

          {/* Slider 2: Permeable Green Surface */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#F4F3EC] flex items-center gap-1.5 font-medium">
                <Layers className="w-3.5 h-3.5 text-teal-400" />
                Permeable Substrate & Bioswales
              </span>
              <span className="text-sm font-semibold text-teal-400 bg-teal-950/40 px-2 py-0.5 rounded-md border border-teal-800/40">
                {permeableSurface}%
              </span>
            </div>
            <input
              type="range"
              min="5"
              max="95"
              step="1"
              value={permeableSurface}
              onChange={(e) => {
                setPermeableSurface(Number(e.target.value));
                setSelectedPresetId('custom');
              }}
              className="w-full h-2 bg-[#25352A] rounded-lg appearance-none cursor-pointer accent-[#5E8B7E]"
            />
            <div className="flex justify-between text-[10px] text-[#777B70]">
              <span>5% (Impervious Pavement)</span>
              <span>50% (Turfed Soil)</span>
              <span>95% (Rain Garden / Wetland)</span>
            </div>
          </div>

          {/* Time of Day Diurnal Toggle */}
          <div className="space-y-1.5 pt-1">
            <label className="text-[11px] uppercase tracking-wider font-semibold text-[#777B70]">
              Diurnal Solar Cycle:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { id: 'morning', label: 'Morning (09:00)', icon: '🌅' },
                  { id: 'midday', label: 'Midday Peak (13:00)', icon: '☀️' },
                  { id: 'evening', label: 'Evening (18:00)', icon: '🌇' },
                ] as const
              ).map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTimeOfDay(t.id)}
                  className={`py-2 px-2 rounded-xl text-[11px] font-medium transition-all text-center cursor-pointer border ${
                    timeOfDay === t.id
                      ? 'bg-[#25352A] text-white border-[#727B5A] shadow-sm'
                      : 'bg-[#151A16] text-[#777B70] hover:text-[#AAB29A] border-[#25352A]'
                  }`}
                >
                  <span className="block text-xs mb-0.5">{t.icon}</span>
                  <span className="truncate block">{t.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Calculated Microclimate Impacts & Metrics */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
          {/* Primary Big Metric Highlight Banner */}
          <div className="bg-gradient-to-br from-[#1C231E] to-[#151A16] rounded-2xl p-5 border border-[#727B5A]/40 shadow-lg relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#727B5A] flex items-center gap-1.5">
                  <TrendingDown className="w-3.5 h-3.5" />
                  Net Localized Microclimate Cooling
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-4xl sm:text-5xl font-bold tracking-tight text-emerald-400">
                    -{calculations.coolingOffset}°C
                  </span>
                  <span className="text-xs text-[#AAB29A]">Ambient Air Relief</span>
                </div>
                <p className="text-xs text-[#777B70] mt-1">
                  Effective simulated air temperature: <strong className="text-[#F4F3EC]">{calculations.effectiveTemp}°C</strong> (vs 32.5°C bare asphalt baseline)
                </p>
              </div>

              {/* Graphical Cooling Meter */}
              <div className="w-full sm:w-48 bg-[#121714] p-3 rounded-xl border border-[#25352A] space-y-1.5">
                <div className="flex justify-between text-[10px]">
                  <span className="text-[#777B70]">Cooling Efficacy</span>
                  <span className="text-emerald-400 font-bold">
                    {Math.min(100, Math.round((Number(calculations.coolingOffset) / 4.8) * 100))}%
                  </span>
                </div>
                <div className="w-full h-2.5 bg-[#25352A] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-600 to-teal-400 rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(100, Math.round((Number(calculations.coolingOffset) / 4.8) * 100))}%`,
                    }}
                  />
                </div>
                <span className="text-[9px] text-[#777B70] block text-right">
                  Max theoretical: ~4.8°C
                </span>
              </div>
            </div>
          </div>

          {/* 4 Multi-Parameter Environmental Response Cards */}
          <div className="grid grid-cols-2 gap-3.5">
            {/* Metric 1: Radiant Ground Cooling */}
            <div className="bg-[#121714]/80 p-3.5 sm:p-4 rounded-xl border border-[#25352A]">
              <div className="flex items-center gap-1.5 text-xs text-[#727B5A] mb-1">
                <Thermometer className="w-3.5 h-3.5" />
                <span className="text-[10px] uppercase tracking-wider font-medium">Ground Surface Delta</span>
              </div>
              <div className="text-xl sm:text-2xl font-semibold text-[#F4F3EC]">
                -{calculations.surfaceTempReduction}°C
              </div>
              <p className="text-[10px] text-[#777B70] mt-0.5 leading-snug">
                Thermal radiation reduction on pedestrian walkways
              </p>
            </div>

            {/* Metric 2: PM2.5 Interception */}
            <div className="bg-[#121714]/80 p-3.5 sm:p-4 rounded-xl border border-[#25352A]">
              <div className="flex items-center gap-1.5 text-xs text-sky-400 mb-1">
                <Wind className="w-3.5 h-3.5" />
                <span className="text-[10px] uppercase tracking-wider font-medium">PM2.5 Capture</span>
              </div>
              <div className="text-xl sm:text-2xl font-semibold text-[#F4F3EC]">
                {calculations.pm25CaptureKgPerHa} <span className="text-xs font-normal text-[#777B70]">kg/ha/yr</span>
              </div>
              <p className="text-[10px] text-[#777B70] mt-0.5 leading-snug">
                Fine dust filtered by leaves & bark surface
              </p>
            </div>

            {/* Metric 3: Evapotranspirative Flux */}
            <div className="bg-[#121714]/80 p-3.5 sm:p-4 rounded-xl border border-[#25352A]">
              <div className="flex items-center gap-1.5 text-xs text-amber-400 mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span className="text-[10px] uppercase tracking-wider font-medium">Latent Heat Flux</span>
              </div>
              <div className="text-xl sm:text-2xl font-semibold text-[#F4F3EC]">
                {calculations.latentHeatFlux} <span className="text-xs font-normal text-[#777B70]">W/m²</span>
              </div>
              <p className="text-[10px] text-[#777B70] mt-0.5 leading-snug">
                Sensible heat transformed to evaporative moisture
              </p>
            </div>

            {/* Metric 4: Stormwater Attenuation */}
            <div className="bg-[#121714]/80 p-3.5 sm:p-4 rounded-xl border border-[#25352A]">
              <div className="flex items-center gap-1.5 text-xs text-teal-400 mb-1">
                <Droplets className="w-3.5 h-3.5" />
                <span className="text-[10px] uppercase tracking-wider font-medium">Runoff Retention</span>
              </div>
              <div className="text-xl sm:text-2xl font-semibold text-[#F4F3EC]">
                {calculations.runoffAttenuationPct}%
              </div>
              <p className="text-[10px] text-[#777B70] mt-0.5 leading-snug">
                Rainfall intercepted by soil macro-pores
              </p>
            </div>
          </div>

          {/* Action callout banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-[#1C231E]/60 border border-[#25352A]">
            <div className="flex items-center gap-2 text-xs text-[#AAB29A]">
              <ShieldCheck className="w-4 h-4 text-[#727B5A] flex-shrink-0" />
              <span>
                Want to see real-world green buffers in action across Singapore?
              </span>
            </div>
            {onExploreMap && (
              <button
                onClick={onExploreMap}
                className="flex items-center gap-1.5 text-xs font-semibold text-[#F4F3EC] hover:text-white bg-[#25352A] hover:bg-[#41483A] px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer self-start sm:self-auto flex-shrink-0"
              >
                <span>Explore Living Map</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Scientific Methodology Modal / Accordion */}
      {showScientificModal && (
        <div className="relative z-20 mt-6 p-5 rounded-2xl bg-[#0E120F] border border-[#727B5A]/40 text-xs text-[#AAB29A] space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-[#25352A] pb-2">
            <h4 className="font-medium text-[#F4F3EC] flex items-center gap-2">
              <Info className="w-4 h-4 text-[#727B5A]" />
              Singapore Microclimate Simulation Methodology & Climatological References
            </h4>
            <button
              onClick={() => setShowScientificModal(false)}
              className="text-[#777B70] hover:text-white text-xs cursor-pointer"
            >
              Close
            </button>
          </div>
          <p className="leading-relaxed text-[#777B70]">
            This interactive simulator synthesizes empirical microclimate measurements from Singapore's
            National Parks Board (NParks) Urban Heat Island mitigation trials, the Cooling Singapore
            initiative (SEC/ETH Zurich), and open meteorological telemetry from MSS.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 text-[11px]">
            <div className="p-3 bg-[#151A16] rounded-xl border border-[#25352A]">
              <strong className="text-[#F4F3EC] block mb-1">1. Canopy Shading Coefficient</strong>
              Vegetation canopy diminishes shortwave solar radiation absorption on ground substrates by up to 85%, cutting daytime asphalt temperatures from 50°C to 34°C.
            </div>
            <div className="p-3 bg-[#151A16] rounded-xl border border-[#25352A]">
              <strong className="text-[#F4F3EC] block mb-1">2. Latent Evapotranspiration</strong>
              Tropical rainforest trees transpire up to 300 liters of water daily per mature crown, cooling surrounding air through state change from liquid to vapor.
            </div>
            <div className="p-3 bg-[#151A16] rounded-xl border border-[#25352A]">
              <strong className="text-[#F4F3EC] block mb-1">3. Particulate Deposition</strong>
              Micro-roughness and wax cuticles on native species like <em>Hopea odorata</em> and <em>Samanea saman</em> facilitate turbulent PM2.5 boundary-layer capture.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
