'use client';

/** Bottom-right floating Copilot button → opens a small, compact chat popover (NOT the full
 *  drawer). Essential functions only: ask, see the answer, new chat, expand to full view.
 *  Hidden on the /copilot full page and while the big drawer is open. */

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useCopilotStore } from '@/stores/copilotStore';
import { CopilotConversation, Sparkle, Ico, P } from './copilot-conversation';

/* The floating mini-widget is deferred to the full release (Sep 8 call) — hidden for launch.
   Flip to true to bring the FAB back. */
const SHOW_FAB = false;

export function CopilotFab() {
  const pathname = usePathname();
  const router = useRouter();
  const { reset, drawerOpen, enabled } = useCopilotStore();
  const [open, setOpen] = useState(false);

  if (!SHOW_FAB || pathname === '/copilot' || drawerOpen || !enabled) return null;

  const expand = () => { setOpen(false); router.push('/copilot'); };

  return (
    <div className="cp-root">
      {open && (
        <div className="cp-fabpop">
          <div className="cp-headbar" style={{ height: 48 }}>
            <Sparkle s={17} grad />
            <span style={{ fontWeight: 600, fontSize: 14.5 }}>Dalgo Copilot</span>
            <div style={{ flex: 1 }} />
            <button className="cp-iconbtn" onClick={reset} title="New chat" aria-label="New chat"><Ico d={P.plus} s={16} c="var(--text2)" /></button>
            <button className="cp-iconbtn" onClick={expand} title="Expand to full view" aria-label="Expand"><Ico d={P.expand} s={16} c="var(--text2)" /></button>
            <button className="cp-iconbtn" onClick={() => setOpen(false)} title="Close" aria-label="Close"><Ico d={P.close} s={17} c="var(--text2)" /></button>
          </div>
          <div style={{ flex: 1, minHeight: 0 }}><CopilotConversation compact mini onVisual={expand} /></div>
        </div>
      )}
      <button className="cp-fab" onClick={() => setOpen((v) => !v)} aria-label={open ? 'Close Copilot' : 'Open Copilot'}>
        {open ? <Ico d={P.chevron} s={20} c="#fff" sw={2.6} /> : <Sparkle s={24} c="#fff" />}
      </button>
    </div>
  );
}
