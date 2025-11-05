// script-local-test.js - Version OHNE Analytics zum Testen
// Ersetze in index.html: <script src="script.js"></script> 
// mit: <script src="script-local-test.js"></script>

const profile = {
  name: "Lom-Ali Imadaev",
  bio: "Combat Grappler · Senior SAP-Consultant · ABAP-Entwickler · Webdev · Kaffee-Liebhaber — Hier meine wichtigsten Links.",
  avatar: "assets/avatar.jpg",
  links: [
    {
      id: "bjj-open-mats",
      title: "BJJ Open Mats",
      url: "https://bjjom.de/",
      desc: "BJJ-Community",
      color: "#4268e5ff",
    },
    {
      id: "x-twitter",
      title: "x.com",
      url: "https://x.com/LImadaev97219",
      desc: "@LImadaev97219",
      color: "#dadadaff",
    },
    {
      id: "tiktok",
      title: "TikTok",
      url: "https://www.tiktok.com/@lom1923?lang=de-DE",
      desc: "Gedanken zu Kampfsport",
      color: "#28e028ff",
    },
    {
      id: "instagram",
      title: "Instagram",
      url: "https://www.instagram.com/lomcombatgrappler/",
      desc: "Mein IG-Profil",
      color: "#e57adcff",
    },
  ],
};

// DOM-Elemente
const nameEl = document.getElementById("name");
const bioEl = document.getElementById("bio");
const avatarEl = document.querySelector(".avatar");
const linksContainer = document.getElementById("links");
const copyBtn = document.getElementById("copyUrlBtn");

// Init
nameEl.textContent = profile.name;
bioEl.textContent = profile.bio;
avatarEl.src = profile.avatar || "assets/avatar.jpg";

// Einfache localStorage Funktionen
function getClickStats(linkId) {
  const storageKey = "link_clicks_v1";
  const clicks = JSON.parse(localStorage.getItem(storageKey) || "{}");
  return clicks[linkId] || 0;
}

function saveClickStats(linkId) {
  const storageKey = "link_clicks_v1";
  const clicks = JSON.parse(localStorage.getItem(storageKey) || "{}");
  clicks[linkId] = (clicks[linkId] || 0) + 1;
  localStorage.setItem(storageKey, JSON.stringify(clicks));
  return clicks[linkId];
}

// Render Links
function renderLinks() {
  console.log("🔄 Rendering links...");
  linksContainer.innerHTML = "";

  profile.links.forEach((link) => {
    console.log("📌 Creating link:", link.title);
    
    const a = document.createElement("a");
    a.className = "link";
    a.href = link.url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.dataset.id = link.id;

    const icon = document.createElement("div");
    icon.className = "icon";
    icon.textContent = link.title[0] || "L";
    icon.style.background = link.color || "rgba(14,165,164,0.12)";
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
    const localClicks = getClickStats(link.id);
    counter.textContent = `${localClicks} clicks`;

    a.appendChild(icon);
    a.appendChild(meta);
    a.appendChild(counter);

    // Klick-Handler (nur localStorage, kein Analytics)
    a.addEventListener("click", () => {
      const newCount = saveClickStats(link.id);
      counter.textContent = `${newCount} clicks`;
      console.log(`✅ Click tracked: ${link.title} (${newCount})`);
    });

    linksContainer.appendChild(a);
  });
  
  console.log("✅ Links rendered successfully!");
}

// Sofort rendern
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