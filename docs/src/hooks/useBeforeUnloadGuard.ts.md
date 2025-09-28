# `src/hooks/useBeforeUnloadGuard.ts`

## 役割
`beforeunload` イベントを簡潔に扱うためのカスタムフック。`enabled` が `true` の間だけ離脱確認ダイアログを有効化し、`DebugProvider` にイベントを記録します。

## 実装ポイント
- React の `useEffect` を利用してイベントリスナーを登録/解除。
- `useDebug` の `add` を呼び出し、スコープ付きの `beforeunload` イベントを蓄積。
- ブラウザ標準の離脱確認を表示するため `e.returnValue = ""` を設定。

## 想定ユースケース
フォームなど未保存状態を持つ画面で、離脱時に警告を出したい場合に利用します。
