import https from 'https';

const testCases = [
  { host: 'h5-api.aoneroom.com', path: '/wefeed-h5api-bff/everyone-search?keyword=action' },
  { host: 'api.aoneroom.com', path: '/wefeed-h5api-bff/everyone-search?keyword=action' },
  { host: 'h5-api.aoneroom.com', path: '/everyone-search?keyword=action' },
  { host: 'api.aoneroom.com', path: '/everyone-search?keyword=action' },
  { host: 'h5-api.aoneroom.com', path: '/wefeed-h5api-bff/webConfig' },
];

async function test(tc) {
  return new Promise((resolve) => {
    console.log(`Testing: https://${tc.host}${tc.path}`);
    const req = https.get({
      hostname: tc.host,
      path: tc.path,
      headers: {
        'Origin': 'https://web.aoneroom.com',
        'Referer': 'https://web.aoneroom.com/',
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
        'lang': 'en',
        'versioncode': '11',
        'clienttype': '0',
        'deviceid': '123456789'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`STATUS: ${res.statusCode}`);
        console.log(`BODY: ${data.slice(0, 300)}\n-----------------------------------`);
        resolve();
      });
    });
    req.on('error', (err) => {
      console.error('ERROR:', err.message);
      resolve();
    });
  });
}

async function run() {
  for (const tc of testCases) {
    await test(tc);
  }
}

run();
