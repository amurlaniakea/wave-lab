import { useRef, useState, useEffect } from 'react';
import { useAnimationFrame } from '../hooks/useAnimationFrame';

export default function DoubleSlit() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timeRef = useRef(0);
  const [wavelength, setWavelength] = useState(20);
  const [slitDist, setSlitDist] = useState(60);
  const [slitWidth, setSlitWidth] = useState(15);
  const [paused, setPaused] = useState(false);

  useAnimationFrame((dt) => {
    if (paused) return;
    timeRef.current += dt;
    draw();
  }, !paused);

  useEffect(() => { draw(); }, [wavelength, slitDist, slitWidth]);

  function draw() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const t = timeRef.current;
    const lam = wavelength;
    const k = (2 * Math.PI) / lam;
    const omega = 4;

    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, w, h);

    const barrierX = 200;
    const slit1Y = h / 2 - slitDist / 2;
    const slit2Y = h / 2 + slitDist / 2;

    // Draw barrier
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(barrierX - 4, 0, 8, slit1Y - slitWidth / 2);
    ctx.fillRect(barrierX - 4, slit1Y + slitWidth / 2, 8, slit2Y - slitWidth / 2 - slit1Y - slitWidth / 2);
    ctx.fillRect(barrierX - 4, slit2Y + slitWidth / 2, 8, h - slit2Y - slitWidth / 2);

    // Compute interference pattern
    const imgData = ctx.createImageData(w, h);
    const data = imgData.data;

    for (let px = barrierX + 10; px < w; px++) {
      for (let py = 0; py < h; py++) {
        // Distance from each slit
        const dx1 = px - barrierX;
        const dy1 = py - slit1Y;
        const r1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);

        const dx2 = px - barrierX;
        const dy2 = py - slit2Y;
        const r2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);

        // Wave from each slit (circular waves)
        const wave1 = Math.sin(k * r1 - omega * t) / Math.sqrt(Math.max(r1, 1));
        const wave2 = Math.sin(k * r2 - omega * t) / Math.sqrt(Math.max(r2, 1));
        const total = wave1 + wave2;

        // Map to color
        const intensity = (total + 0.1) * 0.5;
        const clamped = Math.max(0, Math.min(1, intensity));

        const idx = (py * w + px) * 4;
        data[idx] = Math.floor(clamped * 80 + 20);     // R
        data[idx + 1] = Math.floor(clamped * 120 + 40); // G
        data[idx + 2] = Math.floor(clamped * 255);       // B
        data[idx + 3] = Math.floor(clamped * 200 + 55);  // A
      }
    }

    // Incoming plane wave
    for (let px = 0; px < barrierX - 5; px++) {
      for (let py = 0; py < h; py++) {
        const wave = Math.sin(k * px - omega * t);
        const intensity = (wave + 1) * 0.5;
        const idx = (py * w + px) * 4;
        data[idx] = Math.floor(intensity * 60 + 15);
        data[idx + 1] = Math.floor(intensity * 90 + 30);
        data[idx + 2] = Math.floor(intensity * 200);
        data[idx + 3] = Math.floor(intensity * 150 + 50);
      }
    }

    ctx.putImageData(imgData, 0, 0);

    // Labels
    ctx.fillStyle = '#fff';
    ctx.font = '11px Inter, sans-serif';
    ctx.fillText(`λ = ${lam}px`, 10, 20);
    ctx.fillText(`d = ${slitDist}px`, 10, 36);
    ctx.fillText('Onda plana →', 10, h - 10);
    ctx.fillText('← Interferencia', w - 100, 20);
  }

  return (
    <div className="space-y-4">
      <canvas ref={canvasRef} width={700} height={400} className="w-full max-w-[700px] mx-auto" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="text-xs text-indigo-300">Longitud de onda: {wavelength}px</label>
          <input type="range" min="8" max="50" value={wavelength} onChange={e => setWavelength(+e.target.value)} className="slider-control" />
        </div>
        <div>
          <label className="text-xs text-indigo-300">Distancia entre rendijas: {slitDist}px</label>
          <input type="range" min="20" max="150" value={slitDist} onChange={e => setSlitDist(+e.target.value)} className="slider-control" />
        </div>
        <div>
          <label className="text-xs text-indigo-300">Ancho de rendija: {slitWidth}px</label>
          <input type="range" min="5" max="40" value={slitWidth} onChange={e => setSlitWidth(+e.target.value)} className="slider-control" />
        </div>
      </div>
      <button onClick={() => setPaused(!paused)} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm transition-colors">
        {paused ? '▶ Reanudar' : '⏸ Pausar'}
      </button>
    </div>
  );
}
