// api/oraculo.js
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST' });

  const {
    full_name,
    dob_DDMMYYYY,
    R: param_R = null,
    Q: param_Q = null,
    keywords = "",
    temperature = 0.2
  } = req.body || {};

  // ==== Helpers de cálculo (server-side) ====
  function fpc(R, Q) {
    const denom = Math.sqrt(R*R + Q*Q) || 1;
    return +(R / denom).toFixed(2);
  }
  function phiDeg(R, Q) {
    const phi = Math.atan2(Q, R);
    return +(phi * (180 / Math.PI)).toFixed(2);
  }
  function fp(DC, AC_real, AC_imag) {
    const num = (DC + AC_real);
    const den = (DC + AC_real + (AC_imag || 0)) || 1;
    return +(num / den).toFixed(2);
  }
  function biggestLeak(dc, acReal, acImag) {
    const leaks = [
      {k:"Essência (DC)", v: Math.max(0, 10 - (Number(dc)||0))},
      {k:"Ciclos (AC_real)", v: Math.max(0, 10 - (Number(acReal)||0))},
      {k:"Coletivo (AC_imag)", v: Number(acImag)||0}
    ];
    leaks.sort((a,b)=>b.
