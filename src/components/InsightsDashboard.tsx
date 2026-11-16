import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { SingaporeRegion } from '../types';
import {
  REGIONAL_SUMMARIES,
  ENVIRONMENTAL_METRICS,
  getHistoricalData,
} from '../data/environmentalData';
import { api, EnvironmentalSnapshotData } from '../services/apiClient';
import {
  Thermometer,
  Wind,
  Droplets,
  CloudRain,
  TreePine,
  ShieldAlert,
  Info,
  Calendar,
  Layers,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  RefreshCw,
  AlertTriangle,
  Radio,
} from 'lucide-react';
import { MicroclimateSimulator } from './MicroclimateSimulator';

const REGIONS: SingaporeRegion[] = ['Central', 'North', 'South', 'East', 'West'];
const TIMEFRAMES: ('24h' | '7d' | '30d')[] = ['24h', '7d', '30d'];

type ChartMetric = 'temperature' | 'pm25' | 'humidity' | 'rainfall';

export const InsightsDashboard: React.FC = () => {
  const [selectedRegion, setSelectedRegion] = useState<SingaporeRegion>('Central');
  const [selectedTimeframe, setSelectedTimeframe] = useState<'24h' | '7d' | '30d'>('24h');
  const [activeMetric, setActiveMetric] = useState<ChartMetric>('temperature');
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);
  const [comparisonRegion, setComparisonRegion] = useState<SingaporeRegion | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('Syncing live telemetry...');
  const [liveData, setLiveData] = useState<EnvironmentalSnapshotData | null>(null);
  const [liveHistory, setLiveHistory] = useState<any[] | null>(null);

  const fetchLiveTelemetry = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const [snapshot, history] = await Promise.all([
        api.getLiveEnvironmental(),
        api.getEnvironmentalHistory(selectedRegion, selectedTimeframe),
      ]);
      setLiveData(snapshot);
      if (history?.points && history.points.length > 0) {
        setLiveHistory(
          history.points.map((p) => ({
            timestamp: p.timestamp,
            timeLabel: p.time_label,
            temperature: p.temperature ?? 28,
            humidity: p.humidity ?? 80,
            psi: Math.round((p.pm25 ?? 18) * 2.2),
            pm25: p.pm25 ?? 18,
            rainfall: p.precipitation ?? 0,
          }))
        );
      }
      const timeStr = new Date(snapshot.retrieved_at).toLocaleTimeString();
      setLastUpdated(`Live sync: ${timeStr} SGT (${snapshot.provider})`);
    } catch (err) {
      console.warn('Backend live telemetry fetch failed; using baseline fallback:', err);
      // Still display baseline without completely crashing
      setLastUpdated(`Baseline reference: ${new Date().toLocaleTimeString()} SGT`);
    } finally {
      setIsLoading(false);
    }
  }, [selectedRegion, selectedTimeframe]);

  useEffect(() => {
    fetchLiveTelemetry();
  }, [fetchLiveTelemetry]);

  const handleRefresh = () => {
    fetchLiveTelemetry();
  };

  const handleRetry = () => {
    fetchLiveTelemetry();
  };

  const summary = REGIONAL_SUMMARIES[selectedRegion];
  const compareSummary = comparisonRegion ? REGIONAL_SUMMARIES[comparisonRegion] : null;

  // Use live historical data if loaded, otherwise fall back to baseline
  const historicalData = useMemo(() => {
    if (liveHistory && liveHistory.length > 0) return liveHistory;
    return getHistoricalData(selectedRegion, selectedTimeframe);
  }, [liveHistory, selectedRegion, selectedTimeframe]);

  const compareHistoricalData = useMemo(() => {
    return comparisonRegion ? getHistoricalData(comparisonRegion, selectedTimeframe) : null;
  }, [comparisonRegion, selectedTimeframe]);

  // Chart min/max calculation for SVG plotting
  const chartConfig = useMemo(() => {
    const values = historicalData.map((d) => d[activeMetric]);
    if (compareHistoricalData) {
      values.push(...compareHistoricalData.map((d) => d[activeMetric]));
    }
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    const padding = (maxVal - minVal) * 0.15 || 1;
    const yMin = Math.max(0, Math.floor(minVal - padding));
    const yMax = Math.ceil(maxVal + padding);

    const unitMap: Record<ChartMetric, string> = {
      temperature: '°C',
      pm25: 'µg/m³',
      humidity: '%',
      rainfall: 'mm',
    };

    const labelMap: Record<ChartMetric, string> = {
      temperature: 'Ambient Temperature',
      pm25: 'Fine Particulates (PM2.5)',
      humidity: 'Relative Humidity',
      rainfall: 'Precipitation',
    };

    return { yMin, yMax, unit: unitMap[activeMetric], label: labelMap[activeMetric] };
  }, [historicalData, compareHistoricalData, activeMetric]);

  // SVG Coordinates calculation
  const svgWidth = 800;
  const svgHeight = 260;
  const margin = { top: 20, right: 30, bottom: 35, left: 45 };
  const innerWidth = svgWidth - margin.left - margin.right;
  const innerHeight = svgHeight - margin.top - margin.bottom;

  const points = useMemo(() => {
    const len = historicalData.length;
    return historicalData.map((d, i) => {
      const x = margin.left + (i / (len - 1)) * innerWidth;
      const normalizedY = (d[activeMetric] - chartConfig.yMin) / (chartConfig.yMax - chartConfig.yMin || 1);
      const y = margin.top + innerHeight - normalizedY * innerHeight;
      return { x, y, data: d };
    });
  }, [historicalData, activeMetric, chartConfig, innerWidth, innerHeight]);

  const comparePoints = useMemo(() => {
    if (!compareHistoricalData) return null;
    const len = compareHistoricalData.length;
    return compareHistoricalData.map((d, i) => {
      const x = margin.left + (i / (len - 1)) * innerWidth;
      const normalizedY = (d[activeMetric] - chartConfig.yMin) / (chartConfig.yMax - chartConfig.yMin || 1);
      const y = margin.top + innerHeight - normalizedY * innerHeight;
      return { x, y, data: d };
    });
  }, [compareHistoricalData, activeMetric, chartConfig, innerWidth, innerHeight]);

  // SVG Path generator
  const linePath = useMemo(() => {
    if (points.length === 0) return '';
    return points.reduce((acc, curr, idx) => {
      return idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
    }, '');
  }, [points]);

  const areaPath = useMemo(() => {
    if (points.length === 0) return '';
    const first = points[0];
    const last = points[points.length - 1];
    const baselineY = margin.top + innerHeight;
    return `${linePath} L ${last.x} ${baselineY} L ${first.x} ${baselineY} Z`;
  }, [linePath, points, innerHeight]);

  const compareLinePath = useMemo(() => {
    if (!comparePoints || comparePoints.length === 0) return '';
    return comparePoints.reduce((acc, curr, idx) => {
      return idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
    }, '');
  }, [comparePoints]);

  return (
    <div className="w-full min-h-[calc(100vh-4.5rem)] bg-[#0E120F] text-[#F4F3EC] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header and Provenance Banner */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#727B5A]">
                <span>Telemetry & Microclimate</span>
                <span>•</span>
                <span>Singapore Sensor Grid</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-[#F4F3EC] mt-1">
                Environmental Insights Dashboard
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-2 max-w-full">
              {/* Region Selector Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar bg-[#151A16] p-1.5 rounded-full border border-[#25352A] max-w-full">
                {REGIONS.map((region) => (
                  <button
                    key={region}
                    onClick={() => setSelectedRegion(region)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap flex-shrink-0 cursor-pointer ${
                      selectedRegion === region
                        ? 'bg-[#25352A] text-white shadow-sm font-semibold'
                        : 'text-[#AAB29A] hover:text-white'
                    }`}
                  >
                    {region}
                  </button>
                ))}
              </div>

              {/* Live Grid Sync Refresh Button */}
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="px-3 py-1.5 rounded-full bg-[#151A16] hover:bg-[#1C231E] border border-[#25352A] text-xs text-[#AAB29A] hover:text-white transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                title="Sync latest station telemetry"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-[#727B5A] ${isLoading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Sync Grid</span>
              </button>
            </div>
          </div>

          {/* Official Schema Disclaimer & Status */}
          <div className="p-3.5 rounded-2xl bg-[#151A16] border border-[#727B5A]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 text-[#AAB29A]">
              <Radio className="w-4 h-4 text-emerald-400 flex-shrink-0 animate-pulse" />
              <span>
                <strong>Live Telemetry Connection:</strong> {liveData?.provider || 'National Environment Agency (Data.gov.sg) & Open-Meteo'}. Real station readings and atmospheric models.
              </span>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="text-[11px] text-[#777B70]">{lastUpdated}</span>
              <span className={`px-2.5 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wider whitespace-nowrap ${
                liveData?.is_cached
                  ? 'bg-amber-950/40 text-amber-300 border border-amber-800/40'
                  : 'bg-emerald-950/40 text-emerald-300 border border-emerald-800/40'
              }`}>
                {liveData?.is_cached ? 'Cached Grid Feed' : 'Live Sensor Feed'}
              </span>
            </div>
          </div>
        </div>

        {/* Error State with Retry */}
        {isError ? (
          <div className="rounded-3xl bg-[#151A16] border border-rose-900/50 p-10 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-950/40 border border-rose-800/50 flex items-center justify-center text-rose-400 mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-medium text-[#F4F3EC]">Sensor Grid Network Timeout</h3>
              <p className="text-xs text-[#777B70] max-w-sm mx-auto">
                Unable to reach telemetry gateway for {selectedRegion} station node. Check local connectivity or retry the station sync.
              </p>
            </div>
            <button
              onClick={handleRetry}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#25352A] text-[#F4F3EC] hover:bg-[#41483A] transition-colors cursor-pointer"
            >
              Retry Telemetry Connection
            </button>
          </div>
        ) : (
          <>
        {/* ── Key Metrics Cards Grid ── */}
        <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 ${isLoading ? 'opacity-50 pointer-events-none transition-opacity' : ''}`}>
          {/* Temperature */}
          <div className="rounded-2xl bg-[#151A16] border border-[#25352A] p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#777B70] text-xs">
              <span className="text-[11px] uppercase tracking-wider font-medium">Ambient Temp</span>
              <Thermometer className="w-4 h-4 text-[#727B5A]" />
            </div>
            <div className="mt-2">
              <div className="text-2xl font-semibold text-[#F4F3EC]">
                {liveData?.air_temperature?.[selectedRegion] ?? summary.temperature}°C
              </div>
              <div className="flex items-center gap-1 text-[11px] text-[#AAB29A] mt-0.5">
                <span>{liveData ? 'Live Station Reading' : 'Diurnal Mean'}</span>
              </div>
            </div>
          </div>

          {/* Air Quality (PSI) */}
          <div className="rounded-2xl bg-[#151A16] border border-[#25352A] p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#777B70] text-xs">
              <span className="text-[11px] uppercase tracking-wider font-medium">Air Quality</span>
              <Wind className="w-4 h-4 text-[#727B5A]" />
            </div>
            <div className="mt-2">
              <div className="text-2xl font-semibold text-[#F4F3EC]">
                {liveData?.psi_24h?.[selectedRegion] ?? summary.psi}
              </div>
              <div className="flex items-center gap-1.5 text-[11px] mt-0.5">
                <span className="w-2 h-2 rounded-full bg-[#727B5A]" />
                <span className="text-[#AAB29A]">{summary.psiStatus} Band</span>
              </div>
            </div>
          </div>

          {/* PM2.5 Fine Dust */}
          <div className="rounded-2xl bg-[#151A16] border border-[#25352A] p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#777B70] text-xs">
              <span className="text-[11px] uppercase tracking-wider font-medium">Fine Particulate</span>
              <Activity className="w-4 h-4 text-[#727B5A]" />
            </div>
            <div className="mt-2">
              <div className="text-2xl font-semibold text-[#F4F3EC]">
                {liveData?.pm25?.[selectedRegion] ?? summary.pm25} <span className="text-xs font-normal text-[#777B70]">µg/m³</span>
              </div>
              <div className="text-[11px] text-[#AAB29A] mt-0.5">1-Hr PM2.5 NEA Feed</div>
            </div>
          </div>

          {/* Relative Humidity */}
          <div className="rounded-2xl bg-[#151A16] border border-[#25352A] p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#777B70] text-xs">
              <span className="text-[11px] uppercase tracking-wider font-medium">Humidity</span>
              <Droplets className="w-4 h-4 text-[#727B5A]" />
            </div>
            <div className="mt-2">
              <div className="text-2xl font-semibold text-[#F4F3EC]">
                {liveData?.relative_humidity?.[selectedRegion] ?? summary.humidity}%
              </div>
              <div className="text-[11px] text-[#AAB29A] mt-0.5">Atmospheric Vapour</div>
            </div>
          </div>

          {/* Forest Canopy */}
          <div className="rounded-2xl bg-[#151A16] border border-[#25352A] p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#777B70] text-xs">
              <span className="text-[11px] uppercase tracking-wider font-medium">Canopy Cover</span>
              <TreePine className="w-4 h-4 text-[#727B5A]" />
            </div>
            <div className="mt-2">
              <div className="text-2xl font-semibold text-[#F4F3EC]">{summary.canopyCoverPct}%</div>
              <div className="text-[11px] text-[#AAB29A] mt-0.5">Crown Projection</div>
            </div>
          </div>

          {/* UHI Cooling Offset */}
          <div className="rounded-2xl bg-[#151A16] border border-[#25352A] p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#777B70] text-xs">
              <span className="text-[11px] uppercase tracking-wider font-medium">Heat Offset</span>
              <Sparkles className="w-4 h-4 text-[#727B5A]" />
            </div>
            <div className="mt-2">
              <div className="text-2xl font-semibold text-[#AAB29A]">-{summary.coolingOffsetC}°C</div>
              <div className="text-[11px] text-[#777B70] mt-0.5">Thermal Mitigation</div>
            </div>
          </div>
        </div>

        {/* ── Interactive Historical Chart Section ── */}
        <div className="rounded-3xl bg-[#151A16] border border-[#25352A] p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#25352A]">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-medium text-[#F4F3EC]">
                  {chartConfig.label} Historical Trends
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#25352A] text-[#AAB29A]">
                  {selectedRegion} Region
                </span>
              </div>
              <p className="text-xs text-[#777B70]">
                Diurnal and synoptic cycles tracking microclimate boundary changes
              </p>
            </div>

            {/* Timeframe & Metric Toggles */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Metric Switcher */}
              <div className="flex items-center bg-[#1C231E] p-1 rounded-full border border-[#25352A]">
                {(
                  [
                    { id: 'temperature', label: 'Temp' },
                    { id: 'pm25', label: 'PM2.5' },
                    { id: 'humidity', label: 'Humidity' },
                    { id: 'rainfall', label: 'Rain' },
                  ] as { id: ChartMetric; label: string }[]
                ).map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setActiveMetric(m.id)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                      activeMetric === m.id
                        ? 'bg-[#25352A] text-white shadow-sm'
                        : 'text-[#AAB29A] hover:text-white'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              {/* Timeframe Switcher */}
              <div className="flex items-center bg-[#1C231E] p-1 rounded-full border border-[#25352A]">
                {TIMEFRAMES.map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setSelectedTimeframe(tf)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                      selectedTimeframe === tf
                        ? 'bg-[#F4F3EC] text-[#252820] font-semibold'
                        : 'text-[#AAB29A] hover:text-white'
                    }`}
                  >
                    {tf.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Region Comparison Mode Control */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs py-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[#777B70]">Compare against another region:</span>
              <div className="flex flex-wrap items-center gap-1">
                {REGIONS.filter((r) => r !== selectedRegion).map((r) => (
                  <button
                    key={r}
                    onClick={() => setComparisonRegion(comparisonRegion === r ? null : r)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] transition-colors border cursor-pointer ${
                      comparisonRegion === r
                        ? 'bg-[#727B5A]/20 text-[#AAB29A] border-[#727B5A]'
                        : 'bg-[#1C231E] text-[#777B70] border-[#25352A] hover:text-[#F4F3EC]'
                    }`}
                  >
                    {comparisonRegion === r ? `✕ ${r}` : `+ ${r}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 text-[11px] text-[#AAB29A]">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-1 bg-[#AAB29A] rounded-full" /> {selectedRegion}
              </span>
              {comparisonRegion && (
                <span className="flex items-center gap-1.5 text-[#727B5A]">
                  <span className="w-3 h-1 bg-[#727B5A] rounded-full border-dashed" /> {comparisonRegion}
                </span>
              )}
            </div>
          </div>

          {/* SVG Line / Area Chart */}
          <div className="relative w-full overflow-hidden bg-[#121714] rounded-2xl border border-[#25352A]/80 p-2 sm:p-4">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-auto overflow-visible select-none"
            >
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#727B5A" stopOpacity="0.32" />
                  <stop offset="100%" stopColor="#727B5A" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Horizontal Grid lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                const y = margin.top + innerHeight * (1 - ratio);
                const val = Math.round(chartConfig.yMin + ratio * (chartConfig.yMax - chartConfig.yMin));
                return (
                  <g key={idx}>
                    <line
                      x1={margin.left}
                      y1={y}
                      x2={margin.left + innerWidth}
                      y2={y}
                      stroke="#25352A"
                      strokeDasharray="3 3"
                    />
                    <text
                      x={margin.left - 8}
                      y={y + 3}
                      fill="#777B70"
                      fontSize="9"
                      textAnchor="end"
                      fontFamily="Lexend"
                    >
                      {val} {chartConfig.unit}
                    </text>
                  </g>
                );
              })}

              {/* Area fill */}
              <path d={areaPath} fill="url(#chartGradient)" />

              {/* Primary Region Line */}
              <path
                d={linePath}
                fill="none"
                stroke="#AAB29A"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Comparison Region Line */}
              {compareLinePath && (
                <path
                  d={compareLinePath}
                  fill="none"
                  stroke="#727B5A"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                  strokeLinecap="round"
                />
              )}

              {/* Data points & hover triggers */}
              {points.map((pt, i) => {
                const isHovered = hoveredPointIndex === i;
                return (
                  <g
                    key={i}
                    onMouseEnter={() => setHoveredPointIndex(i)}
                    onMouseLeave={() => setHoveredPointIndex(null)}
                    className="cursor-pointer"
                  >
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isHovered ? 6 : 3}
                      fill={isHovered ? '#F4F3EC' : '#1C231E'}
                      stroke="#AAB29A"
                      strokeWidth="2"
                      className="transition-all"
                    />

                    {/* X-axis labels */}
                    {(points.length <= 12 || i % Math.ceil(points.length / 8) === 0) && (
                      <text
                        x={pt.x}
                        y={margin.top + innerHeight + 18}
                        fill="#777B70"
                        fontSize="9"
                        textAnchor="middle"
                        fontFamily="Lexend"
                      >
                        {pt.data.timeLabel}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Hover Tooltip display */}
            {hoveredPointIndex !== null && points[hoveredPointIndex] && (
              <div
                className="absolute z-20 pointer-events-none rounded-xl bg-[#1C231E] border border-[#727B5A] p-2.5 shadow-xl text-xs space-y-1"
                style={{
                  left: `${Math.min(
                    85,
                    Math.max(15, (points[hoveredPointIndex].x / svgWidth) * 100)
                  )}%`,
                  top: '16px',
                  transform: 'translateX(-50%)',
                }}
              >
                <div className="text-[10px] uppercase tracking-wider text-[#777B70]">
                  {points[hoveredPointIndex].data.timeLabel}
                </div>
                <div className="font-semibold text-[#F4F3EC]">
                  {selectedRegion}: {points[hoveredPointIndex].data[activeMetric]} {chartConfig.unit}
                </div>
                {comparePoints && comparePoints[hoveredPointIndex] && (
                  <div className="text-[11px] text-[#AAB29A]">
                    {comparisonRegion}: {comparePoints[hoveredPointIndex].data[activeMetric]} {chartConfig.unit}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Interactive Canopy Cooling & Microclimate Simulator ── */}
        <MicroclimateSimulator />

        {/* ── Metric Explanations Grid ── */}
        <div className="rounded-3xl bg-[#151A16] border border-[#25352A] p-6 sm:p-8 space-y-4">
          <h3 className="text-sm uppercase tracking-wider text-[#AAB29A] font-semibold">
            Understanding the Indicators & Sensor Standards
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            {ENVIRONMENTAL_METRICS.map((metric) => (
              <div
                key={metric.id}
                className="rounded-2xl bg-[#1C231E] border border-[#25352A] p-4 space-y-2 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-[#727B5A] text-[11px] font-semibold">
                    <span>{metric.name}</span>
                    <span>{metric.unit}</span>
                  </div>
                  <p className="text-[#777B70] text-[11.5px] leading-relaxed mt-1.5">
                    {metric.explanation}
                  </p>
                </div>
                <div className="pt-2 text-[10px] text-[#AAB29A]/60 border-t border-[#25352A]/60 truncate">
                  {metric.source}
                </div>
              </div>
            ))}
          </div>
        </div>
        </>
        )}
      </div>
    </div>
  );
};
