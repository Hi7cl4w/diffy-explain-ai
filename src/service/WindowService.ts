import { ViewColumn, type WebviewPanel, window } from "vscode";

export default class WindowService {
  static _instance: WindowService;
  panel?: WebviewPanel;
  /**
   * returns instance of the class
   * @returns {WindowService} The instance of the class.
   */
  public static getInstance(): WindowService {
    if (!WindowService._instance) {
      WindowService._instance = new WindowService();
    }
    return WindowService._instance;
  }

  showExplainedResultWebviewPane(explain: string) {
    const content = this.getWebviewContent(explain);
    if (!this.panel) {
      this.createWebviewPanel();
    }
    this.panel!.webview.html = content;
    this.panel!.reveal();
  }

  private createWebviewPanel() {
    this.panel = window.createWebviewPanel("ExplainGitDiff", "Explain Git Diff", ViewColumn.Two, {
      enableScripts: false,
      retainContextWhenHidden: true,
    });
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
