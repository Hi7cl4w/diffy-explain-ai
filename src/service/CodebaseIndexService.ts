import { countTokens } from "gpt-tokenizer";
import * as vscode from "vscode";
import { sendToOutput } from "../utils/log";
import WorkspaceService from "./WorkspaceService";

interface IndexedFileContent {
  file: string;
  content: string;
  tokens: number;
  lastModified: number;
}

interface FileTypeAnalyzer {
  pattern: RegExp;
  analyze: (content: string, fileName: string) => string;
  priority: number; // Higher priority = indexed first
}

/**
 * Service for indexing codebase files to provide context to AI models
 * Implements smart file detection, semantic extraction, and caching
 */
export default class CodebaseIndexService {
  static _instance: CodebaseIndexService;
  private readonly KB_TO_BYTES = 1024;
  private cache: Map<string, IndexedFileContent> = new Map();
  private fileAnalyzers: FileTypeAnalyzer[] = [];

  private constructor() {
    this.initializeAnalyzers();
  }

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
   * Initialize file type analyzers for semantic content extraction
   * Optimized for minimal token usage while preserving essential information
   */
  private initializeAnalyzers(): void {
    this.fileAnalyzers = [
      // package.json analyzer - ultra-compact extraction
      {
        pattern: /package\.json$/,
        priority: 10,
        analyze: (content: string) => {
          try {
            const pkg = JSON.parse(content);
            const parts: string[] = [];

            // Only include name if it's meaningful
            if (pkg.name && !pkg.name.startsWith("@")) {
              parts.push(`Project: ${pkg.name}`);
            }

            // Extract only key dependencies (not versions)
            const deps: string[] = [];
            if (pkg.dependencies) {
              const keyDeps = Object.keys(pkg.dependencies).filter(
                (d) => !d.includes("types") && !d.includes("eslint") && !d.includes("prettier"),
              );
              deps.push(...keyDeps.slice(0, 10)); // Max 10 deps
            }

            if (deps.length > 0) {
              parts.push(`Tech: ${deps.join(", ")}`);
            }

            // Extract only critical scripts
            if (pkg.scripts) {
              const criticalScripts = ["build", "dev", "start", "test"];
              const hasScripts = criticalScripts.filter((s) => pkg.scripts[s]);
              if (hasScripts.length > 0) {
                parts.push(`Scripts: ${hasScripts.join(", ")}`);
              }
            }

            return parts.length > 0 ? parts.join(" | ") : "";
          } catch {
            return "";
          }
        },
      },

      // TypeScript/JavaScript config - minimal extraction
      {
        pattern: /tsconfig.*\.json$|jsconfig.*\.json$/,
        priority: 7,
        analyze: (content: string) => {
          try {
            const config = JSON.parse(content);
            const parts: string[] = [];

            if (config.compilerOptions?.target) {
              parts.push(`TS Target: ${config.compilerOptions.target}`);
            }
            if (config.compilerOptions?.module) {
              parts.push(`Module: ${config.compilerOptions.module}`);
            }

            return parts.join(" | ");
          } catch {
            return "";
          }
        },
      },

      // README - extract only title and description
      {
        pattern: /^README\.md$/i,
        priority: 6,
        analyze: (content: string) => {
          const lines = content.split("\n").filter((l) => l.trim());
          const summary: string[] = [];

          // Extract first heading and first paragraph only
          for (let i = 0; i < Math.min(lines.length, 5); i++) {
            const line = lines[i].trim();
            if (line.startsWith("#")) {
              summary.push(line.replace(/^#+\s*/, ""));
            } else if (line && !line.startsWith("!") && !line.startsWith("[")) {
              summary.push(line);
              break; // Only first meaningful line
            }
          }

          return summary.join(": ").substring(0, 150); // Max 150 chars
        },
      },

      // Cargo.toml - package info only
      {
        pattern: /Cargo\.toml$/,
        priority: 5,
        analyze: (content: string) => {
          const nameMatch = content.match(/name\s*=\s*"([^"]+)"/);
          const versionMatch = content.match(/version\s*=\s*"([^"]+)"/);
          return nameMatch
            ? `Rust: ${nameMatch[1]}${versionMatch ? ` v${versionMatch[1]}` : ""}`
            : "Rust Project";
        },
      },

      // Go modules
      {
        pattern: /go\.mod$/,
        priority: 5,
        analyze: (content: string) => {
          const moduleMatch = content.match(/module\s+([^\s]+)/);
          return moduleMatch ? `Go: ${moduleMatch[1]}` : "Go Project";
        },
      },

      // Python requirements - dependencies only
      {
        pattern: /requirements\.txt$/,
        priority: 4,
        analyze: (content: string) => {
          const lines = content
            .split("\n")
            .filter((l) => l.trim() && !l.startsWith("#"))
            .map((l) => l.split(/[=<>~]/)[0].trim())
            .slice(0, 8);
          return lines.length > 0 ? `Python deps: ${lines.join(", ")}` : "";
        },
      },

      // pyproject.toml
      {
        pattern: /pyproject\.toml$/,
        priority: 5,
        analyze: (content: string) => {
          const nameMatch = content.match(/name\s*=\s*"([^"]+)"/);
          return nameMatch ? `Python: ${nameMatch[1]}` : "Python Project";
        },
      },

      // Skip all other files - too verbose
      {
        pattern: /.*/,
        priority: 1,
        analyze: () => "",
      },
    ];
  }

  /**
   * Analyze file content using appropriate analyzer
   */
  private analyzeFile(fileName: string, content: string): string {
    // Find the highest priority matching analyzer
    const analyzer = this.fileAnalyzers
      .filter((a) => a.pattern.test(fileName))
      .sort((a, b) => b.priority - a.priority)[0];

    if (analyzer) {
      return analyzer.analyze(content, fileName);
    }

    return `## ${fileName}\n\n\`\`\`\n${content}\n\`\`\``;
  }

  /**
   * Auto-detect important project files based on patterns
   */
  private async autoDetectProjectFiles(workspaceFolder: vscode.WorkspaceFolder): Promise<string[]> {
    const patterns = [
      "package.json",
      "package-lock.json",
      "yarn.lock",
      "pnpm-lock.yaml",
      "tsconfig.json",
      "jsconfig.json",
      "README.md",
      "readme.md",
      "Cargo.toml",
      "go.mod",
      "go.sum",
      "pom.xml",
      "build.gradle",
      "build.gradle.kts",
      "pyproject.toml",
      "setup.py",
      "requirements.txt",
      "composer.json",
      ".eslintrc.json",
      ".prettierrc",
      "vite.config.ts",
      "vite.config.js",
      "webpack.config.js",
      "next.config.js",
    ];

    const foundFiles: string[] = [];

    for (const pattern of patterns) {
      try {
        const fileUri = vscode.Uri.joinPath(workspaceFolder.uri, pattern);
        await vscode.workspace.fs.stat(fileUri);
        foundFiles.push(pattern);
      } catch {
        // File doesn't exist, skip
      }
    }

    return foundFiles;
  }

  /**
   * Check if a file needs re-indexing based on modification time
   */
  private async needsReindexing(fileUri: vscode.Uri, filePath: string): Promise<boolean> {
    const cached = this.cache.get(filePath);
    if (!cached) {
      return true;
    }

    try {
      const stat = await vscode.workspace.fs.stat(fileUri);
      return stat.mtime > cached.lastModified;
    } catch {
      return true;
    }
  }

  /**
   * Get codebase context by reading and indexing specified files
   * Implements smart file detection, caching, and semantic extraction
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

    let indexedFiles = workspaceService.getIndexedFiles();
    const maxFileSizeKB = workspaceService.getMaxIndexedFileSize();
    const maxFileSizeBytes = maxFileSizeKB * this.KB_TO_BYTES;
    const maxTotalTokens = workspaceService.getCodebaseContextTokenBudget();

    // Auto-detect project files if indexedFiles is empty or includes "auto"
    if (!indexedFiles || indexedFiles.length === 0 || indexedFiles.includes("auto")) {
      const autoDetected = await this.autoDetectProjectFiles(workspaceFolder);
      sendToOutput(
        `Auto-detected ${autoDetected.length} project files: ${autoDetected.join(", ")}`,
      );
      indexedFiles = autoDetected;
    }

    if (indexedFiles.length === 0) {
      sendToOutput("No files configured for indexing");
      return null;
    }

    sendToOutput(`Starting smart codebase indexing with max file size: ${maxFileSizeKB}KB`);
    sendToOutput(`Files to index: ${indexedFiles.join(", ")}`);

    const indexedContent: IndexedFileContent[] = [];
    let totalTokens = 0;

    // Sort files by priority (using analyzer priority)
    const filePriorityMap = new Map<string, number>();
    for (const filePattern of indexedFiles) {
      const analyzer = this.fileAnalyzers
        .filter((a) => a.pattern.test(filePattern))
        .sort((a, b) => b.priority - a.priority)[0];
      filePriorityMap.set(filePattern, analyzer?.priority || 0);
    }

    const sortedFiles = indexedFiles.sort(
      (a, b) => (filePriorityMap.get(b) || 0) - (filePriorityMap.get(a) || 0),
    );

    for (const filePattern of sortedFiles) {
      try {
        // Support glob patterns
        const fileUri = vscode.Uri.joinPath(workspaceFolder.uri, filePattern);

        // Check if we need to re-index this file
        const needsUpdate = await this.needsReindexing(fileUri, filePattern);

        if (!needsUpdate) {
          const cached = this.cache.get(filePattern);
          if (cached && totalTokens + cached.tokens <= maxTotalTokens) {
            indexedContent.push(cached);
            totalTokens += cached.tokens;
            sendToOutput(`Using cached ${filePattern}: ${cached.tokens} tokens`);
            continue;
          }
        }

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
          const rawContent = Buffer.from(fileContent).toString("utf8");

          // Analyze and extract relevant content
          const analyzedContent = this.analyzeFile(filePattern, rawContent);

          // Count tokens of analyzed content
          const tokenCount = countTokens(analyzedContent);

          // Check if adding this file would exceed total token budget
          if (totalTokens + tokenCount > maxTotalTokens) {
            sendToOutput(
              `Skipping ${filePattern}: would exceed total token budget (${
                totalTokens + tokenCount
              } > ${maxTotalTokens})`,
            );
            continue;
          }

          const indexedItem: IndexedFileContent = {
            file: filePattern,
            content: analyzedContent,
            tokens: tokenCount,
            lastModified: fileStat.mtime,
          };

          indexedContent.push(indexedItem);
          this.cache.set(filePattern, indexedItem);

          totalTokens += tokenCount;
          sendToOutput(`Indexed ${filePattern}: ${tokenCount} tokens (analyzed)`);
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

    // Get the indexing strategy
    const strategy = workspaceService.getCodebaseIndexingStrategy();

    let formattedContext: string;

    switch (strategy) {
      case "compact": {
        // Ultra-compact context format - minimal tokens
        const contextLines = indexedContent
          .map((item) => item.content)
          .filter((c) => c.trim().length > 0);
        formattedContext = `PROJECT: ${contextLines.join(" • ")}`;
        break;
      }

      case "structured": {
        // Structured JSON format with detailed metadata
        const structuredData = {
          project_files: indexedContent.map((item) => ({
            file: item.file,
            content_summary: item.content,
            tokens: item.tokens,
          })),
          metadata: {
            total_files: indexedContent.length,
            total_tokens: totalTokens,
            strategy: "structured",
          },
        };
        formattedContext = `CODEBASE CONTEXT (Structured):\n${JSON.stringify(structuredData, null, 2)}`;
        break;
      }

      case "ast-based": {
        // AST-based analysis with semantic understanding
        // For now, use enhanced compact format with more semantic info
        // TODO: Implement full AST parsing with tree-sitter
        const astLines = indexedContent.map((item) => {
          return `${item.file}: ${item.content} [${item.tokens} tokens]`;
        });
        formattedContext = `CODEBASE (AST-Enhanced):\n${astLines.join("\n")}`;
        sendToOutput("AST-based indexing: Full implementation pending. Using enhanced format.");
        break;
      }

      default:
        formattedContext = `PROJECT: ${indexedContent.map((i) => i.content).join(" • ")}`;
    }

    sendToOutput(
      `Indexed [${strategy}]: ${indexedContent.length} files, ${totalTokens} tokens (${this.cache.size} cached)`,
    );

    return formattedContext;
  }

  /**
   * Clear the indexing cache
   */
  public clearCache(): void {
    this.cache.clear();
    sendToOutput("Codebase index cache cleared");
  }
}
