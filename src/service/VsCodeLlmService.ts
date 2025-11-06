import * as vscode from "vscode";
import { window } from "vscode";
import { cleanAiResponse } from "../utils/aiResponse";
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
    const instructions = workspaceService.getCommitMessageInstructions();

    const response = await this.getFromVsCodeLlm(instructions, code, progress);

    if (response) {
      return cleanAiResponse(response);
    }
    return null;
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
    const response = await this.getFromVsCodeLlm(instructions, string2);

    if (response) {
      return cleanAiResponse(response);
    }
    return null;
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
          "grok-code-fast-1",
          "gpt-5-mini",
          "gpt-4-turbo",
          "gpt-4o",
          "o1",
          "gpt-4",
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
      } else if (vscodeLmModel === "copilot-grok-code-fast-1") {
        models = await vscode.lm.selectChatModels({
          vendor: "copilot",
          family: "grok-code-fast-1",
        });
        if (models.length === 0) {
          // Fallback to any available copilot model
          models = await vscode.lm.selectChatModels({
            vendor: "copilot",
          });
        }
      } else if (vscodeLmModel === "copilot-gpt-5-mini") {
        models = await vscode.lm.selectChatModels({
          vendor: "copilot",
          family: "gpt-5-mini",
        });
        if (models.length === 0) {
          // Fallback to any available copilot model
          models = await vscode.lm.selectChatModels({
            vendor: "copilot",
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
