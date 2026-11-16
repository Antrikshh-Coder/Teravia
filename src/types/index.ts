export type GreenSpaceCategory =
  | 'Parks'
  | 'Gardens'
  | 'Nature Reserves'
  | 'Nature Trails'
  | 'Waterfront Green Spaces';

export type SingaporeRegion = 'Central' | 'North' | 'South' | 'East' | 'West';

export interface GreenSpace {
  id: string;
  name: string;
  category: GreenSpaceCategory;
  region: SingaporeRegion;
  coordinates: [number, number]; // [lat, lng]
  description: string;
  shortDescription: string;
  amenities: string[];
  accessibilityInfo: string;
  imageUrl: string;
  openingHours: string;
  directionsUrl: string;
  sizeHectares: number;
  highlights: string[];
  nativeFloraFauna: string[];
}

export interface EnvironmentalMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  region: SingaporeRegion;
  timestamp: string;
  source: string;
  explanation: string;
  status: 'verified' | 'sample';
  change24h: number; // positive or negative percentage/delta
}

export interface HistoricalDataPoint {
  timestamp: string;
  timeLabel: string;
  temperature: number; // °C
  humidity: number;    // %
  psi: number;         // 0 - 500
  pm25: number;        // µg/m³
  rainfall: number;    // mm/hr
}

export interface NeighbourhoodProfile {
  id: string;
  name: string;
  planningArea: string;
  parkProximityPct: number;    // % residents within 400m
  canopyCoverPct: number;       // % canopy
  coolingOffsetC: number;       // °C vegetation cooling offset
  avgPm25: number;              // µg/m³
  connectorLengthKm: number;    // km
  nearbySpaces: string[];       // IDs of GreenSpace
  description: string;
  dominantHabitat: string;
  limitationsNote: string;
}

export type JournalCategory =
  | 'Plants'
  | 'Birds'
  | 'Insects'
  | 'Wildlife'
  | 'Landscapes'
  | 'Other';

export interface JournalEntry {
  id: string;
  title: string;
  description: string;
  category: JournalCategory;
  location: string;
  date: string;
  imageUrl: string;
  weatherCondition?: string;
  scientificName?: string;
  createdAt: number;
}

export interface StorySection {
  type: 'paragraph' | 'heading' | 'quote' | 'callout';
  text: string;
  citation?: string;
}

export interface StorySource {
  title: string;
  publisher: string;
  year: string;
  url?: string;
}

export interface EnvironmentalStory {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  readTime: string;
  publishedDate: string;
  author: string;
  coverImage: string;
  summary: string;
  content: StorySection[];
  sources: StorySource[];
  relatedStoryIds: string[];
}
