# `src/routes/__root.tsx`

## 役割
TanStack Router のルートレイアウト。全ページ共通の UI（ヘッダー、ナビゲーション、Devtools、グローバルの beforeunload 監視）を提供します。

## 主な構成
- **ナビゲーション**: `/`, `/form`, `/dashboard` へのリンクを表示。
- **`<Outlet />`**: 子ルートをレンダリング。
- **`<GlobalBeforeUnload />`**: グローバルの `beforeunload` デバッグを有効化。
- **`<TanstackDevtools />`**: React Query / Router 用の Devtools を画面左下に設置し、Router 専用パネルを組み込み。

## 補足
`createRootRoute` を用いてファイルベースルーティングに適した形でエクスポートされています。
