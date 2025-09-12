"""
关于我们API路由
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from api.models.database import get_db
from api.models.models import AboutUs
from api.models.schemas import (
    AboutUsResponse, 
    AboutUsCreate, 
    AboutUsUpdate, 
    BaseResponse
)
from api.utils.auth import get_current_admin

router = APIRouter(prefix="/about-us", tags=["关于我们"])

@router.get("/", response_model=AboutUsResponse)
async def get_about_us(db: Session = Depends(get_db)):
    """获取关于我们信息"""
    try:
        about_us = db.query(AboutUs).filter(AboutUs.is_active == True).first()
        
        if not about_us:
            # 如果没有数据，返回默认数据
            default_data = AboutUs(
                id=0,
                title="关于我们",
                title_en="About Us",
                title_zh="关于我们",
                content="我们致力于为客户提供高质量的产品和优质的服务体验。\n\n通过持续的创新和改进，我们不断满足客户的需求，创造更大的价值。",
                content_en="We are committed to providing customers with high-quality products and excellent service experience.\n\nThrough continuous innovation and improvement, we constantly meet customer needs and create greater value.",
                content_zh="我们致力为客户提供高质量的产品和优质的服务体验。\n\n通过持续的创新和改进，我们不断满足客户的需求，创造更大的价值。",
                background_image_url=None,
                text_color="#333333",
                background_overlay="rgba(255, 255, 255, 0.8)",
                is_active=True
            )
            return default_data
        
        return about_us
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"获取关于我们信息失败: {str(e)}"
        )

@router.get("/admin", response_model=AboutUsResponse)
async def get_about_us_admin(
    current_admin=Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """管理员获取关于我们信息"""
    try:
        about_us = db.query(AboutUs).first()
        
        if not about_us:
            # 创建默认数据
            default_about_us = AboutUs(
                title="关于我们",
                title_en="About Us", 
                title_zh="关于我们",
                content="我们致力于为客户提供高质量的产品和优质的服务体验。\n\n通过持续的创新和改进，我们不断满足客户的需求，创造更大的价值。",
                content_en="We are committed to providing customers with high-quality products and excellent service experience.\n\nThrough continuous innovation and improvement, we constantly meet customer needs and create greater value.",
                content_zh="我们致力于为客户提供高质量的产品和优质的服务体验。\n\n通过持续的创新和改进，我们不断满足客户的需求，创造更大的价值。",
                background_image_url=None,
                text_color="#333333",
                background_overlay="rgba(255, 255, 255, 0.8)",
                is_active=True
            )
            
            db.add(default_about_us)
            db.commit()
            db.refresh(default_about_us)
            return default_about_us
        
        return about_us
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"获取关于我们信息失败: {str(e)}"
        )

@router.post("/", response_model=BaseResponse)
async def create_about_us(
    about_us_data: AboutUsCreate,
    current_admin=Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """创建关于我们信息"""
    try:
        # 检查是否已存在
        existing = db.query(AboutUs).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="关于我们信息已存在，请使用更新接口"
            )
        
        new_about_us = AboutUs(**about_us_data.dict())
        db.add(new_about_us)
        db.commit()
        
        return BaseResponse(message="关于我们信息创建成功")
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"创建关于我们信息失败: {str(e)}"
        )

@router.put("/", response_model=BaseResponse)
async def update_about_us(
    about_us_data: AboutUsUpdate,
    current_admin=Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """更新关于我们信息"""
    try:
        about_us = db.query(AboutUs).first()
        
        if not about_us:
            # 如果不存在，创建新的
            create_data = AboutUsCreate(
                title=about_us_data.title or "关于我们",
                title_en=about_us_data.title_en,
                title_zh=about_us_data.title_zh,
                content=about_us_data.content or "我们致力于为客户提供高质量的产品和优质的服务体验。",
                content_en=about_us_data.content_en,
                content_zh=about_us_data.content_zh,
                background_image_url=about_us_data.background_image_url,
                text_color=about_us_data.text_color or "#333333",
                background_overlay=about_us_data.background_overlay or "rgba(255, 255, 255, 0.8)",
                is_active=about_us_data.is_active if about_us_data.is_active is not None else True
            )
            
            new_about_us = AboutUs(**create_data.dict())
            db.add(new_about_us)
        else:
            # 更新现有数据
            update_data = about_us_data.dict(exclude_unset=True)
            for key, value in update_data.items():
                setattr(about_us, key, value)
        
        db.commit()
        return BaseResponse(message="关于我们信息更新成功")
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"更新关于我们信息失败: {str(e)}"
        )