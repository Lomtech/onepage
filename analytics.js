// analytics.js - Supabase Analytics Tracking
// Wird bei Netlify Build mit echten API-Keys ersetzt

class Analytics {
  constructor() {
    // Platzhalter werden von Netlify ersetzt
    const SUPABASE_URL = 'SUPABASE_URL_PLACEHOLDER';
    const SUPABASE_ANON_KEY = 'SUPABASE_ANON_KEY_PLACEHOLDER';
    
    // Supabase Client initialisieren
    this.supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Session ID generieren/laden (bleibt während Browser-Session gleich)
    this.sessionId = this.getOrCreateSessionId();
    
    // Page Visit tracken
    this.trackPageVisit();
  }

  // Session ID aus sessionStorage oder neu generieren
  getOrCreateSessionId() {
    let sessionId = sessionStorage.getItem('analytics_session_id');
    if (!sessionId) {
      sessionId = this.generateUUID();
      sessionStorage.setItem('analytics_session_id', sessionId);
    }
    return sessionId;
  }

  // UUID Generator (einfache Variante)
  generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  // Referrer sauber extrahieren
  getReferrer() {
    const ref = document.referrer;
    if (!ref) return null;
    
    try {
      const url = new URL(ref);
      // Nur Domain zurückgeben, keine vollständige URL
      return url.hostname;
    } catch (e) {
      return null;
    }
  }

  // User Agent Info
  getUserAgent() {
    return navigator.userAgent.substring(0, 255); // Max 255 Zeichen
  }

  // Page Visit tracken
  async trackPageVisit() {
    try {
      const { error } = await this.supabase
        .from('page_visits')
        .insert({
          session_id: this.sessionId,
          referrer: this.getReferrer(),
          user_agent: this.getUserAgent()
        });

      if (error) {
        console.warn('Analytics: Page visit tracking failed', error);
      }
    } catch (err) {
      console.warn('Analytics: Page visit tracking error', err);
    }
  }

  // Link Click tracken
  async trackLinkClick(linkId) {
    try {
      const { error } = await this.supabase
        .from('link_clicks')
        .insert({
          link_id: linkId,
          session_id: this.sessionId,
          referrer: this.getReferrer(),
          user_agent: this.getUserAgent()
        });

      if (error) {
        console.warn('Analytics: Link click tracking failed', error);
      }
    } catch (err) {
      console.warn('Analytics: Link click tracking error', err);
    }
  }

  // Klick-Statistiken aus localStorage laden (Fallback)
  getLocalClickStats(linkId) {
    const storageKey = 'link_clicks_v1';
    const clicks = JSON.parse(localStorage.getItem(storageKey) || '{}');
    return clicks[linkId] || 0;
  }

  // Klick-Statistiken in localStorage speichern (Fallback)
  saveLocalClickStats(linkId) {
    const storageKey = 'link_clicks_v1';
    const clicks = JSON.parse(localStorage.getItem(storageKey) || '{}');
    clicks[linkId] = (clicks[linkId] || 0) + 1;
    localStorage.setItem(storageKey, JSON.stringify(clicks));
    return clicks[linkId];
  }
}

// Global verfügbar machen
window.analytics = new Analytics();