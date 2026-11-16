import { EnvironmentalStory } from '../types';

export const ENVIRONMENTAL_STORIES: EnvironmentalStory[] = [
  {
    id: 'urban-canopy-cooling',
    title: 'The Living Shield: How Urban Trees Moderate Tropical Heat',
    subtitle: 'Microclimate thermodynamics, latent heat flux, and the cooling anatomy of rain trees.',
    category: 'Urban Ecology',
    readTime: '6 min read',
    publishedDate: 'October 14, 2026',
    author: 'Dr. Evelyn Tan • TERAVIA Microclimate Lab',
    coverImage:
      'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=1200&q=80',
    summary:
      'In equatorial cities like Singapore, the difference between an asphalt parking lot and a shaded park road can exceed 18°C on surface thermal scans. We examine the biophysical mechanics behind urban canopy cooling.',
    content: [
      {
        type: 'paragraph',
        text: 'Walk across an unshaded asphalt intersection in Singapore at 1:00 PM, and your thermal sensors register radiant surface temperatures exceeding 54°C. Step three paces beneath the canopy of a mature Rain Tree (Albizia saman), and the ground temperature drops immediately to 32°C. The air itself feels noticeably cooler—by as much as 2.8°C to 4.1°C.',
      },
      {
        type: 'quote',
        text: 'A single mature tropical tree can transpire over 400 litres of water daily into the boundary layer, acting as a natural evaporative chiller consuming solar irradiance that would otherwise bake concrete.',
      },
      {
        type: 'heading',
        text: 'Beyond Direct Shade: The Science of Latent Heat Flux',
      },
      {
        type: 'paragraph',
        text: 'While the umbrella-shaped crown of an Albizia saman intercepts over 80% of photosynthetically active radiation (PAR), the more powerful thermal mechanism is latent heat flux. As tree roots pull moisture from deep soil layers, water evaporates through microscopic stomata on the leaf undersides. This phase change absorbs vast quantities of thermal energy from the immediate microclimate.',
      },
      {
        type: 'callout',
        text: 'Thermal studies by the National University of Singapore (NUS) Cooling Singapore Initiative demonstrate that continuous canopy corridors reduce the perceived Physiological Equivalent Temperature (PET) by up to 6.5°C for pedestrians.',
      },
      {
        type: 'heading',
        text: 'Designing Multi-Tiered Streetscapes',
      },
      {
        type: 'paragraph',
        text: 'Monoculture tree lines offer modest benefits compared to multi-tiered planting schemes. In Singapore’s Nature Ways, planners intentionally replicate a natural rainforest strata: groundcover, understorey shrubs, sub-canopy fruit trees, and emergent canopy giants. This layered vertical profile blocks lateral radiant heat bounce while channeling cooling breezes along pedestrian footpaths.',
      },
    ],
    sources: [
      {
        title: 'Cooling Singapore 2.0: Anthropogenic Heat and Urban Climate Strategies',
        publisher: 'Singapore-ETH Centre & National Research Foundation',
        year: '2024',
        url: 'https://www.coolingsingapore.sg',
      },
      {
        title: 'Microclimatic Effects of Urban Tree Canopies in Equatorial Cities',
        publisher: 'Landscape and Urban Planning Journal, Vol. 219',
        year: '2023',
      },
      {
        title: 'Vegetation and Urban Heat Island Mitigation in Tropical Metropolises',
        publisher: 'National University of Singapore Department of Architecture',
        year: '2025',
      },
    ],
    relatedStoryIds: ['park-connectors-biodiversity', 'decoding-air-quality'],
  },
  {
    id: 'park-connectors-biodiversity',
    title: 'The Hidden Corridors: How Park Connectors Shield Singapore’s Biodiversity',
    subtitle: 'Connecting fragmented nature reserves to ensure genetic flow and wildlife mobility.',
    category: 'Conservation',
    readTime: '7 min read',
    publishedDate: 'September 28, 2026',
    author: 'Marcus Lim • Biodiversity Informatics',
    coverImage:
      'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80',
    summary:
      'When expressways divide ancient forests, animal populations risk genetic inbreeding and isolation. Discover how Singapore’s 360-kilometre Park Connector Network (PCN) and Eco-Link bridges are weaving nature back together.',
    content: [
      {
        type: 'paragraph',
        text: 'In 1986, the construction of the Bukit Timah Expressway (BKE) severed the historic ecological connection between the Central Catchment Nature Reserve and Bukit Timah Nature Reserve. For nearly three decades, small forest animals like the Sunda Pangolin and Banded Leaf Monkey were trapped on either side, facing localized extinction from genetic drift.',
      },
      {
        type: 'quote',
        text: 'Ecosystems require connectivity. Without contiguous canopy or subterranean passages, parks become biological islands where diversity slowly starves.',
      },
      {
        type: 'heading',
        text: 'The Eco-Link@BKE Experiment',
      },
      {
        type: 'paragraph',
        text: 'Completed in late 2013, the Eco-Link@BKE is a 62-metre-long wildlife bridge densely planted with native trees spanning six lanes of vehicular traffic. Camera traps have since documented over 40 species crossing the vegetated overpass, including the rare Lesser Mousedeer, Common Palm Civets, and native forest birds.',
      },
      {
        type: 'heading',
        text: 'Nature Ways: Vertical Corridors in the Heartlands',
      },
      {
        type: 'paragraph',
        text: 'Beyond major bridges, Singapore’s 180+ kilometres of dedicated Nature Ways are road-verge corridors planted with specific butterfly host plants, native fig trees, and nectar-rich shrubs. These corridors guide birds and insect pollinators through dense housing estates, connecting distant parks into one coherent living system.',
      },
    ],
    sources: [
      {
        title: 'Assessment of Wildlife Crossings and Habitat Connectivity in Singapore',
        publisher: 'Nature Society (Singapore) & National Parks Board',
        year: '2024',
      },
      {
        title: 'Long-term Wildlife Monitoring of the Eco-Link@BKE',
        publisher: 'Raffles Bulletin of Zoology',
        year: '2023',
      },
    ],
    relatedStoryIds: ['urban-canopy-cooling', 'field-observation-ethos'],
  },
  {
    id: 'decoding-air-quality',
    title: 'Decoding Air Quality: Beyond the Numbers to Understanding Microclimates',
    subtitle: 'Why two streets in the same neighbourhood can register vastly different pollutant loads.',
    category: 'Environmental Physics',
    readTime: '5 min read',
    publishedDate: 'September 12, 2026',
    author: 'Aria Chen • TERAVIA Sensor Network',
    coverImage:
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
    summary:
      'A citywide average PSI reading tells only a fraction of the story. High-density urban canyons and dense tree buffers create hyper-local air microclimates that affect your daily health.',
    content: [
      {
        type: 'paragraph',
        text: 'When you check a standard weather app in Singapore, you frequently see a regional 1-hour PM2.5 or 24-hour PSI measurement. Yet, if you carry a portable optical particle counter 50 metres from a busy bus interchange into an adjacent park like Bishan-Ang Mo Kio, the recorded particulate density drops by over 60%.',
      },
      {
        type: 'heading',
        text: 'The Urban Street Canyon Trap',
      },
      {
        type: 'paragraph',
        text: 'In high-density commercial strips, tall building facades form narrow street canyons. Vehicle exhaust containing fine particulates and nitrogen oxides becomes trapped within swirling vortexes created by wind shear against glass towers. Without vegetation, these pollutants remain suspended at human breathing height for hours.',
      },
      {
        type: 'heading',
        text: 'Leaves as Particulate Sinks',
      },
      {
        type: 'paragraph',
        text: 'Rough, hairy, and wax-coated leaves on native trees like Terminalia catappa (Sea Almond) and Syzygium grande (Sea Apple) physically intercept airborne dust and soot particles. When rain showers arrive, these particles are washed into root-zone bio-retention swales, effectively cleansing the air column.',
      },
    ],
    sources: [
      {
        title: 'Urban Particulate Matter Interception by Tropical Tree Leaves',
        publisher: 'Atmospheric Environment, Vol. 288',
        year: '2024',
      },
      {
        title: 'Air Quality Reporting Guidelines and Standards for Singapore',
        publisher: 'National Environment Agency (NEA)',
        year: '2025',
        url: 'https://www.nea.gov.sg',
      },
    ],
    relatedStoryIds: ['urban-canopy-cooling', 'rewilding-urban-lawns'],
  },
  {
    id: 'rewilding-urban-lawns',
    title: 'From Manicured Lawns to Spontaneous Flora: The Rewilding Revolution',
    subtitle: 'How reduced mowing cycles and native wildflower meadows are restoring urban soil ecology.',
    category: 'Restoration',
    readTime: '6 min read',
    publishedDate: 'August 30, 2026',
    author: 'Jeremy Goh • Soil & Flora Research',
    coverImage:
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
    summary:
      'For decades, neat manicured turfgrass was the symbol of orderly municipal landscaping. Today, cities are discovering that allowing spontaneous native herbs and grasses to bloom transforms urban biodiversity.',
    content: [
      {
        type: 'paragraph',
        text: 'In 2020, Singapore’s landscape maintenance teams shifted from fortnightly mechanical mowing to extended six-to-eight week cycles along designated roadsides and park margins. What emerged surprised botanists: dormant seeds of native orchids, ground ferns, and flowering herbs sprouted across thousands of square metres.',
      },
      {
        type: 'quote',
        text: 'A monoculture lawn is an ecological desert. An unmanicured native meadow provides food, shelter, and nectar for hundreds of pollinator species.',
      },
      {
        type: 'heading',
        text: 'Soil Microbiomes and Water Retention',
      },
      {
        type: 'paragraph',
        text: 'Turfgrass roots rarely penetrate beyond 5 centimetres, resulting in soil compaction and high runoff during torrential equatorial downpours. By contrast, deep-rooted native legumes and wild sedges break through hard clay, improving stormwater infiltration by up to 300% and dramatically reducing flash-flood risks.',
      },
    ],
    sources: [
      {
        title: 'Spontaneous Urban Flora in the Tropics: Biodiversity in Unmanaged Spaces',
        publisher: 'Journal of Applied Ecology',
        year: '2024',
      },
      {
        title: 'City in Nature: Strategies for Greener, Resilient Ecosystems',
        publisher: 'NParks Singapore',
        year: '2023',
      },
    ],
    relatedStoryIds: ['park-connectors-biodiversity', 'field-observation-ethos'],
  },
  {
    id: 'field-observation-ethos',
    title: 'The Field Ethos: How to Observe Sensitive Tropical Habitats Without Leaving a Trace',
    subtitle: 'Principles for citizen scientists, nature photographers, and mindful explorers.',
    category: 'Field Guide',
    readTime: '4 min read',
    publishedDate: 'August 15, 2026',
    author: 'Sarah Nadarajah • TERAVIA Field Ethos Initiative',
    coverImage:
      'https://images.unsplash.com/photo-1544979590-37e9b47eb705?auto=format&fit=crop&w=1200&q=80',
    summary:
      'Engaging with nature is enriching, but careless observation can distress wildlife and trample delicate micro-habitats. Essential protocols for responsible nature journaling.',
    content: [
      {
        type: 'paragraph',
        text: 'With smartphone cameras and high-zoom lenses in every pocket, more people than ever are photographing wildlife. However, the urge to capture the perfect close-up can inadvertently disrupt nesting birds, distress nocturnal animals, or destroy delicate intertidal organisms.',
      },
      {
        type: 'heading',
        text: 'The Five Principles of Ethical Observation',
      },
      {
        type: 'callout',
        text: '1. Stay on Marked Trails: Stepping off paths compacts forest leaf litter where ground-dwelling reptiles and seedlings take root.\n2. Never Use Artificial Lures: Playing recorded birdcalls causes territory exhaustion.\n3. Turn Off Flash Photography: Nocturnal primates and owls can suffer temporary blindness from close strobe flashes.\n4. Observe Distance: If an animal changes its behaviour in response to your presence, you are too close.\n5. Leave Every Organism in Place: Never remove seeds, orchids, shells, or marine creatures.',
      },
      {
        type: 'paragraph',
        text: 'At TERAVIA, we encourage documenting encounters thoughtfully. Record exact observations, timestamp your phenology notes, and respect the sanctuary you are privileged to enter.',
      },
    ],
    sources: [
      {
        title: 'Ethical Guidelines for Wildlife Photography and Citizen Science',
        publisher: 'International Union for Conservation of Nature (IUCN)',
        year: '2023',
      },
      {
        title: 'Code of Conduct for Nature Areas in Singapore',
        publisher: 'National Parks Board',
        year: '2025',
      },
    ],
    relatedStoryIds: ['park-connectors-biodiversity', 'decoding-air-quality'],
  },
];
