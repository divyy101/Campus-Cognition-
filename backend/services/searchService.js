const crypto = require('crypto');
const axios = require('axios');
const cheerio = require('cheerio');
const SearchCache = require('../models/SearchCache');
const companiesDB = require('../data/companies');
const opportunitiesDB = require('../data/opportunities');
const scholarshipsDB = require('../data/scholarships');

class SearchService {
  static generateHash(str) {
    return crypto.createHash('md5').update(str.toLowerCase().trim()).digest('hex');
  }

  static async search({ query, type = 'all', userProfile = {}, page = 1, limit = 20 }) {
    const cleanQuery = (query || '').trim().toLowerCase();
    const queryHash = this.generateHash(`${cleanQuery}_${type}`);

    try {
      const cached = await SearchCache.findOne({ queryHash, expiresAt: { $gt: new Date() } });
      if (cached && cached.results && cached.results.length > 0) {
        return this.filterAndPaginate(cached.results, userProfile, page, limit);
      }
    } catch (e) {
      console.warn('[SearchService] Cache lookup error:', e.message);
    }

    const liveResults = await this.performLiveRetrieval(cleanQuery, type, userProfile);

    try {
      const expiresAt = new Date(Date.now() + 6 * 60 * 60 * 1000);
      await SearchCache.findOneAndUpdate(
        { queryHash },
        { queryHash, query: cleanQuery, results: liveResults, expiresAt },
        { upsert: true, new: true }
      );
    } catch (e) {
      console.warn('[SearchService] Cache write error:', e.message);
    }

    return this.filterAndPaginate(liveResults, userProfile, page, limit);
  }

  static async performLiveRetrieval(query, type, userProfile) {
    const results = [];
    const lowerQuery = query.toLowerCase();
    const querySkills = query.split(/[\s,]+/).filter(s => s.length > 0);

    // 1. Process Local Opportunities (Curated Data)
    if (type === 'all' || type === 'internship' || type === 'opportunity') {
      for (const opp of opportunitiesDB) {
        if (type !== 'all' && type !== opp.category && type !== opp.type.toLowerCase()) {
          continue; // skip if type doesn't match
        }
        
        let matchDetails = this.calculateMatchScore(opp, querySkills, lowerQuery);
        if (matchDetails.score > 0 || !query) {
           results.push({
             ...opp,
             matchScore: matchDetails.score,
             matchReason: matchDetails.reason,
             source: 'Curated Database'
           });
        }
      }
    }

    // 2. Process Local Scholarships
    if (type === 'all' || type === 'scholarship') {
      for (const schol of scholarshipsDB) {
        let matchDetails = this.calculateScholarshipMatch(schol, querySkills, lowerQuery, userProfile);
        if (matchDetails.score > 0 || !query) {
           results.push({
             ...schol,
             company: schol.provider,
             type: 'Scholarship',
             matchScore: matchDetails.score,
             matchReason: matchDetails.reason,
             source: 'Curated Database'
           });
        }
      }
    }

    // 3. Process Company Discovery (Tech Stack match)
    if (type === 'all' || type === 'company' || type === 'internship') {
       for (const comp of companiesDB) {
         let matchDetails = this.calculateCompanyMatch(comp, querySkills, lowerQuery);
         if (matchDetails.score > 0) {
            results.push({
              id: `comp_${this.generateHash(comp.name)}`,
              title: `${comp.name} - General Applications`,
              company: comp.name,
              url: comp.url,
              category: 'company',
              type: 'Company Profile',
              description: comp.description,
              skills: comp.techStack, // This represents company tech stack, NOT opportunity required skills
              matchScore: matchDetails.score,
              matchReason: matchDetails.reason,
              source: 'Company Database',
              isCompanyDiscovery: true
            });
         }
       }
    }

    // 4. Scrape DuckDuckGo for additional live results (External API fallback)
    if (query) {
      try {
        const searchTerms = `${query} ${type !== 'all' ? type : 'internship scholarship'} 2026 students apply`;
        const response = await axios.get(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(searchTerms)}`, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
          timeout: 5000
        });
        const $ = cheerio.load(response.data);

        $('.result').each((i, el) => {
          if (i >= 5) return;
          const titleEl = $(el).find('.result__title a');
          const title = titleEl.text().trim();
          const ddgHref = titleEl.attr('href') || '';
          const snippet = $(el).find('.result__snippet').text().trim();

          if (title && ddgHref) {
            let cleanUrl = '';
            if (ddgHref.includes('uddg=')) {
              const paramMatch = ddgHref.match(/uddg=([^&]+)/);
              if (paramMatch && paramMatch[1]) {
                cleanUrl = decodeURIComponent(paramMatch[1]);
              }
            } else if (ddgHref.startsWith('http')) {
              cleanUrl = ddgHref;
            }

            if (!cleanUrl) return;

            let companyStr = 'External Organization';
            try { companyStr = new URL(cleanUrl).hostname.replace('www.', '').split('.')[0]; } catch (e) {}

            results.push({
              id: `scrape_${this.generateHash(cleanUrl + i)}`,
              title: title,
              company: companyStr.charAt(0).toUpperCase() + companyStr.slice(1),
              description: snippet,
              type: type === 'scholarship' ? 'Scholarship' : 'External Opportunity',
              category: type === 'all' ? 'opportunity' : type,
              url: cleanUrl,
              source: 'Web Search',
              matchScore: 60 - i,
              matchReason: 'Keyword match from web search'
            });
          }
        });
      } catch (e) {
        console.warn('[SearchService] Web scrape failed:', e.message);
      }
    }

    return this.deduplicate(results);
  }

  static calculateMatchScore(opp, querySkills, lowerQuery) {
    if (!querySkills.length) return { score: 80, reason: 'All Opportunities' };
    
    const reqSkills = (opp.requiredSkills || []).map(s => s.toLowerCase());
    const prefSkills = (opp.preferredSkills || []).map(s => s.toLowerCase());
    const titleMatch = opp.title.toLowerCase().includes(lowerQuery) || opp.company.toLowerCase().includes(lowerQuery);

    let exactReqMatches = 0;
    let exactPrefMatches = 0;

    querySkills.forEach(qs => {
      if (reqSkills.some(rs => rs.includes(qs))) exactReqMatches++;
      else if (prefSkills.some(ps => ps.includes(qs))) exactPrefMatches++;
    });

    if (exactReqMatches === querySkills.length && querySkills.length > 0) {
      return { score: 100, reason: 'Exact Required Skills Match' };
    }
    if (exactReqMatches > 0) {
      return { score: 90 + (exactReqMatches * 2), reason: 'Multiple Required Skills Match' };
    }
    if (exactPrefMatches > 0) {
      return { score: 80 + (exactPrefMatches * 2), reason: 'Preferred Skills Match' };
    }
    if (titleMatch) {
      return { score: 75, reason: 'Title/Company Match' };
    }
    
    return { score: 0, reason: 'No Match' };
  }

  static calculateScholarshipMatch(schol, querySkills, lowerQuery, userProfile) {
    if (!querySkills.length) return { score: 80, reason: 'All Scholarships' };
    
    const reqCrit = (schol.requiredCriteria || []).map(s => s.toLowerCase());
    const prefCrit = (schol.preferredCriteria || []).map(s => s.toLowerCase());
    const titleMatch = schol.title.toLowerCase().includes(lowerQuery) || schol.provider.toLowerCase().includes(lowerQuery);

    let exactReqMatches = 0;
    querySkills.forEach(qs => {
      if (reqCrit.some(rs => rs.includes(qs))) exactReqMatches++;
      else if (prefCrit.some(ps => ps.includes(qs))) exactReqMatches++;
    });

    if (exactReqMatches > 0) return { score: 90 + exactReqMatches, reason: 'Criteria Match' };
    if (titleMatch) return { score: 85, reason: 'Title Match' };
    return { score: 0, reason: 'No Match' };
  }

  static calculateCompanyMatch(comp, querySkills, lowerQuery) {
    if (!querySkills.length) return { score: 0, reason: 'No Match' };
    
    const techStack = (comp.techStack || []).map(s => s.toLowerCase());
    const titleMatch = comp.name.toLowerCase().includes(lowerQuery);

    let techMatches = 0;
    querySkills.forEach(qs => {
      if (techStack.some(ts => ts.includes(qs))) techMatches++;
    });

    if (techMatches > 0) return { score: 70 + techMatches, reason: 'Company Tech Stack Association' };
    if (titleMatch) return { score: 80, reason: 'Company Name Match' };
    return { score: 0, reason: 'No Match' };
  }

  static deduplicate(items) {
    const seen = new Set();
    const unique = [];
    for (const item of items) {
      const key = `${(item.url || '').toLowerCase()}::${(item.title || '').toLowerCase()}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(item);
      }
    }
    return unique;
  }

  static filterAndPaginate(items, userProfile, page = 1, limit = 20) {
    const userSkills = (userProfile.skills || []).map(s => s.toLowerCase());
    
    const scored = items.map(item => {
      let score = item.matchScore || 50;
      // Boost slightly if user profile skills match, unless it's already a 100% match
      if (score < 100 && userSkills.length > 0) {
         const itemSkills = (item.requiredSkills || item.skills || []).map(s => s.toLowerCase());
         const matches = userSkills.filter(sk => itemSkills.some(isk => isk.includes(sk)));
         score += matches.length;
      }
      return { ...item, matchScore: Math.min(score, 100) };
    });

    scored.sort((a, b) => b.matchScore - a.matchScore);

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginated = scored.slice(startIndex, endIndex);

    return {
      results: paginated,
      total: scored.length,
      page: page,
      limit: limit,
      has_next: endIndex < scored.length
    };
  }
}

module.exports = SearchService;
