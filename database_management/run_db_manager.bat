@echo off
chcp 65001 >nul
echo ========================================
echo      数据库管理工具启动器
echo ========================================
echo.

cd /d "%~dp0.."
python database_management\db_manager.py

echo.
echo 按任意键退出...
pause >nul