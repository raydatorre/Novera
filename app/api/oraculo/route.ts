// app/api/oraculo/route.ts
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { ORACULO_SYSTEM, ORACULO_SCHEMA } from "@/lib/oraculoPrompt";
import { fpc, phiDeg, fp, biggestLeak } from "@/lib/oraculoMath";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const {
      full_name,
      dob_DDMMYYYY,
      R: param_R = null,
      Q: param_Q = null,
      keywords = "",
      feelings = "",
      temperature = 0.2
    } = await req.json();

    // Sentimentos → pista para estimar R/Q quando ausentes
    const feelingsHint = feelings?.toLowerCase?.() || "";
    const qGuess =
      /\b(ansios|press|cobran|prazo|ruíd|soc|buroc)\b/.test(feelingsHint) ? 35 :
      /\b(cansa|exaust|confus|med)\b/.test(feelingsHint) ? 28 :
      /\b(centrad|calm|alinhad|clar)\b/.test(feelingsHint) ? 15 : 22;
    const rGuess =
      /\b(clar|foco|confian|propós|fluxo)\b/.test(feelingsHint) ? 75 :
      /\b(cansa|duv|desalinh|perdid)\b/.test(feelingsHint) ? 45 : 60;

    const userContent = `Schema alvo:
${ORACULO_SCHEMA}

Dados:
Nome: ${full_name || ""}
Data: ${dob_DDMMYYYY || ""}
R: ${param_R ?? "N/A"}
Q: ${param_Q ?? "N/A"}
Palavras: ${keywords || ""}
Sentimentos: ${feelings || ""}`;

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
    const R = Number(m.R ?? param_R ?? rGuess);
    const Q = Number(m.Q ?? param_Q ?? qGuess);
    const DC = Number(m.DC ?? 7);
    const AC_real = Number(m.AC_real ?? 10);
    const AC_imag = Number(m.AC_imag ?? 3);

    const FPC = fpc(R, Q);
    const phi_deg = phiDeg(R, Q);
    const FP = fp(DC, AC_real, AC_imag);
    const leak = biggestLeak(DC, AC_real, AC_imag);

    const final = {
      block_A_map: modelOut.block_A_map ?? "",
      block_B_harmonic: modelOut.block_B_harmonic ?? "",
      block_C_energy: modelOut.block_C_energy ?? "",
      block_D_esoteric: modelOut.block_D_esoteric ?? "",
      block_E_triptych: modelOut.block_E_triptych ?? { eli5: "", scientist: "", poet: "" },
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
      raw_model: modelOut
    };

    return NextResponse.json(final);
  } catch (err: any) {
    console.error("Generate error:", err?.message || err);
    return NextResponse.json(
      { error: "fail", detail: err?.message || String(err) },
      { status: 500 }
    );
  }
}
