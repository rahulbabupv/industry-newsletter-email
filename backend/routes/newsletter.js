const express = require('express');
const Anthropic = require('@anthropic-ai/sdk');
const { requireAuth, supabase } = require('../middleware/auth');

const router = express.Router();
const anthropic = new Anthropic();

// ─────────────────────────────────────────────────────────────
// POST /api/newsletter/generate
//
// Body: { articles: Article[], topic: string, fromDate: string, toDate: string }
//
// Sends the user-selected articles to Claude and asks it to produce
// a complete, professionally formatted newsletter in HTML.
// ─────────────────────────────────────────────────────────────
router.post('/generate', requireAuth, async (req, res) => {
  const { articles, topic, fromDate, toDate } = req.body;

  if (!articles || articles.length === 0) {
    return res.status(400).json({ error: 'Please select at least one article.' });
  }

  // Format the date range for the newsletter header
  const fmt = (d) =>
    new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  const dateRange = `${fmt(fromDate)} – ${fmt(toDate)}`;

  // Build the article list Claude will work from
  const articlesList = articles
    .map(
      (a, i) =>
        `${i + 1}. HEADLINE: ${a.title}
   SOURCE: ${a.source}
   DATE: ${new Date(a.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
   IMAGE_URL: ${a.urlToImage || ''}
   SUMMARY: ${a.summary}`
    )
    .join('\n\n');

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: `You are a senior editor for a premium Indian industry trade publication covering the ${topic} sector.

Generate newsletter content for the week of ${dateRange}. Return ONLY valid JSON — no markdown, no extra text.

CRITICAL: For EVERY article, assign EXACTLY ONE tag. Available tags: Tender, Prices, Export, Production, Policy, Market, Companies, Import, Sustainability

🔴 PRIORITY TAG ASSIGNMENT:
1. FIRST: If article is a tender, auction, RFP, procurement notice, or bidding opportunity → MUST tag as "Tender"
2. SECOND: If article summary starts with "TENDER ALERT:" → MUST tag as "Tender"
3. OTHERWISE: Pick the tag that best categorizes the article's focus

Never omit the tag field. Every article must have exactly one tag.

Use this exact structure:
{
  "newsletterTitle": "The ${topic} Insider",
  "tagline": "India's Weekly ${topic} Industry Briefing",
  "edition": "Week of ${dateRange}",
  "executiveSummary": "3-4 sentence paragraph capturing the biggest themes of the week in a professional, authoritative tone.",
  "articles": [
    {
      "headline": "Polished version of the article headline",
      "source": "Publication Name",
      "date": "DD Mon YYYY",
      "body": "3-4 sentence professional write-up synthesising the article's key points for a business audience.",
      "tag": "Prices"
    }
  ],
  "outlook": "2-3 sentence forward-looking industry perspective — trends, risks, or opportunities to watch next week."
}

Articles to include:
${articlesList}`,
        },
      ],
    });

    // Parse Claude's JSON response
    const raw = response.content[0].text;
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Claude did not return valid JSON');
    const newsletterData = JSON.parse(jsonMatch[0]);

    // Inject image URLs by position — don't rely on Claude to copy them
    if (Array.isArray(newsletterData.articles)) {
      newsletterData.articles = newsletterData.articles.map((article, i) => ({
        ...article,
        imageUrl: articles[i]?.urlToImage || '',
      }));
    }

    // Save to database (non-blocking — don't fail the request if this errors)
    supabase.from('newsletters').insert({
      user_id:   req.user.id,
      topic,
      from_date: fromDate,
      to_date:   toDate,
      data:      newsletterData,
    }).then(({ error }) => {
      if (error) console.error('Failed to save newsletter:', error.message);
    });

    res.json({ newsletter: newsletterData });
  } catch (err) {
    console.error('Newsletter generation error:', err.message);

    if (err.status === 401) {
      return res.status(401).json({
        error: 'Invalid Anthropic API key — please update ANTHROPIC_API_KEY in your .env file.',
      });
    }

    res.status(500).json({ error: 'Failed to generate newsletter. Please try again.' });
  }
});

// GET /api/newsletter/history — returns the authenticated user's past newsletters
router.get('/history', requireAuth, async (req, res) => {
  const { data, error } = await supabase
    .from('newsletters')
    .select('id, topic, from_date, to_date, created_at, data')
    .eq('user_id', req.user.id)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error('History fetch error:', error.message);
    return res.status(500).json({ error: 'Failed to fetch newsletter history.' });
  }

  res.json({ history: data });
});

// DELETE /api/newsletter/history/:id — delete one saved newsletter
router.delete('/history/:id', requireAuth, async (req, res) => {
  const { error } = await supabase
    .from('newsletters')
    .delete()
    .eq('id', req.params.id)
    .eq('user_id', req.user.id);

  if (error) {
    return res.status(500).json({ error: 'Failed to delete newsletter.' });
  }

  res.json({ success: true });
});

// GET /api/newsletter/view/:id — public endpoint to view newsletter (no auth required)
router.get('/view/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('newsletters')
    .select('id, topic, from_date, to_date, created_at, data')
    .eq('id', req.params.id)
    .single();

  if (error || !data) {
    return res.status(404).json({ error: 'Newsletter not found.' });
  }

  res.json({ newsletter: data });
});

module.exports = router;
