import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";

export type LifeEvent = {
  id: string;
  ts: number;
  scope: "global" | "form" | "dashboard" | string;
  type: "beforeunload" | "pagehide" | "pageshow" | "visibilitychange" | "note";
  detail?: any;
};

type Ctx = {
  events: LifeEvent[];
  add: (e: Omit<LifeEvent, "id" | "ts"> & { ts?: number }) => void;
  clear: () => void;
};

const DebugCtx = createContext<Ctx | null>(null);

export const useDebug = () => {
  const ctx = useContext(DebugCtx);
  if (!ctx) throw new Error("useDebug must be used inside <DebugProvider>");
  return ctx;
};

export const DebugProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [events, setEvents] = useState<LifeEvent[]>([]);
  const counter = useRef(0);

  const toastQueue = useRef<{ id: string; msg: string }[]>([]);
  const [toasts, setToasts] = useState<{ id: string; msg: string }[]>([]);

  const pushToast = useCallback((msg: string) => {
    const id = "t" + Date.now() + ":" + Math.random().toString(36).slice(2);
    toastQueue.current.push({ id, msg });
    setToasts([...toastQueue.current]);
    setTimeout(() => {
      toastQueue.current = toastQueue.current.filter((t) => t.id !== id);
      setToasts([...toastQueue.current]);
    }, 3000);
  }, []);

  const add: Ctx["add"] = useCallback(
    (e) => {
      const id = "e" + counter.current++;
      const ev: LifeEvent = {
        id,
        ts: e.ts ?? Date.now(),
        scope: e.scope,
        type: e.type,
        detail: e.detail,
      };
      setEvents((prev) => [ev, ...prev]);
      const msg =
        `[${ev.scope}] ${ev.type}` +
        (ev.detail ? ` ${JSON.stringify(ev.detail)}` : "");
      pushToast(msg);
    },
    [pushToast]
  );

  const clear = useCallback(() => setEvents([]), []);

  const value = useMemo(() => ({ events, add, clear }), [events, add, clear]);

  return (
    <DebugCtx.Provider value={value}>
      {children}
      {/* Toasts */}
      <div className="toast-viewport">
        {toasts.map((t) => (
          <div key={t.id} className="toast">
            {t.msg}
          </div>
        ))}
      </div>
      {/* Timeline Panel */}
      <Timeline />
    </DebugCtx.Provider>
  );
};

const Timeline: React.FC = () => {
  const { events, clear } = useDebug();
  const fmt = (n: number) => new Date(n).toLocaleTimeString();
  return (
    <div className="timeline">
      <div className="timeline__header">
        <strong>Lifecycle Timeline</strong>
        <button onClick={clear}>Clear</button>
      </div>
      <div className="timeline__body">
        {events.length === 0 && (
          <div className="timeline__empty">No events</div>
        )}
        {events.map((e) => (
          <div key={e.id} className="timeline__row">
            <span className="timeline__time">{fmt(e.ts)}</span>
            <span className={`badge badge--${e.scope}`}>{e.scope}</span>
            <span className="timeline__type">{e.type}</span>
            {e.detail && (
              <span className="timeline__detail">
                {JSON.stringify(e.detail)}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
