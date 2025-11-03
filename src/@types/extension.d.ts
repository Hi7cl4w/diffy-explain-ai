import type OpenAI from "openai";

export type CacheResult = string | OpenAI.Chat.Completions.ChatCompletion;
export type CacheData = {
  entity: string;
  data?: string;
  result: CacheResult;
};
