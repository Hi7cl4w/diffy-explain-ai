import { GoogleGenAI } from "@google/genai";
import type * as vscode from "vscode";
import { window } from "vscode";
import { clearOutput, sendToOutput } from "../utils/log";
import { CacheService } from "./CacheService";
import WorkspaceService from "./WorkspaceService";

export interface GeminiErrorResponse {
  status?: boolean;
  error?: Error;
}

export interface Error {
  message?: string;
  type?: string;
}

class GeminiService implements AIService {
  static _instance: GeminiService;
  cacheService: CacheService;

  private constructor() {
    this.cacheService = CacheService.getInstance();
  }

  public static getInstance(): GeminiService {
    if (!GeminiService._instance) {
      GeminiService._instance = new GeminiService();
    }
    return GeminiService._instance;
  }

  async getCommitMessageFromDiff(
    code: string,
    geminiKey: string,
    _nameOnly?: boolean,
    progress?: vscode.Progress<{
      message?: string | undefined;
      increment?: number | undefined;
    }>,
  ): Promise<string | null> {
    const instructions = WorkspaceService.getInstance().getAdditionalInstructions();
    if (!instructions) {
      return null;
    }
    const response = await this.getFromGemini(instructions, code, geminiKey, progress);
    if (response) {
      let message = String(response);
      message = message.trim();
      message = message.replace(/^"/gm, "");
      message = message.replace(/"$/gm, "");
      return message;
    }
    return null;
  }

  async getExplainedChanges(code: string, geminiKey?: string, nameOnly?: boolean) {
    let gitCmd = "git diff --cached";
    if (nameOnly) {
      gitCmd = "git diff --cached --name-status";
    }
    const instructions =
      "You are a bot explains the changes from the result of '" +
      gitCmd +
      "' that user given. commit message should be a multiple lines where first line doesn't exceeds '50' characters by following commit message guidelines based on the given git diff changes without mentioning itself";
    const response = await this.getFromGemini(instructions, code, geminiKey);
    if (response) {
      let message = String(response);
      message = message.trim();
      message = message.replace(/^"/gm, "");
      message = message.replace(/"$/gm, "");
      return message;
    }
    return null;
  }

  private async getFromGemini(
    instructions: string,
    prompt: string,
    geminiKey?: string,
    progress?: vscode.Progress<{
      message?: string | undefined;
      increment?: number | undefined;
    }>,
  ) {
    if (!geminiKey) {
      return undefined;
    }

    const geminiClient = new GoogleGenAI({ apiKey: geminiKey });
    const model = WorkspaceService.getInstance().getGeminiModel();
    const exist = this.cacheService.recordExists(model, instructions + prompt);

    if (exist) {
      const result = this.cacheService.get(model, instructions + prompt) as string;
      sendToOutput(`result: ${JSON.stringify(result)}`);
      return result;
    }

    progress?.report({ increment: 50 });

    clearOutput();
    sendToOutput(`instructions: ${instructions}`);
    sendToOutput(`git diff prompt: ${prompt}`);
    sendToOutput(`model: ${model}`);
    sendToOutput(`temperature: ${WorkspaceService.getInstance().getTemp()}`);
    sendToOutput(`max_tokens: ${WorkspaceService.getInstance().getMaxTokens()}`);

    let response: string | undefined;
    try {
      const result = await geminiClient.models.generateContent({
        model: model,
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `${instructions}\n\n${prompt}`,
              },
            ],
          },
        ],
        config: {
          temperature: WorkspaceService.getInstance().getTemp(),
          maxOutputTokens: WorkspaceService.getInstance().getMaxTokens(),
        },
      });

      response = result.text;
      sendToOutput(`result success: ${JSON.stringify(response)}`);
      progress?.report({ increment: 49 });
    } catch (reason: unknown) {
      console.error(reason);
      sendToOutput(`result failed: ${JSON.stringify(reason)}`);

      const hasResponse = (
        err: unknown,
      ): err is {
        response?: {
          statusText?: string;
          status?: number;
          data?: { error?: { message?: string; type?: string } };
        };
      } => {
        return typeof err === "object" && err !== null && "response" in err;
      };

      if (typeof reason === "string" || reason instanceof String) {
        window.showErrorMessage(`Gemini Error: ${reason} `);
        return undefined;
      }

      if (hasResponse(reason)) {
        if (reason.response?.statusText) {
          window.showErrorMessage(
            `Gemini Error: ${reason.response?.data?.error?.message || reason.response.statusText} `,
          );
        } else {
          window.showErrorMessage("Gemini Error");
        }

        if (reason.response?.status && geminiKey) {
          if (reason.response.status === 429) {
            window.showInformationMessage(
              "Caution: In case the API key has expired, please remove it from the extension settings.",
            );
          }
        }

        if (reason.response?.data?.error?.type === "invalid_request_error") {
          window.showErrorMessage(
            "Diffy Error: There was an issue. Server is experiencing downtime/busy. Please try again later.",
          );
          progress?.report({
            increment: 1,
            message: "\nFailed.",
          });
        } else if (reason.response?.data?.error?.message) {
          window.showErrorMessage(`Diffy Error: ${reason.response.data.error.message}`);
          progress?.report({
            increment: 1,
            message: "\nFailed.",
          });
        }
      } else {
        window.showErrorMessage("Gemini Error");
      }

      return undefined;
    }

    if (response && response !== "" && response !== "\n") {
      if (response.length > 6) {
        this.cacheService.set(model, instructions + prompt, response);
      }
      progress?.report({
        increment: 1,
        message: "\nCommit message generated.",
      });
      await new Promise((f) => setTimeout(f, 200));
      return response;
    }
    return undefined;
  }
}

export default GeminiService;
