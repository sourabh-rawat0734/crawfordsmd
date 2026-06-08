// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Lucide Icons
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  // 2. Same-Day Dispatch Countdown Timer
  const timerElement = document.getElementById('dispatch-timer');
  if (timerElement) {
    // 2 hours 15 minutes 30 seconds rolling demo countdown
    let totalSeconds = 2 * 3600 + 15 * 60 + 30;

    const updateTimer = () => {
      if (totalSeconds <= 0) {
        // Reset to demo loop
        totalSeconds = 2 * 3600 + 15 * 60 + 30;
      }

      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      const formattedTime = [
        String(hours).padStart(2, '0'),
        String(minutes).padStart(2, '0'),
        String(seconds).padStart(2, '0')
      ].join(':');

      timerElement.textContent = formattedTime;

      const bannerTimer = document.getElementById('dispatch-timer-banner');
      if (bannerTimer) {
        bannerTimer.textContent = [
          String(hours).padStart(2, '0'),
          String(minutes).padStart(2, '0'),
          String(seconds).padStart(2, '0')
        ].join(' : ');
      }

      totalSeconds--;
    };

    updateTimer(); // Initial call
    setInterval(updateTimer, 1000);
  }

  // 3. Mobile Hamburger Menu Toggle
  const menuToggle = document.getElementById('menu-toggle');
  const drawerClose = document.getElementById('drawer-close');
  const navMenu = document.getElementById('nav-menu');

  const closeMenu = () => {
    if (!navMenu) return;
    navMenu.classList.remove('active');
    const icon = menuToggle && menuToggle.querySelector('i');
    if (icon) {
      icon.setAttribute('data-lucide', 'menu');
      lucide.createIcons();
    }
  };

  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      navMenu.classList.toggle('active');

      // Swap hamburger ↔ X icon
      const icon = menuToggle.querySelector('i');
      if (icon) {
        icon.setAttribute('data-lucide', navMenu.classList.contains('active') ? 'x' : 'menu');
        lucide.createIcons();
      }
    });

    // In-drawer close button
    if (drawerClose) {
      drawerClose.addEventListener('click', closeMenu);
    }

    // Close when clicking outside the drawer
    document.addEventListener('click', (e) => {
      if (!navMenu.contains(e.target) && !menuToggle.contains(e.target)) {
        closeMenu();
      }
    });

    // Close when a nav link is clicked (mobile UX)
    navMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeMenu);
    });
  }

  // 4. Product Tab Filtering & Carousel Sync
  const productGrid = document.getElementById('product-grid');
  const indicatorsContainer = document.getElementById('carousel-indicators');
  const tabButtons = document.querySelectorAll('.tab-btn');
  const productCards = document.querySelectorAll('.product-card');
  const prevBtn = document.getElementById('carousel-prev');
  const nextBtn = document.getElementById('carousel-next');

  // Helper to scroll the carousel smoothly without scroll-snap conflict
  const smoothScrollTo = (targetLeft) => {
    if (!productGrid) return;
    
    // Temporarily disable scroll snapping to prevent browser conflicts with smooth scroll
    productGrid.style.scrollSnapType = 'none';
    
    productGrid.scrollTo({
      left: targetLeft,
      behavior: 'smooth'
    });

    // Clear any pending scroll-snap restoration timeout
    if (productGrid.dataset.snapTimeoutId) {
      clearTimeout(parseInt(productGrid.dataset.snapTimeoutId, 10));
    }

    // Restore scroll snapping after smooth scroll completes (500ms)
    const timeoutId = setTimeout(() => {
      productGrid.style.scrollSnapType = '';
      updateCarouselButtons();
    }, 500);

    productGrid.dataset.snapTimeoutId = timeoutId.toString();
  };

  function updateCarouselButtons() {
    if (!productGrid || !prevBtn || !nextBtn) return;
    
    const scrollLeft = productGrid.scrollLeft;
    const scrollWidth = productGrid.scrollWidth;
    const clientWidth = productGrid.clientWidth;
    
    // Check if scrollable at all
    if (scrollWidth <= clientWidth + 5) {
      prevBtn.disabled = true;
      prevBtn.classList.add('opacity-0', 'pointer-events-none');
      prevBtn.style.visibility = 'hidden';
      
      nextBtn.disabled = true;
      nextBtn.classList.add('opacity-0', 'pointer-events-none');
      nextBtn.style.visibility = 'hidden';
      return;
    }
    
    if (scrollLeft <= 5) {
      prevBtn.disabled = true;
      prevBtn.classList.add('opacity-0', 'pointer-events-none');
      prevBtn.style.visibility = 'hidden';
    } else {
      prevBtn.disabled = false;
      prevBtn.classList.remove('opacity-0', 'pointer-events-none');
      prevBtn.style.visibility = 'visible';
    }
    
    if (scrollLeft + clientWidth >= scrollWidth - 5) {
      nextBtn.disabled = true;
      nextBtn.classList.add('opacity-0', 'pointer-events-none');
      nextBtn.style.visibility = 'hidden';
    } else {
      nextBtn.disabled = false;
      nextBtn.classList.remove('opacity-0', 'pointer-events-none');
      nextBtn.style.visibility = 'visible';
    }
  }

  function updateIndicators() {
    if (!productGrid || !indicatorsContainer || productCards.length === 0) return;

    const visibleCards = Array.from(productCards).filter(card => !card.classList.contains('hidden'));
    if (visibleCards.length === 0) {
      indicatorsContainer.style.display = 'none';
      updateCarouselButtons();
      return;
    }

    const containerWidth = productGrid.clientWidth;
    const cardWidth = visibleCards[0].getBoundingClientRect().width || 1;
    const visibleCount = Math.round(containerWidth / cardWidth) || 1;
    const pagesCount = Math.max(1, visibleCards.length - visibleCount + 1);

    // Clear existing indicators
    indicatorsContainer.innerHTML = '';

    // Hide indicators if all items fit on the screen
    if (pagesCount <= 1 || visibleCards.length <= visibleCount) {
      indicatorsContainer.style.display = 'none';
      updateCarouselButtons();
      return;
    }

    indicatorsContainer.style.display = 'flex';

    const scrollLeft = productGrid.scrollLeft;
    const activePageIndex = Math.min(pagesCount - 1, Math.round(scrollLeft / cardWidth));

    for (let i = 0; i < pagesCount; i++) {
      const dot = document.createElement('span');
      if (i === activePageIndex) {
        dot.className = 'w-6 h-2 rounded-lg bg-primary-navy cursor-pointer transition-all duration-200';
      } else {
        dot.className = 'w-2 h-2 rounded-full bg-slate-300 hover:bg-primary-navy/40 cursor-pointer transition-all duration-200';
      }

      dot.addEventListener('click', () => {
        smoothScrollTo(i * cardWidth);
      });

      indicatorsContainer.appendChild(dot);
    }
    updateCarouselButtons();
  }

  // Handle tab button clicks
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Set active class on buttons
      tabButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      const category = button.getAttribute('data-category');

      // Filter product cards
      productCards.forEach(card => {
        const cardCat = card.getAttribute('data-cat');
        if (category === 'all' || cardCat === category) {
          card.classList.remove('hidden');
          // Add quick entry animation class
          card.style.opacity = 0;
          card.style.transform = 'scale(0.95)';
          setTimeout(() => {
            card.style.transition = 'all 0.3s ease';
            card.style.opacity = 1;
            card.style.transform = 'scale(1)';
          }, 50);
        } else {
          card.classList.add('hidden');
        }
      });

      // Reset carousel scroll position
      if (productGrid) {
        productGrid.scrollLeft = 0;
      }

      // Re-calculate and draw indicators
      updateIndicators();
    });
  });

  // Update active indicator state on scroll
  if (productGrid) {
    productGrid.addEventListener('scroll', () => {
      updateCarouselButtons();
      if (productCards.length === 0 || !indicatorsContainer) return;
      const visibleCards = Array.from(productCards).filter(card => !card.classList.contains('hidden'));
      if (visibleCards.length === 0) return;

      const containerWidth = productGrid.clientWidth;
      const cardWidth = visibleCards[0].getBoundingClientRect().width || 1;
      const visibleCount = Math.round(containerWidth / cardWidth) || 1;
      const pagesCount = Math.max(1, visibleCards.length - visibleCount + 1);

      if (pagesCount <= 1 || visibleCards.length <= visibleCount) return;

      const activePageIndex = Math.min(pagesCount - 1, Math.round(productGrid.scrollLeft / cardWidth));

      const dots = indicatorsContainer.querySelectorAll('span');
      dots.forEach((dot, idx) => {
        if (idx === activePageIndex) {
          dot.className = 'w-6 h-2 rounded-lg bg-primary-navy cursor-pointer transition-all duration-200';
        } else {
          dot.className = 'w-2 h-2 rounded-full bg-slate-300 hover:bg-primary-navy/40 cursor-pointer transition-all duration-200';
        }
      });
    });
  }

  // Hook up Left/Right Arrow Navigation
  if (prevBtn && nextBtn && productGrid) {
    const scrollCarousel = (direction) => {
      const visibleCards = Array.from(productCards).filter(card => !card.classList.contains('hidden'));
      if (visibleCards.length === 0) return;
      
      const cardWidth = visibleCards[0].getBoundingClientRect().width || 1;
      
      // Scroll exactly 1 item at a time (card width + 16px gap-4)
      const scrollStep = cardWidth + 16;
      
      const currentScroll = productGrid.scrollLeft;
      const targetLeft = direction === 'next' ? currentScroll + scrollStep : currentScroll - scrollStep;
      
      smoothScrollTo(targetLeft);
    };

    prevBtn.addEventListener('click', () => scrollCarousel('prev'));
    nextBtn.addEventListener('click', () => scrollCarousel('next'));
  }

  // Initialize carousel indicators on load & resize
  updateIndicators();
  window.addEventListener('resize', updateIndicators);

  // 5. Category vs Brand Toggle
  const toggleCategoryBtn = document.getElementById('toggle-category-btn');
  const toggleBrandBtn = document.getElementById('toggle-brand-btn');
  const categoryGrid = document.getElementById('category-grid');
  const brandGrid = document.getElementById('brand-grid');

  if (toggleCategoryBtn && toggleBrandBtn && categoryGrid && brandGrid) {
    toggleCategoryBtn.addEventListener('click', () => {
      toggleCategoryBtn.classList.add('active');
      toggleBrandBtn.classList.remove('active');
      categoryGrid.classList.remove('hidden');
      brandGrid.classList.add('hidden');
    });

    toggleBrandBtn.addEventListener('click', () => {
      toggleBrandBtn.classList.add('active');
      toggleCategoryBtn.classList.remove('active');
      brandGrid.classList.remove('hidden');
      categoryGrid.classList.add('hidden');
    });
  }

  // 6. Add to Cart Logic
  const cartCount = document.getElementById('cart-count');
  const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');

  addToCartButtons.forEach(button => {
    button.addEventListener('click', () => {
      const productName = button.getAttribute('data-name');
      
      // Increment count
      if (cartCount) {
        let currentCount = parseInt(cartCount.textContent) || 0;
        currentCount++;
        cartCount.textContent = currentCount;
        
        // Cart bounce animation feedback
        cartCount.style.transform = 'scale(1.4)';
        cartCount.style.backgroundColor = '#10b981'; // Green accent feedback
        setTimeout(() => {
          cartCount.style.transform = 'scale(1)';
          cartCount.style.backgroundColor = 'var(--accent-orange)';
        }, 300);
      }

      // Simple toast notification feedback
      showNotification(`Added ${productName} to cart successfully!`);
    });
  });

  // Helper function to show notifications
  const showNotification = (message) => {
    let notificationContainer = document.getElementById('notification-container');
    if (!notificationContainer) {
      notificationContainer = document.createElement('div');
      notificationContainer.id = 'notification-container';
      notificationContainer.style.position = 'fixed';
      notificationContainer.style.bottom = '30px';
      notificationContainer.style.left = '30px';
      notificationContainer.style.zIndex = '1001';
      notificationContainer.style.display = 'flex';
      notificationContainer.style.flexDirection = 'column';
      notificationContainer.style.gap = '10px';
      document.body.appendChild(notificationContainer);
    }

    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.backgroundColor = 'var(--primary-navy)';
    toast.style.color = '#ffffff';
    toast.style.padding = '12px 24px';
    toast.style.borderRadius = '8px';
    toast.style.boxShadow = 'var(--shadow-lg)';
    toast.style.fontSize = '14px';
    toast.style.fontWeight = '600';
    toast.style.borderLeft = '4px solid var(--accent-gold)';
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
    toast.style.transition = 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';

    notificationContainer.appendChild(toast);

    // Trigger animation
    setTimeout(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateY(0)';
    }, 50);

    // Remove toast after 3 seconds
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-20px)';
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, 3000);
  };

  // 7. Quick View Modal Details & System
  const modal = document.getElementById('quickview-modal');
  const modalClose = document.getElementById('modal-close');
  const quickViewButtons = document.querySelectorAll('.quick-view-btn');

  // Product Database for Modal
  const productData = {
    eq900: {
      title: 'Equinox 900',
      brand: 'MINELAB',
      price: '£1,049.00',
      desc: 'The Minelab Equinox 900, driven by groundbreaking Multi-IQ technology, boasts an impressive 119 Target ID high-resolution system, superior target separation, and is fully waterproof to 5m (16ft) with IP68 rating.',
      img: 'assets/equinox_product.png',
      reviews: '(48 customer reviews)'
    },
    manticore: {
      title: 'Manticore',
      brand: 'MINELAB',
      price: '£1,749.00',
      desc: 'Minelab Manticore with Multi-IQ+ is the most powerful, fastest, and most precise metal detector in Minelab history. Find targets faster and deeper with the revolutionary 2D Target Identification map system.',
      img: 'assets/equinox_product.png',
      reviews: '(32 customer reviews)'
    },
    xterra: {
      title: 'X-Terra Pro',
      brand: 'MINELAB',
      price: '£329.00',
      desc: 'Stand out from the crowd and step up your detecting game with the all-new X-TERRA PRO metal detector by Minelab. Features Pro-Switch technology, fully waterproof to 5m, and packed with lightweight ergonomic design.',
      img: 'assets/equinox_product.png',
      reviews: '(15 customer reviews)'
    },
    vanq540: {
      title: 'Vanquish 540',
      brand: 'MINELAB',
      price: '£399.00',
      desc: 'Built for the serious detectorist who wants ultimate performance. With Multi-IQ technology, audio control, and pin-point accuracy, the Vanquish 540 excels in all conditions from damp park fields to dry sandy beaches.',
      img: 'assets/equinox_product.png',
      reviews: '(29 customer reviews)'
    },
    vanq340: {
      title: 'Vanquish 340',
      brand: 'MINELAB',
      price: '£229.00',
      desc: 'Perfect for anyone starting out in metal detecting. Easy to use with Multi-IQ technology, lightweight, and compact. Features 3 search modes and automatic noise-cancelling.',
      img: 'assets/product-image.png',
      reviews: '(18 customer reviews)'
    },
    ctx3030: {
      title: 'CTX 3030',
      brand: 'MINELAB',
      price: '£2,099.00',
      desc: 'The ultimate high-performance treasure detector. Fully waterproof with advanced GPS mapping, PC mapping interface, high-resolution color LCD screen, and wireless audio capabilities.',
      img: 'assets/product-image.png',
      reviews: '(24 customer reviews)'
    },
    eq700: {
      title: 'Equinox 700',
      brand: 'MINELAB',
      price: '£799.00',
      desc: 'Driven by Minelab\'s legendary Multi-IQ technology, the EQUINOX 700 boasts a high-resolution 119 Target ID system, superb target separation, and is fully waterproof up to 5m (16ft).',
      img: 'assets/product-image.png',
      reviews: '(35 customer reviews)'
    },
    gofind66: {
      title: 'Go-Find 66',
      brand: 'MINELAB',
      price: '£149.00',
      desc: 'Step up to the power and performance of the GO-FIND 66. With precision control and maximum depth, you will be finding treasure like a pro in no time. Lightweight, folding design with Bluetooth smartphone integration.',
      img: 'assets/product-image.png',
      reviews: '(12 customer reviews)'
    },
    eq600: {
      title: 'Equinox 600',
      brand: 'MINELAB',
      price: '£599.00',
      desc: 'Features simultaneous Multi-IQ multi-frequency technology. Waterproof, lightweight, and capable of operating in any environment including beaches and mineralized soils.',
      img: 'assets/product-image.png',
      reviews: '(21 customer reviews)'
    },
    xterraelite: {
      title: 'X-Terra Elite',
      brand: 'MINELAB',
      price: '£479.00',
      desc: 'Powered by Multi-IQ, offering true simultaneous multi-frequency detecting for everyone. Completely waterproof to 5m (16ft) and loaded with advanced settings for custom search setups.',
      img: 'assets/product-image.png',
      reviews: '(8 customer reviews)'
    },
    goldmonster: {
      title: 'Gold Monster 1000',
      brand: 'MINELAB',
      price: '£849.00',
      desc: 'Turns beginners into experts with fully automatic operation. High-frequency 45kHz VLF processing makes it highly sensitive to small gold nuggets and deep targets alike.',
      img: 'assets/product-image.png',
      reviews: '(14 customer reviews)'
    },
    gpx6000: {
      title: 'GPX 6000',
      brand: 'MINELAB',
      price: '£4,999.00',
      desc: 'Powered by GeoSense-PI technology, the GPX 6000 is the fastest, lightest and simplest way to find all types of gold in one machine. Fully automatic, ultra-accurate gold detection.',
      img: 'assets/product-image.png',
      reviews: '(7 customer reviews)'
    },
    gpz7000: {
      title: 'GPZ 7000',
      brand: 'MINELAB',
      price: '£7,999.00',
      desc: 'The future of gold detection. With extreme depth capability and maximum gold sensitivity, the GPZ 7000 features ZVT (Zero Voltage Transmission) technology to take you to the next level of gold hunting.',
      img: 'assets/product-image.png',
      reviews: '(11 customer reviews)'
    },
    excalibur2: {
      title: 'Excalibur II',
      brand: 'MINELAB',
      price: '£1,249.00',
      desc: 'The world\'s best underwater metal detector. Unique Broad Band Spectrum (BBS) technology makes finding targets in salt and freshwater easy, waterproof down to a massive 66m (200ft).',
      img: 'assets/product-image.png',
      reviews: '(19 customer reviews)'
    },
    gofind44: {
      title: 'Go-Find 44',
      brand: 'MINELAB',
      price: '£109.00',
      desc: 'Value-packed detector with great performance. Fully collapsible design, 3 search modes, treasure view LEDs, and protective search coil skin. Ideal starter option for all ages.',
      img: 'assets/product-image.png',
      reviews: '(16 customer reviews)'
    },
    gofind22: {
      title: 'Go-Find 22',
      brand: 'MINELAB',
      price: '£89.00',
      desc: 'Compact, simple, and lightweight. The perfect introductory metal detector for family outings. Folds down in seconds, features easy-to-use search icons, and 2 search modes.',
      img: 'assets/product-image.png',
      reviews: '(9 customer reviews)'
    }
  };

  const openModal = (productId) => {
    const data = productData[productId];
    if (!data || !modal) return;

    // Populate modal fields
    document.getElementById('modal-product-img').src = data.img;
    document.getElementById('modal-product-img').alt = data.title;
    document.getElementById('modal-product-title').textContent = data.title;
    document.getElementById('modal-product-price').textContent = data.price;
    document.getElementById('modal-product-desc').textContent = data.desc;
    document.getElementById('modal-product-reviews').textContent = data.reviews;

    // Set Add to Cart button attributes in modal
    const modalAddBtn = document.getElementById('modal-add-to-cart');
    if (modalAddBtn) {
      modalAddBtn.setAttribute('data-id', productId);
      modalAddBtn.setAttribute('data-name', data.title);
    }

    // Show modal
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden'; // Prevent scrolling background
  };

  const closeModal = () => {
    if (!modal) return;
    modal.classList.add('hidden');
    document.body.style.overflow = 'auto'; // Re-enable scrolling
  };

  // Add click events to quick view buttons
  quickViewButtons.forEach(button => {
    button.addEventListener('click', () => {
      const id = button.getAttribute('data-id');
      openModal(id);
    });
  });

  if (modalClose) {
    modalClose.addEventListener('click', closeModal);
  }

  if (modal) {
    // Close modal when clicking outside content area
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });
  }

  // Modal Add to Cart
  const modalAddCartBtn = document.getElementById('modal-add-to-cart');
  if (modalAddCartBtn) {
    modalAddCartBtn.addEventListener('click', () => {
      const name = modalAddCartBtn.getAttribute('data-name');
      if (cartCount) {
        let count = parseInt(cartCount.textContent) || 0;
        count++;
        cartCount.textContent = count;
      }
      showNotification(`Added ${name} to cart successfully!`);
      closeModal();
    });
  }

  // Compare and Newsletter forms placeholder feedback
  const compareButtons = document.querySelectorAll('.compare-btn, #modal-compare-btn');
  compareButtons.forEach(button => {
    button.addEventListener('click', () => {
      showNotification('Added to comparison list! Compare page feature coming soon.');
    });
  });

  const newsletterForm = document.getElementById('newsletter-form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailInput = newsletterForm.querySelector('input');
      if (emailInput) {
        showNotification(`Thank you! Subscription confirmed for ${emailInput.value}`);
        emailInput.value = '';
      }
    });
  }

  // 8b. Guides Carousel Navigation
  const guidesGrid = document.getElementById('guides-carousel-grid');
  const guidesPrevBtn = document.getElementById('guides-prev');
  const guidesNextBtn = document.getElementById('guides-next');

  if (guidesGrid && guidesPrevBtn && guidesNextBtn) {
    const updateGuidesButtons = () => {
      const scrollLeft = guidesGrid.scrollLeft;
      const scrollWidth = guidesGrid.scrollWidth;
      const clientWidth = guidesGrid.clientWidth;

      if (scrollWidth <= clientWidth + 5) {
        guidesPrevBtn.disabled = true;
        guidesPrevBtn.classList.add('opacity-0', 'pointer-events-none');
        guidesNextBtn.disabled = true;
        guidesNextBtn.classList.add('opacity-0', 'pointer-events-none');
        return;
      }

      if (scrollLeft <= 5) {
        guidesPrevBtn.disabled = true;
        guidesPrevBtn.classList.add('opacity-0', 'pointer-events-none');
      } else {
        guidesPrevBtn.disabled = false;
        guidesPrevBtn.classList.remove('opacity-0', 'pointer-events-none');
      }

      if (scrollLeft + clientWidth >= scrollWidth - 5) {
        guidesNextBtn.disabled = true;
        guidesNextBtn.classList.add('opacity-0', 'pointer-events-none');
      } else {
        guidesNextBtn.disabled = false;
        guidesNextBtn.classList.remove('opacity-0', 'pointer-events-none');
      }
    };

    const smoothScrollGuides = (targetLeft) => {
      guidesGrid.style.scrollSnapType = 'none';
      guidesGrid.scrollTo({
        left: targetLeft,
        behavior: 'smooth'
      });
      setTimeout(() => {
        guidesGrid.style.scrollSnapType = '';
        updateGuidesButtons();
      }, 500);
    };

    guidesPrevBtn.addEventListener('click', () => {
      const card = guidesGrid.querySelector('.snap-start');
      const gap = window.innerWidth >= 768 ? 16 : 8; // gap-4 (16px) on desktop, gap-2 (8px) on mobile
      const cardWidth = card ? card.getBoundingClientRect().width + gap : 340;
      smoothScrollGuides(guidesGrid.scrollLeft - cardWidth);
    });

    guidesNextBtn.addEventListener('click', () => {
      const card = guidesGrid.querySelector('.snap-start');
      const gap = window.innerWidth >= 768 ? 16 : 8; // gap-4 (16px) on desktop, gap-2 (8px) on mobile
      const cardWidth = card ? card.getBoundingClientRect().width + gap : 340;
      smoothScrollGuides(guidesGrid.scrollLeft + cardWidth);
    });

    guidesGrid.addEventListener('scroll', updateGuidesButtons);
    updateGuidesButtons();
    window.addEventListener('resize', updateGuidesButtons);
  }

  // 8c. Testimonials Carousel Navigation
  const testimonialsGrid = document.getElementById('testimonials-carousel-grid');
  const testimonialsPrevBtn = document.getElementById('testimonials-prev');
  const testimonialsNextBtn = document.getElementById('testimonials-next');

  if (testimonialsGrid && testimonialsPrevBtn && testimonialsNextBtn) {
    const updateTestimonialsButtons = () => {
      const scrollLeft = testimonialsGrid.scrollLeft;
      const scrollWidth = testimonialsGrid.scrollWidth;
      const clientWidth = testimonialsGrid.clientWidth;

      if (scrollWidth <= clientWidth + 5) {
        testimonialsPrevBtn.disabled = true;
        testimonialsPrevBtn.classList.add('opacity-0', 'pointer-events-none');
        testimonialsNextBtn.disabled = true;
        testimonialsNextBtn.classList.add('opacity-0', 'pointer-events-none');
        return;
      }

      if (scrollLeft <= 5) {
        testimonialsPrevBtn.disabled = true;
        testimonialsPrevBtn.classList.add('opacity-0', 'pointer-events-none');
      } else {
        testimonialsPrevBtn.disabled = false;
        testimonialsPrevBtn.classList.remove('opacity-0', 'pointer-events-none');
      }

      if (scrollLeft + clientWidth >= scrollWidth - 5) {
        testimonialsNextBtn.disabled = true;
        testimonialsNextBtn.classList.add('opacity-0', 'pointer-events-none');
      } else {
        testimonialsNextBtn.disabled = false;
        testimonialsNextBtn.classList.remove('opacity-0', 'pointer-events-none');
      }
    };

    const smoothScrollTestimonials = (targetLeft) => {
      testimonialsGrid.style.scrollSnapType = 'none';
      testimonialsGrid.scrollTo({
        left: targetLeft,
        behavior: 'smooth'
      });
      setTimeout(() => {
        testimonialsGrid.style.scrollSnapType = '';
        updateTestimonialsButtons();
      }, 500);
    };

    testimonialsPrevBtn.addEventListener('click', () => {
      const card = testimonialsGrid.querySelector('.snap-start');
      const cardWidth = card ? card.getBoundingClientRect().width + 12 : 300; // card width + gap-3 (12px)
      smoothScrollTestimonials(testimonialsGrid.scrollLeft - cardWidth);
    });

    testimonialsNextBtn.addEventListener('click', () => {
      const card = testimonialsGrid.querySelector('.snap-start');
      const cardWidth = card ? card.getBoundingClientRect().width + 12 : 300; // card width + gap-3 (12px)
      smoothScrollTestimonials(testimonialsGrid.scrollLeft + cardWidth);
    });

    testimonialsGrid.addEventListener('scroll', updateTestimonialsButtons);
    updateTestimonialsButtons();
    window.addEventListener('resize', updateTestimonialsButtons);
  }

  // Mobile Search Overlay Toggle
  const mobileSearchToggle = document.getElementById('mobile-search-toggle');
  const mobileSearchClose = document.getElementById('mobile-search-close');
  const mobileSearchOverlay = document.getElementById('mobile-search-overlay');
  const mobileSearchInput = document.getElementById('mobile-search-input');

  if (mobileSearchToggle && mobileSearchClose && mobileSearchOverlay) {
    mobileSearchToggle.addEventListener('click', () => {
      mobileSearchOverlay.classList.add('active');
      if (mobileSearchInput) {
        mobileSearchInput.focus();
      }
    });

    mobileSearchClose.addEventListener('click', () => {
      mobileSearchOverlay.classList.remove('active');
      if (mobileSearchInput) {
        mobileSearchInput.value = '';
      }
    });
  }

  // 9. Footer Collapsible Sections on Mobile
  const footerToggles = document.querySelectorAll('.footer-toggle');
  footerToggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
      // Only collapse/expand on mobile (width < 768px)
      if (window.innerWidth >= 768) return;

      const menu = toggle.nextElementSibling;
      const chevron = toggle.querySelector('[data-lucide="chevron-down"]');
      
      if (menu) {
        const isCollapsed = menu.classList.contains('hidden');
        if (isCollapsed) {
          menu.classList.remove('hidden');
          toggle.setAttribute('aria-expanded', 'true');
          if (chevron) {
            chevron.style.transform = 'rotate(180deg)';
          }
        } else {
          menu.classList.add('hidden');
          toggle.setAttribute('aria-expanded', 'false');
          if (chevron) {
            chevron.style.transform = 'rotate(0deg)';
          }
        }
      }
    });
  });
});

