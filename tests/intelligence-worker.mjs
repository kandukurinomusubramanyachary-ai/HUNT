import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { database } from '../src/lib/intelligence/engine.mjs';
mkdirSync('test-results',{recursive:true});
const path=resolve(`test-results/worker-${process.pid}.sqlite`);
const port=3108,base=`http://127.0.0.1:${port}`;
const app=spawn(process.execPath,['scripts/with-worker.mjs','start'],{env:{...process.env,PORT:String(port),HUNT_DB_PATH:path,HUNT_REFRESH_MINUTES:'1',HUNT_INCLUDE_FIXTURES:'false'},stdio:['ignore','pipe','pipe','ipc']});
let logs='';app.stdout.on('data',d=>{logs+=d;process.stdout.write(d);});app.stderr.on('data',d=>{logs+=d;});
const wait=ms=>new Promise(r=>setTimeout(r,ms));
try {
  let first;
  for(let i=0;i<100;i++){try{const r=await fetch(`${base}/api/intelligence/status`);if(r.ok){const s=await r.json();if(s.last_success){first=s;break;}}}catch{}await wait(500);}
  assert.ok(first,logs);assert.equal(first.worker.state,'waiting');assert.ok(first.evidence_count>0);assert.equal(first.refresh_interval_ms,60000);
  const db=database(path);const runs=()=>db.prepare('SELECT count(*) AS n FROM runs').get().n;
  assert.equal(runs(),1);const workerPid=first.worker.pid;
  for(let i=0;i<3;i++){await fetch(`${base}/discover`);await fetch(`${base}/api/intelligence/opportunities`);}
  assert.equal(runs(),1,'Page requests must not restart collection');
  const secondStatus=await (await fetch(`${base}/api/intelligence/status`)).json();assert.equal(secondStatus.worker.pid,workerPid);
  console.log('PASS: npm start automatically launched dedicated worker and stored real evidence; page requests did not start collection. Waiting for scheduled scan.');
  let completed=false;
  for(let i=0;i<100;i++){const finished=db.prepare("SELECT count(*) AS n FROM runs WHERE status IN ('success','partial')").get().n;if(finished>=2){completed=true;break;}await wait(1000);}
  assert.ok(completed,'Second scan must run on configured schedule');assert.equal(db.prepare("SELECT count(*) AS n FROM runs WHERE status='running'").get().n,0);
  console.log('PASS: second scan completed automatically after configured one-minute verification interval; production default is 30 minutes.');db.close();
} finally { if(app.connected) app.send('stop'); else app.kill(); }
