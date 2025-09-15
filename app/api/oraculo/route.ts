import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { ORACULO_SYSTEM, ORACULO_SCHEMA } from "@/lib/oraculoPrompt";
import { fpc, phiDeg, fp, biggestLeak } from "@/lib/oraculoMath";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: NextRequest) {
  try {
    const {
      full_name,
      dob_DDMMYYYY,
      feelings = "",
      R: param_R = null,
      Q: param_Q = null,
      keywords = "",
      temperature = 0.2
    } = await req.json();

    const KNOWLEDGE_PACK = `
[Knowledge]
• Caldéia (destino oculto/carma, 9 sagrado); • Cabalística (sefirot/caminhos/virtudes);
• Gematria Judaica (1–400, ex.: 18=vida/Chai; 26=Nome Divino);
• Védica (1 Sol, 2 Lua, 3 Júpiter, 4 Rahu, 5 Mercúrio, 6 Vênus, 7 Ketu, 8 Saturno, 9 Marte).`;

    const userContent =
`Schema alvo:
${ORACULO_SCHEMA}

Dados:
Nome: ${full_name || ""}
Data: ${dob_DDMMYYYY || ""}
Sentimentos: ${feelings || "(não informado)"}
R: ${param_R === null ? "N/A" : param_R}
Q: ${param_Q === null ? "N/A" : param_Q}
Palavras: ${keywords || ""}

${KNOWLEDGE_PACK}`;

    const r = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: Number(temperature) || 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: ORACULO_SYSTEM },
        { role: "user", content: userContent }
      ]
    });

    const raw = r.choices[0]?.message?.content || "{}";
    const modelOut = JSON.parse(raw);

    const m = modelOut.metrics ?? {};
    const R = Number(m.R ?? param_R ?? 70);
    const Q = Number(m.Q ?? param_Q ?? 30);
    const DC = Number(m.DC ?? 7);
    const AC_real = Number(m.AC_real ?? 9);
    const AC_imag = Number(m.AC_imag ?? 3);

    const FPC = fpc(R, Q);
    const phi_deg = phiDeg(R, Q);
    const FPv = fp(DC, AC_real, AC_imag);
    const leak = biggestLeak(DC, AC_real, AC_imag);

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
        FPC, phi_deg, FP: FPv,
        biggest_leak: leak
      },
      diagnostic: {
        summary: modelOut?.diagnostic?.summary ?? "",
        actions: Array.isArray(modelOut?.diagnostic?.actions) ? modelOut.diagnostic.actions : []
      },
      raw_model: modelOut
    };

    return NextResponse.json({ ok:true, data: final, raw: raw });
  } catch (err:any) {
    return NextResponse.json({ ok:false, error: err?.message || String(err) }, { status: 500 });
  }
}
