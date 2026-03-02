import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
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

  await redis.lpush('responses', JSON.stringify(response));

  return res.status(200).json({ success: true });
}
