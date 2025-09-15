import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: NextRequest) {
  try {
    const { history = [], lastReading, user_message = "" } = await req.json();

    const system = `
Você é o Oráculo 3.1 em modo conversa. Responda APENAS JSON:
{
  "mode": "qa" | "recalc",
  "reply": "texto curto",
  "proposed_metrics": {
    "R": number, "Q": number, "Q_factors": [{"name":string,"value":number}],
    "DC": number, "AC_real": number, "AC_imag": number
  },
  "actions": ["string"]
}
- Se a mensagem trouxer estado emocional/contexto, use "recalc" com novos R/Q/DC/AC.
- Não calcule FPC/φ/FP; o servidor recalcula a partir dos propostos.
- Use lastReading como baseline factual.
`;

    const messages = [
      { role: "system", content: system },
      { role: "user", content: `Baseline: ${JSON.stringify(lastReading||{})}` },
      { role: "user", content: `Mensagem: ${user_message}` },
      ...history
    ];

    const r = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.4,
      response_format: { type: "json_object" },
      messages
    });

    const raw = r.choices[0]?.message?.content || "{}";
    const out = JSON.parse(raw);

    // Recalcular no servidor se veio recalc
    let updated = null;
    if (out.mode === "recalc" && out.proposed_metrics) {
      const base = lastReading?.metrics || {};
      const R = Number(out.proposed_metrics.R ?? base.R ?? 70);
      const Q = Number(out.proposed_metrics.Q ?? base.Q ?? 30);
      const DC = Number(out.proposed_metrics.DC ?? base.DC ?? 7);
      const AC_real = Number(out.proposed_metrics.AC_real ?? base.AC_real ?? 9);
      const AC_imag = Number(out.proposed_metrics.AC_imag ?? base.AC_imag ?? 3);

      const denom = Math.sqrt(R*R + Q*Q) || 1;
      const FPC = +(R / denom).toFixed(2);
      const phi_deg = +(Math.atan2(Q, R) * (180/Math.PI)).toFixed(2);
      const FP = +(((DC + AC_real) / ((DC + AC_real + (AC_imag||0)) || 1))).toFixed(2);

      const prev = (typeof base.FPC === "number") ? base : null;
      const delta = prev ? {
        dFPC: +(FPC - prev.FPC).toFixed(2),
        dPhi: +(phi_deg - prev.phi_deg).toFixed(2),
        dFP: +(FP - prev.FP).toFixed(2)
      } : null;

      updated = { metrics: { R,Q,DC,AC_real,AC_imag,FPC,phi_deg,FP, Q_factors: out.proposed_metrics.Q_factors||[] }, delta };
    }

    return NextResponse.json({ reply: out.reply || "", updated, actions: out.actions || [] });
  } catch (err:any) {
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}
