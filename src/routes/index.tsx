import { createFileRoute } from "@tanstack/react-router";
import "../App.css";

export const Route = createFileRoute("/")({
  component: App,
});

function App() {
  return (
    <div className="App">
      <div>
        <h2>Home</h2>
        <ol>
          <li>「/form」で入力し、未保存状態を作る</li>
          <li>SPA 内遷移（ナビから他ページ）でモーダルを確認</li>
          <li>リロード/タブ閉じ/外部遷移で beforeunload を確認</li>
          <li>別タブ切替/復帰で visibilitychange を確認</li>
          <li>外部ページ→戻る で pageshow（BFCache）を確認</li>
        </ol>
      </div>
    </div>
  );
}
