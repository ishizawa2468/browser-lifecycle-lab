import { useBlocker } from "@tanstack/react-router";

/**
 * TanStack Router の useBlocker を「未保存ダーティ」ケースに最適化してラップ。
 * - SPA 内では withResolver=true でカスタムモーダル対応
 * - enableBeforeUnload=true でタブ閉じ/リロードもガード
 */
export function useUnsavedNavigationBlocker(isDirty: boolean) {
  console.log(
    `[useUnsavedNavigationBlocker] hook invoked with isDirty=${isDirty}`
  );
  const blocker = useBlocker({
    shouldBlockFn: () => {
      console.log(
        `[useUnsavedNavigationBlocker] shouldBlockFn evaluated -> ${isDirty}`
      );
      return isDirty;
    },
    withResolver: true,
    enableBeforeUnload: isDirty,
  });
  console.log("[useUnsavedNavigationBlocker] blocker state", blocker);
  return blocker;
}
