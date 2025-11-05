class CookieConsent {
  constructor() {
    this.consentKey = "analytics_consent";
    this.init();
  }

  init() {
    // Prüfe ob Einwilligung bereits existiert
    const consent = localStorage.getItem(this.consentKey);

    if (consent === null) {
      // Keine Einwilligung → Banner zeigen
      this.showBanner();
    } else if (consent === "accepted") {
      // Analytics erlaubt → normal laden
      console.log("✅ Analytics-Einwilligung vorhanden");
    } else {
      // Analytics abgelehnt → blockieren
      console.log("🚫 Analytics wurde abgelehnt");
      this.disableAnalytics();
    }
  }

  showBanner() {
    // Banner erstellen
    const banner = document.createElement("div");
    banner.className = "cookie-banner show";
    banner.innerHTML = `
      <div class="cookie-content">
        <div class="cookie-text">
          <p><strong>🍪 Wir nutzen Analytics</strong></p>
          <p>
            Diese Website verwendet localStorage und Supabase Analytics, 
            um Seitenbesuche und Klicks zu analysieren. 
            <a href="datenschutz.html">Mehr Infos</a>
          </p>
        </div>
        <div class="cookie-buttons">
          <button class="cookie-btn cookie-accept">✓ Akzeptieren</button>
          <button class="cookie-btn cookie-decline">✗ Ablehnen</button>
        </div>
      </div>
    `;

    document.body.appendChild(banner);

    // Event Listener
    banner.querySelector(".cookie-accept").addEventListener("click", () => {
      this.acceptAnalytics();
      banner.remove();
    });

    banner.querySelector(".cookie-decline").addEventListener("click", () => {
      this.declineAnalytics();
      banner.remove();
    });
  }

  acceptAnalytics() {
    localStorage.setItem(this.consentKey, "accepted");
    console.log("✅ Analytics aktiviert");
    // App normal laden
    window.location.reload(); // Neu laden damit Analytics startet
  }

  declineAnalytics() {
    localStorage.setItem(this.consentKey, "declined");
    console.log("🚫 Analytics deaktiviert");
    this.disableAnalytics();
  }

  disableAnalytics() {
    // Analytics-Class deaktivieren
    if (window.analytics) {
      window.analytics.disabled = true;
    }
    // LocalStorage für Tracking löschen
    localStorage.removeItem("linkClicks");
    sessionStorage.removeItem("analytics_session_id");
  }
}

// Banner beim Laden initialisieren
document.addEventListener("DOMContentLoaded", () => {
  new CookieConsent();
});
