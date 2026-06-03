import https from 'https';

const urls = [
  'https://h5-api.aoneroom.com/wefeed-h5api-bff/everyone-search?keyword=action',
  'https://h5-api.aoneroom.com/everyone-search?keyword=action',
  'https://h5-api.aoneroom.com/wefeed-h5api-bff/everyone-search',
  'https://h5-api.aoneroom.com/everyone-search'
];

async function testUrl(url) {
  return new Promise((resolve) => {
    console.log(`Testing: ${url}`);
    const req = https.get(url, {
      headers: {
        'Origin': 'https://web.aoneroom.com',
        'Referer': 'https://web.aoneroom.com/',
        'User-Agent': 'Mozilla/5.5 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'lang': 'en',
        'versioncode': '11',
        'clienttype': '0'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`URL: ${url}`);
        console.log(`STATUS: ${res.statusCode}`);
        console.log(`HEADERS: ${JSON.stringify(res.headers, null, 2)}`);
        console.log(`BODY: ${data.slice(0, 200)}\n-----------------------------------`);
        resolve();
      });
    });
    req.on('error', (err) => {
      console.error(`ERROR for ${url}:`, err);
      resolve();
    });
  });
}

async function run() {
  for (const url of urls) {
    await testUrl(url);
  }
}

run();
