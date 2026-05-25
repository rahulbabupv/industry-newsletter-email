import React from 'react';

// Premium Editorial Color Palette (Matching Global Financial Briefs)
const C = {
  primary:    '#064e3b',  // Deep corporate emerald green
  textDark:   '#111827',  // Crisp high-contrast charcoal black
  bodyText:   '#232b24',  // Subdued charcoal for excellent paragraph reading
  mutedText:  '#4b5563',  // Refined gray for dates and metadata
  bgPaper:    '#FDFBF7',  // Premium off-white matte paper tint
  borderRule: '#e5e7eb',  // Thin hairline dividers
  summaryBg:  '#f4f1ea',  // Cream highlight color for executive briefs
  white:      '#FFFFFF',
};

// High-End Typography Pairings Linked in index.html
const FONT_HEADLINE = "'Merriweather', Georgia, serif";
const FONT_BODY = "'Inter', system-ui, -apple-system, sans-serif";

const TAG_COLORS = {
  Prices:         '#064e3b',
  Export:         '#1e40af',
  Production:     '#0f766e',
  Policy:         '#581c87',
  Market:         '#854d0e',
  Companies:      '#1e3a8a',
  Import:         '#7c2d12',
  Sustainability: '#14532d',
};

function Tag({ label }) {
  const bg = TAG_COLORS[label] || C.primary;
  return (
    <span style={{
      display:       'inline-block',
      background:    bg,
      color:         C.white,
      fontFamily:    FONT_BODY,
      fontSize:      '9px',
      fontWeight:    700,
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
      padding:       '2px 6px',
      borderRadius:  '2px',
      marginLeft:    '8px',
      verticalAlign: 'middle',
    }}>
      {label}
    </span>
  );
}

function SectionLabel({ children }) {
  return (
    <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
      <span style={{
        fontFamily:    FONT_BODY,
        fontSize:      '11px',
        fontWeight:    800,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color:         C.primary,
      }}>
        {children}
      </span>
      <div style={{ flex: 1, height: '1px', background: C.borderRule }} />
    </div>
  );
}

function ImageBlock({ url, height }) {
  if (url) {
    return (
      <div style={{ width: '100%', height: `${height}px`, overflow: 'hidden' }}>
        <img
          src={url}
          alt=""
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      </div>
    );
  }
  // Elegant Editorial Placeholder Box
  return (
    <div style={{
      width:          '100%',
      height:         `${height}px`,
      background:     `linear-gradient(180deg, #f9f6f0 0%, ${C.summaryBg} 100%)`,
      display:        'flex',
      alignItems:     'center',
      justifyContent: 'center',
      borderBottom:   `1px solid ${C.borderRule}`,
    }}>
      <span style={{ 
        fontFamily: FONT_BODY, 
        color: C.mutedText, 
        fontSize: '10px', 
        fontWeight: 600, 
        letterSpacing: '0.1em', 
        textTransform: 'uppercase' 
      }}>
        Industry News
      </span>
    </div>
  );
}

// Full width with clean typographical integration
function HeroArticle({ article }) {
  const { headline, source, date, body, tag, imageUrl } = article;
  return (
    <div style={{
      background:   C.white,
      border:       `1px solid ${C.borderRule}`,
      borderRadius: '4px',
      overflow:     'hidden',
      marginBottom: '24px',
    }}>
      <ImageBlock url={imageUrl} height={240} />
      <div style={{ padding: '24px 28px' }}>
        <div style={{ marginBottom: '12px' }}>
          <span style={{
            fontFamily:    FONT_HEADLINE,
            fontSize:      '24px',
            fontWeight:    700,
            color:         C.textDark,
            lineHeight:    1.25,
            letterSpacing: '-0.01em',
          }}>
            {headline}
          </span>
          {tag && <Tag label={tag} />}
        </div>
        <div style={{ fontFamily: FONT_BODY, fontSize: '11px', color: C.mutedText, marginBottom: '14px' }}>
          <span style={{ color: C.primary, fontWeight: 700 }}>{source}</span>
          <span style={{ margin: '0 6px' }}>·</span>
          {date}
        </div>
        <div style={{ fontFamily: FONT_BODY, fontSize: '14px', lineHeight: '1.65', color: C.bodyText }}>
          {body}
        </div>
      </div>
    </div>
  );
}

// Modular Grid Card
function SmallCard({ article }) {
  const { headline, source, date, body, tag, imageUrl } = article;
  return (
    <div style={{
      background:   C.white,
      border:       `1px solid ${C.borderRule}`,
      borderRadius: '4px',
      overflow:     'hidden',
      display:      'flex',
      flexDirection:'column',
      flex:         1,
    }}>
      <ImageBlock url={imageUrl} height={140} />
      <div style={{ padding: '16px 18px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginBottom: '10px' }}>
          <span style={{ 
            fontFamily: FONT_HEADLINE, 
            fontSize: '15px', 
            fontWeight: 700, 
            color: C.textDark, 
            lineHeight: 1.3 
          }}>
            {headline}
          </span>
          {tag && <Tag label={tag} />}
        </div>
        <div style={{ fontFamily: FONT_BODY, fontSize: '10px', color: C.mutedText, marginBottom: '10px' }}>
          <span style={{ color: C.primary, fontWeight: 700 }}>{source}</span>
          <span style={{ margin: '0 5px' }}>·</span>
          {date}
        </div>
        <div style={{ fontFamily: FONT_BODY, fontSize: '12.5px', lineHeight: '1.6', color: C.bodyText, flex: 1 }}>
          {body}
        </div>
      </div>
    </div>
  );
}

// Multi-Column List Layout with Hairline Separators
function ListArticle({ article, index }) {
  const { headline, source, date, body, tag, imageUrl } = article;
  return (
    <div style={{
      background:   C.white,
      border:       `1px solid ${C.borderRule}`,
      borderRadius: '4px',
      overflow:     'hidden',
      display:      'flex',
      marginBottom: '16px',
    }}>
      <div style={{ width: '140px', flexShrink: 0, position: 'relative' }}>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt=""
            style={{ width: '140px', height: '100%', minHeight: '120px', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <div style={{
            width:          '140px',
            minHeight:      '120px',
            height:         '100%',
            background:     `linear-gradient(180deg, #f9f6f0, ${C.summaryBg})`,
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            borderRight:    `1px solid ${C.borderRule}`,
          }}>
            <span style={{ fontFamily: FONT_HEADLINE, color: C.mutedText, fontSize: '20px', fontWeight: 700 }}>
              {String(index).padStart(2, '0')}
            </span>
          </div>
        )}
      </div>

      <div style={{ padding: '16px 20px', flex: 1 }}>
        <div style={{ marginBottom: '8px' }}>
          <span style={{ fontFamily: FONT_HEADLINE, fontSize: '15px', fontWeight: 700, color: C.textDark, lineHeight: 1.3 }}>
            {headline}
          </span>
          {tag && <Tag label={tag} />}
        </div>
        <div style={{ fontFamily: FONT_BODY, fontSize: '10px', color: C.mutedText, marginBottom: '10px' }}>
          <span style={{ color: C.primary, fontWeight: 700 }}>{source}</span>
          <span style={{ margin: '0 5px' }}>·</span>
          {date}
        </div>
        <div style={{ fontFamily: FONT_BODY, fontSize: '13px', lineHeight: '1.6', color: C.bodyText }}>
          {body}
        </div>
      </div>
    </div>
  );
}

export default function NewsletterTemplate({ data }) {
  const { newsletterTitle, tagline, edition, executiveSummary, articles, outlook } = data;

  const hero     = articles?.[0];
  const featured = articles?.slice(1, 3) ?? [];
  const rest     = articles?.slice(3)    ?? [];

  return (
    <div style={{ 
      fontFamily: FONT_BODY, 
      background: C.bgPaper, 
      color: C.bodyText, 
      maxWidth: '760px', 
      margin: '0 auto',
      padding: '0'
    }}>

      {/* Stark, Authoritative Corporate Masthead */}
      <div style={{
        background:    C.primary,
        color:         C.white,
        padding:       '54px 54px 44px',
        borderBottom:  `3px solid #d4a85a`, // Sophisticated gold structural line
      }}>
        <div style={{ 
          fontFamily:    FONT_HEADLINE, 
          fontSize:      '36px', 
          fontWeight:    700, 
          letterSpacing: '-0.02em', 
          lineHeight:    1.05 
        }}>
          {newsletterTitle}
        </div>
        <div style={{ 
          fontFamily:    FONT_BODY, 
          fontSize:      '13px', 
          color:         '#cbd5e1', 
          marginTop:     '10px', 
          letterSpacing: '0.02em',
          fontWeight:    400 
        }}>
          {tagline}
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.12)', margin: '24px 0 16px' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontFamily: FONT_BODY, fontSize: '11px', color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>
            {edition}
          </div>
          <div style={{
            border:        '1px solid rgba(255,255,255,0.4)',
            color:         C.white,
            fontSize:      '10px',
            fontWeight:    600,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            padding:       '3px 12px',
            borderRadius:  '2px',
          }}>
            Weekly Intelligence Brief
          </div>
        </div>
      </div>

      {/* Main Document Frame */}
      <div style={{ padding: '40px 54px' }}>

        {/* Executive Summary Section */}
        <div style={{ marginBottom: '36px' }}>
          <SectionLabel>This Week in Brief</SectionLabel>
          <div style={{
            background:   C.summaryBg,
            borderLeft:   `3px solid ${C.primary}`,
            padding:      '20px 24px',
            borderRadius: '2px',
            fontFamily:   FONT_HEADLINE,
            fontSize:     '14px',
            lineHeight:   '1.7',
            color:        C.textDark,
          }}>
            {executiveSummary}
          </div>
        </div>

        {/* News Coverage Layout Container */}
        <div style={{ marginBottom: '36px' }}>
          <SectionLabel>Key Stories</SectionLabel>

          {hero && <HeroArticle article={hero} />}

          {/* Balanced Two-Column Flex Grid Layout */}
          {featured.length > 0 && (
            <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', alignItems: 'stretch' }}>
              {featured.map((article, i) => (
                <SmallCard key={i} article={article} />
              ))}
            </div>
          )}

          {rest.map((article, i) => (
            <ListArticle key={i} article={article} index={i + 4} />
          ))}
        </div>

        {/* Strategic Market Outlook Block */}
        <div style={{ marginBottom: '16px' }}>
          <SectionLabel>Industry Outlook</SectionLabel>
          <div style={{
            background:   C.white,
            border:       `1px solid ${C.borderRule}`,
            borderRadius: '4px',
            padding:      '24px 28px',
            fontFamily:   FONT_BODY,
            fontSize:     '13.5px',
            lineHeight:   '1.65',
            color:        C.bodyText,
          }}>
            {outlook}
          </div>
        </div>
      </div>

      {/* Footer Branding Line */}
      <div style={{
        background:    '#022c22',
        color:         '#94a3b8',
        padding:       '20px 54px',
        fontSize:      '11px',
        fontFamily:    FONT_BODY,
        display:       'flex',
        justifyContent: 'space-between',
        alignItems:    'center',
        borderTop:     '1px solid rgba(255,255,255,0.05)'
      }}>
        <span style={{ color: C.white, fontWeight: 600, letterSpacing: '0.02em' }}>
          {newsletterTitle}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span>{edition}</span>
          <div style={{ width: '3px', height: '3px', borderRadius: '50%', background: '#d4a85a' }} />
          <span style={{ color: '#d4a85a', fontWeight: 500 }}>Corporate Intelligence</span>
        </div>
      </div>

    </div>
  );
}