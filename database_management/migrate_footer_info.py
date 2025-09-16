"""
创建页脚信息表的迁移脚本
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from api.models.database import engine, Base
from api.models.models import FooterInfo
from sqlalchemy import text

def create_footer_info_table():
    """创建页脚信息表"""
    try:
        print("创建页脚信息表...")
        
        # 创建表
        Base.metadata.create_all(bind=engine, tables=[FooterInfo.__table__])
        
        print("✅ 页脚信息表创建成功!")
        
        # 插入默认数据
        from sqlalchemy.orm import sessionmaker
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        db = SessionLocal()
        
        try:
            # 检查是否已有数据
            existing = db.query(FooterInfo).first()
            if not existing:
                default_footer = FooterInfo(
                    about_title="关于我们",
                    about_title_en="About Us",
                    about_content="我们致力于为客户提供高质量的产品和优质的服务体验，通过持续的创新和改进，我们不断满足客户的需求。",
                    about_content_en="We are committed to providing customers with high-quality products and excellent service experience. Through continuous innovation and improvement, we constantly meet customer needs.",
                    contact_title="联系我们",
                    contact_title_en="Contact Us",
                    contact_email="info@example.com",
                    contact_phone="+86 123 4567 8900",
                    contact_address="中国，上海市",
                    contact_address_en="Shanghai, China",
                    social_title="关注我们",
                    social_title_en="Follow Us",
                    quick_links_title="快速链接",
                    quick_links_title_en="Quick Links",
                    copyright_text="© 2024 产品展示网站. 保留所有权利.",
                    copyright_text_en="© 2024 Product Showcase Website. All rights reserved."
                )
                db.add(default_footer)
                db.commit()
                print("✅ 默认页脚数据插入成功!")
            else:
                print("✅ 页脚数据已存在，跳过插入")
                
        except Exception as e:
            print(f"❌ 插入默认数据失败: {e}")
            db.rollback()
        finally:
            db.close()
            
    except Exception as e:
        print(f"❌ 创建页脚信息表失败: {e}")
        raise

if __name__ == "__main__":
    create_footer_info_table()
    print("🎉 页脚信息表迁移完成!")