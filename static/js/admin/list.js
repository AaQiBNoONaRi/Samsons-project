// Attach Add Perfume button to open Add Bottle modal
        document.addEventListener('DOMContentLoaded', function () {
            var addPerfumeBtn = document.getElementById('openAddBottleModal');
            if (addPerfumeBtn) {
                addPerfumeBtn.addEventListener('click', function (e) {
                    e.preventDefault();
                    if (window.openAddBottleModal) window.openAddBottleModal();
                });
            }
        });
        // Add Bottle Modal Logic
        document.addEventListener('DOMContentLoaded', function () {
            const addBottleModal = document.getElementById('addBottleModal');
            const closeBottleBtn = addBottleModal ? addBottleModal.querySelector('.add-bottle-close') : null;
            
            window.openAddBottleModal = function () {
                if (addBottleModal) addBottleModal.style.display = 'flex';
            };
            
            if (closeBottleBtn) {
                closeBottleBtn.addEventListener('click', function () {
                    if (addBottleModal) addBottleModal.style.display = 'none';
                    const form = document.getElementById('addBottleForm');
                    if (form) form.reset();
                });
            }
            
            if (addBottleModal) {
                addBottleModal.addEventListener('click', function (e) {
                    if (e.target === addBottleModal) {
                        addBottleModal.style.display = 'none';
                        const form = document.getElementById('addBottleForm');
                        if (form) form.reset();
                    }
                });
            }
        });

        // Add List Modal Logic
        document.addEventListener('DOMContentLoaded', function () {
            const addListModal = document.getElementById('addListModal');
            const openAddListBtn = document.getElementById('openAddListModal');
            const closeListBtn = addListModal ? addListModal.querySelector('.add-list-close') : null;
            
            if (openAddListBtn) {
                openAddListBtn.addEventListener('click', function (e) {
                    e.preventDefault();
                    if (addListModal) addListModal.style.display = 'flex';
                    const nameInput = document.getElementById('listName');
                    if (nameInput) nameInput.focus();
                });
            }
            
            if (closeListBtn) {
                closeListBtn.addEventListener('click', function () {
                    if (addListModal) addListModal.style.display = 'none';
                    const form = document.getElementById('addListForm');
                    if (form) form.reset();
                });
            }
            
            if (addListModal) {
                addListModal.addEventListener('click', function (e) {
                    if (e.target === addListModal) {
                        addListModal.style.display = 'none';
                        const form = document.getElementById('addListForm');
                        if (form) form.reset();
                    }
                });
            }
        });

        // Bottle Preview Modal Logic
        document.addEventListener('DOMContentLoaded', function () {
            const modal = document.getElementById('bottlePreviewModal');
            const modalImg = document.getElementById('bottlePreviewImg');
            const closeBtn = modal ? modal.querySelector('.bottle-preview-close') : null;
            
            document.querySelectorAll('.bottle-item .preview-btn').forEach(function (btn) {
                btn.addEventListener('click', function (e) {
                    e.preventDefault();
                    const img = btn.closest('.bottle-item').querySelector('img');
                    if (modalImg && img) modalImg.src = img.src;
                    if (modal) modal.style.display = 'flex';
                });
            });
            
            if (closeBtn) {
                closeBtn.addEventListener('click', function () {
                    if (modal) modal.style.display = 'none';
                    if (modalImg) modalImg.src = '';
                });
            }
            
            if (modal) {
                modal.addEventListener('click', function (e) {
                    if (e.target === modal) {
                        modal.style.display = 'none';
                        if (modalImg) modalImg.src = '';
                    }
                });
            }
        });
        // Bottle active/inactive label toggle (robust version)
        document.addEventListener('DOMContentLoaded', function () {
            document.querySelectorAll('.bottle-item').forEach(function (item) {
                const checkbox = item.querySelector('input[type="checkbox"]');
                const label = item.querySelector('label');
                const updateLabel = function () {
                    if (checkbox.checked) {
                        label.lastChild.textContent = ' Active';
                        label.style.color = '#28a745';
                        label.style.fontWeight = '600';
                    } else {
                        label.lastChild.textContent = ' Inactive';
                        label.style.color = '#555';
                        label.style.fontWeight = '500';
                    }
                };
                // Add a text node after the checkbox if not present
                if (!label.lastChild || label.lastChild.nodeType !== 3) {
                    label.appendChild(document.createTextNode(checkbox.checked ? ' Active' : ' Inactive'));
                }
                updateLabel();
                checkbox.addEventListener('change', updateLabel);
            });
        });
        function toggleDropdown() {
            var dropdown = document.getElementById('customDropdown');
            if (dropdown.style.display === 'none' || dropdown.style.display === '') {
                dropdown.style.display = 'flex';
            } else {
                dropdown.style.display = 'none';
            }
        }

        // Select/deselect all checkboxes for custom perfume table
        document.addEventListener('DOMContentLoaded', function () {
            var selectAll = document.getElementById('select-all-custom');
            if (selectAll) {
                selectAll.addEventListener('click', function () {
                    document.querySelectorAll('.custom-checkbox').forEach(cb => cb.checked = this.checked);
                });
            }
        });
        // Sidebar mobile toggle (hamburger in header and sidebar)
        document.addEventListener('DOMContentLoaded', function () {
            const hamburgerMenuOpen = document.getElementById('hamburgerMenuOpen');
            const hamburgerMenuClose = document.getElementById('hamburgerMenuClose');
            const sidebar = document.getElementById('sidebar');
            const overlay = document.getElementById('hamburgerMenuSidebar');
            const mainContent = document.getElementById('mainContent');

            function openSidebar() {
                if (hamburgerMenuOpen) hamburgerMenuOpen.classList.add('active');
                if (sidebar) sidebar.classList.add('mobile-open');
                if (overlay) overlay.style.display = 'block';
                document.body.classList.add('mobile-sidebar-open');
                if (mainContent) mainContent.classList.add('hide-on-sidebar');
            }
            function closeSidebar() {
                if (hamburgerMenuOpen) hamburgerMenuOpen.classList.remove('active');
                if (sidebar) sidebar.classList.remove('mobile-open');
                if (overlay) overlay.style.display = 'none';
                document.body.classList.remove('mobile-sidebar-open');
                if (mainContent) mainContent.classList.remove('hide-on-sidebar');
            }

            if (hamburgerMenuOpen) {
                hamburgerMenuOpen.addEventListener('click', function (e) {
                    e.stopPropagation();
                    openSidebar();
                });
            }
            if (hamburgerMenuClose) {
                hamburgerMenuClose.addEventListener('click', function (e) {
                    e.stopPropagation();
                    closeSidebar();
                });
            }
            if (overlay) {
                overlay.addEventListener('click', function () {
                    closeSidebar();
                });
            }
            if (sidebar) {
                // Close sidebar when clicking a menu item (on mobile)
                const menuItems = sidebar.querySelectorAll('.menu-item');
                menuItems.forEach(function (item) {
                    item.addEventListener('click', function () {
                        if (window.innerWidth <= 768) {
                            closeSidebar();
                        }
                    });
                });
            }
            // Hide sidebar on resize to desktop
            window.addEventListener('resize', function () {
                if (window.innerWidth > 768) {
                    closeSidebar();
                }
            });
        });
        document.addEventListener('DOMContentLoaded', function () {
            // Search filter
            const searchInput = document.querySelector('.product-search input[type="search"]');
            const tableBody = document.querySelector('.product-table tbody');
            // Category filter buttons
            const filterButtons = document.querySelectorAll('.product-filters button');
            let activeCategory = 'all';

            function filterRows() {
                const filter = searchInput ? searchInput.value.trim().toLowerCase() : '';
                const rows = tableBody ? tableBody.querySelectorAll('tr') : [];
                rows.forEach(row => {
                    // S.No, Fragrance Name, Fragrance Type, Category, Price
                    const sNo = row.children[1]?.textContent.trim().toLowerCase() || '';
                    const name = row.children[2]?.textContent.trim().toLowerCase() || '';
                    const type = row.children[3]?.textContent.trim().toLowerCase() || '';
                    const category = row.children[4]?.textContent.trim().toLowerCase() || '';
                    const price = row.children[5]?.textContent.trim().toLowerCase() || '';
                    // Category filter logic
                    const matchesCategory = (activeCategory === 'all') || (category === activeCategory);
                    // Search filter logic
                    const matchesSearch =
                        sNo.includes(filter) ||
                        name.includes(filter) ||
                        type.includes(filter) ||
                        category.includes(filter) ||
                        price.includes(filter);
                    if (matchesCategory && matchesSearch) {
                        row.style.display = '';
                    } else {
                        row.style.display = 'none';
                    }
                });
            }

            if (searchInput && tableBody) {
                searchInput.addEventListener('input', filterRows);
            }
            if (filterButtons && tableBody) {
                filterButtons.forEach(btn => {
                    btn.addEventListener('click', function () {
                        filterButtons.forEach(b => b.classList.remove('active'));
                        this.classList.add('active');
                        const text = this.textContent.trim().toLowerCase();
                        if (text === 'all') {
                            activeCategory = 'all';
                        } else {
                            activeCategory = text;
                        }
                        filterRows();
                    });
                });
            }
        });

// Toast Notification Utility
function showToast(message, type = 'success') {
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.style.position = 'fixed';
        toastContainer.style.bottom = '24px';
        toastContainer.style.right = '24px';
        toastContainer.style.zIndex = '9999';
        toastContainer.style.display = 'flex';
        toastContainer.style.flexDirection = 'column';
        toastContainer.style.gap = '8px';
        document.body.appendChild(toastContainer);
    }

    const toast = document.createElement('div');
    toast.className = `custom-toast ${type}`;
    toast.style.background = type === 'success' ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #ef4444, #dc2626)';
    toast.style.color = '#ffffff';
    toast.style.padding = '12px 24px';
    toast.style.borderRadius = '8px';
    toast.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
    toast.style.fontSize = '14px';
    toast.style.fontWeight = '500';
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
    toast.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    toast.style.display = 'flex';
    toast.style.alignItems = 'center';
    toast.style.gap = '8px';

    const icon = document.createElement('i');
    icon.className = type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle';
    toast.appendChild(icon);

    const text = document.createElement('span');
    text.textContent = message;
    toast.appendChild(text);

    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
    }, 50);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-20px)';
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3500);
}

// CSV Import Trigger and Upload Logic
document.addEventListener('DOMContentLoaded', function () {
    const importCsvBtn = document.getElementById('importCsvBtn');
    const csvFileInput = document.getElementById('csvFileInput');
    
    if (importCsvBtn && csvFileInput) {
        importCsvBtn.addEventListener('click', function (e) {
            e.preventDefault();
            csvFileInput.click();
        });
        
        csvFileInput.addEventListener('change', function () {
            const file = this.files[0];
            if (!file) return;
            
            const confirmImport = confirm(`Are you sure you want to import "${file.name}"? This will append the fragrances to your list.`);
            if (!confirmImport) {
                csvFileInput.value = '';
                return;
            }
            
            const formData = new FormData();
            formData.append('csv_file', file);
            
            const originalText = importCsvBtn.innerHTML;
            importCsvBtn.disabled = true;
            importCsvBtn.innerHTML = '<i class="fas fa-spinner fa-spin" style="margin-right:5px;"></i>Importing...';
            
            fetch('/viaadmin/import_list', {
                method: 'POST',
                body: formData
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    showToast(`Success! Imported ${data.count} fragrances.`, 'success');
                    setTimeout(() => {
                        window.location.reload();
                    }, 1000);
                } else {
                    showToast('Import failed: ' + (data.message || 'Unknown error'), 'error');
                }
            })
            .catch(err => {
                console.error(err);
                showToast('Network error while importing CSV file', 'error');
            })
            .finally(() => {
                importCsvBtn.disabled = false;
                importCsvBtn.innerHTML = originalText;
                csvFileInput.value = '';
            });
        });
    }
});

// Delete fragrance catalog item (with custom confirmation modal)
document.addEventListener('DOMContentLoaded', function () {
    let activeDeleteBtn = null;
    let activeDeleteId = null;

    const deleteConfirmModal = document.getElementById('deleteConfirmModal');
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');

    function showDeleteModal() {
        if (deleteConfirmModal) {
            deleteConfirmModal.style.display = 'flex';
            setTimeout(() => {
                deleteConfirmModal.classList.add('show');
            }, 10);
        }
    }

    function hideDeleteModal() {
        if (deleteConfirmModal) {
            deleteConfirmModal.classList.remove('show');
            setTimeout(() => {
                deleteConfirmModal.style.display = 'none';
            }, 300);
        }
        activeDeleteBtn = null;
        activeDeleteId = null;
    }

    document.addEventListener("click", function(e) {
        const btn = e.target.closest(".delete-item-btn");
        if (btn) {
            activeDeleteBtn = btn;
            activeDeleteId = btn.dataset.id;
            showDeleteModal();
        }
    });

    if (cancelDeleteBtn) {
        cancelDeleteBtn.addEventListener('click', hideDeleteModal);
    }

    if (deleteConfirmModal) {
        deleteConfirmModal.addEventListener('click', function(e) {
            if (e.target === deleteConfirmModal) {
                hideDeleteModal();
            }
        });
    }

    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', function() {
            const btn = activeDeleteBtn;
            const id = activeDeleteId;
            
            if (!btn) {
                hideDeleteModal();
                return;
            }

            if (id) {
                confirmDeleteBtn.disabled = true;
                confirmDeleteBtn.innerHTML = '<i class="fas fa-spinner fa-spin" style="margin-right:5px;"></i>Deleting...';

                fetch(`/viaadmin/delete_list_item/${id}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                })
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        const row = btn.closest("tr");
                        if (row) row.remove();
                        
                        const countLabel = document.querySelector('.stat-card:first-child .stat-value');
                        if (countLabel) {
                            const currentVal = parseInt(countLabel.textContent) || 0;
                            countLabel.textContent = Math.max(0, currentVal - 1);
                        }
                        showToast('Fragrance deleted successfully!', 'success');
                    } else {
                        showToast('Failed to delete item: ' + (data.message || 'Unknown error'), 'error');
                    }
                })
                .catch(() => showToast('Network error while deleting item', 'error'))
                .finally(() => {
                    confirmDeleteBtn.disabled = false;
                    confirmDeleteBtn.innerHTML = 'Delete';
                    hideDeleteModal();
                });
            } else {
                // Static mockup local removal
                const row = btn.closest("tr");
                if (row) row.remove();
                showToast('Fragrance deleted locally.', 'success');
                hideDeleteModal();
            }
        });
    }
});