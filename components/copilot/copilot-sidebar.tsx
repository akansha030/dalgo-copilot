'use client';

/** Left conversation sidebar in the full view — New chat + History. Toggled by the header
 *  sidebar icon. Opening it auto-collapses the main platform sidebar (see main-layout). */

import { useCopilotStore, SCENARIOS } from '@/stores/copilotStore';
import { Ico, P } from './copilot-conversation';

const HISTORY: { t: string; q: string }[] = [
  { t: 'Enrolment over 6 months', q: 'How has enrolment changed over the last 6 months?' },
  { t: 'Completed surveys in Pune', q: 'How many surveys were completed in Pune last month?' },
  { t: 'District performance', q: 'Which districts are performing well?' },
  { t: 'Completed vs pending', q: 'Compare completed vs pending surveys by district' },
];

export function CopilotSidebar() {
  const { copilotSidebarOpen, reset, ask, runScenario } = useCopilotStore();
  if (!copilotSidebarOpen) return null;

  return (
    <aside className="cp-convside">
      <button className="cp-newchat" onClick={reset}>
        <Ico d={P.plus} s={16} c="var(--teal)" /> New chat
      </button>
      <div className="cp-histlabel">History</div>
      {HISTORY.length === 0 ? (
        <div style={{ padding: '14px 10px', textAlign: 'center', color: 'var(--text3)' }}>
          <div style={{ display: 'inline-grid', placeItems: 'center', width: 36, height: 36, borderRadius: 10, background: 'var(--surface)', marginBottom: 8 }}>
            <Ico d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" s={17} c="var(--placeholder)" />
          </div>
          <div style={{ fontSize: 13, lineHeight: 1.5 }}>No conversations yet.<br />Your chats will show up here.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
          {HISTORY.map((h) => (
            <button key={h.t} className="cp-histitem" onClick={() => { reset(); ask(h.q); }}>
              <Ico d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" s={15} c="var(--text3)" />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.t}</span>
            </button>
          ))}
        </div>
      )}

      {/* Design aid — jump straight to any response state without typing. Remove before ship. */}
      <div style={{ marginTop: 'auto', paddingTop: 14, borderTop: '1px solid var(--border)' }}>
        <div className="cp-histlabel" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <Ico d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7zM12 15a3 3 0 100-6 3 3 0 000 6z" s={12} c="var(--text3)" />
          Preview states · design
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 2 }}>
          {SCENARIOS.map((s) => (
            <button key={s.key} className="cp-chip" style={{ fontSize: 12, padding: '5px 10px' }} onClick={() => { reset(); runScenario(s.key); }}>
              {s.label}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
