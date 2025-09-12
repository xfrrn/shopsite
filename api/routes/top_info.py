"""
顶部信息栏API路由
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from api.models.database import get_db
from api.models.models import TopInfoBar
from api.models.schemas import (
    TopInfoBarResponse, 
    TopInfoBarCreate, 
    TopInfoBarUpdate, 
    BaseResponse
)
from api.utils.auth import get_current_admin

router = APIRouter(prefix="/top-info", tags=["顶部信息栏"])

@router.get("/", response_model=TopInfoBarResponse)
async def get_top_info(db: Session = Depends(get_db)):
    """获取顶部信息栏信息"""
    try:
        top_info = db.query(TopInfoBar).filter(TopInfoBar.is_active == True).first()
        
        if not top_info:
            # 如果没有数据，返回默认数据
            default_data = TopInfoBar(
                id=0,
                phone="400-123-4567",
                email="service@example.com",
                wechat_url="#",
                wechat_qr=None,
                weibo_url="https://weibo.com/",
                qq_url="https://qzone.qq.com/",
                github_url="https://github.com/",
                linkedin_url="https://linkedin.com/",
                is_active=True
            )
            return default_data
        
        return top_info
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"获取顶部信息栏信息失败: {str(e)}"
        )

@router.get("/admin", response_model=TopInfoBarResponse)
async def get_top_info_admin(
    current_admin=Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """管理员获取顶部信息栏信息"""
    try:
        top_info = db.query(TopInfoBar).first()
        
        if not top_info:
            # 创建默认数据
            default_top_info = TopInfoBar(
                phone="400-123-4567",
                email="service@example.com", 
                wechat_url="#",
                wechat_qr=None,
                weibo_url="https://weibo.com/",
                qq_url="https://qzone.qq.com/",
                github_url="https://github.com/",
                linkedin_url="https://linkedin.com/",
                is_active=True
            )
            
            db.add(default_top_info)
            db.commit()
            db.refresh(default_top_info)
            return default_top_info
        
        return top_info
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"获取顶部信息栏信息失败: {str(e)}"
        )

@router.post("/", response_model=BaseResponse)
async def create_top_info(
    top_info_data: TopInfoBarCreate,
    current_admin=Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """创建顶部信息栏信息"""
    try:
        # 检查是否已存在
        existing = db.query(TopInfoBar).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="顶部信息栏信息已存在，请使用更新接口"
            )
        
        new_top_info = TopInfoBar(**top_info_data.dict())
        db.add(new_top_info)
        db.commit()
        
        return BaseResponse(message="顶部信息栏信息创建成功")
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"创建顶部信息栏信息失败: {str(e)}"
        )

@router.put("/", response_model=BaseResponse)
async def update_top_info(
    top_info_data: TopInfoBarUpdate,
    current_admin=Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """更新顶部信息栏信息"""
    try:
        top_info = db.query(TopInfoBar).first()
        
        if not top_info:
            # 如果不存在，创建新的
            create_data = TopInfoBarCreate(
                phone=top_info_data.phone or "400-123-4567",
                email=top_info_data.email or "service@example.com",
                wechat_url=top_info_data.wechat_url,
                wechat_qr=top_info_data.wechat_qr,
                weibo_url=top_info_data.weibo_url,
                qq_url=top_info_data.qq_url,
                github_url=top_info_data.github_url,
                linkedin_url=top_info_data.linkedin_url,
                is_active=top_info_data.is_active if top_info_data.is_active is not None else True
            )
            
            new_top_info = TopInfoBar(**create_data.dict())
            db.add(new_top_info)
        else:
            # 更新现有数据
            update_data = top_info_data.dict(exclude_unset=True)
            for key, value in update_data.items():
                setattr(top_info, key, value)
        
        db.commit()
        return BaseResponse(message="顶部信息栏信息更新成功")
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"更新顶部信息栏信息失败: {str(e)}"
        )