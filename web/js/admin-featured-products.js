/**
 * 管理员特色产品管理功能
 */

// 全局变量
let featuredProducts = [];
let allProducts = [];
let filteredProducts = [];
let currentEditingId = null;
let deleteTargetId = null;

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 检查管理员身份
    checkAdminAuth();
    
    // 初始化页面
    initializePage();
});

// 初始化页面
function initializePage() {
    loadFeaturedProducts();
    loadProducts();
    loadPositionsOverview();
}

// 加载特色产品列表
async function loadFeaturedProducts() {
    try {
        showLoading();
        const response = await fetch('/api/admin/featured-products/', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
            }
        });
        
        if (response.ok) {
            featuredProducts = await response.json();
            renderFeaturedProductsTable();
        } else {
            throw new Error('加载特色产品失败');
        }
    } catch (error) {
        console.error('加载特色产品出错:', error);
        showToast('加载特色产品失败', 'error');
    } finally {
        hideLoading();
    }
}

// 加载所有产品（用于选择）
async function loadProducts() {
    try {
        // 先尝试管理员API，如果失败则使用公共API
        let response = await fetch('/api/admin/products', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
            }
        });
        
        // 如果管理员API失败，使用公共产品API
        if (!response.ok) {
            console.log('Admin products API failed, trying public API...');
            response = await fetch('/api/products?size=100');
        }
        
        console.log('Products API response status:', response.status);
        if (response.ok) {
            const data = await response.json();
            console.log('Products data received:', data);
            
            // 处理不同的响应格式
            if (Array.isArray(data)) {
                allProducts = data;
            } else if (data.products && Array.isArray(data.products)) {
                allProducts = data.products;
            } else if (data.data && Array.isArray(data.data)) {
                allProducts = data.data;
            } else {
                allProducts = [];
            }
            
            filteredProducts = [...allProducts];
            console.log('All products loaded:', allProducts.length);
        } else {
            const errorText = await response.text();
            console.error('API error response:', errorText);
            throw new Error(`加载产品失败: ${response.status}`);
        }
    } catch (error) {
        console.error('加载产品出错:', error);
        showToast('加载产品失败: ' + error.message, 'error');
    }
}

// 加载位置状态概览
async function loadPositionsOverview() {
    try {
        const response = await fetch('/api/admin/featured-products/positions', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
            }
        });
        
        if (response.ok) {
            const positions = await response.json();
            renderPositionsOverview(positions);
        } else {
            throw new Error('加载位置状态失败');
        }
    } catch (error) {
        console.error('加载位置状态出错:', error);
        showToast('加载位置状态失败', 'error');
    }
}

// 渲染位置状态概览
function renderPositionsOverview(positions) {
    const container = document.getElementById('positions-grid');
    if (!container) return;
    
    let html = '';
    
    for (let i = 1; i <= 6; i++) {
        const position = positions[i.toString()];
        const isOccupied = position !== null;
        
        html += `
            <div class="position-card ${isOccupied ? 'occupied' : 'empty'}">
                <div class="position-number">位置 ${i}</div>
                <div class="position-status">
                    ${isOccupied ? '已配置' : '未配置'}
                </div>
                
                ${isOccupied ? `
                    <div class="position-product-info">
                        <div class="position-product-name">${position.product_name}</div>
                        ${position.product_image ? `
                            <img src="${position.product_image}" alt="${position.product_name}" class="position-product-image" onerror="this.src='/web/images/default-product.jpg'">
                        ` : ''}
                    </div>
                    <div class="position-actions">
                        <button class="btn btn-sm btn-warning" onclick="editFeaturedProduct(${position.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteFeaturedProduct(${position.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                ` : `
                    <div class="position-actions">
                        <button class="btn btn-sm btn-primary" onclick="addToPosition(${i})">
                            <i class="fas fa-plus"></i>
                            配置产品
                        </button>
                    </div>
                `}
            </div>
        `;
    }
    
    container.innerHTML = html;
}

// 渲染特色产品表格
function renderFeaturedProductsTable() {
    const tbody = document.getElementById('featured-products-tbody');
    if (!tbody) return;
    
    if (featuredProducts.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 40px;">
                    <div style="color: #6c757d;">
                        <i class="fas fa-inbox" style="font-size: 2rem; margin-bottom: 10px; display: block;"></i>
                        暂无特色产品配置
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    const sortedProducts = [...featuredProducts].sort((a, b) => a.position - b.position);
    
    const html = sortedProducts.map(item => {
        const product = item.product || {};
        const category = product.category || {};
        
        return `
            <tr>
                <td>
                    <div class="position-badge">${item.position}</div>
                </td>
                <td>
                    <div class="product-info-cell">
                        <img src="${product.image_url || '/web/images/default-product.jpg'}" 
                             alt="${product.name || '未知产品'}" 
                             onerror="this.src='/web/images/default-product.jpg'">
                        <div class="product-details">
                            <h4>${product.name || '未知产品'}</h4>
                            <p>${category.name || '无分类'} • SKU: ${product.sku || 'N/A'}</p>
                        </div>
                    </div>
                </td>
                <td>
                    <img src="${product.image_url || '/web/images/default-product.jpg'}" 
                         alt="${product.name || '未知产品'}" 
                         style="width: 60px; height: 60px; border-radius: 8px; object-fit: cover;"
                         onerror="this.src='/web/images/default-product.jpg'">
                </td>
                <td>
                    <div class="price-display">¥${product.price || '0.00'}</div>
                    ${product.original_price && product.original_price > product.price ? 
                        `<small style="color: #6c757d; text-decoration: line-through;">¥${product.original_price}</small>` : ''
                    }
                </td>
                <td>
                    <span class="status-badge ${item.is_active ? 'active' : 'inactive'}">
                        ${item.is_active ? '激活' : '停用'}
                    </span>
                </td>
                <td>${formatDateTime(item.created_at)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-warning" onclick="editFeaturedProduct(${item.id})" title="编辑">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteFeaturedProduct(${item.id})" title="删除">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
    
    tbody.innerHTML = html;
}

// 显示添加模态框
function showAddModal() {
    currentEditingId = null;
    document.getElementById('modal-title').textContent = '添加特色产品';
    document.getElementById('featured-product-form').reset();
    document.getElementById('featured-id').value = '';
    document.getElementById('selected-product-id').value = '';
    document.getElementById('is-active').checked = true;
    
    // 渲染产品列表
    renderProductsList();
    
    // 显示模态框
    document.getElementById('add-featured-modal').style.display = 'block';
}

// 编辑特色产品
function editFeaturedProduct(id) {
    const item = featuredProducts.find(fp => fp.id === id);
    if (!item) return;
    
    currentEditingId = id;
    document.getElementById('modal-title').textContent = '编辑特色产品';
    document.getElementById('featured-id').value = id;
    document.getElementById('position-select').value = item.position;
    document.getElementById('selected-product-id').value = item.product_id;
    document.getElementById('is-active').checked = item.is_active;
    
    // 渲染产品列表并选中当前产品
    renderProductsList();
    
    // 选中当前产品
    const productItems = document.querySelectorAll('.product-item');
    productItems.forEach(itemEl => {
        if (parseInt(itemEl.dataset.productId) === item.product_id) {
            itemEl.classList.add('selected');
        }
    });
    
    // 显示模态框
    document.getElementById('add-featured-modal').style.display = 'block';
}

// 添加到指定位置
function addToPosition(position) {
    showAddModal();
    document.getElementById('position-select').value = position;
}

// 渲染产品列表
function renderProductsList() {
    const container = document.getElementById('products-list');
    console.log('Rendering products list, container:', container);
    console.log('Filtered products:', filteredProducts);
    
    if (!container) {
        console.error('Products list container not found');
        return;
    }
    
    if (!filteredProducts || filteredProducts.length === 0) {
        console.log('No products to display');
        container.innerHTML = `
            <div style="text-align: center; padding: 20px; color: #6c757d;">
                <i class="fas fa-search"></i> 没有找到匹配的产品
                <br><small>总产品数: ${allProducts ? allProducts.length : 0}</small>
            </div>
        `;
        return;
    }
    
    const html = filteredProducts.map(product => `
        <div class="product-item" data-product-id="${product.id}" onclick="selectProduct(${product.id})">
            <img src="${product.image_url || '/web/images/default-product.jpg'}" 
                 alt="${product.name}" 
                 onerror="this.src='/web/images/default-product.jpg'">
            <div class="product-item-info">
                <h4>${product.name}</h4>
                <p>${product.description || '无描述'}</p>
            </div>
            <div class="product-item-price">¥${product.price}</div>
        </div>
    `).join('');
    
    container.innerHTML = html;
    console.log('Products list rendered successfully');
}

// 选择产品
function selectProduct(productId) {
    // 移除之前的选中状态
    document.querySelectorAll('.product-item').forEach(item => {
        item.classList.remove('selected');
    });
    
    // 添加选中状态
    const selectedItem = document.querySelector(`[data-product-id="${productId}"]`);
    if (selectedItem) {
        selectedItem.classList.add('selected');
        document.getElementById('selected-product-id').value = productId;
    }
}

// 搜索产品
function searchProducts() {
    const searchTerm = document.getElementById('product-search').value.toLowerCase().trim();
    
    if (searchTerm === '') {
        filteredProducts = [...allProducts];
    } else {
        filteredProducts = allProducts.filter(product => 
            product.name.toLowerCase().includes(searchTerm) ||
            (product.description && product.description.toLowerCase().includes(searchTerm)) ||
            (product.sku && product.sku.toLowerCase().includes(searchTerm))
        );
    }
    
    renderProductsList();
}

// 保存特色产品
async function saveFeaturedProduct() {
    try {
        const productId = document.getElementById('selected-product-id').value;
        const position = document.getElementById('position-select').value;
        const isActive = document.getElementById('is-active').checked;
        
        if (!productId) {
            showToast('请选择产品', 'error');
            return;
        }
        
        if (!position) {
            showToast('请选择位置', 'error');
        }
        
        const data = {
            product_id: parseInt(productId),
            position: parseInt(position),
            is_active: isActive
        };
        
        console.log('准备发送的数据:', data);
        console.log('当前编辑ID:', currentEditingId);
        
        showLoading();
        
        let response;
        const url = currentEditingId 
            ? `/api/admin/featured-products/${currentEditingId}`
            : '/api/admin/featured-products/';
            
        console.log('请求URL:', url);
        console.log('请求方法:', currentEditingId ? 'PUT' : 'POST');
        
        if (currentEditingId) {
            // 编辑
            response = await fetch(`/api/admin/featured-products/${currentEditingId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
                },
                body: JSON.stringify(data)
            });
        } else {
            // 新增
            response = await fetch('/api/admin/featured-products/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
                },
                body: JSON.stringify(data)
            });
        }
        
        console.log('响应状态:', response.status);
        console.log('响应OK:', response.ok);
        
        if (response.ok) {
            const result = await response.json();
            console.log('成功响应数据:', result);
            showToast(currentEditingId ? '更新成功' : '添加成功', 'success');
            closeModal();
            await loadFeaturedProducts();
            await loadPositionsOverview();
        } else {
            const errorText = await response.text();
            console.log('错误响应原始文本:', errorText);
            
            let errorDetail;
            try {
                const errorJson = JSON.parse(errorText);
                errorDetail = errorJson.detail || errorJson.message || '操作失败';
                console.log('解析的错误:', errorJson);
            } catch (e) {
                errorDetail = errorText || '操作失败';
                console.log('无法解析错误响应为JSON');
            }
            
            throw new Error(errorDetail);
        }
    } catch (error) {
        console.error('保存特色产品出错:', error);
        showToast(error.message || '操作失败', 'error');
    } finally {
        hideLoading();
    }
}

// 删除特色产品
function deleteFeaturedProduct(id) {
    const item = featuredProducts.find(fp => fp.id === id);
    if (!item) return;
    
    deleteTargetId = id;
    
    // 设置删除信息
    const deleteInfo = document.getElementById('delete-info');
    const product = item.product || {};
    deleteInfo.innerHTML = `
        <h4>将要删除的特色产品配置:</h4>
        <p><strong>位置:</strong> ${item.position}</p>
        <p><strong>产品:</strong> ${product.name || '未知产品'}</p>
        <p><strong>状态:</strong> ${item.is_active ? '激活' : '停用'}</p>
    `;
    
    document.getElementById('delete-confirm-modal').style.display = 'block';
}

// 确认删除
async function confirmDelete() {
    if (!deleteTargetId) return;
    
    try {
        showLoading();
        const response = await fetch(`/api/admin/featured-products/${deleteTargetId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
            }
        });
        
        if (response.ok) {
            showToast('删除成功', 'success');
            closeDeleteModal();
            await loadFeaturedProducts();
            await loadPositionsOverview();
        } else {
            const error = await response.json();
            throw new Error(error.detail || '删除失败');
        }
    } catch (error) {
        console.error('删除特色产品出错:', error);
        showToast(error.message || '删除失败', 'error');
    } finally {
        hideLoading();
        deleteTargetId = null;
    }
}

// 关闭模态框
function closeModal() {
    document.getElementById('add-featured-modal').style.display = 'none';
    currentEditingId = null;
}

// 关闭删除确认模态框
function closeDeleteModal() {
    document.getElementById('delete-confirm-modal').style.display = 'none';
    deleteTargetId = null;
}

// 刷新位置状态
function refreshPositions() {
    loadPositionsOverview();
    loadFeaturedProducts();
}

// 格式化日期时间
function formatDateTime(dateString) {
    if (!dateString) return 'N/A';
    
    try {
        const date = new Date(dateString);
        return date.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        return 'N/A';
    }
}

// 显示加载指示器
function showLoading() {
    const loading = document.getElementById('loading');
    if (loading) {
        loading.style.display = 'flex';
    }
}

// 隐藏加载指示器
function hideLoading() {
    const loading = document.getElementById('loading');
    if (loading) {
        loading.style.display = 'none';
    }
}

// 显示toast通知
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// 点击模态框外部关闭
window.onclick = function(event) {
    const addModal = document.getElementById('add-featured-modal');
    const deleteModal = document.getElementById('delete-confirm-modal');
    
    if (event.target === addModal) {
        closeModal();
    } else if (event.target === deleteModal) {
        closeDeleteModal();
    }
}

// ESC键关闭模态框
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeModal();
        closeDeleteModal();
    }
});
