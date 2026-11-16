import React, { useState, useEffect, useMemo, useRef } from 'react';
import { JournalEntry, JournalCategory } from '../types';
import {
  getJournalEntries,
  saveJournalEntry,
  deleteJournalEntry,
} from '../services/storage';
import { api } from '../services/apiClient';
import { SINGAPORE_GREEN_SPACES } from '../data/singaporePlaces';
import {
  BookOpen,
  Plus,
  Search,
  Calendar,
  MapPin,
  Tag,
  Edit3,
  Trash2,
  X,
  Camera,
  Image as ImageIcon,
  Check,
  ShieldCheck,
  Download,
  Upload,
  AlertTriangle,
  Leaf,
} from 'lucide-react';

const CATEGORIES: ('All' | JournalCategory)[] = [
  'All',
  'Plants',
  'Birds',
  'Insects',
  'Wildlife',
  'Landscapes',
  'Other',
];

const SAMPLE_PRESET_IMAGES = [
  {
    label: 'Crimson Sunbird',
    url: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?auto=format&fit=crop&w=900&q=80',
  },
  {
    label: 'Forest Canopy & Ferns',
    url: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=900&q=80',
  },
  {
    label: 'Wetland Monitor',
    url: 'https://images.unsplash.com/photo-1544979590-37e9b47eb705?auto=format&fit=crop&w=900&q=80',
  },
  {
    label: 'Golden Butterfly',
    url: 'https://images.unsplash.com/photo-1533038590840-1cde6e668a91?auto=format&fit=crop&w=900&q=80',
  },
  {
    label: 'Misty Boulders',
    url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=900&q=80',
  },
];

interface NatureJournalProps {
  prefilledLocation?: string | null;
  onEntriesChange?: () => void;
}

export const NatureJournal: React.FC<NatureJournalProps> = ({
  prefilledLocation,
  onEntriesChange,
}) => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<'All' | JournalCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeModal, setActiveModal] = useState<'create' | 'edit' | 'detail' | null>(null);
  const [currentEntry, setCurrentEntry] = useState<JournalEntry | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isLoadingEntries, setIsLoadingEntries] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    scientificName: '',
    category: 'Plants' as JournalCategory,
    location: '',
    date: new Date().toISOString().split('T')[0],
    weatherCondition: '',
    description: '',
    imageUrl: SAMPLE_PRESET_IMAGES[0].url,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadEntries = async () => {
    setIsLoadingEntries(true);
    try {
      const data = await api.getJournalEntries();
      if (data && data.items) {
        const mapped: JournalEntry[] = data.items.map((item) => ({
          id: item.id,
          title: item.title,
          scientificName: item.scientific_name,
          category: item.category as JournalCategory,
          location: item.location,
          date: item.entry_date,
          imageUrl: item.image_url,
          weatherCondition: item.weather_condition,
          description: item.description,
          createdAt: new Date(item.created_at).getTime(),
        }));
        setEntries(mapped);
      }
    } catch (err) {
      console.warn('Backend journal fetch failed, falling back to local storage:', err);
      setEntries(getJournalEntries());
    } finally {
      setIsLoadingEntries(false);
    }
  };

  useEffect(() => {
    loadEntries();
  }, []);

  useEffect(() => {
    if (prefilledLocation) {
      setFormData((prev) => ({ ...prev, location: prefilledLocation }));
      setActiveModal('create');
    }
  }, [prefilledLocation]);

  // Escape key listener for modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveModal(null);
        setDeleteConfirmId(null);
      }
    };
    if (activeModal || deleteConfirmId) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeModal, deleteConfirmId]);

  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      const matchCat = selectedCategory === 'All' || entry.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        entry.title.toLowerCase().includes(q) ||
        entry.description.toLowerCase().includes(q) ||
        entry.location.toLowerCase().includes(q) ||
        (entry.scientificName && entry.scientificName.toLowerCase().includes(q));
      return matchCat && matchQuery;
    });
  }, [entries, selectedCategory, searchQuery]);

  const handleOpenCreate = () => {
    setFormData({
      title: '',
      scientificName: '',
      category: 'Plants',
      location: '',
      date: new Date().toISOString().split('T')[0],
      weatherCondition: 'Warm, 29°C, clear skies',
      description: '',
      imageUrl: SAMPLE_PRESET_IMAGES[0].url,
    });
    setActiveModal('create');
  };

  const handleOpenEdit = (entry: JournalEntry) => {
    setCurrentEntry(entry);
    setFormData({
      title: entry.title,
      scientificName: entry.scientificName || '',
      category: entry.category,
      location: entry.location,
      date: entry.date,
      weatherCondition: entry.weatherCondition || '',
      description: entry.description,
      imageUrl: entry.imageUrl,
    });
    setActiveModal('edit');
  };

  const handleOpenDetail = (entry: JournalEntry) => {
    setCurrentEntry(entry);
    setActiveModal('detail');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Convert file to compressed base64
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 1200;
        let w = img.width;
        let h = img.height;
        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, w, h);
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
        setFormData((prev) => ({ ...prev, imageUrl: compressedBase64 }));
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.location.trim()) {
      alert('Please provide a title and location for this observation.');
      return;
    }

    setIsSaving(true);
    const isEdit = activeModal === 'edit';

    try {
      if (isEdit && currentEntry) {
        await api.updateJournalEntry(currentEntry.id, {
          title: formData.title.trim(),
          scientific_name: formData.scientificName.trim() || undefined,
          category: formData.category,
          location: formData.location.trim(),
          entry_date: formData.date,
          image_url: formData.imageUrl,
          weather_condition: formData.weatherCondition.trim() || undefined,
          description: formData.description.trim(),
        });
        setToastMessage('Observation updated in persistent database.');
      } else {
        await api.createJournalEntry({
          title: formData.title.trim(),
          scientific_name: formData.scientificName.trim() || undefined,
          category: formData.category,
          location: formData.location.trim(),
          entry_date: formData.date,
          image_url: formData.imageUrl,
          weather_condition: formData.weatherCondition.trim() || undefined,
          description: formData.description.trim(),
        });
        setToastMessage('Observation saved to persistent database.');
      }
      await loadEntries();
      setActiveModal(null);
      setCurrentEntry(null);
    } catch (err: any) {
      console.warn('API journal save failed, saving to local fallback:', err);
      const fallbackEntry: JournalEntry = {
        id: isEdit && currentEntry ? currentEntry.id : `entry-${Date.now()}`,
        title: formData.title.trim(),
        scientificName: formData.scientificName.trim() || undefined,
        category: formData.category,
        location: formData.location.trim(),
        date: formData.date,
        weatherCondition: formData.weatherCondition.trim() || undefined,
        description: formData.description.trim(),
        imageUrl: formData.imageUrl,
        createdAt: isEdit && currentEntry ? currentEntry.createdAt : Date.now(),
      };
      const updated = saveJournalEntry(fallbackEntry);
      setEntries(updated);
      setActiveModal(null);
      setCurrentEntry(null);
      setToastMessage('Observation saved (offline mode).');
    } finally {
      setIsSaving(false);
      setTimeout(() => setToastMessage(null), 3500);
      onEntriesChange?.();
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteJournalEntry(id);
      await loadEntries();
      setToastMessage('Observation removed from persistent database.');
    } catch (err) {
      console.warn('API journal delete failed, deleting from local fallback:', err);
      const updated = deleteJournalEntry(id);
      setEntries(updated);
      setToastMessage('Observation removed.');
    } finally {
      setDeleteConfirmId(null);
      if (activeModal === 'detail') setActiveModal(null);
      setTimeout(() => setToastMessage(null), 3500);
      onEntriesChange?.();
    }
  };

  const handleExportBackup = () => {
    const jsonStr = JSON.stringify(entries, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `teravia-journal-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full min-h-[calc(100vh-4.5rem)] bg-[#0E120F] text-[#F4F3EC] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header and Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#727B5A]">
              <BookOpen className="w-4 h-4" />
              <span>Field Phenology & Observation</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-[#F4F3EC]">
              Nature Journal
            </h1>
            <p className="text-xs sm:text-sm text-[#777B70]">
              Document your spontaneous encounters with plants, birds, insects, and living ecosystems.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleExportBackup}
              className="px-3.5 py-2 rounded-xl text-xs font-medium bg-[#1C231E] hover:bg-[#25352A] text-[#AAB29A] hover:text-white border border-[#25352A] flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Export all observations as JSON"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Backup</span>
            </button>

            <button
              onClick={handleOpenCreate}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#F4F3EC] text-[#252820] hover:bg-white transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#727B5A]" />
              <span>New Observation</span>
            </button>
          </div>
        </div>

        {/* Local Storage Privacy Banner */}
        <div className="p-3.5 rounded-2xl bg-[#151A16] border border-[#25352A] flex items-center justify-between gap-3 text-xs text-[#AAB29A]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#727B5A] flex-shrink-0" />
            <span>
              <strong>Private & Local:</strong> Your observations are saved directly in your browser storage. Entries are never uploaded to remote tracking servers.
            </span>
          </div>
          <span className="text-[11px] text-[#777B70] hidden sm:inline">
            {entries.length} observation{entries.length === 1 ? '' : 's'} recorded
          </span>
        </div>

        {/* Filters and Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#25352A]">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 sm:pb-0">
            {CATEGORIES.map((cat) => {
              const count =
                cat === 'All'
                  ? entries.length
                  : entries.filter((e) => e.category === cat).length;
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-[#25352A] text-white font-semibold shadow-sm'
                      : 'bg-[#151A16] text-[#AAB29A] hover:bg-[#1C231E] hover:text-white border border-[#25352A]'
                  }`}
                >
                  <span>{cat}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isActive ? 'bg-[#727B5A] text-white' : 'bg-[#1C231E] text-[#777B70]'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#777B70]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search observations, species..."
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-[#151A16] border border-[#25352A] rounded-full text-[#F4F3EC] focus:outline-none focus:border-[#727B5A]"
            />
          </div>
        </div>

        {/* Observations Grid */}
        {filteredEntries.length === 0 ? (
          <div className="rounded-3xl bg-[#151A16] border border-[#25352A] p-12 text-center flex flex-col items-center justify-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#1C231E] border border-[#25352A] flex items-center justify-center text-[#777B70]">
              <Leaf className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-medium text-[#F4F3EC]">No observations found</h3>
            <p className="text-xs text-[#777B70] max-w-sm leading-relaxed">
              {searchQuery
                ? 'No recorded entries match your search query. Try clearing the search filter.'
                : 'Your field journal is empty. Record your first nature encounter to begin.'}
            </p>
            <button
              onClick={handleOpenCreate}
              className="mt-2 px-4 py-2 rounded-xl text-xs font-semibold bg-[#25352A] text-[#F4F3EC] hover:bg-[#41483A] transition-colors"
            >
              Record First Encounter
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredEntries.map((entry) => (
              <div
                key={entry.id}
                onClick={() => handleOpenDetail(entry)}
                className="group rounded-3xl bg-[#151A16] border border-[#25352A] hover:border-[#727B5A] transition-all cursor-pointer overflow-hidden shadow-lg flex flex-col justify-between"
              >
                {/* Photo Header */}
                <div className="relative h-48 w-full bg-[#1C231E] overflow-hidden">
                  <img
                    src={entry.imageUrl}
                    alt={entry.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#151A16] via-transparent to-black/20" />
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-[#0E120F]/80 text-[#AAB29A] backdrop-blur-md">
                    {entry.category}
                  </span>
                  <span className="absolute bottom-3 left-3 text-[11px] text-[#AAB29A] font-medium backdrop-blur-md px-2 py-0.5 rounded bg-black/40">
                    {entry.date}
                  </span>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="text-base font-semibold text-[#F4F3EC] group-hover:text-white transition-colors">
                      {entry.title}
                    </h3>
                    {entry.scientificName && (
                      <p className="text-xs text-[#727B5A] italic">
                        {entry.scientificName}
                      </p>
                    )}
                    <p className="text-xs text-[#777B70] line-clamp-3 mt-1.5 leading-relaxed">
                      {entry.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#25352A]/60 flex items-center justify-between text-[11px] text-[#AAB29A]">
                    <div className="flex items-center gap-1.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-[#727B5A] flex-shrink-0" />
                      <span className="truncate">{entry.location}</span>
                    </div>

                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleOpenEdit(entry)}
                        className="p-1.5 rounded-lg hover:bg-[#25352A] text-[#777B70] hover:text-[#F4F3EC] transition-colors"
                        title="Edit entry"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(entry.id)}
                        className="p-1.5 rounded-lg hover:bg-rose-950/60 text-[#777B70] hover:text-rose-400 transition-colors"
                        title="Delete entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Modal: Create / Edit Observation ── */}
        {(activeModal === 'create' || activeModal === 'edit') && (
          <div
            className="fixed inset-0 z-[2100] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200"
            onClick={() => setActiveModal(null)}
          >
            <div
              className="w-full max-w-xl bg-[#151A16] border border-[#25352A] rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl relative my-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#25352A]">
                <div>
                  <h3 className="text-lg font-medium text-[#F4F3EC]">
                    {activeModal === 'create' ? 'Record Nature Observation' : 'Edit Observation'}
                  </h3>
                  <p className="text-xs text-[#777B70]">
                    Encounters are preserved securely in your device’s local browser storage.
                  </p>
                </div>
                <button
                  onClick={() => setActiveModal(null)}
                  className="p-2 text-[#777B70] hover:text-white rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                {/* Title */}
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#AAB29A] font-semibold mb-1">
                    Observation Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Crimson Sunbird in Morning Light"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#1C231E] border border-[#25352A] text-[#F4F3EC] focus:border-[#727B5A] focus:outline-none"
                  />
                </div>

                {/* Category & Scientific Name Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-[#AAB29A] font-semibold mb-1">
                      Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value as JournalCategory })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#1C231E] border border-[#25352A] text-[#F4F3EC] focus:border-[#727B5A] focus:outline-none"
                    >
                      {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-[#AAB29A] font-semibold mb-1">
                      Scientific Binomial (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.scientificName}
                      onChange={(e) => setFormData({ ...formData, scientificName: e.target.value })}
                      placeholder="e.g. Aethopyga siparaja"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#1C231E] border border-[#25352A] text-[#F4F3EC] focus:border-[#727B5A] focus:outline-none italic"
                    />
                  </div>
                </div>

                {/* Location & Date Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-[#AAB29A] font-semibold mb-1">
                      Location / Park *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="e.g. Singapore Botanic Gardens"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#1C231E] border border-[#25352A] text-[#F4F3EC] focus:border-[#727B5A] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-[#AAB29A] font-semibold mb-1">
                      Date Observed *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#1C231E] border border-[#25352A] text-[#F4F3EC] focus:border-[#727B5A] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Weather condition */}
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#AAB29A] font-semibold mb-1">
                    Weather & Habitat Microclimate
                  </label>
                  <input
                    type="text"
                    value={formData.weatherCondition}
                    onChange={(e) =>
                      setFormData({ ...formData, weatherCondition: e.target.value })
                    }
                    placeholder="e.g. 29°C, high humidity, clear morning sun, canopy filtered"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#1C231E] border border-[#25352A] text-[#F4F3EC] focus:border-[#727B5A] focus:outline-none"
                  />
                </div>

                {/* Field Notes / Description */}
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#AAB29A] font-semibold mb-1">
                    Field Description & Behavior Notes
                  </label>
                  <textarea
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe behavioral posture, micro-habitat, substrate, floral nectar sources, or surrounding canopy structure..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#1C231E] border border-[#25352A] text-[#F4F3EC] focus:border-[#727B5A] focus:outline-none leading-relaxed"
                  />
                </div>

                {/* Photo Upload & Preset Image Selector */}
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#AAB29A] font-semibold mb-1">
                    Photograph
                  </label>
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#1C231E] hover:bg-[#25352A] border border-[#25352A] text-xs text-[#F4F3EC] flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Camera className="w-4 h-4 text-[#727B5A]" />
                      <span>Upload Local Photo</span>
                    </button>
                    <span className="text-[11px] text-[#777B70]">or pick a preset:</span>
                    <div className="flex items-center gap-1.5 overflow-x-auto">
                      {SAMPLE_PRESET_IMAGES.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setFormData({ ...formData, imageUrl: preset.url })}
                          className={`w-9 h-9 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                            formData.imageUrl === preset.url
                              ? 'border-[#727B5A] scale-105'
                              : 'border-[#25352A] opacity-60 hover:opacity-100'
                          }`}
                          title={preset.label}
                        >
                          <img
                            src={preset.url}
                            alt={preset.label}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Submit Actions */}
                <div className="pt-4 border-t border-[#25352A] flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="px-4 py-2.5 rounded-xl text-xs font-medium text-[#777B70] hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl text-xs font-semibold bg-[#F4F3EC] text-[#252820] hover:bg-white shadow-md cursor-pointer"
                  >
                    {activeModal === 'create' ? 'Save Observation' : 'Update Entry'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── Modal: Detail View ── */}
        {activeModal === 'detail' && currentEntry && (
          <div
            className="fixed inset-0 z-[2100] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200"
            onClick={() => setActiveModal(null)}
          >
            <div
              className="w-full max-w-2xl bg-[#151A16] border border-[#25352A] rounded-3xl overflow-hidden shadow-2xl relative my-8"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header Photo */}
              <div className="relative h-64 sm:h-72 w-full bg-[#1C231E]">
                <img
                  src={currentEntry.imageUrl}
                  alt={currentEntry.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#151A16] via-transparent to-black/30" />
                <button
                  onClick={() => setActiveModal(null)}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/90 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-[#25352A] text-[#AAB29A] border border-[#727B5A]/40 backdrop-blur-md">
                    {currentEntry.category}
                  </span>
                  <span className="text-xs text-[#F4F3EC] bg-black/60 backdrop-blur-md px-3 py-1 rounded-full">
                    {currentEntry.date}
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="p-6 sm:p-8 space-y-5 text-xs">
                <div>
                  <h3 className="text-2xl font-medium text-[#F4F3EC] tracking-tight">
                    {currentEntry.title}
                  </h3>
                  {currentEntry.scientificName && (
                    <p className="text-sm text-[#727B5A] italic mt-0.5">
                      {currentEntry.scientificName}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-[#AAB29A] py-2 border-y border-[#25352A]">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-[#727B5A]" />
                    <span>{currentEntry.location}</span>
                  </div>
                  {currentEntry.weatherCondition && (
                    <div className="flex items-center gap-1.5">
                      <span>•</span>
                      <span>{currentEntry.weatherCondition}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <h5 className="text-[11px] uppercase tracking-wider text-[#AAB29A] font-semibold">
                    Field Notes & Observations
                  </h5>
                  <p className="text-sm text-[#F4F3EC]/90 leading-relaxed whitespace-pre-line">
                    {currentEntry.description}
                  </p>
                </div>

                {/* Footer Actions */}
                <div className="pt-4 border-t border-[#25352A] flex items-center justify-between">
                  <button
                    onClick={() => setDeleteConfirmId(currentEntry.id)}
                    className="px-3.5 py-2 rounded-xl text-xs text-rose-400 hover:bg-rose-950/40 border border-rose-900/40 flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>

                  <button
                    onClick={() => handleOpenEdit(currentEntry)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#25352A] text-[#F4F3EC] hover:bg-[#41483A] border border-[#727B5A]/40 flex items-center gap-1.5"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Entry</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Confirmation Modal: Delete Observation ── */}
        {deleteConfirmId && (
          <div
            className="fixed inset-0 z-[2100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
            onClick={() => setDeleteConfirmId(null)}
          >
            <div
              className="w-full max-w-sm bg-[#151A16] border border-rose-900/50 rounded-2xl p-6 space-y-4 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 text-rose-400">
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                <h4 className="text-sm font-semibold text-[#F4F3EC]">Delete Observation?</h4>
              </div>
              <p className="text-xs text-[#777B70] leading-relaxed">
                This will permanently delete this field record from your device’s local storage. This action cannot be undone.
              </p>
              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="px-3.5 py-1.5 rounded-lg text-xs text-[#AAB29A] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirmId)}
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 text-white hover:bg-rose-500 shadow-sm"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Toast notification banner */}
        {toastMessage && (
          <div
            role="status"
            aria-live="polite"
            className="fixed bottom-6 right-6 z-50 bg-[#1C231E] border border-[#727B5A] text-[#F4F3EC] px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-xs animate-in slide-in-from-bottom duration-300"
          >
            <Check className="w-4 h-4 text-[#727B5A]" />
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
};
