"""
管理员背景图管理API路由
提供背景图的增删改查功能
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from ..models.database import get_db
from ..models.models import BackgroundImage, Admin
from ..models.schemas import (
    BackgroundImageCreate, 
    BackgroundImageUpdate, 
    BackgroundImageResponse, 
    BackgroundImageListResponse,
    PaginationResponse,
    BaseResponse
)
from ..utils.auth import get_current_admin

router = APIRouter()

@router.get("/", response_model=BackgroundImageListResponse)
async def get_admin_background_images(
    page: int = Query(1, ge=1, description="页码"),
    size: int = Query(20, ge=1, le=100, description="每页数量"),
    is_active: Optional[bool] = Query(None, description="是否启用筛选"),
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    """
    管理员获取背景图列表
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
        
        # 计算分页信息
        pages = (total + size - 1) // size
        
        return BackgroundImageListResponse(
            items=[BackgroundImageResponse.from_orm(bg) for bg in background_images],
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
async def get_admin_background_image(
    bg_id: int,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    """
    管理员获取单个背景图详情
    """
    background_image = db.query(BackgroundImage).filter(BackgroundImage.id == bg_id).first()
    if not background_image:
        raise HTTPException(status_code=404, detail="背景图不存在")
    
    return BackgroundImageResponse.from_orm(background_image)

@router.post("/", response_model=BackgroundImageResponse)
async def create_background_image(
    background_image: BackgroundImageCreate,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    """
    创建新的背景图
    """
    try:
        # 转换数据并处理字段映射
        bg_data = background_image.dict()
        
        # 如果没有title但有title_zh，将title_zh复制到title
        if not bg_data.get('title') and bg_data.get('title_zh'):
            bg_data['title'] = bg_data['title_zh']
        
        # 如果没有subtitle但有subtitle_zh，将subtitle_zh复制到subtitle  
        if not bg_data.get('subtitle') and bg_data.get('subtitle_zh'):
            bg_data['subtitle'] = bg_data['subtitle_zh']
            
        # 如果没有button_text但有button_text_zh，将button_text_zh复制到button_text
        if not bg_data.get('button_text') and bg_data.get('button_text_zh'):
            bg_data['button_text'] = bg_data['button_text_zh']
        
        # 创建背景图
        db_background_image = BackgroundImage(**bg_data)
        db.add(db_background_image)
        db.commit()
        db.refresh(db_background_image)
        
        return BackgroundImageResponse.from_orm(db_background_image)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"创建背景图失败: {str(e)}")

@router.put("/{bg_id}", response_model=BackgroundImageResponse)
async def update_background_image(
    bg_id: int,
    background_image: BackgroundImageUpdate,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    """
    更新背景图
    """
    # 查找背景图
    db_background_image = db.query(BackgroundImage).filter(BackgroundImage.id == bg_id).first()
    if not db_background_image:
        raise HTTPException(status_code=404, detail="背景图不存在")
    
    try:
        # 获取更新数据并处理字段映射
        update_data = background_image.dict(exclude_unset=True)
        
        # 如果提供了title_zh但没有title，将title_zh复制到title
        if 'title_zh' in update_data and 'title' not in update_data:
            update_data['title'] = update_data['title_zh']
            
        # 如果提供了subtitle_zh但没有subtitle，将subtitle_zh复制到subtitle
        if 'subtitle_zh' in update_data and 'subtitle' not in update_data:
            update_data['subtitle'] = update_data['subtitle_zh']
            
        # 如果提供了button_text_zh但没有button_text，将button_text_zh复制到button_text
        if 'button_text_zh' in update_data and 'button_text' not in update_data:
            update_data['button_text'] = update_data['button_text_zh']
        
        # 更新字段
        for field, value in update_data.items():
            if hasattr(db_background_image, field):
                setattr(db_background_image, field, value)
        
        db.commit()
        db.refresh(db_background_image)
        
        return BackgroundImageResponse.from_orm(db_background_image)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"更新背景图失败: {str(e)}")

@router.delete("/{bg_id}", response_model=BaseResponse)
async def delete_background_image(
    bg_id: int,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    """
    删除背景图
    """
    # 查找背景图
    background_image = db.query(BackgroundImage).filter(BackgroundImage.id == bg_id).first()
    if not background_image:
        raise HTTPException(status_code=404, detail="背景图不存在")
    
    try:
        db.delete(background_image)
        db.commit()
        
        return BaseResponse(message="背景图删除成功")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"删除背景图失败: {str(e)}")

@router.patch("/{bg_id}/toggle", response_model=BackgroundImageResponse)
async def toggle_background_image_status(
    bg_id: int,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    """
    切换背景图启用状态
    """
    # 查找背景图
    background_image = db.query(BackgroundImage).filter(BackgroundImage.id == bg_id).first()
    if not background_image:
        raise HTTPException(status_code=404, detail="背景图不存在")
    
    try:
        # 切换状态
        background_image.is_active = not background_image.is_active
        db.commit()
        db.refresh(background_image)
        
        return BackgroundImageResponse.from_orm(background_image)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"切换背景图状态失败: {str(e)}")

@router.patch("/{bg_id}/sort", response_model=BackgroundImageResponse)
async def update_background_image_sort(
    bg_id: int,
    sort_order: int = Query(..., description="排序值"),
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    """
    更新背景图排序
    """
    # 查找背景图
    background_image = db.query(BackgroundImage).filter(BackgroundImage.id == bg_id).first()
    if not background_image:
        raise HTTPException(status_code=404, detail="背景图不存在")
    
    try:
        # 更新排序
        background_image.sort_order = sort_order
        db.commit()
        db.refresh(background_image)
        
        return BackgroundImageResponse.from_orm(background_image)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"更新背景图排序失败: {str(e)}")
