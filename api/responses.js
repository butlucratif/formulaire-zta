import { Redis } from '@upstash/redis';

function getRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL
    || process.env.KV_REST_API_URL
    || process.env.STORAGE_URL
    || process.env.REDIS_URL;

  const token = process.env.UPSTASH_REDIS_REST_TOKEN
    || process.env.KV_REST_API_TOKEN
    || process.env.STORAGE_TOKEN
    || process.env.REDIS_TOKEN;

  if (!url || !token) {
    return null;
  }
  return new Redis({ url, token });
}

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Ylopesdeoli02100!';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (req.query.password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Mot de passe incorrect' });
  }

  const redis = getRedis();
  if (!redis) {
    return res.status(500).json({ error: 'Base de données non configurée. Vérifie les variables Upstash dans Vercel.' });
  }

  const raw = await redis.lrange('form-responses', 0, -1);
  const data = raw.map(item => typeof item === 'string' ? JSON.parse(item) : item);

  return res.status(200).json(data);
}
