'use strict';
const http = require('http');
const pug = require('pug');
const auth = require('http-auth');
const basic = auth.basic(
  { realm: 'Enquetes Area.' },
  (username, password, callback) => {
    callback(username === 'guest' && password === 'xaXZJQmE');
  });
const server = http.createServer(basic, (req, res) => {
  console.info('Requested by ' + req.connection.remoteAddress);

  if (req.url === '/logout') {
    res.writeHead(401, {
      'Content-Type': 'text/plain; charset=utf-8'
    });
    //console.debug('私のchromeブラウザでは表示されませんがsafariならログアウトが表示されます');
    res.end('ログアウトしました');
    return;
  }

  function resWrite(firstItem,secondItem)
  {
    res.write(pug.renderFile('./form.pug', {
      path: req.url,
      firstItem: firstItem,
      secondItem: secondItem
    }));
    res.end();
  }

  res.writeHead(200, {
    'Content-Type': 'text/html; charset=utf-8'
  });


  switch (req.method) {
    case 'GET':
      switch ( req.url){
        case '/enquetes/yaki-shabu':
          resWrite('焼き肉','しゃぶしゃぶ');
          break;
        case '/enquetes/rice-bread':
          resWrite('ごはん','パン');
          break;
        case '/':
          resWrite('XBOX0ne','PS4');
          break;
        case '/enquetes/sushi-pizza':
          resWrite('寿司','ピザ');
          break;
      }
      res.end();
      break;
    case 'POST':
      let rawData = '';
      req.on('data', (chunk) => {
        rawData = rawData + chunk;
      }).on('end', () => {
        const decoded = decodeURIComponent(rawData);
        console.info('[' + now + '] 投稿: ' + decoded);
        res.write('<!DOCTYPE html><html lang="ja"><body><h1>' +
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