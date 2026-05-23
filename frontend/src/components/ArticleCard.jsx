import React from 'react';

// A single article card with a checkbox for selection.
// Clicking anywhere on the card toggles the checkbox.
export default function ArticleCard({ article, isSelected, onToggle }) {
  // Format the ISO date string into something readable (e.g. "18 May 2025")
  const formattedDate = new Date(article.publishedAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div
      role="checkbox"
      aria-checked={isSelected}
      tabIndex={0}
      onClick={onToggle}
      onKeyDown={(e) => (e.key === ' ' || e.key === 'Enter') && onToggle()}
      className={`
        bg-white rounded-xl border-2 cursor-pointer transition-all duration-150 outline-none
        focus-visible:ring-2 focus-visible:ring-blue-400
        ${isSelected
          ? 'border-green-700 shadow-md shadow-green-100'
          : 'border-gray-100 hover:border-gray-300 shadow-sm'}
      `}
    >
      <div className="flex gap-4 p-4">

        {/* Custom checkbox indicator */}
        <div className="flex-shrink-0 pt-0.5">
          <div
            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
              isSelected ? 'bg-green-800 border-green-800' : 'border-gray-300 bg-white'
            }`}
          >
            {isSelected && (
              // Checkmark
              <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                <polyline
                  points="2,6 5,9 10,3"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </div>
        </div>

        {/* Article content */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <h3 className="text-sm font-semibold text-gray-900 leading-snug mb-2 line-clamp-2">
            {article.title}
          </h3>

          {/* Source pill + date */}
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-xs font-medium text-green-800 bg-green-50 px-2 py-0.5 rounded-full">
              {article.source}
            </span>
            <span className="text-xs text-gray-400">{formattedDate}</span>
          </div>

          {/* AI-generated summary — limited to 3 lines */}
          <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
            {article.summary}
          </p>

          {/* External link (opens in new tab, stops card click propagating) */}
          {article.url && (
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-block mt-2 text-xs text-green-700 hover:underline"
            >
              Read original →
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
