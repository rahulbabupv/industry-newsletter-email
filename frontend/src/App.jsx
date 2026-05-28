import React, { useState, useEffect } from 'react';
import api from './lib/api';
import Header from './components/Header';
import ArticleCard from './components/ArticleCard';
import NewsletterDisplay from './components/NewsletterDisplay';
import NewsletterShare from './components/NewsletterShare';
import LoadingSpinner from './components/LoadingSpinner';
import AuthForm from './components/AuthForm';
import ResetPasswordConfirm from './components/ResetPasswordConfirm';
import { useAuth } from './context/AuthContext';

const TOPICS = ['Tea', 'Coffee', 'QSR', 'Meat', 'Dairy', 'Spices','Alcohol'];

function getDefaultDates() {
  const today = new Date();
  const weekAgo = new Date();
  weekAgo.setDate(today.getDate() - 7);
  const fmt = (d) => d.toISOString().split('T')[0];
  return { from: fmt(weekAgo), to: fmt(today) };
}

export default function App() {
  const { user, accessToken, loading: authLoading, signOut } = useAuth();
  const [resetSuccess, setResetSuccess] = useState(false);

  // Simple routing: check if we're on special routes
  const isResetCallback = window.location.pathname === '/auth/callback';
  const isNewsletterShare = window.location.pathname.match(/^\/newsletter\/[a-f0-9-]+$/);

  if (isResetCallback && !resetSuccess) {
    return (
      <ResetPasswordConfirm
        onResetSuccess={() => {
          setResetSuccess(true);
          setTimeout(() => window.location.href = '/', 1000);
        }}
      />
    );
  }

  // Public newsletter share page (no auth required)
  if (isNewsletterShare) {
    const newsletterId = window.location.pathname.split('/')[2];
    return <NewsletterShare id={newsletterId} />;
  }

  // ── Form state ──────────────────────────────────────────────
  const defaults = getDefaultDates();
  const [selectedTopic, setSelectedTopic] = useState('Tea');
  const [fromDate, setFromDate] = useState(defaults.from);
  const [toDate, setToDate] = useState(defaults.to);

  // ── Data state ──────────────────────────────────────────────
  const [articles, setArticles] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [newsletter, setNewsletter] = useState('');

  // ── History state ───────────────────────────────────────────
  const [history, setHistory] = useState([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);

  // ── UI / loading state ──────────────────────────────────────
  const [fetchingArticles, setFetchingArticles] = useState(false);
  const [generatingNewsletter, setGeneratingNewsletter] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [genError, setGenError] = useState('');

  // ── Helpers ─────────────────────────────────────────────────
  // All authenticated API calls include the Bearer token
  function authHeaders() {
    return { Authorization: `Bearer ${accessToken}` };
  }

  // ── History ─────────────────────────────────────────────────
  async function loadHistory() {
    setHistoryLoading(true);
    try {
      const { data } = await api.get('/api/newsletter/history', { headers: authHeaders() });
      setHistory(data.history);
    } catch (err) {
      console.error('Failed to load history:', err.message);
    } finally {
      setHistoryLoading(false);
    }
  }

  async function deleteHistoryItem(id) {
    try {
      await api.delete(`/api/newsletter/history/${id}`, { headers: authHeaders() });
      setHistory((prev) => prev.filter((h) => h.id !== id));
    } catch (err) {
      console.error('Failed to delete newsletter:', err.message);
    }
  }

  function openHistory() {
    setHistoryOpen(true);
    loadHistory();
  }

  function viewHistoricNewsletter(item) {
    setNewsletter(item.data);
    setHistoryOpen(false);
    setTimeout(() => {
      document.getElementById('newsletter-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 150);
  }

  function copyShareLink(id) {
    const shareUrl = `${window.location.origin}/newsletter/${id}`;
    navigator.clipboard.writeText(shareUrl);
    alert(`Share link copied! \n\n${shareUrl}`);
  }

  // Group history by month, then by topic
  function groupHistoryByMonthAndTopic(items) {
    const grouped = {};

    items.forEach((item) => {
      const date = new Date(item.from_date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
      const topic = item.topic || 'Other';

      if (!grouped[monthKey]) {
        grouped[monthKey] = { label: monthLabel, topics: {} };
      }
      if (!grouped[monthKey].topics[topic]) {
        grouped[monthKey].topics[topic] = [];
      }
      grouped[monthKey].topics[topic].push(item);
    });

    // Sort months in descending order (newest first)
    return Object.entries(grouped)
      .sort(([keyA], [keyB]) => keyB.localeCompare(keyA))
      .map(([_, value]) => value);
  }

  // ── Fetch Articles ──────────────────────────────────────────
  async function handleFetchArticles() {
    if (!fromDate || !toDate) {
      setFetchError('Please select both a from-date and a to-date.');
      return;
    }
    if (new Date(fromDate) > new Date(toDate)) {
      setFetchError('"From" date must be before or equal to "To" date.');
      return;
    }

    setFetchingArticles(true);
    setFetchError('');
    setArticles([]);
    setSelectedIds(new Set());
    setNewsletter('');

    try {
      const { data } = await api.post('/api/articles/fetch', {
        topic: selectedTopic,
        fromDate,
        toDate,
      });

      setArticles(data.articles);

      if (data.articles.length === 0) {
        setFetchError('No articles found for this topic and date range. Try widening the date range or changing the topic.');
      }
    } catch (err) {
      setFetchError(err.response?.data?.error || 'Failed to fetch articles. Is the backend running?');
    } finally {
      setFetchingArticles(false);
    }
  }

  function handleToggleArticle(id) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function handleSelectAll() {
    if (selectedIds.size === articles.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(articles.map((a) => a.id)));
    }
  }

  // ── Generate Newsletter ─────────────────────────────────────
  async function handleGenerateNewsletter() {
    const selected = articles.filter((a) => selectedIds.has(a.id));
    if (selected.length === 0) {
      setGenError('Please select at least one article to include.');
      return;
    }

    setGeneratingNewsletter(true);
    setGenError('');
    setNewsletter('');

    try {
      const { data } = await api.post(
        '/api/newsletter/generate',
        { articles: selected, topic: selectedTopic, fromDate, toDate },
        { headers: authHeaders() }
      );

      setNewsletter(data.newsletter);

      setTimeout(() => {
        document.getElementById('newsletter-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    } catch (err) {
      setGenError(err.response?.data?.error || 'Failed to generate newsletter. Please try again.');
    } finally {
      setGeneratingNewsletter(false);
    }
  }

  const selectedCount = selectedIds.size;
  const allSelected = articles.length > 0 && selectedCount === articles.length;

  // ── Auth loading screen ─────────────────────────────────────
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-green-800 border-t-transparent rounded-full animate-spin" />

      </div>
    );
  }

  // ── Not logged in ───────────────────────────────────────────
  if (!user) {
    return <AuthForm />;
  }

  // ── Main app ────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-green-50">
      <Header />

      {/* Top bar: user info + history + sign out */}
      <div className="max-w-5xl mx-auto px-4 pt-4 flex items-center justify-between text-sm">
        <span className="text-gray-500">Signed in as <span className="font-medium text-gray-700">{user.email}</span></span>
        <div className="flex items-center gap-3">
          <button
            onClick={openHistory}
            className="text-green-700 hover:underline font-medium"
          >
            History
          </button>
          <button
            onClick={signOut}
            className="text-gray-500 hover:text-gray-700"
          >
            Sign out
          </button>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-8">

        {/* ── Controls Card ──────────────────────────────────── */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-1">Configure Your Newsletter</h2>
          <p className="text-sm text-gray-500 mb-5">
            Pick an industry topic and a weekly date range, then click "Fetch Articles".
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Industry Topic</label>
              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-700"
              >
                {TOPICS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">From Date</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-700"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">To Date</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-700"
              />
            </div>
          </div>

          <button
            onClick={handleFetchArticles}
            disabled={fetchingArticles}
            className="px-6 py-2.5 bg-green-800 text-white font-medium rounded-lg hover:bg-green-900 active:bg-green-950 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
          >
            {fetchingArticles ? 'Fetching Articles…' : 'Fetch Articles'}
          </button>

          {fetchError && (
            <p className="mt-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {fetchError}
            </p>
          )}
        </section>

        {fetchingArticles && (
          <LoadingSpinner message="Fetching articles and generating AI summaries… this may take 15–30 seconds." />
        )}

        {/* ── Article list ───────────────────────────────────── */}
        {!fetchingArticles && articles.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-800">{articles.length} Articles Found</h2>
              <button onClick={handleSelectAll} className="text-sm text-green-700 hover:underline">
                {allSelected ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            <div className="space-y-3">
              {articles.map((article) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  isSelected={selectedIds.has(article.id)}
                  onToggle={() => handleToggleArticle(article.id)}
                />
              ))}
            </div>

            <div className="sticky bottom-4 mt-6">
              <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-5 py-3.5 flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {selectedCount === 0
                    ? 'Select articles to include in your newsletter'
                    : `${selectedCount} article${selectedCount !== 1 ? 's' : ''} selected`}
                </span>
                <button
                  onClick={handleGenerateNewsletter}
                  disabled={selectedCount === 0 || generatingNewsletter}
                  className="px-5 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {generatingNewsletter ? 'Generating…' : 'Generate Newsletter'}
                </button>
              </div>

              {genError && (
                <p className="mt-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {genError}
                </p>
              )}
            </div>
          </section>
        )}

        {generatingNewsletter && (
          <LoadingSpinner message="Generating your professional newsletter… this may take 20–40 seconds." />
        )}

        {newsletter && !generatingNewsletter && (
          <div id="newsletter-section">
            <NewsletterDisplay
              newsletter={newsletter}
              topic={selectedTopic}
              fromDate={fromDate}
              toDate={toDate}
            />
          </div>
        )}
      </main>

      {/* ── History drawer ────────────────────────────────────── */}
      {historyOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div className="flex-1 bg-black/40" onClick={() => setHistoryOpen(false)} />

          {/* Panel */}
          <div className="w-full max-w-md bg-white h-full shadow-xl flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-800">Newsletter History</h2>
              <button onClick={() => setHistoryOpen(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {historyLoading ? (
                <div className="flex justify-center py-10">
                  <div className="w-6 h-6 border-4 border-green-800 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : history.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-10">No newsletters saved yet.</p>
              ) : (
                <div className="space-y-6">
                  {groupHistoryByMonthAndTopic(history).map((monthGroup, monthIdx) => (
                    <div key={monthIdx}>
                      <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">
                        📅 {monthGroup.label}
                      </h3>
                      <div className="space-y-4">
                        {Object.entries(monthGroup.topics).map(([topic, items]) => (
                          <div key={topic}>
                            <h4 className="text-xs font-semibold text-gray-600 mb-2 pl-2 border-l-2 border-gray-300">
                              {topic}
                            </h4>
                            <div className="space-y-2 ml-2">
                              {items.map((item) => (
                                <div key={item.id} className="bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-100 p-3 transition-colors">
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs font-semibold text-gray-800 truncate">{item.data.newsletterTitle}</p>
                                      <p className="text-xs text-gray-500 mt-0.5">
                                        {new Date(item.from_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} – {new Date(item.to_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                      </p>
                                    </div>
                                    <div className="flex gap-1.5 shrink-0">
                                      <button
                                        onClick={() => viewHistoricNewsletter(item)}
                                        className="text-xs text-green-700 font-medium hover:underline whitespace-nowrap"
                                      >
                                        View
                                      </button>
                                      <button
                                        onClick={() => copyShareLink(item.id)}
                                        className="text-xs text-blue-600 font-medium hover:underline whitespace-nowrap"
                                        title="Copy shareable link"
                                      >
                                        Share
                                      </button>
                                      <button
                                        onClick={() => deleteHistoryItem(item.id)}
                                        className="text-xs text-red-500 hover:text-red-700 whitespace-nowrap"
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
