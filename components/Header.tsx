"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import Logo from "./Logo";
import LanguageSwitcher from "./LanguageSwitcher";
import { getTranslations, type Language } from "@/lib/i18n";

export default function Header({ lang = 'nl' }: { lang?: Language }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = getTranslations(lang);

  const navigation = [
    { name: t.nav.home, href: `/${lang}` },
    { name: t.nav.services, href: `/${lang}/diensten` },
    { name: t.nav.experience, href: `/${lang}/ervaring` },
    { name: t.nav.contact, href: `/${lang}/contact` },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200/50 shadow-sm">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Top">
        <div className="flex h-20 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center group">
              <Logo className="h-12 w-auto transition-transform duration-200 group-hover:scale-105" />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-700 hover:text-primary-600 transition-colors duration-200 font-medium text-[15px] relative group"
              >
                {item.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-600 transition-all duration-200 group-hover:w-full" />
              </Link>
            ))}
            <LanguageSwitcher currentLang={lang} />
            <a
              href="tel:+32485119256"
              className="bg-primary-600 text-white px-6 py-2.5 rounded-lg hover:bg-primary-700 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
            >
              +32 485 11 92 56
            </a>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
              aria-controls="mobile-menu"
              aria-expanded="false"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Open hoofdmenu</span>
              {mobileMenuOpen ? (
                <X className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden" id="mobile-menu">
            <div className="space-y-1 px-2 pb-3 pt-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-primary-600"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="px-3 py-2">
                <LanguageSwitcher currentLang={lang} />
              </div>
              <a
                href="tel:+32485119256"
                className="block rounded-md px-3 py-2 text-base font-medium bg-primary-600 text-white hover:bg-primary-700"
                onClick={() => setMobileMenuOpen(false)}
              >
                +32 485 11 92 56
              </a>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
