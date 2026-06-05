#!/usr/bin/env bash
# Cloudflare Tunnel setup for AIDC.work on 10.23.1.53
# Run on the remote host: bash scripts/setup-cloudflare-tunnel.sh
set -euo pipefail

TUNNEL_NAME="${TUNNEL_NAME:-aidc-work}"
LOCAL_SERVICE="${LOCAL_SERVICE:-http://localhost:3163}"
HOSTNAME="${HOSTNAME:-aidc.work}"
WWW_HOSTNAME="${WWW_HOSTNAME:-www.aidc.work}"
CF_DIR="${CF_DIR:-$HOME/.cloudflared}"

echo "==> AIDC.work Cloudflare Tunnel setup"
echo "    Tunnel name : ${TUNNEL_NAME}"
echo "    Local target: ${LOCAL_SERVICE}"
echo "    Hostnames   : ${HOSTNAME}, ${WWW_HOSTNAME}"
echo

if ! command -v cloudflared >/dev/null 2>&1; then
  echo "==> Installing cloudflared..."
  ARCH="$(uname -m)"
  case "${ARCH}" in
    x86_64) CF_ARCH="amd64" ;;
    aarch64|arm64) CF_ARCH="arm64" ;;
    *)
      echo "Unsupported architecture: ${ARCH}" >&2
      exit 1
      ;;
  esac
  curl -fsSL "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-${CF_ARCH}" -o /tmp/cloudflared
  chmod +x /tmp/cloudflared
  sudo mv /tmp/cloudflared /usr/local/bin/cloudflared
  cloudflared --version
fi

mkdir -p "${CF_DIR}"

if ! compgen -G "${CF_DIR}/*.json" > /dev/null; then
  echo "==> Step 1: Authenticate with Cloudflare (browser will open)"
  cloudflared tunnel login

  echo "==> Step 2: Create tunnel '${TUNNEL_NAME}'"
  cloudflared tunnel create "${TUNNEL_NAME}"
fi

CRED_FILE="$(ls -1 "${CF_DIR}"/*.json | head -n 1)"
TUNNEL_ID="$(basename "${CRED_FILE}" .json)"

echo "==> Tunnel ID: ${TUNNEL_ID}"

CONFIG_FILE="${CF_DIR}/config.yml"
cat > "${CONFIG_FILE}" <<EOF
tunnel: ${TUNNEL_ID}
credentials-file: ${CRED_FILE}

ingress:
  - hostname: ${HOSTNAME}
    service: ${LOCAL_SERVICE}
  - hostname: ${WWW_HOSTNAME}
    service: ${LOCAL_SERVICE}
  - service: http_status:404
EOF

echo "==> Wrote ${CONFIG_FILE}"

echo "==> Step 3: Route DNS (requires zone on Cloudflare)"
cloudflared tunnel route dns "${TUNNEL_NAME}" "${HOSTNAME}" || true
cloudflared tunnel route dns "${TUNNEL_NAME}" "${WWW_HOSTNAME}" || true

echo "==> Step 4: Install systemd service"
if command -v systemctl >/dev/null 2>&1; then
  sudo cloudflared --config "${CONFIG_FILE}" service install
  sudo systemctl enable cloudflared
  sudo systemctl restart cloudflared
  sudo systemctl status cloudflared --no-pager
else
  echo "systemctl not found; run manually:"
  echo "  cloudflared --config ${CONFIG_FILE} tunnel run ${TUNNEL_NAME}"
fi

echo
echo "Done. Verify:"
echo "  curl -I https://${HOSTNAME}"
echo "  docker compose -f /home/yjhwang/aidc-work/docker-compose.yml ps"
