import { Outlet, createRootRoute } from "@tanstack/react-router";

const RootLayout = () => (
  <div>
    <main>
      <Outlet />
    </main>
  </div>
);

export const Route = createRootRoute({ component: RootLayout });
