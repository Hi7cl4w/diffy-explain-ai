import * as vscode from "vscode";
import { type ExtensionContext, env } from "vscode";
import { EventType } from "./@types/EventType";
import BaseDiffy from "./BaseDiffy";
import GitService from "./service/GitService";
import OpenAiService from "./service/OpenAiService";
import VsCodeLlmService from "./service/VsCodeLlmService";
import WindowService from "./service/WindowService";
import WorkspaceService from "./service/WorkspaceService";
import { sendToOutput } from "./utils/log";

class Diffy extends BaseDiffy {
  static _instance: Diffy;
  private gitService: GitService | null = null;
  private _openAIService: OpenAiService | null = null;
  private _vsCodeLlmService: VsCodeLlmService | null = null;
  private workspaceService: WorkspaceService | null = null;
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
    this.isEnabled = true;
    sendToOutput("initiated");
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
   * Gets the appropriate AI service based on user settings
   * @returns The selected AI service (OpenAI or VS Code LLM)
   */
  getAIService(): AIService {
    const provider = this.workspaceService?.getAiServiceProvider();
    if (provider === "vscode-lm") {
      return this.getVsCodeLlmService();
    }
    return this.getOpenAPIService();
  }

  getWindowService(): WindowService {
    if (!this._windowsService) {
      this._windowsService = WindowService.getInstance();
    }
    return this._windowsService;
  }

  async explainAndPreview() {
    if (!this.workspaceService?.checkAndWarnWorkSpaceExist()) {
      return;
    }
    if (!this.gitService?.checkAndWarnRepoExist()) {
      return;
    }

    const provider = this.workspaceService?.getAiServiceProvider();

    // Check if API key is required (for OpenAI)
    if (provider === "openai") {
      const apiKey = this.workspaceService?.getOpenAIKey();
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

    /* Get AI Service based on provider */
    const aiService = this.getAIService();
    let changes: string | null = null;

    if (provider === "openai") {
      const apiKey = this.workspaceService?.getOpenAIKey();
      if (!apiKey) {
        return;
      }
      changes = await (aiService as OpenAiService).getExplainedChanges(diff, apiKey, nameOnly);
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

    // Check if API key is required (for OpenAI)
    if (provider === "openai") {
      const apiKey = this.workspaceService?.getOpenAIKey();
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

    /* Get AI Service based on provider */
    const aiService = this.getAIService();
    let changes: string | null = null;

    if (provider === "openai") {
      const apiKey = this.workspaceService?.getOpenAIKey();
      if (!apiKey) {
        return;
      }
      changes = await (aiService as OpenAiService).getExplainedChanges(diff, apiKey, nameOnly);
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

    // Check if API key is required (for OpenAI)
    if (provider === "openai") {
      const apiKey = this.workspaceService?.getOpenAIKey();
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

    /* Get AI Service based on provider */
    let changes: string | null = null;

    if (provider === "openai") {
      const apiKey = this.workspaceService?.getOpenAIKey();
      if (!apiKey) {
        return;
      }
      changes = await this.getOpenAPIService().getCommitMessageFromDiff(diff, apiKey, nameOnly);
    } else {
      // VS Code LLM - try with fallback to OpenAI if it fails
      try {
        changes = await this.getVsCodeLlmService().getCommitMessageFromDiff(diff, nameOnly);
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
              diff,
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

    // Check if API key is required (for OpenAI)
    if (provider === "openai") {
      const apiKey = this.workspaceService?.getOpenAIKey();
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

    /* Get AI Service based on provider */
    let changes: string | null = null;

    if (provider === "openai") {
      const apiKey = this.workspaceService?.getOpenAIKey();
      if (!apiKey) {
        return;
      }
      changes = await this.getOpenAPIService().getCommitMessageFromDiff(
        diff,
        apiKey,
        nameOnly,
        progress,
      );
    } else {
      // VS Code LLM - try with fallback to OpenAI if it fails
      try {
        changes = await this.getVsCodeLlmService().getCommitMessageFromDiff(
          diff,
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
              diff,
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
   * Dispose all objects
   */
  dispose() {
    this.isEnabled = false;
    this.gitService = null;
    this._openAIService = null;
    this._vsCodeLlmService = null;
    this.workspaceService = null;
  }
}

export default Diffy;
