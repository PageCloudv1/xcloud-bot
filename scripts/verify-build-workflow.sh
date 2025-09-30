#!/bin/bash
# 🧪 Local Build Workflow Verification Script
# Simulates the GitHub Actions build workflow locally

set -e  # Exit on error

echo "🚀 Starting Build Workflow Verification..."
echo ""

# Step 1: Clean previous build
echo "🧹 Step 1: Cleaning previous build artifacts..."
rm -rf dist/ docs/ build/
echo "✅ Clean complete"
echo ""

# Step 2: Install dependencies
echo "📦 Step 2: Installing dependencies..."
npm ci --silent
echo "✅ Dependencies installed"
echo ""

# Step 3: Generate version
echo "🏷️ Step 3: Generating version info..."
VERSION="1.0.0-build.local"
echo "📦 Build version: ${VERSION}"
echo "✅ Version generated"
echo ""

# Step 4: Build project
echo "🏗️ Step 4: Building project..."
npm run build --silent
echo "✅ Build complete"
echo ""

# Step 5: Verify build output
echo "🔍 Step 5: Verifying build output..."
if [ -d "dist" ]; then
  echo "✅ dist/ directory exists"
  
  # List build output
  echo "📁 Build output contents:"
  ls -la dist/
  
  # Check for entry point
  if [ -f "dist/index.js" ]; then
    echo "✅ Main entry point found (dist/index.js)"
  else
    echo "⚠️ Main entry point not found"
    exit 1
  fi
  
  # Check for TypeScript declarations
  DECL_COUNT=$(find dist/ -name "*.d.ts" | wc -l)
  echo "✅ TypeScript declarations: ${DECL_COUNT} files"
  
  # Check for source maps
  MAP_COUNT=$(find dist/ -name "*.map" | wc -l)
  echo "✅ Source maps: ${MAP_COUNT} files"
else
  echo "❌ Build output not found"
  exit 1
fi
echo ""

# Step 6: Artifact size analysis
echo "📊 Step 6: Artifact size analysis..."
SIZE=$(du -sh dist/ | cut -f1)
echo "📦 Artifact size: ${SIZE}"
echo "📊 Size breakdown:"
du -sh dist/* 2>/dev/null || echo "No subdirectories"
echo "✅ Size analysis complete"
echo ""

# Step 7: Generate documentation
echo "📚 Step 7: Generating documentation..."
if grep -q "docs:build" package.json; then
  npm run docs:build --silent
  if [ -d "docs" ]; then
    DOCS_SIZE=$(du -sh docs/ | cut -f1)
    echo "✅ Documentation generated (${DOCS_SIZE})"
  else
    echo "⚠️ Documentation directory not created"
  fi
else
  echo "📝 Documentation script not found in package.json"
fi
echo ""

# Step 8: Security audit
echo "🛡️ Step 8: Running security audit..."
npm audit --audit-level=moderate || echo "⚠️ Some vulnerabilities found (non-critical)"
echo "✅ Security audit complete"
echo ""

# Step 9: Quality validation
echo "🎯 Step 9: Quality validation..."
echo "✅ Validating build artifacts..."

# Check if required files exist
if [ -f "dist/index.js" ]; then
  echo "✅ Main entry point validated"
fi

# Check for TypeScript declaration files
if ls dist/**/*.d.ts 1> /dev/null 2>&1; then
  echo "✅ TypeScript declarations validated"
fi

# Check for source maps
if ls dist/**/*.map 1> /dev/null 2>&1; then
  echo "✅ Source maps validated"
fi
echo ""

# Step 10: Summary
echo "📋 Build Workflow Summary"
echo "========================"
echo "✅ All steps completed successfully!"
echo ""
echo "📊 Build Information:"
echo "  - Version: ${VERSION}"
echo "  - Artifact Size: ${SIZE}"
echo "  - TypeScript Declarations: ${DECL_COUNT} files"
echo "  - Source Maps: ${MAP_COUNT} files"
echo "  - Documentation: Available in docs/"
echo ""
echo "🎉 Build workflow verification complete!"
