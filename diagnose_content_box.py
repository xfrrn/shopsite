#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
检查API和数据库的一致性
"""

import requests
import json
import sys
import os

# 添加项目根目录到Python路径
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from api.models.database import SessionLocal
from api.models.models import BackgroundImage

def check_database():
    """检查数据库"""
    print("📊 检查数据库数据...")
    
    with SessionLocal() as session:
        bg_images = session.query(BackgroundImage)\
            .order_by(BackgroundImage.sort_order, BackgroundImage.created_at.desc())\
            .all()
        
        print(f"数据库中共有 {len(bg_images)} 个背景图:")
        for img in bg_images:
            print(f"  ID:{img.id}, Title:'{img.title_zh}', show_content_box:{img.show_content_box}, active:{img.is_active}")
    
    return bg_images

def check_api():
    """检查API响应"""
    print("\n🌐 检查API响应...")
    
    try:
        response = requests.get('http://localhost:8000/api/background-images/', timeout=5)
        
        if response.status_code == 200:
            data = response.json()
            print(f"API返回 {len(data['items'])} 个背景图:")
            for item in data['items']:
                print(f"  ID:{item['id']}, Title:'{item['title_zh']}', show_content_box:{item['show_content_box']}, active:{item['is_active']}")
            return data['items']
        else:
            print(f"❌ API请求失败: HTTP {response.status_code}")
            print(f"响应内容: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ 无法连接API: {str(e)}")
        print("💡 请确保服务器正在运行: python main.py")
        return None

def check_frontend_logic():
    """检查前端逻辑"""
    print("\n💻 检查前端JavaScript逻辑...")
    
    js_file = "web/js/hero-carousel.js"
    try:
        with open(js_file, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # 查找关键逻辑
        if "show_content_box === true" in content:
            print("✅ 前端逻辑正确: 使用严格比较 show_content_box === true")
        elif "show_content_box !== false" in content:
            print("❌ 前端逻辑有问题: 仍在使用 show_content_box !== false")
        else:
            print("⚠️  无法找到show_content_box逻辑")
            
        # 查找showContentBox方法
        if "showContentBox(show)" in content:
            print("✅ 找到showContentBox方法")
        else:
            print("❌ 缺少showContentBox方法")
            
    except Exception as e:
        print(f"❌ 读取JavaScript文件失败: {str(e)}")

if __name__ == "__main__":
    print("🔍 轮播图文字框功能诊断")
    print("=" * 50)
    
    # 1. 检查数据库
    db_data = check_database()
    
    # 2. 检查API
    api_data = check_api()
    
    # 3. 检查前端逻辑
    check_frontend_logic()
    
    # 4. 对比分析
    print("\n🔍 诊断结果:")
    if api_data:
        if len(db_data) == len(api_data):
            print("✅ 数据库和API数量一致")
            
            # 检查每条记录的show_content_box
            for i, (db_item, api_item) in enumerate(zip(db_data, api_data)):
                if db_item.show_content_box == api_item['show_content_box']:
                    print(f"✅ 记录{i+1} show_content_box 一致: {db_item.show_content_box}")
                else:
                    print(f"❌ 记录{i+1} show_content_box 不一致:")
                    print(f"   数据库: {db_item.show_content_box}")
                    print(f"   API: {api_item['show_content_box']}")
        else:
            print(f"❌ 数据库({len(db_data)})和API({len(api_data)})数量不一致")
    else:
        print("❌ 无法获取API数据，请检查服务器状态")
    
    print("\n💡 建议操作:")
    print("1. 重启服务器: python main.py")
    print("2. 清除浏览器缓存: Ctrl+F5")
    print("3. 查看浏览器开发者工具控制台")