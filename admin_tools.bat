@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ===================================
echo     商品展示网站 - 管理员工具
echo ===================================

if "%1"=="init" goto init
if "%1"=="manage" goto manage
if "%1"=="list" goto list
if "%1"=="help" goto help
if not "%1"=="" goto invalid

:menu
echo 请选择操作：
echo 1. 创建默认管理员账号
echo 2. 管理员账号管理
echo 3. 查看管理员列表
echo 4. 显示帮助信息
echo.
set /p choice=请输入选项 (1-4): 

if "%choice%"=="1" goto init
if "%choice%"=="2" goto manage
if "%choice%"=="3" goto list
if "%choice%"=="4" goto help
goto invalid

:init
echo 🚀 正在创建默认管理员账号...
python create_default_admin.py
goto end

:manage
echo 🔧 启动管理员账号管理工具...
python admin_manager.py
goto end

:list
echo 👥 查看所有管理员账号...
python admin_manager.py --list
goto end

:help
echo 使用方法：
echo   admin_tools.bat init     - 创建默认管理员 (admin/admin123)
echo   admin_tools.bat manage   - 启动交互式管理工具
echo   admin_tools.bat list     - 查看所有管理员
echo   admin_tools.bat help     - 显示此帮助信息
echo.
echo 或者直接使用 Python 脚本：
echo   python create_default_admin.py
echo   python admin_manager.py
echo.
echo 查看详细文档: type ADMIN_TOOLS.md
goto end

:invalid
echo ❌ 无效选项
goto end

:end
pause
