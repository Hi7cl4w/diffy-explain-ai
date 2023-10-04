import * as vscode from "vscode";

const diffyOutputChannel = vscode.window.createOutputChannel("Diffy Commit AI");

export function sendToOutput(message: string) {
  diffyOutputChannel.appendLine(message);
}

export function clearOutput() {
  diffyOutputChannel.clear();
}
