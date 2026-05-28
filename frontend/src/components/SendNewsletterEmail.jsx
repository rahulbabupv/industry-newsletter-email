import { useState } from "react";
import api from "../lib/api";

export default function SendNewsletterEmail({ newsletter, newsletterId, accessToken, onClose, onSuccess }) {
  const [emailInput, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const parseEmails = (input) => {
    return input
      .split(/[,\n\s]+/)
      .map(e => e.trim())
      .filter(e => e.length > 0);
  };

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const emails = parseEmails(emailInput);
  const validEmails = emails.filter(e => emailRegex.test(e));
  const invalidEmails = emails.filter(e => !emailRegex.test(e));

  const handleSend = async () => {
    if (validEmails.length === 0) {
      setError("Please enter at least one valid email address.");
      return;
    }

    setSending(true);
    setError("");
    setSuccessMessage("");

    try {
      const response = await api.post("/api/newsletter/send", {
        newsletterId,
        recipientEmails: validEmails
      }, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      if (response.data.success) {
        setSuccessMessage(
          `✅ Sent to ${response.data.sent} recipient${response.data.sent !== 1 ? "s" : ""}!`
        );
        setText("");
        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 2000);
      } else {
        setError(`Failed to send emails. ${response.data.failed} failed, ${response.data.sent} succeeded.`);
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Failed to send newsletters.");
    } finally {
      setSending(false);
    }
  };

  const newsletterTitle = newsletter?.data?.newsletterTitle || newsletter?.topic || "Newsletter";
  const shareLink = `${window.location.origin}/newsletter/${newsletterId}`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end z-50">
      <div className="bg-white w-full sm:max-w-lg sm:rounded-lg sm:shadow-xl rounded-t-lg shadow-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Send Newsletter</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 font-bold text-xl"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Preview */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="text-sm text-gray-600 mb-2 font-semibold">📧 Email Preview</p>
            <p className="text-sm text-gray-900 font-medium mb-2">{newsletterTitle}</p>
            <p className="text-sm text-gray-700 line-clamp-2">
              A curated newsletter has been shared with you.
            </p>
            <a
              href={shareLink}
              className="text-sm text-emerald-600 hover:text-emerald-700 mt-2 inline-block font-medium"
            >
              → View Newsletter
            </a>
          </div>

          {/* Email Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Recipient Emails
            </label>
            <textarea
              value={emailInput}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter emails separated by commas or new lines&#10;e.g., john@example.com, jane@example.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
              rows={5}
              disabled={sending}
            />
            <p className="mt-2 text-xs text-gray-500">
              {validEmails.length} valid • {invalidEmails.length > 0 && `${invalidEmails.length} invalid`}
            </p>
            {invalidEmails.length > 0 && (
              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                Invalid: {invalidEmails.join(", ")}
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
              {successMessage}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              disabled={sending}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={sending || validEmails.length === 0}
              className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {sending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  📬 Send ({validEmails.length})
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
