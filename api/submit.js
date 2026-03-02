import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const response = {
    id: Date.now(),
    date: new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' }),
    ...req.body,
  };

  await redis.lpush('form-responses', JSON.stringify(response));

  return res.status(200).json({ success: true });
}
