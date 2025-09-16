"""
添加轮播图文字框显示控制字段的迁移脚本
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from api.models.database import engine
from sqlalchemy import text

def add_show_content_box_field():
    """添加show_content_box字段到background_images表"""
    try:
        print("添加轮播图文字框显示控制字段...")
        
        with engine.connect() as connection:
            # 检查字段是否已存在
            result = connection.execute(text("""
                SELECT COUNT(*) as count
                FROM information_schema.columns 
                WHERE table_name = 'background_images' 
                AND column_name = 'show_content_box'
            """))
            
            field_exists = result.fetchone()[0] > 0
            
            if field_exists:
                print("✅ show_content_box字段已存在，跳过添加")
            else:
                # 添加字段
                connection.execute(text("""
                    ALTER TABLE background_images 
                    ADD COLUMN show_content_box BOOLEAN DEFAULT TRUE COMMENT '是否显示文字内容框'
                """))
                
                # 更新现有记录，默认都显示文字框
                connection.execute(text("""
                    UPDATE background_images 
                    SET show_content_box = TRUE 
                    WHERE show_content_box IS NULL
                """))
                
                connection.commit()
                print("✅ show_content_box字段添加成功!")
                
                # 验证添加结果
                result = connection.execute(text("""
                    SELECT COUNT(*) as count FROM background_images WHERE show_content_box = TRUE
                """))
                count = result.fetchone()[0]
                print(f"✅ 已有 {count} 条轮播图记录设置为显示文字框")
        
        print("🎉 轮播图文字框控制字段迁移完成!")
        return True
        
    except Exception as e:
        print(f"❌ 迁移失败: {str(e)}")
        return False

if __name__ == "__main__":
    success = add_show_content_box_field()
    if success:
        print("\n📋 使用说明：")
        print("   1. 访问管理后台的背景图管理")
        print("   2. 编辑轮播图时可以设置是否显示文字框")
        print("   3. 取消勾选则该轮播图不显示中间的文字内容框")
    else:
        print("\n❌ 迁移失败，请检查数据库连接")
        sys.exit(1)