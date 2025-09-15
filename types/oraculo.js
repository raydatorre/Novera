// types/oraculo.ts
export interface QFactor { name: string; value: number; }

export interface OraculoReading {
block_A_map: string;
block_B_harmonic: string;
block_C_energy: string;
block_D_esoteric: string;
block_E_triptych: { eli5: string; scientist: string; poet: string };
metrics: {
R: number; Q: number; Q_factors: QFactor[];
DC: number; AC_real: number; AC_imag: number;
FPC: number; phi_deg: number; FP: number; biggest_leak: string;
};
diagnostic: { summary: string; actions: string[] };
raw_model?: any;
}
