"""
FastAPI主应用程序
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
import uvicorn

# 导入配置
from config.config import Config, CORSConfig, UploadConfig, AppConfig
from api.models.database import engine, Base

# 导入路由
from api.routes.categories import router as categories_router
from api.routes.products import router as products_router
from api.routes.auth import router as auth_router
from api.routes.admin import router as admin_router
from api.routes.admin_categories import router as admin_categories_router
from api.routes.admin_products import router as admin_products_router
from api.routes.upload import router as upload_router
from api.routes.background_images import router as background_images_router
from api.routes.admin_background_images import router as admin_background_images_router
from api.routes.featured_products import router as featured_products_router
from api.routes.admin_featured_products import router as admin_featured_products_router
from api.routes.about_us import router as about_us_router

# 创建配置实例
config = Config()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期管理"""
    # 启动时执行
    # 测试数据库连接
    from config.config import DatabaseConfig
    from sqlalchemy import text
    
    try:
        # 测试数据库连接
        with engine.connect() as connection:
            result = connection.execute(text("SELECT 1"))
            print(f"✅ 数据库连接成功: {DatabaseConfig.DATABASE}")
            print(f"🔗 数据库地址: {DatabaseConfig.HOST}:{DatabaseConfig.PORT}")
    except Exception as e:
        print(f"❌ 数据库连接失败: {str(e)}")
        print(f"⚠️ 请检查数据库配置: config/settings.ini")
    
    # 创建数据库表
    try:
        Base.metadata.create_all(bind=engine)
        print("📊 数据库表初始化完成")
    except Exception as e:
        print(f"❌ 数据库表初始化失败: {str(e)}")
    
    # 确保上传目录存在
    upload_dir = UploadConfig.UPLOAD_PATH
    os.makedirs(upload_dir, exist_ok=True)
    
    print("🚀 应用启动完成")
    print(f"📁 上传目录: {upload_dir}")
    print(f"🌐 API文档: http://localhost:8000/api/docs")
    
    yield
    
    # 关闭时执行（如果需要清理资源）
    print("👋 应用关闭")

# 自定义静态文件类，禁用缓存
class NoCacheStaticFiles(StaticFiles):
    def file_response(self, *args, **kwargs):
        response = super().file_response(*args, **kwargs)
        response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
        response.headers["Pragma"] = "no-cache" 
        response.headers["Expires"] = "0"
        return response

# 创建FastAPI应用
app = FastAPI(
    title="产品展示网站API",
    description="一个完整的产品展示网站API系统",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json"
)

# 配置CORS
cors_config = CORSConfig()
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_config.ALLOW_ORIGINS,
    allow_credentials=cors_config.ALLOW_CREDENTIALS,
    allow_methods=cors_config.ALLOW_METHODS,
    allow_headers=cors_config.ALLOW_HEADERS,
)

# 注册API路由
app.include_router(categories_router, prefix="/api")
app.include_router(products_router, prefix="/api")
app.include_router(auth_router, prefix="/api")
app.include_router(admin_router, prefix="/api")
app.include_router(admin_categories_router, prefix="/api")
app.include_router(admin_products_router, prefix="/api")
app.include_router(upload_router, prefix="/api")
app.include_router(background_images_router, prefix="/api/background-images", tags=["background-images"])
app.include_router(admin_background_images_router, prefix="/api/admin/background-images", tags=["admin-background-images"])
app.include_router(featured_products_router, prefix="/api")
app.include_router(admin_featured_products_router, prefix="/api")
app.include_router(about_us_router, prefix="/api")

# 静态文件服务
upload_dir = UploadConfig.UPLOAD_PATH
if os.path.exists(upload_dir):
    app.mount("/uploads", StaticFiles(directory=upload_dir), name="uploads")

# 前端静态文件服务 - 禁用缓存
web_dir = os.path.join(os.path.dirname(__file__), "web")
if os.path.exists(web_dir):
    app.mount("/", NoCacheStaticFiles(directory=web_dir, html=True), name="web")

# 全局异常处理
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """全局异常处理器"""
    return JSONResponse(
        status_code=500,
        content={
            "detail": "服务器内部错误",
            "error": str(exc) if config.get_debug() else "Internal Server Error"
        }
    )

# 健康检查端点
@app.get("/health")
async def health_check():
    """健康检查"""
    return {
        "status": "healthy",
        "message": "API服务运行正常",
        "version": "1.0.0"
    }

@app.get("/api/health")
async def api_health_check():
    """API健康检查"""
    try:
        # 测试数据库连接
        from sqlalchemy import text
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        
        return {
            "status": "healthy",
            "api": "OK",
            "database": "OK",
            "message": "所有服务运行正常",
            "timestamp": "2025-09-11T00:00:00Z"
        }
    except Exception as e:
        return JSONResponse(
            status_code=503,
            content={
                "status": "unhealthy",
                "api": "OK",
                "database": "ERROR",
                "message": f"数据库连接失败: {str(e)}",
                "timestamp": "2025-09-11T00:00:00Z"
            }
        )

# 运行应用
if __name__ == "__main__":
    app_config = AppConfig()
    uvicorn.run(
        "main:app",
        host=app_config.HOST,
        port=app_config.PORT,
        reload=app_config.DEBUG,
        log_level="info"
    )
