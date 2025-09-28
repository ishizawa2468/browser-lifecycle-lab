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
  console.log(
    `[usePageTransitionDebug] hook initialized for scope="${scope}"`,
    opts
  );
  useEffect(() => {
    console.log(
      `[usePageTransitionDebug] effect subscribed for scope="${scope}"`
    );
    const onHide = (e: PageTransitionEvent) => {
      console.log(
        `[usePageTransitionDebug] pagehide fired for scope="${scope}" with persisted=${e.persisted}`
      );
      add({ scope, type: "pagehide", detail: { persisted: e.persisted } });
      opts.onHide?.(e);
    };
    const onShow = (e: PageTransitionEvent) => {
      console.log(
        `[usePageTransitionDebug] pageshow fired for scope="${scope}" with persisted=${e.persisted}`
      );
      add({ scope, type: "pageshow", detail: { persisted: e.persisted } });
      opts.onShow?.(e);
    };
    window.addEventListener("pagehide", onHide);
    window.addEventListener("pageshow", onShow);
    return () => {
      console.log(
        `[usePageTransitionDebug] cleanup removing listeners for scope="${scope}"`
      );
      window.removeEventListener("pagehide", onHide);
      window.removeEventListener("pageshow", onShow);
    };
  }, [add, scope, opts]);
}
