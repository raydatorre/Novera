// app/api/chat/route.ts
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { fpc, phiDeg, fp, biggestLeak } from "@/lib/oraculoMath";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { history = [], lastReading, user_message = "" } = await req.json();

    // se o usuário descreveu estados/ansiedades, estimamos um Q momentâneo
    let updated = null as null | any;
    if (lastReading && typeof user_message === "string" && user_message.trim()) {
      const msg = user_message.toLowerCase();
      const dQ =
        /\b(ansios|press|prazo|cobran|ruíd|soc|buroc)\b/.test(msg) ? +10 :
        /\b(calmo|centrad|alinhad|clar)\b/.test(msg) ? -8 : +2;

      const R = Number(lastReading.metrics?.R ?? 60);
      const Q = Math.max(0, Number(lastReading.metrics?.Q ?? 22) + dQ);
      const DC = Number(lastReading.metrics?.DC ?? 7);
      const AC_real = Number(lastReading.metrics?.AC_real ?? 10);
      const AC_imag = Math.max(0, Number(lastReading.metrics?.AC_imag ?? 3) + (dQ > 0 ? 2 : -1));

      const FPC = fpc(R, Q);
      const phi_deg = phiDeg(R, Q);
      const FP = fp(DC, AC_real, AC_imag);
      const leak = biggestLeak(DC, AC_real, AC_imag);

      updated = {
        ...lastReading,
        metrics: { ...lastReading.metrics, R, Q, DC, AC_real, AC_imag, FPC, phi_deg, FP, biggest_leak: leak }
      };
    }

    const system = `
Você é o Oráculo 3.1 em modo conversa.
Use SEMPRE o "lastReading" (JSON) como referência factual.
Quando o usuário relata estados atuais, explique o impacto em FPC, φ° e FP
e sugira 2–3 microações (respiração, banho sonoro, jejum digital, alongar 7min, etc).
Responda curto, claro e em português.`;

    const messages = [
      { role: "system", content: system },
      { role: "user", content: `Última leitura (JSON): ${JSON.stringify(updated || lastReading)}` },
      ...history
    ];

    const r = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.4,
      messages
    });

    const reply = r.choices[0]?.message?.content || "";
    return NextResponse.json({ reply, updated });
  } catch (err: any) {
    console.error("Chat error:", err?.message || err);
    return NextResponse.json({ error: "fail", detail: err?.message || String(err) }, { status: 500 });
  }
}
