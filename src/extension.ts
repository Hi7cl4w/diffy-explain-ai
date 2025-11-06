// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import type { API as GitApi, GitExtension, Repository } from "./@types/git";
import Diffy from "./Diffy";

let app: Diffy | null = null;

function setupGitStagingEventListeners(context: vscode.ExtensionContext) {
  const gitExtension = vscode.extensions.getExtension<GitExtension>("vscode.git");
  if (!gitExtension) {
    return;
  }

  const gitApi = gitExtension.exports.getAPI(1);
  if (!gitApi) {
    return;
  }

  // Listen for changes in the Git staging area
  gitApi.repositories.forEach((repo: Repository) => {
    const onDidChangeRepository = repo.state.onDidChange;
    if (onDidChangeRepository) {
      context.subscriptions.push(
        onDidChangeRepository(() => {
          // Update the Diffy app when the repository state changes
          app?.updateStagedChanges().catch((error) => {
            console.error("Error updating staged changes:", error);
          });
        }),
      );
    }
  });

  // Also listen for new repositories being added
  context.subscriptions.push(
    gitApi.onDidOpenRepository((repo: Repository) => {
      const onDidChangeRepository = repo.state.onDidChange;
      if (onDidChangeRepository) {
        context.subscriptions.push(
          onDidChangeRepository(() => {
            app?.updateStagedChanges().catch((error) => {
              console.error("Error updating staged changes:", error);
            });
          }),
        );
      }
    }),
  );
}

export function activate(context: vscode.ExtensionContext) {
  app = new Diffy(context);
  app.init();

  setupGitStagingEventListeners(context);

  context.subscriptions.push(
    vscode.commands.registerCommand("diffy-explain-ai.explainDiffClipboard", () => {
      return app?.explainDiffToClipboard();
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("diffy-explain-ai.generateCommitMessage", () => {
      return vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          cancellable: false,
          title: "Generating...\n",
        },
        async (progress) => {
          progress.report({ increment: 0 });

          await app?.generateCommitMessageToSCM(progress);

          progress.report({
            message: "Commit message generated.",
            increment: 100,
          });
        },
      );
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("diffy-explain-ai.generateCommitMessageClipboard", () => {
      return app?.generateCommitMessageToClipboard();
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("diffy-explain-ai.explainAndPreview", () => {
      return app?.explainAndPreview();
    }),
  );
}

// This method is called when your extension is deactivated
export function deactivate() {
  if (app) {
    app.dispose();
    app = null;
  }
}
