import React, { useMemo } from 'react';
import {
  Sparkles,
  ShieldCheck,
  Sun,
  Activity,
  Compass,
  CheckCircle2,
  AlertCircle,
  Thermometer,
  Wind,
} from 'lucide-react';
import { EnvironmentalSnapshotData } from '../services/apiClient';

interface EnvironmentalAdvisoryProps {
  telemetry: EnvironmentalSnapshotData | null;
  onExploreSanctuary?: (sanctuaryName: string) => void;
}

export const EnvironmentalAdvisory: React.FC<EnvironmentalAdvisoryProps> = ({
  telemetry,
  onExploreSanctuary,
}) => {
  // Compute composite environmental health advisory from live telemetry
  const advisory = useMemo(() => {
    const centralPm25 = telemetry?.pm25?.Central ?? 18;
    const centralTemp = telemetry?.air_temperature?.Central ?? 29.7;
    const centralHumidity = telemetry?.relative_humidity?.Central ?? 62;

    // Outdoor Readiness Score calculation (0-100)
    // Decreases as PM2.5 rises above 15, or Temperature exceeds 31°C
    let score = 100;
    if (centralPm25 > 15) score -= Math.min(30, (centralPm25 - 15) * 1.5);
    if (centralTemp > 30) score -= Math.min(25, (centralTemp - 30) * 8);
    if (centralHumidity > 80) score -= 10;
    const readinessScore = Math.max(35, Math.round(score));

    // Category and advice text
    let readinessLabel = 'Optimal Conditions';
    let readinessColor = 'text-emerald-400 bg-emerald-950/40 border-emerald-800/40';
    let readinessMessage =
      'Crisp canopy microclimate with excellent ambient air clarity. Ideal for forest bathing, boardwalk trails, and trail running.';

    if (readinessScore < 70) {
      readinessLabel = 'Moderate Heat Load';
      readinessColor = 'text-amber-300 bg-amber-950/40 border-amber-800/40';
      readinessMessage =
        'Solar thermal load is elevated. Seek deep shaded forest reserves like MacRitchie or Bukit Timah with continuous canopy cover.';
    } else if (readinessScore < 50) {
      readinessLabel = 'Exercise Caution';
      readinessColor = 'text-rose-400 bg-rose-950/40 border-rose-800/40';
      readinessMessage =
        'Fine particulates or elevated midday heat detected. Limit strenuous outdoor exposure and hydrate frequently.';
    }

    // Recommended Sanctuary Refuge right now
    const recommendedRefuge = {
      name: 'MacRitchie Reservoir & Central Catchment',
      reason: 'Dense secondary rainforest provides ~2.8°C thermal buffer below ambient urban heat.',
      region: 'Central',
    };

    return {
      readinessScore,
      readinessLabel,
      readinessColor,
      readinessMessage,
      centralPm25,
      centralTemp,
      centralHumidity,
      recommendedRefuge,
    };
  }, [telemetry]);

  return (
    <div className="w-full bg-[#151A16] rounded-3xl border border-[#25352A] p-5 sm:p-6 shadow-xl relative overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#25352A]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#1C231E] border border-[#727B5A]/40 flex items-center justify-center text-emerald-400">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider font-semibold text-[#727B5A] block">
              Real-Time Outdoor Health
            </span>
            <h4 className="text-sm sm:text-base font-medium text-[#F4F3EC]">
              Field Activity & Biometeorological Advisory
            </h4>
          </div>
        </div>

        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1.5 self-start sm:self-auto ${advisory.readinessColor}`}
        >
          <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
          <span>{advisory.readinessLabel}</span>
          <span className="opacity-60">•</span>
          <span>{advisory.readinessScore}/100</span>
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 pt-4">
        {/* Left advice */}
        <div className="md:col-span-7 space-y-3">
          <p className="text-xs text-[#AAB29A] leading-relaxed">
            {advisory.readinessMessage}
          </p>

          <div className="grid grid-cols-3 gap-2 pt-1 text-[11px]">
            <div className="p-2.5 bg-[#121714] rounded-xl border border-[#25352A]">
              <span className="text-[9px] text-[#777B70] uppercase block">Air Quality</span>
              <span className="font-semibold text-emerald-400">
                {advisory.centralPm25 <= 55 ? 'Good Band' : 'Moderate'}
              </span>
            </div>
            <div className="p-2.5 bg-[#121714] rounded-xl border border-[#25352A]">
              <span className="text-[9px] text-[#777B70] uppercase block">Thermal Stress</span>
              <span className="font-semibold text-[#F4F3EC]">
                {advisory.centralTemp < 31 ? 'Low Risk' : 'Moderate'}
              </span>
            </div>
            <div className="p-2.5 bg-[#121714] rounded-xl border border-[#25352A]">
              <span className="text-[9px] text-[#777B70] uppercase block">Hydration Guide</span>
              <span className="font-semibold text-teal-400">500ml / hr</span>
            </div>
          </div>
        </div>

        {/* Right recommended sanctuary refuge */}
        <div className="md:col-span-5 bg-[#1C231E]/80 rounded-2xl p-3.5 border border-[#25352A] flex flex-col justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-[#727B5A] font-semibold block mb-1">
              Recommended Thermal Refuge:
            </span>
            <h5 className="text-xs sm:text-sm font-medium text-[#F4F3EC]">
              {advisory.recommendedRefuge.name}
            </h5>
            <p className="text-[11px] text-[#777B70] mt-1 leading-snug">
              {advisory.recommendedRefuge.reason}
            </p>
          </div>

          {onExploreSanctuary && (
            <button
              onClick={() => onExploreSanctuary(advisory.recommendedRefuge.name)}
              className="mt-3 w-full py-1.5 px-3 rounded-lg text-xs font-semibold bg-[#25352A] text-[#F4F3EC] hover:bg-[#F4F3EC] hover:text-[#252820] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5 text-[#727B5A]" />
              <span>Locate on Living Map</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
