import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'zta2026';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (req.query.password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Mot de passe incorrect' });
  }

  const raw = await redis.lrange('responses', 0, -1);
  const data = raw.map(item => typeof item === 'string' ? JSON.parse(item) : item);

  return res.status(200).json(data);
}
