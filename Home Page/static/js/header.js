let cart = [];

document.querySelectorAll('.add-to-cart').forEach(link => {
    link.addEventListener('click', function (e) {
        e.preventDefault();

        const id = this.getAttribute('data-id');
        const name = this.getAttribute('data-name');
        const price = parseFloat(this.getAttribute('data-price'));
        const image = this.getAttribute('data-image');

        const existingItem = cart.find(item => item.id === id);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ id, name, price, image, quantity: 1 });
        }

        updateMiniCart();
    });
});

function updateMiniCart() {
    const cartContainers = document.querySelectorAll('.mini_cart_inner');
    const totalCounts = document.querySelectorAll('.cart_count');
    const subtotalElems = document.querySelectorAll('.cart_subtotal span');
    const totalElems = document.querySelectorAll('.cart_total span');

    let subtotal = 0;

    // Create the HTML for cart items
    let cartHTML = '';
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;

        // Repeat item block by quantity to show each unit separately
        for (let i = 0; i < item.quantity; i++) {
            cartHTML += `
              <div class="cart_item">
                  <div class="cart_img">
                      <a href="#"><img src="${item.image}" alt="${item.name}" style="width: 60px; height: auto;"></a>
                  </div>
                  <div class="cart_info">
                      <a href="#">${item.name}</a>
                      <span class="quantity">Rs ${item.price.toFixed(2)}</span>
                  </div>
                  <div class="cart_remove">
                      <a href="#" onclick="removeFromCart('${item.id}')"><i class="fa fa-trash-o"></i></a>
                  </div>
              </div>`;
        }
    });

    // Update all matching containers (both mobile & desktop)
    cartContainers.forEach(container => {
        container.innerHTML = cartHTML;
    });

    totalCounts.forEach(el => {
        el.textContent = cart.reduce((sum, i) => sum + i.quantity, 0);
    });

    subtotalElems.forEach(el => {
        el.textContent = `Rs ${subtotal.toFixed(2)}`;
    });

    totalElems.forEach(el => {
        el.textContent = `Rs ${subtotal.toFixed(2)}`;
    });
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    updateMiniCart();
}


(function ($) {
    ("use strict");

    // canvas menu activation
    $(".canvas_open").on("click", function () {
        $(".offcanvas_menu_wrapper,.off_canvars_overlay").addClass("active");
    });

    $(".canvas_close,.off_canvars_overlay").on("click", function () {
        $(".offcanvas_menu_wrapper,.off_canvars_overlay").removeClass("active");
    });

    //   off canvas menu
    var $offcanvasNav = $(".offcanvas_main_menu"),
        $offcanvasNavSubMenu = $offcanvasNav.find(".sub-menu");
    $offcanvasNavSubMenu
        .parent()
        .prepend(
            '<span class="menu-expand"><i class="fa fa-angle-down"></i></span>'
        );

    $offcanvasNavSubMenu.slideUp();

    $offcanvasNav.on("click", "li a, li .menu-expand", function (e) {
        var $this = $(this);
        if (
            $this
                .parent()
                .attr("class")
                .match(/\b(menu-item-has-children| has-children | has-sub-menu)\b/) &&
            ($this.attr("href") === "#" || $this.hasClass("menu-expand"))
        ) {
            e.preventDefault();
            if ($this.siblings("ul:visible").length) {
                $this.siblings("ul").slideUp("slow");
            } else {
                $this.closest("li").siblings("li").find("ul:visible").slideUp("slow");
                $this.siblings("ul").slideDown("slow");
            }
        }

        if (
            $this.is("a") ||
            $this.is("span") ||
            $this.attr("class").match(/\b(menu-expand)\b/)
        ) {
            $this.parent().toggleClass("menu-open");
        } else if (
            $this.is("li") &&
            $this.attr("class").match(/\b('menu-item-has-children')\b/)
        ) {
            $this.toggleClass("menu-open");
        }
    });

    //   search box slidetoggle activation
    $(".search_box > a").on("click", function () {
        $(this).toggleClass("active");
        $(".search_widget").slideToggle("medium");
    });

    // slide toggle activation of mini cart
    $(".mini_cart_wrapper > a").on("click", function () {
        if ($(window).width() < 991) {
            $(".mini_cart").slideToggle("medium");
        }
    });

    // sticky header

    $(window).on("scroll", function () {
        var scroll = $(window).scrollTop();
        if (scroll < 100) {
            $(".sticky-header").removeClass("sticky");
        } else {
            $(".sticky-header").addClass("sticky");
        }
    });
    
})(jQuery);