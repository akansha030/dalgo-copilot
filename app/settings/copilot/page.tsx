'use client';

/** Dalgo Copilot — admin settings (design prototype, mock state).
 *  Two cards: Enable (which doubles as the consent statement) + Context (the facts the
 *  assistant reads with every question), then a standalone PII warning band. */

import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCopilotStore } from '@/stores/copilotStore';

/** Context is sent with every message, so it's capped to keep prompts a sane size. */
const CONTEXT_MAX = 5000;

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      data-testid="copilot-enable-toggle"
      className={cn('relative h-6 w-11 rounded-full transition-colors flex-shrink-0', checked ? 'bg-primary' : 'bg-gray-300')}
    >
      <span className={cn('absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-all', checked ? 'left-[22px]' : 'left-0.5')} />
    </button>
  );
}

export default function CopilotSettingsPage() {
  const enabled = useCopilotStore((s) => s.enabled);
  const setEnabled = useCopilotStore((s) => s.setEnabled);
  const [context, setContext] = useState('');
  const [savedContext, setSavedContext] = useState('');
  const dirty = context !== savedContext;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 border-b bg-background px-6 pt-6 pb-5">
        <h1 className="text-3xl font-bold">Dalgo Copilot</h1>
        <p className="text-muted-foreground mt-1">Enable the AI assistant for your organization and teach it about your data</p>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-6 py-6">
        <div className="max-w-3xl space-y-5">
          {/* Enable — the toggle IS the consent */}
          <div className="rounded-xl border bg-background p-6">
            <div className="flex items-start justify-between gap-8">
              <div>
                <h3 className="text-lg font-semibold">Enable Dalgo Copilot</h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                  Admins get an AI assistant that answers questions from your warehouse in plain language. By enabling this,
                  you approve that questions and query results from your warehouse are processed by an AI provider.
                </p>
              </div>
              <Toggle checked={enabled} onChange={setEnabled} />
            </div>
          </div>

          {/* Context — facts read with every question */}
          <div className={cn('rounded-xl border bg-background p-6', !enabled && 'opacity-50 pointer-events-none')}>
            <h3 className="text-lg font-semibold">Context</h3>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              Facts the assistant reads with every question — your vocabulary, fiscal year, and which tables matter.
              For example: &quot;&apos;SHG&apos; means self-help group&quot;, &quot;Our fiscal year runs April–March&quot;,
              &quot;Monthly program data lives in prod.survey_responses&quot;, &quot;District codes use 2019 boundaries&quot;.
            </p>

            <textarea
              id="copilot-context"
              data-testid="copilot-context-input"
              value={context}
              maxLength={CONTEXT_MAX}
              onChange={(e) => setContext(e.target.value)}
              placeholder="'SHG' means self-help group. Our fiscal year runs April–March. …"
              className="w-full mt-4 rounded-lg border bg-background p-3 text-sm outline-none focus:border-primary min-h-[110px] leading-relaxed resize-y"
            />

            <div className="flex items-center justify-between mt-2">
              <p className="text-sm text-muted-foreground">{savedContext ? 'Saved' : 'Not set yet'}</p>
              <p className="text-sm text-muted-foreground">{context.length}/{CONTEXT_MAX}</p>
            </div>

            <div className="flex gap-3 mt-4">
              <button
                type="button"
                disabled={!dirty}
                onClick={() => setSavedContext(context)}
                data-testid="copilot-context-save"
                className="px-6 py-2.5 rounded-md bg-primary text-white text-sm font-semibold shadow-xs hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setContext(savedContext)}
                data-testid="copilot-context-cancel"
                className="px-6 py-2.5 rounded-md border text-sm font-semibold tracking-wide uppercase hover:bg-accent transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>

          {/* PII warning — deliberately its own band, not buried in the paragraph above */}
          <div
            className="rounded-xl p-4 flex gap-3 items-start"
            style={{ background: '#fffaf0', border: '1px solid #ffe6bf' }}
          >
            <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: '#e08a1e' }} strokeWidth={1.8} />
            <p className="text-sm leading-relaxed" style={{ color: '#8a6d3b' }}>
              This text is sent to the AI provider with every Copilot message. Describe your data and vocabulary —
              never paste beneficiary names, phone numbers, or other personal information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
