import { countTokens } from "gpt-tokenizer";
import * as vscode from "vscode";
import { sendToOutput } from "../utils/log";
import WorkspaceService from "./WorkspaceService";

/**
 * Service for indexing codebase files to provide context to AI models
 */
export default class CodebaseIndexService {
  static _instance: CodebaseIndexService;
  private readonly MAX_TOTAL_TOKENS = 5000; // Maximum tokens for all indexed files combined
  private readonly KB_TO_BYTES = 1024;

  private constructor() {}

  /**
   * Returns instance of the class
   * @returns {CodebaseIndexService} The instance of the class.
   */
  public static getInstance(): CodebaseIndexService {
    if (!CodebaseIndexService._instance) {
      CodebaseIndexService._instance = new CodebaseIndexService();
    }
    return CodebaseIndexService._instance;
  }

  /**
   * Get codebase context by reading and indexing specified files
   * @returns {Promise<string | null>} Formatted context string or null if disabled/error
   */
  async getCodebaseContext(): Promise<string | null> {
    const workspaceService = WorkspaceService.getInstance();

    // Check if codebase indexing is enabled
    if (!workspaceService.getEnableCodebaseContext()) {
      return null;
    }

    const workspaceFolder = workspaceService.getCurrentWorkspace();
    if (!workspaceFolder) {
      sendToOutput("No workspace folder found for codebase indexing");
      return null;
    }

    const indexedFiles = workspaceService.getIndexedFiles();
    const maxFileSizeKB = workspaceService.getMaxIndexedFileSize();
    const maxFileSizeBytes = maxFileSizeKB * this.KB_TO_BYTES;

    if (!indexedFiles || indexedFiles.length === 0) {
      sendToOutput("No files configured for indexing");
      return null;
    }

    sendToOutput(`Starting codebase indexing with max file size: ${maxFileSizeKB}KB`);
    sendToOutput(`Files to index: ${indexedFiles.join(", ")}`);

    const indexedContent: Array<{
      file: string;
      content: string;
      tokens: number;
    }> = [];
    let totalTokens = 0;

    for (const filePattern of indexedFiles) {
      try {
        const fileUri = vscode.Uri.joinPath(workspaceFolder.uri, filePattern);

        // Check if file exists
        try {
          const fileStat = await vscode.workspace.fs.stat(fileUri);

          // Skip if file is too large
          if (fileStat.size > maxFileSizeBytes) {
            sendToOutput(
              `Skipping ${filePattern}: file size ${(fileStat.size / this.KB_TO_BYTES).toFixed(
                1,
              )}KB exceeds limit of ${maxFileSizeKB}KB`,
            );
            continue;
          }

          // Read file content
          const fileContent = await vscode.workspace.fs.readFile(fileUri);
          const content = Buffer.from(fileContent).toString("utf8");

          // Count tokens
          const tokenCount = countTokens(content);

          // Check if adding this file would exceed total token budget
          if (totalTokens + tokenCount > this.MAX_TOTAL_TOKENS) {
            sendToOutput(
              `Skipping ${filePattern}: would exceed total token budget (${
                totalTokens + tokenCount
              } > ${this.MAX_TOTAL_TOKENS})`,
            );
            continue;
          }

          indexedContent.push({
            file: filePattern,
            content: content.trim(),
            tokens: tokenCount,
          });

          totalTokens += tokenCount;
          sendToOutput(`Indexed ${filePattern}: ${tokenCount} tokens`);
        } catch {
          // File doesn't exist, skip silently
          sendToOutput(`File not found: ${filePattern}`);
        }
      } catch (error) {
        sendToOutput(`Error reading ${filePattern}: ${error}`);
      }
    }

    if (indexedContent.length === 0) {
      sendToOutput("No files were successfully indexed");
      return null;
    }

    // Format the context for AI
    const contextParts = indexedContent.map(
      (item) => `### ${item.file}\n\`\`\`\n${item.content}\n\`\`\``,
    );

    const formattedContext = `
## PROJECT CONTEXT (${totalTokens} tokens from ${indexedContent.length} files)

The following files provide context about the project structure and dependencies:

${contextParts.join("\n\n")}

Use this context to understand the project's technology stack, dependencies, and architecture when generating commit messages.
`.trim();

    sendToOutput(
      `Codebase indexing complete: ${indexedContent.length} files, ${totalTokens} total tokens`,
    );

    return formattedContext;
  }
}
