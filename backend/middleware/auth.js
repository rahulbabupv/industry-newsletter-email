const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Extracts and verifies the Supabase JWT from the Authorization header.
// On success, attaches req.user = { id, email }.
// On failure, responds 401 immediately.
async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header.' });
  }

  const token = authHeader.slice(7);
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data?.user) {
    return res.status(401).json({ error: 'Invalid or expired session. Please log in again.' });
  }

  req.user = { id: data.user.id, email: data.user.email };
  next();
}

module.exports = { requireAuth, supabase };
