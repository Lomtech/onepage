// build.js - Netlify Build Script (Node.js)
const fs = require("fs");
const path = require("path");

console.log("🚀 Starting build process...");

// Check environment variables
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("❌ Error: SUPABASE_URL or SUPABASE_ANON_KEY not set!");
  console.error("Please configure these in Netlify Environment Variables");
  process.exit(1);
}

console.log("✅ Environment variables found");
console.log("   SUPABASE_URL:", SUPABASE_URL.substring(0, 30) + "...");
console.log(
  "   SUPABASE_ANON_KEY:",
  SUPABASE_ANON_KEY.substring(0, 20) + "..."
);

// Create build directory
const buildDir = path.join(__dirname, "build");
if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir, { recursive: true });
}

console.log("📦 Copying files...");

// Files to copy
const filesToCopy = [
  "index.html",
  "dashboard.html",
  "impressum.html",
  "datenschutz.html",
  "styles.css",
  "dashboard.css",
  "app.js",
  "analytics.js",
  "dashboard.js",
];

// Copy files
filesToCopy.forEach((file) => {
  const srcPath = path.join(__dirname, file);
  const destPath = path.join(buildDir, file);

  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
    console.log(`   ✓ ${file}`);
  } else {
    console.warn(`   ⚠ ${file} not found, skipping`);
  }
});

// Copy assets directory if exists
const assetsDir = path.join(__dirname, "assets");
const buildAssetsDir = path.join(buildDir, "assets");
if (fs.existsSync(assetsDir)) {
  if (!fs.existsSync(buildAssetsDir)) {
    fs.mkdirSync(buildAssetsDir, { recursive: true });
  }
  const assetFiles = fs.readdirSync(assetsDir);
  assetFiles.forEach((file) => {
    fs.copyFileSync(
      path.join(assetsDir, file),
      path.join(buildAssetsDir, file)
    );
    console.log(`   ✓ assets/${file}`);
  });
}

// Replace placeholders in analytics.js
console.log("🔄 Replacing placeholders in analytics.js...");
const analyticsPath = path.join(buildDir, "analytics.js");
if (fs.existsSync(analyticsPath)) {
  let analyticsContent = fs.readFileSync(analyticsPath, "utf8");
  analyticsContent = analyticsContent.replace(
    /SUPABASE_URL_PLACEHOLDER/g,
    SUPABASE_URL
  );
  analyticsContent = analyticsContent.replace(
    /SUPABASE_ANON_KEY_PLACEHOLDER/g,
    SUPABASE_ANON_KEY
  );
  fs.writeFileSync(analyticsPath, analyticsContent);
  console.log("   ✓ analytics.js updated");
} else {
  console.error("   ❌ analytics.js not found!");
  process.exit(1);
}

// Replace placeholders in dashboard.js
console.log("🔄 Replacing placeholders in dashboard.js...");
const dashboardPath = path.join(buildDir, "dashboard.js");
if (fs.existsSync(dashboardPath)) {
  let dashboardContent = fs.readFileSync(dashboardPath, "utf8");
  dashboardContent = dashboardContent.replace(
    /SUPABASE_URL_PLACEHOLDER/g,
    SUPABASE_URL
  );
  dashboardContent = dashboardContent.replace(
    /SUPABASE_ANON_KEY_PLACEHOLDER/g,
    SUPABASE_ANON_KEY
  );
  fs.writeFileSync(dashboardPath, dashboardContent);
  console.log("   ✓ dashboard.js updated");
} else {
  console.error("   ❌ dashboard.js not found!");
  process.exit(1);
}

console.log("✅ Build completed successfully!");
console.log("📁 Build output in: build/");
