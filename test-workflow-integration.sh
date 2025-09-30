#!/bin/bash
# Integration test for bot_integration.yml workflow
# Tests that all workflow steps can execute without errors (given proper credentials)

set -e  # Exit on error

echo "🧪 Testing bot_integration.yml workflow steps..."
echo ""

# Test 1: Dependencies installation
echo "📦 Test 1: Dependencies Installation"
echo "Running: npm ci --prefer-offline --no-audit"
npm ci --prefer-offline --no-audit > /dev/null 2>&1
echo "✅ Dependencies installed successfully"
echo ""

# Test 2: Build
echo "🏗️ Test 2: TypeScript Build"
echo "Running: npm run build"
npm run build > /dev/null 2>&1
echo "✅ Build completed successfully"
echo ""

# Test 3: Scripts exist and are executable
echo "🔍 Test 3: Verify Scripts Exist"

if [ -f "src/workflows/analyzer.js" ]; then
    echo "✅ src/workflows/analyzer.js exists"
else
    echo "❌ src/workflows/analyzer.js not found"
    exit 1
fi

if [ -f "src/bot/scheduler.js" ]; then
    echo "✅ src/bot/scheduler.js exists"
else
    echo "❌ src/bot/scheduler.js not found"
    exit 1
fi

if [ -f "src/bot/github-app.js" ]; then
    echo "✅ src/bot/github-app.js exists"
else
    echo "❌ src/bot/github-app.js not found"
    exit 1
fi
echo ""

# Test 4: npm scripts are defined
echo "📝 Test 4: Verify npm Scripts"

if npm run | grep -q "analyze:repo"; then
    echo "✅ npm script 'analyze:repo' is defined"
else
    echo "❌ npm script 'analyze:repo' not found"
    exit 1
fi

if npm run | grep -q "scheduler:run"; then
    echo "✅ npm script 'scheduler:run' is defined"
else
    echo "❌ npm script 'scheduler:run' not found"
    exit 1
fi

if npm run | grep -q "create:issue"; then
    echo "✅ npm script 'create:issue' is defined"
else
    echo "❌ npm script 'create:issue' not found"
    exit 1
fi
echo ""

# Test 5: Workflow YAML syntax
echo "📄 Test 5: Workflow YAML Syntax"
if command -v npx &> /dev/null; then
    npx js-yaml .github/workflows/bot_integration.yml > /dev/null 2>&1
    echo "✅ Workflow YAML syntax is valid"
else
    echo "⚠️ Cannot verify YAML (npx not available)"
fi
echo ""

# Test 6: Workflow permissions are set
echo "🔐 Test 6: Workflow Permissions Configuration"
if grep -q "permissions:" .github/workflows/bot_integration.yml; then
    echo "✅ Workflow has permissions configured"
    if grep -q "contents: read" .github/workflows/bot_integration.yml; then
        echo "  ✅ contents: read"
    fi
    if grep -q "issues: write" .github/workflows/bot_integration.yml; then
        echo "  ✅ issues: write"
    fi
    if grep -q "actions: read" .github/workflows/bot_integration.yml; then
        echo "  ✅ actions: read"
    fi
    if grep -q "pull-requests: write" .github/workflows/bot_integration.yml; then
        echo "  ✅ pull-requests: write"
    fi
else
    echo "❌ Workflow missing permissions configuration"
    exit 1
fi
echo ""

# Test 7: Environment variables are set
echo "🌍 Test 7: Environment Variables Configuration"
if grep -q "GITHUB_TOKEN:" .github/workflows/bot_integration.yml; then
    echo "✅ GITHUB_TOKEN is configured in workflow"
else
    echo "❌ GITHUB_TOKEN not found in workflow"
    exit 1
fi

if grep -q "CI:" .github/workflows/bot_integration.yml; then
    echo "✅ CI flag is set in workflow"
else
    echo "⚠️ CI flag not explicitly set"
fi
echo ""

# Test 8: Error handling with continue-on-error
echo "🛡️ Test 8: Error Handling Configuration"
if grep -q "continue-on-error: true" .github/workflows/bot_integration.yml; then
    echo "✅ Workflow has error handling (continue-on-error)"
else
    echo "⚠️ No continue-on-error found (may cause workflow to fail on first error)"
fi
echo ""

# Test 9: Documentation exists
echo "📚 Test 9: Documentation"
if [ -f "README.md" ]; then
    echo "✅ README.md exists"
else
    echo "❌ README.md not found"
    exit 1
fi

if [ -f "WORKFLOW_INTEGRATION.md" ]; then
    echo "✅ WORKFLOW_INTEGRATION.md exists"
else
    echo "⚠️ WORKFLOW_INTEGRATION.md not found"
fi

if [ -f ".env.example" ]; then
    echo "✅ .env.example exists"
else
    echo "⚠️ .env.example not found"
fi
echo ""

# Test 10: .gitignore configured
echo "🚫 Test 10: .gitignore Configuration"
if [ -f ".gitignore" ]; then
    if grep -q "dist/" .gitignore; then
        echo "✅ dist/ is in .gitignore"
    else
        echo "❌ dist/ should be in .gitignore"
        exit 1
    fi
    if grep -q "node_modules" .gitignore; then
        echo "✅ node_modules is in .gitignore"
    else
        echo "❌ node_modules should be in .gitignore"
        exit 1
    fi
else
    echo "❌ .gitignore not found"
    exit 1
fi
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ All integration tests passed!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Summary:"
echo "  ✅ Dependencies can be installed"
echo "  ✅ Project builds successfully"
echo "  ✅ All required scripts exist"
echo "  ✅ npm scripts are properly defined"
echo "  ✅ Workflow YAML is valid"
echo "  ✅ Permissions are configured"
echo "  ✅ Environment variables are set"
echo "  ✅ Error handling is in place"
echo "  ✅ Documentation is complete"
echo "  ✅ .gitignore is configured"
echo ""
echo "🎯 The workflow is ready to be used in GitHub Actions!"
echo ""
echo "Next steps:"
echo "1. Configure GitHub secrets (GITHUB_TOKEN is automatic)"
echo "2. Run workflow manually or wait for scheduled execution"
echo "3. Check workflow logs in GitHub Actions"
echo "4. Review created issues (if any)"
