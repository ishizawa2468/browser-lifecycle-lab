# WebView での動作確認ガイド

このドキュメントでは、`browser-lifecycle-lab` をモバイル WebView（Android / iOS）上で検証するための手順を整理します。基本的には Vite 開発サーバーを端末から参照する方法と、ビルド済みの成果物をアプリに組み込む方法の 2 つがあります。

## 共通準備

1. 依存関係のインストールとビルド
   ```bash
   npm install
   npm run build
   ```
2. 端末が参照できるホストで静的ファイルを提供します。開発段階では以下いずれかを利用します。
   - `npm run dev -- --host 0.0.0.0` で LAN 内からアクセスできる Vite サーバーを起動
   - `npm run preview -- --host 0.0.0.0` でビルド済みファイルを提供
   - `npx serve dist --listen 0.0.0.0:4173` など任意の静的サーバー
3. 実機/エミュレータが PC と同一ネットワークに接続されていることを確認し、PC のローカル IP を控えます。
4. HTTPS が必須の環境ではローカル証明書の信頼設定が必要になるため、開発中は HTTP を許容する設定を入れておきます。

---

## Android（WebView）

### 1. サンプルアプリの作成

1. Android Studio で「Empty Views Activity」など任意のテンプレートからプロジェクトを作成します。
2. `app/src/main/AndroidManifest.xml` に以下を追加し、HTTP 通信を許可します。
   ```xml
   <application
       ...
       android:usesCleartextTraffic="true">
   ```
3. `app/src/main/res/layout/activity_main.xml` を WebView のみのレイアウトに差し替えます。
   ```xml
   <?xml version="1.0" encoding="utf-8"?>
   <WebView xmlns:android="http://schemas.android.com/apk/res/android"
       android:id="@+id/webview"
       android:layout_width="match_parent"
       android:layout_height="match_parent" />
   ```

### 2. WebView の初期化

`MainActivity.kt`（または Java）で WebView を初期化し、PC のローカル IP を指す URL を読み込みます。

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
        webView.loadUrl("http://<PC の IP>:5173")
    }
}
```

- `setWebContentsDebuggingEnabled(true)` を有効にすると、Chrome の [Remote Debugging](https://developer.chrome.com/docs/devtools/remote-debugging/webviews/) で WebView 内のページを検証できます。
- 実機で HTTPS が必要な場合は `https://` でアクセスできるようトンネル（`ngrok` など）を利用します。

### 3. ビルド済みファイルの組み込み（オフライン確認）

1. `npm run build` で生成された `dist` ディレクトリを `app/src/main/assets` へコピーします。
2. `webView.loadUrl("file:///android_asset/index.html")` としてオフラインでも確認できます。
3. リソースをまとめる場合は [AssetManager](https://developer.android.com/reference/android/content/res/AssetManager) を利用するか、Zip を展開します。

---

## iOS（WKWebView）

### 1. プロジェクト作成と設定

1. Xcode で「App」テンプレートから SwiftUI または UIKit プロジェクトを作成します。
2. HTTP を許可する場合、`Info.plist` に App Transport Security の例外を追加します。
   ```xml
   <key>NSAppTransportSecurity</key>
   <dict>
     <key>NSAllowsArbitraryLoads</key>
     <true/>
   </dict>
   ```

### 2. WKWebView のホスト

SwiftUI の例：

```swift
import SwiftUI
import WebKit

struct ContentView: UIViewRepresentable {
    func makeUIView(context: Context) -> WKWebView {
        let webView = WKWebView()
        webView.customUserAgent = "LifecycleLab/1.0"
        webView.configuration.preferences.javaScriptEnabled = true

        if let url = URL(string: "http://<PC の IP>:5173") {
            webView.load(URLRequest(url: url))
        }
        return webView
    }

    func updateUIView(_ uiView: WKWebView, context: Context) {}
}
```

- UIKit の場合も `WKWebView` を配置して同様に `load` してください。
- Safari の [Web Inspector](https://developer.apple.com/safari/tools/#inspector) を利用するには、iOS 端末側で「設定」→「Safari」→「詳細」→「Web インスペクタ」をオンにし、Mac の Safari で対象デバイスを選択します。

### 3. ビルド済みファイルのバンドル

1. `npm run build` の結果 (`dist` フォルダ) を Xcode プロジェクトにドラッグ＆ドロップし、Copy resources に追加します。
2. `WKWebView` に対してローカル HTML を読み込む場合は、`Bundle.main.url(forResource: "index", withExtension: "html", subdirectory: "dist")` を指定して `loadFileURL(_:allowingReadAccessTo:)` を呼び出します。
3. 相対パスのアセット（`/assets/...`）もバンドルされるようにフォルダ構造を維持してください。

---

## トラブルシューティング

- **CORS / Mixed Content**: WebView では HTTPS 強制や Mixed Content ブロックが働くことがあります。必要に応じて HTTPS 化や API 側の CORS 設定を調整してください。
- **ローカルネットワーク許可**: iOS 14+ の実機では、初回アクセス時にローカルネットワーク利用の許可ダイアログが表示されます。拒否された場合は端末の設定から再許可が必要です。
- **画面遷移の挙動差分**: WebView はブラウザとセッション管理やヒストリ挙動が異なることがあります。`pageshow`/`pagehide` などのイベントログで違いを把握してください。

---

## 参考リンク

- [Chrome Remote Debugging WebViews](https://developer.chrome.com/docs/devtools/remote-debugging/webviews/)
- [Android WebView ドキュメント](https://developer.android.com/guide/webapps/webview)
- [iOS WKWebView ドキュメント](https://developer.apple.com/documentation/webkit/wkwebview)
- [Safari Web Inspector](https://developer.apple.com/safari/tools/#inspector)
