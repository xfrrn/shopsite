#!/usr/bin/env python3
"""
数据库管理工具 - 批量执行脚本
提供便捷的数据库初始化和管理功能
"""

import os
import sys
import subprocess
from pathlib import Path

# 获取项目根目录
PROJECT_ROOT = Path(__file__).parent.parent
DATABASE_SCRIPTS_DIR = Path(__file__).parent

def run_script(script_name, description):
    """运行指定的脚本"""
    script_path = DATABASE_SCRIPTS_DIR / script_name
    if not script_path.exists():
        print(f"❌ 脚本不存在: {script_name}")
        return False
    
    print(f"🔄 正在执行: {description}")
    print(f"   脚本路径: {script_path}")
    
    try:
        # 切换到项目根目录执行脚本
        result = subprocess.run([sys.executable, str(script_path)], 
                              cwd=PROJECT_ROOT, 
                              capture_output=True, 
                              text=True)
        
        if result.returncode == 0:
            print(f"✅ {description} - 执行成功")
            if result.stdout:
                print(f"   输出: {result.stdout.strip()}")
            return True
        else:
            print(f"❌ {description} - 执行失败")
            if result.stderr:
                print(f"   错误: {result.stderr.strip()}")
            return False
    except Exception as e:
        print(f"❌ {description} - 执行异常: {str(e)}")
        return False

def full_initialization():
    """完整的数据库初始化流程"""
    print("=" * 60)
    print("🚀 开始完整数据库初始化流程")
    print("=" * 60)
    
    scripts = [
        ("initialize_db.py", "初始化数据库表结构"),
        ("init_featured_products.py", "初始化特色产品数据"),
        ("create_default_admin.py", "创建默认管理员账户"),
    ]
    
    success_count = 0
    total_count = len(scripts)
    
    for script_name, description in scripts:
        if run_script(script_name, description):
            success_count += 1
        print("-" * 40)
    
    print("=" * 60)
    print(f"📊 初始化完成: {success_count}/{total_count} 个脚本执行成功")
    print("=" * 60)
    
    return success_count == total_count

def run_migrations():
    """运行所有迁移脚本"""
    print("=" * 60)
    print("🔄 开始数据库迁移流程")
    print("=" * 60)
    
    migration_scripts = [
        ("migrate_about_us.py", "迁移关于我们功能"),
        ("migrate_add_show_content_box.py", "迁移轮播图文字框控制功能"),
        ("migrate_footer_info.py", "迁移页脚信息功能"),
        ("migrate_top_info_bar.py", "迁移顶部信息栏功能"),
    ]
    
    success_count = 0
    total_count = len(migration_scripts)
    
    for script_name, description in migration_scripts:
        if run_script(script_name, description):
            success_count += 1
        print("-" * 40)
    
    print("=" * 60)
    print(f"📊 迁移完成: {success_count}/{total_count} 个脚本执行成功")
    print("=" * 60)
    
    return success_count == total_count

def run_tests():
    """运行数据库测试脚本"""
    print("=" * 60)
    print("🧪 开始数据库测试流程")
    print("=" * 60)
    
    test_scripts = [
        ("test_db.py", "测试数据库连接"),
        ("simple_check.py", "检查数据库状态"),
        ("debug_database.py", "数据库调试检查"),
    ]
    
    success_count = 0
    total_count = len(test_scripts)
    
    for script_name, description in test_scripts:
        if run_script(script_name, description):
            success_count += 1
        print("-" * 40)
    
    print("=" * 60)
    print(f"📊 测试完成: {success_count}/{total_count} 个脚本执行成功")
    print("=" * 60)

def show_menu():
    """显示操作菜单"""
    print("\n" + "=" * 60)
    print("🗄️  数据库管理工具")
    print("=" * 60)
    print("1. 完整初始化 (推荐首次使用)")
    print("2. 仅运行迁移脚本")
    print("3. 运行测试脚本")
    print("4. 单独执行脚本")
    print("5. 查看所有可用脚本")
    print("0. 退出")
    print("=" * 60)

def list_available_scripts():
    """列出所有可用的脚本"""
    print("\n" + "=" * 60)
    print("📋 可用脚本列表")
    print("=" * 60)
    
    script_categories = {
        "初始化脚本": [
            ("initialize_db.py", "主数据库初始化脚本"),
            ("init_featured_products.py", "初始化特色产品数据"),
            ("create_default_admin.py", "创建默认管理员账户"),
        ],
        "迁移脚本": [
            ("migrate_about_us.py", "添加关于我们功能"),
            ("migrate_add_show_content_box.py", "添加轮播图文字框控制"),
            ("migrate_footer_info.py", "添加页脚信息管理"),
            ("migrate_top_info_bar.py", "添加顶部信息栏"),
        ],
        "测试和调试": [
            ("test_db.py", "测试数据库连接"),
            ("simple_check.py", "简单状态检查"),
            ("debug_database.py", "数据库调试工具"),
        ]
    }
    
    for category, scripts in script_categories.items():
        print(f"\n🔹 {category}:")
        for script_name, description in scripts:
            exists = "✅" if (DATABASE_SCRIPTS_DIR / script_name).exists() else "❌"
            print(f"   {exists} {script_name:<30} - {description}")

def run_single_script():
    """单独执行指定脚本"""
    list_available_scripts()
    print("\n" + "-" * 60)
    script_name = input("请输入要执行的脚本名称: ").strip()
    
    if not script_name:
        print("❌ 脚本名称不能为空")
        return
    
    if not script_name.endswith('.py'):
        script_name += '.py'
    
    description = f"执行脚本: {script_name}"
    run_script(script_name, description)

def main():
    """主函数"""
    print(f"📁 当前工作目录: {PROJECT_ROOT}")
    print(f"📁 脚本目录: {DATABASE_SCRIPTS_DIR}")
    
    while True:
        show_menu()
        choice = input("\n请选择操作 (0-5): ").strip()
        
        if choice == '0':
            print("👋 再见!")
            break
        elif choice == '1':
            full_initialization()
        elif choice == '2':
            run_migrations()
        elif choice == '3':
            run_tests()
        elif choice == '4':
            run_single_script()
        elif choice == '5':
            list_available_scripts()
        else:
            print("❌ 无效选择，请重新输入")
        
        input("\n按回车键继续...")

if __name__ == "__main__":
    main()