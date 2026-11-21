// SPDX-FileCopyrightText: 2026 Pedro Sordo Martínez <amurlaniakea@gmail.com>
// SPDX-License-Identifier: AGPL-3.0-or-later
import { useRef, useState, useEffect, useCallback } from 'react';
import { useAnimationFrame } from '../hooks/useAnimationFrame';

// Quantum wave packet simulation using Visscher method (explicit, symplectic)
// Solves 1D time-dependent Schrödinger equation: iℏ ∂ψ/∂t = [-ℏ²/(2m) ∂²/∂x² + V(x)] ψ
// Units: ℏ = 1, m = 1 → i ∂ψ/∂t = [-½ ∂²/∂x² + V(x)] ψ
// Visscher scheme:
//   ∂R/∂t = -½∇²I + VI
//   ∂I/∂t =  ½∇²R - VR
//   I^{n+1/2} = I^n + dt/2 * (½∇²R^n - V R^n)
//   R^{n+1}   = R^n + dt   * (-½∇²I^{n+1/2} + V I^{n+1/2})
//   I^{n+1}   = I^{n+1/2} + dt/2 * (½∇²R^{n+1} - V R^{n+1})

export default function QuantumPacket() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timeRef = useRef(0);

  // Simulation parameters
  const N = 1024; // grid points (larger grid, boundaries far from action)
  const dx = 0.08; // spatial step
  const dt = 0.001; // time step (stable for Visscher with potential)
  const mass = 1;

  // State arrays (real and imaginary parts of psi)
  const psiR = useRef<Float64Array>(new Float64Array(N));
  const psiI = useRef<Float64Array>(new Float64Array(N));
  const psiR2 = useRef<Float64Array>(new Float64Array(N));
  const psiI2 = useRef<Float64Array>(new Float64Array(N));
  const potential = useRef<Float64Array>(new Float64Array(N));

  const [sigma, setSigma] = useState(2.0);
  const [k0, setK0] = useState(12);
  const [barrierHeight, setBarrierHeight] = useState(0);
  const [barrierWidth, setBarrierWidth] = useState(40);
  const [barrierPos, setBarrierPos] = useState(500);
  const [paused, setPaused] = useState(false);
  const [showPotential, setShowPotential] = useState(true);

  const initWavePacket = useCallback(() => {
    const x0 = N * dx * 0.1; // initial center (far left)
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
  const step = useCallback(() => {
    const pr = psiR.current;
    const pi = psiI.current;
    const pr2 = psiR2.current;
    const pi2 = psiI2.current;
    const v = potential.current;
    const h = dx;
    const h2 = h * h;

    // Half step for imaginary part: I^{n+1/2} = I^n + dt/2 * (½∇²R^n - V R^n)
    for (let i = 1; i < N - 1; i++) {
      const laplacian = (pr[i + 1] - 2 * pr[i] + pr[i - 1]) / h2;
      pi2[i] = pi[i] + dt * 0.5 * (0.5 * laplacian - v[i] * pr[i]);
    }
    // Dirichlet boundary (psi=0 at edges, far from action)
    pi2[0] = 0;
    pi2[N - 1] = 0;

    // Full step for real part: R^{n+1} = R^n + dt * (-½∇²I^{n+1/2} + V I^{n+1/2})
    for (let i = 1; i < N - 1; i++) {
      const laplacian = (pi2[i + 1] - 2 * pi2[i] + pi2[i - 1]) / h2;
      pr2[i] = pr[i] + dt * (-0.5 * laplacian + v[i] * pi2[i]);
    }
    pr2[0] = 0;
    pr2[N - 1] = 0;

    // Half step for imaginary part: I^{n+1} = I^{n+1/2} + dt/2 * (½∇²R^{n+1} - V R^{n+1})
    for (let i = 1; i < N - 1; i++) {
      const laplacian = (pr2[i + 1] - 2 * pr2[i] + pr2[i - 1]) / h2;
      pi2[i] = pi2[i] + dt * 0.5 * (0.5 * laplacian - v[i] * pr2[i]);
    }
    pi2[0] = 0;
    pi2[N - 1] = 0;

    // Swap
    psiR.current.set(pr2);
    psiI.current.set(pi2);
  }, []);

  useAnimationFrame(() => {
    if (paused) return;
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

    const baseY = h * 0.7; // wave packet in lower portion
    const scale = h * 0.35;
    const xScale = w / N;

    // Draw potential BELOW center line (separate from wave packet)
    if (showPotential && barrierHeight > 0) {
      const vBaseY = h * 0.9;
      const vScale = h * 0.0008; // scale factor for barrier height visualization
      ctx.fillStyle = 'rgba(239, 68, 68, 0.15)';
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.7)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, vBaseY);
      for (let i = 0; i < N; i++) {
        const x = i * xScale;
        const y = vBaseY - potential.current[i] * vScale;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(w, vBaseY);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Label
      ctx.font = '11px Inter, sans-serif';
      ctx.fillStyle = '#ef4444';
      ctx.fillText(`V(x) max: ${barrierHeight.toFixed(1)}`, 10, vBaseY - 5);
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
      <canvas ref={canvasRef} width={900} height={420} className="w-full max-w-[900px] mx-auto" />
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div>
          <label className="text-xs text-indigo-300">Ancho σ: {sigma.toFixed(1)}</label>
          <input type="range" min="0.5" max="5" step="0.1" value={sigma} onChange={e => setSigma(+e.target.value)} className="slider-control" />
        </div>
        <div>
          <label className="text-xs text-indigo-300">Momento k₀: {k0.toFixed(1)}</label>
          <input type="range" min="2" max="40" step="0.5" value={k0} onChange={e => setK0(+e.target.value)} className="slider-control" />
        </div>
        <div>
          <label className="text-xs text-red-300">Altura barrera V₀: {barrierHeight.toFixed(1)}</label>
          <input type="range" min="0" max="100" step="0.5" value={barrierHeight} onChange={e => setBarrierHeight(+e.target.value)} className="slider-control" />
        </div>
        <div>
          <label className="text-xs text-red-300">Ancho barrera: {barrierWidth}</label>
          <input type="range" min="5" max="150" step="1" value={barrierWidth} onChange={e => setBarrierWidth(+e.target.value)} className="slider-control" />
        </div>
        <div>
          <label className="text-xs text-red-300">Posición barrera: {barrierPos}</label>
          <input type="range" min="100" max="800" step="1" value={barrierPos} onChange={e => setBarrierPos(+e.target.value)} className="slider-control" />
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
