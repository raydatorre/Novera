'use client';

<section className="grid gap-4 md:grid-cols-3">
<Card title="ELI5" body={reading.block_E_triptych.eli5} />
<Card title="Scientist" body={reading.block_E_triptych.scientist} />
<Card title="Poet" body={reading.block_E_triptych.poet} />
</section>

<section className="grid gap-4 md:grid-cols-3">
<div className="border rounded p-4">
<h3 className="font-semibold mb-2">Métricas</h3>
<pre className="text-sm whitespace-pre-wrap">{JSON.stringify(metrics, null, 2)}</pre>
<button
className="mt-2 px-3 py-1 border rounded"
onClick={() => navigator.clipboard.writeText(JSON.stringify(reading, null, 2))}
>Copiar JSON</button>
</div>
<div className="border rounded p-4 col-span-2">
<h3 className="font-semibold mb-2">Diagnóstico</h3>
<p className="mb-2 text-sm opacity-80">{reading.diagnostic.summary}</p>
<ul className="list-disc pl-5 space-y-1">
{reading.diagnostic.actions.map((a,i)=>(<li key={i}>{a}</li>))}
</ul>
</div>
</section>

{/* Chat */}
<section className="border rounded p-4">
<h3 className="font-semibold mb-3">Pergunte ao Oráculo</h3>
<div className="space-y-2 max-h-80 overflow-auto border rounded p-3 bg-gray-50">
{history.map((m, i) => (
<div key={i} className={m.role==='user'? 'text-right': ''}>
<div className="inline-block px-3 py-2 rounded bg-white shadow text-sm">
<strong>{m.role==='user'?'Você':'Oráculo'}:</strong> {m.content}
</div>
</div>
))}
{!history.length && <div className="text-sm opacity-60">Faça uma pergunta curta (ex.: "onde focar essa semana?")</div>}
</div>
<div className="mt-3 flex gap-2">
<input className="border rounded p-2 flex-1" value={chatInput} onChange={e=>setChatInput(e.target.value)} placeholder="Sua pergunta…" />
<button onClick={sendChat} disabled={!canChat || !chatInput.trim()} className="px-4 py-2 rounded bg-black text-white disabled:opacity-50">Enviar</button>
</div>
</section>
</div>
)}
</div>
);
}

function Card({ title, body }: { title:string; body:string }){
return (
<div className="border rounded p-4">
<h3 className="font-semibold mb-2">{title}</h3>
<p className="whitespace-pre-wrap text-sm leading-relaxed">{body}</p>
</div>
);
}
