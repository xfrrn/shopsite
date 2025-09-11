"""
管理员分类管理API路由
"""

import os
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, Form
from sqlalchemy.orm import Session
from api.models import get_db, Admin, Category
from api.models.schemas import CategoryCreate, CategoryUpdate, CategoryResponse
from api.utils.auth import verify_token

router = APIRouter(prefix="/admin/categories", tags=["管理员分类管理"])

@router.get("/", response_model=List[CategoryResponse])
def get_all_categories(
    skip: int = 0,
    limit: int = 100,
    current_admin = Depends(verify_token),
    db: Session = Depends(get_db)
):
    """获取所有分类列表（包括非活跃）"""
    categories = db.query(Category).offset(skip).limit(limit).all()
    return [
        CategoryResponse(
            id=category.id,
            name=category.name,
            name_en=category.name_en,
            name_zh=category.name_zh,
            description=category.description,
            description_en=category.description_en,
            icon_url=category.icon_url,
            sort_order=category.sort_order,
            is_active=category.is_active,
            created_at=category.created_at,
            updated_at=category.updated_at
        ) for category in categories
    ]

@router.get("/{category_id}", response_model=CategoryResponse)
def get_category(
    category_id: int,
    current_admin = Depends(verify_token),
    db: Session = Depends(get_db)
):
    """获取单个分类详情"""
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="分类不存在"
        )
    
    return CategoryResponse(
        id=category.id,
        name=category.name,
        name_en=category.name_en,
        name_zh=category.name_zh,
        description=category.description,
        description_en=category.description_en,
        icon_url=category.icon_url,
        sort_order=category.sort_order,
        is_active=category.is_active,
        created_at=category.created_at,
        updated_at=category.updated_at
    )

@router.post("/", response_model=CategoryResponse)
def create_category(
    category: CategoryCreate,
    current_admin = Depends(verify_token),
    db: Session = Depends(get_db)
):
    """创建新分类"""
    try:
        # 创建新分类
        db_category = Category(
            name=category.name,
            name_en=category.name_en,
            name_zh=category.name_zh or category.name,  # 默认使用中文名称
            description=category.description,
            description_en=category.description_en,
            sort_order=category.sort_order,
            is_active=category.is_active if category.is_active is not None else True,
            icon_url=category.icon_url
        )
        
        db.add(db_category)
        db.commit()
        db.refresh(db_category)
        
        return CategoryResponse(
            id=db_category.id,
            name=db_category.name,
            name_en=db_category.name_en,
            name_zh=db_category.name_zh,
            description=db_category.description,
            description_en=db_category.description_en,
            sort_order=db_category.sort_order,
            is_active=db_category.is_active,
            icon_url=db_category.icon_url,
            created_at=db_category.created_at,
            updated_at=db_category.updated_at
        )
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"创建分类失败: {str(e)}"
        )

@router.put("/{category_id}", response_model=CategoryResponse)
def update_category(
    category_id: int,
    category_update: CategoryUpdate,
    current_admin = Depends(verify_token),
    db: Session = Depends(get_db)
):
    """更新分类信息"""
    try:
        # 查找分类
        db_category = db.query(Category).filter(Category.id == category_id).first()
        if not db_category:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="分类不存在"
            )
        
        # 更新字段
        update_data = category_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_category, field, value)
        
        # 如果更新了name但没有name_zh，则自动设置name_zh
        if 'name' in update_data and 'name_zh' not in update_data:
            db_category.name_zh = update_data['name']
        
        db.commit()
        db.refresh(db_category)
        
        return CategoryResponse(
            id=db_category.id,
            name=db_category.name,
            name_en=db_category.name_en,
            name_zh=db_category.name_zh,
            description=db_category.description,
            description_en=db_category.description_en,
            sort_order=db_category.sort_order,
            is_active=db_category.is_active,
            icon_url=db_category.icon_url,
            created_at=db_category.created_at,
            updated_at=db_category.updated_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"更新分类失败: {str(e)}"
        )

@router.patch("/{category_id}/toggle-status")
def toggle_category_status(
    category_id: int,
    current_admin = Depends(verify_token),
    db: Session = Depends(get_db)
):
    """切换分类启用状态"""
    try:
        # 查找分类
        db_category = db.query(Category).filter(Category.id == category_id).first()
        if not db_category:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="分类不存在"
            )
        
        # 切换状态
        db_category.is_active = not db_category.is_active
        db.commit()
        db.refresh(db_category)
        
        return {
            "message": f"分类已{'启用' if db_category.is_active else '禁用'}",
            "is_active": db_category.is_active
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"更新状态失败: {str(e)}"
        )

@router.delete("/{category_id}")
def delete_category(
    category_id: int,
    current_admin = Depends(verify_token),
    db: Session = Depends(get_db)
):
    """删除分类"""
    try:
        # 查找分类
        db_category = db.query(Category).filter(Category.id == category_id).first()
        if not db_category:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="分类不存在"
            )
        
        # 检查是否有产品使用该分类
        from api.models import Product
        product_count = db.query(Product).filter(Product.category_id == category_id).count()
        if product_count > 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"无法删除分类，还有 {product_count} 个产品使用该分类"
            )
        
        # 删除分类
        db.delete(db_category)
        db.commit()
        
        return {"message": "分类已删除"}
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"删除分类失败: {str(e)}"
        )
