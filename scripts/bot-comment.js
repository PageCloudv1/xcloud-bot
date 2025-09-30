#!/usr/bin/env node

/**
 * Script para fazer o bot comentar em uma issue usando suas próprias credenciais
 * Uso: node scripts/bot-comment.js <issue-number> <comment-text>
 */

import { App } from '@octokit/app';
import dotenv from 'dotenv';

dotenv.config();

const {
  GH_APP_ID,
  GH_PRIVATE_KEY,
  GH_INSTALLATION_ID,
  GH_OWNER = 'PageCloudv1',
  GH_REPO = 'xcloud-bot'
} = process.env;

if (!GH_APP_ID || !GH_PRIVATE_KEY || !GH_INSTALLATION_ID) {
  console.error('❌ Error: GH_APP_ID, GH_PRIVATE_KEY and GH_INSTALLATION_ID are required');
  console.error('Make sure your .env file is configured correctly');
  process.exit(1);
}

const issueNumber = process.argv[2];
const commentText = process.argv[3];

if (!issueNumber || !commentText) {
  console.error('❌ Usage: node scripts/bot-comment.js <issue-number> <comment-text>');
  process.exit(1);
}

async function botComment() {
  try {
    console.log('🤖 Initializing xCloud Bot...');
    
    // Create GitHub App instance
    const app = new App({
      appId: GH_APP_ID,
      privateKey: GH_PRIVATE_KEY.replace(/\\n/g, '\n')
    });

    // Get installation for the repository
    const octokit = await app.getInstallationOctokit(parseInt(GH_INSTALLATION_ID));

    console.log(`💬 Commenting on issue #${issueNumber}...`);

    // Create comment
    const { data: comment } = await octokit.rest.issues.createComment({
      owner: GH_OWNER,
      repo: GH_REPO,
      issue_number: parseInt(issueNumber),
      body: commentText
    });

    console.log('✅ Comment created successfully!');
    console.log(`📎 ${comment.html_url}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.status === 404) {
      console.error('💡 Tip: Make sure the GitHub App is installed on this repository');
      console.error('💡 Visit: https://github.com/settings/installations');
    }
    process.exit(1);
  }
}

botComment();
