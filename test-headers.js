import https from 'https';

const url = 'https://h5-api.aoneroom.com/wefeed-h5api-bff/everyone-search?keyword=action';

async function testHeaders(headers, label) {
  return new Promise((resolve) => {
    console.log(`--- Testing: ${label} ---`);
    const req = https.get(url, { headers }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`STATUS: ${res.statusCode}`);
        console.log(`BODY: ${data.slice(0, 100)}\n`);
        resolve();
      });
    });
    req.on('error', (err) => {
      console.error('ERROR:', err);
      resolve();
    });
  });
}

async function run() {
  // Case 1: Browser-like headers
  await testHeaders({
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'en-US,en;q=0.9',
    'Origin': 'https://web.aoneroom.com',
    'Referer': 'https://web.aoneroom.com/',
  }, 'Browser-like headers');

  // Case 2: No headers (except default node-fetch ones)
  await testHeaders({}, 'No headers');
}

run();
