@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ==========================================
echo 🚀 商品展示网站 - 多线程一键启动脚本
echo ==========================================
echo.

:: 检查Python是否可用
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python 未安装或不在PATH中
    echo 请安装Python 3.8+
    pause
    exit /b 1
)

:: 检查配置文件
if not exist "config\settings.ini" (
    echo ❌ 配置文件不存在: config\settings.ini
    echo 请先配置数据库连接信息
    pause
    exit /b 1
)

echo 📦 检查依赖包...
pip install --quiet fastapi uvicorn sqlalchemy pymysql python-jose[cryptography] python-multipart
if errorlevel 1 (
    echo ⚠️ 部分依赖安装可能失败，继续启动...
) else (
    echo ✅ 依赖检查完成
)

echo.
echo 💾 测试数据库连接...
python -c "from api.models.database import engine; from sqlalchemy import text; engine.connect().execute(text('SELECT 1')); print('✅ 数据库连接正常')" 2>nul
if errorlevel 1 (
    echo ⚠️ 数据库连接失败，尝试初始化...
    python initialize_db.py
    if errorlevel 1 (
        echo ❌ 数据库初始化失败
        echo 请检查数据库配置和连接
        pause
        exit /b 1
    )
    echo ✅ 数据库初始化完成
)

echo.
echo 🎯 启动多线程服务...
echo ==========================================
echo.
echo 📍 服务访问地址:
echo    🌐 主页面: http://localhost:8000/web/index.html
echo    ⚙️  管理后台: http://localhost:8000/web/admin.html
echo    📚 API文档: http://localhost:8000/docs
echo    🔧 管理员工具: python admin_manager.py
echo.
echo 💡 提示:
echo    - 服务将在多个线程中并行运行
echo    - 按 Ctrl+C 停止所有服务
echo    - 实时查看服务日志
echo.
echo ==========================================

:: 启动多线程Python脚本
python multi_start.py

echo.
echo 👋 所有服务已停止
echo 感谢使用商品展示网站！
pause
