const axios = require('axios');
const env = require('../../config/env');

async function generateCampusAi({ prompt, systemPrompt = '', temperature = 0.7, jsonMode = false }) {
  const apiKey = env.campusAiKey || env.openAiKey;
  if (!apiKey) {
    throw new Error('Campus AI / OpenAI API key is missing or empty in configuration.');
  }

  const messages = [];
  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }
  messages.push({ role: 'user', content: prompt });

  const payload = {
    model: env.campusAiModel || 'llama-3.3-70b-versatile',
    messages: messages,
    temperature: temperature,
  };

  if (jsonMode) {
    payload.response_format = { type: 'json_object' };
  }

  // Attempt Groq endpoint first
  try {
    const response = await axios.post(env.campusAiEndpoint, payload, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 45000
    });

    if (response.data && response.data.choices && response.data.choices[0]) {
      return response.data.choices[0].message.content;
    }
  } catch (groqError) {
    console.warn(`[CampusAIProvider] Primary Groq endpoint failed (${groqError.message}). Attempting OpenAI endpoint...`);

    if (env.openAiKey) {
      payload.model = 'gpt-4o-mini';
      const openAiRes = await axios.post('https://api.openai.com/v1/chat/completions', payload, {
        headers: {
          'Authorization': `Bearer ${env.openAiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 45000
      });

      if (openAiRes.data && openAiRes.data.choices && openAiRes.data.choices[0]) {
        return openAiRes.data.choices[0].message.content;
      }
    }

    throw groqError;
  }

  throw new Error('Empty or invalid response structure received from Campus AI provider');
}

module.exports = { generateCampusAi };
