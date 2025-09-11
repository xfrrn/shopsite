"""
管理员相关API路由
"""

from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from api.models import get_db, Admin
from api.models.schemas import AdminLogin, TokenResponse, AdminResponse
from api.utils import authenticate_admin, create_access_token, get_current_admin
from config.config import JWTConfig

router = APIRouter(prefix="/admin", tags=["管理员"])

@router.post("/login", response_model=TokenResponse)
def admin_login(login_data: AdminLogin, db: Session = Depends(get_db)):
    """管理员登录"""
    admin = authenticate_admin(login_data.username, login_data.password, db)
    
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户名或密码错误",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # 更新最后登录时间
    from datetime import datetime
    admin.last_login = datetime.utcnow()
    db.commit()
    
    # 创建访问令牌
    access_token_expires = timedelta(minutes=JWTConfig.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": admin.username, "admin_id": admin.id},
        expires_delta=access_token_expires
    )
    
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        expires_in=JWTConfig.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )

@router.get("/me", response_model=AdminResponse)
def get_current_admin_info(current_admin: Admin = Depends(get_current_admin)):
    """获取当前管理员信息"""
    return AdminResponse(
        id=current_admin.id,
        username=current_admin.username,
        email=current_admin.email,
        full_name=current_admin.full_name,
        is_active=current_admin.is_active,
        is_superuser=current_admin.is_superuser,
        last_login=current_admin.last_login,
        created_at=current_admin.created_at
    )

@router.post("/logout")
def admin_logout(current_admin: Admin = Depends(get_current_admin)):
    """管理员登出"""
    return {"message": "登出成功"}
