"""
认证和授权相关工具
"""

from jose import jwt, JWTError, ExpiredSignatureError
from datetime import datetime, timedelta
import hashlib
import hmac
from fastapi import HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from config.config import JWTConfig, AdminConfig
from api.models import get_db, Admin

# JWT Bearer Token
security = HTTPBearer()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """验证密码"""
    try:
        # 尝试使用简单的哈希比较
        return get_password_hash(plain_password) == hashed_password
    except Exception:
        # 如果哈希失败，尝试直接比较（仅用于开发环境）
        return plain_password == hashed_password

def get_password_hash(password: str) -> str:
    """获取密码哈希"""
    # 使用SHA256作为简单的哈希方式
    return hashlib.sha256(password.encode('utf-8')).hexdigest()

def hash_password(password: str) -> str:
    """密码哈希 - 别名函数"""
    return get_password_hash(password)

def create_access_token(data: dict, expires_delta: timedelta = None) -> str:
    """创建访问令牌"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=JWTConfig.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWTConfig.SECRET_KEY, algorithm=JWTConfig.ALGORITHM)
    return encoded_jwt

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """验证令牌"""
    try:
        payload = jwt.decode(
            credentials.credentials, 
            JWTConfig.SECRET_KEY, 
            algorithms=[JWTConfig.ALGORITHM]
        )
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="无效的认证凭据",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return payload
    except ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="令牌已过期",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="无效的认证凭据",
            headers={"WWW-Authenticate": "Bearer"},
        )

def get_current_admin(
    token_data: dict = Depends(verify_token),
    db: Session = Depends(get_db)
) -> Admin:
    """获取当前管理员"""
    username = token_data.get("sub")
    admin = db.query(Admin).filter(Admin.username == username).first()
    if admin is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="管理员不存在"
        )
    if not admin.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="管理员账户已被禁用"
        )
    return admin

def authenticate_admin(username: str, password: str, db: Session) -> Admin:
    """认证管理员"""
    # 如果是默认管理员账户
    if username == AdminConfig.USERNAME and password == AdminConfig.PASSWORD:
        # 查找或创建默认管理员
        admin = db.query(Admin).filter(Admin.username == username).first()
        if not admin:
            admin = Admin(
                username=username,
                password_hash=get_password_hash(password),
                is_superuser=True,
                is_active=True
            )
            db.add(admin)
            db.commit()
            db.refresh(admin)
        return admin
    
    # 查找数据库中的管理员
    admin = db.query(Admin).filter(Admin.username == username).first()
    if not admin:
        return None
    
    if not verify_password(password, admin.password_hash):
        return None
    
    return admin

def get_admin_by_username(username: str, db: Session) -> Admin:
    """根据用户名获取管理员"""
    return db.query(Admin).filter(Admin.username == username).first()

def get_admin_by_email(email: str, db: Session) -> Admin:
    """根据邮箱获取管理员"""
    return db.query(Admin).filter(Admin.email == email).first()
