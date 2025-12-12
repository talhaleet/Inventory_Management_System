// Products Management Module

class ProductsManager {
    constructor() {
        this.currentEditId = null;
        this.initEventListeners();
    }

    initEventListeners() {
        // Product form save
        document.getElementById('saveProduct')?.addEventListener('click', () => this.saveProduct());
        
        // Form validation
        document.getElementById('productForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveProduct();
        });
    }

    loadProductsTable() {
        const products = storage.getProducts();
        const tableBody = document.querySelector('#productsTable tbody');
        
        if (!tableBody) return;
        
        tableBody.innerHTML = '';
        
        products.forEach(product => {
            const status = storage.getStockStatus(product.stock, product.minStock);
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td><strong>${product.sku}</strong></td>
                <td>
                    <div>${product.name}</div>
                    <small class="text-muted">${product.category}</small>
                </td>
                <td class="text-center">
                    <span class="badge bg-${status.class}">${product.stock} units</span>
                    ${product.stock <= product.minStock ? 
                        '<br><small class="text-danger">Low stock!</small>' : ''}
                </td>
                <td class="text-center">${product.minStock}</td>
                <td>${formatCurrency(product.price)}</td>
                <td>${product.supplier || 'N/A'}</td>
                <td>${formatDate(product.lastUpdated)}</td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary edit-product" data-id="${product.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-outline-danger delete-product" data-id="${product.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                        <button class="btn btn-outline-info quick-transaction" data-id="${product.id}">
                            <i class="fas fa-exchange-alt"></i>
                        </button>
                    </div>
                </td>
            `;
            
            tableBody.appendChild(row);
        });
        
        // Initialize DataTable
        $('#productsTable').DataTable({
            pageLength: 10,
            order: [[6, 'desc']],
            responsive: true
        });
        
        // Add event listeners to buttons
        this.addProductEventListeners();
    }

    addProductEventListeners() {
        // Edit buttons
        document.querySelectorAll('.edit-product').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = e.currentTarget.dataset.id;
                this.editProduct(productId);
            });
        });
        
        // Delete buttons
        document.querySelectorAll('.delete-product').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = e.currentTarget.dataset.id;
                this.deleteProduct(productId);
            });
        });
        
        // Quick transaction buttons
        document.querySelectorAll('.quick-transaction').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = e.currentTarget.dataset.id;
                this.openQuickTransaction(productId);
            });
        });
    }

    editProduct(productId) {
        const product = storage.getProductById(productId);
        if (!product) return;
        
        this.currentEditId = productId;
        
        // Fill form
        document.getElementById('productId').value = product.id;
        document.getElementById('productName').value = product.name;
        document.getElementById('productSKU').value = product.sku;
        document.getElementById('productCategory').value = product.category;
        document.getElementById('productStock').value = product.stock;
        document.getElementById('productMinStock').value = product.minStock;
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productDescription').value = product.description || '';
        
        // Populate suppliers dropdown
        this.populateSuppliersDropdown(product.supplier);
        
        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('productModal'));
        modal.show();
        
        // Update modal title
        document.querySelector('#productModal .modal-title').textContent = 'Edit Product';
    }

    populateSuppliersDropdown(selectedSupplier = '') {
        const dropdown = document.getElementById('productSupplier');
        dropdown.innerHTML = '<option value="">Select Supplier</option>';
        
        const suppliers = storage.getSuppliers();
        suppliers.forEach(supplier => {
            const option = document.createElement('option');
            option.value = supplier.name;
            option.textContent = supplier.name;
            if (supplier.name === selectedSupplier) {
                option.selected = true;
            }
            dropdown.appendChild(option);
        });
    }

    saveProduct() {
        // Validate form
        const form = document.getElementById('productForm');
        if (!form.checkValidity()) {
            form.classList.add('was-validated');
            return;
        }
        
        const productData = {
            name: document.getElementById('productName').value,
            sku: document.getElementById('productSKU').value,
            category: document.getElementById('productCategory').value,
            stock: parseInt(document.getElementById('productStock').value),
            minStock: parseInt(document.getElementById('productMinStock').value),
            price: parseFloat(document.getElementById('productPrice').value),
            supplier: document.getElementById('productSupplier').value,
            description: document.getElementById('productDescription').value
        };
        
        if (this.currentEditId) {
            // Update existing product
            storage.updateProduct(this.currentEditId, productData);
            showAlert('Product updated successfully!', 'success');
        } else {
            // Add new product
            storage.addProduct(productData);
            showAlert('Product added successfully!', 'success');
        }
        
        // Close modal and refresh
        bootstrap.Modal.getInstance(document.getElementById('productModal')).hide();
        this.currentEditId = null;
        this.loadProductsTable();
        loadDashboard(); // Refresh dashboard stats
    }

    deleteProduct(productId) {
        if (confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
            storage.deleteProduct(productId);
            showAlert('Product deleted successfully!', 'success');
            this.loadProductsTable();
            loadDashboard();
        }
    }

    openQuickTransaction(productId) {
        const product = storage.getProductById(productId);
        if (!product) return;
        
        // Open transaction modal
        const transactionModal = new bootstrap.Modal(document.getElementById('transactionModal'));
        
        // Set product in dropdown
        const productSelect = document.getElementById('transactionProduct');
        productSelect.innerHTML = `<option value="${product.id}">${product.name} (${product.sku})</option>`;
        productSelect.disabled = true;
        
        transactionModal.show();
    }

    renderProductsPage() {
        const content = document.getElementById('page-content');
        content.innerHTML = `
            <div class="row mb-4">
                <div class="col-md-8">
                    <h2><i class="fas fa-box"></i> Product Inventory</h2>
                    <p class="text-muted">Manage your product inventory, stock levels, and pricing.</p>
                </div>
                <div class="col-md-4 text-end">
                    <button class="btn btn-primary" id="addProductBtn">
                        <i class="fas fa-plus"></i> Add New Product
                    </button>
                    <button class="btn btn-outline-secondary" id="exportProductsBtn">
                        <i class="fas fa-download"></i> Export
                    </button>
                </div>
            </div>
            
            <div class="row">
                <div class="col-md-3">
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title">Quick Stats</h5>
                            <div class="mt-3">
                                <div class="d-flex justify-content-between mb-2">
                                    <span>Total Products:</span>
                                    <strong>${storage.getProducts().length}</strong>
                                </div>
                                <div class="d-flex justify-content-between mb-2">
                                    <span>Low Stock:</span>
                                    <strong class="text-warning">${storage.getLowStockProducts().length}</strong>
                                </div>
                                <div class="d-flex justify-content-between">
                                    <span>Out of Stock:</span>
                                    <strong class="text-danger">${storage.getProducts().filter(p => p.stock === 0).length}</strong>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="col-md-9">
                    <div class="card">
                        <div class="card-body">
                            <div class="table-responsive">
                                <table class="table table-hover" id="productsTable">
                                    <thead>
                                        <tr>
                                            <th>SKU</th>
                                            <th>Product</th>
                                            <th class="text-center">Current Stock</th>
                                            <th class="text-center">Min Stock</th>
                                            <th>Price</th>
                                            <th>Supplier</th>
                                            <th>Last Updated</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <!-- Products will be loaded here -->
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add event listeners to buttons
        document.getElementById('addProductBtn')?.addEventListener('click', () => this.openAddProductModal());
        document.getElementById('exportProductsBtn')?.addEventListener('click', () => this.exportProducts());
        
        // Load products table
        this.loadProductsTable();
    }

    openAddProductModal() {
        this.currentEditId = null;
        
        // Reset form
        document.getElementById('productForm').reset();
        document.getElementById('productForm').classList.remove('was-validated');
        document.getElementById('productId').value = '';
        
        // Populate suppliers dropdown
        this.populateSuppliersDropdown();
        
        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('productModal'));
        modal.show();
        
        // Update modal title
        document.querySelector('#productModal .modal-title').textContent = 'Add New Product';
    }

    exportProducts() {
        const products = storage.getProducts();
        if (products.length === 0) {
            showAlert('No products to export', 'warning');
            return;
        }
        
        storage.exportToCSV(products, `products_export_${new Date().toISOString().split('T')[0]}.csv`);
        showAlert('Products exported successfully!', 'success');
    }
}

// Initialize products manager
const productsManager = new ProductsManager();