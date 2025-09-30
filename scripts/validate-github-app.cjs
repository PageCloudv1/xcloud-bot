/**
 * 🔍 xCloud Bot - GitHub App Configuration Validator
 *
 * This script validates that the GitHub App is properly configured
 * and all required environment variables are set.
 */

const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function validateEnvironmentFile() {
  log('\n📝 Validating .env file...', 'cyan');

  const envPath = path.join(__dirname, '..', '.env');
  const envExamplePath = path.join(__dirname, '..', '.env.example');

  if (!fs.existsSync(envPath)) {
    log('  ❌ .env file not found', 'red');

    if (fs.existsSync(envExamplePath)) {
      log('  💡 Tip: Create .env from .env.example', 'yellow');
      log('     cp .env.example .env', 'yellow');
    }
    return false;
  }

  log('  ✅ .env file exists', 'green');
  return true;
}

async function validateRequiredVariables() {
  log('\n🔑 Validating required environment variables...', 'cyan');

  const envPath = path.join(__dirname, '..', '.env');

  if (!fs.existsSync(envPath)) {
    log('  ⚠️  Cannot validate: .env file not found', 'yellow');
    return false;
  }

  const envContent = fs.readFileSync(envPath, 'utf8');

  const requiredVars = [
    { name: 'GITHUB_APP_ID', description: 'GitHub App ID' },
    { name: 'GITHUB_PRIVATE_KEY', description: 'GitHub App Private Key' },
    { name: 'GITHUB_OWNER', description: 'GitHub Repository Owner' },
  ];

  const optionalVars = [
    { name: 'WEBHOOK_SECRET', description: 'GitHub Webhook Secret' },
    { name: 'GEMINI_API_KEY', description: 'Gemini API Key for AI features' },
    { name: 'PORT', description: 'Server port' },
  ];

  let allValid = true;

  // Check required variables
  log('\n  Required variables:', 'bright');
  for (const varInfo of requiredVars) {
    const regex = new RegExp(`${varInfo.name}=(.+)`);
    const match = envContent.match(regex);

    if (!match || !match[1] || match[1].trim() === '' || match[1].includes('your-')) {
      log(`  ❌ ${varInfo.name} - ${varInfo.description}`, 'red');
      allValid = false;
    } else {
      // Validate private key format if applicable
      if (varInfo.name === 'GITHUB_PRIVATE_KEY') {
        const keyValue = match[1].trim();
        if (!keyValue.includes('BEGIN') || !keyValue.includes('PRIVATE KEY')) {
          log(
            `  ⚠️  ${varInfo.name} - Invalid format (should contain BEGIN PRIVATE KEY)`,
            'yellow'
          );
          allValid = false;
        } else {
          log(`  ✅ ${varInfo.name} - ${varInfo.description}`, 'green');
        }
      } else if (varInfo.name === 'GITHUB_APP_ID') {
        // Validate App ID format - should be numeric, not a Client ID
        const appIdValue = match[1].trim().replace(/['"]/g, '');
        if (appIdValue.startsWith('Iv')) {
          log(
            `  ❌ ${varInfo.name} - This appears to be a Client ID (starts with 'Iv'), not an App ID`,
            'red'
          );
          log(
            "     App ID should be a numeric value (e.g., 123456), found in the GitHub App settings page",
            'yellow'
          );
          log("     Client ID is different from App ID - please use the App ID instead", 'yellow');
          allValid = false;
        } else if (!/^\d+$/.test(appIdValue)) {
          log(
            `  ⚠️  ${varInfo.name} - Should be numeric (e.g., 123456), got: ${appIdValue}`,
            'yellow'
          );
          allValid = false;
        } else {
          log(`  ✅ ${varInfo.name} - ${varInfo.description}`, 'green');
        }
      } else {
        log(`  ✅ ${varInfo.name} - ${varInfo.description}`, 'green');
      }
    }
  }

  // Check optional variables
  log('\n  Optional variables:', 'bright');
  for (const varInfo of optionalVars) {
    const regex = new RegExp(`${varInfo.name}=(.+)`);
    const match = envContent.match(regex);

    if (!match || !match[1] || match[1].trim() === '') {
      log(`  ⚪ ${varInfo.name} - ${varInfo.description} (not set)`, 'yellow');
    } else {
      log(`  ✅ ${varInfo.name} - ${varInfo.description}`, 'green');
    }
  }

  return allValid;
}

async function validateManifestFiles() {
  log('\n📋 Validating manifest files...', 'cyan');

  const files = [
    { path: 'github-app-manifest.json', description: 'GitHub App Manifest' },
    { path: 'app.yml', description: 'GitHub App Configuration' },
  ];

  let allValid = true;

  for (const file of files) {
    const filePath = path.join(__dirname, '..', file.path);

    if (!fs.existsSync(filePath)) {
      log(`  ❌ ${file.description} (${file.path}) not found`, 'red');
      allValid = false;
      continue;
    }

    try {
      const content = fs.readFileSync(filePath, 'utf8');

      if (file.path.endsWith('.json')) {
        JSON.parse(content); // Validate JSON
      }

      log(`  ✅ ${file.description} (${file.path})`, 'green');
    } catch (error) {
      log(`  ❌ ${file.description} (${file.path}) - Invalid format: ${error.message}`, 'red');
      allValid = false;
    }
  }

  return allValid;
}

async function validateDocumentation() {
  log('\n📚 Validating documentation...', 'cyan');

  const docs = [
    { path: 'GITHUB_APP_SETUP.md', description: 'Setup Guide' },
    { path: 'GITHUB_BOT_SETUP_GUIDE.md', description: 'Detailed Setup Guide' },
    { path: 'README.md', description: 'README' },
  ];

  let allValid = true;

  for (const doc of docs) {
    const docPath = path.join(__dirname, '..', doc.path);

    if (!fs.existsSync(docPath)) {
      log(`  ❌ ${doc.description} (${doc.path}) not found`, 'red');
      allValid = false;
    } else {
      log(`  ✅ ${doc.description} (${doc.path})`, 'green');
    }
  }

  return allValid;
}

async function validateBotFiles() {
  log('\n🤖 Validating bot files...', 'cyan');

  const files = [
    { path: 'src/bot/github-app.js', description: 'Main bot application' },
    { path: 'src/config/github-app.js', description: 'GitHub App configuration' },
    { path: 'package.json', description: 'Package configuration' },
  ];

  let allValid = true;

  for (const file of files) {
    const filePath = path.join(__dirname, '..', file.path);

    if (!fs.existsSync(filePath)) {
      log(`  ❌ ${file.description} (${file.path}) not found`, 'red');
      allValid = false;
    } else {
      log(`  ✅ ${file.description} (${file.path})`, 'green');
    }
  }

  return allValid;
}

async function provideSummary(results) {
  log('\n═══════════════════════════════════════════════════════', 'cyan');

  const allPassed = Object.values(results).every(r => r);

  if (allPassed) {
    log('  ✅ All validations passed!', 'green');
    log('═══════════════════════════════════════════════════════', 'cyan');
    log('\n🎉 Your GitHub App configuration is ready!', 'green');
    log('\nNext steps:', 'bright');
    log('  1. Start the bot: npm run bot:start', 'cyan');
    log('  2. Test by creating an issue or PR', 'cyan');
    log('  3. Check the bot logs for activity', 'cyan');
  } else {
    log('  ⚠️  Some validations failed', 'yellow');
    log('═══════════════════════════════════════════════════════', 'cyan');
    log('\n📋 Action items:', 'yellow');

    if (!results.envFile) {
      log('  • Create .env file from .env.example', 'red');
    }

    if (!results.envVars) {
      log('  • Configure required environment variables in .env', 'red');
      log('    Run: npm run register:github-app for guidance', 'yellow');
    }

    if (!results.manifests) {
      log('  • Ensure manifest files are present and valid', 'red');
    }

    if (!results.docs) {
      log('  • Check that documentation files exist', 'red');
    }

    if (!results.botFiles) {
      log('  • Verify bot source files are present', 'red');
    }
  }

  log('');
}

async function main() {
  try {
    console.clear();
    log('═══════════════════════════════════════════════════════', 'cyan');
    log('  🔍 xCloud Bot - Configuration Validator', 'bright');
    log('═══════════════════════════════════════════════════════', 'cyan');

    const results = {
      envFile: await validateEnvironmentFile(),
      envVars: await validateRequiredVariables(),
      manifests: await validateManifestFiles(),
      docs: await validateDocumentation(),
      botFiles: await validateBotFiles(),
    };

    await provideSummary(results);

    process.exit(Object.values(results).every(r => r) ? 0 : 1);
  } catch (error) {
    log('\n❌ Validation error:', 'red');
    log(error.message, 'red');
    log('');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };
