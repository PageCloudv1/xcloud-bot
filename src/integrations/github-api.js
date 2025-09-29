/**
 * 🐙 GitHub API Integration
 *
 * Handles GitHub API operations for repositories, issues, and workflows.
 */

import { Octokit } from '@octokit/rest';

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

export async function getRepository(owner, repo) {
  console.log(`🔍 Fetching repository: ${owner}/${repo}`);

  try {
    const { data } = await octokit.rest.repos.get({ owner, repo });
    console.log('✅ Repository fetched successfully');
    return data;
  } catch (error) {
    console.error('❌ Failed to fetch repository:', error.message);
    throw error;
  }
}

export async function createIssue(owner, repo, title, body) {
  console.log(`📝 Creating issue in ${owner}/${repo}: ${title}`);

  try {
    const { data } = await octokit.rest.issues.create({
      owner,
      repo,
      title,
      body,
    });
    console.log('✅ Issue created successfully:', data.number);
    return data;
  } catch (error) {
    console.error('❌ Failed to create issue:', error.message);
    throw error;
  }
}

export async function getWorkflowRuns(owner, repo) {
  console.log(`🔄 Fetching workflow runs for ${owner}/${repo}`);

  try {
    const { data } = await octokit.rest.actions.listWorkflowRunsForRepo({
      owner,
      repo,
    });
    console.log('✅ Workflow runs fetched successfully');
    return data.workflow_runs;
  } catch (error) {
    console.error('❌ Failed to fetch workflow runs:', error.message);
    throw error;
  }
}
