@echo off
echo 🚀 产品展示网站 - 性能优化启动脚本
echo.

echo 📦 检查依赖...
pip install --quiet pymysql fastapi uvicorn python-jose[cryptography] python-multipart

echo 🔧 检查配置...
if not exist "config\settings.ini" (
    echo ❌ 配置文件不存在，请检查 config\settings.ini
    pause
    exit /b 1
)

echo 💾 检查数据库...
python -c "from api.models.database import engine; print('数据库连接测试:', 'OK' if engine else 'Failed')" 2>nul
if errorlevel 1 (
    echo ⚠️  数据库连接失败，尝试初始化...
    python initialize_db.py
)

echo 🎯 启动服务器...
echo.
echo 📍 访问地址:
echo    主页面: http://localhost:8000/web/index.html
echo    管理后台: http://localhost:8000/web/admin.html
echo    API文档: http://localhost:8000/docs
echo.
echo 💡 提示: 按 Ctrl+C 停止服务器
echo.

python main.py

echo.
echo 👋 服务器已停止
pause
