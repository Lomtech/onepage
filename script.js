// Daten: später per fetch/JSON oder Backend ersetzbar
const profile = {
  name: "Lom-Ali Imadaev",
  bio: "Combat Grappler · Senior SAP-Consultant · ABAP-Entwickler · Webdev · Kaffee-Liebhaber — Hier meine wichtigsten Links.",
  avatar: "assets/avatar.jpg",
  links: [
    {
      id: "1",
      title: "Website",
      url: "https://bjjom.de/",
      desc: "BJJ-Community",
      color: "#4268e5ff",
    },
    {
      id: "2",
      title: "x.com",
      url: "https://x.com/LImadaev97219",
      desc: "@LImadaev97219",
      color: "#dadadaff",
    },
    {
      id: "3",
      title: "TikTok",
      url: "https://www.tiktok.com/@lom1923?lang=de-DE",
      desc: "Gedanken zu Kampfsport",
      color: "#28e028ff",
    },
    {
      id: "4",
      title: "Instagram",
      url: "https://www.instagram.com/lomcombatgrappler/",
      desc: "Mein IG-Profil",
      color: "#e57adcff",
    },
  ],
};

// DOM-Elementee
const nameEl = document.getElementById("name");
const bioEl = document.getElementById("bio");
const avatarEl = document.querySelector(".avatar");
const linksContainer = document.getElementById("links");
const copyBtn = document.getElementById("copyUrlBtn");
// const themeToggle = document.getElementById("themeToggle");

// Init
nameEl.textContent = profile.name;
bioEl.textContent = profile.bio;
avatarEl.src = profile.avatar || "assets/avatar.jpg";

// Klick-Zähler mit localStorage (einfach)
const storageKey = "link_clicks_v1";
const clicks = JSON.parse(localStorage.getItem(storageKey) || "{}");

function saveClicks() {
  localStorage.setItem(storageKey, JSON.stringify(clicks));
}

// Render Links
function renderLinks() {
  linksContainer.innerHTML = "";
  profile.links.forEach((link) => {
    const a = document.createElement("a");
    a.className = "link";
    a.href = link.url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.dataset.id = link.id;

    const icon = document.createElement("div");
    icon.className = "icon";
    icon.textContent = link.title[0] || "L";
    icon.style.background = `${link.color || "rgba(14,165,164,0.12)"}`;
    icon.style.color = "#0b1220";

    const meta = document.createElement("div");
    meta.className = "meta";
    const title = document.createElement("h3");
    title.textContent = link.title;
    const desc = document.createElement("p");
    desc.textContent = link.desc || "";

    meta.appendChild(title);
    meta.appendChild(desc);

    const counter = document.createElement("div");
    counter.className = "counter";
    counter.textContent = `${clicks[link.id] || 0} clicks`;

    a.appendChild(icon);
    a.appendChild(meta);
    a.appendChild(counter);

    // Klick-Handler: Zähler erhöhen
    a.addEventListener("click", (e) => {
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
copyBtn.addEventListener("click", async () => {
  const url = location.href;
  try {
    await navigator.clipboard.writeText(url);
    copyBtn.textContent = "Kopiert!";
    setTimeout(() => (copyBtn.textContent = "Link kopieren"), 1500);
  } catch (e) {
    alert("Kopieren fehlgeschlagen: " + e);
  }
});

document.documentElement.removeAttribute("dark-theme");

// // Theme toggle (extra)
// themeToggle.addEventListener('click', () => {
//   if(document.documentElement.hasAttribute('data-theme')) {
//     document.documentElement.removeAttribute('data-theme');
//     themeToggle.textContent = 'Theme';
//   } else {
//     document.documentElement.setAttribute('data-theme', 'dark');
//     // when attribute present, you can override vars via CSS if desired
//     themeToggle.textContent = 'System';
//   }
// });
