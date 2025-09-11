#!/bin/bash

# ShopSite 后台启动脚本
# 支持关闭终端后继续运行

# 配置变量
APP_NAME="shopsite"
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
PID_FILE="/tmp/${APP_NAME}.pid"
LOG_FILE="${PROJECT_DIR}/${APP_NAME}.log"
PYTHON_CMD="python3"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 函数定义
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}📍 $1${NC}"
}

# 检查服务是否运行
is_running() {
    if [ -f "$PID_FILE" ]; then
        local pid=$(cat "$PID_FILE")
        if ps -p "$pid" > /dev/null 2>&1; then
            return 0
        else
            rm -f "$PID_FILE"
            return 1
        fi
    else
        return 1
    fi
}

# 启动服务
start() {
    print_info "检查服务状态..."
    
    if is_running; then
        print_error "服务已经在运行中"
        status
        return 1
    fi
    
    print_info "切换到项目目录: $PROJECT_DIR"
    cd "$PROJECT_DIR" || {
        print_error "无法切换到项目目录"
        exit 1
    }
    
    print_info "检查Python环境和依赖..."
    
    # 检查Python
    if ! command -v "$PYTHON_CMD" &> /dev/null; then
        print_error "Python3 未安装或不在PATH中"
        exit 1
    fi
    
    # 检查主要依赖
    if ! $PYTHON_CMD -c "import fastapi, uvicorn" 2>/dev/null; then
        print_warning "检测到缺少依赖，正在安装..."
        $PYTHON_CMD -m pip install -r requirements.txt
    fi
    
    # 检查配置文件
    if [ ! -f "config/settings.ini" ]; then
        print_error "配置文件不存在: config/settings.ini"
        exit 1
    fi
    
    print_info "启动后台服务..."
    
    # 使用nohup在后台启动服务
    nohup $PYTHON_CMD main.py > "$LOG_FILE" 2>&1 &
    local pid=$!
    
    # 保存PID
    echo $pid > "$PID_FILE"
    
    # 等待几秒检查服务是否成功启动
    sleep 3
    
    if is_running; then
        print_status "服务启动成功"
        echo "📋 PID: $pid"
        echo "📝 日志文件: $LOG_FILE"
        echo "🌐 访问地址: http://localhost:8000"
        echo "📊 主页面: http://localhost:8000/web/index.html"
        echo "⚙️ 管理后台: http://localhost:8000/web/admin.html"
        echo ""
        print_info "服务已在后台运行，关闭终端不会影响服务"
        print_info "使用 '$0 logs -f' 可以实时查看日志"
        print_info "使用 '$0 stop' 可以停止服务"
    else
        print_error "服务启动失败，请检查日志文件: $LOG_FILE"
        return 1
    fi
}

# 停止服务
stop() {
    print_info "检查服务状态..."
    
    if ! is_running; then
        print_error "服务未运行"
        return 1
    fi
    
    local pid=$(cat "$PID_FILE")
    print_info "停止服务 (PID: $pid)..."
    
    # 发送TERM信号
    kill -TERM "$pid" 2>/dev/null
    
    # 等待进程结束
    local count=0
    while [ $count -lt 10 ]; do
        if ! ps -p "$pid" > /dev/null 2>&1; then
            break
        fi
        sleep 1
        count=$((count + 1))
    done
    
    # 如果进程仍在运行，强制杀死
    if ps -p "$pid" > /dev/null 2>&1; then
        print_warning "强制终止进程..."
        kill -KILL "$pid" 2>/dev/null
    fi
    
    # 清理PID文件
    rm -f "$PID_FILE"
    
    print_status "服务已停止"
}

# 重启服务
restart() {
    print_info "重启服务..."
    stop
    sleep 2
    start
}

# 查看服务状态
status() {
    if is_running; then
        local pid=$(cat "$PID_FILE")
        local start_time=$(ps -o lstart= -p "$pid" 2>/dev/null | head -1)
        
        print_status "服务正在运行"
        echo "📋 PID: $pid"
        echo "⏰ 启动时间: $start_time"
        echo "📝 日志文件: $LOG_FILE"
        echo "🌐 访问地址: http://localhost:8000"
        echo "📊 主页面: http://localhost:8000/web/index.html"
        echo "⚙️ 管理后台: http://localhost:8000/web/admin.html"
        
        # 显示进程信息
        echo ""
        echo "进程信息:"
        ps -f -p "$pid" 2>/dev/null || echo "无法获取进程详细信息"
        
    else
        print_error "服务未运行"
    fi
}

# 查看日志
logs() {
    local lines=50
    local follow=false
    
    # 解析参数
    while [[ $# -gt 0 ]]; do
        case $1 in
            -f|--follow)
                follow=true
                shift
                ;;
            -n|--lines)
                lines="$2"
                shift 2
                ;;
            *)
                shift
                ;;
        esac
    done
    
    if [ ! -f "$LOG_FILE" ]; then
        print_error "日志文件不存在: $LOG_FILE"
        return 1
    fi
    
    print_info "查看日志文件: $LOG_FILE"
    echo ""
    
    if [ "$follow" = true ]; then
        print_info "实时跟踪日志 (按 Ctrl+C 停止):"
        tail -f "$LOG_FILE"
    else
        print_info "显示最后 $lines 行日志:"
        tail -n "$lines" "$LOG_FILE"
    fi
}

# 显示帮助信息
help() {
    echo "ShopSite 后台服务管理脚本"
    echo ""
    echo "用法: $0 {start|stop|restart|status|logs|help}"
    echo ""
    echo "命令:"
    echo "  start    - 启动后台服务"
    echo "  stop     - 停止服务"
    echo "  restart  - 重启服务"
    echo "  status   - 查看服务状态"
    echo "  logs     - 查看日志"
    echo "  help     - 显示帮助信息"
    echo ""
    echo "日志选项:"
    echo "  logs -f           - 实时跟踪日志"
    echo "  logs -n 100       - 显示最后100行日志"
    echo "  logs -f -n 50     - 实时跟踪并显示最后50行"
    echo ""
    echo "示例:"
    echo "  $0 start          # 启动服务"
    echo "  $0 status         # 查看状态"
    echo "  $0 logs -f        # 实时查看日志"
    echo "  $0 stop           # 停止服务"
    echo ""
    echo "文件位置:"
    echo "  PID文件: $PID_FILE"
    echo "  日志文件: $LOG_FILE"
    echo "  项目目录: $PROJECT_DIR"
}

# 主程序
case "$1" in
    start)
        start
        ;;
    stop)
        stop
        ;;
    restart)
        restart
        ;;
    status)
        status
        ;;
    logs)
        shift
        logs "$@"
        ;;
    help|--help|-h)
        help
        ;;
    *)
        echo "用法: $0 {start|stop|restart|status|logs|help}"
        echo "使用 '$0 help' 查看详细帮助"
        exit 1
        ;;
esac

exit 0
