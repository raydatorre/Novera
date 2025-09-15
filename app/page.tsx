// app/page.tsx
'use client';
import React, { useEffect, useState } from 'react';

type Msg = { role: 'user' | 'assistant'; content: string };
type Reading = {
  block_A_map?: string;
  block_B_harmonic?: string;
  block_C_energy?: string;
  block_D_esoteric?: string;
  block_E_triptych?: { eli5?: string; scientist?: string; poet?: string };
  metrics?: {
    R?: number; Q?: number; DC?: number; AC_real?: number; AC_imag?: number;
    FPC?: number; phi_deg?: number; FP?: number; biggest_leak?: string;
    Q_factors?: { name: string; value: number }[];
  };
  diagnostic?: { summary?: string; actions?: string[] };
};

export default function Page() {
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  const [feel, setFeel] = useState('');
  const [kw, setKw] = useState('');
  const [temp, setTemp] = useState(0.2);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reading, setReading] = useState<Reading | null>(null);
  const [history, setHistory] = useState<Msg[]>([]);
  const [chat, setChat] = useState('');
  const [recalc, setRecalc] = useState<{ FPC: number; phi_deg: number; FP: number } | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('oraculo:last');
      if (saved) setReading(JSON.parse(saved));
    } catch {}
  }, []);
  useEffect(() => {
    if (reading) localStorage.setItem('oraculo:last', JSON.stringify(reading));
  }, [reading]);

  async function generate() {
    setLoading(true); setError(null); setRecalc(null); setHistory([]);
    try {
      const res = await fetch('/api/oraculo', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName,
          dob_DDMMYYYY: dob,
          feelings: feel,
          keywords: kw,
          temperature: temp
        })
      });
      const j = await res.json();
      if (j.error) throw new Error(j.detail || 'Falha');
      setReading(j);
    } catch (e: any) {
      setError(e?.message || 'Erro ao gerar');
    } finally {
      setLoading(false);
    }
  }

  async function sendChat() {
    if (!reading || !chat.trim()) return;
    const userMsg: Msg = { role: 'user', content: chat.trim() };
    setHistory(h => [...h, userMsg]); setChat('');
    try {
      const res = await fetch('/api/chat', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ history: [...history, userMsg], lastReading: reading, user_message: userMsg.content })
      });
      const j = await res.json();
      setHistory(h => [...h, { role: 'assistant', content: j.reply || '...' }]);
      if (j.updated?.metrics) {
        setRecalc({ FPC: j.updated.metrics.FPC, phi_deg: j.updated.metrics.phi_deg, FP: j.updated.metrics.FP });
        setReading(r => r ? { ...r, metrics: { ...r.metrics, ...j.updated.metrics } } : r);
      }
    } catch {
      setHistory(h => [...h, { role: 'assistant', content: 'Falha ao responder.' }]);
    }
  }

  const card: React.CSSProperties = { border: '1px solid #eee', borderRadius: 12, padding: 12 };

  const m = reading?.metrics || {};
  return (
    <div style={{ maxWidth: 980, margin: '24px auto', padding: 12 }}>
      <h1 style={{ fontSize: 28, fontWeight: 800 }}>Oráculo dos Números Mágicos 3.1</h1>

      <div style={{ display: 'grid', gap: 12, gridTemplateColumns: '1fr 1fr', marginTop: 12 }}>
        <label>Nome completo
          <input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Ex.: Giovana Previato Torres" />
        </label>
        <label>Data (DD/MM/AAAA)
          <input value={dob} onChange={e => setDob(e.target.value)} placeholder="19/07/2013" />
        </label>
      </div>

      <label style={{ display: 'block', marginTop: 12 }}>Como você tem se sentido nos últimos dias/semanas?
        <textarea rows={3} value={feel} onChange={e => setFeel(e.target.value)} placeholder="Ex.: ansioso com prazos e cobranças" />
      </label>

      <div style={{ display: 'grid', gap: 12, gridTemplateColumns: '1fr 1fr', marginTop: 12 }}>
        <label>Palavras-chave (opcional)
          <input value={kw} onChange={e => setKw(e.target.value)} placeholder="harmonia, intuição, equilíbrio" />
        </label>
        <label>Temperatura (0–1)
          <input type="number" step={0.1} min={0} max={1} value={temp} onChange={e => setTemp(Number(e.target.value))} />
        </label>
      </div>

      <div style={{ marginTop: 12 }}>
        <button onClick={generate} disabled={loading} style={{ padding: 12, borderRadius: 8, background: '#3347B0', color: '#fff' }}>
          {loading ? 'Gerando…' : 'Gerar mapa'}
        </button>
        {error && <span style={{ color: '#c00', marginLeft: 8 }}>{error}</span>}
      </div>

      {reading && (
        <div style={{ marginTop: 20 }}>
          <div style={{ display: 'grid', gap: 12, gridTemplateColumns: '1fr 1fr' }}>
            <div style={card}><h3>Mapa (2.0)</h3><p>{reading.block_A_map || ''}</p></div>
            <div style={card}><h3>Harmônico (3.0)</h3><p>{reading.block_B_harmonic || ''}</p></div>
            <div style={card}><h3>Energia (DC/AC)</h3><p>{reading.block_C_energy || ''}</p></div>
            <div style={card}><h3>Esotérico</h3><p>{reading.block_D_esoteric || ''}</p></div>
            <div style={{ ...card, gridColumn: '1 / -1' }}>
              <h3>Tríptico</h3>
              <pre style={{ whiteSpace: 'pre-wrap' }}>
ELI5: {reading.block_E_triptych?.eli5 || ''}
Scientist: {reading.block_E_triptych?.scientist || ''}
Poet: {reading.block_E_triptych?.poet || ''}
              </pre>
            </div>
          </div>

          <div style={{ ...card, marginTop: 12 }}>
            <h3>Métricas</h3>
            <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(m, null, 2)}</pre>
            {recalc && <p>Recalibrado agora: FPC {recalc.FPC} • φ° {recalc.phi_deg} • FP {recalc.FP}</p>}
          </div>

          <div style={{ ...card, marginTop: 12 }}>
            <h3>Pergunte ao Oráculo</h3>
            <div>
              <input value={chat} onChange={e => setChat(e.target.value)} placeholder="Hoje acordei ansioso por causa de..." />
              <button onClick={sendChat} style={{ marginLeft: 8 }}>Enviar</button>
            </div>
            <div style={{ marginTop: 8 }}>
              {history.map((m, i) => <p key={i}><b>{m.role === 'user' ? 'Você' : 'Oráculo'}:</b> {m.content}</p>)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
