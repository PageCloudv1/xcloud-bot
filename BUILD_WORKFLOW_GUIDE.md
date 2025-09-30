# 🏗️ Build Workflow Usage Guide

## Quick Start

The build workflow automatically runs on:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches
- Manual trigger via GitHub Actions UI
- Called by other workflows

## Manual Execution

### Via GitHub UI
1. Go to **Actions** tab
2. Select **🏗️ Build - Construção de Artefatos**
3. Click **Run workflow**
4. Select Node.js version (18, 20, or 22)
5. Click **Run workflow** button

### Via GitHub CLI
```bash
gh workflow run build.yml
```

### Via GitHub CLI with specific Node version
```bash
gh workflow run build.yml -f node-version=20
```

## Local Testing

### Run full verification
```bash
bash scripts/verify-build-workflow.sh
```

### Manual build steps
```bash
# Install dependencies
npm ci

# Build project
npm run build

# Generate documentation
npm run docs:build

# Run security audit
npm audit --audit-level=moderate
```

## Workflow Features

### Inputs
- `node-version` (optional): Node.js version to use (default: 20)
  - Options: 18, 20, 22
- `build-command` (optional): Custom build command (default: 'npm run build')

### Outputs
- `build-status`: Build success/failure status
- `artifact-size`: Size of generated artifacts
- `build-version`: Semantic version with build number

### Artifacts Generated
- **dist/**: Compiled TypeScript (~100KB)
  - JavaScript files (.js)
  - Type definitions (.d.ts)
  - Source maps (.map)
- **docs/**: Generated documentation (~164KB)
  - HTML documentation from TypeDoc

### Artifact Retention
- Artifacts are kept for **7 days**
- Compressed with maximum compression (level 9)
- Available for download from workflow run page

## Using as a Reusable Workflow

### In another workflow file
```yaml
jobs:
  build:
    uses: ./.github/workflows/build.yml
    with:
      node-version: '20'
      build-command: 'npm run build'
```

### With different Node version
```yaml
jobs:
  build-node18:
    uses: ./.github/workflows/build.yml
    with:
      node-version: '18'
  
  build-node22:
    uses: ./.github/workflows/build.yml
    with:
      node-version: '22'
```

## Workflow Jobs

### 1. Build Job
Main build job that:
- Checks out code
- Sets up Node.js environment
- Installs dependencies
- Generates version information
- Builds TypeScript project
- Verifies build output
- Analyzes artifact sizes
- Generates documentation
- Uploads artifacts

### 2. Security Scan Job
Runs after successful build:
- Performs npm audit
- Checks for vulnerabilities
- Reports security issues

### 3. Quality Validation Job
Runs after successful build:
- Downloads built artifacts
- Validates entry points
- Checks type definitions
- Verifies source maps
- Runs performance benchmarks

## Monitoring

### Viewing Workflow Runs
1. Go to **Actions** tab
2. Click on workflow run
3. View job details and logs

### Downloading Artifacts
1. Go to workflow run page
2. Scroll to **Artifacts** section
3. Download `build-artifacts-node-XX`

### Viewing Summaries
Workflow generates comprehensive summaries with:
- Build status
- Version information
- Artifact sizes
- Completed steps checklist

## Troubleshooting

### Build Fails
- Check TypeScript compilation errors in logs
- Verify package.json scripts
- Ensure all dependencies are installed

### Artifacts Not Found
- Check if dist/ directory is created
- Verify build command executed successfully
- Review build verification step logs

### Security Scan Warnings
- Review npm audit output
- Update vulnerable dependencies if needed
- Some warnings may be acceptable for development

## Performance

### Optimization Features
- NPM package caching for faster installs
- Artifact compression (level 9)
- Path-based triggers (only runs on relevant changes)
- Parallel job execution (security + quality)

### Expected Timing
- Install dependencies: ~30s (with cache)
- Build TypeScript: ~10s
- Generate docs: ~5s
- Total runtime: ~2-3 minutes

## Integration

### With CI Workflow
The build workflow can be called from the main CI workflow:

```yaml
jobs:
  build:
    uses: ./.github/workflows/build.yml
  
  test:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/download-artifact@v4
        with:
          name: build-artifacts-node-20
      - run: npm test
```

### With Deploy Workflow
Use build artifacts in deployment:

```yaml
jobs:
  build:
    uses: ./.github/workflows/build.yml
  
  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/download-artifact@v4
        with:
          name: build-artifacts-node-20
      - run: deploy.sh
```

## References

- [BUILD_WORKFLOW_SUMMARY.md](BUILD_WORKFLOW_SUMMARY.md) - Complete documentation
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [TypeDoc Documentation](https://typedoc.org/)
