以下は、`beforeunload` / `pagehide` / `pageshow` / `visibilitychange` を“視覚化”する **検証版テンプレート**です。React + Vite、TanStack Router の **file-based routing** を使用しています。トースト通知とタイムライン（デバッグパネル）でイベントを確認できます。

---

# 0) 事前準備
```bash
npm create vite@latest lifecycle-lab -- --template react-ts
cd lifecycle-lab
npm i @tanstack/react-router @tanstack/router-devtools
npm i -D @tanstack/router-vite-plugin
```

---

# 1) Vite 設定
**vite.config.ts**
```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { TanStackRouterVite } from '@tanstack/router-vite-plugin'

export default defineConfig({
  plugins: [react(), TanStackRouterVite()],
})
```

---

# 2) エントリ & HTML
**index.html**
```html
<!doctype html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Lifecycle Lab (Debug)</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

**src/main.tsx**
```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'
import './styles.css'
import { DebugProvider } from './shared/DebugProvider'

const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register { router: typeof router }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <DebugProvider>
      <RouterProvider router={router} />
    </DebugProvider>
  </React.StrictMode>,
)
```

---

# 3) 共有：デバッグ基盤（トースト & タイムライン）
**src/shared/DebugProvider.tsx**
```tsx
import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'

export type LifeEvent = {
  id: string
  ts: number
  scope: 'global' | 'form' | 'dashboard' | string
  type: 'beforeunload' | 'pagehide' | 'pageshow' | 'visibilitychange' | 'note'
  detail?: any
}

type Ctx = {
  events: LifeEvent[]
  add: (e: Omit<LifeEvent, 'id' | 'ts'> & { ts?: number }) => void
  clear: () => void
}

const DebugCtx = createContext<Ctx | null>(null)

export const useDebug = () => {
  const ctx = useContext(DebugCtx)
  if (!ctx) throw new Error('useDebug must be used inside <DebugProvider>')
  return ctx
}

export const DebugProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [events, setEvents] = useState<LifeEvent[]>([])
  const counter = useRef(0)

  const toastQueue = useRef<{ id: string; msg: string }[]>([])
  const [toasts, setToasts] = useState<{ id: string; msg: string }[]>([])

  const pushToast = useCallback((msg: string) => {
    const id = 't' + Date.now() + ':' + Math.random().toString(36).slice(2)
    toastQueue.current.push({ id, msg })
    setToasts([...toastQueue.current])
    setTimeout(() => {
      toastQueue.current = toastQueue.current.filter((t) => t.id !== id)
      setToasts([...toastQueue.current])
    }, 3000)
  }, [])

  const add: Ctx['add'] = useCallback((e) => {
    const id = 'e' + counter.current++
    const ev: LifeEvent = { id, ts: e.ts ?? Date.now(), scope: e.scope, type: e.type, detail: e.detail }
    setEvents((prev) => [ev, ...prev])
    const msg = `[${ev.scope}] ${ev.type}` + (ev.detail ? ` ${JSON.stringify(ev.detail)}` : '')
    pushToast(msg)
  }, [pushToast])

  const clear = useCallback(() => setEvents([]), [])

  const value = useMemo(() => ({ events, add, clear }), [events, add, clear])

  return (
    <DebugCtx.Provider value={value}>
      {children}
      {/* Toasts */}
      <div className="toast-viewport">
        {toasts.map((t) => (
          <div key={t.id} className="toast">{t.msg}</div>
        ))}
      </div>
      {/* Timeline Panel */}
      <Timeline />
    </DebugCtx.Provider>
  )
}

const Timeline: React.FC = () => {
  const { events, clear } = useDebug()
  const fmt = (n: number) => new Date(n).toLocaleTimeString()
  return (
    <div className="timeline">
      <div className="timeline__header">
        <strong>Lifecycle Timeline</strong>
        <button onClick={clear}>Clear</button>
      </div>
      <div className="timeline__body">
        {events.length === 0 && <div className="timeline__empty">No events</div>}
        {events.map((e) => (
          <div key={e.id} className="timeline__row">
            <span className="timeline__time">{fmt(e.ts)}</span>
            <span className={`badge badge--${e.scope}`}>{e.scope}</span>
            <span className="timeline__type">{e.type}</span>
            {e.detail && <span className="timeline__detail">{JSON.stringify(e.detail)}</span>}
          </div>
        ))}
      </div>
    </div>
  )
}
```

**src/styles.css**（最低限のスタイル）
```css
/* Layout */
body { font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; }
nav a { text-decoration: none; }

/* Toast */
.toast-viewport {
  position: fixed; right: 16px; bottom: 16px; display: grid; gap: 8px; z-index: 50;
}
.toast { background: #111; color: #fff; padding: 10px 12px; border-radius: 10px; box-shadow: 0 8px 24px rgba(0,0,0,.25); }

/* Timeline Panel */
.timeline {
  position: fixed; right: 16px; top: 16px; width: 420px; max-height: 60vh; display: flex; flex-direction: column;
  background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; z-index: 40;
  box-shadow: 0 10px 30px rgba(0,0,0,.15);
}
.timeline__header { display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; background: #f8fafc; border-bottom: 1px solid #e5e7eb; }
.timeline__body { overflow: auto; max-height: 50vh; }
.timeline__row { display: grid; grid-template-columns: 86px 1fr auto; gap: 8px; align-items: baseline; padding: 8px 12px; border-bottom: 1px dashed #eee; font-size: 13px; }
.timeline__time { color: #64748b; font-variant-numeric: tabular-nums; }
.timeline__type { font-weight: 600; }
.timeline__detail { color: #475569; }
.timeline__empty { color: #94a3b8; padding: 16px; }

.badge { display: inline-flex; align-items: center; padding: 2px 8px; border-radius: 999px; font-size: 12px; font-weight: 600; background: #e2e8f0; color: #0f172a; }
.badge--form { background: #dbeafe; color: #1e3a8a; }
.badge--dashboard { background: #dcfce7; color: #166534; }
.badge--global { background: #f1f5f9; color: #0f172a; }
```

---

# 4) ルーティング（file-based）
**src/routes/__root.tsx**
```tsx
import { Outlet, Link, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'

export const Route = createRootRoute({
  component: () => (
    <div style={{ padding: 24 }}>
      <h1>Lifecycle Lab (Debug)</h1>
      <nav style={{ display: 'flex', gap: 12 }}>
        <Link to="/">/</Link>
        <Link to="/form">/form</Link>
        <Link to="/dashboard">/dashboard</Link>
      </nav>
      <hr />
      <Outlet />
      <TanStackRouterDevtools position="bottom-right" />
    </div>
  ),
})
```

**src/routes/index.tsx**
```tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: () => (
    <div>
      <h2>Home</h2>
      <ol>
        <li>「/form」で入力し、未保存状態を作る</li>
        <li>SPA 内遷移（ナビから他ページ）でモーダルを確認</li>
        <li>リロード/タブ閉じ/外部遷移で beforeunload を確認</li>
        <li>別タブ切替/復帰で visibilitychange を確認</li>
        <li>外部ページ→戻る で pageshow（BFCache）を確認</li>
      </ol>
    </div>
  ),
})
```

**src/routes/form.tsx**
```tsx
import { useEffect, useState } from 'react'
import { createFileRoute, useBlocker } from '@tanstack/react-router'
import { useDebug } from '../shared/DebugProvider'

export const Route = createFileRoute('/form')({ component: FormPage })

function FormPage() {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const isDirty = title !== '' || body !== ''
  const { add } = useDebug()

  // SPA 内遷移ブロック（モーダル制御込み）
  const blocker = useBlocker({
    shouldBlockFn: () => isDirty,
    withResolver: true,
    enableBeforeUnload: isDirty,
  })

  // visibilitychange
  useEffect(() => {
    const onVis = () => {
      add({ scope: 'form', type: 'visibilitychange', detail: { state: document.visibilityState } })
    }
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [add])

  // pagehide/pageshow（BFCache対応）
  useEffect(() => {
    const onHide = (e: PageTransitionEvent) => {
      add({ scope: 'form', type: 'pagehide', detail: { persisted: e.persisted } })
      sessionStorage.setItem('form:draft', JSON.stringify({ title, body }))
    }
    const onShow = (e: PageTransitionEvent) => {
      add({ scope: 'form', type: 'pageshow', detail: { persisted: e.persisted } })
      const raw = sessionStorage.getItem('form:draft')
      if (raw) {
        const d = JSON.parse(raw)
        setTitle(d.title ?? '')
        setBody(d.body ?? '')
      }
    }
    window.addEventListener('pagehide', onHide)
    window.addEventListener('pageshow', onShow)
    return () => {
      window.removeEventListener('pagehide', onHide)
      window.removeEventListener('pageshow', onShow)
    }
  }, [title, body, add])

  return (
    <div>
      <h2>Form</h2>
      <p>入力すると「未保存」になります。SPA 内遷移でモーダル、タブ閉じ/更新/外部遷移でネイティブ確認。</p>

      <div style={{ display: 'grid', gap: 8, maxWidth: 520 }}>
        <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <textarea placeholder="Body" value={body} rows={6} onChange={(e) => setBody(e.target.value)} />
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => { localStorage.setItem('form:draft', JSON.stringify({ title, body })); alert('Saved') }}>Save</button>
          <button onClick={() => { setTitle(''); setBody('') }}>Reset</button>
          <a href="https://example.com" rel="noreferrer">外部サイトへ（beforeunload）</a>
        </div>
      </div>

      {/* SPA 内遷移がブロックされたらモーダルを出す */}
      {blocker.status === 'blocked' && (
        <div style={modalStyle}>
          <div style={dialogStyle}>
            <h3>ページを離れますか？</h3>
            <p>未保存の変更があります。破棄して移動しますか？</p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={blocker.reset}>キャンセル</button>
              <button onClick={blocker.proceed}>破棄して移動</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const modalStyle: React.CSSProperties = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', display: 'grid', placeItems: 'center' }
const dialogStyle: React.CSSProperties = { padding: 16, background: '#fff', minWidth: 360, borderRadius: 8, boxShadow: '0 10px 30px rgba(0,0,0,.2)' }
```

**src/routes/dashboard.tsx**
```tsx
import { useEffect } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useDebug } from '../shared/DebugProvider'

export const Route = createFileRoute('/dashboard')({ component: DashboardPage })

function DashboardPage() {
  const { add } = useDebug()

  useEffect(() => {
    const onVis = () => add({ scope: 'dashboard', type: 'visibilitychange', detail: { state: document.visibilityState } })
    const onShow = (e: PageTransitionEvent) => add({ scope: 'dashboard', type: 'pageshow', detail: { persisted: e.persisted } })
    const onHide = (e: PageTransitionEvent) => add({ scope: 'dashboard', type: 'pagehide', detail: { persisted: e.persisted } })

    document.addEventListener('visibilitychange', onVis)
    window.addEventListener('pageshow', onShow)
    window.addEventListener('pagehide', onHide)
    return () => {
      document.removeEventListener('visibilitychange', onVis)
      window.removeEventListener('pageshow', onShow)
      window.removeEventListener('pagehide', onHide)
    }
  }, [add])

  return (
    <div>
      <h2>Dashboard</h2>
      <p>戻る/進む・タブ切替・最小化/復帰でコンソールとパネルのログを確認できます。</p>
    </div>
  )
}
```

---

# 5) グローバルの `beforeunload` 可視化（任意）
**src/routes/__root.tsx** の直下、もしくは `src/shared/GlobalGuards.tsx` を作成してマウントしても構いません。ここでは root に追記する例を示します。

**src/shared/GlobalBeforeUnload.tsx**
```tsx
import { useEffect } from 'react'
import { useDebug } from './DebugProvider'

export default function GlobalBeforeUnload() {
  const { add } = useDebug()
  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      add({ scope: 'global', type: 'beforeunload' })
      // 注意：ここで returnValue を設定するとブラウザの離脱確認が表示される
      // e.preventDefault()
      // e.returnValue = ''
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [add])
  return null
}
```

**src/routes/__root.tsx**（末尾の `TanStackRouterDevtools` の直前などにマウント）
```tsx
// 省略…
import GlobalBeforeUnload from '../shared/GlobalBeforeUnload'

export const Route = createRootRoute({
  component: () => (
    <div style={{ padding: 24 }}>
      {/* 省略 */}
      <Outlet />
      <GlobalBeforeUnload />
      <TanStackRouterDevtools position="bottom-right" />
    </div>
  ),
})
```

> 実運用では、`beforeunload` の常時発火は UX を損ねるため、**本当に必要な画面のみ**で `enableBeforeUnload` を有効化するのが推奨です。ここでは可視化用にグローバル計測だけ分離しました。

---

# 6) 動作確認
```bash
npm run dev
# http://localhost:5173 で起動
```
- `/form` で入力 → SPA 内遷移で**モーダル**（`useBlocker`）。
- リロード/タブ閉じ/外部リンク → **beforeunload**（必要なら `returnValue` を設定）。
- タブ切替/最小化/復帰 → **visibilitychange**（トースト & タイムライン）。
- 外部ページへ移動 → 戻る で **pageshow**（`persisted` が `true` なら BFCache 復帰）。

---

# 7) 次のステップ
この検証版をベースに、共通処理を **Hooks 化**（`useLifecycleDebug()` など）してページごとの配線を簡素化できます。ご要望に合わせて最適な API と分割方針でご提案します。



---

# 8) Hooks 化（共通化して各ページから簡潔に呼び出す）
以下の4つのフックに分割します。必要なものだけを各ページで呼び出す想定です。
- `useVisibilityDebug(scope)` … `visibilitychange` を購読して Debug に積む
- `usePageTransitionDebug(scope, opts)` … `pagehide/pageshow` を購読（BFCache 対応）
- `useBeforeUnloadGuard(enabled, scope)` … `beforeunload` を制御（有効時のみ）
- `useUnsavedNavigationBlocker(isDirty)` … TanStack Router の `useBlocker` をラップして SPA 内遷移をガード

> 既存の `DebugProvider` はそのまま利用します。

## 8.1 hooks 実装
**src/hooks/useVisibilityDebug.ts**
```tsx
import { useEffect } from 'react'
import { useDebug } from '../shared/DebugProvider'

export function useVisibilityDebug(scope: string) {
  const { add } = useDebug()
  useEffect(() => {
    const onVis = () => add({ scope, type: 'visibilitychange', detail: { state: document.visibilityState } })
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [add, scope])
}
```

**src/hooks/usePageTransitionDebug.ts**
```tsx
import { useEffect } from 'react'
import { useDebug } from '../shared/DebugProvider'

export type PageTransitionOptions = {
  onHide?: (e: PageTransitionEvent) => void
  onShow?: (e: PageTransitionEvent) => void
}

export function usePageTransitionDebug(scope: string, opts: PageTransitionOptions = {}) {
  const { add } = useDebug()
  useEffect(() => {
    const onHide = (e: PageTransitionEvent) => {
      add({ scope, type: 'pagehide', detail: { persisted: e.persisted } })
      opts.onHide?.(e)
    }
    const onShow = (e: PageTransitionEvent) => {
      add({ scope, type: 'pageshow', detail: { persisted: e.persisted } })
      opts.onShow?.(e)
    }
    window.addEventListener('pagehide', onHide)
    window.addEventListener('pageshow', onShow)
    return () => {
      window.removeEventListener('pagehide', onHide)
      window.removeEventListener('pageshow', onShow)
    }
  }, [add, scope, opts])
}
```

**src/hooks/useBeforeUnloadGuard.ts**
```tsx
import { useEffect } from 'react'
import { useDebug } from '../shared/DebugProvider'

/**
 * enabled=true の間だけ beforeunload を有効化。
 * 注意: returnValue を設定するとブラウザ標準の離脱確認が表示されます。
 */
export function useBeforeUnloadGuard(enabled: boolean, scope: string = 'global') {
  const { add } = useDebug()
  useEffect(() => {
    if (!enabled) return
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      add({ scope, type: 'beforeunload' })
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [enabled, add, scope])
}
```

**src/hooks/useUnsavedNavigationBlocker.tsx**
```tsx
import { useBlocker } from '@tanstack/react-router'

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
  })
  return blocker
}
```

## 8.2 ルートを Hooks ベースに書き換え
**src/routes/form.tsx**（簡潔に）
```tsx
import { useEffect, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useVisibilityDebug } from '../hooks/useVisibilityDebug'
import { usePageTransitionDebug } from '../hooks/usePageTransitionDebug'
import { useUnsavedNavigationBlocker } from '../hooks/useUnsavedNavigationBlocker'

export const Route = createFileRoute('/form')({ component: FormPage })

function FormPage() {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const isDirty = title !== '' || body !== ''

  // Hooks で計測/可視化
  useVisibilityDebug('form')
  usePageTransitionDebug('form', {
    onHide: () => sessionStorage.setItem('form:draft', JSON.stringify({ title, body })),
    onShow: () => {
      const raw = sessionStorage.getItem('form:draft')
      if (raw) {
        const d = JSON.parse(raw)
        setTitle(d.title ?? '')
        setBody(d.body ?? '')
      }
    },
  })

  const blocker = useUnsavedNavigationBlocker(isDirty)

  return (
    <div>
      <h2>Form (Hooks)</h2>
      <p>入力すると「未保存」になります。SPA 内遷移はモーダル、リロード/タブ閉じは beforeunload（有効時）。</p>
      <div style={{ display: 'grid', gap: 8, maxWidth: 520 }}>
        <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <textarea placeholder="Body" value={body} rows={6} onChange={(e) => setBody(e.target.value)} />
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => { localStorage.setItem('form:draft', JSON.stringify({ title, body })); alert('Saved') }}>Save</button>
          <button onClick={() => { setTitle(''); setBody('') }}>Reset</button>
          <a href="https://example.com" rel="noreferrer">外部サイトへ（beforeunload）</a>
        </div>
      </div>

      {blocker.status === 'blocked' && (
        <div style={modalStyle}>
          <div style={dialogStyle}>
            <h3>ページを離れますか？</h3>
            <p>未保存の変更があります。破棄して移動しますか？</p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={blocker.reset}>キャンセル</button>
              <button onClick={blocker.proceed}>破棄して移動</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const modalStyle: React.CSSProperties = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', display: 'grid', placeItems: 'center' }
const dialogStyle: React.CSSProperties = { padding: 16, background: '#fff', minWidth: 360, borderRadius: 8, boxShadow: '0 10px 30px rgba(0,0,0,.2)' }
```

**src/routes/dashboard.tsx**（さらに軽量）
```tsx
import { createFileRoute } from '@tanstack/react-router'
import { useVisibilityDebug } from '../hooks/useVisibilityDebug'
import { usePageTransitionDebug } from '../hooks/usePageTransitionDebug'

export const Route = createFileRoute('/dashboard')({ component: DashboardPage })

function DashboardPage() {
  useVisibilityDebug('dashboard')
  usePageTransitionDebug('dashboard')

  return (
    <div>
      <h2>Dashboard (Hooks)</h2>
      <p>戻る/進む・タブ切替・最小化/復帰でトースト＆タイムラインにイベントが流れます。</p>
    </div>
  )
}
```

## 8.3 任意：グローバル beforeunload も Hook に
**src/hooks/useGlobalBeforeUnloadDebug.ts**
```tsx
import { useBeforeUnloadGuard } from './useBeforeUnloadGuard'

export function useGlobalBeforeUnloadDebug(enabled: boolean) {
  // scope は 'global' 固定で十分
  useBeforeUnloadGuard(enabled, 'global')
}
```

**src/shared/GlobalBeforeUnload.tsx** をフックに置き換える場合：
```tsx
import { useGlobalBeforeUnloadDebug } from '../hooks/useGlobalBeforeUnloadDebug'

export default function GlobalBeforeUnload() {
  useGlobalBeforeUnloadDebug(true) // 可視化目的で true（本番はページ限定推奨）
  return null
}
```

---

# 9) まとめ
- 各ページは **1〜2行のフック呼び出し**でイベントの可視化やダーティガードを付与可能。
- 実サービスでは、`useBeforeUnloadGuard` の有効化は **必要なページに限定**し、`usePageTransitionDebug` は `persisted` に基づく軽量復元のみ行うのがベストプラクティスです。

ご希望があれば、この Hooks セットを npm パッケージ化できるよう型・ドキュメント整備も行います。

