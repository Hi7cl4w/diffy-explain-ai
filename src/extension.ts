// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import Diffy from "./Diffy";

let app: Diffy | null = null;

export function activate(context: vscode.ExtensionContext) {
  app = new Diffy(context);
  app.init();

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "diffy-explain-ai.explainDiffClipboard",
      () => {
        app?.explainDiffToClipboard();
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "diffy-explain-ai.generateCommitMessage",
      async () => {
        vscode.window.withScmProgress(async (progress) => {
          await new Promise((f) => setTimeout(f, 1000));
        });
        vscode.window.withProgress(
          {
            location: vscode.ProgressLocation.Notification,
            cancellable: false,
            title: "Generating commit message...",
          },
          async (progress) => {
            progress.report({ increment: 0 });

            await app?.generateCommitMessageToSCM();

            progress.report({ increment: 100 });
          }
        );
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "diffy-explain-ai.generateCommitMessageClipboard",
      () => {
        app?.generateCommitMessageToClipboard();
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "diffy-explain-ai.explainAndPreview",
      () => {
        app?.explainAndPreview();
      }
    )
  );
}

// This method is called when your extension is deactivated
export function deactivate() {
  if (app) {
    app.dispose();
    app = null;
  }
}
