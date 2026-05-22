// Message Templates
        const messageTemplates = {
            reorder: "Hi {name}! 🌟 It's been a month since your last perfume purchase. Your favorite fragrance might be running low. Visit our website to reorder and get 10% off your next purchase!",
            newCollection: "🎉 NEW ARRIVAL ALERT! {name}, discover our latest perfume collection with exclusive scents just for you. Shop now at our website and be the first to experience luxury!",
            discount: "Special offer for you, {name}! 💫 Get 15% OFF on all perfumes this week only. Don't miss out on your favorite fragrances. Use code SAVE15 on our website!",
            newProduct: "Hi {name}! Check out our new perfume that just arrived - perfect for your style! 🌸",
            thanks: "Thank you {name} for your recent purchase! We hope you love your new fragrance. 💖"
        };

        // Load bulk message template
        function loadTemplate() {
            const select = document.getElementById('messageTemplate');
            const messageArea = document.getElementById('bulkMessage');
            const template = select.value;

            if (template && messageTemplates[template]) {
                messageArea.value = messageTemplates[template].replace('{name}', '[Customer Name]');
            } else if (template === 'custom') {
                messageArea.value = '';
                messageArea.focus();
            }
        }

        // Load individual message template
        function loadIndividualTemplate(selectElement, index) {
            const template = selectElement.value;
            const messageInput = document.getElementById(`message_${index}`);

            if (template && messageTemplates[template]) {
                // Get customer name from the row
                const row = selectElement.closest('tr');
                const customerName = row.querySelector('.customer-details h4').textContent.trim();
                const firstName = customerName.split(' ')[0];

                messageInput.value = messageTemplates[template].replace('{name}', firstName);
            }
        }

        // Update selected count
        function updateSelectedCount() {
            const selected = document.querySelectorAll('.customer-select:checked');
            const count = selected.length;
            document.getElementById('selectedCount').textContent = `${count} customers selected`;
        }

        // Toggle select all
        function toggleSelectAll() {
            const selectAll = document.getElementById('selectAll');
            const customerSelects = document.querySelectorAll('.customer-select');

            customerSelects.forEach(checkbox => {
                checkbox.checked = selectAll.checked;
            });

            updateSelectedCount();
        }

        // Select all customers
        function selectAllCustomers() {
            const customerSelects = document.querySelectorAll('.customer-select');
            const selectAll = document.getElementById('selectAll');

            customerSelects.forEach(checkbox => {
                checkbox.checked = true;
            });
            selectAll.checked = true;

            updateSelectedCount();
        }

        // Clear selection
        function clearSelection() {
            const customerSelects = document.querySelectorAll('.customer-select');
            const selectAll = document.getElementById('selectAll');

            customerSelects.forEach(checkbox => {
                checkbox.checked = false;
            });
            selectAll.checked = false;

            updateSelectedCount();
        }

        // Send bulk message
        function sendBulkMessage() {
            const message = document.getElementById('bulkMessage').value.trim();
            const selected = document.querySelectorAll('.customer-select:checked');

            if (!message) {
                alert('Please enter a message to send.');
                return;
            }

            if (selected.length === 0) {
                alert('Please select at least one customer.');
                return;
            }

            const numbers = Array.from(selected).map(cb => cb.value).filter(num => num);

            // Create personalized messages for each customer
            const personalizedMessages = [];
            selected.forEach(checkbox => {
                const row = checkbox.closest('tr');
                const customerName = row.querySelector('.customer-details h4').textContent.trim();
                const firstName = customerName.split(' ')[0];
                const phoneNumber = checkbox.value;

                const personalizedMessage = message.replace(/\[Customer Name\]/g, firstName);
                personalizedMessages.push({
                    number: phoneNumber,
                    message: personalizedMessage,
                    name: firstName
                });
            });

            if (confirm(`Send personalized messages to ${numbers.length} customers?`)) {
                // Here you would implement the actual message sending logic
                fetch('/viaadmin/send-bulk-message', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        message: message,
                        numbers: numbers,
                        personalizedMessages: personalizedMessages
                    })
                })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            alert(`Messages sent successfully to ${numbers.length} customers!`);
                            document.getElementById('bulkMessage').value = '';
                            document.getElementById('messageTemplate').value = '';
                            clearSelection();
                        } else {
                            alert('Failed to send messages: ' + (data.error || 'Unknown error'));
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        alert('Error sending messages. Please try again.');
                    });
            }
        }

        // Send individual message
        function sendIndividualMessage(phoneNumber, index) {
            const messageInput = document.getElementById(`message_${index}`);
            const message = messageInput.value.trim();

            if (!message) {
                alert('Please enter a message to send.');
                return;
            }

            if (!phoneNumber || phoneNumber === 'N/A') {
                alert('No valid phone number for this customer.');
                return;
            }

            if (confirm(`Send message to ${phoneNumber}?`)) {
                // Here you would implement the actual message sending logic
                fetch('/viaadmin/send-individual-message', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        message: message,
                        number: phoneNumber
                    })
                })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            alert('Message sent successfully!');
                            messageInput.value = '';
                        } else {
                            alert('Failed to send message: ' + (data.error || 'Unknown error'));
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        alert('Error sending message. Please try again.');
                    });
            }
        }

        // Search customers
        function searchCustomers(searchTerm) {
            const rows = document.querySelectorAll('.customer-row');
            const term = searchTerm.toLowerCase();

            rows.forEach(row => {
                const name = row.querySelector('.customer-details h4').textContent.toLowerCase();
                const phone = row.querySelector('.contact-info').textContent.toLowerCase();
                const city = row.querySelectorAll('.contact-info')[1].textContent.toLowerCase();

                if (name.includes(term) || phone.includes(term) || city.includes(term)) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        }

        // Initialize
        document.addEventListener('DOMContentLoaded', function () {
            updateSelectedCount();
        });
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