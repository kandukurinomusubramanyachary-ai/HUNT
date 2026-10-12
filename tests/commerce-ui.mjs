import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
const port=3110,base=`http://127.0.0.1:${port}`;
const out=resolve('test-results/submission');mkdirSync(out,{recursive:true});
const dbPath=resolve(`test-results/closeout-commerce-${process.pid}-${Date.now()}.sqlite`);
const journal=[];
let server,logs='';
function startServer(){
  server=spawn(process.execPath,['node_modules/next/dist/bin/next','start','-p',String(port)],{stdio:['ignore','pipe','pipe'],env:{...process.env,HUNT_DB_PATH:dbPath}});
  server.stdout.on('data',d=>logs+=d);server.stderr.on('data',d=>logs+=d);
  server.on('error',e=>logs+=e.message);
}
async function stopServer(){
  if(!server||server.exitCode!==null)return;
  const ended=new Promise(r=>server.once('exit',r));server.kill();await ended;
}
let browser;
const wait=ms=>new Promise(r=>setTimeout(r,ms));
async function waitReady(){
  let ready=false;for(let i=0;i<60;i++){try{if((await fetch(`${base}/api/intelligence/status`)).ok){ready=true;break;}}catch{}await wait(500);}assert.ok(ready,logs);
}
async function apiState(){const response=await fetch(`${base}/api/demo/state`);assert.equal(response.status,200);return response.json();}
async function awaitApi(check,label){
  let snapshot;for(let i=0;i<60;i++){snapshot=await apiState();if(check(snapshot))return snapshot;await wait(200);}
  assert.fail(`SQLite API persistence did not reach ${label}: ${JSON.stringify(snapshot)}`);
}
startServer();
try {
  await waitReady();
  const executable=process.env.HUNT_BROWSER_PATH || ['C:/Program Files/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(existsSync);
  browser=await chromium.launch({headless:true,...(executable?{executablePath:executable}:{})});
  const context=await browser.newContext({viewport:{width:1440,height:960},permissions:['clipboard-read','clipboard-write']});const page=await context.newPage();page.setDefaultTimeout(15000);
  const errors=[],consoleErrors=[],serverErrors=[],resourceFailures=[];page.on('pageerror',e=>errors.push(e.message));
  page.on('console',message=>{if(message.type()==='error')consoleErrors.push(message.text());});
  page.on('response',response=>{if(response.status()>=500)serverErrors.push({url:response.url(),status:response.status()});if(response.status()===404)resourceFailures.push({url:response.url(),status:response.status()});});
  page.on('requestfailed',request=>resourceFailures.push({url:request.url(),error:request.failure()?.errorText}));
  const state=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('hunt-frontend-state')).state);
  const shot=name=>page.screenshot({path:resolve(out,name+'.png'),fullPage:true});
  async function step(name,fact){const response=await fetch(page.url());assert.equal(response.status,200,`${name} route must respond 200`);journal.push({step:name,url:page.url(),http_status:response.status,visible_fact:fact,timestamp:new Date().toISOString()});writeFileSync(resolve(out,'golden-path-journal.json'),JSON.stringify(journal,null,2)+'\n');}
  await page.goto(`${base}/dashboard`);await page.getByRole('heading',{name:'Command Center',exact:true}).waitFor();await step('Dashboard','Command Center heading rendered');await shot('00-dashboard');
  await page.goto(`${base}/discover`);await page.getByRole('button',{name:'Demo Mode',exact:true}).waitFor();await shot('01-live-radar');
  await step('Opportunity Radar','Demo Mode selector rendered');
  await page.getByRole('button',{name:'Demo Mode',exact:true}).click();
  await page.getByRole('heading',{name:'Aurora Rest',exact:true}).waitFor();await shot('02-demo-radar');
  await step('Select Demo Product','Aurora Rest demo product rendered');
  const before=await state();
  // The original demo card is a div rather than an article; follow its product link directly.
  await page.locator('a[href="/products/aurora-rest"]').first().click();await page.waitForURL('**/products/aurora-rest');
  await page.getByRole('link',{name:'Launch store',exact:true}).first().waitFor();await step('Product Details','Aurora Rest product detail Launch store link rendered');
  await page.getByRole('link',{name:'Launch store',exact:true}).first().click();await page.waitForURL('**/stores/new?product=aurora-rest');
  await page.getByLabel('Product name',{exact:true}).waitFor();assert.equal(await page.locator('#product-select').inputValue(),'aurora-rest');
  assert.equal(await page.locator('#product-name').inputValue(),'Aurora Rest');
  const sourcePrice=await page.locator('#retail-price').inputValue();assert.ok(Number(sourcePrice)>0);
  await page.reload();await page.getByLabel('Product name',{exact:true}).waitFor();assert.equal(await page.locator('#product-select').inputValue(),'aurora-rest');
  await step('Store Builder',`Product id aurora-rest, name Aurora Rest, source price ${sourcePrice}; builder deep-link reload rendered`);
  const name='HUNT Submission Demo';const slug=`hunt-submission-demo-${Date.now()}`;
  const description='Clearly labeled demo sleep product for the submission verification.';
  await page.locator('#product-description').fill(description);
  await page.locator('#retail-price').fill('3333');
  await page.getByRole('button',{name:/Branding/}).click();await page.locator('#store-name').fill(name);await page.locator('#store-slug').fill(slug);
  const tagline='Submission demo branding';await page.locator('#store-tagline').fill(tagline);
  await shot('03-builder-selected-product');
  await page.getByRole('button',{name:'Launch store',exact:true}).first().click();await page.waitForURL(`**/store/${slug}`);
  await page.getByRole('button',{name:/Add to cart/}).waitFor();
  const createdState=await state();const store=createdState.stores.find(s=>s.slug===slug);
  assert.ok(store);assert.equal(createdState.stores.length,before.stores.length+1);assert.equal(store.productId,'aurora-rest');assert.equal(store.productName,'Aurora Rest');
  assert.equal(store.price,3333,'Edited selling price must survive store creation');
  assert.equal(store.description,description);assert.equal(store.branding.tagline,tagline);
  assert.equal(store.category,'Sleep & wellness');assert.equal(store.isDemo,true);assert.ok(store.productImage);assert.equal(store.branding.storeName,name);
  const savedStore=await awaitApi(s=>s.stores.some(x=>x.id===store.id),'created store');assert.equal(savedStore.stores.find(s=>s.id===store.id).price,3333);
  await step('Generated Storefront',`${name} storefront rendered with Add to cart price ${await page.getByRole('button',{name:/Add to cart/}).innerText()}; store metadata persisted via SQLite API`);
  await shot('04-created-storefront');
  await page.getByRole('button',{name:/Add to cart/}).click();const cart=await state();assert.deepEqual(cart.cart,[{storeId:store.id,productId:'aurora-rest',quantity:1}]);
  await step('Add to Cart',`Cart product aurora-rest quantity 1; associated store unit price 3333; Proceed to checkout visible`);
  await page.getByRole('button',{name:'Proceed to checkout',exact:true}).click();
  await page.locator('#checkout-name').fill('Submission Demo Customer');await page.locator('#checkout-email').fill('demo@example.com');await shot('05-demo-checkout');
  await page.getByText('Demo Mode',{exact:true}).first().waitFor();await step('Demo Checkout','Demo Mode badge and Complete demo order form rendered');
  const submit=page.getByRole('button',{name:'Complete demo order',exact:true});
  // Dispatch rapid duplicate form submits to verify the synchronous guard, not just a disabled button.
  await submit.evaluate(button=>{const form=button.closest('form');form.requestSubmit();form.requestSubmit();form.requestSubmit();});
  await page.getByRole('heading',{name:'Order confirmed',exact:true}).waitFor();await wait(600);
  const completed=await state();const orders=completed.orders.filter(o=>o.storeId===store.id);const credits=completed.transactions.filter(t=>t.storeId===store.id && t.type==='sale-credit');
  assert.equal(orders.length,1,'Exactly one order for one checkout');assert.equal(credits.length,1,'Exactly one corresponding ledger credit');
  const order=orders[0];assert.equal(order.unitPrice,3333);assert.equal(order.total,3333);assert.equal(order.quantity,1);assert.equal(order.isDemo,true);
  assert.equal(credits[0].id,`${order.id}-txn`);assert.equal(credits[0].amount,order.total);assert.equal(credits[0].status,'pending');
  assert.equal(completed.orders.length,before.orders.length+1);await shot('06-order-confirmation');
  await page.getByText('Demo Mode',{exact:true}).first().waitFor();
  await step('Order Confirmation',`Order confirmed; orders ${before.orders.length}→${completed.orders.length}; one ${order.id} ledger credit ${credits[0].id}`);
  const apiCompleted=await awaitApi(s=>s.orders.some(o=>o.id===order.id)&&s.transactions.some(t=>t.id===credits[0].id),'checkout order and credit');
  assert.equal(apiCompleted.orders.filter(o=>o.storeId===store.id).length,1);assert.equal(apiCompleted.transactions.filter(t=>t.storeId===store.id&&t.type==='sale-credit').length,1);
  const replay=Object.fromEntries(['stores','orders','traffic','transactions','activities','creatives'].map(key=>[key,apiCompleted[key]]));
  for(let i=0;i<2;i++){const response=await fetch(`${base}/api/demo/state`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(replay)});assert.equal(response.status,200);const saved=await response.json();assert.equal(saved.orders.filter(o=>o.storeId===store.id).length,1,'Replaying the successful save must remain idempotent');}
  const traffic=completed.traffic.filter(t=>t.storeId===store.id);const visitors=traffic.reduce((n,t)=>n+t.visitors,0);const starts=traffic.reduce((n,t)=>n+t.checkoutStarts,0);
  assert.equal(visitors,1,'Actual demo storefront visit must produce one traffic event');assert.equal(starts,1,'Checkout start must produce one traffic event');
  const expectedConversion=orders.length/visitors*100;
  await page.getByRole('button',{name:'View analytics',exact:true}).click();await page.waitForURL(`**/analytics?store=${store.id}`);
  async function kpi(label){const item=page.locator('p.text-label').filter({hasText:new RegExp('^'+label+'$')}).first();await item.waitFor();return item.locator('xpath=../../..').locator('p.tabular').innerText();}
  assert.equal(await kpi('Simulated orders'),'1');assert.equal(await kpi('Demo visitors'),'1');assert.equal(await kpi('Checkout starts'),'1');
  assert.equal(await kpi('Conversion rate'),'100.00%');assert.match(await kpi('Simulated revenue'),/3\.3K/);assert.equal(await kpi('Average order value'),new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(3333));await shot('07-analytics-from-records');
  await step('Analytics',`Simulated orders 1, visitors 1, checkout starts 1, revenue ₹3.3K, conversion 100.00%; computed numerator ${orders.length}, denominator ${visitors}`);
  const orderSales=completed.orders.filter(o=>o.status!=='refunded').reduce((n,o)=>n+o.total,0);
  const ledgerSales=completed.transactions.filter(t=>t.type==='sale-credit').reduce((n,t)=>n+t.amount,0);assert.equal(ledgerSales,orderSales);
  const apiOrderSales=apiCompleted.orders.filter(o=>o.status==='completed').reduce((n,o)=>n+o.total,0);
  const apiOrderCount=apiCompleted.orders.filter(o=>o.status==='completed').length;
  const apiCheckoutStarts=apiCompleted.traffic.reduce((n,t)=>n+t.checkoutStarts,0);
  const apiVisitors=apiCompleted.traffic.reduce((n,t)=>n+t.visitors,0);
  assert.equal(apiCompleted.metrics.orders,apiOrderCount);assert.equal(apiCompleted.metrics.revenue,apiOrderSales);assert.equal(apiCompleted.metrics.averageOrderValue,apiOrderCount?Math.round(apiOrderSales/apiOrderCount*100)/100:0);
  assert.equal(apiCompleted.metrics.conversionRate,apiVisitors?apiOrderCount/apiVisitors*100:0);assert.equal(apiCompleted.metrics.checkoutCompletionRate,apiCheckoutStarts?apiOrderCount/apiCheckoutStarts*100:0);
  assert.equal(apiCompleted.metrics.credits,ledgerSales);assert.equal(apiCompleted.metrics.balance,apiCompleted.metrics.credits-apiCompleted.metrics.expenses);
  for(const txn of apiCompleted.transactions){if(txn.type==='sale-credit')assert.ok(apiCompleted.orders.some(o=>o.id===txn.orderId),'Every sale credit references an order');else assert.ok(txn.category,'Every expense has a category');}
  const pending=completed.transactions.reduce((n,t)=>n+(t.status==='pending'?(t.type==='sale-credit'?t.amount:-t.amount):0),0);
  const expenses=completed.transactions.filter(t=>t.type!=='sale-credit').reduce((n,t)=>n+t.amount,0);
  const money=n=>new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(n);
  await page.goto(`${base}/wallet`);assert.equal(await kpi('Total simulated sales'),money(orderSales));assert.equal(await kpi('Simulated available balance'),money(orderSales-expenses-pending));
  const slider=page.getByRole('slider');const sliderResults=[];await slider.press('Home');
  for(const percentage of [0,30,100]){
    if(percentage===30)for(let i=0;i<30;i++)await slider.press('ArrowRight');
    if(percentage===100)await slider.press('End');
    await page.waitForFunction(p=>JSON.parse(localStorage.getItem('hunt-frontend-state')).state.reinvestmentPct===p,percentage);
    assert.equal(await slider.getAttribute('aria-valuenow'),String(percentage));
    const eligible=Math.max(orderSales-expenses-pending,0);const expected=Math.round(eligible*percentage)/100;
    assert.equal(await kpi('Suggested reinvestment'),money(expected));sliderResults.push({percentage,eligible_balance:eligible,expected_amount:expected,visible_amount:await kpi('Suggested reinvestment')});
  }
  await step('Wallet',`Ledger sales ${ledgerSales} = order sales ${orderSales}; available balance ${orderSales-expenses-pending}`);
  await shot('08-wallet-from-ledger');await page.reload();await page.getByRole('heading',{name:'Commerce Wallet',exact:true,level:2}).waitFor();
  const restored=await state();assert.equal(restored.orders.filter(o=>o.storeId===store.id).length,1);assert.equal(restored.transactions.filter(t=>t.id===`${order.id}-txn`).length,1);
  // Restart the same server/port and clear localStorage so the database is the only source of the created records.
  await stopServer();startServer();await waitReady();
  await page.evaluate(()=>localStorage.removeItem('hunt-frontend-state'));await page.goto(`${base}/store/${slug}`);await page.getByRole('button',{name:/Add to cart/}).waitFor();
  const restarted=await state();assert.equal(restarted.stores.find(s=>s.id===store.id).price,3333);assert.equal(restarted.orders.filter(o=>o.storeId===store.id).length,1);assert.equal(restarted.transactions.filter(t=>t.id===`${order.id}-txn`).length,1);
  await page.reload();await page.getByRole('button',{name:/Add to cart/}).waitFor();const refreshed=await apiState();assert.equal(refreshed.orders.filter(o=>o.storeId===store.id).length,1,'Refresh after successful checkout must not create another order');
  await step('Persistent Storefront Deep Link',`${name} restored after server restart and localStorage removal; order count remains 1 after refresh`);
  await page.goto(`${base}/creative`);await page.getByRole('heading',{name:'Creative Studio',exact:true,level:2}).waitFor();
  await page.locator('#creative-product').click();await page.getByRole('option',{name:'Aurora Rest',exact:true}).click();await page.getByRole('button',{name:'Generate creative',exact:true}).click();
  await page.locator('#creative-caption').waitFor();const editedCaption='HUNT clearly labeled submission demo caption. Sleep routine, simplified.';await page.locator('#creative-caption').fill(editedCaption);
  await page.getByRole('button',{name:'Copy',exact:true}).click();await page.getByText('Caption copied',{exact:true}).waitFor();assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),editedCaption,'Copied caption must exactly equal displayed text');
  await page.getByRole('button',{name:'Save creative',exact:true}).first().click();const creativeState=await state();const savedCreative=creativeState.creatives.find(c=>c.caption===editedCaption);
  assert.ok(savedCreative);assert.equal(savedCreative.productId,'aurora-rest');assert.equal(savedCreative.provider,'Template (deterministic)');assert.ok(savedCreative.model);assert.equal(savedCreative.headlineVariants.length,3);assert.ok(savedCreative.storyboard.length>0);assert.ok(savedCreative.videoPrompt.length>0);
  await page.getByRole('heading',{name:'Variations',exact:true}).waitFor();
  const variations=page.getByRole('heading',{name:'Variations',exact:true}).locator('..');
  for(const headline of savedCreative.headlineVariants)assert.equal(await variations.getByRole('button',{name:headline,exact:true}).count(),1);
  assert.ok(savedCreative.hooks.length>0);for(const hook of savedCreative.hooks)assert.equal(await variations.getByRole('button',{name:hook,exact:true}).count(),1);
  await page.getByRole('heading',{name:'Video concept',exact:true}).waitFor();await page.getByText('15s outline',{exact:true}).waitFor();await page.getByText('Higgsfield-ready prompt',{exact:true}).waitFor();assert.equal(await page.getByText(savedCreative.videoPrompt,{exact:true}).innerText(),savedCreative.videoPrompt);
  assert.match(savedCreative.storyboard.at(-1).time,/15/);for(const scene of savedCreative.storyboard)assert.equal(await page.getByRole('cell',{name:scene.time,exact:true}).count(),1);
  await page.getByRole('button',{name:'Copy prompt',exact:true}).click();await page.getByText('Video prompt copied',{exact:true}).waitFor();assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),savedCreative.videoPrompt);
  const creativeApi=await awaitApi(s=>s.creatives.some(c=>c.id===savedCreative.id),'creative record');const persistedCreative=creativeApi.creatives.find(c=>c.id===savedCreative.id);assert.equal(persistedCreative.provider,'Template (deterministic)');assert.equal(persistedCreative.sourceProductId,'aurora-rest');assert.equal(persistedCreative.caption,editedCaption);
  await step('Creative Studio',`Aurora Rest template creative generated and saved; 3 ad variations, storyboard and Higgsfield prompt exist; exact edited caption copied to clipboard; provider Template (deterministic)`);await shot('09-creative-studio');
  await page.reload();await page.getByRole('heading',{name:'Creative Studio',exact:true,level:2}).waitFor();const restoredCreativeState=await state();assert.equal(restoredCreativeState.creatives.find(c=>c.id===savedCreative.id).caption,editedCaption,'Saved creative survives page refresh');
  for(const route of ['/stores','/opportunities','/settings']){const response=await page.goto(`${base}${route}`);assert.equal(response.status(),200);await page.locator('main').first().waitFor();await step(`Route ${route}`,'Application main content rendered');}
  const db=new DatabaseSync(dbPath,{readOnly:true});let sqliteRows;
  try {
    const storedStore=db.prepare('SELECT id,slug,product_id,payload FROM stores WHERE id = ?').get(store.id);
    const storedOrders=db.prepare('SELECT id,total,status,created_at FROM orders WHERE store_id = ?').all(store.id);
    const storedLedger=db.prepare('SELECT id,order_id,category,type,amount,status FROM ledger WHERE store_id = ?').all(store.id);
    const storedTraffic=db.prepare('SELECT SUM(visitors) AS visitors,SUM(checkout_starts) AS checkout_starts FROM traffic WHERE store_id = ?').get(store.id);
    const storedCreative=db.prepare('SELECT id,provider,model,created_at,source_product_id FROM creatives WHERE id = ?').get(savedCreative.id);
    assert.equal(storedStore.slug,slug);assert.equal(storedStore.product_id,'aurora-rest');assert.equal(JSON.parse(storedStore.payload).description,description);
    assert.equal(storedOrders.length,1);assert.equal(storedOrders[0].id,order.id);assert.equal(storedOrders[0].total,3333);assert.equal(storedOrders[0].status,'completed');
    assert.equal(storedLedger.length,1);assert.equal(storedLedger[0].order_id,order.id);assert.equal(storedLedger[0].amount,3333);assert.equal(storedTraffic.visitors,visitors);assert.equal(storedTraffic.checkout_starts,starts);
    assert.equal(storedCreative.provider,'Template (deterministic)');assert.equal(storedCreative.source_product_id,'aurora-rest');
    const allSales=db.prepare("SELECT COALESCE(SUM(total),0) AS total FROM orders WHERE status != 'refunded'").get().total;
    const allCredits=db.prepare("SELECT COALESCE(SUM(amount),0) AS total FROM ledger WHERE type = 'sale-credit'").get().total;
    assert.equal(allSales,orderSales);assert.equal(allCredits,ledgerSales);
    sqliteRows={store:storedStore,orders:storedOrders,ledger:storedLedger,traffic:storedTraffic,creative:storedCreative,all_order_sales:allSales,all_ledger_sales:allCredits};
  } finally{db.close();}
  assert.deepEqual(errors,[]);
  const fatalConsoleErrors=consoleErrors.filter(message=>/(Uncaught|TypeError|ReferenceError|ChunkLoadError|hydration|Minified React error)/i.test(message));assert.deepEqual(fatalConsoleErrors,[]);assert.deepEqual(serverErrors,[]);
  const result={verified_at:new Date().toISOString(),source:'labeled demo fixture',product_id:store.productId,store_id:store.id,store_name:store.name,store_price:store.price,store_description:store.description,order_id:order.id,checkout_orders:orders.length,ledger_credits:credits.length,revenue:order.total,visitors,checkout_starts:starts,conversion_rate:expectedConversion,api_completed_orders:apiOrderCount,api_visitors:apiVisitors,api_checkout_starts:apiCheckoutStarts,api_conversion_rate:apiCompleted.metrics.conversionRate,api_checkout_completion_rate:apiCompleted.metrics.checkoutCompletionRate,all_order_sales:orderSales,all_ledger_sales:ledgerSales,available_balance:orderSales-expenses-pending,net_ledger_balance:ledgerSales-expenses,reinvestment_slider:sliderResults,creative_id:savedCreative.id,creative_provider:savedCreative.provider,creative_model:savedCreative.model,creative_clipboard_exact:true,creative_persistence_verified:true,persistence_verified:true,server_restart_verified:true,local_storage_removed:true,sqlite_path:dbPath,sqlite_rows:sqliteRows,journal:journal,page_errors:errors,console_errors:consoleErrors,fatal_console_errors:fatalConsoleErrors,server_errors:serverErrors,resource_failures:resourceFailures};
  writeFileSync(resolve(out,'commerce-results.json'),JSON.stringify(result,null,2)+'\n');console.log('PASS commerce:',JSON.stringify(result));
} finally {writeFileSync(resolve(out,'commerce-server.log'),logs);await browser?.close();await stopServer();}
