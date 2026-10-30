"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { Check, Info, Minus, TriangleAlert, X, type LucideIcon } from "lucide-react";
import ScanRequestForm from "@/components/ai-projects/ScanRequestForm";
import type { Language } from "@/lib/i18n";
import { fillTemplate, type QuickCheckCopy } from "@/lib/quick-check/copy";
import type { CheckResult, QuickCheckReport, Status } from "@/lib/quick-check/types";

interface StatusStyle {
  icon: LucideIcon;
  card: string;
  iconWrap: string;
  badge: string;
  bar: string;
}

/** Every status has its own icon and word, so color is never the only signal. */
const STATUS_STYLES: Record<Status, StatusStyle> = {
  good: {
    icon: Check,
    card: "bg-sage-50 ring-sage-200",
    iconWrap: "bg-sage-600 text-white",
    badge: "bg-sage-100 text-sage-800 ring-sage-200",
    bar: "bg-sage-500",
  },
  warn: {
    icon: TriangleAlert,
    card: "bg-yellow-50 ring-accent-yellow/50",
    iconWrap: "bg-accent-yellow text-gray-900",
    badge: "bg-accent-yellow/30 text-gray-900 ring-accent-yellow/60",
    bar: "bg-accent-yellow",
  },
  bad: {
    icon: X,
    card: "bg-rose-50 ring-rose-200",
    iconWrap: "bg-rose-600 text-white",
    badge: "bg-rose-100 text-rose-800 ring-rose-200",
    bar: "bg-rose-500",
  },
  unavailable: {
    icon: Minus,
    card: "bg-gray-50 ring-gray-200",
    iconWrap: "bg-gray-200 text-gray-600",
    badge: "bg-gray-100 text-gray-700 ring-gray-200",
    bar: "bg-gray-300",
  },
};

interface QuickCheckResultProps {
  report: QuickCheckReport;
  copy: QuickCheckCopy;
  lang: Language;
  headingRef: RefObject<HTMLHeadingElement | null>;
}

function messageFor(result: CheckResult, copy: QuickCheckCopy): string {
  const template = copy.messages[result.messageKey] ?? copy.messages[`${result.id}.unavailable`] ?? "";
  return fillTemplate(template, result.params ?? {});
}

export default function QuickCheckResult({ report, copy, lang, headingRef }: QuickCheckResultProps) {
  const [requestOpen, setRequestOpen] = useState(false);
  const requestButtonRef = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);

  // After "cancel" the form disappears: give focus back to the button that opened it.
  useEffect(() => {
    if (!requestOpen && wasOpen.current) requestButtonRef.current?.focus();
    wasOpen.current = requestOpen;
  }, [requestOpen]);

  const { ok, total } = report.summary;
  const summary = total === 0 ? copy.summaryNone : fillTemplate(copy.summary, { ok, total });

  return (
    <div>
      <h4
        ref={headingRef}
        tabIndex={-1}
        className="break-words text-sm font-semibold uppercase tracking-wider text-gray-500 focus:outline-none focus-visible:rounded focus-visible:ring-2 focus-visible:ring-primary-500"
      >
        {fillTemplate(copy.resultTitle, { domain: report.domain })}
      </h4>
      <p className="mt-1 text-2xl font-bold tracking-tight text-gray-900">{summary}</p>

      <div className="mt-3 flex gap-1.5" aria-hidden="true">
        {report.results.map((result) => (
          <span key={result.id} className={`h-1.5 flex-1 rounded-full ${STATUS_STYLES[result.status].bar}`} />
        ))}
      </div>

      <ul className="mt-5 space-y-3">
        {report.results.map((result) => (
          <ResultCard key={result.id} result={result} copy={copy} />
        ))}
      </ul>

      <p className="mt-5 flex gap-2 text-sm leading-6 text-gray-600">
        <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary-600" aria-hidden="true" />
        {copy.disclaimer}
      </p>

      <div className="mt-6 border-t border-gray-200 pt-6">
        <p className="text-sm leading-6 text-gray-700">{copy.request.ctaText}</p>
        {!requestOpen && (
          <button
            ref={requestButtonRef}
            type="button"
            onClick={() => setRequestOpen(true)}
            className="mt-4 w-full rounded-xl bg-primary-600 px-5 py-3 text-base font-semibold text-white shadow-lg shadow-primary-600/30 transition-colors duration-200 hover:bg-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 active:bg-primary-800 sm:w-auto"
          >
            {copy.request.button}
          </button>
        )}
        {requestOpen && (
          <ScanRequestForm
            domain={report.domain}
            lang={lang}
            copy={copy.request}
            onCancel={() => setRequestOpen(false)}
          />
        )}
      </div>
    </div>
  );
}

function ResultCard({ result, copy }: { result: CheckResult; copy: QuickCheckCopy }) {
  const style = STATUS_STYLES[result.status];
  const Icon = style.icon;

  return (
    <li className={`flex gap-3 rounded-xl p-4 ring-1 ${style.card}`}>
      <span className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${style.iconWrap}`}>
        <Icon className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="font-semibold text-gray-900">{copy.checkTitles[result.id]}</span>
          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ${style.badge}`}>
            {copy.statusLabels[result.status]}
          </span>
        </p>
        <p className="mt-1 break-words text-sm leading-6 text-gray-700">{messageFor(result, copy)}</p>
      </div>
    </li>
  );
}
