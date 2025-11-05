// app.js - Simple Link Tracker (localStorage only)
const SUPABASE_URL = "SUPABASE_URL_PLACEHOLDER";
const SUPABASE_ANON_KEY = "SUPABASE_ANON_KEY_PLACEHOLDER";

// Initialize counters
document.addEventListener("DOMContentLoaded", () => {
  console.log("🚀 App initialized");

  // Load click counts
  loadClickCounts();

  // Add click listeners
  const links = document.querySelectorAll(".link");
  links.forEach((link) => {
    link.addEventListener("click", (e) => {
      const linkId = link.dataset.id;
      incrementClick(linkId);
    });
  });

  // Copy button
  const copyBtn = document.getElementById("copyBtn");
  copyBtn.addEventListener("click", copyUrl);
});

// Load click counts from localStorage
function loadClickCounts() {
  const links = document.querySelectorAll(".link");
  links.forEach((link) => {
    const linkId = link.dataset.id;
    const count = getClickCount(linkId);
    const counter = link.querySelector(".counter");
    counter.textContent = count;
  });
}

// Get click count for a link
function getClickCount(linkId) {
  const counts = JSON.parse(localStorage.getItem("linkClicks") || "{}");
  return counts[linkId] || 0;
}

// Increment click count
function incrementClick(linkId) {
  const counts = JSON.parse(localStorage.getItem("linkClicks") || "{}");
  counts[linkId] = (counts[linkId] || 0) + 1;
  localStorage.setItem("linkClicks", JSON.stringify(counts));

  // Update display
  const link = document.querySelector(`[data-id="${linkId}"]`);
  const counter = link.querySelector(".counter");
  counter.textContent = counts[linkId];

  console.log(`✅ Click tracked: ${linkId} = ${counts[linkId]}`);
}

// Copy URL to clipboard
async function copyUrl() {
  const url = window.location.href;
  try {
    await navigator.clipboard.writeText(url);
    const btn = document.getElementById("copyBtn");
    const originalText = btn.textContent;
    btn.textContent = "✅ Kopiert!";
    setTimeout(() => {
      btn.textContent = originalText;
    }, 2000);
  } catch (err) {
    alert("Fehler beim Kopieren: " + err);
  }
}

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

// Supabase Client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Link Namen Mapping (sollte mit script.js sync sein)
const linkNames = {
  "bjj-open-mats": "BJJ Open Mats",
  "x-twitter": "X/Twitter",
  tiktok: "TikTok",
  instagram: "Instagram",
};

// DOM Elements
const loginScreen = document.getElementById("loginScreen");
const dashboardContent = document.getElementById("dashboardContent");
const loginForm = document.getElementById("loginForm");
const loginError = document.getElementById("loginError");
const logoutBtn = document.getElementById("logoutBtn");
const loadingState = document.getElementById("loadingState");

// Current filter
let currentDaysFilter = 7;

// Chart instance
let visitsChart = null;

// Check if already logged in
checkAuth();

// Login Form Handler
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  loginError.textContent = "";

  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    // Erfolgreich eingeloggt
    showDashboard();
  } catch (error) {
    loginError.textContent = error.message || "Login fehlgeschlagen";
  }
});

// Logout Handler
logoutBtn.addEventListener("click", async () => {
  await supabase.auth.signOut();
  showLogin();
});

// Filter Buttons
document.querySelectorAll(".filter-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document
      .querySelectorAll(".filter-btn")
      .forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentDaysFilter = parseInt(btn.dataset.days);
    loadDashboardData();
  });
});

// Check Authenticationn
async function checkAuth() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    showDashboard();
  } else {
    showLogin();
  }
}

// Show Login Screen
function showLogin() {
  loginScreen.style.display = "flex";
  dashboardContent.style.display = "none";
}

// Show Dashboard
function showDashboard() {
  loginScreen.style.display = "none";
  dashboardContent.style.display = "block";
  loadDashboardData();
}

// Load Dashboard Data
async function loadDashboardData() {
  showLoading(true);

  try {
    // Call Supabase Function für aggregierte Stats
    const { data, error } = await supabase.rpc("get_dashboard_stats", {
      days_back: currentDaysFilter,
    });

    if (error) throw error;

    // Update UI with data
    updateStatsCards(data);
    updateVisitsChart(data.daily_visits);
    updateLinkClicksList(data.clicks_by_link);
    updateReferrersList(data.top_referrers);
  } catch (error) {
    console.error("Dashboard data load error:", error);
    alert("Fehler beim Laden der Daten: " + error.message);
  } finally {
    showLoading(false);
  }
}

// Update Stats Cards
function updateStatsCards(data) {
  const totalVisits = data.total_visits || 0;
  const totalClicks = data.total_clicks || 0;
  const ctr =
    totalVisits > 0 ? ((totalClicks / totalVisits) * 100).toFixed(1) : 0;

  // Top Link ermitteln
  let topLinkName = "-";
  if (data.clicks_by_link && data.clicks_by_link.length > 0) {
    const topLinkId = data.clicks_by_link[0].link_id;
    topLinkName = linkNames[topLinkId] || topLinkId;
  }

  document.getElementById("totalVisits").textContent =
    totalVisits.toLocaleString("de-DE");
  document.getElementById("totalClicks").textContent =
    totalClicks.toLocaleString("de-DE");
  document.getElementById("ctr").textContent = ctr + "%";
  document.getElementById("topLink").textContent = topLinkName;
}

// Update Visits Chart
function updateVisitsChart(dailyVisits) {
  const canvas = document.getElementById("visitsChart");
  const ctx = canvas.getContext("2d");

  // Destroy existing chart
  if (visitsChart) {
    visitsChart.destroy();
  }

  if (!dailyVisits || dailyVisits.length === 0) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = "14px Inter";
    ctx.fillStyle = "#999";
    ctx.textAlign = "center";
    ctx.fillText("Keine Daten verfügbar", canvas.width / 2, canvas.height / 2);
    return;
  }

  // Prepare data (reverse to show chronologically)
  const labels = dailyVisits.reverse().map((d) => {
    const date = new Date(d.date);
    return date.toLocaleDateString("de-DE", { month: "short", day: "numeric" });
  });
  const values = dailyVisits.map((d) => d.visits);

  // Create chart
  visitsChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Unique Visitors",
          data: values,
          borderColor: "#0ea5a4",
          backgroundColor: "rgba(14, 165, 164, 0.1)",
          borderWidth: 2,
          tension: 0.4,
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0,
          },
        },
      },
    },
  });
}

// Update Link Clicks List
function updateLinkClicksList(clicksByLink) {
  const container = document.getElementById("linkClicksList");
  container.innerHTML = "";

  if (!clicksByLink || clicksByLink.length === 0) {
    container.innerHTML =
      '<p style="text-align: center; color: #999;">Keine Clicks erfasst</p>';
    return;
  }

  // Max value für Balken-Breite
  const maxClicks = Math.max(...clicksByLink.map((l) => l.count));

  clicksByLink.forEach((link) => {
    const linkName = linkNames[link.link_id] || link.link_id;
    const barWidth = (link.count / maxClicks) * 100;

    const item = document.createElement("div");
    item.className = "link-click-item";
    item.innerHTML = `
      <div style="flex: 1;">
        <div class="link-name">${linkName}</div>
        <div class="link-click-bar" style="width: ${barWidth}%;"></div>
      </div>
      <div class="link-count">${link.count}</div>
    `;
    container.appendChild(item);
  });
}

// Update Referrers List
function updateReferrersList(topReferrers) {
  const container = document.getElementById("referrersList");
  container.innerHTML = "";

  if (!topReferrers || topReferrers.length === 0) {
    container.innerHTML =
      '<p style="text-align: center; color: #999;">Keine Traffic-Quellen erfasst</p>';
    return;
  }

  topReferrers.forEach((ref) => {
    const item = document.createElement("div");
    item.className = "referrer-item";
    item.innerHTML = `
      <div class="referrer-name">${ref.referrer}</div>
      <div class="referrer-count">${ref.count}</div>
    `;
    container.appendChild(item);
  });
}

// Show/Hide Loading State
function showLoading(show) {
  if (show) {
    loadingState.classList.add("active");
  } else {
    loadingState.classList.remove("active");
  }
}
