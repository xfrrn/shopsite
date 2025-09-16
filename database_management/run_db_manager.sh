#!/bin/bash

echo "========================================"
echo "      数据库管理工具启动器"
echo "========================================"
echo

# 切换到项目根目录
cd "$(dirname "$0")/.."

# 运行数据库管理工具
python3 database_management/db_manager.py

echo
echo "按回车键退出..."
read