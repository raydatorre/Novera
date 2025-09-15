// api/chat.js
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST' });

  try {
    const { history = [], lastReading } = req.body || {};

    const system = `
Você é o Oráculo 3.1 em modo conversa.
Use SEMPRE o "lastReading" (JSON) como referência factual.
Não recalcule números, a menos que o usuário peça.
Responda curto, claro e em português.
    `;

    const messages = [
      { role: "system", content: system },
      { role: "user", content: `Última leitura (JSON): ${JSON.stringify(lastReading || {})}` },
      ...history // [{role:'user'|'assistant', content:'...'}]
    ];

    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.4,
        messages
      })
    });

    if (!r.ok) {
      return res.status(500).json({ error: `OpenAI ${r.status}`, detail: await r.text() });
    }

    const j = await r.json();
    const reply = j?.choices?.[0]?.message?.content || "";
    return res.status(200).json({ reply });
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
}
