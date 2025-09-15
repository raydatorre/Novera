// api/oraculo.js
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST' });

  const {
    full_name,
    dob_DDMMYYYY,
    R: param_R = null,
    Q: param_Q = null,
    keywords = "",
    temperature = 0.2
  } = req.body || {};

  // ==== Helpers de cálculo (server-side) ====
  function fpc(R, Q) {
    const denom = Math.sqrt(R*R + Q*Q) || 1;
    return +(R / denom).toFixed(2);
  }
  function phiDeg(R, Q) {
    const phi = Math.atan2(Q, R);
    return +(phi * (180 / Math.PI)).toFixed(2);
  }
  function fp(DC, AC_real, AC_imag) {
    const num = (DC + AC_real);
    const den = (DC + AC_real + (AC_imag || 0)) || 1;
    return +(num / den).toFixed(2);
  }
  function biggestLeak(dc, acReal, acImag) {
    const leaks = [
      {k:"Essência (DC)", v: Math.max(0, 10 - (Number(dc)||0))},
      {k:"Ciclos (AC_real)", v: Math.max(0, 10 - (Number(acReal)||0))},
      {k:"Coletivo (AC_imag)", v: Number(acImag)||0}
    ];
    leaks.sort((a,b)=>b.v-a.v);
    return leaks[0].k;
  }

  // ==== Prompts ====
  const ORACULO_SYSTEM = `
Você é o Oráculo 3.1. Responda APENAS JSON válido no schema indicado.
Regras:
1) Se R ou Q não vierem, ESTIME (R 0–100; Q soma de até 5 fatores 0–20 cada) e preencha "Q_factors".
2) Proponha DC, AC_real, AC_imag (0–10).
3) NÃO calcule FPC, φ° e FP; o servidor calculará.
4) Preencha:
   - block_A_map (Mapa clássico conciso)
   - block_B_harmonic (correção harmônica: exploração de R/Q)
   - block_C_energy (modelo DC/AC com leitura prática)
   - block_D_esoteric (Caldéia, Cabalística e Gematria, quando cabível)
   - block_E_triptych: "eli5", "scientist", "poet"
   - metrics: { R, Q, Q_factors[], DC, AC_real, AC_imag }  (sem FPC/φ/FP aqui)
   - diagnostic.summary (máx 3 frases)
   - diagnostic.actions (2–3 microações semanais, começando por verbos)
Saída: JSON exatamente no schema.
`;

  const ORACULO_SCHEMA = `
{
  "block_A_map": "string",
  "block_B_harmonic": "string",
  "block_C_energy": "string",
  "block_D_esoteric": "string",
  "block_E_triptych": {
    "eli5": "string",
    "scientist": "string",
    "poet": "string"
  },
  "metrics": {
    "R": "number",
    "Q": "number",
    "Q_factors": [
      { "name": "string", "value": "number" }
    ],
    "DC": "number",
    "AC_real": "number",
    "AC_imag": "number"
  },
  "diagnostic": {
    "summary": "string",
    "actions": ["string"]
  }
}
`;

  // Opcional: um lembrete curto de “anexos/quadros” para o modelo (custo baixo)
  const KNOWLEDGE_HINT = `
[Referências rápidas]
- Caldéia: mapa de vibrações ocultas/carma; tabela (1:A/I/J/Q/Y; 2:B/K/R; 3:C/G/L/S; 4:D/M/T; 5:E/H/N/X; 6:U/V/W; 7:O/Z; 8:F/P; 9 sagrado). 
- Cabalística: sefirot/caminhos; integração de missão e lições (usar sintético).
- Gematria Judaica: letras hebraicas 1–400; exemplos: 18=Chai(vida), 26=YHWH.
- Védica: 1 Sol; 2 Lua; 3 Júpiter; 4 Rahu; 5 Mercúrio; 6 Vênus; 7 Ketu; 8 Saturno; 9 Marte.
(Use apenas se pertinente e cite brevemente a fonte no texto.)
`;

  const userContent =
`Schema alvo:
${ORACULO_SCHEMA}

Dados:
Nome: ${full_name || ""}
Data: ${dob_DDMMYYYY || ""}
R: ${param_R === null ? "N/A" : param_R}
Q: ${param_Q === null ? "N/A" : param_Q}
Palavras: ${keywords || ""}

${KNOWLEDGE_HINT}`;

  try {
    // Chamada OpenAI (Chat Completions)
    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: Number(temperature) || 0.2,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: ORACULO_SYSTEM },
          { role: 'user', content: userContent }
        ]
      })
    });

    if (!resp.ok) {
      const t = await resp.text().catch(()=> '');
      return res.status(500).json({ ok: false, error: `OpenAI ${resp.status}`, raw: t });
    }

    const data = await resp.json();
    const raw = data?.choices?.[0]?.message?.content || "{}";

    // Parse do JSON gerado
    let modelOut = {};
    try { modelOut = JSON.parse(raw); } catch { modelOut = {}; }

    // ---- Extrai métricas (fallbacks) ----
    const m = modelOut.metrics || {};
    const R = Number(m.R ?? param_R ?? 70);
    const Q = Number(m.Q ?? param_Q ?? 30);
    const DC = Number(m.DC ?? 7);
    const AC_real = Number(m.AC_real ?? 9);
    const AC_imag = Number(m.AC_imag ?? 3);

    // ---- Recalcula confiáveis no servidor ----
    const FPC = fpc(R, Q);
    const phi_deg = phiDeg(R, Q);
    const FP = fp(DC, AC_real, AC_imag);
    const leak = biggestLeak(DC, AC_real, AC_imag);

    // ---- Monta objeto final ----
    const final = {
      block_A_map: modelOut.block_A_map ?? "",
      block_B_harmonic: modelOut.block_B_harmonic ?? "",
      block_C_energy: modelOut.block_C_energy ?? "",
      block_D_esoteric: modelOut.block_D_esoteric ?? "",
      block_E_triptych: modelOut.block_E_triptych ?? { eli5:"", scientist:"", poet:"" },
      metrics: {
        R, Q,
        Q_factors: Array.isArray(m.Q_factors) ? m.Q_factors : [],
        DC, AC_real, AC_imag,
        FPC, phi_deg, FP,
        biggest_leak: leak
      },
      diagnostic: {
        summary: modelOut?.diagnostic?.summary ?? "",
        actions: Array.isArray(modelOut?.diagnostic?.actions) ? modelOut.diagnostic.actions : []
      },
      // compat com teu MVP antigo:
      blocks: {
        block_A_map: modelOut.block_A_map ?? "",
        block_B_harmonic: modelOut.block_B_harmonic ?? "",
        block_C_energy: modelOut.block_C_energy ?? "",
        block_D_esoteric: modelOut.block_D_esoteric ?? "",
        block_E_triptych: (modelOut.block_E_triptych?.eli5 || modelOut.block_E_triptych?.scientist || modelOut.block_E_triptych?.poet)
          ? `ELI5: ${modelOut.block_E_triptych?.eli5 || ''}\n\nScientist: ${modelOut.block_E_triptych?.scientist || ''}\n\nPoet: ${modelOut.block_E_triptych?.poet || ''}`
          : ""
      },
      report: {
        mapa_2_0: modelOut.block_A_map ?? "",
        correcao_harmonica_3_0: modelOut.block_B_harmonic ?? "",
        modelo_energetico: modelOut.block_C_energy ?? "",
        esoterico: modelOut.block_D_esoteric ?? "",
        plano_acao: (Array.isArray(modelOut?.diagnostic?.actions) ? modelOut.diagnostic.actions.join('; ') : '')
      },
      raw_model: modelOut
    };

    return res.status(200).json({ ok: true, data: final, raw });
  } catch (e) {
    return res.status(500).json({ ok: false, error: String(e) });
  }
}
