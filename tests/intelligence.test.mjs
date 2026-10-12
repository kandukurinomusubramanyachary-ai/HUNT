import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { database, parseTrends, extract, normalize, score, collectTrends, collectReddit, persistEvidence, opportunities, opportunity, runDiscovery, status, validateAnalysis, analyze } from '../src/lib/intelligence/engine.mjs';
const stamp = new Date().toISOString();
export const fixture = { id:'fixture-air-purifier', term:'best air purifier India', title:'Air purifier — explicitly synthetic test fixture', source:'google-trends', region:'IN', observed_at:stamp, posted_at:stamp, url:'https://trends.google.com/trends/', indicators:{approximate_searches:'fixture only'}, references:[], problems:[], purchase_intent:[], is_fixture:true };
function setup(t) { const dir=mkdtempSync(join(tmpdir(),'hunt-test-')); const db=database(join(dir,'test.sqlite')); t.after(()=>{db.close();rmSync(dir,{recursive:true,force:true});}); return db; }
const fallbackFetch = async()=>{throw new Error('unexpected inference call');};
test('product extraction excludes news and software; normalizes names and merges model aliases', ()=>{
  for(const term of ['Taylor Fritz','election news','coloros 17 india release date','movie premiere','cricket match','kospi index']) assert.equal(extract(term),null);
  assert.equal(extract('best air purifier India').id,extract('air purifier reviews').id);
  assert.equal(extract('iPhone 17 Pro price India').id,extract('buy iphone 17 pro').id);
  assert.equal(extract('recommend headphones').id,extract('headphone reviews').id);
  assert.equal(normalize('  Buy AIR PURIFIER India!  '),'air purifier');
});
test('RSS retains observations, indicators and original article URLs without growth',()=>{
  const rows=parseTrends('<rss><item><title>air purifier</title><pubDate>Mon, 12 Oct 2026 10:00:00 GMT</pubDate><ht:approx_traffic>200+</ht:approx_traffic><ht:news_item_url>https://example.org/a?a=1&amp;b=2</ht:news_item_url></item></rss>','IN',stamp);
  assert.equal(rows[0].indicators.approximate_searches,'200+'); assert.equal(rows[0].references[0],'https://example.org/a?a=1&b=2'); assert.equal(rows[0].observed_at,stamp); assert.equal(rows[0].growth,undefined);
  assert.throws(()=>parseTrends('blocked','IN'));
});
test('source failures are explicit; Reddit never requests without OAuth configuration', async()=>{
  await assert.rejects(collectTrends('IN',async()=>({ok:false,status:403})),/403/);
  await assert.rejects(collectTrends('IN',async()=>({ok:true,text:async()=>'not RSS'})),/invalid RSS/);
  const saved=process.env.REDDIT_ACCESS_TOKEN; delete process.env.REDDIT_ACCESS_TOKEN;
  try { assert.equal((await collectReddit(fallbackFetch)).state,'unconfigured'); } finally { if(saved) process.env.REDDIT_ACCESS_TOKEN=saved; }
});
test('persistent evidence and product deduplication; fixture excluded from live list',async t=>{
  const db=setup(t); await persistEvidence(db,[fixture,fixture],fallbackFetch); await persistEvidence(db,[{...fixture,term:'air purifier reviews'}],fallbackFetch);
  assert.equal(db.prepare('SELECT count(*) AS n FROM products').get().n,1); assert.equal(db.prepare('SELECT count(*) AS n FROM evidence').get().n,1);
  assert.equal(opportunities(db).length,0); const p=opportunities(db,true)[0]; assert.equal(p.is_fixture,true); assert.equal(opportunity(db,p.id).evidence[0].url,fixture.url); assert.equal(opportunity(db,'missing'),null);
  assert.equal(p.analysis.model_id,'deterministic-v1'); assert.match(p.analysis.ai_status,/unavailable/);
});
test('missing and stale evidence cannot improve score; single-source confidence capped',()=>{
  assert.equal(score([]).opportunity_score,0);
  assert.equal(score([fixture]).opportunity_score,0);
  const live={...fixture,is_fixture:false}; assert.equal(score([live]).components.cross_source_consistency,0); assert.equal(score([live]).evidence_confidence,20);
  assert.ok(score([live,{...live,id:'reddit',source:'reddit'}]).opportunity_score>score([live]).opportunity_score);
  assert.equal(score([{...live,observed_at:'2000-01-01T00:00:00Z'}]).opportunity_score,0);
});
function analysis() { return {product_name:'air purifier',category:'Home accessories',opportunity_summary:'One snapshot; sustained demand requires validation.',target_customer:'Unknown',observed_demand_signals:[fixture.id],competition_assessment:'Unknown substitutes require research.',customer_pain_points:[],key_risks:['Temporary interest possible.'],recommended_positioning:'Validate needs.',evidence_confidence:20,validation_status:'needs-validation',recommendation:'watch',model_id:'gemma-4-test',analysis_timestamp:stamp}; }
test('AI structured response rejects invented evidence, metrics, links and wrong model',()=>{
  assert.equal(validateAnalysis(analysis(),[fixture],'gemma-4-test').product_name,'air purifier');
  for(const bad of [{observed_demand_signals:['invented']},{opportunity_summary:'100 sales'},{opportunity_summary:'cost is 20'},{opportunity_summary:'https://invented.example/'},{model_id:'other'},{evidence_confidence:101},{extra:'unsupported'}]) assert.throws(()=>validateAnalysis({...analysis(),...bad},[fixture],'gemma-4-test'));
});
test('real inference attempts record success and invalid-response failure, without silent model fallback',async t=>{
  const db=setup(t), saved={...process.env}; Object.assign(process.env,{GEMMA_MODEL_ID:'gemma-4-test',GEMMA_BASE_URL:'https://provider.example/v1',GEMMA_API_KEY:'test-key'});
  try {
    const product=extract('air purifier');
    const ok=await analyze(db,product,[fixture],async()=>({ok:true,json:async()=>({model:'gemma-4-test',choices:[{message:{content:JSON.stringify(analysis())}}]})})); assert.equal(ok.ai_status,'analyzed');
    const bad=await analyze(db,product,[fixture],async()=>({ok:true,json:async()=>({model:'wrong',choices:[]})})); assert.match(bad.ai_status,/failed/);
    assert.deepEqual(db.prepare('SELECT status FROM inference ORDER BY started').all().map(r=>r.status),['success','error']);
  } finally { for(const k of ['GEMMA_MODEL_ID','GEMMA_BASE_URL','GEMMA_API_KEY']) { if(saved[k]===undefined) delete process.env[k]; else process.env[k]=saved[k]; } }
});
test('worker prevents overlap and persists partial failures and connector status',async t=>{
  const db=setup(t); const collectors={trends:async()=>[fixture],reddit:async()=>{throw new Error('OAuth expired');}};
  await runDiscovery(db,collectors); assert.equal(status(db).last_run.status,'partial'); assert.equal(status(db).connectors.reddit.state,'error'); assert.match(status(db).last_failure.error,/OAuth expired/);
  db.prepare('INSERT INTO lease VALUES (1,?,?)').run('another-worker',Date.now()+60000); assert.equal((await runDiscovery(db,collectors)).skipped,true);
});
test('both-source failure is persisted rather than reported as success',async t=>{
  const db=setup(t); await runDiscovery(db,{trends:async()=>{throw new Error('Trends unavailable');},reddit:async()=>({state:'unconfigured',evidence:[]})}); assert.equal(status(db).last_run.status,'failed'); assert.equal(status(db).last_success,null);
});
