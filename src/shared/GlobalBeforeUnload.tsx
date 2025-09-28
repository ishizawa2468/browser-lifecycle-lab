import { useEffect } from "react";
import { useDebug } from "./DebugProvider";

export default function GlobalBeforeUnload() {
  const { add } = useDebug();
  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      add({ scope: "global", type: "beforeunload" });
      // 注意：ここで returnValue を設定するとブラウザの離脱確認が表示される
      // e.preventDefault()
      // e.returnValue = ''
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [add]);
  return null;
}
