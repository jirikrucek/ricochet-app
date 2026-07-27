import { Outlet, createRootRoute } from '@tanstack/react-router';
import { AppFooter } from '../components/AppFooter';
import { TopNav } from '../components/TopNav';

function RootLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <TopNav />
      <main
        className="mx-auto w-full max-w-[1280px] flex-1"
        style={{
          paddingInline: 'var(--spacing-base)',
          paddingBlock: 'var(--spacing-section)',
        }}
      >
        <Outlet />
      </main>
      <AppFooter />
    </div>
  );
}

export const Route = createRootRoute({
  component: RootLayout,
});
