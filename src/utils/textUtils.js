/**
 * Utility functions for text processing
 */

/**
 * Removes thinking patterns from AI generated text
 * @param {string} text - The text to clean
 * @returns {string} - Cleaned text without thinking patterns
 */
export const removeThinkingPatterns = (text) => {
  if (!text || typeof text !== 'string') {
    return text;
  }

  return text
    .replace(/<thinking>[\s\S]*?<\/thinking>/gi, '') // Remove <thinking> tags
    .replace(/\[thinking\][\s\S]*?\[\/thinking\]/gi, '') // Remove [thinking] tags
    .replace(/thinking:[\s\S]*?(?=\n\n|\n[A-Z]|$)/gi, '') // Remove thinking: patterns
    .replace(/let me think[\s\S]*?(?=\n\n|\n[A-Z]|$)/gi, '') // Remove "let me think" patterns
    .replace(/hmm[\s\S]*?(?=\n\n|\n[A-Z]|$)/gi, '') // Remove "hmm" patterns
    .replace(/let's see[\s\S]*?(?=\n\n|\n[A-Z]|$)/gi, '') // Remove "let's see" patterns
    .replace(/I need to[\s\S]*?(?=\n\n|\n[A-Z]|$)/gi, '') // Remove "I need to" patterns
    .replace(/first[\s\S]*?(?=\n\n|\n[A-Z]|$)/gi, '') // Remove "first" patterns
    .replace(/let me[\s\S]*?(?=\n\n|\n[A-Z]|$)/gi, '') // Remove "let me" patterns
    .trim();
};

/**
 * Cleans AI response text by removing thinking patterns and extra whitespace
 * @param {string} text - The text to clean
 * @returns {string} - Cleaned text
 */
export const cleanAIResponse = (text) => {
  if (!text || typeof text !== 'string') {
    return text;
  }

  return removeThinkingPatterns(text)
    .replace(/\n\s*\n\s*\n/g, '\n\n') // Remove excessive line breaks
    .replace(/^\s+|\s+$/g, '') // Trim start and end
    .replace(/\s+/g, ' '); // Replace multiple spaces with single space
};
