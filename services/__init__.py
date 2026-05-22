"""
Services Module - AI and external service integrations
"""

from .gemini_service import (
    analyze_study_materials,
    analyze_code,
    recommend_opportunities,
    analyze_scholarship,
    analyze_internship,
    is_api_available,
    get_api_status
)

__all__ = [
    'analyze_study_materials',
    'analyze_code',
    'recommend_opportunities',
    'analyze_scholarship',
    'analyze_internship',
    'is_api_available',
    'get_api_status'
]
