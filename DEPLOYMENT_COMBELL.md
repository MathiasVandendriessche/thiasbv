# Deployment Guide voor Combell Node.js Hosting

Deze gids helpt je om je Next.js website te deployen op Combell Node.js hosting.

## Belangrijk: Combell gebruikt Git-based Deployment

**Combell Node.js hosting werkt uitsluitend via Git-based deployment.** Je kunt niet handmatig bestanden uploaden via FTP/SFTP voor Node.js applicaties. Je moet je code in een Git repository hebben (GitHub, GitLab, of Bitbucket).

## Vereisten

- Combell hosting account met **Node.js hosting** (€1,99/maand)
- Een Git repository (GitHub, GitLab, of Bitbucket) met je code
- Toegang tot Combell Control Panel
- Node.js versie 18.x of hoger (configureerbaar in Control Panel)
- Website: https://www.combell.com/nl/

## Vereiste package.json Scripts

**BELANGRIJK:** Combell vereist dat je `package.json` **twee verplichte scripts** bevat:
- `build` - Voor het builden van je applicatie
- `serve` - Voor het starten van je applicatie

Je `package.json` heeft deze al correct geconfigureerd:
```json
{
  "scripts": {
    "build": "next build",
    "serve": "next start"
  }
}
```

Combell voert automatisch eerst `npm run build` uit, en als dat succesvol is, start het je applicatie met `npm run serve`.

## Deployment Stappen

### 1. Lokale Build Testen

Voordat je deployt, test eerst lokaal of alles werkt:

```bash
# Installeer dependencies (als je dit nog niet gedaan hebt)
npm install

# Build de productie versie
npm run build

# Test de productie build lokaal
npm start
```

Controleer of de website werkt op `http://localhost:3000` voordat je verder gaat.

### 2. Code naar Git Repository Pushen

Zorg dat al je code in een Git repository staat:

```bash
# Als je nog geen Git repository hebt, initialiseer er een:
git init

# Voeg alle bestanden toe (behalve node_modules en .next)
git add .

# Commit je code
git commit -m "Initial commit - ready for Combell deployment"

# Voeg je remote repository toe (vervang met je eigen repository URL)
git remote add origin https://github.com/jouw-username/thias-consultancy.git

# Push naar GitHub/GitLab/Bitbucket
git push -u origin main
```

**Belangrijk:** Zorg dat je `.gitignore` correct is geconfigureerd zodat `node_modules/` en `.next/` niet gecommit worden.

### 3. Node.js Instance Configureren in Combell

1. **Log in op je Combell Control Panel** (https://www.combell.com/nl/)
2. **Ga naar "Servers" → "Node.js"** (of zoek naar "Node.js" in het menu)
3. **Klik op "Nieuwe Node.js Instance"** of "Add Node.js Instance"
4. **Configureer de instance:**
   - **Git Repository URL:** Voer de URL van je Git repository in (bijv. `https://github.com/jouw-username/thias-consultancy.git`)
   - **Branch:** Meestal `main` of `master`
   - **Node.js Versie:** Selecteer versie 18.x of hoger
   - **Toegang tot Git:** Je moet Combell toegang geven tot je repository:
     - **Public repository:** Geen extra configuratie nodig
     - **Private repository:** Je moet SSH keys of access tokens configureren (zie Combell documentatie)
5. **Sla de configuratie op**

### 4. Deployment Pipeline

Combell voert automatisch de volgende stappen uit wanneer je een deployment start:

1. **Clone/Pull** van je Git repository
2. **`npm install`** - Installeert alle dependencies
3. **`npm run build`** - Build je Next.js applicatie
4. **`npm run serve`** - Start je applicatie

**Deployment starten:**
- In het Combell Control Panel, ga naar je Node.js instance
- Klik op **"Deploy"** of **"Build & Deploy"**
- Combell voert automatisch de pipeline uit
- Je ziet de build logs in real-time

### 5. Website Koppelen aan Node.js Instance

Na een succesvolle deployment moet je je website koppelen aan de Node.js instance:

1. **Ga naar "Websites & SSL"** in het Combell Control Panel
2. **Selecteer je website** (of maak een nieuwe aan)
3. **Klik op "Change website backend"** of "Backend wijzigen"
4. **Selecteer je Node.js instance** als backend
5. **Sla de wijzigingen op**

Nu is je website gekoppeld aan je Node.js applicatie!

### 6. Environment Variables (indien nodig)

Als je environment variables nodig hebt (bijvoorbeeld voor API keys), voeg deze toe in Combell Control Panel:

1. **Ga naar je Node.js instance** in het Control Panel
2. **Zoek naar "Environment Variables"** of "Omgevingsvariabelen"
3. **Voeg variabelen toe** zoals:
   - `NODE_ENV=production`
   - `PORT=3000` (als Combell een specifieke poort vereist)
   - Andere variabelen die je nodig hebt

**Let op:** Voeg geen gevoelige informatie toe aan je Git repository. Gebruik altijd environment variables voor secrets.

Als je environment variables nodig hebt (bijvoorbeeld voor API keys), voeg deze toe in Combell Control Panel:
- Log in op je Combell Control Panel
- Ga naar je hosting account instellingen
- Zoek naar "Environment Variables" of "Application Settings"
- Voeg variabelen toe zoals `NODE_ENV=production`

**Alternatief:** Maak een `.env` bestand in je project root met je environment variables (niet committen naar Git!)

### 7. SSL Certificaat Installeren

Combell biedt gratis Let's Encrypt SSL certificaten:

1. **Ga naar "Websites & SSL"** in het Combell Control Panel
2. **Selecteer je website**
3. **Klik op "SSL Certificaat"** of "SSL installeren"
4. **Kies "Let's Encrypt"** (gratis)
5. **Activeer SSL** voor je domein
6. **Forceer HTTPS redirect** indien gewenst (aanbevolen)

### 8. Verificatie

Na deployment:
1. Bezoek je website URL
2. Test alle pagina's (NL, EN, FR versies)
3. Controleer of alle links werken
4. Test het contactformulier (als je dit later configureert)

## Updates en Nieuwe Deployments

Wanneer je wijzigingen maakt aan je website:

1. **Commit en push** je wijzigingen naar je Git repository:
   ```bash
   git add .
   git commit -m "Beschrijving van wijzigingen"
   git push
   ```

2. **Ga naar je Node.js instance** in het Combell Control Panel
3. **Klik op "Deploy"** of "Rebuild"
4. Combell voert automatisch de pipeline opnieuw uit

**Tip:** Sommige Combell plannen hebben automatische deployments wanneer je pusht naar je Git repository (webhooks). Controleer je Control Panel voor deze optie.

## Troubleshooting

### Build Fails in Pipeline

**Probleem:** De build stap faalt tijdens deployment.

**Oplossingen:**
- Controleer de build logs in het Combell Control Panel voor specifieke errors
- Test lokaal eerst: `npm run build` moet werken zonder errors
- Controleer Node.js versie in Combell (moet 18+ zijn)
- Zorg dat alle dependencies in `package.json` staan (inclusief devDependencies voor build)
- Check voor TypeScript errors: `npm run lint`

### Serve Script Not Found

**Probleem:** Combell kan het `serve` script niet vinden.

**Oplossing:**
- Zorg dat je `package.json` een `serve` script heeft: `"serve": "next start"`
- Controleer of je `package.json` correct gecommit is naar Git

### Website Toont "Cannot GET /"

**Probleem:** Website laadt niet of toont routing errors.

**Oplossingen:**
- Controleer of je website correct gekoppeld is aan je Node.js instance (stap 5)
- Zorg dat `middleware.ts` correct geconfigureerd is
- Controleer of alle `[lang]` routes correct werken
- Test lokaal eerst om te zien of routing werkt

### Port Problemen

**Probleem:** Applicatie start niet of poort conflicten.

**Oplossingen:**
- Combell wijst automatisch een poort toe - gebruik `process.env.PORT` in je code als nodig
- Controleer je Node.js instance configuratie in het Control Panel
- Next.js gebruikt standaard poort 3000, maar Combell kan een andere poort toewijzen

### Git Repository Access Issues

**Probleem:** Combell kan niet bij je private Git repository.

**Oplossingen:**
- Voor **public repositories:** Geen extra configuratie nodig
- Voor **private repositories:** 
  - Configureer SSH keys in Combell Control Panel
  - Of gebruik access tokens (GitHub Personal Access Token, GitLab Token, etc.)
  - Zie Combell documentatie voor specifieke instructies

### Performance Issues

**Oplossingen:**
- Next.js genereert automatisch geoptimaliseerde assets
- Overweeg Combell's CDN opties voor statische assets
- Controleer caching opties in je Control Panel
- Monitor performance via Combell's monitoring tools

## Alternatieve Deployment Opties

Als Combell Node.js hosting niet ideaal is, overweeg:

1. **Vercel** (gemaakt door Next.js makers) - gratis tier beschikbaar, optimaal voor Next.js
2. **Netlify** - goede Next.js ondersteuning  
3. **Railway** - eenvoudige Node.js deployment
4. **DigitalOcean App Platform** - managed hosting

## Contact Combell Support

Voor vragen over Combell specifieke configuratie, neem contact op met Combell support:
- **Website:** https://www.combell.com/nl/
- **Telefoon:** 0800-8-5678 (gratis) of +32 9 218 79 79
- **Support:** 24/7 beschikbaar via hun control panel
- **Knowledge Base:** Beschikbaar via het Control Panel

**Belangrijk:** Combell heeft 24/7 gratis support in het Nederlands. Ze kunnen je helpen met:
- Node.js configuratie
- SSL certificaat installatie
- Domain configuratie
- Performance optimalisatie

## Belangrijke Notities

- **Backup**: Maak altijd een backup voordat je wijzigingen deployt. Combell biedt automatische backups - controleer je Control Panel
- **Testing**: Test altijd eerst op een staging omgeving als beschikbaar
- **Monitoring**: Monitor je applicatie na deployment voor errors. Combell heeft monitoring tools in het Control Panel
- **Updates**: Houd Next.js en dependencies up-to-date voor security patches
- **Support**: Combell heeft 24/7 gratis support - gebruik dit als je vastloopt!

## Combell Specifieke Tips

1. **Control Panel**: Combell heeft een gebruiksvriendelijk Control Panel met veel opties - verkenn dit eerst
2. **Automatische Backups**: Controleer of automatische backups ingeschakeld zijn
3. **Performance Monitoring**: Gebruik Combell's monitoring tools om je website performance te volgen
4. **SSL**: Activeer altijd SSL voor je productie website (gratis via Let's Encrypt bij Combell)
5. **CDN**: Overweeg Combell's CDN opties voor betere performance wereldwijd
