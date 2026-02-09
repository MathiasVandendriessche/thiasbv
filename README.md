# Thias Consultancy Website

Een moderne, minimalistische website voor Thias Consultancy, gebouwd met Next.js 15, TypeScript en Tailwind CSS.

## Technologie Stack

- **Next.js 15** - React framework met App Router en Server Components
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Moderne icon library

## Features

- ✅ Modern, minimalistisch design
- ✅ Volledig responsive (mobile-first)
- ✅ SEO geoptimaliseerd met Next.js Metadata API
- ✅ Snelle laadtijden met Server Components
- ✅ Toegankelijk (WCAG 2.1 compliant)
- ✅ Smooth animations en transitions
- ✅ SEO geoptimaliseerd voor "ServiceNow freelance" zoektermen
- ✅ Cookiebeleid pagina
- ✅ Contactformulier API endpoint

## Getting Started

### Installatie

```bash
npm install
```

### Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in je browser.

### Build voor Productie

```bash
npm run build
npm start
```

## SEO Optimalisatie

De website is geoptimaliseerd voor zoektermen zoals:
- "ServiceNow freelance"
- "ServiceNow freelance consultant"
- "ServiceNow freelance België"
- "freelance ServiceNow"

**SEO Features:**
- Geoptimaliseerde meta tags en descriptions
- Structured data (JSON-LD) voor betere zoekresultaten
- Sitemap.xml automatisch gegenereerd
- Robots.txt geconfigureerd
- Canonical URLs

## Contactformulier

Het contactformulier stuurt momenteel naar `/api/contact`. 

**Voor productie implementatie:**

Je hebt verschillende opties:

1. **FormSubmit (Gratis)**: 
   - Gebruik https://formsubmit.co/your-email@thiasbv.com
   - Update de API route om naar FormSubmit te posten

2. **Resend (Aanbevolen)**:
   ```bash
   npm install resend
   ```
   - Maak account op https://resend.com
   - Voeg RESEND_API_KEY toe aan environment variables
   - Update `/app/api/contact/route.ts` met Resend code

3. **Nodemailer met SMTP**:
   - Configureer SMTP instellingen
   - Update API route met Nodemailer

4. **AWS SES / SendGrid**:
   - Enterprise oplossingen voor email delivery

**Huidige status:** Het formulier logt naar console. Update `/app/api/contact/route.ts` met je gekozen email service.

## Meertaligheid (Nederlands, Engels, Frans)

**Status:** Basis i18n structuur is aangemaakt maar vereist volledige implementatie.

**Wat is gedaan:**
- `lib/i18n.ts` met vertalingen aangemaakt
- Middleware voor taal routing voorbereid
- Structured data bevat meertalige informatie

**Wat nog moet gebeuren:**
- Alle pagina's verplaatsen naar `app/[lang]/` structuur
- Alle componenten updaten om vertalingen te gebruiken
- Taalwisselaar component toevoegen aan header
- Alle content vertalen naar Engels en Frans

**Quick start voor meertaligheid:**
1. Verplaats alle pagina's naar `app/[lang]/` folders
2. Update componenten om `getTranslations(lang)` te gebruiken
3. Voeg taalwisselaar toe aan Header component

## Project Structuur

```
├── app/
│   ├── [lang]/              # Meertalige routes (te implementeren)
│   ├── api/
│   │   └── contact/         # Contact formulier API
│   ├── privacy/             # Privacy & Cookiebeleid
│   ├── layout.tsx           # Root layout met metadata
│   ├── page.tsx             # Homepage
│   ├── globals.css          # Global styles
│   ├── sitemap.ts           # Sitemap generatie
│   └── robots.ts            # Robots.txt
├── components/
│   ├── Header.tsx           # Navigatie header
│   ├── Footer.tsx           # Footer component
│   ├── Hero.tsx            # Hero sectie
│   ├── ServiceCard.tsx     # Service card component
│   ├── ContactForm.tsx     # Contact formulier
│   └── Logo.tsx           # Logo component
├── lib/
│   └── i18n.ts             # Internationalisatie
└── public/                 # Static assets
```

## Deployment

De website kan worden gedeployed naar elke hosting provider die Next.js ondersteunt:

- **Vercel** (aanbevolen): Automatische deployment via Git
- **Netlify**: Via Netlify CLI of Git integration
- **Combell Hosting**: Zie [DEPLOYMENT_COMBELL.md](./DEPLOYMENT_COMBELL.md) voor gedetailleerde instructies
- **Custom hosting**: Build de applicatie en serveer de `.next` folder

### Combell Hosting Deployment

Voor gedetailleerde instructies voor Combell hosting, zie [DEPLOYMENT_COMBELL.md](./DEPLOYMENT_COMBELL.md)

**Quick Start voor Combell:**
1. Build lokaal: `npm run build`
2. Upload alle bestanden via FTP/SFTP of Git (behalve `node_modules` en `.next`)
3. Op server via SSH: `npm install` en `npm run build`
4. Start: `npm start` of gebruik PM2 met `ecosystem.config.js`
5. **Support:** Bel Combell gratis op 0800-8-5678 voor hulp bij deployment

### Environment Variables

Voor productie, voeg toe aan `.env.local`:
- `RESEND_API_KEY` (als je Resend gebruikt voor emails)
- Of andere email service credentials

## Licentie

Copyright © 2025 Thias Consultancy. Alle rechten voorbehouden.
