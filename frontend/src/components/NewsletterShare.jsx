import { useEffect, useState } from "react";
import NewsletterTemplate from "./NewsletterTemplate";

export default function NewsletterShare({ id }) {
  const [newsletter, setNewsletter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchNewsletter = async () => {
      try {
        const response = await fetch(`http://localhost:5002/api/newsletter/view/${id}`);
        if (!response.ok) throw new Error("Newsletter not found");
        const result = await response.json();
        setNewsletter(result.newsletter);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchNewsletter();
  }, [id]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent(
      `Check out this newsletter: ${newsletter?.data?.newsletterTitle}`
    );
    const body = encodeURIComponent(
      `${newsletter?.data?.newsletterTitle}\n\nView it here:\n${window.location.href}`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading newsletter...</p>
        </div>
      </div>
    );
  }

  if (error || !newsletter) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">📭</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Newsletter Not Found</h1>
          <p className="text-gray-600">{error || "This newsletter could not be found."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Share Toolbar */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex flex-wrap gap-3 items-center justify-between">
          <div className="text-sm text-gray-600">
            📊 <strong>{newsletter.data.newsletterTitle}</strong> • {new Date(newsletter.created_at).toLocaleDateString()}
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors text-sm font-medium"
              title="Copy shareable link"
            >
              {copied ? "✓ Copied!" : "🔗 Copy Link"}
            </button>
            <button
              onClick={handleEmailShare}
              className="flex items-center gap-2 px-4 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition-colors text-sm font-medium"
              title="Share via email"
            >
              📧 Email
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm font-medium"
              title="Print or save as PDF from browser"
            >
              🖨️ Print
            </button>
          </div>
        </div>

        {/* Newsletter Content */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <NewsletterTemplate data={newsletter.data} topic={newsletter.topic} />
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>📩 Want to receive newsletters like this? Subscribe or contact us for updates.</p>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          .bg-gray-50 { background: white !important; }
          div { page-break-inside: avoid !important; }
          button { display: none !important; }
          .max-w-4xl { max-width: 100% !important; }
        }
      `}</style>
    </div>
  );
}
