"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { getTranslations, type Language } from "@/lib/i18n";

export default function ContactForm({ lang = 'nl' }: { lang?: Language }) {
  const t = getTranslations(lang);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitted(true);
        setFormData({ name: "", email: "", phone: "", message: "" });
        setTimeout(() => {
          setSubmitted(false);
        }, 5000);
      } else {
        alert(data.error || (lang === 'nl' ? 'Er is een fout opgetreden. Probeer het later opnieuw.' : lang === 'en' ? 'An error occurred. Please try again later.' : 'Une erreur s\'est produite. Veuillez réessayer plus tard.'));
      }
    } catch (error) {
      console.error('Form submission error:', error);
      const errorMsg = lang === 'nl' 
        ? 'Er is een fout opgetreden. Probeer het later opnieuw of neem direct contact op via info@thiasbv.com'
        : lang === 'en'
        ? 'An error occurred. Please try again later or contact us directly at info@thiasbv.com'
        : 'Une erreur s\'est produite. Veuillez réessayer plus tard ou contactez-nous directement à info@thiasbv.com';
      alert(errorMsg);
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

      <button
        type="submit"
        disabled={submitted}
        className="w-full rounded-xl bg-primary-600 px-6 py-4 text-base font-semibold text-white shadow-lg shadow-primary-600/30 hover:bg-primary-700 hover:shadow-xl hover:shadow-primary-700/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg flex items-center justify-center gap-2"
      >
        {submitted ? (
          <>
            <span className="inline-block animate-pulse">✓</span>
            {t.contact.form.submitted}
          </>
        ) : (
          <>
            {t.contact.form.submit}
            <Send className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </>
        )}
      </button>
    </form>
  );
}
