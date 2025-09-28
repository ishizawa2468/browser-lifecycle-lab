# Browser Lifecycle Lab リポジトリ概要

## プロジェクトの目的

Browser Lifecycle Lab は、ブラウザのライフサイクルイベント（`beforeunload`、`pagehide`、`pageshow`、`visibilitychange` など）を体験的に学ぶための検証用アプリです。TanStack Router を用いた SPA で、フォーム操作や画面遷移を通じて各種イベントの発火タイミングを確認できます。

## 技術スタック

- **ビルド/開発基盤**: Vite + TypeScript
- **UI ライブラリ**: React
- **ルーティング**: TanStack Router（ファイルベースルーティング）
- **デバッグツール**: TanStack Router Devtools / TanStack Devtools

開発サーバーの起動 (`npm run start`)、本番ビルド (`npm run build`)、テスト (`npm run test`) といったコマンドはプロジェクトルートの `README.md` に記載されています。

## 画面構成と主な機能

- **`/` (Home)**: 学習手順のガイドを表示します。フォームで未保存状態を作り、SPA 内遷移やブラウザ操作でイベント挙動を確認するフローを案内しています。
- **`/form` (Form Hooks)**: 入力欄で未保存状態を作ると、SPA 内遷移時のモーダル表示や `beforeunload` による離脱警告を体験できます。`useUnsavedNavigationBlocker` などのカスタムフックを通じて、`sessionStorage` にドラフトを保存したり、可視性・ページ遷移イベントをログへ追加します。
- **`/dashboard` (Dashboard Hooks)**: ブラウザの戻る/進む、タブ切り替え、最小化/復帰といった操作で発火する可視性・ページ遷移イベントをトーストとタイムラインで可視化します。

## ライフサイクルイベントの可視化

`DebugProvider` コンポーネントがグローバルなイベントログとトースト通知を提供します。`useVisibilityDebug` や `usePageTransitionDebug` などのフックは、イベント内容を `DebugProvider` に送信して、画面右側のタイムラインとトーストを更新します。`GlobalBeforeUnload` は `beforeunload` ハンドラを共通化し、未保存データがある場合にブラウザの離脱確認ダイアログを表示します。

## ディレクトリガイド

- `src/routes/`: ページ単位のコンポーネント。`__root.tsx` が共通レイアウトとナビゲーションを提供します。
- `src/hooks/`: ライフサイクルイベントを扱うカスタムフック群。
- `src/shared/`: `DebugProvider` や `GlobalBeforeUnload` など、画面全体で共有するコンポーネントを配置しています。
- `docs/`: この概要ドキュメントや、検証メモを保存するディレクトリです。

## 開発のヒント

1. 新しいシナリオを追加する際は、`src/routes/` にページを追加し、必要なイベントをフックで取得してください。
2. 共通のイベントロギングが必要な場合は、既存のフックを拡張するか `DebugProvider` に新しいイベントタイプを追加します。
3. イベントの再現性を保つため、フォームやコンポーネントではドラフト保存やリセット操作を明示的に実装しておくと便利です。
