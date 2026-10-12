import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { database, collectTrends, persistEvidence, opportunities, setState, status } from '../src/lib/intelligence/engine.mjs';
const port = 3107;
const base = `http://127.0.0.1:${port}`;
mkdirSync('test-results', { recursive: true });
const dbPath=resolve(`test-results/verification-${process.pid}.sqlite`);
const db=database(dbPath);
let live=[];
try { live=await collectTrends('IN'); await persistEvidence(db,live); console.log('REAL SOURCE:',live.length,'India RSS records persisted'); }
catch(e) { console.log('LIVE COLLECTION BLOCKED:',e.message); }
const stamp=new Date().toISOString();
const fixture={id:'fixture-ui-air-purifier',term:'air purifier',title:'Explicit synthetic air purifier fixture',source:'google-trends',region:'IN',observed_at:stamp,posted_at:stamp,url:'https://trends.google.com/trends/',indicators:{approximate_searches:'synthetic fixture'},references:[],problems:[],purchase_intent:[],is_fixture:true};
await persistEvidence(db,[fixture]);
setState(db,'google-trends',{state:'ready',count:live.length,updated_at:stamp});
setState(db,'reddit',{state:'unconfigured',message:'OAuth access not configured'});
const product=opportunities(db,true).find(p=>p.is_fixture);
assert.ok(product); const latest=status(db).latest_observation;
const server=spawn(process.execPath,['node_modules/next/dist/bin/next','start','-p',String(port)],{env:{...process.env,HUNT_DB_PATH:dbPath,HUNT_INCLUDE_FIXTURES:'true'},stdio:['ignore','pipe','pipe']});
let logs='';server.stdout.on('data',d=>logs+=d);server.stderr.on('data',d=>logs+=d);
let browser;
try {
  let ready=false;
  for(let i=0;i<80;i++){try{const r=await fetch(`${base}/api/intelligence/status`);if(r.ok){ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,500));}
  assert.ok(ready,logs);
  const list=await (await fetch(`${base}/api/intelligence/opportunities`)).json();assert.ok(list.opportunities.find(p=>p.id===product.id));
  const details=await (await fetch(`${base}/api/intelligence/opportunities/${product.id}`)).json();assert.equal(details.evidence[0].id,fixture.id);
  assert.equal((await fetch(`${base}/api/intelligence/opportunities/no-such-product`)).status,404);
  const responseStatus=await (await fetch(`${base}/api/intelligence/status`)).json();assert.equal(responseStatus.evidence_count,live.length+1);
  const executable=process.env.HUNT_BROWSER_PATH || ['C:/Program Files/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(existsSync);
  browser=await chromium.launch({headless:true,...(executable?{executablePath:executable}:{})});
  const page=await browser.newPage({viewport:{width:1440,height:960}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
  let calls=0;page.on('request',r=>{if(r.url().endsWith('/api/intelligence/opportunities')) calls++;});
  await page.route('**/api/intelligence/opportunities',async route=>{await new Promise(resolve=>setTimeout(resolve,500));await route.continue();});
  await page.goto(`${base}/discover`,{waitUntil:'domcontentloaded'}); await page.getByRole('status').filter({hasText:'Loading opportunities'}).waitFor();
  await page.getByRole('heading',{name:'air purifier',exact:true}).waitFor();
  await page.unroute('**/api/intelligence/opportunities');
  assert.ok(calls>=1,'Radar must load API automatically');
  assert.match(await page.locator('body').innerText(),/Stale data/);
  const beforePoll=calls; await page.waitForTimeout(31_000); assert.ok(calls>beforePoll,'Radar polls without user interaction');
  assert.match(await page.locator('body').innerText(),/Fixture verification/);
  assert.match(await page.locator('body').innerText(),/AI analysis unavailable/);
  assert.match(await page.locator('body').innerText(),/Collector offline/);
  await page.getByRole('button',{name:'Refresh results',exact:true}).click();await page.waitForTimeout(500);assert.ok(calls>=2,'Refresh rereads API');
  await page.getByLabel('Search products').fill('no matching product');await page.getByRole('heading',{name:'No product opportunities to investigate yet.'}).waitFor();
  await page.getByLabel('Search products').fill('');
  await page.getByRole('button',{name:'Save opportunity',exact:true}).click();
  await page.getByRole('link',{name:'View shortlist',exact:true}).click();await page.getByRole('heading',{name:'air purifier',exact:true}).waitFor();
  await page.getByRole('link',{name:'Analyze product',exact:true}).click();await page.waitForURL(`**/products/${product.id}`);
  await page.getByRole('heading',{name:'Source evidence',exact:true}).waitFor();assert.match(await page.locator('body').innerText(),/Explicit synthetic air purifier fixture/);
  await page.reload();await page.getByRole('heading',{name:'Source evidence',exact:true}).waitFor();
  await page.getByRole('link',{name:'Build store',exact:true}).click();await page.getByLabel('Product name',{exact:true}).waitFor();
  assert.equal(await page.getByLabel('Product name',{exact:true}).inputValue(),'air purifier');
  assert.equal(await page.locator('#product-select').inputValue(),product.id);
  assert.equal(await page.locator('#retail-price').inputValue(),'0');assert.match(await page.locator('body').innerText(),/Product cost and gross margin: unknown/);
  await page.reload();await page.getByLabel('Product name',{exact:true}).waitFor();assert.equal(await page.getByLabel('Product name',{exact:true}).inputValue(),'air purifier');
  await page.goto(`${base}/discover`);await page.getByRole('button',{name:'Demo Mode',exact:true}).click();await page.getByRole('heading',{name:'Aurora Rest',exact:true}).waitFor();assert.match(await page.locator('body').innerText(),/Demo Mode/);
  await page.getByRole('button',{name:'Live Mode',exact:true}).click();await page.getByRole('heading',{name:'air purifier',exact:true}).waitFor();
  // Confirm the real collected observation traverses database -> API -> rendered Radar.
  if(live.length){
    const real=live[0]; real.observed_at=new Date(Date.now()+1000).toISOString(); await persistEvidence(db,[real]);
    await page.getByRole('button',{name:'Refresh results',exact:true}).click();await page.getByRole('link',{name:real.term,exact:true}).waitFor();
    const st=await (await fetch(`${base}/api/intelligence/status`)).json();assert.equal(st.latest_observation.id,real.id);
    console.log('REAL DATA VERIFIED: collector -> SQLite -> status API -> Radar:',real.term);
  }
  // Explicit HTTP failure must render an error rather than fixtures.
  await page.route('**/api/intelligence/opportunities',route=>route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({error:'Fixture simulated source outage'})}));
  await page.getByRole('button',{name:'Refresh results',exact:true}).click();await page.getByRole('alert').filter({hasText:'Fixture simulated source outage'}).waitFor();
  await page.unroute('**/api/intelligence/opportunities');
  db.prepare('DELETE FROM products').run();await page.getByRole('button',{name:'Refresh results',exact:true}).click();await page.getByRole('heading',{name:'No product opportunities to investigate yet.'}).waitFor();
  await page.screenshot({path:'test-results/radar-empty.png',fullPage:true});
  assert.deepEqual(errors,[]); console.log('PASS: API list/detail/status/404, automatic Radar loading, refresh, search/empty/error/stale states, save/shortlist, details and reload, Store Builder handoff and reload, labeled Demo Mode.');
  console.log('Verification database:',dbPath,'(fixtures are isolated from production)');
} finally {await browser?.close();server.kill();db.close();}
