// SPDX-FileCopyrightText: 2026 Pedro Sordo Martínez <amurlaniakea@gmail.com>
// SPDX-License-Identifier: AGPL-3.0-or-later
import { useRef, useState, useEffect, useCallback } from 'react';
import { useAnimationFrame } from '../hooks/useAnimationFrame';

// Quantum wave packet simulation using Visscher method (explicit, symplectic)
// Solves 1D time-dependent Schrödinger equation: iℏ ∂ψ/∂t = -ℏ²/2m ∂²ψ/∂x² + V(x)ψ
// ℏ = 1, m = 1 units

export default function QuantumPacket() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timeRef = useRef(0);

  // Simulation parameters
  const N = 512; // grid points (increased for better resolution)
  const dx = 0.1; // spatial step (finer grid)
  const dt = 0.002; // time step (smaller for stability)
  const mass = 1;

  // State arrays (real and imaginary parts of psi)
  const psiR = useRef<Float64Array>(new Float64Array(N));
  const psiI = useRef<Float64Array>(new Float64Array(N));
  const psiR2 = useRef<Float64Array>(new Float64Array(N));
  const psiI2 = useRef<Float64Array>(new Float64Array(N));
  const potential = useRef<Float64Array>(new Float64Array(N));

  const [sigma, setSigma] = useState(1.5);
  const [k0, setK0] = useState(10);
  const [barrierHeight, setBarrierHeight] = useState(0);
  const [barrierWidth, setBarrierWidth] = useState(20);
  const [barrierPos, setBarrierPos] = useState(200);
  const [paused, setPaused] = useState(false);
  const [showPotential, setShowPotential] = useState(true);

  const initWavePacket = useCallback(() => {
    const x0 = N * dx * 0.15; // initial center (left side)
    for (let i = 0; i < N; i++) {
      const x = i * dx;
      const gauss = Math.exp(-((x - x0) ** 2) / (2 * sigma * sigma));
      psiR.current[i] = gauss * Math.cos(k0 * x);
      psiI.current[i] = gauss * Math.sin(k0 * x);
    }
    // Normalize
    let norm = 0;
    for (let i = 0; i < N; i++) {
      norm += (psiR.current[i] ** 2 + psiI.current[i] ** 2) * dx;
    }
    const normFactor = 1 / Math.sqrt(norm);
    for (let i = 0; i < N; i++) {
      psiR.current[i] *= normFactor;
      psiI.current[i] *= normFactor;
    }
    psiR2.current.set(psiR.current);
    psiI2.current.set(psiI.current);
    timeRef.current = 0;
  }, [sigma, k0]);

  // Initialize potential
  useEffect(() => {
    for (let i = 0; i < N; i++) {
      const x = i * dx;
      const bCenter = barrierPos * dx;
      const bHalf = (barrierWidth * dx) / 2;
      if (Math.abs(x - bCenter) < bHalf) {
        potential.current[i] = barrierHeight;
      } else {
        potential.current[i] = 0;
      }
    }
  }, [barrierHeight, barrierWidth, barrierPos]);

  // Initialize wave packet
  useEffect(() => {
    initWavePacket();
  }, [initWavePacket]);

  // Time evolution using Visscher method (explicit, symplectic)
  // ψ_R(t+dt/2) = ψ_R(t) - dt/2 * H_I[ψ_I(t)]
  // ψ_I(t+dt)   = ψ_I(t) + dt   * H_R[ψ_R(t+dt/2)]
  // ψ_R(t+dt)   = ψ_R(t+dt/2) - dt/2 * H_I[ψ_I(t+dt)]
  // where H_R[ψ_I] = -1/(2m) ∇²ψ_I + V ψ_I
  //       H_I[ψ_R] =  1/(2m) ∇²ψ_R - V ψ_R
  const step = useCallback(() => {
    const pr = psiR.current;
    const pi = psiI.current;
    const pr2 = psiR2.current;
    const pi2 = psiI2.current;
    const v = potential.current;
    const h = dx;
    const h2 = h * h;
    const coeff = dt / (2 * mass * h2); // dt/(2m*h²)

    // Half step for imaginary part: ψ_I(t+dt/2) = ψ_I(t) + dt/2 * H_R[ψ_R(t)]
    // H_R[ψ_R] = -1/(2m) ∇²ψ_R + V ψ_R
    for (let i = 1; i < N - 1; i++) {
      const laplacian = (pr[i + 1] - 2 * pr[i] + pr[i - 1]) / h2;
      pi2[i] = pi[i] + dt * 0.5 * (-laplacian / (2 * mass) + v[i] * pr[i]);
    }
    pi2[0] = pi2[1]; // absorbing-ish boundary
    pi2[N - 1] = pi2[N - 2];

    // Full step for real part: ψ_R(t+dt) = ψ_R(t) - dt * H_I[ψ_I(t+dt/2)]
    // H_I[ψ_I] = 1/(2m) ∇²ψ_I - V ψ_I
    for (let i = 1; i < N - 1; i++) {
      const laplacian = (pi2[i + 1] - 2 * pi2[i] + pi2[i - 1]) / h2;
      pr2[i] = pr[i] - dt * (laplacian / (2 * mass) - v[i] * pi2[i]);
    }
    pr2[0] = pr2[1];
    pr2[N - 1] = pr2[N - 2];

    // Half step for imaginary part: ψ_I(t+dt) = ψ_I(t+dt/2) + dt/2 * H_R[ψ_R(t+dt)]
    for (let i = 1; i < N - 1; i++) {
      const laplacian = (pr2[i + 1] - 2 * pr2[i] + pr2[i - 1]) / h2;
      pi2[i] = pi2[i] + dt * 0.5 * (-laplacian / (2 * mass) + v[i] * pr2[i]);
    }
    pi2[0] = pi2[1];
    pi2[N - 1] = pi2[N - 2];

    // Swap
    psiR.current.set(pr2);
    psiI.current.set(pi2);
  }, []);

  useAnimationFrame(() => {
    if (paused) return;
    // Multiple sub-steps for stability
    for (let s = 0; s < 4; s++) {
      step();
    }
    timeRef.current += dt * 4;
    draw();
  }, !paused);

  useEffect(() => { draw(); }, [showPotential]);

  function draw() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const pr = psiR.current;
    const pi = psiI.current;

    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, w, h);

    // Grid
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.06)';
    ctx.lineWidth = 1;
    for (let y = 0; y < h; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    const baseY = h * 0.5;
    const scale = h * 0.4;
    const xScale = w / N;

    // Draw potential (above center line, inverted)
    if (showPotential && barrierHeight > 0) {
      ctx.fillStyle = 'rgba(239, 68, 68, 0.12)';
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.5)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, baseY);
      for (let i = 0; i < N; i++) {
        const x = i * xScale;
        const y = baseY - (potential.current[i] / (barrierHeight || 1)) * scale * 0.3;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(w, baseY);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    // Draw |ψ|² (probability density) - filled
    ctx.fillStyle = 'rgba(99, 102, 241, 0.25)';
    ctx.beginPath();
    ctx.moveTo(0, baseY);
    for (let i = 0; i < N; i++) {
      const prob = pr[i] * pr[i] + pi[i] * pi[i];
      const x = i * xScale;
      const y = baseY - prob * scale;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, baseY);
    ctx.closePath();
    ctx.fill();

    // |ψ|² line
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#6366f1';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    for (let i = 0; i < N; i++) {
      const prob = pr[i] * pr[i] + pi[i] * pi[i];
      const x = i * xScale;
      const y = baseY - prob * scale;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Real part
    ctx.strokeStyle = '#34d399';
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = 0.7;
    ctx.beginPath();
    for (let i = 0; i < N; i++) {
      const x = i * xScale;
      const y = baseY - pr[i] * scale * 0.5;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Imaginary part
    ctx.strokeStyle = '#f472b6';
    ctx.beginPath();
    for (let i = 0; i < N; i++) {
      const x = i * xScale;
      const y = baseY - pi[i] * scale * 0.5;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Axis
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, baseY);
    ctx.lineTo(w, baseY);
    ctx.stroke();

    // Labels
    ctx.font = '12px Inter, sans-serif';
    ctx.fillStyle = '#6366f1';
    ctx.fillText('|ψ(x,t)|²', w - 80, 20);
    ctx.fillStyle = '#34d399';
    ctx.fillText('Re(ψ)', w - 80, 38);
    ctx.fillStyle = '#f472b6';
    ctx.fillText('Im(ψ)', w - 80, 56);
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`t = ${timeRef.current.toFixed(2)}`, 10, 20);

    // Compute norm for display
    let norm = 0;
    for (let i = 0; i < N; i++) {
      norm += (pr[i] * pr[i] + pi[i] * pi[i]) * dx;
    }
    ctx.fillStyle = norm > 0.99 && norm < 1.01 ? '#34d399' : '#f87171';
    ctx.fillText(`∫|ψ|²dx = ${norm.toFixed(4)}`, 10, 38);
  }

  return (
    <div className="space-y-4">
      <canvas ref={canvasRef} width={800} height={400} className="w-full max-w-[800px] mx-auto" />
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div>
          <label className="text-xs text-indigo-300">Ancho σ: {sigma.toFixed(1)}</label>
          <input type="range" min="0.5" max="4" step="0.1" value={sigma} onChange={e => setSigma(+e.target.value)} className="slider-control" />
        </div>
        <div>
          <label className="text-xs text-indigo-300">Momento k₀: {k0.toFixed(1)}</label>
          <input type="range" min="1" max="30" step="0.5" value={k0} onChange={e => setK0(+e.target.value)} className="slider-control" />
        </div>
        <div>
          <label className="text-xs text-red-300">Altura barrera V₀: {barrierHeight.toFixed(1)}</label>
          <input type="range" min="0" max="50" step="0.5" value={barrierHeight} onChange={e => setBarrierHeight(+e.target.value)} className="slider-control" />
        </div>
        <div>
          <label className="text-xs text-red-300">Ancho barrera: {barrierWidth}</label>
          <input type="range" min="5" max="80" step="1" value={barrierWidth} onChange={e => setBarrierWidth(+e.target.value)} className="slider-control" />
        </div>
        <div>
          <label className="text-xs text-red-300">Posición barrera: {barrierPos}</label>
          <input type="range" min="50" max="400" step="1" value={barrierPos} onChange={e => setBarrierPos(+e.target.value)} className="slider-control" />
        </div>
        <div className="flex items-end gap-2">
          <button onClick={() => setPaused(!paused)} className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm transition-colors">
            {paused ? '▶' : '⏸'}
          </button>
          <button onClick={initWavePacket} className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition-colors">
            🔄 Reset
          </button>
          <button onClick={() => setShowPotential(!showPotential)} className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition-colors">
            {showPotential ? '🔴' : '⚫'} V(x)
          </button>
        </div>
      </div>
      <div className="text-xs text-slate-400 mt-2">
        📐 Ecuación de Schrödinger 1D: iℏ∂ψ/∂t = -ℏ²/(2m)∂²ψ/∂x² + V(x)ψ — Método de Visscher (explícito, simpléctico).
        Observa el efecto túnel cuántico cuando la barrera es suficientemente delgada.
      </div>
    </div>
  );
}
