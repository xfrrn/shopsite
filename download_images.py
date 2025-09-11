#!/usr/bin/env python3
"""
下载占位图片
"""

import os
import urllib.request
import urllib.error

def download_placeholder_images():
    """下载占位图片"""
    
    # 图片URLs
    images = {
        'default-product.jpg': 'https://via.placeholder.com/300x300/f8f9fa/6c757d.jpg?text=Product',
        'placeholder-product.jpg': 'https://via.placeholder.com/300x300/e9ecef/6c757d.jpg?text=Product+Image'
    }
    
    # 确保images目录存在
    images_dir = 'web/images'
    os.makedirs(images_dir, exist_ok=True)
    
    print("📷 开始下载占位图片...")
    
    for filename, url in images.items():
        filepath = os.path.join(images_dir, filename)
        
        try:
            print(f"  正在下载: {filename}")
            urllib.request.urlretrieve(url, filepath)
            print(f"  ✅ 成功: {filename}")
            
        except urllib.error.URLError as e:
            print(f"  ❌ 失败: {filename} - {e}")
        except Exception as e:
            print(f"  ❌ 错误: {filename} - {e}")
    
    print("📷 占位图片下载完成!")

if __name__ == "__main__":
    download_placeholder_images()
