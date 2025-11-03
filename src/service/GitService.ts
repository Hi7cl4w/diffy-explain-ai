import simpleGit from "simple-git";
import { type Extension, extensions, window } from "vscode";
import type { API as GitApi, GitExtension, Repository } from "../@types/git";
import { CONSTANTS } from "../Constants";
import WorkspaceService from "./WorkspaceService";

class GitService {
  static _instance: GitService;
  isEnabled = false;
  vscodeGitApi: GitApi | null = null;

  /**
   * returns instance of the class
   * @returns {GitService} The instance of the class.
   */
  public static getInstance(): GitService {
    if (!GitService._instance) {
      GitService._instance = new GitService();
    }
    return GitService._instance;
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

  constructor() {
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
        this.showErrorMessage("Please make sure git repo initiated or scm plugin working");
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
      this.showErrorMessage("No Git Repo Found in Current Workspace");
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

  async getDiffAndWarnUser(repo: Repository, cached = true, nameOnly?: boolean) {
    const diff = await this.getGitDiff(repo, cached, nameOnly);
    if (!diff) {
      if (cached) {
        const diffUncached = await repo.diff(false);
        if (diffUncached) {
          this.showInformationMessage("warning: please stage your git changes");
        } else {
          this.showInformationMessage("No Changes");
        }
        return null;
      }
      this.showInformationMessage("No changes");
    }
    return diff;
  }

  /**
   * Check if a file path matches any of the exclusion patterns
   * @param filePath - The file path to check
   * @param patterns - Array of glob patterns to match against
   * @returns true if the file should be excluded
   */
  private shouldExcludeFile(filePath: string, patterns: string[]): boolean {
    for (const pattern of patterns) {
      // Simple glob pattern matching
      if (pattern.includes("*")) {
        const regex = new RegExp(
          `^${pattern.replace(/\\/g, "\\\\").replace(/\./g, "\\.").replace(/\*/g, ".*").replace(/\?/g, ".")}$`,
        );
        if (regex.test(filePath)) {
          return true;
        }
      } else if (filePath.includes(pattern)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Filter diff output to exclude specified file patterns
   * @param diff - The raw git diff output
   * @param excludePatterns - Patterns to exclude
   * @returns Filtered diff output
   */
  private filterDiffByExclusions(diff: string, excludePatterns: string[]): string {
    if (!excludePatterns || excludePatterns.length === 0) {
      return diff;
    }

    // Split diff into file sections (each starts with "diff --git")
    const fileSections = diff.split(/(?=diff --git)/);
    const filteredSections: string[] = [];

    for (const section of fileSections) {
      if (!section.trim()) {
        continue;
      }

      // Extract file path from the diff header
      // Format: "diff --git a/path/to/file b/path/to/file"
      const fileMatch = section.match(/diff --git a\/(.+?) b\//);
      if (!fileMatch) {
        // Keep sections we can't parse
        filteredSections.push(section);
        continue;
      }

      const filePath = fileMatch[1];
      if (!this.shouldExcludeFile(filePath, excludePatterns)) {
        filteredSections.push(section);
      }
    }

    return filteredSections.join("");
  }

  /**
   * Get the diff in the git repository.
   * @returns The diff object is being returned.
   */
  async getGitDiff(repo: Repository, _cachedInput = true, nameOnly?: boolean) {
    // let diff = await repo.diff(cached);
    const git = simpleGit(repo.rootUri.fsPath);
    let diff: string | null = "";

    // Get exclusion patterns from settings
    const excludePatterns = WorkspaceService.getInstance().getExcludeFilesFromDiff();

    if (!nameOnly) {
      diff = await git.diff(["--cached"]).catch((error) => {
        this.showErrorMessage("git repository not found");
        console.error(error);
        return null;
      });

      // Apply file filtering if diff was successful
      if (diff && excludePatterns.length > 0) {
        diff = this.filterDiffByExclusions(diff, excludePatterns);
      }
    } else {
      diff = await git.diff(["--cached", "--name-status"]).catch((error) => {
        this.showErrorMessage("git repository not found");
        console.error(error);
        return null;
      });
    }
    return diff;
  }

  /**
   * Message to Commit Input box
   * @param {Repository} repo - Repository - this is the repository object that you're currently in.
   * @param {string} message - The message you want to add to the commit message
   */
  setCommitMessageToInputBox(repo: Repository, message: string) {
    const previousValue = repo.inputBox.value;
    repo.inputBox.value = previousValue ? `${previousValue} \n${message}` : message;
  }

  /**
   * get VSCODE git API
   * @returns {Promise<GitApi | undefined>} a Promise that resolves to a VscodeGitApi or undefined.
   */
  private async getVscodeGitApi(): Promise<GitApi | undefined> {
    try {
      const extension = extensions.getExtension("vscode.git") as Extension<GitExtension>;
      if (extension !== undefined) {
        const gitExtension = extension.isActive ? extension.exports : await extension.activate();

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
