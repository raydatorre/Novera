import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: NextRequest) {
  try {
    const { history = [], lastReading, user_message = '' } = await req.json();

    // 1) Resposta conversacional curta
    const system1 = `
Você é o Oráculo 3.1 em modo conversa.
Use SEMPRE o "lastReading" (JSON) como referência factual.
Não recalcule números a menos que o usuário traga sinais/emoções novas.
Responda curto, claro e em português.`;

    const messages1 = [
      { role: 'system', content: system1 },
      { role: 'user', content: `Última leitura (JSON): ${JSON.stringify(lastReading)}` },
      ...history,
      { role: 'user', content: user_message }
    ] as { role: 'system' | 'user' | 'assistant'; content: string }[];

    const r1 = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.4,
      messages: messages1
    });

    const reply = r1.choices[0]?.message?.content || '';

    // 2) Opcional: pedir ao modelo um "delta" das métricas se houver emoção nova
    const system2 = `
Você é o Oráculo 3.1 (recalculador).
Entrada: "lastReading" (JSON) e "user_message".
Se o usuário relatar ansiedades/pressões/ambiente, estime ajustes em R, Q e em DC/AC:
- R: 0–100
- Q: decompor em até 5 fatores (0–20), somando em Q
- DC, AC_real, AC_imag: 0–10
Saída APENAS JSON no schema:
{ "R": number, "Q": number, "Q_factors":[{"name":string,"value":number}], "DC":number, "AC_real":number, "AC_imag":number }
Se NÃO houver sinal para recalcular, responda: {"noop": true}.
`;

    const r2 = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.3,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: system2 },
        { role: 'user', content: `lastReading: ${JSON.stringify(lastReading)}` },
        { role: 'user', content: `user_message: ${user_message}` }
      ]
    });

    let updated: any = null;
    try {
      const out = JSON.parse(r2.choices[0]?.message?.content || '{}');
      if (!out.noop) {
        const R = Number(out.R ?? lastReading?.metrics?.R ?? 7);
        const Q = Number(out.Q ?? lastReading?.metrics?.Q ?? 3);
        const DC = Number(out.DC ?? lastReading?.metrics?.DC ?? 7);
        const AC_real = Number(out.AC_real ?? lastReading?.metrics?.AC_real ?? 10);
        const AC_imag = Number(out.AC_imag ?? lastReading?.metrics?.AC_imag ?? 3);

        // Recalcula no servidor (mesmas fórmulas do /oraculo)
        const denom = Math.sqrt(R * R + Q * Q) || 1;
        const FPC = +(R / denom).toFixed(2);
        const phi_deg = +((Math.atan2(Q, R) * 180) / Math.PI).toFixed(2);
        const FP = +(((DC + AC_real) / ((DC + AC_real + (AC_imag || 0)) || 1))).toFixed(2);
        const leaks = [
          { k: 'Essência (DC)', v: Math.max(0, 10 - DC) },
          { k: 'Ciclos (AC_real)', v: Math.max(0, 10 - AC_real) },
          { k: 'Coletivo (AC_imag)', v: AC_imag }
        ].sort((a, b) => b.v - a.v);
        const biggest_leak = leaks[0].k;

        updated = {
          metrics: {
            R, Q,
            Q_factors: Array.isArray(out.Q_factors) ? out.Q_factors : [],
            DC, AC_real, AC_imag,
            FPC, phi_deg, FP, biggest_leak
          }
        };
      }
    } catch {}

    return NextResponse.json({ reply, updated });
  } catch (err: any) {
    console.error('Chat error:', err?.message || err);
    return NextResponse.json({ reply: 'Erro ao responder.', updated: null }, { status: 500 });
  }
}
