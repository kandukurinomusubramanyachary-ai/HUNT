'use client';
import * as React from 'react';
import Link from 'next/link';
import { PageIntro } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { ProductFilters, type DiscoverFiltersState } from './product-filters';
import { Badge } from '@/components/ui/badge';
import { loadOpportunities, loadStatus, loadOpportunity } from '@/lib/services/intelligence';
import { registerLiveProduct, toggleSavedProduct } from '@/lib/services/products';
import { useHuntStore } from '@/store/hunt-store';
import type { IntelligenceOpportunity, IntelligenceStatus } from '@/types/intelligence';

function Evidence({ product }: { product: IntelligenceOpportunity }) {
  return <div className="space-y-3">{product.evidence.map(e => <div key={e.id} className="rounded-lg border border-border p-3 text-secondary text-text-secondary">
    <a href={e.url} target="_blank" rel="noreferrer noopener" className="text-info hover:underline">{e.title}</a>
    <p>{e.source} {e.subreddit ? `r/${e.subreddit}` : e.region} · Observed {new Date(e.observed_at).toLocaleString()}</p>
    <p>{Object.entries(e.indicators).filter(([,v]) => v !== null).map(([k,v]) => `${k.replaceAll('_',' ')}: ${v}`).join(' · ') || 'No quantitative indicator supplied'}</p>
    {e.snippet && <p className="mt-2">{e.snippet}</p>}
    {e.references.map(url => <a key={url} href={url} target="_blank" rel="noreferrer noopener" className="mt-1 block truncate text-info hover:underline">{url}</a>)}
    {e.is_fixture && <Badge tone="warning">Test fixture</Badge>}
  </div>)}</div>;
}
function Ranking({ product }: { product: IntelligenceOpportunity }) {
  return <>{product.is_fixture && <p className="mb-3 text-warning">Fixture verification: synthetic test evidence, not a live discovery.</p>}<div className="flex flex-wrap gap-2"><Badge tone="neutral">{product.category}</Badge><Badge tone="warning">{product.validation_status}</Badge></div>
    <div className="mt-4 flex gap-6"><p className="text-text">Score <strong>{product.opportunity_score}/100</strong></p><p className="text-text-secondary">Evidence confidence <strong>{product.evidence_confidence}%</strong></p></div>
    <p className="mt-3 text-secondary text-text-secondary">{product.analysis.opportunity_summary}</p>
    <p className="mt-2 text-[12px] text-text-muted">{product.analysis.ai_status} · {product.analysis.model_id}</p>
    <p className="mt-2 text-[12px] text-text-muted">Updated {new Date(product.updated_at).toLocaleString()}</p></>;
}
export function LiveRadar({ demo, onModeChange, shortlist = false }: { demo: boolean; onModeChange: () => void; shortlist?: boolean }) {
  const [products, setProducts] = React.useState<IntelligenceOpportunity[]>([]);
  const [status, setStatus] = React.useState<IntelligenceStatus | null>(null);
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [filters, setFilters] = React.useState<DiscoverFiltersState>({ query:'', categories:[], sources:[], competition:[], sort:'score', trendWeeks:12 });
  const [refreshKey, setRefreshKey] = React.useState(0);
  const saved = useHuntStore(s => s.savedProductIds);
  React.useEffect(() => {
    if (demo) return;
    const controller = new AbortController(); let running = false;
    async function refresh() {
      if (running) return; running = true;
      try {
        const [data, worker] = await Promise.all([loadOpportunities(controller.signal), loadStatus(controller.signal)]);
        if (controller.signal.aborted) return;
        data.opportunities.forEach(registerLiveProduct); setProducts(data.opportunities); setStatus(worker); setError('');
      } catch (e) { if (!controller.signal.aborted) setError(e instanceof Error ? e.message : 'Unable to load intelligence.'); }
      finally { if (!controller.signal.aborted) setLoading(false); running = false; }
    }
    void refresh(); const timer = setInterval(refresh, 30_000);
    return () => { controller.abort(); clearInterval(timer); };
  }, [demo, refreshKey]);
  const visible = products.filter(p => (!shortlist || saved.includes(p.id)) && `${p.name} ${p.category}`.toLowerCase().includes(filters.query.toLowerCase()) && (!filters.categories.length || filters.categories.includes(p.category)) && (!filters.sources.length || p.evidence.some(e => filters.sources.includes(e.source))));
  const stale = status && (!status.last_success || Date.now() - Date.parse(status.last_success.finished) > status.refresh_interval_ms * 2);
  return <>
    <PageIntro title={shortlist ? 'Saved opportunities' : 'Opportunity Radar'} subtitle="Automatically collected product evidence, ranked for further research." breadcrumbs={[{label:'HUNT',href:'/dashboard'},{label:'Intelligence'},{label:shortlist?'Opportunities':'Discover'}]} actions={<div className="flex gap-2"><Button variant="secondary" onClick={onModeChange}>Demo Mode</Button><Button asChild variant="secondary"><Link href={shortlist ? '/discover' : '/opportunities'}>{shortlist ? 'Open radar' : 'View shortlist'}</Link></Button></div>} />
    <div className="flex flex-col gap-6">
      <section className="rounded-card border border-border bg-surface p-5 text-secondary text-text-secondary" aria-label="Collector status">
        {status ? <><p>Worker: {status.worker.state} · Region: {status.region} · {status.candidate_count} candidates · {status.evidence_count} evidence records</p>
          {Object.entries(status.connectors).map(([name, connector]) => <p key={name}>{name.replaceAll('_',' ')}: {connector.state}{connector.message ? ` — ${connector.message}` : ''}</p>)}
          <p>AI: {status.model.configured ? `${status.model.model_id} configured; latest attempt: ${status.model.latest_attempt?.status || 'none'}` : 'AI analysis unavailable — Gemma 4 provider unconfigured'}</p>
          <p>Last successful scan: {status.last_success ? new Date(status.last_success.finished).toLocaleString() : 'None'}. Display refresh: 30 seconds; discovery refresh: {status.refresh_interval_ms / 60000} minutes.</p>
          {status.latest_observation && <p className="mt-2">Latest collected signal (not necessarily a product): <a className="text-info hover:underline" href={status.latest_observation.url} target="_blank" rel="noreferrer noopener">{status.latest_observation.term}</a> ? {status.latest_observation.is_fixture ? 'Test fixture' : status.latest_observation.source} ? {new Date(status.latest_observation.observed_at).toLocaleString()}</p>}
          {status.last_failure?.error && <p className="text-negative">Last collector failure: {status.last_failure.error}</p>}
          {status.worker.state === 'offline' && <p className="text-warning">Collector offline. Start the app with npm run dev / npm start, or run npm run worker alongside your web server.</p>}
          {stale && <p role="status" className="text-warning">Stale data: no recent successful scan. Results may be outdated.</p>}</> : <p>Loading collector status…</p>}
      </section>
      {error && <p role="alert" className="rounded-card border border-border p-4 text-negative">{error} Displayed results may be stale. Retrying automatically.</p>}
      <ProductFilters liveMode state={filters} onChange={next => setFilters(previous => ({...previous,...next}))} categories={Array.from(new Set(products.map(p => p.category)))} onRefresh={() => setRefreshKey(k => k + 1)} refreshing={loading} resultCount={visible.length} totalCount={products.length} />
      {loading ? <p role="status" className="text-text-secondary">Loading opportunities…</p> : visible.length === 0 ? <section className="rounded-card border border-border bg-surface p-6"><h3 className="text-card text-text">{shortlist ? 'No saved live opportunities.' : 'No product opportunities to investigate yet.'}</h3><p className="mt-2 text-secondary text-text-secondary">News and non-product trends are excluded. Product-related snapshots still require commercial validation. Collection runs automatically; Demo Mode contains labeled sample fixtures.</p></section> :
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">{visible.map(product => <article key={product.id} className="rounded-card border border-border bg-surface p-5">
          <Link href={`/products/${product.id}`}><h3 className="mb-3 text-card font-semibold text-text hover:underline">{product.name}</h3></Link><Ranking product={product}/>
          <div className="mt-4"><Evidence product={{...product,evidence:product.evidence.slice(0,2)}} /></div>
          <div className="mt-4 flex flex-wrap gap-2"><Button asChild variant="secondary"><Link href={`/products/${product.id}`}>Analyze product</Link></Button><Button variant="secondary" onClick={() => toggleSavedProduct(product.id)}>{saved.includes(product.id) ? 'Saved' : 'Save opportunity'}</Button></div>
        </article>)}</div>}
      <p className="text-[12px] text-text-muted">Provisional research rankings, not profitability predictions. Search snapshots do not prove sustained growth. Prices, margins and competition are unknown until independently validated.</p>
    </div>
  </>;
}
export function LiveProductDetail({ productId }: { productId: string }) {
  const [product, setProduct] = React.useState<IntelligenceOpportunity | null>(null); const [error, setError] = React.useState('');
  const saved = useHuntStore(s => s.savedProductIds);
  React.useEffect(() => { const controller = new AbortController(); loadOpportunity(productId, controller.signal).then(p => { registerLiveProduct(p); setProduct(p); }).catch(e => { if (!controller.signal.aborted) setError(e.message); }); return () => controller.abort(); }, [productId]);
  if (error) return <p role="alert" className="text-negative">{error} <Link href="/discover" className="underline">Back to Radar</Link></p>;
  if (!product) return <p role="status" className="text-text-secondary">Loading product intelligence…</p>;
  return <><PageIntro title={product.name} subtitle={product.analysis.opportunity_summary} breadcrumbs={[{label:'HUNT',href:'/dashboard'},{label:'Discover',href:'/discover'},{label:product.name}]} actions={<div className="flex gap-2"><Button variant="secondary" onClick={() => toggleSavedProduct(product.id)}>{saved.includes(product.id)?'Saved':'Save opportunity'}</Button><Button asChild variant="primary"><Link href={`/stores/new?product=${product.id}`}>Build store</Link></Button></div>}/>
    <div className="flex flex-col gap-4"><section className="rounded-card border border-border bg-surface p-6"><Ranking product={product}/><p className="mt-4 text-secondary text-text-secondary">{product.explanation}</p>{Date.now()-Date.parse(product.updated_at)>3600000 && <p className="mt-3 text-warning">Stale evidence: this product has not been updated in over an hour.</p>}</section>
      <section className="rounded-card border border-border bg-surface p-6"><h3 className="mb-4 text-section text-text">Source evidence</h3><Evidence product={product}/></section>
      <section className="rounded-card border border-border bg-surface p-6 text-secondary text-text-secondary"><h3 className="mb-3 text-section text-text">Assessment and validation</h3><p>Target customer: {product.analysis.target_customer}</p><p className="mt-3">Competition: {product.analysis.competition_assessment}</p><p className="mt-3">Positioning: {product.analysis.recommended_positioning}</p><p className="mt-3">Observed pain points: {product.analysis.customer_pain_points.join('; ') || 'Not established'}</p><ul className="mt-3 list-inside list-disc">{product.analysis.key_risks.map(r => <li key={r}>{r}</li>)}</ul><p className="mt-3">Recommendation: {product.analysis.recommendation}. Costs, prices and margins: unknown. Validate suppliers, customer purchase intent, competition and product quality before selling.</p></section></div>
  </>;
}

