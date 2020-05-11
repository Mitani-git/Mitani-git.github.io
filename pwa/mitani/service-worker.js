self.addEventListener('install', function(e) {
  console.log('[ServiceWorker] Install');
});

self.addEventListener('activate', function(e) {
  console.log('[ServiceWorker] Activate');
});

// 現状では、この処理を書かないとService Workerが有効と判定されないようです
self.addEventListener('fetch', function(event) {});

// 以下：
// https://qiita.com/poster-keisuke/items/6651140fa20c7aa18474
// https://qiita.com/OMOIKANESAN/items/13a3dde525e33eb608ae
// キャッシュファイルの指定
var CACHE_NAME = 'pwa-sample-caches';
var urlsToCache = [
		'/mitani/pwa/index.html',
		'/mitani/pwa/icon-192.png',
		'/mitani/pwa/icon-256.png',
		'/mitani/pwa/test/index.html',
		"/mitani/pwa/test/style.css"
];
const CACHE_KEYS = [
    CACHE_NAME
  ];

// インストール処理
self.addEventListener('install', function(event) {
    console.log("install cache")
    event.waitUntil(
        caches
            .open(CACHE_NAME)
            .then(function(cache) {
                self.skipWaiting()
                return cache.addAll(urlsToCache);
            })
    );
});

// 不要なキャッシュを削除
self.addEventListener('activate', event => {
    console.log("delete cache")
    event.waitUntil(
      caches.keys().then(keys => {
        return Promise.all(
          keys.filter(key => {
            return !CACHE_KEYS.includes(key);
          }).map(key => {
            // 不要なキャッシュを削除
            return caches.delete(key);
          })
        );
      })
    );
  });


// リソースフェッチ時のキャッシュロード処理
self.addEventListener('fetch', function(event) {

    //ブラウザが回線に接続しているかをboolで返してくれる
    var online = navigator.onLine;

//回線が使えるときの処理
if(online){
    event.respondWith(
      caches.match(event.request)
        .then(
        function (response) {
          if (response) {
            return response;
          }
          //ローカルにキャッシュがあればすぐ返して終わりですが、
          //無かった場合はここで新しく取得します
          return fetch(event.request)
            .then(function(response){
              // 取得できたリソースは表示にも使うが、キャッシュにも追加しておきます
              // ただし、Responseはストリームなのでキャッシュのために使用してしまうと、ブラウザの表示で不具合が起こる(っぽい)ので、複製しましょう
              cloneResponse = response.clone();
              if(response){
                //ここ&&に修正するかもです
                if(response || response.status == 200){
                  //現行のキャッシュに追加
                  caches.open(CACHE_NAME)
                    .then(function(cache)
                    {
                      cache.put(event.request, cloneResponse)
                      .then(function(){
                        //正常にキャッシュ追加できたときの処理(必要であれば)
                      });
                    });
                }else{
                  //正常に取得できなかったときにハンドリングしてもよい
                  return response;
                }
                return response;
              }
            }).catch(function(error) {
              //デバッグ用
              return console.log(error);
            });
        })
    );
  }else{
    //オフラインのときの制御
    event.respondWith(
      caches.match(event.request)
        .then(function(response) {
          // キャッシュがあったのでそのレスポンスを返す
          if (response) {
            return response;
          }
          //オフラインでキャッシュもなかったパターン
          return caches.match("offline.html")
              .then(function(responseNodata)
              {
                //適当な変数にオフラインのときに渡すリソースを入れて返却
                //今回はoffline.htmlを返しています
                return responseNodata;
              });
        }
      )
    );
  }
});