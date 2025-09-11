"""
Pydantic 模型定义
用于API请求和响应的数据验证
"""

from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime

# 基础模型
class BaseResponse(BaseModel):
    success: bool = True
    message: str = "操作成功"
    
class PaginationResponse(BaseModel):
    total: int
    page: int
    size: int
    pages: int

# 分类相关模型
class CategoryBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255, description="分类名称")
    name_en: Optional[str] = Field(None, max_length=255, description="英文名称")
    name_zh: Optional[str] = Field(None, max_length=255, description="中文名称")
    description: Optional[str] = Field(None, description="分类描述")
    description_en: Optional[str] = Field(None, description="英文描述")
    icon_url: Optional[str] = Field(None, max_length=500, description="分类图标URL")
    sort_order: Optional[int] = Field(0, description="排序")
    is_active: Optional[bool] = Field(True, description="是否启用")

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    name_en: Optional[str] = Field(None, max_length=255)
    name_zh: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    description_en: Optional[str] = None
    icon_url: Optional[str] = Field(None, max_length=500, description="分类图标URL")
    sort_order: Optional[int] = None
    is_active: Optional[bool] = None

class CategoryResponse(CategoryBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# 产品相关模型
class ProductBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255, description="产品名称")
    name_en: Optional[str] = Field(None, max_length=255, description="英文名称")
    name_zh: Optional[str] = Field(None, max_length=255, description="中文名称")
    description: str = Field(..., min_length=1, description="产品描述")
    description_en: Optional[str] = Field(None, description="英文描述")
    description_zh: Optional[str] = Field(None, description="中文描述")
    price: float = Field(..., gt=0, description="价格")
    original_price: Optional[float] = Field(None, gt=0, description="原价")
    image_url: str = Field(..., description="主图片URL")
    images: Optional[str] = Field(None, description="多图片URLs")
    sku: Optional[str] = Field(None, max_length=100, description="商品编码")
    stock: Optional[int] = Field(0, ge=0, description="库存数量")
    tags: Optional[str] = Field(None, max_length=500, description="标签")
    is_featured: Optional[bool] = Field(False, description="是否精选")
    is_active: Optional[bool] = Field(True, description="是否启用")
    sort_order: Optional[int] = Field(0, description="排序")
    category_id: int = Field(..., description="分类ID")
    
    @validator('original_price')
    def validate_original_price(cls, v, values):
        if v is not None and 'price' in values and v <= values['price']:
            raise ValueError('原价必须大于销售价格')
        return v

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    name_en: Optional[str] = Field(None, max_length=255)
    name_zh: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = Field(None, min_length=1)
    description_en: Optional[str] = None
    description_zh: Optional[str] = None
    price: Optional[float] = Field(None, gt=0)
    original_price: Optional[float] = Field(None, gt=0)
    image_url: Optional[str] = None
    images: Optional[str] = None
    sku: Optional[str] = Field(None, max_length=100)
    stock_quantity: Optional[int] = Field(None, ge=0)
    tags: Optional[str] = Field(None, max_length=500)
    is_featured: Optional[bool] = None
    is_active: Optional[bool] = None
    sort_order: Optional[int] = None
    category_id: Optional[int] = None

class ProductResponse(ProductBase):
    id: int
    stock_quantity: Optional[int] = Field(None, ge=0, description="库存数量（前端兼容字段）")
    sales_count: int = 0
    view_count: int = 0
    rating: float = 0.0
    created_at: datetime
    updated_at: Optional[datetime] = None
    category: Optional[CategoryResponse] = None
    
    class Config:
        from_attributes = True

class ProductListResponse(BaseModel):
    items: List[ProductResponse]
    pagination: PaginationResponse

# 管理员相关模型
class AdminLogin(BaseModel):
    username: str = Field(..., min_length=1, max_length=100)
    password: str = Field(..., min_length=1)

class AdminCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=100)
    password: str = Field(..., min_length=6)
    email: Optional[str] = Field(None, pattern=r'^[\w\.-]+@[\w\.-]+\.\w+$')
    full_name: Optional[str] = Field(None, max_length=255)
    is_superuser: Optional[bool] = Field(False)

class AdminUpdate(BaseModel):
    username: Optional[str] = Field(None, min_length=3, max_length=100)
    password: Optional[str] = Field(None, min_length=6)
    email: Optional[str] = Field(None, pattern=r'^[\w\.-]+@[\w\.-]+\.\w+$')
    full_name: Optional[str] = Field(None, max_length=255)
    is_active: Optional[bool] = None
    is_superuser: Optional[bool] = None

class AdminResponse(BaseModel):
    id: int
    username: str
    email: Optional[str] = None
    full_name: Optional[str] = None
    is_active: bool
    is_superuser: bool
    last_login: Optional[datetime] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int

# 背景图相关模型
class BackgroundImageBase(BaseModel):
    title: Optional[str] = Field(None, max_length=255, description="标题（已废弃，使用title_zh）")
    title_en: Optional[str] = Field(None, max_length=255, description="英文标题")
    title_zh: Optional[str] = Field(None, max_length=255, description="中文标题")
    subtitle: Optional[str] = Field(None, max_length=500, description="副标题（已废弃，使用subtitle_zh）")
    subtitle_en: Optional[str] = Field(None, max_length=500, description="英文副标题")
    subtitle_zh: Optional[str] = Field(None, max_length=500, description="中文副标题")
    image_url: str = Field(..., description="背景图片URL")
    button_text: Optional[str] = Field(None, max_length=100, description="按钮文本（已废弃，使用button_text_zh）")
    button_text_en: Optional[str] = Field(None, max_length=100, description="英文按钮文本")
    button_text_zh: Optional[str] = Field(None, max_length=100, description="中文按钮文本")
    button_link: Optional[str] = Field(None, max_length=500, description="按钮链接")
    sort_order: Optional[int] = Field(0, description="排序")
    is_active: Optional[bool] = Field(True, description="是否启用")

class BackgroundImageCreate(BaseModel):
    title: Optional[str] = Field(None, max_length=255, description="标题（已废弃）")
    title_en: Optional[str] = Field(None, max_length=255, description="英文标题")
    title_zh: Optional[str] = Field(None, max_length=255, description="中文标题")
    subtitle: Optional[str] = Field(None, max_length=500, description="副标题（已废弃）")
    subtitle_en: Optional[str] = Field(None, max_length=500, description="英文副标题")
    subtitle_zh: Optional[str] = Field(None, max_length=500, description="中文副标题")
    image_url: str = Field(..., description="背景图片URL")
    button_text: Optional[str] = Field(None, max_length=100, description="按钮文本（已废弃）")
    button_text_en: Optional[str] = Field(None, max_length=100, description="英文按钮文本")
    button_text_zh: Optional[str] = Field(None, max_length=100, description="中文按钮文本")
    button_link: Optional[str] = Field(None, max_length=500, description="按钮链接")
    sort_order: Optional[int] = Field(0, description="排序")
    is_active: Optional[bool] = Field(True, description="是否启用")

class BackgroundImageUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    title_en: Optional[str] = Field(None, max_length=255)
    title_zh: Optional[str] = Field(None, max_length=255)
    subtitle: Optional[str] = Field(None, max_length=500)
    subtitle_en: Optional[str] = Field(None, max_length=500)
    subtitle_zh: Optional[str] = Field(None, max_length=500)
    image_url: Optional[str] = None
    button_text: Optional[str] = Field(None, max_length=100)
    button_text_en: Optional[str] = Field(None, max_length=100)
    button_text_zh: Optional[str] = Field(None, max_length=100)
    button_link: Optional[str] = Field(None, max_length=500)
    sort_order: Optional[int] = None
    is_active: Optional[bool] = None

class BackgroundImageResponse(BackgroundImageBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class BackgroundImageListResponse(BaseModel):
    items: List[BackgroundImageResponse]
    pagination: PaginationResponse

# 特色产品相关模型
class FeaturedProductBase(BaseModel):
    product_id: int = Field(..., description="产品ID")
    position: int = Field(..., ge=1, le=6, description="展示位置 (1-6)")
    is_active: Optional[bool] = Field(True, description="是否启用")

class FeaturedProductCreate(FeaturedProductBase):
    pass

class FeaturedProductUpdate(BaseModel):
    product_id: Optional[int] = Field(None, description="产品ID")
    position: Optional[int] = Field(None, ge=1, le=6, description="展示位置 (1-6)")
    is_active: Optional[bool] = Field(None, description="是否启用")

class FeaturedProductResponse(FeaturedProductBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    product: Optional[ProductResponse] = None
    
    class Config:
        from_attributes = True

class FeaturedProductListResponse(BaseModel):
    items: List[FeaturedProductResponse]
    pagination: PaginationResponse

# 简化的特色产品展示模型（用于前端展示）
class FeaturedProductDisplay(BaseModel):
    position: int
    product: Optional[ProductResponse] = None
