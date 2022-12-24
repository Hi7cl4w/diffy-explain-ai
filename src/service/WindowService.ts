import { ViewColumn, WebviewPanel, window } from "vscode";

export default class WindowService {
  static _instance: WindowService;
  panel?: WebviewPanel;
  constructor() {
    if (WindowService._instance) {
      return WindowService._instance;
    }
  }

  showExplainedResultWebviewPane(explain: string) {
    const content = this.getWebviewContent(explain);
    if (!this.panel) {
      this.createWebviewPanel(content);
    }
    this.panel?.reveal();
  }

  private createWebviewPanel(content: string) {
    this.panel = window.createWebviewPanel(
      "ExplainGitDiff",
      "Explain Git Diff",
      ViewColumn.Two,
      {
        enableScripts: false,
        retainContextWhenHidden: true,
      }
    );
    this.panel.webview.html = content;
  }

  private getWebviewContent(explain: string) {
    return `<!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Cat Coding</title>
  </head>
  <body>
  <h2>Explain Git Diff</h2>
  <p>${explain}</p>
  </body>
  </html>`;
  }
}
