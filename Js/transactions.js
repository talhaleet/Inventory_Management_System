// Transactions Management Module

class TransactionsManager {
    constructor() {
        this.initEventListeners();
    }

    initEventListeners() {
        // Transaction form save
        document.getElementById('saveTransaction')?.addEventListener('click', () => this.saveTransaction());
        
        // Form validation
        document.getElementById('transactionForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveTransaction();
        });
        
        // Transaction type change
        document.getElementById('transactionType')?.addEventListener('change', (e) => {
            this.updateTransactionForm();
        });
    }

    loadTransactionsTable() {
        const transactions = storage.getTransactions();
        const tableBody = document.querySelector('#transactionsTable tbody');
        
        if (!tableBody) return;
        
        tableBody.innerHTML = '';
        
        transactions.forEach(transaction => {
            const row = document.createElement('tr');
            const typeBadge = transaction.type === 'IN' ? 
                '<span class="badge bg-success">Stock In</span>' : 
                '<span class="badge bg-danger">Stock Out</span>';
            
            row.innerHTML = `
                <td><strong>${transaction.id}</strong></td>
                <td>${transaction.productName}</td>
                <td class="text-center">${typeBadge}</td>
                <td class="text-center">
                    <span class="badge ${transaction.type === 'IN' ? 'bg-success' : 'bg-danger'}">
                        ${transaction.type === 'IN' ? '+' : '-'}${transaction.quantity}
                    </span>
                </td>
                <td>${formatDate(transaction.date)}</td>
                <td>${transaction.notes || 'N/A'}</td>
                <td>${transaction.user}</td>
            `;
            
            tableBody.appendChild(row);
        });
        
        // Initialize DataTable
        $('#transactionsTable').DataTable({
            pageLength: 10,
            order: [[0, 'desc']],
            responsive: true
        });
    }

    populateProductsDropdown(selectedProductId = '') {
        const dropdown = document.getElementById('transactionProduct');
        dropdown.innerHTML = '<option value="">Select Product</option>';
        
        const products = storage.getProducts();
        products.forEach(product => {
            const option = document.createElement('option');
            option.value = product.id;
            option.textContent = `${product.name} (${product.sku}) - Stock: ${product.stock}`;
            if (product.id === selectedProductId) {
                option.selected = true;
            }
            dropdown.appendChild(option);
        });
    }

    updateTransactionForm() {
        const type = document.getElementById('transactionType').value;
        const productId = document.getElementById('transactionProduct').value;
        
        if (type && productId) {
            const product = storage.getProductById(productId);
            if (product) {
                const maxQty = type === 'OUT' ? product.stock : null;
                const qtyInput = document.getElementById('transactionQty');
                
                if (type === 'OUT' && maxQty > 0) {
                    qtyInput.max = maxQty;
                    qtyInput.placeholder = `Max: ${maxQty}`;
                } else {
                    qtyInput.removeAttribute('max');
                    qtyInput.placeholder = '';
                }
            }
        }
    }

    saveTransaction() {
        // Validate form
        const form = document.getElementById('transactionForm');
        if (!form.checkValidity()) {
            form.classList.add('was-validated');
            return;
        }
        
        const transactionData = {
            productId: document.getElementById('transactionProduct').value,
            productName: storage.getProductById(document.getElementById('transactionProduct').value)?.name || '',
            type: document.getElementById('transactionType').value,
            quantity: parseInt(document.getElementById('transactionQty').value),
            notes: document.getElementById('transactionNotes').value
        };
        
        // Check if stock out exceeds available stock
        if (transactionData.type === 'OUT') {
            const product = storage.getProductById(transactionData.productId);
            if (product && transactionData.quantity > product.stock) {
                showAlert(`Cannot process stock out: Only ${product.stock} units available`, 'danger');
                return;
            }
        }
        
        // Add transaction
        storage.addTransaction(transactionData);
        
        // Update product stock
        storage.updateProductStock(
            transactionData.productId, 
            transactionData.quantity, 
            transactionData.type
        );
        
        // Show success message
        showAlert(`Transaction ${transactionData.id} recorded successfully!`, 'success');
        
        // Close modal
        bootstrap.Modal.getInstance(document.getElementById('transactionModal')).hide();
        
        // Reset form
        form.reset();
        form.classList.remove('was-validated');
        
        // Refresh data
        this.loadTransactionsTable();
        productsManager.loadProductsTable();
        loadDashboard();
    }

    renderTransactionsPage() {
        const content = document.getElementById('page-content');
        content.innerHTML = `
            <div class="row mb-4">
                <div class="col-md-8">
                    <h2><i class="fas fa-exchange-alt"></i> Stock Transactions</h2>
                    <p class="text-muted">Track all stock movements and inventory changes.</p>
                </div>
                <div class="col-md-4 text-end">
                    <button class="btn btn-primary" id="addTransactionBtn">
                        <i class="fas fa-plus"></i> New Transaction
                    </button>
                    <button class="btn btn-outline-secondary" id="exportTransactionsBtn">
                        <i class="fas fa-download"></i> Export
                    </button>
                </div>
            </div>
            
            <div class="row">
                <div class="col-md-12">
                    <div class="card">
                        <div class="card-body">
                            <div class="table-responsive">
                                <table class="table table-hover" id="transactionsTable">
                                    <thead>
                                        <tr>
                                            <th>Transaction ID</th>
                                            <th>Product</th>
                                            <th class="text-center">Type</th>
                                            <th class="text-center">Quantity</th>
                                            <th>Date</th>
                                            <th>Notes</th>
                                            <th>User</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <!-- Transactions will be loaded here -->
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add event listeners
        document.getElementById('addTransactionBtn')?.addEventListener('click', () => this.openAddTransactionModal());
        document.getElementById('exportTransactionsBtn')?.addEventListener('click', () => this.exportTransactions());
        
        // Load transactions table
        this.loadTransactionsTable();
    }

    openAddTransactionModal() {
        // Reset form
        document.getElementById('transactionForm').reset();
        document.getElementById('transactionForm').classList.remove('was-validated');
        document.getElementById('transactionProduct').disabled = false;
        
        // Populate dropdowns
        this.populateProductsDropdown();
        
        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('transactionModal'));
        modal.show();
    }

    exportTransactions() {
        const transactions = storage.getTransactions();
        if (transactions.length === 0) {
            showAlert('No transactions to export', 'warning');
            return;
        }
        
        storage.exportToCSV(transactions, `transactions_export_${new Date().toISOString().split('T')[0]}.csv`);
        showAlert('Transactions exported successfully!', 'success');
    }
}

// Initialize transactions manager
const transactionsManager = new TransactionsManager();