'use client';

/** Dalgo Copilot — full view. Layout: [conversation sidebar] · [conversation].
 *  Header: left = sidebar toggle (New chat + History); right = dock-to-side.
 *  Charts/KPIs are created and previewed INLINE in the conversation (no editor panel).
 *  Opening the conversation sidebar auto-collapses the main platform sidebar. */

import { useEffect } from 'react';
import { useCopilotStore } from '@/stores/copilotStore';
import { CopilotConversation, Sparkle, Ico } from '@/components/copilot/copilot-conversation';
import { CopilotSidebar } from '@/components/copilot/copilot-sidebar';

const ICON = {
  sidebar: 'M4 4h16v16H4z M9 4v16', // panel with left divider → conversation sidebar
};

export default function CopilotPage() {
  const { toggleCopilotSidebar, setCopilotSidebarOpen, copilotSidebarOpen } = useCopilotStore();

  // Restore the main sidebar when leaving the full view.
  useEffect(() => () => { setCopilotSidebarOpen(false); }, [setCopilotSidebarOpen]);

  return (
    <div className="cp-root" style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--surface)' }}>
      <div className="cp-headbar">
        <button className="cp-iconbtn" onClick={toggleCopilotSidebar} title="Chats" aria-label="Toggle chats">
          <Ico d={ICON.sidebar} s={18} c={copilotSidebarOpen ? 'var(--teal)' : 'var(--text2)'} />
        </button>
        <Sparkle s={18} grad />
        <span style={{ fontWeight: 600, fontSize: 15 }}>Dalgo Copilot</span>
        <div style={{ flex: 1 }} />
      </div>

      <div style={{ flex: 1, minHeight: 0, display: 'flex' }}>
        <CopilotSidebar />
        <div style={{ flex: 1, minWidth: 0 }}>
          <CopilotConversation compact={false} />
        </div>
      </div>
    </div>
  );
}
