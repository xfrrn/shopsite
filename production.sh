#!/bin/bash

# 生产环境快速启动脚本
# 反向代理已配置，只需启动FastAPI服务

SERVICE_NAME="shopsite"
PROJECT_DIR="$(pwd)"
USER=$(whoami)
PYTHON_PATH=$(which python3)

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() { echo -e "${GREEN}✅ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️ $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }
print_info() { echo -e "${BLUE}📍 $1${NC}"; }

# 安装systemd服务（一次性）
install_service() {
    print_info "安装生产环境systemd服务..."
    
    sudo tee /etc/systemd/system/${SERVICE_NAME}.service > /dev/null <<EOF
[Unit]
Description=ShopSite FastAPI Application
After=network.target mysql.service
Wants=mysql.service

[Service]
Type=simple
User=${USER}
Group=${USER}
WorkingDirectory=${PROJECT_DIR}
Environment=PATH=${PATH}
Environment=PYTHONPATH=${PROJECT_DIR}
ExecStart=${PYTHON_PATH} main.py
Restart=always
RestartSec=5
TimeoutStopSec=30

# 日志输出到系统日志
StandardOutput=journal
StandardError=journal
SyslogIdentifier=${SERVICE_NAME}

# 安全设置
NoNewPrivileges=true
ProtectSystem=strict
ReadWritePaths=${PROJECT_DIR}

# 资源限制
LimitNOFILE=65536
MemoryMax=1G

[Install]
WantedBy=multi-user.target
EOF

    sudo systemctl daemon-reload
    sudo systemctl enable ${SERVICE_NAME}
    print_status "systemd服务安装完成"
}

# 检查服务是否已安装
check_service() {
    if [ ! -f "/etc/systemd/system/${SERVICE_NAME}.service" ]; then
        print_warning "systemd服务未安装，正在安装..."
        install_service
    fi
}

# 启动服务
start() {
    check_service
    
    print_info "启动 ${SERVICE_NAME} 服务..."
    sudo systemctl start ${SERVICE_NAME}
    
    sleep 3
    
    if sudo systemctl is-active --quiet ${SERVICE_NAME}; then
        print_status "服务启动成功"
        print_info "访问地址: 你的域名（通过反向代理）"
        print_info "本地访问: http://localhost:8000"
        print_info "查看状态: $0 status"
        print_info "查看日志: $0 logs"
    else
        print_error "服务启动失败"
        sudo systemctl status ${SERVICE_NAME} --no-pager
    fi
}

# 停止服务
stop() {
    print_info "停止 ${SERVICE_NAME} 服务..."
    sudo systemctl stop ${SERVICE_NAME}
    print_status "服务已停止"
}

# 重启服务
restart() {
    print_info "重启 ${SERVICE_NAME} 服务..."
    sudo systemctl restart ${SERVICE_NAME}
    sleep 3
    
    if sudo systemctl is-active --quiet ${SERVICE_NAME}; then
        print_status "服务重启成功"
    else
        print_error "服务重启失败"
        sudo systemctl status ${SERVICE_NAME} --no-pager
    fi
}

# 查看状态
status() {
    echo "📊 ${SERVICE_NAME} 服务状态:"
    sudo systemctl status ${SERVICE_NAME} --no-pager -l
    
    if sudo systemctl is-active --quiet ${SERVICE_NAME}; then
        echo ""
        print_status "服务正在运行"
        print_info "访问地址: 你的域名（通过反向代理）"
        print_info "本地测试: http://localhost:8000/health"
    fi
}

# 查看日志
logs() {
    local lines=${1:-50}
    
    if [ "$1" = "-f" ] || [ "$1" = "follow" ]; then
        print_info "实时日志 (按 Ctrl+C 退出):"
        sudo journalctl -u ${SERVICE_NAME} -f
    else
        print_info "最近 $lines 行日志:"
        sudo journalctl -u ${SERVICE_NAME} -n $lines --no-pager
    fi
}

# 快速部署（更新代码后重启）
deploy() {
    print_info "快速部署..."
    
    # 如果有git，拉取最新代码
    if [ -d ".git" ]; then
        print_info "拉取最新代码..."
        git pull
    fi
    
    # 检查并安装依赖
    if [ -f "requirements.txt" ]; then
        print_info "更新Python依赖..."
        ${PYTHON_PATH} -m pip install -r requirements.txt --quiet
    fi
    
    # 重启服务
    restart
    
    print_status "部署完成"
}

# 显示帮助
help() {
    echo "🚀 ShopSite 生产环境管理脚本"
    echo ""
    echo "用法: $0 {start|stop|restart|status|logs|deploy|help}"
    echo ""
    echo "命令:"
    echo "  start     - 启动服务"
    echo "  stop      - 停止服务"
    echo "  restart   - 重启服务"
    echo "  status    - 查看服务状态"
    echo "  logs      - 查看最近50行日志"
    echo "  logs -f   - 实时查看日志"
    echo "  logs 100  - 查看最近100行日志"
    echo "  deploy    - 快速部署（拉取代码+重启）"
    echo "  help      - 显示此帮助"
    echo ""
    echo "💡 常用操作:"
    echo "  $0 start           # 首次启动"
    echo "  $0 status          # 检查运行状态"
    echo "  $0 logs -f         # 查看实时日志"
    echo "  $0 deploy          # 更新代码并重启"
    echo ""
    echo "📂 服务信息:"
    echo "  服务名: ${SERVICE_NAME}"
    echo "  项目目录: ${PROJECT_DIR}"
    echo "  Python路径: ${PYTHON_PATH}"
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
        if [ "$2" = "-f" ] || [ "$2" = "follow" ]; then
            logs -f
        else
            logs ${2:-50}
        fi
        ;;
    deploy)
        deploy
        ;;
    help|--help|-h)
        help
        ;;
    *)
        echo "🚀 ShopSite 快速启动"
        echo ""
        echo "使用: $0 {start|stop|restart|status|logs|deploy|help}"
        echo ""
        echo "💡 常用命令:"
        echo "  $0 start    # 启动服务"
        echo "  $0 status   # 查看状态"
        echo "  $0 logs -f  # 查看日志"
        echo ""
        echo "使用 '$0 help' 查看完整帮助"
        exit 1
        ;;
esac
