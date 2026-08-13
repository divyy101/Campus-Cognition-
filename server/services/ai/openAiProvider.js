const axios = require('axios');
const env = require('../../config/env');

async function generateOpenAi({ prompt, systemPrompt = '', temperature = 0.7, jsonMode = false }) {
  if (!env.openAiKey) {
    throw new Error('OpenAI API key (OPENAI_API_KEY) is missing in configuration.');
  }

  const messages = [];
  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }
  messages.push({ role: 'user', content: prompt });

  const payload = {
    model: 'gpt-4o-mini',
    messages: messages,
    temperature: temperature,
  };

  if (jsonMode) {
    payload.response_format = { type: 'json_object' };
  }

  const response = await axios.post('https://api.openai.com/v1/chat/completions', payload, {
    headers: {
      'Authorization': `Bearer ${env.openAiKey}`,
      'Content-Type': 'application/json'
    },
    timeout: 60000
  });

  if (response.data && response.data.choices && response.data.choices[0]) {
    return response.data.choices[0].message.content;
  }

  throw new Error('Empty response received from OpenAI provider');
}

module.exports = { generateOpenAi };
