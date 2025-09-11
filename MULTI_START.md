# 多线程一键启动脚本

这是一个功能强大的多线程启动系统，可以同时启动多个服务并进行实时监控。

## 🚀 快速开始

### Windows用户
```batch
# 直接运行批处理文件
multi_start.bat

# 或者运行Python脚本
python multi_start.py
```

### Linux/Unix用户
```bash
# 给脚本执行权限
chmod +x multi_start.sh

# 运行启动脚本
./multi_start.sh

# 或者直接运行Python脚本
python3 multi_start.py
```

## 📋 包含的服务

### 1. **FastAPI主服务** (关键服务)
- 提供Web API和静态文件服务
- 端口: 8000
- 路径: `/web/index.html`, `/web/admin.html`, `/api/docs`

### 2. **服务监控**
- 监控API健康状态、数据库连接、网页可访问性
- 每30秒执行一次健康检查
- 生成监控日志和报告
- 数据保存在 `monitor.db`

### 3. **性能监控** (可选)
- 监控CPU、内存、磁盘使用率
- 跟踪Python进程性能
- 性能警告和阈值检查
- 需要安装: `pip install psutil`

### 4. **日志清理服务**
- 自动清理过期日志文件和缓存
- 每小时运行一次
- 清理规则: 超过24小时的 `.log` 文件和 `__pycache__` 目录

## ⚙️ 配置文件

编辑 `multi_start.ini` 文件来自定义服务配置：

```ini
[main_services]
fastapi_main = true          # 主服务（必须启用）
service_monitor = true       # 服务监控
performance_monitor = false  # 性能监控（需要psutil）
log_cleanup = true          # 日志清理

[service_delays]
fastapi_main = 0            # 主服务立即启动
service_monitor = 10        # 10秒后启动服务监控
performance_monitor = 12    # 12秒后启动性能监控
log_cleanup = 15           # 15秒后启动日志清理

[monitoring]
health_check_interval = 30     # 健康检查间隔（秒）
performance_check_interval = 30 # 性能检查间隔（秒）
log_cleanup_interval = 3600    # 日志清理间隔（秒）

[alerts]
cpu_threshold = 80            # CPU警告阈值
memory_threshold = 85         # 内存警告阈值
disk_threshold = 90          # 磁盘警告阈值
response_time_threshold = 5.0 # 响应时间警告阈值
```

## 📊 监控功能

### 服务健康监控
- ✅ API响应状态检查
- 💾 数据库连接测试
- 🌐 网页可访问性验证
- 📈 响应时间统计

### 性能监控 (需要psutil)
- 🖥️ CPU使用率监控
- 🧠 内存使用率监控
- 💾 磁盘空间监控
- 🐍 Python进程跟踪

### 监控数据存储
- `monitor.db`: SQLite数据库，存储服务监控历史
- `performance_stats_YYYYMMDD.json`: 每日性能统计文件

## 🔧 使用示例

### 基本启动
```bash
# 使用默认配置启动所有服务
python multi_start.py
```

### 自定义配置启动
```bash
# 1. 编辑配置文件
nano multi_start.ini

# 2. 启动服务
python multi_start.py
```

### 仅启动特定服务
编辑 `multi_start.ini`：
```ini
[main_services]
fastapi_main = true
service_monitor = false
performance_monitor = false
log_cleanup = false
```

## 📝 日志和输出

### 实时日志输出
- 每个服务都有独立的日志输出
- 时间戳标记方便追踪
- 不同服务用不同标识区分

### 监控报告
```
📊 服务状态监控 - 2025-09-11 15:30:00
============================================================
✅ API健康检查: UP (0.123s)
✅ 数据库连接: UP (0.045s)
✅ 主页面: UP (0.089s)
✅ 管理页面: UP (0.102s)
============================================================
```

### 性能报告
```
⚡ 系统性能监控 - 2025-09-11 15:30:00
============================================================
🖥️  CPU: [████████░░░░░░░░░░░░] 42.3% (8 核)
🧠 内存: [██████░░░░░░░░░░░░░░] 31.2% (5.0GB / 16.0GB)
💾 磁盘: [████░░░░░░░░░░░░░░░░] 18.5% (123.4GB / 500.0GB)
============================================================
```

## 🛑 停止服务

- 按 `Ctrl+C` 优雅停止所有服务
- 所有子进程将被自动终止
- 监控数据会保存到文件

## 🔍 故障排除

### 常见问题

1. **性能监控启动失败**
   ```bash
   # 安装psutil依赖
   pip install psutil
   ```

2. **端口被占用**
   ```bash
   # 检查8000端口占用
   netstat -an | findstr :8000    # Windows
   lsof -i :8000                  # Linux/Mac
   ```

3. **配置文件错误**
   - 删除 `multi_start.ini` 使用默认配置
   - 检查配置文件语法格式

4. **数据库连接失败**
   ```bash
   # 检查数据库配置
   python -c "from api.models.database import engine; print('数据库连接正常')"
   ```

### 调试模式

如需详细调试信息，编辑配置文件：
```ini
[logging]
log_level = DEBUG
```

## 📱 访问地址

启动成功后，访问以下地址：

- 🌐 **主页面**: http://localhost:8000/web/index.html
- ⚙️ **管理后台**: http://localhost:8000/web/admin.html
- 📚 **API文档**: http://localhost:8000/docs
- 🩺 **健康检查**: http://localhost:8000/api/health
- 🔧 **管理员工具**: `python admin_manager.py`

## 🔒 安全注意事项

1. **生产环境部署**
   - 修改默认端口和配置
   - 启用防火墙规则
   - 配置反向代理

2. **监控数据保护**
   - 定期备份监控数据库
   - 限制日志文件访问权限

3. **资源限制**
   - 监控内存和CPU使用
   - 设置适当的警告阈值

## 📞 获取帮助

如需帮助，请查看：
- 项目主README文档
- `ADMIN_TOOLS.md` 管理员工具文档
- 配置文件注释说明
