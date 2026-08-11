"""
Base AI Provider Interface
"""
from abc import ABC, abstractmethod
from typing import Optional

class BaseAIProvider(ABC):
    @abstractmethod
    def generate_content(self, prompt: str, json_mode: bool = True) -> Optional[str]:
        """Generate content from the AI model."""
        pass
    
    @abstractmethod
    def is_available(self) -> bool:
        """Check if the provider is configured and available."""
        pass
