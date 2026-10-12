export interface SourceEvidence {
  id: string; source: 'google-trends' | 'reddit'; term: string; title: string; url: string; region: string;
  observed_at: string; posted_at: string; indicators: Record<string, string | number | null>; references: string[];
  subreddit?: string; snippet?: string; problems: string[]; purchase_intent: string[]; is_fixture: boolean;
}
export interface IntelligenceOpportunity {
  id: string; name: string; category: string; opportunity_score: number; evidence_confidence: number;
  validation_status: string; updated_at: string; explanation: string; evidence: SourceEvidence[]; is_fixture: boolean;
  components: { demand: number; cross_source_consistency: number; commercial_relevance: number; confidence: number };
  analysis: { product_name: string; category: string; opportunity_summary: string; target_customer: string; observed_demand_signals: string[];
    competition_assessment: string; customer_pain_points: string[]; key_risks: string[]; recommended_positioning: string; evidence_confidence: number;
    validation_status: string; recommendation: string; model_id: string; analysis_timestamp: string; ai_status: string };
}
export interface IntelligenceStatus {
  worker: { state: string; heartbeat?: string }; connectors: Record<string, { state: string; message?: string; count?: number }>;
  model: { configured: boolean; model_id: string | null; latest_attempt: { status: string; error?: string } | null };
  last_success: { finished: string } | null; last_failure: { error: string } | null; last_run: { status: string } | null;
  latest_observation: SourceEvidence | null;
  candidate_count: number; evidence_count: number; refresh_interval_ms: number; region: string;
}
