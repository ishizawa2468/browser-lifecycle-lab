# `src/routeTree.gen.ts`

## 役割
TanStack Router のファイルベースルーティングから自動生成されるルート定義。`main.tsx` でルーターを構築する際のソースとなり、`routes` ディレクトリの各ルートコンポーネントと紐づきます。

## 注意事項
- 自動生成ファイルのため手動編集は不要/非推奨。
- ESLint チェックやフォーマッタから除外する前提でコメントが付与されています。

## 主な内容
- `/`, `/form`, `/dashboard` 各ルートの `Route` インスタンスを生成。
- ルーティングに関する TypeScript 型 (`FileRoutesByFullPath` など) をエクスポート。
- `routeTree` を構築し、`createRouter` で利用できる形に加工。
