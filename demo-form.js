/* ============================================================
   Demo build of the lead form (portfolio copy).
   Same validation and warnings as production, but a valid submit
   only shows a demo notice. Nothing is sent anywhere: no network
   request, no tag-manager events, no CRM.
   The page's visual effects (3D hero, reveals, counters) are in
   app.js and are unchanged.
   ============================================================ */
(function () {
  'use strict';

  var DEMO_MSG = 'זה דף הדגמה – הטופס לא שולח פרטים לשום מקום.';
  var LINK_MSG = 'זה דף הדגמה – הקישור והחיוג מנותקים בעותק הזה.';

  /* ---------- toast (phone CTAs, outbound links) ---------- */
  var toastEl = null, toastTimer = null;
  function toast(text) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'demo-toast';
      toastEl.setAttribute('role', 'status');
      toastEl.setAttribute('aria-live', 'polite');
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = text;
    toastEl.classList.remove('show');
    void toastEl.offsetWidth; // replay the transition on repeated clicks
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, 3600);
  }

  Array.prototype.forEach.call(document.querySelectorAll('[data-demo-phone]'), function (el) {
    el.addEventListener('click', function (e) { e.preventDefault(); toast(DEMO_MSG); });
  });
  Array.prototype.forEach.call(document.querySelectorAll('[data-demo-link]'), function (el) {
    el.addEventListener('click', function (e) { e.preventDefault(); toast(LINK_MSG); });
  });

  /* ---------- validation (same rules and warning hooks as production) ---------- */
  var form = document.querySelector('.cta-form form');
  var msg = form ? form.querySelector('.demo-msg') : null;

  function show(sel, on) {
    var el = form.querySelector(sel);
    if (el) el.style.display = on ? 'block' : 'none';
  }
  function validEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(String(value).trim().toLowerCase());
  }

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      // honeypot: bots fill hidden fields, people do not
      var hp = form.querySelector('input[name="company"]');
      if (hp && hp.value) return;

      var nameEl = form.querySelector('input[name="name"]');
      var phoneEl = form.querySelector('input[name="phone"]');
      var emailEl = form.querySelector('input[name="email"]');
      var name = (nameEl.value || '').trim();
      var phone = (phoneEl.value || '').trim();
      var email = (emailEl.value || '').trim();

      var nameBad = name.split(/\s+/).filter(Boolean).length < 2; // first + last name
      var phoneBad = phone.length < 9;
      var emailBad = !validEmail(email);

      show('.name.warning', nameBad);
      show('.phone.warning', phoneBad);
      show('.email.warning', emailBad);
      [[nameEl, nameBad], [phoneEl, phoneBad], [emailEl, emailBad]].forEach(function (p) {
        if (p[1]) p[0].setAttribute('aria-invalid', 'true');
        else p[0].removeAttribute('aria-invalid');
      });

      if (nameBad || phoneBad || emailBad) {
        if (msg) msg.hidden = true;
        (nameBad ? nameEl : phoneBad ? phoneEl : emailEl).focus();
        return;
      }

      // valid: production posted the lead here - the demo only says so
      if (msg) {
        msg.textContent = DEMO_MSG;
        msg.hidden = false;
      }
    });
  }

  /* ---------- click-to-load video (no YouTube request until play) ---------- */
  Array.prototype.forEach.call(document.querySelectorAll('.video-facade[data-yt]'), function (btn) {
    btn.addEventListener('click', function () {
      var id = btn.getAttribute('data-yt');
      if (!/^[\w-]{6,20}$/.test(id)) return;
      var shell = btn.closest('.video-shell') || btn.parentNode;
      var f = document.createElement('iframe');
      f.src = 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0&modestbranding=1';
      f.title = btn.getAttribute('data-title') || 'YouTube';
      f.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      f.referrerPolicy = 'strict-origin-when-cross-origin';
      f.allowFullscreen = true;
      shell.appendChild(f);
      btn.remove();
      f.focus();
    });
  });
})();
