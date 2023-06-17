import { ExtensionContext, env } from "vscode";
import { EventType } from "./@types/EventType";
import BaseDiffy from "./BaseDiffy";
import GitService from "./service/GitService";
import OpenAiService from "./service/OpenAiService";
import WindowService from "./service/WindowService";
import WorkspaceService from "./service/WorkspaceService";

class Diffy extends BaseDiffy {
  static _instance: Diffy;
  private gitService: GitService | null = null;
  private _openAIService: OpenAiService | null = null;
  private workspaceService: WorkspaceService | null = null;
  isEnabled: boolean = false;
  private _windowsService: any;
  context!: ExtensionContext;

  constructor(context: ExtensionContext) {
    if (Diffy._instance) {
      return Diffy._instance;
    }
    super();
    this.context = context;
  }

  /**
   * Initiate all objects
   */
  init() {
    this.gitService = GitService.getInstance();
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
      this._openAIService = OpenAiService.getInstance();
    }
    return this._openAIService;
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
    /* Checking if the api key is defined. */
    const apiKey = this.workspaceService?.getOpenAIKey();
    // if (!apiKey) {
    //   return;
    // }
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
    /* OpenAPI */
    const changes = await this.getOpenAPIService().getExplainedChanges(
      diff,
      apiKey,
      nameOnly
    );
    if (changes) {
      this.getWindowService().showExplainedResultWebviewPane(changes);
    }
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
    // if (!apiKey) {
    //   return;
    // }
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
    /* OpenAPI */
    const changes = await this.getOpenAPIService().getExplainedChanges(
      diff,
      apiKey,
      nameOnly
    );
    /* Copying the changes to the clipboard and showing the changes in the message box. */
    if (changes) {
      env.clipboard.writeText(changes);
      this.showInformationMessage(changes);
    }
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
    /* OpenAPI */
    const changes = await this.getOpenAPIService().getCommitMessageFromDiff(
      diff,
      apiKey,
      nameOnly
    );
    if (changes) {
      env.clipboard.writeText(changes);
      this.showInformationMessage(changes);
    }
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
    /* OpenAPI */
    const changes = await this.getOpenAPIService().getCommitMessageFromDiff(
      diff,
      apiKey,
      nameOnly
    );
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
    this.workspaceService = null;
  }
}

export default Diffy;
