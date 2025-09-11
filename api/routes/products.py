"""
产品相关API路由
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Request, Header
from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from api.models import get_db, Product, Category
from api.models.schemas import ProductResponse, CategoryResponse, ProductListResponse
from api.utils import get_language_from_request, get_localized_field, calculate_pagination

router = APIRouter(prefix="/products", tags=["产品"])

@router.get("/", response_model=ProductListResponse)
def get_products(
    request: Request,
    category_id: Optional[int] = Query(None, description="分类ID筛选"),
    q: Optional[str] = Query(None, description="搜索关键词"),
    is_featured: Optional[bool] = Query(None, description="是否精选"),
    min_price: Optional[float] = Query(None, ge=0, description="最低价格"),
    max_price: Optional[float] = Query(None, ge=0, description="最高价格"),
    sort_by: Optional[str] = Query("id", description="排序字段: id, price, sales_count, created_at"),
    sort_order: Optional[str] = Query("asc", description="排序方式: asc, desc"),
    page: int = Query(1, ge=1, description="页码"),
    size: int = Query(10, ge=1, le=100, description="每页数量"),
    accept_language: str = Header(None),
    db: Session = Depends(get_db)
):
    """获取产品列表"""
    query = db.query(Product).filter(Product.is_active == True)
    
    # 分类筛选
    if category_id:
        query = query.filter(Product.category_id == category_id)
    
    # 搜索筛选
    if q:
        search_filter = or_(
            Product.name.contains(q),
            Product.description.contains(q),
            Product.name_en.contains(q),
            Product.description_en.contains(q),
            Product.name_zh.contains(q),
            Product.description_zh.contains(q),
            Product.tags.contains(q)
        )
        query = query.filter(search_filter)
    
    # 精选筛选
    if is_featured is not None:
        query = query.filter(Product.is_featured == is_featured)
    
    # 价格筛选
    if min_price is not None:
        query = query.filter(Product.price >= min_price)
    if max_price is not None:
        query = query.filter(Product.price <= max_price)
    
    # 排序
    sort_field = getattr(Product, sort_by, Product.id)
    if sort_order == "desc":
        query = query.order_by(sort_field.desc())
    else:
        query = query.order_by(sort_field.asc())
    
    # 总数统计
    total = query.count()
    
    # 分页
    offset = (page - 1) * size
    products = query.offset(offset).limit(size).all()
    
    # 获取语言设置
    lang = get_language_from_request(request, accept_language)
    
    # 构建响应数据
    items = []
    for product in products:
        # 本地化产品字段
        product_dict = {
            "id": product.id,
            "name": get_localized_field(product, "name", lang),
            "name_en": product.name_en,
            "name_zh": product.name_zh,
            "description": get_localized_field(product, "description", lang),
            "description_en": product.description_en,
            "description_zh": product.description_zh,
            "price": product.price,
            "original_price": product.original_price,
            "image_url": product.image_url,
            "images": product.images,
            "sku": product.sku,
            "stock": product.stock,
            "stock_quantity": product.stock,  # 为前端兼容性添加映射
            "sales_count": product.sales_count,
            "view_count": product.view_count,
            "rating": product.rating,
            "tags": product.tags,
            "is_featured": product.is_featured,
            "is_active": product.is_active,
            "sort_order": product.sort_order,
            "category_id": product.category_id,
            "created_at": product.created_at,
            "updated_at": product.updated_at
        }
        
        # 添加分类信息
        if product.category:
            category_dict = {
                "id": product.category.id,
                "name": get_localized_field(product.category, "name", lang),
                "name_en": product.category.name_en,
                "name_zh": product.category.name_zh,
                "description": product.category.description,
                "description_en": product.category.description_en,
                "sort_order": product.category.sort_order,
                "is_active": product.category.is_active,
                "created_at": product.category.created_at,
                "updated_at": product.category.updated_at
            }
            product_dict["category"] = CategoryResponse(**category_dict)
        
        items.append(ProductResponse(**product_dict))
    
    # 分页信息
    pagination = calculate_pagination(total, page, size)
    
    return ProductListResponse(items=items, pagination=pagination)

@router.get("/{product_id}", response_model=ProductResponse)
def get_product(
    product_id: int,
    request: Request,
    accept_language: str = Header(None),
    db: Session = Depends(get_db)
):
    """获取产品详情"""
    product = db.query(Product).filter(
        Product.id == product_id,
        Product.is_active == True
    ).first()
    
    if not product:
        raise HTTPException(status_code=404, detail="产品不存在")
    
    # 增加浏览次数
    product.view_count += 1
    db.commit()
    
    # 获取语言设置
    lang = get_language_from_request(request, accept_language)
    
    # 本地化产品字段
    product_dict = {
        "id": product.id,
        "name": get_localized_field(product, "name", lang),
        "name_en": product.name_en,
        "name_zh": product.name_zh,
        "description": get_localized_field(product, "description", lang),
        "description_en": product.description_en,
        "description_zh": product.description_zh,
        "price": product.price,
        "original_price": product.original_price,
        "image_url": product.image_url,
        "images": product.images,
        "sku": product.sku,
        "stock": product.stock,
        "stock_quantity": product.stock,  # 为前端兼容性添加映射
        "sales_count": product.sales_count,
        "view_count": product.view_count,
        "rating": product.rating,
        "tags": product.tags,
        "is_featured": product.is_featured,
        "is_active": product.is_active,
        "sort_order": product.sort_order,
        "category_id": product.category_id,
        "created_at": product.created_at,
        "updated_at": product.updated_at
    }
    
    # 添加分类信息
    if product.category:
        category_dict = {
            "id": product.category.id,
            "name": get_localized_field(product.category, "name", lang),
            "name_en": product.category.name_en,
            "name_zh": product.category.name_zh,
            "description": product.category.description,
            "description_en": product.category.description_en,
            "sort_order": product.category.sort_order,
            "is_active": product.category.is_active,
            "created_at": product.category.created_at,
            "updated_at": product.category.updated_at
        }
        product_dict["category"] = CategoryResponse(**category_dict)
    
    return ProductResponse(**product_dict)
