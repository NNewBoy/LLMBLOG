# LLMBLOG Ubuntu 部署指南（精简版）

本文档介绍如何将 LLMBLOG（个人笔记博客系统）部署到 Ubuntu 服务器。

## 环境要求

| 组件 | 版本要求 |
|------|---------|
| Ubuntu | 20.04 LTS+ |
| Python | 3.11+ |
| Node.js | 18+ |
| Nginx | 1.18+ |
| 后端端口 | `8000` |
| 编辑器 | ByteMD（Svelte 内核，~30KB，无需 CDN） |

---

## 1. 系统准备

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git build-essential
```

上传或克隆项目：

```bash
sudo mkdir -p /var/LLMBLOG
sudo chown $USER:$USER /var/LLMBLOG
cd /var/LLMBLOG
# git clone <仓库地址> .  或  scp 上传
```

---

## 2. 安装 Python 环境

```bash
sudo add-apt-repository ppa:deadsnakes/ppa -y
sudo apt update
sudo apt install -y python3.11 python3.11-venv python3.11-dev python3-pip

cd /var/LLMBLOG/backend
python3.11 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

---

## 3. 安装 Node.js 并构建前端

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

cd /var/LLMBLOG/frontend
npm install
npm run build
```

构建产物在 `frontend/dist/`（ByteMD 为 Svelte 编译，无需额外 CDN 资源）。

复制静态文件：

```bash
sudo mkdir -p /var/www/llmblog
sudo rm -rf /var/www/llmblog/*
sudo cp -r /var/LLMBLOG/frontend/dist/* /var/www/llmblog/
sudo chown -R www-data:www-data /var/www/llmblog
```

---

## 4. 配置后端环境变量

```bash
cd /var/LLMBLOG/backend
cp .env.example .env   # 或直接编辑已有 .env
nano .env
```

主要配置项：

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `HOST` | 监听地址 | `0.0.0.0` |
| `PORT` | 监听端口 | `8000` |
| `DATABASE_URL` | SQLite 路径 | `sqlite:///./data/app.db` |
| `ADMIN_PASSWORD_HASH` | 管理员密码（bcrypt） | 首次启动自动生成 |

创建数据目录：

```bash
mkdir -p /var/LLMBLOG/backend/data
mkdir -p /var/LLMBLOG/backend/llmblog_uploads
```

> **HTTP 部署注意**：`crypto.subtle`（Web Crypto API）仅在 HTTPS / localhost 下可用。项目已内置 `js-sha256` fallback，HTTP 环境下前端登录自动降级，无需额外处理。

---

## 5. 配置 Nginx

```bash
sudo apt install -y nginx
sudo nano /etc/nginx/sites-available/LLMBLOG
```

```nginx
server {
    listen 80;
    server_name your-domain.com;

    client_max_body_size 10M;

    # 前端静态文件
    root /var/www/llmblog;
    index index.html;
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API 代理（含 SSE 流式支持）
    location /api/ {
        client_max_body_size 10M;

        proxy_pass http://127.0.0.1:8000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        proxy_read_timeout 300s;
        proxy_send_timeout 300s;
    }

    # 上传文件
    location /llmblog_uploads/ {
        proxy_pass http://127.0.0.1:8000/llmblog_uploads/;
        proxy_set_header Host $host;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # 静态资源缓存（Vite 构建产出含 hash 文件名，可安全长缓存）
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        root /var/www/llmblog;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

启用站点：

```bash
sudo ln -s /etc/nginx/sites-available/LLMBLOG /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default   # 可选
sudo nginx -t && sudo systemctl reload nginx
```

---

## 6. 配置 Systemd 服务

```bash
sudo nano /etc/systemd/system/LLMBLOG.service
```

```ini
[Unit]
Description=LLMBLOG Backend
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/var/LLMBLOG/backend
Environment="PATH=/var/LLMBLOG/backend/venv/bin:/usr/local/bin:/usr/bin:/bin"
EnvironmentFile=/var/LLMBLOG/backend/.env
ExecStart=/var/LLMBLOG/backend/venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

启动服务：

```bash
sudo chmod -R 755 /var/LLMBLOG
sudo chmod -R 777 /var/LLMBLOG/backend/data
sudo chmod -R 777 /var/LLMBLOG/backend/llmblog_uploads
sudo systemctl daemon-reload
sudo systemctl start LLMBLOG
sudo systemctl enable LLMBLOG
```

---

## 7. 防火墙

```bash
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

> 后端 `127.0.0.1:8000` 仅本机访问，无需开放端口。

---

## 8. SSL/HTTPS（可选）

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
sudo certbot renew --dry-run
```

---

## 常用运维命令

```bash
# 服务
sudo systemctl start|stop|restart LLMBLOG
sudo systemctl status LLMBLOG
sudo journalctl -u LLMBLOG -f

# Nginx
sudo nginx -t
sudo systemctl reload nginx

# 更新项目
cd /var/LLMBLOG && git pull
cd frontend && npm install && npm run build
sudo rm -rf /var/www/llmblog/*
sudo cp -r dist/* /var/www/llmblog/
sudo chown -R www-data:www-data /var/www/llmblog
cd ../backend && source venv/bin/activate && pip install -r requirements.txt
sudo systemctl restart LLMBLOG

# 重置后台密码
cd /var/LLMBLOG/backend && source venv/bin/activate
python reset_password.py              # 交互式输入
python reset_password.py newpass123   # 直接传参
```

---

## 故障排查

| 问题 | 排查命令 |
|------|---------|
| 后端无法启动 | `sudo journalctl -u LLMBLOG -n 50` |
| 前端空白 | `ls /var/www/llmblog/` 检查文件；`sudo nginx -t` |
| API 404 | `curl http://127.0.0.1:8000/` 应返回 `{"code":0}` |
| 端口占用 | `sudo lsof -i:8000` |
| 权限错误 | `sudo chmod -R 777 /var/LLMBLOG/backend/data` |
| 上传图片 404 | 确认 Nginx `/llmblog_uploads/` 配置正确 |
| 登录报 `crypto.subtle` 错误 | HTTP 部署需安装 `js-sha256`（已内置 fallback，重新 `npm run build` 即可） |
| 忘记后台密码 | `cd backend && python reset_password.py` 重置 |

**日志位置**：
- Systemd：`sudo journalctl -u LLMBLOG`
- Nginx：`/var/log/nginx/error.log`
