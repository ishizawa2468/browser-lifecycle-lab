import { useEffect } from "react";
import { useDebug } from "../shared/DebugProvider";

export function useVisibilityDebug(scope: string) {
  const { add } = useDebug();
  useEffect(() => {
    const onVis = () =>
      add({
        scope,
        type: "visibilitychange",
        detail: { state: document.visibilityState },
      });
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [add, scope]);
}
