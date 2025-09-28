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

  console.log(
    `[usePageHideOrVisibilityConfirm] hook initialized with enabled=${enabled}, scope="${scope}"`
  );

  useEffect(() => {
    if (!enabled) {
      console.log(
        `[usePageHideOrVisibilityConfirm] effect skipped because guard is disabled for scope="${scope}"`
      );
      return;
    }

    console.log(
      `[usePageHideOrVisibilityConfirm] effect subscribed for scope="${scope}"`
    );
    dialogLockedRef.current = false;

    const openDialog = (origin: "pagehide" | "visibilitychange") => {
      console.log(
        `[usePageHideOrVisibilityConfirm] openDialog invoked from ${origin} for scope="${scope}"`
      );
      if (dialogLockedRef.current) return;
      dialogLockedRef.current = true;
      const result = window.confirm(message);
      console.log(
        `[usePageHideOrVisibilityConfirm] confirm result=${result} for scope="${scope}"`
      );
      add({ scope, type: "note", detail: { origin, confirmed: result } });
    };

    const onPageHide = (event: PageTransitionEvent) => {
      console.log(
        `[usePageHideOrVisibilityConfirm] pagehide fired with persisted=${event.persisted} for scope="${scope}"`
      );
      add({ scope, type: "pagehide", detail: { persisted: event.persisted } });
      openDialog("pagehide");
    };

    const onVisibilityChange = () => {
      const state = document.visibilityState;
      console.log(
        `[usePageHideOrVisibilityConfirm] visibilitychange detected state="${state}" for scope="${scope}"`
      );
      add({ scope, type: "visibilitychange", detail: { state } });
      if (state === "hidden") {
        openDialog("visibilitychange");
      }
    };

    const onPageShow = (event: PageTransitionEvent) => {
      console.log(
        `[usePageHideOrVisibilityConfirm] pageshow fired with persisted=${event.persisted} for scope="${scope}"`
      );
      add({ scope, type: "pageshow", detail: { persisted: event.persisted } });
      dialogLockedRef.current = false;
    };

    window.addEventListener("pagehide", onPageHide);
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("pageshow", onPageShow);

    return () => {
      console.log(
        `[usePageHideOrVisibilityConfirm] cleanup removing listeners for scope="${scope}"`
      );
      window.removeEventListener("pagehide", onPageHide);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, [enabled, add, message, scope]);
}
