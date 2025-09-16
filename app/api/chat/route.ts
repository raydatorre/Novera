// /app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { buildSystemPrompt } from '@/lib/oraculoPrompt';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      history = [],           // [{role:'user'|'assistant', content:string}]
      lastReading,            // leitura anterior (JSON)
      user_message,           // texto do chat atual
      temperature = 0.2
    } = body || {};

    const system = buildSystemPrompt();

    const messages = [
      { role: 'system' as const, content: system },
      {
        role: 'user' as const,
        content: `
Você está em modo "chat de acompanhamento".
Contexto (última leitura JSON): 
${JSON.stringify(lastReading ?? {}, null, 2)}

Nova mensagem do usuário:
"${user_message}"

Tarefas:
- Reinterprete a situação à luz da leitura anterior.
- Se o estado emocional mudou, **reestime R e Q**, e **recalcule FPC, phi_deg, FP, DC/AC**.
- Responda em JSON:
{
  "reply": string,               // o que você diz ao usuário
  "updated": { ...mesmo formato da leitura, apenas se houve mudança de métricas... } | null
}
`
      }
    ];

    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature,
      messages
    });

    const raw = completion.choices[0]?.message?.content ?? '{}';
    const data = JSON.parse(raw);

    return NextResponse.json({ ok: true, ...data });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Falha' }, { status: 500 });
  }
}
