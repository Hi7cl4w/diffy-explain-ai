# Agent Documentation - Diffy Commit AI

> **For AI Agents & Developers**: Comprehensive technical documentation of the Diffy Commit AI VS Code extension architecture, codebase structure, and implementation details.

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Architecture](#architecture)
- [Directory Structure](#directory-structure)
- [Core Components](#core-components)
- [Service Layer](#service-layer)
- [Configuration System](#configuration-system)
- [Data Flow](#data-flow)
- [Key Implementation Patterns](#key-implementation-patterns)
- [API Integration](#api-integration)
- [Extension Points](#extension-points)
- [Development Guidelines](#development-guidelines)

---

## 📖 Project Overview

**Name**: Diffy Commit AI  
**Type**: VS Code Extension  
**Language**: TypeScript  
**Runtime**: Node.js (VS Code Extension Host)  
**Main Entry**: `src/extension.ts`  
**Compiled Output**: `dist/extension.js`

### Purpose

Generate intelligent AI-powered commit messages from git diffs using multiple AI providers (OpenAI, GitHub Copilot, Google Gemini).

### Key Capabilities

- Git diff analysis and commit message generation
- Multi-provider AI service integration
- Codebase indexing for context-aware suggestions
- Customizable commit message formats (Conventional Commits, Gitmoji, Custom)
- VS Code SCM (Source Control Management) integration
- Response caching and optimization

---

## 🏗️ Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    VS Code Extension                     │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────────┐         ┌──────────────┐              │
│  │  extension.ts│────────▶│   Diffy.ts   │              │
│  │  (Entry)     │         │  (Main Logic)│              │
│  └──────────────┘         └──────┬───────┘              │
│                                   │                       │
│  ┌────────────────────────────────┼────────────────────┐ │
│  │           Service Layer        │                    │ │
│  ├────────────────────────────────┼────────────────────┤ │
│  │                                ▼                    │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────┐ │ │
│  │  │ WorkspaceService│ GitService    │ │WindowService│ │
│  │  └──────────────┘  └──────────────┘  └──────────┘ │ │
│  │                                                    │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────┐ │ │
│  │  │VsCodeLlmService│ OpenAiService  │ │GeminiService││ │
│  │  └──────────────┘  └──────────────┘  └──────────┘ │ │
│  │                                                    │ │
│  │  ┌──────────────┐  ┌──────────────┐               │ │
│  │  │ CacheService │  │CodebaseIndexService│         │ │
│  │  └──────────────┘  └──────────────┘               │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐ │
│  │                   Utilities                         │ │
│  │  ├─ log.ts (Output, Logging, Response Cleaning)   │ │
│  └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
           │                    │                    │
           ▼                    ▼                    ▼
    ┌──────────┐        ┌──────────┐        ┌──────────┐
    │  OpenAI  │        │  Copilot │        │  Gemini  │
    │   API    │        │   (VSC)  │        │   API    │
    └──────────┘        └──────────┘        └──────────┘
```

### Design Patterns

1. **Singleton Pattern**: All services use singleton instances
2. **Strategy Pattern**: AI service providers are interchangeable
3. **Event Emitter Pattern**: WorkspaceService emits configuration changes
4. **Factory Pattern**: Service instantiation through static `getInstance()`
5. **Dependency Injection**: Services receive dependencies through constructors

---

## 📁 Directory Structure

```
diffy-explain-ai/
├── src/
│   ├── extension.ts              # Extension entry point & activation
│   ├── Diffy.ts                  # Main orchestration class
│   ├── BaseDiffy.ts              # Base class with common functionality
│   ├── Constants.ts              # Extension constants
│   ├── encoder.json              # Token encoder configuration
│   │
│   ├── @types/                   # TypeScript type definitions
│   │   ├── AIService.d.ts        # AI service interface
│   │   ├── AppVscodeInterface.d.ts
│   │   ├── EventEmitter.d.ts
│   │   ├── EventType.d.ts
│   │   ├── extension.d.ts
│   │   └── git.d.ts              # Git repository types
│   │
│   ├── service/                  # Service layer (business logic)
│   │   ├── CacheService.ts       # Response caching
│   │   ├── CodebaseIndexService.ts  # Project context indexing
│   │   ├── GeminiService.ts      # Google Gemini integration
│   │   ├── GitService.ts         # Git operations
│   │   ├── OpenAiService.ts      # OpenAI integration
│   │   ├── VsCodeLlmService.ts   # VS Code LLM (Copilot) integration
│   │   ├── WindowService.ts      # VS Code window/UI operations
│   │   └── WorkspaceService.ts   # Configuration & workspace mgmt
│   │
│   ├── utils/                    # Utility functions
│   │   └── log.ts                # Logging & response cleaning
│   │
│   └── test/                     # Test files
│       ├── runTest.ts
│       └── suite/
│           ├── extension.test.ts
│           └── index.ts
│
├── dist/                         # Compiled output (webpack)
├── icons/                        # Extension icons
├── images/                       # Documentation images
│
├── package.json                  # Extension manifest & config
├── tsconfig.json                 # TypeScript configuration
├── webpack.config.js             # Webpack bundling config
├── biome.json                    # Biome linter/formatter config
└── README.md                     # User documentation
```

---

## 🔧 Core Components

### 1. Extension Entry Point (`extension.ts`)

**Location**: `src/extension.ts`

**Responsibility**: VS Code extension lifecycle management

**Key Functions**:

- `activate(context: ExtensionContext)`: Entry point when extension loads
- Registers commands:
  - `diffy-explain-ai.explainAndPreview`: Show changes preview
  - `diffy-explain-ai.explainDiffToClipboard`: Copy explanation
  - `diffy-explain-ai.generateCommitMessageToClipboard`: Copy commit message
  - `diffy-explain-ai.generateCommitMessageToSCM`: Insert to SCM

**Code Pattern**:

```typescript
export function activate(context: ExtensionContext) {
  const diffy = new Diffy(context);
  
  context.subscriptions.push(
    commands.registerCommand("diffy-explain-ai.commandName", () => {
      diffy.method();
    })
  );
}
```

### 2. Main Orchestrator (`Diffy.ts`)

**Location**: `src/Diffy.ts`  
**Extends**: `BaseDiffy`

**Responsibility**: High-level workflow orchestration

**Key Methods**:

- `explainAndPreview()`: Show webview with diff explanation
- `explainDiffToClipboard()`: Generate explanation and copy
- `generateCommitMessageToClipboard()`: Generate commit message and copy
- `generateCommitMessageToSCM(progress?)`: Insert commit message to SCM input

**Service Coordination**:

```typescript
class Diffy extends BaseDiffy {
  async generateCommitMessageToSCM(progress) {
    // 1. Validate workspace & repo
    if (!this.workspaceService?.checkAndWarnWorkSpaceExist()) return;
    
    // 2. Get git diff
    const diff = await this.gitService?.getDiffAndWarnUser(repo);
    
    // 3. Route to appropriate AI service
    const provider = this.workspaceService?.getAiServiceProvider();
    let changes = await this.getAiService(provider).getCommitMessage(diff);
    
    // 4. Set commit message in SCM
    this.gitService?.setCommitMessageToInputBox(repo, changes);
  }
}
```

### 3. Base Class (`BaseDiffy.ts`)

**Responsibility**: Common service initialization and utilities

**Provides**:

- Service instance getters (lazy initialization)
- Message display helpers
- Service factory methods

---

## 🎯 Service Layer

### AIService Interface (`@types/AIService.d.ts`)

All AI providers implement this interface:

```typescript
interface AIService {
  getCommitMessageFromDiff(
    code: string,
    apiKey?: string,
    nameOnly?: boolean,
    progress?: vscode.Progress<{...}>
  ): Promise<string | null>;
  
  getExplainedChanges(
    code: string,
    apiKey?: string,
    nameOnly?: boolean
  ): Promise<string | null>;
}
```

### Service Implementations

#### 1. **VsCodeLlmService** (`src/service/VsCodeLlmService.ts`)

**Purpose**: GitHub Copilot integration via VS Code LLM API

**Key Features**:

- No API key required (uses VS Code's Copilot subscription)
- Model selection (gpt-4o, o1, gpt-4, etc.)
- Automatic fallback to available models
- Response caching

**Implementation Pattern**:

```typescript
class VsCodeLlmService implements AIService {
  async getCommitMessageFromDiff(code, _nameOnly, progress) {
    const instructions = workspaceService.getCommitMessageInstructions();
    const response = await this.getFromVsCodeLlm(instructions, code, progress);
    
    if (response) {
      return cleanAiResponse(response);
    }
    return null;
  }
  
  private async getFromVsCodeLlm(instructions, prompt, progress) {
    // Model selection logic
    const models = await vscode.lm.selectChatModels({
      vendor: "copilot",
      family: "gpt-4o"
    });
    
    // Send request
    const chatResponse = await model.sendRequest(messages, {}, token);
    
    // Collect response
    for await (const fragment of chatResponse.text) {
      responseText += fragment;
    }
    
    return responseText;
  }
}
```

#### 2. **OpenAiService** (`src/service/OpenAiService.ts`)

**Purpose**: Direct OpenAI API integration

**Key Features**:

- Supports custom API keys
- Proxy URL configuration
- Temperature and max tokens control
- Model selection (gpt-4, gpt-3.5-turbo, etc.)

**Dependencies**: `openai` npm package

#### 3. **GeminiService** (`src/service/GeminiService.ts`)

**Purpose**: Google Gemini API integration

**Key Features**:

- Gemini API key authentication
- Model selection (gemini-2.0-flash-exp, etc.)
- Configuration for temperature and tokens

**Dependencies**: `@google/genai` npm package

#### 4. **GitService** (`src/service/GitService.ts`)

**Purpose**: Git operations and diff management

**Key Features**:

- Get git diff (cached or staged changes)
- File exclusion patterns (lock files, images)
- Gitignore respect
- Name-only diff support
- Commit message insertion to SCM

**Key Methods**:

```typescript
class GitService {
  async getGitDiff(repo, _cachedInput, nameOnly) {
    // Get diff using VS Code Git API
    const diff = await repo.diff(_cachedInput);
    
    // Apply exclusion filters
    const filtered = this.filterDiffByExclusions(diff, excludePatterns);
    
    return filtered;
  }
  
  setCommitMessageToInputBox(repo, message) {
    repo.inputBox.value = message;
  }
}
```

#### 5. **WorkspaceService** (`src/service/WorkspaceService.ts`)

**Purpose**: Configuration management and workspace operations

**Extends**: `EventEmitter` (emits configuration change events)

**Key Responsibilities**:

- Read VS Code configuration settings
- Provide centralized access to all settings
- Generate unified commit message instructions
- Workspace validation

**Key Methods**:

```typescript
class WorkspaceService extends EventEmitter {
  // Configuration getters
  getAiServiceProvider(): string
  getVsCodeLmModel(): string
  getOpenAIKey(): string | null
  getGeminiKey(): string | null
  getCommitMessageType(): string
  getIncludeCommitBody(): boolean
  getMaxCommitMessageLength(): number
  
  // Unified instruction builder
  getCommitMessageInstructions(): string {
    const commitType = this.getCommitMessageType();
    const includeBody = this.getIncludeCommitBody();
    
    // Build instructions based on type
    if (commitType === "conventional") {
      return `You are an expert Git commit message generator...`;
    } else if (commitType === "gitmoji") {
      return `Generate gitmoji-based commit message...`;
    }
    // ... custom template support
  }
}
```

#### 6. **CodebaseIndexService** (`src/service/CodebaseIndexService.ts`)

**Purpose**: Index project files for context-aware commit messages

**Key Features**:

- Reads configured files (package.json, README.md, etc.)
- Token counting and budget management (max 5000 tokens)
- File size filtering
- Context formatting for AI

**Implementation**:

```typescript
class CodebaseIndexService {
  private readonly MAX_TOTAL_TOKENS = 5000;
  
  async getCodebaseContext(): Promise<string | null> {
    if (!workspaceService.getEnableCodebaseContext()) {
      return null;
    }
    
    // Read configured files
    const indexedFiles = workspaceService.getIndexedFiles();
    
    // Process each file
    for (const filePattern of indexedFiles) {
      const content = await vscode.workspace.fs.readFile(fileUri);
      const tokenCount = countTokens(content);
      
      if (totalTokens + tokenCount <= MAX_TOTAL_TOKENS) {
        indexedContent.push({ file, content, tokens: tokenCount });
      }
    }
    
    // Format for AI
    return `## PROJECT CONTEXT\n${formattedFiles}`;
  }
}
```

⚠️ **Note**: Currently implemented but **not actively used** by AI services.

#### 7. **CacheService** (`src/service/CacheService.ts`)

**Purpose**: Cache AI responses to reduce API calls and costs

**Key Features**:

- In-memory caching (Map-based)
- Model-specific cache keys
- Cache hit/miss tracking

**Implementation**:

```typescript
class CacheService {
  private cache: Map<string, Map<string, unknown>> = new Map();
  
  recordExists(model: string, key: string): boolean {
    return this.cache.get(model)?.has(key) ?? false;
  }
  
  set(model: string, key: string, value: unknown): void {
    if (!this.cache.has(model)) {
      this.cache.set(model, new Map());
    }
    this.cache.get(model)?.set(key, value);
  }
  
  get(model: string, key: string): unknown {
    return this.cache.get(model)?.get(key);
  }
}
```

#### 8. **WindowService** (`src/service/WindowService.ts`)

**Purpose**: VS Code UI operations (webview management)

**Key Features**:

- WebView panel creation
- HTML content generation
- Message passing between webview and extension

---

## ⚙️ Configuration System

### Configuration Schema (`package.json` contributes.configuration)

All settings are prefixed with `diffy-explain-ai.*`:

| Setting | Type | Default | Purpose |
|---------|------|---------|---------|
| `aiServiceProvider` | enum | `"vscode-lm"` | AI provider selection |
| `vscodeLmModel` | enum | `"auto"` | VS Code LLM model |
| `openAiKey` | string | `""` | OpenAI API key |
| `geminiApiKey` | string | `""` | Gemini API key |
| `model` | enum | `"gpt-4o"` | OpenAI model |
| `geminiModel` | enum | `"gemini-2.0-flash-exp"` | Gemini model |
| `commitMessageType` | enum | `"conventional"` | Format type |
| `maxCommitMessageLength` | number | `72` | Subject line limit |
| `includeCommitBody` | boolean | `false` | Include body section |
| `additionalInstructions` | string | `""` | Custom AI instructions |
| `customCommitPrompt` | string | Template | Custom prompt template |
| `excludeFilesFromDiff` | array | `[patterns]` | File exclusion patterns |
| `enableCodebaseContext` | boolean | `false` | Enable indexing |
| `indexedFiles` | array | `[files]` | Files to index |
| `maxIndexedFileSize` | number | `50` | Max file size (KB) |
| `temperature` | number | `0.3` | AI temperature |
| `maxTokens` | number | `196` | Max response tokens |

### Accessing Configuration

```typescript
const workspaceService = WorkspaceService.getInstance();

// Get individual settings
const provider = workspaceService.getAiServiceProvider();
const commitType = workspaceService.getCommitMessageType();

// Get unified instructions (combines multiple settings)
const instructions = workspaceService.getCommitMessageInstructions();
```

---

## 🔄 Data Flow

### Commit Message Generation Flow

```
1. User Action (Command/SCM Button)
          ↓
2. Diffy.generateCommitMessageToSCM()
          ↓
3. Validate Workspace & Repository
          ↓
4. GitService.getDiffAndWarnUser()
   ├─ Get staged changes
   ├─ Apply exclusion filters
   └─ Handle large diffs (switch to name-only)
          ↓
5. Route to AI Provider (based on config)
   ├─ VsCodeLlmService (Copilot)
   ├─ OpenAiService (OpenAI API)
   └─ GeminiService (Gemini API)
          ↓
6. AI Service Processing
   ├─ Check cache (CacheService)
   ├─ Get instructions (WorkspaceService)
   ├─ Call AI API
   └─ Clean response (cleanAiResponse)
          ↓
7. GitService.setCommitMessageToInputBox()
          ↓
8. User sees commit message in SCM input
```

### Response Processing Pipeline

```typescript
// 1. Get raw AI response
const response = await aiService.sendRequest(prompt);

// 2. Clean response (unified utility)
const cleaned = cleanAiResponse(response);

// cleanAiResponse implementation:
function cleanAiResponse(response: string): string {
  let message = response.trim();
  
  // Remove markdown code blocks
  message = message.replace(/^```[\w]*\n?/gm, "");
  message = message.replace(/\n?```$/gm, "");
  
  // Remove quotes
  message = message.replace(/^"/gm, "");
  message = message.replace(/"$/gm, "");
  
  return message.trim();
}

// 3. Return to caller
return cleaned;
```

---

## 🎨 Key Implementation Patterns

### 1. Singleton Service Pattern

**All services use singleton pattern**:

```typescript
class ServiceName {
  static _instance: ServiceName;
  
  private constructor() {
    // Private constructor prevents direct instantiation
  }
  
  public static getInstance(): ServiceName {
    if (!ServiceName._instance) {
      ServiceName._instance = new ServiceName();
    }
    return ServiceName._instance;
  }
}

// Usage
const service = ServiceName.getInstance();
```

### 2. Unified Response Cleaning

**Centralized in `utils/log.ts`**:

```typescript
export function cleanAiResponse(response: string): string {
  // Single source of truth for all AI providers
  // Removes markdown blocks, quotes, and whitespace
}
```

**Used by all AI services**:

- VsCodeLlmService
- OpenAiService  
- GeminiService

### 3. Unified Instruction Generation

**Centralized in WorkspaceService**:

```typescript
getCommitMessageInstructions(): string {
  // Builds instructions based on:
  // - commitMessageType (conventional/gitmoji/custom)
  // - includeCommitBody
  // - maxCommitMessageLength
  // - additionalInstructions
  
  // Returns formatted prompt for AI
}
```

### 4. Error Handling Pattern

```typescript
async method() {
  try {
    // Operation
  } catch (error: unknown) {
    console.error(error);
    
    if (error instanceof SpecificError) {
      // Handle specific error
    } else if (error instanceof Error) {
      // Generic error handling
      window.showErrorMessage(`Error: ${error.message}`);
    } else {
      // Unknown error
      window.showErrorMessage("Unknown error");
    }
  }
}
```

### 5. Progress Reporting Pattern

```typescript
vscode.window.withProgress(
  {
    location: vscode.ProgressLocation.Notification,
    title: "Generating commit message...",
    cancellable: false
  },
  async (progress) => {
    progress.report({ increment: 0 });
    
    // Operation 1
    progress.report({ increment: 30 });
    
    // Operation 2
    progress.report({ increment: 40 });
    
    // Complete
    progress.report({ 
      increment: 30,
      message: "\nCommit message generated."
    });
  }
);
```

---

## 🔌 API Integration

### VS Code Extension API

**Key APIs Used**:

```typescript
import * as vscode from "vscode";

// Commands
vscode.commands.registerCommand(id, callback);

// Configuration
vscode.workspace.getConfiguration(section);

// Git Extension API
const gitExtension = vscode.extensions.getExtension("vscode.git");
const git = gitExtension.exports.getAPI(1);

// Language Model API (Copilot)
vscode.lm.selectChatModels({ vendor, family });
model.sendRequest(messages, options, token);

// Clipboard
vscode.env.clipboard.writeText(text);

// Window/UI
vscode.window.showErrorMessage(message);
vscode.window.withProgress(options, task);

// Workspace
vscode.workspace.workspaceFolders;
vscode.workspace.fs.readFile(uri);
vscode.workspace.fs.stat(uri);
```

### External AI APIs

#### OpenAI API

```typescript
import OpenAI from "openai";

const client = new OpenAI({ apiKey });
const response = await client.chat.completions.create({
  messages: [
    { role: "system", content: instructions },
    { role: "user", content: prompt }
  ],
  model: "gpt-4o",
  temperature: 0.3,
  max_tokens: 196
});
```

#### Google Gemini API

```typescript
import { GoogleGenAI } from "@google/genai";

const client = new GoogleGenAI({ apiKey });
const result = await client.models.generateContent({
  model: "gemini-2.0-flash-exp",
  contents: [{
    role: "user",
    parts: [{ text: `${instructions}\n\n${prompt}` }]
  }],
  config: {
    temperature: 0.3,
    maxOutputTokens: 196
  }
});
```

---

## 🎯 Extension Points

### Adding a New AI Provider

1. **Create Service Class** (`src/service/NewAiService.ts`):

```typescript
import { cleanAiResponse } from "../utils/log";
import WorkspaceService from "./WorkspaceService";

class NewAiService implements AIService {
  static _instance: NewAiService;
  
  private constructor() {}
  
  public static getInstance(): NewAiService {
    if (!NewAiService._instance) {
      NewAiService._instance = new NewAiService();
    }
    return NewAiService._instance;
  }
  
  async getCommitMessageFromDiff(
    code: string,
    apiKey: string,
    _nameOnly?: boolean,
    progress?: vscode.Progress<{...}>
  ): Promise<string | null> {
    // Get unified instructions
    const instructions = WorkspaceService.getInstance()
      .getCommitMessageInstructions();
    
    // Call your AI API
    const response = await this.callNewApi(instructions, code, apiKey);
    
    if (response) {
      // Clean response using unified utility
      return cleanAiResponse(response);
    }
    return null;
  }
  
  async getExplainedChanges(
    code: string,
    apiKey?: string,
    nameOnly?: boolean
  ): Promise<string | null> {
    // Similar implementation
  }
  
  private async callNewApi(instructions, prompt, apiKey) {
    // API-specific implementation
  }
}

export default NewAiService;
```

2. **Add Configuration** (`package.json`):

```json
{
  "contributes": {
    "configuration": {
      "properties": {
        "diffy-explain-ai.newAiApiKey": {
          "type": "string",
          "default": "",
          "description": "API key for New AI service"
        }
      }
    }
  }
}
```

3. **Add Provider Option**:

Update `aiServiceProvider` enum in `package.json` and add getter in `WorkspaceService`.

4. **Update Diffy.ts** routing:

```typescript
if (provider === "new-ai") {
  changes = await this.getNewAiService()
    .getCommitMessageFromDiff(diff, apiKey, nameOnly);
}
```

### Adding a New Commit Format

1. **Update WorkspaceService.getCommitMessageInstructions()**:

```typescript
getCommitMessageInstructions(): string {
  const commitType = this.getCommitMessageType();
  
  if (commitType === "new-format") {
    return `You are an expert Git commit message generator...
    
    FORMAT: <your-format-spec>
    
    REQUIREMENTS:
    1. ...
    2. ...
    
    Return ONLY the commit message, no explanations.`;
  }
  
  // ... existing formats
}
```

2. **Update Configuration** (`package.json`):

```json
{
  "diffy-explain-ai.commitMessageType": {
    "enum": ["conventional", "gitmoji", "custom", "new-format"]
  }
}
```

---

## 🛠️ Development Guidelines

### Setup Development Environment

```bash
# Clone repository
git clone https://github.com/Hi7cl4w/diffy-explain-ai.git
cd diffy-explain-ai

# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Watch mode (auto-recompile)
npm run watch

# Run tests
npm test

# Lint & format
npx @biomejs/biome check --write src
```

### Build & Package

```bash
# Production build
npm run compile

# Package extension
vsce package
```

### Testing in VS Code

1. Open project in VS Code
2. Press `F5` to launch Extension Development Host
3. Test commands in the new window
4. Check output in "Diffy Commit AI" output channel

### Code Style Guidelines

1. **Use Singleton Pattern** for services
2. **Use cleanAiResponse()** for all AI response processing
3. **Use WorkspaceService.getCommitMessageInstructions()** for prompts
4. **Handle errors gracefully** with user-friendly messages
5. **Report progress** for long-running operations
6. **Cache responses** when appropriate
7. **Log to output channel** for debugging
8. **Follow TypeScript strict mode**
9. **Use Biome** for linting/formatting

### Debugging

**Output Channel**:

```typescript
import { sendToOutput, clearOutput } from "../utils/log";

sendToOutput(`Debug info: ${value}`);
```

**VS Code Debug Console**:

```typescript
console.log("Debug:", data);
console.error("Error:", error);
```

### Common Tasks

#### Add New Configuration Setting

1. Add to `package.json` → `contributes.configuration.properties`
2. Add getter method to `WorkspaceService`
3. Use in relevant service

#### Modify AI Instructions

Edit `WorkspaceService.getCommitMessageInstructions()` - single source of truth for all providers.

#### Change Response Cleaning Logic

Edit `utils/log.ts` → `cleanAiResponse()` - affects all AI providers.

#### Add New Command

1. Register in `extension.ts` → `activate()`
2. Implement method in `Diffy.ts`
3. Add to `package.json` → `contributes.commands`

---

## 📊 Performance Considerations

### Caching Strategy

- **In-memory cache** per model
- **Cache key**: `instructions + prompt`
- **No expiration** (cleared on extension reload)
- **Reduces API calls** significantly for repeated diffs

### Large Diff Handling

```typescript
// Switch to name-only mode for diffs > 2100 characters
if (diff.length >= 2100) {
  nameOnly = true;
  diff = await gitService.getDiffAndWarnUser(repo, true, nameOnly);
}
```

### Token Budget Management

- **Max tokens**: Configurable (default 196)
- **Codebase indexing**: Max 5000 tokens total
- **File size limits**: Configurable (default 50KB)

---

## 🔐 Security Considerations

1. **API Keys**: Stored in VS Code settings (not encrypted by VS Code)
2. **No telemetry**: Extension does not collect usage data
3. **Local processing**: Git diffs processed locally before sending to AI
4. **Proxy support**: For corporate environments

---

## 📝 License & Contributing

**License**: MIT  
**Repository**: <https://github.com/Hi7cl4w/diffy-explain-ai>  
**Issues**: <https://github.com/Hi7cl4w/diffy-explain-ai/issues>

### Contributing Guidelines

1. Fork the repository
2. Create feature branch: `git checkout -b feature/new-feature`
3. Follow code style guidelines
4. Add tests for new functionality
5. Submit pull request

---

## 🎓 Learning Resources

- [VS Code Extension API](https://code.visualstudio.com/api)
- [VS Code Git Extension API](https://github.com/microsoft/vscode/tree/main/extensions/git)
- [VS Code Language Model API](https://code.visualstudio.com/api/extension-guides/language-model)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Google Gemini API](https://ai.google.dev/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

**Document Version**: 1.0  
**Last Updated**: November 6, 2025  
**Extension Version**: 1.3.0
