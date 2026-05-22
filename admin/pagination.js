document.addEventListener("DOMContentLoaded", function () {
        const tbody = document.getElementById("orders-body");
        const rows = tbody.querySelectorAll("tr");
        const rowsPerPageSelect = document.getElementById("rowsPerPage");
        const pageNumbersSpan = document.getElementById("pageNumbers");
        const prevBtn = document.getElementById("prevPage");
        const nextBtn = document.getElementById("nextPage");

        let currentPage = 1;
        let rowsPerPage = parseInt(rowsPerPageSelect.value);

        function displayRows() {
            const start = (currentPage - 1) * rowsPerPage;
            const end = start + rowsPerPage;

            rows.forEach((row, index) => {
                row.style.display = (index >= start && index < end) ? "" : "none";
            });

            updatePagination();
        }

        function updatePagination() {
            const totalPages = Math.ceil(rows.length / rowsPerPage);
            pageNumbersSpan.innerHTML = "";

            for (let i = 1; i <= totalPages; i++) {
                const btn = document.createElement("button");
                btn.textContent = i;
                if (i === currentPage) btn.classList.add("active");
                btn.addEventListener("click", function () {
                    currentPage = i;
                    displayRows();
                });
                pageNumbersSpan.appendChild(btn);
            }

            prevBtn.disabled = currentPage === 1;
            nextBtn.disabled = currentPage === totalPages;
        }

        rowsPerPageSelect.addEventListener("change", function () {
            rowsPerPage = parseInt(this.value);
            currentPage = 1;
            displayRows();
        });

        prevBtn.addEventListener("click", function () {
            if (currentPage > 1) {
                currentPage--;
                displayRows();
            }
        });

        nextBtn.addEventListener("click", function () {
            const totalPages = Math.ceil(rows.length / rowsPerPage);
            if (currentPage < totalPages) {
                currentPage++;
                displayRows();
            }
        });

        displayRows();
    });
