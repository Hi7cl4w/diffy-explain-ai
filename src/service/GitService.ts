import { window, Extension, extensions } from "vscode";

import { API as GitApi, GitExtension, Repository } from "../@types/git";
import { CONSTANTS } from "../Constants";

class GitService {
  static _instance: GitService;
  isEnabled: boolean = false;
  vscodeGitApi: GitApi | null = null;

  constructor() {
    if (GitService._instance) {
      return GitService._instance;
    }
    this.initGitApi();
  }

  /**
   * Initiate all
   */
  async init() {
    this.initGitApi();
  }

  /**
   * Reload all
   */
  async reload() {
    this.initGitApi();
  }

  /**
   * init Vscode GitApi
   * @returns {Promise<void>}
   */
  async initGitApi() {
    if (this.vscodeGitApi === null) {
      const api = await this.getVscodeGitApi();
      if (api === undefined) {
        this.showErrorMessage(
          `Please make sure git repo initiated or scm plugin working`
        );
        this.isEnabled = false;
        return;
      }
      this.vscodeGitApi = api;
      this.isEnabled = true;
    }
  }

  /**
   * If check any repo exit
   * @returns A boolean value.
   */
  async checkAndWarnRepoExist() {
    const repos = this.vscodeGitApi?.repositories;
    if (repos === undefined || repos.length === 0) {
      this.showErrorMessage(`No Git Repo Found in Current Workspace`);
      return false;
    }
    return true;
  }

  /**
   * If the repo is not initiated, show an error message
   * @returns The first repo in the array of repos.
   */
  getCurrentRepo() {
    const repo = this.vscodeGitApi?.repositories[0];
    if (!repo) {
      this.showErrorMessage("Please make sure git repo initiated");
    }
    return this.vscodeGitApi?.repositories[0];
  }

  /**
   * This function shows an error message
   * @param {string} msg - The message to display.
   */
  showErrorMessage(msg: string) {
    window.showErrorMessage(`${CONSTANTS.extensionShortName}: ${msg}`);
  }

  /**
   * It shows an information message
   * @param {string} msg - The message to show.
   */
  showInformationMessage(msg: string) {
    window.showInformationMessage(`${CONSTANTS.extensionShortName}: ${msg}`);
  }

  /**
   * Get the diff in the git repository.
   * @returns The diff object is being returned.
   */
  async getGitDiff(repo: Repository, cached = true) {
    let diff = await repo.diff(cached);
    return diff;
  }

  /**
   * Message to Commit Input box
   * @param {Repository} repo - Repository - this is the repository object that you're currently in.
   * @param {string} message - The message you want to add to the commit message
   */
  setCommitMessageToInputBox(repo: Repository, message: string) {
    const previousValue = repo.inputBox.value;
    repo.inputBox.value = previousValue
      ? previousValue + " \n" + message
      : message;
  }

  /**
   * get VSCODE git API
   * @returns {Promise<GitApi | undefined>} a Promise that resolves to a VscodeGitApi or undefined.
   */
  private async getVscodeGitApi(): Promise<GitApi | undefined> {
    try {
      const extension = extensions.getExtension(
        "vscode.git"
      ) as Extension<GitExtension>;
      if (extension !== undefined) {
        const gitExtension = extension.isActive
          ? extension.exports
          : await extension.activate();

        return gitExtension.getAPI(1);
      }
    } catch {}

    return undefined;
  }

  /**
   * It disposes the class object.
   */
  dispose() {
    this.isEnabled = false;
  }
}

export default GitService;
