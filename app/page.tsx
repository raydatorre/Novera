'use client';

import React, { useEffect, useState } from 'react';

type Msg = { role: 'user' | 'assistant'; content: string };

export default function Page() {
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  const [feelings, setFeelings] = useState('');
  const [R, setR] = useState<string>('');
  const [Q, setQ] = useState<string>('');
  const [kw, setKw] = useState('');
  const [temp, setTemp] = useState(0.2);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [reading, setReading] = useState<any>(null);
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
    setLoading(true);
    setError(null);
    setRecalc(null);
    setHistory([]);
    try {
      const res = await fetch('/api/oraculo', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName,
          dob_DDMMYYYY: dob,
          feelings,
          R: R === '' ? null : Number(R),
          Q: Q === '' ? null : Number(Q),
          keywords: kw,
          temperature: temp
        })
      });
      const j = await res.json();
      if (!j.ok) throw new Error(j.error || 'Falha ao gerar');
      setReading(j.data);
    } catch (e: any) {
      setError(e?.message || 'Erro ao gerar');
    } finally {
      setLoading(false);
    }
  }

  async function sendChat() {
    if (!reading || !chat.trim()) return;
    const userMsg: Msg = { role: 'user', content: chat.trim() };
    setHistory(h => [...h, userMsg]);
    setChat('');
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          history: [...history, userMsg],
          lastReading: reading,
          user_message: userMsg.content
        })
      });
      const j = await res.json();
      setHistory(h => [...h, { role: 'assistant', content: j.reply || '...' }]);
      if (j.updated?.metrics) {
        setRecalc({
          FPC: j.updated.metrics.FPC,
          phi_deg: j.updated.metrics.phi_deg,
          FP: j.updated.metrics.FP
        });
        setReading((r: any) => (r ? { ...r, metrics: { ...r.metrics, ...j.updated.metrics } } : r));
      }
    } catch {
      setHistory(h => [...h, { role: 'assistant', content: 'Falha ao responder.' }]);
    }
  }

  const m = reading?.metrics || {};
  const trip =
    (reading?.block_E_triptych?.eli5 ? 'ELI5: ' + reading.block_E_triptych.eli5 + '\n\n' : '') +
    (reading?.block_E_triptych?.scientist ? 'Scientist: ' + reading.block_E_triptych.scientist + '\n\n' : '') +
    (reading?.block_E_triptych?.poet ? 'Poet: ' + reading.block_E_triptych.poet : '');

  return (
    <div style={{ maxWidth: 980, margin: '24px auto', padding: 12 }}>
      <h1 style={{ fontSize: 28, fontWeight: 800 }}>Oráculo dos Números Mágicos 3.1</h1>

      <div style={{ display: 'grid', gap: 12, gridTemplateColumns: '1fr 1fr', marginTop: 12 }}>
        <label>
          Nome completo
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Ex.: Giovana Previato Torres" style={inp} />
        </label>
        <label>
          Data (DD/MM/AAAA)
          <input value={dob} onChange={(e) => setDob(e.target.value)} placeholder="19/07/2013" style={inp} />
        </label>
      </div>

      <label style={{ display: 'block', marginTop: 12 }}>
        Como você tem se sentido nos últimos dias/semanas?
        <textarea rows={3} value={feelings} onChange={(e) => setFeelings(e.target.value)} placeholder="Ex.: ansioso com prazos; dormindo mal; animado com projeto pessoal" style={{ ...inp, resize: 'vertical' }} />
      </label>

      <details style={{ marginTop: 8 }}>
        <summary>Avançado: preencher R/Q manualmente</summary>
        <div style={{ display: 'grid', gap: 12, gridTemplateColumns: '1fr 1fr', marginTop: 12 }}>
          <label>
            R (0–100)
            <input type="number" min={0} max={100} value={R} onChange={(e) => setR(e.target.value)} style={inp} />
          </label>
          <label>
            Q (0–100)
            <input type="number" min={0} max={100} value={Q} onChange={(e) => setQ(e.target.value)} style={inp} />
          </label>
        </div>
      </details>

      <div style={{ display: 'grid', gap: 12, gridTemplateColumns: '1fr 1fr', marginTop: 12 }}>
        <label>
          Palavras-chave (opcional)
          <input value={kw} onChange={(e) => setKw(e.target.value)} placeholder="harmonia, intuição, equilíbrio" style={inp} />
        </label>
        <label>
          Temperatura (0–1)
          <input type="number" step={0.1} min={0} max={1} value={temp} onChange={(e) => setTemp(Number(e.target.value))} style={inp} />
        </label>
      </div>

      <div style={{ marginTop: 12 }}>
        <button onClick={generate} disabled={loading} style={btn}>{loading ? 'Gerando…' : 'Gerar mapa'}</button>
        {error && <span style={{ color: '#c00', marginLeft: 8 }}>{error}</span>}
      </div>

      {reading && (
        <div style={{ marginTop: 20 }}>
          <div style={{ display: 'grid', gap: 12, gridTemplateColumns: '1fr 1fr' }}>
            <Card title="Mapa (2.0)" body={reading.block_A_map || ''} />
            <Card title="Harmônico (3.0)" body={reading.block_B_harmonic || ''} />
            <Card title="Energia (DC/AC)" body={reading.block_C_energy || ''} />
            <Card title="Esotérico" body={reading.block_D_esoteric || ''} />
            <Card title="Tríptico" body={trip} full />
          </div>

          <div style={card}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Badge>FPC: {val(m.FPC)}</Badge>
              <Badge>φ°: {val(m.phi_deg)}</Badge>
              <Badge>FP: {val(m.FP)}</Badge>
              <Badge>Vazamento: {m.biggest_leak || '–'}</Badge>
            </div>
            {recalc && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                <Badge>Agora FPC: {recalc.FPC}</Badge>
                <Badge>Agora φ°: {recalc.phi_deg}</Badge>
                <Badge>Agora FP: {recalc.FP}</Badge>
              </div>
            )}
          </div>

          <h3 style={{ marginTop: 12 }}>Métricas (JSON)</h3>
          <pre style={pre}>{JSON.stringify(reading.metrics || {}, null, 2)}</pre>

          <h3>Diagnóstico</h3>
          <pre style={pre}>
            {(reading?.diagnostic?.summary || '')}
            {'\n\nAções: '}
            {(reading?.diagnostic?.actions || []).join('; ')}
          </pre>

          <h2 style={{ marginTop: 20 }}>Pergunte ao Oráculo</h2>
          <div style={chatbox}>
            {history.length === 0 && <div style={{ opacity: .6 }}>Ex.: “Hoje estou ansioso por causa de X… o que ajustar?”</div>}
            {history.map((m, i) => (
              <div key={i} style={{ textAlign: m.role === 'user' ? 'right' : 'left' }}>
                <div style={bubble}><strong>{m.role === 'user' ? 'Você' : 'Oráculo'}:</strong> {m.content}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <input value={chat} onChange={(e) => setChat(e.target.value)} placeholder="Sua pergunta…" style={{ ...inp, flex: 1 }} />
            <button onClick={sendChat} style={btn}>Enviar</button>
          </div>
        </div>
      )}
    </div>
  );
}

function Card({ title, body, full }: { title: string; body: string; full?: boolean }) {
  return (
    <div style={{ ...card, gridColumn: full ? '1 / -1' : undefined }}>
      <h4 style={{ margin: 0, fontWeight: 700 }}>{title}</h4>
      <p style={{ whiteSpace: 'pre-wrap', marginTop: 8 }}>{body}</p>
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return <span style={{ display: 'inline-block', padding: '4px 8px', borderRadius: 999, background: '#eef' }}>{children}</span>;
}

function val(x: any) {
  return typeof x === 'number' ? x : (x ?? '–');
}

const inp: React.CSSProperties = { width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: 8 };
const btn: React.CSSProperties = { padding: '10px 16px', border: 'none', borderRadius: 8, background: '#3347B0', color: '#fff', fontWeight: 700, cursor: 'pointer' };
const card: React.CSSProperties = { border: '1px solid #eee', borderRadius: 12, padding: 12, marginTop: 12 };
const pre: React.CSSProperties = { background: '#0a0a0a', color: '#eaeaea', padding: 12, borderRadius: 8, overflow: 'auto' };
const chatbox: React.CSSProperties = { maxHeight: 260, overflow: 'auto', border: '1px solid #eee', borderRadius: 8, padding: 8, background: '#f9fafb' };
const bubble: React.CSSProperties = { display: 'inline-block', padding: '8px 10px', borderRadius: 10, background: '#fff', border: '1px solid #eee', margin: '4px 0' };
