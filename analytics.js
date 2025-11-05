// analytics.js - Supabase Analytics Tracking
// Netlify injiziert Umgebungsvariablen zur Build-Zeit

// WICHTIG: Diese Werte werden von Netlify zur BUILD-Zeit ersetzts
// Setze in Netlify: Site settings -> Environment variables -> Build variables
const SUPABASE_URL =
  import.meta.env?.SUPABASE_URL || "SUPABASE_URL_PLACEHOLDER";
const SUPABASE_ANON_KEY =
  import.meta.env?.SUPABASE_ANON_KEY || "SUPABASE_ANON_KEY_PLACEHOLDER";

class Analytics {
  constructor() {
    // Prüfe ob Supabase verfügbar ist
    if (typeof window.supabase === "undefined") {
      console.warn("Analytics: Supabase not loaded, running in fallback mode");
      this.disabled = true;
      this.sessionId = this.getOrCreateSessionId();
      return;
    }

    // Prüfe ob Keys gesetzt sind
    if (
      SUPABASE_URL.includes("PLACEHOLDER") ||
      SUPABASE_ANON_KEY.includes("PLACEHOLDER")
    ) {
      console.warn(
        "Analytics: Supabase keys not configured, running in fallback mode"
      );
      this.disabled = true;
      this.sessionId = this.getOrCreateSessionId();
      return;
    }

    // Supabase Client initialisieren
    try {
      this.supabase = window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY
      );
      this.disabled = false;
    } catch (error) {
      console.warn("Analytics: Failed to initialize Supabase", error);
      this.disabled = true;
    }

    // Session ID generieren/laden
    this.sessionId = this.getOrCreateSessionId();

    // Page Visit tracken (falls Analytics aktiv)
    if (!this.disabled) {
      this.trackPageVisit();
    }
  }

  // Session ID aus sessionStorage oder neu generieren
  getOrCreateSessionId() {
    let sessionId = sessionStorage.getItem("analytics_session_id");
    if (!sessionId) {
      sessionId = this.generateUUID();
      sessionStorage.setItem("analytics_session_id", sessionId);
    }
    return sessionId;
  }

  // UUID Generator (einfache Variante)
  generateUUID() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
  }

  // Referrer sauber extrahieren
  getReferrer() {
    const ref = document.referrer;
    if (!ref) return null;

    try {
      const url = new URL(ref);
      return url.hostname;
    } catch (e) {
      return null;
    }
  }

  // User Agent Info
  getUserAgent() {
    return navigator.userAgent.substring(0, 255);
  }

  // Page Visit tracken
  async trackPageVisit() {
    if (this.disabled) return;

    try {
      const { error } = await this.supabase.from("page_visits").insert({
        session_id: this.sessionId,
        referrer: this.getReferrer(),
        user_agent: this.getUserAgent(),
      });

      if (error) {
        console.warn("Analytics: Page visit tracking failed", error);
      }
    } catch (err) {
      console.warn("Analytics: Page visit tracking error", err);
    }
  }

  // Link Click tracken
  async trackLinkClick(linkId) {
    if (this.disabled) return;

    try {
      const { error } = await this.supabase.from("link_clicks").insert({
        link_id: linkId,
        session_id: this.sessionId,
        referrer: this.getReferrer(),
        user_agent: this.getUserAgent(),
      });

      if (error) {
        console.warn("Analytics: Link click tracking failed", error);
      }
    } catch (err) {
      console.warn("Analytics: Link click tracking error", err);
    }
  }

  // Klick-Statistiken aus localStorage laden (Fallback)
  getLocalClickStats(linkId) {
    const storageKey = "link_clicks_v1";
    const clicks = JSON.parse(localStorage.getItem(storageKey) || "{}");
    return clicks[linkId] || 0;
  }

  // Klick-Statistiken in localStorage speichern (Fallback)
  saveLocalClickStats(linkId) {
    const storageKey = "link_clicks_v1";
    const clicks = JSON.parse(localStorage.getItem(storageKey) || "{}");
    clicks[linkId] = (clicks[linkId] || 0) + 1;
    localStorage.setItem(storageKey, JSON.stringify(clicks));
    return clicks[linkId];
  }
}

// Global verfügbar machen - aber erst nach DOM ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", function () {
    window.analytics = new Analytics();
  });
} else {
  window.analytics = new Analytics();
}
