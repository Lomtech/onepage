// === CONFIGURATION ===
const SUPABASE_URL = "SUPABASE_URL_PLACEHOLDER";
const SUPABASE_ANON_KEY = "SUPABASE_KEY_PLACEHOLDER";

// === INITIALIZATION ===
document.addEventListener("DOMContentLoaded", () => {
  console.log("🚀 App initialized");

  // Prüfe Analytics-Einwilligung
  const consent = localStorage.getItem("analytics_consent");

  if (consent === "accepted") {
    // Einwilligung vorhanden → Analytics laden
    console.log(
      "✅ Analytics-Einwilligung vorhanden - Analytics wird initialisiert"
    );
    window.analytics = new Analytics();
    loadClickCounts(); // Zähler laden
  } else {
    // Keine Einwilligung → Analytics deaktiviert
    console.log("⏸️ Analytics wartet auf Einwilligung");
    window.analytics = { disabled: true, trackLinkClick: () => {} }; // Dummy-Objekt
  }

  // Klick-Events für alle Links
  document.querySelectorAll(".link").forEach((link) => {
    link.addEventListener("click", (e) => {
      const linkId = link.dataset.id;

      // Nur tracken wenn Einwilligung vorliegt
      if (consent === "accepted") {
        incrementClick(linkId);
        analytics.trackLinkClick(linkId);
      }
    });
  });

  // Copy Button
  const copyBtn = document.getElementById("copyBtn");
  if (copyBtn) {
    copyBtn.addEventListener("click", copyUrl);
  }
});

// === LOCAL FALLBACK CLICK COUNT ===
function loadClickCounts() {
  document.querySelectorAll(".link").forEach((link) => {
    const linkId = link.dataset.id;
    const count = getClickCount(linkId);
    const counter = link.querySelector(".counter");
    if (counter) {
      counter.textContent = count;
    }
  });
}

function getClickCount(linkId) {
  const counts = JSON.parse(localStorage.getItem("linkClicks") || "{}");
  return counts[linkId] || 0;
}

function incrementClick(linkId) {
  const counts = JSON.parse(localStorage.getItem("linkClicks") || "{}");
  counts[linkId] = (counts[linkId] || 0) + 1;
  localStorage.setItem("linkClicks", JSON.stringify(counts));

  const link = document.querySelector(`[data-id="${linkId}"]`);
  if (link) {
    const counter = link.querySelector(".counter");
    if (counter) {
      counter.textContent = counts[linkId];
    }
  }

  console.log(`✅ Click tracked locally: ${linkId} = ${counts[linkId]}`);
}

// === COPY BUTTON ===
async function copyUrl() {
  const url = window.location.href;
  try {
    await navigator.clipboard.writeText(url);
    const btn = document.getElementById("copyBtn");
    const originalText = btn.textContent;
    btn.textContent = "✅ Kopiert!";
    setTimeout(() => (btn.textContent = originalText), 2000);
  } catch (err) {
    alert("Fehler beim Kopieren: " + err);
  }
}

// === ANALYTICS CLASS ===
class Analytics {
  constructor() {
    // Prüfe ob Supabase SDK geladen ist
    if (typeof window.supabase === "undefined") {
      console.warn("⚠️ Supabase SDK not loaded, running fallback");
      this.disabled = true;
      this.sessionId = this.getOrCreateSessionId();
      return;
    }

    // Prüfe ob Supabase-Keys konfiguriert sind
    if (
      SUPABASE_URL.includes("PLACEHOLDER") ||
      SUPABASE_ANON_KEY.includes("PLACEHOLDER")
    ) {
      console.warn("⚠️ Supabase keys not configured");
      this.disabled = true;
      this.sessionId = this.getOrCreateSessionId();
      return;
    }

    try {
      this.supabase = window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY
      );
      this.disabled = false;
      console.log("✅ Supabase Analytics active");
    } catch (err) {
      console.error("❌ Failed to init Supabase", err);
      this.disabled = true;
    }

    this.sessionId = this.getOrCreateSessionId();
    if (!this.disabled) this.trackPageVisit();
  }

  // === Session ID ===
  getOrCreateSessionId() {
    let sessionId = sessionStorage.getItem("analytics_session_id");
    if (!sessionId) {
      sessionId = this.generateUUID();
      sessionStorage.setItem("analytics_session_id", sessionId);
    }
    return sessionId;
  }

  generateUUID() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  getReferrer() {
    const ref = document.referrer;
    if (!ref) return null;
    try {
      const url = new URL(ref);
      return url.hostname;
    } catch {
      return null;
    }
  }

  getUserAgent() {
    return navigator.userAgent.substring(0, 255);
  }

  // === Tracking Methods ===
  async trackPageVisit() {
    if (this.disabled) return;
    try {
      const { error } = await this.supabase.from("page_visits").insert({
        session_id: this.sessionId,
        referrer: this.getReferrer(),
        user_agent: this.getUserAgent(),
        created_at: new Date().toISOString(),
      });
      if (error) console.warn("Page visit tracking failed", error);
      else console.log("📈 Page visit logged");
    } catch (err) {
      console.warn("Page visit error:", err);
    }
  }

  async trackLinkClick(linkId) {
    if (this.disabled) return;
    try {
      const { error } = await this.supabase.from("link_clicks").insert({
        link_id: linkId,
        session_id: this.sessionId,
        referrer: this.getReferrer(),
        user_agent: this.getUserAgent(),
        clicked_at: new Date().toISOString(),
      });
      if (error) console.warn("Link click tracking failed", error);
      else console.log(`📊 Link click logged: ${linkId}`);
    } catch (err) {
      console.warn("Link click error:", err);
    }
  }
}
