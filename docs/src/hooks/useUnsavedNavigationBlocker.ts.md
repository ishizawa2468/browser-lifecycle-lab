# `src/hooks/useUnsavedNavigationBlocker.ts`

## 役割
TanStack Router の `useBlocker` を「未保存データのブロック」用途に最適化したラッパーフック。SPA 内遷移と `beforeunload` をまとめてガードします。

## 実装ポイント
- `shouldBlockFn`: `isDirty` が `true` のときのみブロック。
- `withResolver: true`: カスタムモーダルを表示し、ユーザー選択に応じて遷移を制御。
- `enableBeforeUnload: isDirty`: ブラウザ離脱操作も同じ条件で抑止。

## 戻り値
`useBlocker` が返すブロッカーオブジェクトをそのまま返却するため、`status`, `proceed`, `reset` などのメソッドを利用できます。
