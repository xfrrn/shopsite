#!/usr/bin/env python3
"""
API调试脚本 - 测试所有关键API端点
"""

import requests
import json
from datetime import datetime

# 服务器配置
BASE_URL = "http://localhost:8000"

def test_api_endpoint(endpoint, method="GET", headers=None, data=None):
    """测试API端点"""
    url = f"{BASE_URL}{endpoint}"
    print(f"\n{'='*50}")
    print(f"测试: {method} {url}")
    print(f"时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    try:
        if method == "GET":
            response = requests.get(url, headers=headers, timeout=10)
        elif method == "POST":
            response = requests.post(url, headers=headers, json=data, timeout=10)
        
        print(f"状态码: {response.status_code}")
        print(f"响应头: {dict(response.headers)}")
        
        if response.status_code == 200:
            try:
                json_data = response.json()
                print(f"响应数据: {json.dumps(json_data, indent=2, ensure_ascii=False)[:500]}...")
                return True, json_data
            except:
                print(f"响应文本: {response.text[:200]}...")
                return True, response.text
        else:
            print(f"错误响应: {response.text}")
            return False, response.text
            
    except Exception as e:
        print(f"请求异常: {str(e)}")
        return False, str(e)

def main():
    print("🚀 开始API调试测试")
    print(f"服务器: {BASE_URL}")
    
    # 测试关键API端点
    test_cases = [
        # 基础健康检查
        ("/", "GET"),
        
        # 数据库相关API
        ("/api/categories/", "GET"),
        ("/api/products/", "GET"),
        ("/api/featured-products/", "GET"),
        ("/api/background-images/", "GET"),
        
        # 管理员API（需要认证，预期401错误）
        ("/api/admin/products/", "GET"),
        ("/api/admin/categories/", "GET"),
        ("/api/admin/featured-products/", "GET"),
        
        # 登录API测试
        ("/api/auth/login", "POST", {"username": "admin", "password": "admin123"}),
    ]
    
    results = {}
    for i, test_case in enumerate(test_cases, 1):
        endpoint = test_case[0]
        method = test_case[1]
        data = test_case[2] if len(test_case) > 2 else None
        
        print(f"\n[{i}/{len(test_cases)}] ", end="")
        success, response = test_api_endpoint(endpoint, method, data=data)
        results[endpoint] = {"success": success, "response": response}
    
    # 总结报告
    print(f"\n{'='*50}")
    print("📊 测试总结报告")
    print(f"{'='*50}")
    
    successful = sum(1 for r in results.values() if r["success"])
    total = len(results)
    
    print(f"成功: {successful}/{total}")
    print(f"失败: {total - successful}/{total}")
    
    print(f"\n❌ 失败的端点:")
    for endpoint, result in results.items():
        if not result["success"]:
            print(f"  - {endpoint}: {result['response']}")
    
    print(f"\n✅ 成功的端点:")
    for endpoint, result in results.items():
        if result["success"]:
            print(f"  - {endpoint}")

if __name__ == "__main__":
    main()
