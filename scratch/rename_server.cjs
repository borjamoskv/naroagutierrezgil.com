const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const ASSETS_DIR = path.join(__dirname, '../public/assets');
const NEW_ARTWORKS_TXT = path.join(__dirname, 'new_artworks.txt');

// Helper to append to new_artworks.txt
function appendArtworkJSON(newName) {
  const parsed = path.parse(newName);
  const title = parsed.name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const code = `  {
    id: Date.now(), // FIXME: Actualizar ID manualmente en artworks.ts
    slug: '${parsed.name}',
    url: '/assets/${newName}',
    title: '${title}',
    href: '#obra-${parsed.name}',
    year: '2024',
    medium: 'Acrílico y Óleo sobre Lienzo',
    description: 'Obra hiperrealista: ${title}.',
    sizeCategory: 'medium'
  },
`;
  fs.appendFileSync(NEW_ARTWORKS_TXT, code, 'utf8');
}

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method === 'GET' && req.url === '/') {
    fs.readdir(ASSETS_DIR, (err, files) => {
      if (err) {
        res.writeHead(500);
        return res.end('Error reading directory');
      }
      
      // Filter images that haven't been renamed to clean hyphenated webp names yet
      // Or just show all jpg/jpeg and messy webp files
      const targetFiles = files.filter(f => 
        (f.endsWith('.jpg') || f.endsWith('.jpeg')) || 
        (f.endsWith('.webp') && (f.includes('_') || /[0-9]{5,}/.test(f)))
      );
      
      let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Naroa Artwork Renamer & Optimizer</title>
        <style>
          body { font-family: 'Inter', system-ui, sans-serif; background: #07070a; color: #eee; padding: 20px; }
          .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
          .card { background: #111116; padding: 15px; border-radius: 12px; text-align: center; border: 1px solid #222; transition: transform 0.2s, border-color 0.2s; }
          .card:hover { border-color: #FCD34D; transform: translateY(-2px); }
          img { width: 100%; height: 220px; object-fit: contain; margin-bottom: 15px; border-radius: 6px; background: #000; }
          input { width: 90%; padding: 12px; margin-bottom: 15px; background: #0a0a0f; color: white; border: 1px solid #333; border-radius: 6px; font-family: monospace; font-size: 14px; outline: none; transition: border-color 0.2s; box-sizing: border-box;}
          input:focus { border-color: #FCD34D; }
          button { padding: 12px 16px; background: #FCD34D; color: #000; border: none; cursor: pointer; border-radius: 6px; font-weight: 700; width: 90%; text-transform: uppercase; letter-spacing: 1px; transition: background 0.2s; }
          button:hover { background: #fbbf24; }
          button:disabled { background: #555; cursor: not-allowed; }
          .title { text-align: center; color: #FCD34D; margin-bottom: 40px; font-size: 2.5em; text-transform: uppercase; letter-spacing: 3px; font-weight: 800;}
          .stats { text-align: center; color: #888; margin-bottom: 20px; }
          .toast { position: fixed; bottom: 20px; right: 20px; background: #10B981; color: white; padding: 15px 25px; border-radius: 8px; font-weight: bold; transform: translateY(100px); opacity: 0; transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55); z-index: 1000; }
          .toast.show { transform: translateY(0); opacity: 1; }
        </style>
      </head>
      <body>
        <div id="toast" class="toast">✅ Optimizado y Renombrado</div>
        <h1 class="title">C5-REAL Asset Optimizer</h1>
        <div class="stats">Archivos pendientes de optimizar/renombrar: ${targetFiles.length}</div>
        <div class="grid">
      `;
      
      targetFiles.forEach(file => {
        const parsed = path.parse(file);
        // Pre-fill input with lowercased words, hyphens instead of underscores
        const prefill = parsed.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        
        html += `
          <div class="card" id="card-${file}">
            <img src="/image?file=${encodeURIComponent(file)}" loading="lazy" />
            <small style="color: #666; font-size: 0.75em; display:block; margin-bottom: 10px; word-break: break-all;">${file}</small>
            <input type="text" id="input-${file}" value="${prefill}" placeholder="nuevo-nombre" onkeydown="if(event.key==='Enter') rename('${file}')" />
            <button id="btn-${file}" onclick="rename('${file}')">Optimizar (WEBP)</button>
          </div>
        `;
      });
      
      html += `
        </div>
        <script>
          function showToast(msg) {
            const toast = document.getElementById('toast');
            toast.textContent = msg;
            toast.classList.add('show');
            setTimeout(() => toast.classList.remove('show'), 3000);
          }

          function rename(oldName) {
            const input = document.getElementById('input-' + oldName);
            const btn = document.getElementById('btn-' + oldName);
            let newName = input.value.trim();
            if (!newName) return alert('Escribe un nombre válido');
            
            // Clean name
            newName = newName.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
            if (!newName.endsWith('.webp')) {
                newName += '.webp';
            }
            
            input.disabled = true;
            btn.disabled = true;
            btn.textContent = 'Procesando...';
            
            fetch('/rename', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ oldName, newName })
            }).then(r => r.text()).then(res => {
              if (res === 'OK') {
                document.getElementById('card-' + oldName).style.display = 'none';
                showToast('✅ ' + newName);
              } else {
                alert(res);
                input.disabled = false;
                btn.disabled = false;
                btn.textContent = 'Reintentar';
              }
            }).catch(e => {
              alert('Error de red');
              input.disabled = false;
              btn.disabled = false;
              btn.textContent = 'Error';
            });
          }
        </script>
      </body>
      </html>
      `;
      
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(html);
    });
  } else if (req.method === 'GET' && req.url.startsWith('/image')) {
    const url = new URL(req.url, 'http://localhost');
    const file = url.searchParams.get('file');
    const safePath = path.join(ASSETS_DIR, path.normalize(file).replace(/^(\.\.(\/|\\|$))+/, ''));
    
    fs.readFile(safePath, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end('Not found');
      } else {
        const ext = path.extname(safePath).toLowerCase();
        let mime = 'image/webp';
        if (ext === '.jpg' || ext === '.jpeg') mime = 'image/jpeg';
        else if (ext === '.png') mime = 'image/png';
        
        res.writeHead(200, { 'Content-Type': mime });
        res.end(data);
      }
    });
  } else if (req.method === 'POST' && req.url === '/rename') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { oldName, newName } = JSON.parse(body);
        const oldPath = path.join(ASSETS_DIR, path.normalize(oldName).replace(/^(\.\.(\/|\\|$))+/, ''));
        const newPath = path.join(ASSETS_DIR, path.normalize(newName).replace(/^(\.\.(\/|\\|$))+/, ''));
        
        // If it was a jpg and we are renaming to webp, use cwebp
        const oldExt = path.extname(oldName).toLowerCase();
        if ((oldExt === '.jpg' || oldExt === '.jpeg' || oldExt === '.png') && newName.endsWith('.webp')) {
          exec(`cwebp -q 82 "${oldPath}" -o "${newPath}"`, (error) => {
            if (error) {
              res.writeHead(500);
              res.end('Error converting with cwebp');
            } else {
              // Delete original
              fs.unlink(oldPath, () => {});
              appendArtworkJSON(newName);
              res.writeHead(200);
              res.end('OK');
            }
          });
        } else {
          fs.rename(oldPath, newPath, (err) => {
            if (err) {
              res.writeHead(500);
              res.end(err.message);
            } else {
              appendArtworkJSON(newName);
              res.writeHead(200);
              res.end('OK');
            }
          });
        }
      } catch(e) {
        res.writeHead(400);
        res.end('Bad Request');
      }
    });
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(3333, () => {
  console.log('\n======================================================');
  console.log('✅ UI DE RENOMBRADO Y OPTIMIZACIÓN C5-REAL LISTA');
  console.log('👉 Abre esta URL en tu navegador: http://localhost:3333');
  console.log('======================================================\n');
});
