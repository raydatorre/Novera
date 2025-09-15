import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: NextRequest) {
try {
const { history = [], lastReading } = await req.json();

const system = `
Você é o Oráculo 3.1 em modo conversa.
Use SEMPRE o "lastReading" (JSON) como referência factual.
Não recalcule números, a menos que o usuário peça.
Responda curto, claro e em português.
`;

const messages = [
{ role: "system", content: system },
{ role: "user", content: `Última leitura (JSON): ${JSON.stringify(lastReading)}` },
...history // [{role:"user"/"assistant", content:"..."}]
];

const r = await client.chat.completions.create({
model: "gpt-4o-mini",
temperature: 0.4,
messages
});

const reply = r.choices[0]?.message?.content || "";
return NextResponse.json({ reply });
} catch (err:any) {
console.error("Chat error:", err?.message || err);
return NextResponse.json({ error: "fail", detail: err?.message || String(err) }, { status: 500 });
}
}
