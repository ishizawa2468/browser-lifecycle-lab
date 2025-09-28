# `src/main.tsx`

## 役割
React アプリケーションのエントリーポイント。TanStack Router で生成したルートツリーを基にルーターを初期化し、`DebugProvider` を通してライフサイクル可視化を有効化した上でアプリを描画します。

## 主な処理
1. **ルーター生成**: `createRouter` に `routeTree` と各種プリロード・スクロール設定を渡して SPA ナビゲーションを制御します。
2. **型補完の登録**: `declare module` により生成したルーター型を React Router のコンテキストに共有します。
3. **レンダリング**: `StrictMode` と `DebugProvider` にラップした `RouterProvider` を `#app` 要素へマウント。
4. **パフォーマンス計測**: `reportWebVitals()` を呼び出し、必要に応じて Web Vitals 収集を実行できるようにします。

## 関連ファイル
- `routeTree.gen.ts`: ルーティング定義の自動生成コード。
- `shared/DebugProvider.tsx`: ライフサイクルイベントの収集と表示を担うコンテキスト。
- `styles.css`: 全体スタイルを適用。
