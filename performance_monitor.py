#!/usr/bin/env python3
"""
性能监控脚本
监控系统资源使用情况和性能指标
"""

import psutil
import time
import threading
import json
from datetime import datetime
import os

class PerformanceMonitor:
    def __init__(self):
        self.monitoring = True
        self.stats_history = []
        self.max_history = 100  # 保留最近100条记录
    
    def get_system_stats(self):
        """获取系统统计信息"""
        try:
            # CPU使用率
            cpu_percent = psutil.cpu_percent(interval=1)
            cpu_count = psutil.cpu_count()
            
            # 内存使用情况
            memory = psutil.virtual_memory()
            memory_percent = memory.percent
            memory_used = memory.used / (1024**3)  # GB
            memory_total = memory.total / (1024**3)  # GB
            
            # 磁盘使用情况
            disk = psutil.disk_usage('.')
            disk_percent = (disk.used / disk.total) * 100
            disk_used = disk.used / (1024**3)  # GB
            disk_total = disk.total / (1024**3)  # GB
            
            # 网络统计
            net_io = psutil.net_io_counters()
            
            # 进程信息
            python_processes = []
            for proc in psutil.process_iter(['pid', 'name', 'cpu_percent', 'memory_percent']):
                try:
                    if 'python' in proc.info['name'].lower():
                        python_processes.append({
                            'pid': proc.info['pid'],
                            'name': proc.info['name'],
                            'cpu_percent': proc.info['cpu_percent'],
                            'memory_percent': proc.info['memory_percent']
                        })
                except (psutil.NoSuchProcess, psutil.AccessDenied):
                    pass
            
            return {
                'timestamp': datetime.now().isoformat(),
                'cpu': {
                    'percent': cpu_percent,
                    'count': cpu_count
                },
                'memory': {
                    'percent': memory_percent,
                    'used_gb': round(memory_used, 2),
                    'total_gb': round(memory_total, 2)
                },
                'disk': {
                    'percent': round(disk_percent, 2),
                    'used_gb': round(disk_used, 2),
                    'total_gb': round(disk_total, 2)
                },
                'network': {
                    'bytes_sent': net_io.bytes_sent,
                    'bytes_recv': net_io.bytes_recv
                },
                'python_processes': python_processes
            }
            
        except Exception as e:
            print(f"❌ 获取系统统计失败: {e}")
            return None
    
    def check_performance_alerts(self, stats):
        """检查性能警告"""
        alerts = []
        
        if stats['cpu']['percent'] > 80:
            alerts.append(f"🔥 CPU使用率过高: {stats['cpu']['percent']:.1f}%")
        
        if stats['memory']['percent'] > 85:
            alerts.append(f"🧠 内存使用率过高: {stats['memory']['percent']:.1f}%")
        
        if stats['disk']['percent'] > 90:
            alerts.append(f"💾 磁盘空间不足: {stats['disk']['percent']:.1f}%")
        
        # 检查Python进程
        high_cpu_processes = [p for p in stats['python_processes'] if p['cpu_percent'] > 50]
        if high_cpu_processes:
            for proc in high_cpu_processes:
                alerts.append(f"⚡ 进程CPU使用率高: {proc['name']} (PID: {proc['pid']}) {proc['cpu_percent']:.1f}%")
        
        return alerts
    
    def print_performance_summary(self, stats):
        """打印性能摘要"""
        if not stats:
            return
        
        print("\n" + "="*60)
        print(f"⚡ 系统性能监控 - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("="*60)
        
        # CPU信息
        cpu_bar = self.create_progress_bar(stats['cpu']['percent'])
        print(f"🖥️  CPU: {cpu_bar} {stats['cpu']['percent']:.1f}% ({stats['cpu']['count']} 核)")
        
        # 内存信息
        memory_bar = self.create_progress_bar(stats['memory']['percent'])
        print(f"🧠 内存: {memory_bar} {stats['memory']['percent']:.1f}% "
              f"({stats['memory']['used_gb']:.1f}GB / {stats['memory']['total_gb']:.1f}GB)")
        
        # 磁盘信息
        disk_bar = self.create_progress_bar(stats['disk']['percent'])
        print(f"💾 磁盘: {disk_bar} {stats['disk']['percent']:.1f}% "
              f"({stats['disk']['used_gb']:.1f}GB / {stats['disk']['total_gb']:.1f}GB)")
        
        # Python进程
        if stats['python_processes']:
            print(f"\n🐍 Python进程 ({len(stats['python_processes'])} 个):")
            for proc in stats['python_processes'][:5]:  # 只显示前5个
                print(f"   PID {proc['pid']}: {proc['name']} "
                      f"(CPU: {proc['cpu_percent']:.1f}%, 内存: {proc['memory_percent']:.1f}%)")
        
        # 性能警告
        alerts = self.check_performance_alerts(stats)
        if alerts:
            print(f"\n⚠️ 性能警告:")
            for alert in alerts:
                print(f"   {alert}")
        
        print("="*60)
    
    def create_progress_bar(self, percent, width=20):
        """创建进度条"""
        filled = int(width * percent / 100)
        bar = "█" * filled + "░" * (width - filled)
        return f"[{bar}]"
    
    def save_stats_to_file(self):
        """保存统计信息到文件"""
        try:
            filename = f"performance_stats_{datetime.now().strftime('%Y%m%d')}.json"
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(self.stats_history, f, indent=2, ensure_ascii=False)
            print(f"📊 性能数据已保存到: {filename}")
        except Exception as e:
            print(f"❌ 保存性能数据失败: {e}")
    
    def monitor_loop(self):
        """监控主循环"""
        print("📈 开始性能监控...")
        
        while self.monitoring:
            try:
                # 获取系统统计
                stats = self.get_system_stats()
                if stats:
                    # 添加到历史记录
                    self.stats_history.append(stats)
                    
                    # 限制历史记录数量
                    if len(self.stats_history) > self.max_history:
                        self.stats_history.pop(0)
                    
                    # 检查性能警告
                    alerts = self.check_performance_alerts(stats)
                    if alerts:
                        print(f"\n🚨 性能警告 - {datetime.now().strftime('%H:%M:%S')}")
                        for alert in alerts:
                            print(f"   {alert}")
                
                time.sleep(10)  # 每10秒检查一次
                
            except KeyboardInterrupt:
                print("\n🛑 性能监控已停止")
                break
            except Exception as e:
                print(f"❌ 性能监控出错: {e}")
                time.sleep(10)
    
    def stop(self):
        """停止监控"""
        self.monitoring = False
        
        # 保存最终统计
        if self.stats_history:
            self.save_stats_to_file()

def main():
    monitor = PerformanceMonitor()
    
    try:
        # 启动监控线程
        monitor_thread = threading.Thread(target=monitor.monitor_loop, daemon=True)
        monitor_thread.start()
        
        # 显示性能摘要
        while True:
            time.sleep(30)  # 每30秒显示一次摘要
            if monitor.stats_history:
                latest_stats = monitor.stats_history[-1]
                monitor.print_performance_summary(latest_stats)
            
    except KeyboardInterrupt:
        print("\n👋 停止性能监控...")
        monitor.stop()

if __name__ == "__main__":
    # 检查psutil是否安装
    try:
        import psutil
    except ImportError:
        print("❌ 缺少依赖: psutil")
        print("请运行: pip install psutil")
        exit(1)
    
    main()
