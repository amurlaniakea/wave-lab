import { useRef, useState, useEffect } from 'react';
import { useAnimationFrame } from '../hooks/useAnimationFrame';

export default function Beats() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timeRef = useRef(0);
  const [freq1, setFreq1] = useState(5);
  const [freq2, setFreq2] = useState(5.5);
  const [paused, setPaused] = useState(false);

  const beatFreq = Math.abs(freq1 - freq2);
  const avgFreq = (freq1 + freq2) / 2;

  useAnimationFrame((dt) => {
    if (paused) return;
    timeRef.current += dt;
    draw();
  }, !paused);

  useEffect(() => { draw(); }, [freq1, freq2]);

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
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.08)';
    ctx.lineWidth = 1;
    for (let y = 0; y < h; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Axis
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.beginPath();
    ctx.moveTo(0, mid);
    ctx.lineTo(w, mid);
    ctx.stroke();

    const scale = 80;

    // Envelope (beat)
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.4)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    for (let x = 0; x < w; x++) {
      const phase = (x / w) * Math.PI * 20;
      const env = 2 * Math.cos(((freq1 - freq2) / 2) * phase - ((freq1 - freq2) / 2) * t * 4);
      const y = mid - Math.abs(env) * scale;
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.beginPath();
    for (let x = 0; x < w; x++) {
      const phase = (x / w) * Math.PI * 20;
      const env = 2 * Math.cos(((freq1 - freq2) / 2) * phase - ((freq1 - freq2) / 2) * t * 4);
      const y = mid + Math.abs(env) * scale;
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // Combined wave (beat)
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = '#fbbf24';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    for (let x = 0; x < w; x++) {
      const phase = (x / w) * Math.PI * 20;
      const y1 = Math.sin(freq1 * phase - freq1 * t * 4);
      const y2 = Math.sin(freq2 * phase - freq2 * t * 4);
      const y = mid - (y1 + y2) * scale;
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Info
    ctx.font = '13px Inter, sans-serif';
    ctx.fillStyle = '#fbbf24';
    ctx.fillText(`Batido: f_beat = |f₁ - f₂| = ${beatFreq.toFixed(1)} Hz`, 10, 24);
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`Frecuencia promedio: ${avgFreq.toFixed(1)} Hz`, 10, 44);
    ctx.fillText(`Período del batido: T = 1/f_beat = ${(1 / beatFreq).toFixed(2)} s`, 10, 64);
  }

  return (
    <div className="space-y-4">
      <canvas ref={canvasRef} width={700} height={350} className="w-full max-w-[700px] mx-auto" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-yellow-300">Frecuencia 1: {freq1} Hz</label>
          <input type="range" min="1" max="15" step="0.1" value={freq1} onChange={e => setFreq1(+e.target.value)} className="slider-control" />
        </div>
        <div>
          <label className="text-xs text-yellow-300">Frecuencia 2: {freq2} Hz</label>
          <input type="range" min="1" max="15" step="0.1" value={freq2} onChange={e => setFreq2(+e.target.value)} className="slider-control" />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button onClick={() => setPaused(!paused)} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm transition-colors">
          {paused ? '▶ Reanudar' : '⏸ Pausar'}
        </button>
        <div className="text-xs text-slate-400">
          💡 Acerca las frecuencias para ver batidos más lentos. La envolvente amarilla punteada muestra la amplitud modulada.
        </div>
      </div>
    </div>
  );
}
