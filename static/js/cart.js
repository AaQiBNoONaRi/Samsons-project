// --- Brooks Checkout Script, updated for Shipping Validation & Payment Selection ---
document.addEventListener('DOMContentLoaded', function () {
  // Initialize steps
  const steps = document.querySelectorAll('.step');
  const continueButtons = document.querySelectorAll('.btn-continue');

  // Show only first step initially
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

  // Handle continue buttons with smooth transitions
  continueButtons.forEach(button => {
    button.addEventListener('click', function () {
      const nextStep = this.getAttribute('data-next');
      if (nextStep) {
        const currentStep = document.querySelector('.step.active');
        switchSteps(currentStep, nextStep);
      }
    });
  });

  // Smooth step switching function
  function switchSteps(currentStepElement, nextStepNum) {
    const nextStepElement = document.querySelector(`.step[data-step="${nextStepNum}"]`);
    if (!nextStepElement) return;

    // Start transition out for current step
    if (currentStepElement) {
      currentStepElement.style.maxHeight = currentStepElement.scrollHeight + 'px';
      void currentStepElement.offsetHeight;

      currentStepElement.classList.remove('active');
      currentStepElement.style.maxHeight = '0';
    }

    // Start transition in for next step
    nextStepElement.style.maxHeight = '0';
    nextStepElement.classList.add('active');
    nextStepElement.style.maxHeight = nextStepElement.scrollHeight + 'px';

    setTimeout(() => {
      if (currentStepElement) {
        currentStepElement.style.maxHeight = '';
      }
      nextStepElement.style.maxHeight = '';

      nextStepElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });

      updateVerticalStepper();
    }, 400);
  }

  // Quantity adjustment functionality
  document.querySelectorAll('.quantity-btn').forEach(button => {
    button.addEventListener('click', function () {
      const input = this.parentElement.querySelector('.quantity-input');
      let value = parseInt(input.value);

      if (this.classList.contains('minus') && value > 1) {
        input.value = value - 1;
      } else if (this.classList.contains('plus') && value < 99) {
        input.value = value + 1;
      }
      updateCartTotals();
    });
  });

  document.querySelectorAll('.quantity-input').forEach(input => {
    input.addEventListener('change', function () {
      if (this.value < 1) this.value = 1;
      if (this.value > 99) this.value = 99;
      updateCartTotals();
    });
  });

  document.querySelectorAll('.delete-btn').forEach(button => {
    button.addEventListener('click', function () {
      const item = this.closest('.item');
      item.style.animation = 'fadeOut 0.3s ease';

      setTimeout(() => {
        item.remove();
        updateCartTotals();
      }, 300);
    });
  });

  // Shipping option selection
  document.querySelectorAll('.shipping-option').forEach(option => {
    option.addEventListener('click', function () {
      document.querySelectorAll('.shipping-option').forEach(opt => {
        opt.classList.remove('selected');
      });
      this.classList.add('selected');
      const radioInput = this.querySelector('input');
      if (radioInput) radioInput.checked = true;
    });
  });

  // --- PAYMENT METHOD SELECTION ---
  let selectedPayment = null;
  const paymentCards = document.querySelectorAll('.payment-method-card:not(.disabled)');
  const continuePaymentBtn = document.getElementById('continuePayment');
  paymentCards.forEach(card => {
    card.classList.remove('active');
    card.addEventListener('click', function () {
      paymentCards.forEach(c => c.classList.remove('active'));
      this.classList.add('active');
      selectedPayment = this.querySelector('.payment-method-title').innerText.trim();
      continuePaymentBtn.disabled = false;
    });
  });
  // Payment button stays disabled until user selects a method

  // --- SHIPPING FORM VALIDATION ---
  const shippingForm = document.getElementById('shippingForm');
  const continueShippingBtn = document.getElementById('continueShipping');
  const errorMsg = document.getElementById('form-error-message');
  const requiredFields = ['firstName', 'lastName', 'address1', 'email', 'phone', 'city', 'state', 'zip'];

  // Helper to check if all required are filled and valid
  function checkShippingFields() {
    let valid = true;
    requiredFields.forEach(id => {
      const field = document.getElementById(id);
      if (field) {
        field.style.borderColor = '#ddd';
        if (!field.value || (field.tagName === 'SELECT' && field.value === '')) {
          valid = false;
        }
        if (id === 'email' && field.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value)) {
          valid = false;
        }
      }
    });
    continueShippingBtn.disabled = !valid;
    return valid;
  }

  shippingForm && requiredFields.forEach(id => {
    const field = document.getElementById(id);
    if (field) {
      field.addEventListener('input', function () {
        checkShippingFields();
        // Remove red border on type
        if (field.value) {
          field.style.borderColor = '#ddd';
        }
      });
      // For select
      if (field.tagName === 'SELECT') {
        field.addEventListener('change', checkShippingFields);
      }
    }
  });

  if (continueShippingBtn && errorMsg) {
    continueShippingBtn.addEventListener('click', function (e) {
      let valid = true;
      errorMsg.style.display = 'none';
      errorMsg.textContent = '';

      // Always check all required fields and add red border for missing
      requiredFields.forEach(id => {
        const field = document.getElementById(id);
        if (field) {
          // Mark all as normal before checking
          field.style.borderColor = '#ddd';

          // Red border for empty fields
          if (!field.value || (field.tagName === 'SELECT' && field.value === '')) {
            valid = false;
            field.style.borderColor = '#b00020';
          }

          // Red border for invalid email
          if (id === 'email' && field.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value)) {
            valid = false;
            field.style.borderColor = '#b00020';
            errorMsg.textContent = 'Please enter a valid email address.';
            errorMsg.style.display = 'block';
          }
        }
      });

      // If not valid, do not proceed; show generic message if not already shown.
      if (!valid) {
        if (!errorMsg.textContent) {
          errorMsg.textContent = 'Please fill all the required fields.';
          errorMsg.style.display = 'block';
        }
        // Prevent step transition if any invalid
        return;
      }

      // Fill in review info
      fillReviewShipping();

      // Move to next step
      const currentStepElement = document.querySelector('.step.active');
      const nextStep = continueShippingBtn.getAttribute('data-next');
      if (nextStep) {
        switchSteps(currentStepElement, nextStep);
      }
    });
  }

  // Place order button validation
  document.querySelector('.btn-place-order')?.addEventListener('click', function () {
    if (!document.getElementById('agreeTerms')?.checked) {
      alert('Please agree to the Terms of Service and Privacy Policy');
      return;
    }
    // alert removed! You can add order confirmation logic here if needed.
    // For now, do nothing or add your own order completion code.
  });

  // Edit button functionality
  function handleEditButtonClick() {
    const stepToShow = this.getAttribute('data-step');
    if (!stepToShow) return;

    const currentStepElement = document.querySelector('.step.active');
    switchSteps(currentStepElement, stepToShow);
  }

  // Initialize edit buttons
  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', handleEditButtonClick);
  });

  // Vertical Stepper Functionality
  function updateVerticalStepper() {
    const currentStep = document.querySelector('.step.active')?.getAttribute('data-step');
    const stepperSteps = document.querySelectorAll('.stepper-step');
    const stepperLines = document.querySelectorAll('.stepper-line');

    stepperSteps.forEach((stepper, index) => {
      const stepNum = stepper.getAttribute('data-step');
      stepper.classList.remove('active', 'completed');

      if (stepNum === currentStep) {
        stepper.classList.add('active');
        if (index > 0) {
          stepperLines[index - 1].style.background = '#222';
        }
      } else if (parseInt(stepNum) < parseInt(currentStep)) {
        stepper.classList.add('completed');
        if (index > 0) {
          stepperLines[index - 1].style.background = '#222';
        }
      } else {
        if (index > 0) {
          stepperLines[index - 1].style.background = '#eee';
        }
      }
    });
  }

  // Make stepper steps clickable
  document.querySelectorAll('.stepper-step').forEach(step => {
    step.addEventListener('click', function () {
      const stepToShow = this.getAttribute('data-step');
      if (!stepToShow) return;

      const currentStepElement = document.querySelector('.step.active');
      switchSteps(currentStepElement, stepToShow);
    });
  });

  // Initialize stepper
  updateVerticalStepper();

  // Function to update cart totals
  function updateCartTotals() {
    const items = document.querySelectorAll('.item');
    const itemCount = items.length;
    const cartTitle = document.querySelector('.cart-items h2');
    const orderSubtitle = document.querySelector('.heading p');

    if (cartTitle) {
      cartTitle.textContent = `Cart (${itemCount} ${itemCount === 1 ? 'Item' : 'Items'})`;
    }

    if (orderSubtitle) {
      orderSubtitle.textContent = `Order subtotal (${itemCount} items): $${(itemCount * 150).toFixed(2)}`;
    }

    document.querySelectorAll('.price-row:first-child span:last-child').forEach(el => {
      el.textContent = `$${(itemCount * 150).toFixed(2)}`;
    });

    document.querySelectorAll('.price-row.total span:last-child').forEach(el => {
      el.textContent = `$${(itemCount * 150).toFixed(2)}`;
    });
  }

  // --- Payment Step: Continue button enable logic ---
  // Not selected by default, must select to enable continue
  continuePaymentBtn && (continuePaymentBtn.disabled = true);

  // --- Fill Review Shipping Info ---
  function fillReviewShipping() {
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const address1 = document.getElementById('address1').value.trim();
    const city = document.getElementById('city').value.trim();
    const state = document.getElementById('state').value.trim();
    const zip = document.getElementById('zip').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const email = document.getElementById('email').value.trim();

    let info = `${firstName} ${lastName}<br>${address1}<br>${city}, ${state} ${zip}<br>Phone: ${phone}<br>Email: ${email}<br>Pakistan`;
    document.getElementById('review-shipping-info').innerHTML = info;
  }

  // --- Fill Review Payment Info ---
  continuePaymentBtn &&
    continuePaymentBtn.addEventListener('click', function () {
      const reviewPayment = document.getElementById('review-payment-info');
      reviewPayment.textContent = selectedPayment || 'Not selected';
    });

  // --- Red border for empty fields on submit ---
  shippingForm && shippingForm.addEventListener('submit', function (e) {
    e.preventDefault();
    requiredFields.forEach(id => {
      const field = document.getElementById(id);
      if (field && (!field.value || (field.tagName === 'SELECT' && field.value === ''))) {
        field.style.borderColor = '#b00020';
      }
    });
  });

  // --- Enable Place Order button only when terms are checked ---
  const agreeTerms = document.getElementById('agreeTerms');
  const placeOrderBtn = document.querySelector('.btn-place-order');

  // Helper to validate Place Order button
  function validatePlaceOrderButton() {
    // Enable only if terms are checked
    placeOrderBtn.disabled = !agreeTerms.checked;
  }

  // Initial state
  if (placeOrderBtn && agreeTerms) {
    validatePlaceOrderButton();
    agreeTerms.addEventListener('change', validatePlaceOrderButton);
  }

  // --- Final Step: Populate hidden form fields on submission ---
  document.getElementById('placeOrderForm')?.addEventListener('submit', function (e) {
    // Populate hidden inputs from visible shipping/payment fields
    document.getElementById('hiddenFirstName').value = document.getElementById('firstName').value.trim();
    document.getElementById('hiddenLastName').value = document.getElementById('lastName').value.trim();
    document.getElementById('hiddenAddress').value = document.getElementById('address1').value.trim();
    document.getElementById('hiddenEmail').value = document.getElementById('email').value.trim();
    document.getElementById('hiddenPhone').value = document.getElementById('phone').value.trim();
    document.getElementById('hiddenCity').value = document.getElementById('city').value.trim();
    document.getElementById('hiddenState').value = document.getElementById('state').value.trim();
    document.getElementById('hiddenZip').value = document.getElementById('zip').value.trim();

    const selected = document.querySelector('.payment-method-card.active .payment-method-title');
    document.getElementById('hiddenPaymentMethod').value = selected ? selected.innerText.trim() : '';

    // If you have any other hidden fields to populate, do it here
  });
});