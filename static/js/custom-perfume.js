// FontAwesome icons
window.addEventListener('DOMContentLoaded', function () {
    // ✅ Get fragrance options from database (passed from Flask)
    const fragranceOptionsFromDB = fragranceOptions.map((f, index) => ({
        value: f.ID,
        text: `${f.ID} | ${f.name || "Unnamed"}`
    }));
    
    // Initialize price updates for static template
    document.querySelectorAll('.perfume-box').forEach(function(box) {
        const dropdowns = box.querySelectorAll('.custom-dropdown');
        dropdowns.forEach(function(dropdown) {
            const options = dropdown.querySelectorAll('.custom-dropdown-list-option');
            options.forEach(function(option) {
                option.addEventListener('click', function() {
                    setTimeout(() => updatePrice(box), 10);
                });
            });
        });
    });
    
    // Initialize total price on page load
    updateTotalPrice();
});

// FontAwesome icons
window.addEventListener('DOMContentLoaded', function() {
    // ✅ Get fragrance options from database instead of hardcoded
    const fragranceOptionsFromDB = fragranceOptions.map((f, index) => ({
        value: f.ID,
        text: `${f.ID} | ${f.name || "Unnamed"}`
    }));
    
    const sizeOptions = [
        { value: '30ml', text: '30ml' },
        { value: '50ml', text: '50ml' },
        { value: '100ml', text: '100ml' }
    ];

    // ✅ Function to get bottle images from database based on size
    function getBottleImagesForSize(selectedSize) {
        if (!bottleImages || bottleImages.length === 0) {
            return []; // Return empty if no bottle data
        }
        
        const sizeKey = selectedSize.replace('ml', ''); // '100ml' -> '100'
        const images = bottleImages[0].images[sizeKey] || [];
        console.log(`Getting bottle images for ${selectedSize}:`, images);
        return images;
    }

    // ✅ Function to update bottle options when size changes
    function updateBottleOptions(boxElement, selectedSize) {
        const bottleRow = boxElement.querySelector('.bottle-row');
        if (!bottleRow) return;

        const images = getBottleImagesForSize(selectedSize);
        bottleRow.innerHTML = ''; // Clear existing bottles

        if (images.length > 0) {
            // Use database images
            images.forEach((imagePath, idx) => {
                const option = document.createElement('div');
                option.className = 'bottle-option' + (idx === 0 ? ' selected' : '');
                option.setAttribute('data-bottle', idx);

                const imgWrap = document.createElement('div');
                imgWrap.className = 'bottle-img-wrap';

                const img = document.createElement('img');
                img.src = `/${imagePath}`;
                img.alt = `Bottle ${idx + 1}`;
                img.onerror = function() {
                    console.log('Image failed to load:', this.src);
                    this.src = '/static/images/default-bottle.png';
                };

                imgWrap.appendChild(img);
                option.appendChild(imgWrap);
                bottleRow.appendChild(option);

                // Add click handler for bottle selection
                option.addEventListener('click', function () {
                    bottleRow.querySelectorAll('.bottle-option').forEach(o => o.classList.remove('selected'));
                    this.classList.add('selected');
                    updateSelectedBottlePreview();
                });
            });
        } else {
            // Fallback to default bottles if no database images
            const defaultBottles = [
                '3(2).png', '3(3).png', '5(2).png', '5(3).png', 
                '5(4).png', '6(2).png', '6(3).png', '6(5).png', '7(1).png'
            ];

            defaultBottles.forEach((src, idx) => {
                const option = document.createElement('div');
                option.className = 'bottle-option' + (idx === 0 ? ' selected' : '');
                option.setAttribute('data-bottle', idx);

                const imgWrap = document.createElement('div');
                imgWrap.className = 'bottle-img-wrap';

                const img = document.createElement('img');
                img.src = src;
                img.alt = `Bottle ${idx + 1}`;

                imgWrap.appendChild(img);
                option.appendChild(imgWrap);
                bottleRow.appendChild(option);

                // Add click handler for bottle selection
                option.addEventListener('click', function () {
                    bottleRow.querySelectorAll('.bottle-option').forEach(o => o.classList.remove('selected'));
                    this.classList.add('selected');
                    updateSelectedBottlePreview();
                });
            });
        }

        // Re-initialize slider after updating bottles
        initializeBottleSlider(boxElement);
    }
    
    function createCustomDropdown(options, id) {
        const dropdown = document.createElement('div');
        dropdown.className = 'custom-dropdown';
        dropdown.tabIndex = 0;
        dropdown.id = id;
        
        // ✅ Add data-type attribute for proper selection
        dropdown.setAttribute('data-type', id.includes('fragrance') ? 'fragrance' : 'size');

        // Start with no selection by default
        let selectedValue = null;
        let selectedText = id.includes('fragrance') ? 'Select' : 'Select';

        // Create selected element - input for fragrance, div for others
        let selected;
        if (id.includes('fragrance')) {
            selected = document.createElement('input');
            selected.type = 'text';
            selected.className = 'custom-dropdown-selected';
            selected.value = selectedText;
            selected.placeholder = selectedText;
        } else {
            selected = document.createElement('div');
            selected.className = 'custom-dropdown-selected';
            selected.textContent = selectedText;
            selected.tabIndex = 0;
        }
        dropdown.appendChild(selected);

        const list = document.createElement('div');
        list.className = 'custom-dropdown-list';
        
        // ✅ Increase size for fragrance dropdown only
        if (id.includes('fragrance')) {
            list.style.width = '260px';
            list.style.maxHeight = '250px';
            list.style.overflow = 'auto';
            list.style.display = 'block';
            list.style.position = 'absolute';
            list.style.zIndex = '1000';
            list.style.backgroundColor = '#fff';
            list.style.border = '1px solid #ddd';
            list.style.borderRadius = '4px';
            dropdown.style.width = '260px';
            selected.style.width = '260px';
        }
        
        options.forEach(opt => {
            const optionDiv = document.createElement('div');
            optionDiv.className = 'custom-dropdown-list-option';
            optionDiv.textContent = opt.text;
            optionDiv.dataset.value = opt.value;
            optionDiv.onclick = function (e) {
                selectedValue = opt.value;
                selectedText = opt.text;
                if (id.includes('fragrance')) {
                    selected.value = selectedText;
                    selected.placeholder = selectedText;
                } else {
                    selected.textContent = selectedText;
                }
                dropdown.classList.remove('open');
                dropdown.setAttribute('data-value', selectedValue);

                // Update price when dropdown value changes
                const perfumeBox = dropdown.closest('.perfume-box');
                if (perfumeBox) {
                    updatePrice(perfumeBox);
                    
                    // ✅ Update bottle options if this is a size dropdown
                    if (id.includes('sizeDropdown')) {
                        updateBottleOptions(perfumeBox, selectedValue);
                    }
                }
            };
            list.appendChild(optionDiv);
        });
        dropdown.appendChild(list);

        // Set the data-value attribute to null initially
        dropdown.setAttribute('data-value', selectedValue || 'null');

        // Add search functionality for fragrance dropdowns only
        if (id.includes('fragrance')) {
            selected.addEventListener('input', function() {
                const searchTerm = this.value.toLowerCase();
                const optionDivs = list.querySelectorAll('.custom-dropdown-list-option');
                
                optionDivs.forEach(optionDiv => {
                    const text = optionDiv.textContent.toLowerCase();
                    if (text.includes(searchTerm)) {
                        optionDiv.style.display = 'block';
                    } else {
                        optionDiv.style.display = 'none';
                    }
                });
                
                // Open dropdown when typing
                dropdown.classList.add('open');
            });
            
            selected.onclick = function (e) {
                dropdown.classList.toggle('open');
                if (dropdown.classList.contains('open')) {
                    // Reset search filter when opening
                    const optionDivs = list.querySelectorAll('.custom-dropdown-list-option');
                    optionDivs.forEach(optionDiv => {
                        optionDiv.style.display = 'block';
                    });
                }
            };
            
            selected.onfocus = function (e) {
                dropdown.classList.add('open');
            };
            
            selected.onkeydown = function (e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    dropdown.classList.toggle('open');
                } else if (e.key === 'Escape') {
                    dropdown.classList.remove('open');
                    this.blur();
                }
            };
        } else {
            // Regular dropdown behavior for non-fragrance dropdowns
            selected.onclick = function (e) {
                dropdown.classList.toggle('open');
            };
            selected.onkeydown = function (e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    dropdown.classList.toggle('open');
                    e.preventDefault();
                }
            };
        }
        document.addEventListener('click', function (e) {
            if (!dropdown.contains(e.target)) {
                dropdown.classList.remove('open');
            }
        });

        return dropdown;
    }

    // Function to calculate and update price
    function updatePrice(boxElement) {
        const fragranceDropdown = boxElement.querySelector('.custom-dropdown');
        const sizeDropdown = boxElement.querySelectorAll('.custom-dropdown')[1];
        const priceElement = boxElement.querySelector('.mini-price');
        
        if (!fragranceDropdown || !sizeDropdown || !priceElement) return;
        
        const fragranceId = fragranceDropdown.getAttribute('data-value');
        const size = sizeDropdown.getAttribute('data-value');
        
        // Only show price if fragrance is selected
        const fragranceSelectedElement = fragranceDropdown.querySelector('.custom-dropdown-selected');
        const fragranceText = fragranceSelectedElement.value || fragranceSelectedElement.textContent || '';
        
        if (fragranceId && 
            fragranceId !== 'null' &&
            !fragranceText.includes('Select')) {
            
            // Find the selected fragrance in fragranceOptions
            const selectedFragrance = fragranceOptions.find(f => f.ID == fragranceId);
            
            if (selectedFragrance && selectedFragrance.price) {
                let price = selectedFragrance.price;
                
                // Adjust price based on bottle size (reduction from 100ml base price)
                if (size && size !== 'null') {
                    if (size === '30ml') {
                        price = price - (price * 0.70); // Minus 70% from 100ml price (30% remaining)
                    } else if (size === '50ml') {
                        price = price - (price * 0.50); // Minus 50% from 100ml price (50% remaining)
                    }
                    // 100ml keeps original price (no reduction)
                }
                
                // Round to nearest whole number and format
                price = Math.round(price);
                priceElement.textContent = `Rs. ${price.toLocaleString()}`;
            } else {
                priceElement.textContent = '—';
            }
        } else {
            priceElement.textContent = '—';
        }
        
        // Update total price after individual box price update
        updateTotalPrice();
    }

    // ✅ Move updateTotalPrice outside event listeners to make it globally available
    function updateTotalPrice() {
        let totalPrice = 0;
        const allPriceElements = document.querySelectorAll('.mini-price');
        
        allPriceElements.forEach(priceElement => {
            const priceText = priceElement.textContent;
            if (priceText && priceText !== '—' && priceText.includes('Rs.')) {
                const price = parseInt(priceText.replace('Rs. ', '').replace(',', ''));
                if (!isNaN(price)) {
                    totalPrice += price;
                }
            }
        });
        
        // Update the product-price element
        const productPriceElement = document.querySelector('.product-price');
        if (productPriceElement) {
            if (totalPrice > 0) {
                productPriceElement.textContent = `Rs. ${totalPrice.toLocaleString()}`;
            } else {
                productPriceElement.textContent = 'Rs. 0';
            }
        }
    }    // --- Dynamic Perfume Boxes ---
    const perfumeBoxesContainer = document.getElementById('perfumeBoxes');

    function renderPerfumeBoxes() {
        const quantity = parseInt(document.getElementById('quantity').value, 10) || 1;

        // Save existing selections before clearing
        const existingSelections = [];
        const existingBoxes = perfumeBoxesContainer.querySelectorAll('.perfume-box');
        existingBoxes.forEach((box, index) => {
            const fragranceDropdown = box.querySelector('.custom-dropdown');
            const sizeDropdown = box.querySelectorAll('.custom-dropdown')[1];
            const fragranceSelectedElement = fragranceDropdown ? fragranceDropdown.querySelector('.custom-dropdown-selected') : null;
            const sizeSelectedElement = sizeDropdown ? sizeDropdown.querySelector('.custom-dropdown-selected') : null;
            
            existingSelections[index] = {
                fragrance: fragranceDropdown ? fragranceDropdown.getAttribute('data-value') : null,
                fragranceText: fragranceSelectedElement ? (fragranceSelectedElement.value || fragranceSelectedElement.textContent) : null,
                size: sizeDropdown ? sizeDropdown.getAttribute('data-value') : null,
                sizeText: sizeSelectedElement ? (sizeSelectedElement.value || sizeSelectedElement.textContent) : null
            };
        });

        perfumeBoxesContainer.innerHTML = '';
        for (let i = 1; i <= quantity; i++) {
            const boxDiv = document.createElement('div');
            boxDiv.className = 'perfume-box';
            boxDiv.style.marginBottom = '24px';
            boxDiv.style.opacity = '0';
            boxDiv.style.transform = 'translateY(20px)';
            boxDiv.style.transition = 'opacity 0.5s cubic-bezier(0.4,0,0.2,1), transform 0.5s cubic-bezier(0.4,0,0.2,1)';
            setTimeout(() => {
                boxDiv.style.opacity = '1';
                boxDiv.style.transform = 'translateY(0)';
            }, 10);

            // Heading only if quantity > 1
            if (quantity > 1) {
                const boxHeading = document.createElement('h4');
                boxHeading.textContent = `Perfume ${i}`;
                boxHeading.style.marginBottom = '8px';
                boxDiv.appendChild(boxHeading);
            }

            // Controls row (fragrance and size in one row)
            const controlsRow = document.createElement('div');
            controlsRow.className = 'perfume-controls-row';

            // Fragrance dropdown container
            const fragranceContainer = document.createElement('div');
            fragranceContainer.className = 'fragrance-container';
            const fragranceLabel = document.createElement('label');
            fragranceLabel.className = 'form-label';
            fragranceLabel.textContent = 'Fragrance';
            fragranceLabel.setAttribute('for', `fragranceDropdown${i}`);
            fragranceContainer.appendChild(fragranceLabel);
            // ✅ Use database fragrances instead of hardcoded
            const fragranceDropdown = createCustomDropdown(fragranceOptionsFromDB, `fragranceDropdown${i}`);
            fragranceDropdown.classList.add('fragrance-dropdown');
            fragranceContainer.appendChild(fragranceDropdown);
            controlsRow.appendChild(fragranceContainer);

            // Size dropdown container
            const sizeContainer = document.createElement('div');
            sizeContainer.className = 'bottle-size-container';
            const sizeLabel = document.createElement('label');
            sizeLabel.className = 'form-label';
            sizeLabel.textContent = 'Bottle Size';
            sizeLabel.setAttribute('for', `sizeDropdown${i}`);
            sizeContainer.appendChild(sizeLabel);
            const sizeDropdown = createCustomDropdown(sizeOptions, `sizeDropdown${i}`);
            sizeDropdown.classList.add('size-dropdown');
            sizeContainer.appendChild(sizeDropdown);
            controlsRow.appendChild(sizeContainer);

            // Price section container
            const priceContainer = document.createElement('div');
            priceContainer.className = 'price-section';
            const priceLabel = document.createElement('label');
            priceLabel.className = 'form-label';
            priceLabel.textContent = 'Price';
            priceContainer.appendChild(priceLabel);
            const priceElement = document.createElement('div');
            priceElement.className = 'mini-price';
            priceElement.textContent = '—';
            priceContainer.appendChild(priceElement);
            controlsRow.appendChild(priceContainer);

            boxDiv.appendChild(controlsRow);

            // Restore previous selections if they exist
            const savedSelection = existingSelections[i - 1];
            if (savedSelection) {
                if (savedSelection.fragrance && savedSelection.fragranceText) {
                    fragranceDropdown.setAttribute('data-value', savedSelection.fragrance);
                    fragranceDropdown.querySelector('.custom-dropdown-selected').textContent = savedSelection.fragranceText;
                }
                if (savedSelection.size && savedSelection.sizeText) {
                    sizeDropdown.setAttribute('data-value', savedSelection.size);
                    sizeDropdown.querySelector('.custom-dropdown-selected').textContent = savedSelection.sizeText;
                }
                // Update price after restoring selections
                setTimeout(() => updatePrice(boxDiv), 50);
            }

            // Bottle style with slider (using the HTML structure from your original code)
            const bottleStyleLabel = document.createElement('label');
            bottleStyleLabel.className = 'form-label';
            bottleStyleLabel.textContent = 'Bottle Style';
            boxDiv.appendChild(bottleStyleLabel);

            // Create slider container
            const bottleSliderContainer = document.createElement('div');
            bottleSliderContainer.className = 'bottle-slider-container';

            // Previous button
            const prevBtn = document.createElement('button');
            prevBtn.className = 'bottle-nav-btn bottle-nav-prev';
            prevBtn.type = 'button';
            prevBtn.innerHTML = '‹';
            bottleSliderContainer.appendChild(prevBtn);

            // Slider wrapper
            const bottleSlider = document.createElement('div');
            bottleSlider.className = 'bottle-slider';

            const bottleRow = document.createElement('div');
            bottleRow.className = 'bottle-row';

            // ✅ Initialize with default size (100ml) bottles from database
            const defaultSize = '100ml';
            sizeDropdown.setAttribute('data-value', defaultSize);
            sizeDropdown.querySelector('.custom-dropdown-selected').textContent = defaultSize;

            bottleSlider.appendChild(bottleRow);
            bottleSliderContainer.appendChild(bottleSlider);

            // Next button
            const nextBtn = document.createElement('button');
            nextBtn.className = 'bottle-nav-btn bottle-nav-next';
            nextBtn.type = 'button';
            nextBtn.innerHTML = '›';
            bottleSliderContainer.appendChild(nextBtn);

            boxDiv.appendChild(bottleSliderContainer);

            // ✅ Update bottles based on default size
            updateBottleOptions(boxDiv, defaultSize);

            // Store slider elements for later use
            boxDiv.setAttribute('data-prev-btn', prevBtn);
            boxDiv.setAttribute('data-next-btn', nextBtn);
            boxDiv.setAttribute('data-bottle-row', bottleRow);
            perfumeBoxesContainer.appendChild(boxDiv);

            // Add event listeners for bottle selection
            updateBottleSelection(bottleRow);

            // Add underline except after last
            if (i < quantity) {
                const hr = document.createElement('hr');
                hr.style.width = '90%';
                hr.style.margin = '18px auto';
                hr.style.border = 'none';
                hr.style.borderTop = '2px solid #eee';
                perfumeBoxesContainer.appendChild(hr);
            }
        }

        // Update the preview after rendering all boxes
        updateSelectedBottlePreview();
        
        // Update total price after rendering
        setTimeout(() => updateTotalPrice(), 100);
    }

    // Initial render
    renderPerfumeBoxes();

    // Update on quantity change
    document.getElementById('quantity').addEventListener('input', function () {
        if (parseInt(this.value) < 1) this.value = 1;
        renderPerfumeBoxes();
    });

    document.getElementById('decreaseQty').onclick = function () {
        let val = parseInt(document.getElementById('quantity').value);
        if (val > 1) document.getElementById('quantity').value = val - 1;
        renderPerfumeBoxes();
    };

    document.getElementById('increaseQty').onclick = function () {
        let val = parseInt(document.getElementById('quantity').value);
        document.getElementById('quantity').value = val + 1;
        renderPerfumeBoxes();
    };

    // ✅ Function to initialize bottle slider
    function initializeBottleSlider(boxElement) {
        const bottleRow = boxElement.querySelector('.bottle-row');
        const prevBtn = boxElement.querySelector('.bottle-nav-prev');
        const nextBtn = boxElement.querySelector('.bottle-nav-next');
        
        if (!bottleRow || !prevBtn || !nextBtn) return;

        let currentSlide = 0;
        const visibleItems = 4;
        const bottleOptions = bottleRow.querySelectorAll('.bottle-option');
        const totalItems = bottleOptions.length;
        const maxSlide = Math.max(0, totalItems - visibleItems);

        function updateSliderPosition() {
            const bottleWidth = 110; // width of each bottle option
            const gap = 15; // gap between bottles
            const translateX = -(currentSlide * (bottleWidth + gap));
            bottleRow.style.transform = `translateX(${translateX}px)`;

            // Update button states
            prevBtn.disabled = currentSlide === 0;
            nextBtn.disabled = currentSlide >= maxSlide;

            // Update button opacity for better visual feedback
            prevBtn.style.opacity = currentSlide === 0 ? '0.3' : '1';
            nextBtn.style.opacity = currentSlide >= maxSlide ? '0.3' : '1';
        }

        // Remove existing event listeners to prevent duplicates
        prevBtn.onclick = null;
        nextBtn.onclick = null;

        prevBtn.onclick = function () {
            if (currentSlide > 0) {
                currentSlide--;
                updateSliderPosition();
            }
        };

        nextBtn.onclick = function () {
            if (currentSlide < maxSlide) {
                currentSlide++;
                updateSliderPosition();
            }
        };

        // Initialize slider
        updateSliderPosition();
    }

    // --- Bottle Style Selection ---
    function updateBottleSelection(parent) {
        const bottleOptions = parent.querySelectorAll('.bottle-option');
        bottleOptions.forEach(option => {
            option.addEventListener('click', function () {
                bottleOptions.forEach(o => o.classList.remove('selected'));
                this.classList.add('selected');
                updateSelectedBottlePreview();
            });
        });
    }

    // Initialize bottle selection for the initial HTML content
    document.querySelectorAll('.bottle-row').forEach(updateBottleSelection);

    // Initialize slider for static HTML template
    function initializeStaticSlider() {
        const staticSliderContainer = document.querySelector('.bottle-slider-container');
        if (!staticSliderContainer) return;

        const bottleRow = staticSliderContainer.querySelector('.bottle-row');
        const prevBtn = staticSliderContainer.querySelector('.bottle-nav-prev');
        const nextBtn = staticSliderContainer.querySelector('.bottle-nav-next');
        const bottleOptions = bottleRow.querySelectorAll('.bottle-option');

        // FIXED STATIC SLIDER FUNCTIONALITY
        let currentSlide = 0;
        const visibleItems = 4;
        const totalItems = bottleOptions.length;
        const maxSlide = Math.max(0, totalItems - visibleItems);

        function updateSliderPosition() {
            // Calculate the exact translation needed
            const bottleWidth = 110; // width of each bottle option
            const gap = 15; // gap between bottles
            const translateX = -(currentSlide * (bottleWidth + gap));
            bottleRow.style.transform = `translateX(${translateX}px)`;
            prevBtn.disabled = currentSlide === 0;
            nextBtn.disabled = currentSlide >= maxSlide;

            // Update button opacity for better visual feedback
            prevBtn.style.opacity = currentSlide === 0 ? '0.3' : '1';
            nextBtn.style.opacity = currentSlide >= maxSlide ? '0.3' : '1';
        }

        prevBtn.onclick = function () {
            if (currentSlide > 0) {
                currentSlide--;
                updateSliderPosition();
            }
        };

        nextBtn.onclick = function () {
            if (currentSlide < maxSlide) {
                currentSlide++;
                updateSliderPosition();
            }
        };

        // Initialize slider
        updateSliderPosition();
    }

    // Initialize static slider
    initializeStaticSlider();

    // Initialize price updates for static template
    document.querySelectorAll('.perfume-box').forEach(function (box) {
        const dropdowns = box.querySelectorAll('.custom-dropdown');
        dropdowns.forEach(function (dropdown) {
            const options = dropdown.querySelectorAll('.custom-dropdown-list-option');
            options.forEach(function (option) {
                option.addEventListener('click', function () {
                    setTimeout(() => updatePrice(box), 10);
                });
            });
        });
    });

    // --- Selected Bottle Preview in Left Section ---
    function updateSelectedBottlePreview() {
        const leftSection = document.querySelector('.left');
        if (!leftSection) return;
        let preview = document.getElementById('selectedBottlePreview');
        if (!preview) return;
        preview.innerHTML = '';
        const perfumeBoxes = document.querySelectorAll('.perfume-box');
        let rowDiv = null;
        perfumeBoxes.forEach((box, idx) => {
            if (idx % 2 === 0) {
                rowDiv = document.createElement('div');
                rowDiv.style.display = 'flex';
                rowDiv.style.justifyContent = 'center';
                rowDiv.style.gap = '24px';
                rowDiv.style.marginBottom = '18px';
                preview.appendChild(rowDiv);
            }
            const selected = box.querySelector('.bottle-option.selected img');
            const bottleDiv = document.createElement('div');
            bottleDiv.style.display = 'flex';
            bottleDiv.style.flexDirection = 'column';
            bottleDiv.style.alignItems = 'center';
            bottleDiv.style.border = 'None';
            bottleDiv.style.borderRadius = '12px';
            bottleDiv.style.background = 'transparent';
            // bottleDiv.style.boxShadow = '0 2px 8px rgba(0,0,0,0.07)';
            bottleDiv.style.padding = '8px';
            bottleDiv.style.width = '150px';
            bottleDiv.style.minHeight = '150px';
            bottleDiv.style.opacity = '0';
            bottleDiv.style.transform = 'translateY(20px)';
            bottleDiv.style.transition = 'opacity 0.5s cubic-bezier(0.4,0,0.2,1), transform 0.5s cubic-bezier(0.4,0,0.2,1)';
            setTimeout(() => {
                bottleDiv.style.opacity = '1';
                bottleDiv.style.transform = 'translateY(0)';
            }, 10);
            const label = document.createElement('div');
            label.textContent = `Perfume ${idx + 1}`;
            label.style.fontWeight = 'bold';
            label.style.marginBottom = '6px';
            label.style.fontSize = '1rem';
            bottleDiv.appendChild(label);
            if (selected) {
                const img = document.createElement('img');
                img.src = selected.src;
                img.alt = selected.alt;
                img.style.width = '250px';
                img.style.height = '250px';
                img.style.objectFit = 'contain';
                img.style.borderRadius = '10px';
                // img.style.boxShadow = '0 1px 8px rgba(0,0,0,0.10)';
                img.style.background = 'transparent';

                bottleDiv.appendChild(img);
            }
            rowDiv.appendChild(bottleDiv);
        });
    }

    // Update preview on initial render and quantity change
    const originalRenderPerfumeBoxes = renderPerfumeBoxes;
    renderPerfumeBoxes = function () {
        originalRenderPerfumeBoxes();
        updateSelectedBottlePreview();
    };

    document.getElementById('quantity').addEventListener('input', function () {
        if (parseInt(this.value) < 1) this.value = 1;
        renderPerfumeBoxes();
        updateSelectedBottlePreview();
    });
    document.getElementById('decreaseQty').onclick = function () {
        let val = parseInt(document.getElementById('quantity').value);
        if (val > 1) document.getElementById('quantity').value = val - 1;
        renderPerfumeBoxes();
        updateSelectedBottlePreview();
    };
    document.getElementById('increaseQty').onclick = function () {
        let val = parseInt(document.getElementById('quantity').value);
        document.getElementById('quantity').value = val + 1;
        renderPerfumeBoxes();
        updateSelectedBottlePreview();
    };

    // --- Add to Cart and Buy Now ---
    document.getElementById('perfumeForm').onsubmit = function (e) {
        e.preventDefault();

        // Collect data from all perfume boxes
        let summary = "";
        const perfumeBoxes = document.querySelectorAll('.perfume-box');

        perfumeBoxes.forEach((box, index) => {
            const fragranceDropdown = box.querySelector('.custom-dropdown');
            const fragrance = fragranceDropdown ? fragranceDropdown.getAttribute('data-value') || "None" : "None";

            const sizeDropdown = box.querySelectorAll('.custom-dropdown')[1];
            const size = sizeDropdown ? sizeDropdown.getAttribute('data-value') || "None" : "None";

            const bottle = box.querySelector('.bottle-option.selected') ?
                box.querySelector('.bottle-option.selected').getAttribute('data-bottle') : "None";

            summary += `Perfume ${index + 1}:\nFragrance: ${fragrance}\nBottle Size: ${size}\nBottle: ${bottle}\n---\n`;
        });

    };

    document.querySelector('.buy-now-btn').onclick = function () {
        // Collect data from all perfume boxes
        let summary = "";
        const perfumeBoxes = document.querySelectorAll('.perfume-box');

        perfumeBoxes.forEach((box, index) => {
            const fragranceDropdown = box.querySelector('.custom-dropdown');
            const fragrance = fragranceDropdown ? fragranceDropdown.getAttribute('data-value') || "None" : "None";

            const sizeDropdown = box.querySelectorAll('.custom-dropdown')[1];
            const size = sizeDropdown ? sizeDropdown.getAttribute('data-value') || "None" : "None";

            const bottle = box.querySelector('.bottle-option.selected') ?
                box.querySelector('.bottle-option.selected').getAttribute('data-bottle') : "None";

            summary += `Perfume ${index + 1}:\nFragrance: ${fragrance}\nBottle Size: ${size}\nBottle: ${bottle}\n---\n`;
        });

    };
});

document.addEventListener('DOMContentLoaded', function () {
    const addToCartBtn = document.querySelector('.add-cart-btn');
    const buyNowBtn = document.querySelector('.buy-now-btn');

    // Helper: collect all form data
    function collectPerfumeData() {
        const perfumes = [];
        document.querySelectorAll('.perfume-box').forEach((box, index) => {
            const fragranceDropdown = box.querySelector('.fragrance-dropdown');
            const sizeDropdown = box.querySelector('.size-dropdown');
            const selectedBottle = box.querySelector('.bottle-option.selected img');

            // Get price and handle '—' case
            const priceText = box.querySelector('.mini-price')?.textContent?.replace('Rs. ', '').replace(',', '') || '0';
            const price = priceText === '—' ? '0' : priceText;

            perfumes.push({
                perfume_number: index + 1,
              
                fragrance_id: (() => {
                    const selectedText = fragranceDropdown?.querySelector('.custom-dropdown-selected')?.value || '';
                    const idMatch = selectedText.match(/^(\d+) \|/);
                    return idMatch ? idMatch[1] : fragranceDropdown?.getAttribute('data-value') || null;
                })(),
                fragrance_name: (() => {
                    const selectedText = fragranceDropdown?.querySelector('.custom-dropdown-selected')?.value || '';
                    const nameMatch = selectedText.match(/^\d+ \| (.+)$/);
                    return nameMatch ? nameMatch[1] : '';
                })(),
                size: sizeDropdown?.getAttribute('data-value') || '',
                bottle_image: selectedBottle?.src || '',
                price: price
            });
        });

        // Get total price and handle '—' case
        const totalPriceText = document.querySelector('.product-price')?.textContent?.replace('Rs. ', '').replace(',', '') || '0';
        const totalPrice = totalPriceText === '—' ? '0' : totalPriceText;

        return {
            total_quantity: document.getElementById('quantity').value,
            total_price: totalPrice,
            perfumes
        };
    }

    // --- ADD TO CART ---
    addToCartBtn.addEventListener('click', async function () {
        const data = collectPerfumeData();
        console.log("Sending to /custom/add-to-cart:", data);

        const response = await fetch('/custom/add-to-cart', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        });

        if (response.ok) {
            console.log("✅ Added to cart successfully");
        } else {
            console.error("❌ Failed to add to cart");
        }
    });

    // --- BUY NOW ---
    // --- BUY NOW ---
buyNowBtn.addEventListener('click', async function () {
    console.log("🔍 DEBUG: Buy Now button clicked");
    const data = collectPerfumeData();
    console.log("🔍 DEBUG: Collected perfume data:", data);
    console.log("Sending to /custom/buy-now:", data);

    // Clear any old session data by making a cleanup request first
    await fetch('/debug/clear-session', { method: 'GET' });
    
    const response = await fetch('/custom/buy-now', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    });

    console.log("🔍 DEBUG: Response status:", response.status);
    console.log("🔍 DEBUG: Response ok:", response.ok);

    if (response.ok) {
        const responseData = await response.json();
        console.log("🔍 DEBUG: Response data:", responseData);
        console.log("✅ Buy Now successful, redirecting to checkout");
        window.location.href = '/checkout'; // Redirect to checkout page
    } else {
        const errorData = await response.json();
        console.error("❌ Failed to process purchase:", errorData);
    }
});
});
