#!/usr/bin/env bash
# setup-server.sh — Configura el servidor Ubuntu por primera vez
# Ejecutar UNA sola vez como root o con sudo:
#   bash deploy/setup-server.sh
set -euo pipefail

echo "==> Actualizando paquetes..."
apt-get update -qq && apt-get upgrade -y -qq

echo "==> Instalando nginx..."
apt-get install -y nginx

echo "==> Instalando Node.js 20 (via NodeSource)..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

echo "==> Instalando PM2 globalmente..."
npm install -g pm2
pm2 startup systemd -u "$SUDO_USER" --hp "/home/$SUDO_USER" || true

echo "==> Creando directorios de trabajo..."
mkdir -p /var/www/pos-frontend
mkdir -p /opt/pos-backend
chown -R "$SUDO_USER":"$SUDO_USER" /var/www/pos-frontend /opt/pos-backend

echo "==> Configurando nginx..."
cp "$(dirname "$0")/nginx.conf" /etc/nginx/sites-available/pos
ln -sf /etc/nginx/sites-available/pos /etc/nginx/sites-enabled/pos
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl enable nginx && systemctl reload nginx

echo ""
echo "==> ¡Listo! Pasos siguientes:"
echo "   1. Copia tu .env de producción al servidor:"
echo "      scp pos-backend/.env.example usuario@servidor:/opt/pos-backend/.env"
echo "      # Edita ese archivo con los valores reales"
echo ""
echo "   2. Agrega los secrets en GitHub (Settings → Secrets → Actions):"
echo "      SSH_PRIVATE_KEY  → contenido de tu llave privada SSH"
echo "      SERVER_HOST      → IP o dominio del servidor"
echo "      SERVER_USER      → usuario SSH (ej: ubuntu)"
echo "      VITE_BACKEND_URL → URL pública del servidor (ej: http://123.45.67.89)"
echo ""
echo "   3. Haz push a main para que se ejecute el pipeline."
