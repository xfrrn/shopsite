"""
管理员特色产品管理API路由
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from api.models import get_db, Admin, FeaturedProduct, Product
from api.models.schemas import FeaturedProductResponse, FeaturedProductCreate, FeaturedProductUpdate
from api.utils.auth import verify_token

router = APIRouter(prefix="/admin/featured-products", tags=["管理员特色产品管理"])

@router.get("/", response_model=List[FeaturedProductResponse])
def get_all_featured_products(
    current_admin = Depends(verify_token),
    db: Session = Depends(get_db)
):
    """获取所有特色产品配置"""
    featured_products = db.query(FeaturedProduct).order_by(
        FeaturedProduct.position.asc()
    ).all()
    
    result = []
    for fp in featured_products:
        # 获取关联的产品信息
        product = db.query(Product).filter(Product.id == fp.product_id).first()
        
        # 构建响应数据
        fp_data = {
            "id": fp.id,
            "product_id": fp.product_id,
            "position": fp.position,
            "is_active": fp.is_active,
            "created_at": fp.created_at,
            "updated_at": fp.updated_at,
            "product": None
        }
        
        if product:
            # 获取产品的分类信息
            from api.models import Category
            category = db.query(Category).filter(Category.id == product.category_id).first()
            
            fp_data["product"] = {
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
                "stock_quantity": product.stock,
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
        
        result.append(fp_data)
    
    return result

@router.get("/positions")
def get_featured_positions(
    current_admin = Depends(verify_token),
    db: Session = Depends(get_db)
):
    """获取特色产品位置状态（1-6个位置的占用情况）"""
    positions = {}
    
    # 初始化所有位置为空
    for i in range(1, 7):
        positions[str(i)] = None
    
    # 查询已配置的位置
    featured_products = db.query(FeaturedProduct).filter(
        FeaturedProduct.is_active == True
    ).all()
    
    for fp in featured_products:
        if 1 <= fp.position <= 6:
            product = db.query(Product).filter(Product.id == fp.product_id).first()
            positions[str(fp.position)] = {
                "id": fp.id,
                "product_id": fp.product_id,
                "product_name": product.name if product else "产品不存在",
                "product_image": product.image_url if product else None
            }
    
    return positions

@router.post("/", response_model=FeaturedProductResponse)
def create_featured_product(
    featured_product: FeaturedProductCreate,
    current_admin = Depends(verify_token),
    db: Session = Depends(get_db)
):
    """创建特色产品配置"""
    try:
        # 检查产品是否存在
        product = db.query(Product).filter(Product.id == featured_product.product_id).first()
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="产品不存在"
            )
        
        # 检查位置是否已被占用
        existing = db.query(FeaturedProduct).filter(
            FeaturedProduct.position == featured_product.position,
            FeaturedProduct.is_active == True
        ).first()
        
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"位置 {featured_product.position} 已被占用"
            )
        
        # 创建特色产品配置
        db_featured = FeaturedProduct(
            product_id=featured_product.product_id,
            position=featured_product.position,
            is_active=featured_product.is_active if featured_product.is_active is not None else True
        )
        
        db.add(db_featured)
        db.commit()
        db.refresh(db_featured)
        
        return FeaturedProductResponse(
            id=db_featured.id,
            product_id=db_featured.product_id,
            position=db_featured.position,
            is_active=db_featured.is_active,
            created_at=db_featured.created_at,
            updated_at=db_featured.updated_at
        )
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"创建特色产品失败: {str(e)}"
        )

@router.put("/{featured_product_id}", response_model=FeaturedProductResponse)
def update_featured_product(
    featured_product_id: int,
    featured_product_update: FeaturedProductUpdate,
    current_admin = Depends(verify_token),
    db: Session = Depends(get_db)
):
    """更新特色产品配置"""
    try:
        # 查找特色产品配置
        db_featured = db.query(FeaturedProduct).filter(
            FeaturedProduct.id == featured_product_id
        ).first()
        
        if not db_featured:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="特色产品配置不存在"
            )
        
        # 更新字段
        update_data = featured_product_update.dict(exclude_unset=True)
        
        # 检查新产品是否存在
        if 'product_id' in update_data:
            product = db.query(Product).filter(Product.id == update_data['product_id']).first()
            if not product:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="产品不存在"
                )
        
        # 检查新位置是否已被占用
        if 'position' in update_data and update_data['position'] != db_featured.position:
            existing = db.query(FeaturedProduct).filter(
                FeaturedProduct.position == update_data['position'],
                FeaturedProduct.is_active == True,
                FeaturedProduct.id != featured_product_id
            ).first()
            
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"位置 {update_data['position']} 已被占用"
                )
        
        # 应用更新
        for field, value in update_data.items():
            setattr(db_featured, field, value)
        
        db.commit()
        db.refresh(db_featured)
        
        return FeaturedProductResponse(
            id=db_featured.id,
            product_id=db_featured.product_id,
            position=db_featured.position,
            is_active=db_featured.is_active,
            created_at=db_featured.created_at,
            updated_at=db_featured.updated_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"更新特色产品失败: {str(e)}"
        )

@router.delete("/{featured_product_id}")
def delete_featured_product(
    featured_product_id: int,
    current_admin = Depends(verify_token),
    db: Session = Depends(get_db)
):
    """删除特色产品配置"""
    try:
        # 查找特色产品配置
        db_featured = db.query(FeaturedProduct).filter(
            FeaturedProduct.id == featured_product_id
        ).first()
        
        if not db_featured:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="特色产品配置不存在"
            )
        
        # 删除配置
        db.delete(db_featured)
        db.commit()
        
        return {"message": "特色产品配置已删除"}
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"删除特色产品失败: {str(e)}"
        )
