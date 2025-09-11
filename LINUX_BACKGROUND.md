# Linux后台运行指南

本指南介绍如何在Linux系统上让ShopSite服务在后台运行，即使关闭终端也能继续运行。

## 🚀 三种后台运行方案

### 方案一：简单后台脚本（推荐新手）

使用 `background_start.sh` 脚本，简单易用：

```bash
# 给脚本执行权限
chmod +x background_start.sh

# 启动后台服务
./background_start.sh start

# 查看服务状态
./background_start.sh status

# 查看日志
./background_start.sh logs

# 实时跟踪日志
./background_start.sh logs -f

# 停止服务
./background_start.sh stop

# 重启服务
./background_start.sh restart
```

**特点**：
- ✅ 关闭终端后继续运行
- ✅ 简单易用，一键操作
- ✅ 自动检查依赖和配置
- ❌ 重启系统后需手动启动

### 方案二：Python守护进程（推荐高级用户）

使用 `daemon_start.py` 脚本，功能更强大：

```bash
# 启动守护进程
python3 daemon_start.py start

# 查看状态
python3 daemon_start.py status

# 查看日志
python3 daemon_start.py logs

# 实时跟踪日志
python3 daemon_start.py logs --follow

# 停止服务
python3 daemon_start.py stop

# 重启服务
python3 daemon_start.py restart
```

**特点**：
- ✅ 真正的守护进程
- ✅ 完整的进程管理
- ✅ 详细的状态信息
- ❌ 重启系统后需手动启动

### 方案三：系统服务（推荐生产环境）

使用 `install_service.sh` 安装为系统服务：

```bash
# 安装为系统服务（需要sudo权限）
sudo chmod +x install_service.sh
sudo ./install_service.sh install

# 管理服务
sudo systemctl start shopsite      # 启动
sudo systemctl stop shopsite       # 停止
sudo systemctl restart shopsite    # 重启
sudo systemctl status shopsite     # 状态

# 查看日志
sudo journalctl -u shopsite -f     # 实时日志
sudo journalctl -u shopsite        # 所有日志

# 卸载服务
sudo ./install_service.sh uninstall
```

**特点**：
- ✅ 开机自动启动
- ✅ 异常时自动重启
- ✅ 系统级管理
- ✅ 集成系统日志
- ✅ 最稳定可靠

## 📋 详细使用说明

### 🔧 启动前准备

1. **检查Python环境**：
```bash
python3 --version
pip3 --version
```

2. **安装依赖**：
```bash
pip3 install -r requirements.txt
```

3. **检查配置文件**：
```bash
ls -la config/settings.ini
```

4. **测试数据库连接**：
```bash
python3 -c "from api.models.database import engine; print('数据库连接正常')"
```

### 🚀 方案一：简单后台脚本详解

#### 启动服务
```bash
./background_start.sh start
```

输出示例：
```
📍 检查服务状态...
📍 切换到项目目录: /home/user/shopsite
📍 检查Python环境和依赖...
✅ Python3 依赖检查通过
📍 启动后台服务...
✅ 服务启动成功
📋 PID: 12345
📝 日志文件: /home/user/shopsite/shopsite.log
🌐 访问地址: http://localhost:8000
📊 主页面: http://localhost:8000/web/index.html
⚙️ 管理后台: http://localhost:8000/web/admin.html

📍 服务已在后台运行，关闭终端不会影响服务
📍 使用 './background_start.sh logs -f' 可以实时查看日志
📍 使用 './background_start.sh stop' 可以停止服务
```

#### 查看状态
```bash
./background_start.sh status
```

输出示例：
```
✅ 服务正在运行
📋 PID: 12345
⏰ 启动时间: Wed Sep 11 15:30:00 2025
📝 日志文件: /home/user/shopsite/shopsite.log
🌐 访问地址: http://localhost:8000

进程信息:
UID        PID  PPID  C STIME TTY          TIME CMD
user     12345     1  0 15:30 ?        00:00:05 python3 main.py
```

#### 查看日志
```bash
# 查看最后50行日志
./background_start.sh logs

# 查看最后100行日志
./background_start.sh logs -n 100

# 实时跟踪日志（按Ctrl+C停止）
./background_start.sh logs -f
```

### 🛠️ 方案二：Python守护进程详解

#### 启动守护进程
```bash
python3 daemon_start.py start
```

程序会自动fork为守护进程，脱离终端运行。

#### 查看详细状态
```bash
python3 daemon_start.py status
```

输出示例：
```
📊 服务状态信息:
   PID: 12345
   启动时间: 2025-09-11T15:30:00.123456
   运行时长: 1:23:45.678901
   状态: running
   日志文件: shopsite.log
   项目目录: /home/user/shopsite
✅ 服务正在运行 (PID: 12345)
🌐 访问地址: http://localhost:8000
```

### 🏢 方案三：系统服务详解

#### 安装服务
```bash
sudo ./install_service.sh install
```

安装完成后会显示：
```
🎉 ShopSite 系统服务安装完成！

📋 服务信息:
   服务名称: shopsite
   项目目录: /home/user/shopsite
   运行用户: user
   Python路径: /usr/bin/python3

🔧 服务管理命令:
   sudo systemctl start shopsite     # 启动服务
   sudo systemctl stop shopsite      # 停止服务
   sudo systemctl restart shopsite   # 重启服务
   sudo systemctl status shopsite    # 查看状态
   sudo systemctl enable shopsite    # 开机自启
   sudo systemctl disable shopsite   # 取消自启

📝 日志管理命令:
   sudo journalctl -u shopsite       # 查看所有日志
   sudo journalctl -u shopsite -f    # 实时查看日志
   sudo journalctl -u shopsite --since today  # 查看今天日志
```

#### 查看服务状态
```bash
sudo systemctl status shopsite
```

输出示例：
```
● shopsite.service - ShopSite FastAPI Web Application
     Loaded: loaded (/etc/systemd/system/shopsite.service; enabled; vendor preset: enabled)
     Active: active (running) since Wed 2025-09-11 15:30:00 UTC; 1h 23min ago
       Docs: https://github.com/xfrrn/shopsite
   Main PID: 12345 (python3)
      Tasks: 1 (limit: 4915)
     Memory: 45.2M
        CPU: 2.345s
     CGroup: /system.slice/shopsite.service
             └─12345 /usr/bin/python3 main.py

Sep 11 15:30:00 server systemd[1]: Started ShopSite FastAPI Web Application.
Sep 11 15:30:01 server python3[12345]: ✅ 数据库连接成功: fanxi_shop
Sep 11 15:30:01 server python3[12345]: 📊 数据库表初始化完成
Sep 11 15:30:02 server python3[12345]: 🚀 应用启动完成
```

## 🔍 故障排除

### 常见问题

1. **端口被占用**
```bash
# 检查8000端口
sudo netstat -tlnp | grep :8000
# 或
sudo lsof -i :8000

# 杀死占用进程
sudo kill -9 <PID>
```

2. **权限问题**
```bash
# 检查文件权限
ls -la background_start.sh
chmod +x background_start.sh

# 检查目录权限
ls -la uploads/
chmod 755 uploads/
```

3. **Python依赖问题**
```bash
# 重新安装依赖
pip3 install --upgrade -r requirements.txt

# 检查特定包
python3 -c "import fastapi; print('FastAPI version:', fastapi.__version__)"
```

4. **数据库连接问题**
```bash
# 测试数据库连接
python3 -c "
from api.models.database import engine
from sqlalchemy import text
try:
    with engine.connect() as conn:
        result = conn.execute(text('SELECT 1'))
        print('数据库连接成功')
except Exception as e:
    print('数据库连接失败:', e)
"
```

### 日志分析

#### 查看启动日志
```bash
# 方案一
tail -f shopsite.log

# 方案二
python3 daemon_start.py logs --follow

# 方案三
sudo journalctl -u shopsite -f
```

#### 查看错误日志
```bash
# 查找错误信息
grep -i error shopsite.log
grep -i exception shopsite.log

# 查看系统日志
sudo journalctl -u shopsite --since "1 hour ago" | grep -i error
```

## 📊 性能监控

### 监控进程资源
```bash
# 查看进程资源使用
top -p $(cat /tmp/shopsite.pid)

# 查看内存使用
ps -o pid,ppid,cmd,%mem,%cpu --sort=-%mem -p $(cat /tmp/shopsite.pid)
```

### 监控网络连接
```bash
# 查看网络连接
sudo netstat -tlnp | grep python3
sudo ss -tlnp | grep :8000
```

### 监控日志大小
```bash
# 查看日志文件大小
ls -lh shopsite.log

# 清理过大的日志
> shopsite.log  # 清空日志文件
```

## 🔐 安全建议

1. **防火墙配置**
```bash
# 开放8000端口（如果需要外部访问）
sudo ufw allow 8000
```

2. **反向代理**
推荐使用Nginx作为反向代理：
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

3. **SSL证书**
```bash
# 使用Let's Encrypt
sudo certbot --nginx -d your-domain.com
```

## 📞 获取帮助

如果遇到问题，可以：

1. 查看详细日志
2. 检查系统资源
3. 验证配置文件
4. 重启相关服务

每种方案都提供了 `help` 选项来查看详细帮助信息。
