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

// === Kopiere index.html ===
fs.copyFileSync("index.html", path.join(buildDir, "index.html"));
console.log("   ✓ index.html");

// === Kopiere CSS ===
fs.copyFileSync("styles.css", path.join(buildDir, "styles.css"));
console.log("   ✓ styles.css");

// === Kopiere Legal Pages ===
["datenschutz.html", "impressum.html"].forEach((file) => {
  if (fs.existsSync(file)) {
    fs.copyFileSync(file, path.join(buildDir, file));
    console.log(`   ✓ ${file}`);
  } else {
    console.warn(`   ⚠️ ${file} nicht gefunden`);
  }
});

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

// === Abschlussmeldung ===
console.log("\n✅ Build completed");
console.log(
  "SUPABASE_URL:",
  process.env.SUPABASE_URL ? "✓ gesetzt" : "✗ fehlt"
);
console.log(
  "SUPABASE_ANON_KEY:",
  process.env.SUPABASE_ANON_KEY ? "✓ gesetzt" : "✗ fehlt"
);
