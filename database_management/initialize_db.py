"""
新的数据库初始化脚本
"""

import os
import sys
from sqlalchemy.orm import Session
from api.models.database import engine, get_db
from api.models.models import Base, Admin, Category, Product
from api.utils.auth import hash_password
from config.config import Config, AdminConfig

def init_database():
    """初始化数据库"""
    print("🔧 开始初始化数据库...")
    
    # 创建所有表
    Base.metadata.create_all(bind=engine)
    print("✅ 数据库表创建完成")
    
    # 获取数据库会话
    db = next(get_db())
    
    try:
        # 创建默认管理员
        create_default_admin(db)
        
        # 创建示例分类
        create_sample_categories(db)
        
        # 提交分类数据，确保可以查询到
        db.commit()
        
        # 创建示例产品
        create_sample_products(db)
        
        db.commit()
        print("✅ 数据库初始化完成")
        
    except Exception as e:
        db.rollback()
        print(f"❌ 数据库初始化失败: {e}")
        raise
    finally:
        db.close()

def create_default_admin(db: Session):
    """创建默认管理员"""
    admin_config = AdminConfig()
    
    # 检查是否已存在管理员
    existing_admin = db.query(Admin).filter(
        Admin.username == admin_config.USERNAME
    ).first()
    
    if existing_admin:
        print(f"⚠️  管理员 '{admin_config.USERNAME}' 已存在，跳过创建")
        return
    
    # 创建默认管理员
    admin = Admin(
        username=admin_config.USERNAME,
        email=admin_config.EMAIL,
        full_name="系统管理员",
        password_hash=hash_password(admin_config.PASSWORD),
        is_active=True,
        is_superuser=True
    )
    
    db.add(admin)
    print(f"✅ 创建默认管理员: {admin_config.USERNAME}")

def create_sample_categories(db: Session):
    """创建示例分类"""
    sample_categories = [
        {
            "name": "电子产品",
            "name_en": "Electronics",
            "description": "各类电子产品和数码设备",
            "sort_order": 1
        },
        {
            "name": "家居用品",
            "name_en": "Home & Living",
            "description": "家居装饰和生活用品",
            "sort_order": 2
        },
        {
            "name": "服装配饰",
            "name_en": "Fashion",
            "description": "时尚服装和配饰用品",
            "sort_order": 3
        }
    ]
    
    for cat_data in sample_categories:
        # 检查分类是否已存在
        existing = db.query(Category).filter(Category.name == cat_data["name"]).first()
        if existing:
            continue
            
        category = Category(**cat_data)
        db.add(category)
    
    print("✅ 创建示例分类")

def create_sample_products(db: Session):
    """创建示例产品"""
    # 获取分类
    electronics = db.query(Category).filter(Category.name == "电子产品").first()
    home = db.query(Category).filter(Category.name == "家居用品").first()
    
    if not electronics or not home:
        print("⚠️  分类不存在，跳过创建示例产品")
        return
    
    sample_products = [
        {
            "name": "智能手机",
            "name_en": "Smartphone",
            "description": "最新款智能手机，配备高清摄像头和长续航电池",
            "description_en": "Latest smartphone with HD camera and long-lasting battery",
            "price": 2999.00,
            "category_id": electronics.id,
            "stock": 50,
            "sku": "SP001",
            "image_url": "https://via.placeholder.com/300x300?text=Smartphone",
            "is_active": True,
            "sort_order": 1
        },
        {
            "name": "无线蓝牙耳机",
            "name_en": "Wireless Bluetooth Earphones",
            "description": "高音质无线蓝牙耳机，支持降噪功能",
            "description_en": "High-quality wireless bluetooth earphones with noise cancellation",
            "price": 299.00,
            "category_id": electronics.id,
            "stock": 100,
            "sku": "BT001",
            "image_url": "https://via.placeholder.com/300x300?text=Earphones",
            "is_active": True,
            "sort_order": 2
        },
        {
            "name": "北欧风格台灯",
            "name_en": "Nordic Style Table Lamp",
            "description": "简约北欧风格台灯，适合现代家居装饰",
            "description_en": "Minimalist Nordic style table lamp, perfect for modern home decoration",
            "price": 199.00,
            "category_id": home.id,
            "stock": 30,
            "sku": "HL001",
            "image_url": "https://via.placeholder.com/300x300?text=Table+Lamp",
            "is_active": True,
            "sort_order": 1
        }
    ]
    
    for prod_data in sample_products:
        # 检查产品是否已存在
        existing = db.query(Product).filter(Product.sku == prod_data["sku"]).first()
        if existing:
            continue
            
        product = Product(**prod_data)
        db.add(product)
    
    print("✅ 创建示例产品")

if __name__ == "__main__":
    init_database()
