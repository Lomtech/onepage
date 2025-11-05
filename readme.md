# Link-in-Bio mit Analytics Dashboard

Deine persönliche Link-in-Bio Seite mit integriertem Analytics-Dashboard.

## 🎯 Features

- ✅ Clean, modernes Design (Apple-inspiriert)
- ✅ Analytics-Tracking (Seitenaufrufe, Link-Klicks)
- ✅ Dashboard mit Statistiken und Charts
- ✅ DSGVO-konform (keine Cookies, EU-Server)
- ✅ Netlify-Deployment mit Umgebungsvariablen
- ✅ Rechtliche Seiten (Impressum, Datenschutz)

## 📁 Dateistruktur

```
├── index.html              # Hauptseite
├── script.js               # Main Logic
├── analytics.js            # Analytics Tracking
├── styles.css              # Styling
├── dashboard.html          # Analytics Dashboard
├── dashboard.js            # Dashboard Logic
├── dashboard.css           # Dashboard Styling
├── impressum.html          # Impressum
├── datenschutz.html        # Datenschutzerklärung
├── build.sh                # Netlify Build Script
├── netlify.toml            # Netlify Config
├── supabase-setup.sql      # Datenbank Setup
└── assets/
    └── avatar.jpg          # Profilbild
```

## 🚀 Setup-Anleitung

### Schritt 1: Supabase Projekt erstellen

1. Gehe zu [supabase.com](https://supabase.com)
2. Erstelle ein neues Projekt
3. Wähle **Frankfurt (EU)** als Region (DSGVO)
4. Notiere dir:
   - `Project URL` (z.B. https://xxxxx.supabase.co)
   - `anon/public API Key`

### Schritt 2: Datenbank Setup

1. Öffne Supabase SQL Editor
2. Kopiere den kompletten Inhalt aus `supabase-setup.sql`
3. Führe das SQL aus (Run)
4. Verifiziere: Du solltest jetzt 2 Tables haben:
   - `page_visits`
   - `link_clicks`

### Schritt 3: Supabase Auth einrichten

1. Gehe zu **Authentication** → **Providers**
2. Aktiviere **Email** Auth
3. Gehe zu **Authentication** → **Users**
4. Klicke auf **Add User** → **Create new user**
5. Erstelle einen User (Email + Passwort)
   - **Wichtig:** Dieser User wird für das Dashboard-Login verwendet
6. Bestätige die Email (wenn nötig)

### Schritt 4: Dateien anpassen

#### 4.1 Rechtliche Seiten ausfüllen

**impressum.html:**
```html
<!-- Ersetze die Platzhalter: -->
[Deine Straße und Hausnummer]
[Deine PLZ und Stadt]
[deine-email@example.com]
```

**datenschutz.html:**
```html
<!-- Ersetze die gleichen Platzhalter -->
```

#### 4.2 Link-IDs prüfen

In `script.js` und `dashboard.js` müssen die **Link-IDs identisch** sein:

**script.js:**
```javascript
links: [
  { id: "bjj-open-mats", ... },
  { id: "x-twitter", ... },
  // etc.
]
```

**dashboard.js:**
```javascript
const linkNames = {
  'bjj-open-mats': 'BJJ Open Mats',
  'x-twitter': 'X/Twitter',
  // etc.
};
```

### Schritt 5: GitHub Repository

1. Erstelle ein neues GitHub Repo
2. Pushe alle Dateien:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/DEIN-USERNAME/DEIN-REPO.git
git push -u origin main
```

### Schritt 6: Netlify Deployment

1. Gehe zu [netlify.com](https://netlify.com)
2. Klicke auf **Add new site** → **Import an existing project**
3. Verbinde dein GitHub Repository
4. **Build Settings:**
   - **Build command:** `chmod +x build.sh && ./build.sh`
   - **Publish directory:** `build`

### Schritt 7: Umgebungsvariablen setzen

1. In Netlify: **Site settings** → **Environment variables**
2. Füge hinzu:

```
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=dein_anon_key_hier
```

⚠️ **Wichtig:** Verwende den **anon/public** Key, NICHT den service_role Key!

### Schritt 8: Deploy

1. Klicke auf **Deploy site**
2. Warte bis Build fertig ist (~1-2 Minuten)
3. Deine Site ist jetzt live! 🎉

## 🔐 Dashboard Login

1. Gehe zu `https://deine-site.netlify.app/dashboard.html`
2. Login mit dem Supabase-User aus Schritt 3
3. Genieße deine Analytics! 📊

## 📊 Dashboard Features

- **Unique Visitors:** Anzahl eindeutiger Besucher (via Session-ID)
- **Total Clicks:** Gesamtzahl aller Link-Klicks
- **Click-Through-Rate:** Prozentsatz der Besucher, die klicken
- **Top Link:** Meistgeklickter Link
- **Visits Chart:** Tägliche Besucher-Statistik
- **Clicks pro Link:** Detaillierte Link-Performance
- **Traffic-Quellen:** Woher kommen deine Besucher?

**Filter:** 7 Tage / 30 Tage / 90 Tage

## 🔄 Updates & Wartung

### Neue Links hinzufügen

1. **script.js** → `profile.links` Array erweitern
2. **dashboard.js** → `linkNames` Object erweitern
3. Git commit + push → Automatisches Deployment

### Analytics-Daten löschen

```sql
-- In Supabase SQL Editor
DELETE FROM page_visits WHERE created_at < NOW() - INTERVAL '90 days';
DELETE FROM link_clicks WHERE clicked_at < NOW() - INTERVAL '90 days';
```

## 🛡️ Datenschutz & DSGVO

✅ **DSGVO-konform:**
- Keine Cookies (außer Supabase Auth-Session für Dashboard)
- Keine IP-Speicherung
- EU-Server (Frankfurt)
- Automatische Löschung nach 90 Tagen
- Transparente Datenschutzerklärung

❌ **Kein Cookie-Banner nötig:**
- LocalStorage ist funktional notwendig
- Keine Tracking-Cookies
- Keine Third-Party Analytics (Google Analytics, etc.)

## 🐛 Troubleshooting

### Build Failed

**Problem:** Build schlägt fehl mit "SUPABASE_URL not set"

**Lösung:** 
1. Prüfe Environment Variables in Netlify
2. Stelle sicher, dass beide Variablen gesetzt sind
3. Redeploy

### Dashboard zeigt "Login failed"

**Problem:** User kann sich nicht einloggen

**Lösung:**
1. Prüfe ob Email in Supabase Auth bestätigt ist
2. Prüfe ob User in **Supabase → Authentication → Users** existiert
3. Teste mit "Reset Password"

### Keine Analytics-Daten

**Problem:** Dashboard ist leer

**Lösung:**
1. Öffne Browser DevTools → Console
2. Prüfe auf Fehler
3. Verifiziere Supabase RLS Policies:
   ```sql
   -- Sollten existieren:
   SELECT * FROM pg_policies WHERE tablename IN ('page_visits', 'link_clicks');
   ```
4. Teste ob `supabase-setup.sql` vollständig ausgeführt wurde

### "Function get_dashboard_stats does not exist"

**Problem:** Dashboard lädt nicht

**Lösung:**
```sql
-- In Supabase SQL Editor: Führe den kompletten supabase-setup.sql nochmal aus
-- Besonders den Teil mit CREATE OR REPLACE FUNCTION get_dashboard_stats
```

## 📝 Changelog

### Version 1.0.0 (November 2025)
- Initial Release
- Analytics Integration
- Dashboard mit Charts
- DSGVO-konforme Umsetzung
- Netlify Deployment

## 🤝 Support

Bei Fragen oder Problemen:
1. Prüfe dieses README
2. Schaue in Supabase Logs
3. Prüfe Netlify Build Logs
4. Prüfe Browser Console

## 📄 Lizenz

Dieses Projekt ist für den persönlichen Gebrauch erstellt.