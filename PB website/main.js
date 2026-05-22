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

  function dataBackgroundImage() {
    $("[data-bgimg]").each(function () {
      var bgImgUrl = $(this).data("bgimg");
      $(this).css({
        "background-image": "url(" + bgImgUrl + ")",
      });
    });
  }

  $(window).on("load", function () {
    dataBackgroundImage();
  });

  // slider activation
  $(".slider_area").owlCarousel({
    animateOut: "fadeOut",
    autoplay: true,
    loop: true,
    nav: true,
    autoplay: false,
    autoplayTimeout: 5000,
    items: 1,
    dots: false,
    navText: [
      '<i class="fa fa-arrow-left"></i>',
      '<i class="fa fa-arrow-right"></i>',
    ],
  });

  // product column of 4 activation
  $(".product_column4")
    .on("changed.owl.carousel initialized.owl.carousel", function (event) {
      $(event.target)
        .find(".owl-item")
        .removeClass("last")
        .eq(event.item.index + event.page.size - 1)
        .addClass("last");
    })
    .owlCarousel({
      autoplay: true,
      loop: true,
      nav: true,
      autoplay: false,
      autoplayTimeout: 5000,
      items: 4,
      dots: false,
      navText: [
        '<i class="fa fa-arrow-left"></i>',
        '<i class="fa fa-arrow-right"></i>',
      ],
      responsiveClass: true,
      responsive: {
        0: {
          items: 1,
        },
        576: {
          items: 2,
        },
        768: {
          items: 3,
        },
        992: {
          items: 4,
        },
      },
    });

  // tooltip activation

  $(".action_links ul li a,.add_to_cart a,.footer_social_link ul li a").tooltip(
    {
      animated: "fade",
      placement: "top",
      container: "body",
    }
  );

  // activation of one column of deal product
  $(".product_column1")
    .on("changed.owl.carousel initialized.owl.carousel", function (event) {
      $(event.target)
        .find(".owl-item")
        .removeClass("last")
        .eq(event.item.index + event.page.size - 1)
        .addClass("last");
    })
    .owlCarousel({
      autoplay: true,
      loop: true,
      nav: true,
      autoplay: false,
      autoplayTimeout: 5000,
      items: 4,
      dots: false,
      navText: [
        '<i class="fa fa-arrow-left"></i>',
        '<i class="fa fa-arrow-right"></i>',
      ],
      responsiveClass: true,
      responsive: {
        0: {
          items: 1,
        },
        768: {
          items: 2,
        },
        992: {
          items: 1,
        },
      },
    });

  // countdown activation
  $("[data-countdown").each(function () {
    var $this = $(this),
      finalDate = $(this).data("countdown");
    $this.countdown(finalDate, function (event) {
      $this.html(
        event.strftime(
          '<div class="countdown_area"><div class="single_countdown"><div class="countdown_number">%D</div><div class="countdown_title">days</div></div><div class="single_countdown"><div class="countdown_number">%H</div><div class="countdown_title">Hours</div></div><div class="single_countdown"><div class="countdown_number">%M</div><div class="countdown_title">mins</div></div><div class="single_countdown"><div class="countdown_number">%S</div><div class="countdown_title">secs</div></div></div>'
        )
      );
    });
  });

  // activation of one column of Best seller product
  $(".sidebar_product_column1")
    .on("changed.owl.carousel initialized.owl.carousel", function (event) {
      $(event.target)
        .find(".owl-item")
        .removeClass("last")
        .eq(event.item.index + event.page.size - 1)
        .addClass("last");
    })
    .owlCarousel({
      autoplay: true,
      loop: true,
      nav: true,
      autoplay: false,
      autoplayTimeout: 5000,
      items: 4,
      dots: false,
      navText: [
        '<i class="fa fa-arrow-left"></i>',
        '<i class="fa fa-arrow-right"></i>',
      ],
      responsiveClass: true,
      responsive: {
        0: {
          items: 1,
        },
        768: {
          items: 2,
          margin: 30,
        },
        992: {
          items: 1,
        },
      },
    });

  // Testimonial activation
  $(".testimonial_sidebar_carousel").owlCarousel({
    autoplay: true,
    loop: true,
    nav: true,
    autoplay: false,
    autoplayTimeout: 5000,
    items: 1,
    dots: false,
    navText: [
      '<i class="fa fa-arrow-left"></i>',
      '<i class="fa fa-arrow-right"></i>',
    ],
  });

  // activation of one column of Best seller product
  $(".product_column3")
    .on("changed.owl.carousel initialized.owl.carousel", function (event) {
      $(event.target)
        .find(".owl-item")
        .removeClass("last")
        .eq(event.item.index + event.page.size - 1)
        .addClass("last");
    })
    .owlCarousel({
      autoplay: true,
      loop: true,
      nav: true,
      autoplay: false,
      autoplayTimeout: 5000,
      items: 4,
      dots: false,
      navText: [
        '<i class="fa fa-arrow-left"></i>',
        '<i class="fa fa-arrow-right"></i>',
      ],
      responsiveClass: true,
      responsive: {
        0: {
          items: 1,
        },
        567: {
          items: 2,
        },
        768: {
          items: 3,
        },
        992: {
          items: 3,
        },
      },
    });

  // activation of blog section
  $(".blog_column3").owlCarousel({
    autoplay: true,
    loop: true,
    nav: true,
    autoplay: false,
    autoplayTimeout: 5000,
    items: 4,
    dots: false,
    navText: [
      '<i class="fa fa-arrow-left"></i>',
      '<i class="fa fa-arrow-right"></i>',
    ],
    responsiveClass: true,
    responsive: {
      0: {
        items: 1,
      },
      768: {
        items: 2,
      },
      992: {
        items: 3,
      },
    },
  });

  // Small product column 1 activation
  $(".small_product_column1")
    .on("changed.owl.carousel initialized.owl.carousel", function (event) {
      $(event.target)
        .find(".owl-item")
        .removeClass("last")
        .eq(event.item.index + event.page.size - 1)
        .addClass("last");
    })
    .owlCarousel({
      autoplay: true,
      loop: true,
      nav: false,
      autoplay: false,
      autoplayTimeout: 5000,
      items: 4,
      dots: false,
      navText: [
        '<i class="fa fa-arrow-left"></i>',
        '<i class="fa fa-arrow-right"></i>',
      ],
      responsiveClass: true,
      responsive: {
        0: {
          items: 1,
        },
        568: {
          items: 2,
          margin: 15,
        },
        768: {
          items: 1,
        },
      },
    });

  // activation of small nav active
  $(".product_navactive").owlCarousel({
    autoplay: false,
    loop: true,
    nav: true,
    items: 4,
    dots: false,
    navText: [
      '<i class="fa fa-angle-left"></i>',
      '<i class="fa fa-angle-right"></i>',
    ],
    responsiveClass: true,
    responsive: {
      0: {
        items: 1,
      },
      250: {
        items: 2,
      },
      480: {
        items: 3,
      },
      768: {
        items: 4,
      },
    },
  });

  $(".modal").on("shown.bs.modal", function (e) {
    $(".product_navactive").resize();
  });
  $(".product_navactive a").on("click", function (e) {
    e.preventDefault();

    var $href = $(this).attr("href");

    $(".product_navactive a").removeClass("active");
    $(this).addClass("active");

    $(".product-details-large .tab-pane").removeClass("active show");
    $(".product-details-large " + $href).addClass("active show");
  });

  $(".select_option").niceSelect();
})(jQuery);
