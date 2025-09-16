"""
添加关于我们表的数据库迁移脚本
"""

import sys
import os

# 添加项目根目录到Python路径
project_root = os.path.dirname(os.path.abspath(__file__))
sys.path.append(project_root)

from api.models.database import engine, Base
from api.models.models import AboutUs
from sqlalchemy import text

def create_about_us_table():
    """创建关于我们表"""
    try:
        # 创建表
        Base.metadata.create_all(bind=engine, tables=[AboutUs.__table__])
        print("✅ 关于我们表创建成功")
        
        # 插入默认数据
        from api.models.database import SessionLocal
        db = SessionLocal()
        
        try:
            # 检查是否已有数据
            existing = db.query(AboutUs).first()
            if not existing:
                default_about_us = AboutUs(
                    title="关于我们",
                    title_en="About Us",
                    title_zh="关于我们",
                    content="我们致力于为客户提供高质量的产品和优质的服务体验。\n\n通过持续的创新和改进，我们不断满足客户的需求，创造更大的价值。",
                    content_en="We are committed to providing customers with high-quality products and excellent service experience.\n\nThrough continuous innovation and improvement, we constantly meet customer needs and create greater value.",
                    content_zh="我们致力于为客户提供高质量的产品和优质的服务体验。\n\n通过持续的创新和改进，我们不断满足客户的需求，创造更大的价值。",
                    background_image_url=None,
                    text_color="#333333",
                    background_overlay="rgba(255, 255, 255, 0.8)",
                    is_active=True
                )
                
                db.add(default_about_us)
                db.commit()
                print("✅ 默认关于我们数据插入成功")
            else:
                print("ℹ️ 关于我们数据已存在，跳过插入")
                
        except Exception as e:
            db.rollback()
            print(f"❌ 插入默认数据失败: {e}")
        finally:
            db.close()
            
    except Exception as e:
        print(f"❌ 创建关于我们表失败: {e}")
        return False
    
    return True

if __name__ == "__main__":
    print("开始创建关于我们表...")
    success = create_about_us_table()
    if success:
        print("🎉 关于我们表创建完成！")
    else:
        print("💥 创建过程中出现错误，请检查数据库连接和配置")