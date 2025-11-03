import { EventEmitter } from "node:events";
import { type WorkspaceFolder, window, workspace } from "vscode";
import { EventType } from "../@types/EventType";
import { CONSTANTS } from "../Constants";

export default class WorkspaceService extends EventEmitter {
  static _instance: WorkspaceService;

  constructor() {
    super();
    if (!WorkspaceService._instance) {
      WorkspaceService._instance = this;
      /* Listening for changes to the workspace configuration. */
      workspace.onDidChangeConfiguration((_e) => {
        this.emit(EventType.WORKSPACE_CHANGED);
      });

      /* Listening for changes to the workspace configuration. */
      workspace.onDidChangeWorkspaceFolders((_e) => {
        this.emit(EventType.WORKSPACE_CHANGED);
      });
    }
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
      void this.showErrorMessage("Your are not in a Workspace");
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
    return value || "copilot-gpt-4o";
  }

  getOpenAIKey() {
    const value = String(this.getConfiguration().get("openAiKey"));
    if (!value) {
      void this.showErrorMessage(
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

  getProxyUrl() {
    const value = this.getConfiguration().get("proxyUrl")
      ? String(this.getConfiguration().get("proxyUrl"))
      : undefined;
    return value;
  }

  getAIInstructions() {
    const value = this.getConfiguration().get("aiInstructions")
      ? String(this.getConfiguration().get("aiInstructions"))
      : undefined;
    if (!value) {
      void this.showErrorMessage(
        "Instructions for AI are absent; please provide them within the Diffy Settings section.",
      );
      return null;
    }
    return value;
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

  /**
   * This function shows an error message
   * @param {string} msg - The message to display.
   */
  showErrorMessage(msg: string) {
    window.showErrorMessage(`${CONSTANTS.extensionShortName}: ${msg}`);
  }
}
