// SPDX-FileCopyrightText: 2026 Pedro Sordo Martínez <amurlaniakea@gmail.com>
// SPDX-License-Identifier: AGPL-3.0-or-later
import { useRef, useState, useEffect } from 'react';
import { useAnimationFrame } from '../hooks/useAnimationFrame';

export default function Superposition() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timeRef = useRef(0);
  const [freq1, setFreq1] = useState(2);
  const [freq2, setFreq2] = useState(3);
  const [amp1, setAmp1] = useState(1);
  const [amp2, setAmp2] = useState(1);
  const [phase, setPhase] = useState(0);
  const [paused, setPaused] = useState(false);

  useAnimationFrame((dt) => {
    if (paused) return;
    timeRef.current += dt;
    draw();
  }, !paused);

  useEffect(() => { draw(); }, [freq1, freq2, amp1, amp2, phase]);

  function draw() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const mid = h / 2;
    const t = timeRef.current;

    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, w, h);

    // Grid
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.1)';
    ctx.lineWidth = 1;
    for (let y = 0; y < h; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Axis
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.beginPath();
    ctx.moveTo(0, mid);
    ctx.lineTo(w, mid);
    ctx.stroke();

    const scale = 60;

    // Wave 1
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let x = 0; x < w; x++) {
      const k = (x / w) * Math.PI * 8;
      const y = mid - amp1 * scale * Math.sin(k * freq1 - t * freq1 * 2);
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Wave 2
    ctx.strokeStyle = '#f472b6';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let x = 0; x < w; x++) {
      const k = (x / w) * Math.PI * 8;
      const y = mid - amp2 * scale * Math.sin(k * freq2 - t * freq2 * 2 + phase);
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Superposition
    ctx.strokeStyle = '#34d399';
    ctx.lineWidth = 3;
    ctx.shadowColor = '#34d399';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    for (let x = 0; x < w; x++) {
      const k = (x / w) * Math.PI * 8;
      const y1 = amp1 * scale * Math.sin(k * freq1 - t * freq1 * 2);
      const y2 = amp2 * scale * Math.sin(k * freq2 - t * freq2 * 2 + phase);
      const y = mid - (y1 + y2);
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Labels
    ctx.font = '12px Inter, sans-serif';
    ctx.fillStyle = '#6366f1';
    ctx.fillText(`Onda 1: f=${freq1}Hz`, 10, 20);
    ctx.fillStyle = '#f472b6';
    ctx.fillText(`Onda 2: f=${freq2}Hz`, 10, 38);
    ctx.fillStyle = '#34d399';
    ctx.fillText('Superposición', 10, 56);
  }

  return (
    <div className="space-y-4">
      <canvas ref={canvasRef} width={700} height={350} className="w-full max-w-[700px] mx-auto" />
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div>
          <label className="text-xs text-indigo-300">Frecuencia 1: {freq1} Hz</label>
          <input type="range" min="1" max="8" step="0.5" value={freq1} onChange={e => setFreq1(+e.target.value)} className="slider-control" />
        </div>
        <div>
          <label className="text-xs text-indigo-300">Frecuencia 2: {freq2} Hz</label>
          <input type="range" min="1" max="8" step="0.5" value={freq2} onChange={e => setFreq2(+e.target.value)} className="slider-control" />
        </div>
        <div>
          <label className="text-xs text-indigo-300">Amplitud 1: {amp1.toFixed(1)}</label>
          <input type="range" min="0" max="2" step="0.1" value={amp1} onChange={e => setAmp1(+e.target.value)} className="slider-control" />
        </div>
        <div>
          <label className="text-xs text-indigo-300">Amplitud 2: {amp2.toFixed(1)}</label>
          <input type="range" min="0" max="2" step="0.1" value={amp2} onChange={e => setAmp2(+e.target.value)} className="slider-control" />
        </div>
        <div>
          <label className="text-xs text-indigo-300">Fase: {phase.toFixed(2)} rad</label>
          <input type="range" min="0" max={String(Math.PI * 2)} step="0.1" value={phase} onChange={e => setPhase(+e.target.value)} className="slider-control" />
        </div>
        <div className="flex items-end">
          <button onClick={() => setPaused(!paused)} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm transition-colors">
            {paused ? '▶ Reanudar' : '⏸ Pausar'}
          </button>
        </div>
      </div>
    </div>
  );
}
