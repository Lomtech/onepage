// Daten: später per fetch/JSON oder Backend ersetzbar
const profile = {
  name: "Max Mustermann",
  bio: "Designer · Webdev · Kaffee-Liebhaber — Hier meine wichtigsten Links.",
  avatar: "assets/avatar.jpg",
  links: [
    { id: "1", title: "Portfolio", url: "https://example.com", desc: "Meine Arbeiten", color: "#FFD166" },
    { id: "2", title: "Twitter", url: "https://twitter.com/example", desc: "@example", color: "#4dabf7" },
    { id: "3", title: "Blog", url: "https://blog.example.com", desc: "Gedanken & Tutorials", color: "#7ae582" }
  ]
};

// DOM-Elemente
const nameEl = document.getElementById('name');
const bioEl = document.getElementById('bio');
const avatarEl = document.querySelector('.avatar');
const linksContainer = document.getElementById('links');
const copyBtn = document.getElementById('copyUrlBtn');
const themeToggle = document.getElementById('themeToggle');

// Init
nameEl.textContent = profile.name;
bioEl.textContent = profile.bio;
avatarEl.src = profile.avatar || 'assets/avatar.jpg';

// Klick-Zähler mit localStorage (einfach)
const storageKey = 'link_clicks_v1';
const clicks = JSON.parse(localStorage.getItem(storageKey) || '{}');

function saveClicks(){
  localStorage.setItem(storageKey, JSON.stringify(clicks));
}

// Render Links
function renderLinks(){
  linksContainer.innerHTML = '';
  profile.links.forEach(link => {
    const a = document.createElement('a');
    a.className = 'link';
    a.href = link.url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.dataset.id = link.id;

    const icon = document.createElement('div');
    icon.className = 'icon';
    icon.textContent = link.title[0] || 'L';
    icon.style.background = `${link.color || 'rgba(14,165,164,0.12)'}`;
    icon.style.color = '#0b1220';

    const meta = document.createElement('div');
    meta.className = 'meta';
    const title = document.createElement('h3');
    title.textContent = link.title;
    const desc = document.createElement('p');
    desc.textContent = link.desc || '';

    meta.appendChild(title);
    meta.appendChild(desc);

    const counter = document.createElement('div');
    counter.className = 'counter';
    counter.textContent = `${clicks[link.id] || 0} clicks`;

    a.appendChild(icon);
    a.appendChild(meta);
    a.appendChild(counter);

    // Klick-Handler: Zähler erhöhen
    a.addEventListener('click', (e) => {
      // Zähler client-side erhöhen — falls du server-analytics willst, sende fetch POST
      clicks[link.id] = (clicks[link.id] || 0) + 1;
      saveClicks();
      counter.textContent = `${clicks[link.id]} clicks`;
      // Link öffnet normal in neuem Tab
    });

    linksContainer.appendChild(a);
  });
}

renderLinks();

// Copy profile URL
copyBtn.addEventListener('click', async () => {
  const url = location.href;
  try {
    await navigator.clipboard.writeText(url);
    copyBtn.textContent = 'Kopiert!';
    setTimeout(()=> copyBtn.textContent = 'Link kopieren', 1500);
  } catch(e){
    alert('Kopieren fehlgeschlagen: ' + e);
  }
});

// Theme toggle (extra)
themeToggle.addEventListener('click', () => {
  if(document.documentElement.hasAttribute('data-theme')) {
    document.documentElement.removeAttribute('data-theme');
    themeToggle.textContent = 'Theme';
  } else {
    document.documentElement.setAttribute('data-theme', 'dark');
    // when attribute present, you can override vars via CSS if desired
    themeToggle.textContent = 'System';
  }
});