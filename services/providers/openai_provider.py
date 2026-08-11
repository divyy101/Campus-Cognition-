"""
OpenAI Provider
"""
import os
import json
import logging
from typing import Optional
from openai import OpenAI
from .base_provider import BaseAIProvider

logger = logging.getLogger(__name__)

class OpenAIProvider(BaseAIProvider):
    def __init__(self):
        self.api_key = os.getenv('OPENAI_API_KEY', '').strip()
        self.model = os.getenv('OPENAI_MODEL', 'gpt-4o-mini')
        if self.is_available():
            self.client = OpenAI(api_key=self.api_key)
        else:
            self.client = None
            
    def is_available(self) -> bool:
        return bool(self.api_key and not self.api_key.startswith('YOUR_') and 'sk-' in self.api_key)

    def generate_content(self, prompt: str, json_mode: bool = True) -> Optional[str]:
        if not self.is_available():
            logger.warning("OpenAI API key is missing or invalid.")
            return None
            
        try:
            messages = [
                {"role": "system", "content": "You are a helpful academic and coding assistant. You must respond with valid, parseable JSON only." if json_mode else "You are a helpful academic and coding assistant."},
                {"role": "user", "content": prompt}
            ]
            
            kwargs = {
                "model": self.model,
                "messages": messages,
                "temperature": 0.2,
                "max_tokens": 8000,
            }
            if json_mode:
                kwargs["response_format"] = {"type": "json_object"}
                
            response = self.client.chat.completions.create(**kwargs)
            return response.choices[0].message.content
        except Exception as e:
            logger.error(f"OpenAI API call failed: {e}")
            return None
