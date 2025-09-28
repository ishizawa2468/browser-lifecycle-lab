import { Link, Outlet, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { TanstackDevtools } from "@tanstack/react-devtools";
import GlobalBeforeUnload from "@/shared/GlobalBeforeUnload";

export const Route = createRootRoute({
  component: () => (
    <>
      <div style={{ padding: 24 }}>
        <h1>Lifecycle Lab</h1>
        <nav style={{ display: "flex", gap: 12 }}>
          <Link to="/">/</Link>
          <Link to="/form">/form</Link>
          <Link to="/dashboard">/dashboard</Link>
          <Link to="/pagehide">/pagehide</Link>
        </nav>
        <hr />
        <Outlet />
      </div>
      <GlobalBeforeUnload />
      <TanstackDevtools
        config={{
          position: "bottom-left",
        }}
        plugins={[
          {
            name: "Tanstack Router",
            render: <TanStackRouterDevtoolsPanel />,
          },
        ]}
      />
    </>
  ),
});
