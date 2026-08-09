const http = require('http');
const fs = require('fs');
const path = require('path');

const ASSETS_DIR = path.join(__dirname, '../public/assets');

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method === 'GET' && req.url === '/') {
    fs.readdir(ASSETS_DIR, (err, files) => {
      if (err) {
        res.writeHead(500);
        return res.end('Error reading directory');
      }
      
      const targetFiles = files.filter(f => f.match(/_n\.webp$/) || /^[0-9]+_/.test(f) || /_n\.jpg$/.test(f) || /^[0-9]+_/.test(f));
      
      let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Naroa Artwork Renamer</title>
        <style>
          body { font-family: system-ui; background: #111; color: #eee; padding: 20px; }
          .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
          .card { background: #222; padding: 15px; border-radius: 8px; text-align: center; border: 1px solid #333; }
          img { max-width: 100%; height: 200px; object-fit: contain; margin-bottom: 10px; border-radius: 4px; }
          input { width: 80%; padding: 10px; margin-bottom: 10px; background: #000; color: white; border: 1px solid #555; border-radius: 4px; }
          button { padding: 10px 16px; background: #FCD34D; color: black; border: none; cursor: pointer; border-radius: 4px; font-weight: bold; width: 85%; }
          button:hover { background: #fbbf24; }
          .title { text-align: center; color: #FCD34D; margin-bottom: 30px; font-size: 2em; text-transform: uppercase; letter-spacing: 2px;}
        </style>
      </head>
      <body>
        <h1 class="title">Renombrador de Obras C5-REAL</h1>
        <div class="grid">
      `;
      
      targetFiles.forEach(file => {
        html += `
          <div class="card" id="card-${file}">
            <img src="/image?file=${encodeURIComponent(file)}" />
            <br/>
            <small style="color: #888; font-size: 0.7em;">${file}</small>
            <br/><br/>
            <input type="text" id="input-${file}" placeholder="ej: audrey-frutas" />
            <br/>
            <button onclick="rename('${file}')">Renombrar</button>
          </div>
        `;
      });
      
      html += `
        </div>
        <script>
          function rename(oldName) {
            const input = document.getElementById('input-' + oldName);
            let newName = input.value.trim();
            if (!newName) return alert('Escribe un nombre');
            
            // Clean name: lowercase, replace spaces with dashes, remove special chars
            newName = newName.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
            if (!newName.endsWith('.webp') && !newName.endsWith('.jpg')) {
                newName += '.webp';
            }
            
            fetch('/rename', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ oldName, newName })
            }).then(r => r.text()).then(res => {
              if (res === 'OK') {
                document.getElementById('card-' + oldName).style.display = 'none';
              } else {
                alert(res);
              }
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
        
        fs.rename(oldPath, newPath, (err) => {
          if (err) {
            res.writeHead(500);
            res.end(err.message);
          } else {
            res.writeHead(200);
            res.end('OK');
          }
        });
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
  console.log('\\n======================================================');
  console.log('✅ UI DE RENOMBRADO LISTA');
  console.log('👉 Abre esta URL en tu navegador: http://localhost:3333');
  console.log('======================================================\\n');
});
