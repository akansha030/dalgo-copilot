'use client';

/** Dalgo Copilot conversation UI (design unchanged from the prototype). Reads shared state
 *  from useCopilotStore so the drawer and the /copilot full page show the same chat. */

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useCopilotStore, TASK_TEMPLATES, MODELS } from '@/stores/copilotStore';
/* Launch flags — feedback thumbs are deferred to the full release (Sep 8 call). Flip to true to bring them back. */
const SHOW_FEEDBACK = false;
/* Freshness (mock) — "when was the underlying data last updated?" for the answer anatomy. */
const FRESHNESS = 'today, 6:02 am';

/* icons */
/* Copilot mark — 4-point concave star (traced from Akansha's logo).
   One shape, two treatments: `grad` = the teal→cyan brand gradient, otherwise a flat/mono fill. */
export const STAR_PATH = 'M12 .5 C12.4 8.2 15.8 11.6 23.5 12 C15.8 12.4 12.4 15.8 12 23.5 C11.6 15.8 8.2 12.4 .5 12 C8.2 11.6 11.6 8.2 12 .5 Z';

export const Sparkle = ({ s = 18, c = 'currentColor', grad = false }: { s?: number; c?: string; grad?: boolean }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
    <path d={STAR_PATH} fill={grad ? 'url(#cp-star-grad)' : c} />
  </svg>
);

/* Mono version for the platform sidebar nav — inherits currentColor and takes a className
   so it drops in where a lucide icon was. */
export const CopilotMark = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path d={STAR_PATH} fill="currentColor" />
  </svg>
);

/* Thinking indicator — the Dalgo "logo animation" from Figma (Dalgo 2.0 → Copilot → node 3837:1628).
   Four petals, each drawn twice: a pale base with a gradient copy layered on top. The gradient
   copies fade in staggered (26% / 55% / 95%) while the whole mark rotates through 90° quadrants,
   on a 3s loop. Geometry + easing curves taken straight from the Figma keyframes. */
const PETAL = {
  tl: 'M145.631 116.362C147.208 113.989 148.67 111.529 150.001 109.012C157.09 95.7743 161.112 80.662 161.112 64.625H141.667C141.667 73.3128 140.336 82.9489 137.501 90.6667C130.202 110.611 115.777 125.035 95.834 132.333C105.448 134.742 110.093 138.662 118.404 143.588C129.24 136.477 138.513 127.196 145.624 116.368L145.631 116.362Z',
  bl: 'M145.632 180.542C140.706 188.853 139.91 194.56 137.501 204.167C130.202 184.222 111.61 167.354 91.6674 160.056C83.9417 157.22 75.3488 158.333 66.6689 158.333V137.833C82.7064 137.833 97.8171 141.856 111.056 148.945C113.573 150.276 116.04 151.744 118.406 153.314C129.242 160.425 138.515 169.706 145.626 180.534L145.632 180.542Z',
  tr: 'M208.334 137.5C188.389 130.201 169.799 115.776 162.5 95.8334C160.092 105.447 159.296 109.044 154.37 117.355C161.481 128.191 170.762 137.464 181.59 144.575C183.963 146.152 186.423 147.613 188.94 148.944C202.178 156.033 217.29 160.055 233.327 160.055L233.334 141.667C224.646 141.667 216.052 140.336 208.334 137.5Z',
  br: 'M154.37 180.542C152.793 182.914 151.332 185.374 150.001 187.891C142.912 201.129 138.89 216.241 138.89 232.278H158.334C158.334 223.591 159.665 211.884 162.5 204.167C169.799 184.222 184.224 169.798 204.167 162.5C194.553 160.091 189.909 158.242 181.598 153.315C170.761 160.426 161.481 169.713 154.37 180.542Z',
};
const PALE = '#E8F4F3';
const LGStops = () => (
  <>
    <stop stopColor="#00897B" />
    <stop offset="0.5" stopColor="#5DD0EA" />
    <stop offset="0.75" stopColor="#00A08E" />
    <stop offset="1" stopColor="#376DA8" />
  </>
);

export const ThinkingLogo = ({ s = 22 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="64 62.4 172 172" fill="none" style={{ flexShrink: 0, display: 'block' }} aria-hidden="true">
    <g className="cp-logo-spin">
      {/* pale base — all four petals */}
      <path d={PETAL.tl} fill={PALE} />
      <path d={PETAL.bl} fill={PALE} />
      <path d={PETAL.tr} fill={PALE} />
      <path d={PETAL.br} fill={PALE} />
      {/* gradient copies — bottom-left is always lit, the rest fade in staggered */}
      <path d={PETAL.bl} fill="url(#cp-lg-bl)" />
      <path className="cp-logo-p1" d={PETAL.tl} fill="url(#cp-lg-tl)" />
      <path className="cp-logo-p2" d={PETAL.tr} fill="url(#cp-lg-tr)" />
      <path className="cp-logo-p3" d={PETAL.br} fill="url(#cp-lg-br)" />
    </g>
    <defs>
      <linearGradient id="cp-lg-tl" x1="106.986" y1="64.625" x2="151.258" y2="64.7683" gradientUnits="userSpaceOnUse"><LGStops /></linearGradient>
      <linearGradient id="cp-lg-tr" x1="167.86" y1="95.8333" x2="221.413" y2="96.0911" gradientUnits="userSpaceOnUse"><LGStops /></linearGradient>
      <linearGradient id="cp-lg-br" x1="150.041" y1="153.315" x2="194.313" y2="153.459" gradientUnits="userSpaceOnUse"><LGStops /></linearGradient>
      <linearGradient id="cp-lg-bl" x1="80.1582" y1="137.834" x2="133.711" y2="138.083" gradientUnits="userSpaceOnUse"><LGStops /></linearGradient>
    </defs>
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
  pencil: 'M12 20h9 M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z',
  chart: 'M4 20V10M10 20V4M16 20v-7M22 20H2',
  copy: 'M9 9h10a2 2 0 012 2v10a2 2 0 01-2 2H9a2 2 0 01-2-2V11a2 2 0 012-2z M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1',
  check: 'M20 6L9 17l-5-5',
  stop: 'M7 7h10v10H7z',
  power: 'M12 2v10M18.36 6.64a9 9 0 11-12.73 0',
  warn: 'M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01',
};

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

/* Clean, distinct preview art for each empty-state task card. Each maps to what the card does:
   0 = Get an Insight (trend + delta), 1 = Build insight (chart + KPI),
   2 = Check your data (sync health), 3 = What can Dalgo do? (platform feature grid). */
function TaskThumb({ i }: { i: number }) {
  const T = '#00897b', TL = '#bfe3dd', TLL = '#e4f1ef', INK = '#334155', MUT = '#dde5e9', UP = '#12a594', AMB = '#e0a13a';
  const panel = (x: number, y: number, w: number, h: number) => <rect x={x} y={y} width={w} height={h} rx={9} fill="#fff" stroke={MUT} />;
  return (
    <svg viewBox="0 0 220 132" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" style={{ display: 'block' }}>
      <rect x="0" y="0" width="220" height="132" rx="10" fill="#f1f6f6" />
      {i === 0 && (
        <g transform="translate(26,20)">
          {panel(0, 0, 168, 92)}
          <rect x="14" y="14" width="46" height="6" rx="3" fill={MUT} />
          <rect x="116" y="9" width="40" height="17" rx="8.5" fill="#e4f6f1" />
          <path d="M124 21 l4.5 -6.5 l4.5 6.5 z" fill={UP} />
          <rect x="134" y="15.5" width="16" height="5" rx="2.5" fill={UP} />
          <path d="M14 74 L40 60 L66 64 L92 46 L118 52 L152 30 L152 80 L14 80 Z" fill={TLL} />
          <polyline points="14,74 40,60 66,64 92,46 118,52 152,30" fill="none" stroke={T} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="152" cy="30" r="3.4" fill="#fff" stroke={T} strokeWidth="2" />
        </g>
      )}
      {i === 1 && (
        <g transform="translate(18,18)">
          {panel(0, 0, 148, 96)}
          <rect x="14" y="14" width="42" height="6" rx="3" fill={MUT} />
          {[26, 40, 30, 52, 44, 62].map((v, k) => (<rect key={k} x={16 + k * 21} y={80 - v} width="12" height={v} rx="2.5" fill={k % 2 ? T : TL} />))}
          {panel(104, 50, 86, 60)}
          <text x="118" y="82" fontSize="21" fontWeight="700" fill={INK} fontFamily="'Anek Latin',sans-serif">2.8k</text>
          <rect x="118" y="90" width="54" height="5" rx="2.5" fill={MUT} />
        </g>
      )}
      {i === 2 && (
        <g transform="translate(26,20)">
          {panel(0, 0, 168, 92)}
          <rect x="14" y="14" width="60" height="6" rx="3" fill={MUT} />
          <rect x="118" y="10" width="40" height="15" rx="7.5" fill="#e4f6f1" />
          <path d="M126 17.5 l2.4 2.4 l4 -4.6" fill="none" stroke={UP} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="136" y="15" width="16" height="5" rx="2.5" fill={UP} />
          {[0, 1, 2].map((r) => {
            const y = 38 + r * 17, ok = r < 2;
            return (
              <g key={r}>
                <circle cx="22" cy={y + 3} r="6.5" fill={ok ? '#e4f6f1' : '#fbf1dc'} />
                {ok
                  ? <path d={`M18.6 ${y + 3} l2.4 2.4 l4 -4.6`} fill="none" stroke={UP} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  : <circle cx="22" cy={y + 3} r="2.2" fill={AMB} />}
                <rect x="38" y={y} width={r === 1 ? 86 : 106} height="6" rx="3" fill={MUT} />
              </g>
            );
          })}
        </g>
      )}
      {i === 3 && (
        <g transform="translate(26,20)">
          {panel(0, 0, 168, 92)}
          <rect x="14" y="13" width="52" height="6" rx="3" fill={MUT} />
          {[0, 1, 2, 3, 4, 5].map((k) => {
            const col = k % 3, row = Math.floor(k / 3);
            const x = 14 + col * 51, y = 30 + row * 30, on = k === 0 || k === 4;
            return (
              <g key={k}>
                <rect x={x} y={y} width="43" height="24" rx="6" fill={on ? '#e4f6f1' : '#f5f9f9'} stroke={on ? TL : MUT} />
                <circle cx={x + 11} cy={y + 12} r="4" fill={on ? T : MUT} />
                <rect x={x + 19} y={y + 9} width="16" height="5" rx="2.5" fill={MUT} />
              </g>
            );
          })}
        </g>
      )}
    </svg>
  );
}

/* HITL clarifying question — flows inline with the conversation (no card), minimal option rows,
   a "Something else" free-text escape, and one action: Submit for a single question, Next when there are more. */
function ClarifyCard({ clarify, onSubmit, index = 0, total = 1 }: { clarify: { text: string; options: string[] }; onSubmit: (v: string) => void; index?: number; total?: number }) {
  const [pick, setPick] = useState<string | null>(null);
  const [text, setText] = useState('');
  const isOther = pick === '__other__';
  const canGo = isOther ? !!text.trim() : !!pick;
  const submit = () => { if (canGo) onSubmit(isOther ? text.trim() : (pick as string)); };
  return (
    <div>
      <div className="cp-ask-q">
        {clarify.text}
        {total > 1 && <span className="cp-ask-count">{index + 1} of {total}</span>}
      </div>
      <div className="cp-ask-opts">
        {clarify.options.map((o) => (
          <button key={o} className={'cp-ask-opt' + (pick === o ? ' on' : '')} onClick={() => setPick(o)}>
            <span className={'cp-ask-box' + (pick === o ? ' on' : '')}>{pick === o && <Ico d={P.check} s={11} c="#fff" sw={3} />}</span>
            <span>{o}</span>
          </button>
        ))}
        {isOther ? (
          <div className="cp-ask-opt on">
            <span className="cp-ask-box on"><Ico d={P.pencil} s={10} c="#fff" /></span>
            <input autoFocus className="cp-ask-input" placeholder="Tell me what you’re looking for…" value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') submit(); }} />
          </div>
        ) : (
          <button className="cp-ask-opt" onClick={() => setPick('__other__')}>
            <span className="cp-ask-box"><Ico d={P.pencil} s={10} c="var(--text3)" /></span>
            <span style={{ color: 'var(--text3)' }}>Something else</span>
          </button>
        )}
      </div>
      <button className="cp-createbtn" style={{ marginTop: 14 }} disabled={!canGo} onClick={submit}>
        {total > 1 ? 'Next' : 'Submit'}
      </button>
    </div>
  );
}

export function CopilotConversation({ compact, mini = false, onVisual }: { compact: boolean; mini?: boolean; onVisual?: () => void }) {
  const { msgs, input, busy, enabled, model, setModel, setInput, ask, editMessage, proposeCreate, approveQuery, cancelQuery, stop, patchAnswer } = useCopilotStore();
  const [modelOpen, setModelOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' }); }, [msgs]);
  const empty = msgs.length === 0;
  const [npsThanked, setNpsThanked] = useState<Record<number, boolean>>({});
  // Edit-a-question: which sent message is in edit mode, and its working draft.
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState('');
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [hoverId, setHoverId] = useState<number | null>(null); // which question is hovered → reveal its tools
  const [openSql, setOpenSql] = useState<Record<number, boolean>>({}); // confirm card: "View query" open
  const [openThought, setOpenThought] = useState<Record<number, boolean>>({}); // answer: "Thought for Xs" expanded
  const saveEdit = (id: number) => { if (!editDraft.trim()) return; editMessage(id, editDraft); setEditingId(null); };
  const copyMsg = (id: number, text: string) => {
    try { navigator.clipboard?.writeText(text); } catch { /* clipboard blocked — no-op in prototype */ }
    setCopiedId(id);
    setTimeout(() => setCopiedId((c) => (c === id ? null : c)), 1200);
  };

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
    <div style={{ maxWidth: compact ? '100%' : 760, margin: '0 auto', width: '100%', padding: compact ? '0 4px' : '0 8px' }}>
      <form onSubmit={(e) => { e.preventDefault(); ask(input); }} className={glow ? 'cp-glowwrap' : undefined}>
        <div className="cp-inputwrap" style={{ display: 'flex', flexDirection: 'column', gap: 8, border: '1px solid var(--border)', borderRadius: glow ? 18 : 14, padding: glow ? 18 : (mini ? 10 : 14), background: 'var(--surface)' }}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); ask(input); } }}
            placeholder="Ask about your program data…"
            rows={mini ? 1 : 2}
            style={{ width: '100%', border: 'none', outline: 'none', fontSize: 15, background: 'transparent', color: 'var(--text)', fontFamily: 'inherit', resize: 'none', lineHeight: 1.55, padding: '2px 4px', minHeight: mini ? 24 : (glow ? 112 : (compact ? 40 : 54)) }}
          />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <div style={{ position: 'relative' }}>
              <button type="button" className="cp-modelbtn" onClick={() => setModelOpen((v) => !v)} title="Switch model">
                {model} <span style={{ display: 'inline-flex', transform: modelOpen ? 'rotate(180deg)' : 'none', transition: '0.15s' }}><Ico d={P.chevron} s={13} c="var(--text3)" /></span>
              </button>
              {modelOpen && (
                <div className="cp-modelmenu">
                  {MODELS.map((mo) => (
                    <button type="button" key={mo} className={mo === model ? 'on' : undefined} onClick={() => { setModel(mo); setModelOpen(false); }}>{mo}</button>
                  ))}
                </div>
              )}
            </div>
            {busy ? (
              <button type="button" onClick={stop} className="cp-sendbtn" aria-label="Stop generating" title="Stop"><span style={{ width: 11, height: 11, borderRadius: 2, background: '#fff', display: 'block' }} /></button>
            ) : (
              <button type="submit" disabled={!input.trim()} className="cp-sendbtn" aria-label="Send"><Ico d={P.send} s={16} c="#fff" /></button>
            )}
          </div>
        </div>
      </form>
      {/* Disclaimer sits OUTSIDE the gradient-bordered form, as plain text */}
      {glow && (
        <div style={{ textAlign: 'center', fontSize: 12.5, color: 'var(--text3)', marginTop: 14 }}>
          Copilot can make mistakes. Check important results before you act on them.
        </div>
      )}
      {!glow && !mini && <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--text3)', marginTop: 8 }}>Copilot can make mistakes. Check important results before you act on them.</div>}
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      {empty && !mini ? (
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: compact ? '20px 12px' : '24px' }}>
          <div style={{ width: '100%', maxWidth: compact ? '100%' : 780, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 26 }}>
              <div className="cp-hero-title" style={{ fontSize: compact ? 26 : 38 }}>What would you like to know?</div>
              <div style={{ fontSize: compact ? 14 : 16, color: 'var(--text3)', lineHeight: 1.6, marginTop: 10, maxWidth: 520, marginLeft: 'auto', marginRight: 'auto' }}>
                Ask any question about your data — and turn the answers into charts and KPIs.
              </div>
            </div>
            {composer(true)}
            <div style={{ display: 'grid', gridTemplateColumns: compact ? '1fr' : '1fr 1fr', gap: 14, marginTop: compact ? 18 : 26, maxWidth: 760, marginLeft: 'auto', marginRight: 'auto' }}>
              {TASK_TEMPLATES.map((t, i) => (
                <button key={t.title} onClick={() => ask(t.q)} className="cp-taskcard">
                  <span className="cp-taskthumb"><TaskThumb i={i} /></span>
                  <span className="cp-tasktext">
                    <span className="cp-tasktitle">{t.title}</span>
                    <span className="cp-taskdesc">{t.desc}</span>
                  </span>
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
                <div style={{ height: '100%', minHeight: 200, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 16px' }}>
                  <div className="cp-hero-title" style={{ fontSize: 21 }}>What would you like to know?</div>
                  <div style={{ fontSize: 13, color: 'var(--text3)', marginTop: 8, lineHeight: 1.55 }}>
                    Ask any question about your data — and turn the answers into charts and KPIs.
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 18 }}>
                    {TASK_TEMPLATES.map((t) => (
                      <button key={t.title} onClick={() => ask(t.q)} className="cp-pill">{t.title}</button>
                    ))}
                  </div>
                </div>
              ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 22, padding: compact ? 0 : '0 8px' }}>
              {msgs.map((m) => {
                if (m.role === 'user') {
                  if (editingId === m.id) {
                    return (
                      <div key={m.id} style={{ alignSelf: 'flex-end', width: '100%', maxWidth: '85%' }}>
                        <div className="cp-editbox">
                          <textarea
                            autoFocus
                            value={editDraft}
                            onChange={(e) => setEditDraft(e.target.value)}
                            onFocus={(e) => { const v = e.target.value; e.target.value = ''; e.target.value = v; }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); saveEdit(m.id); }
                              if (e.key === 'Escape') { setEditingId(null); }
                            }}
                            rows={2}
                            style={{ width: '100%', border: 'none', outline: 'none', fontSize: 15, background: 'transparent', color: 'var(--text)', fontFamily: 'inherit', resize: 'none', lineHeight: 1.5 }}
                          />
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
                            <button className="cp-createbtn cp-createbtn-alt" style={{ padding: '6px 13px' }} onClick={() => setEditingId(null)}>Cancel</button>
                            <button className="cp-createbtn" style={{ padding: '6px 13px' }} onClick={() => saveEdit(m.id)} disabled={!editDraft.trim()}>Update</button>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return (
                    <div key={m.id} className="cp-userwrap" onMouseEnter={() => setHoverId(m.id)} onMouseLeave={() => setHoverId((h) => (h === m.id ? null : h))} style={{ alignSelf: 'flex-end', maxWidth: '85%', marginBottom: 14, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                      <div style={{ background: '#e9edf0', color: 'var(--text)', padding: '10px 14px', borderRadius: '12px 12px 4px 12px', fontSize: 15 }}>{m.text}</div>
                      <div className="cp-usertools" style={{ opacity: hoverId === m.id ? 1 : undefined }}>
                        <button className="cp-iconbtn" title="Copy" aria-label="Copy message" onClick={() => copyMsg(m.id, m.text)}>
                          <Ico d={copiedId === m.id ? P.check : P.copy} s={14} c={copiedId === m.id ? 'var(--teal)' : 'var(--text3)'} sw={copiedId === m.id ? 2.2 : 1.8} />
                        </button>
                        <button className="cp-iconbtn" title="Edit" aria-label="Edit message" disabled={busy} onClick={() => { setEditingId(m.id); setEditDraft(m.text); }}>
                          <Ico d={P.pencil} s={14} c="var(--text3)" />
                        </button>
                      </div>
                    </div>
                  );
                }
                // Latency / thinking: ONE line that changes in place (not a vertical stack).
                // A second muted line appears only while reading specific data (its source).
                if (m.kind === 'thinking') {
                  const current = m.steps[Math.min(m.step, m.steps.length - 1)] ?? '';
                  return (
                    <div key={m.id} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      <div className="cp-step" style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 14 }}>
                        <ThinkingLogo s={22} />
                        <span className="cp-shimmer">{current}</span>
                      </div>
                      {m.source && <div style={{ fontSize: 12.5, color: 'var(--text3)', paddingLeft: 29 }}>Sources: {m.source}</div>}
                    </div>
                  );
                }
                // Confirm-before-run: Copilot proposes the table/query; the user approves, cancels, or picks another table.
                if (m.kind === 'confirm') {
                  return (
                    <div key={m.id} style={{ display: 'flex' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div>
                          {m.mode === 'create' ? (
                            <>
                              <div style={{ fontSize: 15, color: 'var(--text)', lineHeight: 1.55 }}>
                                I’ll create {m.createKind === 'kpi' ? 'a KPI' : 'a bar chart'} — <b>{m.title}</b> — and save it to {m.createKind === 'kpi' ? 'KPIs' : 'Charts'}.
                              </div>
                              <div style={{ fontSize: 13, color: 'var(--text3)', marginTop: 6 }}>You can edit it in {m.createKind === 'kpi' ? 'KPIs' : 'Charts'} afterwards.</div>
                            </>
                          ) : (
                            <>
                              <div style={{ fontSize: 15, color: 'var(--text)', lineHeight: 1.55 }}>
                                I’ll read the <b>{m.table}</b> table{m.scope ? <> — <span style={{ color: 'var(--text2)' }}>{m.scope}</span></> : null}. Run it against your data?
                              </div>
                              <button className="cp-link" style={{ marginTop: 10 }} onClick={() => setOpenSql((s) => ({ ...s, [m.id]: !s[m.id] }))}>
                                <span style={{ display: 'inline-flex', transform: openSql[m.id] ? 'rotate(180deg)' : 'none', transition: '0.15s' }}><Ico d={P.chevron} s={14} /></span>
                                View query
                              </button>
                              {openSql[m.id] && <pre className="cp-sql">{m.sql}</pre>}
                            </>
                          )}
                          {m.approved ? (
                            <div className="cp-approved">Approved — running now</div>
                          ) : (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 14, alignItems: 'center' }}>
                              <button className="cp-createbtn" style={{ textTransform: 'uppercase', letterSpacing: '.03em', padding: '9px 18px' }} onClick={() => approveQuery(m.id)}>
                                <Ico d={P.check} s={15} c="#fff" sw={2.4} /> {m.mode === 'create' ? 'Create chart' : 'Approve'}
                              </button>
                              <button className="cp-cancelbtn" onClick={() => cancelQuery(m.id)}>Cancel</button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                }
                const r = m.resp;
                const isData = !!(r.table || r.sql); // data answer → carries evidence + freshness
                const feedbackRow = !SHOW_FEEDBACK ? null : (
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
                  <div key={m.id} style={{ display: 'flex' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {r.clarify ? (
                        <ClarifyCard clarify={r.clarify} onSubmit={(v) => ask(v)} />
                      ) : r.variant ? (
                        <div>
                          {/* No box — limits and failures read as plain text, like any other answer */}
                          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                            <span style={{ flexShrink: 0, marginTop: 1 }}>
                              {r.variant === 'error'
                                ? <Ico d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01" s={18} c="#e05353" />
                                : r.variant === 'scope'
                                  ? <Ico d="M17.94 17.94A10 10 0 0112 20C5 20 1 12 1 12a18 18 0 015.06-5.94M9.9 4.24A9 9 0 0112 4c7 0 11 8 11 8a18 18 0 01-2.16 3.19M1 1l22 22" s={18} c="var(--text3)" />
                                : r.variant === 'schema'
                                  ? <Ico d="M12 2c4.4 0 8 1.3 8 3s-3.6 3-8 3-8-1.3-8-3 3.6-3 8-3z M20 12c0 1.7-3.6 3-8 3s-8-1.3-8-3 M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5" s={18} c="var(--text3)" />
                                  : r.variant === 'stopped'
                                    ? <Ico d="M12 22a10 10 0 100-20 10 10 0 000 20z M15 9H9v6h6z" s={18} c="var(--text3)" />
                                    : <Ico d="M21 21l-4.3-4.3M11 4a7 7 0 100 14 7 7 0 000-14z" s={18} c="var(--text3)" />}
                            </span>
                            <div style={{ fontSize: 14.5, color: 'var(--text2)', lineHeight: 1.55 }}>{r.note}</div>
                          </div>
                          {/* Error is text-only — the note already says to retry, and the composer is right there.
                              Choices are reserved for states where the user wouldn't know what else to ask. */}
                          {(r.variant === 'schema' || r.variant === 'stopped' || r.variant === 'error') ? null : feedbackRow}
                          {/* Recovery: next-best options as choices, never a blank box (Rule 4) */}
                          {r.alt && <div style={{ marginTop: 18 }}><ClarifyCard clarify={r.alt} onSubmit={(v) => ask(v)} /></div>}
                        </div>
                      ) : (
                        <>
                          {/* Collapsed "Thought for Xs" — the finished thinking, foldable (o1-style). */}
                          {m.thought && (
                            <div style={{ marginBottom: 10 }}>
                              <button className="cp-thought" onClick={() => setOpenThought((s) => ({ ...s, [m.id]: !s[m.id] }))}>
                                <span style={{ display: 'inline-flex', transform: openThought[m.id] ? 'rotate(180deg)' : 'none', transition: '0.15s' }}><Ico d={P.chevron} s={13} c="var(--text3)" /></span>
                                Thought for {m.thought.secs}s
                              </button>
                              {openThought[m.id] && (
                                <div className="cp-thought-body">
                                  {m.thought.steps.map((st, i) => (<div key={i} className="cp-thought-step">{st}</div>))}
                                  {m.thought.sql && (
                                    <div style={{ marginTop: 8 }}>
                                      <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text3)', marginBottom: 4 }}>Query</div>
                                      <pre className="cp-sql">{m.thought.sql}</pre>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
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
                          {/* Freshness — when the underlying data was last updated */}
                          {isData && (
                            <div style={{ fontSize: 12.5, color: 'var(--text3)', marginTop: 8 }}>Data last updated {FRESHNESS}</div>
                          )}
                          {r.chart && m.chartState === 'none' && (
                            <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
                              {/* Create routes through a confirm card — it reveals the name, type and source
                                  the button alone can't show (matches the Chart-created flow in Figma). */}
                              <button onClick={() => proposeCreate('chart', r)} className="cp-createbtn">
                                <Ico d={P.chart} s={15} c="#fff" /> Create chart
                              </button>
                            </div>
                          )}
                          {/* No inline preview for launch — creating just confirms + links out to the Charts/KPIs page to view & edit. */}
                          {r.chart && m.chartState === 'created' && (
                            <div className="cp-created">
                              <span style={{ color: 'var(--teal)', display: 'inline-flex' }}><Ico d={P.check} s={16} sw={2.4} /></span>
                              <span style={{ fontSize: 14, color: 'var(--text)' }}>{m.createdKind === 'kpi' ? 'KPI' : 'Chart'} created — <b>{r.chart.title}</b></span>
                              {/* Standalone demo has no /charts route — keep the affordance, don't 404 */}
                              <span className="cp-link" style={{ marginLeft: 'auto', cursor: 'default' }}>Open in {m.createdKind === 'kpi' ? 'KPIs' : 'Charts'} →</span>
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
      {/* Brand gradient for the Copilot star — defined once, referenced by <Sparkle grad /> */}
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
        <defs>
          <linearGradient id="cp-star-grad" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="#0e8f80" />
            <stop offset="55%" stopColor="#17b3ad" />
            <stop offset="100%" stopColor="#35d0e0" />
          </linearGradient>
        </defs>
      </svg>
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
.cp-sendbtn { display:inline-grid; place-items:center; width:34px; height:34px; border-radius:10px; border:none; cursor:pointer; transition:.14s; flex-shrink:0;
  background:linear-gradient(135deg,#46b9ab 0%,#12988a 55%,#00897b 100%);
  box-shadow:0 2px 8px rgba(0,137,123,.25), inset 0 1px 0 rgba(255,255,255,.25); }
.cp-sendbtn:hover { filter:brightness(1.06); }
.cp-sendbtn:disabled { background:#cfe3e0; box-shadow:none; cursor:not-allowed; }
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
.cp-histitem { display:flex; align-items:center; gap:8px; width:100%; text-align:left; padding:8px 10px; border:none; background:none; border-radius:8px; font-size:14px; color:var(--text2); cursor:pointer; font-family:inherit; min-width:0; }
.cp-histitem:hover { background:var(--surface-hover); color:var(--text); }
.cp-histrow { position:relative; display:flex; align-items:center; gap:2px; }
.cp-histrow .cp-histitem { flex:1; }
.cp-histdots { width:26px; height:26px; flex-shrink:0; opacity:0; transition:.12s; }
.cp-histrow:hover .cp-histdots, .cp-histdots.open { opacity:1; }
.cp-histmenu { position:absolute; right:0; top:34px; background:var(--surface); border:1px solid var(--border); border-radius:10px; box-shadow:0 8px 24px rgba(0,0,0,.12); padding:4px; min-width:132px; z-index:20; }
.cp-histmenu button { display:flex; align-items:center; gap:9px; width:100%; text-align:left; padding:8px 10px; border:none; background:none; font-size:13.5px; color:var(--text); border-radius:7px; cursor:pointer; font-family:inherit; }
.cp-histmenu button:hover { background:var(--surface-hover); }
.cp-histmenu button.danger { color:var(--alert); }
.cp-histedit { width:100%; border:1px solid var(--teal); border-radius:8px; padding:7px 10px; font-size:14px; font-family:inherit; color:var(--text); outline:none; box-shadow:0 0 0 3px rgba(0,137,123,.10); }
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
/* Thinking indicator — Dalgo logo animation (from Figma keyframes): 3s loop, quadrant rotation
   with staggered petal fade-ins. */
.cp-logo-spin { transform-origin:150px 148.4px; animation:cp-logo-spin 3s infinite; }
@keyframes cp-logo-spin {
  0%      { transform:rotate(0deg);   animation-timing-function:cubic-bezier(.5,0,.5,1); }
  33.82%  { transform:rotate(90deg);  animation-timing-function:cubic-bezier(.793,-.042,.208,.975); }
  66.85%  { transform:rotate(180deg); animation-timing-function:cubic-bezier(.5,0,.5,1); }
  100%    { transform:rotate(270deg); }
}
.cp-logo-p1 { animation:cp-logo-f1 3s linear infinite; }
.cp-logo-p2 { animation:cp-logo-f2 3s linear infinite; }
.cp-logo-p3 { animation:cp-logo-f3 3s linear infinite; }
@keyframes cp-logo-f1 { 0%{opacity:0} 26.37%{opacity:1} 100%{opacity:1} }
@keyframes cp-logo-f2 { 0%{opacity:0} 55.02%{opacity:1} 100%{opacity:1} }
@keyframes cp-logo-f3 { 0%{opacity:0} 95.1%{opacity:1} 100%{opacity:1} }
@media (prefers-reduced-motion: reduce) {
  .cp-logo-spin { animation:none; }
  .cp-logo-p1, .cp-logo-p2, .cp-logo-p3 { animation:none; opacity:1; }
}
.cp-ellipsis::after { content:''; animation:cp-dots 1.2s steps(4,end) infinite; }
@keyframes cp-dots { 0%{content:''} 25%{content:'.'} 50%{content:'..'} 75%{content:'...'} }
@keyframes cp-rot { to { transform:rotate(360deg) } }
@keyframes cp-slide { from { transform:translateX(30px); opacity:.4 } to { transform:none; opacity:1 } }
@keyframes cp-fadein { from { opacity:0; transform:translateX(6px) } to { opacity:1 } }
@keyframes cp-pulse { 0%,100%{ box-shadow:-4px 4px 16px rgba(0,137,123,.30) } 50%{ box-shadow:-4px 4px 22px rgba(0,137,123,.55) } }
.cp-task { display:flex; flex-direction:column; gap:3px; width:100%; text-align:left; padding:14px 16px; border:1px solid var(--border); border-radius:12px; background:var(--surface); cursor:pointer; font-family:inherit; transition:.14s; }
.cp-task:hover { border-color:var(--teal); background:var(--teal-light); }
/* Hero empty-state (matches design) */
.cp-hero-title { font-weight:800; letter-spacing:-0.8px; line-height:1.12; margin:0;
  background:linear-gradient(95deg,#0e5a52 0%,#00897b 42%,#22b7c2 100%);
  -webkit-background-clip:text; background-clip:text; -webkit-text-fill-color:transparent; color:transparent; }
.cp-disc-band { position:relative; z-index:1; text-align:center; font-size:12px; font-weight:500; color:var(--teal);
  padding:10px 12px; margin-top:8px; border-radius:12px; background:linear-gradient(90deg,#e6f4f2 0%,#eaf0fb 100%); }
.cp-taskcard { display:flex; align-items:stretch; width:100%; text-align:left; border:1px solid var(--border); border-radius:16px;
  background:var(--surface); cursor:pointer; overflow:hidden; transition:.16s; min-height:120px; font-family:inherit; }
.cp-taskcard:hover { border-color:var(--teal); box-shadow:0 10px 26px rgba(0,137,123,.10); transform:translateY(-2px); }
.cp-taskthumb { width:44%; flex-shrink:0; background:linear-gradient(135deg,#f5f9fa,#eef4f3); border-right:1px solid var(--divider); line-height:0; overflow:hidden; }
.cp-taskthumb svg { width:100%; height:100%; }
.cp-tasktext { display:flex; flex-direction:column; justify-content:center; gap:4px; padding:16px 18px; min-width:0; }
.cp-tasktitle { font-size:16px; font-weight:600; color:var(--text); }
.cp-taskdesc { font-size:13px; color:var(--text3); line-height:1.45; }
.cp-pill { padding:8px 14px; border-radius:12px; border:none; background:var(--bg); color:var(--text2); font-size:13px; font-weight:600; cursor:pointer; font-family:inherit; transition:.12s; }
.cp-pill:hover { background:var(--teal-light); color:var(--teal); }
/* FAB: glowing teal-cyan orb with a white star */
.cp-fab { position:fixed; right:22px; bottom:22px; width:56px; height:56px; border-radius:50%; border:none; cursor:pointer; display:grid; place-items:center; z-index:1190;
  background:radial-gradient(circle at 32% 26%, #8fe7dc 0%, #35c6b6 38%, #00a390 68%, #008779 100%);
  box-shadow:0 8px 22px rgba(0,150,136,.42), inset 0 1px 2px rgba(255,255,255,.55), inset 0 -3px 8px rgba(0,90,80,.32);
  animation:cp-fabbreath 4s ease-in-out infinite; transition:transform .16s; }
.cp-fab::before { content:''; position:absolute; inset:-12px; border-radius:50%; z-index:-1;
  background:radial-gradient(circle, rgba(43,196,182,.55) 0%, rgba(120,222,235,.30) 48%, rgba(140,220,205,0) 74%);
  filter:blur(11px); animation:cp-fabglow 3s ease-in-out infinite; }
.cp-fab svg { filter:drop-shadow(0 1px 2px rgba(0,70,62,.45)); }
.cp-fab:hover { transform:translateY(-2px) scale(1.05); }
@keyframes cp-fabglow { 0%,100%{ opacity:.5; transform:scale(1) } 50%{ opacity:1; transform:scale(1.14) } }
@keyframes cp-fabbreath { 0%,100%{ transform:scale(1) } 50%{ transform:scale(1.04) } }
.cp-fabpop { position:fixed; right:22px; bottom:88px; width:372px; max-width:calc(100vw - 32px); height:540px; max-height:calc(100vh - 130px); background:var(--surface); border:1px solid var(--border); border-radius:16px; box-shadow:0 18px 50px rgba(0,0,0,.20); z-index:1190; display:flex; flex-direction:column; overflow:hidden; animation:cp-pop .18s ease; }
@keyframes cp-pop { from { opacity:0; transform:translateY(12px) scale(.98) } to { opacity:1; transform:none } }
/* Composer: the gradient lives ONLY on the border — a 2px ring, plus a tight halo of the same
   gradient bleeding just outside it. No diffuse background blob. */
.cp-glowwrap { position:relative; padding:2px; border-radius:20px;
  background:linear-gradient(115deg,#2ec4b6 0%,#5dd0ea 38%,#a7e3dc 62%,#7fb3e8 100%);
  background-size:200% 200%; animation:cp-glow 6s ease-in-out infinite; }
.cp-glowwrap::before { content:''; position:absolute; inset:-9px; border-radius:28px; z-index:-1; pointer-events:none;
  background:linear-gradient(115deg,#2ec4b6 0%,#5dd0ea 38%,#a7e3dc 62%,#7fb3e8 100%);
  background-size:200% 200%; filter:blur(14px); opacity:.45; }
.cp-glowwrap .cp-inputwrap { position:relative; z-index:1; border:none!important; border-radius:18px!important; background:var(--surface); }
@keyframes cp-glow { 0%,100%{ background-position:0% 50% } 50%{ background-position:100% 50% } }
.cp-step { animation:cp-stepin .28s ease; }
@keyframes cp-stepin { from { opacity:0; transform:translateY(3px) } to { opacity:1; transform:none } }
/* Sent-message tools (copy + edit) sit below the question, right-aligned, revealed on hover — mirrors the answer's thumbs */
.cp-usertools { display:flex; gap:2px; margin-top:6px; opacity:0; transition:.12s; }
.cp-userwrap:hover .cp-usertools, .cp-usertools:focus-within { opacity:1; }
.cp-usertools .cp-iconbtn { width:28px; height:28px; }
.cp-usertools .cp-iconbtn:disabled { cursor:default; opacity:.4; }
.cp-editbox { border:1px solid var(--teal); border-radius:12px; padding:10px 12px; background:var(--surface); box-shadow:0 0 0 3px rgba(0,137,123,.10); }
/* Confirm-before-run — flows inline with the conversation: no card, no tint, no eyebrow */
.cp-cancelbtn { display:inline-flex; align-items:center; justify-content:center; padding:9px 18px; border-radius:9px;
  border:1px solid var(--border); background:var(--surface); color:var(--text); font-size:13px; font-weight:600;
  text-transform:uppercase; letter-spacing:.03em; cursor:pointer; font-family:inherit; transition:.12s; }
.cp-cancelbtn:hover { background:var(--surface-hover); }
.cp-sql { margin:8px 0 0; padding:10px 12px; background:var(--surface); border:1px solid var(--border); border-radius:8px; font-size:12.5px; font-family:ui-monospace,Menlo,monospace; color:#334; white-space:pre-wrap; line-height:1.5; overflow-x:auto; }
/* Keeps the record of what you approved, in place */
.cp-approved { margin-top:12px; padding-top:10px; border-top:1px solid #d6e9e5; font-size:12.5px; color:var(--text3); }
.cp-tablemenu { position:absolute; top:40px; left:0; background:var(--surface); border:1px solid var(--border); border-radius:10px; box-shadow:0 8px 24px rgba(0,0,0,.12); padding:4px; min-width:160px; z-index:10; }
.cp-tablemenu button { display:block; width:100%; text-align:left; padding:8px 10px; border:none; background:none; font-size:13.5px; color:var(--text); border-radius:7px; cursor:pointer; font-family:inherit; }
.cp-tablemenu button:hover { background:var(--surface-hover); }
.cp-tablemenu button.on { color:var(--teal); font-weight:600; }
.cp-created { display:flex; align-items:center; gap:8px; margin-top:14px; padding:10px 12px; border:1px solid var(--border); border-radius:10px; background:var(--bg); }
/* Composer model switcher */
.cp-modelbtn { display:inline-flex; align-items:center; gap:4px; border:none; background:none; color:var(--text2); font-size:13px; font-weight:500; cursor:pointer; font-family:inherit; padding:4px 7px; border-radius:8px; }
.cp-modelbtn:hover { background:var(--surface-hover); color:var(--text); }
.cp-modelmenu { position:absolute; bottom:38px; left:0; background:var(--surface); border:1px solid var(--border); border-radius:10px; box-shadow:0 8px 24px rgba(0,0,0,.14); padding:4px; min-width:150px; z-index:20; }
.cp-modelmenu button { display:block; width:100%; text-align:left; padding:8px 10px; border:none; background:none; font-size:13.5px; color:var(--text); border-radius:7px; cursor:pointer; font-family:inherit; }
.cp-modelmenu button:hover { background:var(--surface-hover); }
.cp-modelmenu button.on { color:var(--teal); font-weight:600; }
/* HITL clarifying question — inline with the conversation, no card, minimal rows */
.cp-ask-q { font-size:16px; font-weight:600; color:var(--text); line-height:1.5; }
.cp-ask-count { font-size:12px; font-weight:500; color:var(--text3); margin-left:8px; white-space:nowrap; }
.cp-ask-opts { display:flex; flex-direction:column; gap:1px; margin-top:10px; }
.cp-ask-opt { display:flex; align-items:center; gap:10px; width:calc(100% + 10px); margin-left:-10px; text-align:left; padding:8px 10px; border:none; border-radius:9px; background:none; font-size:15px; color:var(--text); cursor:pointer; font-family:inherit; transition:.12s; }
.cp-ask-opt:hover { background:var(--surface-hover); }
.cp-ask-opt.on { background:var(--teal-light); }
.cp-ask-box { width:18px; height:18px; flex-shrink:0; border:1.5px solid #cfd8dc; border-radius:6px; display:grid; place-items:center; background:var(--surface); transition:.12s; }
.cp-ask-box.on { background:var(--teal); border-color:var(--teal); }
.cp-ask-input { flex:1; border:none; outline:none; font-size:15px; font-family:inherit; color:var(--text); background:transparent; padding:0; }
.cp-createbtn:disabled { opacity:.45; cursor:not-allowed; }
/* "Thought for Xs" — collapsed thinking trace on a finished answer (o1-style) */
.cp-thought { display:inline-flex; align-items:center; gap:5px; border:none; background:none; color:var(--text3); font-size:13px; cursor:pointer; font-family:inherit; padding:0; }
.cp-thought:hover { color:var(--text2); }
.cp-thought-body { margin-top:8px; display:flex; flex-direction:column; gap:6px; border-left:2px solid var(--divider); padding:2px 0 2px 12px; animation:cp-stepin .2s ease; }
.cp-thought-step { font-size:13px; color:var(--text3); line-height:1.5; }
.cp-shimmer { background:linear-gradient(90deg, var(--text2) 30%, var(--teal) 50%, var(--text2) 70%); background-size:200% 100%;
  -webkit-background-clip:text; background-clip:text; -webkit-text-fill-color:transparent; color:transparent; animation:cp-shimmer 1.5s linear infinite; }
@keyframes cp-shimmer { 0%{ background-position:200% 0 } 100%{ background-position:-200% 0 } }
`;
