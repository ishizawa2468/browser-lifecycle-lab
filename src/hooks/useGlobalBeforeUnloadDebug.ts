import { useBeforeUnloadGuard } from "./useBeforeUnloadGuard";

export function useGlobalBeforeUnloadDebug(enabled: boolean) {
  // scope は 'global' 固定で十分
  useBeforeUnloadGuard(enabled, "global");
}
