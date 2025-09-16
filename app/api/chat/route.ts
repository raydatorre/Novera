// app/api/chat/route.ts
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { buildSystemPrompt } from "@/lib/oraculoPrompt";

// Heurística simples para ajustar R/Q a partir do texto do usuário
function estimateDeltaRQ(msg: string) {
  const t = (msg || "").toLowerCase();

  // Palavras que tendem a ↑Q (ruído/pressão) e ↓R (coerência)
  const highQ = /\b(ansios|ansiedade|press|prazo|cobran|caos|ru[ií]do|burocr|medo|triste|raiva|cansa|exaust|confus)\b/;
  const lowQ = /\b(calmo|centrad|equilibrad|clar|gratid|fluxo|foco|presen[çc]a|paz)\b/;

  let dR = 0, dQ = 0;
  if (highQ.test(t)) { dQ += 10; dR -= 5; }
  if (lowQ.test(t))  { dQ -= 8;  dR += 6; }

  return { dR, dQ };
}

function clamp(x: number, min: number, max: number) {
  return Math.max(min, Math.min(max, x));
}

// Métricas (iguais da rota principal)
function fpc(R: number, Q: number) {
  const denom = Math.sqrt(R * R + Q * Q) || 1;
  return +(R / denom).toFixed(2);
}
function phiDeg(R: number, Q: number) {
  const deg = (Math.atan2(Q, R) * 180) / Math.PI;
  const norm = (deg + 360) % 360;
  return +norm.toFixed(2);
}
function fp(DC: number, AC_real: number, AC_imag: number) {
  const num = (DC + AC_real);
  const den = (DC + AC_real + (AC_imag || 0)) || 1;
  return +(num / den).toFixed(2);
}
function biggestLeak(dc = 7, acReal = 7, acImag = 7) {
  const leaks = [
    { k: "Essência (DC)", v: Math.max(0, 10 - dc) },
    { k: "Ciclos (AC_real)", v: Math.max(0, 10 - acReal) },
    { k: "Coletivo (AC_imag)", v: acImag }
  ];
  leaks.sort((a, b) => b.v - a.v);
  return leaks[0].k;
}

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: NextRequest) {
  try {
    const { history = [], lastReading = null, user_message = "", temperature = 0.3 } = await req.json();

    // Base de métricas anteriores
    const prev = (lastReading as any)?.metrics || {};
    const R0 = Number.isFinite(prev.R) ? Number(prev.R) : 60;
    const Q0 = Number.isFinite(prev.Q) ? Number(prev.Q) : 22;
    const DC0 = Number.isFinite(prev.DC) ? Number(prev.DC) : 7;
    const AC_real0 = Number.isFinite(prev.AC_real) ? Number(prev.AC_real) : 8;
    const AC_imag0 = Number.isFinite(prev.AC_imag) ? Number(prev.AC_imag) : 4;

    // Re-estima conforme a mensagem
    const { dR, dQ } = estimateDeltaRQ(user_message);
    const R = clamp(R0 + dR, 0, 100);
    const Q = clamp(Q0 + dQ, 0, 100);
    const DC = clamp(DC0 + (dR > 0 ? 0.5 : dR < 0 ? -0.5 : 0), 0, 10);
    const AC_real = clamp(AC_real0, 0, 10);
    const AC_imag = clamp(AC_imag0 + (dQ > 0 ? 1 : dQ < 0 ? -1 : 0), 0, 10);

    const updated = {
      R, Q, DC, AC_real, AC_imag,
      FPC: fpc(R, Q),
      phi_deg: phiDeg(R, Q),
      FP: fp(DC, AC_real, AC_imag),
      biggest_leak: biggestLeak(DC, AC_real, AC_imag)
    };

    // Prompt do chat: modo conversa curto, citando impacto nas métricas + microações
    const system = buildSystemPrompt();
    const chatUser = `
Você está em modo "conversa de acompanhamento".
Última leitura (JSON): ${JSON.stringify(lastReading ?? {}, null, 2)}

Nova mensagem do usuário: "${user_message}"

Métricas recalculadas (sugestão do servidor): ${JSON.stringify(updated)}

TAREFA:
- Responda CURTO, claro e em português (3–6 linhas).
- Explique em 1–2 frases como o estado relatado impacta FPC, φ° e FP.
- Traga 2–3 microações práticas (respiração, banho sonoro, jejum digital, alongar 7min, diário 5 linhas, etc.) alinhadas ao maior "vazamento".
- NÃO devolva JSON aqui; apenas texto simples para exibir no chat.
`;

    const r = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature,
      messages: [
        { role: "system", content: system },
        { role: "user", content: chatUser },
        ...history // opcional: se você quiser adicionar histórico real de turnos
      ]
    });

    const reply = r.choices[0]?.message?.content || "";

    return NextResponse.json({ reply, updated }, { status: 200 });
  } catch (e: any) {
    console.error("CHAT error:", e?.message || e);
    return NextResponse.json({ error: "fail", detail: e?.message || String(e) }, { status: 500 });
  }
}
