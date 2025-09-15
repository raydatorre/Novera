// lib/oraculoMath.ts
export function fpc(R: number, Q: number) {
  const denom = Math.sqrt(R * R + Q * Q) || 1;
  return +(R / denom).toFixed(2);
}
export function phiDeg(R: number, Q: number) {
  const phi = Math.atan2(Q, R);
  return +(phi * (180 / Math.PI)).toFixed(2);
}
export function fp(DC: number, AC_real: number, AC_imag: number) {
  const num = (DC + AC_real);
  const den = (DC + AC_real + (AC_imag || 0)) || 1;
  return +(num / den).toFixed(2);
}
export function biggestLeak(dc: number, acReal: number, acImag: number) {
  const leaks = [
    { k: "Essência (DC)", v: Math.max(0, 10 - dc) },
    { k: "Ciclos (AC_real)", v: Math.max(0, 10 - acReal) },
    { k: "Coletivo (AC_imag)", v: acImag }
  ];
  leaks.sort((a, b) => b.v - a.v);
  return leaks[0].k;
}
