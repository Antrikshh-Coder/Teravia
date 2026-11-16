import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { NavTab } from './Navigation';
import {
  getSavedPlaces,
  getJournalEntries,
  getRecentPlaces,
} from '../services/storage';
import { SINGAPORE_GREEN_SPACES } from '../data/singaporePlaces';
import { api, DashboardStatsData } from '../services/apiClient';
import {
  UserCheck,
  Bookmark,
  BookOpen,
  MapPin,
  Sparkles,
  ArrowRight,
  TreePine,
  Download,
  Calendar,
  Compass,
  Activity,
  Wind,
  Thermometer,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';

interface PersonalDashboardProps {
  onNavigate: (tab: NavTab, placeId?: string) => void;
}

export const PersonalDashboard: React.FC<PersonalDashboardProps> = ({ onNavigate }) => {
  const localSavedIds = useMemo(() => getSavedPlaces(), []);
  const localJournalEntries = useMemo(() => getJournalEntries(), []);
  const recentIds = useMemo(() => getRecentPlaces(), []);

  const [stats, setStats] = useState<DashboardStatsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getDashboardStats();
      setStats(data);
    } catch (err) {
      console.warn('Backend dashboard stats error, using local metrics:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const savedCount = stats ? stats.saved_places_count : localSavedIds.length;
  const journalCount = stats ? stats.journal_entries_count : localJournalEntries.length;

  // Real category breakdown calculation from stored journal data or backend stats
  const categoryCounts = useMemo(() => {
    if (stats && stats.categories_breakdown) {
      return Object.entries(stats.categories_breakdown).sort((a, b) => b[1] - a[1]);
    }
    const counts: Record<string, number> = {};
    localJournalEntries.forEach((entry) => {
      counts[entry.category] = (counts[entry.category] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [stats, localJournalEntries]);

  // Recent journal entries
  const recentEntries = useMemo(() => {
    if (stats && stats.recent_entries && stats.recent_entries.length > 0) {
      return stats.recent_entries.slice(0, 3).map((e) => ({
        id: e.id,
        title: e.title,
        category: e.category,
        location: e.location,
        date: e.entry_date,
        imageUrl: e.image_url,
      }));
    }
    return [...localJournalEntries]
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 3)
      .map((e) => ({
        id: e.id,
        title: e.title,
        category: e.category,
        location: e.location,
        date: e.date,
        imageUrl: e.imageUrl,
      }));
  }, [stats, localJournalEntries]);

  const handleDownloadBackup = () => {
    const backup = {
      savedPlaces: localSavedIds,
      journalEntries: localJournalEntries,
      serverStats: stats,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `teravia-personal-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full min-h-[calc(100vh-4.5rem)] bg-[#0E120F] text-[#F4F3EC] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#25352A]">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#727B5A]">
              <UserCheck className="w-4 h-4" />
              <span>Personal Companion</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-[#F4F3EC]">
              Exploration Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-[#777B70]">
              A quiet overview of your nature encounters, bookmarked sanctuaries, and field history.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadBackup}
              className="px-3.5 py-2 rounded-xl text-xs font-medium bg-[#1C231E] hover:bg-[#25352A] text-[#AAB29A] hover:text-white border border-[#25352A] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Local Data</span>
            </button>
          </div>
        </div>

        {/* ── Real-time Field Telemetry Banner ── */}
        {stats?.environmental_snapshot && (
          <div className="rounded-3xl bg-[#151A16] border border-[#25352A] p-5 sm:p-6 shadow-xl relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#25352A]">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-semibold uppercase tracking-wider text-[#F4F3EC]">
                  Real-time Singapore Environmental Telemetry
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1C231E] border border-[#25352A] text-[#AAB29A]">
                  Data.gov.sg & Open-Meteo
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-[#777B70]">
                <span>
                  Updated:{' '}
                  {new Date(stats.environmental_snapshot.retrieved_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
                <button
                  onClick={fetchStats}
                  disabled={loading}
                  className="p-1 rounded-lg hover:bg-[#1C231E] text-[#AAB29A] hover:text-[#F4F3EC] transition-colors"
                  title="Refresh live telemetry"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
              <div>
                <span className="text-[11px] text-[#777B70] uppercase font-semibold">Ambient Temp</span>
                <div className="text-xl sm:text-2xl font-semibold text-[#F4F3EC] mt-0.5 flex items-baseline gap-1">
                  <span>{stats.environmental_snapshot.temperature_celsius.toFixed(1)}</span>
                  <span className="text-xs font-normal text-[#AAB29A]">°C</span>
                </div>
                <p className="text-[10px] text-[#777B70] mt-0.5">National weather station</p>
              </div>

              <div>
                <span className="text-[11px] text-[#777B70] uppercase font-semibold">Air Quality (PM2.5)</span>
                <div className="text-xl sm:text-2xl font-semibold text-emerald-400 mt-0.5 flex items-baseline gap-1">
                  <span>{stats.environmental_snapshot.air_quality_pm25.toFixed(0)}</span>
                  <span className="text-xs font-normal text-[#AAB29A]">µg/m³</span>
                </div>
                <p className="text-[10px] text-emerald-400/80 mt-0.5">Healthy & clear</p>
              </div>

              <div>
                <span className="text-[11px] text-[#777B70] uppercase font-semibold">Relative Humidity</span>
                <div className="text-xl sm:text-2xl font-semibold text-[#F4F3EC] mt-0.5 flex items-baseline gap-1">
                  <span>{stats.environmental_snapshot.humidity_pct.toFixed(0)}</span>
                  <span className="text-xs font-normal text-[#AAB29A]">%</span>
                </div>
                <p className="text-[10px] text-[#777B70] mt-0.5">Tropical atmospheric layer</p>
              </div>

              <div>
                <span className="text-[11px] text-[#777B70] uppercase font-semibold">Canopy Cooling</span>
                <div className="text-xl sm:text-2xl font-semibold text-[#727B5A] mt-0.5 flex items-baseline gap-1">
                  <span>{stats.environmental_snapshot.vegetation_cooling_offset.toFixed(1)}</span>
                  <span className="text-xs font-normal text-[#AAB29A]">°C</span>
                </div>
                <p className="text-[10px] text-[#AAB29A] mt-0.5">Thermal buffer inside reserves</p>
              </div>
            </div>
          </div>
        )}

        {/* ── Real Activity Metrics ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Saved Places */}
          <div
            onClick={() => onNavigate('saved')}
            className="rounded-3xl bg-[#151A16] border border-[#25352A] p-6 hover:border-[#727B5A] transition-all cursor-pointer flex flex-col justify-between space-y-4 shadow-lg group"
          >
            <div className="flex items-center justify-between text-[#777B70]">
              <span className="text-[11px] uppercase tracking-wider font-semibold">Bookmarked Spaces</span>
              <Bookmark className="w-4 h-4 text-[#727B5A] group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <div className="text-3xl font-semibold text-[#F4F3EC]">{savedCount}</div>
              <p className="text-xs text-[#777B70] mt-1">Saved parks & nature trails</p>
            </div>
            <span className="text-[11px] text-[#AAB29A] group-hover:translate-x-1 transition-transform flex items-center gap-1 font-medium">
              View saved collection <ArrowRight className="w-3 h-3" />
            </span>
          </div>

          {/* Journal Observations */}
          <div
            onClick={() => onNavigate('journal')}
            className="rounded-3xl bg-[#151A16] border border-[#25352A] p-6 hover:border-[#727B5A] transition-all cursor-pointer flex flex-col justify-between space-y-4 shadow-lg group"
          >
            <div className="flex items-center justify-between text-[#777B70]">
              <span className="text-[11px] uppercase tracking-wider font-semibold">Field Observations</span>
              <BookOpen className="w-4 h-4 text-[#727B5A] group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <div className="text-3xl font-semibold text-[#F4F3EC]">{journalCount}</div>
              <p className="text-xs text-[#777B70] mt-1">Documented species & encounters</p>
            </div>
            <span className="text-[11px] text-[#AAB29A] group-hover:translate-x-1 transition-transform flex items-center gap-1 font-medium">
              Open nature journal <ArrowRight className="w-3 h-3" />
            </span>
          </div>

          {/* Primary Observed Taxon */}
          <div className="rounded-3xl bg-[#151A16] border border-[#25352A] p-6 flex flex-col justify-between space-y-4 shadow-lg">
            <div className="flex items-center justify-between text-[#777B70]">
              <span className="text-[11px] uppercase tracking-wider font-semibold">Top Category</span>
              <TreePine className="w-4 h-4 text-[#727B5A]" />
            </div>
            <div>
              <div className="text-2xl font-semibold text-[#F4F3EC]">
                {categoryCounts[0] ? categoryCounts[0][0] : 'None Yet'}
              </div>
              <p className="text-xs text-[#777B70] mt-1">
                {categoryCounts[0] ? `${categoryCounts[0][1]} observation(s)` : 'Awaiting first record'}
              </p>
            </div>
            <span className="text-[11px] text-[#777B70]">Calculated from local journal</span>
          </div>

          {/* Singapore Sanctuaries Covered */}
          <div
            onClick={() => onNavigate('map')}
            className="rounded-3xl bg-[#151A16] border border-[#25352A] p-6 hover:border-[#727B5A] transition-all cursor-pointer flex flex-col justify-between space-y-4 shadow-lg group"
          >
            <div className="flex items-center justify-between text-[#777B70]">
              <span className="text-[11px] uppercase tracking-wider font-semibold">Available Reserves</span>
              <Compass className="w-4 h-4 text-[#727B5A] group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <div className="text-3xl font-semibold text-[#F4F3EC]">
                {SINGAPORE_GREEN_SPACES.length}
              </div>
              <p className="text-xs text-[#777B70] mt-1">Documented Singapore sanctuaries</p>
            </div>
            <span className="text-[11px] text-[#AAB29A] group-hover:translate-x-1 transition-transform flex items-center gap-1 font-medium">
              Launch Living Map <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* ── Category Breakdown & Quick Actions ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Category Distribution */}
          <div className="lg:col-span-6 rounded-3xl bg-[#151A16] border border-[#25352A] p-6 sm:p-7 space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#AAB29A]">
              Observations by Natural Domain
            </h3>
            {categoryCounts.length === 0 ? (
              <p className="text-xs text-[#777B70]">No categorized observations recorded yet.</p>
            ) : (
              <div className="space-y-3 pt-2">
                {categoryCounts.map(([cat, count]) => {
                  const pct = journalCount > 0 ? Math.round((count / journalCount) * 100) : 0;
                  return (
                    <div key={cat} className="space-y-1 text-xs">
                      <div className="flex items-center justify-between text-[#F4F3EC]">
                        <span>{cat}</span>
                        <span className="text-[#AAB29A]">
                          {count} ({pct}%)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[#1C231E] overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#25352A] to-[#727B5A] rounded-full transition-all duration-700"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Actions Panel */}
          <div className="lg:col-span-6 rounded-3xl bg-[#151A16] border border-[#25352A] p-6 sm:p-7 space-y-4 flex flex-col justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#AAB29A]">
              Quick Exploration Actions
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <button
                onClick={() => onNavigate('journal')}
                className="p-4 rounded-2xl bg-[#1C231E] hover:bg-[#25352A] border border-[#25352A] text-left transition-colors flex flex-col justify-between space-y-3 cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-xl bg-[#25352A] flex items-center justify-center text-[#727B5A]">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-[#F4F3EC] group-hover:text-white">
                    Record Encounter
                  </h4>
                  <p className="text-[11px] text-[#777B70] mt-0.5">
                    Log a plant or bird sighting
                  </p>
                </div>
              </button>

              <button
                onClick={() => onNavigate('map')}
                className="p-4 rounded-2xl bg-[#1C231E] hover:bg-[#25352A] border border-[#25352A] text-left transition-colors flex flex-col justify-between space-y-3 cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-xl bg-[#25352A] flex items-center justify-center text-[#727B5A]">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-[#F4F3EC] group-hover:text-white">
                    Living Map
                  </h4>
                  <p className="text-[11px] text-[#777B70] mt-0.5">
                    Search trails & reserves
                  </p>
                </div>
              </button>

              <button
                onClick={() => onNavigate('insights')}
                className="p-4 rounded-2xl bg-[#1C231E] hover:bg-[#25352A] border border-[#25352A] text-left transition-colors flex flex-col justify-between space-y-3 cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-xl bg-[#25352A] flex items-center justify-center text-[#727B5A]">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-[#F4F3EC] group-hover:text-white">
                    Check Insights
                  </h4>
                  <p className="text-[11px] text-[#777B70] mt-0.5">
                    View regional air & heat trends
                  </p>
                </div>
              </button>

              <button
                onClick={() => onNavigate('explorer')}
                className="p-4 rounded-2xl bg-[#1C231E] hover:bg-[#25352A] border border-[#25352A] text-left transition-colors flex flex-col justify-between space-y-3 cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-xl bg-[#25352A] flex items-center justify-center text-[#727B5A]">
                  <Compass className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-[#F4F3EC] group-hover:text-white">
                    Compare Districts
                  </h4>
                  <p className="text-[11px] text-[#777B70] mt-0.5">
                    Explore neighbourhood canopy
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* ── Recent Journal Entries Preview ── */}
        <div className="rounded-3xl bg-[#151A16] border border-[#25352A] p-6 sm:p-7 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#25352A]">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#AAB29A]">
              Recent Field Observations
            </h3>
            <button
              onClick={() => onNavigate('journal')}
              className="text-xs text-[#727B5A] hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <span>View all entries</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentEntries.map((entry) => (
              <div
                key={entry.id}
                onClick={() => onNavigate('journal')}
                className="rounded-2xl bg-[#1C231E] border border-[#25352A] p-4 flex gap-3.5 items-center hover:border-[#727B5A] transition-colors cursor-pointer group"
              >
                <img
                  src={entry.imageUrl}
                  alt={entry.title}
                  className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                />
                <div className="min-w-0">
                  <span className="text-[10px] uppercase font-semibold text-[#727B5A]">
                    {entry.category}
                  </span>
                  <h4 className="text-xs font-semibold text-[#F4F3EC] truncate group-hover:text-white">
                    {entry.title}
                  </h4>
                  <p className="text-[11px] text-[#777B70] truncate mt-0.5">
                    {entry.location} • {entry.date}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
