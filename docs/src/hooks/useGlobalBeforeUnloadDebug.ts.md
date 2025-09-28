# `src/hooks/useGlobalBeforeUnloadDebug.ts`

## 役割
`useBeforeUnloadGuard` をグローバルスコープでラップしたユーティリティフック。アプリ全体で `beforeunload` イベントを監視・記録したい場合に利用します。

## 実装ポイント
- 内部で `useBeforeUnloadGuard(enabled, "global")` を呼び出すだけの薄いラッパー。
- スコープ名を固定することで、タイムライン上でグローバルイベントを判別しやすくしています。

## 使用例
`<GlobalBeforeUnload />` コンポーネントから呼び出され、全ページ共通のガードとして働きます。
