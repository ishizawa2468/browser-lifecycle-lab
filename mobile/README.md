# モバイル WebView 検証用プロジェクト

docs に記載されている Android / iOS での WebView 検証手順を、このリポジトリ内で再利用しやすいようにフォルダ構成としてまとめたものです。

- [`android/`](./android/): Android Studio で読み込めるシンプルな WebView Activity サンプル。
- [`ios/`](./ios/): Xcode で利用する WKWebView サンプル。

いずれのプロジェクトも、`npm run dev -- --host` で起動したローカルサーバーへアクセスする構成を前提としています。
