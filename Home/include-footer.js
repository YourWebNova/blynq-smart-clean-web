/* ==========================================================================
   Include de FOOTER para todas las plantillas BLYNQ
   Uso:
     <div id="include-footer" data-root=""></div>          (raíz)
     <div id="include-footer" data-root="../"></div>      (subcarpetas)
     <script src="Home/include-footer.js"></script>
     (en subcarpetas: src="../Home/include-footer.js")
   El idioma se respeta leyendo blynq_lang del localStorage.
   ========================================================================== */
  (() => {
    const mount = document.getElementById('include-footer');
    if (!mount) return;

    const root = mount.dataset.root || '';

    fetch(`${root}Home/partials/footer.html`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.text();
      })
      .then((html) => {
        // Resuelve rutas relativas según la ubicación de la página
        html = html.replaceAll('{{root}}', root);

        mount.innerHTML = html;

        // Aplica el idioma guardado (en | es) al contenido inyectado
        const lang = localStorage.getItem('blynq_lang') || 'en';
        mount.querySelectorAll('[data-en][data-es]').forEach((el) => {
          el.innerHTML = lang === 'es' ? el.getAttribute('data-es') : el.getAttribute('data-en');
        });
      })
      .catch((err) => console.error('[include-footer] No se pudo cargar el footer:', err));
  })();
