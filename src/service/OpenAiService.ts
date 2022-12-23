/* eslint-disable @typescript-eslint/naming-convention */
import {
  Configuration,
  CreateCompletionRequest,
  CreateCompletionResponse,
  OpenAIApi,
} from "openai";
import { CacheService } from "./CacheService";

class OpenAiService implements AIService {
  static _instance: OpenAiService;
  cacheService!: CacheService;
  openAIConfig: CreateCompletionRequest = {
    model: "text-davinci-003",
    prompt: null,
    temperature: 0.9,
    max_tokens: 256,
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

  async getCommitMessageFromDiff(
    openAIKey: string,
    code: string
  ): Promise<string> {
    code =
      'Read the following git diff for a multiple files:\n\n"""\n' +
      code +
      '\n\n"""\nGenerate commit messages from this diff without mentioning the changes themselves:\n\n';
    let response = await this.getFromOpenApi(openAIKey, code);
    let message = String(response.choices[0].text);
    message = message.trim();
    return message;
  }

  /**
   * It takes a string of code, sends it to a server, gets a response, and returns a string of the
   * response.
   * @param {string} code - the git diff you want to get the explanation for
   * @returns {Promise<string>} The explanation of the git diff.
   */
  async getExplainedChanges(openAIKey: string, code: string): Promise<string> {
    code =
      'Read the following git diff for a multiple files:\n\n"""\n' +
      code +
      '\n\n"""\nGenerate paragraphs to explain this diff to a human without mentioning the changes themselves:\n\n';
    let response = await this.getFromOpenApi(openAIKey, code);
    let message = String(response.choices[0].text);
    message = message.trim();
    return message;
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

    const response = await openai.createCompletion(this.openAIConfig);

    this.cacheService.set(this.openAIConfig.model, prompt, response.data);

    return response.data;
  }
}

export default OpenAiService;
