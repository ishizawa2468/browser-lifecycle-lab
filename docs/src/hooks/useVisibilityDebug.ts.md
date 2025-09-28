# `src/hooks/useVisibilityDebug.ts`

## 役割
`document.visibilityState` の変化を監視し、タブのアクティブ/非アクティブ切り替えなどのイベントを記録するフック。

## 実装ポイント
- `visibilitychange` イベントにリスナーを登録し、発生時に `useDebug` の `add` を呼び出します。
- イベント詳細には現在の `visibilityState` を含め、タイムラインで状態遷移を確認できるようにしています。
- クリーンアップでリスナーを確実に解除。

## 使用例
`/form`, `/dashboard` の各ページで呼び出し、ページスコープごとの可視状態をトースト＆タイムラインで確認できます。
