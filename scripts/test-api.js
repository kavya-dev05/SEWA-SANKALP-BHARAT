const data = JSON.stringify({ item: "blankets", qty: 10, loc: "kanpur", causes: ["Child welfare"] });
const req = require('http').request('http://localhost:3000/api/match-ngos', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Content-Length': data.length }
}, (res) => {
  let str = '';
  res.on('data', chunk => str += chunk);
  res.on('end', () => console.log('Response:', str));
});
req.write(data);
req.end();
