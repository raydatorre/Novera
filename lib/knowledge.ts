// lib/knowledge.ts
// *** Conteúdo essencial dos seus materiais, resumido e pronto pro prompt ***
// Dica: mantenha conciso. Se quiser, você pode expandir depois, mas tente ficar
// entre 10k–20k caracteres para não estourar contexto do modelo.

export const numerologiaCaldeia = `
# Numerologia Caldéia — Regras e Tabelas (pt-BR)

## Tabela de letras → números (1–8)
1: A, I, J, Q, Y
2: B, K, R
3: C, G, L, S
4: D, M, T
5: E, H, N, X
6: U, V, W
7: O, Z
8: F, P

- K e R = 2 (atenção a variações em outras escolas; aqui seguimos sua tabela).
- W conta como 6 (não separa em "VV").
- Q e Y = 1.

## Como calcular (nome)
1) Remova acentos e pontuação; considere apenas letras.
2) Some os valores de cada letra segundo a tabela (1–8).
3) Reduza por soma de dígitos até obter 1–8, preservando mestres quando aplicável:
   - Números mestres que esta linha de estudo mantém: 11 e 22.
   - Se o total for 11 ou 22, você pode manter sem reduzir.
4) Interpretação rápida (essência do nome):
   - 1: liderança, início, identidade
   - 2: parceria, mediação, sensibilidade
   - 3: expressão, criatividade, social
   - 4: estrutura, método, rotina
   - 5: movimento, mudança, adaptação
   - 6: relações, cuidado, estética
   - 7: introspecção, busca, mistério
   - 8: poder, matéria, realização

## Como calcular (data)
- Número do dia (1–31) pode ser lido diretamente e/ou reduzido.
- Caminho/Destino (Pitagórico no calendário): soma dia+mes+ano até 1–9 (ou mantenha 11/22).
- Use estes números em conjunto com o nome para o "mapa".
`;

export const numerologiaCabalistica = `
# Gematria / Cabalística — Essencial (pt-BR)

## Valores das letras hebraicas (tradicional)
א=1, ב=2, ג=3, ד=4, ה=5, ו=6, ז=7, ח=8, ט=9
י=10, כ=20, ל=30, מ=40, נ=50, ס=60, ע=70, פ=80, צ=90
ק=100, ר=200, ש=300, ת=400

- Palavras que somam o mesmo valor compartilham essência/ideia.
- Exemplos clássicos:
  18 = חי (Chai, “vida”)
  26 = יהוה (Tetragrama)
  72 = Nome de 72 aspectos (Shemhamphorash)

## Leitura no Oráculo
- Conecte números-chave do consulente (do nome/data) a arquétipos da Árvore da Vida:
  * 1 Keter (vontade), 2 Chokhmah (sabedoria), 3 Binah (entendimento),
    4 Chesed (misericórdia), 5 Gevurah (força), 6 Tiferet (beleza/equilíbrio),
    7 Netzach (vitória), 8 Hod (glória/intelecto), 9 Yesod (fundação), 10 Malkhut (manifestação).
- Faça paralelos suaves (ex.: "seus 6 e 9 ressoam com Tiferet e Yesod, equilíbrio entre essência e forma").
- Use com sobriedade: isso é apoio simbólico, não dogma.
`;

export const numerologiaVedica = `
# Numerologia Védica — Regras e Tabelas (pt-BR)

## Planetas regentes (1–9)
1: Sol (Surya)
2: Lua (Chandra)
3: Júpiter (Guru)
4: Rahu
5: Mercúrio (Budha)
6: Vênus (Shukra)
7: Ketu
8: Saturno (Shani)
9: Marte (Mangala)

## Números básicos
- Número Psíquico: dia do nascimento reduzido (1–9).
- Número do Destino/Caminho: soma total da data (DD+MM+AAAA) reduzida (1–9).
- Nome (se desejar em leitura védica): some letras mapeadas para 1–9 (linha védica costuma seguir Pitagórico para latinas, mas você pode manter Caldéia para o Nome e apenas usar a visão planetária aqui).

## Interpretação rápida
- 1 (Sol): identidade, afirmação, vitalidade
- 2 (Lua): emoções, ciclos, receptividade
- 3 (Júpiter): expansão, propósito, sabedoria
- 4 (Rahu): inovação, atalho, quebra de padrões
- 5 (Mercúrio): mente, linguagem, comércio
- 6 (Vênus): relações, arte, conforto
- 7 (Ketu): espiritualidade, desligamento, síntese
- 8 (Saturno): tempo, trabalho, estrutura kármica
- 9 (Marte): ação, coragem, corte
`;

export const estiloOraculo = `
# Oráculo 3.1 — Estilo e Métrica Interna

## Tom & Forma
- Fale com empatia, prático e espiritual ao mesmo tempo.
- Sempre explique "como" chegou aos números em 1–2 frases.
- Traga 2–4 ações/rituais simples para reconectar com os números-base (respiração, rotina, vela, salmo, jejum digital, banho, caminhada, diário, etc.).

## Métricas internas (para orientar respostas consistentes)
- R e Q (0–100) são vetores internos (R = coerência/essência; Q = ruído/forças externas).
- φ° = atan2(Q, R) em graus (−180..+180). Pequeno |φ°| → alinhado com a essência.
- FPC = R / √(R²+Q²)  ∈ [0,1]  (quanto maior, mais centrado).
- FP (heurística simples e estável): FP ≈ 1 − min(|φ°|, 90)/90  ∈ [0,1].
  - Use FPC e φ° para qualificar seu aconselhamento: “o ângulo sugere desvio leve/moderado/alto”.
- “Vazamento”:
  - DC (essência) quando FPC está alto e |φ°| baixo.
  - AC (forças externas) quando Q domina (|φ°| alto).
  - Diga de onde vaza e como “vedar” com ações específicas.
`;
