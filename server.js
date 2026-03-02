const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'responses.json');
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'zta2026';

app.use(express.json());
app.use(express.static(__dirname));

function readResponses() {
  if (!fs.existsSync(DATA_FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
  } catch {
    return [];
  }
}

function saveResponses(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// Receive form submission
app.post('/api/submit', (req, res) => {
  const response = {
    id: Date.now(),
    date: new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' }),
    ...req.body,
  };

  const responses = readResponses();
  responses.push(response);
  saveResponses(responses);

  res.json({ success: true });
});

// Admin API — password check via query param
app.get('/api/responses', (req, res) => {
  if (req.query.password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Mot de passe incorrect' });
  }
  res.json(readResponses());
});

// CSV export
app.get('/api/export', (req, res) => {
  if (req.query.password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Mot de passe incorrect' });
  }

  const responses = readResponses();
  if (responses.length === 0) {
    return res.status(404).send('Aucune réponse');
  }

  const headers = ['date', 'discovery', 'conviction', 'why-me', 'conversion-trigger', 'support-content', 'hesitations', 'alternatives', 'decision-time'];
  const headerLabels = ['Date', 'Découverte', 'Conviction /10', 'Pourquoi moi', 'Déclic conversion', 'Supports', 'Hésitations', 'Alternatives', 'Temps décision'];

  const csvRows = [headerLabels.join(',')];
  for (const r of responses) {
    const row = headers.map(h => {
      const val = (r[h] || '').toString().replace(/"/g, '""');
      return `"${val}"`;
    });
    csvRows.push(row.join(','));
  }

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename=responses.csv');
  res.send('\uFEFF' + csvRows.join('\n'));
});

app.listen(PORT, () => {
  console.log(`\n  ✦ Formulaire ZTA en ligne`);
  console.log(`  → Formulaire : http://localhost:${PORT}`);
  console.log(`  → Dashboard  : http://localhost:${PORT}/admin.html`);
  console.log(`  → Mot de passe admin : ${ADMIN_PASSWORD}\n`);
});
