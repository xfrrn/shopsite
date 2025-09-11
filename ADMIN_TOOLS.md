# 管理员账号管理工具

本目录包含了用于管理系统管理员账号的Python工具。

## 🛠️ 工具文件

### 1. `admin_manager.py` - 完整管理工具
功能丰富的管理员账号管理工具，支持交互式操作和命令行参数。

### 2. `create_default_admin.py` - 快速创建默认管理员
用于系统初始化时快速创建默认管理员账号。

## 🚀 使用方法

### 快速创建默认管理员 (推荐用于初始化)

```bash
# 创建默认管理员 (用户名: admin, 密码: admin123)
python3 create_default_admin.py
```

### 完整管理工具

#### 交互式模式 (推荐)
```bash
# 启动交互式管理界面
python3 admin_manager.py
```

#### 命令行模式
```bash
# 创建新管理员
python3 admin_manager.py --create newadmin --password mypassword --full-name "新管理员" --email "admin@example.com"

# 修改管理员密码
python3 admin_manager.py --update-password admin

# 列出所有管理员
python3 admin_manager.py --list

# 验证管理员密码
python3 admin_manager.py --verify admin
```

## 🔧 功能说明

### admin_manager.py 功能列表

1. **📝 创建新管理员**
   - 设置用户名、密码
   - 可选设置全名、邮箱
   - 自动检查用户名重复

2. **🔑 修改管理员密码**
   - 安全的密码输入 (隐藏显示)
   - 密码确认机制

3. **✏️ 修改管理员信息**
   - 更新全名
   - 更新邮箱地址

4. **👥 查看所有管理员**
   - 显示管理员列表
   - 包含状态、创建时间、最后登录等信息

5. **🔄 切换管理员状态**
   - 启用/禁用管理员账号

6. **🔍 验证管理员密码**
   - 测试密码是否正确

### create_default_admin.py 功能

- 创建默认管理员账号 (admin/admin123)
- 如果已存在，可选择重置密码
- 适合系统初始化使用

## 📋 默认管理员信息

使用 `create_default_admin.py` 创建的默认管理员：

- **用户名**: `admin`
- **密码**: `admin123`
- **全名**: `系统管理员`
- **邮箱**: `admin@example.com`

⚠️ **安全提示**: 请在生产环境中及时修改默认密码！

## ⚡ 快速开始

1. **首次部署系统时**:
   ```bash
   python3 create_default_admin.py
   ```

2. **日常管理维护时**:
   ```bash
   python3 admin_manager.py
   ```

3. **批量操作时**:
   ```bash
   # 使用命令行参数进行批量操作
   python3 admin_manager.py --create user1 --password pass1
   python3 admin_manager.py --create user2 --password pass2
   ```

## 🔒 安全注意事项

1. **密码安全**:
   - 使用强密码
   - 定期更换密码
   - 不要在命令行中直接输入密码

2. **账号管理**:
   - 及时禁用不再使用的账号
   - 定期审查管理员列表
   - 为每个管理员设置不同的账号

3. **访问控制**:
   - 限制对这些工具的访问权限
   - 在生产环境中谨慎使用

## 🐛 故障排除

### 常见问题

1. **导入错误**:
   ```
   ImportError: No module named 'api'
   ```
   **解决**: 确保在项目根目录运行脚本

2. **数据库连接失败**:
   ```
   数据库连接失败: ...
   ```
   **解决**: 检查数据库配置文件 `config/settings.ini`

3. **权限错误**:
   ```
   Permission denied
   ```
   **解决**: 确保数据库用户有足够权限

### 调试步骤

1. 检查数据库连接:
   ```bash
   python3 debug_database.py
   ```

2. 验证管理员表结构:
   ```bash
   python3 -c "from api.models.models import Admin; print('Admin model loaded successfully')"
   ```

3. 检查依赖包:
   ```bash
   pip list | grep -E "fastapi|sqlalchemy|passlib"
   ```

## 📞 获取帮助

如需帮助，请查看：
- 工具的 `--help` 参数
- 项目主README文档
- 相关API文档
