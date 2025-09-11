"""
配置管理模块
读取和管理应用配置
"""

import os
import configparser
from typing import List, Optional
from pathlib import Path

class Config:
    def __init__(self, config_file: str = None):
        self.config = configparser.ConfigParser()
        
        # 默认配置文件路径
        if config_file is None:
            config_file = Path(__file__).parent.parent / "config" / "settings.ini"
        
        self.config_file = config_file
        self.load_config()
    
    def load_config(self):
        """加载配置文件"""
        if os.path.exists(self.config_file):
            self.config.read(self.config_file, encoding='utf-8')
        else:
            raise FileNotFoundError(f"配置文件不存在: {self.config_file}")
    
    def get(self, section: str, key: str, fallback=None):
        """获取配置值，支持环境变量覆盖"""
        # 首先检查环境变量
        env_key = f"{section.upper()}_{key.upper()}"
        env_value = os.getenv(env_key)
        
        if env_value is not None:
            return env_value
        
        # 然后检查配置文件
        return self.config.get(section, key, fallback=fallback)
    
    def getint(self, section: str, key: str, fallback=None):
        """获取整数配置值"""
        value = self.get(section, key, fallback)
        return int(value) if value is not None else fallback
    
    def getboolean(self, section: str, key: str, fallback=None):
        """获取布尔配置值"""
        value = self.get(section, key, fallback)
        if isinstance(value, str):
            return value.lower() in ('true', '1', 'yes', 'on')
        return bool(value) if value is not None else fallback
    
    def getlist(self, section: str, key: str, fallback=None):
        """获取列表配置值"""
        value = self.get(section, key, fallback)
        if isinstance(value, str):
            # 处理类似 ["item1", "item2"] 的字符串
            import ast
            try:
                return ast.literal_eval(value)
            except (ValueError, SyntaxError):
                # 如果不是列表格式，按逗号分割
                return [item.strip() for item in value.split(',')]
        return value if value is not None else (fallback or [])
    
    def get_debug(self):
        """获取调试模式"""
        return self.getboolean('app', 'debug', False)
    
    @property
    def debug(self):
        """调试模式属性"""
        return self.get_debug()

# 全局配置实例
config = Config()

# 数据库配置
class DatabaseConfig:
    HOST = config.get('database', 'host', 'localhost')
    PORT = config.getint('database', 'port', 3306)
    USERNAME = config.get('database', 'username', 'root')
    PASSWORD = config.get('database', 'password', 'password')
    DATABASE = config.get('database', 'database', 'fanxi_shop')
    CHARSET = config.get('database', 'charset', 'utf8mb4')
    
    @classmethod
    def get_url(cls) -> str:
        """获取数据库连接URL"""
        return f"mysql+pymysql://{cls.USERNAME}:{cls.PASSWORD}@{cls.HOST}:{cls.PORT}/{cls.DATABASE}?charset={cls.CHARSET}"

# 应用配置
class AppConfig:
    TITLE = config.get('app', 'title', 'FANXI 产品展示网站')
    VERSION = config.get('app', 'version', '1.0.0')
    DEBUG = config.getboolean('app', 'debug', False)
    HOST = config.get('app', 'host', '0.0.0.0')
    PORT = config.getint('app', 'port', 8000)

# JWT配置
class JWTConfig:
    SECRET_KEY = config.get('jwt', 'secret_key', 'your-secret-key-change-this-in-production')
    ALGORITHM = config.get('jwt', 'algorithm', 'HS256')
    ACCESS_TOKEN_EXPIRE_MINUTES = config.getint('jwt', 'access_token_expire_minutes', 30)

# 管理员配置
class AdminConfig:
    USERNAME = config.get('admin', 'username', 'admin')
    PASSWORD = config.get('admin', 'password', 'admin123')
    EMAIL = config.get('admin', 'email', 'admin@example.com')

# CORS配置
class CORSConfig:
    ALLOW_ORIGINS = config.getlist('cors', 'allow_origins', ["*"])
    ALLOW_CREDENTIALS = config.getboolean('cors', 'allow_credentials', True)
    ALLOW_METHODS = config.getlist('cors', 'allow_methods', ["*"])
    ALLOW_HEADERS = config.getlist('cors', 'allow_headers', ["*"])

# 文件上传配置
class UploadConfig:
    MAX_FILE_SIZE = config.getint('upload', 'max_file_size', 5242880)  # 5MB
    ALLOWED_EXTENSIONS = config.getlist('upload', 'allowed_extensions', ['.jpg', '.jpeg', '.png', '.gif', '.webp'])
    UPLOAD_PATH = config.get('upload', 'upload_path', './uploads')
