// dashboard.js - Analytics Dashboard Logic

// Platzhalter werden von Netlify ersetzt
const SUPABASE_URL = 'SUPABASE_URL_PLACEHOLDER';
const SUPABASE_ANON_KEY = 'SUPABASE_ANON_KEY_PLACEHOLDER';

// Supabase Client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Link Namen Mapping (sollte mit script.js sync sein)
const linkNames = {
  'bjj-open-mats': 'BJJ Open Mats',
  'x-twitter': 'X/Twitter',
  'tiktok': 'TikTok',
  'instagram': 'Instagram'
};

// DOM Elements
const loginScreen = document.getElementById('loginScreen');
const dashboardContent = document.getElementById('dashboardContent');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const logoutBtn = document.getElementById('logoutBtn');
const loadingState = document.getElementById('loadingState');

// Current filter
let currentDaysFilter = 7;

// Chart instance
let visitsChart = null;

// Check if already logged in
checkAuth();

// Login Form Handler
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  loginError.textContent = '';

  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    // Erfolgreich eingeloggt
    showDashboard();
  } catch (error) {
    loginError.textContent = error.message || 'Login fehlgeschlagen';
  }
});

// Logout Handler
logoutBtn.addEventListener('click', async () => {
  await supabase.auth.signOut();
  showLogin();
});

// Filter Buttons
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentDaysFilter = parseInt(btn.dataset.days);
    loadDashboardData();
  });
});

// Check Authentication
async function checkAuth() {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (session) {
    showDashboard();
  } else {
    showLogin();
  }
}

// Show Login Screen
function showLogin() {
  loginScreen.style.display = 'flex';
  dashboardContent.style.display = 'none';
}

// Show Dashboard
function showDashboard() {
  loginScreen.style.display = 'none';
  dashboardContent.style.display = 'block';
  loadDashboardData();
}

// Load Dashboard Data
async function loadDashboardData() {
  showLoading(true);

  try {
    // Call Supabase Function für aggregierte Stats
    const { data, error } = await supabase.rpc('get_dashboard_stats', {
      days_back: currentDaysFilter
    });

    if (error) throw error;

    // Update UI with data
    updateStatsCards(data);
    updateVisitsChart(data.daily_visits);
    updateLinkClicksList(data.clicks_by_link);
    updateReferrersList(data.top_referrers);

  } catch (error) {
    console.error('Dashboard data load error:', error);
    alert('Fehler beim Laden der Daten: ' + error.message);
  } finally {
    showLoading(false);
  }
}

// Update Stats Cards
function updateStatsCards(data) {
  const totalVisits = data.total_visits || 0;
  const totalClicks = data.total_clicks || 0;
  const ctr = totalVisits > 0 ? ((totalClicks / totalVisits) * 100).toFixed(1) : 0;
  
  // Top Link ermitteln
  let topLinkName = '-';
  if (data.clicks_by_link && data.clicks_by_link.length > 0) {
    const topLinkId = data.clicks_by_link[0].link_id;
    topLinkName = linkNames[topLinkId] || topLinkId;
  }

  document.getElementById('totalVisits').textContent = totalVisits.toLocaleString('de-DE');
  document.getElementById('totalClicks').textContent = totalClicks.toLocaleString('de-DE');
  document.getElementById('ctr').textContent = ctr + '%';
  document.getElementById('topLink').textContent = topLinkName;
}

// Update Visits Chart
function updateVisitsChart(dailyVisits) {
  const canvas = document.getElementById('visitsChart');
  const ctx = canvas.getContext('2d');

  // Destroy existing chart
  if (visitsChart) {
    visitsChart.destroy();
  }

  if (!dailyVisits || dailyVisits.length === 0) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = '14px Inter';
    ctx.fillStyle = '#999';
    ctx.textAlign = 'center';
    ctx.fillText('Keine Daten verfügbar', canvas.width / 2, canvas.height / 2);
    return;
  }

  // Prepare data (reverse to show chronologically)
  const labels = dailyVisits.reverse().map(d => {
    const date = new Date(d.date);
    return date.toLocaleDateString('de-DE', { month: 'short', day: 'numeric' });
  });
  const values = dailyVisits.map(d => d.visits);

  // Create chart
  visitsChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Unique Visitors',
        data: values,
        borderColor: '#0ea5a4',
        backgroundColor: 'rgba(14, 165, 164, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0
          }
        }
      }
    }
  });
}

// Update Link Clicks List
function updateLinkClicksList(clicksByLink) {
  const container = document.getElementById('linkClicksList');
  container.innerHTML = '';

  if (!clicksByLink || clicksByLink.length === 0) {
    container.innerHTML = '<p style="text-align: center; color: #999;">Keine Clicks erfasst</p>';
    return;
  }

  // Max value für Balken-Breite
  const maxClicks = Math.max(...clicksByLink.map(l => l.count));

  clicksByLink.forEach(link => {
    const linkName = linkNames[link.link_id] || link.link_id;
    const barWidth = (link.count / maxClicks) * 100;

    const item = document.createElement('div');
    item.className = 'link-click-item';
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
  const container = document.getElementById('referrersList');
  container.innerHTML = '';

  if (!topReferrers || topReferrers.length === 0) {
    container.innerHTML = '<p style="text-align: center; color: #999;">Keine Traffic-Quellen erfasst</p>';
    return;
  }

  topReferrers.forEach(ref => {
    const item = document.createElement('div');
    item.className = 'referrer-item';
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
    loadingState.classList.add('active');
  } else {
    loadingState.classList.remove('active');
  }
}