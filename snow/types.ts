
export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  freqx: number;
  freqy: number;
  size: number;
  phasex: number;
  phasey: number;
  // Morphing targets
  tx?: number;
  ty?: number;
  baseSize?: number;
}

export interface Position {
  x: number;
  y: number;
}
