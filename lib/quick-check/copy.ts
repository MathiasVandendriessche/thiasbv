import type { Language } from "@/lib/i18n";
import type { CheckId, Status } from "@/lib/quick-check/types";

export type QuickCheckErrorCode = "invalid_domain" | "rate_limited" | "blocked" | "unavailable" | "network";
export type ScanRequestErrorCode = "invalid" | "rate_limited" | "unavailable" | "network";

export interface QuickCheckCopy {
  title: string;
  intro: string;
  domainLabel: string;
  placeholder: string;
  button: string;
  loading: string;
  /** "{domain}" is the checked domain. */
  resultTitle: string;
  checkTitles: Record<CheckId, string>;
  /** Keyed by messageKey; may use {days}, {missing} and {count}. */
  messages: Record<string, string>;
  statusLabels: Record<Status, string>;
  /** "{ok}" and "{total}"; total excludes parts that could not be checked. */
  summary: string;
  /** Shown when no part could be checked (total = 0). */
  summaryNone: string;
  disclaimer: string;
  errors: Record<QuickCheckErrorCode, string>;
  request: {
    ctaText: string;
    button: string;
    title: string;
    intro: string;
    email: string;
    name: string;
    company: string;
    domain: string;
    optional: string;
    consentBefore: string;
    consentLink: string;
    consentAfter: string;
    honeypot: string;
    submit: string;
    sending: string;
    cancel: string;
    success: string;
    errors: Record<ScanRequestErrorCode, string>;
  };
}

const nl: QuickCheckCopy = {
  title: "Snelle check",
  intro: "Een korte, publieke check: alleen wat elke browser ook ziet.",
  domainLabel: "Je domeinnaam",
  placeholder: "voorbeeld.be",
  button: "Check mijn site",
  loading: "Bezig met controleren. Dit duurt hooguit een kwart minuut.",
  resultTitle: "Resultaat voor {domain}",
  checkTitles: {
    tls: "HTTPS en certificaat",
    headers: "Beveiligingsheaders",
    cookies: "Cookies",
    email: "E-mailbeveiliging",
  },
  messages: {
    "tls.good": "HTTPS werkt en het certificaat is nog {days} dagen geldig.",
    "tls.expiresSoon": "Het certificaat verloopt binnenkort (nog {days} dag(en)). Plan de vernieuwing.",
    "tls.expired": "Het certificaat is verlopen. Bezoekers krijgen een waarschuwing in hun browser.",
    "tls.invalidCert": "Browsers vertrouwen het certificaat niet, bijvoorbeeld door een verkeerde naam of uitgever.",
    "tls.unreadableExpiry": "We konden de geldigheid van het certificaat niet lezen.",
    "tls.oldProtocol": "De server gebruikt een verouderde TLS-versie. Versie 1.2 of hoger is de norm.",
    "tls.noHttpsRedirect":
      "HTTPS werkt (nog {days} dagen geldig), maar de onbeveiligde http-versie stuurt niet door naar https.",
    "tls.unavailable": "We konden HTTPS niet controleren: de site gaf via https geen bruikbaar antwoord.",
    "headers.good": "Alle zes gecontroleerde beveiligingsheaders zijn aanwezig.",
    "headers.missing": "Je site stuurt {count} van de 6 beveiligingsheaders niet mee: {missing}.",
    "headers.unavailable": "We konden de headers van de homepage niet ophalen.",
    "cookies.none": "De homepage zet geen cookies.",
    "cookies.good": "Alle cookies op de homepage zijn afgeschermd met Secure, HttpOnly en SameSite.",
    "cookies.insecure": "Niet elke cookie is afgeschermd: {count} zonder Secure of HttpOnly.",
    "cookies.sameSite": "Niet elke cookie is beschermd tegen misbruik vanaf andere sites: {count} zonder geldige SameSite.",
    "cookies.unavailable": "We konden de cookies van de homepage niet ophalen.",
    "email.good": "SPF en DMARC zijn ingesteld, en DMARC houdt valse mails namens je domein tegen.",
    "email.missingBoth": "SPF en DMARC ontbreken: iedereen kan vrij makkelijk mails versturen die van je domein lijken te komen.",
    "email.noSpf": "SPF ontbreekt: ontvangers weten niet welke servers namens je domein mogen mailen.",
    "email.noDmarc": "DMARC ontbreekt: ontvangers weten niet wat ze met valse mails namens je domein moeten doen.",
    "email.spfMultiple": "Je domein heeft meer dan één SPF-record, en dan telt SPF als ongeldig.",
    "email.spfWeak": "Het SPF-record is te ruim ingesteld en houdt valse afzenders niet tegen.",
    "email.dmarcNone": "DMARC staat alleen op observeren (p=none) en houdt valse mails nog niet tegen.",
    "email.unavailable": "We konden de e-mailinstellingen van je domein nu niet opvragen.",
  },
  statusLabels: { good: "Goed", warn: "Let op", bad: "Probleem", unavailable: "Niet gecontroleerd" },
  summary: "{ok} van {total} onderdelen in orde",
  summaryNone: "Geen enkel onderdeel kon nu gecontroleerd worden.",
  disclaimer:
    "Dit is een beperkte publieke check, geen volledige scan. Een groen resultaat betekent niet dat je site veilig is.",
  errors: {
    invalid_domain: "Dat lijkt geen geldige domeinnaam. Probeer bijvoorbeeld voorbeeld.be.",
    rate_limited: "Je hebt het maximum aantal checks bereikt. Probeer het later opnieuw.",
    blocked: "Dit domein kunnen we niet controleren.",
    unavailable: "De check is nu niet beschikbaar. Probeer het later opnieuw.",
    network: "Er is geen verbinding. Controleer je internet en probeer het opnieuw.",
  },
  request: {
    ctaText: "Wil je het volledige beeld? De volledige scan test je site met 23 modules, altijd met schriftelijke toestemming.",
    button: "Volledige scan aanvragen",
    title: "Volledige scan aanvragen",
    intro: "Laat je gegevens achter, dan neem ik contact met je op. Ik scan pas na jouw schriftelijke toestemming.",
    email: "E-mailadres",
    name: "Naam",
    company: "Bedrijf",
    domain: "Domein",
    optional: "optioneel",
    consentBefore: "Ik ga akkoord dat Thias Consultancy mij contacteert over deze aanvraag. Meer in de ",
    consentLink: "privacyverklaring",
    consentAfter: ".",
    honeypot: "Laat dit veld leeg",
    submit: "Aanvraag versturen",
    sending: "Versturen…",
    cancel: "Annuleren",
    success: "Bedankt! Je aanvraag is verstuurd. Ik neem zo snel mogelijk contact met je op.",
    errors: {
      invalid: "Controleer je e-mailadres en vink het akkoord aan.",
      rate_limited: "Je hebt al enkele aanvragen verstuurd. Probeer het later opnieuw.",
      unavailable: "Versturen lukt nu niet. Probeer het later opnieuw of mail naar m@thiasbv.com.",
      network: "Er is geen verbinding. Controleer je internet en probeer het opnieuw.",
    },
  },
};

const en: QuickCheckCopy = {
  title: "Quick check",
  intro: "A short, public check: only what any browser can see.",
  domainLabel: "Your domain name",
  placeholder: "example.com",
  button: "Check my site",
  loading: "Checking. This takes fifteen seconds at most.",
  resultTitle: "Result for {domain}",
  checkTitles: {
    tls: "HTTPS and certificate",
    headers: "Security headers",
    cookies: "Cookies",
    email: "Email security",
  },
  messages: {
    "tls.good": "HTTPS works and the certificate is valid for another {days} days.",
    "tls.expiresSoon": "The certificate expires soon ({days} day(s) left). Plan the renewal.",
    "tls.expired": "The certificate has expired. Visitors get a warning in their browser.",
    "tls.invalidCert": "Browsers do not trust the certificate, for example because of a wrong name or issuer.",
    "tls.unreadableExpiry": "We could not read the certificate's validity.",
    "tls.oldProtocol": "The server uses an outdated TLS version. Version 1.2 or higher is the standard.",
    "tls.noHttpsRedirect":
      "HTTPS works (valid for another {days} days), but the unsecured http version does not redirect to https.",
    "tls.unavailable": "We could not check HTTPS: the site gave no usable answer over https.",
    "headers.good": "All six security headers we check are present.",
    "headers.missing": "Your site does not send {count} of the 6 security headers: {missing}.",
    "headers.unavailable": "We could not fetch the headers of the homepage.",
    "cookies.none": "The homepage sets no cookies.",
    "cookies.good": "All cookies on the homepage are protected with Secure, HttpOnly and SameSite.",
    "cookies.insecure": "Not every cookie is protected: {count} without Secure or HttpOnly.",
    "cookies.sameSite": "Not every cookie is protected against misuse from other sites: {count} without a valid SameSite.",
    "cookies.unavailable": "We could not fetch the cookies of the homepage.",
    "email.good": "SPF and DMARC are set up, and DMARC stops fake mail sent in your domain's name.",
    "email.missingBoth": "SPF and DMARC are missing: anyone can fairly easily send mail that seems to come from your domain.",
    "email.noSpf": "SPF is missing: receivers don't know which servers may send mail for your domain.",
    "email.noDmarc": "DMARC is missing: receivers don't know what to do with fake mail sent in your domain's name.",
    "email.spfMultiple": "Your domain has more than one SPF record, which makes SPF invalid.",
    "email.spfWeak": "The SPF record is too permissive and does not stop fake senders.",
    "email.dmarcNone": "DMARC is only set to monitor (p=none) and does not stop fake mail yet.",
    "email.unavailable": "We could not look up your domain's email settings right now.",
  },
  statusLabels: { good: "Good", warn: "Attention", bad: "Problem", unavailable: "Not checked" },
  summary: "{ok} of {total} parts in order",
  summaryNone: "None of the parts could be checked right now.",
  disclaimer:
    "This is a limited public check, not a full scan. A green result does not mean your site is secure.",
  errors: {
    invalid_domain: "That doesn't look like a valid domain name. Try, for example, example.com.",
    rate_limited: "You have reached the maximum number of checks. Please try again later.",
    blocked: "We can't check this domain.",
    unavailable: "The check is not available right now. Please try again later.",
    network: "There is no connection. Check your internet and try again.",
  },
  request: {
    ctaText: "Want the full picture? The full scan tests your site with 23 modules, always with written consent.",
    button: "Request a full scan",
    title: "Request a full scan",
    intro: "Leave your details and I'll get in touch. I only scan after your written consent.",
    email: "Email address",
    name: "Name",
    company: "Company",
    domain: "Domain",
    optional: "optional",
    consentBefore: "I agree that Thias Consultancy may contact me about this request. More in the ",
    consentLink: "privacy statement",
    consentAfter: ".",
    honeypot: "Leave this field empty",
    submit: "Send request",
    sending: "Sending…",
    cancel: "Cancel",
    success: "Thank you! Your request has been sent. I'll get back to you as soon as possible.",
    errors: {
      invalid: "Check your email address and tick the consent box.",
      rate_limited: "You have already sent a few requests. Please try again later.",
      unavailable: "Sending is not possible right now. Please try again later or email m@thiasbv.com.",
      network: "There is no connection. Check your internet and try again.",
    },
  },
};

const fr: QuickCheckCopy = {
  title: "Check rapide",
  intro: "Un contrôle court et public : uniquement ce que tout navigateur voit aussi.",
  domainLabel: "Votre nom de domaine",
  placeholder: "exemple.be",
  button: "Vérifier mon site",
  loading: "Vérification en cours. Cela prend au maximum un quart de minute.",
  resultTitle: "Résultat pour {domain}",
  checkTitles: {
    tls: "HTTPS et certificat",
    headers: "En-têtes de sécurité",
    cookies: "Cookies",
    email: "Sécurité e-mail",
  },
  messages: {
    "tls.good": "HTTPS fonctionne et le certificat est encore valable {days} jours.",
    "tls.expiresSoon": "Le certificat expire bientôt (encore {days} jour(s)). Prévoyez son renouvellement.",
    "tls.expired": "Le certificat a expiré. Les visiteurs reçoivent un avertissement dans leur navigateur.",
    "tls.invalidCert": "Les navigateurs ne font pas confiance au certificat, par exemple à cause d'un mauvais nom ou émetteur.",
    "tls.unreadableExpiry": "Nous n'avons pas pu lire la validité du certificat.",
    "tls.oldProtocol": "Le serveur utilise une version TLS obsolète. La version 1.2 ou plus est la norme.",
    "tls.noHttpsRedirect":
      "HTTPS fonctionne (encore valable {days} jours), mais la version http non sécurisée ne redirige pas vers https.",
    "tls.unavailable": "Nous n'avons pas pu vérifier HTTPS : le site n'a pas donné de réponse exploitable en https.",
    "headers.good": "Les six en-têtes de sécurité contrôlés sont présents.",
    "headers.missing": "Votre site n'envoie pas {count} des 6 en-têtes de sécurité : {missing}.",
    "headers.unavailable": "Nous n'avons pas pu récupérer les en-têtes de la page d'accueil.",
    "cookies.none": "La page d'accueil ne dépose aucun cookie.",
    "cookies.good": "Tous les cookies de la page d'accueil sont protégés par Secure, HttpOnly et SameSite.",
    "cookies.insecure": "Tous les cookies ne sont pas protégés : {count} sans Secure ou HttpOnly.",
    "cookies.sameSite":
      "Tous les cookies ne sont pas protégés contre les abus depuis d'autres sites : {count} sans SameSite valide.",
    "cookies.unavailable": "Nous n'avons pas pu récupérer les cookies de la page d'accueil.",
    "email.good": "SPF et DMARC sont configurés, et DMARC bloque les faux e-mails envoyés au nom de votre domaine.",
    "email.missingBoth":
      "SPF et DMARC sont absents : n'importe qui peut assez facilement envoyer des e-mails qui semblent venir de votre domaine.",
    "email.noSpf": "SPF est absent : les destinataires ne savent pas quels serveurs peuvent envoyer des e-mails pour votre domaine.",
    "email.noDmarc": "DMARC est absent : les destinataires ne savent pas quoi faire des faux e-mails envoyés au nom de votre domaine.",
    "email.spfMultiple": "Votre domaine a plus d'un enregistrement SPF, ce qui rend SPF invalide.",
    "email.spfWeak": "L'enregistrement SPF est trop permissif et ne bloque pas les faux expéditeurs.",
    "email.dmarcNone": "DMARC est seulement en observation (p=none) et ne bloque pas encore les faux e-mails.",
    "email.unavailable": "Nous n'avons pas pu consulter les paramètres e-mail de votre domaine pour l'instant.",
  },
  statusLabels: { good: "Bon", warn: "Attention", bad: "Problème", unavailable: "Non vérifié" },
  summary: "{ok} sur {total} éléments en ordre",
  summaryNone: "Aucun élément n'a pu être vérifié pour l'instant.",
  disclaimer:
    "Ceci est un contrôle public limité, pas un scan complet. Un résultat vert ne signifie pas que votre site est sûr.",
  errors: {
    invalid_domain: "Ce nom de domaine ne semble pas valide. Essayez par exemple exemple.be.",
    rate_limited: "Vous avez atteint le nombre maximal de checks. Veuillez réessayer plus tard.",
    blocked: "Nous ne pouvons pas vérifier ce domaine.",
    unavailable: "Le check n'est pas disponible pour l'instant. Veuillez réessayer plus tard.",
    network: "Pas de connexion. Vérifiez votre accès internet et réessayez.",
  },
  request: {
    ctaText: "Vous voulez une vue complète ? Le scan complet teste votre site avec 23 modules, toujours avec un accord écrit.",
    button: "Demander un scan complet",
    title: "Demander un scan complet",
    intro: "Laissez vos coordonnées et je vous recontacte. Je ne scanne qu'après votre accord écrit.",
    email: "Adresse e-mail",
    name: "Nom",
    company: "Entreprise",
    domain: "Domaine",
    optional: "facultatif",
    consentBefore: "J'accepte que Thias Consultancy me contacte au sujet de cette demande. Plus d'infos dans la ",
    consentLink: "déclaration de confidentialité",
    consentAfter: ".",
    honeypot: "Laissez ce champ vide",
    submit: "Envoyer la demande",
    sending: "Envoi…",
    cancel: "Annuler",
    success: "Merci ! Votre demande a été envoyée. Je vous recontacte dès que possible.",
    errors: {
      invalid: "Vérifiez votre adresse e-mail et cochez la case d'accord.",
      rate_limited: "Vous avez déjà envoyé quelques demandes. Veuillez réessayer plus tard.",
      unavailable: "L'envoi n'est pas possible pour l'instant. Réessayez plus tard ou écrivez à m@thiasbv.com.",
      network: "Pas de connexion. Vérifiez votre accès internet et réessayez.",
    },
  },
};

const copy: Record<Language, QuickCheckCopy> = { nl, en, fr };

export function getQuickCheckCopy(lang: Language): QuickCheckCopy {
  return copy[lang] ?? copy.nl;
}

/** Replaces {name} with params[name]; unknown placeholders stay as they are. */
export function fillTemplate(template: string, params: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    Object.prototype.hasOwnProperty.call(params, name) ? String(params[name]) : match,
  );
}
