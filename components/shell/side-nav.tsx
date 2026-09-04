'use client';

/** Lightweight left product nav — enough shell to place the Copilot in context.
 *  Copilot + Copilot settings route; the rest are visual placeholders. */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Ico, Sparkle } from '@/components/copilot/copilot-conversation';

const ICON = {
  dash: 'M3 3h8v8H3zM13 3h8v5h-8zM13 12h8v9h-8zM3 13h8v8H3z',
  chart: 'M4 20V10M10 20V4M16 20v-7M22 20H2',
  data: 'M12 2a9 3 0 100 6 9 3 0 000-6zM21 5v6c0 1.7-4 3-9 3s-9-1.3-9-3V5M21 11v6c0 1.7-4 3-9 3s-9-1.3-9-3v-6',
  bell: 'M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0',
  gear: 'M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z',
};

export function SideNav() {
  const path = (usePathname() || '/').replace(/\/+$/, '') || '/';
  const copilotOn = path === '/copilot';
  const settingsOn = path === '/settings/copilot';

  return (
    <aside className="side-nav">
      <span className="nav-item static"><Ico d={ICON.dash} s={18} c="currentColor" /> Dashboards</span>
      <span className="nav-item static"><Ico d={ICON.chart} s={18} c="currentColor" /> Charts</span>
      <span className="nav-item static"><Ico d={ICON.data} s={18} c="currentColor" /> Data</span>
      <span className="nav-item static"><Ico d={ICON.bell} s={18} c="currentColor" /> Alerts</span>
      <Link href="/copilot" className={`nav-item ${copilotOn ? 'on' : ''}`}>
        <Sparkle s={18} c={copilotOn ? 'var(--teal)' : 'currentColor'} /> Copilot
      </Link>

      <div className="lbl">Settings</div>
      <Link href="/settings/copilot" className={`nav-item ${settingsOn ? 'on' : ''}`}>
        <Ico d={ICON.gear} s={18} c={settingsOn ? 'var(--teal)' : 'currentColor'} /> Copilot settings
      </Link>

      <div className="user">
        <span className="av">A</span>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 13.5, fontWeight: 600, color: '#1a1a2e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Alex Morgan</div>
          <div style={{ fontSize: 12, color: '#7a7a8c' }}>Admin</div>
        </div>
      </div>
    </aside>
  );
}
