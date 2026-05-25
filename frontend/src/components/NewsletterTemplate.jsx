import React from 'react';

// Premium Editorial Color Palette
const C = {
  primary:    '#064e3b',
  textDark:   '#111827',
  bodyText:   '#232b24',
  mutedText:  '#4b5563',
  bgPaper:    '#FDFBF7',
  borderRule: '#e5e7eb',
  summaryBg:  '#f4f1ea',
  white:      '#FFFFFF',
};

const FONT_HEADLINE = "'Merriweather', Georgia, serif";
const FONT_BODY = "'Inter', system-ui, -apple-system, sans-serif";

// Deep Image Variety Database
const TOPIC_IMAGERY_MATRIX = {
  Tea: [
    'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1563822249548-9a72b6353cd1?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?auto=format&fit=crop&w=800&q=80'
  ],
  Coffee: [
    'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=800&q=80'
  ],
  QSR: [
    'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80'
  ],
  Meat: [
    'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1551028150-64b9f398f678?auto=format&fit=crop&w=800&q=80'
  ],
  Dairy: [
    'https://images.unsplash.com/photo-1554844391-7681467472c2?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1528750951218-a10c17a26f63?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=800&q=80'
  ],
  Spices: [
    'https://images.unsplash.com/photo-1596040033229-a9821b059514?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1532336414038-cf1905047b2b?auto=format&fit=crop&w=800&q=80'
  ],
  Alcohol: [
    'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1528255671579-01b9e182ed1d?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=800&q=80'
  ],
};

const TAG_COLORS = {
  Prices:         '#064e3b', Export: '#1e40af', Production: '#0f766e',
  Policy:         '#581c87', Market: '#854d0e', Companies: '#1e3a8a',
  Import:         '#7c2d12', Sustainability: '#14532d',
};

function Tag({ label }) {
  const bg = TAG_COLORS[label] || C.primary;
  return (
    <span style={{
      display: 'inline-block', background: bg, color: C.white, fontFamily: FONT_BODY,
      fontSize: '9px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
      padding: '2px 6px', borderRadius: '2px', marginLeft: '8px', verticalAlign: 'middle',
    }}>
      {label}
    </span>
  );
}

function SectionLabel({ children }) {
  return (
    <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
      <span style={{ fontFamily: FONT_BODY, fontSize: '11px', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.primary }}>
        {children}
      </span>
      <div style={{ flex: 1, height: '1px', background: C.borderRule }} />
    </div>
  );
}

function ImageBlock({ url, height, topic, positionIndex = 0 }) {
  const imagePool = TOPIC_IMAGERY_MATRIX[topic] || TOPIC_IMAGERY_MATRIX.Tea;
  const fallbackImg = imagePool[positionIndex % imagePool.length];
  
  return (
    <div style={{ width: '100%', height: `${height}px`, overflow: 'hidden' }}>
      <img
        src={url || fallbackImg}
        alt={topic}
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', opacity: 0.95 }}
      />
    </div>
  );
}

function HeroArticle({ article, topic }) {
  const { headline, source, date, body, tag, imageUrl } = article;
  return (
    <div style={{ background: C.white, border: `1px solid ${C.borderRule}`, borderRadius: '4px', overflow: 'hidden', marginBottom: '24px' }}>
      <ImageBlock url={imageUrl} height={240} topic={topic} positionIndex={0} />
      <div style={{ padding: '24px 28px' }}>
        <div style={{ marginBottom: '12px' }}>
          <span style={{ fontFamily: FONT_HEADLINE, fontSize: '24px', fontWeight: 700, color: C.textDark, lineHeight: 1.25, letterSpacing: '-0.01em' }}>{headline}</span>
          {tag && <Tag label={tag} />}
        </div>
        <div style={{ fontFamily: FONT_BODY, fontSize: '11px', color: C.mutedText, marginBottom: '14px' }}>
          <span style={{ color: C.primary, fontWeight: 700 }}>{source}</span> <span style={{ margin: '0 6px' }}>·</span> {date}
        </div>
        <div style={{ fontFamily: FONT_BODY, fontSize: '14px', lineHeight: '1.65', color: C.bodyText }}>{body}</div>
      </div>
    </div>
  );
}

function SmallCard({ article, topic, positionIndex }) {
  const { headline, source, date, body, tag, imageUrl } = article;
  return (
    <div style={{ background: C.white, border: `1px solid ${C.borderRule}`, borderRadius: '4px', overflow: 'hidden', display: 'flex', flexDirection: 'column', flex: 1 }}>
      <ImageBlock url={imageUrl} height={140} topic={topic} positionIndex={positionIndex} />
      <div style={{ padding: '16px 18px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginBottom: '10px' }}>
          <span style={{ fontFamily: FONT_HEADLINE, fontSize: '15px', fontWeight: 700, color: C.textDark, lineHeight: 1.3 }}>{headline}</span>
          {tag && <Tag label={tag} />}
        </div>
        <div style={{ fontFamily: FONT_BODY, fontSize: '10px', color: C.mutedText, marginBottom: '10px' }}>
          <span style={{ color: C.primary, fontWeight: 700 }}>{source}</span> <span style={{ margin: '0 5px' }}>·</span> {date}
        </div>
        <div style={{ fontFamily: FONT_BODY, fontSize: '12.5px', lineHeight: '1.6', color: C.bodyText, flex: 1 }}>{body}</div>
      </div>
    </div>
  );
}

function ListArticle({ article, index, topic }) {
  const { headline, source, date, body, tag, imageUrl } = article;
  return (
    <div style={{ background: C.white, border: `1px solid ${C.borderRule}`, borderRadius: '4px', overflow: 'hidden', display: 'flex', marginBottom: '16px' }}>
      <div style={{ width: '140px', flexShrink: 0, position: 'relative' }}>
        <ImageBlock url={imageUrl} height={120} topic={topic} positionIndex={index} />
      </div>
      <div style={{ padding: '16px 20px', flex: 1 }}>
        <div style={{ marginBottom: '8px' }}>
          <span style={{ fontFamily: FONT_HEADLINE, fontSize: '15px', fontWeight: 700, color: C.textDark, lineHeight: 1.3 }}>{headline}</span>
          {tag && <Tag label={tag} />}
        </div>
        <div style={{ fontFamily: FONT_BODY, fontSize: '10px', color: C.mutedText, marginBottom: '10px' }}>
          <span style={{ color: C.primary, fontWeight: 700 }}>{source}</span> <span style={{ margin: '0 5px' }}>·</span> {date}
        </div>
        <div style={{ fontFamily: FONT_BODY, fontSize: '13px', lineHeight: '1.6', color: C.bodyText }}>{body}</div>
      </div>
    </div>
  );
}

export default function NewsletterTemplate({ data, topic }) {
  const { newsletterTitle, tagline, edition, executiveSummary, articles, outlook } = data;

  // SMART SAFETY NET: If props fail, look inside the text content to detect the topic
  let activeTopic = topic || data?.topic;
  if (!activeTopic && newsletterTitle) {
    const textToScan = newsletterTitle.toLowerCase();
    if (textToScan.includes('coffee')) activeTopic = 'Coffee';
    else if (textToScan.includes('tea')) activeTopic = 'Tea';
    else if (textToScan.includes('qsr') || textToScan.includes('burger') || textToScan.includes('restaurant')) activeTopic = 'QSR';
    else if (textToScan.includes('meat') || textToScan.includes('poultry')) activeTopic = 'Meat';
    else if (textToScan.includes('dairy') || textToScan.includes('milk')) activeTopic = 'Dairy';
    else if (textToScan.includes('spice')) activeTopic = 'Spices';
    else if (textToScan.includes('alcohol') || textToScan.includes('wine') || textToScan.includes('beer')) activeTopic = 'Alcohol';
  }
  if (!activeTopic) activeTopic = 'Tea'; // Ground-level default fallback

  const hero = articles?.[0];
  const featured = articles?.slice(1, 3) ?? [];
  const rest = articles?.slice(3) ?? [];

  return (
    <div style={{ 
      fontFamily: FONT_BODY, background: C.bgPaper, color: C.bodyText, maxWidth: '760px', margin: '0 auto',
      padding: '0',
      // FIX: Removed the buggy 'pageBreakBefore' that was crashing html2canvas canvas captures!
    }}>
      {/* Stark, Authoritative Corporate Masthead */}
      <div style={{ background: C.primary, color: C.white, padding: '54px 54px 44px', borderBottom: `3px solid #d4a85a` }}>
        <div style={{ fontFamily: FONT_HEADLINE, fontSize: '36px', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.05 }}>{newsletterTitle}</div>
        <div style={{ fontFamily: FONT_BODY, fontSize: '13px', color: '#cbd5e1', marginTop: '10px' }}>{tagline}</div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.12)', margin: '24px 0 16px' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>{edition}</div>
          <div style={{ border: '1px solid rgba(255,255,255,0.4)', fontSize: '10px', padding: '3px 12px' }}>WEEKLY INTELLIGENCE BRIEF</div>
        </div>
      </div>

      {/* Main Document Frame */}
      <div style={{ padding: '40px 54px' }}>
        {/* Executive Summary Section */}
        <div style={{ marginBottom: '36px' }}>
          <SectionLabel>This Week in Brief</SectionLabel>
          <div style={{ background: C.summaryBg, borderLeft: `3px solid ${C.primary}`, padding: '20px 24px', fontFamily: FONT_HEADLINE, fontSize: '14px', lineHeight: '1.7', color: C.textDark }}>
            {executiveSummary}
          </div>
        </div>

        {/* News Coverage Layout Container */}
        <div style={{ marginBottom: '36px' }}>
          <SectionLabel>Key Stories</SectionLabel>
          {hero && <HeroArticle article={hero} topic={activeTopic} />}
          {/* Balanced Two-Column Flex Grid Layout */}
          {featured.length > 0 && (
            <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', alignItems: 'stretch' }}>
              {featured.map((article, i) => (
                <SmallCard key={i} article={article} topic={activeTopic} positionIndex={i + 1} />
              ))}
            </div>
          )}
          {rest.map((article, i) => (
            <ListArticle key={i} article={article} index={i + 3} topic={activeTopic} />
          ))}
        </div>

        {/* Strategic Market Outlook Block */}
        <div style={{ marginBottom: '16px' }}>
          <SectionLabel>Industry Outlook</SectionLabel>
          <div style={{ background: C.white, border: `1px solid ${C.borderRule}`, padding: '24px 28px', fontSize: '13.5px', lineHeight: '1.65' }}>{outlook}</div>
        </div>
      </div>

      {/* Footer Branding Line */}
      <div style={{ background: '#022c22', color: '#94a3b8', padding: '20px 54px', fontSize: '11px', display: 'flex', justifyContent: 'space-between' }}>
        <span>{newsletterTitle}</span>
        <span>{edition} | CORPORATE INTELLIGENCE</span>
      </div>
    </div>
  );
}