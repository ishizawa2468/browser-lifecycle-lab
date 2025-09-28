import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { usePageHideOrVisibilityConfirm } from "../hooks/usePageHideOrVisibilityConfirm";

export const Route = createFileRoute("/pagehide")({ component: PageHideDemo });

function PageHideDemo() {
  const [enabled, setEnabled] = useState(true);

  usePageHideOrVisibilityConfirm(enabled, {
    scope: "pagehide-demo",
    message: "変更が保存されていません。このままページを離れますか？",
  });

  return (
    <div>
      <h2>PageHide / Visibility Guard</h2>
      <p>
        beforeunload が動作しない WebView でも動かせるように、
        <code>pagehide</code> と <code>visibilitychange</code>
        を利用して確認ダイアログを表示するデモです。
      </p>
      <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => setEnabled(e.target.checked)}
        />
        ガードを有効化する
      </label>
      <p style={{ marginTop: 16 }}>
        タブを閉じる、別タブに切り替える、リロードするなどで可視状態が変わると
        ダイアログが表示され、同時にタイムラインにイベントが記録されます。
      </p>
      <p>
        ダイアログは <code>window.confirm</code> で表示しています。WebView
        ネイティブ側の UI と連携する場合は、このフック内でコールバックを呼び出すことで
        別 UI への差し替えも可能です。
      </p>
    </div>
  );
}
