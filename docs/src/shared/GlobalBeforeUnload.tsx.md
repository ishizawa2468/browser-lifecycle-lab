# `src/shared/GlobalBeforeUnload.tsx`

## 役割
アプリ全体に `beforeunload` ガードを適用する薄いコンポーネント。`useGlobalBeforeUnloadDebug` フックを呼び出し、タブ閉鎖・リロード時の挙動を可視化します。

## 実装ポイント
- `useGlobalBeforeUnloadDebug(true)` を呼ぶだけのシンプルな実装。
- 本番利用ではページ単位での有効化が推奨されるため、コメントで注意喚起がなされています。

## 使用箇所
`routes/__root.tsx` 内で配置され、全ルートで共通のグローバルガードとして機能します。
