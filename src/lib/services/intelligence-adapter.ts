import type { Product } from '@/types';
import type { IntelligenceOpportunity } from '@/types/intelligence';
export function intelligenceToProduct(p: IntelligenceOpportunity): Product {
  return { id:p.id, slug:p.id, name:p.name, category:p.category, tagline:p.analysis.opportunity_summary, image:'/product-placeholder.svg',
    price:0, compareAtPrice:0, estimatedCost:0, opportunityScore:p.opportunity_score, growthPct:0, trendDirection:'flat', trendPoints:[], competitionLevel:'medium',
    sources:Array.from(new Set(p.evidence.map(e=>e.source))), evidence:p.evidence.map(e=>({id:e.id,source:e.source,label:e.subreddit||e.region,title:e.title,snippet:e.snippet||'Search-interest snapshot; sustained growth not established.',url:e.url})),
    competitors:[], sentiment:{positive:0,neutral:0,negative:0,mentions:0,painPoints:p.analysis.customer_pain_points,benefits:[]},
    scores:{demand:p.components.demand,competition:0,margin:0,confidence:p.evidence_confidence,rationale:p.explanation}, benefits:[], specs:[],story:p.analysis.opportunity_summary,
    recommendation:{opportunity:p.analysis.opportunity_summary,risks:p.analysis.key_risks,positioning:p.analysis.recommended_positioning},dataSourceType:'live-intelligence',isDemo:false };
}

