// /app/api/oraculo/route.ts
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { buildSystemPrompt, buildUserPrompt } from '@/lib/oraculoPrompt';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      full_name,
      dob_DDMMYYYY,
      feelings,
      R = null,
      Q = null,
      keywords,
      temperature = 0.2
    } = body || {};

    if (!full_name || !dob_DDMMYYYY) {
      return NextResponse.json({ ok: false, error: 'Nome e data são obrigatórios.' }, { status: 400 });
    }

    const system = buildSystemPrompt();
    const user = buildUserPrompt({ full_name, dob_DDMMYYYY, feelings, R, Q, keywords });

    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user }
      ]
    });

    const raw = completion.choices[0]?.message?.content ?? '{}';
    // Garante JSON
    const data = JSON.parse(raw);

    return NextResponse.json({ ok: true, data });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Falha' }, { status: 500 });
  }
}
