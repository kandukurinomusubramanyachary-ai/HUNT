import { competitorsByProduct, evidenceByProduct } from "@/data/demo-evidence";
import type { Product, TrendDirection, TrendPoint } from "@/types";

/**
 * Sample product opportunities.
 *
 * All figures are demo fixtures shipped with the frontend — they are not live
 * research. Each product carries `dataSourceType: "demo-fixture"` and is
 * surfaced in the UI with a demo badge.
 */

const TREND_END = new Date(Date.UTC(2026, 9, 5));

function weeklyPoints(values: number[]): TrendPoint[] {
  return values.map((value, index) => {
    const date = new Date(TREND_END);
    date.setUTCDate(date.getUTCDate() - (values.length - 1 - index) * 7);
    return { date: date.toISOString().slice(0, 10), value };
  });
}

function direction(values: number[]): TrendDirection {
  const first = values[0];
  const last = values[values.length - 1];
  const delta = (last - first) / Math.max(first, 1);
  if (delta > 0.08) return "up";
  if (delta < -0.05) return "down";
  return "flat";
}

interface ProductSeed
  extends Omit<
    Product,
    | "trendPoints"
    | "growthPct"
    | "trendDirection"
    | "evidence"
    | "competitors"
    | "dataSourceType"
    | "isDemo"
  > {
  trend: number[];
}

const seeds: ProductSeed[] = [
  {
    id: "aurora-rest",
    slug: "aurora-rest",
    name: "Aurora Rest",
    tagline: "Cooling weighted sleep mask for side sleepers",
    category: "Sleep & wellness",
    image: "/products/aurora-rest.png",
    price: 2499,
    compareAtPrice: 3299,
    estimatedCost: 820,
    opportunityScore: 87,
    competitionLevel: "low",
    sources: ["google-trends", "reddit", "social-signals", "competitor-research"],
    trend: [28, 31, 35, 34, 41, 46, 52, 58, 63, 71, 78, 86],
    sentiment: {
      positive: 68,
      neutral: 22,
      negative: 10,
      mentions: 412,
      painPoints: [
        "Masks slip off when sleeping on your side",
        "Standard weighted masks trap heat within 20 minutes",
        "Straps tangle hair and leave marks on the face",
      ],
      benefits: [
        "Blocks light completely without pressure on the eyes",
        "Cooling gel layer stays comfortable through the night",
        "Even weight distribution that survives side sleeping",
      ],
    },
    scores: {
      demand: 92,
      competition: 81,
      margin: 78,
      confidence: 74,
      rationale:
        "Sample demand curve is the steepest in the set and only two focused storefronts compete on the core keyword. Margin is healthy but not exceptional, and confidence is capped because the evidence window covers a single 12-week cycle.",
    },
    benefits: [
      "Cooling gel layer holds a comfortable temperature all night",
      "Evenly distributed weight that stays put on your side",
      "Contoured eye cups with zero pressure on the lids",
    ],
    specs: [
      { label: "Weight", value: "285 g evenly distributed" },
      { label: "Outer fabric", value: "Brushed bamboo blend" },
      { label: "Cooling layer", value: "Removable gel insert" },
      { label: "Strap", value: "Low-profile magnetic closure" },
      { label: "Care", value: "Machine washable cover" },
      { label: "Warranty", value: "12 months" },
    ],
    story:
      "Aurora Rest started as a fix for one specific complaint: weighted masks that cook your face and slide off the moment you turn over. The result is a contoured mask with a removable cooling insert and weight spread across the cheekbones instead of the eyelids.",
    recommendation: {
      opportunity:
        "Demand is accelerating while branded competition stays thin. A single-product store with a sleep-outcome angle can own the search intent before the category consolidates.",
      risks: [
        "Comfort is subjective — returns may run above the category average",
        "Cooling claims need careful wording to stay defensible",
        "Seasonal demand could soften after the winter peak",
      ],
      positioning:
        "Position as a sleep-quality upgrade, not an accessory. Lead with the side-sleeper problem and the cooling layer, and price above marketplace copies to protect margin.",
    },
  },
  {
    id: "nomad-pour",
    slug: "nomad-pour",
    name: "Nomad Pour",
    tagline: "Collapsible pour-over kit that packs flat",
    category: "Coffee & travel",
    image: "/products/nomad-pour.png",
    price: 1899,
    compareAtPrice: 2499,
    estimatedCost: 610,
    opportunityScore: 78,
    competitionLevel: "medium",
    sources: ["google-trends", "reddit", "social-signals", "competitor-research"],
    trend: [40, 44, 43, 49, 52, 51, 58, 62, 61, 68, 72, 77],
    sentiment: {
      positive: 58,
      neutral: 27,
      negative: 15,
      mentions: 288,
      painPoints: [
        "Most travel brewers sacrifice cup quality for packability",
        "Silicone drippers flex and lose their shape when hot",
        "Kits arrive missing a case or a stable base",
      ],
      benefits: [
        "Packs flat to 3 cm without losing the brew cone shape",
        "Rigid inner frame keeps extraction consistent",
        "Complete kit — no missing accessories at the campsite",
      ],
    },
    scores: {
      demand: 80,
      competition: 58,
      margin: 82,
      confidence: 71,
      rationale:
        "Strong margin and a clear packability story, but four established brands already sit in the same price band. Sentiment is mixed because brew consistency divides the audience.",
    },
    benefits: [
      "Folds to 3 cm and reassembles in under ten seconds",
      "Rigid inner frame keeps pour-over extraction consistent",
      "Complete kit: dripper, carafe, stand and travel case",
    ],
    specs: [
      { label: "Packed depth", value: "3 cm" },
      { label: "Capacity", value: "450 ml" },
      { label: "Materials", value: "Food-grade silicone, glass, walnut" },
      { label: "Weight", value: "340 g" },
      { label: "Included", value: "Dripper, carafe, stand, case" },
      { label: "Warranty", value: "12 months" },
    ],
    story:
      "Nomad Pour was built around a simple contradiction: the brewers that pack well usually brew badly. A rigid internal frame keeps the cone geometry intact, so the cup tastes the same at a trailhead as it does in the kitchen.",
    recommendation: {
      opportunity:
        "A credible mid-market opening exists for a kit that solves the flex problem. Content around travel routines converts better than spec lists.",
      risks: [
        "Four direct competitors in the same price band",
        "Brew-quality scepticism is the top objection to answer",
        "Glass carafe raises shipping damage risk",
      ],
      positioning:
        "Own the packability-versus-quality trade-off. Lead creative with the fold-flat demo and back it with a taste-comparison hook.",
    },
  },
  {
    id: "verdant-one",
    slug: "verdant-one",
    name: "Verdant One",
    tagline: "Self-watering ceramic planter with a level window",
    category: "Home & garden",
    image: "/products/verdant-one.png",
    price: 1599,
    compareAtPrice: 2099,
    estimatedCost: 520,
    opportunityScore: 71,
    competitionLevel: "medium",
    sources: ["google-trends", "reddit", "social-signals", "competitor-research"],
    trend: [33, 38, 45, 52, 48, 55, 61, 58, 64, 68, 66, 72],
    sentiment: {
      positive: 64,
      neutral: 24,
      negative: 12,
      mentions: 356,
      painPoints: [
        "People cannot tell when to water and over-compensate",
        "Most self-watering planters look like plastic office equipment",
        "Hidden reservoirs make root rot impossible to spot early",
      ],
      benefits: [
        "Water-level window removes the guesswork",
        "Two-week reservoir covers a normal holiday",
        "Ceramic finish that reads as homeware, not equipment",
      ],
    },
    scores: {
      demand: 74,
      competition: 63,
      margin: 76,
      confidence: 69,
      rationale:
        "Steady seasonal demand with a clear visual differentiator. Competition is mostly marketplace listings rather than design-led brands, which leaves room on the premium end, but shipping ceramics adds cost and breakage risk.",
    },
    benefits: [
      "Water-level window ends the over-watering guesswork",
      "Two-week reservoir covers holidays without a sitter",
      "Matte ceramic finish that belongs on a shelf",
    ],
    specs: [
      { label: "Reservoir", value: "600 ml · up to 14 days" },
      { label: "Material", value: "Matte stoneware ceramic" },
      { label: "Size", value: "16 cm diameter" },
      { label: "Level window", value: "Integrated, sealed" },
      { label: "Drainage", value: "Passive wick system" },
      { label: "Warranty", value: "6 months" },
    ],
    story:
      "Verdant One exists because most people do not kill plants through neglect — they kill them by watering on a schedule. A sealed level window turns watering into a glance instead of a guess, and the ceramic shell makes it something you want visible.",
    recommendation: {
      opportunity:
        "The premium, design-led end of self-watering planters is under-served. Bundle a plant-care card to lift average order value.",
      risks: [
        "Seasonal demand drops outside the planting months",
        "Ceramic breakage and shipping cost pressure the margin",
        "Marketplace multipacks anchor price expectations low",
      ],
      positioning:
        "Sell the object first and the mechanism second. Visual-led creative outperforms functional copy in this category.",
    },
  },
  {
    id: "pulsegrip-pro",
    slug: "pulsegrip-pro",
    name: "PulseGrip Pro",
    tagline: "Adjustable grip trainer with a calibrated tension dial",
    category: "Fitness",
    image: "/products/pulsegrip-pro.png",
    price: 1299,
    compareAtPrice: 1699,
    estimatedCost: 390,
    opportunityScore: 58,
    competitionLevel: "high",
    sources: ["google-trends", "reddit", "social-signals", "competitor-research"],
    trend: [55, 62, 48, 66, 59, 71, 63, 58, 66, 61, 64, 60],
    sentiment: {
      positive: 47,
      neutral: 34,
      negative: 19,
      mentions: 233,
      painPoints: [
        "Fixed-resistance trainers are outgrown within weeks",
        "Cheap units squeak, flex and break at the hinge",
        "No way to track progression without an app",
      ],
      benefits: [
        "One unit covers a 10–60 kg progression range",
        "Knurled aluminium handles survive daily use",
        "Calibrated dial makes progression measurable",
      ],
    },
    scores: {
      demand: 56,
      competition: 34,
      margin: 74,
      confidence: 62,
      rationale:
        "Category demand is real but volatile and driven by short-lived fitness challenges. Eleven active storefronts with permanent discounts make this a price war, which caps the opportunity score despite a decent margin.",
    },
    benefits: [
      "Single dial covers a 10–60 kg progression range",
      "Knurled aluminium handles built for daily sessions",
      "Calibrated markings make progression measurable",
    ],
    specs: [
      { label: "Resistance", value: "10–60 kg adjustable" },
      { label: "Frame", value: "Anodised aluminium" },
      { label: "Handles", value: "Knurled, non-slip" },
      { label: "Markings", value: "Laser-etched scale" },
      { label: "Weight", value: "420 g" },
      { label: "Warranty", value: "12 months" },
    ],
    story:
      "PulseGrip Pro replaces the drawer full of capped grippers with one calibrated unit. The tension dial means the same tool works on week one and month six, and the etched scale makes progress visible without an app.",
    recommendation: {
      opportunity:
        "Workable as a secondary catalogue line with a durability angle, but expect to compete on price rather than novelty.",
      risks: [
        "Eleven active storefronts with permanent discounts",
        "Demand spikes decay within days of a challenge trend",
        "Price comparisons dominate buyer intent",
      ],
      positioning:
        "Compete on build quality and progression range rather than price. Avoid challenge-led creative that decays quickly.",
    },
  },
  {
    id: "fetchloop",
    slug: "fetchloop",
    name: "FetchLoop",
    tagline: "Hands-free ball launcher with a soft-catch grip",
    category: "Pet supplies",
    image: "/products/fetchloop.png",
    price: 2199,
    compareAtPrice: 2799,
    estimatedCost: 740,
    opportunityScore: 44,
    competitionLevel: "medium",
    sources: ["google-trends", "reddit", "social-signals", "competitor-research"],
    trend: [78, 74, 71, 69, 70, 64, 61, 58, 56, 52, 49, 46],
    sentiment: {
      positive: 41,
      neutral: 33,
      negative: 26,
      mentions: 197,
      painPoints: [
        "Loud firing mechanisms scare nervous dogs",
        "Joint-health worries with repeated long throws",
        "Cheap grips crack after a few weekends",
      ],
      benefits: [
        "No batteries and no loud firing mechanism",
        "Controlled throws that suit smaller gardens",
        "Soft-catch grip stays comfortable in long sessions",
      ],
    },
    scores: {
      demand: 38,
      competition: 41,
      margin: 62,
      confidence: 66,
      rationale:
        "Sample interest has fallen for eleven of the last twelve weeks and resale chatter suggests durable units circulate second-hand. Sentiment skews negative on safety, which is a harder objection to answer than price.",
    },
    benefits: [
      "Fully mechanical — no batteries, no loud firing noise",
      "Controlled throw distance that suits smaller gardens",
      "Soft-catch grip comfortable through long sessions",
    ],
    specs: [
      { label: "Throw range", value: "6–18 m adjustable" },
      { label: "Power", value: "None required" },
      { label: "Grip", value: "Moulded soft-catch handle" },
      { label: "Balls included", value: "2 standard tennis balls" },
      { label: "Weight", value: "310 g" },
      { label: "Warranty", value: "6 months" },
    ],
    story:
      "FetchLoop strips the electronics out of the launcher category. No motor means no noise, no charging and nothing to fail mid-session — just a moulded grip and an adjustable throw that suits a normal garden.",
    recommendation: {
      opportunity:
        "Only worth entering as a quiet, safety-led alternative to automatic launchers, and only if demand stabilises.",
      risks: [
        "Sample interest has fallen in ten of the last eleven weeks",
        "Safety objections dominate the discussion threads",
        "Seven storefronts are discounting aggressively",
      ],
      positioning:
        "If you proceed, lead hard on quiet operation and controlled distance. Do not compete on throw range.",
    },
  },
  {
    id: "drift-lite",
    slug: "drift-lite",
    name: "Drift Lite",
    tagline: "Fold-flat aluminium laptop riser",
    category: "Workspace",
    image: "/products/drift-lite.png",
    price: 2899,
    compareAtPrice: 3499,
    estimatedCost: 980,
    opportunityScore: 33,
    competitionLevel: "high",
    sources: ["google-trends", "reddit", "social-signals", "competitor-research"],
    trend: [40, 41, 39, 42, 44, 41, 43, 42, 45, 43, 44, 42],
    sentiment: {
      positive: 39,
      neutral: 41,
      negative: 20,
      mentions: 141,
      painPoints: [
        "Flat-pack risers wobble under a full-size laptop",
        "Entry-level stands scratch the desk and the device",
        "Buyers struggle to judge stability from photos",
      ],
      benefits: [
        "Folds flat to 12 mm for a bag sleeve",
        "Rigid hinge holds a 16-inch laptop without wobble",
        "Silicone contact points protect the device",
      ],
    },
    scores: {
      demand: 32,
      competition: 22,
      margin: 58,
      confidence: 68,
      rationale:
        "Sample interest has been flat for twelve weeks, which is a mature replacement-driven category. Fourteen storefronts compete on price with ₹1,199 entry points, and the margin does not survive that pressure.",
    },
    benefits: [
      "Folds flat to 12 mm and slips into a laptop sleeve",
      "Rigid hinge holds a 16-inch laptop without wobble",
      "Silicone contact points protect both desk and device",
    ],
    specs: [
      { label: "Folded depth", value: "12 mm" },
      { label: "Capacity", value: "Up to 16-inch laptops" },
      { label: "Material", value: "Anodised aluminium" },
      { label: "Contact points", value: "Silicone padded" },
      { label: "Weight", value: "610 g" },
      { label: "Warranty", value: "12 months" },
    ],
    story:
      "Drift Lite is an answer to the flat-pack riser that wobbles the moment you type. A rigid hinge and silicone contact points keep a 16-inch laptop stable while still folding down to sleeve depth.",
    recommendation: {
      opportunity:
        "Weak as a launch candidate. The category is commoditised and demand shows no directional movement.",
      risks: [
        "Fourteen storefronts competing on price alone",
        "No demand trend to build a launch calendar around",
        "Stability claims are hard to demonstrate in static creative",
      ],
      positioning:
        "Keep this as a catalogue addition for existing workspace buyers rather than a standalone brand launch.",
    },
  },
];

export const DEMO_PRODUCTS: Product[] = seeds.map((seed) => {
  const { trend, ...rest } = seed;
  const first = trend[0];
  const last = trend[trend.length - 1];
  return {
    ...rest,
    trendPoints: weeklyPoints(trend),
    trendDirection: direction(trend),
    growthPct: Math.round(((last - first) / Math.max(first, 1)) * 100),
    evidence: evidenceByProduct[seed.id] ?? [],
    competitors: competitorsByProduct[seed.id] ?? [],
    dataSourceType: "demo-fixture",
    isDemo: true,
  };
});

export const PRODUCT_CATEGORIES = Array.from(
  new Set(DEMO_PRODUCTS.map((product) => product.category)),
).sort();
