import { useBlocker } from "@tanstack/react-router";

/**
 * TanStack Router の useBlocker を「未保存ダーティ」ケースに最適化してラップ。
 * - SPA 内では withResolver=true でカスタムモーダル対応
 * - enableBeforeUnload=true でタブ閉じ/リロードもガード
 */
export function useUnsavedNavigationBlocker(isDirty: boolean) {
  const blocker = useBlocker({
    shouldBlockFn: () => isDirty,
    withResolver: true,
    enableBeforeUnload: isDirty,
  });
  return blocker;
}
