import * as vscode from "vscode";
import { window } from "vscode";
import { clearOutput, sendToOutput } from "../utils/log";
import { CacheService } from "./CacheService";
import WorkspaceService from "./WorkspaceService";

class VsCodeLlmService implements AIService {
  static _instance: VsCodeLlmService;
  cacheService!: CacheService;

  constructor() {
    if (VsCodeLlmService._instance) {
      return VsCodeLlmService._instance;
    }
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
    nameOnly?: boolean,
    progress?: vscode.Progress<{
      message?: string | undefined;
      increment?: number | undefined;
    }>
  ): Promise<string | null> {
    const instructions = WorkspaceService.getInstance().getAIInstructions();
    if (!instructions) {
      return null;
    }
    
    const response = await this.getFromVsCodeLlm(
      instructions,
      code,
      progress
    );
    
    if (response) {
      let message = response.trim();
      message = message.replace(/^"/gm, "");
      message = message.replace(/"$/gm, "");
      return message;
    }
    return null;
  }

  /**
   * It takes a string of code, sends it to VS Code LLM, gets a response, and returns a string of the response.
   * @param {string} string1 - the first parameter (instructions or code context)
   * @param {string} string2 - the second parameter (diff code)
   * @returns The explanation of the git diff.
   */
  async getExplainedChanges(
    string1: string,
    string2: string
  ): Promise<string | null> {
    const instructions =
      "You are a bot that explains the changes from the result of 'git diff --cached' that user given. commit message should be a multiple lines where first line doesn't exceed '50' characters by following commit message guidelines based on the given git diff changes without mentioning itself";
    
    // Use string2 as the code/diff, string1 is typically instructions but we use our own
    const response = await this.getFromVsCodeLlm(instructions, string2);
    
    if (response) {
      let message = response.trim();
      message = message.replace(/^"/gm, "");
      message = message.replace(/"$/gm, "");
      return message;
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
    }>
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
      
      if (vscodeLmModel === "copilot-gpt-4o") {
        models = await vscode.lm.selectChatModels({
          vendor: "copilot",
          family: "gpt-4o"
        });
      } else if (vscodeLmModel === "copilot-gpt-3.5-turbo") {
        models = await vscode.lm.selectChatModels({
          vendor: "copilot",
          family: "gpt-3.5-turbo"
        });
      } else {
        // Default: try to select any copilot model
        models = await vscode.lm.selectChatModels({
          vendor: "copilot"
        });
      }

      if (models.length === 0) {
        window.showErrorMessage(
          "No language models available. Please ensure GitHub Copilot is installed and you are signed in."
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

      // Prepare messages
      const messages = [
        vscode.LanguageModelChatMessage.User(instructions),
        vscode.LanguageModelChatMessage.User(prompt),
      ];

      // Send request
      const chatResponse = await model.sendRequest(
        messages,
        {},
        new vscode.CancellationTokenSource().token
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
    } catch (error: any) {
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
            errorMessage += "No permissions to use the language model. Please sign in to GitHub Copilot.";
            break;
          case vscode.LanguageModelError.Blocked().code:
            errorMessage += "Request was blocked. The prompt may violate content policies.";
            break;
          default:
            errorMessage += error.message;
        }
        
        window.showErrorMessage(errorMessage);
      } else {
        window.showErrorMessage(
          `Diffy Error: Failed to generate commit message. ${error.message || "Unknown error"}`
        );
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
