import React from 'react';

// Top navigation bar shown on every page
export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">

        {/* Icon badge */}
        <div className="w-10 h-10 bg-green-900 rounded-xl flex items-center justify-center flex-shrink-0">
          {/* Newspaper / document icon */}
          <svg
            className="w-5 h-5 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 12h6m-6-4h6"
            />
          </svg>
        </div>

        {/* Title + subtitle */}
        <div>
          <h1 className="text-xl font-bold text-gray-900 leading-tight">
            Industry Newsletter Generator
          </h1>
          <p className="text-xs text-gray-500">
            AI-powered news curation for Indian industries
          </p>
        </div>
      </div>
    </header>
  );
}
