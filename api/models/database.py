"""
数据库基础配置
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from config.config import DatabaseConfig

# 创建数据库引擎
engine = create_engine(
    DatabaseConfig.get_url(),
    pool_size=10,
    max_overflow=20,
    pool_timeout=30,
    pool_recycle=3600,
    echo=False
)

# 创建会话工厂
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 创建基础模型类
Base = declarative_base()

def get_db():
    """获取数据库会话"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """初始化数据库"""
    Base.metadata.create_all(bind=engine)
