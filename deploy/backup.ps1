# LLMBLOG SQLite 备份脚本（Windows PowerShell）
# 用法: .\deploy\backup.ps1 [-DbPath <path>] [-BackupDir <dir>] [-RetainDays <int>]
# 计划任务示例: 每日 03:00 执行此脚本
param(
    [string]$DbPath = "app/data/app.db",
    [string]$BackupDir = "backups",
    [int]$RetainDays = 7
)

$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectDir = Split-Path -Parent $ScriptDir
Set-Location $ProjectDir

if (-not (Test-Path $DbPath)) {
    Write-Error "Database not found: $DbPath"
    exit 1
}

New-Item -ItemType Directory -Force -Path $BackupDir | Out-Null

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupFile = Join-Path $BackupDir "app_$timestamp.db"

# 优先使用项目虚拟环境中的 Python
$python = if (Test-Path ".venv\Scripts\python.exe") { ".venv\Scripts\python.exe" }
          elseif (Test-Path "backend\.venv\Scripts\python.exe") { "backend\.venv\Scripts\python.exe" }
          else { "python" }

# WAL checkpoint + 安全拷贝（Python sqlite3 模块）
& $python -c "import sqlite3,shutil,sys; db=sys.argv[1]; out=sys.argv[2]; conn=sqlite3.connect(db); conn.execute('PRAGMA wal_checkpoint(TRUNCATE)'); conn.close(); shutil.copy2(db,out); print('OK')" $DbPath $backupFile

if ($LASTEXITCODE -ne 0) {
    Write-Error "Backup failed (Python exit code $LASTEXITCODE)"
    exit 1
}

# 压缩
$zipFile = "$backupFile.zip"
Compress-Archive -Path $backupFile -DestinationPath $zipFile -Force
Remove-Item $backupFile

Write-Host "[OK] Backed up to $zipFile"

# 保留策略
$cutoff = (Get-Date).AddDays(-$RetainDays)
Get-ChildItem $BackupDir -Filter "app_*.db.zip" |
    Where-Object { $_.LastWriteTime -lt $cutoff } |
    Remove-Item
Write-Host "[OK] Cleaned backups older than $RetainDays days"
