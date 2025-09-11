#!/usr/bin/env python3
"""
管理员账号管理工具
用于添加新管理员账号或修改现有管理员密码
"""

import sys
import os
import getpass
import argparse
from datetime import datetime

# 添加项目根目录到Python路径
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from sqlalchemy.orm import sessionmaker
    from api.models.database import engine
    from api.models.models import Admin
    from api.utils.auth import get_password_hash, verify_password
except ImportError as e:
    print(f"❌ 导入错误: {e}")
    print("请确保在项目根目录运行此脚本，并已安装所有依赖包")
    sys.exit(1)

class AdminManager:
    def __init__(self):
        """初始化管理员管理器"""
        self.SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    
    def test_database_connection(self):
        """测试数据库连接"""
        try:
            db = self.SessionLocal()
            # 尝试查询管理员表
            db.query(Admin).count()
            db.close()
            return True
        except Exception as e:
            print(f"❌ 数据库连接失败: {e}")
            return False
    
    def list_admins(self):
        """列出所有管理员"""
        print("\n👥 当前管理员列表:")
        print("-" * 60)
        
        try:
            db = self.SessionLocal()
            admins = db.query(Admin).all()
            
            if not admins:
                print("📭 暂无管理员账号")
                return
            
            for admin in admins:
                status = "🟢 启用" if admin.is_active else "🔴 禁用"
                last_login = admin.last_login.strftime("%Y-%m-%d %H:%M:%S") if admin.last_login else "从未登录"
                
                print(f"ID: {admin.id}")
                print(f"用户名: {admin.username}")
                print(f"全名: {admin.full_name or '未设置'}")
                print(f"邮箱: {admin.email or '未设置'}")
                print(f"状态: {status}")
                print(f"创建时间: {admin.created_at.strftime('%Y-%m-%d %H:%M:%S')}")
                print(f"最后登录: {last_login}")
                print("-" * 60)
                
        except Exception as e:
            print(f"❌ 查询管理员失败: {e}")
        finally:
            db.close()
    
    def get_admin_by_username(self, username):
        """根据用户名查找管理员"""
        try:
            db = self.SessionLocal()
            admin = db.query(Admin).filter(Admin.username == username).first()
            db.close()
            return admin
        except Exception as e:
            print(f"❌ 查询管理员失败: {e}")
            return None
    
    def create_admin(self, username, password, full_name=None, email=None):
        """创建新管理员"""
        try:
            # 检查用户名是否已存在
            if self.get_admin_by_username(username):
                print(f"❌ 用户名 '{username}' 已存在")
                return False
            
            db = self.SessionLocal()
            
            # 创建新管理员
            hashed_password = get_password_hash(password)
            new_admin = Admin(
                username=username,
                password_hash=hashed_password,
                full_name=full_name,
                email=email,
                is_active=True,
                created_at=datetime.now()
            )
            
            db.add(new_admin)
            db.commit()
            db.refresh(new_admin)
            
            print(f"✅ 管理员 '{username}' 创建成功")
            print(f"   ID: {new_admin.id}")
            print(f"   全名: {full_name or '未设置'}")
            print(f"   邮箱: {email or '未设置'}")
            
            db.close()
            return True
            
        except Exception as e:
            print(f"❌ 创建管理员失败: {e}")
            if 'db' in locals():
                db.rollback()
                db.close()
            return False
    
    def update_password(self, username, new_password):
        """更新管理员密码"""
        try:
            db = self.SessionLocal()
            admin = db.query(Admin).filter(Admin.username == username).first()
            
            if not admin:
                print(f"❌ 用户名 '{username}' 不存在")
                return False
            
            # 更新密码
            admin.password_hash = get_password_hash(new_password)
            admin.updated_at = datetime.now()
            
            db.commit()
            print(f"✅ 管理员 '{username}' 密码更新成功")
            
            db.close()
            return True
            
        except Exception as e:
            print(f"❌ 更新密码失败: {e}")
            if 'db' in locals():
                db.rollback()
                db.close()
            return False
    
    def update_admin_info(self, username, full_name=None, email=None):
        """更新管理员信息"""
        try:
            db = self.SessionLocal()
            admin = db.query(Admin).filter(Admin.username == username).first()
            
            if not admin:
                print(f"❌ 用户名 '{username}' 不存在")
                return False
            
            # 更新信息
            if full_name is not None:
                admin.full_name = full_name
            if email is not None:
                admin.email = email
            admin.updated_at = datetime.now()
            
            db.commit()
            print(f"✅ 管理员 '{username}' 信息更新成功")
            
            db.close()
            return True
            
        except Exception as e:
            print(f"❌ 更新信息失败: {e}")
            if 'db' in locals():
                db.rollback()
                db.close()
            return False
    
    def toggle_admin_status(self, username):
        """切换管理员启用/禁用状态"""
        try:
            db = self.SessionLocal()
            admin = db.query(Admin).filter(Admin.username == username).first()
            
            if not admin:
                print(f"❌ 用户名 '{username}' 不存在")
                return False
            
            # 切换状态
            admin.is_active = not admin.is_active
            admin.updated_at = datetime.now()
            
            db.commit()
            status = "启用" if admin.is_active else "禁用"
            print(f"✅ 管理员 '{username}' 已{status}")
            
            db.close()
            return True
            
        except Exception as e:
            print(f"❌ 切换状态失败: {e}")
            if 'db' in locals():
                db.rollback()
                db.close()
            return False
    
    def verify_admin_password(self, username, password):
        """验证管理员密码"""
        try:
            db = self.SessionLocal()
            admin = db.query(Admin).filter(Admin.username == username).first()
            
            if not admin:
                print(f"❌ 用户名 '{username}' 不存在")
                return False
            
            is_valid = verify_password(password, admin.password_hash)
            if is_valid:
                print(f"✅ 管理员 '{username}' 密码验证成功")
            else:
                print(f"❌ 管理员 '{username}' 密码验证失败")
            
            db.close()
            return is_valid
            
        except Exception as e:
            print(f"❌ 密码验证失败: {e}")
            return False

def interactive_mode():
    """交互式模式"""
    manager = AdminManager()
    
    print("🛠️  管理员账号管理工具")
    print("=" * 50)
    
    # 测试数据库连接
    if not manager.test_database_connection():
        print("请检查数据库配置和连接")
        return
    
    while True:
        print("\n📋 请选择操作:")
        print("1. 📝 创建新管理员")
        print("2. 🔑 修改管理员密码")
        print("3. ✏️  修改管理员信息")
        print("4. 👥 查看所有管理员")
        print("5. 🔄 切换管理员状态")
        print("6. 🔍 验证管理员密码")
        print("0. 🚪 退出")
        
        choice = input("\n请输入选项 (0-6): ").strip()
        
        if choice == "1":
            # 创建新管理员
            print("\n📝 创建新管理员")
            username = input("用户名: ").strip()
            if not username:
                print("❌ 用户名不能为空")
                continue
            
            password = getpass.getpass("密码: ")
            if not password:
                print("❌ 密码不能为空")
                continue
            
            confirm_password = getpass.getpass("确认密码: ")
            if password != confirm_password:
                print("❌ 两次输入的密码不一致")
                continue
            
            full_name = input("全名 (可选): ").strip() or None
            email = input("邮箱 (可选): ").strip() or None
            
            manager.create_admin(username, password, full_name, email)
        
        elif choice == "2":
            # 修改密码
            print("\n🔑 修改管理员密码")
            username = input("用户名: ").strip()
            if not username:
                print("❌ 用户名不能为空")
                continue
            
            new_password = getpass.getpass("新密码: ")
            if not new_password:
                print("❌ 密码不能为空")
                continue
            
            confirm_password = getpass.getpass("确认新密码: ")
            if new_password != confirm_password:
                print("❌ 两次输入的密码不一致")
                continue
            
            manager.update_password(username, new_password)
        
        elif choice == "3":
            # 修改信息
            print("\n✏️  修改管理员信息")
            username = input("用户名: ").strip()
            if not username:
                print("❌ 用户名不能为空")
                continue
            
            full_name = input("全名 (留空跳过): ").strip() or None
            email = input("邮箱 (留空跳过): ").strip() or None
            
            if full_name or email:
                manager.update_admin_info(username, full_name, email)
            else:
                print("ℹ️  没有要更新的信息")
        
        elif choice == "4":
            # 查看所有管理员
            manager.list_admins()
        
        elif choice == "5":
            # 切换状态
            print("\n🔄 切换管理员状态")
            username = input("用户名: ").strip()
            if not username:
                print("❌ 用户名不能为空")
                continue
            
            manager.toggle_admin_status(username)
        
        elif choice == "6":
            # 验证密码
            print("\n🔍 验证管理员密码")
            username = input("用户名: ").strip()
            if not username:
                print("❌ 用户名不能为空")
                continue
            
            password = getpass.getpass("密码: ")
            manager.verify_admin_password(username, password)
        
        elif choice == "0":
            print("👋 再见!")
            break
        
        else:
            print("❌ 无效选项，请重新选择")

def main():
    """主函数"""
    parser = argparse.ArgumentParser(description="管理员账号管理工具")
    parser.add_argument("--create", metavar="USERNAME", help="创建新管理员")
    parser.add_argument("--password", metavar="PASSWORD", help="设置密码 (与--create一起使用)")
    parser.add_argument("--update-password", metavar="USERNAME", help="更新管理员密码")
    parser.add_argument("--list", action="store_true", help="列出所有管理员")
    parser.add_argument("--verify", metavar="USERNAME", help="验证管理员密码")
    parser.add_argument("--full-name", metavar="NAME", help="全名")
    parser.add_argument("--email", metavar="EMAIL", help="邮箱")
    
    args = parser.parse_args()
    
    manager = AdminManager()
    
    # 测试数据库连接
    if not manager.test_database_connection():
        print("请检查数据库配置和连接")
        return
    
    if args.create:
        # 命令行创建管理员
        password = args.password
        if not password:
            password = getpass.getpass(f"请输入管理员 '{args.create}' 的密码: ")
        
        manager.create_admin(args.create, password, args.full_name, args.email)
    
    elif args.update_password:
        # 命令行更新密码
        new_password = getpass.getpass(f"请输入管理员 '{args.update_password}' 的新密码: ")
        manager.update_password(args.update_password, new_password)
    
    elif args.list:
        # 命令行列出管理员
        manager.list_admins()
    
    elif args.verify:
        # 命令行验证密码
        password = getpass.getpass(f"请输入管理员 '{args.verify}' 的密码: ")
        manager.verify_admin_password(args.verify, password)
    
    else:
        # 交互式模式
        interactive_mode()

if __name__ == "__main__":
    main()
