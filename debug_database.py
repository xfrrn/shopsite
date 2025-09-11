#!/usr/bin/env python3
"""
数据库调试脚本 - 检查数据库连接和数据
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from api.models.database import get_db, engine
from api.models.models import Product, Category, FeaturedProduct

def test_database_connection():
    """测试数据库连接"""
    print("🔗 测试数据库连接...")
    
    try:
        # 测试基本连接
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1"))
            print("✅ 数据库连接成功")
            
        # 测试数据库名称
        with engine.connect() as conn:
            result = conn.execute(text("SELECT DATABASE()"))
            db_name = result.fetchone()[0]
            print(f"📊 当前数据库: {db_name}")
            
        return True
    except Exception as e:
        print(f"❌ 数据库连接失败: {e}")
        return False

def test_tables_and_data():
    """测试表结构和数据"""
    print("\n📋 检查表和数据...")
    
    try:
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        db = SessionLocal()
        
        # 检查分类表
        categories = db.query(Category).all()
        print(f"📂 分类数量: {len(categories)}")
        for cat in categories[:3]:  # 显示前3个
            print(f"  - ID: {cat.id}, 名称: {cat.name}, 状态: {'启用' if cat.is_active else '禁用'}")
        
        # 检查产品表
        products = db.query(Product).all()
        print(f"📦 产品数量: {len(products)}")
        for prod in products[:3]:  # 显示前3个
            print(f"  - ID: {prod.id}, 名称: {prod.name}, 价格: {prod.price}, 状态: {'上架' if prod.is_active else '下架'}")
        
        # 检查特色产品表
        featured = db.query(FeaturedProduct).all()
        print(f"⭐ 特色产品数量: {len(featured)}")
        for fp in featured:
            product = db.query(Product).filter(Product.id == fp.product_id).first()
            print(f"  - 位置: {fp.position}, 产品: {product.name if product else '产品不存在'}, 状态: {'启用' if fp.is_active else '禁用'}")
        
        db.close()
        return True
        
    except Exception as e:
        print(f"❌ 数据检查失败: {e}")
        return False

def main():
    print("🚀 开始数据库调试")
    
    # 测试连接
    if not test_database_connection():
        return
    
    # 测试数据
    test_tables_and_data()
    
    print("\n✅ 数据库调试完成")

if __name__ == "__main__":
    main()
