#!/bin/bash

# 商品展示网站 - 多线程一键启动脚本
# 支持Linux/Unix系统

set -e  # 遇到错误时退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 函数定义
print_header() {
    echo -e "${CYAN}==========================================${NC}"
    echo -e "${CYAN}🚀 商品展示网站 - 多线程一键启动脚本${NC}"
    echo -e "${CYAN}==========================================${NC}"
    echo
}

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

check_python() {
    echo "🐍 检查Python环境..."
    
    if ! command -v python3 &> /dev/null; then
        print_error "Python3 未安装或不在PATH中"
        echo "请安装Python 3.8+"
        exit 1
    fi
    
    python_version=$(python3 --version 2>&1 | awk '{print $2}')
    print_status "Python版本: $python_version"
}

check_config() {
    echo "🔧 检查配置文件..."
    
    if [ ! -f "config/settings.ini" ]; then
        print_error "配置文件不存在: config/settings.ini"
        echo "请先配置数据库连接信息"
        exit 1
    fi
    
    print_status "配置文件检查通过"
}

install_dependencies() {
    echo "📦 检查并安装依赖包..."
    
    # 检查pip是否可用
    if ! command -v pip3 &> /dev/null; then
        print_warning "pip3 不可用，尝试使用python3 -m pip"
        PIP_CMD="python3 -m pip"
    else
        PIP_CMD="pip3"
    fi
    
    # 安装依赖
    $PIP_CMD install --quiet fastapi uvicorn sqlalchemy pymysql \
        python-jose[cryptography] python-multipart 2>/dev/null || {
        print_warning "部分依赖安装可能失败，继续启动..."
    }
    
    print_status "依赖检查完成"
}

test_database() {
    echo "💾 测试数据库连接..."
    
    python3 -c "
from api.models.database import engine
from sqlalchemy import text
try:
    with engine.connect() as conn:
        conn.execute(text('SELECT 1'))
    print('✅ 数据库连接正常')
except Exception as e:
    print(f'❌ 数据库连接失败: {e}')
    exit(1)
" 2>/dev/null || {
        print_warning "数据库连接失败，尝试初始化..."
        
        if python3 initialize_db.py; then
            print_status "数据库初始化完成"
        else
            print_error "数据库初始化失败"
            echo "请检查数据库配置和连接"
            exit 1
        fi
    }
}

show_service_info() {
    echo
    echo -e "${CYAN}🎯 启动多线程服务...${NC}"
    echo -e "${CYAN}==========================================${NC}"
    echo
    print_info "服务访问地址:"
    echo "   🌐 主页面: http://localhost:8000/web/index.html"
    echo "   ⚙️  管理后台: http://localhost:8000/web/admin.html"
    echo "   📚 API文档: http://localhost:8000/docs"
    echo "   🔧 管理员工具: python3 admin_manager.py"
    echo
    print_info "提示:"
    echo "   - 服务将在多个线程中并行运行"
    echo "   - 按 Ctrl+C 停止所有服务"
    echo "   - 实时查看服务日志"
    echo
    echo -e "${CYAN}==========================================${NC}"
}

cleanup() {
    echo
    print_info "正在清理资源..."
    # 杀死所有子进程
    jobs -p | xargs -r kill 2>/dev/null || true
    print_status "清理完成"
}

# 设置陷阱来处理退出信号
trap cleanup EXIT INT TERM

main() {
    # 切换到脚本所在目录
    cd "$(dirname "$0")"
    
    print_header
    
    # 环境检查
    check_python
    check_config
    install_dependencies
    test_database
    
    # 显示服务信息
    show_service_info
    
    # 启动多线程Python脚本
    python3 multi_start.py
    
    echo
    print_status "所有服务已停止"
    echo "感谢使用商品展示网站！"
}

# 检查是否直接运行此脚本
if [ "${BASH_SOURCE[0]}" == "${0}" ]; then
    main "$@"
fi
