import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { database, persistEvidence, opportunities, status } from '../src/lib/intelligence/engine.mjs';
mkdirSync('test-results/submission',{recursive:true});
const required=['GEMMA_MODEL_ID','GEMMA_BASE_URL','GEMMA_API_KEY'];
const missing=required.filter(key=>!process.env[key]);
const model=process.env.GEMMA_MODEL_ID || null;
const validModel=Boolean(model && /gemma[-_ /]?4/i.test(model));
const dbPath=resolve('test-results/submission/gemma-fixture.sqlite');
const db=database(dbPath);
const observed=new Date().toISOString();
const evidence={id:'gemma-submission-fixture-air-purifier',source:'google-trends',term:'air purifier',title:'SYNTHETIC FIXTURE: air purifier interest',region:'IN',observed_at:observed,posted_at:observed,url:'https://trends.google.com/trends/',indicators:{approximate_searches:null},references:[],problems:[],purchase_intent:[],is_fixture:true};
const attemptsBefore=db.prepare('SELECT count(*) AS n FROM inference').get().n;
try {
  await persistEvidence(db,[evidence]);
  const p=opportunities(db,true).find(p=>p.id && p.is_fixture);
  const inference=db.prepare('SELECT model_id,started,duration_ms,status,error FROM inference ORDER BY started DESC LIMIT 1').get() || null;
  const attemptCount=db.prepare('SELECT count(*) AS n FROM inference').get().n-attemptsBefore;
  const report={checked_at:new Date().toISOString(),fixture_labeled:true,database:dbPath,product_id:p?.id,
    configured:!missing.length && validModel,missing_configuration:missing,requested_model_id:model,
    real_inference_attempted:attemptCount>0,real_inference_succeeded:attemptCount>0 && inference?.status==='success',
    provider_status:attemptCount>0 ? inference.status : 'unconfigured',latency_ms:attemptCount>0 ? inference.duration_ms : null,
    inference:attemptCount>0 ? inference : null,display_model_id:p?.analysis.model_id,ai_status:p?.analysis.ai_status,
    blocker:missing.length ? 'No authorized inference provider credentials/configuration are present.' : !validModel ? 'Configured model is not identified as Gemma 4.' : inference?.status==='error' ? inference.error : null,
    details_route:p ? `/products/${p.id}` : null};
  writeFileSync('test-results/submission/gemma-status.json',JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify(report,null,2));
} finally {db.close();}
