#!/bin/bash

echo "========================================"
echo "      快速数据库初始化"
echo "========================================"
echo

# 切换到项目根目录
cd "$(dirname "$0")/.."

echo "[1/3] 正在初始化数据库表结构..."
python3 database_management/initialize_db.py
if [ $? -ne 0 ]; then
    echo "错误: 数据库初始化失败"
    exit 1
fi

echo
echo "[2/3] 正在初始化特色产品数据..."
python3 database_management/init_featured_products.py
if [ $? -ne 0 ]; then
    echo "错误: 特色产品初始化失败"
    exit 1
fi

echo
echo "[3/3] 正在创建默认管理员账户..."
python3 database_management/create_default_admin.py
if [ $? -ne 0 ]; then
    echo "错误: 管理员账户创建失败"
    exit 1
fi

echo
echo "========================================"
echo "      初始化完成!"
echo "========================================"
echo
echo "您现在可以启动应用程序了"
echo
echo "按回车键退出..."
read