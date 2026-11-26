"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import Logo from "./Logo";
import LanguageSwitcher from "./LanguageSwitcher";
import { getTranslations, type Language } from "@/lib/i18n";

const PHONE_HREF = "tel:+32485119256";
const PHONE_LABEL = "+32 485 11 92 56";

function isCurrentPage(pathname: string, href: string, homeHref: string): boolean {
  if (href === homeHref) return pathname === homeHref;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Header({ lang = 'nl' }: { lang?: Language }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const t = getTranslations(lang);
  const homeHref = `/${lang}`;

  const navigation = [
    { name: t.nav.home, href: homeHref },
    { name: t.nav.services, href: `/${lang}/diensten` },
    { name: t.nav.experience, href: `/${lang}/ervaring` },
    { name: t.nav.aiProjects, href: `/${lang}/ai-projecten` },
    { name: t.nav.contact, href: `/${lang}/contact` },
  ];

  // The header edge only shows once content is actually underneath it.
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(([entry]) => setScrolled(!entry.isIntersecting));
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileMenuOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [mobileMenuOpen]);

  return (
    <>
      <div ref={sentinelRef} className="absolute left-0 top-0 h-px w-px" aria-hidden="true" />
      <header
        className="material-bar sticky top-0 z-50"
        data-scrolled={scrolled || mobileMenuOpen}
      >
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Top">
          <div className="flex h-16 items-center justify-between">
            <Link href={homeHref} className="btn flex items-center rounded-lg">
              <Logo className="h-10 w-auto" />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex md:items-center md:gap-6">
              {navigation.map((item) => {
                const current = isCurrentPage(pathname, item.href, homeHref);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    aria-current={current ? "page" : undefined}
                    className={`nav-link relative text-[15px] font-medium transition-colors duration-150 ${
                      current ? "text-primary-700" : "text-gray-700 hover:text-primary-700"
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              })}
              <LanguageSwitcher currentLang={lang} />
              <a
                href={PHONE_HREF}
                className="btn rounded-lg bg-primary-600 px-5 py-2 text-[15px] font-medium text-white hover:bg-primary-700"
              >
                {PHONE_LABEL}
              </a>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                type="button"
                className="btn inline-flex h-11 w-11 items-center justify-center rounded-lg text-gray-700 hover:bg-gray-900/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500"
                aria-controls="mobile-menu"
                aria-expanded={mobileMenuOpen}
                onClick={() => setMobileMenuOpen((open) => !open)}
              >
                <span className="sr-only">{mobileMenuOpen ? "Sluit hoofdmenu" : "Open hoofdmenu"}</span>
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </nav>

        {/* Mobile Navigation: drops from the bar it belongs to, and returns the same way */}
        <div
          id="mobile-menu"
          data-open={mobileMenuOpen}
          inert={!mobileMenuOpen}
          className="popover absolute inset-x-0 top-full origin-top border-t border-gray-900/5 bg-white shadow-lg shadow-gray-900/10 md:hidden"
        >
          <div className="space-y-1 px-4 pb-4 pt-2">
            {navigation.map((item) => {
              const current = isCurrentPage(pathname, item.href, homeHref);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  aria-current={current ? "page" : undefined}
                  className={`block rounded-lg px-3 py-3 text-base font-medium active:bg-gray-100 ${
                    current ? "bg-primary-50 text-primary-700" : "text-gray-700 hover:bg-gray-50"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              );
            })}
            <div className="py-2">
              <LanguageSwitcher currentLang={lang} />
            </div>
            <a
              href={PHONE_HREF}
              className="btn block rounded-lg bg-primary-600 px-3 py-3 text-center text-base font-medium text-white hover:bg-primary-700"
              onClick={() => setMobileMenuOpen(false)}
            >
              {PHONE_LABEL}
            </a>
          </div>
        </div>
      </header>
    </>
  );
}
