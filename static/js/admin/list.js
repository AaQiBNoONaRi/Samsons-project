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