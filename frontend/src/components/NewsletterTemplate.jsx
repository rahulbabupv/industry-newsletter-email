import React from 'react';

const C = {
  green:      '#1a3d2b',
  greenDark:  '#122b1e',
  greenLight: '#eef4f0',
  gold:       '#d4a85a',
  dark:       '#1a2a1c',
  body:       '#2d3a2e',
  muted:      '#5a6e5c',
  rule:       '#c5d9c9',
  bg:         '#faf9f6',
  white:      '#FFFFFF',
};

const FONT = "'Segoe UI', 'Helvetica Neue', Arial, sans-serif";

const TAG_COLORS = {
  Prices:        '#1a3d2b',
  Export:        '#1d4f6e',
  Production:    '#2d6a3f',
  Policy:        '#4a3570',
  Market:        '#7a5c1e',
  Companies:     '#1d3d6e',
  Import:        '#6e3a1d',
  Sustainability:'#1a5c2e',
};

function Tag({ label }) {
  const bg = TAG_COLORS[label] || C.gold;
  return (
    <span style={{
      display:       'inline-block',
      background:    bg,
      color:         C.white,
      fontSize:      '9px',
      fontWeight:    700,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      padding:       '3px 8px',
      borderRadius:  '3px',
      marginLeft:    '8px',
      verticalAlign: 'middle',
    }}>
      {label}
    </span>
  );
}

function SectionLabel({ children }) {
  return (
    <div style={{ marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '10px' }}>
      <div style={{ width: '3px', height: '18px', background: C.gold, borderRadius: '2px', flexShrink: 0 }} />
      <span style={{
        fontSize:      '10px',
        fontWeight:    800,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color:         C.green,
      }}>
        {children}
      </span>
      <div style={{ flex: 1, height: '1px', background: C.rule }} />
    </div>
  );
}

// Reusable image block — shows image or a styled placeholder
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
  return (
    <div style={{
      width:          '100%',
      height:         `${height}px`,
      background:     `linear-gradient(135deg, ${C.greenLight} 0%, ${C.rule} 100%)`,
      display:        'flex',
      alignItems:     'center',
      justifyContent: 'center',
    }}>
      <span style={{ color: C.muted, fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
        Industry News
      </span>
    </div>
  );
}

// ── Hero article — full width with large image ────────────────
function HeroArticle({ article }) {
  const { headline, source, date, body, tag, imageUrl } = article;
  return (
    <div style={{
      background:   C.white,
      border:       `1px solid ${C.rule}`,
      borderRadius: '8px',
      overflow:     'hidden',
      marginBottom: '16px',
    }}>
      <ImageBlock url={imageUrl} height={260} />
      <div style={{ padding: '22px 26px' }}>
        <div style={{ marginBottom: '10px' }}>
          <span style={{
            fontSize:   '21px',
            fontWeight: 800,
            color:      C.dark,
            lineHeight: 1.3,
          }}>
            {headline}
          </span>
          {tag && <Tag label={tag} />}
        </div>
        <div style={{ fontSize: '11px', color: C.muted, marginBottom: '12px', letterSpacing: '0.02em' }}>
          <span style={{ color: C.green, fontWeight: 600 }}>{source}</span>
          <span style={{ margin: '0 6px' }}>·</span>
          {date}
        </div>
        <div style={{ fontSize: '14px', lineHeight: 1.8, color: C.body }}>
          {body}
        </div>
      </div>
    </div>
  );
}

// ── Small card — two-column featured row ──────────────────────
function SmallCard({ article }) {
  const { headline, source, date, body, tag, imageUrl } = article;
  return (
    <div style={{
      background:   C.white,
      border:       `1px solid ${C.rule}`,
      borderRadius: '8px',
      overflow:     'hidden',
      flex:         1,
    }}>
      <ImageBlock url={imageUrl} height={150} />
      <div style={{ padding: '14px 16px' }}>
        <div style={{ marginBottom: '8px' }}>
          <span style={{ fontSize: '14px', fontWeight: 700, color: C.dark, lineHeight: 1.35 }}>
            {headline}
          </span>
          {tag && <Tag label={tag} />}
        </div>
        <div style={{ fontSize: '10px', color: C.muted, marginBottom: '8px' }}>
          <span style={{ color: C.green, fontWeight: 600 }}>{source}</span>
          <span style={{ margin: '0 5px' }}>·</span>
          {date}
        </div>
        <div style={{ fontSize: '12.5px', lineHeight: 1.75, color: C.body }}>
          {body}
        </div>
      </div>
    </div>
  );
}

// ── List article — thumbnail on left ─────────────────────────
function ListArticle({ article, index }) {
  const { headline, source, date, body, tag, imageUrl } = article;
  return (
    <div style={{
      background:   C.white,
      border:       `1px solid ${C.rule}`,
      borderRadius: '8px',
      overflow:     'hidden',
      display:      'flex',
      marginBottom: '12px',
    }}>
      {/* Thumbnail */}
      <div style={{ width: '130px', flexShrink: 0, position: 'relative' }}>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt=""
                        style={{ width: '130px', height: '100%', minHeight: '110px', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <div style={{
            width:          '130px',
            minHeight:      '110px',
            height:         '100%',
            background:     `linear-gradient(135deg, ${C.greenLight}, ${C.rule})`,
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
          }}>
            <span style={{ color: C.muted, fontSize: '24px', fontWeight: 900 }}>
              {String(index).padStart(2, '0')}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: '16px 18px', flex: 1 }}>
        <div style={{ marginBottom: '8px' }}>
          <span style={{ fontSize: '13.5px', fontWeight: 700, color: C.dark, lineHeight: 1.35 }}>
            {headline}
          </span>
          {tag && <Tag label={tag} />}
        </div>
        <div style={{ fontSize: '10px', color: C.muted, marginBottom: '8px' }}>
          <span style={{ color: C.green, fontWeight: 600 }}>{source}</span>
          <span style={{ margin: '0 5px' }}>·</span>
          {date}
        </div>
        <div style={{ fontSize: '12.5px', lineHeight: 1.75, color: C.body }}>
          {body}
        </div>
      </div>
    </div>
  );
}

// ── Main template ─────────────────────────────────────────────
export default function NewsletterTemplate({ data }) {
  const { newsletterTitle, tagline, edition, executiveSummary, articles, outlook } = data;

  const hero     = articles?.[0];
  const featured = articles?.slice(1, 3) ?? [];   // two-column row
  const rest     = articles?.slice(3)    ?? [];   // list

  return (
    <div style={{ fontFamily: FONT, background: C.bg, color: C.body, maxWidth: '720px', margin: '0 auto' }}>

      {/* ── HEADER ──────────────────────────────────────────── */}
      <div style={{
        background: `linear-gradient(135deg, ${C.green} 0%, ${C.greenDark} 100%)`,
        color:      C.white,
        padding:    '44px 44px 36px',
        position:   'relative',
        overflow:   'hidden',
      }}>
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ position: 'absolute', bottom: '-70px', right: '100px', width: '140px', height: '140px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />

        {/* Gold rule */}
        <div style={{ width: '52px', height: '3px', background: C.gold, marginBottom: '22px', borderRadius: '2px' }} />

        <div style={{ fontSize: '30px', fontWeight: 900, letterSpacing: '-0.5px', lineHeight: 1.1 }}>
          {newsletterTitle}
        </div>
        <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', marginTop: '8px', letterSpacing: '0.04em' }}>
          {tagline}
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.15)', margin: '22px 0 16px' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            {edition}
          </div>
          <div style={{
            background:    C.gold,
            color:         C.greenDark,
            fontSize:      '10px',
            fontWeight:    800,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            padding:       '4px 14px',
            borderRadius:  '20px',
          }}>
            Industry Digest
          </div>
        </div>
      </div>

      {/* ── BODY ────────────────────────────────────────────── */}
      <div style={{ padding: '36px 44px' }}>

        {/* Executive Summary */}
        <div style={{ marginBottom: '32px' }}>
          <SectionLabel>This Week in Brief</SectionLabel>
          <div style={{
            background:   C.greenLight,
            borderLeft:   `4px solid ${C.green}`,
            padding:      '18px 22px',
            borderRadius: '0 8px 8px 0',
            fontSize:     '14px',
            lineHeight:   1.8,
            color:        C.dark,
            fontStyle:    'italic',
          }}>
            {executiveSummary}
          </div>
        </div>

        {/* Key Stories */}
        <div style={{ marginBottom: '32px' }}>
          <SectionLabel>Key Stories</SectionLabel>

          {/* Hero article */}
          {hero && <HeroArticle article={hero} />}

          {/* Two-column featured row */}
          {featured.length > 0 && (
            <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
              {featured.map((article, i) => (
                <SmallCard key={i} article={article} />
              ))}
            </div>
          )}

          {/* Remaining articles as list */}
          {rest.map((article, i) => (
            <ListArticle key={i} article={article} index={i + 4} />
          ))}
        </div>

        {/* Industry Outlook */}
        <div style={{ marginBottom: '8px' }}>
          <SectionLabel>Industry Outlook</SectionLabel>
          <div style={{
            background:   '#f2f5f2',
            border:       `1px solid ${C.rule}`,
            borderRadius: '8px',
            padding:      '20px 24px',
            fontSize:     '14px',
            lineHeight:   1.8,
            color:        C.dark,
          }}>
            {outlook}
          </div>
        </div>
      </div>

      {/* ── FOOTER ──────────────────────────────────────────── */}
      <div style={{
        background:     C.greenDark,
        color:          'rgba(255,255,255,0.5)',
        padding:        '18px 44px',
        fontSize:       '11px',
        display:        'flex',
        justifyContent: 'space-between',
        alignItems:     'center',
      }}>
        <span style={{ color: C.white, fontWeight: 700, letterSpacing: '0.05em' }}>
          {newsletterTitle}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span>{edition}</span>
          <div style={{ width: '3px', height: '3px', borderRadius: '50%', background: C.gold }} />
          <span style={{ color: C.gold }}>Industry Intelligence</span>
        </div>
      </div>

    </div>
  );
}
