// costumers.js
// Sidebar logic is already inlined in costumers.html, so only add search filter logic here.
document.addEventListener('DOMContentLoaded', function () {
    const searchInput = document.querySelector('.product-search input[type="search"]');
    const userList = document.getElementById('userList');
    if (searchInput && userList) {
        searchInput.addEventListener('input', function () {
            const filter = this.value.trim().toLowerCase();
            const rows = userList.querySelectorAll('tr');
            rows.forEach(row => {
                // S.No, Name, Email, Registered At, Last Login
                const sNo = row.children[0]?.textContent.trim().toLowerCase() || '';
                const name = row.children[1]?.textContent.trim().toLowerCase() || '';
                const email = row.children[2]?.textContent.trim().toLowerCase() || '';
                const registered = row.children[3]?.textContent.trim().toLowerCase() || '';
                const lastLogin = row.children[4]?.textContent.trim().toLowerCase() || '';
                if (
                    sNo.includes(filter) ||
                    name.includes(filter) ||
                    email.includes(filter) ||
                    registered.includes(filter) ||
                    lastLogin.includes(filter)
                ) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        });
    }
});
