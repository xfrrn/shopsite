# FANXI 产品展示网站

# 产品展示网站

一个基于FastAPI和现代前端技术构建的完整产品展示网站系统。

## 功能特点

### 前端功能
- 🎨 现代化响应式设计
- 📱 移动端友好界面
- 🔍 产品搜索和筛选
- 📂 分类浏览
- 🖼️ 产品详情展示
- 📖 分页支持

### 管理后台
- 👤 管理员认证系统
- 📊 数据统计仪表板
- 🏷️ 分类管理 (CRUD)
- 📦 产品管理 (CRUD)
- 🖼️ 文件上传管理
- ⚙️ 系统设置

### 技术特点
- ✅ 前后端分离架构
- 🔐 JWT身份认证
- 🗄️ MySQL数据库
- 📝 自动API文档
- 🌍 多语言支持
- 🎯 RESTful API设计

## 技术栈

### 后端
- **FastAPI** - 现代Python Web框架
- **SQLAlchemy 2.0** - ORM数据库操作
- **MySQL** - 关系型数据库
- **PyMySQL** - MySQL驱动
- **JWT** - 身份认证
- **Pydantic** - 数据验证
- **Uvicorn** - ASGI服务器

### 前端
- **HTML5** - 语义化标记
- **CSS3** - 现代样式设计
- **JavaScript (ES6+)** - 交互逻辑
- **Font Awesome** - 图标库
- **响应式设计** - 移动端适配

## 项目结构

```
shopSite/
├── api/                    # 后端API模块
│   ├── models/            # 数据库模型
│   │   ├── __init__.py
│   │   ├── database.py    # 数据库连接
│   │   ├── models.py      # SQLAlchemy模型
│   │   └── schemas.py     # Pydantic模式
│   ├── routes/            # API路由
│   │   ├── __init__.py
│   │   ├── auth.py        # 认证路由
│   │   ├── admin.py       # 管理员路由
│   │   ├── categories.py  # 分类路由
│   │   ├── products.py    # 产品路由
│   │   └── upload.py      # 上传路由
│   └── utils/             # 工具函数
│       ├── __init__.py
│       └── auth.py        # 认证工具
├── config/                # 配置模块
│   ├── __init__.py
│   ├── config.py          # 配置管理
│   └── settings.ini       # 配置文件
├── web/                   # 前端文件
│   ├── css/               # 样式文件
│   │   ├── style.css      # 主站样式
│   │   └── admin.css      # 管理后台样式
│   ├── js/                # JavaScript文件
│   │   ├── api.js         # API客户端
│   │   ├── main.js        # 主站逻辑
│   │   └── admin.js       # 管理后台逻辑
│   ├── index.html         # 主站首页
│   └── admin.html         # 管理后台
├── uploads/               # 上传文件目录
├── main.py                # 主应用文件
├── initialize_db.py       # 数据库初始化
├── requirements.txt       # Python依赖
├── start_server.bat       # Windows启动脚本
└── README.md              # 项目说明
```

## 快速开始

### 环境要求
- Python 3.8+
- MySQL 5.7+
- 支持现代浏览器

### 安装步骤

1. **克隆项目**
   ```bash
   git clone <repository-url>
   cd shopSite
   ```

2. **配置数据库**
   - 启动MySQL服务
   - 创建数据库（可选，程序会自动创建）
   - 修改 `config/settings.ini` 中的数据库配置

3. **一键启动**
   ```bash
   # Windows
   start_server.bat
   
   # 或手动执行
   pip install -r requirements.txt
   python initialize_db.py
   python main.py
   ```

### 访问地址

- **前端网站**: http://localhost:8000/web/
- **管理后台**: http://localhost:8000/web/admin.html
- **API文档**: http://localhost:8000/api/docs

### 默认管理员账户
- 用户名: `admin`
- 密码: `admin123`

## 配置说明

### 数据库配置 (config/settings.ini)
```ini
[database]
host = localhost
port = 3306
username = root
password = your_password
database = shop_db
```

### 应用配置
```ini
[app]
host = 0.0.0.0
port = 8000
debug = true
base_url = http://localhost:8000
```

## API文档

启动服务后访问 http://localhost:8000/api/docs 查看完整的API文档。

### 主要API端点

- `GET /api/categories` - 获取分类列表
- `GET /api/products` - 获取产品列表
- `POST /api/admin/login` - 管理员登录
- `POST /api/categories` - 创建分类 (需认证)
- `POST /api/products` - 创建产品 (需认证)

## 开发指南

### 添加新功能
1. 在 `api/models/models.py` 中定义数据模型
2. 在 `api/models/schemas.py` 中定义API模式
3. 在 `api/routes/` 中创建路由文件
4. 在 `main.py` 中注册路由

### 前端开发
- 主站逻辑在 `web/js/main.js`
- 管理后台逻辑在 `web/js/admin.js`
- API调用统一使用 `web/js/api.js`

### 数据库迁移
```bash
# 重新初始化数据库
python initialize_db.py
```

## 部署说明

### 生产环境配置
1. 修改 `config/settings.ini` 中的配置
2. 设置 `debug = false`
3. 配置反向代理 (Nginx)
4. 使用 Gunicorn 启动

### Docker部署 (待实现)
```bash
docker-compose up -d
```

## 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交变更
4. 发起 Pull Request

## 许可证

MIT License

## 更新日志

### v1.0.0 (2024-12-xx)
- ✅ 完整的产品展示系统
- ✅ 管理后台功能
- ✅ 响应式前端设计
- ✅ RESTful API
- ✅ JWT认证系统

## 支持

如有问题，请在GitHub上创建Issue或联系开发团队。

## 功能特点

### 前端功能
- 🌍 **多语言支持**: 支持中文/英文切换
- 📱 **响应式设计**: 完美适配手机、平板、电脑
- 🔍 **智能搜索**: 支持产品名称、描述模糊搜索
- 📂 **分类筛选**: 按产品分类浏览
- 🎨 **现代化UI**: 美观的卡片设计和动画效果
- 💬 **悬浮操作**: 快速联系和客服功能

### 后端功能
- 🚀 **FastAPI框架**: 高性能异步API
- 🗄️ **SQLite数据库**: 轻量级本地数据库
- 🔐 **JWT认证**: 安全的管理员认证
- 🌐 **RESTful API**: 标准化的API接口
- 📊 **分页支持**: 高效的数据分页

### 管理后台
- 👨‍💼 **产品管理**: 增删改查产品信息
- 🏷️ **分类管理**: 管理产品分类
- 📈 **数据统计**: 产品和分类统计
- 🔧 **系统设置**: 数据库初始化等功能

## 项目结构

```
shopSite/
├── backend/
│   └── main.py              # FastAPI 主程序
├── frontend/
│   ├── static/
│   │   ├── css/
│   │   │   ├── style.css    # 前端样式
│   │   │   └── admin.css    # 管理后台样式
│   │   ├── js/
│   │   │   ├── script.js    # 前端脚本
│   │   │   ├── admin.js     # 管理后台脚本
│   │   │   └── admin-login.js # 登录页脚本
│   │   └── images/          # 图片资源
│   └── templates/
│       ├── index.html       # 主页模板
│       └── admin/
│           ├── login.html   # 管理员登录页
│           └── dashboard.html # 管理后台首页
├── requirements.txt         # Python依赖包
├── start.bat               # Windows启动脚本
└── README.md               # 项目说明
```

## 快速开始

### 环境要求
- Python 3.7+
- MySQL 5.7+ 或 MariaDB 10.2+
- Windows 操作系统

### 数据库配置

#### 方法一：使用配置助手（推荐）
1. 双击运行 `setup_mysql.bat`
2. 按提示输入数据库连接信息
3. 配置完成后重新打开命令行

#### 方法二：手动设置环境变量
```cmd
set DB_HOST=localhost
set DB_PORT=3306
set DB_USER=your_username
set DB_PASSWORD=your_password
set DB_NAME=fanxi_shop
```

#### 方法三：修改代码
直接编辑 `backend/main.py` 文件中的数据库配置

### MySQL数据库准备
在MySQL中创建数据库：
```sql
CREATE DATABASE fanxi_shop CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

详细的数据库配置说明请参考 `database_setup.md` 文件。

### 一键启动
1. 配置好数据库连接信息
2. 双击运行 `start.bat` 文件
3. 等待依赖安装和数据库初始化完成
4. 浏览器访问 http://localhost:8000

### 手动启动
```bash
# 1. 创建虚拟环境
python -m venv venv

# 2. 激活虚拟环境
venv\Scripts\activate

# 3. 安装依赖
pip install -r requirements.txt

# 4. 初始化数据库
python init_db.py

# 5. 启动服务器
cd backend
python main.py
```

## 访问地址

- **前端网站**: http://localhost:8000
- **管理后台**: http://localhost:8000/admin
- **API文档**: http://localhost:8000/docs

## 默认账户

**管理员账户**
- 用户名: `admin`
- 密码: `password`

## API接口

### 公共接口

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/categories` | 获取分类列表 |
| GET | `/products` | 获取产品列表 |
| GET | `/products/{id}` | 获取产品详情 |
| GET | `/init-db` | 初始化数据库 |

### 管理接口 (需要认证)

| 方法 | 路径 | 描述 |
|------|------|------|
| POST | `/admin/login` | 管理员登录 |
| POST | `/admin/products` | 创建产品 |
| PUT | `/admin/products/{id}` | 更新产品 |
| DELETE | `/admin/products/{id}` | 删除产品 |
| POST | `/admin/categories` | 创建分类 |
| PUT | `/admin/categories/{id}` | 更新分类 |
| DELETE | `/admin/categories/{id}` | 删除分类 |

## 数据模型

### 产品 (Product)
```json
{
  "id": 1,
  "name": "产品名称",
  "name_en": "Product Name",
  "name_zh": "产品名称",
  "description": "产品描述",
  "description_en": "Product Description",
  "description_zh": "产品描述",
  "price": 99.99,
  "image_url": "https://example.com/image.jpg",
  "category_id": 1
}
```

### 分类 (Category)
```json
{
  "id": 1,
  "name": "分类名称",
  "name_en": "Category Name",
  "name_zh": "分类名称"
}
```

## 多语言支持

网站支持中英文双语:
- 点击导航栏"全文翻译"按钮切换语言
- API支持通过 `lang` 参数或 `Accept-Language` 头指定语言
- 所有文本字段都支持多语言版本

## 自定义配置

### 修改默认管理员账户
编辑 `backend/main.py` 文件中的登录验证逻辑:
```python
if login_data.username == "your_username" and login_data.password == "your_password":
```

### 修改JWT密钥
编辑 `backend/main.py` 文件:
```python
SECRET_KEY = "your-secret-key-here"
```

### 添加图片
将图片文件放入 `frontend/static/images/` 目录:
- `banner.jpg` - 主页横幅图片
- `logo.png` - 网站Logo

## 部署说明

### 开发环境
使用内置的Uvicorn服务器，适合开发和测试。

### 生产环境
建议使用以下配置:
1. 使用Nginx作为反向代理
2. 使用Gunicorn + Uvicorn作为WSGI服务器
3. 使用PostgreSQL或MySQL数据库
4. 配置HTTPS证书

## 浏览器支持

- ✅ Chrome 70+
- ✅ Firefox 65+
- ✅ Safari 12+
- ✅ Edge 79+

## 技术栈

### 后端
- **FastAPI**: 现代高性能Web框架
- **SQLAlchemy**: Python SQL工具包和ORM
- **Pydantic**: 数据验证和序列化
- **Python-JOSE**: JWT处理
- **Uvicorn**: ASGI服务器

### 前端
- **HTML5**: 语义化标记
- **CSS3**: 现代样式和动画
- **JavaScript ES6+**: 现代JavaScript特性
- **Font Awesome**: 图标库

### 数据库
- **MySQL**: 主要支持的生产环境数据库
- **SQLite**: 备选方案，当MySQL不可用时自动使用

## 数据库配置

### MySQL配置
系统优先使用MySQL数据库，配置方式：

1. **环境变量配置**（推荐）:
   ```cmd
   set DB_HOST=localhost
   set DB_PORT=3306
   set DB_USER=your_username
   set DB_PASSWORD=your_password
   set DB_NAME=fanxi_shop
   ```

2. **使用配置助手**:
   ```cmd
   setup_mysql.bat
   ```

3. **代码配置**:
   直接修改 `backend/main.py` 中的数据库连接参数

### SQLite备选
如果MySQL连接失败，系统会自动使用SQLite作为备选数据库。

详细配置说明请参考 `database_setup.md` 文件。

## 许可证

MIT License

## 联系方式

如有问题请创建Issue或联系开发者。

---

**FANXI** - 现代化产品展示解决方案
