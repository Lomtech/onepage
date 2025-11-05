#!/bin/bash
# build.sh - Netlify Build Script
# Ersetzt Platzhalter mit echten Umgebungsvariablen

echo "🚀 Starting build process..."

# Check if environment variables are set
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_ANON_KEY" ]; then
  echo "❌ Error: SUPABASE_URL or SUPABASE_ANON_KEY not set!"
  echo "Please configure these in Netlify Environment Variables"
  exit 1
fi

echo "✅ Environment variables found"

# Create build directory
mkdir -p build

# Copy all files to build directory
echo "📦 Copying files..."
cp -r * build/ 2>/dev/null || true

# Remove build.sh from build directory
rm -f build/build.sh

# Replace placeholders in analytics.js
echo "🔄 Replacing placeholders in analytics.js..."
sed -i "s|SUPABASE_URL_PLACEHOLDER|$SUPABASE_URL|g" build/analytics.js
sed -i "s|SUPABASE_ANON_KEY_PLACEHOLDER|$SUPABASE_ANON_KEY|g" build/analytics.js

# Replace placeholders in dashboard.js
echo "🔄 Replacing placeholders in dashboard.js..."
sed -i "s|SUPABASE_URL_PLACEHOLDER|$SUPABASE_URL|g" build/dashboard.js
sed -i "s|SUPABASE_ANON_KEY_PLACEHOLDER|$SUPABASE_ANON_KEY|g" build/dashboard.js

echo "✅ Build completed successfully!"
echo "📁 Build output in: build/"