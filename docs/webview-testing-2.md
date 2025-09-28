# WebView 環境での検証手順

このドキュメントでは Lifecycle Lab (React + Vite) を Android / iOS の WebView で動作確認するための手順をまとめます。

> ⚠️ WebView では OS やバージョンによって挙動が異なる場合があります。実機での確認を推奨します。

---

## 0. アプリの起動方法を決める

WebView から参照する URL は大きく分けて次の 2 パターンです。

1. **ローカル開発サーバーにアクセス**
   - `npm run dev -- --host 0.0.0.0` でホストマシンの IP を公開
   - Android は `adb reverse tcp:5173 tcp:5173` などでポートフォワード、iOS は同一ネットワークに接続して IP を直接指定
2. **ビルドした静的ファイルをホスト**
   - `npm run build` → `npm run preview` (または任意の静的ホスティングへデプロイ)

開発段階では 1、最終確認では 2 を推奨します。

---

## 1. Android (WebView)

### 1-1. Android Studio でサンプルアプリを作成

1. **Empty Activity** プロジェクトを新規作成
2. `app/src/main/AndroidManifest.xml` に以下を追加
   ```xml
   <uses-permission android:name="android.permission.INTERNET" />
   <application
       ...
       android:usesCleartextTraffic="true">
   ```

   - HTTP を利用する場合は `usesCleartextTraffic` を `true` に設定
3. `MainActivity.kt` を WebView 表示用に書き換え
   ```kotlin
   class MainActivity : ComponentActivity() {
       override fun onCreate(savedInstanceState: Bundle?) {
           super.onCreate(savedInstanceState)
           setContent {
               AndroidView(factory = { context ->
                   WebView(context).apply {
                       settings.javaScriptEnabled = true
                       webViewClient = WebViewClient()
                       loadUrl("http://10.0.2.2:5173") // 開発サーバーの URL
                   }
               })
           }
       }
   }
   ```

   - エミュレーターからホスト PC のローカルサーバーへアクセスする場合は `10.0.2.2`
   - 実機の場合はホスト PC の IP アドレスに置き換え

### 1-2. デバッグ

- Chrome DevTools で WebView をデバッグ: `chrome://inspect/#devices`
- `console.log` や `window.addEventListener` で発火するイベントを確認
- スリープ→復帰、アプリ切り替えなど WebView 特有のライフサイクルを検証

---

## 2. iOS (WKWebView)

### 2-1. Xcode でサンプルアプリを作成

1. **App** テンプレート (SwiftUI) で新規プロジェクトを作成
2. `Info.plist` に以下を追加
   - `App Transport Security Settings > Allow Arbitrary Loads = YES` (開発中の HTTP 接続用)
3. `ContentView.swift` を WebView 表示用に編集

   ```swift
   import SwiftUI
   import WebKit

   struct WebView: UIViewRepresentable {
       func makeUIView(context: Context) -> WKWebView {
           let webView = WKWebView()
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

   - 実機で開発サーバーへ接続する場合は、同一ネットワーク上のホスト PC の IP に変更

### 2-2. デバッグ

- Safari の開発メニューから接続して Web Inspector を起動
- バックグラウンド遷移、画面回転など iOS 特有のイベント発火タイミングを確認

---

## 3. 共通で確認したい項目

- `beforeunload` / `pagehide` / `pageshow` / `visibilitychange` の発火順序
- バックグラウンド遷移 (ホームボタン / マルチタスク) 時のイベント
- OS の強制終了や戻る操作時の挙動
- インターネット不通時のリトライ、エラーハンドリング

必要に応じて `src/shared/DebugProvider.tsx` にイベントロギングを追加すると検証しやすくなります。

---

## 4. 小技 / Tips

- ポートフォワード: `adb reverse tcp:5173 tcp:5173`
- HTTPS が必要な場合はローカルプロキシ (mkcert など) やトンネリングサービス (ngrok 等) を利用
- WebView ごとにキャッシュクリアや user agent が異なるため、検証前にリセットすると差異を把握しやすくなります
