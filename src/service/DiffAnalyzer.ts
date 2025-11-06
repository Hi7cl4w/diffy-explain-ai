import { sendToOutput } from "../utils/log";

/**
 * Structured representation of a file change
 */
export interface FileChange {
  path: string;
  status: "added" | "deleted" | "modified" | "renamed";
  changes: {
    added: number;
    deleted: number;
    functions_modified?: string[];
    classes_modified?: string[];
    imports_added?: string[];
    imports_removed?: string[];
    exports_added?: string[];
    exports_removed?: string[];
  };
  summary?: string;
}

/**
 * Overall context about the changeset
 */
export interface DiffContext {
  files: FileChange[];
  overall_context: {
    affected_modules: string[];
    total_files: number;
    total_additions: number;
    total_deletions: number;
    test_files_changed: boolean;
    config_files_changed: boolean;
    breaking_changes: boolean;
  };
}

/**
 * Service for analyzing git diffs with structured metadata extraction
 */
export default class DiffAnalyzer {
  static _instance: DiffAnalyzer;

  private constructor() {}

  public static getInstance(): DiffAnalyzer {
    if (!DiffAnalyzer._instance) {
      DiffAnalyzer._instance = new DiffAnalyzer();
    }
    return DiffAnalyzer._instance;
  }

  /**
   * Parse git diff and extract structured metadata
   * @param diff - Raw git diff string
   * @returns Structured diff context
   */
  async analyzeGitDiff(diff: string): Promise<DiffContext> {
    sendToOutput("Starting structured diff analysis");

    const files: FileChange[] = [];
    const affectedModules = new Set<string>();
    let totalAdditions = 0;
    let totalDeletions = 0;
    let testFilesChanged = false;
    let configFilesChanged = false;

    // Split diff by file sections (starts with "diff --git")
    const fileSections = diff.split(/(?=diff --git)/);

    for (const section of fileSections) {
      if (!section.trim()) {
        continue;
      }

      const fileChange = this.parseFileSection(section);
      if (fileChange) {
        files.push(fileChange);

        // Track totals
        totalAdditions += fileChange.changes.added;
        totalDeletions += fileChange.changes.deleted;

        // Extract module from path
        const module = this.extractModule(fileChange.path);
        if (module) {
          affectedModules.add(module);
        }

        // Check for test files
        if (this.isTestFile(fileChange.path)) {
          testFilesChanged = true;
        }

        // Check for config files
        if (this.isConfigFile(fileChange.path)) {
          configFilesChanged = true;
        }
      }
    }

    const context: DiffContext = {
      files,
      overall_context: {
        affected_modules: Array.from(affectedModules),
        total_files: files.length,
        total_additions: totalAdditions,
        total_deletions: totalDeletions,
        test_files_changed: testFilesChanged,
        config_files_changed: configFilesChanged,
        breaking_changes: this.detectBreakingChanges(files),
      },
    };

    sendToOutput(`Analyzed ${files.length} files: +${totalAdditions} -${totalDeletions}`);

    return context;
  }

  /**
   * Parse a single file section from git diff
   */
  private parseFileSection(section: string): FileChange | null {
    // Extract file path
    const pathMatch = section.match(/diff --git a\/(.+?) b\/(.+)/);
    if (!pathMatch) {
      return null;
    }

    const oldPath = pathMatch[1];
    const newPath = pathMatch[2];

    // Determine status
    let status: FileChange["status"] = "modified";
    if (section.includes("new file mode")) {
      status = "added";
    } else if (section.includes("deleted file mode")) {
      status = "deleted";
    } else if (oldPath !== newPath) {
      status = "renamed";
    }

    // Count additions and deletions
    const lines = section.split("\n");
    let added = 0;
    let deleted = 0;

    for (const line of lines) {
      if (line.startsWith("+") && !line.startsWith("+++")) {
        added++;
      } else if (line.startsWith("-") && !line.startsWith("---")) {
        deleted++;
      }
    }

    // Extract modified functions (simplified regex-based approach)
    const functionsModified = this.extractModifiedFunctions(section);
    const classesModified = this.extractModifiedClasses(section);
    const { importsAdded, importsRemoved } = this.extractImportChanges(section);
    const { exportsAdded, exportsRemoved } = this.extractExportChanges(section);

    const fileChange: FileChange = {
      path: newPath,
      status,
      changes: {
        added,
        deleted,
        functions_modified: functionsModified.length > 0 ? functionsModified : undefined,
        classes_modified: classesModified.length > 0 ? classesModified : undefined,
        imports_added: importsAdded.length > 0 ? importsAdded : undefined,
        imports_removed: importsRemoved.length > 0 ? importsRemoved : undefined,
        exports_added: exportsAdded.length > 0 ? exportsAdded : undefined,
        exports_removed: exportsRemoved.length > 0 ? exportsRemoved : undefined,
      },
    };

    // Generate summary
    fileChange.summary = this.generateFileSummary(fileChange);

    return fileChange;
  }

  /**
   * Extract modified function names from diff
   */
  private extractModifiedFunctions(section: string): string[] {
    const functions = new Set<string>();
    const lines = section.split("\n");

    // Look for function declarations in changed lines
    const functionPatterns = [
      /^[+-].*?\b(?:function|async function)\s+(\w+)/,
      /^[+-].*?\b(\w+)\s*(?:=|:)\s*(?:async\s+)?\([^)]*\)\s*(?:=>|{)/,
      /^[+-].*?\b(?:public|private|protected|static)?\s*(\w+)\s*\([^)]*\)\s*[:{]/,
      /^[+-].*?\bdef\s+(\w+)\s*\(/,
      /^[+-].*?\bfn\s+(\w+)\s*\(/,
      /^[+-].*?\bfunc\s+(\w+)\s*\(/,
    ];

    for (const line of lines) {
      if (line.startsWith("@@")) {
        // Extract function name from hunk header
        const hunkMatch = line.match(/@@.*?@@\s*(.+)/);
        if (hunkMatch) {
          const context = hunkMatch[1];
          const nameMatch = context.match(/(\w+)\s*\(/);
          if (nameMatch) {
            functions.add(nameMatch[1]);
          }
        }
      }

      // Check for function patterns in added/removed lines
      for (const pattern of functionPatterns) {
        const match = line.match(pattern);
        if (match?.[1]) {
          functions.add(match[1]);
        }
      }
    }

    return Array.from(functions).slice(0, 10); // Limit to 10 functions
  }

  /**
   * Extract modified class names from diff
   */
  private extractModifiedClasses(section: string): string[] {
    const classes = new Set<string>();
    const lines = section.split("\n");

    const classPatterns = [
      /^[+-].*?\bclass\s+(\w+)/,
      /^[+-].*?\binterface\s+(\w+)/,
      /^[+-].*?\btype\s+(\w+)\s*=/,
      /^[+-].*?\bstruct\s+(\w+)/,
      /^[+-].*?\benum\s+(\w+)/,
    ];

    for (const line of lines) {
      for (const pattern of classPatterns) {
        const match = line.match(pattern);
        if (match?.[1]) {
          classes.add(match[1]);
        }
      }
    }

    return Array.from(classes).slice(0, 5); // Limit to 5 classes
  }

  /**
   * Extract import changes from diff
   */
  private extractImportChanges(section: string): {
    importsAdded: string[];
    importsRemoved: string[];
  } {
    const added = new Set<string>();
    const removed = new Set<string>();
    const lines = section.split("\n");

    const importPatterns = [
      /^[+-].*?import\s+(?:{[^}]+}|\w+|\*)\s+from\s+['"]([^'"]+)['"]/,
      /^[+-].*?import\s+['"]([^'"]+)['"]/,
      /^[+-].*?require\s*\(\s*['"]([^'"]+)['"]\s*\)/,
      /^[+-].*?use\s+([^;]+)/,
    ];

    for (const line of lines) {
      for (const pattern of importPatterns) {
        const match = line.match(pattern);
        if (match?.[1]) {
          const module = match[1].split("/")[0]; // Get base module name
          if (line.startsWith("+")) {
            added.add(module);
          } else if (line.startsWith("-")) {
            removed.add(module);
          }
        }
      }
    }

    return {
      importsAdded: Array.from(added).slice(0, 8),
      importsRemoved: Array.from(removed).slice(0, 8),
    };
  }

  /**
   * Extract export changes from diff
   */
  private extractExportChanges(section: string): {
    exportsAdded: string[];
    exportsRemoved: string[];
  } {
    const added = new Set<string>();
    const removed = new Set<string>();
    const lines = section.split("\n");

    const exportPatterns = [
      /^[+-].*?export\s+(?:default\s+)?(?:class|function|const|let|var|interface|type)\s+(\w+)/,
      /^[+-].*?export\s+{([^}]+)}/,
      /^[+-].*?module\.exports\s*=\s*{?([^};]+)/,
    ];

    for (const line of lines) {
      for (const pattern of exportPatterns) {
        const match = line.match(pattern);
        if (match?.[1]) {
          const exports = match[1].split(",").map((e) => e.trim().split(/\s+/)[0]);
          for (const exp of exports) {
            if (exp && exp.length > 0) {
              if (line.startsWith("+")) {
                added.add(exp);
              } else if (line.startsWith("-")) {
                removed.add(exp);
              }
            }
          }
        }
      }
    }

    return {
      exportsAdded: Array.from(added).slice(0, 8),
      exportsRemoved: Array.from(removed).slice(0, 8),
    };
  }

  /**
   * Generate a human-readable summary for a file change
   */
  private generateFileSummary(file: FileChange): string {
    const parts: string[] = [];

    if (file.status === "added") {
      parts.push("New file");
    } else if (file.status === "deleted") {
      parts.push("Deleted file");
    } else if (file.status === "renamed") {
      parts.push("Renamed file");
    }

    if (file.changes.functions_modified && file.changes.functions_modified.length > 0) {
      parts.push(`Modified ${file.changes.functions_modified.length} function(s)`);
    }

    if (file.changes.classes_modified && file.changes.classes_modified.length > 0) {
      parts.push(`Modified ${file.changes.classes_modified.length} class(es)`);
    }

    if (file.changes.imports_added && file.changes.imports_added.length > 0) {
      parts.push(`Added imports: ${file.changes.imports_added.join(", ")}`);
    }

    if (file.changes.added > 0 || file.changes.deleted > 0) {
      parts.push(`+${file.changes.added} -${file.changes.deleted} lines`);
    }

    return parts.length > 0 ? parts.join("; ") : "Minor changes";
  }

  /**
   * Extract module name from file path
   */
  private extractModule(path: string): string | null {
    // Extract first directory after src/ or similar
    const match = path.match(/(?:src|lib|app|components)\/([^/]+)/);
    return match ? match[1] : null;
  }

  /**
   * Check if file is a test file
   */
  private isTestFile(path: string): boolean {
    return /\.(test|spec)\.(ts|js|tsx|jsx|py|rs|go)$/.test(path) || path.includes("/__tests__/");
  }

  /**
   * Check if file is a config file
   */
  private isConfigFile(path: string): boolean {
    const configFiles = [
      "package.json",
      "tsconfig.json",
      "webpack.config",
      "vite.config",
      "jest.config",
      ".eslintrc",
      ".prettierrc",
      "Cargo.toml",
      "go.mod",
      "pyproject.toml",
    ];
    return configFiles.some((config) => path.includes(config));
  }

  /**
   * Detect if changes might be breaking changes
   */
  private detectBreakingChanges(files: FileChange[]): boolean {
    for (const file of files) {
      // Check for removed exports
      if (file.changes.exports_removed && file.changes.exports_removed.length > 0) {
        return true;
      }

      // Check for deleted public files (not test files)
      if (file.status === "deleted" && !this.isTestFile(file.path)) {
        return true;
      }

      // Large deletions might indicate breaking changes
      if (file.changes.deleted > 50 && file.changes.deleted > file.changes.added * 2) {
        return true;
      }
    }

    return false;
  }

  /**
   * Format diff context as structured JSON string
   */
  formatAsStructured(context: DiffContext): string {
    return JSON.stringify(context, null, 2);
  }

  /**
   * Format diff context as compact string for AI
   */
  formatAsCompact(context: DiffContext): string {
    const parts: string[] = [];

    // Overall summary
    parts.push(
      `CHANGES: ${context.overall_context.total_files} files (+${context.overall_context.total_additions} -${context.overall_context.total_deletions})`,
    );

    // Affected modules
    if (context.overall_context.affected_modules.length > 0) {
      parts.push(`Modules: ${context.overall_context.affected_modules.join(", ")}`);
    }

    // File summaries (top 5 most significant)
    const sortedFiles = context.files
      .slice()
      .sort((a, b) => b.changes.added + b.changes.deleted - (a.changes.added + a.changes.deleted))
      .slice(0, 5);

    for (const file of sortedFiles) {
      const fileName = file.path.split("/").pop();
      const details: string[] = [];

      if (file.changes.functions_modified && file.changes.functions_modified.length > 0) {
        details.push(`funcs: ${file.changes.functions_modified.slice(0, 3).join(",")}`);
      }

      if (file.changes.imports_added && file.changes.imports_added.length > 0) {
        details.push(`+imports: ${file.changes.imports_added.slice(0, 3).join(",")}`);
      }

      parts.push(`${fileName} (${file.status}): ${details.join(" | ") || file.summary}`);
    }

    // Flags
    const flags: string[] = [];
    if (context.overall_context.test_files_changed) {
      flags.push("tests");
    }
    if (context.overall_context.config_files_changed) {
      flags.push("config");
    }
    if (context.overall_context.breaking_changes) {
      flags.push("BREAKING");
    }

    if (flags.length > 0) {
      parts.push(`Flags: ${flags.join(", ")}`);
    }

    return parts.join(" | ");
  }
}
