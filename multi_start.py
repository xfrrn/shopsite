#!/usr/bin/env python3
"""
多线程一键启动脚本
支持同时启动多个服务和任务
"""

import threading
import subprocess
import time
import signal
import sys
import os
from datetime import datetime
import queue
import logging
import configparser

class MultiThreadLauncher:
    def __init__(self, config_file="multi_start.ini"):
        self.processes = []
        self.threads = []
        self.running = True
        self.log_queue = queue.Queue()
        self.config_file = config_file
        self.config = self.load_config()
        
        # 设置日志
        self.setup_logging()
        
        # 注册信号处理
        signal.signal(signal.SIGINT, self.signal_handler)
        signal.signal(signal.SIGTERM, self.signal_handler)
    
    def load_config(self):
        """加载配置文件"""
        config = configparser.ConfigParser()
        
        # 默认配置
        default_config = {
            'main_services': {
                'fastapi_main': 'true',
                'service_monitor': 'true', 
                'performance_monitor': 'false',
                'log_cleanup': 'true'
            },
            'service_delays': {
                'fastapi_main': '0',
                'service_monitor': '10',
                'performance_monitor': '12',
                'log_cleanup': '15'
            },
            'monitoring': {
                'health_check_interval': '30',
                'performance_check_interval': '30',
                'log_cleanup_interval': '3600'
            },
            'alerts': {
                'cpu_threshold': '80',
                'memory_threshold': '85',
                'disk_threshold': '90',
                'response_time_threshold': '5.0'
            }
        }
        
        # 设置默认值
        config.read_dict(default_config)
        
        # 尝试读取配置文件
        if os.path.exists(self.config_file):
            try:
                config.read(self.config_file, encoding='utf-8')
                print(f"✅ 已加载配置文件: {self.config_file}")
            except Exception as e:
                print(f"⚠️ 配置文件读取失败，使用默认配置: {e}")
        else:
            print(f"⚠️ 配置文件不存在，使用默认配置: {self.config_file}")
        
        return config
    
    def setup_logging(self):
        """设置日志"""
        log_level = getattr(logging, self.config.get('logging', 'log_level', fallback='INFO'))
        logging.basicConfig(
            level=log_level,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        self.logger = logging.getLogger('Launcher')
    
    def signal_handler(self, signum, frame):
        """处理退出信号"""
        print(f"\n🛑 收到退出信号 {signum}，正在关闭所有服务...")
        self.shutdown()
        sys.exit(0)
    
    def log_output(self, name, process):
        """记录进程输出"""
        try:
            while self.running and process.poll() is None:
                line = process.stdout.readline()
                if line:
                    timestamp = datetime.now().strftime("%H:%M:%S")
                    print(f"[{timestamp}] {name}: {line.strip()}")
                time.sleep(0.1)
        except Exception as e:
            self.logger.error(f"日志记录错误 {name}: {e}")
    
    def start_service(self, name, command, cwd=None, env=None):
        """启动一个服务"""
        try:
            print(f"🚀 启动 {name}...")
            
            # 设置环境变量
            service_env = os.environ.copy()
            if env:
                service_env.update(env)
            
            # 启动进程
            process = subprocess.Popen(
                command,
                shell=True,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                universal_newlines=True,
                cwd=cwd,
                env=service_env,
                bufsize=1
            )
            
            self.processes.append((name, process))
            
            # 启动日志线程
            log_thread = threading.Thread(
                target=self.log_output,
                args=(name, process),
                daemon=True
            )
            log_thread.start()
            self.threads.append(log_thread)
            
            print(f"✅ {name} 启动成功 (PID: {process.pid})")
            return True
            
        except Exception as e:
            print(f"❌ {name} 启动失败: {e}")
            return False
    
    def check_dependencies(self):
        """检查依赖"""
        print("📦 检查Python依赖...")
        
        try:
            # 检查主要依赖包
            import fastapi
            import uvicorn
            import sqlalchemy
            print("✅ FastAPI 相关依赖检查通过")
        except ImportError as e:
            print(f"❌ 缺少依赖: {e}")
            print("正在安装依赖...")
            subprocess.run([
                sys.executable, "-m", "pip", "install", 
                "fastapi", "uvicorn", "sqlalchemy", "pymysql",
                "python-jose[cryptography]", "python-multipart"
            ])
    
    def check_config(self):
        """检查配置文件"""
        print("🔧 检查配置文件...")
        
        config_file = "config/settings.ini"
        if not os.path.exists(config_file):
            print(f"❌ 配置文件不存在: {config_file}")
            return False
        
        print("✅ 配置文件检查通过")
        return True
    
    def check_database(self):
        """检查数据库连接"""
        print("💾 检查数据库连接...")
        
        try:
            # 测试数据库连接
            result = subprocess.run([
                sys.executable, "-c",
                "from api.models.database import engine; "
                "from sqlalchemy import text; "
                "with engine.connect() as conn: conn.execute(text('SELECT 1')); "
                "print('数据库连接成功')"
            ], capture_output=True, text=True, timeout=10)
            
            if result.returncode == 0:
                print("✅ 数据库连接正常")
                return True
            else:
                print("⚠️ 数据库连接失败，尝试初始化...")
                init_result = subprocess.run([sys.executable, "initialize_db.py"], 
                                           capture_output=True, text=True, timeout=30)
                if init_result.returncode == 0:
                    print("✅ 数据库初始化成功")
                    return True
                else:
                    print(f"❌ 数据库初始化失败: {init_result.stderr}")
                    return False
                    
        except Exception as e:
            print(f"❌ 数据库检查失败: {e}")
            return False
    
    def start_all_services(self):
        """启动所有服务"""
        print("\n" + "="*50)
        print("🎯 启动所有服务...")
        print("="*50)
        
        # 从配置文件读取服务配置
        enabled_services = self.config['main_services']
        delays = self.config['service_delays']
        
        all_services = {
            'fastapi_main': {
                "name": "FastAPI主服务",
                "command": f"{sys.executable} main.py",
                "env": {"PYTHONPATH": "."},
                "critical": True
            },
            'service_monitor': {
                "name": "服务监控",
                "command": f"{sys.executable} service_monitor.py",
                "env": {"PYTHONPATH": "."},
                "critical": False
            },
            'performance_monitor': {
                "name": "性能监控",
                "command": f"{sys.executable} performance_monitor.py",
                "env": {"PYTHONPATH": "."},
                "critical": False
            },
            'log_cleanup': {
                "name": "日志清理服务",
                "command": f"{sys.executable} -c \""
                          "import time, os, glob, datetime; "
                          "print('日志清理服务已启动'); "
                          "while True: "
                          "    try: "
                          "        logs = glob.glob('*.log') + glob.glob('__pycache__/**/*.pyc', recursive=True); "
                          "        old_logs = [f for f in logs if os.path.getmtime(f) < time.time() - 86400]; "
                          "        if old_logs: "
                          "            print(f'清理 {len(old_logs)} 个过期文件'); "
                          "            for f in old_logs: "
                          "                try: os.remove(f); "
                          "                except: pass; "
                          "    except Exception as e: "
                          "        print(f'清理错误: {e}'); "
                          f"    time.sleep({self.config.getint('monitoring', 'log_cleanup_interval', fallback=3600)})\"",
                "env": {"PYTHONPATH": "."},
                "critical": False
            }
        }
        
        # 筛选启用的服务
        services = []
        for service_key, service_config in all_services.items():
            if enabled_services.getboolean(service_key, fallback=False):
                service_config["delay"] = delays.getint(service_key, fallback=0)
                services.append(service_config)
                print(f"✅ 已启用服务: {service_config['name']}")
            else:
                print(f"⚪ 已禁用服务: {service_config['name']}")
        
        if not services:
            print("❌ 没有启用任何服务")
            return False
        
        # 可选的后台任务
        optional_services = [
            {
                "name": "数据库备份服务",
                "command": f"{sys.executable} -c \""
                          "import time, subprocess, datetime; "
                          "while True: "
                          "    dt = datetime.datetime.now().strftime('%Y%m%d_%H%M%S'); "
                          "    print(f'数据库备份: backup_{dt}'); "
                          "    time.sleep(86400)\"",  # 每天运行一次
                "enabled": False
            }
        ]
        
        # 启动主要服务
        success_count = 0
        for service in services:
            # 检查延迟启动
            delay = service.get("delay", 0)
            if delay > 0:
                print(f"⏱️ {service['name']} 将在 {delay} 秒后启动...")
                
                # 创建延迟启动线程
                def delayed_start(svc, d):
                    time.sleep(d)
                    if self.running:  # 确保还在运行状态
                        self.start_service(svc["name"], svc["command"], env=svc.get("env"))
                
                thread = threading.Thread(
                    target=delayed_start,
                    args=(service, delay),
                    daemon=True
                )
                thread.start()
                self.threads.append(thread)
                success_count += 1
            else:
                if self.start_service(
                    service["name"], 
                    service["command"], 
                    env=service.get("env")
                ):
                    success_count += 1
                    time.sleep(2)  # 给服务一些启动时间
        
        print(f"\n✅ 成功启动 {success_count}/{len(services)} 个服务")
        
        if success_count > 0:
            print("\n📍 服务访问地址:")
            print("   🌐 主页面: http://localhost:8000/web/index.html")
            print("   ⚙️  管理后台: http://localhost:8000/web/admin.html") 
            print("   📚 API文档: http://localhost:8000/docs")
            print("   🩺 API健康检查: http://localhost:8000/api/health")
            print("   🔧 管理员工具: python admin_manager.py")
            
            print(f"\n💡 提示:")
            print("   - 按 Ctrl+C 停止所有服务")
            print("   - 服务监控将每30秒检查一次状态")
            print("   - 查看 monitor.db 文件了解历史监控数据")
            print("   - 日志清理服务将每小时清理过期文件")
            
            # 显示关键服务状态
            critical_services = [s for s in services if s.get("critical", False)]
            if critical_services:
                print(f"\n🔴 关键服务: {len(critical_services)} 个")
                for service in critical_services:
                    print(f"   - {service['name']}")
            
            return True
        
        return False
    
    def monitor_services(self):
        """监控服务状态"""
        print(f"\n🔍 开始监控服务状态...")
        
        while self.running:
            try:
                # 检查进程状态
                alive_count = 0
                for name, process in self.processes:
                    if process.poll() is None:  # 进程仍在运行
                        alive_count += 1
                    else:
                        print(f"⚠️ 服务 {name} 已停止 (退出码: {process.returncode})")
                
                if alive_count == 0 and self.processes:
                    print("❌ 所有服务都已停止")
                    break
                
                time.sleep(5)  # 每5秒检查一次
                
            except KeyboardInterrupt:
                break
            except Exception as e:
                self.logger.error(f"监控错误: {e}")
    
    def shutdown(self):
        """关闭所有服务"""
        self.running = False
        
        print("\n🔄 正在关闭服务...")
        
        # 终止所有进程
        for name, process in self.processes:
            if process.poll() is None:
                print(f"⏹️ 停止 {name}...")
                try:
                    process.terminate()
                    # 给进程一些时间优雅关闭
                    process.wait(timeout=5)
                except subprocess.TimeoutExpired:
                    print(f"🔥 强制停止 {name}...")
                    process.kill()
                except Exception as e:
                    print(f"❌ 停止 {name} 时出错: {e}")
        
        print("✅ 所有服务已关闭")
    
    def run(self):
        """主运行函数"""
        print("🚀 商品展示网站 - 多线程启动器")
        print("="*50)
        
        try:
            # 检查环境
            if not self.check_config():
                return False
            
            self.check_dependencies()
            
            if not self.check_database():
                print("❌ 数据库检查失败，无法继续")
                return False
            
            # 启动服务
            if not self.start_all_services():
                print("❌ 服务启动失败")
                return False
            
            # 监控服务
            self.monitor_services()
            
        except KeyboardInterrupt:
            print("\n👋 收到中断信号")
        except Exception as e:
            print(f"❌ 启动器错误: {e}")
        finally:
            self.shutdown()
        
        return True

def main():
    """主函数"""
    launcher = MultiThreadLauncher()
    return launcher.run()

if __name__ == "__main__":
    sys.exit(0 if main() else 1)
