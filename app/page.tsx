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
  diagnostic?: { summary?: string; actions?: string[] };
  metrics?: {
    R?: number; Q?: number; DC?: number; AC_real?: number; AC_imag?: number;
    FPC?: number; phi_deg?: number; FP?: number; biggest_leak?: string;
    Q_factors?: { name: string; value: number }[];
  };
};

export default function Page() {
  // Form
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('19/07/2013');
  const [feel, setFeel] = useState('');
  const [R, setR] = useState<string>('');          // opcional
  const [Q, setQ] = useState<string>('');          // opcional
  const [kw, setKw] = useState('');
  const [temp, setTemp] = useState(0.2);

  // App state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reading, setReading] = useState<Reading | null>(null);
  const [history, setHistory] = useState<Msg[]>([]);
  const [chat, setChat] = useState('');
  const [recalc, setRecalc] = useState<{ FPC: number; phi_deg: number; FP: number } | null>(null);
  const [raw, setRaw] = useState<any>(null);

  // restore
  useEffect(() => {
    try { const saved = localStorage.getItem('oraculo:last'); if (saved) setReading(JSON.parse(saved)); } catch {}
  }, []);
  useEffect(() => { if (reading) localStorage.setItem('oraculo:last', JSON.stringify(reading)); }, [reading]);

  async function generate() {
    setLoading(true); setError(null); setRecalc(null); setHistory([]); setRaw(null);
    try {
      const res = await fetch('/api/oraculo', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName,
          dob_DDMMYYYY: dob,
          feelings: feel,
          R: R.trim() ? Number(R) : null,
          Q: Q.trim() ? Number(Q) : null,
          keywords: kw,
          temperature: temp
        })
      });
      const j = await res.json();
      if (j.error) throw new Error(j.detail || 'Falha');
      setReading(j);
      setRaw(j.raw_model ?? null);
    } catch (e: any) {
      setError(e?.message || 'Erro ao gerar');
    } finally { setLoading(false); }
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

  const m = reading?.metrics || {};
  return (
    <div className="container">
      <h1>Oráculo dos Números Mágicos 3.1</h1>

      <div className="grid g2" style={{ marginTop: 12 }}>
        <label>Nome completo
          <input className="inp" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Ex.: Giovana Previato Torres" />
        </label>
        <label>Data (DD/MM/AAAA)
          <input className="inp" value={dob} onChange={e => setDob(e.target.value)} placeholder="19/07/2013" />
        </label>
      </div>

      <div className="grid g2" style={{ marginTop: 12 }}>
        <label>R (0–100, opcional)
          <input className="inp" type="number" min={0} max={100} value={R} onChange={e => setR(e.target.value)} />
        </label>
        <label>Q (0–100, opcional)
          <input className="inp" type="number" min={0} max={100} value={Q} onChange={e => setQ(e.target.value)} />
        </label>
      </div>

      <label className="sectionTitle" style={{ display: 'block' }}>Palavras-chave (opcional)</label>
      <input className="inp" value={kw} onChange={e => setKw(e.target.value)} placeholder="harmonia, intuição, equilíbrio" />

      <div className="grid g2" style={{ marginTop: 12 }}>
        <label>Temperatura (0–1)
          <input className="inp" type="number" step={0.1} min={0} max={1} value={temp} onChange={e => setTemp(Number(e.target.value))} />
        </label>
        <div className="row" style={{ justifyContent: 'flex-end', alignSelf: 'end' }}>
          <button className="btn" onClick={generate} disabled={loading}>{loading ? 'Gerando…' : 'Gerar mapa'}</button>
          {error && <span style={{ color: '#c00', marginLeft: 10 }}>{error}</span>}
        </div>
      </div>

      <h2 className="sectionTitle" style={{ marginTop: 16 }}>Resultado</h2>

      {/* chips de métricas */}
      <div className="chips">
        <span className="chip">FPC: {m.FPC ?? '–'}</span>
        <span className="chip">φ°: {m.phi_deg ?? '–'}</span>
        <span className="chip">FP: {m.FP ?? '–'}</span>
        <span className="chip">Vazamento: {m.biggest_leak ?? '–'}</span>
      </div>

      {reading && (
        <div className="cards g2" style={{ marginTop: 12 }}>
          <div className="card"><h3>Mapa (2.0)</h3><p>{reading.block_A_map || ''}</p></div>
          <div className="card"><h3>Harmônico (3.0)</h3><p>{reading.block_B_harmonic || ''}</p></div>
          <div className="card"><h3>Energia (DC/AC)</h3><p>{reading.block_C_energy || ''}</p></div>
          <div className="card"><h3>Esotérico</h3><p>{reading.block_D_esoteric || ''}</p></div>

          <div className="card" style={{ gridColumn: '1 / -1' }}>
            <h3>Tríptico</h3>
            <pre style={{ whiteSpace: 'pre-wrap' }}>
ELI5: {reading.block_E_triptych?.eli5 || ''}
Scientist: {reading.block_E_triptych?.scientist || ''}
Poet: {reading.block_E_triptych?.poet || ''}
            </pre>
          </div>

          <div className="card" style={{ gridColumn: '1 / -1' }}>
            <h3>Métricas (JSON)</h3>
            <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(m, null, 2)}</pre>
          </div>

          <div className="card" style={{ gridColumn: '1 / -1' }}>
            <h3>Diagnóstico</h3>
            <p>{reading.diagnostic?.summary || '—'}</p>
            {Array.isArray(reading.diagnostic?.actions) && reading.diagnostic!.actions!.length > 0 && (
              <ul>
                {reading.diagnostic!.actions!.map((a, i) => <li key={i}>{a}</li>)}
              </ul>
            )}
          </div>

          {raw && (
            <div className="card" style={{ gridColumn: '1 / -1' }}>
              <details>
                <summary>RAW (debug)</summary>
                <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(raw, null, 2)}</pre>
              </details>
            </div>
          )}
        </div>
      )}

      <h2 className="sectionTitle">Pergunte ao Oráculo</h2>
      <div className="grid g2">
        <input className="inp" value={chat} onChange={e => setChat(e.target.value)} placeholder="ex.: onde focar essa semana?" />
        <button className="btn" onClick={sendChat}>Enviar</button>
      </div>

      {!!history.length && (
        <div className="card" style={{ marginTop: 12 }}>
          {history.map((m, i) => (
            <p key={i}><b>{m.role === 'user' ? 'Você' : 'Oráculo'}:</b> {m.content}</p>
          ))}
          {recalc && <p style={{ color: '#3347B0', fontWeight: 700 }}>Recalibrado agora → FPC {recalc.FPC} • φ° {recalc.phi_deg} • FP {recalc.FP}</p>}
        </div>
      )}
    </div>
  );
}
