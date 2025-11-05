const fs = require('fs');

// Erstelle dist Ordner
if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist');
}

// Kopiere index.html
fs.copyFileSync('index.html', 'dist/index.html');

// Kopiere CSS
fs.copyFileSync('styles.css', 'dist/styles.css');

// Avatar Copy assets directory if exists
const assetsDir = path.join(__dirname, 'assets');
const buildAssetsDir = path.join(buildDir, 'assets');
if (fs.existsSync(assetsDir)) {
  if (!fs.existsSync(buildAssetsDir)) {
    fs.mkdirSync(buildAssetsDir, { recursive: true });
  }
  const assetFiles = fs.readdirSync(assetsDir);
  assetFiles.forEach(file => {
    fs.copyFileSync(
      path.join(assetsDir, file),
      path.join(buildAssetsDir, file)
    );
    console.log(`   ✓ assets/${file}`);
  });
}

// Kopiere Legal Pages
fs.copyFileSync('datenschutz.html', 'dist/datenschutz.html');
fs.copyFileSync('impressum.html', 'dist/impressum.html');

// Lese app.js und ersetze Platzhalter
const js = fs.readFileSync('app.js', 'utf8');
const resultJs = js
    .replace('SUPABASE_URL_PLACEHOLDER', process.env.SUPABASE_URL || '')
    .replace('SUPABASE_KEY_PLACEHOLDER', process.env.SUPABASE_ANON_KEY || '');

// Schreibe app.js in dist
fs.writeFileSync('dist/app.js', resultJs);

console.log('✅ Build completed');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? '✓ gesetzt' : '✗ fehlt');
console.log('SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? '✓ gesetzt' : '✗ fehlt');