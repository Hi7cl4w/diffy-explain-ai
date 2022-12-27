interface AIService {
  // getExplainedChanges(): Promise<string>;

  getExplainedChanges(string1: string, string2: string): Promise<string | null>;
}
