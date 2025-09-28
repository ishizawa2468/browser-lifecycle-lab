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
  console.log(
    `[useBeforeUnloadGuard] hook initialized with enabled=${enabled}, scope="${scope}"`
  );
  useEffect(() => {
    if (!enabled) {
      console.log(
        `[useBeforeUnloadGuard] effect skipped because guard is disabled for scope="${scope}"`
      );
      return;
    }
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      console.log(
        `[useBeforeUnloadGuard] beforeunload fired for scope="${scope}"`
      );
      add({ scope, type: "beforeunload" });
      e.preventDefault();
      e.returnValue = "";
    };
    console.log(
      `[useBeforeUnloadGuard] effect subscribed beforeunload listener for scope="${scope}"`
    );
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => {
      console.log(
        `[useBeforeUnloadGuard] cleanup removing beforeunload listener for scope="${scope}"`
      );
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
  }, [enabled, add, scope]);
}
