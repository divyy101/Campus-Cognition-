"""
Gemini Provider
"""
import os
import logging
from typing import Optional
import google.generativeai as genai
from .base_provider import BaseAIProvider

logger = logging.getLogger(__name__)

class GeminiProvider(BaseAIProvider):
    def __init__(self):
        self.api_key = os.getenv('GEMINI_API_KEY', '').strip()
        self.model_name = os.getenv('GEMINI_MODEL', 'gemini-1.5-flash')
        
        if self.is_available():
            genai.configure(api_key=self.api_key)
            # Initialize model instances to avoid recreating them
            self.json_model = genai.GenerativeModel(
                self.model_name,
                generation_config={"response_mime_type": "application/json"}
            )
            self.text_model = genai.GenerativeModel(self.model_name)
            
    def is_available(self) -> bool:
        return bool(self.api_key and self.api_key != 'YOUR_API_KEY_HERE')

    def generate_content(self, prompt: str, json_mode: bool = True) -> Optional[str]:
        if not self.is_available():
            logger.warning("Gemini API key is missing or placeholder.")
            return None
            
        try:
            model = self.json_model if json_mode else self.text_model
            response = model.generate_content(prompt)
            return response.text
        except Exception as e:
            logger.error(f"Gemini API call failed: {e}")
            return None
