import { useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useDebug } from "../shared/DebugProvider";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const { add } = useDebug();

  useEffect(() => {
    const onVis = () =>
      add({
        scope: "dashboard",
        type: "visibilitychange",
        detail: { state: document.visibilityState },
      });
    const onShow = (e: PageTransitionEvent) =>
      add({
        scope: "dashboard",
        type: "pageshow",
        detail: { persisted: e.persisted },
      });
    const onHide = (e: PageTransitionEvent) =>
      add({
        scope: "dashboard",
        type: "pagehide",
        detail: { persisted: e.persisted },
      });

    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("pageshow", onShow);
    window.addEventListener("pagehide", onHide);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("pageshow", onShow);
      window.removeEventListener("pagehide", onHide);
    };
  }, [add]);

  return (
    <div>
      <h2>Dashboard</h2>
      <p>
        戻る/進む・タブ切替・最小化/復帰でコンソールとパネルのログを確認できます。
      </p>
    </div>
  );
}
