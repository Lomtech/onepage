// === CONFIGURATION ===
const SUPABASE_URL = "SUPABASE_URL_PLACEHOLDER";
const SUPABASE_ANON_KEY = "SUPABASE_KEY_PLACEHOLDER";
const ALLOWED_EMAIL = "ALLOWED_EMAIL_PLACEHOLDER";

// === SUPABASE CLIENT ===
let supabase;

// === INIT ===
document.addEventListener("DOMContentLoaded", async () => {
  // Supabase initialisieren
  if (typeof window.supabase === "undefined") {
    showError("Supabase SDK nicht geladen");
    return;
  }

  if (
    SUPABASE_URL.includes("PLACEHOLDER") ||
    SUPABASE_ANON_KEY.includes("PLACEHOLDER")
  ) {
    showError("Supabase nicht konfiguriert");
    return;
  }

  supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // Prüfe Session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    // User eingeloggt
    if (session.user.email === ALLOWED_EMAIL) {
      showDashboard(session.user);
    } else {
      showError(`Zugriff verweigert. Nur ${ALLOWED_EMAIL} ist autorisiert.`);
      await supabase.auth.signOut();
    }
  } else {
    // Kein Login → Login-Screen zeigen
    showLoginScreen();
  }

  // Auth State Changes
  supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === "SIGNED_IN" && session) {
      if (session.user.email === ALLOWED_EMAIL) {
        showDashboard(session.user);
      } else {
        showError(`Zugriff verweigert. Nur ${ALLOWED_EMAIL} ist autorisiert.`);
        await supabase.auth.signOut();
      }
    } else if (event === "SIGNED_OUT") {
      showLoginScreen();
    }
  });

  // Login Form
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", handleLogin);
  }

  // Logout Button
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", handleLogout);
  }
});

// === LOGIN HANDLER ===
async function handleLogin(e) {
  e.preventDefault();

  const email = document.getElementById("email").value.trim().toLowerCase();
  const loginBtn = document.getElementById("loginBtn");
  const statusDiv = document.getElementById("loginStatus");

  // Validiere Email-Format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showStatus("❌ Bitte gib eine gültige E-Mail-Adresse ein.", "error");
    return;
  }

  // Prüfe ob Email erlaubt ist
  const allowedEmail = ALLOWED_EMAIL.toLowerCase();
  if (email !== allowedEmail) {
    showStatus(
      `❌ Zugriff verweigert. Nur ${ALLOWED_EMAIL} ist autorisiert.`,
      "error"
    );
    return;
  }

  // Disable Button
  loginBtn.disabled = true;
  loginBtn.textContent = "⏳ Sende Magic Link...";

  try {
    const { data, error } = await supabase.auth.signInWithOtp({
      email: email,
      options: {
        emailRedirectTo: window.location.origin + "/dashboard.html",
        shouldCreateUser: true, // Wichtig: User automatisch anlegen
      },
    });

    if (error) {
      console.error("Supabase Auth Error:", error);
      throw new Error(error.message);
    }

    console.log("Magic Link sent:", data);
    showStatus(
      `✅ Magic Link wurde an ${email} gesendet!\n\nPrüfe dein Postfach (auch Spam-Ordner).`,
      "success"
    );
    document.getElementById("email").value = "";
  } catch (error) {
    console.error("Login error:", error);

    // Spezifische Fehlermeldungen
    let errorMessage = error.message;

    if (errorMessage.includes("Database error")) {
      errorMessage = "Datenbank-Fehler. Bitte prüfe die Supabase RLS Policies.";
    } else if (errorMessage.includes("Email not confirmed")) {
      errorMessage =
        "E-Mail nicht bestätigt. Prüfe Email Auth Settings in Supabase.";
    } else if (errorMessage.includes("Invalid email")) {
      errorMessage = "Ungültige E-Mail-Adresse.";
    }

    showStatus(`❌ Fehler: ${errorMessage}`, "error");
  } finally {
    loginBtn.disabled = false;
    loginBtn.textContent = "🔑 Magic Link senden";
  }
}

// === LOGOUT HANDLER ===
async function handleLogout() {
  try {
    await supabase.auth.signOut();
    showLoginScreen();
  } catch (error) {
    console.error("Logout error:", error);
    alert("Fehler beim Logout: " + error.message);
  }
}

// === SHOW LOGIN SCREEN ===
function showLoginScreen() {
  document.getElementById("loginScreen").style.display = "flex";
  document.getElementById("dashboardScreen").style.display = "none";
}

// === SHOW DASHBOARD ===
function showDashboard(user) {
  document.getElementById("loginScreen").style.display = "none";
  document.getElementById("dashboardScreen").style.display = "block";

  // User-Email anzeigen
  document.getElementById("userEmail").textContent = user.email;

  // Daten laden
  loadDashboardData();

  // Auto-Refresh alle 30 Sekunden
  setInterval(loadDashboardData, 30000);
}

// === LOAD DASHBOARD DATA ===
async function loadDashboardData() {
  console.log("📊 Lade Dashboard-Daten...");

  try {
    // 1. Total Page Visits
    const { count: totalVisits, error: visitsError } = await supabase
      .from("page_visits")
      .select("*", { count: "exact", head: true });

    if (visitsError) throw visitsError;
    document.getElementById("totalVisits").textContent =
      totalVisits?.toLocaleString() || "0";

    // 2. Total Link Clicks
    const { count: totalClicks, error: clicksError } = await supabase
      .from("link_clicks")
      .select("*", { count: "exact", head: true });

    if (clicksError) throw clicksError;
    document.getElementById("totalClicks").textContent =
      totalClicks?.toLocaleString() || "0";

    // 3. Unique Sessions (letzte 30 Tage)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: sessionsData, error: sessionsError } = await supabase
      .from("page_visits")
      .select("session_id")
      .gte("created_at", thirtyDaysAgo.toISOString());

    if (sessionsError) throw sessionsError;

    const uniqueSessions = new Set(sessionsData.map((row) => row.session_id))
      .size;
    document.getElementById("uniqueSessions").textContent =
      uniqueSessions.toLocaleString();

    // 4. Today's Visits
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { count: todayVisits, error: todayError } = await supabase
      .from("page_visits")
      .select("*", { count: "exact", head: true })
      .gte("created_at", today.toISOString());

    if (todayError) throw todayError;
    document.getElementById("todayVisits").textContent =
      todayVisits?.toLocaleString() || "0";

    // 5. Link Clicks by ID
    await loadLinkClicks();

    // 6. Top Referrers
    await loadTopReferrers();

    // 7. Recent Activity
    await loadRecentActivity();

    console.log("✅ Dashboard-Daten geladen");
  } catch (error) {
    console.error("Fehler beim Laden der Dashboard-Daten:", error);
    showError("Fehler beim Laden der Daten: " + error.message);
  }
}

// === LOAD LINK CLICKS ===
async function loadLinkClicks() {
  const tbody = document.getElementById("linkClicksTable");

  try {
    const { data, error } = await supabase
      .from("link_clicks")
      .select("link_id, clicked_at")
      .order("clicked_at", { ascending: false });

    if (error) throw error;

    // Gruppiere nach Link-ID
    const linkStats = {};
    data.forEach((click) => {
      if (!linkStats[click.link_id]) {
        linkStats[click.link_id] = {
          count: 0,
          lastClick: click.clicked_at,
        };
      }
      linkStats[click.link_id].count++;
      if (
        new Date(click.clicked_at) >
        new Date(linkStats[click.link_id].lastClick)
      ) {
        linkStats[click.link_id].lastClick = click.clicked_at;
      }
    });

    // Sortiere nach Klickzahl
    const sorted = Object.entries(linkStats).sort(
      (a, b) => b[1].count - a[1].count
    );

    if (sorted.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="3" class="no-data">Noch keine Link-Klicks</td></tr>';
      return;
    }

    tbody.innerHTML = sorted
      .map(
        ([linkId, stats]) => `
      <tr>
        <td><strong>${linkId}</strong></td>
        <td>${stats.count.toLocaleString()}</td>
        <td>${formatDate(stats.lastClick)}</td>
      </tr>
    `
      )
      .join("");
  } catch (error) {
    console.error("Fehler beim Laden der Link-Klicks:", error);
    tbody.innerHTML = `<tr><td colspan="3" class="no-data">Fehler: ${error.message}</td></tr>`;
  }
}

// === LOAD TOP REFERRERS ===
async function loadTopReferrers() {
  const tbody = document.getElementById("referrersTable");

  try {
    const { data, error } = await supabase
      .from("page_visits")
      .select("referrer");

    if (error) throw error;

    // Zähle Referrer
    const referrerCounts = {};
    data.forEach((visit) => {
      const ref = visit.referrer || "Direct / Keine Quelle";
      referrerCounts[ref] = (referrerCounts[ref] || 0) + 1;
    });

    // Sortiere nach Häufigkeit
    const sorted = Object.entries(referrerCounts).sort((a, b) => b[1] - a[1]);

    if (sorted.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="2" class="no-data">Keine Referrer-Daten</td></tr>';
      return;
    }

    tbody.innerHTML = sorted
      .slice(0, 10) // Top 10
      .map(
        ([referrer, count]) => `
      <tr>
        <td>${referrer}</td>
        <td>${count.toLocaleString()}</td>
      </tr>
    `
      )
      .join("");
  } catch (error) {
    console.error("Fehler beim Laden der Referrer:", error);
    tbody.innerHTML = `<tr><td colspan="2" class="no-data">Fehler: ${error.message}</td></tr>`;
  }
}

// === LOAD RECENT ACTIVITY ===
async function loadRecentActivity() {
  const tbody = document.getElementById("recentActivityTable");

  try {
    const yesterday = new Date();
    yesterday.setHours(yesterday.getHours() - 24);

    // Hole letzte Page Visits
    const { data: visits, error: visitsError } = await supabase
      .from("page_visits")
      .select("created_at, referrer")
      .gte("created_at", yesterday.toISOString())
      .order("created_at", { ascending: false })
      .limit(10);

    if (visitsError) throw visitsError;

    // Hole letzte Link Clicks
    const { data: clicks, error: clicksError } = await supabase
      .from("link_clicks")
      .select("clicked_at, link_id")
      .gte("clicked_at", yesterday.toISOString())
      .order("clicked_at", { ascending: false })
      .limit(10);

    if (clicksError) throw clicksError;

    // Kombiniere und sortiere
    const activities = [
      ...visits.map((v) => ({
        time: v.created_at,
        type: "Seitenaufruf",
        details: v.referrer || "Direct",
      })),
      ...clicks.map((c) => ({
        time: c.clicked_at,
        type: "Link-Klick",
        details: c.link_id,
      })),
    ].sort((a, b) => new Date(b.time) - new Date(a.time));

    if (activities.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="3" class="no-data">Keine Aktivität in den letzten 24h</td></tr>';
      return;
    }

    tbody.innerHTML = activities
      .slice(0, 20) // Top 20
      .map(
        (activity) => `
      <tr>
        <td>${formatDate(activity.time)}</td>
        <td>${activity.type}</td>
        <td>${activity.details}</td>
      </tr>
    `
      )
      .join("");
  } catch (error) {
    console.error("Fehler beim Laden der Aktivitäten:", error);
    tbody.innerHTML = `<tr><td colspan="3" class="no-data">Fehler: ${error.message}</td></tr>`;
  }
}

// === HELPER: FORMAT DATE ===
function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Gerade eben";
  if (diffMins < 60) return `vor ${diffMins} Min.`;
  if (diffHours < 24) return `vor ${diffHours} Std.`;
  if (diffDays < 7) return `vor ${diffDays} Tag${diffDays > 1 ? "en" : ""}`;

  return date.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// === SHOW STATUS MESSAGE ===
function showStatus(message, type) {
  const statusDiv = document.getElementById("loginStatus");
  statusDiv.textContent = message;
  statusDiv.className = `status-message ${type}`;
}

// === SHOW ERROR ===
function showError(message) {
  alert("❌ Fehler: " + message);
}
