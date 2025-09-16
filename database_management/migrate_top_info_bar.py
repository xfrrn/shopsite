"""
添加顶部信息栏表的数据库迁移脚本
"""

import sys
import os

# 添加项目根目录到Python路径
project_root = os.path.dirname(os.path.abspath(__file__))
sys.path.append(project_root)

from api.models.database import engine, Base
from api.models.models import TopInfoBar
from sqlalchemy import text

def create_top_info_bar_table():
    """创建顶部信息栏表"""
    try:
        # 创建表
        Base.metadata.create_all(bind=engine, tables=[TopInfoBar.__table__])
        print("✅ 顶部信息栏表创建成功")
        
        # 插入默认数据
        from api.models.database import SessionLocal
        db = SessionLocal()
        
        try:
            # 检查是否已有数据
            existing = db.query(TopInfoBar).first()
            if not existing:
                default_top_info = TopInfoBar(
                    phone="400-123-4567",
                    email="service@example.com",
                    wechat_url="#",
                    wechat_qr=None,
                    weibo_url="https://weibo.com/",
                    qq_url="https://qzone.qq.com/",
                    github_url="https://github.com/",
                    linkedin_url="https://linkedin.com/",
                    is_active=True
                )
                
                db.add(default_top_info)
                db.commit()
                print("✅ 默认顶部信息栏数据插入成功")
            else:
                print("ℹ️ 顶部信息栏数据已存在，跳过插入")
                
        except Exception as e:
            db.rollback()
            print(f"❌ 插入默认数据失败: {e}")
        finally:
            db.close()
            
    except Exception as e:
        print(f"❌ 创建顶部信息栏表失败: {e}")
        return False
    
    return True

if __name__ == "__main__":
    print("开始创建顶部信息栏表...")
    success = create_top_info_bar_table()
    if success:
        print("🎉 顶部信息栏表创建完成！")
    else:
        print("💥 创建过程中出现错误，请检查数据库连接和配置")