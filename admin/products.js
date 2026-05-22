    document.addEventListener('DOMContentLoaded', function () {
        // Product table body reference (used by all filters)
        const productTableBody = document.getElementById('product-details');

        // Product table search filter
        const searchInput = document.querySelector('.product-search input[type="search"]');
        if (searchInput && productTableBody) {
            searchInput.addEventListener('input', function () {
                const filter = this.value.trim().toLowerCase();
                const rows = productTableBody.querySelectorAll('tr');
                rows.forEach(row => {
                    // S.NO, Product Name, Reg Price, Sale Price
                    const sNo = row.children[1]?.textContent.trim().toLowerCase() || '';
                    const name = row.children[2]?.textContent.trim().toLowerCase() || '';
                    const regPrice = row.children[4]?.textContent.trim().toLowerCase() || '';
                    const salePrice = row.children[5]?.textContent.trim().toLowerCase() || '';
                    if (
                        sNo.includes(filter) ||
                        name.includes(filter) ||
                        regPrice.includes(filter) ||
                        salePrice.includes(filter)
                    ) {
                        row.style.display = '';
                    } else {
                        row.style.display = 'none';
                    }
                });
            });
        }

        // Product status filter buttons
        const filterButtons = document.querySelectorAll('.product-filters button');
        if (filterButtons && productTableBody) {
            filterButtons.forEach(btn => {
                btn.addEventListener('click', function () {
                    // Remove active class from all buttons
                    filterButtons.forEach(b => b.classList.remove('active'));
                    this.classList.add('active');
                    const filter = this.textContent.trim().toLowerCase();
                    const rows = productTableBody.querySelectorAll('tr');
                    rows.forEach(row => {
                        const status = row.children[10]?.textContent.trim().toLowerCase() || '';
                        if (filter === 'all products') {
                            row.style.display = '';
                        } else if (filter === 'active' && status === 'active') {
                            row.style.display = '';
                        } else if (filter === 'inactive' && status === 'inactive') {
                            row.style.display = '';
                        } else if (filter === 'out of stock') {
                            // Out of stock: check stock column (index 8)
                            const stock = row.children[8]?.textContent.trim();
                            if (stock === '0' || stock === '' || stock.toLowerCase() === 'out of stock') {
                                row.style.display = '';
                            } else {
                                row.style.display = 'none';
                            }
                        } else {
                            row.style.display = 'none';
                        }
                    });
                });
            });
        }

        // Sidebar mobile toggle (hamburger in header and sidebar)
        const hamburgerMenuOpen = document.getElementById('hamburgerMenuOpen');
        const hamburgerMenuClose = document.getElementById('hamburgerMenuClose');
        const sidebar = document.getElementById('sidebar');
        const mainContent = document.getElementById('mainContent');

        function openSidebar() {
            if (hamburgerMenuOpen) hamburgerMenuOpen.classList.add('active');
            if (sidebar) sidebar.classList.add('mobile-open');
            document.body.classList.add('mobile-sidebar-open');
            if (mainContent) mainContent.classList.add('hide-on-sidebar');
        }
        function closeSidebar() {
            if (hamburgerMenuOpen) hamburgerMenuOpen.classList.remove('active');
            if (sidebar) sidebar.classList.remove('mobile-open');
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
    // Product table search filter
    const searchInput = document.querySelector('.product-search input[type="search"]');
    const productTableBody = document.getElementById('product-details');
    if (searchInput && productTableBody) {
        searchInput.addEventListener('input', function () {
            const filter = this.value.trim().toLowerCase();
            const rows = productTableBody.querySelectorAll('tr');
            rows.forEach(row => {
                // S.NO, Product Name, Reg Price, Sale Price
                const sNo = row.children[1]?.textContent.trim().toLowerCase() || '';
                const name = row.children[2]?.textContent.trim().toLowerCase() || '';
                const regPrice = row.children[4]?.textContent.trim().toLowerCase() || '';
                const salePrice = row.children[5]?.textContent.trim().toLowerCase() || '';
                if (
                    sNo.includes(filter) ||
                    name.includes(filter) ||
                    regPrice.includes(filter) ||
                    salePrice.includes(filter)
                ) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        });
    }

	// Sidebar mobile toggle (hamburger in header and sidebar)
    const hamburgerMenuOpen = document.getElementById('hamburgerMenuOpen');
    const hamburgerMenuClose = document.getElementById('hamburgerMenuClose');
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');

    function openSidebar() {
        if (hamburgerMenuOpen) hamburgerMenuOpen.classList.add('active');
        if (sidebar) sidebar.classList.add('mobile-open');
        document.body.classList.add('mobile-sidebar-open');
        if (mainContent) mainContent.classList.add('hide-on-sidebar');
    }
    function closeSidebar() {
        if (hamburgerMenuOpen) hamburgerMenuOpen.classList.remove('active');
        if (sidebar) sidebar.classList.remove('mobile-open');
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