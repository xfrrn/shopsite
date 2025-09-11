"""
分类相关API路由
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query, Request, Header
from sqlalchemy.orm import Session
from api.models import get_db, Category
from api.models.schemas import CategoryResponse
from api.utils import get_language_from_request, get_localized_field

router = APIRouter(prefix="/categories", tags=["分类"])

@router.get("/", response_model=List[CategoryResponse])
def get_categories(
    request: Request,
    accept_language: str = Header(None),
    db: Session = Depends(get_db)
):
    """获取分类列表"""
    categories = db.query(Category).filter(
        Category.is_active == True
    ).order_by(Category.sort_order.asc(), Category.id.asc()).all()
    
    # 获取语言设置
    lang = get_language_from_request(request, accept_language)
    
    # 本地化字段
    result = []
    for category in categories:
        category_dict = {
            "id": category.id,
            "name": get_localized_field(category, "name", lang),
            "name_en": category.name_en,
            "name_zh": category.name_zh,
            "description": get_localized_field(category, "description", lang),
            "description_en": category.description_en,
            "icon_url": category.icon_url,
            "sort_order": category.sort_order,
            "is_active": category.is_active,
            "created_at": category.created_at,
            "updated_at": category.updated_at
        }
        result.append(CategoryResponse(**category_dict))
    
    return result

@router.get("/{category_id}", response_model=CategoryResponse)
def get_category(
    category_id: int,
    request: Request,
    accept_language: str = Header(None),
    db: Session = Depends(get_db)
):
    """获取单个分类详情"""
    category = db.query(Category).filter(
        Category.id == category_id,
        Category.is_active == True
    ).first()
    
    if not category:
        raise HTTPException(status_code=404, detail="分类不存在")
    
    # 获取语言设置
    lang = get_language_from_request(request, accept_language)
    
    # 本地化字段
    category_dict = {
        "id": category.id,
        "name": get_localized_field(category, "name", lang),
        "name_en": category.name_en,
        "name_zh": category.name_zh,
        "description": get_localized_field(category, "description", lang),
        "description_en": category.description_en,
        "icon_url": category.icon_url,
        "sort_order": category.sort_order,
        "is_active": category.is_active,
        "created_at": category.created_at,
        "updated_at": category.updated_at
    }
    
    return CategoryResponse(**category_dict)
