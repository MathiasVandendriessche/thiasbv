"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { getTranslations, type Language } from "@/lib/i18n";

type FormStatus = "idle" | "sending" | "sent" | "error";

const SENT_CLASS = "rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 ring-1 ring-emerald-200";

const EMPTY_FORM = { name: "", email: "", phone: "", message: "", website: "" };

export default function ContactForm({ lang = 'nl' }: { lang?: Language }) {
  const t = getTranslations(lang);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [status, setStatus] = useState<FormStatus>("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "sending") return;
    setStatus("sending");

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        setStatus("error");
        return;
      }
      setFormData(EMPTY_FORM);
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-semibold text-gray-900 mb-2"
        >
          {t.contact.form.name} *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          value={formData.name}
          onChange={handleChange}
          className="w-full rounded-xl border border-gray-300 px-4 py-3.5 text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all duration-200 bg-white hover:border-gray-400"
          placeholder={t.contact.form.namePlaceholder}
        />
      </div>

      <div>
        <label
          htmlFor="email"
          className="block text-sm font-semibold text-gray-900 mb-2"
        >
          {t.contact.form.email} *
        </label>
        <input
          type="email"
          id="email"
          name="email"
          required
          value={formData.email}
          onChange={handleChange}
          className="w-full rounded-xl border border-gray-300 px-4 py-3.5 text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all duration-200 bg-white hover:border-gray-400"
          placeholder={t.contact.form.emailPlaceholder}
        />
      </div>

      <div>
        <label
          htmlFor="phone"
          className="block text-sm font-semibold text-gray-900 mb-2"
        >
          {t.contact.form.phone}
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className="w-full rounded-xl border border-gray-300 px-4 py-3.5 text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all duration-200 bg-white hover:border-gray-400"
          placeholder={t.contact.form.phonePlaceholder}
        />
      </div>

      <div>
        <label
          htmlFor="message"
          className="block text-sm font-semibold text-gray-900 mb-2"
        >
          {t.contact.form.message} *
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={6}
          value={formData.message}
          onChange={handleChange}
          className="w-full rounded-xl border border-gray-300 px-4 py-3.5 text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all duration-200 resize-none bg-white hover:border-gray-400"
          placeholder={t.contact.form.messagePlaceholder}
        />
      </div>

      {/* Honeypot: invisible for people, bots tend to fill it in. */}
      <div aria-hidden="true" className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden">
        <label htmlFor="contact-website">
          {lang === 'nl' ? 'Laat dit veld leeg' : lang === 'en' ? 'Leave this field empty' : 'Laissez ce champ vide'}
        </label>
        <input
          type="text"
          id="contact-website"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={formData.website}
          onChange={handleChange}
        />
      </div>

      <button
        type="submit"
        disabled={status === "sending"}
        className="group w-full rounded-xl bg-primary-600 px-6 py-4 text-base font-semibold text-white shadow-lg shadow-primary-600/30 hover:bg-primary-700 hover:shadow-xl hover:shadow-primary-700/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-wait disabled:hover:shadow-lg flex items-center justify-center gap-2"
      >
        {t.contact.form.submit}
        <Send className="h-5 w-5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
      </button>

      <p role="status" className={status === "sent" ? SENT_CLASS : "sr-only"}>
        {status === "sent" ? t.contact.form.success : ""}
      </p>
      {status === "error" && (
        <p role="alert" className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800 ring-1 ring-rose-200">
          {t.contact.form.error}{" "}
          <a href="mailto:m@thiasbv.com" className="underline">m@thiasbv.com</a>
        </p>
      )}
    </form>
  );
}
