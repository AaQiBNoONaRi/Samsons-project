// Index Page Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize sidebar state
    initializeSidebar();
    
    // Check if we're on the index page (has category filters)
    if (document.querySelector('.category-filters')) {
        setupFilterFunctionality();
    }

    // Product Page Functionality
    if (document.getElementById('main-image')) {
        setupProductPage();
    }

    // Add to cart functionality
    setupAddToCart();

    // Quick view functionality
    setupQuickView();

    // Setup mobile animations if needed
    if (window.matchMedia("(max-width: 768px)").matches) {
        setupMobileAnimations();
    }
});

// Sidebar Toggle Functionality
function initializeSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const arrowIcon = document.querySelector('.toggle-arrow i');
    
    if (!sidebar) return;

    // Check localStorage for sidebar state
    const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    if (isCollapsed) {
        sidebar.classList.add('closed');
        if (arrowIcon) arrowIcon.style.transform = 'rotate(-90deg)';
    }

    // Toggle sidebar on filter header click
    document.querySelector('.filter-header').addEventListener('click', function() {
        toggleSidebar();
    });
}

// function toggleSidebar() {
//     const sidebar = document.querySelector('.sidebar');
//     const arrowIcon = document.querySelector('.toggle-arrow i');
    
//     sidebar.classList.toggle('closed');
    
//     // Rotate arrow icon
//     if (arrowIcon) {
//         if (sidebar.classList.contains('closed')) {
//             arrowIcon.style.transform = 'rotate(-90deg)';
//         } else {
//             arrowIcon.style.transform = 'rotate(0deg)';
//         }
//     }

//     // Update localStorage
//     localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('closed'));
// }

// Filter and Sort Functionality
function setupFilterFunctionality() {
    const categoryRadios = document.querySelectorAll('.category-filters input[type="radio"]');
    const typeCheckboxes = document.querySelectorAll('.type-filters input[type="checkbox"]');
    const sortSelect = document.getElementById('sort-by');
    
    // Filter products based on selections
    function filterProducts() {
        const selectedCategory = document.querySelector('.category-filters input[type="radio"]:checked').id;
        const selectedTypes = Array.from(document.querySelectorAll('.type-filters input[type="checkbox"]:checked')).map(cb => cb.id);
        
        // Show/hide sections based on category
        document.querySelectorAll('.category-section').forEach(section => {
    const sectionCategory = section.dataset.categorySection;
    if (selectedCategory === 'all' || selectedCategory === sectionCategory) {
        section.style.display = 'block';
    } else {
        section.style.display = 'none';
    }
});

        
        // Filter individual products within visible sections
        document.querySelectorAll('.product-card').forEach(card => {
            const cardCategory = card.dataset.category;
            const cardTypes = card.dataset.types ? card.dataset.types.split(' ') : [];
            
            const categoryMatch = selectedCategory === 'all' || cardCategory === selectedCategory;
            const typeMatch = selectedTypes.length === 0 || selectedTypes.some(type => cardTypes.includes(type));
            
            if (categoryMatch && typeMatch) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
        
        // Sort products
        sortProducts();
    }
    
    // Sort products based on selection
    function sortProducts() {
        const sortValue = sortSelect.value;
        
        document.querySelectorAll('.products').forEach(container => {
            const products = Array.from(container.querySelectorAll('.product-card'));
            
            products.sort((a, b) => {
                switch(sortValue) {
                    case 'price-low':
                        return parseFloat(a.dataset.price) - parseFloat(b.dataset.price);
                    case 'price-high':
                        return parseFloat(b.dataset.price) - parseFloat(a.dataset.price);
                    case 'newest':
                        return new Date(b.dataset.date) - new Date(a.dataset.date);
                    default:
                        return 0;
                }
            });
            
            // Re-append sorted products
            products.forEach(product => {
                container.appendChild(product);
            });
        });
    }
    
    // Event listeners
    categoryRadios.forEach(radio => {
        radio.addEventListener('change', filterProducts);
    });
    
    typeCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', filterProducts);
    });
    
    sortSelect.addEventListener('change', sortProducts);
    
    // Initialize
    filterProducts();
    
    // Product click handler
    document.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('click', function (e) {
        // Prevents the eye icon click from triggering the card redirect too
        if (e.target.closest('.quick-view-icon')) return;

        const productId = this.dataset.id || 'default';
        window.location.href = `/products/details/${productId}`;
    });
});

}

// Product Page Functionality
function setupProductPage() {
    // Image gallery functionality
    window.changeImage = function(element) {
        document.getElementById('main-image').src = element.src;
    }

    // Quantity selector functionality
    window.adjustQuantity = function(change) {
        const quantityInput = document.getElementById('quantity');
        let currentValue = parseInt(quantityInput.value) || 0;
        currentValue += change;
        
        if (currentValue < 1) currentValue = 1;
        if (currentValue > 99) currentValue = 99;
        
        quantityInput.value = currentValue;
    }

    window.validateNumber = function(input) {
        input.value = input.value.replace(/[^0-9]/g, '');
        
        if (input.value === '' || parseInt(input.value) < 1) {
            input.value = '1';
        }
        
        if (parseInt(input.value) > 99) {
            input.value = '99';
        }
    }

    // Tab functionality
    window.openTab = function(tabName) {
        // Hide all tab contents
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });

        // Deactivate all tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // Activate selected tab
        document.getElementById(tabName).classList.add('active');
        event.currentTarget.classList.add('active');
    }

    // Initialize quantity input
    const quantityInput = document.getElementById('quantity');
    if (quantityInput) {
        quantityInput.addEventListener('input', function() {
            validateNumber(this);
        });
    }

    // Initialize first tab as active if on product page
    if (document.querySelector('.tab-btn')) {
        document.querySelector('.tab-btn').click();
    }

    // Related product click handler
    document.querySelectorAll('.related-card').forEach(card => {
    card.addEventListener('click', function () {
        const productId = this.dataset.id || 'default';
        window.location.href = `/products/details/${productId}`;
    });
});

}

// Add to cart functionality
function setupAddToCart() {
    document.querySelectorAll('.add-to-cart').forEach(icon => {
        icon.addEventListener('click', function(e) {
            e.stopPropagation();
            this.innerHTML = '<i class="fas fa-check"></i>';
            setTimeout(() => {
                this.innerHTML = '<i class="fas fa-shopping-cart"></i>';
            }, 1000);
        });
    });
}

// Quick view functionality
function setupQuickView() {
    document.querySelectorAll('.quick-view-icon').forEach(icon => {
        icon.addEventListener('click', function (e) {
            e.stopPropagation(); // Prevent the main card click from also firing
            const productId = this.closest('.product-card').dataset.id || 'default';
            window.location.href = `/products/details/${productId}`;
        });
    });
}


/* =====================
   MOBILE ANIMATIONS (992px and below)
   ===================== */
function setupMobileAnimations() {
    if (window.matchMedia("(max-width: 992px)").matches) {
        const cards = document.querySelectorAll('.product-card');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-card');
                    // Animation stays after triggering
                }
            });
        }, { threshold: 0.1 });

        cards.forEach(card => {
            observer.observe(card);
        });
    }
}

/* =====================
   RESPONSIVE SIDEBAR TO MINI-NAVBAR
   ===================== */
// function setupResponsiveSidebar() {
//     const sidebar = document.querySelector('.sidebar');
//     const filterHeader = document.querySelector('.filter-header');
    
//     if (!sidebar || !filterHeader) return;

//     function handleResponsiveChange() {
//         if (window.matchMedia("(max-width: 992px)").matches) {
//             // Transform to mini-navbar
//             sidebar.classList.add('mini-navbar');
//             sidebar.style.position = 'relative';
//             sidebar.style.height = 'auto';
            
//             // Make sure it's initially closed on mobile
//             sidebar.classList.remove('open');
//         } else {
//             // Revert to desktop sidebar
//             sidebar.classList.remove('mini-navbar');
//             sidebar.style.position = '';
//             sidebar.style.height = '';
//         }
//     }

//     // Run on load and when window resizes
//     handleResponsiveChange();
//     window.addEventListener('resize', handleResponsiveChange);

//     // Toggle functionality for mini-navbar
//     filterHeader.addEventListener('click', function() {
//         if (window.matchMedia("(max-width: 992px)").matches) {
//             sidebar.classList.toggle('open');
//         }
//     });
// }

/* =====================
   PRODUCT GRID FOR 992px (1 product)
   ===================== */
function setupSingleProductView() {
    if (window.matchMedia("(max-width: 992px)").matches) {
        const productsContainer = document.querySelector('.products');
        if (productsContainer) {
            productsContainer.style.gridTemplateColumns = '1fr';
            productsContainer.style.maxWidth = '300px';
            productsContainer.style.margin = '0 auto';
        }
    }
}