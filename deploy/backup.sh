#!/usr/bin/env bash
# LLMBLOG SQLite 备份脚本（Linux/macOS）
# 用法: ./deploy/backup.sh [DB_PATH] [BACKUP_DIR] [RETAIN_DAYS]
# 定时任务示例 (crontab -e): 0 3 * * * /opt/llmblog/deploy/backup.sh
set -euo pipefail

DB_PATH="${1:-app/data/app.db}"
BACKUP_DIR="${2:-backups}"
RETAIN_DAYS="${3:-7}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"

if [ ! -f "$DB_PATH" ]; then
  echo "[ERROR] Database not found: $DB_PATH" >&2
  exit 1
fi

mkdir -p "$BACKUP_DIR"

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/app_${TIMESTAMP}.db"

# WAL checkpoint + 安全备份
if command -v sqlite3 &>/dev/null; then
  sqlite3 "$DB_PATH" "PRAGMA wal_checkpoint(TRUNCATE);"
  sqlite3 "$DB_PATH" ".backup '$BACKUP_FILE'"
else
  # 无 sqlite3 CLI 时直接拷贝（已 checkpoint 需另外处理）
  cp "$DB_PATH" "$BACKUP_FILE"
  [ -f "${DB_PATH}-wal" ] && cp "${DB_PATH}-wal" "${BACKUP_FILE}-wal"
  echo "[WARN] sqlite3 CLI not found, copied without explicit checkpoint" >&2
fi

gzip -f "$BACKUP_FILE"
echo "[OK] Backed up to ${BACKUP_FILE}.gz"

# 保留策略
find "$BACKUP_DIR" -name "app_*.db.gz" -mtime +"$RETAIN_DAYS" -delete
echo "[OK] Cleaned backups older than $RETAIN_DAYS days"
