import { createFileRoute } from "@tanstack/react-router";
import { useVisibilityDebug } from "../hooks/useVisibilityDebug";
import { usePageTransitionDebug } from "../hooks/usePageTransitionDebug";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  useVisibilityDebug("dashboard");
  usePageTransitionDebug("dashboard");

  return (
    <div>
      <h2>Dashboard (Hooks)</h2>
      <p>
        戻る/進む・タブ切替・最小化/復帰でトースト＆タイムラインにイベントが流れます。
      </p>
    </div>
  );
}
