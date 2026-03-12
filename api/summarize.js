export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { text, mode } = req.body;
  if (!text) return res.status(400).json({ error: 'Metin gerekli' });

  const modeInstructions = {
    kisa: 'Metni Türkçe olarak 2-3 cümleyle kısa özetle.',
    orta: 'Metni Türkçe olarak 4-6 cümle halinde özetle.',
    detayli: 'Metni Türkçe olarak detaylı 2-3 paragraf halinde özetle.'
  };

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1000,
        system: 'Metin özetleyicisin. Sadece özeti yaz, başka açıklama ekleme.',
        messages: [{ role: 'user', content: (modeInstructions[mode] || modeInstructions.kisa) + '\n\nMetin:\n' + text }]
      })
    });

    const data = await response.json();
    if (data.error) return res.status(500).json({ error: data.error.message });

    const summary = data.content?.[0]?.text || '';
    res.status(200).json({ summary });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
