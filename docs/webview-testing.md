# WebView 環境での検証ガイド

`browser-lifecycle-lab` を Android WebView / iOS WKWebView で検証する際の手順とポイントを 1 つのドキュメントにまとめました。ローカル開発サーバーの公開方法から、各 OS での最小実装例、デバッグ方法、トラブルシューティングまでを網羅しています。

## 前提条件

- Node.js 18 以上 / npm 10 以上
- Android Studio (または Android SDK Platform Tools)
- Xcode 15 以上
- 検証用の Android / iOS 実機またはエミュレーター
- 開発 PC と端末が同一ネットワークに接続されていること

## アプリ配信方法を選ぶ

WebView から参照する URL は次の 2 パターンが代表的です。

1. **ローカル開発サーバーを参照**
   - `npm run dev -- --host 0.0.0.0` で Vite サーバーを LAN に公開
   - Android 実機では `adb reverse tcp:5173 tcp:5173` などでポートフォワード可能
   - iOS 実機は同一ネットワーク上の開発 PC の IP を指定、あるいはトンネル (ngrok 等) を利用
2. **ビルド済みファイルをホスト / バンドル**
   - `npm run build` → `npm run preview -- --host 0.0.0.0` で静的ファイルを提供
   - 任意の静的サーバー (`npx serve dist --listen 0.0.0.0:4173` など) で配信
   - オフライン確認が必要な場合はモバイルアプリに `dist` をバンドル

開発段階では 1、最終確認やストア審査想定では 2 を推奨します。

## ローカル開発サーバーを起動する

```bash
npm install
npm run dev
```

`npm run dev` は Vite を `--host` オプション付きで起動するため、LAN 内から `http://<開発PCのIP>:5173` (または 3000) でアクセスできます。ポート番号は `vite.config.ts` や `package.json` の設定に合わせて調整してください。

> **TIP:** 端末が VPN を経由している場合、ローカルネットワークへのアクセスが遮断されることがあります。同じ Wi-Fi または USB デバッグ経由で接続してください。

本番ビルドを検証したい場合は以下を実行し、WebView 側の URL も合わせて変更します。

```bash
npm run build
npm run serve -- --host 0.0.0.0 --port 4173
```

## Android (WebView)

### クイック確認: WebView Shell

Android SDK 付属の [`WebView Shell`](https://chromium.googlesource.com/chromium/src/+/HEAD/android_webview/docs/webview_shell.md) を使うと、最小 UI でページを読み込めます。

```bash
adb install path/to/webview-shell.apk
adb reverse tcp:5173 tcp:5173 # USB のみで接続する場合
adb shell am start -n org.chromium.webview_shell/.WebViewBrowserActivity \
  -a android.intent.action.VIEW \
  -d "http://<開発PCのIP>:5173"
```

Chrome の `chrome://inspect/#devices` から DevTools を開いてデバッグできます。

### サンプルアプリの作成

1. Android Studio で「Empty Activity」や「Empty Views Activity」プロジェクトを作成
2. `AndroidManifest.xml` に以下を追加 (HTTP 利用時)
   ```xml
   <uses-permission android:name="android.permission.INTERNET" />
   <application
       ...
       android:usesCleartextTraffic="true">
   ```
3. レイアウトとコードは好みの UI フレームワークに合わせて準備

#### XML レイアウト + Activity の例
```kotlin
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        WebView.setWebContentsDebuggingEnabled(true)

        val webView = findViewById<WebView>(R.id.webview)
        with(webView.settings) {
            javaScriptEnabled = true
            domStorageEnabled = true
            cacheMode = WebSettings.LOAD_NO_CACHE
        }
        webView.loadUrl("http://<PCのIP>:5173")
    }
}
```

#### Jetpack Compose + AndroidView の例
```kotlin
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            AndroidView(factory = { context ->
                WebView(context).apply {
                    settings.javaScriptEnabled = true
                    settings.domStorageEnabled = true
                    webViewClient = WebViewClient()
                    loadUrl("http://10.0.2.2:5173") // エミュレーターからアクセスする場合
                }
            })
        }
    }
}
```

- エミュレーターからホスト PC のローカルサーバーへは `http://10.0.2.2:<port>` を利用
- 実機では開発 PC の IP アドレスに置き換え、`adb reverse` を併用すると USB 経由でもアクセス可能
- `setDomStorageEnabled(true)` を設定すると `localStorage` が利用できます
- `adb logcat` を活用して WebView 側のログを確認できます

### ビルド済みファイルをバンドル (オフライン検証)

1. `npm run build` の結果 `dist` を `app/src/main/assets` にコピー
2. `webView.loadUrl("file:///android_asset/index.html")` で読み込み
3. 付随するアセットも `dist` 構造のまま配置し、必要なら `AssetManager` を利用

## iOS (WKWebView)

### プロジェクト作成と設定

1. Xcode で「App」テンプレート (SwiftUI / UIKit いずれも可) から新規プロジェクト作成
2. HTTP 接続を許可する場合は `Info.plist` に App Transport Security (ATS) の例外を追加
   ```xml
   <key>NSAppTransportSecurity</key>
   <dict>
     <key>NSAllowsArbitraryLoads</key>
     <true/>
   </dict>
   ```
3. iOS 14 以降の実機ではローカルネットワークアクセス許可ダイアログが表示されるため、拒否された場合は端末設定から再許可

### SwiftUI での実装例
```swift
import SwiftUI
import WebKit

struct WebView: UIViewRepresentable {
    func makeUIView(context: Context) -> WKWebView {
        let webView = WKWebView()
        webView.customUserAgent = "LifecycleLab/1.0"
        if let url = URL(string: "http://localhost:5173") {
            webView.load(URLRequest(url: url))
        }
        return webView
    }

    func updateUIView(_ uiView: WKWebView, context: Context) {}
}

struct ContentView: View {
    var body: some View {
        WebView()
    }
}
```

### UIKit での最小 ViewController
```swift
import UIKit
import WebKit

class LifecycleLabViewController: UIViewController {
    private let webView = WKWebView(frame: .zero)

    override func viewDidLoad() {
        super.viewDidLoad()
        view = webView

        let url = URL(string: "http://<開発PCのIP>:5173")!
        webView.load(URLRequest(url: url))
    }
}
```

- シミュレーターは Mac 上で動作するため `http://localhost:<port>` に直接アクセスできます
- 実機は開発 PC の IP を指定、USB 接続時に `ios_webkit_debug_proxy` などでトンネルを張ることも可能
- Safari の **開発** メニューから該当デバイス > WKWebView を選択すると Web Inspector でデバッグできます

### ビルド済みファイルのバンドル

1. `dist` フォルダーを Xcode プロジェクトに追加し、Copy resources にチェック
2. ローカル HTML を読み込む場合
   ```swift
   if let url = Bundle.main.url(forResource: "index", withExtension: "html", subdirectory: "dist") {
       webView.loadFileURL(url, allowingReadAccessTo: url.deletingLastPathComponent())
   }
   ```
3. `/assets` 配下などの相対パスが保持されるようにフォルダー構造を維持

## 共通で確認したいイベント / シナリオ

- `beforeunload` / `pagehide` / `pageshow` / `visibilitychange` などの発火順序
- バックグラウンド遷移 (ホームボタン / マルチタスク) や画面回転時の挙動
- OS の強制終了、戻る操作による状態遷移
- ネットワーク切断・復帰時のリトライ挙動、エラーハンドリング
- 必要に応じて `src/shared/DebugProvider.tsx` などにロギングを追加して差分を把握

## トラブルシューティング & Tips

| 症状 / 観点 | 原因・補足 | 対処 |
| --- | --- | --- |
| 画面が真っ白になる | HTTPS 強制、ATS 制限 | 一時的に `https://` を使用、ATS 例外やローカル証明書を設定 |
| Fetch が失敗する | CORS / Mixed Content | API 側で HTTPS 化、CORS 設定、ローカルプロキシの利用 |
| `beforeunload` が発火しない | WebView の仕様差 | Android では `onPause`/`onStop` をフックしてネイティブ連携 |
| ローカルネットワークに接続不可 | 許可ダイアログの拒否 / VPN 経由 | 端末設定で許可を再設定、VPN を切る |

## 参考リンク

- [Chrome Remote Debugging WebViews](https://developer.chrome.com/docs/devtools/remote-debugging/webviews/)
- [Android WebView ドキュメント](https://developer.android.com/guide/webapps/webview)
- [iOS WKWebView ドキュメント](https://developer.apple.com/documentation/webkit/wkwebview)
- [Safari Web Inspector](https://developer.apple.com/safari/tools/#inspector)
