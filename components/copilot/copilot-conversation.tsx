'use client';

/** Dalgo Copilot conversation UI (design unchanged from the prototype). Reads shared state
 *  from useCopilotStore so the drawer and the /copilot full page show the same chat. */

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useCopilotStore, TASK_TEMPLATES } from '@/stores/copilotStore';

/* icons */
export const Sparkle = ({ s = 18, c = 'currentColor' }: { s?: number; c?: string }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
    <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3z" fill={c} />
    <path d="M19 4l.7 1.8L21.5 6.5l-1.8.7L19 9l-.7-1.8L16.5 6.5l1.8-.7L19 4z" fill={c} opacity={0.7} />
  </svg>
);
export const Ico = ({ d, s = 20, c = 'currentColor', sw = 1.8 }: { d: string; s?: number; c?: string; sw?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d={d} />
  </svg>
);
export const P = {
  send: 'M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z',
  close: 'M18 6L6 18M6 6l12 12',
  expand: 'M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7',
  chevron: 'M6 9l6 6 6-6',
  up: 'M7 10v12M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z',
  down: 'M17 14V2M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22a3.13 3.13 0 0 1-3-3.88Z',
  trash: 'M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m2 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6',
  plus: 'M12 5v14M5 12h14',
  eye: 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7zM12 15a3 3 0 100-6 3 3 0 000 6z',
  chart: 'M4 20V10M10 20V4M16 20v-7M22 20H2',
  copy: 'M9 9h10a2 2 0 012 2v10a2 2 0 01-2 2H9a2 2 0 01-2-2V11a2 2 0 012-2z M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1',
  check: 'M20 6L9 17l-5-5',
  stop: 'M7 7h10v10H7z',
  power: 'M12 2v10M18.36 6.64a9 9 0 11-12.73 0',
  warn: 'M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01',
};

const Bot = () => (
  <div style={{ width: 30, height: 30, borderRadius: 9, background: 'var(--teal-light)', color: 'var(--teal)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
    <Sparkle s={17} />
  </div>
);
const Dot = ({ done }: { done?: boolean }) => (
  <span style={{ width: 14, height: 14, display: 'inline-grid', placeItems: 'center', flexShrink: 0 }}>
    <span style={{ width: 6, height: 6, borderRadius: '50%', background: done ? 'var(--teal)' : 'var(--border)' }} />
  </span>
);

export function MiniChart({ kind, data, color = '#00897b', h = 150 }: { kind: 'line' | 'bar'; data: { label: string; value: number }[]; color?: string; h?: number }) {
  const w = 320, pad = 26, top = 12;
  const max = Math.max(...data.map((d) => d.value)) * 1.1;
  const iw = w - pad * 2, ih = h - top - 22;
  const x = (i: number) => pad + (data.length === 1 ? iw / 2 : (i * iw) / (data.length - 1));
  const y = (v: number) => top + ih - (v / max) * ih;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" style={{ display: 'block' }}>
      {[0, 0.5, 1].map((g) => (
        <line key={g} x1={pad} x2={w - pad} y1={top + ih - g * ih} y2={top + ih - g * ih} stroke="#eef1f3" />
      ))}
      {kind === 'line' ? (
        <>
          <polyline fill="none" stroke={color} strokeWidth={2.5} strokeLinejoin="round" points={data.map((d, i) => `${x(i)},${y(d.value)}`).join(' ')} />
          {data.map((d, i) => (<circle key={i} cx={x(i)} cy={y(d.value)} r={3.5} fill="#fff" stroke={color} strokeWidth={2} />))}
        </>
      ) : (
        data.map((d, i) => {
          const bw = Math.min(34, (iw / data.length) * 0.6);
          return <rect key={i} x={x(i) - bw / 2} y={y(d.value)} width={bw} height={top + ih - y(d.value)} rx={3} fill={color} />;
        })
      )}
      {data.map((d, i) => (<text key={i} x={x(i)} y={h - 6} textAnchor="middle" fontSize={10} fill="#7a7a8c">{d.label}</text>))}
    </svg>
  );
}

export function CopilotConversation({ compact, mini = false, onVisual }: { compact: boolean; mini?: boolean; onVisual?: () => void }) {
  const { msgs, input, busy, enabled, setInput, ask, stop, patchAnswer } = useCopilotStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' }); }, [msgs]);
  const empty = msgs.length === 0;
  const [npsThanked, setNpsThanked] = useState<Record<number, boolean>>({});

  // Admin turned Copilot off → the whole surface shows a "turned off" state.
  if (!enabled) {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '24px 28px', gap: 4 }}>
        <div style={{ width: 46, height: 46, borderRadius: 12, background: 'var(--bg)', display: 'grid', placeItems: 'center', marginBottom: 10 }}>
          <Ico d={P.power} s={22} c="var(--text3)" />
        </div>
        <div style={{ fontSize: mini ? 16 : 18, fontWeight: 700, color: 'var(--text)' }}>Copilot is turned off</div>
        <div style={{ fontSize: 13.5, color: 'var(--text3)', lineHeight: 1.55, maxWidth: 300 }}>
          It’s disabled for your workspace. An admin can turn it back on in Settings → Copilot.
        </div>
        {!mini && <Link href="/settings/copilot" className="cp-createbtn" style={{ marginTop: 14, textDecoration: 'none' }}>Open settings</Link>}
      </div>
    );
  }

  const composer = (glow = false) => (
    <div style={{ maxWidth: compact ? '100%' : 720, margin: '0 auto', width: '100%', padding: compact ? '0 4px' : '0 8px' }}>
      <form onSubmit={(e) => { e.preventDefault(); ask(input); }} className={glow ? 'cp-glowwrap' : undefined}>
        <div className="cp-inputwrap" style={{ display: 'flex', flexDirection: 'column', gap: 8, border: '1px solid var(--border)', borderRadius: 14, padding: mini ? 10 : 14, background: 'var(--surface)' }}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); ask(input); } }}
            placeholder="Ask about your program data…"
            rows={mini ? 1 : 2}
            style={{ width: '100%', border: 'none', outline: 'none', fontSize: 15, background: 'transparent', color: 'var(--text)', fontFamily: 'inherit', resize: 'none', lineHeight: 1.55, padding: '2px 4px', minHeight: mini ? 24 : (compact ? 40 : 54) }}
          />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
            {busy ? (
              <button type="button" onClick={stop} className="cp-sendbtn" aria-label="Stop generating" title="Stop"><span style={{ width: 11, height: 11, borderRadius: 2, background: '#fff', display: 'block' }} /></button>
            ) : (
              <button type="submit" disabled={!input.trim()} className="cp-sendbtn" aria-label="Send"><Ico d={P.send} s={16} c="#fff" /></button>
            )}
          </div>
        </div>
      </form>
      {!mini && <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--text3)', marginTop: 8 }}>Copilot can make mistakes. Check important results before you act on them.</div>}
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      {empty && !mini ? (
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: compact ? '20px 12px' : '24px' }}>
          <div style={{ width: '100%', maxWidth: compact ? '100%' : 720, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <div style={{ fontSize: compact ? 24 : 34, fontWeight: 700, letterSpacing: '-0.6px', color: 'var(--text)', lineHeight: 1.15 }}>What can I help you find?</div>
              <div style={{ fontSize: compact ? 14 : 16, color: 'var(--text3)', lineHeight: 1.6, marginTop: 10, maxWidth: 520, marginLeft: 'auto', marginRight: 'auto' }}>
                Ask in plain English — answers come from your connected data, and I can turn them into a chart or KPI.
              </div>
            </div>
            {composer(true)}
            <div style={{ display: 'grid', gridTemplateColumns: compact ? '1fr' : '1fr 1fr', gap: 8, marginTop: compact ? 16 : 22 }}>
              {TASK_TEMPLATES.map((t) => (
                <button key={t.title} onClick={() => ask(t.q)} className="cp-task">
                  <span style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--text)' }}>{t.title}</span>
                  <span style={{ fontSize: 12.5, color: 'var(--text3)', lineHeight: 1.45 }}>{t.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <>
          <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: compact ? '16px' : '28px 0' }}>
            <div style={{ maxWidth: compact ? '100%' : 720, margin: '0 auto', height: empty ? '100%' : undefined }}>
              {empty ? (
                <div style={{ height: '100%', minHeight: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 20px' }}>
                  <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.3px', color: 'var(--text)' }}>Ask about your data</div>
                  <div style={{ fontSize: 13, color: 'var(--text3)', marginTop: 6, maxWidth: 260, lineHeight: 1.5 }}>Answers come from your connected data — no SQL needed.</div>
                </div>
              ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 22, padding: compact ? 0 : '0 8px' }}>
              {msgs.map((m) => {
                if (m.role === 'user') {
                  return (
                    <div key={m.id} style={{ alignSelf: 'flex-end', maxWidth: '85%', background: 'var(--navy)', color: '#fff', padding: '10px 14px', borderRadius: '12px 12px 4px 12px', fontSize: 15 }}>{m.text}</div>
                  );
                }
                if (m.kind === 'thinking') {
                  return (
                    <div key={m.id} style={{ display: 'flex', gap: 10 }}>
                      <Bot />
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 7, paddingTop: 4 }}>
                        {m.steps.map((st, i) => {
                          if (i > m.step) return null; // reveal one step at a time
                          const active = i === m.step;
                          return (
                            <div key={i} className="cp-step" style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 14 }}>
                              {active ? <span className="cp-spin" /> : <Dot done />}
                              {active ? <span className="cp-shimmer">{st}</span> : <span style={{ color: 'var(--text3)' }}>{st}</span>}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                }
                const r = m.resp;
                const feedbackRow = (
                  <>
                    <div style={{ display: 'flex', gap: 4, marginTop: 12, alignItems: 'center' }}>
                      <button className="cp-iconbtn" onClick={() => patchAnswer(m.id, (x) => ({ ...x, vote: x.vote === 1 ? 0 : 1 }))} title="Helpful" aria-label="Helpful">
                        <Ico d={P.up} s={15} c={m.vote === 1 ? 'var(--teal)' : 'var(--placeholder)'} sw={m.vote === 1 ? 2 : 1.8} />
                      </button>
                      <button className="cp-iconbtn" onClick={() => patchAnswer(m.id, (x) => ({ ...x, vote: x.vote === -1 ? 0 : -1 }))} title="Not helpful" aria-label="Not helpful">
                        <Ico d={P.down} s={15} c={m.vote === -1 ? 'var(--alert)' : 'var(--placeholder)'} sw={m.vote === -1 ? 2 : 1.8} />
                      </button>
                    </div>
                    {m.vote !== 0 && (
                      npsThanked[m.id] ? (
                        <div style={{ marginTop: 10, fontSize: 13, color: 'var(--text3)' }}>Thanks for the feedback.</div>
                      ) : (
                        <div style={{ marginTop: 10, border: '1px solid var(--border)', borderRadius: 10, padding: '10px 12px', background: 'var(--bg)' }}>
                          <div style={{ fontSize: 13, color: 'var(--text2)' }}>{m.vote === 1 ? 'Glad it helped — what did you find useful?' : 'Sorry about that — what went wrong?'}</div>
                          <input placeholder="Optional — tell us more" onKeyDown={(e) => { if (e.key === 'Enter') setNpsThanked((s) => ({ ...s, [m.id]: true })); }} style={{ width: '100%', marginTop: 8, border: '1px solid var(--border)', borderRadius: 6, padding: '7px 10px', fontSize: 13, fontFamily: 'inherit', outline: 'none' }} />
                        </div>
                      )
                    )}
                  </>
                );
                return (
                  <div key={m.id} style={{ display: 'flex', gap: 10 }}>
                    <Bot />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {r.clarify ? (
                        <div style={{ background: '#fffaf0', border: '1px solid #ffe6bf', borderRadius: 12, padding: '14px 16px' }}>
                          <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#e08a1e', fontWeight: 600, marginBottom: 6 }}>Quick check</div>
                          <div style={{ fontSize: 15, color: 'var(--text)', lineHeight: 1.55 }}>{r.clarify.text}</div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
                            {r.clarify.options.map((o) => (
                              <button key={o} onClick={() => ask(o + ' by district')} className="cp-chip">{o}</button>
                            ))}
                          </div>
                        </div>
                      ) : r.variant ? (
                        <div>
                          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', border: '1px solid', borderColor: r.variant === 'error' ? '#f1c9c9' : 'var(--border)', background: r.variant === 'error' ? '#fff6f6' : 'var(--bg)', borderRadius: 12, padding: '14px 16px' }}>
                            <span style={{ flexShrink: 0, marginTop: 1 }}>
                              {r.variant === 'error'
                                ? <Ico d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01" s={18} c="#e05353" />
                                : r.variant === 'scope'
                                  ? <Ico d="M17.94 17.94A10 10 0 0112 20C5 20 1 12 1 12a18 18 0 015.06-5.94M9.9 4.24A9 9 0 0112 4c7 0 11 8 11 8a18 18 0 01-2.16 3.19M1 1l22 22" s={18} c="var(--text3)" />
                                  : r.variant === 'stopped'
                                    ? <Ico d="M12 22a10 10 0 100-20 10 10 0 000 20z M15 9H9v6h6z" s={18} c="var(--text3)" />
                                    : <Ico d="M21 21l-4.3-4.3M11 4a7 7 0 100 14 7 7 0 000-14z" s={18} c="var(--text3)" />}
                            </span>
                            <div style={{ fontSize: 14.5, color: 'var(--text2)', lineHeight: 1.55 }}>{r.note}</div>
                          </div>
                          {r.variant === 'error' ? (
                            <button className="cp-createbtn" style={{ marginTop: 12 }} onClick={() => ask('How has enrolment changed over the last 6 months?')}>
                              <Ico d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" s={15} c="#fff" /> Try again
                            </button>
                          ) : r.variant === 'stopped' ? null : feedbackRow}
                        </div>
                      ) : (
                        <>
                          <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', lineHeight: 1.5 }}>{r.answer}</div>
                          {r.assumptions && (<div style={{ fontSize: 13, color: 'var(--text3)', marginTop: 6 }}>Assuming: {r.assumptions}</div>)}
                          {r.caveat && (
                            <div style={{ marginTop: 10, display: 'flex', gap: 8, alignItems: 'flex-start', background: '#fffaf0', border: '1px solid #ffe6bf', borderRadius: 10, padding: '10px 12px' }}>
                              <span style={{ flexShrink: 0, marginTop: 1 }}><Ico d={P.warn} s={15} c="#e08a1e" /></span>
                              <div style={{ fontSize: 13, color: '#8a6d3b', lineHeight: 1.5 }}>{r.caveat}</div>
                            </div>
                          )}
                          {r.table && (
                            <div style={{ marginTop: 14, border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
                              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                                <thead>
                                  <tr>{r.table.cols.map((c) => (
                                    <th key={c} style={{ textAlign: 'left', padding: '8px 12px', background: 'var(--bg)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text2)', fontWeight: 600 }}>{c}</th>
                                  ))}</tr>
                                </thead>
                                <tbody>
                                  {r.table.rows.map((row, ri) => (
                                    <tr key={ri} style={{ borderTop: '1px solid var(--divider)' }}>
                                      {row.map((cell, ci) => (<td key={ci} style={{ padding: '8px 12px', color: ci === 0 ? 'var(--text)' : 'var(--text2)' }}>{cell}</td>))}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                          {r.sql && (
                            <div style={{ marginTop: 10 }}>
                              <button onClick={() => patchAnswer(m.id, (x) => ({ ...x, showTrace: !x.showTrace }))} className="cp-link">
                                <span style={{ display: 'inline-flex', transform: m.showTrace ? 'rotate(180deg)' : 'none', transition: '0.15s' }}><Ico d={P.chevron} s={14} /></span>
                                How I got this
                              </button>
                              {m.showTrace && (
                                <div style={{ marginTop: 8, border: '1px solid var(--border)', borderRadius: 10, padding: 12, background: 'var(--bg)' }}>
                                  <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 8, lineHeight: 1.6 }}>
                                    Checked your <b>surveys / enrolment</b> data, applied the filters above, and aggregated the result — in plain terms, what the table shows.
                                  </div>
                                  <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text3)', marginBottom: 4 }}>Query (for a technical colleague)</div>
                                  <pre style={{ margin: 0, fontSize: 12.5, fontFamily: 'ui-monospace, Menlo, monospace', color: '#334', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{r.sql}</pre>
                                </div>
                              )}
                            </div>
                          )}
                          {r.chart && m.chartState === 'none' && (
                            <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
                              <button onClick={() => { patchAnswer(m.id, (x) => ({ ...x, chartState: 'created', createdKind: 'chart' })); onVisual?.(); }} className="cp-createbtn">
                                <Ico d={P.chart} s={15} c="#fff" /> Create chart
                              </button>
                              <button onClick={() => { patchAnswer(m.id, (x) => ({ ...x, chartState: 'created', createdKind: 'kpi' })); onVisual?.(); }} className="cp-createbtn cp-createbtn-alt">
                                <Ico d="M12 20V10M18 20V4M6 20v-4" s={15} c="var(--teal)" /> Create KPI
                              </button>
                            </div>
                          )}
                          {r.chart && m.chartState === 'created' && (
                            <div style={{ marginTop: 14, border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderBottom: '1px solid var(--divider)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <span style={{ color: 'var(--teal)', display: 'inline-flex' }}><Ico d="M20 6L9 17l-5-5" s={16} sw={2.4} /></span>
                                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{r.chart.title}</span>
                                  <span style={{ fontSize: 11, color: 'var(--teal)', background: 'var(--teal-light)', padding: '1px 7px', borderRadius: 20 }}>Saved to {m.createdKind === 'kpi' ? 'KPIs' : 'Charts'}</span>
                                </div>
                                <div style={{ display: 'flex', gap: 4 }}>
                                  <button className="cp-iconbtn" title="View"><Ico d={P.eye} s={16} c="var(--text2)" /></button>
                                  <button className="cp-iconbtn" title="Delete" onClick={() => patchAnswer(m.id, (x) => ({ ...x, chartState: 'deleted' }))}><Ico d={P.trash} s={16} c="var(--text2)" /></button>
                                </div>
                              </div>
                              <div style={{ padding: 12 }}>
                                {m.createdKind === 'kpi' ? (
                                  <div style={{ textAlign: 'center', padding: '18px 8px' }}>
                                    <div style={{ fontSize: 40, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em' }}>{(r.chart.data[r.chart.data.length - 1]?.value ?? 0).toLocaleString()}</div>
                                    <div style={{ fontSize: 13, color: 'var(--text3)', marginTop: 4 }}>{r.chart.title}</div>
                                  </div>
                                ) : (
                                  <MiniChart kind={r.chart.kind} data={r.chart.data} />
                                )}
                              </div>
                            </div>
                          )}
                          {r.chart && m.chartState === 'deleted' && (
                            <div style={{ marginTop: 12, fontSize: 13, color: 'var(--text3)', display: 'flex', alignItems: 'center', gap: 8 }}>
                              {m.createdKind === 'kpi' ? 'KPI' : 'Chart'} deleted.
                              <button className="cp-link" onClick={() => patchAnswer(m.id, (x) => ({ ...x, chartState: 'created' }))}>Undo</button>
                            </div>
                          )}
                          {feedbackRow}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
              </div>
              )}
            </div>
          </div>
          <div style={{ borderTop: '1px solid var(--border)', padding: compact ? 12 : '14px 0', background: 'var(--surface)' }}>
            {composer(false)}
          </div>
        </>
      )}
    </div>
  );
}

/* Injected once (from MainLayout). Defines the Copilot design tokens + animations, scoped to .cp-root. */
export function CopilotStyles() {
  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Anek+Latin:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
    </>
  );
}

const CSS = `
.cp-root { --teal:#00897b; --teal-hover:#00796b; --teal-light:#e8f4f3; --navy:#1a1a2e;
  --text:#1a1a2e; --text2:#5c5c6d; --text3:#7a7a8c; --placeholder:#b0b0be; --bg:#f8fafb; --surface:#fff;
  --surface-hover:#f5f7f8; --border:#e8ecef; --divider:#f1f5f9; --alert:#ef5350;
  font-family:'Anek Latin',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; color:var(--text); }
.cp-root * { box-sizing: border-box; }
.cp-iconbtn { display:inline-grid; place-items:center; width:34px; height:34px; border-radius:8px; border:none; background:none; cursor:pointer; transition:.12s; }
.cp-iconbtn:hover { background:var(--surface-hover); }
.cp-ghost { border:none; background:none; color:var(--text2); font-size:13px; font-weight:500; cursor:pointer; padding:6px 10px; border-radius:8px; font-family:inherit; }
.cp-ghost:hover { background:var(--surface-hover); }
.cp-suggest { display:flex; align-items:center; gap:10px; width:100%; text-align:left; padding:12px 14px; border:1px solid var(--border);
  border-radius:10px; background:var(--surface); font-size:14.5px; color:var(--text); cursor:pointer; font-family:inherit; transition:.12s; }
.cp-suggest:hover { border-color:var(--teal); background:var(--teal-light); }
.cp-chip { padding:7px 13px; border:1px solid var(--border); border-radius:20px; background:var(--surface); font-size:13px; font-weight:500; color:var(--text); cursor:pointer; font-family:inherit; transition:.12s; }
.cp-chip:hover { border-color:var(--teal); color:var(--teal); }
.cp-link { display:inline-flex; align-items:center; gap:5px; border:none; background:none; color:var(--teal); font-size:13px; font-weight:600; cursor:pointer; font-family:inherit; padding:0; }
.cp-inputwrap:focus-within { border-color:var(--teal)!important; box-shadow:0 0 0 3px rgba(0,137,123,.10); }
.cp-sendbtn { display:inline-grid; place-items:center; width:34px; height:34px; border-radius:9px; border:none; background:var(--teal); cursor:pointer; transition:.12s; flex-shrink:0; }
.cp-sendbtn:hover { background:var(--teal-hover); }
.cp-sendbtn:disabled { background:#a8c4c1; cursor:not-allowed; }
.cp-createbar { display:flex; align-items:center; gap:9px; width:100%; margin-top:14px; padding:11px 14px; border:1px dashed var(--teal); border-radius:10px;
  background:var(--teal-light); color:var(--text); font-size:14px; cursor:pointer; font-family:inherit; text-align:left; transition:.12s; }
.cp-createbar:hover { background:#dcefec; }
.cp-createbar-cta { margin-left:auto; font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:.03em; color:#fff; background:var(--teal); padding:5px 11px; border-radius:7px; flex-shrink:0; }
.cp-createbtn { display:inline-flex; align-items:center; gap:7px; padding:9px 14px; border-radius:9px; border:1px solid var(--teal); background:var(--teal); color:#fff; font-size:13.5px; font-weight:600; cursor:pointer; font-family:inherit; transition:.12s; }
.cp-createbtn:hover { background:var(--teal-hover); }
.cp-createbtn-alt { background:var(--surface); color:var(--teal); }
.cp-createbtn-alt:hover { background:var(--teal-light); }
.cp-attachmenu { position:absolute; bottom:44px; left:0; background:var(--surface); border:1px solid var(--border); border-radius:10px; box-shadow:0 8px 24px rgba(0,0,0,.12); padding:4px; min-width:180px; z-index:5; }
.cp-attachmenu button { display:flex; align-items:center; gap:9px; width:100%; text-align:left; padding:9px 10px; border:none; background:none; font-size:14px; color:var(--text); border-radius:7px; cursor:pointer; font-family:inherit; }
.cp-attachmenu button:hover { background:var(--surface-hover); }
.cp-attachchip { display:inline-flex; align-items:center; gap:6px; padding:4px 8px 4px 10px; border:1px solid var(--border); border-radius:8px; font-size:13px; color:var(--text2); background:var(--bg); }
.cp-editor { width:400px; max-width:42vw; flex-shrink:0; border-left:1px solid var(--border); background:var(--surface); display:flex; flex-direction:column; min-height:0; }
.cp-flabel { font-size:12px; text-transform:uppercase; letter-spacing:.04em; color:var(--text3); margin:16px 0 6px; font-weight:600; }
.cp-finput { width:100%; border:1px solid var(--border); border-radius:8px; padding:9px 11px; font-size:14px; font-family:inherit; color:var(--text); outline:none; background:var(--surface); }
.cp-finput:focus { border-color:var(--teal); box-shadow:0 0 0 3px rgba(0,137,123,.10); }
.cp-fread { width:100%; border:1px solid var(--border); border-radius:8px; padding:9px 11px; font-size:14px; color:var(--text2); background:var(--bg); }
.cp-seg { display:inline-flex; border:1px solid var(--border); border-radius:8px; overflow:hidden; }
.cp-seg button { border:none; background:var(--surface); padding:8px 18px; font-size:13px; font-weight:500; color:var(--text2); cursor:pointer; font-family:inherit; }
.cp-seg button.on { background:var(--teal); color:#fff; }
.cp-convside { width:236px; flex-shrink:0; border-right:1px solid var(--border); background:var(--bg); padding:12px; display:flex; flex-direction:column; min-height:0; }
.cp-newchat { display:flex; align-items:center; gap:8px; width:100%; padding:10px 12px; border:1px solid var(--teal); border-radius:9px; background:var(--surface); color:var(--teal); font-size:14px; font-weight:600; cursor:pointer; font-family:inherit; margin-bottom:14px; }
.cp-newchat:hover { background:var(--teal-light); }
.cp-histlabel { font-size:11px; text-transform:uppercase; letter-spacing:.05em; color:var(--text3); font-weight:600; margin-bottom:6px; padding:0 4px; }
.cp-histitem { display:flex; align-items:center; gap:8px; width:100%; text-align:left; padding:8px 10px; border:none; background:none; border-radius:8px; font-size:14px; color:var(--text2); cursor:pointer; font-family:inherit; }
.cp-histitem:hover { background:var(--surface-hover); color:var(--text); }
.cp-drawer { position:fixed; top:0; right:0; height:100vh; width:440px; max-width:92vw; background:var(--surface); border-left:1px solid var(--border);
  box-shadow:-12px 0 40px rgba(0,0,0,.10); z-index:1201; display:flex; flex-direction:column; animation:cp-slide .22s ease; }
.cp-overlay { position:fixed; inset:0; background:rgba(0,0,0,.12); z-index:1200; }
.cp-rhstab { width:44px; height:52px; border:none; border-radius:12px 0 0 12px; background:var(--teal); cursor:pointer; display:grid; place-items:center;
  box-shadow:-4px 4px 16px rgba(0,137,123,.35); animation:cp-pulse 2.4s ease-in-out infinite; }
.cp-rhstab:hover { background:var(--teal-hover); }
.cp-rhswrap { position:fixed; right:0; top:42%; display:flex; align-items:center; z-index:1150; }
.cp-rhstip { background:var(--navy); color:#fff; font-size:12.5px; padding:8px 12px; border-radius:8px; margin-right:8px; white-space:nowrap;
  box-shadow:0 8px 24px rgba(0,0,0,.18); display:flex; align-items:center; animation:cp-fadein .4s ease; }
.cp-headbar { height:52px; border-bottom:1px solid var(--border); display:flex; align-items:center; padding:0 14px; gap:10px; flex-shrink:0; }
.cp-beta { font-size:11px; color:var(--teal); background:var(--teal-light); padding:1px 8px; border-radius:20px; }
.cp-spin { width:13px; height:13px; border:2px solid var(--teal-light); border-top-color:var(--teal); border-radius:50%; animation:cp-rot .7s linear infinite; flex-shrink:0; }
.cp-ellipsis::after { content:''; animation:cp-dots 1.2s steps(4,end) infinite; }
@keyframes cp-dots { 0%{content:''} 25%{content:'.'} 50%{content:'..'} 75%{content:'...'} }
@keyframes cp-rot { to { transform:rotate(360deg) } }
@keyframes cp-slide { from { transform:translateX(30px); opacity:.4 } to { transform:none; opacity:1 } }
@keyframes cp-fadein { from { opacity:0; transform:translateX(6px) } to { opacity:1 } }
@keyframes cp-pulse { 0%,100%{ box-shadow:-4px 4px 16px rgba(0,137,123,.30) } 50%{ box-shadow:-4px 4px 22px rgba(0,137,123,.55) } }
.cp-task { display:flex; flex-direction:column; gap:3px; width:100%; text-align:left; padding:14px 16px; border:1px solid var(--border); border-radius:12px; background:var(--surface); cursor:pointer; font-family:inherit; transition:.14s; }
.cp-task:hover { border-color:var(--teal); background:var(--teal-light); }
.cp-fab { position:fixed; right:22px; bottom:22px; width:48px; height:48px; border-radius:50%; border:none; cursor:pointer; display:grid; place-items:center; z-index:1190; transition:transform .16s;
  background:radial-gradient(120% 120% at 32% 26%, #34c3b0 0%, #00a08e 42%, #00796b 74%, #005a4f 100%);
  box-shadow:0 6px 18px rgba(0,120,107,.42), inset 0 0 0 1px rgba(0,70,60,.28); }
.cp-fab::before { content:''; position:absolute; inset:-9px; border-radius:50%; z-index:-1;
  background:radial-gradient(circle, rgba(0,168,148,.6), rgba(0,168,148,0) 68%); filter:blur(8px); animation:cp-fabglow 3s ease-in-out infinite; }
.cp-fab:hover { transform:translateY(-2px) scale(1.04); }
.cp-fab svg { filter:drop-shadow(0 1px 1.5px rgba(0,45,38,.55)); }
@keyframes cp-fabglow { 0%,100%{ opacity:.55; transform:scale(1) } 50%{ opacity:1; transform:scale(1.1) } }
.cp-fabpop { position:fixed; right:22px; bottom:82px; width:372px; max-width:calc(100vw - 32px); height:540px; max-height:calc(100vh - 130px); background:var(--surface); border:1px solid var(--border); border-radius:16px; box-shadow:0 18px 50px rgba(0,0,0,.20); z-index:1190; display:flex; flex-direction:column; overflow:hidden; animation:cp-pop .18s ease; }
@keyframes cp-pop { from { opacity:0; transform:translateY(12px) scale(.98) } to { opacity:1; transform:none } }
.cp-glowwrap { position:relative; }
.cp-glowwrap::before { content:''; position:absolute; inset:-7px; border-radius:18px; z-index:0; pointer-events:none;
  background:linear-gradient(120deg, rgba(0,137,123,.55), rgba(43,179,163,.30), rgba(0,137,123,.55)); background-size:200% 200%;
  filter:blur(16px); opacity:.5; animation:cp-glow 5s ease-in-out infinite; }
.cp-glowwrap .cp-inputwrap { position:relative; z-index:1; }
@keyframes cp-glow { 0%,100%{ opacity:.4; background-position:0% 50% } 50%{ opacity:.72; background-position:100% 50% } }
.cp-step { animation:cp-stepin .28s ease; }
@keyframes cp-stepin { from { opacity:0; transform:translateY(3px) } to { opacity:1; transform:none } }
.cp-shimmer { background:linear-gradient(90deg, var(--text2) 30%, var(--teal) 50%, var(--text2) 70%); background-size:200% 100%;
  -webkit-background-clip:text; background-clip:text; -webkit-text-fill-color:transparent; color:transparent; animation:cp-shimmer 1.5s linear infinite; }
@keyframes cp-shimmer { 0%{ background-position:200% 0 } 100%{ background-position:-200% 0 } }
`;
