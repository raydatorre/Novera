// lib/oraculoPrompt.ts
// Monta os prompts do Oráculo e do chat, injetando o knowledge.
// Exporte várias “assinaturas” para ficar compatível com rotas antigas.

import {
  numerologiaCaldeia,
  numerologiaCabalistica,
  numerologiaVedica,
  ileHaelNotas,
  estiloOraculo,
} from './knowledge';

// Tipos mínimos (auto-contidos). Se você já tem em /types, pode trocar os imports.
export type Msg = { role: 'user' | 'assistant' | 'system'; content: string };
export type Reading = {
  block_A_map?: string;
  block_B_harmonic?: string;
  block_C_energy?: string;
  block_D_esoteric?: string;
  block_E_triptych?: { eli5?: string; scientist?: string; poet?: string };
  metrics?: {
    R?: number; Q?: number;
    DC?: number; AC_real?: number; AC_imag?: number;
    FPC?: number; phi_deg?: number; FP?: number;
    Q_factors?: { name: string; value: number }[];
    diagnostic?: { summary?: string; actions?: string[] };
  };
};

const KNOWLEDGE = `
## Base do Método
${numerologiaCaldeia}

${numerologiaCabalistica}

${numerologiaVedica}

## Enfoque Ilê Hael
${ileHaelNotas}

## Tom de Voz
${estiloOraculo}
`;

// ------------ SYSTEM PROMPT ------------
export function buildSystemPrompt(): string {
  return `
Você é o **Oráculo 3.1** (numerologia Caldéia + Cabalística + Védica, com enfoque Ilê Hael).
Você gera um JSON enxuto com 5 blocos de texto e um bloco de métricas.

### COMO RESPONDER (sempre JSON válido):
{
  "block_A_map": "... mapa de vida (2–4 parágrafos)...",
  "block_B_harmonic": "... interpretação harmônica entre dados (1–2 parágrafos)...",
  "block_C_energy": "... leitura 'energia DC/AC' (1–2 parágrafos, simples)...",
  "block_D_esoteric": "... ligação cabalística/Ilê Hael (1–2 parágrafos, prático)...",
  "block_E_triptych": {
    "eli5": "... explicação para leigo, 4–6 linhas ...",
    "scientist": "... explicação técnica/ordenada, 4–6 linhas ...",
    "poet": "... versão poética/imagética, 4–6 linhas ..."
  },
  "metrics": {
    "R": number|null, "Q": number|null,
    "DC": number|null, "AC_real": number|null, "AC_imag": number|null,
    "FPC": number|null, "phi_deg": number|null, "FP": number|null,
    "Q_factors": [{"name": string, "value": number}] | [],
    "diagnostic": { "summary": string, "actions": string[] }
  }
}

### REGRAS
- Seja específico, porém direto. Evite clichês.
- Mostre (em 1–2 frases) como chegou aos números/conclusões.
- Traga 2–4 ações/rituais **executáveis** (respiração, afirmações, mini-rotinas de 3–7 dias).
- Use o **Conhecimento de Base** abaixo como referência:

${KNOWLEDGE}
`;
}

// ------------ PROMPT DO ORÁCULO (entrada do usuário) ------------
export type OraculoInput = {
  full_name: string;
  dob_DDMMYYYY: string; // "10/05/1983"
  feelings?: string;     // livre
  R?: number | null;     // 0–100 (opcional)
  Q?: number | null;     // 0–100 (opcional)
  keywords?: string;     // livre (csv)
  temperature?: number;  // 0–1 (sugestão default 0.2)
};

export function buildOraculoUserPrompt(i: OraculoInput): string {
  const k = i.keywords?.trim() ? i.keywords : '(sem)';
  const feelings = i.feelings?.trim() || '(não informado)';
  const R = Number.isFinite(i.R as number) ? i.R : null;
  const Q = Number.isFinite(i.Q as number) ? i.Q : null;

  return `
### Contexto de entrada
Nome completo: ${i.full_name}
Data de nascimento (DD/MM/AAAA): ${i.dob_DDMMYYYY}
Sentimentos recentes (livre): ${feelings}
Palavras-chave: ${k}
Métricas fornecidas (opcional): R=${R} | Q=${Q}

### Tarefa
1) Calcule leituras combinando Caldéia, Cabalística e Védica (+ enfoque Ilê Hael).
2) Se houver R e Q, use-os na seção de métricas (FPC/φ°/FP).
3) Responda **apenas** com o JSON no formato especificado no SYSTEM.
`;
}

// ------------ PROMPT DO CHAT (seguimento, com última leitura) ------------
export function buildChatUserPrompt(args: {
  history: Msg[];
  lastReading: Reading | null;
  user_message: string;
}) {
  const last = JSON.stringify(args.lastReading ?? {}, null, 2);
  const hist = args.history.map((m) => `${m.role.toUpperCase()}: ${m.content}`).join('\n');

  return `
### Histórico resumido
${hist || '(sem histórico)'}

### Última leitura (JSON)
${last}

### Nova pergunta
${args.user_message}

### Tarefa
- Responda como Oráculo 3.1, mantendo coerência com a última leitura.
- Se houver recalcular métricas/ações, inclua em **metrics.diagnostic** e, se aplicável,
  atualize "metrics" (FPC/φ°/FP).
- Devolva **sempre JSON** no MESMO formato da leitura principal.
`;
}

// ──────────────────────────────────────────────────────────────
// ALIÁSES (para compatibilizar com rotas antigas)
// ──────────────────────────────────────────────────────────────
export const makeSystemPrompt = buildSystemPrompt;
export const system = buildSystemPrompt;

export const buildPrompt = buildOraculoUserPrompt;
export const makeOraculoPrompt = buildOraculoUserPrompt;

export const buildChat = buildChatUserPrompt;
export const makeChatPrompt = buildChatUserPrompt;
