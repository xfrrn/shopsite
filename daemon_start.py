#!/usr/bin/env python3
"""
Linux后台守护进程启动脚本
支持在关闭终端后继续运行
"""

import os
import sys
import signal
import subprocess
import time
import json
import atexit
from datetime import datetime
import argparse

class DaemonManager:
    def __init__(self):
        self.pid_file = "/tmp/shopsite.pid"
        self.log_file = "shopsite.log"
        self.status_file = "shopsite_status.json"
        self.project_dir = os.path.dirname(os.path.abspath(__file__))
    
    def is_running(self):
        """检查服务是否正在运行"""
        if not os.path.exists(self.pid_file):
            return False
        
        try:
            with open(self.pid_file, 'r') as f:
                pid = int(f.read().strip())
            
            # 检查进程是否存在
            os.kill(pid, 0)
            return True
        except (OSError, ValueError):
            # 进程不存在，清理PID文件
            if os.path.exists(self.pid_file):
                os.remove(self.pid_file)
            return False
    
    def daemonize(self):
        """创建守护进程"""
        try:
            # 第一次fork
            pid = os.fork()
            if pid > 0:
                # 父进程退出
                sys.exit(0)
        except OSError as e:
            sys.stderr.write(f"Fork #1 failed: {e}\n")
            sys.exit(1)
        
        # 脱离父进程环境
        os.chdir(self.project_dir)
        os.setsid()
        os.umask(0)
        
        try:
            # 第二次fork
            pid = os.fork()
            if pid > 0:
                # 父进程退出
                sys.exit(0)
        except OSError as e:
            sys.stderr.write(f"Fork #2 failed: {e}\n")
            sys.exit(1)
        
        # 重定向标准输入输出
        sys.stdout.flush()
        sys.stderr.flush()
        
        # 关闭文件描述符
        si = open(os.devnull, 'r')
        so = open(self.log_file, 'a+')
        se = open(self.log_file, 'a+')
        
        os.dup2(si.fileno(), sys.stdin.fileno())
        os.dup2(so.fileno(), sys.stdout.fileno())
        os.dup2(se.fileno(), sys.stderr.fileno())
        
        # 注册清理函数
        atexit.register(self.cleanup)
        
        # 保存PID
        pid = str(os.getpid())
        with open(self.pid_file, 'w') as f:
            f.write(pid)
    
    def cleanup(self):
        """清理函数"""
        if os.path.exists(self.pid_file):
            os.remove(self.pid_file)
    
    def start(self):
        """启动服务"""
        if self.is_running():
            print("❌ 服务已经在运行中")
            return False
        
        print("🚀 启动后台守护进程...")
        
        # 创建守护进程
        self.daemonize()
        
        # 保存状态信息
        status = {
            "pid": os.getpid(),
            "start_time": datetime.now().isoformat(),
            "status": "running",
            "log_file": self.log_file,
            "project_dir": self.project_dir
        }
        
        with open(self.status_file, 'w') as f:
            json.dump(status, f, indent=2)
        
        # 记录启动信息
        print(f"✅ 守护进程启动成功")
        print(f"📋 PID: {os.getpid()}")
        print(f"📝 日志文件: {self.log_file}")
        print(f"🌐 访问地址: http://localhost:8000")
        
        # 设置信号处理
        signal.signal(signal.SIGTERM, self.signal_handler)
        signal.signal(signal.SIGINT, self.signal_handler)
        
        try:
            # 启动FastAPI应用
            self.run_app()
        except Exception as e:
            print(f"❌ 应用运行出错: {e}")
            self.cleanup()
            sys.exit(1)
    
    def run_app(self):
        """运行FastAPI应用"""
        import uvicorn
        from config.config import AppConfig
        
        app_config = AppConfig()
        
        print(f"🌟 启动FastAPI应用 - {datetime.now().isoformat()}")
        
        uvicorn.run(
            "main:app",
            host=app_config.HOST or "0.0.0.0",
            port=app_config.PORT or 8000,
            reload=False,  # 守护进程不使用reload
            log_level="info",
            access_log=True
        )
    
    def signal_handler(self, signum, frame):
        """信号处理器"""
        print(f"收到信号 {signum}，正在关闭服务...")
        self.cleanup()
        sys.exit(0)
    
    def stop(self):
        """停止服务"""
        if not self.is_running():
            print("❌ 服务未运行")
            return False
        
        try:
            with open(self.pid_file, 'r') as f:
                pid = int(f.read().strip())
            
            print(f"🛑 停止服务 (PID: {pid})...")
            
            # 发送TERM信号
            os.kill(pid, signal.SIGTERM)
            
            # 等待进程结束
            for i in range(10):
                try:
                    os.kill(pid, 0)
                    time.sleep(1)
                except OSError:
                    break
            else:
                # 如果进程仍在运行，强制杀死
                print("强制终止进程...")
                os.kill(pid, signal.SIGKILL)
            
            # 清理文件
            for file in [self.pid_file, self.status_file]:
                if os.path.exists(file):
                    os.remove(file)
            
            print("✅ 服务已停止")
            return True
            
        except Exception as e:
            print(f"❌ 停止失败: {e}")
            return False
    
    def status(self):
        """查看服务状态"""
        if not self.is_running():
            print("❌ 服务未运行")
            return
        
        try:
            # 读取状态文件
            if os.path.exists(self.status_file):
                with open(self.status_file, 'r') as f:
                    status = json.load(f)
                
                start_time = datetime.fromisoformat(status['start_time'])
                running_time = datetime.now() - start_time
                
                print("📊 服务状态信息:")
                print(f"   PID: {status['pid']}")
                print(f"   启动时间: {status['start_time']}")
                print(f"   运行时长: {running_time}")
                print(f"   状态: {status['status']}")
                print(f"   日志文件: {status['log_file']}")
                print(f"   项目目录: {status['project_dir']}")
            
            # 读取PID
            with open(self.pid_file, 'r') as f:
                pid = int(f.read().strip())
            
            print(f"✅ 服务正在运行 (PID: {pid})")
            print(f"🌐 访问地址: http://localhost:8000")
            
        except Exception as e:
            print(f"❌ 获取状态失败: {e}")
    
    def restart(self):
        """重启服务"""
        print("🔄 重启服务...")
        if self.is_running():
            self.stop()
            time.sleep(2)
        self.start()
    
    def logs(self, lines=50, follow=False):
        """查看日志"""
        if not os.path.exists(self.log_file):
            print("❌ 日志文件不存在")
            return
        
        try:
            if follow:
                # 实时跟踪日志
                subprocess.run(['tail', '-f', self.log_file])
            else:
                # 查看最后几行
                subprocess.run(['tail', f'-{lines}', self.log_file])
        except KeyboardInterrupt:
            print("\n日志跟踪已停止")
        except Exception as e:
            print(f"❌ 读取日志失败: {e}")

def main():
    parser = argparse.ArgumentParser(description='ShopSite 后台守护进程管理器')
    parser.add_argument('command', choices=['start', 'stop', 'status', 'restart', 'logs'], 
                       help='管理命令')
    parser.add_argument('--lines', '-n', type=int, default=50, 
                       help='查看日志行数 (默认50行)')
    parser.add_argument('--follow', '-f', action='store_true',
                       help='实时跟踪日志输出')
    
    args = parser.parse_args()
    
    manager = DaemonManager()
    
    if args.command == 'start':
        manager.start()
    elif args.command == 'stop':
        manager.stop()
    elif args.command == 'status':
        manager.status()
    elif args.command == 'restart':
        manager.restart()
    elif args.command == 'logs':
        manager.logs(args.lines, args.follow)

if __name__ == "__main__":
    main()
