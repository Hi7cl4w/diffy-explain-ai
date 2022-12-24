import { env } from "vscode";
import GitService from "./service/GitService";
import OpenAiService from "./service/OpenAiService";
import WorkspaceService from "./service/WorkSpaceService";
import { EventType } from "./@types/EventType";
import BaseDiffy from "./BaseDiffy";
import WindowService from "./service/WindowService";

class Diffy extends BaseDiffy {
  static _instance: Diffy;
  private gitService: GitService | null = null;
  private _openAIService: OpenAiService | null = null;
  private workspaceService: WorkspaceService | null = null;
  isEnabled: boolean = false;
  private _windowsService: any;

  constructor() {
    if (Diffy._instance) {
      return Diffy._instance;
    }
    super();
  }

  /**
   * Initiate all objects
   */
  init() {
    this.gitService = new GitService();
    this.workspaceService = new WorkspaceService();
    this.workspaceService.on(EventType.WORKSPACE_CHANGED, () => {
      this.onWorkSpaceChanged();
    });
    this.isEnabled = true;
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
      this._openAIService = new OpenAiService();
    }
    return this._openAIService;
  }

  getWindowService(): WindowService {
    if (!this._windowsService) {
      this._windowsService = new WindowService();
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
    /* Checking if the api key is defined. */
    const apiKey = this.workspaceService?.getOpenAIKey();
    if (!apiKey) {
      return;
    }
    /* Getting the current repo. */
    const repo = this.gitService?.getCurrentRepo();
    if (!repo) {
      return;
    }
    /* Getting the diff of the current git branch. */
    const diff = await this.gitService?.getGitDiff(repo);
    if (!diff) {
      this.showInformationMessage(`No changes`);
      return;
    }
    /* OpenAPI */
    const changes = await this.getOpenAPIService().getExplainedChanges(
      apiKey,
      diff
    );
    this.getWindowService().showExplainedResultWebviewPane(changes);
  }

  /**
   * It takes the code that you've changed in your current git branch, sends it to OpenAI's API, and
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
    /* Checking if the api key is defined. */
    const apiKey = this.workspaceService?.getOpenAIKey();
    if (!apiKey) {
      return;
    }
    /* Getting the current repo. */
    const repo = this.gitService?.getCurrentRepo();
    if (!repo) {
      return;
    }
    /* Getting the diff of the current git branch. */
    const diff = await this.gitService?.getGitDiff(repo);
    if (!diff) {
      this.showInformationMessage(`No changes`);
      return;
    }
    /* OpenAPI */
    const changes = await this.getOpenAPIService().getExplainedChanges(
      apiKey,
      diff
    );
    /* Copying the changes to the clipboard and showing the changes in the message box. */
    env.clipboard.writeText(changes);
    this.showInformationMessage(changes);
  }

  /**
   * It takes the current git diff, sends it to OpenAI, and then copies the response to the clipboard.
   * @returns The commit message.
   */
  async generateCommitMessageToClipboard() {
    if (!this.workspaceService?.checkAndWarnWorkSpaceExist()) {
      return;
    }
    if (!this.gitService?.checkAndWarnRepoExist()) {
      return;
    }
    /* Checking if the api key is defined. */
    const apiKey = this.workspaceService?.getOpenAIKey();
    if (!apiKey) {
      return;
    }
    /* Getting the current repo. */
    const repo = this.gitService?.getCurrentRepo();
    if (!repo) {
      return;
    }
    /* Getting the diff of the current git branch. */
    const diff = await this.gitService?.getGitDiff(repo);
    if (!diff) {
      this.showInformationMessage(`No changes`);
      return;
    }
    /* OpenAPI */
    const changes = await this.getOpenAPIService().getCommitMessageFromDiff(
      apiKey,
      diff
    );
    env.clipboard.writeText(changes);
    this.showInformationMessage(changes);
  }

  /**
   * It takes the diff of the current branch, sends it to the OpenAI API, and then sets the commit
   * message to the input box
   * @returns a promise.
   */
  async generateCommitMessageToSCM() {
    if (!this.workspaceService?.checkAndWarnWorkSpaceExist()) {
      return;
    }
    if (!this.gitService?.checkAndWarnRepoExist()) {
      return;
    }
    /* Checking if the api key is defined. */
    const apiKey = this.workspaceService?.getOpenAIKey();
    if (!apiKey) {
      return;
    }
    /* Getting the current repo. */
    const repo = this.gitService?.getCurrentRepo();
    if (!repo) {
      return;
    }
    /* Getting the diff of the current git branch. */
    const diff = await this.gitService?.getGitDiff(repo);
    if (!diff) {
      this.showInformationMessage(`No changes`);
      return;
    }
    /* OpenAPI */
    const changes = await this.getOpenAPIService().getCommitMessageFromDiff(
      apiKey,
      diff
    );
    /* Setting the commit message to the input box. */
    this.gitService?.setCommitMessageToInputBox(repo, changes);
  }

  /**
   * Dispose all objects
   */
  dispose() {
    this.isEnabled = false;
    this.gitService = null;
    this._openAIService = null;
    this.workspaceService = null;
  }
}

export default Diffy;
