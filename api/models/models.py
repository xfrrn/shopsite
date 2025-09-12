"""
数据库模型定义
"""

from sqlalchemy import Column, Integer, String, Float, ForeignKey, Text, DateTime, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base

class Category(Base):
    __tablename__ = "categories"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(255), nullable=False, index=True, comment="分类名称")
    name_en = Column(String(255), nullable=True, comment="英文名称")
    name_zh = Column(String(255), nullable=True, comment="中文名称")
    description = Column(Text, nullable=True, comment="分类描述")
    description_en = Column(Text, nullable=True, comment="英文描述")
    icon_url = Column(String(500), nullable=True, comment="分类图标URL")
    sort_order = Column(Integer, default=0, comment="排序")
    is_active = Column(Boolean, default=True, comment="是否启用")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), comment="创建时间")
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), comment="更新时间")
    
    # 关联关系
    products = relationship("Product", back_populates="category")
    
    def __repr__(self):
        return f"<Category(id={self.id}, name='{self.name}')>"

class Product(Base):
    __tablename__ = "products"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(255), nullable=False, index=True, comment="产品名称")
    name_en = Column(String(255), nullable=True, comment="英文名称")
    name_zh = Column(String(255), nullable=True, comment="中文名称")
    description = Column(Text, nullable=False, comment="产品描述")
    description_en = Column(Text, nullable=True, comment="英文描述")
    description_zh = Column(Text, nullable=True, comment="中文描述")
    price = Column(Float, nullable=False, comment="价格")
    original_price = Column(Float, nullable=True, comment="原价")
    image_url = Column(String(500), nullable=False, comment="主图片URL")
    images = Column(Text, nullable=True, comment="多图片URLs，JSON格式")
    sku = Column(String(100), nullable=True, unique=True, comment="商品编码")
    stock = Column(Integer, default=0, comment="库存数量")
    sales_count = Column(Integer, default=0, comment="销售数量")
    view_count = Column(Integer, default=0, comment="浏览次数")
    rating = Column(Float, default=0.0, comment="评分")
    tags = Column(String(500), nullable=True, comment="标签，逗号分隔")
    is_featured = Column(Boolean, default=False, comment="是否精选")
    is_active = Column(Boolean, default=True, comment="是否启用")
    sort_order = Column(Integer, default=0, comment="排序")
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False, comment="分类ID")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), comment="创建时间")
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), comment="更新时间")
    
    # 关联关系
    category = relationship("Category", back_populates="products")
    featured_products = relationship("FeaturedProduct", back_populates="product")
    
    def __repr__(self):
        return f"<Product(id={self.id}, name='{self.name}', price={self.price})>"

class Admin(Base):
    __tablename__ = "admins"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    username = Column(String(100), nullable=False, unique=True, index=True, comment="用户名")
    password_hash = Column(String(255), nullable=False, comment="密码哈希")
    email = Column(String(255), nullable=True, comment="邮箱")
    full_name = Column(String(255), nullable=True, comment="全名")
    is_active = Column(Boolean, default=True, comment="是否启用")
    is_superuser = Column(Boolean, default=False, comment="是否超级管理员")
    last_login = Column(DateTime(timezone=True), nullable=True, comment="最后登录时间")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), comment="创建时间")
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), comment="更新时间")
    
    def __repr__(self):
        return f"<Admin(id={self.id}, username='{self.username}')>"

class BackgroundImage(Base):
    __tablename__ = "background_images"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String(255), nullable=False, comment="标题")
    title_en = Column(String(255), nullable=True, comment="英文标题")
    title_zh = Column(String(255), nullable=True, comment="中文标题")
    subtitle = Column(String(500), nullable=True, comment="副标题")
    subtitle_en = Column(String(500), nullable=True, comment="英文副标题")
    subtitle_zh = Column(String(500), nullable=True, comment="中文副标题")
    image_url = Column(String(500), nullable=False, comment="背景图片URL")
    button_text = Column(String(100), nullable=True, comment="按钮文本")
    button_text_en = Column(String(100), nullable=True, comment="英文按钮文本")
    button_text_zh = Column(String(100), nullable=True, comment="中文按钮文本")
    button_link = Column(String(500), nullable=True, comment="按钮链接")
    sort_order = Column(Integer, default=0, comment="排序")
    is_active = Column(Boolean, default=True, comment="是否启用")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), comment="创建时间")
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), comment="更新时间")
    
    def __repr__(self):
        return f"<BackgroundImage(id={self.id}, title='{self.title}')>"

class FeaturedProduct(Base):
    __tablename__ = "featured_products"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False, comment="产品ID")
    position = Column(Integer, nullable=False, comment="展示位置 (1-6)")
    is_active = Column(Boolean, default=True, comment="是否启用")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), comment="创建时间")
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), comment="更新时间")
    
    # 关联关系
    product = relationship("Product", back_populates="featured_products")
    
    def __repr__(self):
        return f"<FeaturedProduct(id={self.id}, product_id={self.product_id}, position={self.position})>"

class AboutUs(Base):
    __tablename__ = "about_us"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String(255), nullable=False, default="关于我们", comment="标题")
    title_en = Column(String(255), nullable=True, comment="英文标题")
    title_zh = Column(String(255), nullable=True, comment="中文标题")
    content = Column(Text, nullable=False, comment="内容")
    content_en = Column(Text, nullable=True, comment="英文内容")
    content_zh = Column(Text, nullable=True, comment="中文内容")
    background_image_url = Column(String(500), nullable=True, comment="背景图片URL")
    text_color = Column(String(20), default="#333333", comment="文字颜色")
    background_overlay = Column(String(50), default="rgba(255, 255, 255, 0.8)", comment="背景遮罩")
    is_active = Column(Boolean, default=True, comment="是否启用")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), comment="创建时间")
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), comment="更新时间")
    
    def __repr__(self):
        return f"<AboutUs(id={self.id}, title='{self.title}')>"

class TopInfoBar(Base):
    __tablename__ = "top_info_bar"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    phone = Column(String(50), nullable=True, comment="客服电话")
    email = Column(String(100), nullable=True, comment="客服邮箱")
    wechat_url = Column(String(500), nullable=True, comment="微信链接")
    wechat_qr = Column(String(500), nullable=True, comment="微信二维码URL")
    weibo_url = Column(String(500), nullable=True, comment="微博链接")
    qq_url = Column(String(500), nullable=True, comment="QQ链接")
    github_url = Column(String(500), nullable=True, comment="GitHub链接")
    linkedin_url = Column(String(500), nullable=True, comment="LinkedIn链接")
    is_active = Column(Boolean, default=True, comment="是否启用")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), comment="创建时间")
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), comment="更新时间")
    
    def __repr__(self):
        return f"<TopInfoBar(id={self.id}, phone='{self.phone}')>"
