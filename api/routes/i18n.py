"""
多语言API路由
提供语言切换和多语言内容获取功能
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from api.models.database import get_db
from api.models.models import Product, Category
from typing import List, Dict, Any

router = APIRouter()

@router.get("/language/{lang_code}/products")
async def get_products_by_language(lang_code: str, db: Session = Depends(get_db)):
    """获取指定语言的产品列表"""
    try:
        products = db.query(Product).filter(Product.is_active == True).all()
        
        result = []
        for product in products:
            # 根据语言选择对应的字段
            if lang_code == 'en':
                name = getattr(product, 'name_en', None) or product.name
                description = getattr(product, 'description_en', None) or product.description
            else:
                name = product.name
                description = product.description
            
            images_list = []
            if getattr(product, 'images', None):
                images_list = str(product.images).split(',')
            
            result.append({
                "id": product.id,
                "name": name,
                "description": description,
                "price": product.price,
                "original_price": product.original_price,
                "image_url": product.image_url,
                "images": images_list,
                "is_featured": product.is_featured,
                "rating": product.rating,
                "sales_count": product.sales_count,
                "stock": product.stock,
                "stock_quantity": product.stock,  # 添加库存字段以保持兼容性
                "category_id": product.category_id
            })
        
        return {"success": True, "data": result}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取产品数据失败: {str(e)}")

@router.get("/language/{lang_code}/products/{product_id}")
async def get_product_by_language(lang_code: str, product_id: int, db: Session = Depends(get_db)):
    """获取指定语言的单个产品详情"""
    try:
        product = db.query(Product).filter(
            Product.id == product_id,
            Product.is_active == True
        ).first()
        
        if not product:
            raise HTTPException(status_code=404, detail="产品未找到")
        
        # 根据语言选择对应的字段
        if lang_code == 'en':
            name = getattr(product, 'name_en', None) or product.name
            description = getattr(product, 'description_en', None) or product.description
        else:
            name = product.name
            description = product.description
        
        # 获取分类信息
        from ..models.models import Category
        category = db.query(Category).filter(Category.id == product.category_id).first()
        
        # 根据语言选择分类名称
        if category:
            if lang_code == 'en':
                category_name = getattr(category, 'name_en', None) or category.name
            else:
                category_name = category.name
        else:
            category_name = None
        
        # 处理图片列表
        images_list = []
        if getattr(product, 'images', None):
            images_list = str(product.images).split(',')
        
        result = {
            "id": product.id,
            "name": name,
            "name_en": product.name_en,
            "name_zh": product.name_zh,
            "description": description,
            "description_en": product.description_en,
            "description_zh": product.description_zh,
            "price": product.price,
            "original_price": product.original_price,
            "image_url": product.image_url,
            "images": images_list,
            "sku": product.sku,
            "stock": product.stock,
            "stock_quantity": product.stock,  # 添加兼容字段
            "sales_count": product.sales_count,
            "view_count": product.view_count,
            "rating": product.rating,
            "tags": product.tags,
            "brand": getattr(product, 'brand', None),
            "model": getattr(product, 'model', None),
            "color": getattr(product, 'color', None),
            "is_active": product.is_active,
            "category_id": product.category_id,
            "category_name": category_name,
            "created_at": product.created_at,
            "updated_at": product.updated_at
        }
        
        return {"success": True, "data": result}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取产品详情失败: {str(e)}")

@router.get("/language/{lang_code}/categories")
async def get_categories_by_language(lang_code: str, db: Session = Depends(get_db)):
    """获取指定语言的分类列表"""
    try:
        categories = db.query(Category).filter(Category.is_active == True).all()
        
        result = []
        for category in categories:
            # 根据语言选择对应的字段
            if lang_code == 'en':
                name = getattr(category, 'name_en', None) or category.name
                description = getattr(category, 'description_en', None) or category.description
            else:
                name = category.name
                description = category.description
            
            result.append({
                "id": category.id,
                "name": name,
                "name_en": category.name_en,
                "name_zh": category.name_zh,
                "description": description,
                "description_en": category.description_en,
                "icon_url": category.icon_url,
                "sort_order": category.sort_order,
                "is_active": category.is_active,
                "created_at": category.created_at,
                "updated_at": category.updated_at
            })
        
        return {"success": True, "data": result}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取分类数据失败: {str(e)}")

@router.get("/language/{lang_code}/featured-products")
async def get_featured_products_by_language(lang_code: str, db: Session = Depends(get_db)):
    """获取指定语言的精选产品列表"""
    try:
        # 导入FeaturedProduct模型
        from ..models.models import FeaturedProduct
        
        # 获取所有启用的特色产品配置
        featured_configs = db.query(FeaturedProduct).filter(
            FeaturedProduct.is_active == True
        ).order_by(FeaturedProduct.position.asc()).all()
        
        # 初始化6个位置的展示数据
        result = []
        
        for position in range(1, 7):  # 位置 1-6
            display_data = {"position": position, "product": None}
            
            # 查找该位置的配置
            for config in featured_configs:
                if getattr(config, 'position') == position:
                    # 获取产品详情
                    product = db.query(Product).filter(
                        Product.id == config.product_id,
                        Product.is_active == True
                    ).first()
                    
                    if product:
                        # 根据语言选择对应的字段
                        if lang_code == 'en':
                            name = getattr(product, 'name_en', None) or product.name
                            description = getattr(product, 'description_en', None) or product.description
                        else:
                            name = product.name
                            description = product.description
                        
                        # 获取分类信息
                        from ..models.models import Category
                        category = db.query(Category).filter(Category.id == product.category_id).first()
                        
                        # 构建产品响应数据
                        product_data = {
                            "id": product.id,
                            "name": name,
                            "name_en": product.name_en,
                            "name_zh": product.name_zh,
                            "description": description,
                            "description_en": product.description_en,
                            "description_zh": product.description_zh,
                            "price": product.price,
                            "original_price": product.original_price,
                            "image_url": product.image_url,
                            "images": product.images,
                            "sku": product.sku,
                            "stock": product.stock,
                            "sales_count": product.sales_count,
                            "view_count": product.view_count,
                            "rating": product.rating,
                            "tags": product.tags,
                            "is_active": product.is_active,
                            "category_id": product.category_id,
                            "category_name": category.name if category else None,
                            "created_at": product.created_at,
                            "updated_at": product.updated_at
                        }
                        
                        display_data["product"] = product_data
                    break
            
            result.append(display_data)
        
        return {"success": True, "data": result}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取精选产品数据失败: {str(e)}")

@router.get("/language/{lang_code}/background-images")
async def get_background_images_by_language(lang_code: str, db: Session = Depends(get_db)):
    """获取指定语言的背景图列表"""
    try:
        # 导入BackgroundImage模型
        from ..models.models import BackgroundImage
        
        background_images = db.query(BackgroundImage).filter(
            BackgroundImage.is_active == True
        ).order_by(BackgroundImage.sort_order).all()
        
        result = []
        for bg_image in background_images:
            # 根据语言选择对应的字段
            if lang_code == 'en':
                title = getattr(bg_image, 'title_en', None) or bg_image.title
                subtitle = getattr(bg_image, 'subtitle_en', None) or bg_image.subtitle
                button_text = getattr(bg_image, 'button_text_en', None) or bg_image.button_text
            else:
                title = bg_image.title
                subtitle = bg_image.subtitle
                button_text = bg_image.button_text
            
            result.append({
                "id": bg_image.id,
                "title": title,
                "subtitle": subtitle,
                "button_text": button_text,
                "button_link": bg_image.button_link,
                "image_url": bg_image.image_url,
                "sort_order": bg_image.sort_order,
                "is_active": bg_image.is_active
            })
        
        return {"items": result, "success": True}
        
    except Exception as e:
        print(f"背景图API错误: {str(e)}")
        # 如果模型不存在或出错，返回空列表
        return {"items": [], "success": True}

@router.get("/language/{lang_code}/about-us")
async def get_about_us_by_language(lang_code: str, db: Session = Depends(get_db)):
    """获取指定语言的关于我们内容"""
    try:
        # 导入AboutUs模型
        from ..models.models import AboutUs
        
        about_us = db.query(AboutUs).filter(AboutUs.is_active == True).first()
        
        if not about_us:
            # 如果没有数据，返回默认内容
            if lang_code == 'en':
                return {
                    "success": True,
                    "data": {
                        "id": 0,
                        "title": "About Us",
                        "content": "Welcome to our company! We are dedicated to providing quality products and excellent service.",
                        "background_image_url": None,
                        "text_color": "#333333",
                        "background_overlay": "rgba(255, 255, 255, 0.8)",
                        "is_active": True
                    }
                }
            else:
                return {
                    "success": True,
                    "data": {
                        "id": 0,
                        "title": "关于我们",
                        "content": "欢迎来到我们的公司！我们致力于提供优质的产品和卓越的服务。",
                        "background_image_url": None,
                        "text_color": "#333333",
                        "background_overlay": "rgba(255, 255, 255, 0.8)",
                        "is_active": True
                    }
                }
        
        # 根据语言选择对应的字段
        if lang_code == 'en':
            title = getattr(about_us, 'title_en', None) or about_us.title
            content = getattr(about_us, 'content_en', None) or about_us.content
        else:
            title = about_us.title
            content = about_us.content
        
        result = {
            "id": about_us.id,
            "title": title,
            "content": content,
            "background_image_url": about_us.background_image_url,
            "text_color": about_us.text_color,
            "background_overlay": about_us.background_overlay,
            "is_active": about_us.is_active,
            "created_at": about_us.created_at,
            "updated_at": about_us.updated_at
        }
        
        return {"success": True, "data": result}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取关于我们数据失败: {str(e)}")

@router.post("/language/switch")
async def switch_language(data: Dict[str, Any]):
    """切换语言（客户端状态管理）"""
    lang_code = data.get('language', 'zh')
    
    # 验证语言代码
    if lang_code not in ['zh', 'en']:
        raise HTTPException(status_code=400, detail="不支持的语言代码")
    
    return {
        "success": True,
        "message": f"语言已切换为: {'中文' if lang_code == 'zh' else 'English'}",
        "language": lang_code
    }