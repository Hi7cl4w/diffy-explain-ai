import { WorkspaceFolder, window, workspace } from "vscode";
import { EventEmitter } from "events";
import { EventType } from "../@types/EventType";
import { CONSTANTS } from "../Constants";

export default class WorkspaceService extends EventEmitter {
  static _instance: WorkspaceService;

  constructor() {
    if (WorkspaceService._instance) {
      return WorkspaceService._instance;
    }
    super();
    /* Listening for changes to the workspace configuration. */
    workspace.onDidChangeConfiguration((e) => {
      this.emit(EventType.WORKSPACE_CHANGED);
    });

    /* Listening for changes to the workspace configuration. */
    workspace.onDidChangeWorkspaceFolders((e) => {
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
    if (
      !workspace.workspaceFolders ||
      workspace.workspaceFolders.length === 0
    ) {
      this.showErrorMessage(`Your are not in a Workspace`);
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
    if (
      !workspace.workspaceFolders ||
      workspace.workspaceFolders.length === 0
    ) {
      return null;
    }
    return workspace.workspaceFolders[0].uri.fsPath;
  }

  /**
   * If there are no workspace folders, return null. Otherwise, return the first workspace folder
   * @returns {WorkspaceFolder | null} The first workspace folder in the workspace.workspaceFolders array.
   */
  getCurrentWorkspace(): WorkspaceFolder | null {
    if (
      !workspace.workspaceFolders ||
      workspace.workspaceFolders.length === 0
    ) {
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

  getOpenAIKey() {
    const openAiKey: string = String(this.getConfiguration().get("openAiKey"));
    // if (!openAiKey) {
    //   this.showErrorMessage(
    //     "Please Enter Your OpenAi Api Key in Settings.\nVisit The Openai Website to Generate Key"
    //   );
    //   return null;
    // }
    return openAiKey;
  }

  getGptModel() {
    const openAiKey: string = String(this.getConfiguration().get("model"));
    return openAiKey;
  }

  /**
   * This function shows an error message
   * @param {string} msg - The message to display.
   */
  showErrorMessage(msg: string) {
    window.showErrorMessage(`${CONSTANTS.extensionShortName}: ${msg}`);
  }
}
