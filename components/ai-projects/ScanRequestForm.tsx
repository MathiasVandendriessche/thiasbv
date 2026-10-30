"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { CircleCheck, Send } from "lucide-react";
import type { Language } from "@/lib/i18n";
import type { QuickCheckCopy, ScanRequestErrorCode } from "@/lib/quick-check/copy";
import { parseScanRequestResponse } from "@/lib/quick-check/parse-response";

const MAX_FIELD_LENGTH = 200;
const CLIENT_TIMEOUT_MS = 20_000;

type SendState = { phase: "idle" } | { phase: "sending" } | { phase: "sent" } | { phase: "error"; error: ScanRequestErrorCode };

interface ScanRequestFormProps {
  domain: string;
  lang: Language;
  copy: QuickCheckCopy["request"];
  onCancel: () => void;
}

interface RequestFields {
  email: string;
  name: string;
  company: string;
  consent: boolean;
  website: string;
}

const EMPTY_FIELDS: RequestFields = { email: "", name: "", company: "", consent: false, website: "" };

const inputClass =
  "mt-1.5 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-base text-gray-900 placeholder-gray-400 transition-colors duration-200 hover:border-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20";
const labelClass = "block text-sm font-semibold text-gray-900";

async function sendRequest(fields: RequestFields, domain: string, lang: Language): Promise<SendState> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), CLIENT_TIMEOUT_MS);
  try {
    const res = await fetch("/api/scan-request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: fields.email.trim(),
        name: fields.name.trim(),
        company: fields.company.trim(),
        domain,
        consent: true,
        website: fields.website,
        lang,
      }),
      signal: controller.signal,
    });
    const parsed = parseScanRequestResponse(await res.json().catch(() => null));
    return parsed.ok ? { phase: "sent" } : { phase: "error", error: parsed.error };
  } catch {
    return { phase: "error", error: "network" };
  } finally {
    clearTimeout(timer);
  }
}

export default function ScanRequestForm({ domain, lang, copy, onCancel }: ScanRequestFormProps) {
  const [fields, setFields] = useState<RequestFields>(EMPTY_FIELDS);
  const [state, setState] = useState<SendState>({ phase: "idle" });
  const emailRef = useRef<HTMLInputElement>(null);
  const successRef = useRef<HTMLParagraphElement>(null);
  const id = useId();
  const sending = state.phase === "sending";

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  useEffect(() => {
    if (state.phase === "sent") successRef.current?.focus();
  }, [state.phase]);

  const update = <K extends keyof RequestFields>(key: K, value: RequestFields[K]) =>
    setFields((prev) => ({ ...prev, [key]: value }));

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (sending || !fields.consent) return;
    setState({ phase: "sending" });
    setState(await sendRequest(fields, domain, lang));
  };

  if (state.phase === "sent") {
    return (
      <p
        ref={successRef}
        tabIndex={-1}
        role="status"
        className="mt-4 flex gap-3 rounded-xl bg-sage-50 p-4 text-sm font-medium leading-6 text-sage-800 ring-1 ring-sage-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
      >
        <CircleCheck className="h-5 w-5 flex-shrink-0 text-sage-700" aria-hidden="true" />
        {copy.success}
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} aria-labelledby={`${id}-title`} className="relative mt-4 space-y-4">
      <div>
        <h5 id={`${id}-title`} className="text-lg font-bold text-gray-900">
          {copy.title}
        </h5>
        <p className="mt-1 text-sm leading-6 text-gray-600">{copy.intro}</p>
      </div>

      <div>
        <label htmlFor={`${id}-email`} className={labelClass}>
          {copy.email} <span aria-hidden="true">*</span>
        </label>
        <input
          ref={emailRef}
          id={`${id}-email`}
          type="email"
          autoComplete="email"
          required
          maxLength={254}
          value={fields.email}
          onChange={(e) => update("email", e.target.value)}
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={`${id}-name`} className={labelClass}>
            {copy.name} <span className="font-normal text-gray-500">({copy.optional})</span>
          </label>
          <input
            id={`${id}-name`}
            type="text"
            autoComplete="name"
            maxLength={MAX_FIELD_LENGTH}
            value={fields.name}
            onChange={(e) => update("name", e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor={`${id}-company`} className={labelClass}>
            {copy.company} <span className="font-normal text-gray-500">({copy.optional})</span>
          </label>
          <input
            id={`${id}-company`}
            type="text"
            autoComplete="organization"
            maxLength={MAX_FIELD_LENGTH}
            value={fields.company}
            onChange={(e) => update("company", e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor={`${id}-domain`} className={labelClass}>
          {copy.domain}
        </label>
        <input
          id={`${id}-domain`}
          type="text"
          readOnly
          value={domain}
          className={`${inputClass} cursor-default bg-gray-50 text-gray-700`}
        />
      </div>

      {/* Honeypot: invisible for people, bots tend to fill it in. */}
      <div aria-hidden="true" className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden">
        <label htmlFor={`${id}-website`}>{copy.honeypot}</label>
        <input
          id={`${id}-website`}
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={fields.website}
          onChange={(e) => update("website", e.target.value)}
        />
      </div>

      <div className="flex gap-3">
        <input
          id={`${id}-consent`}
          type="checkbox"
          required
          checked={fields.consent}
          onChange={(e) => update("consent", e.target.checked)}
          className="mt-1 h-4 w-4 flex-shrink-0 rounded border-gray-300 accent-primary-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
        />
        <label htmlFor={`${id}-consent`} className="text-sm leading-6 text-gray-700">
          {copy.consentBefore}
          <Link
            href={`/${lang}/privacy`}
            className="font-medium text-primary-700 underline underline-offset-2 hover:text-primary-800 focus-visible:rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-600"
          >
            {copy.consentLink}
          </Link>
          {copy.consentAfter} <span aria-hidden="true">*</span>
        </label>
      </div>

      <div aria-live="polite">
        {state.phase === "error" && (
          <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800 ring-1 ring-rose-200">
            {copy.errors[state.error]}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="submit"
          disabled={sending}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-5 py-3 text-base font-semibold text-white shadow-lg shadow-primary-600/30 transition-colors duration-200 hover:bg-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 active:bg-primary-800 disabled:cursor-wait disabled:opacity-70"
        >
          {sending ? copy.sending : copy.submit}
          <Send className="h-4 w-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl px-5 py-3 text-base font-semibold text-gray-700 transition-colors duration-200 hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
        >
          {copy.cancel}
        </button>
      </div>
    </form>
  );
}
