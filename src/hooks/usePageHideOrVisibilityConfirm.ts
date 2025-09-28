import { useEffect, useRef } from "react";
import { useDebug } from "../shared/DebugProvider";

type Options = {
  /**
   * 確認ダイアログに表示するメッセージ
   */
  message?: string;
  /**
   * Debug ログのスコープ名
   */
  scope?: string;
};

/**
 * WebView など beforeunload が利用できない環境向けに
 * pagehide / visibilitychange を使って確認ダイアログを表示する。
 */
export function usePageHideOrVisibilityConfirm(
  enabled: boolean,
  { message = "ページを離れますか？", scope = "pagehide-confirm" }: Options = {}
) {
  const { add } = useDebug();
  const dialogLockedRef = useRef(false);

  useEffect(() => {
    if (!enabled) return;

    dialogLockedRef.current = false;

    const openDialog = (origin: "pagehide" | "visibilitychange") => {
      if (dialogLockedRef.current) return;
      dialogLockedRef.current = true;
      const result = window.confirm(message);
      add({ scope, type: "note", detail: { origin, confirmed: result } });
    };

    const onPageHide = (event: PageTransitionEvent) => {
      add({ scope, type: "pagehide", detail: { persisted: event.persisted } });
      openDialog("pagehide");
    };

    const onVisibilityChange = () => {
      const state = document.visibilityState;
      add({ scope, type: "visibilitychange", detail: { state } });
      if (state === "hidden") {
        openDialog("visibilitychange");
      }
    };

    const onPageShow = (event: PageTransitionEvent) => {
      add({ scope, type: "pageshow", detail: { persisted: event.persisted } });
      dialogLockedRef.current = false;
    };

    window.addEventListener("pagehide", onPageHide);
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("pageshow", onPageShow);

    return () => {
      window.removeEventListener("pagehide", onPageHide);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, [enabled, add, message, scope]);
}
