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
