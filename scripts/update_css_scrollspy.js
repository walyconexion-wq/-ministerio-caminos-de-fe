const fs = require('fs');

function updateCss(filePath) {
  let css = fs.readFileSync(filePath, 'utf8');
  if (!css.includes('.nav-link-active')) {
    css += `

/* ============================================================
   EFECTO SCROLLSPY Y DESTACADO DEL MENÚ DE NAVEGACIÓN
   ============================================================ */
.nav-link {
  display: inline-block;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  transform-origin: center;
  position: relative;
  padding: 0.25rem 0.5rem;
  border-radius: 0.5rem;
}

.nav-link:hover {
  transform: scale(1.06);
}

.nav-link-active {
  color: #FBBF24 !important; /* Oro Celestial */
  font-weight: 700 !important;
  transform: scale(1.15) !important;
  text-shadow: 0 0 12px rgba(251, 191, 36, 0.65), 0 0 24px rgba(139, 92, 246, 0.45) !important;
  background: rgba(139, 92, 246, 0.15);
  border: 1px solid rgba(251, 191, 36, 0.35);
  box-shadow: 0 0 15px rgba(251, 191, 36, 0.2);
}

.nav-link-active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 20%;
  right: 20%;
  height: 2px;
  background: #FBBF24;
  border-radius: 9999px;
  box-shadow: 0 0 8px #FBBF24;
}
`;
    fs.writeFileSync(filePath, css, 'utf8');
    console.log("CSS actualizado en:", filePath);
  }
}

updateCss('styles/style.css');
updateCss('public/styles/style.css');
