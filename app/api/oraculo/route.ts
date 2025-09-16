// app/api/oraculo/route.ts
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { buildSystemPrompt, buildOraculoUserPrompt } from "@/lib/oraculoPrompt";

// Helpers locais (evita depender do que está em lib/oraculoMath.ts)
function fpc(R: number, Q: number) {
  const denom = Math.sqrt(R * R + Q * Q) || 1;
  return +(R / denom).toFixed(2);
}
function phiDeg(R: number, Q: number) {
  const deg = (Math.atan2(Q, R) * 180) / Math.PI;
  // normaliza para 0..360, mas tanto faz mostrar negativo; use o que preferir
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

// Força execução em runtime Node (não edge), e evita cache
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

// Utilitário para tentar extrair JSON mesmo se vier com algum texto extra
function safeParseJson(s: string) {
  try { return JSON.parse(s); } catch {}
  const start = s.indexOf("{");
  const end = s.lastIndexOf("}");
  if (start >= 0 && end > start) {
    const cut = s.slice(start, end + 1);
    try { return JSON.parse(cut); } catch {}
  }
  throw new Error("Resposta do modelo não é JSON válido.");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      full_name,
      dob_DDMMYYYY,
      feelings = "",
      R = null,
      Q = null,
      keywords = "",
      temperature = 0.2
    } = body || {};

    if (!full_name || !dob_DDMMYYYY) {
      return NextResponse.json(
        { ok: false, error: "Nome completo e data (DD/MM/AAAA) são obrigatórios." },
        { status: 400 }
      );
    }

    // Monta prompts (com todo o knowledge injetado pelo buildSystemPrompt)
    const system = buildSystemPrompt();
    const user = buildOraculoUserPrompt({
      full_name,
      dob_DDMMYYYY,
      feelings,
      R,
      Q,
      keywords,
      temperature
    });

    // Chamada ao modelo — JSON FORÇADO
    const r = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: Number(temperature) || 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user }
      ]
    });

    const rawText = r.choices[0]?.message?.content || "{}";
    const modelOut = safeParseJson(rawText);

    // Garante campos mínimos
    const blocks = {
      block_A_map: modelOut.block_A_map ?? "",
      block_B_harmonic: modelOut.block_B_harmonic ?? "",
      block_C_energy: modelOut.block_C_energy ?? "",
      block_D_esoteric: modelOut.block_D_esoteric ?? "",
      block_E_triptych: modelOut.block_E_triptych ?? { eli5: "", scientist: "", poet: "" },
    };

    // Extrai/normaliza métricas que vieram do modelo (ou caem em defaults)
    const m = modelOut.metrics ?? {};
    const Rv = Number.isFinite(m.R) ? Number(m.R) : (R ?? 60);
    const Qv = Number.isFinite(m.Q) ? Number(m.Q) : (Q ?? 22);
    const DC = Number.isFinite(m.DC) ? Number(m.DC) : 7;
    const AC_real = Number.isFinite(m.AC_real) ? Number(m.AC_real) : 8;
    const AC_imag = Number.isFinite(m.AC_imag) ? Number(m.AC_imag) : 4;

    // Recalcula no servidor (fonte de verdade)
    const FPC = fpc(Rv, Qv);
    const phi_deg = phiDeg(Rv, Qv);
    const FP = fp(DC, AC_real, AC_imag);
    const leak = biggestLeak(DC, AC_real, AC_imag);

    const metrics = {
      R: Rv, Q: Qv,
      DC, AC_real, AC_imag,
      FPC, phi_deg, FP,
      Q_factors: Array.isArray(m.Q_factors) ? m.Q_factors : [],
      biggest_leak: leak,
      diagnostic: {
        summary: m?.diagnostic?.summary ?? modelOut?.metrics?.diagnostic?.summary ?? "",
        actions: Array.isArray(m?.diagnostic?.actions)
          ? m.diagnostic.actions
          : (Array.isArray(modelOut?.metrics?.diagnostic?.actions) ? modelOut.metrics.diagnostic.actions : [])
      }
    };

    const final = { ...blocks, metrics };

    return NextResponse.json(final, { status: 200 });
  } catch (e: any) {
    console.error("ORACULO error:", e?.message || e);
    return NextResponse.json({ error: "fail", detail: e?.message || String(e) }, { status: 500 });
  }
}
