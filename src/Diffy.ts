import * as vscode from "vscode";
import { type ExtensionContext, env } from "vscode";
import { EventType } from "./@types/EventType";
import BaseDiffy from "./BaseDiffy";
import CodebaseIndexService from "./service/CodebaseIndexService";
import DiffAnalyzer from "./service/DiffAnalyzer";
import GeminiService from "./service/GeminiService";
import GitService from "./service/GitService";
import OpenAiService from "./service/OpenAiService";
import VsCodeLlmService from "./service/VsCodeLlmService";
import WindowService from "./service/WindowService";
import WorkspaceService from "./service/WorkspaceService";
import { logger } from "./utils/log";

class Diffy extends BaseDiffy {
  static _instance: Diffy;
  private gitService: GitService | null = null;
  private _openAIService: OpenAiService | null = null;
  private _vsCodeLlmService: VsCodeLlmService | null = null;
  private _geminiService: GeminiService | null = null;
  private workspaceService: WorkspaceService | null = null;
  private _codebaseIndexService: CodebaseIndexService | null = null;
  isEnabled = false;
  private _windowsService: WindowService | null = null;
  context!: ExtensionContext;

  constructor(context: ExtensionContext) {
    super();
    if (!Diffy._instance) {
      Diffy._instance = this;
      this.context = context;
    }
  }

  /**
   * Initiate all objects
   */
  init() {
    this.gitService = GitService.getInstance();
    this.workspaceService = WorkspaceService.getInstance();
    this.workspaceService.on(EventType.WORKSPACE_CHANGED, () => {
      this.onWorkSpaceChanged();
    });

    // Pre-initialize AI services to avoid lazy loading delays during commit generation
    const provider = this.workspaceService?.getAiServiceProvider();
    if (provider === "openai") {
      this.getOpenAPIService();
    } else if (provider === "gemini") {
      this.getGeminiService();
    } else {
      this.getVsCodeLlmService();
    }

    // Pre-initialize codebase indexing service if enabled
    if (this.workspaceService?.getConfiguration().get("enableCodebaseContext")) {
      this.getCodebaseIndexService();
    }

    this.isEnabled = true;
    logger.info("Diffy extension initialized");
  }

  /**
   * When the workspace changes, re-initialize the git service.
   */
  onWorkSpaceChanged() {
    this.gitService?.init();
  }

  /**
   * If the _openAIService property is not defined, then create a new instance of the OpenAiService
   * class and assign it to the _openAIService property.
   * @returns The OpenAiService object.
   */
  getOpenAPIService(): OpenAiService {
    if (!this._openAIService) {
      this._openAIService = OpenAiService.getInstance();
    }
    return this._openAIService;
  }

  /**
   * If the _vsCodeLlmService property is not defined, then create a new instance of the VsCodeLlmService
   * class and assign it to the _vsCodeLlmService property.
   * @returns The VsCodeLlmService object.
   */
  getVsCodeLlmService(): VsCodeLlmService {
    if (!this._vsCodeLlmService) {
      this._vsCodeLlmService = VsCodeLlmService.getInstance();
    }
    return this._vsCodeLlmService;
  }

  /**
   * If the _geminiService property is not defined, then create a new instance of the GeminiService
   * class and assign it to the _geminiService property.
   * @returns The GeminiService object.
   */
  getGeminiService(): GeminiService {
    if (!this._geminiService) {
      this._geminiService = GeminiService.getInstance();
    }
    return this._geminiService;
  }

  /**
   * Gets the appropriate AI service based on user settings
   * @returns The selected AI service (OpenAI, VS Code LLM, or Gemini)
   */
  getAIService(): AIService {
    const provider = this.workspaceService?.getAiServiceProvider();
    if (provider === "vscode-lm") {
      return this.getVsCodeLlmService();
    }
    if (provider === "gemini") {
      return this.getGeminiService();
    }
    return this.getOpenAPIService();
  }

  getWindowService(): WindowService {
    if (!this._windowsService) {
      this._windowsService = WindowService.getInstance();
    }
    return this._windowsService;
  }

  getCodebaseIndexService(): CodebaseIndexService {
    if (!this._codebaseIndexService) {
      this._codebaseIndexService = CodebaseIndexService.getInstance();
    }
    return this._codebaseIndexService;
  }

  /**
   * Prepare diff with optional codebase context
   * @param diff - The git diff string
   * @returns {Promise<string>} Diff possibly enriched with project context
   */
  private async prepareDiffWithContext(diff: string): Promise<string> {
    try {
      const strategy = this.workspaceService?.getCodebaseIndexingStrategy();

      // Parallel fetch: Get codebase context and analyze diff simultaneously
      const [codebaseContext, diffContext] = await Promise.all([
        this.getCodebaseIndexService().getCodebaseContext(),
        strategy === "structured"
          ? DiffAnalyzer.getInstance().analyzeGitDiff(diff)
          : Promise.resolve(null),
      ]);

      if (codebaseContext) {
        logger.info("Adding codebase context to prompt", { strategy });

        // If using structured mode, also analyze the diff
        if (strategy === "structured" && diffContext) {
          const diffAnalyzer = DiffAnalyzer.getInstance();
          const compactDiffSummary = diffAnalyzer.formatAsCompact(diffContext);

          return `${codebaseContext}\n\nCHANGES SUMMARY:\n${compactDiffSummary}\n\nDIFF:\n${diff}`;
        }

        // For compact and ast-based modes, use minimal format
        return `${codebaseContext}\n\nDIFF:\n${diff}`;
      }
    } catch (error) {
      logger.error("Error getting codebase context", error);
    }

    return diff;
  }

  async explainAndPreview() {
    if (!this.workspaceService?.checkAndWarnWorkSpaceExist()) {
      return;
    }
    if (!this.gitService?.checkAndWarnRepoExist()) {
      return;
    }

    const provider = this.workspaceService?.getAiServiceProvider();

    // Check if API key is required (for OpenAI and Gemini)
    if (provider === "openai") {
      const apiKey = this.workspaceService?.getOpenAIKey();
      if (!apiKey) {
        return;
      }
    } else if (provider === "gemini") {
      const apiKey = this.workspaceService?.getGeminiKey();
      if (!apiKey) {
        return;
      }
    }

    /* Getting the current repo. */
    const repo = this.gitService?.getCurrentRepo();
    if (!repo) {
      return;
    }
    /* Getting the diff of the current git branch. */
    let nameOnly = false;
    let diff = await this.gitService?.getDiffAndWarnUser(repo, nameOnly);
    if (!diff) {
      return;
    }
    const largeThreshold = this.workspaceService?.getLargeDiffThreshold?.() ?? 2100;
    if (diff && diff.length >= largeThreshold) {
      nameOnly = true;
      diff = await this.gitService?.getDiffAndWarnUser(repo, true, nameOnly);
    }
    if (!diff) {
      return;
    }

    /* Get AI Service based on provider */
    const aiService = this.getAIService();
    let changes: string | null = null;

    if (provider === "openai") {
      const apiKey = this.workspaceService?.getOpenAIKey();
      if (!apiKey) {
        return;
      }
      changes = await (aiService as OpenAiService).getExplainedChanges(diff, apiKey, nameOnly);
    } else if (provider === "gemini") {
      const apiKey = this.workspaceService?.getGeminiKey();
      if (!apiKey) {
        return;
      }
      changes = await (aiService as GeminiService).getExplainedChanges(diff, apiKey, nameOnly);
    } else {
      // VS Code LLM - try with fallback to OpenAI if it fails
      try {
        changes = await aiService.getExplainedChanges("", diff);
      } catch (error) {
        // If VS Code LM fails with model not supported error, try OpenAI as fallback
        if (
          error instanceof Error &&
          (error.message.includes("model_not_supported") ||
            error.message.includes("Model is not supported"))
        ) {
          vscode.window.showInformationMessage(
            "VS Code Language Model not supported for this request. Falling back to OpenAI...",
          );
          const apiKey = this.workspaceService?.getOpenAIKey();
          if (apiKey) {
            changes = await this.getOpenAPIService().getExplainedChanges(diff, apiKey, nameOnly);
          } else {
            vscode.window.showErrorMessage(
              "VS Code Language Model failed and no OpenAI API key configured. Please configure OpenAI API key in settings.",
            );
            return;
          }
        } else {
          throw error; // Re-throw other errors
        }
      }
    }

    if (changes) {
      this.getWindowService().showExplainedResultWebviewPane(changes);
    }
  }

  /**
   * It takes the code that you've changed in your current git branch, sends it to AI service, and
   * then copies the response to your clipboard
   * @returns The return value is a string.
   */
  async explainDiffToClipboard() {
    if (!this.workspaceService?.checkAndWarnWorkSpaceExist()) {
      return;
    }
    if (!this.gitService?.checkAndWarnRepoExist()) {
      return;
    }

    const provider = this.workspaceService?.getAiServiceProvider();

    // Check if API key is required (for OpenAI and Gemini)
    if (provider === "openai") {
      const apiKey = this.workspaceService?.getOpenAIKey();
      if (!apiKey) {
        return;
      }
    } else if (provider === "gemini") {
      const apiKey = this.workspaceService?.getGeminiKey();
      if (!apiKey) {
        return;
      }
    }

    /* Getting the current repo. */
    const repo = this.gitService?.getCurrentRepo();
    if (!repo) {
      return;
    }
    /* Getting the diff of the current git branch. */
    let nameOnly = false;
    let diff = await this.gitService?.getDiffAndWarnUser(repo, nameOnly);
    if (!diff) {
      return;
    }
    const largeThreshold = this.workspaceService?.getLargeDiffThreshold?.() ?? 2100;
    if (diff && diff.length >= largeThreshold) {
      nameOnly = true;
      diff = await this.gitService?.getDiffAndWarnUser(repo, true, nameOnly);
    }
    if (!diff) {
      return;
    }

    /* Get AI Service based on provider */
    const aiService = this.getAIService();
    let changes: string | null = null;

    if (provider === "openai") {
      const apiKey = this.workspaceService?.getOpenAIKey();
      if (!apiKey) {
        return;
      }
      changes = await (aiService as OpenAiService).getExplainedChanges(diff, apiKey, nameOnly);
    } else if (provider === "gemini") {
      const apiKey = this.workspaceService?.getGeminiKey();
      if (!apiKey) {
        return;
      }
      changes = await (aiService as GeminiService).getExplainedChanges(diff, apiKey, nameOnly);
    } else {
      // VS Code LLM - try with fallback to OpenAI if it fails
      try {
        changes = await aiService.getExplainedChanges("", diff);
      } catch (error) {
        // If VS Code LM fails with model not supported error, try OpenAI as fallback
        if (
          error instanceof Error &&
          (error.message.includes("model_not_supported") ||
            error.message.includes("Model is not supported"))
        ) {
          vscode.window.showInformationMessage(
            "VS Code Language Model not supported for this request. Falling back to OpenAI...",
          );
          const apiKey = this.workspaceService?.getOpenAIKey();
          if (apiKey) {
            changes = await this.getOpenAPIService().getExplainedChanges(diff, apiKey, nameOnly);
          } else {
            vscode.window.showErrorMessage(
              "VS Code Language Model failed and no OpenAI API key configured. Please configure OpenAI API key in settings.",
            );
            return;
          }
        } else {
          throw error; // Re-throw other errors
        }
      }
    }

    /* Copying the changes to the clipboard and showing the changes in the message box. */
    if (changes) {
      env.clipboard.writeText(changes);
      this.showInformationMessage(changes);
    }
  }

  /**
   * It takes the diff of the current branch, sends it to the AI service, and then copies the response to clipboard.
   * @returns a promise.
   */
  async generateCommitMessageToClipboard() {
    if (!this.workspaceService?.checkAndWarnWorkSpaceExist()) {
      return;
    }
    if (!this.gitService?.checkAndWarnRepoExist()) {
      return;
    }

    const provider = this.workspaceService?.getAiServiceProvider();

    // Check if API key is required (for OpenAI and Gemini)
    if (provider === "openai") {
      const apiKey = this.workspaceService?.getOpenAIKey();
      if (!apiKey) {
        return;
      }
    } else if (provider === "gemini") {
      const apiKey = this.workspaceService?.getGeminiKey();
      if (!apiKey) {
        return;
      }
    }

    /* Getting the current repo. */
    const repo = this.gitService?.getCurrentRepo();
    if (!repo) {
      return;
    }
    /* Getting the diff of the current git branch. */
    let nameOnly = false;
    let diff = await this.gitService?.getDiffAndWarnUser(repo, nameOnly);
    if (!diff) {
      return;
    }
    if (diff && diff.length >= 2100) {
      nameOnly = true;
      diff = await this.gitService?.getDiffAndWarnUser(repo, true, nameOnly);
    }
    if (!diff) {
      return;
    }

    // Add codebase context to diff if enabled
    const enrichedDiff = await this.prepareDiffWithContext(diff);

    /* Get AI Service based on provider */
    let changes: string | null = null;

    if (provider === "openai") {
      const apiKey = this.workspaceService?.getOpenAIKey();
      if (!apiKey) {
        return;
      }
      changes = await this.getOpenAPIService().getCommitMessageFromDiff(
        enrichedDiff,
        apiKey,
        nameOnly,
      );
    } else if (provider === "gemini") {
      const apiKey = this.workspaceService?.getGeminiKey();
      if (!apiKey) {
        return;
      }
      changes = await this.getGeminiService().getCommitMessageFromDiff(
        enrichedDiff,
        apiKey,
        nameOnly,
      );
    } else {
      // VS Code LLM - try with fallback to OpenAI if it fails
      try {
        changes = await this.getVsCodeLlmService().getCommitMessageFromDiff(enrichedDiff, nameOnly);
      } catch (error) {
        // If VS Code LM fails with model not supported error, try OpenAI as fallback
        if (
          error instanceof Error &&
          (error.message.includes("model_not_supported") ||
            error.message.includes("Model is not supported"))
        ) {
          vscode.window.showInformationMessage(
            "VS Code Language Model not supported for this request. Falling back to OpenAI...",
          );
          const apiKey = this.workspaceService?.getOpenAIKey();
          if (apiKey) {
            changes = await this.getOpenAPIService().getCommitMessageFromDiff(
              enrichedDiff,
              apiKey,
              nameOnly,
            );
          } else {
            vscode.window.showErrorMessage(
              "VS Code Language Model failed and no OpenAI API key configured. Please configure OpenAI API key in settings.",
            );
            return;
          }
        } else {
          throw error; // Re-throw other errors
        }
      }
    }

    if (changes) {
      env.clipboard.writeText(changes);
      this.showInformationMessage(changes);
    }
  }

  /**
   * It takes the diff of the current branch, sends it to the AI service, and then sets the commit
   * message to the input box
   * @returns a promise.
   */
  async generateCommitMessageToSCM(
    progress?: vscode.Progress<{
      message?: string | undefined;
      increment?: number | undefined;
    }>,
  ) {
    if (!this.workspaceService?.checkAndWarnWorkSpaceExist()) {
      return;
    }
    if (!this.gitService?.checkAndWarnRepoExist()) {
      return;
    }

    const provider = this.workspaceService?.getAiServiceProvider();

    // Check if API key is required (for OpenAI and Gemini)
    if (provider === "openai") {
      const apiKey = this.workspaceService?.getOpenAIKey();
      if (!apiKey) {
        return;
      }
    } else if (provider === "gemini") {
      const apiKey = this.workspaceService?.getGeminiKey();
      if (!apiKey) {
        return;
      }
    }

    /* Getting the current repo. */
    const repo = this.gitService?.getCurrentRepo();
    if (!repo) {
      return;
    }

    /* Getting the diff of the current git branch and codebase context in parallel */
    let nameOnly = false;
    const [diff, _] = await Promise.all([
      this.gitService?.getDiffAndWarnUser(repo, nameOnly),
      // Pre-warm codebase context cache if enabled
      this.workspaceService?.getConfiguration().get("enableCodebaseContext")
        ? this.getCodebaseIndexService().getCodebaseContext()
        : Promise.resolve(null),
    ]);

    if (!diff) {
      return;
    }
    const largeThreshold = this.workspaceService?.getLargeDiffThreshold?.() ?? 2100;
    if (diff && diff.length >= largeThreshold) {
      nameOnly = true;
      const newDiff = await this.gitService?.getDiffAndWarnUser(repo, true, nameOnly);
      if (!newDiff) {
        return;
      }
    }

    // Add codebase context to diff if enabled (uses cached context from parallel fetch)
    const enrichedDiff = await this.prepareDiffWithContext(diff);

    /* Get AI Service based on provider */
    let changes: string | null = null;

    if (provider === "openai") {
      const apiKey = this.workspaceService?.getOpenAIKey();
      if (!apiKey) {
        return;
      }
      changes = await this.getOpenAPIService().getCommitMessageFromDiff(
        enrichedDiff,
        apiKey,
        nameOnly,
        progress,
      );
    } else if (provider === "gemini") {
      const apiKey = this.workspaceService?.getGeminiKey();
      if (!apiKey) {
        return;
      }
      changes = await this.getGeminiService().getCommitMessageFromDiff(
        enrichedDiff,
        apiKey,
        nameOnly,
        progress,
      );
    } else {
      // VS Code LLM - try with fallback to OpenAI if it fails
      try {
        changes = await this.getVsCodeLlmService().getCommitMessageFromDiff(
          enrichedDiff,
          nameOnly,
          progress,
        );
      } catch (error) {
        // If VS Code LM fails with model not supported error, try OpenAI as fallback
        if (
          error instanceof Error &&
          (error.message.includes("model_not_supported") ||
            error.message.includes("Model is not supported"))
        ) {
          vscode.window.showInformationMessage(
            "VS Code Language Model not supported for this request. Falling back to OpenAI...",
          );
          const apiKey = this.workspaceService?.getOpenAIKey();
          if (apiKey) {
            changes = await this.getOpenAPIService().getCommitMessageFromDiff(
              enrichedDiff,
              apiKey,
              nameOnly,
              progress,
            );
          } else {
            vscode.window.showErrorMessage(
              "VS Code Language Model failed and no OpenAI API key configured. Please configure OpenAI API key in settings.",
            );
            return;
          }
        } else {
          throw error; // Re-throw other errors
        }
      }
    }

    if (changes) {
      /* Setting the commit message to the input box. */
      this.gitService?.setCommitMessageToInputBox(repo, changes);
    }
  }

  /**
   * Update staged changes when Git staging area changes
   * Pre-warms diff context preparation in background for faster commit generation
   */
  async updateStagedChanges() {
    try {
      // Check if we have a valid workspace and repo
      if (!this.workspaceService?.checkAndWarnWorkSpaceExist()) {
        return;
      }
      if (!this.gitService?.checkAndWarnRepoExist()) {
        return;
      }

      const repo = this.gitService?.getCurrentRepo();
      if (!repo) {
        return;
      }

      // Get current staged diff in background
      const diff = await this.gitService?.getDiffAndWarnUser(repo, false, undefined, true);
      if (!diff) {
        return;
      }

      // Pre-warm the diff context preparation in background
      this.prepareDiffWithContext(diff).catch((error) => {
        logger.error("Error pre-warming diff context", error);
      });

      logger.info("Staged changes updated - pre-warming diff context");
    } catch (error) {
      logger.error("Error in updateStagedChanges", error);
    }
  }

  /**
   * Dispose all objects
   */
  dispose() {
    this.isEnabled = false;
    this.gitService = null;
    this._openAIService = null;
    this._vsCodeLlmService = null;
    this._geminiService = null;
    this.workspaceService = null;
    this._codebaseIndexService = null;
  }
}

export default Diffy;
