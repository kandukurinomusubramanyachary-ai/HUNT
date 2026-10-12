import { spawn } from 'node:child_process';
const next = process.argv[2] || 'dev';
const worker = spawn(process.execPath, ['--env-file-if-exists=.env.local', 'scripts/intelligence-worker.mjs'], { stdio: 'inherit' });
const web = spawn(process.execPath, ['node_modules/next/dist/bin/next', next], { stdio: 'inherit' });
let closed = false;
function stop(code = 0) { if (closed) return; closed = true; worker.kill(); web.kill(); process.exit(code); }
process.on('SIGINT', () => stop()); process.on('SIGTERM', () => stop());
web.on('exit', code => stop(code || 0));
worker.on('exit', code => { if (!closed) { console.error('Intelligence worker exited', code); stop(code || 1); } });

process.on('message', message => { if (message === 'stop') stop(); });
