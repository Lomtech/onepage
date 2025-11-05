const fs = require("fs");
const path = require("path");

// === Basis-Verzeichnisse ===
const buildDir = path.join(__dirname, "dist");
const assetsDir = path.join(__dirname, "assets");
const buildAssetsDir = path.join(buildDir, "assets");

// === Dist-Ordner anlegen ===
if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir);
  console.log("📁 dist/ Ordner erstellt");
}

console.log("\n🔨 Build-Prozess gestartet...\n");

// === Kopiere index.html ===
fs.copyFileSync("index.html", path.join(buildDir, "index.html"));
console.log("   ✓ index.html");

// === Kopiere CSS ===
fs.copyFileSync("styles.css", path.join(buildDir, "styles.css"));
console.log("   ✓ styles.css");

// === Kopiere Cookie-Banner CSS ===
if (fs.existsSync("cookie-banner.css")) {
  fs.copyFileSync(
    "cookie-banner.css",
    path.join(buildDir, "cookie-banner.css")
  );
  console.log("   ✓ cookie-banner.css");
} else {
  console.warn("   ⚠️ cookie-banner.css nicht gefunden");
}

// === Kopiere HTML Pages ===
["datenschutz.html", "impressum.html", "dashboard.html"].forEach((file) => {
  if (fs.existsSync(file)) {
    fs.copyFileSync(file, path.join(buildDir, file));
    console.log(`   ✓ ${file}`);
  } else {
    console.warn(`   ⚠️ ${file} nicht gefunden`);
  }
});

// === Kopiere Dashboard CSS ===
if (fs.existsSync("dashboard.css")) {
  fs.copyFileSync("dashboard.css", path.join(buildDir, "dashboard.css"));
  console.log("   ✓ dashboard.css");
} else {
  console.warn("   ⚠️ dashboard.css nicht gefunden");
}

// === Kopiere Assets (inkl. avatar.jpg) ===
if (fs.existsSync(assetsDir)) {
  if (!fs.existsSync(buildAssetsDir)) {
    fs.mkdirSync(buildAssetsDir, { recursive: true });
  }

  const assetFiles = fs.readdirSync(assetsDir);
  assetFiles.forEach((file) => {
    const srcPath = path.join(assetsDir, file);
    const destPath = path.join(buildAssetsDir, file);
    fs.copyFileSync(srcPath, destPath);
    console.log(`   ✓ assets/${file}`);
  });
} else {
  console.warn("   ⚠️ assets/ Ordner nicht vorhanden");
}

// === Lese app.js und ersetze Platzhalter ===
const js = fs.readFileSync("app.js", "utf8");
const resultJs = js
  .replace("SUPABASE_URL_PLACEHOLDER", process.env.SUPABASE_URL || "")
  .replace("SUPABASE_KEY_PLACEHOLDER", process.env.SUPABASE_ANON_KEY || "");

// === Schreibe app.js in dist ===
fs.writeFileSync(path.join(buildDir, "app.js"), resultJs);
console.log("   ✓ app.js");

// === Kopiere cookie-consent.js ===
if (fs.existsSync("cookie-consent.js")) {
  fs.copyFileSync(
    "cookie-consent.js",
    path.join(buildDir, "cookie-consent.js")
  );
  console.log("   ✓ cookie-consent.js");
} else {
  console.warn("   ⚠️ cookie-consent.js nicht gefunden");
}

// === Lese dashboard.js und ersetze Platzhalter ===
if (fs.existsSync("dashboard.js")) {
  const dashboardJs = fs.readFileSync("dashboard.js", "utf8");
  const resultDashboardJs = dashboardJs
    .replace("SUPABASE_URL_PLACEHOLDER", process.env.SUPABASE_URL || "")
    .replace("SUPABASE_KEY_PLACEHOLDER", process.env.SUPABASE_ANON_KEY || "")
    .replace("EMAIL_PLACEHOLDER", process.env.EMAIL || "");
  fs.writeFileSync(path.join(buildDir, "dashboard.js"), resultDashboardJs);
  console.log("   ✓ dashboard.js");
} else {
  console.warn("   ⚠️ dashboard.js nicht gefunden");
}

// === Abschlussmeldung ===
console.log("\n✅ Build completed successfully!\n");
console.log("📊 Umgebungsvariablen:");
console.log(
  "   SUPABASE_URL:",
  process.env.SUPABASE_URL ? "✓ gesetzt" : "✗ fehlt"
);
console.log(
  "   SUPABASE_ANON_KEY:",
  process.env.SUPABASE_ANON_KEY ? "✓ gesetzt" : "✗ fehlt"
);

console.log("\n📦 Build-Inhalt:");
console.log("   dist/");
console.log("   ├── index.html");
console.log("   ├── styles.css");
console.log("   ├── cookie-banner.css");
console.log("   ├── app.js");
console.log("   ├── cookie-consent.js");
console.log("   ├── datenschutz.html");
console.log("   ├── impressum.html");
console.log("   └── assets/");
console.log("       └── avatar.jpg");
console.log("");
