import Link from "next/link";
import { Mail, Phone, Linkedin } from "lucide-react";
import Logo from "./Logo";
import { getTranslations, type Language } from "@/lib/i18n";

export default function Footer({ lang = 'nl' }: { lang?: Language }) {
  const t = getTranslations(lang);
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <Logo className="h-10 w-auto" />
            <p className="text-gray-600 text-sm">
              {t.footer.tagline}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">
              {t.footer.navigation}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href={`/${lang}`}
                  className="text-gray-600 hover:text-primary-600 text-sm transition-colors"
                >
                  {t.nav.home}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${lang}/diensten`}
                  className="text-gray-600 hover:text-primary-600 text-sm transition-colors"
                >
                  {t.nav.services}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${lang}/ervaring`}
                  className="text-gray-600 hover:text-primary-600 text-sm transition-colors"
                >
                  {t.nav.experience}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${lang}/contact`}
                  className="text-gray-600 hover:text-primary-600 text-sm transition-colors"
                >
                  {t.nav.contact}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${lang}/privacy`}
                  className="text-gray-600 hover:text-primary-600 text-sm transition-colors"
                >
                  {t.footer.privacy}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">
              {t.footer.contact}
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="tel:+32485119256"
                  className="flex items-center text-gray-600 hover:text-primary-600 text-sm transition-colors"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  +32 485 11 92 56
                </a>
              </li>
              <li>
                <a
                  href="mailto:m@thiasbv.com"
                  className="flex items-center text-gray-600 hover:text-primary-600 text-sm transition-colors"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  m@thiasbv.com
                </a>
              </li>
              <li>
                <a
                  href="https://www.linkedin.com/in/mathiasvdd/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-gray-600 hover:text-primary-600 text-sm transition-colors"
                >
                  <Linkedin className="h-4 w-4 mr-2" />
                  LinkedIn Profiel
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Thias Consultancy. {t.footer.copyright}. | <Link href={`/${lang}/privacy`} className="hover:text-primary-600 transition-colors">{t.footer.privacy}</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
