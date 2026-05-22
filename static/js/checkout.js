// --- Brooks Checkout Script, updated for Shipping Validation & Payment Selection ---
document.addEventListener('DOMContentLoaded', function () {
  // --- Initialize all DOM elements first ---
  const steps = document.querySelectorAll('.step');
  const continueButtons = document.querySelectorAll('.btn-continue');
  const shippingForm = document.getElementById('shippingForm');
  const continueShippingBtn = document.getElementById('continueShipping');
  const errorMsg = document.getElementById('form-error-message');
  const continuePaymentBtn = document.getElementById('continuePayment');
  const paymentMethodInput = document.getElementById('paymentMethodInput');
  const placeOrderBtn = document.querySelector('.btn-place-order');
  const agreeTerms = document.getElementById('agreeTerms');
  const requiredFields = ['firstName', 'lastName', 'address1', 'email', 'phone', 'city', 'state', 'zip'];
  let selectedPayment = null;

  // --- Step Navigation ---
  steps.forEach((step, index) => {
    if (index === 0) {
      step.classList.add('active');
      setTimeout(() => {
        step.style.maxHeight = step.scrollHeight + 'px';
      }, 10);
    } else {
      step.classList.remove('active');
      step.style.maxHeight = '0';
    }
  });

  continueButtons.forEach(button => {
    button.addEventListener('click', function () {
      const nextStep = this.getAttribute('data-next');
      if (nextStep) {
        const currentStep = document.querySelector('.step.active');
        switchSteps(currentStep, nextStep);
      }
    });
  });

  function switchSteps(currentStepElement, nextStepNum) {
    const nextStepElement = document.querySelector(`.step[data-step="${nextStepNum}"]`);
    if (!nextStepElement) return;

    if (currentStepElement) {
      currentStepElement.style.maxHeight = currentStepElement.scrollHeight + 'px';
      void currentStepElement.offsetHeight;
      currentStepElement.classList.remove('active');
      currentStepElement.style.maxHeight = '0';
    }

    nextStepElement.classList.add('active');
    nextStepElement.style.maxHeight = nextStepElement.scrollHeight + 'px';

    setTimeout(() => {
      if (currentStepElement) currentStepElement.style.maxHeight = '';
      nextStepElement.style.maxHeight = '';
      nextStepElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      updateVerticalStepper();
    }, 400);
  }

  // --- Price & Quantity Logic ---
  function formatPrice(num) {
    return "Rs " + num.toLocaleString();
  }

  function updateCartTotals() {
    const quantityInput = document.querySelector('.quantity-input');
    const displayQuantity = document.getElementById('display-quantity');
    const priceElement = document.getElementById('price');

    if (!quantityInput || !priceElement) return;

    const quantity = parseInt(quantityInput.value) || 0;
    const price = parseFloat(priceElement.textContent.replace(/[^0-9.]/g, '')) || 0;

    if (displayQuantity) {
      displayQuantity.textContent = quantity;
    }

    const subtotal = quantity * price;

    document.querySelectorAll('.price-dynamic').forEach(el => {
      el.textContent = formatPrice(subtotal);
    });

    const hiddenSubtotalInput = document.getElementById('subtotal-value');
    if (hiddenSubtotalInput) hiddenSubtotalInput.value = subtotal;

    const hiddenQuantityInput = document.getElementById('product_quantity');
    if (hiddenQuantityInput) hiddenQuantityInput.value = quantity;

    // Disable or enable Continue to Payment based on subtotal
    if (continuePaymentBtn) {
      continuePaymentBtn.disabled = subtotal <= 0 || quantity <= 0;
    }
    
    // Update place order button state whenever cart changes
    validatePlaceOrderButton();
  }

  document.querySelectorAll('.quantity-btn').forEach(button => {
    button.addEventListener('click', function () {
      const input = this.parentElement.querySelector('.quantity-input');
      let value = parseInt(input.value) || 1;
      const max = parseInt(input.getAttribute('max')) || 99;

      if (this.classList.contains('minus') && value > 1) {
        input.value = value - 1;
      } else if (this.classList.contains('plus') && value < max) {
        input.value = value + 1;
      }

      updateCartTotals();
    });
  });

  document.querySelectorAll('.quantity-input').forEach(input => {
    input.addEventListener('change', function () {
      const max = parseInt(this.getAttribute('max')) || 99;
      let value = parseInt(this.value) || 1;
      value = Math.min(Math.max(value, 1), max);
      this.value = value;
      updateCartTotals();
    });
  });

  document.querySelectorAll('.delete-btn').forEach(button => {
    button.addEventListener('click', function () {
      const itemIndex = this.getAttribute('data-index');
      if (itemIndex !== null) {
        // For cart items, send POST to remove from session
        const formData = new FormData();
        formData.append('item_index', itemIndex);

        fetch('/checkout/remove', {
          method: 'POST',
          body: formData
        })
        .then(response => {
          if (response.ok) {
            // Remove from DOM and reload to update totals
            const item = this.closest('.item');
            if (item) {
              item.style.animation = 'fadeOut 0.3s ease';
              setTimeout(() => {
                item.remove();
                location.reload(); // Reload to update cart totals and display
              }, 300);
            }
          } else {
            alert('Failed to remove item. Please try again.');
          }
        })
        .catch(error => {
          console.error('Error removing item:', error);
          alert('Error removing item. Please try again.');
        });
      } else {
        // Fallback for single item checkout (original behavior)
        const item = this.closest('.item');
        if (!item) return;

        item.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
          item.remove();
          updateCartTotals();

          const remainingItems = document.querySelectorAll('.item');
          const priceElement = document.getElementById('price');

          if (remainingItems.length === 0) {
            // Reset values
            document.getElementById('display-quantity').textContent = '0';
            document.getElementById('product_quantity').value = '0';
            document.getElementById('subtotal-value').value = '0';

            // Update visible prices
            document.querySelectorAll('.price-dynamic').forEach(el => el.textContent = 'Rs 0');
            const summarySubtotal = document.getElementById('summary-subtotal');
            if (summarySubtotal) summarySubtotal.textContent = 'Rs 0';

            // Clear the price value
            if (priceElement) priceElement.textContent = '';

            // Disable buttons
            if (continuePaymentBtn) continuePaymentBtn.disabled = true;
            if (continueShippingBtn) continueShippingBtn.disabled = true;

            // Disable all shipping form inputs and selects
            const allFormInputs = document.querySelectorAll('#shippingForm input, #shippingForm select');
            allFormInputs.forEach(input => input.disabled = true);
          }
        }, 300);
      }
    });
  });

  // --- Shipping Option ---
  document.querySelectorAll('.shipping-option').forEach(option => {
    option.addEventListener('click', function () {
      document.querySelectorAll('.shipping-option').forEach(opt => opt.classList.remove('selected'));
      this.classList.add('selected');
      const radioInput = this.querySelector('input');
      if (radioInput) radioInput.checked = true;
    });
  });

  // --- Payment Selection ---
  const paymentCards = document.querySelectorAll('.payment-method-card:not(.disabled)');

  paymentCards.forEach(card => {
    card.classList.remove('active');
    card.addEventListener('click', function () {
      paymentCards.forEach(c => c.classList.remove('active'));
      this.classList.add('active');
      selectedPayment = this.querySelector('.payment-method-title')?.innerText.trim() || '';
      if (paymentMethodInput) paymentMethodInput.value = selectedPayment;
      if (continuePaymentBtn) continuePaymentBtn.disabled = false;
    });
  });

  if (continuePaymentBtn) continuePaymentBtn.disabled = true;

  // --- Shipping Form Validation ---
  function validateFormFields() {
    let valid = true;
    requiredFields.forEach(id => {
      const field = document.getElementById(id);
      if (field) {
        field.style.borderColor = '#ddd';
        if (!field.value || (field.tagName === 'SELECT' && field.value === '')) valid = false;
        if (id === 'email' && field.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value)) valid = false;
      }
    });
    return valid;
  }

  function checkShippingFields() {
    const isFormValid = validateFormFields();
    const quantity = parseInt(document.getElementById('product_quantity')?.value || '0');
    const subtotal = parseFloat(document.getElementById('subtotal-value')?.value || '0');

    // If cart is empty (subtotal or quantity is 0), do not enable the button
    if (continueShippingBtn) {
      continueShippingBtn.disabled = !(isFormValid && quantity > 0 && subtotal > 0);
    }
    
    return isFormValid;
  }

  if (shippingForm) {
    requiredFields.forEach(id => {
      const field = document.getElementById(id);
      if (field) {
        field.addEventListener('input', function () {
          checkShippingFields();
          validatePlaceOrderButton();
          if (field.value) field.style.borderColor = '#ddd';
        });
        if (field.tagName === 'SELECT') {
          field.addEventListener('change', function() {
            checkShippingFields();
            validatePlaceOrderButton();
          });
        }
      }
    });
  }

  if (continueShippingBtn && errorMsg) {
    continueShippingBtn.addEventListener('click', function () {
      let valid = true;
      errorMsg.style.display = 'none';
      errorMsg.textContent = '';

      requiredFields.forEach(id => {
        const field = document.getElementById(id);
        if (field) {
          field.style.borderColor = '#ddd';
          if (!field.value || (field.tagName === 'SELECT' && field.value === '')) {
            valid = false;
            field.style.borderColor = '#b00020';
          }
          if (id === 'email' && field.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value)) {
            valid = false;
            field.style.borderColor = '#b00020';
            errorMsg.textContent = 'Please enter a valid email address.';
            errorMsg.style.display = 'block';
          }
        }
      });

      if (!valid) {
        if (!errorMsg.textContent) {
          errorMsg.textContent = 'Please fill all the required fields.';
          errorMsg.style.display = 'block';
        }
        return;
      }

      fillReviewShipping();
      const currentStepElement = document.querySelector('.step.active');
      const nextStep = continueShippingBtn.getAttribute('data-next');
      if (nextStep) switchSteps(currentStepElement, nextStep);
    });
  }

  // --- Place Order Validation ---
  function validatePlaceOrderButton() {
    if (!placeOrderBtn) return;
    
    const isTermsChecked = agreeTerms ? agreeTerms.checked : false;
    const isFormValid = validateFormFields(); // Use the separate validation function
    const quantity = parseInt(document.getElementById('product_quantity')?.value || '0');
    const subtotal = parseFloat(document.getElementById('subtotal-value')?.value || '0');
    
    // Disable if terms not checked or form not valid or cart empty
    placeOrderBtn.disabled = !isTermsChecked || !isFormValid || quantity <= 0 || subtotal <= 0;
  }
  
  // Add event listeners for terms checkbox and form changes
  if (agreeTerms) {
    agreeTerms.addEventListener('change', validatePlaceOrderButton);
  }
  
  // Prevent form submission on Enter unless valid
  if (shippingForm) {
    shippingForm.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        // Only allow submission if button is not disabled
        if (placeOrderBtn && !placeOrderBtn.disabled) {
          placeOrderBtn.click();
        }
      }
    });
  }
  
  if (placeOrderBtn) {
    placeOrderBtn.addEventListener('click', function(e) {
      // Double-check validation before submission
      validatePlaceOrderButton();
      
      if (placeOrderBtn.disabled) {
        e.preventDefault();
        if (agreeTerms && !agreeTerms.checked) {
          alert('Please agree to the Terms of Service and Privacy Policy');
        } else {
          alert('Please complete all required fields and ensure your cart is not empty');
        }
        return;
      }
      
      if (shippingForm) {
        shippingForm.submit();
      }
    });
  }

  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      const stepToShow = this.getAttribute('data-step');
      if (!stepToShow) return;
      const currentStepElement = document.querySelector('.step.active');
      switchSteps(currentStepElement, stepToShow);
    });
  });

  function updateVerticalStepper() {
    const currentStep = document.querySelector('.step.active')?.getAttribute('data-step');
    const stepperSteps = document.querySelectorAll('.stepper-step');
    const stepperLines = document.querySelectorAll('.stepper-line');

    stepperSteps.forEach((stepper, index) => {
      const stepNum = stepper.getAttribute('data-step');
      stepper.classList.remove('active', 'completed');

      if (stepNum === currentStep) {
        stepper.classList.add('active');
        if (index > 0) stepperLines[index - 1].style.background = '#222';
      } else if (parseInt(stepNum) < parseInt(currentStep)) {
        stepper.classList.add('completed');
        if (index > 0) stepperLines[index - 1].style.background = '#222';
      } else {
        if (index > 0) stepperLines[index - 1].style.background = '#eee';
      }
    });
  }

  document.querySelectorAll('.stepper-step').forEach(step => {
    step.addEventListener('click', function () {
      const stepToShow = this.getAttribute('data-step');
      if (!stepToShow) return;
      const currentStepElement = document.querySelector('.step.active');
      switchSteps(currentStepElement, stepToShow);
    });
  });

  function fillReviewShipping() {
    const firstName = document.getElementById('firstName')?.value.trim() || '';
    const lastName = document.getElementById('lastName')?.value.trim() || '';
    const address1 = document.getElementById('address1')?.value.trim() || '';
    const city = document.getElementById('city')?.value.trim() || '';
    const state = document.getElementById('state')?.value.trim() || '';
    const zip = document.getElementById('zip')?.value.trim() || '';
    const phone = document.getElementById('phone')?.value.trim() || '';
    const email = document.getElementById('email')?.value.trim() || '';

    const info = `${firstName} ${lastName}<br>${address1}<br>${city}, ${state} ${zip}<br>Phone: ${phone}<br>Email: ${email}<br>Pakistan`;
    const reviewInfo = document.getElementById('review-shipping-info');
    if (reviewInfo) reviewInfo.innerHTML = info;
  }

  if (continuePaymentBtn) {
    continuePaymentBtn.addEventListener('click', function () {
      const reviewPayment = document.getElementById('review-payment-info');
      if (reviewPayment) {
        reviewPayment.textContent = selectedPayment || 'Not selected';
      }
    });
  }
  
  // Initial validation and setup
  updateCartTotals();
  updateVerticalStepper();
  validatePlaceOrderButton();
});