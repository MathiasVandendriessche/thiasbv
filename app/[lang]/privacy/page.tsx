import { getTranslations, type Language } from "@/lib/i18n";

export async function generateMetadata({ params }: { params: Promise<{ lang: Language }> }) {
  const { lang } = await params;
  const t = getTranslations(lang);
  return {
    title: lang === 'nl' ? "Privacybeleid & Cookiebeleid - Thias Consultancy" : lang === 'en' ? "Privacy Policy & Cookie Policy - Thias Consultancy" : "Politique de Confidentialité & Politique des Cookies - Thias Consultancy",
    description: lang === 'nl'
      ? "Privacybeleid en cookiebeleid van Thias Consultancy."
      : lang === 'en'
      ? "Privacy policy and cookie policy of Thias Consultancy."
      : "Politique de confidentialité et politique des cookies de Thias Consultancy.",
  };
}

export default async function PrivacyPage({ params }: { params: Promise<{ lang: Language }> }) {
  const { lang } = await params;
  const t = getTranslations(lang);
  const dateFormatter = new Intl.DateTimeFormat(
    lang === 'nl' ? 'nl-NL' : lang === 'en' ? 'en-US' : 'fr-FR',
    { year: 'numeric', month: 'long', day: 'numeric' }
  );

  return (
    <div className="bg-white">
      {/* Header */}
      <div className="relative isolate overflow-hidden bg-white">
        <div className="absolute inset-x-0 top-0 -z-10 h-24 bg-gradient-to-b from-primary-50/50 via-earth-50/30 to-transparent" />
        
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="mx-auto max-w-3xl">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              {t.privacy.title}
            </h1>
            <p className="mt-4 text-lg text-gray-600">
              {t.privacy.lastUpdated}: {dateFormatter.format(new Date())}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none">
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
              {t.privacy.privacyTitle}
            </h2>
            <p className="text-gray-700 mb-4">
              {t.privacy.privacyIntro}
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
              {t.privacy.dataCollection}
            </h3>
            <p className="text-gray-700 mb-4">
              {t.privacy.dataCollectionText}
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>{lang === 'nl' ? 'Naam' : lang === 'en' ? 'Name' : 'Nom'}</li>
              <li>{lang === 'nl' ? 'E-mailadres' : lang === 'en' ? 'Email address' : 'Adresse e-mail'}</li>
              <li>{lang === 'nl' ? 'Telefoonnummer (optioneel)' : lang === 'en' ? 'Phone number (optional)' : 'Numéro de téléphone (optionnel)'}</li>
              <li>{lang === 'nl' ? 'Bericht' : lang === 'en' ? 'Message' : 'Message'}</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
              {t.privacy.dataUse}
            </h3>
            <p className="text-gray-700 mb-4">
              {t.privacy.dataUseText}
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>{lang === 'nl' ? 'Het beantwoorden van uw vragen en verzoeken' : lang === 'en' ? 'Answering your questions and requests' : 'Répondre à vos questions et demandes'}</li>
              <li>{lang === 'nl' ? 'Het opnemen van contact met u over onze diensten' : lang === 'en' ? 'Contacting you about our services' : 'Vous contacter concernant nos services'}</li>
              <li>{lang === 'nl' ? 'Het verbeteren van onze dienstverlening' : lang === 'en' ? 'Improving our services' : 'Améliorer nos services'}</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
              {t.privacy.dataProtection}
            </h3>
            <p className="text-gray-700 mb-4">
              {t.privacy.dataProtectionText}
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
              {t.privacy.yourRights}
            </h3>
            <p className="text-gray-700 mb-4">
              {t.privacy.yourRightsText}
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>{lang === 'nl' ? 'Toegang te krijgen tot uw persoonlijke gegevens' : lang === 'en' ? 'Access your personal data' : 'Accéder à vos données personnelles'}</li>
              <li>{lang === 'nl' ? 'Uw gegevens te corrigeren of te verwijderen' : lang === 'en' ? 'Correct or delete your data' : 'Corriger ou supprimer vos données'}</li>
              <li>{lang === 'nl' ? 'Bezwaar te maken tegen de verwerking van uw gegevens' : lang === 'en' ? 'Object to the processing of your data' : 'Vous opposer au traitement de vos données'}</li>
              <li>{lang === 'nl' ? 'Uw gegevens te exporteren' : lang === 'en' ? 'Export your data' : 'Exporter vos données'}</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">
              {t.privacy.cookiesTitle}
            </h2>
            <p className="text-gray-700 mb-4">
              {t.privacy.cookiesIntro}
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
              {t.privacy.whatAreCookies}
            </h3>
            <p className="text-gray-700 mb-4">
              {t.privacy.whatAreCookiesText}
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
              {t.privacy.cookieTypes}
            </h3>
            <p className="text-gray-700 mb-4">
              {t.privacy.cookieTypesText}
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>
                <strong>{lang === 'nl' ? 'Essentiële cookies:' : lang === 'en' ? 'Essential cookies:' : 'Cookies essentiels :'}</strong>{' '}
                {lang === 'nl' ? 'Deze cookies zijn noodzakelijk voor het functioneren van de website en kunnen niet worden uitgeschakeld.' : lang === 'en' ? 'These cookies are necessary for the website to function and cannot be disabled.' : 'Ces cookies sont nécessaires au fonctionnement du site web et ne peuvent pas être désactivés.'}
              </li>
              <li>
                <strong>{lang === 'nl' ? 'Functionele cookies:' : lang === 'en' ? 'Functional cookies:' : 'Cookies fonctionnels :'}</strong>{' '}
                {lang === 'nl' ? 'Deze cookies stellen de website in staat om verbeterde functionaliteit en personalisatie te bieden.' : lang === 'en' ? 'These cookies enable the website to provide enhanced functionality and personalization.' : 'Ces cookies permettent au site web de fournir une fonctionnalité améliorée et une personnalisation.'}
              </li>
              <li>
                <strong>{lang === 'nl' ? 'Analytische cookies:' : lang === 'en' ? 'Analytical cookies:' : 'Cookies analytiques :'}</strong>{' '}
                {lang === 'nl' ? 'Deze cookies helpen ons te begrijpen hoe bezoekers de website gebruiken door informatie anoniem te verzamelen.' : lang === 'en' ? 'These cookies help us understand how visitors use the website by collecting information anonymously.' : 'Ces cookies nous aident à comprendre comment les visiteurs utilisent le site web en collectant des informations de manière anonyme.'}
              </li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
              {t.privacy.cookieSettings}
            </h3>
            <p className="text-gray-700 mb-4">
              {t.privacy.cookieSettingsText}
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
              {t.privacy.contactTitle}
            </h3>
            <p className="text-gray-700 mb-4">
              {t.privacy.contactText}
            </p>
            <ul className="list-none text-gray-700 mb-4 space-y-2">
              <li>
                {lang === 'nl' ? 'E-mail:' : lang === 'en' ? 'Email:' : 'E-mail :'}{' '}
                <a href="mailto:m@thiasbv.com" className="text-primary-600 hover:text-primary-700">m@thiasbv.com</a>
              </li>
              <li>
                {lang === 'nl' ? 'Telefoon:' : lang === 'en' ? 'Phone:' : 'Téléphone :'}{' '}
                <a href="tel:+32485119256" className="text-primary-600 hover:text-primary-700">+32 485 11 92 56</a>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
