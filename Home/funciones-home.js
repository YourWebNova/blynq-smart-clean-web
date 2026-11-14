document.addEventListener('DOMContentLoaded', () => {
  const menuToggle = document.querySelector('.menu-toggle');
  const navMenu = document.querySelector('.nav-menu');
  const navLinks = document.querySelectorAll('.nav-menu a');

  if (menuToggle && navMenu) {
    // Abrir/cerrar menú hamburguesa
    menuToggle.addEventListener('click', () => {
      menuToggle.classList.toggle('is-active');
      navMenu.classList.toggle('is-open');
      const isExpanded = menuToggle.classList.contains('is-active');
      menuToggle.setAttribute('aria-expanded', isExpanded);
      menuToggle.setAttribute('aria-label', isExpanded ? 'Close menu' : 'Open menu');
    });

    // Cerrar el menú automáticamente al dar clic en un enlace de navegación
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        menuToggle.classList.remove('is-active');
        navMenu.classList.remove('is-open');
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.setAttribute('aria-label', 'Open menu');
      });
    });
  }
});


/* Funcionalidad del carrusel */

(() => {
  const DEFAULT_SPEED = 40; // px por segundo

  const imagesLoaded = (root) =>
    Promise.all(
      [...root.querySelectorAll('img')].map((img) =>
        img.complete
          ? Promise.resolve()
          : new Promise((resolve) => {
              img.addEventListener('load', resolve, { once: true });
              img.addEventListener('error', resolve, { once: true });
            })
      )
    );

  const initCarousel = async (carousel) => {
    const track = carousel.querySelector('.carousel-track');
    if (!track) return;

    const originals = Array.from(track.children);
    const speed = parseFloat(carousel.dataset.speed) || DEFAULT_SPEED;

    const addClones = (nodes, times) => {
      for (let i = 0; i < times; i++) {
        nodes.forEach((node) => {
          const clone = node.cloneNode(true);
          clone.dataset.clone = '';
          clone.setAttribute('aria-hidden', 'true');
          clone.querySelectorAll('img').forEach((img) => (img.alt = ''));
          track.appendChild(clone);
        });
      }
    };

    const build = () => {
      track.querySelectorAll('[data-clone]').forEach((el) => el.remove());
      carousel.classList.add('is-ready');

      const setWidth = track.offsetWidth; // ancho de un set de logos
      if (!setWidth) return;

      // Cuántas repeticiones se necesitan para cubrir el contenedor
      const copies = Math.max(1, Math.ceil(carousel.offsetWidth / setWidth));
      addClones(originals, copies - 1);

      // Se duplica el grupo completo: el loop de -50% queda seamless
      addClones(Array.from(track.children), 1);

      const groupWidth = setWidth * copies;
      carousel.style.setProperty('--carousel-duration', `${groupWidth / speed}s`);
    };

    await imagesLoaded(carousel);
    build();

    // Recalcula si cambia el ancho del contenedor (resize / rotación)
    let lastWidth = carousel.offsetWidth;
    let timer;
    new ResizeObserver(() => {
      if (carousel.offsetWidth === lastWidth) return;
      lastWidth = carousel.offsetWidth;
      clearTimeout(timer);
      timer = setTimeout(build, 150);
    }).observe(carousel);
  };

  document.querySelectorAll('#client-logos .carousel').forEach(initCarousel);
})();




/* Slider de Testimonios: carrusel que desliza de a una tarjeta */
(() => {
  const slider = document.querySelector('.testimonials-slider');
  if (!slider) return;

  const grid = slider.querySelector('.testimonials-grid');
  const prevBtn = slider.querySelector('.slider-prev');
  const nextBtn = slider.querySelector('.slider-next');

  const perPage = () => (window.innerWidth <= 767 ? 1 : window.innerWidth <= 1019 ? 2 : 3);
  let page = 0;

  const maxPage = () => {
    const total = slider.querySelectorAll('.testimonial-item').length;
    return Math.max(0, Math.ceil(total / perPage()) - 1);
  };

  /* Desplaza el track una tarjeta a la izquierda por cada página */
  const applyTransform = () => {
    const item = grid.querySelector('.testimonial-item');
    if (!item) return;
    const gap = 40;
    const step = item.offsetWidth + gap;
    grid.style.transform = `translateX(-${page * step}px)`;
  };

  const render = () => {
    slider.dataset.page = page;
    prevBtn.disabled = page === 0;
    nextBtn.disabled = page >= maxPage();
    applyTransform();
  };

  prevBtn.addEventListener('click', () => {
    if (page > 0) { page--; render(); }
  });

  nextBtn.addEventListener('click', () => {
    if (page < maxPage()) { page++; render(); }
  });

  // Swipe táctil en móvil
  let touchStartX = 0;
  slider.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });

  slider.addEventListener('touchend', (e) => {
    const deltaX = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(deltaX) < 50) return; // ignora toques cortos
    if (deltaX < 0 && page < maxPage()) {
      page++; // swipe a la izquierda → siguiente
    } else if (deltaX > 0 && page > 0) {
      page--; // swipe a la derecha → anterior
    }
    render();
  }, { passive: true });

  window.addEventListener('resize', () => {
    page = Math.min(page, maxPage());
    render();
  });

  render();
})();


// script para multi-idiomas
document.addEventListener('DOMContentLoaded', () => {
    const langBtn = document.getElementById('lang-btn');
    if (!langBtn) return;

    // Obtiene el idioma guardado o usa English por defecto
    let currentLang = localStorage.getItem('blynq_lang') || 'en';

    function updateContent(lang) {
        const elements = document.querySelectorAll('[data-en][data-es]');
        elements.forEach(el => {
            if (lang === 'es') {
                el.innerHTML = el.getAttribute('data-es');
            } else {
                el.innerHTML = el.getAttribute('data-en');
            }
        });

        if (lang === 'es') {
            langBtn.innerHTML = '🇪🇸 ES';
            document.documentElement.lang = 'es';
        } else {
            langBtn.innerHTML = '🇺🇸 EN';
            document.documentElement.lang = 'en';
        }
        localStorage.setItem('blynq_lang', lang);
    }

    // Aplicar al cargar la página
    updateContent(currentLang);

    // Cambiar idioma al hacer clic
    langBtn.addEventListener('click', () => {
        currentLang = currentLang === 'en' ? 'es' : 'en';
        updateContent(currentLang);
    });
});