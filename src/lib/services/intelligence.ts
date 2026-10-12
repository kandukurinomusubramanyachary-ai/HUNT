import type { IntelligenceOpportunity, IntelligenceStatus } from '@/types/intelligence';
export async function fetchIntelligence<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(`/api/intelligence/${path}`, { cache: 'no-store', signal });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || `Intelligence request failed (${response.status})`);
  return data;
}
export const loadOpportunities = (signal?: AbortSignal) => fetchIntelligence<{ opportunities: IntelligenceOpportunity[] }>('opportunities', signal);
export const loadStatus = (signal?: AbortSignal) => fetchIntelligence<IntelligenceStatus>('status', signal);
export const loadOpportunity = (id: string, signal?: AbortSignal) => fetchIntelligence<IntelligenceOpportunity>(`opportunities/${encodeURIComponent(id)}`, signal);
