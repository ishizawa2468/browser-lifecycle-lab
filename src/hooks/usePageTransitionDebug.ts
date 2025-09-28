import { useEffect } from "react";
import { useDebug } from "../shared/DebugProvider";

export type PageTransitionOptions = {
  onHide?: (e: PageTransitionEvent) => void;
  onShow?: (e: PageTransitionEvent) => void;
};

export function usePageTransitionDebug(
  scope: string,
  opts: PageTransitionOptions = {}
) {
  const { add } = useDebug();
  useEffect(() => {
    const onHide = (e: PageTransitionEvent) => {
      add({ scope, type: "pagehide", detail: { persisted: e.persisted } });
      opts.onHide?.(e);
    };
    const onShow = (e: PageTransitionEvent) => {
      add({ scope, type: "pageshow", detail: { persisted: e.persisted } });
      opts.onShow?.(e);
    };
    window.addEventListener("pagehide", onHide);
    window.addEventListener("pageshow", onShow);
    return () => {
      window.removeEventListener("pagehide", onHide);
      window.removeEventListener("pageshow", onShow);
    };
  }, [add, scope, opts]);
}
