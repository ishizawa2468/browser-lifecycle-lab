import { useEffect, useState } from "react";
import { createFileRoute, useBlocker } from "@tanstack/react-router";
import { useDebug } from "../shared/DebugProvider";

export const Route = createFileRoute("/form")({ component: FormPage });

function FormPage() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const isDirty = title !== "" || body !== "";
  const { add } = useDebug();

  // SPA 内遷移ブロック（モーダル制御込み）
  const blocker = useBlocker({
    shouldBlockFn: () => isDirty,
    withResolver: true,
    enableBeforeUnload: isDirty,
  });

  // visibilitychange
  useEffect(() => {
    const onVis = () => {
      add({
        scope: "form",
        type: "visibilitychange",
        detail: { state: document.visibilityState },
      });
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [add]);

  // pagehide/pageshow（BFCache対応）
  useEffect(() => {
    const onHide = (e: PageTransitionEvent) => {
      add({
        scope: "form",
        type: "pagehide",
        detail: { persisted: e.persisted },
      });
      sessionStorage.setItem("form:draft", JSON.stringify({ title, body }));
    };
    const onShow = (e: PageTransitionEvent) => {
      add({
        scope: "form",
        type: "pageshow",
        detail: { persisted: e.persisted },
      });
      const raw = sessionStorage.getItem("form:draft");
      if (raw) {
        const d = JSON.parse(raw);
        setTitle(d.title ?? "");
        setBody(d.body ?? "");
      }
    };
    window.addEventListener("pagehide", onHide);
    window.addEventListener("pageshow", onShow);
    return () => {
      window.removeEventListener("pagehide", onHide);
      window.removeEventListener("pageshow", onShow);
    };
  }, [title, body, add]);

  return (
    <div>
      <h2>Form</h2>
      <p>
        入力すると「未保存」になります。SPA
        内遷移でモーダル、タブ閉じ/更新/外部遷移でネイティブ確認。
      </p>

      <div style={{ display: "grid", gap: 8, maxWidth: 520 }}>
        <input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          placeholder="Body"
          value={body}
          rows={6}
          onChange={(e) => setBody(e.target.value)}
        />
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => {
              localStorage.setItem(
                "form:draft",
                JSON.stringify({ title, body })
              );
              alert("Saved");
            }}
          >
            Save
          </button>
          <button
            onClick={() => {
              setTitle("");
              setBody("");
            }}
          >
            Reset
          </button>
          <a href="https://example.com" rel="noreferrer">
            外部サイトへ（beforeunload）
          </a>
        </div>
      </div>

      {/* SPA 内遷移がブロックされたらモーダルを出す */}
      {blocker.status === "blocked" && (
        <div style={modalStyle}>
          <div style={dialogStyle}>
            <h3>ページを離れますか？</h3>
            <p>未保存の変更があります。破棄して移動しますか？</p>
            <div
              style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}
            >
              <button onClick={blocker.reset}>キャンセル</button>
              <button onClick={blocker.proceed}>破棄して移動</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const modalStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,.4)",
  display: "grid",
  placeItems: "center",
};
const dialogStyle: React.CSSProperties = {
  padding: 16,
  background: "#fff",
  minWidth: 360,
  borderRadius: 8,
  boxShadow: "0 10px 30px rgba(0,0,0,.2)",
};
