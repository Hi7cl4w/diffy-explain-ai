# Release Process Documentation

## Overview

This project uses an automated GitHub Actions workflow for releasing the VS Code extension. The workflow handles version bumping, building, testing, publishing to the marketplace, and creating GitHub releases.

## Prerequisites

### Required Secrets

You need to configure the following secret in your GitHub repository:

1. **`VSCE_PAT`** - Personal Access Token for VS Code Marketplace
   - Go to [Azure DevOps](https://dev.azure.com/)
   - Create a new organization or use existing one
   - Navigate to User Settings → Personal Access Tokens
   - Create a new token with the following:
     - **Name**: VS Code Marketplace Publishing
     - **Organization**: All accessible organizations
     - **Expiration**: Custom (1 year recommended)
     - **Scopes**:
       - Marketplace → **Manage** (required)
   - Copy the token and add it to GitHub:
     - Repository Settings → Secrets and variables → Actions
     - New repository secret: `VSCE_PAT`

## Automated Release Workflow

### Trigger

The release workflow is triggered manually via GitHub Actions:

1. Go to **Actions** tab in your repository
2. Select **Release Extension** workflow
3. Click **Run workflow**
4. Choose version bump type:
   - **auto** (default): Automatically determines version bump based on commits
   - **major**: Breaking changes (1.0.0 → 2.0.0)
   - **minor**: New features (1.1.0 → 1.2.0)
   - **patch**: Bug fixes (1.1.0 → 1.1.1)

### What the Workflow Does

#### ✅ 1. Version Detection & Validation

- Reads current version from `package.json`
- Checks if version tag already exists in Git
- Prevents duplicate releases

#### ✅ 2. Commit Analysis (Auto mode)

- Analyzes commits since last release
- Determines version bump based on conventional commits:
  - `feat!:` or `BREAKING CHANGE:` → **major**
  - `feat:` → **minor**
  - `fix:`, `chore:`, `docs:` → **patch**

#### ✅ 3. Version Bumping

- Automatically bumps version if tag exists
- Updates `package.json` and `package-lock.json`
- Commits changes with message: `chore: bump version to X.Y.Z`
- Pushes version bump commit

#### ✅ 4. Build & Test

- Runs TypeScript type checking (`npm run type-check`)
- Runs linter (`npm run lint:check`)
- Compiles extension (`npm run compile`)
- Runs test suite (`npm run test`)

#### ✅ 5. Package Extension

- Packages extension as `.vsix` file
- Names file: `diffy-explain-ai-X.Y.Z.vsix`

#### ✅ 6. Publish to Marketplace

- Publishes extension to VS Code Marketplace
- Uses `VSCE_PAT` secret for authentication
- Updates existing extension listing

#### ✅ 7. Create Git Tag

- Creates annotated Git tag: `vX.Y.Z`
- Pushes tag to repository

#### ✅ 8. Generate Release Notes

- Automatically categorizes commits:
  - ✨ **Features**: `feat:` commits
  - 🐛 **Bug Fixes**: `fix:` commits
  - 📝 **Documentation**: `docs:` commits
  - 🔧 **Maintenance**: `chore:`, `build:`, `ci:` commits
- Includes commit hashes for traceability

#### ✅ 9. Create GitHub Release

- Creates GitHub Release with tag
- Includes auto-generated release notes
- Attaches `.vsix` file as release asset
- Not marked as draft or prerelease

#### ✅ 10. Upload Artifacts

- Uploads `.vsix` file as workflow artifact
- Retention: 90 days
- Available for download from workflow run

## Version Bump Examples

### Automatic Version Bumping

**Scenario 1**: Bug fixes and chores

```bash
git log v1.0.0..HEAD
# - fix: resolve OpenAI API timeout
# - chore: update dependencies
# - docs: improve README

Result: 1.0.0 → 1.0.1 (patch)
```

**Scenario 2**: New features

```bash
git log v1.1.0..HEAD
# - feat: add custom commit templates
# - fix: handle empty diffs

Result: 1.1.0 → 1.2.0 (minor)
```

**Scenario 3**: Breaking changes

```bash
git log v2.0.0..HEAD
# - feat!: redesign AI service interface
# - BREAKING CHANGE: remove deprecated methods

Result: 2.0.0 → 3.0.0 (major)
```

### Manual Version Bumping

You can override automatic detection:

1. **Patch Release**: Bug fixes only
   - Select `patch` in workflow input
   - 1.1.0 → 1.1.1

2. **Minor Release**: New features
   - Select `minor` in workflow input
   - 1.1.0 → 1.2.0

3. **Major Release**: Breaking changes
   - Select `major` in workflow input
   - 1.1.0 → 2.0.0

## Manual Release Process

If you need to release manually:

### 1. Update Version

```bash
npm version patch  # or minor, major
```

### 2. Build Extension

```bash
npm run type-check
npm run lint
npm run compile
```

### 3. Package Extension

```bash
npm install -g @vscode/vsce
vsce package
```

### 4. Publish to Marketplace

```bash
vsce publish -p YOUR_PERSONAL_ACCESS_TOKEN
```

### 5. Create GitHub Release

```bash
git tag -a v1.1.0 -m "Release v1.1.0"
git push origin v1.1.0

# Then create release on GitHub with VSIX file
```

## Troubleshooting

### Error: "Tag already exists"

The workflow checks if a tag exists and automatically bumps the version. If you see this error:

1. Check existing tags: `git tag -l`
2. Delete tag if needed: `git tag -d vX.Y.Z && git push origin :refs/tags/vX.Y.Z`
3. Re-run workflow

### Error: "VSCE_PAT is not set"

1. Verify secret exists in repository settings
2. Ensure it's named exactly `VSCE_PAT`
3. Generate new token if expired

### Error: "Extension validation failed"

1. Check `package.json` for required fields
2. Ensure `engines.vscode` matches `@types/vscode`
3. Verify all files referenced in `package.json` exist

### Tests Failed

Tests failures won't block the release (marked as `continue-on-error`), but you should:

1. Review test failures in workflow logs
2. Fix failing tests
3. Consider making tests blocking by removing `continue-on-error: true`

## Best Practices

### Commit Messages

Use conventional commits for automatic version bumping:

```bash
# Features (minor bump)
git commit -m "feat: add new AI model support"
git commit -m "feat(git): implement file filtering"

# Bug fixes (patch bump)
git commit -m "fix: resolve memory leak in diff parser"
git commit -m "fix(ai): handle API rate limiting"

# Breaking changes (major bump)
git commit -m "feat!: redesign configuration API"
git commit -m "feat: new config format

BREAKING CHANGE: Configuration schema has changed"

# Other types (patch bump)
git commit -m "docs: update installation guide"
git commit -m "chore: update dependencies"
git commit -m "style: format code with Biome"
```

### Release Cadence

- **Patch releases**: Weekly or as needed for bug fixes
- **Minor releases**: Monthly for new features
- **Major releases**: Quarterly or when breaking changes necessary

### Pre-Release Checklist

Before triggering a release:

1. ✅ Ensure all tests pass locally
2. ✅ Update CHANGELOG.md if maintained
3. ✅ Review open issues and PRs
4. ✅ Test extension locally with `vsce package`
5. ✅ Verify documentation is up to date

## Monitoring

### After Release

Check the following:

1. **Marketplace**: Extension appears at <https://marketplace.visualstudio.com/items?itemName=hitclaw.diffy-explain-ai>
2. **GitHub Release**: Release created with VSIX file attached
3. **Git Tag**: Tag pushed to repository
4. **Workflow Artifacts**: VSIX available for 90 days

### Rollback

If you need to rollback a release:

1. Unpublish from marketplace (contact VS Code team)
2. Delete GitHub release
3. Delete Git tag: `git push origin :refs/tags/vX.Y.Z`
4. Revert version in `package.json`

## Resources

- [Publishing Extensions](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
