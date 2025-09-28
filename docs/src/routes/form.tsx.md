# `src/routes/form.tsx`

## 役割
未保存フォームの離脱ガードや可視化デバッグを体験するためのページ。複数のカスタムフックを組み合わせ、SPA 内遷移・ページリロード・タブ操作時の挙動を確認できます。

## 主な機能
- **フォーム状態管理**: `title`, `body` の 2 つの入力を `useState` で管理し、未保存状態 (`isDirty`) を判定。
- **ライフサイクル観測**:
  - `useVisibilityDebug("form")`: タブ表示状態の変化を記録。
  - `usePageTransitionDebug("form", ...)`: `pagehide` でドラフト保存、`pageshow` で復元。
- **離脱ガード**: `useUnsavedNavigationBlocker(isDirty)` でナビゲーションを制御し、ブロック時はモーダルを表示。
- **ドラフト操作**: `localStorage` / `sessionStorage` を使った保存・復元サンプル。

## UI
- 保存/リセットボタン、外部サイトへのリンク、カスタムモーダルなど、ユーザー操作で各イベントを体験できる構成です。
