import * as vscode from "vscode";
import { window } from "vscode";
import { clearOutput, sendToOutput } from "../utils/log";
import { CacheService } from "./CacheService";
import WorkspaceService from "./WorkspaceService";

class VsCodeLlmService implements AIService {
  static _instance: VsCodeLlmService;
  cacheService: CacheService;

  private constructor() {
    this.cacheService = CacheService.getInstance();
  }

  /**
   * Returns instance of the class
   * @returns {VsCodeLlmService} The instance of the class.
   */
  public static getInstance(): VsCodeLlmService {
    if (!VsCodeLlmService._instance) {
      VsCodeLlmService._instance = new VsCodeLlmService();
    }
    return VsCodeLlmService._instance;
  }

  /**
   * It takes a git diff as input and returns a commit message as output using VS Code's LLM API
   * @param {string} code - The diff of the files that are being committed.
   * @param {boolean} nameOnly - Whether the diff is name-only
   * @param {vscode.Progress} progress - Optional progress reporter
   * @returns A string or null
   */
  async getCommitMessageFromDiff(
    code: string,
    _nameOnly?: boolean,
    progress?: vscode.Progress<{
      message?: string | undefined;
      increment?: number | undefined;
    }>,
  ): Promise<string | null> {
    const workspaceService = WorkspaceService.getInstance();
    const commitType = workspaceService.getCommitMessageType();
    const includeBody = workspaceService.getIncludeCommitBody();
    const maxLength = workspaceService.getMaxCommitMessageLength();
    const customInstructions = workspaceService.getAIInstructions();

    // Build enhanced prompt based on commit type and settings
    let instructions = "";

    if (commitType === "custom") {
      // Custom user-defined template with placeholder replacement
      const customTemplate = workspaceService.getCustomCommitPrompt();

      // Prepare body instructions based on includeBody setting
      const bodyInstructions = includeBody
        ? "\n- Include a body section with 2-4 bullet points explaining the changes"
        : "";

      // Replace placeholders
      instructions = customTemplate
        .replace(/{maxLength}/g, String(maxLength))
        .replace(/{bodyInstructions}/g, bodyInstructions)
        .replace(/{locale}/g, "en") // Could be made configurable if needed
        .replace(/{diff}/g, ""); // We append diff separately

      // Add custom instructions if provided (unless already in template)
      if (customInstructions && !customTemplate.includes(customInstructions)) {
        instructions += `\n\nADDITIONAL INSTRUCTIONS:\n${customInstructions}`;
      }
    } else if (commitType === "gitmoji") {
      instructions = `You are an expert Git commit message generator that uses Gitmoji (emoji-based commits).

Analyze the provided git diff and generate a commit message following the Gitmoji specification:

FORMAT: <emoji> <type>[optional scope]: <description>

Common Gitmoji mappings:
- ✨ :sparkles: - New feature (feat)
- 🐛 :bug: - Bug fix (fix)
- 📝 :memo: - Documentation (docs)
- 💄 :lipstick: - UI/styling (style)
- ♻️ :recycle: - Code refactoring (refactor)
- ⚡️ :zap: - Performance improvement (perf)
- ✅ :white_check_mark: - Tests (test)
- 🔧 :wrench: - Configuration (chore)
- 🔨 :hammer: - Build/tooling (build)
- 🚀 :rocket: - Deployment (ci)

REQUIREMENTS:
1. Subject line must NOT exceed ${maxLength} characters
2. Use imperative mood (e.g., "add" not "added")
3. Do not end subject with a period
4. Start with the appropriate emoji${
        includeBody
          ? "\n5. Include a body section with 2-4 bullet points explaining key changes"
          : ""
      }

${customInstructions ? `\nADDITIONAL INSTRUCTIONS:\n${customInstructions}\n` : ""}

Return ONLY the commit message, no explanations or surrounding text.`;
    } else {
      // Conventional Commits format
      instructions = `You are an expert Git commit message generator following Conventional Commits specification.

Analyze the provided git diff and generate a commit message following this format:

<type>[optional scope]: <description>
${includeBody ? "\n[optional body]\n" : ""}
[optional footer(s)]

COMMIT TYPES:
- feat: A new feature
- fix: A bug fix
- docs: Documentation only changes
- style: Changes that don't affect code meaning (formatting, missing semicolons, etc.)
- refactor: Code change that neither fixes a bug nor adds a feature
- perf: Code change that improves performance
- test: Adding missing tests or correcting existing tests
- build: Changes to build system or external dependencies
- ci: Changes to CI configuration files and scripts
- chore: Other changes that don't modify src or test files
- revert: Reverts a previous commit

REQUIREMENTS:
1. Subject line must NOT exceed ${maxLength} characters
2. Use imperative mood (e.g., "add" not "added")
3. Do not capitalize first letter after type
4. Do not end subject with a period
5. Choose the most specific scope when applicable (e.g., "auth", "api", "ui")${
        includeBody
          ? "\n6. Include a body section with 2-4 bullet points explaining:\n   - What changed\n   - Why it changed\n   - Any important implementation details"
          : ""
      }

${customInstructions ? `\nADDITIONAL INSTRUCTIONS:\n${customInstructions}\n` : ""}

Return ONLY the commit message, no explanations or surrounding text.`;
    }

    try {
      const response = await this.getFromVsCodeLlm(instructions, code, progress);

      if (response) {
        let message = response.trim();
        message = message.replace(/^"/gm, "");
        message = message.replace(/"$/gm, "");
        return message;
      }
      return null;
    } catch (error) {
      // Re-throw the error so it can be caught by the calling function
      throw error;
    }
  }

  /**
   * It takes a string of code, sends it to VS Code LLM, gets a response, and returns a string of the response.
   * @param {string} string1 - the first parameter (instructions or code context)
   * @param {string} string2 - the second parameter (diff code)
   * @returns The explanation of the git diff.
   */
  async getExplainedChanges(_string1: string, string2: string): Promise<string | null> {
    const instructions =
      "You are a bot that explains the changes from the result of 'git diff --cached' that user given. commit message should be a multiple lines where first line doesn't exceed '50' characters by following commit message guidelines based on the given git diff changes without mentioning itself";

    // Use string2 as the code/diff, string1 is typically instructions but we use our own
    try {
      const response = await this.getFromVsCodeLlm(instructions, string2);

      if (response) {
        let message = response.trim();
        message = message.replace(/^"/gm, "");
        message = message.replace(/"$/gm, "");
        return message;
      }
      return null;
    } catch (error) {
      // Re-throw the error so it can be caught by the calling function
      throw error;
    }
  }

  /**
   * Makes a request to VS Code's Language Model API
   * @param {string} instructions - The system instructions
   * @param {string} prompt - The user prompt
   * @param {vscode.Progress} progress - Optional progress reporter
   * @returns {Promise<string | undefined>}
   */
  private async getFromVsCodeLlm(
    instructions: string,
    prompt: string,
    progress?: vscode.Progress<{
      message?: string | undefined;
      increment?: number | undefined;
    }>,
  ): Promise<string | undefined> {
    const vscodeLmModel = WorkspaceService.getInstance().getVsCodeLmModel();

    // Check cache
    const cacheKey = instructions + prompt;
    const exist = this.cacheService.recordExists(vscodeLmModel, cacheKey);
    if (exist) {
      const result = this.cacheService.get(vscodeLmModel, cacheKey) as string;
      sendToOutput(`result (cached): ${result}`);
      return result;
    }

    try {
      clearOutput();
      sendToOutput(`instructions: ${instructions}`);
      sendToOutput(`git diff prompt: ${prompt}`);
      sendToOutput(`model: ${vscodeLmModel}`);

      // Select the appropriate model based on settings
      let models: vscode.LanguageModelChat[] = [];

      if (vscodeLmModel === "auto") {
        // Try to select the best available model in order of preference
        const preferredFamilies = [
          "gpt-4o",
          "o1",
          "gpt-4",
          "gpt-4-turbo",
          "o1-mini",
          "gpt-3.5-turbo",
          "o1-preview",
          "gpt-3.5",
        ];
        for (const family of preferredFamilies) {
          models = await vscode.lm.selectChatModels({
            vendor: "copilot",
            family: family,
          });
          if (models.length > 0) {
            break;
          }
        }
        // If no specific family models found, try any copilot model
        if (models.length === 0) {
          models = await vscode.lm.selectChatModels({
            vendor: "copilot",
          });
        }
      } else if (vscodeLmModel === "copilot-gpt-4o") {
        models = await vscode.lm.selectChatModels({
          vendor: "copilot",
          family: "gpt-4o",
        });
        if (models.length === 0) {
          // Fallback to any GPT-4 model
          models = await vscode.lm.selectChatModels({
            vendor: "copilot",
            family: "gpt-4",
          });
        }
      } else if (vscodeLmModel === "copilot-gpt-4") {
        models = await vscode.lm.selectChatModels({
          vendor: "copilot",
          family: "gpt-4",
        });
        if (models.length === 0) {
          // Fallback to any available copilot model
          models = await vscode.lm.selectChatModels({
            vendor: "copilot",
          });
        }
      } else if (vscodeLmModel === "copilot-gpt-4-turbo") {
        models = await vscode.lm.selectChatModels({
          vendor: "copilot",
          family: "gpt-4-turbo",
        });
        if (models.length === 0) {
          // Fallback to any GPT-4 model
          models = await vscode.lm.selectChatModels({
            vendor: "copilot",
            family: "gpt-4",
          });
        }
      } else if (vscodeLmModel === "copilot-gpt-3.5-turbo") {
        models = await vscode.lm.selectChatModels({
          vendor: "copilot",
          family: "gpt-3.5-turbo",
        });
        if (models.length === 0) {
          // Fallback to any GPT-3.5 model
          models = await vscode.lm.selectChatModels({
            vendor: "copilot",
            family: "gpt-3.5",
          });
        }
      } else if (vscodeLmModel === "copilot-gpt-3.5") {
        models = await vscode.lm.selectChatModels({
          vendor: "copilot",
          family: "gpt-3.5",
        });
        if (models.length === 0) {
          // Fallback to any available copilot model
          models = await vscode.lm.selectChatModels({
            vendor: "copilot",
          });
        }
      } else if (vscodeLmModel === "copilot-o1") {
        models = await vscode.lm.selectChatModels({
          vendor: "copilot",
          family: "o1",
        });
        if (models.length === 0) {
          // Fallback to any available copilot model
          models = await vscode.lm.selectChatModels({
            vendor: "copilot",
          });
        }
      } else if (vscodeLmModel === "copilot-o1-mini") {
        models = await vscode.lm.selectChatModels({
          vendor: "copilot",
          family: "o1-mini",
        });
        if (models.length === 0) {
          // Fallback to o1
          models = await vscode.lm.selectChatModels({
            vendor: "copilot",
            family: "o1",
          });
        }
      } else if (vscodeLmModel === "copilot-o1-preview") {
        models = await vscode.lm.selectChatModels({
          vendor: "copilot",
          family: "o1-preview",
        });
        if (models.length === 0) {
          // Fallback to o1
          models = await vscode.lm.selectChatModels({
            vendor: "copilot",
            family: "o1",
          });
        }
      } else {
        // Default: try to select any copilot model
        models = await vscode.lm.selectChatModels({
          vendor: "copilot",
        });

        // If still no models available, show a more specific error
        if (models.length === 0) {
          window.showErrorMessage(
            "No GitHub Copilot models available. Please ensure GitHub Copilot is installed, enabled, and you have an active subscription.",
          );
          progress?.report({
            increment: 1,
            message: "\nFailed - No Copilot models available.",
          });
          return undefined;
        }
      }

      if (models.length === 0) {
        window.showErrorMessage(
          "No language models available. Please ensure GitHub Copilot is installed and you are signed in.",
        );
        progress?.report({
          increment: 1,
          message: "\nFailed - No models available.",
        });
        return undefined;
      }

      const [model] = models;
      sendToOutput(`Selected model: ${model.id} (${model.vendor}/${model.family})`);

      progress?.report({ increment: 30 });

      // Prepare messages - try a simpler format that should be more compatible
      const messages = [vscode.LanguageModelChatMessage.User(`${instructions}\n\n${prompt}`)];

      // Send request with minimal options
      const chatResponse = await model.sendRequest(
        messages,
        {},
        new vscode.CancellationTokenSource().token,
      );

      progress?.report({ increment: 40 });

      // Collect the response
      let responseText = "";
      for await (const fragment of chatResponse.text) {
        responseText += fragment;
      }

      sendToOutput(`result success: ${responseText}`);

      // Cache the result
      if (responseText && responseText.length > 6) {
        this.cacheService.set(vscodeLmModel, cacheKey, responseText);
      }

      progress?.report({
        increment: 30,
        message: "\nCommit message generated.",
      });

      await new Promise((f) => setTimeout(f, 200));

      return responseText;
    } catch (error: unknown) {
      console.error(error);
      sendToOutput(`result failed: ${JSON.stringify(error)}`);

      if (error instanceof vscode.LanguageModelError) {
        // Handle specific LLM errors
        let errorMessage = "VS Code Language Model Error: ";

        switch (error.code) {
          case vscode.LanguageModelError.NotFound().code:
            errorMessage += "Model not found. Please ensure GitHub Copilot is installed.";
            break;
          case vscode.LanguageModelError.NoPermissions().code:
            errorMessage +=
              "No permissions to use the language model. Please sign in to GitHub Copilot.";
            break;
          case vscode.LanguageModelError.Blocked().code:
            errorMessage += "Request was blocked. The prompt may violate content policies.";
            break;
          default:
            errorMessage += error.message;
        }

        window.showErrorMessage(errorMessage);
      } else if (error instanceof Error) {
        // Handle the specific "model_not_supported" error
        let isModelNotSupported = false;
        let actualErrorMessage = error.message;

        // Check for model_not_supported in the error message
        if (
          error.message.includes("model_not_supported") ||
          error.message.includes("Model is not supported")
        ) {
          isModelNotSupported = true;
        } else {
          // Try to parse the error message as JSON to check for nested error details
          try {
            // Extract JSON part from the error message if it exists
            const jsonMatch = error.message.match(/\{.*\}/);
            if (jsonMatch) {
              const errorJson = JSON.parse(jsonMatch[0]);
              if (errorJson.error && errorJson.error.code === "model_not_supported") {
                isModelNotSupported = true;
                // Use the actual error message from the LLM
                if (errorJson.error.message) {
                  actualErrorMessage = errorJson.error.message;
                }
              }
            }
          } catch (parseError) {
            // If parsing fails, continue with normal error handling
            console.error("Failed to parse error JSON:", parseError);
          }
        }

        if (isModelNotSupported) {
          window.showErrorMessage(
            `Diffy Error: The selected language model doesn't support this type of request. Try switching to a different model in settings or use OpenAI instead. LLM Error: ${actualErrorMessage}`,
          );
        } else {
          window.showErrorMessage(
            `Diffy Error: Failed to generate commit message. ${error.message}`,
          );
        }
      } else {
        window.showErrorMessage("Diffy Error: Failed to generate commit message. Unknown error");
      }

      progress?.report({
        increment: 1,
        message: "\nFailed.",
      });

      return undefined;
    }
  }
}

export default VsCodeLlmService;
