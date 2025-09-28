import { useGlobalBeforeUnloadDebug } from "../hooks/useGlobalBeforeUnloadDebug";

export default function GlobalBeforeUnload() {
  useGlobalBeforeUnloadDebug(true); // 可視化目的で true（本番はページ限定推奨）
  return null;
}
