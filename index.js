'use strict';
const http = require('http');
const jade = require('jade');
const auth = require('http-auth');
const basic = auth.basic(
  { realm: 'Enter username and password.' },
  (username, password, callback) => {
    callback(username === 'shin' && password === 'shinshin');
  });
const server = http.createServer(basic, (req, res) => {
  console.info('Requested by ' + req.connection.remoteAddress);

  if (req.url === '/logout') {
    res.writeHead(401, {
      'Content-Type': 'text/plain; charset=utf-8'
    });
    res.end('ログアウトしました');
    return;
  }

  res.writeHead(200, {
    'Content-Type': 'text/html; charset=utf-8'
  });

  switch (req.method) {
    case 'GET':
      if (req.url === '/enquetes/long-short') {
        res.write(jade.renderFile('./form.jade', {
          path: req.url,
          firstItem: 'ロングヘア',
          secondItem: 'ショートヘア'
        }));
      } else if (req.url === '/enquetes/pants-skirt') {
        res.write(jade.renderFile('./form.jade', {
          path: req.url,
          firstItem: 'パンツ',
          secondItem: 'スカート'
        }));
      } else if (req.url === '/enquetes/sneaker-heel') {
        res.write(jade.renderFile('./form.jade', {
          path: req.url,
          firstItem: ' スニーカー',
          secondItem: 'ヒール'
        }));
      }
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
        res.write('<!DOCTYPE html><html lang="jp"><head><meta charset="utf-8"></head><body><h1>' +
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
