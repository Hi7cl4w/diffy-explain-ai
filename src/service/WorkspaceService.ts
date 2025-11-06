import { EventEmitter } from "node:events";
import { type WorkspaceFolder, window, workspace } from "vscode";
import { EventType } from "../@types/EventType";
import { CONSTANTS } from "../Constants";

export default class WorkspaceService extends EventEmitter {
  static _instance: WorkspaceService;

  private constructor() {
    super();
    /* Listening for changes to the workspace configuration. */
    workspace.onDidChangeConfiguration((_e) => {
      this.emit(EventType.WORKSPACE_CHANGED);
    });

    /* Listening for changes to the workspace configuration. */
    workspace.onDidChangeWorkspaceFolders((_e) => {
      this.emit(EventType.WORKSPACE_CHANGED);
    });
  }

  /**
   * returns instance of the class
   * @returns {WorkspaceService} The instance of the class.
   */
  public static getInstance(): WorkspaceService {
    if (!WorkspaceService._instance) {
      WorkspaceService._instance = new WorkspaceService();
    }
    return WorkspaceService._instance;
  }

  /**
   * If there are no workspace folders, or the number of workspace folders is 0, return false.
   * Otherwise, return true.
   * @returns A boolean value.
   */
  checkAndWarnWorkSpaceExist(): boolean {
    if (!workspace.workspaceFolders || workspace.workspaceFolders.length === 0) {
      this.showErrorMessage("Your are not in a Workspace");
      return false;
    }
    return true;
  }

  /**
   * If there are no workspace folders, return null. Otherwise, return the first workspace folder's
   * path
   * @returns {string | null} The current workspace folder path.
   */
  getCurrentWorkspaceUri(): string | null {
    if (!workspace.workspaceFolders || workspace.workspaceFolders.length === 0) {
      return null;
    }
    return workspace.workspaceFolders[0].uri.fsPath;
  }

  /**
   * If there are no workspace folders, return null. Otherwise, return the first workspace folder
   * @returns {WorkspaceFolder | null} The first workspace folder in the workspace.workspaceFolders array.
   */
  getCurrentWorkspace(): WorkspaceFolder | null {
    if (!workspace.workspaceFolders || workspace.workspaceFolders.length === 0) {
      return null;
    }
    return workspace.workspaceFolders[0];
  }

  /**
   * It returns the workspace folders.
   * @returns {WorkspaceFolder[] | undefined} An array of WorkspaceFolder objects.
   */
  getWorkspaceFolders(): readonly WorkspaceFolder[] | undefined {
    return workspace.workspaceFolders;
  }

  getConfiguration() {
    return workspace.getConfiguration(CONSTANTS.extensionName);
  }

  getAiServiceProvider() {
    const value = String(this.getConfiguration().get("aiServiceProvider"));
    return value || "openai";
  }

  getVsCodeLmModel() {
    const value = String(this.getConfiguration().get("vscodeLmModel"));
    return value || "auto";
  }

  getOpenAIKey() {
    const value = String(this.getConfiguration().get("openAiKey"));
    if (!value) {
      this.showErrorMessage(
        "Your OpenAI API Key is missing; kindly input it within the Diffy Settings section. You can generate a key by visiting the OpenAI website.",
      );
      return null;
    }
    return value;
  }

  getGptModel() {
    const value = String(this.getConfiguration().get("model"));
    return value;
  }

  getGeminiKey() {
    const value = String(this.getConfiguration().get("geminiApiKey"));
    if (!value) {
      this.showErrorMessage(
        "Your Google Gemini API Key is missing; kindly input it within the Diffy Settings section. You can generate a key by visiting Google AI Studio.",
      );
      return null;
    }
    return value;
  }

  getGeminiModel() {
    const value = String(this.getConfiguration().get("geminiModel"));
    return value || "gemini-2.0-flash-exp";
  }

  getProxyUrl() {
    const value = this.getConfiguration().get("proxyUrl")
      ? String(this.getConfiguration().get("proxyUrl"))
      : undefined;
    return value;
  }

  getAdditionalInstructions() {
    const value = this.getConfiguration().get("additionalInstructions")
      ? String(this.getConfiguration().get("additionalInstructions"))
      : undefined;
    // Return undefined if empty, this is optional now
    return value?.trim() ? value : undefined;
  }

  getTemp() {
    const value = this.getConfiguration().get("temperature")
      ? Number(this.getConfiguration().get("temperature"))
      : undefined;
    return value;
  }

  getMaxTokens() {
    const value = this.getConfiguration().get("maxTokens")
      ? Number(this.getConfiguration().get("maxTokens"))
      : undefined;
    return value;
  }

  getCommitMessageType() {
    const value = String(this.getConfiguration().get("commitMessageType"));
    return value || "conventional";
  }

  getCustomCommitPrompt() {
    const value = this.getConfiguration().get("customCommitPrompt");
    if (typeof value === "string" && value.trim()) {
      return value;
    }
    // Default custom template if not set
    return `Generate a commit message for the following git diff.

Requirements:
- Maximum subject length: {maxLength} characters
- Use imperative mood
- Be concise and clear{bodyInstructions}

Return ONLY the commit message, no explanations.`;
  }

  getIncludeCommitBody() {
    const value = this.getConfiguration().get("includeCommitBody");
    return value === true;
  }

  getExcludeFilesFromDiff(): string[] {
    const value = this.getConfiguration().get("excludeFilesFromDiff");
    if (Array.isArray(value)) {
      return value;
    }
    // Default exclusions
    return [
      "package-lock.json",
      "yarn.lock",
      "pnpm-lock.yaml",
      "*.jpg",
      "*.png",
      "*.gif",
      "*.svg",
      "*.ico",
      "*.woff",
      "*.woff2",
      "*.ttf",
      "*.eot",
    ];
  }

  getMaxCommitMessageLength() {
    const value = this.getConfiguration().get("maxCommitMessageLength");
    return typeof value === "number" ? value : 72;
  }

  getRespectGitignore(): boolean {
    const value = this.getConfiguration().get("respectGitignore");
    return value === true;
  }

  getEnableCodebaseContext(): boolean {
    const value = this.getConfiguration().get("enableCodebaseContext");
    return value === true;
  }

  getIndexedFiles(): string[] {
    const value = this.getConfiguration().get("indexedFiles");
    if (Array.isArray(value)) {
      return value;
    }
    // Enhanced default indexed files with auto-detection support
    return [
      "auto", // Enable auto-detection of project files
    ];
  }

  getMaxIndexedFileSize(): number {
    const value = this.getConfiguration().get("maxIndexedFileSize");
    return typeof value === "number" ? value : 100; // Increased from 50KB to 100KB
  }

  getCodebaseContextTokenBudget(): number {
    const value = this.getConfiguration().get("codebaseContextTokenBudget");
    return typeof value === "number" && value > 0 ? value : 2000; // Default 2000 tokens
  }

  getCodebaseIndexingStrategy(): "compact" | "structured" | "ast-based" {
    const value = this.getConfiguration().get("codebaseIndexingStrategy");
    if (value === "structured" || value === "ast-based") {
      return value;
    }
    return "compact"; // Default
  }

  /**
   * Builds unified commit message generation instructions for all AI providers
   * @returns {string} The formatted instructions based on commit type and settings
   */
  getCommitMessageInstructions(): string {
    const commitType = this.getCommitMessageType();
    const includeBody = this.getIncludeCommitBody();
    const maxLength = this.getMaxCommitMessageLength();
    const additionalInstructions = this.getAdditionalInstructions();

    let instructions = "";

    if (commitType === "custom") {
      // Custom user-defined template with placeholder replacement
      const customTemplate = this.getCustomCommitPrompt();

      // Prepare body instructions based on includeBody setting
      const bodyInstructions = includeBody
        ? "\n- Include a body section with 2-4 bullet points explaining the changes"
        : "";

      // Replace placeholders
      instructions = customTemplate
        .replace(/{maxLength}/g, String(maxLength))
        .replace(/{bodyInstructions}/g, bodyInstructions)
        .replace(/{locale}/g, "en") // Could be made configurable if needed
        .replace(/{diff}/g, ""); // We append diff separately

      // Add additional instructions if provided (unless already in template)
      if (additionalInstructions && !customTemplate.includes(additionalInstructions)) {
        instructions += `\n\nADDITIONAL INSTRUCTIONS:\n${additionalInstructions}`;
      }
    } else if (commitType === "gitmoji") {
      instructions = `You are an expert Git commit message generator that uses Gitmoji (emoji-based commits).

Analyze the provided git diff and generate a commit message following the Gitmoji specification:

FORMAT: <emoji> <type>[optional scope]: <description>

Common Gitmoji mappings:
- ✨ :sparkles: - New feature (feat)
- 🐛 :bug: - Bug fix (fix)
- 📝 :memo: - Documentation (docs)
- 💄 :lipstick: - UI/styling (style)
- ♻️ :recycle: - Code refactoring (refactor)
- ⚡️ :zap: - Performance improvement (perf)
- ✅ :white_check_mark: - Tests (test)
- 🔧 :wrench: - Configuration (chore)
- 🔨 :hammer: - Build/tooling (build)
- 🚀 :rocket: - Deployment (ci)

REQUIREMENTS:
1. Subject line must NOT exceed ${maxLength} characters
2. Use imperative mood (e.g., "add" not "added")
3. Do not end subject with a period
4. Start with the appropriate emoji${
        includeBody
          ? "\n5. Include a body section with 2-4 bullet points explaining key changes"
          : ""
      }

${additionalInstructions ? `\nADDITIONAL INSTRUCTIONS:\n${additionalInstructions}\n` : ""}

Return ONLY the commit message, no explanations or surrounding text.`;
    } else {
      // Conventional Commits format
      instructions = `You are an expert Git commit message generator following Conventional Commits specification.

Analyze the provided git diff and generate a commit message following this format:

<type>[optional scope]: <description>
${includeBody ? "\n[optional body]\n" : ""}
[optional footer(s)]

COMMIT TYPES:
- feat: A new feature
- fix: A bug fix
- docs: Documentation only changes
- style: Changes that don't affect code meaning (formatting, missing semicolons, etc.)
- refactor: Code change that neither fixes a bug nor adds a feature
- perf: Code change that improves performance
- test: Adding missing tests or correcting existing tests
- build: Changes to build system or external dependencies
- ci: Changes to CI configuration files and scripts
- chore: Other changes that don't modify src or test files
- revert: Reverts a previous commit

REQUIREMENTS:
1. Subject line must NOT exceed ${maxLength} characters
2. Use imperative mood (e.g., "add" not "added")
3. Do not capitalize first letter after type
4. Do not end subject with a period
5. Choose the most specific scope when applicable (e.g., "auth", "api", "ui")${
        includeBody
          ? "\n6. Include a body section with 2-4 bullet points explaining:\n   - What changed\n   - Why it changed\n   - Any important implementation details"
          : ""
      }

${additionalInstructions ? `\nADDITIONAL INSTRUCTIONS:\n${additionalInstructions}\n` : ""}

Return ONLY the commit message, no explanations or surrounding text.`;
    }

    return instructions;
  }

  /**
   * This function shows an error message
   * @param {string} msg - The message to display.
   */
  showErrorMessage(msg: string) {
    window.showErrorMessage(`${CONSTANTS.extensionShortName}: ${msg}`);
  }
}
