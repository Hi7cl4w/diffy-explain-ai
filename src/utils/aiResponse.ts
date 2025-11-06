/**
 * Utility functions for processing AI service responses
 */

/**
 * Cleans and trims AI response messages by removing markdown code blocks, quotes, and extra whitespace
 * @param response - The raw response string from AI services
 * @returns Cleaned and trimmed message
 */
export function cleanAiResponse(response: string): string {
  let message = response.trim();

  // Remove markdown code blocks if present
  message = message.replace(/^```[\w]*\n?/gm, "");
  message = message.replace(/\n?```$/gm, "");

  // Remove quotes
  message = message.replace(/^"/gm, "");
  message = message.replace(/"$/gm, "");

  // Final trim to remove any extra whitespace
  message = message.trim();

  return message;
}
