// const metrics = {
//     sales: {
//         daily: {{ sales_daily_change }},
// weekly: { { sales_weekly_change } },
// monthly: { { sales_monthly_change } }
//             },
// orders: {
//     daily: { { orders_daily_change } },
//     weekly: { { orders_weekly_change } },
//     monthly: { { orders_monthly_change } }
// },
// customers: {
//     daily: { { customers_daily_change } },
//     weekly: { { customers_weekly_change } },
//     monthly: { { customers_monthly_change } }
// },
// revenue: {
//     daily: { { sales_daily_change } },
//     weekly: { { sales_weekly_change } },
//     monthly: { { sales_monthly_change } }
// }
//         };

// let currentPeriod = 'daily'; // default

// function updateCardPeriod(card) {
//     // Cycle through daily → weekly → monthly
//     const periods = ['daily', 'weekly', 'monthly'];
//     const currentIndex = periods.indexOf(currentPeriod);
//     const nextIndex = (currentIndex + 1) % periods.length;
//     currentPeriod = periods[nextIndex];

//     const change = metrics[card][currentPeriod];
//     const label = currentPeriod === 'daily' ? 'from yesterday' :
//         currentPeriod === 'weekly' ? 'from last week' :
//             'from last month';

//     const changeElem = document.getElementById(`${card}-change`);
//     changeElem.innerHTML = `<i class="fas fa-arrow-${change >= 0 ? 'up' : 'down'}"></i> ${Math.abs(change)}% ${label}`;

//     // Update class for color
//     changeElem.classList.remove('positive', 'negative');
//     changeElem.classList.add(change >= 0 ? 'positive' : 'negative');

//     // Add animation
//     changeElem.classList.add('updated');
//     setTimeout(() => changeElem.classList.remove('updated'), 500);
// }

// Mobile menu toggle functionality
// document.addEventListener('DOMContentLoaded', function () {
// const menuToggle = document.querySelector('.menu-toggle');
// const sidebar = document.querySelector('.sidebar');

// if (menuToggle && sidebar) {
//     menuToggle.addEventListener('click', function () {
//         document.body.classList.toggle('sidebar-open');
//     });
// }

// Add click effect to cards
//         const cards = document.querySelectorAll('.card');
//         cards.forEach(card => {
//             card.addEventListener('mousedown', function () {
//                 this.style.transform = 'translateY(2px)';
//             });

//             card.addEventListener('mouseup', function () {
//                 this.style.transform = 'translateY(-5px)';
//             });

//             card.addEventListener('mouseleave', function () {
//                 this.style.transform = '';
//             });
//         });
//     });
//     // // Enhanced Mobile Menu Toggle
//     document.addEventListener('DOMContentLoaded', function () {
//         const menuToggle = document.createElement('button');
//         menuToggle.className = 'menu-toggle';
//         menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
//         menuToggle.style.cssText = `
//         position: fixed;
//         top: 20px;
//         left: 20px;
//         z-index: 1001;
//         background: var(--primary);
//         color: white;
//         border: none;
//         width: 45px;
//         height: 45px;
//         border-radius: 50%;
//         font-size: 18px;
//         cursor: pointer;
//         box-shadow: 0 4px 20px rgba(27, 41, 146, 0.3);
//         display: none;
//         transition: all 0.3s ease;
//     `;

//         menuToggle.addEventListener('click', function () {
//             document.body.classList.toggle('sidebar-open');
//             this.style.transform = document.body.classList.contains('sidebar-open') ? 'rotate(90deg)' : 'rotate(0deg)';
//         });

//         document.body.appendChild(menuToggle);

//         // Show menu toggle on mobile
//         function handleResize() {
//             if (window.innerWidth <= 768) {
//                 menuToggle.style.display = 'flex';
//                 menuToggle.style.alignItems = 'center';
//                 menuToggle.style.justifyContent = 'center';
//             } else {
//                 menuToggle.style.display = 'none';
//                 document.body.classList.remove('sidebar-open');
//             }
//         }

//         handleResize();
//         window.addEventListener('resize', handleResize);
//     });


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