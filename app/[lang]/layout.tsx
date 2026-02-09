import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getTranslations, type Language } from "@/lib/i18n";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export function generateMetadata({ params }: { params: { lang: Language } }): Metadata {
  const t = getTranslations(params.lang);
  
  const metadata: Metadata = {
    title: "ServiceNow Freelance Consultant België | Thias Consultancy",
    description:
      "ServiceNow freelance consultant in België. Onafhankelijke, doelgerichte ServiceNow consultancy die techniek, proceskennis en praktijkervaring samenbrengt voor duurzame resultaten. Meer dan 20 jaar ervaring in IT servicemanagement. Freelance ServiceNow expert voor implementatie, optimalisatie en integraties.",
    keywords: [
      "ServiceNow freelance",
      "ServiceNow freelance consultant",
      "ServiceNow freelance België",
      "ServiceNow consultant België",
      "freelance ServiceNow",
      "ServiceNow",
      "Consultancy",
      "Bedrijfsprocessen",
      "Innovatie",
      "ITSM",
      "IT Service Management",
      "België",
      "freelance consultant",
      "ServiceNow expert",
      "ServiceNow implementatie",
      "ServiceNow optimalisatie",
    ],
    authors: [{ name: "Mathias Vandendriessche", url: "https://www.linkedin.com/in/mathiasvdd/" }],
    openGraph: {
      title: "ServiceNow Freelance Consultant België | Thias Consultancy",
      description:
        "ServiceNow freelance consultant in België. Onafhankelijke, doelgerichte ServiceNow consultancy met meer dan 20 jaar ervaring.",
      type: "website",
      locale: params.lang === 'nl' ? 'nl_NL' : params.lang === 'fr' ? 'fr_BE' : 'en_US',
      url: "https://www.thiasbv.com",
    },
    alternates: {
      canonical: "https://www.thiasbv.com",
      languages: {
        'nl': 'https://www.thiasbv.com/nl',
        'en': 'https://www.thiasbv.com/en',
        'fr': 'https://www.thiasbv.com/fr',
      },
    },
  };

  return metadata;
}

export default function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { lang: Language };
}) {
  return (
    <html lang={params.lang} className={inter.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ProfessionalService",
              "name": "Thias Consultancy",
              "description": "ServiceNow freelance consultant in België",
              "url": "https://www.thiasbv.com",
              "logo": "https://www.thiasbv.com/logo.svg",
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+32-485-11-92-56",
                "contactType": "customer service",
                "email": "m@thiasbv.com",
                "areaServed": "BE",
                "availableLanguage": ["nl", "en", "fr"]
              },
              "address": {
                "@type": "PostalAddress",
                "addressCountry": "BE",
                "addressRegion": "West-Vlaanderen",
                "addressLocality": "Brugge Regio"
              },
              "founder": {
                "@type": "Person",
                "name": "Mathias Vandendriessche",
                "url": "https://www.linkedin.com/in/mathiasvdd/"
              },
              "serviceType": "ServiceNow Consulting",
              "areaServed": {
                "@type": "Country",
                "name": "Belgium"
              }
            }),
          }}
        />
      </head>
      <body>
        <Header lang={params.lang} />
        <main className="min-h-screen">{children}</main>
        <Footer lang={params.lang} />
      </body>
    </html>
  );
}
