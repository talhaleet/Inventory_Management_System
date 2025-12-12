// Utility Functions for Inventory Management System

class StorageManager {
    constructor() {
        this.productsKey = 'inventory_products';
        this.transactionsKey = 'inventory_transactions';
        this.suppliersKey = 'inventory_suppliers';
        this.initData();
    }

    initData() {
        // Initialize with sample data if empty
        if (!this.getProducts().length) {
            this.saveProducts(this.getSampleProducts());
        }
        
        if (!this.getTransactions().length) {
            this.saveTransactions(this.getSampleTransactions());
        }
        
        if (!this.getSuppliers().length) {
            this.saveSuppliers(this.getSampleSuppliers());
        }
    }

    getSampleProducts() {
        return [
            {
                id: 'P001',
                name: 'Laptop Pro 15',
                sku: 'LP-001',
                category: 'Electronics',
                stock: 25,
                minStock: 10,
                price: 1299.99,
                supplier: 'TechSupply Inc',
                description: 'High-performance business laptop',
                lastUpdated: '2024-01-15'
            },
            {
                id: 'P002',
                name: 'Wireless Mouse',
                sku: 'WM-002',
                category: 'Electronics',
                stock: 150,
                minStock: 50,
                price: 29.99,
                supplier: 'Peripherals Co',
                description: 'Ergonomic wireless mouse',
                lastUpdated: '2024-01-14'
            },
            {
                id: 'P003',
                name: 'Office Chair',
                sku: 'OC-003',
                category: 'Furniture',
                stock: 12,
                minStock: 5,
                price: 249.99,
                supplier: 'Furniture World',
                description: 'Ergonomic office chair',
                lastUpdated: '2024-01-13'
            },
            {
                id: 'P004',
                name: 'Notebook Set',
                sku: 'NS-004',
                category: 'Stationery',
                stock: 8,
                minStock: 20,
                price: 12.99,
                supplier: 'Paper Products Ltd',
                description: 'Set of 5 premium notebooks',
                lastUpdated: '2024-01-12'
            },
            {
                id: 'P005',
                name: 'Coffee Maker',
                sku: 'CM-005',
                category: 'Appliances',
                stock: 30,
                minStock: 15,
                price: 89.99,
                supplier: 'Home Appliances Inc',
                description: 'Automatic drip coffee maker',
                lastUpdated: '2024-01-11'
            }
        ];
    }

    getSampleTransactions() {
        return [
            {
                id: 'T001',
                productId: 'P001',
                productName: 'Laptop Pro 15',
                type: 'IN',
                quantity: 10,
                date: '2024-01-10',
                notes: 'Initial stock',
                user: 'Admin'
            },
            {
                id: 'T002',
                productId: 'P002',
                productName: 'Wireless Mouse',
                type: 'IN',
                quantity: 100,
                date: '2024-01-10',
                notes: 'Bulk order',
                user: 'Admin'
            },
            {
                id: 'T003',
                productId: 'P001',
                productName: 'Laptop Pro 15',
                type: 'OUT',
                quantity: 5,
                date: '2024-01-12',
                notes: 'Customer order #12345',
                user: 'Sales'
            },
            {
                id: 'T004',
                productId: 'P004',
                productName: 'Notebook Set',
                type: 'OUT',
                quantity: 12,
                date: '2024-01-13',
                notes: 'School supply order',
                user: 'Sales'
            }
        ];
    }

    getSampleSuppliers() {
        return [
            {
                id: 'S001',
                name: 'TechSupply Inc',
                contact: 'John Smith',
                email: 'john@techsupply.com',
                phone: '+1-555-1234',
                address: '123 Tech Street, Silicon Valley'
            },
            {
                id: 'S001',
                name: 'Peripherals Co',
                contact: 'Sarah Johnson',
                email: 'sarah@peripherals.co',
                phone: '+1-555-5678',
                address: '456 Gadget Ave, Tech City'
            },
            {
                id: 'S003',
                name: 'Furniture World',
                contact: 'Mike Wilson',
                email: 'mike@furnitureworld.com',
                phone: '+1-555-9012',
                address: '789 Design Blvd, Metro City'
            },
            {
                id: 'S004',
                name: 'Paper Products Ltd',
                contact: 'Lisa Brown',
                email: 'lisa@paperproducts.com',
                phone: '+1-555-3456',
                address: '321 Stationery Rd, Business Park'
            }
        ];
    }

    // Products CRUD
    getProducts() {
        return JSON.parse(localStorage.getItem(this.productsKey) || '[]');
    }

    saveProducts(products) {
        localStorage.setItem(this.productsKey, JSON.stringify(products));
        this.updateSyncTime();
    }

    addProduct(product) {
        const products = this.getProducts();
        product.id = 'P' + String(products.length + 1).padStart(3, '0');
        product.lastUpdated = new Date().toISOString().split('T')[0];
        products.push(product);
        this.saveProducts(products);
        return product;
    }

    updateProduct(id, updatedProduct) {
        const products = this.getProducts();
        const index = products.findIndex(p => p.id === id);
        if (index !== -1) {
            updatedProduct.lastUpdated = new Date().toISOString().split('T')[0];
            products[index] = { ...products[index], ...updatedProduct };
            this.saveProducts(products);
            return true;
        }
        return false;
    }

    deleteProduct(id) {
        const products = this.getProducts().filter(p => p.id !== id);
        this.saveProducts(products);
    }

    // Transactions CRUD
    getTransactions() {
        return JSON.parse(localStorage.getItem(this.transactionsKey) || '[]');
    }

    saveTransactions(transactions) {
        localStorage.setItem(this.transactionsKey, JSON.stringify(transactions));
        this.updateSyncTime();
    }

    addTransaction(transaction) {
        const transactions = this.getTransactions();
        transaction.id = 'T' + String(transactions.length + 1).padStart(3, '0');
        transaction.date = new Date().toISOString().split('T')[0];
        transaction.user = 'Current User';
        transactions.unshift(transaction); // Add to beginning
        this.saveTransactions(transactions);
        return transaction;
    }

    // Suppliers CRUD
    getSuppliers() {
        return JSON.parse(localStorage.getItem(this.suppliersKey) || '[]');
    }

    saveSuppliers(suppliers) {
        localStorage.setItem(this.suppliersKey, JSON.stringify(suppliers));
    }

    // Helper methods
    getProductById(id) {
        return this.getProducts().find(p => p.id === id);
    }

    updateProductStock(productId, quantityChange, type) {
        const product = this.getProductById(productId);
        if (product) {
            if (type === 'IN') {
                product.stock += quantityChange;
            } else if (type === 'OUT') {
                product.stock -= quantityChange;
            }
            this.updateProduct(productId, product);
        }
    }

    getLowStockProducts() {
        return this.getProducts().filter(p => p.stock <= p.minStock);
    }

    getStockStatus(stock, minStock) {
        if (stock === 0) return { class: 'danger', text: 'Out of Stock' };
        if (stock <= minStock) return { class: 'warning', text: 'Low Stock' };
        if (stock <= minStock * 2) return { class: 'info', text: 'Medium Stock' };
        return { class: 'success', text: 'In Stock' };
    }

    getInventoryStats() {
        const products = this.getProducts();
        const transactions = this.getTransactions();
        
        const totalValue = products.reduce((sum, p) => sum + (p.stock * p.price), 0);
        const lowStockCount = products.filter(p => p.stock <= p.minStock).length;
        const outOfStockCount = products.filter(p => p.stock === 0).length;
        
        const monthlyTransactions = transactions.filter(t => {
            const transDate = new Date(t.date);
            const monthAgo = new Date();
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            return transDate >= monthAgo;
        }).length;

        return {
            totalProducts: products.length,
            totalValue: totalValue.toFixed(2),
            lowStockCount,
            outOfStockCount,
            monthlyTransactions
        };
    }

    updateSyncTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const syncElement = document.getElementById('last-sync');
        if (syncElement) {
            syncElement.innerHTML = `<i class="fas fa-sync"></i> Last saved: ${timeString}`;
        }
    }

    exportToCSV(data, filename) {
        if (!data.length) return;
        
        const headers = Object.keys(data[0]);
        const csvRows = [
            headers.join(','),
            ...data.map(row => 
                headers.map(header => {
                    const value = row[header];
                    return `"${value}"`;
                }).join(',')
            )
        ];
        
        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
    }

    backupData() {
        const backup = {
            products: this.getProducts(),
            transactions: this.getTransactions(),
            suppliers: this.getSuppliers(),
            backupDate: new Date().toISOString()
        };
        
        const dataStr = JSON.stringify(backup, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        const exportFileDefaultName = `inventory_backup_${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    }

    restoreData(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const backup = JSON.parse(e.target.result);
                    
                    if (backup.products) {
                        localStorage.setItem(this.productsKey, JSON.stringify(backup.products));
                    }
                    if (backup.transactions) {
                        localStorage.setItem(this.transactionsKey, JSON.stringify(backup.transactions));
                    }
                    if (backup.suppliers) {
                        localStorage.setItem(this.suppliersKey, JSON.stringify(backup.suppliers));
                    }
                    
                    this.updateSyncTime();
                    resolve(true);
                } catch (error) {
                    reject(error);
                }
            };
            reader.readAsText(file);
        });
    }
}

// Initialize storage manager
const storage = new StorageManager();

// Utility functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function showAlert(message, type = 'info', duration = 3000) {
    // Remove existing alerts
    const existingAlert = document.querySelector('.custom-alert');
    if (existingAlert) existingAlert.remove();

    // Create alert
    const alert = document.createElement('div');
    alert.className = `custom-alert alert alert-${type} alert-dismissible fade show`;
    alert.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        min-width: 300px;
        animation: slideIn 0.3s ease;
    `;
    
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(alert);
    
    // Auto dismiss
    if (duration > 0) {
        setTimeout(() => {
            if (alert.parentNode) {
                alert.remove();
            }
        }, duration);
    }
    
    return alert;
}

// Add CSS for alert animation
if (!document.querySelector('#alert-styles')) {
    const style = document.createElement('style');
    style.id = 'alert-styles';
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        .custom-alert {
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
    `;
    document.head.appendChild(style);
}