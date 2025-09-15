export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST' });

  const {
    full_name,
    dob_DDMMYYYY,
    R = null,
    Q = null,
    keywords = "",
    temperature = 0.2
  } = req.body || {};

  const SYSTEM_PROMPT = `
Você é o Oráculo dos Números Mágicos 3.1.
MISSÃO: interpretar números da vida unindo numerologia clássica, sistemas esotéricos e modelo energético (DC/AC),
sempre com clareza e praticidade. Quando faltarem R e Q, ESTIME com justificativa.

ENTRADAS:
- Nome completo, data de nascimento DD/MM/AAAA.
- R (0–100) e Q (0–100; soma de fatores). Se ausentes, ESTIME e explique.
- Palavras-chave (opcional).

PROCESSO (resumo):
1) Numerologia Clássica 2.0 — Expressão, Motivação, Impressão, Destino; raízes/plenos de palavras relevantes.
2) Correção Harmônica 3.0 — FPC = R / √(R² + Q²); φ = arctan(Q/R). Explique fatores de Q e simule 1–2 cenários.
3) Modelo Energético-Pitagórico — DC (essência), AC_real (ciclos), AC_imag (coletivo/defasagem). Calcule FP e comente vazamentos.
4) Integrações Esotéricas — Caldéia (destino oculto/karma), Cabalística (caminhos/SEFIROT), Gematria Judaica; Védica se pedido.
5) Interpretação Tríplice — ELI5, Matemático e Poético/Espiritual.

SAÍDA — retorne SOMENTE JSON válido no esquema:
{
  "blocks": {
    "block_A_map": "...",
    "block_B_harmonic": "...",
    "block_C_energy": "...",
    "block_D_esoteric": "...",
    "block_E_triptych": "..."
  },
  "metrics": { "R": <number|null>, "Q": <number|null>, "FPC": <number|null>, "phi_deg": <number|null> },
  "report": {
    "mapa_2_0": "...",
    "correcao_harmonica_3_0": "...",
    "modelo_energetico": "...",
    "esoterico": "...",
    "plano_acao": "..."
  }
}
NÃO inclua texto fora do JSON.
`;

  const userContent = [
    `Nome: ${full_name || ''}`,
    `Data: ${dob_DDMMYYYY || ''}`,
    `R: ${R === null ? 'N/A' : R}`,
    `Q: ${Q === null ? 'N/A' : Q}`,
    `Palavras-chave: ${keywords || 'N/A'}`
  ].join('\n');

  try {
    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: Number(temperature) || 0.2,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userContent }
        ]
        // Se sua conta tiver JSON mode/Structured Outputs, pode ativar:
        // ,response_format: { type: 'json_object' }
      })
    });

    const data = await resp.json();
    const text = data?.choices?.[0]?.message?.content || '';

    try {
      const parsed = JSON.parse(text);
      return res.status(200).json({ ok: true, data: parsed, raw: text });
    } catch {
      return res.status(200).json({ ok: false, error: 'JSON inválido', raw: text });
    }
  } catch (e) {
    return res.status(500).json({ ok: false, error: String(e) });
  }
}
