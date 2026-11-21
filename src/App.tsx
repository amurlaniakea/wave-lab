// SPDX-FileCopyrightText: 2026 Pedro Sordo Martínez <amurlaniakea@gmail.com>
// SPDX-License-Identifier: AGPL-3.0-or-later
import { useState } from 'react';
import Superposition from './components/Superposition';
import DoubleSlit from './components/DoubleSlit';
import Beats from './components/Beats';
import QuantumPacket from './components/QuantumPacket';

type Tab = 'superposition' | 'doubleslit' | 'beats' | 'quantum';

const tabs: { id: Tab; label: string; icon: string; desc: string }[] = [
  { id: 'superposition', label: 'Superposición', icon: '🌊', desc: 'Interferencia de ondas' },
  { id: 'doubleslit', label: 'Doble Rendija', icon: '🔬', desc: 'Difracción e interferencia' },
  { id: 'beats', label: 'Batidos', icon: '🎵', desc: 'Batidos acústicos' },
  { id: 'quantum', label: 'Paquete Cuántico', icon: '⚛️', desc: 'Schrödinger 1D' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('superposition');

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-slate-200">
      {/* Tagline */}
      <div className="w-full py-4 px-4 text-center border-b border-indigo-900/30 bg-[#0a0a1a]/50">
        <p className="text-xs md:text-sm text-fuchsia-300/95 font-medium tracking-wide select-none">
          «Tecnósfera al servicio de la Biósfera.» — «La Paz Es El Camino.»
        </p>
      </div>
      {/* Header */}
      <header className="border-b border-indigo-900/30 bg-[#0a0a1a]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-3xl animate-pulse-glow rounded-xl p-2">🌊</div>
            <div>
              <h1 className="text-xl font-bold glow-text text-white">wave-lab</h1>
              <p className="text-xs text-slate-400">Laboratorio de interferencia, difracción y paquetes de ondas</p>
            </div>
          </div>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1"
          >
            <i className="fab fa-github"></i> Repo
          </a>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className="max-w-5xl mx-auto px-4 pt-6">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-indigo-600/20 border border-indigo-500/50 text-indigo-200 shadow-lg shadow-indigo-500/10'
                  : 'bg-slate-800/50 border border-slate-700/50 text-slate-400 hover:text-slate-200 hover:border-slate-600'
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              <div className="text-left">
                <div>{tab.label}</div>
                <div className="text-[10px] opacity-60 hidden sm:block">{tab.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 py-6">
        <div className="card-glass p-6 animate-pulse-glow">
          <div className="mb-4 flex items-center gap-2">
            <span className="text-2xl">{tabs.find(t => t.id === activeTab)?.icon}</span>
            <h2 className="text-lg font-semibold text-white">
              {tabs.find(t => t.id === activeTab)?.label}
            </h2>
          </div>

          {activeTab === 'superposition' && <Superposition />}
          {activeTab === 'doubleslit' && <DoubleSlit />}
          {activeTab === 'beats' && <Beats />}
          {activeTab === 'quantum' && <QuantumPacket />}
        </div>

        {/* Info Section */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card-glass p-4">
            <h3 className="text-sm font-semibold text-indigo-300 mb-2">📐 Fundamento Matemático</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {activeTab === 'superposition' && 'Principio de superposición: ψ_total = ψ₁ + ψ₂. La interferencia constructiva ocurre cuando las ondas están en fase (Δφ = 2nπ) y la destructiva cuando están en contrafase (Δφ = (2n+1)π).'}
              {activeTab === 'doubleslit' && 'Experimento de Young (1801): Cada rendija actúa como fuente de ondas circulares (principio de Huygens). El patrón de intensidad sigue I ∝ cos²(πd·sinθ/λ).'}
              {activeTab === 'beats' && 'Identidad trigonométrica: sin(ω₁t) + sin(ω₂t) = 2cos((ω₁-ω₂)t/2)·sin((ω₁+ω₂)t/2). La frecuencia de batido es f_beat = |f₁ - f₂|.'}
              {activeTab === 'quantum' && 'Ecuación de Schrödinger dependiente del tiempo: iℏ∂ψ/∂t = Ĥψ. Se resuelve numéricamente con el método de Visscher (explícito y simpléctico), preservando la norma de la función de onda.'}
            </p>
          </div>
          <div className="card-glass p-4">
            <h3 className="text-sm font-semibold text-indigo-300 mb-2">🎮 Controles</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {activeTab === 'superposition' && 'Ajusta las frecuencias, amplitudes y fase relativa de las dos ondas. Observa cómo cambia el patrón de interferencia. Prueba frecuencias iguales con fase π para ver interferencia destructiva total.'}
              {activeTab === 'doubleslit' && 'Modifica la longitud de onda, la separación entre rendijas y el ancho de cada rendija. Observa cómo cambia el patrón de interferencia. Menor λ → más franjas.'}
              {activeTab === 'beats' && 'Ajusta las dos frecuencias para que sean cercanas. La diferencia entre ellas determina la frecuencia del batido. Cuando f₁ ≈ f₂, el batido es muy lento y perceptible.'}
              {activeTab === 'quantum' && 'Crea un paquete de ondas gaussiano con momento k₀. Añade una barrera de potencial para observar el efecto túnel. El paquete se dispersa y una parte puede atravesar la barrera.'}
            </p>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-8 text-center text-xs text-slate-500 pb-6">
          <p>wave-lab — Simulaciones de física ondulatoria en Canvas 2D</p>
          <p className="mt-1">TypeScript + React + Tailwind CSS · Sin dependencias de física externas</p>
          <p className="mt-1 text-indigo-400/60">Parte de la serie: Fractal → Orbitae → <span className="text-indigo-300">Wave-Lab</span></p>
          <p className="mt-4 font-medium tracking-wide select-none">
            <span className="text-blue-400">«Tecnósfera al servicio de la Biósfera.»</span> — <span className="text-red-400">«La Paz Es El Camino.»</span>
          </p>
          <p className="mt-2 text-[10px] uppercase tracking-widest select-none">
            <span className="text-blue-400">MagoPredator</span> <span className="text-red-400">SPAIN</span>
          </p>
        </footer>
      </main>
    </div>
  );
}
