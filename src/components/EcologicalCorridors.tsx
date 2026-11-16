import React, { useState } from 'react';
import {
  GitFork,
  ArrowRight,
  Shield,
  Eye,
  TreePine,
  Activity,
  CheckCircle2,
  Compass,
  MapPin,
} from 'lucide-react';

export interface EcologicalCorridor {
  id: string;
  name: string;
  category: 'Wildlife Overpass' | 'Ecological Spine' | 'Canopy Walkway' | 'Nature Way Network';
  lengthKm: number;
  connectivityIndex: number; // 0 to 100
  canopyContinuityPct: number;
  targetParkIds: string[];
  keystoneFauna: {
    commonName: string;
    scientificName: string;
    conservationStatus: 'Critically Endangered' | 'Endangered' | 'Vulnerable' | 'Near Threatened';
    observationTip: string;
  }[];
  monitoredFlora: string[];
  ecologicalSignificance: string;
  historicalContext: string;
}

export const SINGAPORE_ECOLOGICAL_CORRIDORS: EcologicalCorridor[] = [
  {
    id: 'eco-link-bke',
    name: 'Eco-Link@BKE Wildlife Overpass',
    category: 'Wildlife Overpass',
    lengthKm: 0.062,
    connectivityIndex: 96,
    canopyContinuityPct: 94,
    targetParkIds: ['bukit-timah', 'macritchie'],
    keystoneFauna: [
      {
        commonName: 'Sunda Pangolin',
        scientificName: 'Manis javanica',
        conservationStatus: 'Critically Endangered',
        observationTip: 'Strictly nocturnal; nocturnal infrared camera traps document regular overpass crossings.',
      },
      {
        commonName: 'Common Palm Civet',
        scientificName: 'Paradoxurus musanga',
        conservationStatus: 'Near Threatened',
        observationTip: 'Arboreal and terrestrial fruit disperser utilizing the planted dense understory.',
      },
      {
        commonName: 'Lesser Mouse Deer',
        scientificName: 'Tragulus kanchil',
        conservationStatus: 'Critically Endangered',
        observationTip: 'Secretive ungulate restricted to primary forest patches now re-populating Bukit Timah.',
      },
    ],
    monitoredFlora: ['Tembusu (Cyrtophyllum fragrans)', 'Jelutong (Dyera costulata)', 'Native Fern Thickets'],
    ecologicalSignificance:
      'Reunited Bukit Timah Nature Reserve and Central Catchment Nature Reserve after 25 years of separation by the 6-lane BKE. Prevents genetic isolation in critically small animal populations.',
    historicalContext:
      'Completed in late 2013 by NParks. Features an hourglass design with soil depth up to 5 meters to sustain climax rainforest canopy trees.',
  },
  {
    id: 'rail-corridor',
    name: 'The Rail Corridor Green Spine',
    category: 'Ecological Spine',
    lengthKm: 24.0,
    connectivityIndex: 89,
    canopyContinuityPct: 78,
    targetParkIds: ['bukit-timah', 'clementi-forest', 'rail-corridor'],
    keystoneFauna: [
      {
        commonName: 'Crimson Sunbird',
        scientificName: 'Aethopyga siparaja',
        conservationStatus: 'Near Threatened',
        observationTip: 'Frequent visitors to flowering native shrubs like the Simpoh Air along unpaved sections.',
      },
      {
        commonName: 'Horsfield’s Flying Squirrel',
        scientificName: 'Iomys horsfieldii',
        conservationStatus: 'Vulnerable',
        observationTip: 'Glides between Albizia and secondary forest tree crowns at dusk near Clementi Forest.',
      },
      {
        commonName: 'Malayan Water Monitor',
        scientificName: 'Varanus salvator',
        conservationStatus: 'Near Threatened',
        observationTip: 'Visible basking along naturalized drainage swales and wet clearings.',
      },
    ],
    monitoredFlora: ['Simpoh Air (Dillenia suffruticosa)', 'Senduduk (Melastoma malabathricum)', 'Wild Cinnamon'],
    ecologicalSignificance:
      'Forms an unbroken 24km ecological spine running North-to-South across Singapore, allowing unfragmented wildlife dispersal between secondary forest fragments and parks.',
    historicalContext:
      'Formerly the Keretapi Tanah Melayu (KTM) railway line until 2011. Transformed into a community green corridor and critical ecological link.',
  },
  {
    id: 'southern-ridges',
    name: 'Southern Ridges Canopy Walkway',
    category: 'Canopy Walkway',
    lengthKm: 10.0,
    connectivityIndex: 86,
    canopyContinuityPct: 82,
    targetParkIds: ['mount-faber', 'telok-blangah', 'hortpark', 'kent-ridge'],
    keystoneFauna: [
      {
        commonName: 'Oriental Pied Hornbill',
        scientificName: 'Anthracoceros albirostris',
        conservationStatus: 'Near Threatened',
        observationTip: 'Flocks often forage on fig trees along the elevated Forest Walk bridge.',
      },
      {
        commonName: 'Banded Leaf Monkey',
        scientificName: 'Presbytis femoralis',
        conservationStatus: 'Critically Endangered',
        observationTip: 'Highly arboreal primates sensitive to road crossings; depend on continuous branch cover.',
      },
      {
        commonName: 'White-bellied Sea Eagle',
        scientificName: 'Haliaeetus leucogaster',
        conservationStatus: 'Near Threatened',
        observationTip: 'Routinely rides thermal updrafts rising along the southern coastal ridges.',
      },
    ],
    monitoredFlora: ['Sea Apple (Syzygium grande)', 'Strangling Fig (Ficus microcarpa)', 'Tiup Tiup (Adinandra dumosa)'],
    ecologicalSignificance:
      'Unites Mount Faber, Telok Blangah Hill, HortPark, and Kent Ridge Park. Elevated metal boardwalks allow human recreation without trampling forest floor root networks.',
    historicalContext:
      'Designed with iconic bridges like Henderson Waves and Alexandra Arch, maintaining continuous sub-canopy connectivity across deep ravines.',
  },
  {
    id: 'nature-ways-network',
    name: 'Coast-to-Coast & Nature Ways',
    category: 'Nature Way Network',
    lengthKm: 300.0,
    connectivityIndex: 81,
    canopyContinuityPct: 68,
    targetParkIds: ['jurong-lake', 'bishan-amk', 'coney-island', 'punggol-waterway'],
    keystoneFauna: [
      {
        commonName: 'Blue-crowned Hanging Parrot',
        scientificName: 'Loriculus galgulus',
        conservationStatus: 'Near Threatened',
        observationTip: 'Feeds upside down on nectar and wild fruit along tiered roadside tree plantings.',
      },
      {
        commonName: 'Common Birdwing Butterfly',
        scientificName: 'Troides helena',
        conservationStatus: 'Vulnerable',
        observationTip: 'Attracted to Dutchman’s Pipe host vines planted along designated Nature Ways.',
      },
      {
        commonName: 'Native Carpenter Bee',
        scientificName: 'Xylocopa latipes',
        conservationStatus: 'Near Threatened',
        observationTip: 'Critical tropical buzz-pollinator servicing native forest trees throughout the city.',
      },
    ],
    monitoredFlora: ['Rain Tree (Samanea saman)', 'Yellow Flame (Peltophorum pterocarpum)', 'Spider Lily'],
    ecologicalSignificance:
      'Engineered roadside corridors replicating natural forest vertical structure: emergent layer, canopy, shrub layer, and ground cover. Enables birds and pollinating insects to traverse concrete urban canyons.',
    historicalContext:
      'Part of Singapore’s "City in Nature" masterplan to extend forest microhabitats directly into streetscapes and residential neighborhoods.',
  },
];

interface EcologicalCorridorsProps {
  onSelectPark?: (parkId: string) => void;
  onNavigateToMap?: () => void;
}

export const EcologicalCorridors: React.FC<EcologicalCorridorsProps> = ({
  onSelectPark,
  onNavigateToMap,
}) => {
  const [selectedCorridorId, setSelectedCorridorId] = useState<string>('eco-link-bke');

  const selectedCorridor =
    SINGAPORE_ECOLOGICAL_CORRIDORS.find((c) => c.id === selectedCorridorId) ||
    SINGAPORE_ECOLOGICAL_CORRIDORS[0];

  return (
    <div className="w-full bg-[#151A16] rounded-3xl border border-[#25352A] p-5 sm:p-8 shadow-2xl relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#25352A]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-[#25352A] text-[#AAB29A] border border-[#727B5A]/30 flex items-center gap-1.5">
              <GitFork className="w-3 h-3 text-[#727B5A]" />
              Ecological Connectivity Engine
            </span>
            <span className="text-[11px] text-[#777B70] hidden sm:inline">•</span>
            <span className="text-[11px] text-[#AAB29A] hidden sm:inline">
              NParks Habitat Corridors & Wildlife Dispersal
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-medium text-[#F4F3EC] tracking-tight">
            Singapore Ecological Corridors & Nature Ways
          </h3>
          <p className="text-xs text-[#777B70] mt-1 max-w-2xl leading-relaxed">
            Discover how Singapore reunites fragmented rainforest sanctuaries through engineered wildlife
            overpasses, canopy bridges, and multi-tiered biodiverse streetscapes.
          </p>
        </div>

        {onNavigateToMap && (
          <button
            onClick={onNavigateToMap}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#25352A] hover:bg-[#F4F3EC] hover:text-[#252820] text-xs font-semibold text-[#F4F3EC] transition-all cursor-pointer self-start md:self-auto"
          >
            <Compass className="w-3.5 h-3.5 text-[#727B5A]" />
            <span>View All on Map</span>
          </button>
        )}
      </div>

      {/* Corridor Selector Tabs */}
      <div className="pt-6">
        <label className="text-[11px] uppercase tracking-wider font-semibold text-[#777B70] block mb-2.5">
          Select Singapore Wildlife Corridor:
        </label>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
          {SINGAPORE_ECOLOGICAL_CORRIDORS.map((corridor) => {
            const isSelected = selectedCorridor.id === corridor.id;
            return (
              <button
                key={corridor.id}
                onClick={() => setSelectedCorridorId(corridor.id)}
                className={`p-3.5 rounded-2xl text-left transition-all border cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-[#1C231E] border-[#727B5A] shadow-md ring-1 ring-[#727B5A]/50'
                    : 'bg-[#121714]/70 border-[#25352A] hover:border-[#41483A] hover:bg-[#1C231E]/60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span
                      className={`text-xs font-medium truncate ${
                        isSelected ? 'text-[#F4F3EC]' : 'text-[#AAB29A]'
                      }`}
                    >
                      {corridor.name.split(' ')[0]} {corridor.name.split(' ')[1]}
                    </span>
                    <span className="text-[10px] text-emerald-400 font-semibold">
                      {corridor.connectivityIndex}/100
                    </span>
                  </div>
                  <span className="text-[10px] text-[#777B70] block">{corridor.category}</span>
                </div>
                <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-[#25352A]/40 text-[10px] text-[#777B70]">
                  <span>{corridor.lengthKm >= 1 ? `${corridor.lengthKm} km` : `${corridor.lengthKm * 1000} m`}</span>
                  <span className="text-emerald-400/90">{corridor.canopyContinuityPct}% canopy</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Corridor Deep-Dive */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-6 mt-2">
        {/* Left column: Overview, significance and historical context */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-[#121714]/80 rounded-2xl p-5 border border-[#25352A] space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] uppercase tracking-wider font-semibold text-[#727B5A]">
                  {selectedCorridor.category}
                </span>
                <h4 className="text-lg sm:text-xl font-medium text-[#F4F3EC] mt-0.5">
                  {selectedCorridor.name}
                </h4>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-2xl font-bold text-emerald-400">
                  {selectedCorridor.connectivityIndex}
                </span>
                <span className="text-[9px] uppercase tracking-wider text-[#777B70]">
                  Connectivity Score
                </span>
              </div>
            </div>

            <p className="text-xs text-[#AAB29A] leading-relaxed">
              {selectedCorridor.ecologicalSignificance}
            </p>

            <div className="p-3.5 rounded-xl bg-[#151A16] border border-[#25352A] text-xs text-[#777B70]">
              <strong className="text-[#F4F3EC] block mb-1">Architecture & Engineering Context:</strong>
              {selectedCorridor.historicalContext}
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-3 gap-2.5 pt-1">
              <div className="p-2.5 rounded-xl bg-[#151A16] border border-[#25352A]">
                <span className="text-[9px] uppercase text-[#777B70] block">Length</span>
                <span className="text-sm font-semibold text-[#F4F3EC]">
                  {selectedCorridor.lengthKm >= 1
                    ? `${selectedCorridor.lengthKm} km`
                    : `${selectedCorridor.lengthKm * 1000} meters`}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#151A16] border border-[#25352A]">
                <span className="text-[9px] uppercase text-[#777B70] block">Canopy Cover</span>
                <span className="text-sm font-semibold text-emerald-400">
                  {selectedCorridor.canopyContinuityPct}%
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#151A16] border border-[#25352A]">
                <span className="text-[9px] uppercase text-[#777B70] block">Keystone Fauna</span>
                <span className="text-sm font-semibold text-[#AAB29A]">
                  {selectedCorridor.keystoneFauna.length} Monitored
                </span>
              </div>
            </div>

            {/* Monitored Flora tags */}
            <div className="pt-2">
              <span className="text-[10px] uppercase tracking-wider text-[#777B70] block mb-1.5">
                Characteristic Native Flora Species:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {selectedCorridor.monitoredFlora.map((flora, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-full text-[10px] bg-[#1C231E] border border-[#25352A] text-[#AAB29A]"
                  >
                    🌿 {flora}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Monitored Keystone Species with Observation Tips */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between pb-1">
            <span className="text-xs uppercase tracking-wider font-semibold text-[#AAB29A] flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-[#727B5A]" />
              Monitored Keystone Species
            </span>
            <span className="text-[10px] text-emerald-400 font-medium">Field Observations</span>
          </div>

          <div className="space-y-2.5">
            {selectedCorridor.keystoneFauna.map((fauna, idx) => (
              <div
                key={idx}
                className="bg-[#121714]/80 p-3.5 rounded-2xl border border-[#25352A] hover:border-[#41483A] transition-all space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-semibold text-[#F4F3EC]">{fauna.commonName}</h5>
                  <span
                    className={`text-[9px] px-2 py-0.5 rounded-full font-semibold ${
                      fauna.conservationStatus === 'Critically Endangered'
                        ? 'bg-rose-950/50 text-rose-300 border border-rose-800/50'
                        : fauna.conservationStatus === 'Vulnerable'
                        ? 'bg-amber-950/50 text-amber-300 border border-amber-800/50'
                        : 'bg-emerald-950/50 text-emerald-300 border border-emerald-800/50'
                    }`}
                  >
                    {fauna.conservationStatus}
                  </span>
                </div>
                <div className="text-[10px] italic text-[#727B5A]">{fauna.scientificName}</div>
                <p className="text-[11px] text-[#777B70] leading-snug">{fauna.observationTip}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
