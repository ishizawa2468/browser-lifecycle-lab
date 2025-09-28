# `src/reportWebVitals.ts`

## 役割
必要に応じて [Web Vitals](https://web.dev/vitals/) メトリクスを遅延ロードで取得するヘルパー関数。`main.tsx` から呼び出され、アプリのパフォーマンス監視に利用できます。

## 実装ポイント
- `onPerfEntry` が関数として渡された場合のみ動作し、不要なロードを回避。
- `import('web-vitals')` による動的インポートで、初期バンドルサイズへの影響を最小化。
- 取得可能な指標: CLS, INP, FCP, LCP, TTFB。

## 利用方法
```ts
reportWebVitals(console.log);
```
のようにコールバックを渡すと各指標が測定され次第ログに出力されます。
