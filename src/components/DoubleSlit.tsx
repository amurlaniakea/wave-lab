// SPDX-FileCopyrightText: 2026 Pedro Sordo Martínez <amurlaniakea@gmail.com>
// SPDX-License-Identifier: AGPL-3.0-or-later
import { useRef, useState, useEffect } from 'react';
import { useAnimationFrame } from '../hooks/useAnimationFrame';

export default function DoubleSlit() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timeRef = useRef(0);
  const [wavelength, setWavelength] = useState(20);
  const [slitDist, setSlitDist] = useState(60);
  const [slitWidth, setSlitWidth] = useState(15);
  const [brightness, setBrightness] = useState(1.0);
  const [colorHue, setColorHue] = useState(0.5);
  const [paused, setPaused] = useState(false);

  useAnimationFrame((dt) => {
    if (paused) return;
    timeRef.current += dt;
    draw();
  }, !paused);

  useEffect(() => { draw(); }, [wavelength, slitDist, slitWidth, brightness, colorHue]);

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

    // Draw barrier - make it clearly visible
    const barrierColor = '#374151'; // lighter gray
    const barrierEdgeColor = '#64748b'; // slate edge
    const slitEdgeColor = '#22d3ee'; // cyan edge for slit openings

    ctx.fillStyle = barrierColor;
    // Top barrier
    ctx.fillRect(barrierX - 4, 0, 8, slit1Y - slitWidth / 2);
    // Middle barrier (between slits)
    ctx.fillRect(barrierX - 4, slit1Y + slitWidth / 2, 8, slit2Y - slitWidth / 2 - slit1Y - slitWidth / 2);
    // Bottom barrier
    ctx.fillRect(barrierX - 4, slit2Y + slitWidth / 2, 8, h - slit2Y - slitWidth / 2);

    // Draw slit edges (bright cyan lines marking the openings)
    ctx.strokeStyle = slitEdgeColor;
    ctx.lineWidth = 2;
    // Slit 1 top edge
    ctx.beginPath();
    ctx.moveTo(barrierX - 4, slit1Y - slitWidth / 2);
    ctx.lineTo(barrierX + 4, slit1Y - slitWidth / 2);
    ctx.stroke();
    // Slit 1 bottom edge
    ctx.beginPath();
    ctx.moveTo(barrierX - 4, slit1Y + slitWidth / 2);
    ctx.lineTo(barrierX + 4, slit1Y + slitWidth / 2);
    ctx.stroke();
    // Slit 2 top edge
    ctx.beginPath();
    ctx.moveTo(barrierX - 4, slit2Y - slitWidth / 2);
    ctx.lineTo(barrierX + 4, slit2Y - slitWidth / 2);
    ctx.stroke();
    // Slit 2 bottom edge
    ctx.beginPath();
    ctx.moveTo(barrierX - 4, slit2Y + slitWidth / 2);
    ctx.lineTo(barrierX + 4, slit2Y + slitWidth / 2);
    ctx.stroke();

    // Barrier vertical edges
    ctx.strokeStyle = barrierEdgeColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(barrierX - 4, 0);
    ctx.lineTo(barrierX - 4, h);
    ctx.moveTo(barrierX + 4, 0);
    ctx.lineTo(barrierX + 4, h);
    ctx.stroke();

    // Slit labels
    ctx.fillStyle = '#22d3ee';
    ctx.font = '10px Inter, sans-serif';
    ctx.fillText('↑ Rendija 1', barrierX + 10, slit1Y - 5);
    ctx.fillText('↑ Rendija 2', barrierX + 10, slit2Y - 5);

    // Compute interference pattern
    const imgData = ctx.createImageData(w, h);
    const data = imgData.data;

    // Precompute constants for interference pattern
    // Fringe spacing: Δy = λ * D / d, where D = distance to screen (px - barrierX)
    // Intensity: I = I₀ cos²(π * d * sin(θ) / λ) ≈ I₀ cos²(π * d * y / (λ * D))

    for (let px = barrierX + 10; px < w; px++) {
      const D = px - barrierX; // distance from barrier to screen point
      for (let py = 0; py < h; py++) {
        // Distance from each slit
        const dx1 = px - barrierX;
        const dy1 = py - slit1Y;
        const r1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);

        const dx2 = px - barrierX;
        const dy2 = py - slit2Y;
        const r2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);

        // Wave from each slit (circular waves) - reduced 1/sqrt(r) falloff for visibility
        const wave1 = Math.sin(k * r1 - omega * t) / Math.pow(Math.max(r1, 1), 0.25);
        const wave2 = Math.sin(k * r2 - omega * t) / Math.pow(Math.max(r2, 1), 0.25);
        const total = wave1 + wave2;

        // Map to color - use full dynamic range with gamma correction
        const intensity = Math.abs(total); // 0 to ~2
        const normalized = Math.min(1, intensity / 1.5); // normalize to 0-1
        const gamma = Math.pow(normalized, 0.6); // gamma correction for better contrast
        const bright = gamma * brightness; // apply brightness control

        // HSV to RGB for color control
        const hue = colorHue * 360; // 0-360 degrees
        const sat = 0.8;
        const val = Math.min(1, bright);
        const c = val * sat;
        const x = c * (1 - Math.abs((hue / 60) % 2 - 1));
        const m = val - c;
        let r, g, b;
        if (hue < 60) { r = c; g = x; b = 0; }
        else if (hue < 120) { r = x; g = c; b = 0; }
        else if (hue < 180) { r = 0; g = c; b = x; }
        else if (hue < 240) { r = 0; g = x; b = c; }
        else if (hue < 300) { r = x; g = 0; b = c; }
        else { r = c; g = 0; b = x; }
        r = (r + m) * 255;
        g = (g + m) * 255;
        b = (b + m) * 255;

        const idx = (py * w + px) * 4;
        data[idx] = Math.floor(r);
        data[idx + 1] = Math.floor(g);
        data[idx + 2] = Math.floor(b);
        data[idx + 3] = Math.floor(bright * 230 + 25);
      }
    }

    // Incoming plane wave (left side) - brighter
    for (let px = 0; px < barrierX - 5; px++) {
      for (let py = 0; py < h; py++) {
        const wave = Math.sin(k * px - omega * t);
        const intensity = (wave + 1) * 0.5; // 0 to 1
        const gamma = Math.pow(intensity, 0.7);
        const bright = gamma * brightness;
        const hue = colorHue * 360;
        const sat = 0.6;
        const val = Math.min(1, bright);
        const c = val * sat;
        const x = c * (1 - Math.abs((hue / 60) % 2 - 1));
        const m = val - c;
        let r, g, b;
        if (hue < 60) { r = c; g = x; b = 0; }
        else if (hue < 120) { r = x; g = c; b = 0; }
        else if (hue < 180) { r = 0; g = c; b = x; }
        else if (hue < 240) { r = 0; g = x; b = c; }
        else if (hue < 300) { r = x; g = 0; b = c; }
        else { r = c; g = 0; b = x; }
        r = (r + m) * 255;
        g = (g + m) * 255;
        b = (b + m) * 255;

        const idx = (py * w + px) * 4;
        data[idx] = Math.floor(r);
        data[idx + 1] = Math.floor(g);
        data[idx + 2] = Math.floor(b);
        data[idx + 3] = Math.floor(bright * 200 + 55);
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
        <div>
          <label className="text-xs text-yellow-300">Brillo: {brightness.toFixed(2)}</label>
          <input type="range" min="0.1" max="2" step="0.05" value={brightness} onChange={e => setBrightness(+e.target.value)} className="slider-control" />
        </div>
        <div>
          <label className="text-xs text-pink-300">Tono de color: {Math.round(colorHue * 360)}°</label>
          <input type="range" min="0" max="1" step="0.01" value={colorHue} onChange={e => setColorHue(+e.target.value)} className="slider-control" />
        </div>
      </div>
      <button onClick={() => setPaused(!paused)} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm transition-colors">
        {paused ? '▶ Reanudar' : '⏸ Pausar'}
      </button>
    </div>
  );
}
