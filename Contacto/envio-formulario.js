/* ==========================================================================
   Envío del formulario de contacto de BLYNQ vía FormSubmit.co
   (servicio gratuito: reenvía los datos del form al correo del negocio,
   sin backend propio. El primer envío requiere una confirmación única
   por correo para activar el destino.)
   ========================================================================== */
(() => {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const ENDPOINT = 'https://formsubmit.co/ajax/blynq.cleanservices@gmail.com';

  const submitBtn = form.querySelector('button[type="submit"]');
  const originalBtnHTML = submitBtn.innerHTML;

  const setBtnState = (text, disabled) => {
    submitBtn.innerHTML = `<span>${text}</span>`;
    submitBtn.disabled = disabled;
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Idioma actual para los mensajes de estado
    const lang = localStorage.getItem('blynq_lang') || 'en';
    const t = {
      sending: lang === 'es' ? 'Enviando...' : 'Sending...',
      ok: lang === 'es' ? '¡Gracias! Tu solicitud fue enviada. Te contactaremos pronto.' : 'Thank you! Your request was sent. We will contact you soon.',
      err: lang === 'es' ? 'Hubo un error al enviar. Inténtalo de nuevo o escríbenos por WhatsApp.' : 'Something went wrong. Please try again or reach us on WhatsApp.'
    };

    setBtnState(t.sending, true);

    // FormSubmit exige campos _subject y, opcionalmente, una plantilla
    const data = {
      _subject: `Nueva solicitud de cotización — Web BLYNQ`,
      _template: 'table',
      _captcha: 'false',
      full_name: form.full_name.value.trim(),
      phone: form.phone.value.trim(),
      email: form.email.value.trim(),
      service_type: form.service_type.value,
      message: form.message.value.trim()
    };

    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      form.reset();
      setBtnState(t.ok, false);
      setTimeout(() => { submitBtn.innerHTML = originalBtnHTML; submitBtn.disabled = false; }, 6000);
    } catch (err) {
      console.error('[contact-form]', err);
      setBtnState(t.err, false);
      setTimeout(() => { submitBtn.innerHTML = originalBtnHTML; submitBtn.disabled = false; }, 6000);
    }
  });
})();
