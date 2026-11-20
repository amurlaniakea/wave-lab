# 🌊 wave-lab

> **Laboratorio interactivo de interferencia, difracción y paquetes de ondas**
> Simulaciones en tiempo real con Canvas 2D — sin dependencias de física externas

**🔗 Live Demo → [sil.github.io/wave-lab](https://sil.github.io/wave-lab/)**

[![CI](https://github.com/sil/wave-lab/actions/workflows/ci.yml/badge.svg)](https://github.com/sil/wave-lab/actions/workflows/ci.yml)
[![Deploy](https://github.com/sil/wave-lab/actions/workflows/deploy.yml/badge.svg)](https://github.com/sil/wave-lab/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 📖 Descripción

**wave-lab** es un laboratorio web interactivo que simula fenómenos ondulatorios fundamentales usando **TypeScript puro y Canvas 2D**, sin librerías de física externas (ni NumPy, ni Three.js, ni nada pesado).

Cada simulación es controlable en tiempo real y está acompañada de su fundamento matemático.

> 🧩 *Eslabón natural entre [Fractal](https://github.com/sil/fractal) y [Orbitae](https://github.com/sil/orbitae), mostrando cómo nace la probabilidad cuántica antes de llegar a los orbitales atómicos.*

---

## 🧪 Simulaciones

| # | Simulación | Descripción | Conceptos clave |
|---|-----------|-------------|-----------------|
| 🌊 | **Superposición** | Interferencia de dos ondas con fase variable | Principio de superposición, interferencia constructiva/destructiva |
| 🔬 | **Doble Rendija** | Experimento de Young con ondas circulares | Principio de Huygens, patrón de interferencia I ∝ cos²(πd·sinθ/λ) |
| 🎵 | **Batidos** | Beats acústicos con envolvente modulada | Identidad trigonométrica, frecuencia de batido f_beat = \|f₁ - f₂\| |
| ⚛️ | **Paquete Cuántico** | Ecuación de Schrödinger 1D con barrera de potencial | Efecto túnel, dispersión de paquetes, método de Visscher |

---

## 🎮 Controles interactivos

Cada simulación permite ajustar parámetros en tiempo real:

- **Superposición**: frecuencia, amplitud y fase de cada onda
- **Doble Rendija**: longitud de onda λ, distancia entre rendijas d, ancho de rendija
- **Batidos**: las dos frecuencias cercanas que generan el beat
- **Paquete Cuántico**: ancho σ, momento k₀, altura/ancho/posición de la barrera V₀

---

## 🏗️ Stack técnico

```
TypeScript 5 · React 19 · Vite 6 · Tailwind CSS v4 · Canvas 2D API
```

- **0 dependencias de física** — toda la matemática está en ~500 líneas de TS puro
- **Método de Visscher** (explícito, simpléctico) para la ecuación de Schrödinger
- **requestAnimationFrame** para animación fluida a 60fps
- **Glassmorphism UI** con tema oscuro

---

## 🚀 Uso local

```bash
# Clonar
git clone https://github.com/sil/wave-lab.git
cd wave-lab

# Instalar
npm install

# Desarrollo (hot reload)
npm run dev

# Build producción
npm run build

# Preview del build
npm run preview
```

---

## 📐 Fundamento matemático

### Superposición de ondas
$$\psi_{\text{total}}(x,t) = \psi_1(x,t) + \psi_2(x,t) = A_1\sin(k_1 x - \omega_1 t) + A_2\sin(k_2 x - \omega_2 t + \varphi)$$

### Doble rendija (Young, 1801)
$$I(\theta) \propto \cos^2\!\left(\frac{\pi d \sin\theta}{\lambda}\right)$$

### Batidos
$$\sin(\omega_1 t) + \sin(\omega_2 t) = 2\cos\!\left(\frac{\omega_1 - \omega_2}{2}t\right)\sin\!\left(\frac{\omega_1 + \omega_2}{2}t\right)$$

### Paquete cuántico (Schrödinger 1D)
$$i\hbar\frac{\partial\psi}{\partial t} = -\frac{\hbar^2}{2m}\frac{\partial^2\psi}{\partial x^2} + V(x)\psi$$

Resuelto numéricamente con el **método de Visscher** — explícito y simpléctico, preserva la norma $\int|\psi|^2 dx = 1$.

---

## 📁 Estructura

```
wave-lab/
├── .github/
│   └── workflows/
│       ├── ci.yml          # CI: lint + build en cada push/PR
│       └── deploy.yml      # Deploy a GitHub Pages
├── src/
│   ├── components/
│   │   ├── Superposition.tsx    # 🌊 Interferencia de ondas
│   │   ├── DoubleSlit.tsx       # 🔬 Experimento de Young
│   │   ├── Beats.tsx            # 🎵 Batidos acústicos
│   │   └── QuantumPacket.tsx    # ⚛️ Schrödinger 1D
│   ├── hooks/
│   │   └── useAnimationFrame.ts # Hook de animación
│   ├── App.tsx                  # Layout + navegación por tabs
│   ├── main.tsx
│   └── index.css
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.js
└── README.md
```

---

## 🔄 Serie de proyectos

| Proyecto | Tema | Estado |
|----------|------|--------|
| [Fractal](https://github.com/sil/fractal) | Geometría fractal y sistemas-L | ✅ |
| [Orbitae](https://github.com/sil/orbitae) | Orbitales atómicos y números cuánticos | ✅ |
| **🌊 wave-lab** | **Ondas, interferencia y Schrödinger 1D** | **✅** |

---

## 📄 Licencia

MIT © [sil](https://github.com/sil)
