import https from 'https';

const url = 'https://h5-api.aoneroom.com/wefeed-h5api-bff/everyone-search';
const payload = JSON.stringify({
  keyword: 'action',
  page: 1,
  perPage: 24
});

console.log('Testing POST to:', url);
const req = https.request(url, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Origin': 'https://web.aoneroom.com',
    'Referer': 'https://web.aoneroom.com/',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'lang': 'en',
    'versioncode': '11',
    'clienttype': '0'
  }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('STATUS:', res.statusCode);
    console.log('HEADERS:', res.headers);
    console.log('BODY:', data.slice(0, 500));
  });
});

req.on('error', (err) => {
  console.error('ERROR:', err);
});

req.write(payload);
req.end();
