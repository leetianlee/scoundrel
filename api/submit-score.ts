import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { createHash } from 'crypto';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function sanitizeNickname(raw: string): string | null {
  const trimmed = raw.trim().replace(/[<>&"'/\\]/g, '');
  if (trimmed.length < 1 || trimmed.length > 20) return null;
  return trimmed;
}

function validateScore(score: number, hpRemaining: number): boolean {
  if (!Number.isInteger(score) || score < 1 || score > 30) return false;
  if (!Number.isInteger(hpRemaining) || hpRemaining < 1 || hpRemaining > 20) return false;
  if (score < hpRemaining) return false;
  if (score > 20 && hpRemaining !== 20) return false;
  if (score - hpRemaining > 10) return false;
  return true;
}

function hashIp(ip: string): string {
  const salt = process.env.IP_HASH_SALT || 'scoundrel';
  return createHash('sha256').update(ip + salt).digest('hex');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = req.body as { nickname?: string; score?: number; hp_remaining?: number };

  const nickname = sanitizeNickname(body?.nickname || '');
  if (!nickname) {
    return res.status(400).json({ error: 'Invalid nickname (1-20 characters, no special chars)' });
  }

  if (!validateScore(body?.score ?? 0, body?.hp_remaining ?? 0)) {
    return res.status(400).json({ error: 'Invalid score data' });
  }

  // Rate limiting by hashed IP
  const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim()
    || req.socket?.remoteAddress || 'unknown';
  const ipHash = hashIp(clientIp);

  const thirtySecondsAgo = new Date(Date.now() - 30000).toISOString();
  const { data: recentSubmissions } = await supabase
    .from('submission_log')
    .select('id')
    .eq('ip_hash', ipHash)
    .gte('submitted_at', thirtySecondsAgo)
    .limit(1);

  if (recentSubmissions && recentSubmissions.length > 0) {
    return res.status(429).json({ error: 'Too many submissions. Wait 30 seconds.' });
  }

  await supabase.from('submission_log').insert({ ip_hash: ipHash });

  const { data, error } = await supabase
    .from('leaderboard')
    .insert({
      nickname,
      score: body.score,
      hp_remaining: body.hp_remaining,
    })
    .select()
    .single();

  if (error) {
    console.error('Score submission error:', error);
    return res.status(500).json({ error: 'Failed to submit score' });
  }

  return res.status(201).json(data);
}
