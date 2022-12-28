/* eslint-disable @typescript-eslint/naming-convention */
import {
  Configuration,
  CreateCompletionRequest,
  CreateCompletionResponse,
  OpenAIApi,
} from "openai";
import { CacheService } from "./CacheService";
import { window } from "vscode";
import { resolveNaptr } from "dns";
import { AxiosError } from "axios";

class OpenAiService implements AIService {
  static _instance: OpenAiService;
  cacheService!: CacheService;
  openAIConfig: CreateCompletionRequest = {
    model: "text-davinci-003",
    prompt: null,
    temperature: 0.9,
    max_tokens: 2000,
    top_p: 1.0,
    frequency_penalty: 0.0,
    presence_penalty: 0.0,
    best_of: 1,
    stop: ['"""'],
  };

  constructor() {
    if (OpenAiService._instance) {
      return OpenAiService._instance;
    }
    this.cacheService = new CacheService();
  }

  /**
   * It takes a git diff as input and returns a commit message as output
   * @param {string} openAIKey - string - This is the API key for OpenAI.
   * @param {string} code - The diff of the files that are being committed.
   * @returns A string
   */
  async getCommitMessageFromDiff(
    openAIKey: string,
    code: string
  ): Promise<string | null> {
    code =
      'Read the following console result of git diff --cached:\n\n"""\n' +
      code +
      '\n\n"""\nWrite a commit message in multiple lines where one line without exceeding 50 character based on this diff changes without mentioning itself:\n';
    let response = await this.getFromOpenApi(openAIKey, code);
    if (response) {
      let message = String(response?.choices[0].text);
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
  async getExplainedChanges(openAIKey: string, code: string) {
    code =
      'Read the following console result of git diff --cached:\n\n"""\n' +
      code +
      '\n\n"""\nGenerate paragraphs to explain this diff changes to a human without mentioning itself:\n\n';
    let response = await this.getFromOpenApi(openAIKey, code);
    if (response) {
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
   * @param {string} prompt - The code snippet you want to explain.
   * @returns {Promise<CreateCompletionResponse>}.
   */
  private async getFromOpenApi(openAIKey: string, prompt: string) {
    this.openAIConfig.prompt = prompt;
    const exist = this.cacheService.recordExists(
      this.openAIConfig.model,
      prompt
    );
    if (exist) {
      return new Promise<CreateCompletionResponse>((resolve) =>
        resolve(this.cacheService.get(this.openAIConfig.model, prompt))
      );
    }
    const configuration = new Configuration({
      apiKey: openAIKey,
    });
    const openai = new OpenAIApi(configuration);

    const response = await openai
      .createCompletion(this.openAIConfig)
      .then((value) => {
        return value;
      })
      .catch((reason: AxiosError) => {
        if (reason.response?.statusText) {
          window.showErrorMessage(
            `OpenAI Error: ${reason.response?.statusText}`
          );
        } else {
          window.showErrorMessage(`OpenAI Error`);
        }
      });

    if (response && response?.data) {
      this.cacheService.set(this.openAIConfig.model, prompt, response?.data);

      return response?.data;
    }
    return null;
  }
}

export default OpenAiService;
