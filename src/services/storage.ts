import { JournalEntry } from '../types';

const SAVED_PLACES_KEY = 'teravia_saved_places_v1';
const JOURNAL_ENTRIES_KEY = 'teravia_journal_entries_v1';
const RECENT_PLACES_KEY = 'teravia_recent_places_v1';

export const INITIAL_JOURNAL_ENTRIES: JournalEntry[] = [
  {
    id: 'entry-sunbird',
    title: 'Crimson Sunbird in Morning Light',
    scientificName: 'Aethopyga siparaja',
    category: 'Birds',
    location: 'Singapore Botanic Gardens',
    date: '2026-10-22',
    imageUrl: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?auto=format&fit=crop&w=900&q=80',
    weatherCondition: 'Clear, 28°C, calm breeze',
    description:
      'Spotted male bird hovering gracefully to feed on nectar from ginger flowers near Symphony Lake. Vivid iridescent scarlet breast feathers and metallic blue forehead shone brightly in early tropical sun.',
    createdAt: Date.now() - 3 * 86400000,
  },
  {
    id: 'entry-staghorn',
    title: 'Massive Crown of Staghorn Fern',
    scientificName: 'Platycerium coronarium',
    category: 'Plants',
    location: 'MacRitchie Reservoir & Central Catchment',
    date: '2026-10-19',
    imageUrl: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=900&q=80',
    weatherCondition: 'Humid, 29°C, post-morning rain',
    description:
      'Perched 12 metres up on a mature Shorea trunk along Chemperai boardwalk. The sterile shield fronds have formed a vast basket trapping falling leaves to generate humus for root nourishment.',
    createdAt: Date.now() - 6 * 86400000,
  },
  {
    id: 'entry-monitor',
    title: 'Malayan Water Monitor Basking',
    scientificName: 'Varanus salvator',
    category: 'Wildlife',
    location: 'Sungei Buloh Wetland Reserve',
    date: '2026-10-14',
    imageUrl: 'https://images.unsplash.com/photo-1544979590-37e9b47eb705?auto=format&fit=crop&w=900&q=80',
    weatherCondition: 'Overcast, 30°C, low tide',
    description:
      'Large individual (approx. 1.7m) resting on exposed mangrove mudbank near Main Bridge. Sluggish basking behaviour before sliding smoothly into brackish estuarine water to hunt fiddler crabs.',
    createdAt: Date.now() - 11 * 86400000,
  },
  {
    id: 'entry-butterfly',
    title: 'Common Birdwing Butterfly on Lantana',
    scientificName: 'Troides helena cerberus',
    category: 'Insects',
    location: 'Dairy Farm Nature Park',
    date: '2026-10-08',
    imageUrl: 'https://images.unsplash.com/photo-1533038590840-1cde6e668a91?auto=format&fit=crop&w=900&q=80',
    weatherCondition: 'Sunny, 31°C',
    description:
      'Magnificent wingspan fluttering slowly along the Wallace Education Trail edge. The golden yellow hindwings lit up dramatically against dark primary forest undergrowth.',
    createdAt: Date.now() - 17 * 86400000,
  },
];

export const INITIAL_SAVED_PLACES: string[] = [
  'botanic-gardens',
  'macritchie-reservoir',
  'sungei-buloh',
];

// ─────────────────────────────────────────────────────────────
// IndexedDB Engine for high-capacity local image & entry storage
// ─────────────────────────────────────────────────────────────
const DB_NAME = 'TERAVIA_OFFLINE_DB';
const DB_VERSION = 1;
const STORE_JOURNAL = 'journal_entries';

function openIndexedDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported in this environment'));
      return;
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_JOURNAL)) {
        db.createObjectStore(STORE_JOURNAL, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Synchronize IndexedDB with an entry
export async function idbSaveEntry(entry: JournalEntry): Promise<void> {
  try {
    const db = await openIndexedDB();
    const tx = db.transaction(STORE_JOURNAL, 'readwrite');
    const store = tx.objectStore(STORE_JOURNAL);
    store.put(entry);
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('IndexedDB write fallback to localStorage:', err);
  }
}

export async function idbDeleteEntry(id: string): Promise<void> {
  try {
    const db = await openIndexedDB();
    const tx = db.transaction(STORE_JOURNAL, 'readwrite');
    const store = tx.objectStore(STORE_JOURNAL);
    store.delete(id);
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('IndexedDB delete fallback:', err);
  }
}

// ─────────────────────────────────────────────────────────────
// Saved Places API
// ─────────────────────────────────────────────────────────────
export function getSavedPlaces(): string[] {
  try {
    const raw = localStorage.getItem(SAVED_PLACES_KEY);
    if (!raw) {
      localStorage.setItem(SAVED_PLACES_KEY, JSON.stringify(INITIAL_SAVED_PLACES));
      return INITIAL_SAVED_PLACES;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed reading saved places from storage:', err);
    return INITIAL_SAVED_PLACES;
  }
}

export function toggleSavePlace(placeId: string): { isSaved: boolean; updated: string[] } {
  try {
    const current = getSavedPlaces();
    let updated: string[];
    let isSaved: boolean;
    if (current.includes(placeId)) {
      updated = current.filter((id) => id !== placeId);
      isSaved = false;
    } else {
      updated = [...current, placeId];
      isSaved = true;
    }
    localStorage.setItem(SAVED_PLACES_KEY, JSON.stringify(updated));
    return { isSaved, updated };
  } catch (err) {
    console.error('Failed toggling saved place:', err);
    return { isSaved: false, updated: [] };
  }
}

export function isPlaceSaved(placeId: string): boolean {
  const list = getSavedPlaces();
  return list.includes(placeId);
}

// ─────────────────────────────────────────────────────────────
// Journal Entries API
// ─────────────────────────────────────────────────────────────
export function getJournalEntries(): JournalEntry[] {
  try {
    const raw = localStorage.getItem(JOURNAL_ENTRIES_KEY);
    if (!raw) {
      localStorage.setItem(JOURNAL_ENTRIES_KEY, JSON.stringify(INITIAL_JOURNAL_ENTRIES));
      return INITIAL_JOURNAL_ENTRIES;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return INITIAL_JOURNAL_ENTRIES;
    }
    return parsed;
  } catch (err) {
    console.error('Failed reading journal entries from storage:', err);
    return INITIAL_JOURNAL_ENTRIES;
  }
}

export function saveJournalEntry(entry: JournalEntry): JournalEntry[] {
  try {
    const current = getJournalEntries();
    const existingIndex = current.findIndex((e) => e.id === entry.id);
    let updated: JournalEntry[];
    if (existingIndex >= 0) {
      updated = [...current];
      updated[existingIndex] = entry;
    } else {
      updated = [entry, ...current];
    }
    localStorage.setItem(JOURNAL_ENTRIES_KEY, JSON.stringify(updated));
    // Asynchronously replicate to IndexedDB for safety with large assets
    idbSaveEntry(entry).catch(() => {});
    return updated;
  } catch (err) {
    console.error('Failed saving journal entry:', err);
    return getJournalEntries();
  }
}

export function deleteJournalEntry(entryId: string): JournalEntry[] {
  try {
    const current = getJournalEntries();
    const updated = current.filter((e) => e.id !== entryId);
    localStorage.setItem(JOURNAL_ENTRIES_KEY, JSON.stringify(updated));
    idbDeleteEntry(entryId).catch(() => {});
    return updated;
  } catch (err) {
    console.error('Failed deleting journal entry:', err);
    return getJournalEntries();
  }
}

// ─────────────────────────────────────────────────────────────
// Recent Places Tracking
// ─────────────────────────────────────────────────────────────
export function getRecentPlaces(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_PLACES_KEY);
    return raw ? JSON.parse(raw) : ['botanic-gardens', 'gardens-by-the-bay'];
  } catch {
    return ['botanic-gardens', 'gardens-by-the-bay'];
  }
}

export function recordRecentPlace(placeId: string): void {
  try {
    const current = getRecentPlaces().filter((id) => id !== placeId);
    const updated = [placeId, ...current].slice(0, 6);
    localStorage.setItem(RECENT_PLACES_KEY, JSON.stringify(updated));
  } catch {
    // Non-critical
  }
}
