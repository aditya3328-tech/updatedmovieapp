import http from 'http';

http.get('http://localhost:3000/api/everyone-search?keyword=action', (res) => {
  console.log('STATUS:', res.statusCode);
  console.log('HEADERS:', res.headers);
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('BODY LENGTH:', data.length);
    console.log('BODY:', data.slice(0, 500));
  });
}).on('error', (err) => {
  console.error('ERROR:', err);
});
