# 数据库管理脚本集合

这个文件夹包含了所有与数据库初始化、迁移和管理相关的脚本。

## 脚本分类

### 核心初始化脚本
- **initialize_db.py** - 主数据库初始化脚本，创建所有必要的表结构
- **init_featured_products.py** - 初始化特色产品数据

### 数据库迁移脚本
- **migrate_about_us.py** - 添加"关于我们"功能的数据库迁移
- **migrate_add_show_content_box.py** - 为轮播图添加文字框显示控制字段
- **migrate_footer_info.py** - 添加页脚信息管理功能
- **migrate_top_info_bar.py** - 添加顶部信息栏功能

### 管理和测试脚本
- **create_default_admin.py** - 创建默认管理员账户
- **debug_database.py** - 数据库调试工具
- **test_db.py** - 数据库连接测试
- **simple_check.py** - 简单数据库状态检查

## 使用方法

### 首次安装
1. 运行主初始化脚本：
   ```bash
   python database_management/initialize_db.py
   ```

2. 初始化特色产品数据：
   ```bash
   python database_management/init_featured_products.py
   ```

3. 创建默认管理员账户：
   ```bash
   python database_management/create_default_admin.py
   ```

### 数据库迁移
如需运行特定的迁移脚本：
```bash
python database_management/migrate_[功能名].py
```

### 调试和测试
- 测试数据库连接：
  ```bash
  python database_management/test_db.py
  ```

- 检查数据库状态：
  ```bash
  python database_management/simple_check.py
  ```

- 调试数据库问题：
  ```bash
  python database_management/debug_database.py
  ```

## 注意事项
1. 运行任何脚本前请确保数据库服务已启动
2. 迁移脚本只需运行一次，重复运行可能导致错误
3. 建议在运行迁移前备份数据库
4. 所有脚本都需要在项目根目录下运行以确保正确的导入路径

## 脚本执行顺序建议
1. initialize_db.py
2. init_featured_products.py
3. create_default_admin.py
4. 各种migrate_*.py脚本（按需运行）