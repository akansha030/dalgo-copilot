/**
 * Dalgo Copilot — shared UI + conversation state (design prototype, mock data).
 * Lifted to a store so the drawer and the /copilot full page share ONE conversation
 * (expand ↔ dock preserves the chat). No backend — responses are canned + streamed.
 */
import { create } from 'zustand';

export type Row = (string | number)[];
export type Resp = {
  answer: string;
  assumptions: string;
  steps: string[];
  table?: { cols: string[]; rows: Row[] };
  sql?: string;
  chart?: { kind: 'line' | 'bar'; title: string; data: { label: string; value: number }[] };
  clarify?: { text: string; options: string[] };
  // Recovery: after a failure/empty result, offer next-best options as CHOICES (never a blank box)
  alt?: { text: string; options: string[] };
  // "no answer" / "can't read dashboards" / "your data isn't connected" / "something broke" / "you stopped it"
  variant?: 'nodata' | 'scope' | 'schema' | 'error' | 'stopped';
  note?: string;
  // low-confidence caveat shown INSIDE a normal answer (the "I'm not fully sure" state)
  caveat?: string;
};

export const SUGGESTIONS = [
  'How has enrolment changed over the last 6 months?',
  'How many surveys were completed in Pune last month?',
  'Which districts are performing well?',
  'Compare completed vs pending surveys by district',
];

/** Empty-state starters — DERIVED, not invented (see dalgo-copilot-foundation.md):
 *  Dalgo pillars × top support pains × the V1 capability boundary. */
export const TASK_TEMPLATES: { icon: string; title: string; desc: string; q: string; color: string }[] = [
  { icon: 'M3 17l6-6 4 4 8-8', title: 'Get an Insight', desc: 'Trends total and comparison of your data', q: 'Give me insights from my data', color: '#00897b' },
  { icon: 'M8 20V10M16 20V4M4 20h16', title: 'Build insight', desc: 'Turn your data into charts and KPI', q: 'Can you build charts?', color: '#00897b' },
  { icon: 'M21 12a9 9 0 11-9-9', title: 'Check your data', desc: 'Is everything synced and upto date', q: 'Is my data up to date?', color: '#00897b' },
  { icon: 'M12 17h.01M12 13a2 2 0 10-2-2', title: 'What can Dalgo do?', desc: 'Explore platform and its capabilities', q: 'What can you do?', color: '#00897b' },
];

export function getResponse(q: string): Resp {
  const s = q.toLowerCase();
  // Failure with recovery — offer next-best options as CHOICES, never a blank box (Rule 4)
  if (s.includes('goa')) {
    return {
      answer: '', assumptions: '',
      steps: ['Understanding your question', 'Looking for Goa in your data'],
      variant: 'nodata',
      note: "I couldn’t find any surveys for Goa — it isn’t in your connected datasets.",
      alt: { text: 'Want me to try one of these instead?', options: ['Completed surveys in Pune', 'Completed surveys by district', 'Widen to the last 6 months'] },
    };
  }
  // Your data isn't connected — the first thing a tester hits if the schema is wrong
  if (s.includes('not connected') || s.includes("can't see my data") || s.includes('wrong schema')) {
    return {
      answer: '', assumptions: '',
      steps: ['Understanding your question', 'Looking at your tables'],
      variant: 'schema',
      note: "I can’t find your programme data. The connected schema only has internal pipeline tables (dbt / monitoring) — not your survey or enrolment data. An admin needs to connect the dataset that holds it.",
    };
  }
  // Capability question — sets the V1 boundary honestly (support pain: knowledge gap)
  if (s.includes('what can you do') || s.includes('what can copilot') || s.includes('what can you help') || s.includes('how do i use')) {
    return {
      answer: "I answer questions from your connected data — counts, trends, comparisons — in plain English, and I can turn any answer into a chart or KPI. I can't yet read your existing dashboards, fix connections, or change pipelines; for those, the Ingest page and support have you covered.",
      assumptions: '',
      steps: ['Understanding your question'],
    };
  }
  // Data freshness / completeness — support pain "data missing", V1-answerable from the warehouse
  if (s.includes('up to date') || s.includes('up-to-date') || s.includes('synced') || s.includes('last sync') || s.includes('fresh') || (s.includes('data') && s.includes('missing'))) {
    return {
      answer: 'Your data looks up to date — all four datasets received new rows within the last day.',
      assumptions: 'Freshness = time since each dataset last received new rows.',
      steps: ['Understanding your question', 'Checking each dataset', 'Comparing last-sync times'],
      table: { cols: ['Dataset', 'Last synced', 'Rows'], rows: [['surveys', 'Today, 6:02 am', '12,482'], ['enrolments', 'Today, 6:02 am', '8,910'], ['attendance', 'Yesterday, 11:30 pm', '21,067'], ['households', 'Today, 6:02 am', '3,204']] },
      sql: 'SELECT source_table, MAX(loaded_at) AS last_synced, COUNT(*) AS rows\nFROM _sync_metadata\nGROUP BY source_table;',
    };
  }
  // Connection / source / pipeline questions — top support pains V1 can't act on → graceful redirect
  if (s.includes('connection') || s.includes('connector') || s.includes('pipeline') || s.includes('failing') || (s.includes('source') && (s.includes('add') || s.includes('delete') || s.includes('new')))) {
    return {
      answer: '', assumptions: '',
      steps: ['Understanding your question', 'Checking what I can access'],
      variant: 'scope',
      note: "I can't see or fix connections yet — I only read the data they load. The Ingest page shows each connection's status and last sync, and support can dig into one that keeps failing. Meanwhile, I can tell you if any data looks stale — just ask “is my data up to date?”",
    };
  }
  // "Can you build charts?" (the Build-charts card) — say yes, then ask which data to represent
  if (s.includes('chart') && (s.includes('can you') || s.includes('build') || s.includes('make') || s.includes('create'))) {
    return {
      answer: '', assumptions: '', steps: ['Understanding your question'],
      clarify: {
        text: 'Yes — I can build charts and KPIs from your data. Which data would you like represented?',
        options: ['Enrolment over the last 6 months', 'Completed surveys by district', 'Completed surveys in Pune'],
      },
    };
  }
  // Broad "give me insights" ask (the Get-an-insight card) — Copilot does the noticing
  if (s.includes('insight')) {
    const d = [
      { label: 'Feb', value: 1120 }, { label: 'Mar', value: 1180 }, { label: 'Apr', value: 1240 },
      { label: 'May', value: 1320 }, { label: 'Jun', value: 1410 }, { label: 'Jul', value: 1498 },
    ];
    return {
      answer: 'Three things stand out in your data right now.',
      assumptions: 'Looking across enrolments and surveys · last 6 months.',
      steps: ['Understanding your question', 'Scanning enrolments & surveys', 'Looking for notable changes', 'Summarising the highlights'],
      table: {
        cols: ['What', 'Why it matters'],
        rows: [
          ['Enrolment is up 34% (Feb–Jul)', 'Strongest growth streak this year'],
          ['Pune leads completed surveys (142)', 'Highest of all districts in July'],
          ['Nagpur has 61 pending surveys', 'Largest backlog — may need follow-up'],
        ],
      },
      sql: "SELECT metric, value, period\nFROM insight_highlights\nWHERE period = 'last_6_months'\nORDER BY significance DESC\nLIMIT 3;",
      chart: { kind: 'line', title: 'Monthly enrolment', data: d },
    };
  }
  // Text-only answer (a definition / explanation — no table or chart)
  if (s.includes('what does') || s.includes('definition') || s.includes('define ') || (s.includes('mean') && s.length < 70)) {
    return {
      answer: '“Completed” means a survey whose status is \'done\'. It does not include surveys that are still in progress, skipped, or pending review — those stay in the pending count.',
      assumptions: '',
      steps: ['Understanding your question', 'Checking your data dictionary'],
    };
  }
  if (s.includes('enrol') && s.includes('6')) {
    const d = [
      { label: 'Feb', value: 1120 }, { label: 'Mar', value: 1180 }, { label: 'Apr', value: 1240 },
      { label: 'May', value: 1320 }, { label: 'Jun', value: 1410 }, { label: 'Jul', value: 1498 },
    ];
    return {
      answer: 'Enrolment grew 34% over the last 6 months — from 1,120 in February to 1,498 in July.',
      assumptions: 'Counting active enrolments · “last 6 months” = Feb–Jul 2026.',
      steps: ['Understanding your question', 'Finding the enrolment dataset', 'Writing the query', 'Running it & summarising'],
      table: { cols: ['Month', 'Enrolled'], rows: d.map((x) => [x.label, x.value]) },
      sql: "SELECT month, COUNT(*) AS enrolled\nFROM enrolments\nWHERE status = 'active'\n  AND month BETWEEN '2026-02' AND '2026-07'\nGROUP BY month\nORDER BY month;",
      chart: { kind: 'line', title: 'Monthly enrolment', data: d },
    };
  }
  if (s.includes('pune') || (s.includes('survey') && s.includes('completed') && !s.includes('pending') && !s.includes('district'))) {
    const d = [
      { label: 'Wk 1', value: 31 }, { label: 'Wk 2', value: 38 }, { label: 'Wk 3', value: 36 }, { label: 'Wk 4', value: 37 },
    ];
    return {
      answer: '142 surveys were completed in Pune in July 2026.',
      assumptions: '“completed” = status ‘done’ · “last month” = July 2026.',
      steps: ['Understanding your question', 'Filtering to Pune', 'Counting completed surveys'],
      table: { cols: ['Week', 'Completed'], rows: d.map((x) => [x.label, x.value]) },
      sql: "SELECT week, COUNT(*) AS completed\nFROM surveys\nWHERE district = 'Pune'\n  AND status = 'done'\n  AND month = '2026-07'\nGROUP BY week;",
      chart: { kind: 'bar', title: 'Weekly completed surveys — Pune', data: d },
    };
  }
  if (s.includes('performing') || (s.includes('well') && s.includes('district'))) {
    return {
      answer: '',
      assumptions: '',
      steps: ['Understanding your question', 'Checking what “performing well” could mean'],
      clarify: {
        text: '“Performing well” can mean a few things. I read it as survey completion rate — by that, Pune (91%) and Nashik (88%) are highest. Did you mean something else?',
        options: ['Completed surveys by district', 'Enrolment over the last 6 months', 'Attendance summary'],
      },
    };
  }
  if (s.includes('compare') || (s.includes('completed') && s.includes('pending')) || (s.includes('completed') && s.includes('district'))) {
    const d = [
      { label: 'Pune', value: 142 }, { label: 'Nashik', value: 131 }, { label: 'Aurangabad', value: 121 },
      { label: 'Solapur', value: 120 }, { label: 'Nagpur', value: 98 },
    ];
    return {
      answer: 'Across 5 districts, 612 surveys are completed and 188 are pending. Pune has the most completed (142); Nagpur has the most pending (61).',
      assumptions: 'Current status as of 31 Jul 2026 · pending = not yet ‘done’.',
      steps: ['Understanding your question', 'Reading the surveys dataset', 'Grouping by district & status'],
      table: {
        cols: ['District', 'Completed', 'Pending'],
        rows: [['Pune', 142, 24], ['Nashik', 131, 29], ['Aurangabad', 121, 33], ['Solapur', 120, 41], ['Nagpur', 98, 61]],
      },
      sql: "SELECT district,\n  COUNT(*) FILTER (WHERE status='done')    AS completed,\n  COUNT(*) FILTER (WHERE status<>'done')   AS pending\nFROM surveys\nGROUP BY district\nORDER BY completed DESC;",
      chart: { kind: 'bar', title: 'Completed surveys by district', data: d },
    };
  }
  return {
    answer: "Here's what I found in your program data.",
    assumptions: 'Using your connected warehouse · latest available data.',
    steps: ['Understanding your question', 'Searching your data', 'Summarising'],
    table: { cols: ['Metric', 'Value'], rows: [['Total records', '4,912'], ['Districts', 5], ['Last updated', '31 Jul 2026']] },
    sql: 'SELECT * FROM program_summary LIMIT 100;',
  };
}

export type AnswerMsg = {
  id: number; role: 'assistant'; kind: 'answer'; resp: Resp;
  showTrace: boolean; chartState: 'none' | 'created' | 'deleted'; createdKind?: 'chart' | 'kpi'; vote: 0 | 1 | -1;
  // Collapsed "Thought for Xs" summary of the thinking that produced this answer (o1-style) — steps + the SQL.
  thought?: { secs: number; steps: string[]; sql?: string };
};
// Confirm-before-run: Copilot proposes the table + query and waits for the user to approve
// before it runs against the warehouse (bounds autonomy by stakes; a checkpoint before a live read).
export type ConfirmMsg = {
  id: number; role: 'assistant'; kind: 'confirm';
  table: string; scope: string; sql: string; resp: Resp;
  // 'run' = about to query the warehouse · 'create' = about to make a chart/KPI from a typed request
  mode?: 'run' | 'create';
  title?: string;   // what will be created (create mode)
  createKind?: 'chart' | 'kpi';
  approved?: boolean; // keeps the card in place with an "Approved — running now" stamp
};
export type Msg =
  | { id: number; role: 'user'; text: string }
  | { id: number; role: 'assistant'; kind: 'thinking'; steps: string[]; step: number; source?: string }
  | ConfirmMsg
  | AnswerMsg;

export type EditorItem = {
  kind: 'chart' | 'kpi';
  title: string;
  chartType: 'line' | 'bar';
  data: { label: string; value: number }[];
  saved: boolean;
};

let uid = 1;
const timers: ReturnType<typeof setTimeout>[] = [];

interface CopilotState {
  drawerOpen: boolean;
  msgs: Msg[];
  busy: boolean;
  input: string;
  enabled: boolean; // admin on/off — when false the whole surface shows a "turned off" state
  setEnabled: (v: boolean) => void;
  model: string; // selected AI model (composer switcher)
  setModel: (m: string) => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  setInput: (v: string) => void;
  reset: () => void;
  ask: (q: string) => void;
  editMessage: (id: number, text: string) => void; // edit a sent question → drop it + everything after, re-run
  proposeCreate: (kind: 'chart' | 'kpi', resp: Resp) => void; // Create button → confirm card (shows name/type/source)
  approveQuery: (id: number) => void; // confirm-before-run: run the proposed query
  cancelQuery: (id: number) => void;  // confirm-before-run: don't run
  changeTable: (id: number, table: string) => void; // confirm-before-run: point at a different dataset
  stop: () => void; // cancel an in-flight answer
  runScenario: (key: ScenarioKey) => void;
  patchAnswer: (id: number, fn: (m: AnswerMsg) => AnswerMsg) => void;

  // conversation history (mock sessions) — manageable: rename / delete
  history: { t: string; q: string }[];
  renameHistory: (i: number, title: string) => void;
  deleteHistory: (i: number) => void;

  // full-view: left conversation sidebar (New chat + History)
  copilotSidebarOpen: boolean;
  toggleCopilotSidebar: () => void;
  setCopilotSidebarOpen: (v: boolean) => void;

  // full-view: right editor panel (opens on Create chart / Create KPI)
  editorOpen: boolean;
  editorItem: EditorItem | null;
  openEditor: (item: EditorItem) => void;
  closeEditor: () => void;
  toggleEditor: () => void;
  setEditorTitle: (t: string) => void;
  setEditorType: (t: 'line' | 'bar') => void;
  saveEditor: () => void;

  // input attachments (mock)
  attachments: string[];
  addAttachment: (name: string) => void;
  removeAttachment: (name: string) => void;
}

const STEP_MS = 650; // ms between streamed working-steps

/** Preview scenarios — let the designer jump straight to each response state without typing.
 *  Each carries the user question that triggers it + the canned response to render. */
export type ScenarioKey = 'normal' | 'clarify' | 'textonly' | 'unsure' | 'freshness' | 'platform' | 'capability' | 'nodata' | 'scope' | 'error' | 'slow' | 'schema' | 'alternatives';
export const SCENARIOS: { key: ScenarioKey; label: string; q: string; resp: Resp }[] = [
  { key: 'normal', label: 'Answer + chart', q: 'How many surveys were completed in Pune last month?', resp: getResponse('How many surveys were completed in Pune last month?') },
  { key: 'clarify', label: 'Clarifying question', q: 'Which districts are performing well?', resp: getResponse('Which districts are performing well?') },
  { key: 'textonly', label: 'Text answer', q: 'What does “completed” mean in our data?', resp: getResponse('What does “completed” mean in our data?') },
  { key: 'freshness', label: 'Check data', q: 'Is my data up to date?', resp: getResponse('Is my data up to date?') },
  { key: 'platform', label: 'Platform question', q: 'Why does my KoboToolbox connection keep failing?', resp: getResponse('Why does my KoboToolbox connection keep failing?') },
  { key: 'capability', label: 'What can it do', q: 'What can you do?', resp: getResponse('What can you do?') },
  { key: 'unsure', label: 'Low confidence', q: 'Are we on track to hit our enrolment target?', resp: { answer: 'Probably — enrolment is up 34% over the last 6 months and trending toward ~1,500 a month.', assumptions: '', steps: ['Understanding your question', 'Looking for a target', 'Estimating from the trend'], table: { cols: ['Month', 'Enrolled'], rows: [['Jun', 1410], ['Jul', 1498]] }, caveat: 'Low confidence — I couldn’t find an actual enrolment target in your data, so this is an estimate from the recent trend. Set a target to get a real answer.' } },
  { key: 'slow', label: 'Takes a while', q: 'Compare completed vs pending surveys by district', resp: { ...getResponse('Compare completed vs pending surveys by district'), steps: ['Understanding your question', 'Finding the right datasets', 'Joining surveys with districts', 'Aggregating by status', 'Double-checking the numbers', 'Summarising the result'] } },
  { key: 'nodata', label: 'No answer found', q: 'How many surveys were completed in Goa last month?', resp: { answer: '', assumptions: '', steps: ['Understanding your question', 'Looking for Goa in your data', 'Counting completed surveys'], variant: 'nodata', note: "I couldn't find any surveys for Goa in August 2026 — Goa isn't in your connected datasets. Try a district you run programmes in, or widen the date range." } },
  { key: 'scope', label: "Can't read dashboards", q: 'Why is the number low on my Silt Coverage dashboard?', resp: { answer: '', assumptions: '', steps: ['Understanding your question', 'Checking what I can access'], variant: 'scope', note: "I can't read your existing dashboards, charts or KPIs yet — I can only answer from your raw data. Try asking the underlying question, e.g. “What's the silt coverage by district this quarter?”" } },
  { key: 'error', label: 'Something went wrong', q: 'How has enrolment changed over the last 6 months?', resp: { answer: '', assumptions: '', steps: ['Understanding your question', 'Reaching your warehouse'], variant: 'error', note: 'Something went wrong reaching your data. This is usually temporary — please try again in a moment.' } },
  { key: 'schema', label: 'Data not connected', q: 'How many surveys did we complete last month?', resp: { answer: '', assumptions: '', steps: ['Understanding your question', 'Looking at your tables'], variant: 'schema', note: 'I can’t find your programme data. The connected schema only has internal pipeline tables (dbt / monitoring) — not your survey or enrolment data. An admin needs to connect the dataset that holds it.' } },
  { key: 'alternatives', label: 'Failed → alternatives', q: 'How many surveys were completed in Goa last month?', resp: { answer: '', assumptions: '', steps: ['Understanding your question', 'Looking for Goa in your data'], variant: 'nodata', note: 'I couldn’t find any surveys for Goa — it isn’t in your connected datasets.', alt: { text: 'Want me to try one of these instead?', options: ['Completed surveys in Pune', 'Completed surveys by district', 'Widen to the last 6 months'] } } },
];

// The datasets Copilot can read (mock) — offered when the user wants to change the table.
export const TABLES = ['surveys', 'enrolments', 'attendance', 'households'];

// Model switcher — answers vary by model, so the choice is surfaced in the composer.
export const MODELS = ['Claude', 'OpenAI GPT'];

// Pull the first table name out of a SQL string, for the plain-English "I'll read the … table" line.
function tableFromSql(sql?: string): string {
  const m = sql?.match(/from\s+([a-z_][a-z0-9_]*)/i);
  return m ? m[1] : 'your data';
}

// The structure the AI actually goes through for a data question (staging shows these one-by-one).
// Live, this streams as a single changing line; afterwards it collapses into "Thought for Xs".
const DATA_STEPS = ['Understanding your question', 'Looking at your tables', 'Reading table structure', 'Checking data values', 'Running the query', 'Summarising the result'];

// Confirm-before-run is NOT for every query — reads are low-stakes and reversible, so they run directly.
// A go-ahead is only necessary when the query is higher-stakes:
//   1. it writes or changes data (INSERT / UPDATE / DELETE / DROP / ALTER / CREATE / TRUNCATE)
//   2. it's an unbounded scan — a SELECT with no filter (no WHERE and no GROUP BY) over the raw table
//   3. (future) it touches sensitive / PII columns, or the org set "always confirm" in settings
function queryNeedsConfirm(resp: Resp): boolean {
  const sql = (resp.sql || '').toLowerCase();
  if (!sql) return false;
  const isWrite = /\b(insert|update|delete|drop|alter|create|truncate)\b/.test(sql);
  const unbounded = /\bselect\b/.test(sql) && !/\bwhere\b/.test(sql) && !/\bgroup\s+by\b/.test(sql);
  return isWrite || unbounded;
}

/** Stream the thinking steps for `msgId`, then run `done()` after the last one. */
function streamSteps(set: SetFn, msgId: number, steps: string[], done: () => void) {
  steps.forEach((_, i) => {
    timers.push(setTimeout(() => {
      set((st) => ({
        msgs: st.msgs.map((x) => (x.id === msgId && x.role === 'assistant' && x.kind === 'thinking' ? { ...x, step: i } : x)),
      }));
    }, STEP_MS * (i + 1)));
  });
  timers.push(setTimeout(done, STEP_MS * (steps.length + 1)));
}

/** Shared streamed flow used by both a typed question and a preview scenario. */
function runFlow(set: SetFn, get: GetFn, q: string, resp: Resp) {
  if (get().busy) return;
  set({ busy: true, input: '' });
  const userId = uid++;
  const thinkId = uid++;
  const isQuery = !!resp.sql;
  const needsConfirm = isQuery && queryNeedsConfirm(resp); // only higher-stakes reads pause for a go-ahead
  const source = isQuery ? tableFromSql(resp.sql) : undefined;
  // Live thinking steps: brief before a confirm; the full data process for a direct read; the resp's own steps otherwise.
  const steps = needsConfirm ? ['Understanding your question'] : isQuery ? DATA_STEPS : resp.steps;
  const t0 = Date.now();
  set((st) => ({
    msgs: [...st.msgs, { id: userId, role: 'user', text: q }, { id: thinkId, role: 'assistant', kind: 'thinking', steps, step: 0, source: needsConfirm ? undefined : source }],
  }));
  streamSteps(set, thinkId, steps, () => {
    if (needsConfirm) {
      // Hand control back to the user: propose the table + query, wait for Approve / Cancel / Change.
      set((st) => ({
        busy: false,
        msgs: st.msgs.map((x) => (x.id === thinkId
          ? ({ id: thinkId, role: 'assistant', kind: 'confirm', table: tableFromSql(resp.sql), scope: resp.assumptions || '', sql: resp.sql || '', resp } as ConfirmMsg)
          : x)),
      }));
    } else {
      // Everything the AI did (steps + SQL) folds into the collapsed "Thought"; the answer stays clean.
      const thought = { secs: Math.max(1, Math.round((Date.now() - t0) / 1000)), steps, sql: resp.sql };
      set((st) => ({
        busy: false,
        msgs: st.msgs.map((x) => (x.id === thinkId ? { id: thinkId, role: 'assistant', kind: 'answer', resp, showTrace: false, chartState: 'none', vote: 0, thought } as AnswerMsg : x)),
      }));
    }
  });
}

/** Title for a typed create request: "create a chart of completed surveys by district" → "Completed surveys by district" */
function titleFromRequest(q: string): string {
  const m = q.match(/(?:of|for|showing)\s+(.+?)\s*$/i);
  const t = (m ? m[1] : 'your data').replace(/[.?!]+$/, '').trim();
  return t.charAt(0).toUpperCase() + t.slice(1);
}

/** A TYPED "create a chart of X" request → propose it and wait for a go-ahead (Rule 3).
 *  (Clicking the Create chart button needs no confirm — the click is the consent.) */
function runCreateRequest(set: SetFn, get: GetFn, q: string) {
  if (get().busy) return;
  set({ busy: true, input: '' });
  const userId = uid++, thinkId = uid++;
  const steps = ['Understanding your question', 'Checking your charts'];
  const title = titleFromRequest(q);
  set((st) => ({ msgs: [...st.msgs, { id: userId, role: 'user', text: q }, { id: thinkId, role: 'assistant', kind: 'thinking', steps, step: 0 }] }));
  streamSteps(set, thinkId, steps, () => {
    set((st) => ({
      busy: false,
      msgs: st.msgs.map((x) => (x.id === thinkId ? ({
        id: thinkId, role: 'assistant', kind: 'confirm', mode: 'create', title, table: '', scope: '', sql: '',
        resp: { answer: '', assumptions: '', steps: [], chart: { kind: 'bar', title, data: [{ label: 'Pune', value: 142 }, { label: 'Nashik', value: 131 }, { label: 'Aurangabad', value: 121 }, { label: 'Solapur', value: 120 }, { label: 'Nagpur', value: 98 }] } },
      } as ConfirmMsg) : x)),
    }));
  });
}

/** Approved a create proposal → make it, appended BELOW the stamped card. */
function createApproved(set: SetFn, m: ConfirmMsg) {
  const newId = uid++;
  const kind = m.createKind || 'chart';
  const steps = [kind === 'kpi' ? 'Creating KPI' : 'Creating chart'];
  set((st) => ({ busy: true, msgs: [...st.msgs, { id: newId, role: 'assistant', kind: 'thinking', steps, step: 0 }] }));
  streamSteps(set, newId, steps, () => {
    set((st) => ({
      busy: false,
      msgs: st.msgs.map((x) => (x.id === newId ? ({
        id: newId, role: 'assistant', kind: 'answer', resp: m.resp,
        showTrace: false, chartState: 'created', createdKind: kind, vote: 0,
        thought: { secs: 1, steps: ['Understanding your question', 'Checking your charts', steps[0]] },
      } as AnswerMsg) : x)),
    }));
  });
}

/** Approve a proposed query → run it (a short "running" stream) → show the answer.
 *  The answer is APPENDED so the stamped confirm card stays visible above it. */
function runApproved(set: SetFn, id: number, resp: Resp, source?: string) {
  const runSteps = ['Running the query', 'Summarising the result'];
  const t0 = Date.now();
  set((st) => ({
    busy: true,
    msgs: [...st.msgs, { id, role: 'assistant', kind: 'thinking', steps: runSteps, step: 0, source }],
  }));
  streamSteps(set, id, runSteps, () => {
    const thought = {
      secs: Math.max(1, Math.round((Date.now() - t0) / 1000)),
      steps: [...DATA_STEPS.slice(0, -2), ...runSteps],
      sql: resp.sql,
    };
    set((st) => ({
      busy: false,
      msgs: st.msgs.map((x) => (x.id === id ? { id, role: 'assistant', kind: 'answer', resp, showTrace: false, chartState: 'none', vote: 0, thought } as AnswerMsg : x)),
    }));
  });
}

type GetFn = () => CopilotState;
type SetFn = (
  partial: Partial<CopilotState> | ((state: CopilotState) => Partial<CopilotState>),
  replace?: boolean,
) => void;

export const useCopilotStore = create<CopilotState>((set, get) => ({
  drawerOpen: false,
  msgs: [],
  busy: false,
  input: '',
  enabled: true,
  history: [
    { t: 'Enrolment over 6 months', q: 'How has enrolment changed over the last 6 months?' },
    { t: 'Completed surveys in Pune', q: 'How many surveys were completed in Pune last month?' },
    { t: 'District performance', q: 'Which districts are performing well?' },
    { t: 'Completed vs pending', q: 'Compare completed vs pending surveys by district' },
  ],
  renameHistory: (i, title) => set((s) => ({ history: s.history.map((h, idx) => (idx === i ? { ...h, t: title } : h)) })),
  deleteHistory: (i) => set((s) => ({ history: s.history.filter((_, idx) => idx !== i) })),
  copilotSidebarOpen: false,
  editorOpen: false,
  editorItem: null,
  attachments: [],
  openDrawer: () => set({ drawerOpen: true }),
  closeDrawer: () => set({ drawerOpen: false }),
  setInput: (v) => set({ input: v }),
  reset: () => set({ msgs: [], editorOpen: false, editorItem: null, attachments: [] }),
  toggleCopilotSidebar: () => set((s) => ({ copilotSidebarOpen: !s.copilotSidebarOpen })),
  setCopilotSidebarOpen: (v) => set({ copilotSidebarOpen: v }),
  openEditor: (item) => set({ editorOpen: true, editorItem: item }),
  closeEditor: () => set({ editorOpen: false }),
  toggleEditor: () => set((s) => ({ editorOpen: !s.editorOpen })),
  setEditorTitle: (t) => set((s) => ({ editorItem: s.editorItem ? { ...s.editorItem, title: t } : s.editorItem })),
  setEditorType: (t) => set((s) => ({ editorItem: s.editorItem ? { ...s.editorItem, chartType: t } : s.editorItem })),
  saveEditor: () => set((s) => ({ editorItem: s.editorItem ? { ...s.editorItem, saved: true } : s.editorItem })),
  addAttachment: (name) => set((s) => (s.attachments.includes(name) ? s : { attachments: [...s.attachments, name] })),
  removeAttachment: (name) => set((s) => ({ attachments: s.attachments.filter((a) => a !== name) })),
  patchAnswer: (id, fn) =>
    set((st) => ({
      msgs: st.msgs.map((x) => (x.id === id && x.role === 'assistant' && x.kind === 'answer' ? fn(x) : x)),
    })),
  setEnabled: (v) => set({ enabled: v }),
  model: 'Claude',
  setModel: (m) => set({ model: m }),
  ask: (q) => {
    if (!q.trim() || get().busy) return;
    const s = q.toLowerCase();
    // A typed create request is the AI interpreting intent → confirm first (Rule 3).
    // "Can you build charts?" is a capability question, so it still goes to clarify.
    if (/\b(create|make|build)\b[^?]*\b(chart|kpi|graph)\b/.test(s) && !/\bcan you\b/.test(s)) {
      runCreateRequest(set, get, q);
      return;
    }
    runFlow(set, get, q, getResponse(q));
  },
  editMessage: (id, text) => {
    const t = text.trim();
    if (!t || get().busy) return;
    const st = get();
    const idx = st.msgs.findIndex((m) => m.id === id);
    if (idx === -1) return;
    // Drop the edited question and everything after it, then re-run with the new text.
    set({ msgs: st.msgs.slice(0, idx) });
    runFlow(set, get, t, getResponse(t));
  },
  proposeCreate: (kind, resp) => {
    if (get().busy) return;
    const id = uid++;
    set((st) => ({
      msgs: [...st.msgs, {
        id, role: 'assistant', kind: 'confirm', mode: 'create', createKind: kind,
        title: resp.chart?.title || 'Your data', table: '', scope: '', sql: '', resp,
      } as ConfirmMsg],
    }));
  },
  approveQuery: (id) => {
    const st = get();
    const m = st.msgs.find((x) => x.id === id && x.role === 'assistant' && x.kind === 'confirm') as ConfirmMsg | undefined;
    if (!m || st.busy) return;
    // Keep the card in place, stamped — so the record of what you approved persists.
    set((s) => ({ msgs: s.msgs.map((x) => (x.id === id && x.role === 'assistant' && x.kind === 'confirm' ? { ...x, approved: true } : x)) }));
    if (m.mode === 'create') { createApproved(set, m); return; }
    runApproved(set, uid++, m.resp, m.table);
  },
  cancelQuery: (id) => {
    set((st) => ({
      busy: false,
      msgs: st.msgs.map((x) => (x.id === id && x.role === 'assistant' && x.kind === 'confirm'
        ? ({ id, role: 'assistant', kind: 'answer', resp: { answer: '', assumptions: '', steps: [], variant: 'stopped', note: "Okay — I didn't run anything. Rephrase your question or pick a different table, and I'll try again." }, showTrace: false, chartState: 'none', vote: 0 } as AnswerMsg)
        : x)),
    }));
  },
  changeTable: (id, table) => {
    set((st) => ({
      msgs: st.msgs.map((x) => (x.id === id && x.role === 'assistant' && x.kind === 'confirm' ? { ...x, table } : x)),
    }));
  },
  stop: () => {
    timers.forEach(clearTimeout);
    timers.length = 0;
    set((st) => ({
      busy: false,
      msgs: st.msgs.map((x) =>
        x.role === 'assistant' && x.kind === 'thinking'
          ? ({ id: x.id, role: 'assistant', kind: 'answer', resp: { answer: '', assumptions: '', steps: [], variant: 'stopped', note: 'You stopped this response.' }, showTrace: false, chartState: 'none', vote: 0 } as AnswerMsg)
          : x,
      ),
    }));
  },
  runScenario: (key) => {
    const s = SCENARIOS.find((x) => x.key === key);
    if (s) runFlow(set, get, s.q, s.resp);
  },
}));
