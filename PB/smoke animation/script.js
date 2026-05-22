document.addEventListener('DOMContentLoaded', () => {
    const sliderTrack = document.querySelector('.slider-track');
    const sliderContainer = document.querySelector('.slider-container');
    let isDragging = false;
    let startPosition = 0;
    let currentTranslate = 0;
    let prevTranslate = 0;
    let animationID;
    let currentIndex = 0;
    
    // Calculate widths dynamically
    const card = document.querySelector('.card');
    const cardWidth = card.offsetWidth + parseInt(window.getComputedStyle(sliderTrack).gap);
    const visibleCards = Math.floor(sliderContainer.offsetWidth / cardWidth);
    const totalCards = document.querySelectorAll('.card').length;
    let isHorizontalDrag = false;

    // Event listeners
    sliderTrack.addEventListener('mousedown', dragStart);
    sliderTrack.addEventListener('mouseup', dragEnd);
    sliderTrack.addEventListener('mouseleave', dragEnd);
    sliderTrack.addEventListener('mousemove', drag);
    sliderTrack.addEventListener('touchstart', dragStart);
    sliderTrack.addEventListener('touchend', dragEnd);
    sliderTrack.addEventListener('touchmove', drag);
    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('resize', updateDimensions);

    function updateDimensions() {
        const newCardWidth = document.querySelector('.card').offsetWidth + 
                           parseInt(window.getComputedStyle(sliderTrack).gap);
        const newVisibleCards = Math.floor(sliderContainer.offsetWidth / newCardWidth);
        
        if (newCardWidth !== cardWidth || newVisibleCards !== visibleCards) {
            cardWidth = newCardWidth;
            visibleCards = newVisibleCards;
            checkIndex();
            setSliderPosition();
        }
    }

    function dragStart(e) {
        isHorizontalDrag = false;
        startPosition = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
        isDragging = true;
        animationID = requestAnimationFrame(animation);
        sliderTrack.style.cursor = 'grabbing';
        if (e.type !== 'touchstart') e.preventDefault();
    }

    function drag(e) {
        if (!isDragging) return;
        
        const currentPosition = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
        const diffX = currentPosition - startPosition;
        const diffY = e.type === 'touchmove' ? e.touches[0].clientY - startPosition : e.clientY - startPosition;

        if (!isHorizontalDrag && Math.abs(diffX) < 10 && Math.abs(diffY) > 10) {
            return;
        }

        isHorizontalDrag = true;
        currentTranslate = prevTranslate + diffX;
    }

    function handleWheel(e) {
        if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
            e.preventDefault();
            currentTranslate += e.deltaX;
            prevTranslate = currentTranslate;
            checkIndex();
            setSliderPosition();
        }
    }

    function dragEnd() {
        if (!isDragging) return;
        isDragging = false;
        cancelAnimationFrame(animationID);
        sliderTrack.style.cursor = 'grab';
        
        if (isHorizontalDrag) {
            checkIndex();
            setSliderPosition();
        }
    }

    function checkIndex() {
        currentIndex = Math.round(-currentTranslate / cardWidth);
        const maxIndex = totalCards - visibleCards;
        
        if (currentIndex < 0) {
            currentIndex = 0;
        } else if (currentIndex > maxIndex) {
            currentIndex = maxIndex;
        }
        
        prevTranslate = -currentIndex * cardWidth;
    }

    function animation() {
        setSliderPosition();
        if (isDragging) requestAnimationFrame(animation);
    }

    function setSliderPosition() {
        sliderTrack.style.transform = `translateX(${isDragging ? currentTranslate : prevTranslate}px)`;
    }

    // Prevent image drag
    const images = document.querySelectorAll('.card img');
    images.forEach(img => {
        img.addEventListener('dragstart', (e) => e.preventDefault());
    });

    // Initialize slider position
    setSliderPosition();
});