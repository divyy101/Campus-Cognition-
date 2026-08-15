const { generateCampusAi } = require('./campusAiProvider');
const { generateGemini } = require('./geminiProvider');
const { generateOpenAi } = require('./openAiProvider');
const env = require('../../config/env');

class AIService {
  /**
   * Helper function to extract and parse JSON from markdown wrappers or raw strings.
   */
  static parseCleanJson(text) {
    if (typeof text === 'object' && text !== null) return text;
    let raw = String(text || '').trim();
    
    // Strip ```json ... ``` markdown block if present
    raw = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();

    try {
      return JSON.parse(raw);
    } catch (e) {
      // Attempt substring extraction between { ... } or [ ... ]
      const firstBrace = raw.indexOf('{');
      const lastBrace = raw.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace > firstBrace) {
        try {
          return JSON.parse(raw.substring(firstBrace, lastBrace + 1));
        } catch (innerErr) {
          // Fall through
        }
      }

      const firstBracket = raw.indexOf('[');
      const lastBracket = raw.lastIndexOf(']');
      if (firstBracket !== -1 && lastBracket > firstBracket) {
        try {
          return JSON.parse(raw.substring(firstBracket, lastBracket + 1));
        } catch (innerErr) {
          // Fall through
        }
      }

      throw new Error(`Failed to parse AI output as JSON: ${e.message}`);
    }
  }

  /**
   * Generate text or JSON using the requested provider or configured fallback.
   */
  static async generate({ provider = 'campus_ai', prompt, systemPrompt = '', temperature = 0.7, jsonMode = false }) {
    const requestedProvider = (provider || 'campus_ai').toLowerCase();
    
    // Try primary requested provider
    try {
      if (requestedProvider === 'gemini') {
        const text = await generateGemini({ prompt, systemPrompt, temperature, jsonMode });
        return jsonMode ? this.parseCleanJson(text) : text;
      } else if (requestedProvider === 'openai') {
        const text = await generateOpenAi({ prompt, systemPrompt, temperature, jsonMode });
        return jsonMode ? this.parseCleanJson(text) : text;
      } else {
        // Default to Campus AI
        const text = await generateCampusAi({ prompt, systemPrompt, temperature, jsonMode });
        return jsonMode ? this.parseCleanJson(text) : text;
      }
    } catch (primaryError) {
      console.warn(`[AIService] Primary provider '${requestedProvider}' failed: ${primaryError.message}. Attempting fallback...`);

      // Fallback strategy: If campus_ai failed, try gemini. If gemini failed, try campus_ai.
      try {
        if (requestedProvider === 'gemini') {
          console.log('[AIService] Falling back to Campus AI...');
          const text = await generateCampusAi({ prompt, systemPrompt, temperature, jsonMode });
          return jsonMode ? this.parseCleanJson(text) : text;
        } else {
          console.log('[AIService] Falling back to Gemini...');
          const text = await generateGemini({ prompt, systemPrompt, temperature, jsonMode });
          return jsonMode ? this.parseCleanJson(text) : text;
        }
      } catch (fallbackError) {
        console.error(`[AIService] Fallback provider also failed: ${fallbackError.message}`);
        // If OpenAI key is present, try OpenAI as last resort
        if (env.openAiKey && requestedProvider !== 'openai') {
          try {
            console.log('[AIService] Trying OpenAI as emergency backup...');
            const text = await generateOpenAi({ prompt, systemPrompt, temperature, jsonMode });
            return jsonMode ? this.parseCleanJson(text) : text;
          } catch (openAiError) {
            console.error(`[AIService] OpenAI emergency backup failed: ${openAiError.message}`);
          }
        }

        throw new Error(`AI_PROVIDER_ERROR: Both primary '${requestedProvider}' and fallback providers failed. ${primaryError.message}`);
      }
    }
  }

  /**
   * Status check for all AI engines.
   */
  static getStatus() {
    const campusConfigured = Boolean(env.campusAiKey);
    const geminiConfigured = Boolean(env.geminiKey) && env.geminiKey !== 'YOUR_API_KEY_HERE';
    const openAiConfigured = Boolean(env.openAiKey);

    return {
      campus_ai: {
        status: campusConfigured ? 'available' : 'not_configured',
        model: env.campusAiModel,
        endpoint: env.campusAiEndpoint
      },
      gemini: {
        status: geminiConfigured ? 'available' : 'not_configured',
        model: env.geminiModel
      },
      openai: {
        status: openAiConfigured ? 'available' : 'not_configured',
        model: 'gpt-4o-mini'
      },
      available: campusConfigured || geminiConfigured || openAiConfigured
    };
  }
}

module.exports = AIService;
