export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <style>{`
          :root{
            --bg:#ffffff; --text:#0f172a; --muted:#6b7280;
            --card:#ffffff; --border:#e5e7eb; --chip:#f3f4f6; --accent:#3347B0;
          }
          *{box-sizing:border-box}
          html,body{margin:0;padding:0;background:var(--bg);color:var(--text);font:16px/1.5 system-ui,-apple-system,Segoe UI,Roboto,Arial}
          .container{max-width:980px;margin:24px auto;padding:12px}
          .grid{display:grid;gap:12px}
          .g2{grid-template-columns:1fr 1fr}
          @media (max-width:900px){.g2{grid-template-columns:1fr}}
          label{display:block;font-weight:600;font-size:.95rem}
          .inp,.txt{width:100%;margin-top:.35rem;padding:.7rem .8rem;border:1px solid var(--border);border-radius:10px}
          .txt{min-height:92px;resize:vertical}
          .btn{padding:.9rem 1rem;border:none;border-radius:10px;background:var(--accent);color:#fff;font-weight:700;cursor:pointer}
          .btn[disabled]{opacity:.6;cursor:not-allowed}
          .row{display:flex;gap:12px;align-items:center}
          .chips{display:flex;gap:10px;flex-wrap:wrap;margin:10px 0 0}
          .chip{background:var(--chip);border:1px solid var(--border);border-radius:999px;padding:.35rem .7rem;font-weight:600;font-size:.9rem}
          .card{background:var(--card);border:1px solid var(--border);border-radius:14px;padding:14px}
          .cards{display:grid;gap:12px}
          .cards.g2{grid-template-columns:1fr 1fr}
          @media (max-width:900px){.cards.g2{grid-template-columns:1fr}}
          /* Força <pre> claro e legível */
          pre{background:#f6f7fb !important;color:#0b1324 !important;border:1px solid var(--border);border-radius:10px;padding:12px;overflow:auto}
          details{border:1px dashed var(--border);border-radius:10px;padding:8px}
          summary{cursor:pointer;font-weight:700}
          .sectionTitle{margin-top:18px;margin-bottom:6px;font-size:1.15rem}
          .badge{display:inline-block;background:#eef2ff;color:#3347B0;border:1px solid #c7d2fe;padding:.25rem .6rem;border-radius:8px;font-weight:700}
        `}</style>

        {/* Carimbo de UI para você validar que a versão nova carregou */}
        <div style={{background:'#eef2ff',borderBottom:'1px solid #c7d2fe',padding:'6px 12px',textAlign:'center'}}>
          <span className="badge">UI v3</span> — layout carregado de <code>app/layout.tsx</code>
        </div>

        {children}
      </body>
    </html>
  );
}
