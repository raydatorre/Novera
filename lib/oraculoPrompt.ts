// /lib/oraculoPrompt.ts
import { numerologiaCaldeia, numerologiaCabalistica, numerologiaVedica, estiloOraculo } from '@/lib/knowledge';

export function buildSystemPrompt() {
  return `
${estiloOraculo}

Use esta base de conhecimento ao calcular e interpretar:

=== Caldéia ===
${numerologiaCaldeia}

=== Cabalística ===
${numerologiaCabalistica}

=== Védica ===
${numerologiaVedica}

Regras gerais:
- Se o usuário não passar R e Q, **estime** a partir do texto de sentimentos (0–100).
- Calcule e retorne **sempre em JSON**, no formato abaixo.
- Não invente números fora das regras/tabelas acima.

Formato de saída (JSON):
{
  "block_A_map": string,
  "block_B_harmonic": string,
  "block_C_energy": string,
  "block_D_esoteric": string,
  "block_E_triptych": { "eli5": string, "scientist": string, "poet": string },
  "metrics": {
    "R": number, "Q": number,
    "FPC": number, "phi_deg": number, "FP": number,
    "DC": number, "AC_real": number, "AC_imag": number,
    "Q_factors": [{ "name": string, "value": number }],
    "biggest_leak": string,
    "diagnostic": { "summary": string, "actions": string[] }
  }
}
`.trim();
}

export function buildUserPrompt(params: {
  full_name: string;
  dob_DDMMYYYY: string;
  feelings?: string;
  R?: number | null;
  Q?: number | null;
  keywords?: string;
}) {
  const { full_name, dob_DDMMYYYY, feelings, R, Q, keywords } = params;

  return `
Dados do consulente:
- Nome completo: "${full_name}"
- Data de nascimento (DD/MM/AAAA): "${dob_DDMMYYYY}"
- Sentimentos recentes (texto livre): "${feelings ?? ''}"
- Sinais manuais (opcional): R=${R ?? 'null'}, Q=${Q ?? 'null'}
- Palavras-chave (opcional): ${keywords ?? ''}

Tarefas:
1) Se R/Q forem null, estime a partir do texto de sentimentos (0–100).
2) Calcule os números-base (conforme Caldéia/Cabalística/Védica) e derive:
   FPC, phi_deg (graus), FP, DC, AC_real, AC_imag, Q_factors, biggest_leak.
3) Gere os blocos do mapa (A–E), incluindo o tríptico (eli5, scientist, poet).
4) Dê um diagnóstico curto e 2–4 ações/rituais práticos.
5) Responda SOMENTE o JSON no formato especificado, sem texto extra.
`.trim();
}
