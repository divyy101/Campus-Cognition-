"""
Services Module - AI and external service integrations
"""

from .ai_service import (
    analyze_study_materials,
    recommend_opportunities,
    analyze_scholarship,
    analyze_internship,
    is_api_available,
    get_api_status
)

__all__ = [
    'analyze_study_materials',
    'recommend_opportunities',
    'analyze_scholarship',
    'analyze_internship',
    'is_api_available',
    'get_api_status'
]
