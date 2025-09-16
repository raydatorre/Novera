// lib/knowledge.ts
// ===============================
// Base de conhecimento do Oráculo 3.1
// ===============================
// Dica: mantenha este arquivo como a "enciclopédia" do seu método.
// Ele é injetado no system prompt, então seja conciso, mas completo.
// ~10k–20k caracteres é tranquilo.

// ──────────────────────────────────────────────────────────────
// NUMEROLOGIA CALDÉIA (CHALDEAN)
// ──────────────────────────────────────────────────────────────
export const numerologiaCaldeia = `
# Numerologia Caldéia – Regras Essenciais
A Caldéia (Chaldean) usa valores 1–8 para letras; o 9 é especial (sagrado) e
costuma entrar só em somas totais. Números-mestres principais: 11, 22.

## Tabela (pt-BR)
1: A I J Q Y
2: B K R
3: C G L S
4: D M T
5: E H N X
6: U V W
7: O Z
8: F P

## Como calcular o Número do Nome (Caldéia)
1) Translitere o nome completo para as letras acima; desconsidere acentos.
2) Some os valores de cada parte (Nome, Sobrenome) e do nome completo.
3) Reduza cada soma até 1 dígito (1–9), EXCETO se cair em 11 ou 22 (mestres).
4) Interpretação rápida:
   - 1: iniciativa, liderança, identidade
   - 2: diplomacia, sensibilidade, parceria
   - 3: expressão, criatividade, sociabilidade
   - 4: estrutura, ordem, trabalho
   - 5: movimento, mudanças, versatilidade
   - 6: harmonia, cuidado, estética
   - 7: introspecção, pesquisa, espiritualidade
   - 8: poder material, gestão, legado
   - 9: síntese, compaixão, serviço (aparece em totais)
   - 11: inspiração espiritual e visão
   - 22: construção em grande escala (mestre construtor)
`;

// ──────────────────────────────────────────────────────────────
// GEMATRIA / NUMEROLOGIA CABALÍSTICA (LATIM → HEBRAICO)
// ──────────────────────────────────────────────────────────────
export const numerologiaCabalistica = `
# Gematria / Cabalística – Regras Essenciais
Usamos equivalências latinas simples para letras hebraicas (gematria) e
relacionamos significados com as sefirot (Árvore da Vida). O objetivo é
revelar “padrões de energia” no nome e na data.

## Valores hebraicos (simples)
1  Alef (A)
2  Bet (B)
3  Guímel (G)
4  Dálet (D)
5  Hei (H)
6  Vav (V, W, O)
7  Zain (Z)
8  Chet (Ch)
9  Tet (T)
10 Iod (I, Y)
20 Kaf (K, C duro)
30 Lamed (L)
40 Mem (M)
50 Nun (N)
60 Samekh (S)
70 Ain (ʼ, vogal muda)
80 Pe (P)
90 Tsadi (Ts/Tz)
100 Qof (Q)
200 Resh (R)
300 Shin (Sh)
400 Tav (T final)

## Regras práticas
- Transliteração simples: I/Y → IOD (10); V/W/O → VAV (6); CH → CHET (8); SH → SHIN (300); TS/TZ → TSADI (90).
- Some valores de cada palavra e do nome completo; observe se há “picos” (valores altos) em Shin (300), Tav (400) etc.
- Sefirot (sugestão de leitura):
  Keter (1) propósito sutil; Chochmah (2) insight; Binah (3) estrutura mental;
  Chesed (4) expansão; Gevurah (5) disciplina; Tiferet (6) beleza/equilíbrio;
  Netzach (7) vitória; Hod (8) síntese/intelecto; Yesod (9) fundamento/emoção;
  Malkhut (10) materialização.

## Interpretação compacta
- Totais baixos: energia mais suave/introspectiva.
- Totais altos: energia expressiva/transformadora.
- Padrões: predominância de Vav/Iod sugere “fio condutor” comunicação-intuição;
  presença forte de Shin indica poder transformador pela palavra/ideia.
`;

// ──────────────────────────────────────────────────────────────
// NUMEROLOGIA VÉDICA (FOCO PRÁTICO)
// ──────────────────────────────────────────────────────────────
export const numerologiaVedica = `
# Numerologia Védica – Regras Essenciais
Foco em três chaves: Número Psíquico, Número do Destino e vibração do Nome.
Usaremos a mesma tabela prática de 1–8 (Caldéia) para o Nome quando for útil.

## Cálculos
- Número Psíquico: reduza o DIA do nascimento até 1 dígito (1–9). Mestres (11, 22) mantêm a nuance.
- Número do Destino: some toda a data (DD+MM+AAAA) e reduza até 1 dígito (1–9), mantendo mestres se ocorrer.
- Nome (quando aplicável): use a tabela 1–8 como suporte de leitura vibracional do nome.

## Leitura rápida
1 Sol (vitalidade, liderança) | 2 Lua (emoção, empatia)
3 Júpiter (expansão, ensino) | 4 Rahu (inovação, “hack” de sistemas)
5 Mercúrio (comunicação, comércio) | 6 Vênus (arte, estética, cuidado)
7 Ketu (espiritual, pesquisa) | 8 Saturno (estrutura, legado, tempo)
9 Marte (ação, coragem) — quando surgir no total.

Sugestões: alinhar o Psíquico (dia) com rotinas diárias; o Destino (data completa) indica “meta de vida”.
`;

// ──────────────────────────────────────────────────────────────
// ILÊ HAEL – ENFOQUE (cabalístico/ritualístico) PARA LEITURA
// ──────────────────────────────────────────────────────────────
export const ileHaelNotas = `
# Ilê Hael – Enfoque de Leitura
- Integra cabalística e leitura prática do nome/data; valoriza “Lições” (faltas) quando números/letras não aparecem.
- **Lições Kármicas** (abordagem prática): identifique números ausentes no nome (1–9); cada ausência sugere aprendizado:
  1 iniciativa/decisão; 2 cooperação/escuta; 3 expressão creativa; 4 disciplina/rotina;
  5 flexibilidade; 6 cuidado/estética; 7 estudo/espiritual; 8 gestão/tempo; 9 compaixão/síntese.
- **Ano Pessoal**: some (dia + mês + ano corrente) e reduza (1–9). Interpretação:
  1 inícios; 2 alianças; 3 expressão; 4 trabalho/estrutura; 5 mudanças; 6 família/estética;
  7 estudo/retrospecção; 8 expansão material; 9 fechamento/revisão.
- **Rituais simples** (ex.: 3–7 dias): velas brancas; salmo/afirmação alinhada ao número do foco; respiração 4–7–8;
  banho de ervas leves (alecrim/louro para clareza; camomila para acalmar); caderno de gratidão (6 itens); caminhada consciente 15–20 min.
- **Sefirot como mapa**: Tiferet (equilíbrio do coração) como eixo (“o bonito funciona”); Yesod (fundação/emoção) como base prática;
  Malkhut (realização) como verificação: “o que virou hábito/resultado?”.
`;

// ──────────────────────────────────────────────────────────────
// “TOM DE VOZ” DO ORÁCULO
// ──────────────────────────────────────────────────────────────
export const estiloOraculo = `
Você é o Oráculo 3.1.
- Fale com empatia, linguagem clara e estética simples (sem jargão desnecessário).
- Sempre explique **como** chegou aos números em 1–2 frases.
- Traga 2–4 ações/rituais práticos (respiração guiada, afirmações, mini-rotina, gesto simbólico) alinhados aos números-base.
- Quando houver métricas (R, Q, FPC, φ°), use-as como “bússola” de equilíbrio.
`;
