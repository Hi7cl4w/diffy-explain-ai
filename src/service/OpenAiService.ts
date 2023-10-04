/* eslint-disable @typescript-eslint/naming-convention */
import OpenAI from "openai";
import * as vscode from "vscode";
import { window } from "vscode";
import { clearOutput, sendToOutput } from "../utils/log";
import { CacheService } from "./CacheService";
import WorkspaceService from "./WorkspaceService";

export interface OpenAIErrorResponse {
  status?: boolean;
  error?: Error;
}

export interface Error {
  message?: string;
  type?: string;
}

class OpenAiService implements AIService {
  static _instance: OpenAiService;
  cacheService!: CacheService;

  constructor() {
    if (OpenAiService._instance) {
      return OpenAiService._instance;
    }
    this.cacheService = CacheService.getInstance();
  }

  /**
   * returns instance of the class
   * @returns {OpenAiService} The instance of the class.
   */
  public static getInstance(): OpenAiService {
    if (!OpenAiService._instance) {
      OpenAiService._instance = new OpenAiService();
    }
    return OpenAiService._instance;
  }

  /**
   * It takes a git diff as input and returns a commit message as output
   * @param {string} openAIKey - string - This is the API key for OpenAI.
   * @param {string} code - The diff of the files that are being committed.
   * @returns A string
   */
  async getCommitMessageFromDiff(
    code: string,
    openAIKey: string,
    nameOnly?: boolean,
    progress?: vscode.Progress<{
      message?: string | undefined;
      increment?: number | undefined;
    }>
  ): Promise<string | null> {
    let gitCmd = "git diff --cached";
    if (nameOnly) {
      gitCmd = "git diff --cached --name-status";
    }
    const instructions = WorkspaceService.getInstance().getAIInstructions();
    if (!instructions) {
      return null;
    }
    let response = await this.getFromOpenApi(
      instructions,
      code,
      openAIKey,
      progress
    );
    if (
      response &&
      response.choices.length > 0 &&
      response.choices[0].message
    ) {
      let message = String(response?.choices[0].message.content);
      message = message.trim();
      message = message.replace(/^\"/gm, "");
      message = message.replace(/\"$/gm, "");
      return message;
    }
    return null;
  }

  /**
   * It takes a string of code, sends it to a server, gets a response, and returns a string of the
   * response.
   * @param {string} code - the git diff you want to get the explanation for
   * @returns The explanation of the git diff.
   */
  async getExplainedChanges(
    code: string,
    openAIKey?: string,
    nameOnly?: boolean
  ) {
    let gitCmd = "git diff --cached";
    if (nameOnly) {
      gitCmd = "git diff --cached --name-status";
    }
    const instructions =
      "You are a bot explains the changes from the result of '" +
      gitCmd +
      "' that user given. commit message should be a multiple lines where first line doesn't exceeds '50' characters by following commit message guidelines based on the given git diff changes without mentioning itself";
    let response = await this.getFromOpenApi(instructions, code, openAIKey);
    if (
      response &&
      response.choices.length > 0 &&
      response.choices[0].message
    ) {
      let message = String(response?.choices[0].message.content);
      message = message.trim();
      message = message.replace(/^\"/gm, "");
      message = message.replace(/\"$/gm, "");
      return message;
    }
    return null;
  }

  /**
   * It takes a string of code, and returns a string of code that explains the original code
   * @param {string} openAIKey - The code snippet you want to explain.
   * @param {string} prompt - The code snippet you want to explain.
   * @returns {Promise<CreateCompletionResponse> | undefined}.
   */
  private async getFromOpenApi(
    instructions: string,
    prompt: string,
    openAIKey?: string,
    progress?: vscode.Progress<{
      message?: string | undefined;
      increment?: number | undefined;
    }>
  ) {
    const openAiClient = new OpenAI({ apiKey: openAIKey });
    const model = WorkspaceService.getInstance().getGptModel();
    const exist = this.cacheService.recordExists(model, instructions + prompt);
    if (exist) {
      const result = this.cacheService.get(
        model,
        instructions + prompt
      ) as OpenAI.Chat.Completions.ChatCompletion;
      sendToOutput(`result: ${JSON.stringify(result)}`);
      return result;
    }
    if (!openAIKey) {
      return undefined;
    } else {
      openAiClient.apiKey = openAIKey;
      const proxyUrl = WorkspaceService.getInstance().getProxyUrl();
      if (proxyUrl) {
        openAiClient.baseURL = proxyUrl;
      } else {
        openAiClient.baseURL = "https://api.openai.com/v1";
      }
    }
    progress?.report({ increment: 50 });
    const params: OpenAI.Chat.ChatCompletionCreateParams = {
      messages: [
        {
          role: "system",
          content: instructions,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: model,
      temperature: WorkspaceService.getInstance().getTemp(),
      max_tokens: WorkspaceService.getInstance().getMaxTokens(),
    };
    clearOutput();
    sendToOutput(`instructions: ${instructions}`);
    sendToOutput(`git diff prompt: ${prompt}`);
    sendToOutput(`base url: ${openAiClient.baseURL}`);
    sendToOutput(`model: ${params.model}`);
    sendToOutput(`max_tokens: ${params.max_tokens}`);
    sendToOutput(`temperature: ${params.temperature}`);
    const response = await openAiClient.chat.completions
      .create(params)
      .then((value) => {
        sendToOutput(`result success: ${JSON.stringify(value)}`);
        progress?.report({ increment: 49 });
        return value;
      })
      .catch(async (reason) => {
        console.error(reason.response);
        sendToOutput(`result failed: ${JSON.stringify(reason)}`);
        if (typeof reason === "string" || reason instanceof String) {
          window.showErrorMessage(`OpenAI Error: ${reason} `);
          return undefined;
        }
        if (reason.response?.statusText) {
          window.showErrorMessage(
            `OpenAI Error: ${
              reason.response?.data.error?.message || reason.response.statusText
            } `
          );
        } else {
          window.showErrorMessage(`OpenAI Error`);
        }
        if (reason?.response?.status && openAIKey) {
          if (reason?.response?.status === 429) {
            window.showInformationMessage(
              "Caution: In case the API key has expired, please remove it from the extension settings in order to continue using the default proxy server."
            );
            // return await this.getFromOpenApi(prompt, undefined, progress);
          }
        }
        if (reason.response?.data.error?.type === "invalid_request_error") {
          window.showErrorMessage(
            `Diffy Error: There was an issue. Server is experiencing downtime/busy. Please try again later.`
          );
          progress?.report({
            increment: 1,
            message: "\nFailed.",
          });
        } else if (reason.response?.data.error?.message) {
          window.showErrorMessage(
            `Diffy Error: ${reason.response?.data.error?.message}`
          );
          progress?.report({
            increment: 1,
            message: "\nFailed.",
          });
        }
        return undefined;
      });
    if (
      response &&
      response?.choices[0].message.content &&
      response?.choices[0].message.content !== "" &&
      response?.choices[0].message.content !== "\n"
    ) {
      if (response?.choices[0].message.content.length > 6) {
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

export default OpenAiService;
