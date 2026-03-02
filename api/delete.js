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

  if (!url || !token) return null;
  return new Redis({ url, token });
}

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Ylopesdeoli02100!';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (req.body.password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Mot de passe incorrect' });
  }

  const redis = getRedis();
  if (!redis) {
    return res.status(500).json({ error: 'Base de données non configurée' });
  }

  const { id } = req.body;

  if (id === 'all') {
    await redis.del('form-responses');
    return res.status(200).json({ success: true, deleted: 'all' });
  }

  const raw = await redis.lrange('form-responses', 0, -1);
  const items = raw.map(item => typeof item === 'string' ? JSON.parse(item) : item);
  const filtered = items.filter(item => item.id !== id);

  await redis.del('form-responses');
  if (filtered.length > 0) {
    const toStore = filtered.reverse().map(item => JSON.stringify(item));
    await redis.lpush('form-responses', ...toStore);
  }

  return res.status(200).json({ success: true, deleted: id });
}
