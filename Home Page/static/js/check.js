// Change main product image when thumbnail is clicked
        function changeMainImage(element) {
            const mainImage = document.getElementById('main-product-image');
            const newSrc = element.src.replace('/150x150/', '/600x600/');
            mainImage.src = newSrc;
            // Update thumbnail selection
            document.querySelectorAll('.thumbnail-gallery img').forEach(img => {
                img.parentElement.classList.remove('border-orange-500', 'border-2');
                img.parentElement.classList.add('border-gray-200', 'border');
            });
            element.parentElement.classList.add('border-orange-500', 'border-2');
            element.parentElement.classList.remove('border-gray-200', 'border');
        }
        // Size selection
        document.querySelectorAll('.size-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.size-btn').forEach(b => {
                    b.classList.remove('selected', 'bg-orange-600', 'text-white');
                    b.classList.add('border-gray-300', 'hover:bg-gray-100');
                });
                this.classList.add('selected', 'bg-orange-600', 'text-white');
                this.classList.remove('border-gray-300', 'hover:bg-gray-100');
            });
        });
        // Accordion functionality
        document.querySelectorAll('.accordion-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const accordion = this.parentElement;
                accordion.classList.toggle('active');
                const icon = this.querySelector('i');
                icon.classList.toggle('fa-chevron-down');
                icon.classList.toggle('fa-chevron-up');
                // Close other accordions
                document.querySelectorAll('.accordion').forEach(acc => {
                    if (acc !== accordion) {
                        acc.classList.remove('active');
                        const otherIcon = acc.querySelector('.accordion-btn i');
                        otherIcon.classList.remove('fa-chevron-up');
                        otherIcon.classList.add('fa-chevron-down');
                    }
                });
            });
        });
        // Image zoom functionality
        const mainImage = document.getElementById('main-product-image');
        mainImage.addEventListener('click', function() {
            this.classList.toggle('zoomed');
        });
        // Initialize first accordion as open
        document.querySelector('.accordion').classList.add('active');

        // Write Review Modal Functionality
        document.addEventListener('DOMContentLoaded', function() {
          var writeReviewBtn = document.querySelector('button.mt-6.bg-orange-600');
          var modal = document.getElementById('writeReviewModal');
          var closeBtn = document.getElementById('closeReviewModal');
          if (writeReviewBtn && modal && closeBtn) {
            writeReviewBtn.addEventListener('click', function() {
              modal.classList.remove('hidden');
            });
            closeBtn.addEventListener('click', function() {
              modal.classList.add('hidden');
            });
            // Also close modal if clicking outside the modal box
            modal.addEventListener('click', function(e) {
              if (e.target === modal) {
                modal.classList.add('hidden');
              }
            });
          }
        });