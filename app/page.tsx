'use client';
import { useEffect, useState } from 'react';

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

export default function Home() {
const [fullName, setFullName] = useState('');
const [dob, setDob] = useState('');
const [feel, setFeel] = useState('');
const [R, setR] = useState<string>('');
const [Q, setQ] = useState<string>('');
const [kw, setKw] = useState('');
const [temp, setTemp] = useState(0.2);

const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

const [reading, setReading] = useState<Reading | null>(null);
const [history, setHistory] = useState<Msg[]>([]);
const [chat, setChat] = useState('');

// para mostrar recálculo vindo do chat
const [recalc, setRecalc] = useState<{FPC:number; phi_deg:number; FP:number} | null>(null);

// restaurar última leitura
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
R: R === '' ? null : Number(R),
const bubble: React.CSSProperties = { display:'inline-block', padding:'8px 10px', borderRadius:10, background:'#fff', border:'1px solid #eee', margin:'4px 0' };
