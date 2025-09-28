import { useBeforeUnloadGuard } from "./useBeforeUnloadGuard";

export function useGlobalBeforeUnloadDebug(enabled: boolean) {
  console.log(
    `[useGlobalBeforeUnloadDebug] hook initialized with enabled=${enabled}`
  );
  // scope は 'global' 固定で十分
  useBeforeUnloadGuard(enabled, "global");
}
