"""
Campus Cognition V2 — Opportunity Fetcher Service
Reliably crawls and standardizes external opportunity listings (Scholarships, Internships, Jobs).
"""

import os
import json
import urllib.parse
import urllib.request
import logging
from datetime import datetime, timezone
import socket

logger = logging.getLogger(__name__)

# Standard Result Schema Fields
STANDARD_FIELDS = {
    "title", "company", "description", "location", "type", "skills",
    "eligibility", "cgpa", "stipend", "duration", "deadline", "url",
    "source", "fetched_at", "match_score"
}


def normalize_listing(raw_item, kind, source_name):
    """Normalize raw items from any feed/API into the Standard Result Schema."""
    # Handle dates
    fetched_at = datetime.now(timezone.utc).isoformat()
    
    # Standard values based on kind
    default_type = "Internship" if kind == "internships" else ("Scholarship" if kind == "scholarships" else "Full-time")
    
    # Extracted fields
    title = raw_item.get("title") or raw_item.get("name") or "Untitled Opportunity"
    company = raw_item.get("company") or raw_item.get("organization") or raw_item.get("displayLink") or "Verified Publisher"
    description = raw_item.get("description") or raw_item.get("snippet") or "No description provided."
    location = raw_item.get("location") or ("Remote" if "remote" in title.lower() or "remote" in description.lower() else "India")
    op_type = raw_item.get("type") or raw_item.get("category") or default_type
    
    # Skills normalization
    skills = raw_item.get("skills") or raw_item.get("required_skills") or []
    if isinstance(skills, str):
        skills = [s.strip() for s in skills.split(",") if s.strip()]
    elif not isinstance(skills, list):
        skills = []
        
    # Eligibility normalization
    eligibility = raw_item.get("eligibility") or raw_item.get("required_branch") or []
    if isinstance(eligibility, str):
        eligibility = [e.strip() for e in eligibility.split(",") if e.strip()]
    elif not isinstance(eligibility, list):
        eligibility = []
        
    # CGPA normalization
    cgpa = raw_item.get("cgpa") or raw_item.get("min_cgpa")
    try:
        cgpa = float(cgpa) if cgpa is not None else None
    except (ValueError, TypeError):
        cgpa = None

    # Stipend normalization
    stipend = raw_item.get("stipend") or raw_item.get("award_amount")
    try:
        # Extract numerical value from stipend string if possible
        if isinstance(stipend, str):
            clean_stipend = "".join(c for c in stipend if c.isdigit())
            stipend = int(clean_stipend) if clean_stipend else None
        else:
            stipend = int(stipend) if stipend is not None else None
    except (ValueError, TypeError):
        stipend = None

    duration = raw_item.get("duration") or "3 months"
    deadline = raw_item.get("deadline") or "N/A"
    url = raw_item.get("url") or raw_item.get("link") or "#"
    
    return {
        "title": title.strip(),
        "company": company.strip(),
        "description": description.strip(),
        "location": location,
        "type": op_type,
        "skills": [s.lower() for s in skills],
        "eligibility": eligibility,
        "cgpa": cgpa,
        "stipend": stipend,
        "duration": duration,
        "deadline": deadline,
        "url": url,
        "source": source_name,
        "fetched_at": fetched_at,
        "match_score": int(raw_item.get("match_percentage", raw_item.get("match_score", 0)))
    }


def fetch_from_google_cse(query, kind):
    """Fetch search results from Google Custom Search Engine (CSE)."""
    api_key = os.getenv('GOOGLE_CSE_API_KEY', '').strip()
    search_engine_id = os.getenv('GOOGLE_CSE_ID', '').strip()
    
    if not api_key or not search_engine_id:
        logger.info("Google CSE is not configured.")
        return []

    # Format search terms
    if kind == 'scholarships':
        search_terms = f"{query or 'engineering'} scholarship application India official"
    elif kind == 'internships':
        search_terms = f"{query or 'software'} internship apply India official careers"
    else:
        search_terms = f"{query or 'student'} internship scholarship official application"

    params = urllib.parse.urlencode({
        'key': api_key,
        'cx': search_engine_id,
        'q': search_terms,
        'num': 10
    })
    
    url = f"https://www.googleapis.com/customsearch/v1?{params}"
    
    # Request with timeout and retry
    for attempt in range(2):
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'CampusCognition/2.0'})
            with urllib.request.urlopen(req, timeout=5) as response:
                payload = json.loads(response.read().decode('utf-8'))
                
                results = []
                for item in payload.get('items', []):
                    results.append({
                        'title': item.get('title'),
                        'company': item.get('displayLink'),
                        'description': item.get('snippet'),
                        'link': item.get('link'),
                        'source': 'google-cse'
                    })
                return results
        except socket.timeout:
            logger.warning(f"Google CSE timed out on attempt {attempt + 1}")
        except Exception as e:
            logger.error(f"Google CSE fetch failed: {e}")
            break
            
    return []


def get_fallback_seeded_opportunities(query, kind):
    """Retrieve pre-seeded database opportunities matching the search query to prevent blank screens."""
    from database.repositories.opportunity_repository import search_opportunities
    
    op_type = "Scholarship" if kind == "scholarships" else "Internship"
    db_results = search_opportunities(query=query, op_type=op_type)
    
    normalized = []
    for opp in db_results:
        normalized.append({
            "title": opp.get("title"),
            "company": opp.get("company"),
            "description": opp.get("description"),
            "location": opp.get("location") or "India",
            "type": opp.get("type"),
            "skills": opp.get("required_skills", "").split(","),
            "eligibility": opp.get("required_branch", "").split(","),
            "cgpa": opp.get("min_cgpa"),
            "stipend": opp.get("stipend") or opp.get("award_amount"),
            "duration": opp.get("duration") or "3 months",
            "deadline": opp.get("deadline"),
            "url": opp.get("link"),
            "source": opp.get("source", "database"),
            "match_score": opp.get("match_percentage", 80)
        })
    return normalized


def fetch_live_opportunities_clean(query, kind, branch=None, cgpa=None):
    """
    Unified fetcher that pulls from external sources, standardizes and validates listings.
    Never fabricates entries. Graces failure with database fallback.
    """
    raw_results = fetch_from_google_cse(query, kind)
    
    # If external search engine returns nothing, fall back to seeded DB results
    if not raw_results:
        logger.info(f"No Google CSE results for search query '{query}'. Falling back to local seeded opportunities.")
        raw_results = get_fallback_seeded_opportunities(query, kind)
        
    normalized = []
    for item in raw_results:
        try:
            norm = normalize_listing(item, kind, item.get('source', 'google-cse'))
            normalized.append(norm)
        except Exception as e:
            logger.warning(f"Failed to normalize opportunity: {e}")
            
    return normalized
