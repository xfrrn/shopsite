#!/usr/bin/env python3
"""
快速创建默认管理员账号
适用于初始化系统时使用
"""

import sys
import os
from datetime import datetime

# 添加项目根目录到Python路径
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from sqlalchemy.orm import sessionmaker
    from api.models.database import engine
    from api.models.models import Admin
    from api.utils.auth import get_password_hash
except ImportError as e:
    print(f"❌ 导入错误: {e}")
    print("请确保在项目根目录运行此脚本，并已安装所有依赖包")
    sys.exit(1)

def create_default_admin():
    """创建默认管理员账号"""
    
    # 默认管理员信息
    DEFAULT_ADMIN = {
        "username": "admin",
        "password": "admin123",
        "full_name": "系统管理员",
        "email": "admin@example.com"
    }
    
    print("🚀 创建默认管理员账号...")
    print(f"用户名: {DEFAULT_ADMIN['username']}")
    print(f"密码: {DEFAULT_ADMIN['password']}")
    print(f"全名: {DEFAULT_ADMIN['full_name']}")
    print(f"邮箱: {DEFAULT_ADMIN['email']}")
    
    try:
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        db = SessionLocal()
        
        # 检查是否已存在管理员
        existing_admin = db.query(Admin).filter(Admin.username == DEFAULT_ADMIN['username']).first()
        if existing_admin:
            print(f"⚠️  管理员 '{DEFAULT_ADMIN['username']}' 已存在")
            
            # 询问是否重置密码
            response = input("是否重置密码? (y/N): ").strip().lower()
            if response in ['y', 'yes']:
                existing_admin.password_hash = get_password_hash(DEFAULT_ADMIN['password'])
                existing_admin.updated_at = datetime.now()
                db.commit()
                print(f"✅ 管理员 '{DEFAULT_ADMIN['username']}' 密码已重置")
            else:
                print("ℹ️  跳过密码重置")
            
            db.close()
            return
        
        # 创建新管理员
        hashed_password = get_password_hash(DEFAULT_ADMIN['password'])
        new_admin = Admin(
            username=DEFAULT_ADMIN['username'],
            password_hash=hashed_password,
            full_name=DEFAULT_ADMIN['full_name'],
            email=DEFAULT_ADMIN['email'],
            is_active=True,
            created_at=datetime.now()
        )
        
        db.add(new_admin)
        db.commit()
        db.refresh(new_admin)
        
        print(f"✅ 默认管理员创建成功!")
        print(f"   ID: {new_admin.id}")
        print(f"   创建时间: {new_admin.created_at}")
        
        # 显示登录信息
        print("\n🔑 登录信息:")
        print(f"   用户名: {DEFAULT_ADMIN['username']}")
        print(f"   密码: {DEFAULT_ADMIN['password']}")
        print("\n⚠️  请及时修改默认密码以确保安全!")
        
        db.close()
        
    except Exception as e:
        print(f"❌ 创建管理员失败: {e}")
        if 'db' in locals():
            db.rollback()
            db.close()

def main():
    print("🛠️  默认管理员创建工具")
    print("=" * 40)
    
    create_default_admin()

if __name__ == "__main__":
    main()
