'use client';

/** Copilot — admin settings (design prototype, mock state). Compact: Enable Copilot +
 *  Organization context — one open box, with a Clay-style "Generate with AI" card that
 *  drafts it from the connected data (and optional website), then stays editable. */

import { useState } from 'react';
import { HelpCircle, Sparkles, ArrowDown, RotateCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCopilotStore } from '@/stores/copilotStore';

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn('relative h-6 w-11 rounded-full transition-colors flex-shrink-0', checked ? 'bg-primary' : 'bg-gray-300')}
    >
      <span className={cn('absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-all', checked ? 'left-[22px]' : 'left-0.5')} />
    </button>
  );
}

// A plausible draft, as if generated from the org's connected warehouse.
const GENERATED_DRAFT = `About us: education NGO operating across Maharashtra, running enrolment and survey programmes for students.

Key terms in our data:
• "Completed" survey = status 'done'
• "Enrolment" = the student_enrolments table
• A cohort runs April–March

Main datasets: enrolments, surveys, attendance, households.`;

export default function CopilotSettingsPage() {
  const enabled = useCopilotStore((s) => s.enabled);
  const setEnabled = useCopilotStore((s) => s.setEnabled);
  const [website, setWebsite] = useState('');
  const [context, setContext] = useState('');
  const [generating, setGenerating] = useState(false);
  const [wasGenerated, setWasGenerated] = useState(false);

  const generate = () => {
    setGenerating(true);
    setWasGenerated(false);
    setTimeout(() => {
      setContext(GENERATED_DRAFT);
      setGenerating(false);
      setWasGenerated(true);
    }, 1300);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header — platform style (matches Access) */}
      <div className="flex-shrink-0 border-b bg-background px-6 pt-6 pb-5">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          Copilot
          <HelpCircle className="h-5 w-5 text-muted-foreground" strokeWidth={1.5} />
        </h1>
        <p className="text-muted-foreground mt-1">Configure how Copilot interacts with your organization's data.</p>
      </div>

      {/* Compact content */}
      <div className="flex-1 min-h-0 overflow-y-auto px-6 py-6">
        <div className="max-w-2xl space-y-6">
          {/* Enable — compact inline row */}
          <div className="flex items-start justify-between gap-6">
            <div>
              <h3 className="text-base font-semibold">Enable Copilot</h3>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                Turn the AI assistant on or off for your workspace. When on, your questions and the relevant data are sent to the AI provider (Claude / OpenAI) to generate answers; PII is masked where possible but not guaranteed. Copilot can make mistakes.
              </p>
            </div>
            <Toggle checked={enabled} onChange={setEnabled} />
          </div>

          <div className="border-t" />

          {/* Organization context */}
          <div className={cn(!enabled && 'opacity-50 pointer-events-none')}>
            <h3 className="text-base font-semibold">Organization context</h3>
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
              Tell Copilot about your organization and how you'd like it to respond, so answers stay accurate and consistent for everyone.
            </p>

            {/* Generate card (Clay-style) */}
            <div className="mt-3 rounded-lg border bg-muted/40 p-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold">Generate with AI</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Let Copilot draft your context from your connected data — add your website for a bit more. Takes a few seconds.
              </p>
              <div className="flex gap-2 mt-3">
                <input
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="yourorg.org (optional)"
                  className="flex-1 rounded-md border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />
                <button
                  type="button"
                  onClick={generate}
                  disabled={generating}
                  className="flex-shrink-0 inline-flex items-center gap-1.5 rounded-md bg-primary text-white px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-60"
                >
                  {generating ? <RotateCw className="h-4 w-4 animate-spin" /> : context ? <RotateCw className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                  {generating ? 'Generating…' : context ? 'Regenerate' : 'Generate'}
                </button>
              </div>
            </div>

            {/* One org-context box */}
            <textarea
              value={context}
              onChange={(e) => { setContext(e.target.value); setWasGenerated(false); }}
              disabled={generating}
              className="w-full rounded-lg border bg-background p-3 text-sm outline-none focus:border-primary min-h-[150px] leading-relaxed mt-3 disabled:opacity-60"
              placeholder={'Or write it yourself.\n\ne.g. About us: education NGO across Maharashtra. “Completed” = status \'done\'. “Enrolment” = the student_enrolments table.'}
            />
            <div className="flex items-center justify-between gap-3 mt-2">
              <p className="text-xs text-muted-foreground">Acts as a lightweight semantic layer + system prompt for your org.</p>
              {wasGenerated && !generating && (
                <span className="text-xs text-primary inline-flex items-center gap-1 flex-shrink-0"><Sparkles className="h-3.5 w-3.5" /> AI draft — review &amp; edit before saving</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sticky footer */}
      <div className="flex-shrink-0 border-t bg-background px-6 py-4 flex gap-3">
        <button className="px-6 py-2.5 rounded-md bg-primary text-white text-sm font-semibold tracking-wide uppercase shadow-xs hover:opacity-90 transition-opacity">Save</button>
        <button className="px-6 py-2.5 rounded-md border text-sm font-semibold tracking-wide uppercase hover:bg-accent transition-colors">Cancel</button>
      </div>
    </div>
  );
}
