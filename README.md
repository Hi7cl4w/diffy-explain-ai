<h1 align="center">
  <br> <a href="https://marketplace.visualstudio.com/items?itemName=hitclaw.diffy-explain-ai">
  <img src="https://raw.githubusercontent.com/Hi7cl4w/diffy-explain-ai/main/icons/icon_512.png" alt="DIFFY" width="200"></a>
  <br>
  DIFFY COMMIT AI - Generate Your Commit Message or Explains the Changes
  <br>
</h1>

<h4 align="center">Generate Commit Message for the changed code using git diff and AI (<a href="https://openai.com/" target="_blank">OpenAI</a> or <a href="https://github.com/features/copilot" target="_blank">GitHub Copilot</a>) in natural language.</h4>
<br>
<p align="center">

  <a href="https://marketplace.visualstudio.com/items?itemName=hitclaw.diffy-explain-ai">
    <img alt="Visual Studio Marketplace Downloads" src="https://img.shields.io/visual-studio-marketplace/d/hitclaw.diffy-explain-ai?label=Visual%20Studio%20Marketplace">
  </a>
  <a href="#">
    <img src="https://github.com/Hi7cl4w/diffy-explain-ai/actions/workflows/main.yml/badge.svg"
         alt="CI">
  </a>
  <a href="#">
    <img src="https://img.shields.io/badge/License-MIT-blue"
         alt="visual-studio marketplace">
  </a>
</p>

> Generate Commit &nbsp;

![screenshot](https://raw.githubusercontent.com/Hi7cl4w/diffy-explain-ai/main/images/generate_commit.gif)

> Explain and Preview Changes of Staged Files &nbsp;

![screenshot](https://raw.githubusercontent.com/Hi7cl4w/diffy-explain-ai/main/images/explain_and_preview.png)

## Key Features

- Generate Commit Message using **OpenAI** or **VS Code Language Models (GitHub Copilot)**.
- **Intelligent Codebase Indexing**: Analyzes project structure and key files to provide better context for AI-generated commit messages.
- **Intelligent Code Filtering**: Automatically filters out irrelevant files (lock files, images, etc.) to improve AI analysis quality and reduce token usage.
- **Customizable Commit Formats**: Choose between Conventional Commits or Gitmoji styles.
- **Configurable Message Length**: Set maximum subject line length (50-200 characters).
- **Optional Detailed Bodies**: Include explanatory bullet points in commit messages.
- Explain Changes in Natural Language.
- Directly Generate Commit Message to VScode git commit input box.
- Copy to clipboard
- Choose between OpenAI API or GitHub Copilot as your AI provider

## Configure

### Option 1: Using OpenAI (Default)

1. Go to Settings > Diffy - Explains Git Changes
2. Set **AI Service Provider** to `openai`
3. Enter Your API Key from OpenAI [Go to API Key Page](https://beta.openai.com/account/api-keys)

### Option 2: Using VS Code Language Models (GitHub Copilot)

1. Go to Settings > Diffy - Explains Git Changes
2. Set **AI Service Provider** to `vscode-lm`
3. Ensure GitHub Copilot is installed and you are signed in
4. Optionally select your preferred model:
   - `auto` (default, recommended - automatically selects best available model)
   - `copilot-gpt-4o` (Latest GPT-4o - most capable)
   - `copilot-gpt-4` (High reasoning capabilities)
   - `copilot-gpt-5-mini` (Fast, accurate, and reliable for most coding tasks)
   - `copilot-grok-code-fast-1` (Fast AI model with complimentary access)
   - `copilot-o1` (Advanced reasoning model)
   - `copilot-o1-mini` (Compact reasoning model)
   - `copilot-o1-preview` (Preview of o1 capabilities)
   - `copilot-gpt-4-turbo` (Fast and capable)
   - `copilot-gpt-3.5-turbo` (Fast and efficient)
   - `copilot-gpt-3.5` (Standard capability)

**Note:** Using VS Code Language Models requires an active GitHub Copilot subscription. Available models vary by subscription tier.

## Advanced Configuration

### Commit Message Customization

#### Commit Format Style
Choose between two popular commit message formats:
- **Conventional Commits** (default): `feat: add user authentication`
- **Gitmoji**: `✨ feat: add user authentication`

Set in: `Settings > Diffy > Commit Message Type`

#### Include Commit Body
Enable detailed commit messages with explanatory bullet points:
```
feat: add user authentication

- Implement JWT token generation
- Add login and registration endpoints
- Create user model and database schema
```

Set in: `Settings > Diffy > Include Commit Body`

#### Maximum Subject Line Length
Configure the maximum character length for commit subjects (default: 72)
- **50**: Strict GitHub standard
- **72**: Common standard (recommended)
- **100**: Relaxed limit

Set in: `Settings > Diffy > Max Commit Message Length`

### File Filtering

Exclude specific files or patterns from AI analysis to improve quality and reduce token usage:

**Default exclusions:**
- Lock files: `package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`
- Images: `*.jpg`, `*.png`, `*.gif`, `*.svg`, `*.ico`
- Fonts: `*.woff`, `*.woff2`, `*.ttf`, `*.eot`

**Add custom exclusions:**
Set in: `Settings > Diffy > Exclude Files From Diff`

Example patterns:
- `*.min.js` - Exclude minified JavaScript
- `dist/**` - Exclude build directory
- `**/*.log` - Exclude all log files

### Codebase Context Analysis

Enable intelligent codebase analysis to provide better context for AI-generated commit messages:

**Enable Codebase Context:**
Set in: `Settings > Diffy > Enable Codebase Context`

**Configure Indexed Files:**
Choose which project files to analyze for context:
- `package.json` - Project dependencies and scripts
- `README.md` - Project documentation
- `tsconfig.json` - TypeScript configuration
- `Cargo.toml` - Rust project configuration
- `go.mod` - Go module configuration
- And many more...

Set in: `Settings > Diffy > Indexed Files`

**File Size Limits:**
Configure maximum file size for indexing (default: 50KB)
Set in: `Settings > Diffy > Max Indexed File Size`

> **Note:** This feature increases token usage but provides more accurate and context-aware commit messages.

### Custom AI Instructions

Override the default prompt with your own instructions for commit message generation:

Set in: `Settings > Diffy > Additional Instructions`

Example:
```
Follow my team's commit convention:
- Use JIRA ticket numbers in scope
- Always include "BREAKING CHANGE" footer when applicable
- Mention affected services
```

## Commands

- `diffy-explain-ai.generateCommitMessage` : Generate Commit Message to Commit Input Box
- `diffy-explain-ai.explainDiffClipboard` : Explain Changes and Copy to Clipboard
- `diffy-explain-ai.generateCommitMessageClipboard` : Generate Commit Message and Copy to Clipboard
- `diffy-explain-ai.explainAndPreview` : Explain and Preview Changes of Staged Files

## Contributing & Development

For contributors and maintainers:

- **Release Process**: See [.github/RELEASE.md](.github/RELEASE.md) for detailed information about our automated release workflow
- **CI/CD**: We use GitHub Actions for continuous integration and automated releases
- **Code Quality**: All code must pass TypeScript type checking, Biome linting, and formatting before merging

## Support

[!["Buy Me A Coffee"](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://www.buymeacoffee.com/manukn)

## License

MIT

---

> GitHub [@Hi7cl4w](https://github.com/Hi7cl4w) &nbsp;
