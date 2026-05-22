document.addEventListener('DOMContentLoaded', function () {
    const quantityInput = document.getElementById('quantity');
    const totalPriceEl = document.getElementById('total-price');
    const unitPrice = parseFloat(totalPriceEl?.dataset?.price) || 0;
    const maxStock = parseInt(quantityInput?.max) || 99;

    const buyNowQuantities = document.querySelectorAll('.buy-now-quantity');
    const buyNowTotal = document.getElementById('buy-now-total-price');
    const cartTotal = document.getElementById('cart-total-price');

    const buyNowFinalInput = document.getElementById('buyNowFinalPriceInput');
    const cartFinalInput = document.getElementById('cartFinalPriceInput');

    const bottleSizeInput = document.getElementById('bottleSizeInput');
    const cartBottleSizeInput = document.getElementById('cart-bottleSizeInput');
    const selectedSizeEl = document.querySelector(".dropdown-selected");

    const discountedEl = document.getElementById("discountedPrice");
    const originalEl = document.getElementById("originalPrice");
    const discountEl = document.getElementById("discountPercentage");
    const regularEl = document.getElementById("regularPrice");

    function getSizeAddition(size) {
        if (size === "75ml") return 100;
        if (size === "50ml") return 200;
        return 0;
    }

    function formatPrice(value) {
        return "Rs " + Math.round(value).toLocaleString();
    }

    function updateTotalPrice() {
        if (!totalPriceEl || !quantityInput) return;

        let quantity = parseInt(quantityInput.value) || 1;
        if (quantity > maxStock) quantity = maxStock;

        const selectedSize = selectedSizeEl?.textContent?.trim() || "100ml";
        const sizeAddition = getSizeAddition(selectedSize);
        const adjustedUnitPrice = unitPrice + sizeAddition;
        const total = adjustedUnitPrice * quantity;

        totalPriceEl.textContent = total.toLocaleString();

        // ✅ Set both final_price inputs using calculated unit price
        const visibleDiscounted = discountedEl?.dataset.base;
        const adjustedFinalPrice = parseFloat(visibleDiscounted || unitPrice) + sizeAddition;

        if (buyNowFinalInput) buyNowFinalInput.value = adjustedFinalPrice.toFixed(2);
        if (cartFinalInput) cartFinalInput.value = adjustedFinalPrice.toFixed(2);

        if (buyNowTotal) buyNowTotal.value = total;
        if (cartTotal) cartTotal.value = total;

        // ✅ Update quantity in form inputs
        buyNowQuantities.forEach(input => input.value = quantity);

        // 🎯 Update visible prices
        if (discountedEl && originalEl && discountEl) {
            const baseDiscount = parseFloat(discountedEl.dataset.base);
            const baseOriginal = parseFloat(originalEl.dataset.base);

            const newDiscount = baseDiscount + sizeAddition;
            const newOriginal = baseOriginal + sizeAddition;
            const discountPercent = Math.round((1 - newDiscount / newOriginal) * 100);

            discountedEl.textContent = formatPrice(newDiscount);
            originalEl.textContent = formatPrice(newOriginal);
            discountEl.textContent = discountPercent + "% OFF";
        } else if (regularEl) {
            const basePrice = parseFloat(regularEl.dataset.base);
            const newPrice = basePrice + sizeAddition;
            regularEl.textContent = formatPrice(newPrice);
        }

        console.log("✅ Final Price (calculated):", adjustedFinalPrice.toFixed(2));
    }

    window.adjustQuantity = function (change) {
        let quantity = parseInt(quantityInput.value) || 1;
        quantity += change;
        if (quantity < 1) quantity = 1;
        if (quantity > maxStock) quantity = maxStock;

        quantityInput.value = quantity;
        updateTotalPrice();
    };

    window.validateNumber = function (input) {
        input.value = input.value.replace(/[^0-9]/g, '');
        let value = parseInt(input.value);
        if (!value || value < 1) value = 1;
        if (value > maxStock) value = maxStock;
        input.value = value;
        updateTotalPrice();
    };

    if (quantityInput) {
        quantityInput.addEventListener('input', function () {
            validateNumber(this);
        });
    }

    window.toggleDropdown = function () {
        document.getElementById("dropdownOptions").classList.toggle("show");
    };

    window.selectOption = function (element) {
        const selectedText = element.textContent.trim();
        selectedSizeEl.textContent = selectedText;
        bottleSizeInput.value = selectedText;
        cartBottleSizeInput.value = selectedText;
        document.getElementById("dropdownOptions").classList.remove("show");
        updateTotalPrice();
    };

    window.addEventListener("click", function (e) {
        if (!e.target.closest(".custom-dropdown")) {
            document.getElementById("dropdownOptions")?.classList.remove("show");
        }
    });

    window.openTab = function (tabName) {
        document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));

        document.getElementById(tabName)?.classList.add('active');
        event.currentTarget.classList.add('active');
    };

    document.querySelectorAll('.related-card').forEach(card => {
        card.addEventListener('click', function () {
            const productId = this.dataset.id || 'default';
            window.location.href = `product.html?id=${productId}`;
        });
    });

    const buyNowForm = document.querySelector('.buy-now-form');
    if (buyNowForm) {
        buyNowForm.addEventListener('submit', () => {
            updateTotalPrice();
            console.log("✅ Final Price (Buy Now):", buyNowFinalInput?.value);

            const formData = new FormData(buyNowForm);
            console.log("🛒 Buy Now Form Data:");
            for (let [key, value] of formData.entries()) {
                console.log(`${key}: ${value}`);
            }
        });
    }

    const addToCartForm = document.querySelector('.add-to-cart-form');
    if (addToCartForm) {
        addToCartForm.addEventListener('submit', () => {
            updateTotalPrice();
            console.log("✅ Final Price (Add to Cart):", cartFinalInput?.value);

            const formData = new FormData(addToCartForm);
            console.log("🛒 Cart Form Data:");
            for (let [key, value] of formData.entries()) {
                console.log(`${key}: ${value}`);
            }
        });
    }

    function syncFragranceToHidden() {
        if (selectedSizeEl && bottleSizeInput) {
            const selectedValue = selectedSizeEl.textContent.trim();
            bottleSizeInput.value = selectedValue;
            cartBottleSizeInput.value = selectedValue;
            console.log("✅ Bottle size synced:", selectedValue);
        }

        updateTotalPrice();
        return true;
    }

    // Initial setup
    syncFragranceToHidden();
    updateTotalPrice();
});
