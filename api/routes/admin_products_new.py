"""
管理员产品管理API路由
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from api.models.database import get_db
from api.models.models import Product, Category
from api.models.schemas import ProductResponse, ProductCreate, ProductUpdate
from api.utils.auth import verify_token

router = APIRouter(prefix="/admin/products", tags=["管理员产品管理"])

@router.get("/", response_model=List[ProductResponse])
def get_all_products(
    skip: int = 0,
    limit: int = 100,
    category_id: Optional[int] = None,
    current_admin = Depends(verify_token),
    db: Session = Depends(get_db)
):
    """获取所有产品列表（包括非活跃）"""
    try:
        # 构建查询
        query = db.query(Product)
        
        # 如果指定分类ID，则过滤
        if category_id:
            query = query.filter(Product.category_id == category_id)
        
        # 分页查询
        products = query.offset(skip).limit(limit).all()
        
        # 转换为响应格式
        result = []
        for product in products:
            result.append(ProductResponse(
                id=product.id,
                name=product.name,
                name_en=getattr(product, 'name_en', None),
                name_zh=getattr(product, 'name_zh', None),
                description=product.description,
                description_en=getattr(product, 'description_en', None),
                description_zh=getattr(product, 'description_zh', None),
                price=product.price,
                original_price=getattr(product, 'original_price', None),
                image_url=product.image_url,
                images=getattr(product, 'images', None),
                sku=product.sku,
                stock=product.stock,
                tags=getattr(product, 'tags', None),
                is_featured=getattr(product, 'is_featured', False),
                is_active=product.is_active,
                sort_order=getattr(product, 'sort_order', 0),
                category_id=product.category_id,
                sales_count=getattr(product, 'sales_count', 0),
                view_count=getattr(product, 'view_count', 0),
                rating=getattr(product, 'rating', 0.0),
                created_at=product.created_at,
                updated_at=product.updated_at
            ))
        
        return result
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"获取产品列表失败: {str(e)}"
        )

@router.get("/{product_id}", response_model=ProductResponse)
def get_product(
    product_id: int,
    current_admin = Depends(verify_token),
    db: Session = Depends(get_db)
):
    """获取单个产品详情"""
    try:
        # 查找产品
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="产品不存在"
            )
        
        return ProductResponse(
            id=product.id,
            name=product.name,
            name_en=getattr(product, 'name_en', None),
            name_zh=getattr(product, 'name_zh', None),
            description=product.description,
            description_en=getattr(product, 'description_en', None),
            description_zh=getattr(product, 'description_zh', None),
            price=product.price,
            original_price=getattr(product, 'original_price', None),
            image_url=product.image_url,
            images=getattr(product, 'images', None),
            sku=product.sku,
            stock=product.stock,
            tags=getattr(product, 'tags', None),
            is_featured=getattr(product, 'is_featured', False),
            is_active=product.is_active,
            sort_order=getattr(product, 'sort_order', 0),
            category_id=product.category_id,
            sales_count=getattr(product, 'sales_count', 0),
            view_count=getattr(product, 'view_count', 0),
            rating=getattr(product, 'rating', 0.0),
            created_at=product.created_at,
            updated_at=product.updated_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"获取产品失败: {str(e)}"
        )

@router.post("/", response_model=ProductResponse)
def create_product(
    product: ProductCreate,
    current_admin = Depends(verify_token),
    db: Session = Depends(get_db)
):
    """创建新产品"""
    try:
        # 验证分类是否存在
        if product.category_id:
            category = db.query(Category).filter(Category.id == product.category_id).first()
            if not category:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="指定的分类不存在"
                )
        
        # 创建新产品
        db_product = Product(
            name=product.name,
            name_en=getattr(product, 'name_en', None),
            name_zh=getattr(product, 'name_zh', None),
            description=product.description,
            description_en=getattr(product, 'description_en', None),
            description_zh=getattr(product, 'description_zh', None),
            price=product.price,
            original_price=getattr(product, 'original_price', None),
            image_url=product.image_url,
            images=getattr(product, 'images', None),
            sku=product.sku,
            stock=getattr(product, 'stock', 0),
            tags=getattr(product, 'tags', None),
            is_featured=getattr(product, 'is_featured', False),
            is_active=getattr(product, 'is_active', True),
            sort_order=getattr(product, 'sort_order', 0),
            category_id=product.category_id
        )
        
        db.add(db_product)
        db.commit()
        db.refresh(db_product)
        
        return ProductResponse(
            id=db_product.id,
            name=db_product.name,
            name_en=db_product.name_en,
            name_zh=db_product.name_zh,
            description=db_product.description,
            description_en=db_product.description_en,
            description_zh=db_product.description_zh,
            price=db_product.price,
            original_price=db_product.original_price,
            image_url=db_product.image_url,
            images=db_product.images,
            sku=db_product.sku,
            stock=db_product.stock,
            tags=db_product.tags,
            is_featured=db_product.is_featured,
            is_active=db_product.is_active,
            sort_order=db_product.sort_order,
            category_id=db_product.category_id,
            sales_count=getattr(db_product, 'sales_count', 0),
            view_count=getattr(db_product, 'view_count', 0),
            rating=getattr(db_product, 'rating', 0.0),
            created_at=db_product.created_at,
            updated_at=db_product.updated_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"创建产品失败: {str(e)}"
        )

@router.put("/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: int,
    product_update: ProductUpdate,
    current_admin = Depends(verify_token),
    db: Session = Depends(get_db)
):
    """更新产品信息"""
    try:
        # 查找产品
        db_product = db.query(Product).filter(Product.id == product_id).first()
        if not db_product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="产品不存在"
            )
        
        # 验证分类是否存在（如果要更新分类）
        update_data = product_update.dict(exclude_unset=True)
        if 'category_id' in update_data and update_data['category_id']:
            category = db.query(Category).filter(Category.id == update_data['category_id']).first()
            if not category:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="指定的分类不存在"
                )
        
        # 更新字段
        for field, value in update_data.items():
            if hasattr(db_product, field):
                setattr(db_product, field, value)
        
        db.commit()
        db.refresh(db_product)
        
        return ProductResponse(
            id=db_product.id,
            name=db_product.name,
            name_en=db_product.name_en,
            name_zh=db_product.name_zh,
            description=db_product.description,
            description_en=db_product.description_en,
            description_zh=db_product.description_zh,
            price=db_product.price,
            original_price=db_product.original_price,
            image_url=db_product.image_url,
            images=db_product.images,
            sku=db_product.sku,
            stock=db_product.stock,
            tags=db_product.tags,
            is_featured=db_product.is_featured,
            is_active=db_product.is_active,
            sort_order=db_product.sort_order,
            category_id=db_product.category_id,
            sales_count=getattr(db_product, 'sales_count', 0),
            view_count=getattr(db_product, 'view_count', 0),
            rating=getattr(db_product, 'rating', 0.0),
            created_at=db_product.created_at,
            updated_at=db_product.updated_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"更新产品失败: {str(e)}"
        )

@router.delete("/{product_id}")
def delete_product(
    product_id: int,
    current_admin = Depends(verify_token),
    db: Session = Depends(get_db)
):
    """删除产品"""
    try:
        # 查找产品
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="产品不存在"
            )
        
        # 删除产品
        db.delete(product)
        db.commit()
        
        return {"success": True, "message": "产品删除成功"}
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"删除产品失败: {str(e)}"
        )

@router.patch("/{product_id}/toggle-status")
def toggle_product_status(
    product_id: int,
    current_admin = Depends(verify_token),
    db: Session = Depends(get_db)
):
    """切换产品启用状态"""
    try:
        # 查找产品
        db_product = db.query(Product).filter(Product.id == product_id).first()
        if not db_product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="产品不存在"
            )
        
        # 切换状态
        db_product.is_active = not db_product.is_active
        db.commit()
        db.refresh(db_product)
        
        return {
            "success": True,
            "message": f"产品已{'启用' if db_product.is_active else '禁用'}",
            "is_active": db_product.is_active
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"更新状态失败: {str(e)}"
        )
