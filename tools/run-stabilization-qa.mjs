// Run the real backend with an isolated Vite cache, separate socket, no HMR/file watcher.
// The original server, API routes, models and environment files are not edited.
import fs from 'node:fs';
import { spawn } from 'node:child_process';
fs.mkdirSync('artifacts/stabilization',{recursive:true});
const source=fs.readFileSync('server.ts','utf8');
const original='server: { middlewareMode: true },';
if(!source.includes(original))throw new Error('Server initialization changed; review QA override before running.');
const copy=source.replaceAll("from './src/server/","from '../../src/server/").replace(original,
  "cacheDir: 'node_modules/.vite-stabilization-qa', server: { middlewareMode: true, hmr: false, ws: { port: 24679 }, watch: null },");
fs.writeFileSync('artifacts/stabilization/qa-server.ts',copy);
const child=spawn(process.execPath,['--import','tsx','artifacts/stabilization/qa-server.ts'],{stdio:'inherit',env:{...process.env,PORT:'3001'}});
child.on('exit',code=>process.exit(code??1));
process.on('SIGINT',()=>child.kill());
process.on('SIGTERM',()=>child.kill());
