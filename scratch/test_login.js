import http from 'http';

const data = JSON.stringify({ email: 'admin@mydestination.com', password: 'admin123' });

const req1 = http.request({
  hostname: 'localhost',
  port: 5001,
  path: '/api/auth/admin/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
}, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => console.log('/auth/admin/login Status:', res.statusCode, 'Body:', body));
});
req1.write(data);
req1.end();

const req2 = http.request({
  hostname: 'localhost',
  port: 5001,
  path: '/api/taxi/admin/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
}, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => console.log('/taxi/admin/login Status:', res.statusCode, 'Body:', body));
});
req2.write(data);
req2.end();
