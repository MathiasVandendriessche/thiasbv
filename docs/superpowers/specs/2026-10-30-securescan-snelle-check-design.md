# SecureScan op de website: project + snelle check

**Datum:** 2026-10-30
**Status:** ontwerp, wacht op goedkeuring
**Plaats:** pagina `/[lang]/ai-projecten` van thiasbv.com (Next.js 15, NL/EN/FR)

## Waarom

De pagina AI-projecten moet mogelijke klanten tonen dat Mathias (Thias Consultancy) AI en automatisering echt bouwt en gebruikt. SecureScan is een eigen product: een geautomatiseerde web-pentest met 23 modules die een Nederlandstalig beveiligingsrapport voor KMO's maakt. Het is bedoeld als betaalde dienst.

Een bezoeker die zelf een korte check op zijn eigen website kan doen, ervaart meteen wat SecureScan doet. Dat werkt beter dan een beschrijving. De check is een voorproefje; de volledige scan blijft een dienst die via Mathias loopt, met toestemming.

## Wat er komt

1. **Projectblok SecureScan** op de AI-projectenpagina, in dezelfde stijl als de andere projecten (`ProjectShowcase`): titel, korte uitleg, tags en een lijst "wat het doet".
2. **Snelle check** in dat blok: een invoerveld voor een domeinnaam en een knop. Na enkele seconden verschijnt het resultaat op de pagina.
3. **Volledige scan aanvragen**: onder het resultaat kan de bezoeker vrijwillig een e-mailadres achterlaten om een volledige scan aan te vragen. Mathias krijgt dat per e-mail en volgt het verder op met de bestaande toestemmingsflow van SecureScan.

## Doelen

- Een bezoeker ziet zonder account of e-mail binnen ongeveer 10 seconden het resultaat van een publieke check.
- Het resultaat is begrijpelijk voor een niet-technische KMO-zaakvoerder: per onderdeel een kleur (goed / let op / probleem) en één zin uitleg.
- Een aanvraag voor een volledige scan komt betrouwbaar bij Mathias aan.
- Gegevens zijn veilig (zie "Veiligheid en privacy"; dit is een harde eis van Mathias).

## Niet-doelen

- Geen volledige scan of rapport vanaf de website. Geen poortscans, geen zoeken naar verborgen bestanden of mappen, geen aanvallende of brute-force-modules.
- Geen eigendomsverificatie van het domein. Die is niet nodig, omdat de check alleen kijkt naar wat elke browser ook ziet bij een gewoon bezoek.
- Geen accounts, geen dashboard, geen geschiedenis van checks.
- Geen afhankelijkheid van de SecureScan-server (`scan.thiasbv.com` is momenteel offline).

## Anti-doelen (dit zou falen, ook als het technisch werkt)

- De website kan gebruikt worden om massaal of geautomatiseerd sites van anderen af te tasten.
- Iemand kan via de check interne of privé-adressen laten benaderen (SSRF).
- Gescande domeinen, resultaten of e-mailadressen komen in logs, analytics of een database terecht zonder dat dat nodig is.
- Het resultaat klinkt als een volledige beveiligingsaudit of geeft de indruk dat een site "veilig" is omdat de korte check groen is.
- De check voelt traag of hangt.

## Wat de snelle check controleert

Alleen publieke informatie, met hooguit een handvol gewone verzoeken naar de homepage van het domein en DNS-opvragingen:

| Onderdeel | Wat | Bron in SecureScan |
|---|---|---|
| HTTPS en certificaat | Werkt HTTPS, is het certificaat geldig, hoeveel dagen nog, TLS-versie, stuurt HTTP door naar HTTPS | `engine/modules/ssl-check.js` |
| Beveiligingsheaders | HSTS, Content-Security-Policy, X-Frame-Options / frame-ancestors, X-Content-Type-Options, Referrer-Policy, Permissions-Policy | `engine/modules/header-scan.js` |
| Cookies | Hebben cookies op de homepage `Secure`, `HttpOnly` en `SameSite` | basis uit `engine/modules/cookie-scan.js` (enkel de homepage-response, geen crawl) |
| E-mailbeveiliging | Bestaan SPF en DMARC voor het domein, en hoe streng (DMARC-policy) | basis uit `engine/modules/email-check.js` (geen DKIM-selector-raden) |

Elk onderdeel krijgt een status (goed / let op / probleem) en één zin uitleg in de taal van de pagina. Bovenaan staat een eenvoudige totaalindruk (bijv. "3 van 4 onderdelen in orde"). Onder het resultaat staat altijd dat dit een beperkte publieke check is en geen volledige scan.

## Veiligheid en privacy (harde eisen)

**Misbruik van de check**
- SSRF-bescherming: de hostnaam wordt eerst opgezocht en elke check weigert als één van de IP-adressen privé, intern of gereserveerd is (fail-closed). Ook bij elke redirect opnieuw controleren. Logica overnemen uit `engine/utils/ssrf-guard.js` (IPv4- en IPv6-bereiken) en `engine/utils/safe-fetch.js`.
- Invoer: alleen een domeinnaam (eventueel geplakt als URL, dan het domein eruit halen). Geen IP-adressen, geen poorten, geen paden, geen `localhost` of interne namen. Strikte validatie aan de serverkant; maximale lengte.
- Alleen poorten 443 en 80, alleen GET/HEAD, maximaal enkele redirects, korte time-outs per verzoek en een totale tijdslimiet voor de hele check. Response-grootte begrenzen.
- Rate limit per IP-adres (bijv. 5 checks per 10 minuten en 20 per dag) en een globale limiet voor de hele site. In het geheugen is voldoende: de site draait als één proces op Combell.
- Het verzoek naar de gescande site heeft een herkenbare User-Agent (bijv. `ThiasSecureScanQuickCheck/1.0 (+https://www.thiasbv.com/nl/ai-projecten)`).

**Gegevens**
- Niets bewaren: geen database, geen bestanden. Gescande domeinen en resultaten blijven alleen in het geheugen tijdens het verzoek. De rate limiter bewaart alleen tellers per IP, met een korte vervaltijd.
- Geen domeinen, resultaten, e-mailadressen of IP-adressen in de serverlogs. Fouten loggen zonder die gegevens.
- E-mailaanvraag voor een volledige scan: velden e-mail (verplicht), naam en bedrijf (optioneel), het gescande domein (vooraf ingevuld). Een verplicht vinkje "ik ga akkoord dat Thias Consultancy mij contacteert over deze aanvraag" met een link naar de privacypagina. Een honeypot-veld tegen bots en dezelfde rate limiting.
- De aanvraag wordt alleen per e-mail naar Mathias gestuurd, via de Microsoft Graph API over HTTPS. Niet op de website opgeslagen. De toegangsgegevens staan in omgevingsvariabelen, nooit in de code.
- De privacypagina (`/[lang]/privacy`) krijgt een korte alinea over de snelle check en de aanvraag: wat verwerkt wordt, waarom, en dat niets bewaard wordt op de website.
- De API geeft foutmeldingen die niets over de interne werking prijsgeven.

## Belangrijk bestaand probleem

Het bestaande contactformulier (`app/api/contact/route.ts`) verstuurt geen e-mail. Het schrijft berichten met `console.log` naar het serverlog, inclusief naam, e-mail en telefoon. Berichten komen dus nooit aan, en persoonsgegevens belanden in logs.

De e-mailverzending die voor de scanaanvraag gebouwd wordt, wordt ook voor het contactformulier gebruikt, en de `console.log` met persoonsgegevens verdwijnt. Dat valt binnen dit ontwerp.

## Gekozen door Mathias

- Licht: een publieke check zonder eigendomsbewijs; de volledige scan blijft met toestemming via Mathias.
- Het resultaat is meteen zichtbaar, zonder e-mail. E-mail alleen als de bezoeker een volledige scan wil.
- Gegevens moeten echt veilig zijn.

## Keuzes van Claude (kan Mathias nog wijzigen)

- De check draait in de website zelf (Next.js API-route, Node.js-runtime), niet op de SecureScan-server.
- De vier onderdelen hierboven; de andere 19 modules blijven voor de volledige scan.
- De logica wordt overgenomen (overgezet naar TypeScript) uit de SecureScan-modules in plaats van SecureScan als dependency toe te voegen. Zo blijft de deploy via Git bij Combell eenvoudig, en komt alleen de passieve code mee.
- E-mail via de Microsoft Graph API vanuit de Microsoft 365-mailbox `m@thiasbv.com` (zie verder).
- Het projectblok staat als vierde project op de pagina, na de energiemanager.

- **Volgorde:** eerst wordt de AI-projectenpagina zoals ze nu klaarstaat gecommit. Dit ontwerp bouwt daarop verder op dezelfde branch, en de fix van het contactformulier gaat mee in die eerste stap van het plan, zodat de lekkende `console.log` zo snel mogelijk verdwijnt.
- **Hosting nagaan bij het bouwen:** controleer in de Combell-documentatie (of met een kleine test-route) dat de Node-app uitgaande DNS-, TLS- (443) en HTTP-verbindingen (80) naar willekeurige hosts mag maken, en welke header het echte bezoekers-IP draagt. Gebruik voor de rate limit alleen het IP dat de eigen proxy van Combell toevoegt (het laatste item dat de proxy zet), nooit een waarde die de bezoeker zelf kan meesturen. Blokkeert Combell uitgaand verkeer, dan stopt het bouwen van de check en wordt Mathias eerst gevraagd waar ze dan moet draaien.
- **Mail via Microsoft 365:** `thiasbv.com` gebruikt Microsoft 365 (MX naar `outlook.com`, SPF `include:spf.protection.outlook.com -all`). De mail wordt verstuurd met de Microsoft Graph API (`sendMail`) en niet met SMTP: Microsoft bouwt basis-authenticatie voor SMTP af, en Graph werkt zonder wachtwoord van een mailbox. Hiervoor is een app-registratie in Microsoft Entra nodig met alleen de toepassingsmachtiging `Mail.Send`, beperkt tot één mailbox via een application access policy. Tenant-ID, client-ID en client secret staan in omgevingsvariabelen. Afzender en ontvanger zijn allebei `m@thiasbv.com` (het adres in de footer en op de privacypagina). Het foute `info@thiasbv.com` in `components/ContactForm.tsx` wordt `m@thiasbv.com`. `DEPLOYMENT_COMBELL.md` krijgt de stappen voor de app-registratie en de variabelen.
- **Bewaartermijn:** de privacytekst zegt dat aanvragen in de mailbox bewaard worden zolang nodig voor de opvolging, en maximaal 12 maanden, en dat de bezoeker verwijdering kan vragen via `m@thiasbv.com`. Grondslag: toestemming via het vinkje. (Keuze van Claude; Mathias bevestigt die termijn.)
- **Nodemailer valt weg:** de vermelding van Nodemailer onder "Keuzes van Claude" is vervangen door Microsoft Graph.

## Aan de bouwer

- Exacte opmaak van het resultaat, binnen de bestaande stijl van de pagina (lavendel accent, afgeronde kaarten, toegankelijk en met toetsenbord bedienbaar, ook mobiel).
- Exacte limieten en time-outs, binnen "snel genoeg voor een bezoeker, te traag om te misbruiken".
- Teksten in NL, EN en FR, in de toon van de rest van de pagina.
- Tests: unit tests voor de domeinvalidatie, de SSRF-controle (privé-IPv4 en IPv6, redirect naar privé-adres), de rate limiter en de beoordeling per onderdeel. Een end-to-end-test van de flow met een gemockte check.
- Kanttekening voor het lokaal bouwen: de projectmap staat in iCloud en een deel van `node_modules` is daar niet lokaal. Bouwen en testen kan in een kopie buiten iCloud.
