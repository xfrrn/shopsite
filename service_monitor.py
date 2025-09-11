#!/usr/bin/env python3
"""
服务监控脚本
用于监控网站各个组件的运行状态
"""

import requests
import time
import threading
import sqlite3
import json
from datetime import datetime
import os
import sys

class ServiceMonitor:
    def __init__(self):
        self.base_url = "http://localhost:8000"
        self.monitoring = True
        self.stats = {
            "api_health": {"status": "unknown", "last_check": None},
            "database": {"status": "unknown", "last_check": None},
            "main_page": {"status": "unknown", "last_check": None},
            "admin_page": {"status": "unknown", "last_check": None}
        }
        
        # 创建监控日志数据库
        self.init_monitor_db()
    
    def init_monitor_db(self):
        """初始化监控数据库"""
        try:
            self.db_conn = sqlite3.connect('monitor.db', check_same_thread=False)
            cursor = self.db_conn.cursor()
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS service_logs (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    timestamp TEXT,
                    service TEXT,
                    status TEXT,
                    response_time REAL,
                    details TEXT
                )
            ''')
            self.db_conn.commit()
        except Exception as e:
            print(f"⚠️ 监控数据库初始化失败: {e}")
            self.db_conn = None
    
    def log_status(self, service, status, response_time=None, details=""):
        """记录服务状态"""
        if self.db_conn:
            try:
                cursor = self.db_conn.cursor()
                cursor.execute('''
                    INSERT INTO service_logs (timestamp, service, status, response_time, details)
                    VALUES (?, ?, ?, ?, ?)
                ''', (datetime.now().isoformat(), service, status, response_time, details))
                self.db_conn.commit()
            except Exception as e:
                print(f"记录日志失败: {e}")
    
    def check_api_health(self):
        """检查API健康状态"""
        try:
            start_time = time.time()
            response = requests.get(f"{self.base_url}/api/health", timeout=5)
            response_time = time.time() - start_time
            
            if response.status_code == 200:
                data = response.json()
                status = "UP" if data.get("status") == "healthy" else "DEGRADED"
                details = f"数据库: {data.get('database', 'UNKNOWN')}"
            else:
                status = "DOWN"
                details = f"HTTP {response.status_code}"
            
            self.stats["api_health"] = {
                "status": status,
                "last_check": datetime.now().isoformat(),
                "response_time": response_time
            }
            
            self.log_status("api_health", status, response_time, details)
            return status, response_time
            
        except Exception as e:
            status = "ERROR"
            self.stats["api_health"] = {
                "status": status,
                "last_check": datetime.now().isoformat(),
                "error": str(e)
            }
            self.log_status("api_health", status, None, str(e))
            return status, None
    
    def check_database(self):
        """检查数据库连接"""
        try:
            from api.models.database import engine
            from sqlalchemy import text
            
            start_time = time.time()
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            response_time = time.time() - start_time
            
            status = "UP"
            self.stats["database"] = {
                "status": status,
                "last_check": datetime.now().isoformat(),
                "response_time": response_time
            }
            
            self.log_status("database", status, response_time)
            return status, response_time
            
        except Exception as e:
            status = "DOWN"
            self.stats["database"] = {
                "status": status,
                "last_check": datetime.now().isoformat(),
                "error": str(e)
            }
            self.log_status("database", status, None, str(e))
            return status, None
    
    def check_web_page(self, page_name, path):
        """检查网页可访问性"""
        try:
            start_time = time.time()
            response = requests.get(f"{self.base_url}{path}", timeout=5)
            response_time = time.time() - start_time
            
            status = "UP" if response.status_code == 200 else "DOWN"
            details = f"HTTP {response.status_code}"
            
            self.stats[page_name] = {
                "status": status,
                "last_check": datetime.now().isoformat(),
                "response_time": response_time
            }
            
            self.log_status(page_name, status, response_time, details)
            return status, response_time
            
        except Exception as e:
            status = "ERROR"
            self.stats[page_name] = {
                "status": status,
                "last_check": datetime.now().isoformat(),
                "error": str(e)
            }
            self.log_status(page_name, status, None, str(e))
            return status, None
    
    def print_status_summary(self):
        """打印状态摘要"""
        print("\n" + "="*60)
        print(f"📊 服务状态监控 - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("="*60)
        
        for service, info in self.stats.items():
            status = info.get("status", "UNKNOWN")
            last_check = info.get("last_check", "从未")
            response_time = info.get("response_time")
            
            # 状态图标
            if status == "UP":
                icon = "✅"
            elif status == "DOWN":
                icon = "❌"
            elif status == "DEGRADED":
                icon = "⚠️"
            else:
                icon = "❓"
            
            # 显示信息
            service_name = {
                "api_health": "API健康检查",
                "database": "数据库连接",
                "main_page": "主页面",
                "admin_page": "管理页面"
            }.get(service, service)
            
            time_info = ""
            if response_time:
                time_info = f" ({response_time:.3f}s)"
            
            print(f"{icon} {service_name}: {status}{time_info}")
            
            if "error" in info:
                print(f"   错误: {info['error']}")
        
        print("="*60)
    
    def monitor_loop(self):
        """监控主循环"""
        print("🔍 开始服务监控...")
        
        while self.monitoring:
            try:
                # 检查各个服务
                print(f"\n⏰ {datetime.now().strftime('%H:%M:%S')} - 执行健康检查...")
                
                # API健康检查
                api_status, api_time = self.check_api_health()
                print(f"   API: {api_status}" + (f" ({api_time:.3f}s)" if api_time else ""))
                
                # 数据库检查
                db_status, db_time = self.check_database()
                print(f"   数据库: {db_status}" + (f" ({db_time:.3f}s)" if db_time else ""))
                
                # 网页检查
                main_status, main_time = self.check_web_page("main_page", "/web/index.html")
                print(f"   主页: {main_status}" + (f" ({main_time:.3f}s)" if main_time else ""))
                
                admin_status, admin_time = self.check_web_page("admin_page", "/web/admin.html")
                print(f"   管理页: {admin_status}" + (f" ({admin_time:.3f}s)" if admin_time else ""))
                
                # 等待下次检查
                time.sleep(30)  # 每30秒检查一次
                
            except KeyboardInterrupt:
                print("\n🛑 监控已停止")
                break
            except Exception as e:
                print(f"❌ 监控出错: {e}")
                time.sleep(10)
    
    def generate_report(self):
        """生成监控报告"""
        if not self.db_conn:
            print("⚠️ 无法生成报告：监控数据库不可用")
            return
        
        try:
            cursor = self.db_conn.cursor()
            
            # 获取最近24小时的数据
            cursor.execute('''
                SELECT service, status, COUNT(*) as count
                FROM service_logs 
                WHERE datetime(timestamp) > datetime('now', '-24 hours')
                GROUP BY service, status
                ORDER BY service, status
            ''')
            
            print("\n📈 24小时监控报告")
            print("="*40)
            
            current_service = None
            for row in cursor.fetchall():
                service, status, count = row
                if service != current_service:
                    if current_service:
                        print()
                    service_name = {
                        "api_health": "API健康检查",
                        "database": "数据库连接", 
                        "main_page": "主页面",
                        "admin_page": "管理页面"
                    }.get(service, service)
                    print(f"{service_name}:")
                    current_service = service
                
                print(f"  {status}: {count} 次")
            
            print("="*40)
            
        except Exception as e:
            print(f"❌ 生成报告失败: {e}")
    
    def stop(self):
        """停止监控"""
        self.monitoring = False
        if self.db_conn:
            self.db_conn.close()

def main():
    monitor = ServiceMonitor()
    
    try:
        # 启动监控
        monitor_thread = threading.Thread(target=monitor.monitor_loop, daemon=True)
        monitor_thread.start()
        
        # 显示状态
        while True:
            time.sleep(60)  # 每分钟显示一次状态摘要
            monitor.print_status_summary()
            
    except KeyboardInterrupt:
        print("\n👋 停止监控...")
        monitor.stop()
        monitor.generate_report()

if __name__ == "__main__":
    main()
