window.addEventListener('DOMContentLoaded', function () {
    // === FontAwesome icons ===
    document.querySelectorAll('.social-icons a').forEach(function (a, i) {
        const icons = ['\uf09a', '\uf099', '\uf0d2', '\uf0d5', '\uf0e1'];
        a.style.fontFamily = 'FontAwesome';
        a.innerHTML = icons[i];
    });

    const packetSizeDropdownDiv = document.getElementById('packetSizeDropdown');
    let packetSizeValue = '';
    const testerListDiv = document.getElementById('testerList');
    const qtyInput = document.getElementById('quantity');

    let testerSelections = []; // stores fragrance selections per box

    // === Custom Dropdown ===
    function createCustomDropdown(options, id, name, selectedValue) {
        const dropdown = document.createElement('div');
        dropdown.className = 'custom-dropdown';
        dropdown.tabIndex = 0;
        dropdown.id = id;
        dropdown.setAttribute('name', name);

        let value = selectedValue || '';
        let selectedText = options.find(opt => opt.value === value)?.text || 'Choose fragrance...';

        const selected = document.createElement('div');
        selected.className = 'custom-dropdown-selected';
        selected.textContent = selectedText;
        selected.tabIndex = 0;
        dropdown.appendChild(selected);

        const list = document.createElement('div');
        list.className = 'custom-dropdown-list';

        options.forEach(opt => {
            const optionDiv = document.createElement('div');
            optionDiv.className = 'custom-dropdown-list-option';
            optionDiv.textContent = opt.text;
            optionDiv.dataset.value = opt.value;
            optionDiv.onclick = function () {
                value = opt.value;
                selectedText = opt.text;
                selected.textContent = selectedText;
                dropdown.classList.remove('open');
                dropdown.setAttribute('data-value', value);

                // Update testerSelections safely
                const match = id.match(/fragrance(\d+)_(\d+)/);
                if (match) {
                    const [boxIdx, dropIdx] = match.slice(1).map(x => parseInt(x) - 1);
                    if (!testerSelections[boxIdx]) testerSelections[boxIdx] = [];
                    testerSelections[boxIdx][dropIdx] = value;
                    console.log(`Updated: Box ${boxIdx + 1}, Tester ${dropIdx + 1} -> ${value}`);
                }
            };
            list.appendChild(optionDiv);
        });
        dropdown.appendChild(list);

        selected.onclick = () => dropdown.classList.toggle('open');
        selected.onkeydown = e => {
            if (e.key === 'Enter' || e.key === ' ') {
                dropdown.classList.toggle('open');
                e.preventDefault();
            }
        };
        document.addEventListener('click', e => {
            if (!dropdown.contains(e.target)) dropdown.classList.remove('open');
        });

        dropdown.setAttribute('data-value', value);
        return dropdown;
    }

    // === Render tester boxes ===
    function renderTesterBoxes() {
        const packetSize = parseInt(packetSizeValue);
        const quantity = parseInt(qtyInput.value);

        testerListDiv.style.opacity = 0;
        setTimeout(() => {
            testerListDiv.innerHTML = '';
            if (!packetSize || !quantity) {
                testerListDiv.style.opacity = 1;
                return;
            }

            // Adjust testerSelections size
            while (testerSelections.length < quantity) testerSelections.push(Array(packetSize).fill(''));
            while (testerSelections.length > quantity) testerSelections.pop();

            // Generate boxes
            for (let box = 1; box <= quantity; box++) {
                const boxDiv = document.createElement('div');
                boxDiv.className = 'tester-box';

                const boxHeading = document.createElement('h4');
                boxHeading.textContent = `Box ${box}`;
                boxHeading.style.margin = '18px 0 8px 0';
                boxDiv.appendChild(boxHeading);

                if (!testerSelections[box - 1]) testerSelections[box - 1] = Array(packetSize).fill('');
                while (testerSelections[box - 1].length < packetSize) testerSelections[box - 1].push('');
                while (testerSelections[box - 1].length > packetSize) testerSelections[box - 1].pop();

                for (let i = 1; i <= packetSize; i++) {
                    const div = document.createElement('div');
                    div.className = 'tester-item';

                    const label = document.createElement('label');
                    // ✅ Removed ML reference from label
                    label.textContent = `Tester ${i} Fragrance:`;
                    label.setAttribute('for', `fragrance${box}_${i}`);

                    const dropdown = createCustomDropdown(
                        [
                            { value: '', text: 'Choose fragrance...' },
                            // ✅ Removed ML from fragrance options
                            ...fragrances.map(frag => ({
                                value: frag,
                                text: `${frag.ID} - ${frag.Name}`
                            }))
                        ],
                        `fragrance${box}_${i}`,
                        `fragrance${box}_${i}`,
                        testerSelections[box - 1][i - 1]
                    );

                    div.appendChild(label);
                    div.appendChild(dropdown);
                    boxDiv.appendChild(div);
                }

                testerListDiv.appendChild(boxDiv);

                setTimeout(() => {
                    boxDiv.classList.add('tester-box-visible');
                }, 50 * box);
            }

            setTimeout(() => {
                testerListDiv.style.opacity = 1;
            }, 100);
        }, 200);
    }

    // === Render packet size dropdown ===
    // === Render packet size dropdown ===
function renderPacketSizeDropdown() {
    const packets = JSON.parse(document.getElementById("packetsData").textContent);

    const options = [{ value: '', text: 'Choose packet size...' }];
    packets.forEach(p => {
        options.push({
            value: p.size.toString(),
            text: `${p.size} Testers - Rs ${p.price}`
        });
    });

    // ✅ Default to first packet (from DB)
    const defaultPacket = packets[0];
    const dropdown = createCustomDropdown(options, 'packetSize', 'packetSize', defaultPacket.size.toString());
    packetSizeDropdownDiv.innerHTML = '';
    packetSizeDropdownDiv.appendChild(dropdown);

    packetSizeValue = defaultPacket.size.toString();

    // ✅ Set default price
    const priceEl = document.getElementById('productPrice');
    priceEl.textContent = `Rs. ${defaultPacket.price}`;
    const oldPriceEl = document.getElementById('productOldPrice');
    oldPriceEl.textContent = "";

    // Render tester boxes immediately
    renderTesterBoxes();

    dropdown.addEventListener('click', () => {
        setTimeout(() => {
            const newPacketSizeValue = dropdown.getAttribute('data-value') || '';
            if (newPacketSizeValue !== packetSizeValue) {
                packetSizeValue = newPacketSizeValue;
                testerSelections = [];
                renderTesterBoxes();

                // ✅ Update price dynamically based on DB packets
                const selectedPacket = packets.find(p => p.size.toString() === packetSizeValue);
                if (selectedPacket) {
                    priceEl.textContent = `Rs. ${selectedPacket.price}`;
                    oldPriceEl.textContent = ""; // or maybe show discounted price logic later
                }
            }
        }, 100);
    });
}


    renderPacketSizeDropdown();

    // === Quantity buttons and input ===
    qtyInput.addEventListener('input', function () {
        if (parseInt(qtyInput.value) < 1) qtyInput.value = 1;
        renderTesterBoxes();
    });

    document.getElementById('decreaseQty').onclick = function () {
        let val = parseInt(qtyInput.value);
        if (val > 1) qtyInput.value = val - 1;
        renderTesterBoxes();
    };

    document.getElementById('increaseQty').onclick = function () {
        let val = parseInt(qtyInput.value);
        qtyInput.value = val + 1;
        renderTesterBoxes();
    };

    // === Handle form and buttons ===
    document.getElementById('testerForm').addEventListener('submit', function (e) {
        e.preventDefault();
        handleCartOrBuy('cart');
    });

    document.querySelector('.buy-now-btn').addEventListener('click', function () {
        handleCartOrBuy('buy');
    });

    // === Shared function for Cart and Buy Now ===
    // === Shared function for Cart and Buy Now ===
function handleCartOrBuy(type) {
    const packetSize = parseInt(packetSizeValue);
    const quantity = parseInt(qtyInput.value);

    // ✅ Removed the packet size validation since it defaults to 3
    if (!quantity || quantity < 1) {
        alert('Please enter a valid quantity.');
        return;
    }

    let allBoxes = [];
    for (let box = 1; box <= quantity; box++) {
        const boxFragrances = testerSelections[box - 1] || [];
        if (boxFragrances.includes('')) {
            alert(`Please select fragrance for all testers in Box ${box}.`);
            return;
        }
        allBoxes.push(boxFragrances);
    }

    // ✅ Extract price
    const priceText = document.querySelector('.product-price')?.textContent || '';
    const priceInt = parseInt(priceText.replace(/[^0-9]/g, '')) || 0;

    const payload = {
        product_name: "Samsons Signature Tester Pack",
        packet_size: packetSize,
        quantity: quantity,
        boxes: allBoxes,
        price: priceInt,
        product_price: priceInt
    };

    const url = type === 'cart' ? '/tester/add_to_cart' : '/tester/buy_now';

    fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
        .then(res => res.json())
        .then(data => {
            console.log("Backend response:", data);
            if (data.status === 'success') {
                if (type === 'cart') {
                    console.log("Cart Updated:", data.cart);
                    alert(data.message || 'Tester pack added to cart!');
                    // ✅ Redirect to cart page after adding to cart
                    if (data.redirect_url) {
                        console.log("Redirecting to:", data.redirect_url);
                        window.location.href = data.redirect_url;
                    } else {
                        console.log("No redirect_url in response");
                    }
                } else if (data.redirect_url) {
                    window.location.href = data.redirect_url;
                }
            } else {
                alert(data.message || 'Something went wrong. Please try again.');
            }
        })
        .catch(err => {
            console.error('Error:', err);
            alert('Error processing your request. Please try again later.');
        });
}
});