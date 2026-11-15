/* ==========================================================================
   Include de HEADER para todas las plantillas BLYNQ
   Uso:
     <div id="include-header" data-root=""></div>          (raíz)
     <div id="include-header" data-root="../"></div>      (subcarpetas)
     <script src="Home/include-header.js"></script>
     (en subcarpetas: src="../Home/include-header.js")

   - Marca como .active el enlace de la página actual.
   - El idioma se respeta leyendo blynq_lang del localStorage.
   - Reengancha el menú hamburguesa y el selector de idioma tras
     la inyección (funciones-home.js corre antes de esto).
   ========================================================================== */
(() => {
  const mount = document.getElementById('include-header');
  if (!mount) return;

  const root = mount.dataset.root || '';

  fetch(`${root}Home/partials/header.html`)
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.text();
    })
    .then((html) => {
      html = html.replaceAll('{{root}}', root);
      mount.innerHTML = html;

      // 1. Resalta el enlace de la página actual
      const page = (document.body.dataset.page || '').toLowerCase();
      if (page) {
        const link = mount.querySelector(`[data-nav="${page}"]`);
        if (link) link.classList.add('active');
      }

      // 2. Reaplica el idioma guardado al contenido inyectado
      const lang = localStorage.getItem('blynq_lang') || 'en';
      mount.querySelectorAll('[data-en][data-es]').forEach((el) => {
        el.innerHTML = lang === 'es' ? el.getAttribute('data-es') : el.getAttribute('data-en');
      });

      // 3. Refresca el texto del botón de idioma (fue inyectado después
      //    de que funciones-home.js hicira su pasada inicial)
      const langBtn = document.getElementById('lang-btn');
      if (langBtn) langBtn.innerHTML = lang === 'es' ? '🇪🇸 Español' : '🇺🇸 English';

      // 4. Re-engancha el menú hamburguesa (el listener original quedó
      //    apuntando al botón del HTML estático, ya removido)
      const menuToggle = mount.querySelector('.menu-toggle');
      const navMenu = mount.querySelector('.nav-menu');
      if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
          const isActive = menuToggle.classList.toggle('is-active');
          navMenu.classList.toggle('is-open');
          menuToggle.setAttribute('aria-expanded', isActive);
          menuToggle.setAttribute('aria-label', isActive ? 'Close menu' : 'Open menu');
        });

        navMenu.querySelectorAll('nav a, ul a').forEach((a) =>
          a.addEventListener('click', () => {
            menuToggle.classList.remove('is-active');
            navMenu.classList.remove('is-open');
            menuToggle.setAttribute('aria-expanded', 'false');
          })
        );
      }

      // 5. Re-engancha el selector de idioma para que traduzca TODO
      //    (incluido el header recién inyectado y el footer)
      if (langBtn) {
        langBtn.addEventListener('click', () => {
          const next = (localStorage.getItem('blynq_lang') || 'en') === 'en' ? 'es' : 'en';
          localStorage.setItem('blynq_lang', next);
          document.documentElement.lang = next;
          langBtn.innerHTML = next === 'es' ? '🇪🇸 Español' : '🇺🇸 English';
          document.querySelectorAll('[data-en][data-es]').forEach((el) => {
            el.innerHTML = next === 'es' ? el.getAttribute('data-es') : el.getAttribute('data-en');
          });
        });
      }
    })
    .catch((err) => console.error('[include-header] No se pudo cargar el header:', err));
})();
