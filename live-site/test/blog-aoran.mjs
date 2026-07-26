import { spawn } from 'node:child_process';
import { writeFileSync } from 'node:fs';
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const chrome = spawn(CHROME, ['--headless=new','--remote-debugging-port=9228','--user-data-dir=/tmp/chrome-cdp-ba','--window-size=1440,960','--hide-scrollbars','--mute-audio','about:blank'], { stdio: 'ignore' });
let ws, msgId = 0; const pending = new Map();
const send = (m2, p={}) => new Promise((res) => { const id=++msgId; pending.set(id,res); ws.send(JSON.stringify({id,method:m2,params:p})); });
let targets=null;
for (let i=0;i<40;i++){ try{ const r=await fetch('http://127.0.0.1:9228/json/list'); targets=await r.json(); if(targets.length) break;}catch{} await sleep(250);}
ws = new WebSocket(targets.find(t=>t.type==='page').webSocketDebuggerUrl);
await new Promise((res,rej)=>{ws.onopen=res;ws.onerror=rej;});
ws.onmessage=(ev)=>{const m=JSON.parse(ev.data); if(m.id&&pending.has(m.id)){pending.get(m.id)(m.result);pending.delete(m.id);}};
await send('Page.enable'); await send('Runtime.enable');
await send('Emulation.setDeviceMetricsOverride',{width:1440,height:960,deviceScaleFactor:1,mobile:false});
await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'no-preference'}]});
const ev = async (e) => (await send('Runtime.evaluate',{expression:e,returnByValue:true,awaitPromise:true}))?.result?.value;
const shot = async (n) => { const r=await send('Page.captureScreenshot',{format:'jpeg',quality:75}); writeFileSync('shots/'+n, Buffer.from(r.data,'base64')); };
await send('Page.navigate',{url:'http://127.0.0.1:8899/#/destacada'});
await sleep(5000);
// blog
const b = await ev(`(async()=>{ document.getElementById('view-blog').scrollIntoView({block:'start'}); window.scrollBy(0,-70); await new Promise(r=>setTimeout(r,1200)); return {cards: document.querySelectorAll('#blog-posts .blog-card').length, rm: matchMedia('(prefers-reduced-motion: reduce)').matches}; })()`);
await shot('08-blog.jpeg');
// aoran
const a = await ev(`(async()=>{ document.getElementById('view-about').scrollIntoView(); await new Promise(r=>setTimeout(r,5200)); const t=document.querySelector('.about__impact-title'); return {chars: t.querySelectorAll('.aoran-char').length, drift: t.classList.contains('aoran-drift')}; })()`);
await shot('09-aoran-drift.jpeg');
console.log(JSON.stringify({blog:b, aoran:a}));
ws.close(); chrome.kill();
