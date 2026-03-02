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

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const redis = getRedis();
  if (!redis) {
    return res.status(500).json({ error: 'Base de données non configurée' });
  }

  const response = {
    id: Date.now(),
    date: new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' }),
    ...req.body,
  };

  await redis.lpush('form-responses', JSON.stringify(response));

  return res.status(200).json({ success: true });
}
