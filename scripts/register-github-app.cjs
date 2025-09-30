/**
 * 🤖 xCloud Bot - GitHub App Registration Helper
 *
 * This script helps guide users through the GitHub App registration process.
 * It cannot automate the entire process (GitHub requires manual app creation),
 * but it provides step-by-step instructions and validates the setup.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function question(prompt) {
  return new Promise(resolve => {
    rl.question(prompt, resolve);
  });
}

async function displayWelcome() {
  console.clear();
  log('═══════════════════════════════════════════════════════', 'cyan');
  log('  🤖 xCloud Bot - GitHub App Registration Helper', 'bright');
  log('═══════════════════════════════════════════════════════', 'cyan');
  log('');
  log('This script will guide you through registering the xCloud Bot', 'blue');
  log('as a GitHub App for your organization.', 'blue');
  log('');
}

async function checkPrerequisites() {
  log('📋 Step 1: Checking Prerequisites', 'yellow');
  log('');

  const manifestPath = path.join(__dirname, '..', 'github-app-manifest.json');
  const setupGuidePath = path.join(__dirname, '..', 'GITHUB_APP_SETUP.md');

  const checks = [
    {
      name: 'github-app-manifest.json exists',
      check: fs.existsSync(manifestPath),
      critical: true,
    },
    {
      name: 'GITHUB_APP_SETUP.md exists',
      check: fs.existsSync(setupGuidePath),
      critical: false,
    },
  ];

  let allPassed = true;

  for (const check of checks) {
    if (check.check) {
      log(`  ✅ ${check.name}`, 'green');
    } else {
      log(`  ❌ ${check.name}`, 'red');
      if (check.critical) {
        allPassed = false;
      }
    }
  }

  log('');

  if (!allPassed) {
    log('⚠️  Some critical files are missing!', 'red');
    log('Please ensure you are running this script from the repository root.', 'yellow');
    return false;
  }

  log('✅ All prerequisites met!', 'green');
  return true;
}

async function displayManifest() {
  log('');
  log('📄 Step 2: Review GitHub App Manifest', 'yellow');
  log('');

  const manifestPath = path.join(__dirname, '..', 'github-app-manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

  log(`App Name: ${manifest.name}`, 'cyan');
  log(`Description: ${manifest.description}`, 'cyan');
  log(`Homepage: ${manifest.url}`, 'cyan');
  log('');

  log('Permissions:', 'cyan');
  Object.entries(manifest.default_permissions).forEach(([perm, level]) => {
    log(`  • ${perm}: ${level}`, 'blue');
  });

  log('');
  log('Events:', 'cyan');
  manifest.default_events.slice(0, 10).forEach(event => {
    log(`  • ${event}`, 'blue');
  });
  log(`  ... and ${manifest.default_events.length - 10} more`, 'blue');
  log('');
}

async function displayInstructions() {
  log('');
  log('📝 Step 3: Registration Instructions', 'yellow');
  log('');

  log('Follow these steps to register your GitHub App:', 'bright');
  log('');

  const steps = [
    {
      step: 1,
      title: 'Open GitHub App Creation Page',
      details: [
        'Go to: https://github.com/settings/apps/new',
        'You must be logged in with an account that has admin permissions',
      ],
    },
    {
      step: 2,
      title: 'Fill in Basic Information',
      details: [
        'GitHub App name: xCloud Bot (or your preferred name)',
        'Description: Intelligent automation bot for code review and repository management',
        'Homepage URL: https://github.com/PageCloudv1/xcloud-bot',
      ],
    },
    {
      step: 3,
      title: 'Configure Permissions',
      details: [
        'Repository permissions:',
        '  - Actions: Read and write',
        '  - Checks: Read and write',
        '  - Contents: Read and write',
        '  - Issues: Read and write',
        '  - Pull requests: Read and write',
        '  - Repository projects: Read and write',
        '  - Metadata: Read only',
      ],
    },
    {
      step: 4,
      title: 'Subscribe to Events',
      details: [
        'Select these events:',
        '  - Issues, Issue comments',
        '  - Pull requests, PR reviews, PR review comments',
        '  - Push, Check runs, Check suites',
        '  - Workflow runs (optional)',
      ],
    },
    {
      step: 5,
      title: 'Create the App',
      details: [
        'Click "Create GitHub App"',
        'Save the following information:',
        '  - App ID',
        '  - Client ID',
        '  - Download the Private Key (.pem file)',
      ],
    },
    {
      step: 6,
      title: 'Configure Secrets',
      details: [
        'Go to your repository Settings > Secrets and variables > Actions',
        'Add these secrets:',
        '  - GITHUB_APP_ID: <your-app-id>',
        '  - GITHUB_PRIVATE_KEY: <content-of-pem-file>',
        '  - WEBHOOK_SECRET: <your-webhook-secret> (optional)',
      ],
    },
    {
      step: 7,
      title: 'Install the App',
      details: [
        "Go to the app's page",
        'Click "Install App"',
        'Select the repositories where you want the bot to run',
        'Confirm installation',
      ],
    },
  ];

  steps.forEach(({ step, title, details }) => {
    log(`${step}. ${title}`, 'bright');
    details.forEach(detail => {
      log(`   ${detail}`, 'cyan');
    });
    log('');
  });
}

async function offerManifestCopy() {
  log('');
  log('📋 Step 4: Copy Manifest (Optional)', 'yellow');
  log('');

  const answer = await question('Would you like to see the manifest JSON to copy? (y/n): ');

  if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
    log('');
    log('─────────────────────────────────────────', 'cyan');
    const manifestPath = path.join(__dirname, '..', 'github-app-manifest.json');
    const manifest = fs.readFileSync(manifestPath, 'utf8');
    console.log(manifest);
    log('─────────────────────────────────────────', 'cyan');
    log('');
    log('💡 Tip: You can use this manifest with the GitHub App Manifest flow', 'yellow');
    log(
      '   https://docs.github.com/en/apps/sharing-github-apps/registering-a-github-app-from-a-manifest',
      'yellow'
    );
  }
}

async function validateSetup() {
  log('');
  log('🔍 Step 5: Validate Setup (Optional)', 'yellow');
  log('');

  const answer = await question('Have you completed the registration? (y/n): ');

  if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
    log('');
    log('Checking environment configuration...', 'cyan');

    const envPath = path.join(__dirname, '..', '.env');
    const envExamplePath = path.join(__dirname, '..', '.env.example');

    if (!fs.existsSync(envPath)) {
      log('  ⚠️  .env file not found', 'yellow');
      if (fs.existsSync(envExamplePath)) {
        log('  💡 Tip: Copy .env.example to .env and fill in your values', 'blue');
      }
    } else {
      const envContent = fs.readFileSync(envPath, 'utf8');

      const requiredVars = ['GITHUB_APP_ID', 'GITHUB_PRIVATE_KEY', 'GITHUB_OWNER'];

      let missingVars = [];
      requiredVars.forEach(varName => {
        if (!envContent.includes(varName) || envContent.includes(`${varName}=`)) {
          const regex = new RegExp(`${varName}=(.+)`);
          const match = envContent.match(regex);
          if (!match || !match[1] || match[1].trim() === '') {
            missingVars.push(varName);
          }
        }
      });

      if (missingVars.length === 0) {
        log('  ✅ All required environment variables are set!', 'green');
      } else {
        log('  ⚠️  Missing or empty environment variables:', 'yellow');
        missingVars.forEach(v => log(`     - ${v}`, 'red'));
      }
    }
  }
}

async function displayNextSteps() {
  log('');
  log('✨ Next Steps', 'yellow');
  log('');

  log('After registration, you can:', 'bright');
  log('  1. Test the bot by creating an issue or PR', 'cyan');
  log('  2. Configure additional settings in your .env file', 'cyan');
  log('  3. Run the bot locally with: npm run bot:start', 'cyan');
  log('  4. Deploy the bot to a server for production use', 'cyan');
  log('');

  log('📚 For more information:', 'bright');
  log('  • README.md - Complete documentation', 'cyan');
  log('  • GITHUB_BOT_SETUP_GUIDE.md - Detailed setup guide', 'cyan');
  log('  • DEPLOYMENT.md - Deployment instructions', 'cyan');
  log('');
}

async function main() {
  try {
    await displayWelcome();

    const prereqsOk = await checkPrerequisites();
    if (!prereqsOk) {
      process.exit(1);
    }

    await displayManifest();
    await displayInstructions();
    await offerManifestCopy();
    await validateSetup();
    await displayNextSteps();

    log('═══════════════════════════════════════════════════════', 'cyan');
    log('  ✅ Registration Helper Complete!', 'green');
    log('═══════════════════════════════════════════════════════', 'cyan');
    log('');

    rl.close();
  } catch (error) {
    log('');
    log('❌ An error occurred:', 'red');
    log(error.message, 'red');
    log('');
    rl.close();
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };
