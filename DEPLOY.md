# 🚀 Deploy a GitHub Pages

## Configuración inicial

### 1. Ajustar `vite.config.js` para GitHub Pages

Edita `vite.config.js` y agrega `base: '/wave-lab/'`:

```javascript
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/wave-lab/',  // ← Agrega esta línea
  server: {
    host: "0.0.0.0",
    port: 3000,
    // ... resto de configuración
  },
});
```

> 💡 Si prefieres que funcione tanto en desarrollo como en producción, usa `base: process.env.NODE_ENV === 'production' ? '/wave-lab/' : '/'`

### 2. Habilitar GitHub Pages

1. Ve a tu repo en GitHub: `https://github.com/sil/wave-lab`
2. **Settings** → **Pages**
3. En **Source**, selecciona: **GitHub Actions**
4. Guarda

### 3. Hacer push

```bash
git add .
git commit -m "🚀 Add CI, GitHub Pages deploy, and README"
git push origin main
```

### 4. Verificar el deploy

- Ve a la pestaña **Actions** en GitHub
- Deberías ver el workflow "Deploy to GitHub Pages" corriendo
- Cuando termine, tu demo estará en: **https://sil.github.io/wave-lab/**

---

## Workflows incluidos

### CI (`ci.yml`)
- Se ejecuta en cada push a `main` y en cada PR
- Verifica que el build funciona en Node.js 20 y 22
- No deploy, solo validación

### Deploy (`deploy.yml`)
- Se ejecuta en cada push a `main`
- Construye el proyecto y lo sube a GitHub Pages
- URL final: `https://sil.github.io/wave-lab/`

---

## Troubleshooting

### Los assets no cargan (404)
- Verifica que `base: '/wave-lab/'` esté en `vite.config.js`
- Haz un hard refresh (Ctrl+Shift+R) en el navegador

### El workflow falla
- Revisa los logs en la pestaña **Actions**
- Asegúrate de que `npm run build` funciona localmente
- Verifica que los permisos de GitHub Pages estén habilitados

### Cambiar el nombre del repo
Si renombras el repo, actualiza:
1. `base` en `vite.config.js`
2. La URL en `README.md`
3. Los badges en `README.md`
