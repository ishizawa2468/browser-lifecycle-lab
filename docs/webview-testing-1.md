# WebView 環境での検証ガイド

このドキュメントでは、Lifecycle Lab を Android WebView と iOS WKWebView で検証するための手順を説明します。ローカル開発サーバーへの接続方法、デバッグのコツ、モバイルアプリ側の最小実装例をまとめています。

## 前提条件

- Node.js 18 以上
- npm 10 以上
- Android Studio (または Android SDK Platform Tools)
- Xcode 15 以上
- 同一ネットワーク上にある Mac / PC とテスト端末

## 1. ローカル開発サーバーを起動する

Android / iOS どちらの WebView でも、まずはアプリを配信する HTTP サーバーが必要です。

```bash
npm install
npm run dev
```

`npm run dev` スクリプトは Vite を `--host` オプション付きで起動します。これにより LAN 内から `http://<開発PCのIP>:3000` へアクセスできます。

> **TIP:** 実機が同じ Wi-Fi に接続されていることを確認してください。VPN 経由の場合はローカルネットワークアクセスが遮断されることがあります。

## 2. Android WebView での検証

### 2-1. WebView Shell (簡易確認)

Android SDK に含まれる [`WebView Shell`](https://chromium.googlesource.com/chromium/src/+/HEAD/android_webview/docs/webview_shell.md) を利用すると、最低限の UI で素早く検証できます。

```bash
adb install path/to/webview-shell.apk
adb shell am start -n org.chromium.webview_shell/.WebViewBrowserActivity \
  -a android.intent.action.VIEW \
  -d "http://<開発PCのIP>:3000"
```

- `adb reverse tcp:3000 tcp:3000` を実行すれば USB 接続のみでもアクセス可能です。
- デバッグは `chrome://inspect/#devices` で Chrome DevTools から行えます。

### 2-2. 最小 WebView Activity

独自アプリで組み込む場合は、以下のような Activity を用意します。

```kotlin
class LifecycleLabActivity : AppCompatActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    val webView = WebView(this)
    setContentView(webView)

    webView.settings.javaScriptEnabled = true
    webView.webViewClient = WebViewClient()
    webView.loadUrl("http://<開発PCのIP>:3000")
  }
}
```

- `setDomStorageEnabled(true)` を有効にすると localStorage が利用できます。
- 実機デバッグは USB デバッグを有効化し、`adb logcat` でログを確認します。

## 3. iOS WKWebView での検証

### 3-1. WKWebView を使った最小 ViewController

```swift
import UIKit
import WebKit

class LifecycleLabViewController: UIViewController {
    private let webView = WKWebView(frame: .zero)

    override func viewDidLoad() {
        super.viewDidLoad()
        view = webView

        let url = URL(string: "http://<開発PCのIP>:3000")!
        webView.load(URLRequest(url: url))
    }
}
```

- `NSAppTransportSecurity` の `NSAllowsArbitraryLoads` を `true` に設定すると HTTP 接続を許可できます。HTTPS を使う場合は不要です。
- Safari の **開発** メニューから該当デバイス > WKWebView を選択すると、Safari Web Inspector でデバッグできます。

### 3-2. ローカルビルドを反映する

- シミュレーターを使用する場合、Mac 上で動いているため `http://localhost:3000` に直接アクセスできます。
- 実機の場合は、開発機の IP アドレスを指定するか、USB 接続で `ios_webkit_debug_proxy` を利用してトンネルを張ります。

## 4. よくあるトラブルシューティング

| 症状                        | 原因                 | 対処                                                           |
| --------------------------- | -------------------- | -------------------------------------------------------------- |
| 画面が真っ白                | HTTPS 必須の設定     | 一時的に `https://` を使用するか、ATS 例外を追加する           |
| Fetch が失敗                | CORS / Mixed Content | API 側を HTTPS 化する、あるいはローカルプロキシを使用する      |
| `beforeunload` が発火しない | WebView の仕様       | Android では `onPause`/`onStop` をフックしてネイティブ連携する |

## 5. 本番ビルドを確認する

Vite の本番ビルドを確認したい場合は、以下を実行します。

```bash
npm run build
npm run serve -- --host 0.0.0.0 --port 4173
```

ポート番号に合わせて WebView 側の URL も更新してください。

---

これで Android / iOS どちらの WebView でも Lifecycle Lab の挙動を確認できます。WebView 固有の制限 (ストレージ、ファイルアクセス、バックグラウンド動作など) がある場合は、ネイティブ側のハンドリングも検討してください。
