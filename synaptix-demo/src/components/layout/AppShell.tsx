import type { ReactNode } from 'react';
import { PresenterBar } from './PresenterBar';
import { NavRail } from './NavRail';

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="shell">
      <PresenterBar />
      <div className="shell__body">
        <NavRail />
        <main className="view" style={{ minWidth: 0 }}>
          {children}
        </main>
      </div>
    </div>
  );
}
