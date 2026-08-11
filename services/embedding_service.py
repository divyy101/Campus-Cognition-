"""
Campus Cognition V2 — Embedding Service
Generates embeddings using OpenAI or other providers.
"""
import os
import logging
from typing import List
from openai import OpenAI

logger = logging.getLogger(__name__)

class EmbeddingService:
    def __init__(self):
        self.provider = os.getenv('EMBEDDING_PROVIDER', 'openai').lower()
        self.model = os.getenv('EMBEDDING_MODEL', 'text-embedding-3-small')
        self.openai_api_key = os.getenv('OPENAI_API_KEY', '').strip()
        
        if self.provider == 'openai' and self.openai_api_key:
            self.client = OpenAI(api_key=self.openai_api_key)
        else:
            self.client = None
            
    def generate_embedding(self, text: str) -> List[float]:
        """Generate a single embedding vector."""
        if not self.client:
            logger.warning("Embedding provider not configured properly.")
            return []
            
        try:
            # Replace newlines as recommended by OpenAI for better embeddings
            clean_text = text.replace("\n", " ")
            response = self.client.embeddings.create(
                input=[clean_text],
                model=self.model
            )
            return response.data[0].embedding
        except Exception as e:
            logger.error(f"Failed to generate embedding: {e}")
            return []

embedding_service = EmbeddingService()

def generate_text_embedding(text: str) -> List[float]:
    return embedding_service.generate_embedding(text)
