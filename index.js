// strict記法設定
'use strict';
// httpモジュール呼び出し
const http = require('http');
// jadeモジュール呼び出し
const jade = require('jade');
// BASIC認証のためのhttp-authモジュール呼び出し
const auth = require('http-auth');
/**
 * BASIC認証に関する設定。
 * realm: Basic認証時に保護する領域を規定する文字列。
 */
const basicOptions = { realm: 'Enter username and password.' };
/**
 * ユーザー名とパスワードが適合するかチェックして、
 * その結果（真偽値）を引数として与えたコールバック関数の返り値を返す関数
 * @param {string} username - ユーザー名
 * @param {string} password - パスワード
 * @param {function} callback - コールバック関数（中身は気にしないで良さげ）
 */
const checker = function (username, password, callback) {
  return callback(isPassOK(username, password));
}
/**
 * ユーザー名とパスワードが適合するかチェックする関数
 * @param {string} username - ユーザー名
 * @param {string} password - パスワード
 */
function isPassOK(username, password) {
  if (username === 'guest' && password === 'xaXZJQmE')
    return true;
  else
    return false;
}
/**
 * http-auth.basic()関数でベーシック認証の準備をする
 * 第一引数：BASIC認証に関する設定
 * 第二引数：ユーザー名とパスワードが適合するかチェックして、その結果（真偽値）を引数として与えたコールバック関数の返り値を返す関数
 */
const basic = auth.basic(basicOptions, checker);
/**
 * サーバーにリクエストがあったときに実行する関数
 * @param {http.IncomingMessage} req 
 * @param {http.ServerResponse} res 
 */
const respondToRequest = function (req, res) {
  /**
   * アクセス元のIPアドレスを標準出力へ書き出す
   */
  console.info('Requested by ' + req.connection.remoteAddress);
  /**
   * /logoutにアクセスした時にログアウト処理を行うようにする
   */
  if (req.url === '/logout') {
    /**
     * ログアウトするときのヘッダのContent-Typeを設定し、ヘッダに書き込む
     */
    let header = { 'Content-Type': 'text/plain; charset=utf-8' };
    res.writeHead(401, header);
    /**
     * レスポンスの書き出しを終了する
     */
    res.end('ログアウトしました');
    return;
  }
  /**
   * Content-Typeを設定し、ヘッダに書き込む
   */
  let header = { 'Content-Type': 'text/html; charset=utf-8' };
  res.writeHead(200, header);
  /**
   * 呼び出されたHTTPメソッドによって処理を分岐する
   */
  switch (req.method) {
    case 'GET':
      /**
       * Responseに書き出すHTML
       */
      let resHtml;
      /**
       * jade.rederFile関数の引数として使用するオプション。（埋め込み変数の設定）
       */
      let jadeOptions;
      /**
       * jade.renderFile関数のオプションを設定する関数。
       * ここでは選択肢を２つ設定する
       * @param {*} firstItem - ひとつめの選択肢
       * @param {*} secondItem  - ふたつめの選択肢
       */
      function setJadeOptions(firstItem, secondItem) {
        jadeOptions = {
          path: req.url,
          firstItem: firstItem,
          secondItem: secondItem
        };
      }
      /**
       * GETメソッドの呼び出し元URLによって処理を分岐する
       */
      if (req.url === '/enquetes/yaki-shabu') {
        setJadeOptions('焼き肉', 'しゃぶしゃぶ');
      } else if (req.url === '/enquetes/rice-bread') {
        setJadeOptions('ご飯', 'パン')
      } else if (req.url === '/enquetes/sushi-pizza') {
        setJadeOptions('寿司', 'ピザ');
      }
      /**
       * jade.renderFile関数でjadeファイルをHTMLに変換する
       */
      resHtml = jade.renderFile('./form.jade', jadeOptions);
      /**
       * jadeファイルから変換したHTMLを書き出す
       */
      res.write(resHtml);
      /**
       * 書き出し終了
       */
      res.end();
      break;
    /**
     * submitボタンが押されるとPOSTのHTMLメソッドが呼び出される
     */
    case 'POST':
      /**
       * 送信されたデータを受け取る配列
       */
      let body = [];
      /**
       * 受け取った文字列をbodyに格納する関数
       * serverResponseのdataイベントに設定する
       * @param {string} chunk 
       */
      let addDataToBody = function (chunk) {
        body.push(chunk);
      };
      /**
       * serverResponseのdataイベントにaddDataToBody関数を設定する
       */
      req.on('data', addDataToBody);
      /**
       * bodyに格納されている文字列の配列を結合およびURIデコードしてserverResponseに書き出す関数
       * serverResponseのendイベントに設定する
       */
      let writeDataToResponse = function () {
        body = Buffer.concat(body).toString();
        const decoded = decodeURIComponent(body);
        console.info('投稿: ' + decoded);
        res.write('<!DOCTYPE html><html lang="jp"><head><meta charset="utf-8"></head><body><h1>' +
          decoded + 'が投稿されました</h1></body></html>');
        res.end();
      };
      /**
       * serverResponseのendイベントにwriteDataToResponse関数を設定する（データを全て受け取った時点で処理が実行される）
       */
      req.on('end', writeDataToResponse);
      break;
    default:
      break;
  }
}
/**
 * BASIC認証に対応したサーバーを作成する
 * 第一引数：BASIC認証(Baseインスタンス？)
 * 第二引数：サーバーにリクエストがあったときに実行する関数
 */
const server = http.createServer(basic, respondToRequest);
/**
 * serverインスタンスにエラー時のイベントを登録する
 */
server.on('error', function (e) { console.error('Server Error', e); });
server.on('clientError', function (e) { console.error('Client Error', e); });
/**
 * 待機するポート番号の設定（設定していない場合は8000を使う）
 */
const port = process.env.PORT || 8000;
/**
 * サーバーを立ち上げる。
 * 第一引数：ポート番号
 * 第二引数：サーバー立ち上げ時に実行される関数
 */
server.listen(port, function () { console.info('Listening on ' + port); });
