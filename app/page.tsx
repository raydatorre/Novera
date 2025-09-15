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

  // métricas recalculadas pelo chat (se vierem)
  const [recalc, setRecalc] = useState<{ FPC: number; phi_deg: number; FP: number } | null>(null);

  // restaura última leitura do localStorage
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
    setErro
