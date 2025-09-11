#!/bin/bash

# 管理员账号管理脚本启动器
# Usage: ./admin_tools.sh [option]

echo "==================================="
echo "    商品展示网站 - 管理员工具"
echo "==================================="

case "$1" in
    "init"|"初始化")
        echo "🚀 正在创建默认管理员账号..."
        python3 create_default_admin.py
        ;;
    "manage"|"管理")
        echo "🔧 启动管理员账号管理工具..."
        python3 admin_manager.py
        ;;
    "list"|"列表")
        echo "👥 查看所有管理员账号..."
        python3 admin_manager.py --list
        ;;
    "help"|"帮助")
        echo "使用方法："
        echo "  ./admin_tools.sh init     - 创建默认管理员 (admin/admin123)"
        echo "  ./admin_tools.sh manage   - 启动交互式管理工具"
        echo "  ./admin_tools.sh list     - 查看所有管理员"
        echo "  ./admin_tools.sh help     - 显示此帮助信息"
        echo ""
        echo "或者直接使用 Python 脚本："
        echo "  python3 create_default_admin.py"
        echo "  python3 admin_manager.py"
        ;;
    *)
        echo "请选择操作："
        echo "1. 创建默认管理员账号"
        echo "2. 管理员账号管理"
        echo "3. 查看管理员列表"
        echo "4. 显示帮助信息"
        echo ""
        read -p "请输入选项 (1-4): " choice
        
        case $choice in
            1)
                echo "🚀 正在创建默认管理员账号..."
                python3 create_default_admin.py
                ;;
            2)
                echo "🔧 启动管理员账号管理工具..."
                python3 admin_manager.py
                ;;
            3)
                echo "👥 查看所有管理员账号..."
                python3 admin_manager.py --list
                ;;
            4)
                echo "查看详细文档: cat ADMIN_TOOLS.md"
                ;;
            *)
                echo "❌ 无效选项"
                ;;
        esac
        ;;
esac
