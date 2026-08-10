import { Outlet, createRootRoute } from '@tanstack/react-router';
import { AppFooter } from '../app/layout/AppFooter';
import { TopNav } from '../app/layout/TopNav';

function RootLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <TopNav />
      <main className="mx-auto w-full max-w-app-shell flex-1 px-base py-section">
        <Outlet />
      </main>
      <AppFooter />
    </div>
  );
}

export const Route = createRootRoute({
  component: RootLayout,
});
