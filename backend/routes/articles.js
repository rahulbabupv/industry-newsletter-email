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
    // Explicit tender query with broader keywords for government procurement
    const rssQueryTenders = encodeURIComponent(`${topic} (tender OR tenders OR auction OR procurement OR bidding OR "supply notice" OR "e-marketplace" OR "GeM" OR "request for proposal" OR RFP OR "invitation to bid" OR ITB OR "notice inviting" OR "notice for tender") India`);

    const rssBase = 'https://news.google.com/rss/search?hl=en-IN&gl=IN&ceid=IN:en&q=';

    // Run all data-gathering pipelines in parallel
    const [indiaRes, globalRes, rss1Res, rss2Res, rssTenderRes] = await Promise.allSettled([
      // NewsAPI: topic + India in title
      axios.get('https://newsapi.org/v2/everything', {
        params: { ...commonParams, q: `${topic} India`, pageSize: 30 },
      }),
      // NewsAPI: Explicit tender/auction query
      axios.get('https://newsapi.org/v2/everything', {
        params: { ...commonParams, q: `${topic} (tender OR auction OR procurement OR "supply notice") India`, pageSize: 30 },
      }),
      // Google News RSS: industry + India
      rssParser.parseURL(`${rssBase}${rssQuery1}`),
      // Google News RSS: industry keywords (global)
      rssParser.parseURL(`${rssBase}${rssQuery2}`),
      // Google News RSS: Dedicated Tender/Auction/Procurement Channel
      rssParser.parseURL(`${rssBase}${rssQueryTenders}`),
    ]);

    // Normalise NewsAPI articles
    const newsApiArticles = [
      ...(indiaRes.status  === 'fulfilled' ? indiaRes.value.data.articles  || [] : []),
      ...(globalRes.status === 'fulfilled' ? globalRes.value.data.articles || [] : []),
    ];
    console.log(`[DEBUG] NewsAPI returned ${newsApiArticles.length} articles for topic: ${topic}`);
    if (indiaRes.status !== 'fulfilled') console.log(`[DEBUG] NewsAPI India query failed: ${indiaRes.reason?.message}`);
    if (globalRes.status !== 'fulfilled') console.log(`[DEBUG] NewsAPI tender query failed: ${globalRes.reason?.message}`);

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
    console.log(`[DEBUG] RSS feeds returned ${rssArticles.length} articles total`);

    // Filter RSS articles to the requested date range
    const from = new Date(fromDate);
    const to   = new Date(toDate);
    to.setHours(23, 59, 59); // include the full "to" day
    const rssFiltered = rssArticles.filter((a) => {
      const d = new Date(a.publishedAt);
      return d >= from && d <= to;
    });
    console.log(`[DEBUG] RSS articles after date filtering: ${rssFiltered.length}`);

    // Merge all sources and deduplicate by URL
    const seen = new Set();
    for (const article of [...newsApiArticles, ...rssFiltered]) {
      if (article.url && !seen.has(article.url)) {
        seen.add(article.url);
        rawArticles.push(article);
      }
    }
    console.log(`[DEBUG] Total articles after deduplication: ${rawArticles.length}`);
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
  console.log(`[DEBUG] Articles after cleaning (removing [Removed] etc): ${cleanArticles.length}`);

  if (cleanArticles.length === 0) {
    console.log(`[DEBUG] No clean articles, returning empty results`);
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

🔴 MANDATORY KEEP RULES - Do NOT filter these out:
- Government tender notices, auctions, and procurement calls
- Request for Proposals (RFPs) and Invitation to Bid (ITB)
- Supply notices and e-marketplace (GeM) announcements
- Any notice containing: tender, auction, procurement, bidding, RFP, ITB, "notice inviting"
- Department/Ministry announcements for ${topic} sector

These are critical commercial intelligence that MUST be included.

Return ONLY a JSON array of the numbers to KEEP, e.g. [1, 2, 3, 5]. When in doubt, keep the article. No other text.

Articles:
${titlesBlock}`,
      }],
    });

    const raw = filterResponse.content[0].text;
    console.log(`[DEBUG] Claude filter response: ${raw}`);
    const match = raw.match(/\[[\s\S]*?\]/);
    if (match) {
      const keepIndices = new Set(JSON.parse(match[0]));
      validArticles = cleanArticles.filter((_, i) => keepIndices.has(i + 1));
      console.log(`[DEBUG] Claude kept ${validArticles.length} articles out of ${cleanArticles.length}`);
    } else {
      console.log(`[DEBUG] Claude response didn't contain valid JSON array`);
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
          a.content ? a.content.substring(0, 1000) : 'N/A'
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

For EACH article below, write a brief 3-line summary based on the title, description, and content.
If content is limited, infer reasonable context from the title and description.

SPECIAL HANDLING FOR TENDERS/AUCTIONS/PROCUREMENT:
If the item is a tender, auction, RFP, GeM notice, or procurement call:
- Line 1: "TENDER ALERT: [Authority] invites bids for [Commodity]"
- Line 2: "Deadline: [Date] | Scope: [Brief description]"
- Line 3: "Expected value/Contact: [Details]"

For regular industry news:
- Line 1: Key development or headline
- Line 2: Impact and stakeholders affected
- Line 3: Next steps or implications for the sector

Keep each line concise (max 15-20 words per line). Return ONLY a JSON array:
[
  { "index": 1, "summary": "Line 1\\nLine 2\\nLine 3" },
  { "index": 2, "summary": "Line 1\\nLine 2\\nLine 3" }
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