import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { date } = req.query;

  if (!date || typeof date !== 'string') {
    return res.status(400).json({ error: 'Date parameter required (format: YYYY-MM-DD)' });
  }

  // Validate date format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ error: 'Invalid date format (expected: YYYY-MM-DD)' });
  }

  const { data, error } = await supabase
    .from('daily_leaderboard')
    .select('id, nickname, score, hp_remaining, challenge_date, created_at')
    .eq('challenge_date', date)
    .order('score', { ascending: false })
    .order('created_at', { ascending: true })
    .limit(100);

  if (error) {
    console.error('Daily leaderboard fetch error:', error);
    return res.status(500).json({ error: 'Failed to fetch daily leaderboard' });
  }

  res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60');
  return res.status(200).json(data);
}
