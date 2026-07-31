// Validación E2E completa — ronda 2 (menú, juegos, MICA, blog, AORAN)
import { spawn } from 'node:child_process';
import { writeFileSync } from 'node:fs';
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const chrome = spawn(CHROME, ['--headless=new','--remote-debugging-port=9226','--user-data-dir=/tmp/chrome-cdp-r2','--window-size=1440,960','--hide-scrollbars','--mute-audio','about:blank'], { stdio: 'ignore' });
let ws, msgId = 0; const pending = new Map(); const errors = [];
const send = (m2, p={}) => new Promise((res) => { const id=++msgId; pending.set(id,res); ws.send(JSON.stringify({id,method:m2,params:p})); });
let targets=null;
for (let i=0;i<40;i++){ try{ const r=await fetch('http://127.0.0.1:9226/json/list'); targets=await r.json(); if(targets.length) break;}catch{} await sleep(250);}
ws = new WebSocket(targets.find(t=>t.type==='page').webSocketDebuggerUrl);
await new Promise((res,rej)=>{ws.onopen=res;ws.onerror=rej;});
ws.onmessage=(ev)=>{const m=JSON.parse(ev.data);
  if(m.id&&pending.has(m.id)){pending.get(m.id)(m.result);pending.delete(m.id);}
  if(m.method==='Runtime.exceptionThrown'){errors.push((m.params.exceptionDetails.exception?.description||m.params.exceptionDetails.text||'').slice(0,160));}
};
await send('Page.enable'); await send('Runtime.enable');
await send('Emulation.setDeviceMetricsOverride',{width:1440,height:960,deviceScaleFactor:1,mobile:false});
const ev = async (e) => (await send('Runtime.evaluate',{expression:e,returnByValue:true,awaitPromise:true}))?.result?.value;
const shot = async (n) => { const r=await send('Page.captureScreenshot',{format:'jpeg',quality:72}); writeFileSync('shots/'+n, Buffer.from(r.data,'base64')); };
const R = {}; const log=(...a)=>console.log(new Date().toISOString().slice(11,19),...a);

await send('Page.navigate',{url:'http://127.0.0.1:8899/#/destacada'});
await sleep(4500); log("cargado");

// 1. Menú desktop: click Trayectoria → debe hacer scroll
log("paso nav…"); R.navTrayectoria = await ev(`(async () => {
  const y0 = window.scrollY;
  [...document.querySelectorAll('.nav__link')].find(a => a.textContent.trim()==='Trayectoria').click();
  await new Promise(r=>setTimeout(r,2600));
  return { scrollAntes: y0, scrollDespues: window.scrollY, funciono: window.scrollY !== y0 };
})()`);

// 2. Juegos: navegar a #/juegos
log("paso juegos…"); R.juegos = await ev(`(async () => {
  location.hash = '#/juegos';
  await new Promise(r=>setTimeout(r,2600));
  const v = document.getElementById('view-juegos');
  const cs = getComputedStyle(v);
  return { display: cs.display, visible: v.classList.contains('active'), tarjetas: v.querySelectorAll('.game-card, a, button').length };
})()`);
await shot("07-juegos.jpeg"); log("juegos ok");

// 3. MICA: tamaño + cierre persistente
log("paso mica…"); R.mica = await ev(`(async () => {
  const mica = window.Naroa.systems.mica;
  const p = mica.elements.panel;
  const abierto0 = p.classList.contains('mica-panel--open');
  mica.close();
  await new Promise(r=>setTimeout(r,300));
  const cerrado = !p.classList.contains('mica-panel--open');
  const marcado = mica._manuallyClosed === true;
  // triggerContextual no debe reabrirlo
  if (mica.triggerContextual) mica.triggerContextual({title:'Amy'});
  await new Promise(r=>setTimeout(r,300));
  const sigueCerrado = !p.classList.contains('mica-panel--open');
  const r2 = p.getBoundingClientRect();
  return { abierto0, cerrado, marcado, sigueCerrado, w: Math.round(r2.width), h: Math.round(r2.height) };
})()`);

// 4. MICA brain: respuesta inteligente local
log("paso brain…"); R.brain = await ev(`(async () => {
  const r1 = window.MicaBrain.answer('¿Cuánto cuesta un retrato?');
  const r2 = window.MicaBrain.answer('qué materiales usa?');
  return { precio: r1.slice(0,90), tecnica: r2.slice(0,90) };
})()`);

// 5. Blog
log("paso blog…"); R.blog = await ev(`(async () => {
  await new Promise(r=>setTimeout(r,3500));
  const cards = document.querySelectorAll('#blog-posts .blog-card');
  const first = cards[0];
  return { tarjetas: cards.length,
    titulo: first?.querySelector('.blog-card__title')?.textContent?.slice(0,50) || null,
    fecha: first?.querySelector('.blog-card__date')?.textContent || null,
    img: !!first?.querySelector('img'),
    error: !!document.querySelector('.blog__error') };
})()`);
await ev(`document.getElementById('view-blog').scrollIntoView()`);
await sleep(800);
await shot("08-blog.jpeg"); log("blog ok");

// 6. AORAN drift
log("paso aoran…"); R.aoran = await ev(`(async () => {
  document.getElementById('view-about').scrollIntoView();
  await new Promise(r=>setTimeout(r,4800));
  const t = document.querySelector('.about__impact-title');
  return { chars: t.querySelectorAll('.aoran-char').length, drift: t.classList.contains('aoran-drift') };
})()`);
await shot("09-aoran-drift.jpeg"); log("aoran ok");

// 7. Menú móvil (hamburguesa)
await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:2,mobile:true});
await send('Emulation.setTouchEmulationEnabled',{enabled:true});
await ev(`location.hash = '#/'; window.scrollTo(0,0)`);
await sleep(1500);
log("paso movil…"); R.movil = await ev(`(async () => {
  const t = document.getElementById('nav-toggle');
  const visible0 = getComputedStyle(t).display;
  t.click();
  await new Promise(r=>setTimeout(r,500));
  const abierto = document.getElementById('nav-links').classList.contains('nav__links--open');
  const enlace = [...document.querySelectorAll('.nav__link')].find(a=>a.textContent.trim()==='Obra');
  enlace.click();
  await new Promise(r=>setTimeout(r,600));
  const cerradoTrasClick = !document.getElementById('nav-links').classList.contains('nav__links--open');
  return { toggleDisplay: visible0, abierto, cerradoTrasClick };
})()`);
await shot("10-movil-menu.jpeg"); log("movil ok");

R.excepciones = errors.slice(0,5);
console.log(JSON.stringify(R, null, 2));
ws.close(); chrome.kill();
