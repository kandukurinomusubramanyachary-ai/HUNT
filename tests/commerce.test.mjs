import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { createRequire } from 'node:module';
const external = createRequire(import.meta.url);
const ts = external('typescript');
const modules = new Map();
const values = new Map();
const storage = {getItem:key=>values.get(key)||null,setItem:(key,value)=>values.set(key,value),removeItem:key=>values.delete(key)};
// Load actual TypeScript service modules with the project's installed compiler and aliases.
function load(file) {
  const path=resolve(file); if(modules.has(path)) return modules.get(path).exports;
  const module={exports:{}}; modules.set(path,module);
  const source=ts.transpileModule(readFileSync(path,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText;
  const require=specifier=>specifier.startsWith('@/') ? load(resolve('src',specifier.slice(2)+'.ts')) : specifier.startsWith('.') ? load(resolve(dirname(path),specifier+'.ts')) : external(specifier);
  new Function('require','module','exports','localStorage','sessionStorage',source)(require,module,module.exports,storage,storage);
  return module.exports;
}
const {useHuntStore}=load('src/store/hunt-store.ts');
const {getProductById}=load('src/lib/services/products.ts');
const {createStore}=load('src/lib/services/stores.ts');
const {createDemoOrder}=load('src/lib/services/orders.ts');
const {recordDemoTraffic,recordDemoVisit}=load('src/lib/services/demo-traffic.ts');
const {getWalletSummary,getReinvestmentPlan}=load('src/lib/services/wallet.ts');
const {summarise,buildSeries,filterOrders}=load('src/lib/analytics.ts');
function fresh() {useHuntStore.setState({stores:[],orders:[],traffic:[],transactions:[],activities:[],cart:[]});}
function store() {
  const product=getProductById('aurora-rest');
  return createStore({product,storeName:'Test Demo',slug:'test-demo',tagline:product.tagline,accentColor:'#A3E635',visualStyle:'minimal',price:3333,
    content:{heroHeadline:'Demo product',heroSubheading:'Fixture only',benefits:[],highlights:[],faqs:[],ctaText:'Shop demo'}}).store;
}
test('Store Builder service preserves selected product metadata, edited selling price and demo provenance',()=>{
  fresh();const s=store();assert.ok(s);assert.equal(s.price,3333);assert.equal(s.productId,'aurora-rest');assert.equal(s.productName,'Aurora Rest');assert.equal(s.category,'Sleep & wellness');assert.equal(s.isDemo,true);assert.equal(useHuntStore.getState().activities[0].isDemo,true);
});
test('one simulated checkout atomically adds one order and one linked pending ledger credit',()=>{
  fresh();const s=store();const invalid=createDemoOrder({storeId:s.id,quantity:1,customerName:'',email:'invalid'});assert.equal(invalid.ok,false);assert.equal(useHuntStore.getState().orders.length,0);
  const result=createDemoOrder({storeId:s.id,quantity:2,customerName:'Demo',email:'demo@example.com'});assert.equal(result.ok,true);
  const state=useHuntStore.getState();assert.equal(state.orders.length,1);assert.equal(state.transactions.length,1);assert.equal(result.order.total,6666);assert.equal(state.transactions[0].id,`${result.order.id}-txn`);assert.equal(state.transactions[0].amount,6666);assert.equal(state.transactions[0].isDemo,true);
});
test('actual demo traffic events deduplicate and drive analytics conversion without fabricated visitors',()=>{
  fresh();const s=store();recordDemoTraffic(s.id,'visit','one-visit');recordDemoTraffic(s.id,'visit','one-visit');recordDemoTraffic(s.id,'checkout','one-checkout');recordDemoTraffic(s.id,'checkout','one-checkout');recordDemoTraffic('missing','visit','missing-visit');
  createDemoOrder({storeId:s.id,quantity:1,customerName:'Demo',email:'demo@example.com'});
  const state=useHuntStore.getState(), summary=summarise(state.traffic,state.orders,()=>0);assert.equal(state.traffic.length,2);assert.equal(summary.visitors,1);assert.equal(summary.checkoutStarts,1);assert.equal(summary.orders,1);assert.equal(summary.revenue,3333);assert.equal(summary.conversionRate,100);
  const date=state.orders[0].createdAt.slice(0,10);assert.equal(buildSeries(state.traffic,state.orders,{start:date,end:date},'day')[0].revenue,3333);
});
test('session visit is recorded once across remounts and page refreshes',()=>{
  fresh();const s=store();recordDemoVisit(s.id);recordDemoVisit(s.id);assert.equal(useHuntStore.getState().traffic.length,1);assert.equal(useHuntStore.getState().traffic[0].visitors,1);
});
test('wallet sales reconcile to the same orders; pending credits are unavailable for reinvestment',()=>{
  fresh();const s=store();createDemoOrder({storeId:s.id,quantity:1,customerName:'Demo',email:'demo@example.com'});
  let summary=getWalletSummary();assert.equal(summary.totalSales,3333);assert.equal(summary.pendingAmount,3333);assert.equal(summary.availableBalance,0);assert.equal(getReinvestmentPlan(30).reinvestAmount,0);
  useHuntStore.setState(state=>({transactions:state.transactions.map(t=>({...t,status:'settled'}))}));summary=getWalletSummary();assert.equal(summary.availableBalance,3333);assert.equal(getReinvestmentPlan(30).reinvestAmount,999.9);
});
test('seeded demo sales use matching order and ledger records; analytics excludes refunded orders',()=>{
  useHuntStore.getState().resetDemo();const state=useHuntStore.getState();assert.equal(state.orders.reduce((n,o)=>n+o.total,0),state.transactions.filter(t=>t.type==='sale-credit').reduce((n,t)=>n+t.amount,0));
  const order=state.orders[0],date=order.createdAt.slice(0,10);assert.equal(filterOrders([{...order,status:'refunded'}],[order.storeId],{start:date,end:date}).length,0);
});


test('fractional order credits and expense debits reconcile in paise with pending settlement excluded',()=>{
  fresh();const s=store();useHuntStore.getState().updateStore(s.id,{price:3333.01});
  const result=createDemoOrder({storeId:s.id,quantity:3,customerName:'Demo',email:'demo@example.com'});
  assert.equal(result.ok,true);assert.equal(result.order.total,9999.03);
  let state=useHuntStore.getState();assert.equal(state.transactions[0].amount,result.order.total);
  const debit=(id,type,amount,status='settled')=>({id,storeId:s.id,storeName:s.name,description:'Simulated test expense',type,amount,status,timestamp:result.order.createdAt,isDemo:true});
  useHuntStore.setState({transactions:[{...state.transactions[0],status:'settled'},debit('marketing','marketing-debit',10.13),debit('operating','operating-debit',0.07),debit('pending-expense','operating-debit',2.03,'pending')]});
  const summary=getWalletSummary();assert.deepEqual(summary,{totalSales:9999.03,estimatedExpenses:12.23,pendingAmount:-2.03,settledAmount:9988.83,availableBalance:9988.83});
  assert.equal(Math.round(summary.availableBalance*100),Math.round(summary.totalSales*100)-Math.round(summary.estimatedExpenses*100)-Math.round(summary.pendingAmount*100));
});

test('reinvestment 0, 30 and 100 percent round to paise and allocations conserve the suggested amount',()=>{
  fresh();const s=store();useHuntStore.getState().updateStore(s.id,{price:100.03});createDemoOrder({storeId:s.id,quantity:1,customerName:'Demo',email:'demo@example.com'});
  useHuntStore.setState(state=>({transactions:state.transactions.map(t=>({...t,status:'settled'}))}));
  for(const [percentage,reinvestment,remaining] of [[0,0,100.03],[30,30.01,70.02],[100,100.03,0]]){
    const plan=getReinvestmentPlan(percentage);assert.equal(plan.percentage,percentage);assert.equal(plan.reinvestAmount,reinvestment);assert.equal(plan.remainingBalance,remaining);
    assert.equal(plan.allocation.reduce((n,item)=>n+Math.round(item.amount*100),0),Math.round(reinvestment*100));
    for(const value of [plan.reinvestAmount,plan.remainingBalance,...plan.allocation.map(item=>item.amount)])assert.equal(value,Number(value.toFixed(2)));
  }
  assert.equal(getReinvestmentPlan(-10).reinvestAmount,0);assert.equal(getReinvestmentPlan(110).reinvestAmount,100.03);assert.equal(getReinvestmentPlan(Number.NaN).percentage,0);
});

test('reinvestment does not allocate a negative simulated balance',()=>{
  fresh();useHuntStore.setState({transactions:[{id:'expense',storeId:'demo',storeName:'Demo',description:'Simulated expense',type:'operating-debit',amount:0.03,status:'settled',timestamp:new Date().toISOString(),isDemo:true}]});
  const summary=getWalletSummary();assert.equal(summary.availableBalance,-0.03);
  const plan=getReinvestmentPlan(100);assert.equal(plan.eligibleBalance,0);assert.equal(plan.reinvestAmount,0);assert.equal(plan.remainingBalance,0);assert.deepEqual(plan.allocation,[]);
});
