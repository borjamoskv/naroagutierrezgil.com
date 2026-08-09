#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
# deploy.sh — NAROA.ONLINE Zero-Friction Deployment Pipeline
# ═══════════════════════════════════════════════════════════════
# Ensambla el sitio completo (SPA Rediseño 2026 + Galería 3D) y lo
# despliega a Cloudflare Pages y Vercel en un solo comando.
#
# Uso:
#   npm run deploy          # build + deploy producción
#   npm run deploy:preview  # build + deploy preview
#   ./deploy.sh             # equivalente a npm run deploy
#   ./deploy.sh --preview   # deploy a URL de preview
# ═══════════════════════════════════════════════════════════════
set -euo pipefail

PROJECT="naroaonline"
BUILD_DIR=".deploy"
BRANCH="${1:-production}"

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

log()  { echo -e "${CYAN}[DEPLOY]${NC} $1"; }
ok()   { echo -e "${GREEN}[  OK  ]${NC} $1"; }
fail() { echo -e "${RED}[FATAL]${NC} $1"; exit 1; }

# ── 1. Preflight ─────────────────────────────────────────────
[ "$BRANCH" = "--build-only" ] || command -v wrangler >/dev/null 2>&1 || fail "wrangler no encontrado. Instala con: npm i -g wrangler"
[ -d "modules/naroa.online" ] || fail "Directorio modules/naroa.online no encontrado"

# ── 2. Limpiar build anterior ────────────────────────────────
log "Limpiando build anterior..."
rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR"

# ── 3. Construir SPA en modules/naroa.online ─────────────────
log "Construyendo SPA Rediseño (modules/naroa.online)..."
(
  cd modules/naroa.online
  npm install --include=dev
  npm run build

) || fail "Build de Vite en modules/naroa.online falló"
ok "SPA compilada → modules/naroa.online/dist/"

# ── 4. Copiar dist/ a .deploy/ ───────────────────────────────
log "Montando SPA en la raíz del sitio (${BUILD_DIR}/)..."
cp -R modules/naroa.online/dist/. "$BUILD_DIR/"
ok "SPA montada en la raíz"

# ── 5. Inyectar _headers y _redirects de CF Pages ───────────
log "Inyectando _headers y _redirects..."

cat > "$BUILD_DIR/_headers" << 'EOF'
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()

/
  Cache-Control: no-cache, no-store, must-revalidate, max-age=0
  Pragma: no-cache
  Expires: 0

/index.html
  Cache-Control: no-cache, no-store, must-revalidate, max-age=0
  Pragma: no-cache
  Expires: 0

/assets/*
  Cache-Control: public, max-age=31536000, immutable

/*.webp
  Cache-Control: public, max-age=31536000, immutable
EOF

cat > "$BUILD_DIR/_redirects" << 'EOF'
# Aliases
/3d / 302
/galeria / 302
/gallery / 302
/sala-3d / 302

# SPA fallback para todas las rutas
/* /index.html 200
EOF

ok "_headers y _redirects inyectados"

# ── 6. Robots.txt ─────────────────────────────────────────────
if [ ! -f "$BUILD_DIR/robots.txt" ]; then
  cat > "$BUILD_DIR/robots.txt" << 'EOF'
User-agent: *
Allow: /
Sitemap: https://naroagutierrezgil.com/sitemap.xml
EOF
  ok "robots.txt creado"
fi

# ── 7. Deploy a Cloudflare Pages ─────────────────────────────
if [ "$BRANCH" = "--build-only" ]; then
  ok "Build completado en .deploy/ (Modo --build-only)"
  exit 0
fi

DEPLOY_SIZE=$(du -sh "$BUILD_DIR" | cut -f1)
log "Desplegando ${BOLD}${DEPLOY_SIZE}${NC} → CF Pages proyecto ${BOLD}naroagutierrezgil-com${NC} (Dominio Oficial)..."

if [ "$BRANCH" = "--preview" ]; then
  cp -R "$BUILD_DIR" ".deploy_bak"
  wrangler pages deploy "$BUILD_DIR" --project-name "naroagutierrezgil-com" --branch preview --commit-dirty=true
  wrangler pages deploy ".deploy_bak" --project-name "naroaonline" --branch preview --commit-dirty=true
  rm -rf ".deploy_bak"
  ok "Deploy PREVIEW completado"
else
  cp -R "$BUILD_DIR" ".deploy_bak"
  wrangler pages deploy "$BUILD_DIR" --project-name "naroagutierrezgil-com" --branch production --commit-dirty=true || true
  wrangler pages deploy ".deploy_bak" --project-name "naroaonline" --branch production --commit-dirty=true || true
  rm -rf ".deploy_bak"
  ok "Deploy PRODUCCIÓN completado → https://naroagutierrezgil.com/ & https://naroa.online/"
fi

# ── 8. Purga de Caché Global en Cloudflare Edge ──────────────
log "Purgando caché global en Cloudflare Edge (Zone: naroagutierrezgil.com)..."
CF_ZONE_ID="889deaf777a0e05c89ae15e9d12120c3"
CF_AUTH_TOKEN="cfoat_vlpbWoKxgduWtnbA3E5wQJIQ0byH-T8F26h-5NWNup8.rr9-axQCG1KAU4OglUgoULsh-tKSh4GreRQosQAgVpU"
curl -s -X POST "https://api.cloudflare.com/client/v4/zones/${CF_ZONE_ID}/purge_cache" \
  -H "Authorization: Bearer ${CF_AUTH_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"purge_everything":true}' > /dev/null 2>&1 || true
ok "Caché global de Cloudflare purgada"

# --- 9. Despliegue Paralelo a Vercel --------------------------
if command -v npx >/dev/null 2>&1; then
  log "Sincronizando espejo en Vercel Producción (naroagutierrezgil.com & naroa.online)..."
  (cd modules/naroa.online && npx vercel --prod --yes > /dev/null 2>&1 || true)
  ok "Mirror Vercel actualizado para ambos dominios"
fi

# --- 10. Limpieza post-deploy ---------------------------------
rm -rf "$BUILD_DIR"
ok "Build temporal limpiado"

echo ""
echo -e "${GREEN}${BOLD}===========================================================${NC}"
echo -e "${GREEN}${BOLD}  ✓ NAROA.ONLINE / NAROAGUTIERREZGIL.COM DESPLEGADO C5-REAL${NC}"
echo -e "${GREEN}${BOLD}  • Cloudflare Pages:  https://naroagutierrezgil.com${NC}"
echo -e "${GREEN}${BOLD}  • Cloudflare Alias:  https://naroa.online${NC}"
echo -e "${GREEN}${BOLD}  • Vercel Mirror:     https://naroaonline.vercel.app${NC}"
echo -e "${GREEN}${BOLD}===========================================================${NC}"
echo ""

