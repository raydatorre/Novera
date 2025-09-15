// app/api/generate/route.ts (App Router)
Palavras: ${param_keywords || ""}`;

// 2) Chama o modelo (Chat Completions) pedindo JSON puro
const r = await client.chat.completions.create({
model: "gpt-4o-mini",
temperature: Number(param_temperature) || 0.2,
response_format: { type: "json_object" },
messages: [
{ role: "system", content: ORACULO_SYSTEM },
{ role: "user", content: userContent }
]
});

const raw = r.choices[0]?.message?.content || "{}";
const modelOut = JSON.parse(raw);

// 3) Extrai métricas do modelo OU aplica fallback
const m = modelOut.metrics ?? {};
const R = Number(m.R ?? param_R ?? 7);
const Q = Number(m.Q ?? param_Q ?? 3);
const DC = Number(m.DC ?? 7);
const AC_real = Number(m.AC_real ?? 10);
const AC_imag = Number(m.AC_imag ?? 3);

// 4) Recalcula no servidor (pontos de confiança)
const FPC = fpc(R, Q);
const phi_deg = phiDeg(R, Q);
const FP = fp(DC, AC_real, AC_imag);
const leak = biggestLeak(DC, AC_real, AC_imag);

// 5) Monta objeto final (mantém texto do modelo + métricas confiáveis)
const final = {
block_A_map: modelOut.block_A_map ?? "",
block_B_harmonic: modelOut.block_B_harmonic ?? "",
block_C_energy: modelOut.block_C_energy ?? "",
block_D_esoteric: modelOut.block_D_esoteric ?? "",
block_E_triptych: modelOut.block_E_triptych ?? {
eli5: "", scientist: "", poet: ""
},
metrics: {
R, Q,
Q_factors: Array.isArray(m.Q_factors) ? m.Q_factors : [],
DC, AC_real, AC_imag,
FPC, phi_deg, FP,
biggest_leak: leak
},
diagnostic: {
summary: modelOut.diagnostic?.summary ?? "",
actions: Array.isArray(modelOut.diagnostic?.actions)
? modelOut.diagnostic.actions
: []
},
raw_model: modelOut // útil pra debug (colapse no UI)
};

return NextResponse.json(final);
} catch (err: any) {
console.error("Generate error:", err?.message || err);
return NextResponse.json({ error: "fail", detail: err?.message || String(err) }, { status: 500 });
}
}
