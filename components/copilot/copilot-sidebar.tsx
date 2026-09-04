'use client';

/** Left conversation sidebar in the full view — New chat + History (rename/delete via a
 *  three-dot menu per session) + the design-only preview-states panel. Toggled by the
 *  header sidebar icon. Opening it auto-collapses the main platform sidebar (see main-layout). */

import { useState } from 'react';
import { useCopilotStore, SCENARIOS } from '@/stores/copilotStore';
import { Ico, P } from './copilot-conversation';

const DOTS = 'M12 5v.01M12 12v.01M12 19v.01';
const PENCIL = 'M17 3a2.85 2.85 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z';

export function CopilotSidebar() {
  const { copilotSidebarOpen, reset, ask, runScenario, history, renameHistory, deleteHistory } = useCopilotStore();
  const [menuFor, setMenuFor] = useState<number | null>(null);
  const [editing, setEditing] = useState<number | null>(null);
  const [draft, setDraft] = useState('');

  if (!copilotSidebarOpen) return null;

  const commitRename = () => {
    if (editing !== null && draft.trim()) renameHistory(editing, draft.trim());
    setEditing(null);
  };

  return (
    <aside className="cp-convside">
      <button className="cp-newchat" onClick={reset}>
        <Ico d={P.plus} s={16} c="var(--teal)" /> New chat
      </button>
      <div className="cp-histlabel">History</div>
      {history.length === 0 ? (
        <div style={{ padding: '14px 10px', textAlign: 'center', color: 'var(--text3)' }}>
          <div style={{ display: 'inline-grid', placeItems: 'center', width: 36, height: 36, borderRadius: 10, background: 'var(--surface)', marginBottom: 8 }}>
            <Ico d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" s={17} c="var(--placeholder)" />
          </div>
          <div style={{ fontSize: 13, lineHeight: 1.5 }}>No conversations yet.<br />Your chats will show up here.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
          {history.map((h, i) => (
            <div key={`${h.q}-${i}`} className="cp-histrow">
              {editing === i ? (
                <input
                  autoFocus
                  className="cp-histedit"
                  value={draft}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') commitRename(); if (e.key === 'Escape') setEditing(null); }}
                  onBlur={commitRename}
                />
              ) : (
                <>
                  <button className="cp-histitem" onClick={() => { reset(); ask(h.q); }}>
                    <Ico d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" s={15} c="var(--text3)" />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.t}</span>
                  </button>
                  <button
                    className={`cp-iconbtn cp-histdots ${menuFor === i ? 'open' : ''}`}
                    title="Options"
                    aria-label="Session options"
                    onClick={(e) => { e.stopPropagation(); setMenuFor(menuFor === i ? null : i); }}
                  >
                    <Ico d={DOTS} s={15} c="var(--text3)" sw={2.6} />
                  </button>
                  {menuFor === i && (
                    <>
                      <div style={{ position: 'fixed', inset: 0, zIndex: 19 }} onClick={() => setMenuFor(null)} />
                      <div className="cp-histmenu">
                        <button onClick={() => { setEditing(i); setDraft(h.t); setMenuFor(null); }}>
                          <Ico d={PENCIL} s={14} c="var(--text2)" /> Rename
                        </button>
                        <button className="danger" onClick={() => { deleteHistory(i); setMenuFor(null); }}>
                          <Ico d={P.trash} s={14} c="var(--alert)" /> Delete
                        </button>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
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
