import { useEffect } from "react";
import { useDebug } from "../shared/DebugProvider";

/**
 * enabled=true の間だけ beforeunload を有効化。
 * 注意: returnValue を設定するとブラウザ標準の離脱確認が表示されます。
 */
export function useBeforeUnloadGuard(
  enabled: boolean,
  scope: string = "global"
) {
  const { add } = useDebug();
  useEffect(() => {
    if (!enabled) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      add({ scope, type: "beforeunload" });
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [enabled, add, scope]);
}
