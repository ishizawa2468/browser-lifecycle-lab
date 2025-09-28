import { useEffect } from "react";
import { useDebug } from "../shared/DebugProvider";

export function useVisibilityDebug(scope: string) {
  const { add } = useDebug();
  console.log(`[useVisibilityDebug] hook initialized for scope="${scope}"`);
  useEffect(() => {
    console.log(
      `[useVisibilityDebug] effect subscribed for scope="${scope}"`
    );
    const onVis = () => {
      const state = document.visibilityState;
      console.log(
        `[useVisibilityDebug] visibilitychange fired for scope="${scope}" with state="${state}"`
      );
      add({
        scope,
        type: "visibilitychange",
        detail: { state },
      });
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      console.log(
        `[useVisibilityDebug] cleanup removing visibilitychange listener for scope="${scope}"`
      );
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [add, scope]);
}
