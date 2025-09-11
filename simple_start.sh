#!/bin/bash

# 超简单的生产环境启动脚本
# 反向代理已配置，只需要启动FastAPI

PID_FILE="/tmp/shopsite.pid"
LOG_FILE="shopsite.log"

# 检查是否运行
is_running() {
    [ -f "$PID_FILE" ] && kill -0 $(cat "$PID_FILE") 2>/dev/null
}

# 启动
start() {
    if is_running; then
        echo "❌ 服务已在运行"
        return 1
    fi
    
    echo "🚀 启动ShopSite服务..."
    
    # 后台启动
    nohup python3 main.py > "$LOG_FILE" 2>&1 &
    echo $! > "$PID_FILE"
    
    sleep 2
    
    if is_running; then
        echo "✅ 服务启动成功"
        echo "📋 PID: $(cat $PID_FILE)"
        echo "📝 日志: $LOG_FILE"
        echo "🌐 通过你的域名访问（反向代理）"
        echo "🔍 本地测试: http://localhost:8000/health"
    else
        echo "❌ 启动失败，查看日志: $LOG_FILE"
    fi
}

# 停止
stop() {
    if ! is_running; then
        echo "❌ 服务未运行"
        return 1
    fi
    
    echo "🛑 停止服务..."
    kill $(cat "$PID_FILE")
    rm -f "$PID_FILE"
    echo "✅ 服务已停止"
}

# 重启
restart() {
    stop
    sleep 2
    start
}

# 状态
status() {
    if is_running; then
        echo "✅ 服务运行中"
        echo "📋 PID: $(cat $PID_FILE)"
        echo "⏰ 运行时间: $(ps -o etime= -p $(cat $PID_FILE))"
        echo "🌐 通过你的域名访问"
    else
        echo "❌ 服务未运行"
    fi
}

# 日志
logs() {
    if [ "$1" = "-f" ]; then
        tail -f "$LOG_FILE"
    else
        tail -n ${1:-50} "$LOG_FILE"
    fi
}

case "$1" in
    start) start ;;
    stop) stop ;;
    restart) restart ;;
    status) status ;;
    logs) logs $2 ;;
    *)
        echo "用法: $0 {start|stop|restart|status|logs}"
        echo ""
        echo "🚀 快速启动: $0 start"
        echo "📊 查看状态: $0 status"
        echo "📝 查看日志: $0 logs"
        echo "📝 实时日志: $0 logs -f"
        ;;
esac
