// Validación E2E headless de #/destacada vía CDP (sin dependencias, Node 24)
import { spawn } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = 9223;
const URL_UNDER_TEST = 'http://127.0.0.1:8899/#/destacada';
const OUT = new URL('./shots/', import.meta.url).pathname;

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const chrome = spawn(CHROME, [
  '--headless=new', `--remote-debugging-port=${PORT}`,
  '--user-data-dir=/tmp/chrome-cdp-naroa', '--window-size=1440,960',
  '--hide-scrollbars', '--mute-audio', 'about:blank'
], { stdio: 'ignore' });

let ws, msgId = 0;
const pending = new Map();
const consoleLogs = [];

function send(method, params = {}, sessionId) {
  return new Promise((resolve, reject) => {
    const id = ++msgId;
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify(sessionId ? { id, method, params, sessionId } : { id, method, params }));
  });
}

async function main() {
  // esperar a que Chrome abra el puerto
  let targets = null;
  for (let i = 0; i < 40; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${PORT}/json/list`);
      targets = await r.json();
      if (targets.length) break;
    } catch { /* retry */ }
    await sleep(250);
  }
  if (!targets?.length) throw new Error('Chrome CDP no responde');

  const page = targets.find(t => t.type === 'page');
  ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });

  ws.onmessage = (ev) => {
    const m = JSON.parse(ev.data);
    if (m.id && pending.has(m.id)) { pending.get(m.id).resolve(m.result ?? m.error); pending.delete(m.id); }
    if (m.method === 'Runtime.consoleAPICalled' && ['error', 'warning'].includes(m.params.type)) {
      consoleLogs.push(m.params.type + ': ' + (m.params.args || []).map(a => a.value ?? a.description ?? '').join(' ').slice(0, 200));
    }
    if (m.method === 'Log.entryAdded' && m.params.entry.level === 'error') {
      consoleLogs.push('log-error: ' + (m.params.entry.text || '').slice(0, 200));
    }
  };

  await send('Runtime.enable');
  await send('Log.enable');
  await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 960, deviceScaleFactor: 1, mobile: false });

  const evaluate = async (expr) => {
    const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
    if (r?.exceptionDetails) return { __error: r.exceptionDetails.text + ' ' + (r.exceptionDetails.exception?.description || '') };
    return r?.result?.value;
  };
  const shot = async (name) => {
    const r = await send('Page.captureScreenshot', { format: 'jpeg', quality: 72 });
    writeFileSync(OUT + name, Buffer.from(r.data, 'base64'));
    console.log('shot:', name);
  };

  await send('Page.navigate', { url: URL_UNDER_TEST });
  await sleep(4500); // boot SPA + fuentes + imágenes

  const report = {};

  // 1. Boot y wiring
  report.boot = await evaluate(`(() => ({
    naroa: !!window.Naroa,
    lightbox: !!(window.Naroa && window.Naroa.systems && window.Naroa.systems.lightbox),
    destacadaEnhanced: !!window.__destacadaEnhanced,
    route: location.hash,
    viewActiva: document.querySelector('.view.active')?.id || null,
    items: document.querySelectorAll('#featured-gallery .gallery-massive__item').length,
    focusables: document.querySelectorAll('#featured-gallery .gallery-massive__item[tabindex]').length,
    counter: document.querySelector('.gallery-count')?.textContent || null
  }))()`);
  await shot('01-hero.jpeg');

  // 2. Scroll a la cuadrícula → reveal
  await evaluate(`window.scrollTo(0, document.querySelector('#featured-gallery').getBoundingClientRect().top + window.scrollY - 300)`);
  await sleep(1400);
  report.reveal = await evaluate(`(() => ({
    total: document.querySelectorAll('.gallery-reveal').length,
    visibles: document.querySelectorAll('.gallery-reveal.is-visible').length
  }))()`);
  await shot('02-grid.jpeg');

  // 3. Click en la segunda obra → lightbox
  await evaluate(`document.querySelectorAll('#featured-gallery .gallery-massive__item')[1].click()`);
  await sleep(1100);
  report.lightbox = await evaluate(`(() => {
    const lb = document.querySelector('.gallery-lightbox');
    if (!lb) return { existe: false };
    const cs = getComputedStyle(lb);
    return {
      existe: true, hidden: lb.hidden, display: cs.display, opacity: cs.opacity,
      active: lb.classList.contains('active'),
      img: lb.querySelector('.gallery-lightbox__image')?.src?.split('/').pop() || null,
      titulo: lb.querySelector('.gallery-lightbox__title')?.textContent || null,
      counter: lb.querySelector('.gallery-lightbox__counter')?.textContent?.trim() || null,
      navVisible: getComputedStyle(lb.querySelector('.gallery-lightbox__nav--next')).display
    };
  })()`);
  await shot('03-lightbox.jpeg');

  // 4. Navegar a la siguiente obra dentro del lightbox
  await evaluate(`document.querySelector('.gallery-lightbox__nav--next').click()`);
  await sleep(900);
  report.lightboxNext = await evaluate(`(() => ({
    titulo: document.querySelector('.gallery-lightbox__title')?.textContent || null
  }))()`);
  await shot('04-lightbox-next.jpeg');

  // 5. Cerrar con Escape
  await evaluate(`window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))`);
  await sleep(700);
  report.trasEscape = await evaluate(`(() => ({
    active: document.querySelector('.gallery-lightbox')?.classList.contains('active') ?? null,
    bodyOverflow: document.body.style.overflow
  }))()`);

  report.consola = consoleLogs.slice(0, 10);
  console.log(JSON.stringify(report, null, 2));
}

main().catch(e => { console.error('FATAL', e); process.exitCode = 1; })
  .finally(() => { try { ws?.close(); } catch {} chrome.kill(); });
