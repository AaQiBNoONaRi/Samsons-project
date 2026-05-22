// Enhanced Filter Functionality
        document.addEventListener("DOMContentLoaded", () => {
            // Filter buttons
            document.querySelectorAll('.filter-btn').forEach(btn => {
                btn.addEventListener('click', function () {
                    // Remove active class from all buttons
                    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                    // Add active class to clicked button
                    this.classList.add('active');

                    const status = this.dataset.status;
                    const rows = document.querySelectorAll('#orders-body tr');

                    rows.forEach(row => {
                        if (status === 'all' || row.dataset.status === status) {
                            row.style.display = '';
                            row.style.animation = 'fadeIn 0.3s ease';
                        } else {
                            row.style.display = 'none';
                        }
                    });
                });
            });

            // Enhanced Search Functionality
            const searchInput = document.getElementById('search-input');
            searchInput.addEventListener('input', function () {
                const searchTerm = this.value.toLowerCase();
                const rows = document.querySelectorAll('#orders-body tr');

                rows.forEach(row => {
                    const text = row.textContent.toLowerCase();
                    if (text.includes(searchTerm)) {
                        row.style.display = '';
                        row.style.animation = 'fadeIn 0.3s ease';
                    } else {
                        row.style.display = 'none';
                    }
                });
            });

            // Enhanced Status Change
            document.querySelectorAll("select[name='status']").forEach(select => {
                select.addEventListener("change", async function () {
                    const orderId = this.dataset.orderId;
                    const newStatus = this.value;
                    const row = this.closest('tr');

                    // Show loading state
                    this.style.opacity = '0.6';
                    this.disabled = true;

                    const confirmed = confirm(`Are you sure you want to change the status to "${newStatus}"?`);
                    if (!confirmed) {
                        this.style.opacity = '1';
                        this.disabled = false;
                        window.location.reload();
                        return;
                    }

                    try {
                        const response = await fetch(`/viaadmin/update-status/${orderId}`, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({ status: newStatus }),
                        });

                        const result = await response.json();
                        if (result.success) {
                            // Update visual status
                            this.className = `status-badge status-${newStatus.toLowerCase()}`;
                            row.dataset.status = newStatus.toLowerCase();

                            // Show success animation
                            row.style.background = '#d4edda';
                            setTimeout(() => {
                                row.style.background = '';
                            }, 1000);

                            // Show toast notification
                            showToast("Status updated successfully!", 'success');
                        } else {
                            showToast("Failed to update status.", 'error');
                        }
                    } catch (error) {
                        showToast("Error updating status.", 'error');
                    }

                    this.style.opacity = '1';
                    this.disabled = false;
                });
            });

            // Enhanced Delete Functionality
            document.querySelectorAll(".btn-delete").forEach(button => {
                button.addEventListener("click", function (e) {
                    e.preventDefault();
                    const url = this.getAttribute("href");
                    const row = this.closest('tr');

                    const confirmed = confirm("Are you sure you want to delete this order? This action cannot be undone.");
                    if (confirmed) {
                        // Show loading state
                        this.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
                        this.style.opacity = '0.6';

                        fetch(url, { method: "POST" })
                            .then(res => res.json())
                            .then(data => {
                                if (data.success) {
                                    // Animate row removal
                                    row.style.animation = 'fadeOut 0.5s ease';
                                    setTimeout(() => {
                                        row.remove();
                                    }, 500);
                                    showToast("Order deleted successfully.", 'success');
                                } else {
                                    showToast("Failed to delete order.", 'error');
                                    this.innerHTML = '<i class="fas fa-trash"></i>';
                                    this.style.opacity = '1';
                                }
                            })
                            .catch(error => {
                                showToast("Error deleting order.", 'error');
                                this.innerHTML = '<i class="fas fa-trash"></i>';
                                this.style.opacity = '1';
                            });
                    }
                });
            });

            // View Details Functionality
            document.querySelectorAll('.btn-view').forEach(button => {
                button.addEventListener('click', function () {
                    const row = this.closest('tr');
                    showOrderDetails(row);
                });
            });
        });

        // Toast Notification Function
        function showToast(message, type = 'info') {
            const toast = document.createElement('div');
            toast.className = `toast toast-${type}`;
            toast.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
            toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            box-shadow: 0 4px 20px rgba(0,0,0,0.2);
            animation: slideIn 0.3s ease;
            background: ${type === 'success' ? 'var(--success)' : type === 'error' ? 'var(--danger)' : 'var(--info)'};
        `;

            document.body.appendChild(toast);
            setTimeout(() => {
                toast.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        }

        // Order Details Modal Function
        function showOrderDetails(row) {
            const cells = row.querySelectorAll('td');
            const orderData = {
                id: cells[0].textContent.trim(),
                orderId: cells[1].textContent.trim(),
                customer: cells[2].textContent.trim(),
                address: cells[3].textContent.trim(),
                contact: cells[4].textContent.trim(),
                product: cells[5].textContent.trim(),
                volume: cells[6].textContent.trim(),
                date: cells[7].textContent.trim(),
                quantity: cells[8].textContent.trim(),
                category: cells[9].textContent.trim(),
                city: cells[10].textContent.trim(),
                status: cells[11].querySelector('select').value
            };

            // Remove any existing modal
            const existingModal = document.getElementById('order-details-modal');
            if (existingModal) {
                existingModal.remove();
            }

            // Create modal elements
            const modal = document.createElement('div');
            modal.id = 'order-details-modal';
            modal.className = 'custom-modal-overlay';
            
            // Get badge color based on status
            const statusClass = `status-${orderData.status.toLowerCase()}`;

            modal.innerHTML = `
                <div class="custom-modal-content">
                    <div class="custom-modal-header">
                        <h2><i class="fas fa-receipt"></i> Order Details: ${orderData.orderId}</h2>
                        <button class="custom-modal-close" id="modal-close-btn">&times;</button>
                    </div>
                    <div class="custom-modal-body">
                        <div class="details-grid">
                            <div class="details-section">
                                <h3><i class="fas fa-user"></i> Customer Information</h3>
                                <div class="detail-item">
                                    <span class="detail-label">Name</span>
                                    <span class="detail-value">${orderData.customer}</span>
                                </div>
                                <div class="detail-item">
                                    <span class="detail-label">Contact</span>
                                    <span class="detail-value">${orderData.contact}</span>
                                </div>
                                <div class="detail-item">
                                    <span class="detail-label">City</span>
                                    <span class="detail-value">${orderData.city}</span>
                                </div>
                                <div class="detail-item">
                                    <span class="detail-label">Address</span>
                                    <span class="detail-value">${orderData.address}</span>
                                </div>
                            </div>
                            <div class="details-section">
                                <h3><i class="fas fa-box-open"></i> Product Details</h3>
                                <div class="detail-item">
                                    <span class="detail-label">Product Name</span>
                                    <span class="detail-value">${orderData.product}</span>
                                </div>
                                <div class="detail-item">
                                    <span class="detail-label">Volume</span>
                                    <span class="detail-value"><span class="badge-light">${orderData.volume}</span></span>
                                </div>
                                <div class="detail-item">
                                    <span class="detail-label">Quantity</span>
                                    <span class="detail-value"><span class="badge-info">${orderData.quantity}</span></span>
                                </div>
                                <div class="detail-item">
                                    <span class="detail-label">Category</span>
                                    <span class="detail-value"><span class="badge-light">${orderData.category}</span></span>
                                </div>
                            </div>
                        </div>
                        <div class="meta-section">
                            <div class="detail-item" style="width: auto;">
                                <span class="detail-label" style="margin-right: 10px;">Order Date:</span>
                                <span class="detail-value" style="color: #64748b;">${orderData.date}</span>
                            </div>
                            <div class="detail-item" style="width: auto;">
                                <span class="detail-label" style="margin-right: 10px;">Status:</span>
                                <span class="detail-value">
                                    <span class="status-badge ${statusClass}" style="display:inline-block; pointer-events:none; font-size: 0.65rem; padding: 0.3rem 0.8rem; border-radius: 20px;">${orderData.status}</span>
                                </span>
                            </div>
                        </div>
                    </div>
                    <div class="custom-modal-footer">
                        <button class="custom-modal-btn btn-primary" id="modal-ok-btn">OK</button>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);
            
            // Add active class for fade-in/scale animations
            setTimeout(() => {
                modal.classList.add('active');
            }, 10);

            // Close functionality
            const closeBtn = modal.querySelector('#modal-close-btn');
            const okBtn = modal.querySelector('#modal-ok-btn');
            
            function closeModal() {
                modal.classList.remove('active');
                setTimeout(() => {
                    modal.remove();
                }, 300);
            }

            closeBtn.addEventListener('click', closeModal);
            okBtn.addEventListener('click', closeModal);
            modal.addEventListener('click', function(e) {
                if (e.target === modal) {
                    closeModal();
                }
            });
        }

        // Add CSS animations and modal styles
        const style = document.createElement('style');
        style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeOut {
            from { opacity: 1; transform: scale(1); }
            to { opacity: 0; transform: scale(0.95); }
        }
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        
        /* Premium Custom Modal Styles */
        .custom-modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(15, 23, 42, 0.4);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        
        .custom-modal-overlay.active {
            opacity: 1;
        }

        .custom-modal-content {
            background: rgba(255, 255, 255, 0.95);
            border-radius: 16px;
            width: 90%;
            max-width: 650px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
            border: 1px solid rgba(255, 255, 255, 0.25);
            overflow: hidden;
            transform: scale(0.9) translateY(20px);
            transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
            font-family: 'Poppins', sans-serif;
        }

        .custom-modal-overlay.active .custom-modal-content {
            transform: scale(1) translateY(0);
        }

        .custom-modal-header {
            padding: 1.25rem 1.5rem;
            background: linear-gradient(135deg, #1b2992 0%, #2c3e50 100%);
            color: white;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        .custom-modal-header h2 {
            margin: 0;
            font-size: 1.15rem;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 10px;
            color: white !important;
        }

        .custom-modal-close {
            background: transparent;
            border: none;
            color: rgba(255, 255, 255, 0.8);
            font-size: 1.75rem;
            cursor: pointer;
            line-height: 1;
            transition: color 0.2s;
            padding: 0;
        }

        .custom-modal-close:hover {
            color: white;
        }

        .custom-modal-body {
            padding: 1.5rem;
        }

        .details-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1.5rem;
            margin-bottom: 1.5rem;
        }

        @media (max-width: 576px) {
            .details-grid {
                grid-template-columns: 1fr;
                gap: 1rem;
            }
        }

        .details-section {
            background: #f8fafc;
            border-radius: 12px;
            padding: 1.2rem;
            border: 1px solid #e2e8f0;
        }

        .details-section h3 {
            margin-top: 0;
            margin-bottom: 0.85rem;
            font-size: 0.9rem;
            font-weight: 600;
            color: #1e293b;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 0.4rem;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .detail-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.5rem 0;
            font-size: 0.8rem;
            border-bottom: 1px dashed #f1f5f9;
        }

        .detail-item:last-child {
            border-bottom: none;
        }

        .detail-label {
            color: #64748b;
            font-weight: 500;
        }

        .detail-value {
            color: #334155;
            font-weight: 600;
            text-align: right;
            max-width: 60%;
            word-break: break-all;
        }

        .badge-light {
            background: #e2e8f0;
            color: #475569;
            padding: 0.2rem 0.5rem;
            border-radius: 4px;
            font-size: 0.7rem;
            font-weight: 500;
        }

        .badge-info {
            background: #0ea5e9;
            color: white;
            padding: 0.2rem 0.5rem;
            border-radius: 12px;
            font-size: 0.7rem;
            font-weight: 600;
        }

        .meta-section {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: #f1f5f9;
            border-radius: 12px;
            padding: 0.85rem 1.25rem;
            border: 1px solid #e2e8f0;
        }

        .custom-modal-footer {
            padding: 1rem 1.5rem;
            border-top: 1px solid #e2e8f0;
            display: flex;
            justify-content: flex-end;
            background: #f8fafc;
        }

        .custom-modal-btn {
            padding: 0.5rem 1.5rem;
            border-radius: 8px;
            font-weight: 600;
            font-size: 0.85rem;
            cursor: pointer;
            transition: all 0.2s;
            border: none;
        }

        .custom-modal-btn.btn-primary {
            background: #1b2992;
            color: white;
        }

        .custom-modal-btn.btn-primary:hover {
            background: #2c3e50;
        }
    `;
        document.head.appendChild(style);

    // <!-- Enhanced Pagination Script -->
   
        window.addEventListener('resize', function () {
            if (window.innerWidth < 768) {
                document.body.classList.add('mobile-view');
            } else {
                document.body.classList.remove('mobile-view');
            }
        });

        // Initialize on load
        document.addEventListener('DOMContentLoaded', function () {
            if (window.innerWidth < 768) {
                document.body.classList.add('mobile-view');
            }
        });