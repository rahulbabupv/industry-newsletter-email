const express = require('express');
const axios = require('axios');
const Anthropic = require('@anthropic-ai/sdk');
const RssParser = require('rss-parser');

const router = express.Router();
const rssParser = new RssParser({ timeout: 10000 });

const anthropic = new Anthropic();

// Extract a readable source name from a URL (used for RSS items that lack a source field)
function extractSourceName(url) {
  try {
    const host = new URL(url).hostname.replace('www.', '');
    // Map common domains to friendly names
    const known = {
      'economictimes.indiatimes.com': 'Economic Times',
      'livemint.com':                 'Livemint',
      'thehindubusinessline.com':     'BusinessLine',
      'business-standard.com':        'Business Standard',
      'timesofindia.indiatimes.com':  'Times of India',
      'ndtv.com':                     'NDTV',
      'hindustantimes.com':           'Hindustan Times',
      'thehindu.com':                 'The Hindu',
      'financialexpress.com':         'Financial Express',
      'moneycontrol.com':             'Moneycontrol',
    };
    return known[host] || host;
  } catch {
    return 'Unknown Source';
  }
}

// Industry-specific keywords for each topic.
// Expanded to explicitly target commercial tenders, RFPs, and public procurement notices.
const TOPIC_KEYWORDS = {
  Tea:     'tea industry OR tea market OR tea prices OR tea export OR tea auction OR tea production OR tea board OR tea plantation OR tea brand OR tea imports OR "tea tender" OR "procurement of tea" OR "supply of tea" OR "RFP tea"',
  Coffee:  'coffee industry OR coffee market OR coffee prices OR coffee export OR coffee production OR coffee brand OR coffee chain OR coffee imports OR cafe OR "coffee tender" OR "procurement of coffee" OR "supply of coffee" OR "RFP coffee"',
  QSR:     'QSR OR quick service restaurant OR fast food OR food chain OR restaurant industry OR food delivery OR dine-in OR food court OR "catering tender" OR "food supply tender"',
  Meat:    'meat industry OR poultry industry OR livestock OR meat processing OR meat export OR meat prices OR chicken prices OR mutton OR seafood OR "meat tender" OR "poultry procurement"',
  Dairy:   'dairy industry OR milk prices OR dairy market OR dairy export OR dairy production OR dairy brand OR milk production OR cheese OR butter OR paneer OR "milk tender" OR "dairy procurement"',
  Spices:  'spices industry OR spice export OR spice market OR spice prices OR pepper OR cardamom OR turmeric OR cumin OR coriander OR spice board OR "spice tender" OR "spices procurement"',
  Alcohol: 'alcohol industry OR liquor market OR spirits OR beer OR wine OR distillery OR alcohol production OR alcohol export OR alcohol prices OR liquor sales OR breweries OR distilleries OR alcohol regulation OR alcohol consumption OR "liquor license tender" OR "excise auction"',
};

// ─────────────────────────────────────────────────────────────
// POST /api/articles/fetch
//
// Body: { topic: string, fromDate: "YYYY-MM-DD", toDate: "YYYY-MM-DD" }
//
// 1. Calls NewsAPI and Google News RSS to search for articles and commercial tenders
// 2. Sends the results to Claude to filter out completely irrelevant noise
// 3. Generates concise summaries for the final valid selection
// 4. Returns the combined list to the frontend
// ─────────────────────────────────────────────────────────────
router.post('/fetch', async (req, res) => {
  const { topic, fromDate, toDate } = req.body;

  // Basic validation
  if (!topic || !fromDate || !toDate) {
    return res.status(400).json({ error: 'topic, fromDate, and toDate are all required.' });
  }

  let rawArticles = [];
  try {
    const keywords = TOPIC_KEYWORDS[topic] || topic;

    const commonParams = {
      searchIn: 'title',   // topic MUST be in the headline — best relevance signal
      from: fromDate,
      to: toDate,
      language: 'en',
      sortBy: 'relevancy',
      apiKey: process.env.NEWS_API_KEY,
    };

    // Google News RSS configuration
    const rssQuery1 = encodeURIComponent(`${topic} industry India`);
    const rssQuery2 = encodeURIComponent(`${topic} ${keywords}`);
    // Explicit transactional pipeline query targeting official procurement notices and tender announcements
    const rssQueryTenders = encodeURIComponent(`${topic} (tender OR tenders OR procurement OR bidding OR "supply notice" OR "e-marketplace" OR "GeM" OR "request for proposal" OR RFP OR "invitation to bid" OR ITB) India`);
    
    const rssBase = 'https://news.google.com/rss/search?hl=en-IN&gl=IN&ceid=IN:en&q=';

    // Run all five data-gathering pipelines in parallel
    const [indiaRes, globalRes, rss1Res, rss2Res, rssTenderRes] = await Promise.allSettled([
      // NewsAPI: topic + India in title
      axios.get('https://newsapi.org/v2/everything', {
        params: { ...commonParams, q: `${topic} India`, pageSize: 30 },
      }),
      // NewsAPI: topic + industry keywords in title
      axios.get('https://newsapi.org/v2/everything', {
        params: { ...commonParams, q: `${topic} ${keywords}`, pageSize: 30 },
      }),
      // Google News RSS: industry + India
      rssParser.parseURL(`${rssBase}${rssQuery1}`),
      // Google News RSS: industry keywords (global)
      rssParser.parseURL(`${rssBase}${rssQuery2}`),
      // Google News RSS: Dedicated Procurement & Tender Capture Channel
      rssParser.parseURL(`${rssBase}${rssQueryTenders}`),
    ]);

    // Normalise NewsAPI articles
    const newsApiArticles = [
      ...(indiaRes.status  === 'fulfilled' ? indiaRes.value.data.articles  || [] : []),
      ...(globalRes.status === 'fulfilled' ? globalRes.value.data.articles || [] : []),
    ];

    // Normalise RSS items into the same shape as NewsAPI articles
    const toRssArticles = (result) => {
      if (result.status !== 'fulfilled') return [];
      return (result.value.items || []).map((item) => ({
        title:       item.title || '',
        description: item.contentSnippet || item.summary || '',
        url:         item.link  || '',
        publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
        source:      { name: item.source?.name || extractSourceName(item.link) },
        urlToImage:  null,
        content:     '',
      }));
    };

    const rssArticles = [
      ...toRssArticles(rss1Res), 
      ...toRssArticles(rss2Res),
      ...toRssArticles(rssTenderRes) // Merging structural tender updates into processing queue
    ];

    // Filter RSS articles to the requested date range
    const from = new Date(fromDate);
    const to   = new Date(toDate);
    to.setHours(23, 59, 59); // include the full "to" day
    const rssFiltered = rssArticles.filter((a) => {
      const d = new Date(a.publishedAt);
      return d >= from && d <= to;
    });

    // Merge all sources and deduplicate by URL
    const seen = new Set();
    for (const article of [...newsApiArticles, ...rssFiltered]) {
      if (article.url && !seen.has(article.url)) {
        seen.add(article.url);
        rawArticles.push(article);
      }
    }
  } catch (err) {
    const status = err.response?.status;
    if (status === 401) {
      return res.status(401).json({ error: 'Invalid NewsAPI key — please update NEWS_API_KEY in your .env file.' });
    }
    if (status === 429) {
      return res.status(429).json({ error: 'NewsAPI rate limit hit. Wait a moment and try again.' });
    }
    console.error('NewsAPI error:', err.response?.data || err.message);
    return res.status(500).json({ error: 'Failed to reach NewsAPI. Check your internet connection.' });
  }

  // Remove articles deleted/removed by NewsAPI or missing content
  const cleanArticles = rawArticles.filter(
    (a) => a.title && a.title !== '[Removed]' && a.description
  );

  if (cleanArticles.length === 0) {
    return res.json({ articles: [] });
  }

  // ── Step 2: Ask Claude to filter out irrelevant articles ──
  let validArticles = cleanArticles;
  try {
    const titlesBlock = cleanArticles
      .map((a, i) => `${i + 1}. ${a.title} — ${a.description}`)
      .join('\n');

    const filterResponse = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 500,
      messages: [{
        role: 'user',
        content: `You are filtering news and business intelligence for a professional ${topic} industry newsletter.

Below is a numbered list of item titles and descriptions. Keep an item if it is about the ${topic} industry in any way — prices, companies, exports, imports, production, consumption, regulation, market trends, or major events.

CRITICAL REQUIREMENT: You MUST keep all formal procurement notices, invitations to bid, corporate supply tenders, request for proposals (RFPs), and Government e-Marketplace (GeM) notification updates regarding the ${topic} sector. These are high-priority commercial indicators.

Return a JSON array of the numbers to KEEP, e.g. [1, 2, 3, 5]. When in doubt, keep the article. No other text.

Articles:
${titlesBlock}`,
      }],
    });

    const raw = filterResponse.content[0].text;
    const match = raw.match(/\[[\s\S]*?\]/);
    if (match) {
      const keepIndices = new Set(JSON.parse(match[0]));
      validArticles = cleanArticles.filter((_, i) => keepIndices.has(i + 1));
    }
  } catch (err) {
    console.error('Claude filtering error:', err.message);
  }

  if (validArticles.length === 0) {
    return res.json({ articles: [] });
  }

  // ── Step 3: Generate AI summaries via Claude ──────────────
  const articlesBlock = validArticles
    .map(
      (a, i) =>
        `Article ${i + 1}:\nTitle: ${a.title}\nDescription: ${a.description}\nContent: ${
          a.content ? a.content.substring(0, 400) : 'N/A'
        }`
    )
    .join('\n\n---\n\n');

  let summaries = [];
  try {
    const claudeResponse = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 3000,
      messages: [
        {
          role: 'user',
          content: `You are an editor for a professional Indian industry newsletter covering the ${topic} sector.

For EACH of the items below (which may include general industry news or official procurement/tender alerts), write a concise 3-4 sentence summary in a neutral, professional tone suitable for business leaders. 

If the item is a procurement notice or tender, make sure to capture the key execution requirements, the issuing entity (e.g., Tea Board, Military, Government), and scope of supply if visible.

Return ONLY a JSON array — no extra text before or after. Format:
[
  { "index": 1, "summary": "..." },
  { "index": 2, "summary": "..." }
]

Articles:
${articlesBlock}`,
        },
      ],
    });

    const raw = claudeResponse.content[0].text;
    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      summaries = JSON.parse(jsonMatch[0]);
    }
  } catch (err) {
    console.error('Claude summarisation error:', err.message);
  }

  // ── Step 4: Merge articles + summaries ───────────────────
  const articles = validArticles.map((article, i) => {
    const summaryObj = summaries.find((s) => s.index === i + 1);
    return {
      id: i + 1,
      title: article.title,
      source: article.source?.name || 'Unknown Source',
      publishedAt: article.publishedAt,
      url: article.url,
      urlToImage: article.urlToImage || null,
      summary: summaryObj?.summary || article.description || 'No summary available.',
    };
  });

  res.json({ articles });
});

module.exports = router;