# Diffy Commit AI

[![Visual Studio Marketplace Downloads](https://img.shields.io/visual-studio-marketplace/d/hitclaw.diffy-explain-ai?label=Visual%20Studio%20Marketplace)](https://marketplace.visualstudio.com/items?itemName=hitclaw.diffy-explain-ai)
[![CI](https://github.com/Hi7cl4w/diffy-explain-ai/actions/workflows/main.yml/badge.svg)](https://github.com/Hi7cl4w/diffy-explain-ai/actions/workflows/main.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

> Generate intelligent commit messages using AI (OpenAI, GitHub Copilot, or Google Gemini) from your git diff. Features intelligent codebase indexing, customizable formats, and comprehensive configuration options.

## ✨ Key Features

- 🤖 **Multiple AI Providers**: OpenAI, GitHub Copilot, or Google Gemini
- 🧠 **Intelligent Codebase Indexing**: Analyzes project structure for context-aware commit messages
- 🎯 **Smart File Filtering**: Automatically excludes irrelevant files (lock files, images, etc.)
- 📝 **Customizable Commit Formats**: Conventional Commits, Gitmoji, or custom templates
- ⚙️ **Advanced Configuration**: 15+ settings for fine-tuned control
- 🔍 **Explain Changes**: Natural language explanations of code changes
- 📋 **One-Click Actions**: Generate, copy, or insert commit messages directly
- 🎨 **SCM Integration**: Native integration with VS Code's source control view

## 🚀 Installation

### From VS Code Marketplace (Recommended)

1. Open VS Code
2. Go to Extensions (`Ctrl+Shift+X` / `Cmd+Shift+X`)
3. Search for "Diffy Commit AI"
4. Click **Install**

### From Command Line

```bash
code --install-extension hitclaw.diffy-explain-ai
```

### Requirements

- **VS Code**: `^1.105.0`
- **AI Provider**: One of:
  - GitHub Copilot subscription (recommended - no API key needed)
  - OpenAI API key
  - Google Gemini API key

## 🛠️ Quick Start

### 1. Choose Your AI Provider

#### GitHub Copilot (Easiest Setup)

```json
{
  "diffy-explain-ai.aiServiceProvider": "vscode-lm"
}
```

#### OpenAI

```json
{
  "diffy-explain-ai.aiServiceProvider": "openai",
  "diffy-explain-ai.openAiKey": "your-api-key-here"
}
```

#### Google Gemini

```json
{
  "diffy-explain-ai.aiServiceProvider": "gemini",
  "diffy-explain-ai.geminiApiKey": "your-api-key-here"
}
```

### 2. Generate Your First Commit Message

1. Stage your changes: `git add .`
2. Open VS Code's Source Control view
3. Click the **"✨ Generate Commit Message"** button in the commit message box
4. Review and commit!

## 📸 Screenshots

### Generate Commit Message

![Generate Commit Message](https://raw.githubusercontent.com/Hi7cl4w/diffy-explain-ai/main/images/generate_commit.gif)

### Explain and Preview Changes

![Explain and Preview Changes](https://raw.githubusercontent.com/Hi7cl4w/diffy-explain-ai/main/images/explain_and_preview.png)

## 📖 Usage

### Commands

| Command | Description | Keyboard Shortcut |
|---------|-------------|-------------------|
| `diffy-explain-ai.generateCommitMessage` | Generate commit message to input box | - |
| `diffy-explain-ai.explainDiffClipboard` | Explain changes and copy to clipboard | - |
| `diffy-explain-ai.generateCommitMessageClipboard` | Generate message and copy to clipboard | - |
| `diffy-explain-ai.explainAndPreview` | Explain and preview staged changes | - |

### Context Menu Integration

Right-click in the Source Control panel for quick access to Diffy commands.

## ⚙️ Configuration

### AI Provider Settings

| Setting | Description | Default |
|---------|-------------|---------|
| `aiServiceProvider` | Choose AI provider: `openai`, `vscode-lm`, `gemini` | `vscode-lm` |
| `vscodeLmModel` | GitHub Copilot model selection | `auto` |
| `openAiKey` | OpenAI API key | - |
| `model` | OpenAI model (gpt-4-turbo, gpt-4, etc.) | `gpt-4-turbo` |
| `geminiApiKey` | Google Gemini API key | - |
| `geminiModel` | Gemini model selection | `gemini-2.0-flash-exp` |

### Commit Message Customization

| Setting | Description | Default |
|---------|-------------|---------|
| `commitMessageType` | Format: `conventional`, `gitmoji`, `custom` | `conventional` |
| `maxCommitMessageLength` | Subject line character limit | `72` |
| `includeCommitBody` | Add detailed bullet points | `false` |
| `additionalInstructions` | Custom AI prompt instructions | - |
| `customCommitPrompt` | Full custom prompt template | - |

### File Processing

| Setting | Description | Default |
|---------|-------------|---------|
| `excludeFilesFromDiff` | Glob patterns to exclude | `package-lock.json`, `yarn.lock`, etc. |
| `respectGitignore` | Honor `.gitignore` patterns | `true` |
| `enableCodebaseContext` | Include project context | `false` |
| `indexedFiles` | Files to analyze for context | `package.json`, `README.md`, etc. |
| `maxIndexedFileSize` | Max file size for indexing (KB) | `50` |

### AI Behavior

| Setting | Description | Default |
|---------|-------------|---------|
| `temperature` | AI creativity (0.0-2.0) | `0.2` |
| `maxTokens` | Maximum response length | `196` |
| `proxyUrl` | Custom proxy for OpenAI | - |

## 🎯 Advanced Features

### Intelligent Codebase Indexing

Enable `enableCodebaseContext` to provide AI with project context:

```json
{
  "diffy-explain-ai.enableCodebaseContext": true,
  "diffy-explain-ai.indexedFiles": [
    "package.json",
    "README.md",
    "tsconfig.json",
    "Cargo.toml",
    "go.mod",
    "pom.xml"
  ]
}
```

### Custom Commit Templates

Create fully custom commit message templates:

```json
{
  "diffy-explain-ai.commitMessageType": "custom",
  "diffy-explain-ai.customCommitPrompt": "Generate a commit message for the following git diff.\n\nRequirements:\n- Maximum subject length: {maxLength} characters\n- Use imperative mood\n- Be concise and clear{bodyInstructions}\n\nReturn ONLY the commit message, no explanations."
}
```

### Team-Specific Instructions

Add team conventions or project-specific rules:

```json
{
  "diffy-explain-ai.additionalInstructions": "Follow team conventions:\n- Use JIRA ticket numbers in scope\n- Always include 'BREAKING CHANGE' footer when applicable\n- Mention affected microservices"
}
```

## 🔧 Development

### Prerequisites

- Node.js 18+
- VS Code 1.105.0+
- TypeScript 4.9+

### Setup

```bash
git clone https://github.com/Hi7cl4w/diffy-explain-ai.git
cd diffy-explain-ai
npm install
npm run compile
```

### Testing

```bash
npm run test
```

### Building

```bash
npm run package  # Creates .vsix file
```

### Debugging

1. Open in VS Code
2. Press `F5` to launch extension development host
3. Test in the new window

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `npm run test`
5. Lint code: `npm run lint`
6. Commit changes: `git commit -m 'feat: add amazing feature'`
7. Push to branch: `git push origin feature/amazing-feature`
8. Open a Pull Request

### Code Quality

- **TypeScript**: Strict type checking enabled
- **Linting**: Biome for consistent code style
- **Testing**: Mocha test framework
- **Formatting**: Consistent formatting required

## 📊 CI/CD

This project uses GitHub Actions for:

- Automated testing on multiple Node.js versions
- Code linting and formatting checks
- Automated releases via [release-please](https://github.com/googleapis/release-please)

## 🙏 Support

### Getting Help

- 📖 [Documentation](https://github.com/Hi7cl4w/diffy-explain-ai)
- 🐛 [Issue Tracker](https://github.com/Hi7cl4w/diffy-explain-ai/issues)
- 💬 [Discussions](https://github.com/Hi7cl4w/diffy-explain-ai/discussions)

### Common Issues

#### "No GitHub Copilot models available"

- Ensure GitHub Copilot is installed and you're signed in
- Check your Copilot subscription status

#### "OpenAI API key not working"

- Verify your API key is correct
- Check your OpenAI account has credits
- Ensure the key has the necessary permissions

#### "Extension not activating"

- Check VS Code version (^1.105.0 required)
- Try reloading VS Code: `Ctrl+Shift+P` → "Developer: Reload Window"

## 📄 License

MIT License - see the [LICENSE](LICENSE) file for details.

## 🙌 Acknowledgments

- Built with [VS Code Extension API](https://code.visualstudio.com/api)
- Powered by OpenAI, GitHub Copilot, and Google Gemini
- Icons from [VS Code Icons](https://github.com/microsoft/vscode-icons)

---

**Made with ❤️ by [Hi7cl4w](https://github.com/Hi7cl4w)**

[!["Buy Me A Coffee"](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://www.buymeacoffee.com/manukn)
