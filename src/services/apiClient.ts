/**
 * TERAVIA Unified API Client for FastAPI backend endpoints.
 */

import { getAccessToken } from './supabaseClient';
import { GreenSpace, SingaporeRegion } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export interface EnvironmentalSnapshotData {
  timestamp: string;
  retrieved_at: string;
  provider: string;
  is_cached: boolean;
  source_status: string;
  pm25: Record<string, number | null>;
  psi_24h: Record<string, number | null>;
  air_temperature: Record<string, number | null>;
  relative_humidity: Record<string, number | null>;
  rainfall: Record<string, number | null>;
  units: Record<string, string>;
}

export interface HourlyTelemetryPoint {
  timestamp: string;
  time_label: string;
  temperature?: number;
  humidity?: number;
  precipitation?: number;
  pm25?: number;
  wind_speed?: number;
  data_type: 'observation' | 'forecast' | 'historical';
}

export interface EnvironmentalHistoryData {
  region: string;
  timeframe: string;
  points: HourlyTelemetryPoint[];
  units: Record<string, string>;
  provider: string;
  retrieved_at: string;
  is_cached: boolean;
}

export interface WeatherCurrentData {
  latitude: number;
  longitude: number;
  timezone: string;
  elevation?: number;
  temperature_2m: number;
  apparent_temperature: number;
  relative_humidity_2m: number;
  precipitation: number;
  wind_speed_10m: number;
  units: Record<string, string>;
  time: string;
  retrieved_at: string;
  provider: string;
  data_type: string;
  is_cached: boolean;
}

export interface SavedPlacesResponse {
  total: number;
  items: Array<{
    id: string;
    user_id: string;
    place_id: string;
    created_at: string;
    notes?: string;
    place?: GreenSpace;
  }>;
  saved_ids: string[];
}

export interface JournalEntryBackend {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: 'Plants' | 'Birds' | 'Insects' | 'Wildlife' | 'Landscapes' | 'Other';
  location: string;
  entry_date: string;
  image_url: string;
  weather_condition?: string;
  scientific_name?: string;
  created_at: string;
  updated_at: string;
}

export interface JournalListResponse {
  total: number;
  items: JournalEntryBackend[];
  categories_present: string[];
}

export interface DashboardStatsData {
  user_id: string;
  saved_places_count: number;
  journal_entries_count: number;
  categories_breakdown: Record<string, number>;
  recent_entries: JournalEntryBackend[];
  recent_saved_places: GreenSpace[];
  environmental_snapshot: {
    retrieved_at: string;
    provider: string;
    air_quality_pm25: number;
    temperature_celsius: number;
    humidity_pct: number;
    vegetation_cooling_offset: number;
  };
  active_streak_days: number;
  total_habitats_explored: number;
}

async function fetchWithAuth(endpoint: string, options: RequestInit = {}): Promise<Response> {
  const token = await getAccessToken();
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const url = `${API_BASE}${endpoint}`;
  return fetch(url, { ...options, headers });
}

export const api = {
  // Health
  async getHealth() {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error(`Health check failed: ${res.status}`);
    return res.json();
  },

  // Environmental Intelligence
  async getLiveEnvironmental(): Promise<EnvironmentalSnapshotData> {
    const res = await fetch(`${API_BASE}/environmental/measurements`);
    if (!res.ok) throw new Error(`Failed fetching environmental data: ${res.status}`);
    return res.json();
  },

  async getEnvironmentalHistory(region: SingaporeRegion = 'Central', timeframe = '24h'): Promise<EnvironmentalHistoryData> {
    const res = await fetch(`${API_BASE}/environmental/history?region=${region}&timeframe=${timeframe}`);
    if (!res.ok) throw new Error(`Failed fetching environmental history: ${res.status}`);
    return res.json();
  },

  async getRegionalSummary() {
    const res = await fetch(`${API_BASE}/environmental/summary`);
    if (!res.ok) throw new Error(`Failed fetching regional summary: ${res.status}`);
    return res.json();
  },

  // Weather (Open-Meteo)
  async getCurrentWeather(): Promise<WeatherCurrentData> {
    const res = await fetch(`${API_BASE}/weather/current`);
    if (!res.ok) throw new Error(`Failed fetching current weather: ${res.status}`);
    return res.json();
  },

  async getWeatherForecast(days = 2) {
    const res = await fetch(`${API_BASE}/weather/forecast?days=${days}`);
    if (!res.ok) throw new Error(`Failed fetching weather forecast: ${res.status}`);
    return res.json();
  },

  // Locations / Green Spaces
  async getLocations(filters?: { category?: string; region?: string; search?: string }): Promise<GreenSpace[]> {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.region) params.append('region', filters.region);
    if (filters?.search) params.append('search', filters.search);

    const qs = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`${API_BASE}/locations${qs}`);
    if (!res.ok) throw new Error(`Failed fetching locations: ${res.status}`);
    return res.json();
  },

  async getLocation(id: string): Promise<GreenSpace> {
    const res = await fetch(`${API_BASE}/locations/${id}`);
    if (!res.ok) throw new Error(`Failed fetching location '${id}': ${res.status}`);
    return res.json();
  },

  // Saved Places
  async getSavedPlaces(): Promise<SavedPlacesResponse> {
    const res = await fetchWithAuth('/saved-places');
    if (!res.ok) throw new Error(`Failed fetching saved places: ${res.status}`);
    return res.json();
  },

  async savePlace(placeId: string, notes?: string) {
    const res = await fetchWithAuth('/saved-places', {
      method: 'POST',
      body: JSON.stringify({ place_id: placeId, notes }),
    });
    if (!res.ok) throw new Error(`Failed saving place: ${res.status}`);
    return res.json();
  },

  async removeSavedPlace(placeId: string) {
    const res = await fetchWithAuth(`/saved-places/${placeId}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error(`Failed removing saved place: ${res.status}`);
    return res.json();
  },

  // Nature Journal
  async getJournalEntries(category?: string, search?: string): Promise<JournalListResponse> {
    const params = new URLSearchParams();
    if (category && category !== 'All') params.append('category', category);
    if (search) params.append('search', search);

    const qs = params.toString() ? `?${params.toString()}` : '';
    const res = await fetchWithAuth(`/journal${qs}`);
    if (!res.ok) throw new Error(`Failed fetching journal entries: ${res.status}`);
    return res.json();
  },

  async createJournalEntry(payload: {
    title: string;
    description: string;
    category: string;
    location: string;
    entry_date: string;
    image_url: string;
    weather_condition?: string;
    scientific_name?: string;
  }): Promise<JournalEntryBackend> {
    const res = await fetchWithAuth('/journal', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || `Failed creating journal entry: ${res.status}`);
    }
    return res.json();
  },

  async updateJournalEntry(
    id: string,
    payload: {
      title?: string;
      description?: string;
      category?: string;
      location?: string;
      entry_date?: string;
      image_url?: string;
      weather_condition?: string;
      scientific_name?: string;
    }
  ): Promise<JournalEntryBackend> {
    const res = await fetchWithAuth(`/journal/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || `Failed updating journal entry: ${res.status}`);
    }
    return res.json();
  },

  async deleteJournalEntry(id: string) {
    const res = await fetchWithAuth(`/journal/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error(`Failed deleting journal entry: ${res.status}`);
    return res.json();
  },

  // Personal Dashboard
  async getDashboardStats(): Promise<DashboardStatsData> {
    const res = await fetchWithAuth('/dashboard/stats');
    if (!res.ok) throw new Error(`Failed fetching dashboard stats: ${res.status}`);
    return res.json();
  },

  // Auth / Profile
  async register(email: string, password: string, displayName?: string) {
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, display_name: displayName }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || data.detail || 'Registration failed');
      }
      return data;
    } catch (err: any) {
      if (err.name === 'TypeError' || err.message?.includes('fetch') || err.message?.includes('NetworkError')) {
        throw new Error('Unable to connect to the backend server. Please ensure the backend is running on http://127.0.0.1:8000.');
      }
      throw err;
    }
  },

  async login(email: string, password: string) {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || data.detail || 'Invalid email or password');
      }
      return data;
    } catch (err: any) {
      if (err.name === 'TypeError' || err.message?.includes('fetch') || err.message?.includes('NetworkError')) {
        throw new Error('Unable to connect to the backend server. Please ensure the backend is running on http://127.0.0.1:8000.');
      }
      throw err;
    }
  },

  async logout() {
    try {
      await fetchWithAuth('/auth/logout', { method: 'POST' });
    } catch {
      // Ignore logout transport errors
    }
  },

  async getCurrentUserProfile() {
    try {
      const res = await fetchWithAuth('/auth/me');
      if (!res.ok) throw new Error(`Failed fetching auth profile: ${res.status}`);
      return res.json();
    } catch (err: any) {
      if (err.name === 'TypeError' || err.message?.includes('fetch')) {
        return null;
      }
      throw err;
    }
  },
};
