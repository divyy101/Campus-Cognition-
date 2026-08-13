const axios = require('axios');
const env = require('../../config/env');

async function generateGemini({ prompt, systemPrompt = '', temperature = 0.7, jsonMode = false }) {
  if (!env.geminiKey || env.geminiKey === 'YOUR_API_KEY_HERE') {
    throw new Error('Gemini API key (GEMINI_API_KEY) is missing or invalid in configuration.');
  }

  // Authoritative models supported by this API key
  const modelsToTry = [
    'gemini-3.6-flash',
    'gemini-3.5-flash',
    'gemini-2.5-flash',
    'gemini-flash-latest'
  ];

  let lastError = null;

  for (const modelName of modelsToTry) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${env.geminiKey}`;
      
      const contents = [];
      if (systemPrompt) {
        contents.push({
          role: 'user',
          parts: [{ text: `System Instruction: ${systemPrompt}` }]
        });
      }
      contents.push({
        role: 'user',
        parts: [{ text: prompt }]
      });

      const payload = {
        contents: contents,
        generationConfig: {
          temperature: temperature,
          responseMimeType: jsonMode ? 'application/json' : 'text/plain'
        }
      };

      const response = await axios.post(url, payload, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 30000
      });

      if (response.data && response.data.candidates && response.data.candidates[0]) {
        const candidate = response.data.candidates[0];
        if (candidate.content && candidate.content.parts && candidate.content.parts[0]) {
          return candidate.content.parts[0].text;
        }
      }
    } catch (err) {
      lastError = err.response ? JSON.stringify(err.response.data) : err.message;
      console.warn(`[GeminiProvider] Model ${modelName} call failed:`, lastError);
    }
  }

  throw new Error(`Gemini provider failed with all model attempts: ${lastError}`);
}

module.exports = { generateGemini };
