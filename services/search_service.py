"""
Campus Cognition V2 — Search Service
Performs natural language parsing, database & external search coordination, caching, deduplication, and matching.
"""

import re
import hashlib
import logging
from datetime import datetime, timezone

from services.opportunity_fetcher import fetch_live_opportunities_clean
from database.repositories.opportunity_repository import (
    get_cached_search, set_cached_search, create_opportunity, save_user_opportunity
)

logger = logging.getLogger(__name__)

# List of common skills we search for in queries
COMMON_SKILLS = [
    "python", "javascript", "react", "node", "java", "c++", "c#", "html", "css",
    "sql", "mongodb", "aws", "docker", "kubernetes", "machine learning", "ml",
    "deep learning", "ai", "nlp", "flutter", "swift", "kotlin", "go", "rust"
]

# List of branches
BRANCH_MAP = {
    "cse": "CSE",
    "computer science": "CSE",
    "it": "IT",
    "information technology": "IT",
    "ece": "ECE",
    "electronics": "ECE",
    "me": "ME",
    "mechanical": "ME",
    "ce": "CE",
    "civil": "CE",
    "ee": "EE",
    "electrical": "EE",
    "biotech": "BE",
    "be": "BE"
}


def parse_natural_language_query(query_str):
    """
    Parse a search query in natural language to extract fields:
    role, skills, opportunity type, location, branch, CGPA, stipend.
    """
    if not query_str:
        return {}

    query_lower = query_str.lower().strip()
    parsed = {
        "role": "",
        "skills": [],
        "type": "",
        "location": "",
        "branch": "",
        "cgpa": None,
        "stipend": None
    }

    # 1. Extract Opportunity Type
    if "intern" in query_lower:
        parsed["type"] = "Internship"
    elif "scholarship" in query_lower:
        parsed["type"] = "Scholarship"
    elif "job" in query_lower or "full-time" in query_lower or "fulltime" in query_lower:
        parsed["type"] = "Full-time"

    # 2. Extract Location
    if "remote" in query_lower:
        parsed["location"] = "Remote"
    elif "hybrid" in query_lower:
        parsed["location"] = "Hybrid"
    elif "on-site" in query_lower or "onsite" in query_lower:
        parsed["location"] = "On-site"

    # 3. Extract Skills
    for skill in COMMON_SKILLS:
        # Match word boundaries to prevent substring collisions (e.g. 'go' in 'google')
        pattern = rf"\b{re.escape(skill)}\b"
        if re.search(pattern, query_lower):
            parsed["skills"].append(skill)

    # 4. Extract Branch
    for key, val in BRANCH_MAP.items():
        pattern = rf"\b{re.escape(key)}\b"
        if re.search(pattern, query_lower):
            parsed["branch"] = val
            break

    # 5. Extract CGPA requirement (e.g., '8+ cgpa', 'cgpa above 7.5', '8.0 cgpa')
    cgpa_match = re.search(r"(\d+(\.\d+)?)\s*(?:\+)?\s*(?:cgpa|gpa)", query_lower)
    if not cgpa_match:
        cgpa_match = re.search(r"(?:cgpa|gpa)\s*(?:above|>=|>)?\s*(\d+(\.\d+)?)", query_lower)
    if cgpa_match:
        try:
            parsed["cgpa"] = float(cgpa_match.group(1))
        except ValueError:
            pass

    # 6. Extract Stipend (e.g., '10000 stipend', 'above 15000', 'stipend of 5000')
    stipend_match = re.search(r"(?:₹|rs\.?|stipend)?\s*(\d{4,6})", query_lower)
    if stipend_match:
        try:
            parsed["stipend"] = int(stipend_match.group(1))
        except ValueError:
            pass

    # 7. Extract Role / Position
    # Remove filters from query to guess target role name
    clean_query = query_lower
    for type_word in ["internship", "internships", "intern", "scholarship", "scholarships", "job", "jobs", "for"]:
        clean_query = clean_query.replace(type_word, "")
    for skill in parsed["skills"]:
        clean_query = clean_query.replace(skill, "")
    for branch_word in BRANCH_MAP.keys():
        clean_query = clean_query.replace(branch_word, "")
    
    clean_query = re.sub(r"\b\d+(\.\d+)?\b", "", clean_query) # remove numbers
    clean_query = re.sub(r"\s+", " ", clean_query).strip()
    
    if clean_query and clean_query not in ["remote", "hybrid", "onsite", "on-site", "stipend"]:
        parsed["role"] = clean_query.title()
    else:
        # Fallback to skills or type if no role is found
        parsed["role"] = parsed["skills"][0].title() if parsed["skills"] else "Developer"

    return parsed


def generate_stable_fingerprint(title, company, url):
    """Generate a stable MD5 fingerprint to identify duplicate opportunities."""
    raw = f"{(title or '').strip().lower()}|{(company or '').strip().lower()}|{(url or '').strip().lower()}"
    return hashlib.md5(raw.encode()).hexdigest()


def calculate_match_score(opportunity, user_profile):
    """
    Deterministically calculate matching percentage based on user's profile:
    Skills (30%), CGPA (20%), Branch (15%), Role (15%), Location (10%), Base (10%)
    """
    if not user_profile:
        return 50, ["Profile context not available. Displaying standard match."]

    score = 10  # Base score
    reasons = ["Base matching match (10%)"]

    # 1. Skills Matching (30%)
    user_skills = [s.strip().lower() for s in user_profile.get("skills", [])]
    opp_skills = [s.strip().lower() for s in opportunity.get("skills", [])]
    
    if opp_skills and user_skills:
        matching_skills = set(opp_skills) & set(user_skills)
        if matching_skills:
            pct = (len(matching_skills) / len(opp_skills)) * 30
            score += pct
            reasons.append(f"Matched skills: {', '.join(matching_skills)} ({int(pct)}%)")
        else:
            reasons.append("Missing required skills (0%)")
    else:
        # If opportunity requires no specific skills, give partial match credit
        score += 15
        reasons.append("No specific skills required (15%)")

    # 2. CGPA Eligibility (20%)
    user_cgpa = user_profile.get("cgpa")
    opp_cgpa = opportunity.get("cgpa")
    
    if opp_cgpa is not None and user_cgpa is not None:
        if user_cgpa >= opp_cgpa:
            score += 20
            reasons.append(f"CGPA {user_cgpa} meets minimum requirement of {opp_cgpa} (20%)")
        else:
            reasons.append(f"CGPA {user_cgpa} is below minimum requirement of {opp_cgpa} (0%)")
    else:
        score += 20
        reasons.append("No strict CGPA threshold (20%)")

    # 3. Branch Match (15%)
    user_branch = user_profile.get("branch")
    opp_branch = opportunity.get("eligibility")
    
    if user_branch and opp_branch:
        opp_branch_lower = [b.lower() for b in opp_branch]
        if user_branch.lower() in opp_branch_lower or any(user_branch.lower() in b for b in opp_branch_lower):
            score += 15
            reasons.append(f"Major matches target branch: {user_branch} (15%)")
        else:
            reasons.append(f"Branch mismatch: profile={user_branch}, required={', '.join(opp_branch)} (0%)")
    else:
        score += 15
        reasons.append("No specific branch constraint (15%)")

    # 4. Role Match (15%)
    user_interest = user_profile.get("interests", [])
    opp_title = opportunity.get("title", "").lower()
    
    matched_role = False
    if user_interest:
        for interest in user_interest:
            if interest.lower() in opp_title:
                score += 15
                reasons.append(f"Matches your interested field: {interest} (15%)")
                matched_role = True
                break
    if not matched_role:
        # Check title vs typical roles
        score += 10
        reasons.append("General role matching (10%)")

    # 5. Location Match (10%)
    user_pref_loc = user_profile.get("preferred_location", "remote").lower()
    opp_loc = opportunity.get("location", "").lower()
    
    if user_pref_loc in opp_loc or opp_loc in user_pref_loc:
        score += 10
        reasons.append("Matches location preferences (10%)")
    else:
        score += 5
        reasons.append("Alternative location offered (5%)")

    return min(100, int(score)), reasons


def execute_opportunities_search(query_str, user_profile=None, page=1, limit=20):
    """
    Orchestrate the search, caching, deduplication, scoring and filtering flow.
    Returns: {results, page, limit, total, has_next}
    """
    # 1. Parse query
    parsed_query = parse_natural_language_query(query_str)
    
    # 2. Build normalized Cache Key
    normalized_q = query_str.strip().lower() if query_str else "all"
    cache_key = f"opportunities:search:{normalized_q}"
    
    # 3. Check Cache
    cached_results = get_cached_search(cache_key)
    if cached_results:
        logger.info("Search Cache Hit.")
        results = cached_results
    else:
        # 4. Cache Miss — Call Opportunity Fetcher (Never Fabricates)
        logger.info("Search Cache Miss. Fetching live.")
        kind = "opportunities"
        if parsed_query.get("type") == "Scholarship":
            kind = "scholarships"
        elif parsed_query.get("type") == "Internship":
            kind = "internships"
            
        raw_items = fetch_live_opportunities_clean(
            query=normalized_q,
            kind=kind,
            branch=parsed_query.get("branch"),
            cgpa=parsed_query.get("cgpa")
        )
        
        # 5. Deduplicate and Fingerprint
        unique_results = []
        seen_fingerprints = set()
        
        for item in raw_items:
            fp = generate_stable_fingerprint(item.get("title"), item.get("company"), item.get("url"))
            if fp not in seen_fingerprints:
                seen_fingerprints.add(fp)
                item["fingerprint"] = fp
                unique_results.append(item)
                
        results = unique_results
        
        # 6. Save new discoveries to DB catalog and Cache
        for opp in results:
            opp_id = create_opportunity(
                title=opp.get("title"),
                company=opp.get("company"),
                description=opp.get("description"),
                required_skills=",".join(opp.get("skills", [])),
                required_branch=",".join(opp.get("eligibility", [])),
                min_cgpa=opp.get("cgpa") or 0.0,
                deadline=opp.get("deadline", "2026-12-31"),
                link=opp.get("url"),
                op_type=opp.get("type", "Internship"),
                source=opp.get("source", "crawler"),
                fingerprint=opp.get("fingerprint")
            )
            opp["id"] = opp_id
            
        set_cached_search(cache_key, results, ttl_minutes=30)

    # 7. Apply Match Scoring & Profile Filtering
    scored_results = []
    for opp in results:
        score, reasons = calculate_match_score(opp, user_profile)
        opp_copy = dict(opp)
        opp_copy["match_score"] = score
        opp_copy["match_reasons"] = reasons
        
        # Link user opportunity dynamically
        if user_profile and "id" in user_profile:
            save_user_opportunity(user_profile["id"], opp.get("id"), score)
            
        scored_results.append(opp_copy)

    # Sort by match score descending
    scored_results.sort(key=lambda x: x.get("match_score", 0), reverse=True)

    # 8. Pagination Slicing
    total = len(scored_results)
    start_idx = (page - 1) * limit
    end_idx = start_idx + limit
    paginated_results = scored_results[start_idx:end_idx]
    has_next = end_idx < total

    return {
        "results": paginated_results,
        "page": page,
        "limit": limit,
        "total": total,
        "has_next": has_next
    }
