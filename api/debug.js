export default function handler(req, res) {
  const vars = Object.keys(process.env)
    .filter(k => k.includes('UPSTASH') || k.includes('REDIS') || k.includes('KV') || k.includes('STORAGE'))
    .map(k => `${k} = ${k.includes('TOKEN') ? '***hidden***' : process.env[k]}`);

  return res.status(200).json({
    found_variables: vars,
    count: vars.length,
    hint: vars.length === 0 ? 'Aucune variable Redis trouvée. Redéploie après avoir connecté la base.' : 'OK',
  });
}
