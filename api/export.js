import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Ylopesdeoli02100!';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (req.query.password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Mot de passe incorrect' });
  }

  const raw = await redis.lrange('form-responses', 0, -1);
  const data = raw.map(item => typeof item === 'string' ? JSON.parse(item) : item);

  if (data.length === 0) {
    return res.status(404).send('Aucune réponse');
  }

  const headers = ['date', 'prenom', 'nom', 'discovery', 'conviction', 'why-me', 'conversion-trigger', 'support-content', 'hesitations', 'alternatives', 'decision-time'];
  const headerLabels = ['Date', 'Prénom', 'Nom', 'Découverte', 'Conviction /10', 'Pourquoi moi', 'Déclic conversion', 'Supports', 'Hésitations', 'Alternatives', 'Temps décision'];

  const csvRows = [headerLabels.join(',')];
  for (const r of data) {
    const row = headers.map(h => {
      const val = (r[h] || '').toString().replace(/"/g, '""');
      return `"${val}"`;
    });
    csvRows.push(row.join(','));
  }

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename=responses.csv');
  return res.status(200).send('\uFEFF' + csvRows.join('\n'));
}
