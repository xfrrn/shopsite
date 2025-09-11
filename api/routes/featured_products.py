"""
特色产品相关API路由（公开API）
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from api.models import get_db, FeaturedProduct, Product
from api.models.schemas import FeaturedProductDisplay

router = APIRouter(prefix="/featured-products", tags=["特色产品"])

@router.get("/", response_model=List[FeaturedProductDisplay])
def get_featured_products(db: Session = Depends(get_db)):
    """获取特色产品列表（固定6个位置）"""
    # 获取所有启用的特色产品配置
    featured_configs = db.query(FeaturedProduct).filter(
        FeaturedProduct.is_active == True
    ).order_by(FeaturedProduct.position.asc()).all()
    
    # 初始化6个位置的展示数据
    featured_displays = []
    
    for position in range(1, 7):  # 位置 1-6
        display_data = {"position": position, "product": None}
        
        # 查找该位置的配置
        for config in featured_configs:
            if config.position == position:
                # 获取产品详情
                product = db.query(Product).filter(
                    Product.id == config.product_id,
                    Product.is_active == True
                ).first()
                
                if product:
                    # 获取分类信息
                    from api.models import Category
                    category = db.query(Category).filter(Category.id == product.category_id).first()
                    
                    # 构建产品响应数据
                    product_data = {
                        "id": product.id,
                        "name": product.name,
                        "name_en": product.name_en,
                        "name_zh": product.name_zh,
                        "description": product.description,
                        "description_en": product.description_en,
                        "description_zh": product.description_zh,
                        "price": product.price,
                        "original_price": product.original_price,
                        "image_url": product.image_url,
                        "images": product.images,
                        "sku": product.sku,
                        "stock": product.stock,
                        "stock_quantity": product.stock,  # 前端兼容字段
                        "sales_count": product.sales_count,
                        "view_count": product.view_count,
                        "rating": product.rating,
                        "tags": product.tags,
                        "is_featured": product.is_featured,
                        "is_active": product.is_active,
                        "sort_order": product.sort_order,
                        "category_id": product.category_id,
                        "created_at": product.created_at,
                        "updated_at": product.updated_at,
                        "category": {
                            "id": category.id,
                            "name": category.name,
                            "name_en": category.name_en,
                            "name_zh": category.name_zh,
                            "description": category.description,
                            "description_en": category.description_en,
                            "icon_url": category.icon_url,
                            "sort_order": category.sort_order,
                            "is_active": category.is_active,
                            "created_at": category.created_at,
                            "updated_at": category.updated_at
                        } if category else None
                    }
                    display_data["product"] = product_data
                break
        
        featured_displays.append(display_data)
    
    return featured_displays
