// Main Application Module

function initApp() {
    // Initialize navigation
    initNavigation();
    
    // Load dashboard by default
    loadDashboard();
    
    // Show welcome message
    setTimeout(() => {
        showAlert('Welcome to Inventory Management System! Data is auto-saved to your browser.', 'info', 5000);
    }, 1000);
    
    // Auto-save indicator
    setInterval(() => {
        storage.updateSyncTime();
    }, 60000); // Update every minute
}

function initNavigation() {
    // Navigation click handlers
    document.querySelectorAll('[data-page]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Update active state
            document.querySelectorAll('.nav-link').forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
            
            // Load page
            const page = this.dataset.page;
            loadPage(page);
        });
    });
}

function loadPage(page) {
    switch(page) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'products':
            productsManager.renderProductsPage();
            break;
        case 'transactions':
            transactionsManager.renderTransactionsPage();
            break;
        case 'suppliers':
            renderSuppliersPage();
            break;
        case 'reports':
            renderReportsPage();
            break;
        default:
            loadDashboard();
    }
}

function loadDashboard() {
    const stats = storage.getInventoryStats();
    const lowStockProducts = storage.getLowStockProducts();
    const recentTransactions = storage.getTransactions().slice(0, 5);
    
    const content = document.getElementById('page-content');
    content.innerHTML = `
        <div class="row mb-4">
            <div class="col-md-8">
                <h2><i class="fas fa-tachometer-alt"></i> Dashboard</h2>
                <p class="text-muted">Overview of your inventory status and recent activities.</p>
            </div>
            <div class="col-md-4 text-end">
                <button class="btn btn-outline-primary" id="backupBtn">
                    <i class="fas fa-database"></i> Backup Data
                </button>
                <button class="btn btn-outline-secondary" id="restoreBtn">
                    <i class="fas fa-upload"></i> Restore
                </button>
            </div>
        </div>
        
        <!-- Stats Cards -->
        <div class="row mb-4">
            <div class="col-md-3">
                <div class="card text-white bg-primary">
                    <div class="card-body stat-card">
                        <i class="fas fa-boxes"></i>
                        <div class="value">${stats.totalProducts}</div>
                        <div class="label">Total Products</div>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card text-white bg-success">
                    <div class="card-body stat-card">
                        <i class="fas fa-dollar-sign"></i>
                        <div class="value">$${stats.totalValue}</div>
                        <div class="label">Total Value</div>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card text-white bg-warning">
                    <div class="card-body stat-card">
                        <i class="fas fa-exclamation-triangle"></i>
                        <div class="value">${stats.lowStockCount}</div>
                        <div class="label">Low Stock Items</div>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card text-white bg-info">
                    <div class="card-body stat-card">
                        <i class="fas fa-exchange-alt"></i>
                        <div class="value">${stats.monthlyTransactions}</div>
                        <div class="label">Monthly Transactions</div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="row">
            <!-- Low Stock Alert -->
            <div class="col-md-6">
                <div class="card">
                    <div class="card-header">
                        <h5 class="mb-0"><i class="fas fa-exclamation-circle"></i> Low Stock Alerts</h5>
                    </div>
                    <div class="card-body">
                        ${lowStockProducts.length === 0 ? 
                            '<div class="text-center text-success py-3"><i class="fas fa-check-circle fa-2x"></i><p class="mt-2">All products are well stocked!</p></div>' :
                            `
                            <div class="table-responsive">
                                <table class="table table-sm">
                                    <thead>
                                        <tr>
                                            <th>Product</th>
                                            <th>Current Stock</th>
                                            <th>Min Stock</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${lowStockProducts.map(product => {
                                            const status = storage.getStockStatus(product.stock, product.minStock);
                                            return `
                                                <tr>
                                                    <td>${product.name}</td>
                                                    <td><span class="badge bg-${status.class}">${product.stock}</span></td>
                                                    <td>${product.minStock}</td>
                                                    <td><span class="badge bg-${status.class}">${status.text}</span></td>
                                                </tr>
                                            `;
                                        }).join('')}
                                    </tbody>
                                </table>
                            </div>
                            `
                        }
                    </div>
                </div>
            </div>
            
            <!-- Recent Transactions -->
            <div class="col-md-6">
                <div class="card">
                    <div class="card-header">
                        <h5 class="mb-0"><i class="fas fa-history"></i> Recent Transactions</h5>
                    </div>
                    <div class="card-body">
                        ${recentTransactions.length === 0 ? 
                            '<div class="text-center text-muted py-3"><i class="fas fa-clock fa-2x"></i><p class="mt-2">No recent transactions</p></div>' :
                            `
                            <div class="table-responsive">
                                <table class="table table-sm">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Product</th>
                                            <th>Type</th>
                                            <th>Qty</th>
                                            <th>Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${recentTransactions.map(trans => `
                                            <tr>
                                                <td><small>${trans.id}</small></td>
                                                <td>${trans.productName}</td>
                                                <td>
                                                    <span class="badge ${trans.type === 'IN' ? 'bg-success' : 'bg-danger'}">
                                                        ${trans.type}
                                                    </span>
                                                </td>
                                                <td>${trans.quantity}</td>
                                                <td><small>${formatDate(trans.date)}</small></td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>
                            `
                        }
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Stock Chart -->
        <div class="row mt-4">
            <div class="col-md-12">
                <div class="card">
                    <div class="card-header">
                        <h5 class="mb-0"><i class="fas fa-chart-bar"></i> Stock Overview</h5>
                    </div>
                    <div class="card-body">
                        <div class="chart-container">
                            <canvas id="stockChart"></canvas>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add event listeners
    document.getElementById('backupBtn')?.addEventListener('click', () => storage.backupData());
    document.getElementById('restoreBtn')?.addEventListener('click', () => {
        document.getElementById('restoreInput')?.click();
    });
    
    // Create hidden file input for restore
    const restoreInput = document.createElement('input');
    restoreInput.type = 'file';
    restoreInput.id = 'restoreInput';
    restoreInput.accept = '.json';
    restoreInput.style.display = 'none';
    restoreInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            if (confirm('Restoring data will overwrite current inventory. Continue?')) {
                storage.restoreData(e.target.files[0])
                    .then(() => {
                        showAlert('Data restored successfully!', 'success');
                        loadDashboard();
                        productsManager.loadProductsTable();
                        transactionsManager.loadTransactionsTable();
                    })
                    .catch(err => {
                        showAlert('Error restoring data: ' + err.message, 'danger');
                    });
            }
        }
    });
    document.body.appendChild(restoreInput);
    
    // Render chart
    renderStockChart();
}

function renderStockChart() {
    const products = storage.getProducts();
    const ctx = document.getElementById('stockChart');
    
    if (!ctx || products.length === 0) return;
    
    const sortedProducts = [...products].sort((a, b) => b.stock - a.stock).slice(0, 10);
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sortedProducts.map(p => p.name.substring(0, 20) + (p.name.length > 20 ? '...' : '')),
            datasets: [{
                label: 'Current Stock',
                data: sortedProducts.map(p => p.stock),
                backgroundColor: sortedProducts.map(p => {
                    const status = storage.getStockStatus(p.stock, p.minStock);
                    switch(status.class) {
                        case 'danger': return 'rgba(231, 76, 60, 0.7)';
                        case 'warning': return 'rgba(243, 156, 18, 0.7)';
                        case 'success': return 'rgba(39, 174, 96, 0.7)';
                        default: return 'rgba(52, 152, 219, 0.7)';
                    }
                }),
                borderColor: sortedProducts.map(p => {
                    const status = storage.getStockStatus(p.stock, p.minStock);
                    switch(status.class) {
                        case 'danger': return 'rgba(231, 76, 60, 1)';
                        case 'warning': return 'rgba(243, 156, 18, 1)';
                        case 'success': return 'rgba(39, 174, 96, 1)';
                        default: return 'rgba(52, 152, 219, 1)';
                    }
                }),
                borderWidth: 1
            }, {
                label: 'Minimum Stock',
                data: sortedProducts.map(p => p.minStock),
                backgroundColor: 'rgba(149, 165, 166, 0.2)',
                borderColor: 'rgba(149, 165, 166, 1)',
                borderWidth: 1,
                type: 'line',
                fill: false,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Quantity'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Products'
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            label += context.parsed.y;
                            return label;
                        }
                    }
                }
            }
        }
    });
}

function renderSuppliersPage() {
    const suppliers = storage.getSuppliers();
    
    const content = document.getElementById('page-content');
    content.innerHTML = `
        <div class="row mb-4">
            <div class="col-md-8">
                <h2><i class="fas fa-truck"></i> Suppliers</h2>
                <p class="text-muted">Manage your supplier information and contacts.</p>
            </div>
            <div class="col-md-4 text-end">
                <button class="btn btn-primary" onclick="addSupplier()">
                    <i class="fas fa-plus"></i> Add Supplier
                </button>
            </div>
        </div>
        
        <div class="row">
            <div class="col-md-12">
                <div class="card">
                    <div class="card-body">
                        ${suppliers.length === 0 ? 
                            '<div class="text-center text-muted py-5"><i class="fas fa-truck fa-3x mb-3"></i><p>No suppliers added yet</p></div>' :
                            `
                            <div class="row">
                                ${suppliers.map(supplier => `
                                    <div class="col-md-3 mb-3">
                                        <div class="card h-100">
                                            <div class="card-body">
                                                <h5 class="card-title">${supplier.name}</h5>
                                                <p class="card-text">
                                                    <i class="fas fa-user"></i> ${supplier.contact}<br>
                                                    <i class="fas fa-envelope"></i> ${supplier.email}<br>
                                                    <i class="fas fa-phone"></i> ${supplier.phone}
                                                </p>
                                                <p class="card-text"><small class="text-muted">${supplier.address}</small></p>
                                            </div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                            `
                        }
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderReportsPage() {
    const content = document.getElementById('page-content');
    content.innerHTML = `
        <div class="row mb-4">
            <div class="col-md-8">
                <h2><i class="fas fa-chart-bar"></i> Reports & Analytics</h2>
                <p class="text-muted">Generate reports and view inventory analytics.</p>
            </div>
            <div class="col-md-4 text-end">
                <button class="btn btn-primary" onclick="generateReport()">
                    <i class="fas fa-file-pdf"></i> Generate Report
                </button>
            </div>
        </div>
        
        <div class="row">
            <div class="col-md-6">
                <div class="card">
                    <div class="card-header">
                        <h5 class="mb-0">Quick Reports</h5>
                    </div>
                    <div class="card-body">
                        <div class="list-group">
                            <button class="list-group-item list-group-item-action" onclick="exportLowStockReport()">
                                <i class="fas fa-exclamation-triangle text-warning"></i> Low Stock Report
                            </button>
                            <button class="list-group-item list-group-item-action" onclick="exportTransactionReport()">
                                <i class="fas fa-exchange-alt text-info"></i> Transaction History
                            </button>
                            <button class="list-group-item list-group-item-action" onclick="exportInventoryValuation()">
                                <i class="fas fa-dollar-sign text-success"></i> Inventory Valuation
                            </button>
                            <button class="list-group-item list-group-item-action" onclick="exportCategoryReport()">
                                <i class="fas fa-tags text-primary"></i> Category Breakdown
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="col-md-6">
                <div class="card">
                    <div class="card-header">
                        <h5 class="mb-0">Statistics</h5>
                    </div>
                    <div class="card-body">
                        <canvas id="categoryChart"></canvas>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="row mt-4">
            <div class="col-md-12">
                <div class="card">
                    <div class="card-header">
                        <h5 class="mb-0">Inventory Summary</h5>
                    </div>
                    <div class="card-body">
                        <div id="reportSummary">
                            Loading report...
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Generate reports
    generateReportSummary();
    renderCategoryChart();
}

function generateReportSummary() {
    const products = storage.getProducts();
    const transactions = storage.getTransactions();
    
    // Calculate category distribution
    const categories = {};
    products.forEach(product => {
        if (!categories[product.category]) {
            categories[product.category] = { count: 0, value: 0 };
        }
        categories[product.category].count++;
        categories[product.category].value += product.stock * product.price;
    });
    
    // Calculate recent activity
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const recentTransactions = transactions.filter(t => new Date(t.date) >= weekAgo);
    
    const summary = document.getElementById('reportSummary');
    if (summary) {
        summary.innerHTML = `
            <div class="row">
                <div class="col-md-6">
                    <h6>Category Distribution</h6>
                    <table class="table table-sm">
                        <thead>
                            <tr>
                                <th>Category</th>
                                <th class="text-end">Items</th>
                                <th class="text-end">Value</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${Object.entries(categories).map(([category, data]) => `
                                <tr>
                                    <td>${category}</td>
                                    <td class="text-end">${data.count}</td>
                                    <td class="text-end">${formatCurrency(data.value)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                <div class="col-md-6">
                    <h6>Recent Activity (Last 7 Days)</h6>
                    <table class="table table-sm">
                        <thead>
                            <tr>
                                <th>Type</th>
                                <th class="text-end">Count</th>
                                <th class="text-end">Total Qty</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Stock In</td>
                                <td class="text-end">${recentTransactions.filter(t => t.type === 'IN').length}</td>
                                <td class="text-end">${recentTransactions.filter(t => t.type === 'IN').reduce((sum, t) => sum + t.quantity, 0)}</td>
                            </tr>
                            <tr>
                                <td>Stock Out</td>
                                <td class="text-end">${recentTransactions.filter(t => t.type === 'OUT').length}</td>
                                <td class="text-end">${recentTransactions.filter(t => t.type === 'OUT').reduce((sum, t) => sum + t.quantity, 0)}</td>
                            </tr>
                        </tbody>
                    </table>
                    
                    <h6 class="mt-4">Top 5 Products by Value</h6>
                    <ol class="ps-3">
                        ${[...products]
                            .sort((a, b) => (b.stock * b.price) - (a.stock * a.price))
                            .slice(0, 5)
                            .map(p => `<li>${p.name} - ${formatCurrency(p.stock * p.price)}</li>`)
                            .join('')}
                    </ol>
                </div>
            </div>
        `;
    }
}

function renderCategoryChart() {
    const products = storage.getProducts();
    const categories = {};
    
    products.forEach(product => {
        if (!categories[product.category]) {
            categories[product.category] = 0;
        }
        categories[product.category]++;
    });
    
    const ctx = document.getElementById('categoryChart');
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(categories),
            datasets: [{
                data: Object.values(categories),
                backgroundColor: [
                    '#3498db', '#2ecc71', '#e74c3c', '#f39c12', 
                    '#9b59b6', '#1abc9c', '#34495e', '#7f8c8d'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

function exportLowStockReport() {
    const lowStock = storage.getLowStockProducts();
    if (lowStock.length === 0) {
        showAlert('No low stock items found', 'warning');
        return;
    }
    storage.exportToCSV(lowStock, 'low_stock_report.csv');
}

function exportTransactionReport() {
    const transactions = storage.getTransactions();
    if (transactions.length === 0) {
        showAlert('No transactions found', 'warning');
        return;
    }
    storage.exportToCSV(transactions, 'transaction_report.csv');
}

function exportInventoryValuation() {
    const products = storage.getProducts();
    const valuation = products.map(p => ({
        SKU: p.sku,
        Name: p.name,
        Category: p.category,
        Stock: p.stock,
        'Unit Price': p.price,
        'Total Value': p.stock * p.price,
        'Min Stock': p.minStock,
        Status: storage.getStockStatus(p.stock, p.minStock).text
    }));
    
    storage.exportToCSV(valuation, 'inventory_valuation.csv');
}

function exportCategoryReport() {
    const products = storage.getProducts();
    const categories = {};
    
    products.forEach(p => {
        if (!categories[p.category]) {
            categories[p.category] = {
                count: 0,
                totalValue: 0,
                items: []
            };
        }
        categories[p.category].count++;
        categories[p.category].totalValue += p.stock * p.price;
        categories[p.category].items.push(p.name);
    });
    
    const report = Object.entries(categories).map(([category, data]) => ({
        Category: category,
        'Item Count': data.count,
        'Total Value': data.totalValue,
        'Sample Items': data.items.slice(0, 3).join(', ')
    }));
    
    storage.exportToCSV(report, 'category_report.csv');
}

function generateReport() {
    // Create PDF report using browser print functionality
    const content = document.getElementById('page-content');
    const originalContent = content.innerHTML;
    
    const reportContent = `
        <div style="padding: 20px;">
            <h1>Inventory Management System Report</h1>
            <p>Generated on: ${new Date().toLocaleDateString()}</p>
            <hr>
            ${content.innerHTML}
        </div>
    `;
    
    content.innerHTML = reportContent;
    window.print();
    content.innerHTML = originalContent;
    
    showAlert('Report generated successfully!', 'success');
}

function addSupplier() {
    const name = prompt('Enter supplier name:');
    if (name) {
        const contact = prompt('Enter contact person:');
        const email = prompt('Enter email:');
        const phone = prompt('Enter phone:');
        const address = prompt('Enter address:');
        
        const suppliers = storage.getSuppliers();
        const newSupplier = {
            id: 'S' + String(suppliers.length + 1).padStart(3, '0'),
            name,
            contact,
            email,
            phone,
            address
        };
        
        suppliers.push(newSupplier);
        storage.saveSuppliers(suppliers);
        
        showAlert('Supplier added successfully!', 'success');
        renderSuppliersPage();
    }
}