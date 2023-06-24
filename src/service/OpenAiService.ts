/* eslint-disable @typescript-eslint/naming-convention */
import * as vscode from "vscode";
import {
  Configuration,
  CreateCompletionRequest,
  CreateCompletionResponse,
  OpenAIApi,
} from "openai";
import { CacheService } from "./CacheService";
import { window } from "vscode";
import { resolveNaptr } from "dns";
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import WorkspaceService from "./WorkspaceService";
import axiosRetry from "axios-retry";
export interface OpenAIErrorResponse {
  error?: Error;
}

export interface Error {
  message?: string;
}

class OpenAiService implements AIService {
  static _instance: OpenAiService;
  cacheService!: CacheService;
  openAIConfig: CreateCompletionRequest = {
    model: WorkspaceService.getInstance().getGptModel(),
    prompt: null,
    temperature: 0.9,
    max_tokens: 2000,
    top_p: 1.0,
    frequency_penalty: 0.0,
    presence_penalty: 0.0,
    best_of: 1,
    // stop: ['"""'],
  };

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
    code =
      "Write a commit message in multiple lines where first line doesn't exceeds '50' characters by following commit message guidelines based on this diff changes without mentioning itself from following result of " +
      gitCmd +
      ":\n\n" +
      code +
      "\n\n";
    // console.log("code: " + code);
    // console.log("Length: " + code.length);
    let response = await this.getFromOpenApi(code, openAIKey, progress);
    if (response && response.choices) {
      let message = String(response.choices[0].text);
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
    code =
      "Generate paragraphs to explain this diff changes to a human without mentioning itself from the following console result of " +
      gitCmd +
      ':\n\n"""\n' +
      code +
      '\n\n"""\nGenerate paragraphs to explain this diff changes to a human without mentioning itself:\n\n';
    let response = await this.getFromOpenApi(code, openAIKey);
    if (response && response.choices) {
      let message = String(response?.choices[0].text);
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
    prompt: string,
    openAIKey?: string,
    progress?: vscode.Progress<{
      message?: string | undefined;
      increment?: number | undefined;
    }>
  ): Promise<CreateCompletionResponse | undefined> {
    this.openAIConfig.prompt = prompt;
    this.openAIConfig.model = WorkspaceService.getInstance().getGptModel();
    console.log(this.openAIConfig.model);
    const exist = this.cacheService.recordExists(
      this.openAIConfig.model,
      prompt
    );
    if (exist) {
      return new Promise<CreateCompletionResponse>((resolve) =>
        resolve(this.cacheService.get(this.openAIConfig.model, prompt))
      );
    }
    if (openAIKey) {
      const configuration = new Configuration({
        apiKey: openAIKey,
      });
      const openai = new OpenAIApi(configuration);
      const response = await openai
        .createCompletion(this.openAIConfig)
        .then((value) => {
          return value;
        })
        .catch(async (reason: AxiosError<OpenAIErrorResponse>) => {
          console.error(reason.response);
          if (reason.response?.statusText) {
            window.showErrorMessage(
              `OpenAI Error: ${
                reason.response?.data.error?.message ||
                reason.response.statusText
              } `
            );
          } else {
            window.showErrorMessage(`OpenAI Error`);
          }
          if (reason?.response?.status) {
            if (reason?.response?.status === 429) {
              window.showInformationMessage(
                "Caution: In case the API key has expired, please remove it from the extension settings in order to continue using the default proxy server."
              );
              return this.proxyRequest(this.openAIConfig, progress);
            }
          }
        });
      if (response && response?.data) {
        this.cacheService.set(this.openAIConfig.model, prompt, response?.data);
        console.log(response?.data);

        return response?.data;
      }
      return undefined;
    } else {
      const response = await this.proxyRequest(this.openAIConfig, progress);
      console.log(response?.data);
      return response?.data;
    }
  }

  private async proxyRequest(
    openAIConfig: CreateCompletionRequest,
    progress?: vscode.Progress<{
      message?: string | undefined;
      increment?: number | undefined;
    }>
  ): Promise<AxiosResponse<CreateCompletionResponse, any> | null> {
    let data = JSON.stringify(openAIConfig);
    progress?.report({ increment: 50 });

    axiosRetry(axios, {
      retryDelay: (retryCount) => {
        return retryCount * 1000;
      },
    });

    let config: AxiosRequestConfig<any> = {
      method: "post",
      maxBodyLength: Infinity,
      url: "https://gpt.pinocks.com/user/v1/completions",
      headers: {
        Authorization:
          "Bearer mk-R4d04fe2a29e703da6ZC9Ub0wnz4XsNiRVBChTYbJcE3F",
        "Content-Type": "application/json",
      },
      data: data,
      onUploadProgress: (progressEvent) => {
        if (progressEvent && progressEvent.loaded && progressEvent.total) {
          let percentCompleted = Math.floor(
            (progressEvent.loaded / progressEvent.total) * 25
          );
          progress?.report({ increment: percentCompleted });
        }
      },
      onDownloadProgress: (progressEvent) => {
        // console.log("progressEvent");
        // console.log(progressEvent);
        if (progressEvent && progressEvent.loaded && progressEvent.total) {
          let percentCompleted = Math.floor(
            (progressEvent.loaded / progressEvent.total) * 25
          );
          progress?.report({ increment: percentCompleted - 1 });
        }
      },
    };
    const response = await axios
      .request<CreateCompletionResponse>(config)
      .catch((reason) => {
        console.error(reason);
        if (reason.response?.statusText) {
          window.showErrorMessage(
            `OpenAI Error: ${
              reason.response?.data.error?.message || reason.response.statusText
            } `
          );
        } else {
          window.showErrorMessage(`OpenAI Error`);
        }
        return null;
      });
    progress?.report({ increment: 1, message: "\nCommit message generated." });
    await new Promise((f) => setTimeout(f, 1000));
    console.log(response);
    return response;
  }
}

export default OpenAiService;
