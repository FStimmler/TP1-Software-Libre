#!/usr/bin/env bash

CONTAINER_NAME="mongo"
LOG_FILE="/var/log/monitor_mongo.log"
SLEEP_TIME=10
REPORT_INTERVAL=300

BOT_TOKEN="7301757155:AAHgEJ74kSr0CxDpQwksLaZS04YWW6PTElE"
CHAT_ID="6207797011"

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
GIF_PATH="$SCRIPT_DIR/futurama.gif"
log_msg() {
  echo "$(date '+%Y-%m-%d %H:%M:%S') $1" >> "$LOG_FILE"
}

send_telegram() {
  local MSG="$1"
  curl -s -X POST "https://api.telegram.org/bot$BOT_TOKEN/sendMessage" \
    -d chat_id="$CHAT_ID" \
    -d text="$MSG"
}

send_gif() {
  if [[ -f "$GIF_PATH" ]]; then
    curl -s -X POST "https://api.telegram.org/bot$BOT_TOKEN/sendAnimation" \
      -F chat_id="$CHAT_ID" \
      -F animation="@$GIF_PATH" \
  else
    log_msg "❌ No se encontró el GIF en $GIF_PATH"
  fi
}

# === LOOP PRINCIPAL ===

ALERT_SENT=0
LAST_REPORT=0

while true; do
  NOW=$(date +%s)
  STATUS=$(docker inspect -f '{{.State.Running}}' "$CONTAINER_NAME" 2>/dev/null)

  if [[ "$STATUS" != "true" ]]; then
    if [[ "$ALERT_SENT" -eq 0 ]]; then
      MSG="🚨 ALERTA: El contenedor $CONTAINER_NAME NO está corriendo."
      log_msg "$MSG"
      send_telegram "$MSG"
      send_gif  # Además manda el GIF de alerta
      ALERT_SENT=1
    fi
  else
    ALERT_SENT=0

    if (( NOW - LAST_REPORT >= REPORT_INTERVAL )); then
      # Obtener stats
      STATS=$(docker stats --no-stream --format "{{.Name}} CPU:{{.CPUPerc}} MEM:{{.MemUsage}}" "$CONTAINER_NAME")

      # Calcular uptime
      STARTED_AT=$(docker inspect -f '{{.State.StartedAt}}' "$CONTAINER_NAME")
      STARTED_TS=$(date --date="$STARTED_AT" +%s)
      UPTIME_SEC=$(( NOW - STARTED_TS ))
      UPTIME_FMT=$(printf '%dd:%02dh:%02dm:%02ds\n' \
        $(( UPTIME_SEC/86400 )) \
        $(( (UPTIME_SEC%86400)/3600 )) \
        $(( (UPTIME_SEC%3600)/60 )) \
        $(( UPTIME_SEC%60 )) )

      MSG="✅ Informe del contenedor $CONTAINER_NAME:
$STATS
⏱️ Uptime: $UPTIME_FMT"

      log_msg "$MSG"
      send_telegram "$MSG"
      LAST_REPORT=$NOW
    fi
  fi

  sleep "$SLEEP_TIME"
done