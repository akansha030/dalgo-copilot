import './globals.css';
import type { Metadata } from 'next';
import Link from 'next/link';
import { CopilotStyles, Ico } from '@/components/copilot/copilot-conversation';
import { CopilotFab } from '@/components/copilot/copilot-fab';
import { SideNav } from '@/components/shell/side-nav';

export const metadata: Metadata = {
  title: 'Dalgo Copilot',
  description: 'Dalgo Copilot — chat-with-data prototype (mock data).',
};

const topbar: React.CSSProperties = {
  height: 52,
  flexShrink: 0,
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  padding: '0 18px',
  borderBottom: '1px solid #e8ecef',
  background: '#fff',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#f8fafb' }}>
          <header style={topbar}>
            <Link href="/" style={{ textDecoration: 'none', color: '#1a1a2e', fontWeight: 800, fontSize: 20, letterSpacing: '-0.5px' }}>
              Dalgo
            </Link>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#00897b', background: '#e8f4f3', padding: '2px 8px', borderRadius: 20 }}>
              Copilot prototype
            </span>
            <div style={{ flex: 1 }} />
            <button
              aria-label="Notifications"
              style={{ display: 'grid', placeItems: 'center', width: 34, height: 34, borderRadius: 8, border: 'none', background: 'none', cursor: 'pointer' }}
            >
              <Ico d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" s={19} c="#5c5c6d" />
            </button>
          </header>
          <div style={{ flex: 1, minHeight: 0, display: 'flex' }}>
            <SideNav />
            <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>{children}</main>
          </div>
        </div>
        <CopilotStyles />
        <CopilotFab />
      </body>
    </html>
  );
}
