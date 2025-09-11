"""
管理员CRUD操作API路由
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from api.models import get_db, Admin
from api.models.schemas import AdminCreate, AdminUpdate, AdminResponse
from api.utils import get_current_admin, hash_password, get_admin_by_username, get_admin_by_email

router = APIRouter(prefix="/admin/admins", tags=["管理员管理"])

@router.get("/", response_model=List[AdminResponse])
def get_all_admins(
    skip: int = 0,
    limit: int = 50,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """获取所有管理员列表（需要超级用户权限）"""
    if not current_admin.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="权限不足，需要超级用户权限"
        )
    
    admins = db.query(Admin).offset(skip).limit(limit).all()
    return [
        AdminResponse(
            id=admin.id,
            username=admin.username,
            email=admin.email,
            full_name=admin.full_name,
            is_active=admin.is_active,
            is_superuser=admin.is_superuser,
            last_login=admin.last_login,
            created_at=admin.created_at
        ) for admin in admins
    ]

@router.post("/", response_model=AdminResponse)
def create_admin(
    admin_data: AdminCreate,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """创建新管理员（需要超级用户权限）"""
    if not current_admin.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="权限不足，需要超级用户权限"
        )
    
    # 检查用户名是否已存在
    if get_admin_by_username(admin_data.username, db):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="用户名已存在"
        )
    
    # 检查邮箱是否已存在
    if get_admin_by_email(admin_data.email, db):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="邮箱已存在"
        )
    
    # 创建新管理员
    admin = Admin(
        username=admin_data.username,
        email=admin_data.email,
        full_name=admin_data.full_name,
        password_hash=hash_password(admin_data.password),
        is_active=admin_data.is_active if admin_data.is_active is not None else True,
        is_superuser=admin_data.is_superuser if admin_data.is_superuser is not None else False
    )
    
    db.add(admin)
    db.commit()
    db.refresh(admin)
    
    return AdminResponse(
        id=admin.id,
        username=admin.username,
        email=admin.email,
        full_name=admin.full_name,
        is_active=admin.is_active,
        is_superuser=admin.is_superuser,
        last_login=admin.last_login,
        created_at=admin.created_at
    )

@router.get("/{admin_id}", response_model=AdminResponse)
def get_admin(
    admin_id: int,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """获取指定管理员信息（需要超级用户权限或查看自己）"""
    admin = db.query(Admin).filter(Admin.id == admin_id).first()
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="管理员不存在"
        )
    
    # 只允许超级用户或管理员查看自己的信息
    if not current_admin.is_superuser and current_admin.id != admin_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="权限不足"
        )
    
    return AdminResponse(
        id=admin.id,
        username=admin.username,
        email=admin.email,
        full_name=admin.full_name,
        is_active=admin.is_active,
        is_superuser=admin.is_superuser,
        last_login=admin.last_login,
        created_at=admin.created_at
    )

@router.put("/{admin_id}", response_model=AdminResponse)
def update_admin(
    admin_id: int,
    admin_data: AdminUpdate,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """更新管理员信息（需要超级用户权限或修改自己）"""
    admin = db.query(Admin).filter(Admin.id == admin_id).first()
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="管理员不存在"
        )
    
    # 权限检查
    is_self_update = current_admin.id == admin_id
    if not current_admin.is_superuser and not is_self_update:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="权限不足"
        )
    
    # 非超级用户不能修改权限相关字段
    if not current_admin.is_superuser:
        if admin_data.is_active is not None or admin_data.is_superuser is not None:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="权限不足，无法修改权限相关字段"
            )
    
    # 更新字段
    update_data = admin_data.dict(exclude_unset=True)
    
    # 检查用户名重复
    if "username" in update_data:
        existing_admin = get_admin_by_username(update_data["username"], db)
        if existing_admin and existing_admin.id != admin_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="用户名已存在"
            )
    
    # 检查邮箱重复
    if "email" in update_data:
        existing_admin = get_admin_by_email(update_data["email"], db)
        if existing_admin and existing_admin.id != admin_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="邮箱已存在"
            )
    
    # 处理密码更新
    if "password" in update_data:
        update_data["password_hash"] = hash_password(update_data["password"])
        del update_data["password"]
    
    # 应用更新
    for field, value in update_data.items():
        setattr(admin, field, value)
    
    db.commit()
    db.refresh(admin)
    
    return AdminResponse(
        id=admin.id,
        username=admin.username,
        email=admin.email,
        full_name=admin.full_name,
        is_active=admin.is_active,
        is_superuser=admin.is_superuser,
        last_login=admin.last_login,
        created_at=admin.created_at
    )

@router.delete("/{admin_id}")
def delete_admin(
    admin_id: int,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """删除管理员（需要超级用户权限，不能删除自己）"""
    if not current_admin.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="权限不足，需要超级用户权限"
        )
    
    if current_admin.id == admin_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="不能删除自己的账户"
        )
    
    admin = db.query(Admin).filter(Admin.id == admin_id).first()
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="管理员不存在"
        )
    
    db.delete(admin)
    db.commit()
    
    return {"message": "管理员删除成功"}
