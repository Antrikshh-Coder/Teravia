import { NeighbourhoodProfile } from '../types';

export const NEIGHBOURHOOD_PROFILES: NeighbourhoodProfile[] = [
  {
    id: 'marina-bay',
    name: 'Marina Bay & Downtown Core',
    planningArea: 'Downtown Core / Marina South',
    parkProximityPct: 91.4,
    canopyCoverPct: 24.8,
    coolingOffsetC: 1.2,
    avgPm25: 18.6,
    connectorLengthKm: 14.2,
    nearbySpaces: ['gardens-by-the-bay', 'fort-canning'],
    description:
      'High-density commercial waterfront precinct. While overall street tree canopy is restricted by subterranean utilities and skyscraper envelopes, intensive biophilic sky-gardens, vertical green walls, and waterfront promenades provide substantial localized mitigation.',
    dominantHabitat: 'Coastal marine waterfront, landscaped civic gardens, intensive rooftop biophilia',
    limitationsNote:
      'Canopy measurement reflects ground-level tree crown projection; vertical green walls and elevated sky terraces are evaluated under separate satellite spectral indices.',
  },
  {
    id: 'bishan-ang-mo-kio',
    name: 'Bishan & Ang Mo Kio',
    planningArea: 'Bishan / Ang Mo Kio Planning Areas',
    parkProximityPct: 96.8,
    canopyCoverPct: 42.6,
    coolingOffsetC: 2.7,
    avgPm25: 14.1,
    connectorLengthKm: 28.5,
    nearbySpaces: ['bishan-ang-mo-kio', 'macritchie-reservoir', 'thomson-nature-park'],
    description:
      'Mature residential heartland anchored by the revitalised Kallang River basin and immediate adjacency to the Central Catchment buffer zone. Extensive mature rain trees line dual-lane avenues and park connectors.',
    dominantHabitat: 'Freshwater riverine floodplain, secondary riparian buffer, mature urban parkland',
    limitationsNote:
      'Cooling offset peaks in immediate 200m buffer around the naturalized river corridor; high-rise housing blocks exhibit minor thermal trapping on lee sides.',
  },
  {
    id: 'jurong-lake-district',
    name: 'Jurong Lake District',
    planningArea: 'Jurong East / Jurong West',
    parkProximityPct: 88.2,
    canopyCoverPct: 34.5,
    coolingOffsetC: 2.1,
    avgPm25: 17.8,
    connectorLengthKm: 32.1,
    nearbySpaces: ['jurong-lake-gardens', 'dairy-farm'],
    description:
      'Singapore’s second central business district framed around a 70-hectare freshwater lake. Extensive wetland boardwalks and green spine infrastructure actively counteract industrial heat contributions from the southwestern quadrant.',
    dominantHabitat: 'Freshwater lake, restored marshland, reclaimed lakeside scrub, eco-industrial fringe',
    limitationsNote:
      'Air quality sensors capture localized maritime and logistics transport particulate flows during southwest monsoon conditions.',
  },
  {
    id: 'tampines-green-spine',
    name: 'Tampines & Bedok Reservoir',
    planningArea: 'Tampines / Bedok',
    parkProximityPct: 94.1,
    canopyCoverPct: 38.9,
    coolingOffsetC: 2.0,
    avgPm25: 15.2,
    connectorLengthKm: 41.0,
    nearbySpaces: ['east-coast-park', 'coney-island'],
    description:
      'Singapore’s pioneer eco-town model. Interconnected green corridors link residential clusters directly to Bedok Reservoir, Tampines Eco Green (a pristine unlit bird haven), and Sunplaza Park.',
    dominantHabitat: 'Freshwater quarry reservoir, secondary grassland scrub, native fruit tree corridors',
    limitationsNote:
      'Tampines Eco Green is deliberately preserved with unpaved soil tracks and minimal street furniture, requiring separate accessibility assessment.',
  },
  {
    id: 'woodlands-regional',
    name: 'Woodlands & Kranji Fringe',
    planningArea: 'Woodlands / Sungei Kadut',
    parkProximityPct: 85.0,
    canopyCoverPct: 47.1,
    coolingOffsetC: 2.6,
    avgPm25: 16.3,
    connectorLengthKm: 22.8,
    nearbySpaces: ['sungei-buloh', 'rail-corridor'],
    description:
      'Northern gateway district characterized by undulating coastal topography, proximity to the Sungei Buloh estuarine mangroves, and the starting node of the 24-km Rail Corridor.',
    dominantHabitat: 'Estuarine coastal mangroves, military conservation woodland, agro-technology green buffers',
    limitationsNote:
      'Proximity to the Straits of Johor subjects the area to transboundary inter-monsoon breezes; canopy data includes agricultural plots with seasonal leaf shedding.',
  },
  {
    id: 'queenstown-kent-ridge',
    name: 'Queenstown & Kent Ridge',
    planningArea: 'Queenstown / Bukit Merah',
    parkProximityPct: 92.5,
    canopyCoverPct: 49.3,
    coolingOffsetC: 2.9,
    avgPm25: 13.8,
    connectorLengthKm: 26.4,
    nearbySpaces: ['southern-ridges', 'labrador-nature-reserve', 'botanic-gardens'],
    description:
      'Historic heritage town wrapped by the Southern Ridges and Mount Faber. Steep topography has naturally preserved dense secondary ridge forests and continuous canopy links to the southwestern coast.',
    dominantHabitat: 'Ridge dipterocarp secondary forest, coastal rocky woodland, heritage colonial estate gardens',
    limitationsNote:
      'Steep terrain gradients influence microclimate wind vectors; measurements reflect averaged ridge and valley telemetry.',
  },
];
