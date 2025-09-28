# `src/hooks/usePageTransitionDebug.ts`

## 役割
`pagehide` / `pageshow` イベントを監視し、ページ遷移や Back-Forward Cache の動きを可視化するフック。`DebugProvider` を通じてトーストとタイムラインに記録します。

## 実装ポイント
- `scope` を引数として受け取り、イベント発生元を識別可能に。
- `opts.onHide`, `opts.onShow` でカスタムハンドラを差し込めるよう拡張。
- イベントオブジェクトから `persisted` フラグを取得し、BFCache の利用状況を記録。

## 使用例
フォームページでは `onHide` でドラフトを保存、`onShow` で復元するなど、可視化と実動作を同時に実現しています。
