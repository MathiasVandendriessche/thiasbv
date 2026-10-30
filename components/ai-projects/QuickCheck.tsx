"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { ShieldCheck } from "lucide-react";
import QuickCheckResult from "@/components/ai-projects/QuickCheckResult";
import type { Language } from "@/lib/i18n";
import type { QuickCheckCopy, QuickCheckErrorCode } from "@/lib/quick-check/copy";
import { parseQuickCheckResponse } from "@/lib/quick-check/parse-response";
import type { CheckId, QuickCheckReport } from "@/lib/quick-check/types";

/** The server stops at 12 s; this only catches a connection that never answers. */
const CLIENT_TIMEOUT_MS = 20_000;
const MAX_DOMAIN_LENGTH = 253;
const CHECK_ORDER: readonly CheckId[] = ["tls", "headers", "cookies", "email"];

type CheckState =
  | { phase: "idle" }
  | { phase: "loading" }
  | { phase: "done"; report: QuickCheckReport }
  | { phase: "error"; error: QuickCheckErrorCode };

interface QuickCheckProps {
  lang: Language;
  copy: QuickCheckCopy;
}

async function requestCheck(domain: string): Promise<CheckState> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), CLIENT_TIMEOUT_MS);
  try {
    const res = await fetch("/api/quick-check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ domain }),
      signal: controller.signal,
    });
    const body: unknown = await res.json().catch(() => null);
    const parsed = parseQuickCheckResponse(body);
    return parsed.ok ? { phase: "done", report: parsed.report } : { phase: "error", error: parsed.error };
  } catch {
    return { phase: "error", error: "network" };
  } finally {
    clearTimeout(timer);
  }
}

export default function QuickCheck({ lang, copy }: QuickCheckProps) {
  const [domain, setDomain] = useState("");
  const [state, setState] = useState<CheckState>({ phase: "idle" });
  const resultHeadingRef = useRef<HTMLHeadingElement>(null);
  const ids = useId();
  const inputId = `${ids}-domain`;
  const errorId = `${ids}-error`;
  const loading = state.phase === "loading";

  useEffect(() => {
    if (state.phase === "done") resultHeadingRef.current?.focus();
  }, [state]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = domain.trim();
    if (value === "" || loading) return;
    setState({ phase: "loading" });
    setState(await requestCheck(value));
  };

  const invalid = state.phase === "error" && state.error === "invalid_domain";

  return (
    <section
      aria-labelledby={`${ids}-title`}
      className="relative overflow-hidden rounded-2xl bg-white shadow-2xl shadow-primary-900/10 ring-1 ring-gray-900/10"
    >
      <div className="bg-gradient-to-br from-primary-600 to-primary-800 px-5 py-6 text-white sm:px-7">
        <h3 id={`${ids}-title`} className="flex items-center gap-2 text-xl font-bold">
          <ShieldCheck className="h-6 w-6 flex-shrink-0 text-primary-200" aria-hidden="true" />
          {copy.title}
        </h3>
        <p className="mt-2 text-sm leading-6 text-primary-100">{copy.intro}</p>

        <form onSubmit={onSubmit} className="mt-5">
          <label htmlFor={inputId} className="block text-sm font-semibold text-white">
            {copy.domainLabel}
          </label>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <input
              id={inputId}
              name="domain"
              type="text"
              inputMode="url"
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              required
              maxLength={MAX_DOMAIN_LENGTH}
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder={copy.placeholder}
              aria-invalid={invalid || undefined}
              aria-describedby={invalid ? errorId : undefined}
              className="min-w-0 flex-1 rounded-xl border-0 bg-white px-4 py-3 text-base text-gray-900 placeholder-gray-400 ring-1 ring-white/20 focus:outline-none focus:ring-4 focus:ring-accent-yellow/70"
            />
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-accent-yellow px-5 py-3 text-base font-semibold text-gray-900 shadow-lg shadow-primary-900/30 transition-colors duration-200 hover:bg-yellow-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white active:bg-yellow-400 disabled:cursor-wait disabled:opacity-70"
            >
              {copy.button}
            </button>
          </div>
        </form>
      </div>

      <div className="px-5 py-6 sm:px-7">
        <div role="status" aria-live="polite">
          {loading && <LoadingState copy={copy} />}
          {state.phase === "error" && (
            <p id={errorId} className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800 ring-1 ring-rose-200">
              {copy.errors[state.error]}
            </p>
          )}
        </div>

        {state.phase === "done" && (
          <QuickCheckResult
            key={state.report.checkedAt}
            report={state.report}
            copy={copy}
            lang={lang}
            headingRef={resultHeadingRef}
          />
        )}

        {state.phase === "idle" && (
          <ul className="grid grid-cols-2 gap-2 text-sm text-gray-500">
            {CHECK_ORDER.map((id) => (
              <li key={id} className="rounded-lg bg-gray-50 px-3 py-2 ring-1 ring-gray-200">
                {copy.checkTitles[id]}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function LoadingState({ copy }: { copy: QuickCheckCopy }) {
  return (
    <div>
      <p className="text-sm font-medium text-gray-700">{copy.loading}</p>
      <ul className="mt-4 space-y-2" aria-hidden="true">
        {CHECK_ORDER.map((id, index) => (
          <li key={id} className="flex items-center gap-3 rounded-lg bg-gray-50 px-3 py-2.5 text-sm text-gray-600 ring-1 ring-gray-200">
            <span
              className="h-2.5 w-2.5 flex-shrink-0 animate-pulse rounded-full bg-primary-400 motion-reduce:animate-none"
              style={{ animationDelay: `${index * 200}ms` }}
            />
            {copy.checkTitles[id]}
          </li>
        ))}
      </ul>
    </div>
  );
}
