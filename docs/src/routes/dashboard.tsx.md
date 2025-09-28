# `src/routes/dashboard.tsx`

## 役割
ダッシュボードページ。可視化フックを通じてタブ操作やページ復帰時のイベントを確認するシンプルなデモ画面です。

## 主な処理
- `useVisibilityDebug("dashboard")`: ダッシュボード固有のスコープで可視状態の変化を記録。
- `usePageTransitionDebug("dashboard")`: `pagehide` / `pageshow` を監視し、ナビゲーションイベントをタイムラインへ追加。

## UI
ライフサイクルイベントの観測に集中するため、説明テキストのみの軽量なレイアウトになっています。
