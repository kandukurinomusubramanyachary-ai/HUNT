import type { Competitor, DataSourceType, EvidenceItem } from "@/types";

/**
 * Sample discovery signals.
 *
 * IMPORTANT: every entry below is illustrative sample data shipped with the
 * frontend. Nothing here was collected live — no scraping, no API calls.
 * `url` values point at public pages for reference only.
 */

export const sourceMeta: Record<
  DataSourceType,
  { label: string; description: string; status: "sample" | "planned" }
> = {
  "google-trends": {
    label: "Google Trends",
    description: "Normalised search interest curves for category keywords.",
    status: "sample",
  },
  reddit: {
    label: "Reddit",
    description: "Thread-level discussion volume and sentiment clustering.",
    status: "sample",
  },
  "social-signals": {
    label: "Social signals",
    description: "Creator mentions, saves and hashtag velocity across platforms.",
    status: "sample",
  },
  "competitor-research": {
    label: "Competitor research",
    description: "Public storefront pricing, positioning and ad references.",
    status: "sample",
  },
};

export const evidenceByProduct: Record<string, EvidenceItem[]> = {
  "aurora-rest": [
    {
      id: "ev-aurora-1",
      source: "google-trends",
      label: "Google Trends",
      title: "“weighted sleep mask” sample interest up 207% over 12 weeks",
      snippet:
        "Sample curve climbs from 28 to 86 indexed points, with the steepest gain in the final four weeks.",
      url: "https://trends.google.com/trends/explore?q=weighted%20sleep%20mask",
      sentiment: "positive",
      signal: "+207% sample interest",
    },
    {
      id: "ev-aurora-2",
      source: "reddit",
      label: "r/Sleep",
      title: "“Cooling weighted mask finally stopped me waking up at 3am”",
      snippet:
        "312 sample upvotes. Commenters repeatedly mention side-sleeper comfort and light blocking as the deciding factors.",
      url: "https://www.reddit.com/r/sleep/",
      sentiment: "positive",
      signal: "312 sample upvotes",
    },
    {
      id: "ev-aurora-3",
      source: "social-signals",
      label: "Instagram Reels",
      title: "Bedtime routine creators featuring cooling sleep accessories",
      snippet:
        "18 sample creator mentions in 30 days, median 41k plays, save rate materially above the category baseline.",
      url: "https://www.instagram.com/explore/tags/sleeproutine/",
      sentiment: "positive",
      signal: "18 sample mentions",
    },
    {
      id: "ev-aurora-4",
      source: "competitor-research",
      label: "Competitor research",
      title: "Only two focused storefronts rank for the core keyword",
      snippet:
        "Sample scan of public storefronts shows generic marketplaces dominate the results — branded single-product stores are thin.",
      url: "https://www.google.com/search?q=weighted+sleep+mask",
      sentiment: "neutral",
      signal: "2 dedicated stores found",
    },
  ],
  "nomad-pour": [
    {
      id: "ev-nomad-1",
      source: "google-trends",
      label: "Google Trends",
      title: "“travel pour over” sample interest up 92% over 12 weeks",
      snippet:
        "Sample curve rises from 40 to 77 indexed points, tracking a recurring weekend spike.",
      url: "https://trends.google.com/trends/explore?q=travel%20pour%20over",
      sentiment: "positive",
      signal: "+92% sample interest",
    },
    {
      id: "ev-nomad-2",
      source: "reddit",
      label: "r/CampingGear",
      title: "“Collapsible drippers: worth it or just one more gadget?”",
      snippet:
        "184 sample comments. Split sentiment — buyers love the packability, sceptics question brew consistency at altitude.",
      url: "https://www.reddit.com/r/CampingGear/",
      sentiment: "neutral",
      signal: "184 sample comments",
    },
    {
      id: "ev-nomad-3",
      source: "social-signals",
      label: "TikTok",
      title: "Van-life morning coffee routines trending",
      snippet:
        "26 sample videos in 30 days using #vanlifecoffee; kit-based setups outperform single-item posts.",
      url: "https://www.tiktok.com/tag/vanlifecoffee",
      sentiment: "positive",
      signal: "26 sample videos",
    },
    {
      id: "ev-nomad-4",
      source: "competitor-research",
      label: "Competitor research",
      title: "Four brands occupy the ₹1,500–₹2,500 band",
      snippet:
        "Sample scan shows crowded mid-market with near-identical spec sheets and little brand differentiation.",
      url: "https://www.google.com/search?q=collapsible+pour+over+kit",
      sentiment: "neutral",
      signal: "4 direct competitors",
    },
  ],
  "verdant-one": [
    {
      id: "ev-verdant-1",
      source: "google-trends",
      label: "Google Trends",
      title: "“self watering planter” up 118% with seasonal lift",
      snippet:
        "Sample curve oscillates between 33 and 72 indexed points, tracking indoor-plant seasonality.",
      url: "https://trends.google.com/trends/explore?q=self%20watering%20planter",
      sentiment: "positive",
      signal: "+118% sample interest",
    },
    {
      id: "ev-verdant-2",
      source: "reddit",
      label: "r/houseplants",
      title: "“I keep killing plants — what actually helps?”",
      snippet:
        "540 sample comments. Over-watering dominates the complaint thread; visible water windows are the most requested fix.",
      url: "https://www.reddit.com/r/houseplants/",
      sentiment: "positive",
      signal: "540 sample comments",
    },
    {
      id: "ev-verdant-3",
      source: "social-signals",
      label: "Pinterest",
      title: "Apartment-jungle boards saving planter pins",
      snippet:
        "31 sample boards in 30 days; ceramic finishes outperform plastic by a wide margin on saves.",
      url: "https://in.pinterest.com/search/pins/?q=self%20watering%20planter",
      sentiment: "positive",
      signal: "31 sample boards",
    },
    {
      id: "ev-verdant-4",
      source: "competitor-research",
      label: "Competitor research",
      title: "Marketplace listings dominate, design-led brands rare",
      snippet:
        "Sample scan finds 9 marketplace listings and 1 design-led storefront in the premium band.",
      url: "https://www.google.com/search?q=designer+self+watering+planter",
      sentiment: "neutral",
      signal: "1 design-led store",
    },
  ],
  "pulsegrip-pro": [
    {
      id: "ev-pulse-1",
      source: "google-trends",
      label: "Google Trends",
      title: "“grip strength trainer” flat-to-up, +9% over 12 weeks",
      snippet:
        "Sample curve is volatile — sharp spikes around fitness challenges that decay within days.",
      url: "https://trends.google.com/trends/explore?q=grip%20strength%20trainer",
      sentiment: "neutral",
      signal: "+9% sample interest",
    },
    {
      id: "ev-pulse-2",
      source: "reddit",
      label: "r/homegym",
      title: "“Adjustable grippers vs. the classic capped set”",
      snippet:
        "226 sample comments. Enthusiasts prefer calibrated options, but most buyers just want one durable unit.",
      url: "https://www.reddit.com/r/homegym/",
      sentiment: "neutral",
      signal: "226 sample comments",
    },
    {
      id: "ev-pulse-3",
      source: "social-signals",
      label: "YouTube Shorts",
      title: "Climbing-adjacent training content featuring grip work",
      snippet:
        "14 sample clips in 30 days; comment intent skews toward price comparison rather than purchase.",
      url: "https://www.youtube.com/results?search_query=grip+trainer",
      sentiment: "neutral",
      signal: "14 sample clips",
    },
    {
      id: "ev-pulse-4",
      source: "competitor-research",
      label: "Competitor research",
      title: "Saturated category with aggressive discounting",
      snippet:
        "Sample scan shows 11 active stores, 6 running permanent discounts. Price competition is the norm.",
      url: "https://www.google.com/search?q=adjustable+grip+trainer",
      sentiment: "negative",
      signal: "11 active stores",
    },
  ],
  "fetchloop": [
    {
      id: "ev-fetch-1",
      source: "google-trends",
      label: "Google Trends",
      title: "“dog ball launcher” down 41% over 12 weeks",
      snippet:
        "Sample curve falls from 78 to 46 indexed points after a spring peak — the category is cooling.",
      url: "https://trends.google.com/trends/explore?q=dog+ball+launcher",
      sentiment: "negative",
      signal: "−41% sample interest",
    },
    {
      id: "ev-fetch-2",
      source: "reddit",
      label: "r/dogs",
      title: "“Hands-free launchers: safe for daily fetch?”",
      snippet:
        "149 sample comments. Joint-health concerns and loud firing mechanisms appear repeatedly in critical replies.",
      url: "https://www.reddit.com/r/dogs/",
      sentiment: "negative",
      signal: "149 sample comments",
    },
    {
      id: "ev-fetch-3",
      source: "social-signals",
      label: "Facebook Groups",
      title: "Local dog-park groups trading second-hand launchers",
      snippet:
        "Resale chatter in 9 sample groups suggests durable goods are circulating rather than selling new.",
      url: "https://www.facebook.com/groups/",
      sentiment: "neutral",
      signal: "9 sample groups",
    },
    {
      id: "ev-fetch-4",
      source: "competitor-research",
      label: "Competitor research",
      title: "Heavy discounting across 7 storefronts",
      snippet:
        "Sample scan finds average listed price ₹1,940 with bundle offers — margin compression is evident.",
      url: "https://www.google.com/search?q=hands+free+dog+ball+launcher",
      sentiment: "negative",
      signal: "7 storefronts discounting",
    },
  ],
  "drift-lite": [
    {
      id: "ev-drift-1",
      source: "google-trends",
      label: "Google Trends",
      title: "“laptop riser” essentially flat, +5% over 12 weeks",
      snippet:
        "Sample curve stays between 39 and 45 indexed points — mature, replacement-driven demand.",
      url: "https://trends.google.com/trends/explore?q=laptop+riser",
      sentiment: "neutral",
      signal: "+5% sample interest",
    },
    {
      id: "ev-drift-2",
      source: "reddit",
      label: "r/MechanicalKeyboards",
      title: "“Fold-flat stands for a two-desk setup”",
      snippet:
        "97 sample comments. Niche but high-intent; buyers compare portability against wobble under load.",
      url: "https://www.reddit.com/r/MechanicalKeyboards/",
      sentiment: "neutral",
      signal: "97 sample comments",
    },
    {
      id: "ev-drift-3",
      source: "social-signals",
      label: "Instagram",
      title: "Desk-setup posts featuring aluminium risers",
      snippet:
        "11 sample posts in 30 days, average engagement below the workspace-category median.",
      url: "https://www.instagram.com/explore/tags/desksetup/",
      sentiment: "neutral",
      signal: "11 sample posts",
    },
    {
      id: "ev-drift-4",
      source: "competitor-research",
      label: "Competitor research",
      title: "Commoditised category, race to the bottom on price",
      snippet:
        "Sample scan finds 14 storefronts competing on price, with ₹1,199 entry points and thin differentiation.",
      url: "https://www.google.com/search?q=fold+flat+laptop+riser",
      sentiment: "negative",
      signal: "14 storefronts found",
    },
  ],
};

export const competitorsByProduct: Record<string, Competitor[]> = {
  "aurora-rest": [
    {
      id: "cmp-aurora-1",
      name: "Nimbus Sleep Co.",
      price: 3199,
      positioning: "Premium clinical sleep brand",
      strengths: ["Strong review base", "Medical framing"],
      weaknesses: ["No cooling layer", "Ships from overseas"],
      adReference: "https://www.facebook.com/ads/library/",
      channel: "Meta ads library",
    },
    {
      id: "cmp-aurora-2",
      name: "Duskwell",
      price: 2490,
      positioning: "Lifestyle gifting brand",
      strengths: ["Beautiful packaging", "Gift positioning"],
      weaknesses: ["Weak performance claims", "Thin FAQ"],
      adReference: "https://www.instagram.com/explore/tags/sleepmask/",
      channel: "Instagram",
    },
    {
      id: "cmp-aurora-3",
      name: "Generic marketplace sellers",
      price: 899,
      positioning: "Price-first unbranded listings",
      strengths: ["Lowest price", "Fast shipping"],
      weaknesses: ["No brand trust", "Inconsistent quality"],
      adReference: "https://www.google.com/search?q=weighted+sleep+mask",
      channel: "Search",
    },
  ],
  "nomad-pour": [
    {
      id: "cmp-nomad-1",
      name: "Trailbrew",
      price: 2450,
      positioning: "Serious outdoor coffee gear",
      strengths: ["Loyal community", "Detailed brew guides"],
      weaknesses: ["Bulky pack size", "High price"],
      adReference: "https://www.youtube.com/results?search_query=trailbrew",
      channel: "YouTube",
    },
    {
      id: "cmp-nomad-2",
      name: "Kettle & Co.",
      price: 1790,
      positioning: "Design-led kitchen gifting",
      strengths: ["Attractive materials", "Strong retail presence"],
      weaknesses: ["Not collapsible", "No travel case"],
      adReference: "https://in.pinterest.com/search/pins/?q=pour+over",
      channel: "Pinterest",
    },
    {
      id: "cmp-nomad-3",
      name: "CampKettle Basics",
      price: 1240,
      positioning: "Entry-level camping accessory",
      strengths: ["Cheap", "Wide availability"],
      weaknesses: ["Thin materials", "Poor brew consistency"],
      adReference: "https://www.google.com/search?q=camping+pour+over",
      channel: "Search",
    },
  ],
  "verdant-one": [
    {
      id: "cmp-verdant-1",
      name: "Fernwood Studio",
      price: 2350,
      positioning: "Hand-thrown ceramic homeware",
      strengths: ["Beautiful finish", "Artisan story"],
      weaknesses: ["No water-level window", "Fragile shipping"],
      adReference: "https://in.pinterest.com/search/pins/?q=ceramic+planter",
      channel: "Pinterest",
    },
    {
      id: "cmp-verdant-2",
      name: "Greenloop",
      price: 1490,
      positioning: "Functional self-watering specialist",
      strengths: ["Large water reservoir", "Plant-care content"],
      weaknesses: ["Plastic aesthetic", "Weak brand voice"],
      adReference: "https://www.reddit.com/r/houseplants/",
      channel: "Reddit",
    },
    {
      id: "cmp-verdant-3",
      name: "Marketplace multipacks",
      price: 699,
      positioning: "Volume plastic multipacks",
      strengths: ["Cheapest per unit", "Bundled"],
      weaknesses: ["No design appeal", "High return rate"],
      adReference: "https://www.google.com/search?q=self+watering+planter+set",
      channel: "Search",
    },
  ],
  "pulsegrip-pro": [
    {
      id: "cmp-pulse-1",
      name: "Ironhold",
      price: 1690,
      positioning: "Calibrated strength equipment",
      strengths: ["Precise resistance steps", "Enthusiast credibility"],
      weaknesses: ["Pricey", "Narrow audience"],
      adReference: "https://www.youtube.com/results?search_query=grip+trainer+review",
      channel: "YouTube",
    },
    {
      id: "cmp-pulse-2",
      name: "GripMate",
      price: 999,
      positioning: "Mass-market fitness accessory",
      strengths: ["Wide distribution", "Frequent discounts"],
      weaknesses: ["Plastic build", "Weak reviews"],
      adReference: "https://www.google.com/search?q=grip+mate+trainer",
      channel: "Search",
    },
    {
      id: "cmp-pulse-3",
      name: "ClimbStrong",
      price: 1450,
      positioning: "Climbing-specific training",
      strengths: ["Niche authority", "Community content"],
      weaknesses: ["Small catalogue", "Limited reach"],
      adReference: "https://www.reddit.com/r/climbing/",
      channel: "Reddit",
    },
  ],
  "fetchloop": [
    {
      id: "cmp-fetch-1",
      name: "ZoomTail",
      price: 2190,
      positioning: "Automatic launcher, electronics-led",
      strengths: ["Strong feature set", "Recognisable brand"],
      weaknesses: ["Battery complaints", "High return rate"],
      adReference: "https://www.facebook.com/ads/library/",
      channel: "Meta ads library",
    },
    {
      id: "cmp-fetch-2",
      name: "ParkFetch",
      price: 1650,
      positioning: "Value pet accessories",
      strengths: ["Price", "Bundle offers"],
      weaknesses: ["Loud mechanism", "Flimsy grip"],
      adReference: "https://www.tiktok.com/tag/dogtoys",
      channel: "TikTok",
    },
    {
      id: "cmp-fetch-3",
      name: "TossBuddy",
      price: 1899,
      positioning: "Hands-free ergonomic launcher",
      strengths: ["Good ergonomics", "Positive reviews"],
      weaknesses: ["No accessories", "Weak distribution"],
      adReference: "https://www.reddit.com/r/dogs/",
      channel: "Reddit",
    },
  ],
  "drift-lite": [
    {
      id: "cmp-drift-1",
      name: "RiserWorks",
      price: 2890,
      positioning: "Premium desk hardware",
      strengths: ["Excellent finish", "Strong reviews"],
      weaknesses: ["Not fold-flat", "Heavy"],
      adReference: "https://www.reddit.com/r/MechanicalKeyboards/",
      channel: "Reddit",
    },
    {
      id: "cmp-drift-2",
      name: "DeskBasics",
      price: 1199,
      positioning: "Entry-level workspace accessories",
      strengths: ["Cheapest", "Fast shipping"],
      weaknesses: ["Wobbles under load", "Generic design"],
      adReference: "https://www.google.com/search?q=laptop+riser+stand",
      channel: "Search",
    },
    {
      id: "cmp-drift-3",
      name: "Nomad Desk",
      price: 2350,
      positioning: "Travel-oriented workspace gear",
      strengths: ["Portable", "Good content"],
      weaknesses: ["Small audience", "Limited colours"],
      adReference: "https://www.instagram.com/explore/tags/desksetup/",
      channel: "Instagram",
    },
  ],
};
