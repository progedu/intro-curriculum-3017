'use strict';
let http = require('http');
let jade = require('jade');
let auth = require('http-auth');
let basic = auth.basic(
  { realm: 'Enter username and password.' },
  (username, password, callback) => {
    callback(username === 'guest' && password === 'xaXZJQmE');
  });
let server = http.createServer(basic, (req, res) => {
  console.info('Requested by ' + req.connection.remoteAddress);
    
  if (req.url === '/logout') {
    res.writeHead(401, {
      'Content-Type': 'text/plain',
      'charset': 'utf-8'
    });
    res.end('ログアウトしました');
    return;
  }
  
  res.writeHead(200, {
    'Content-Type': 'text/html',
    'charset': 'utf-8'
  });

  switch (req.method) {
    case 'GET':
      if (req.url === '/enquetes/yaki-shabu') {
        res.write(jade.renderFile('./form.jade', {
          path: req.url,
          firstItem: '焼き肉',
          secondImtem: 'しゃぶしゃぶ'
        }));
      } else if (req.url === '/enquetes/rice-bread') {
        res.write(jade.renderFile('./form.jade', {
          path: req.url,
          firstItem: 'ごはん',
          secondImtem: 'パン'
        }));
      } else if (req.url === '/enquetes/sushi-pizza') {
        res.write(jade.renderFile('./form.jade', {
          path: req.url,
          firstItem: '寿司',
          secondImtem: 'ピザ'
        }));
      }
      res.end();
      break;
    case 'POST':
      req.on('data', (data) => {
        let decoded = decodeURIComponent(data);
        console.info('投稿: ' + decoded);
        res.write('<!DOCTYPE html><html lang="jp"><body><h1>' +
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
let port = process.env.PORT || 8000;
server.listen(port, () => {
  console.info('Listening on ' + port);
});
