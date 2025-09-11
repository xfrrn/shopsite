#!/bin/bash

# SystemD 服务安装脚本
# 将ShopSite安装为系统服务，开机自启，后台运行

SERVICE_NAME="shopsite"
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
PYTHON_PATH=$(which python3)
USER=$(whoami)
GROUP=$(id -gn)

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

# 检查是否有sudo权限
check_sudo() {
    if [ "$EUID" -ne 0 ]; then
        print_error "此脚本需要sudo权限来创建系统服务"
        echo "请使用: sudo $0"
        exit 1
    fi
}

# 检查环境
check_environment() {
    print_info "检查运行环境..."
    
    # 检查Python
    if [ ! -f "$PYTHON_PATH" ]; then
        print_error "Python3 未找到，请确保已安装Python3"
        exit 1
    fi
    
    # 检查项目文件
    if [ ! -f "$PROJECT_DIR/main.py" ]; then
        print_error "main.py 文件未找到，请确保在正确的项目目录中运行"
        exit 1
    fi
    
    # 检查配置文件
    if [ ! -f "$PROJECT_DIR/config/settings.ini" ]; then
        print_error "配置文件不存在: $PROJECT_DIR/config/settings.ini"
        exit 1
    fi
    
    print_status "环境检查通过"
}

# 创建服务文件
create_service() {
    print_info "创建SystemD服务文件..."
    
    # 创建服务文件内容
    cat > "/etc/systemd/system/${SERVICE_NAME}.service" << EOF
[Unit]
Description=ShopSite FastAPI Web Application
Documentation=https://github.com/xfrrn/shopsite
After=network.target mysql.service
Wants=network.target

[Service]
Type=simple
User=${USER}
Group=${GROUP}
WorkingDirectory=${PROJECT_DIR}
Environment=PATH=${PATH}
Environment=PYTHONPATH=${PROJECT_DIR}
Environment=PYTHONUNBUFFERED=1
ExecStartPre=/bin/sleep 10
ExecStart=${PYTHON_PATH} main.py
ExecReload=/bin/kill -HUP \$MAINPID
KillMode=mixed
Restart=always
RestartSec=10
TimeoutStopSec=30

# 安全设置
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ReadWritePaths=${PROJECT_DIR}
ReadWritePaths=/tmp

# 日志设置
StandardOutput=journal
StandardError=journal
SyslogIdentifier=${SERVICE_NAME}

[Install]
WantedBy=multi-user.target
EOF

    print_status "服务文件已创建: /etc/systemd/system/${SERVICE_NAME}.service"
}

# 设置权限
set_permissions() {
    print_info "设置文件权限..."
    
    # 确保项目目录权限正确
    chown -R ${USER}:${GROUP} "$PROJECT_DIR"
    
    # 确保日志目录可写
    mkdir -p "$PROJECT_DIR/logs"
    chown ${USER}:${GROUP} "$PROJECT_DIR/logs"
    
    print_status "权限设置完成"
}

# 安装和启动服务
install_service() {
    print_info "安装并配置服务..."
    
    # 重新加载systemd配置
    systemctl daemon-reload
    
    # 启用服务（开机自启）
    systemctl enable ${SERVICE_NAME}
    
    # 启动服务
    systemctl start ${SERVICE_NAME}
    
    # 等待服务启动
    sleep 5
    
    # 检查服务状态
    if systemctl is-active --quiet ${SERVICE_NAME}; then
        print_status "服务安装并启动成功"
    else
        print_error "服务启动失败"
        systemctl status ${SERVICE_NAME}
        return 1
    fi
}

# 显示服务信息
show_service_info() {
    echo ""
    echo "🎉 ShopSite 系统服务安装完成！"
    echo ""
    echo "📋 服务信息:"
    echo "   服务名称: ${SERVICE_NAME}"
    echo "   项目目录: ${PROJECT_DIR}"
    echo "   运行用户: ${USER}"
    echo "   Python路径: ${PYTHON_PATH}"
    echo ""
    echo "🔧 服务管理命令:"
    echo "   sudo systemctl start ${SERVICE_NAME}     # 启动服务"
    echo "   sudo systemctl stop ${SERVICE_NAME}      # 停止服务"
    echo "   sudo systemctl restart ${SERVICE_NAME}   # 重启服务"
    echo "   sudo systemctl status ${SERVICE_NAME}    # 查看状态"
    echo "   sudo systemctl enable ${SERVICE_NAME}    # 开机自启"
    echo "   sudo systemctl disable ${SERVICE_NAME}   # 取消自启"
    echo ""
    echo "📝 日志管理命令:"
    echo "   sudo journalctl -u ${SERVICE_NAME}       # 查看所有日志"
    echo "   sudo journalctl -u ${SERVICE_NAME} -f    # 实时查看日志"
    echo "   sudo journalctl -u ${SERVICE_NAME} --since today  # 查看今天日志"
    echo ""
    echo "🌐 访问地址:"
    echo "   主页面: http://localhost:8000/web/index.html"
    echo "   管理后台: http://localhost:8000/web/admin.html"
    echo "   API文档: http://localhost:8000/docs"
    echo ""
    echo "⚡ 特性:"
    echo "   ✅ 开机自动启动"
    echo "   ✅ 自动重启（异常退出时）"
    echo "   ✅ 后台运行（关闭终端不影响）"
    echo "   ✅ 系统集成（systemctl管理）"
    echo "   ✅ 日志管理（journalctl查看）"
}

# 卸载服务
uninstall_service() {
    print_info "卸载ShopSite系统服务..."
    
    # 停止服务
    systemctl stop ${SERVICE_NAME} 2>/dev/null || true
    
    # 禁用服务
    systemctl disable ${SERVICE_NAME} 2>/dev/null || true
    
    # 删除服务文件
    rm -f "/etc/systemd/system/${SERVICE_NAME}.service"
    
    # 重新加载systemd配置
    systemctl daemon-reload
    
    print_status "服务已卸载"
}

# 显示帮助信息
show_help() {
    echo "ShopSite SystemD 服务安装脚本"
    echo ""
    echo "用法: sudo $0 [install|uninstall|help]"
    echo ""
    echo "命令:"
    echo "  install    - 安装系统服务（默认）"
    echo "  uninstall  - 卸载系统服务"
    echo "  help       - 显示帮助信息"
    echo ""
    echo "说明:"
    echo "  此脚本会将ShopSite安装为系统服务，具有以下特性："
    echo "  - 开机自动启动"
    echo "  - 异常退出时自动重启"
    echo "  - 后台运行，关闭终端不影响"
    echo "  - 使用systemctl命令管理"
    echo "  - 集成系统日志"
    echo ""
    echo "注意:"
    echo "  - 需要sudo权限"
    echo "  - 需要在项目根目录中运行"
    echo "  - 确保已正确配置数据库连接"
}

# 主程序
main() {
    case "$1" in
        install|"")
            check_sudo
            check_environment
            create_service
            set_permissions
            install_service
            show_service_info
            ;;
        uninstall)
            check_sudo
            uninstall_service
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            print_error "未知命令: $1"
            show_help
            exit 1
            ;;
    esac
}

# 运行主程序
main "$@"
