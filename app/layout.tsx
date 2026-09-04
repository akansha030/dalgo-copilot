import './globals.css';
import type { Metadata } from 'next';
import Link from 'next/link';
import { CopilotStyles } from '@/components/copilot/copilot-conversation';
import { CopilotFab } from '@/components/copilot/copilot-fab';

export const metadata: Metadata = {
  title: 'Dalgo Copilot',
  description: 'Dalgo Copilot — chat-with-data prototype (mock data).',
};

const topbar: React.CSSProperties = {
  height: 52,
  flexShrink: 0,
  display: 'flex',
  alignItems: 'center',
  gap: 14,
  padding: '0 20px',
  borderBottom: '1px solid #e8ecef',
  background: '#fff',
};
const navlink: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 500,
  color: '#5c5c6d',
  textDecoration: 'none',
  padding: '6px 10px',
  borderRadius: 8,
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
            <nav style={{ display: 'flex', gap: 4 }}>
              <Link href="/copilot" style={navlink}>Copilot</Link>
              <Link href="/settings/copilot" style={navlink}>Settings</Link>
            </nav>
          </header>
          <main style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>{children}</main>
        </div>
        <CopilotStyles />
        <CopilotFab />
      </body>
    </html>
  );
}
