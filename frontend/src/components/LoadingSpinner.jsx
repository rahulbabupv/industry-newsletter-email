import React from 'react';

// A centred loading spinner with an optional message below it
export default function LoadingSpinner({ message }) {
  return (
    <div className="flex flex-col items-center justify-center py-14">
      {/* Spinning ring — the top quarter is the brand blue, rest is light grey */}
      <div className="w-11 h-11 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4" />

      {message && (
        <p className="text-sm text-gray-500 text-center max-w-xs">{message}</p>
      )}
    </div>
  );
}
