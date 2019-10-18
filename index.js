'use strict';
const http = require('http');
const pug = require('pug');
const auth = require('http-auth');
const basic = auth.basic(
  { realm: ' Enqutes Area' }, 
  (username, password, callback) => {
    callback(username === 'guest' && password === 'xaXZJQmE');
  });
const server = http.createServer(basic, (req, res) => {
  console.info('Requested by ' + req.connection.remoteAddress);
  if (req.url === '/logout') {
    res.writeHead(401, {
      'Content-Type': 'text/plain; charset=utf-8'
    });
    res.end('ログアウトしました。');
    return;
  }
  res.writeHead(200, {
    'Content-Type': 'text/html; charset=utf-8'
  });

  switch (req.method) {
    case 'GET':
      let firstItem = 'ラーメン';
      let secondItem = 'カレーライス';
      if (req.url === '/enquetes/yaki-shabu') {
        firstItem = '焼き肉';
        secondItem = 'しゃぶしゃぶ';
      } else if (req.url === '/enquetes/rise-bread') {
        firstItem = 'ごはん';
        secondItem = 'パン';
      } else if (req.url === '/enquetes/sushi-pizza') {
        firstItem = 'お寿司';
        secondItem = 'ピザ';
      }
      res.write(pug.renderFile('./form.pug', {
        path: req.url,
        firstItem: firstItem,
        secondItem: secondItem
      }));
      res.end();
      break;
    case 'POST':
      let body = [];
      req.on('data', (chunk) => {
        body.push(chunk);
      }).on('end', () => {
        body = Buffer.concat(body).toString();
        const decoded = decodeURIComponent(body);
        console.info('投稿: ' + decoded);
        res.write('<!DOCTYPE html><html lang="ja"><head><meta charset="utf-8"></head><body><h1>' +
          decoded + 'が投稿されました</h1></body></html>');
        res.end();
      });
      break;
    default:
      break;
  }

}).on('error', (e) => {
  console.error('Server Error', e);
}).on('clientError', (e) => {
  console.error('Client Error', e);
});
const port = process.env.PORT || 8000;
server.listen(port, () => {
  console.info('Listening on ' + port);
});
