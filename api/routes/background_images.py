"""
背景图API路由
提供背景图的CRUD操作和前端展示
"""

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy.orm import Session
from typing import List, Optional

from ..models.database import get_db
from ..models.models import BackgroundImage
from ..models.schemas import (
    BackgroundImageResponse, 
    BackgroundImageListResponse,
    PaginationResponse
)
from ..utils.auth import get_current_admin
from ..utils.helpers import get_localized_field

router = APIRouter()

@router.get("/", response_model=BackgroundImageListResponse)
async def get_background_images(
    request: Request,
    page: int = Query(1, ge=1, description="页码"),
    size: int = Query(20, ge=1, le=100, description="每页数量"),
    is_active: Optional[bool] = Query(None, description="是否启用筛选"),
    db: Session = Depends(get_db)
):
    """
    获取背景图列表
    """
    try:
        # 构建查询
        query = db.query(BackgroundImage)
        
        # 筛选条件
        if is_active is not None:
            query = query.filter(BackgroundImage.is_active == is_active)
            
        # 排序
        query = query.order_by(BackgroundImage.sort_order, BackgroundImage.created_at.desc())
        
        # 计算总数
        total = query.count()
        
        # 分页
        skip = (page - 1) * size
        background_images = query.offset(skip).limit(size).all()
        
        # 本地化处理
        lang = request.headers.get("Accept-Language", "zh-CN")
        
        processed_images = []
        for bg_img in background_images:
            bg_dict = {
                "id": bg_img.id,
                "title": get_localized_field(bg_img, "title", lang),
                "title_en": bg_img.title_en,
                "title_zh": bg_img.title_zh,
                "subtitle": get_localized_field(bg_img, "subtitle", lang),
                "subtitle_en": bg_img.subtitle_en,
                "subtitle_zh": bg_img.subtitle_zh,
                "image_url": bg_img.image_url,
                "button_text": get_localized_field(bg_img, "button_text", lang),
                "button_text_en": bg_img.button_text_en,
                "button_text_zh": bg_img.button_text_zh,
                "button_link": bg_img.button_link,
                "sort_order": bg_img.sort_order,
                "is_active": bg_img.is_active,
                "created_at": bg_img.created_at,
                "updated_at": bg_img.updated_at,
            }
            processed_images.append(BackgroundImageResponse(**bg_dict))
        
        # 计算分页信息
        pages = (total + size - 1) // size
        
        return BackgroundImageListResponse(
            items=processed_images,
            pagination=PaginationResponse(
                total=total,
                page=page,
                size=size,
                pages=pages
            )
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取背景图列表失败: {str(e)}")

@router.get("/{bg_id}", response_model=BackgroundImageResponse)
async def get_background_image(
    bg_id: int,
    request: Request,
    db: Session = Depends(get_db)
):
    """
    获取单个背景图详情
    """
    background_image = db.query(BackgroundImage).filter(BackgroundImage.id == bg_id).first()
    if not background_image:
        raise HTTPException(status_code=404, detail="背景图不存在")
    
    # 本地化处理
    lang = request.headers.get("Accept-Language", "zh-CN")
    
    bg_dict = {
        "id": background_image.id,
        "title": get_localized_field(background_image, "title", lang),
        "title_en": background_image.title_en,
        "title_zh": background_image.title_zh,
        "subtitle": get_localized_field(background_image, "subtitle", lang),
        "subtitle_en": background_image.subtitle_en,
        "subtitle_zh": background_image.subtitle_zh,
        "image_url": background_image.image_url,
        "button_text": get_localized_field(background_image, "button_text", lang),
        "button_text_en": background_image.button_text_en,
        "button_text_zh": background_image.button_text_zh,
        "button_link": background_image.button_link,
        "sort_order": background_image.sort_order,
        "is_active": background_image.is_active,
        "created_at": background_image.created_at,
        "updated_at": background_image.updated_at,
    }
    
    return BackgroundImageResponse(**bg_dict)
