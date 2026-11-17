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

      // 3. Refresca el estado visual del botón dual (palabra activa en bold/azul)
      const langBtn = document.getElementById('lang-btn');
      if (langBtn) syncLangButton(langBtn, lang);

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

      // 5. Re-engancha el selector de idioma: ÚNICO gestor del traductor.
      //    Botón texto dual: cada palabra clicable cambia a SU idioma.
      if (langBtn) {
        langBtn.querySelectorAll('.lang-opt').forEach((opt) => {
          opt.addEventListener('click', (e) => {
            e.stopPropagation();
            const target = opt.dataset.lang;
            const current = localStorage.getItem('blynq_lang') || 'en';
            if (target === current) return;
            localStorage.setItem('blynq_lang', target);
            document.documentElement.lang = target;
            syncLangButton(langBtn, target);
            document.querySelectorAll('[data-en][data-es]').forEach((el) => {
              el.innerHTML = target === 'es' ? el.getAttribute('data-es') : el.getAttribute('data-en');
            });
          });
        });
      }
    })
    .catch((err) => console.error('[include-header] No se pudo cargar el header:', err));

  /* Sincroniza la marca visual del botón dual: bold + #124eb3 en el idioma activo */
  function syncLangButton(btn, lang) {
    btn.querySelectorAll('.lang-opt').forEach((opt) => {
      opt.classList.toggle('lang-active', opt.dataset.lang === lang);
    });
  }
})();

/* Aplica el idioma guardado al cargar, también al FOOTER inyectado.
   El footer puede llegar después del header (fetch paralelo), así que
   se re-aplica el idioma cuando él termina de inyectarse. */
(() => {
  const applyLang = () => {
    const lang = localStorage.getItem('blynq_lang') || 'en';
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-en][data-es]').forEach((el) => {
      el.innerHTML = lang === 'es' ? el.getAttribute('data-es') : el.getAttribute('data-en');
    });
    const btn = document.getElementById('lang-btn');
    if (btn) btn.querySelectorAll('.lang-opt').forEach((opt) => {
      opt.classList.toggle('lang-active', opt.dataset.lang === lang);
    });
  };

  window.addEventListener('DOMContentLoaded', applyLang);
  // Por si algún módulo inyecta contenido después de DOMContentLoaded
  window.addEventListener('load', applyLang);
})();
