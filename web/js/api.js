/**
 * API 客户端
 * 处理与后端API的所有通信
 */

class API {
    constructor() {
        this.baseURL = 'http://localhost:8000/api';
        this.token = localStorage.getItem('admin_token');
    }

    // 获取请求头
    getHeaders(includeAuth = false) {
        const headers = {
            'Content-Type': 'application/json',
        };
        
        if (includeAuth && this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        
        return headers;
    }

    // 处理API响应
    async handleResponse(response) {
        if (!response.ok) {
            // 处理401未授权错误
            if (response.status === 401) {
                // 清除过期的令牌
                this.clearToken();
                
                // 如果在管理页面，重定向到登录
                if (window.location.pathname.includes('admin')) {
                    const shouldReload = confirm('登录已过期，需要重新登录。是否现在登录？');
                    if (shouldReload) {
                        window.location.reload();
                    }
                }
                
                throw new Error('登录已过期，请重新登录');
            }
            
            let error;
            try {
                error = await response.json();
            } catch (e) {
                error = { detail: response.status === 500 ? '服务器内部错误' : '请求失败' };
            }
            
            // 处理422验证错误，显示详细的字段错误信息
            if (response.status === 422 && error.detail && Array.isArray(error.detail)) {
                const fieldErrors = error.detail.map(err => {
                    const field = err.loc ? err.loc.join('.') : '未知字段';
                    return `${field}: ${err.msg}`;
                }).join('; ');
                throw new Error(`数据验证失败: ${fieldErrors}`);
            }
            
            throw new Error(error.detail || error.message || `HTTP ${response.status}`);
        }
        return response.json();
    }

    // 通用请求方法
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            ...options,
            headers: {
                ...this.getHeaders(options.auth),
                ...options.headers,
            },
        };

        try {
            const response = await fetch(url, config);
            return await this.handleResponse(response);
        } catch (error) {
            console.error('API请求失败:', error);
            throw error;
        }
    }

    // GET 请求
    async get(endpoint, auth = false) {
        return this.request(endpoint, { method: 'GET', auth });
    }

    // POST 请求
    async post(endpoint, data, auth = false) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data),
            auth,
        });
    }

    // PUT 请求
    async put(endpoint, data, auth = false) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data),
            auth,
        });
    }

    // DELETE 请求
    async delete(endpoint, auth = false) {
        return this.request(endpoint, { method: 'DELETE', auth });
    }

    // 文件上传
    async uploadFile(file, auth = true) {
        const formData = new FormData();
        formData.append('file', file);

        return this.request('/upload/image', {
            method: 'POST',
            body: formData,
            headers: auth && this.token ? { 'Authorization': `Bearer ${this.token}` } : {},
            auth: false, // 不使用JSON headers
        });
    }

    // 设置认证token
    setToken(token) {
        this.token = token;
        if (token) {
            localStorage.setItem('admin_token', token);
        } else {
            localStorage.removeItem('admin_token');
        }
    }

    // 清除认证token
    clearToken() {
        this.token = null;
        localStorage.removeItem('admin_token');
    }

    // 检查是否已认证
    isAuthenticated() {
        return !!this.token;
    }
    
    // 获取当前token
    getToken() {
        return this.token;
    }

    // === 认证相关API ===
    
    // 管理员登录
    async login(username, password) {
        const response = await this.post('/admin/login', { username, password });
        if (response.access_token) {
            this.setToken(response.access_token);
        }
        return response;
    }

    // 管理员登出
    async logout() {
        try {
            await this.post('/admin/logout', {}, true);
        } finally {
            this.setToken(null);
        }
    }

    // 获取当前管理员信息
    async getCurrentAdmin() {
        return this.get('/admin/me', true);
    }

    // === 分类相关API ===
    
    // 获取分类列表（公开API，只返回活跃分类）
    async getCategories(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.get(`/categories/${queryString ? '?' + queryString : ''}`);
    }
    
    // 获取所有分类列表（管理员API，包含所有分类）
    async getAllCategories(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.get(`/admin/categories/${queryString ? '?' + queryString : ''}`, true);
    }

    // 获取分类详情（公开API）
    async getCategory(id) {
        return this.get(`/categories/${id}`);
    }
    
    // 获取分类详情（管理员API）
    async getAdminCategory(id) {
        return this.get(`/admin/categories/${id}`, true);
    }

    // 创建分类
    async createCategory(data) {
        return this.post('/admin/categories/', data, true);
    }

    // 更新分类
    async updateCategory(id, data) {
        return this.put(`/admin/categories/${id}`, data, true);
    }

    // 删除分类
    async deleteCategory(id) {
        return this.delete(`/admin/categories/${id}`, true);
    }

    // === 产品相关API ===
    
    // 获取产品列表（公开API，只返回活跃产品）
    async getProducts(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.get(`/products/${queryString ? '?' + queryString : ''}`);
    }
    
    // 获取所有产品列表（管理员API，包含所有产品）
    async getAllProducts(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.get(`/admin/products/${queryString ? '?' + queryString : ''}`, true);
    }

    // 获取产品详情（公开API）
    async getProduct(id) {
        return this.get(`/products/${id}`);
    }
    
    // 获取产品详情（管理员API）
    async getAdminProduct(id) {
        return this.get(`/admin/products/${id}`, true);
    }

    // 创建产品
    async createProduct(data) {
        return this.post('/admin/products/', data, true);
    }

    // 更新产品
    async updateProduct(id, data) {
        return this.put(`/admin/products/${id}`, data, true);
    }

    // 删除产品
    async deleteProduct(id) {
        return this.delete(`/admin/products/${id}`, true);
    }

    // 搜索产品
    async searchProducts(query, params = {}) {
        const allParams = { q: query, ...params };
        return this.getProducts(allParams);
    }

    // === 管理员管理API ===
    
    // 获取所有管理员
    async getAdmins(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.get(`/admin/admins${queryString ? '?' + queryString : ''}`, true);
    }

    // 创建管理员
    async createAdmin(data) {
        return this.post('/admin/admins', data, true);
    }

    // 更新管理员
    async updateAdmin(id, data) {
        return this.put(`/admin/admins/${id}`, data, true);
    }

    // 删除管理员
    async deleteAdmin(id) {
        return this.delete(`/admin/admins/${id}`, true);
    }

    // === 统计API ===
    
    // 获取仪表板统计数据
    async getDashboardStats() {
        try {
            const [categories, products] = await Promise.all([
                this.getCategories(),
                this.getProducts({ limit: 1000 }) // 获取所有产品用于统计
            ]);

            const activeProducts = products.items.filter(p => p.is_active);
            const totalStock = products.items.reduce((sum, p) => sum + (p.stock_quantity || 0), 0);

            return {
                categories_count: categories.length,
                products_count: products.total || products.items.length,
                active_products_count: activeProducts.length,
                total_stock: totalStock
            };
        } catch (error) {
            console.error('获取统计数据失败:', error);
            return {
                categories_count: 0,
                products_count: 0,
                active_products_count: 0,
                total_stock: 0
            };
        }
    }
}

// 创建全局API实例
const api = new API();
