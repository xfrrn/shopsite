"""
页脚信息管理API
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
from ..models.database import get_db
from ..models.models import FooterInfo
from pydantic import BaseModel

# 创建路由器
router = APIRouter()

# Pydantic模型
class FooterInfoBase(BaseModel):
    about_title: Optional[str] = "关于我们"
    about_title_en: Optional[str] = "About Us"
    about_content: Optional[str] = None
    about_content_en: Optional[str] = None
    contact_title: Optional[str] = "联系我们"
    contact_title_en: Optional[str] = "Contact Us"
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    contact_address: Optional[str] = None
    contact_address_en: Optional[str] = None
    social_title: Optional[str] = "关注我们"
    social_title_en: Optional[str] = "Follow Us"
    wechat_url: Optional[str] = None
    weibo_url: Optional[str] = None
    github_url: Optional[str] = None
    quick_links_title: Optional[str] = "快速链接"
    quick_links_title_en: Optional[str] = "Quick Links"
    copyright_text: Optional[str] = None
    copyright_text_en: Optional[str] = None

class FooterInfoCreate(FooterInfoBase):
    pass

class FooterInfoUpdate(FooterInfoBase):
    pass

class FooterInfoResponse(FooterInfoBase):
    id: int
    is_active: bool
    
    class Config:
        from_attributes = True

@router.get("/", response_model=FooterInfoResponse)
async def get_footer_info(db: Session = Depends(get_db)):
    """获取页脚信息"""
    try:
        # 获取第一个活跃的页脚信息记录
        footer_info = db.query(FooterInfo).filter(FooterInfo.is_active == True).first()
        
        if not footer_info:
            # 如果没有记录，创建默认记录
            default_footer = FooterInfo(
                about_title="关于我们",
                about_title_en="About Us",
                about_content="我们致力于为客户提供高质量的产品和优质的服务体验，通过持续的创新和改进，我们不断满足客户的需求。",
                about_content_en="We are committed to providing customers with high-quality products and excellent service experience. Through continuous innovation and improvement, we constantly meet customer needs.",
                contact_title="联系我们",
                contact_title_en="Contact Us",
                contact_email="info@example.com",
                contact_phone="+86 123 4567 8900",
                contact_address="中国，上海市",
                contact_address_en="Shanghai, China",
                social_title="关注我们",
                social_title_en="Follow Us",
                quick_links_title="快速链接",
                quick_links_title_en="Quick Links",
                copyright_text="© 2024 产品展示网站. 保留所有权利.",
                copyright_text_en="© 2024 Product Showcase Website. All rights reserved."
            )
            db.add(default_footer)
            db.commit()
            db.refresh(default_footer)
            footer_info = default_footer
            
        return footer_info
        
    except Exception as e:
        print(f"获取页脚信息失败: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="获取页脚信息失败"
        )

@router.put("/", response_model=FooterInfoResponse)
async def update_footer_info(
    footer_data: FooterInfoUpdate,
    db: Session = Depends(get_db)
):
    """更新页脚信息"""
    try:
        # 获取现有记录或创建新记录
        footer_info = db.query(FooterInfo).filter(FooterInfo.is_active == True).first()
        
        if not footer_info:
            # 创建新记录
            footer_info = FooterInfo()
            db.add(footer_info)
        
        # 更新字段
        for field, value in footer_data.dict(exclude_unset=True).items():
            setattr(footer_info, field, value)
        
        db.commit()
        db.refresh(footer_info)
        
        return footer_info
        
    except Exception as e:
        print(f"更新页脚信息失败: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="更新页脚信息失败"
        )