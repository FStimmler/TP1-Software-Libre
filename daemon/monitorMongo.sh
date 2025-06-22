#!/usr/bin/env bash

CONTAINER_NAME="mongo"
LOG_FILE="/var/log/monitor_mongo.log"
SLEEP_TIME=10

BOT_TOKEN="7301757155:AAHgEJ74kSr0CxDpQwksLaZS04YWW6PTElE"
CHAT_ID="6207797011"

log_alert() {
  echo "$(date '+%Y-%m-%d %H:%M:%S') [ALERTA] $1" >> "$LOG_FILE"
}

send_telegram() {
  TEXT=$(echo "$1" | sed 's/ /%20/g') # Opcional: escapá espacios
  curl -s -X POST "https://api.telegram.org/bot$BOT_TOKEN/sendMessage" \
    -d chat_id="$CHAT_ID" \
    -d text="$1"
}

# === Loop ===
ALERT_SENT=0

while true; do
  NOW=$(date +%s)
  STATUS=$(docker inspect -f '{{.State.Running}}' "$CONTAINER_NAME" 2>/dev/null)

  if [[ "$STATUS" != "true" ]]; then
    if [[ "$ALERT_SENT" -eq 0 ]]; then
      MSG="🚨 ALERTA: El contenedor $CONTAINER_NAME NO está corriendo."
      log_alert "$MSG"
      send_telegram "$MSG"
      ALERT_SENT=1
    fi
  else
    ALERT_SENT=0

    # Cada REPORT_INTERVAL segundos, mandar reporte de stats
    if (( NOW - LAST_REPORT >= REPORT_INTERVAL )); then
      STATS=$(docker stats --no-stream --format "{{.Name}} CPU:{{.CPUPerc}} MEM:{{.MemUsage}}" "$CONTAINER_NAME")
      MSG="✅ Informe del contenedor $CONTAINER_NAME: $STATS"
      echo "$(date '+%Y-%m-%d %H:%M:%S') [INFO] $MSG" >> "$LOG_FILE"
      send_telegram "$MSG"
      LAST_REPORT=$NOW
    fi
  fi

  sleep "$SLEEP_TIME"
done
