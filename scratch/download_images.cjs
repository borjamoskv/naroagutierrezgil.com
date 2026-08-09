const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const URL = 'https://www.naroa.eu';
const DIR = path.join(__dirname, 'naroa_eu_images');

if (!fs.existsSync(DIR)) {
  fs.mkdirSync(DIR);
}

const getHtml = (url) => {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
};

const downloadImage = (url, filepath) => {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, (res) => {
      if (res.statusCode === 200) {
        res.pipe(fs.createWriteStream(filepath))
           .on('error', reject)
           .once('close', () => resolve(filepath));
      } else if (res.statusCode === 301 || res.statusCode === 302) {
        // Handle redirect
        const newUrl = res.headers.location;
        if (newUrl) {
            downloadImage(newUrl, filepath).then(resolve).catch(reject);
        } else {
             res.resume();
             resolve(null);
        }
      } else {
        res.resume();
        resolve(null);
      }
    }).on('error', reject);
  });
};

const run = async () => {
  console.log(`Fetching ${URL}...`);
  try {
    const html = await getHtml(URL);
    
    // Simple regex to find image src attributes
    const imgRegex = /<img[^>]+src="?([^"\s]+)"?\s*/gi;
    let match;
    const imgUrls = new Set();
    
    while ((match = imgRegex.exec(html)) !== null) {
      let imgUrl = match[1];
      if (imgUrl.startsWith('//')) {
        imgUrl = 'https:' + imgUrl;
      } else if (imgUrl.startsWith('/')) {
        imgUrl = URL + imgUrl;
      } else if (!imgUrl.startsWith('http')) {
        imgUrl = URL + '/' + imgUrl;
      }
      imgUrls.add(imgUrl);
    }
    
    // Also parse inline css background-images
    const bgRegex = /url\((['"]?)([^'"\)]+)\1\)/gi;
    while ((match = bgRegex.exec(html)) !== null) {
        let imgUrl = match[2];
        if (imgUrl.startsWith('data:')) continue; // Skip base64
        if (imgUrl.startsWith('//')) {
          imgUrl = 'https:' + imgUrl;
        } else if (imgUrl.startsWith('/')) {
          imgUrl = URL + imgUrl;
        } else if (!imgUrl.startsWith('http')) {
          imgUrl = URL + '/' + imgUrl;
        }
        imgUrls.add(imgUrl);
    }

    console.log(`Found ${imgUrls.size} unique image URLs.`);
    
    let count = 0;
    for (const imgUrl of imgUrls) {
      // safely get a filename
      let filename;
      try {
        filename = path.basename(new URL(imgUrl).pathname);
      } catch (e) {
        filename = imgUrl.split('/').pop().split('?')[0];
      }
      if (!filename || filename === '') {
          filename = `image_${count}.jpg`;
      }
      const filepath = path.join(DIR, filename);
      console.log(`Downloading: ${imgUrl} -> ${filename}`);
      try {
        await downloadImage(imgUrl, filepath);
        count++;
      } catch (err) {
        console.error(`Error downloading ${imgUrl}:`, err.message);
      }
    }
    console.log(`\nSuccessfully downloaded ${count} images to ${DIR}`);
  } catch (err) {
    console.error('Error fetching HTML:', err.message);
  }
};

run();
