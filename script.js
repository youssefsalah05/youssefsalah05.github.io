/* Three behaviours: language toggle, copy email, nav highlighting. */
(function () {
  'use strict';

  var root = document.documentElement;
  var toggle = document.getElementById('lang-toggle');
  var nav = document.getElementById('site-nav');
  var copyBtn = document.getElementById('copy-email');

  /* Language choice lives here only — no localStorage, no sessionStorage. */
  var currentLang = 'en';

  var UI = {
    en: {
      dir: 'ltr',
      navLabel: 'Sections',
      toggleText: 'ع',
      toggleTextLang: 'ar',
      toggleLabel: 'Switch to Arabic',
      copyLabel: 'Copy email address',
      copy: 'Copy',
      copied: 'Copied'
    },
    ar: {
      dir: 'rtl',
      navLabel: 'الأقسام',
      toggleText: 'EN',
      toggleTextLang: 'en',
      toggleLabel: 'التبديل إلى الإنجليزية',
      copyLabel: 'نسخ البريد الإلكتروني',
      copy: 'نسخ',
      copied: 'تم النسخ'
    }
  };

  /* ---- 1. language toggle ------------------------------------------ */

  var switchTimer = null;

  function setLanguage(lang) {
    var ui = UI[lang];
    currentLang = lang;

    root.setAttribute('lang', lang);
    root.setAttribute('dir', ui.dir);

    root.classList.add('is-switching');
    window.clearTimeout(switchTimer);
    switchTimer = window.setTimeout(function () {
      root.classList.remove('is-switching');
    }, 180);

    if (nav) { nav.setAttribute('aria-label', ui.navLabel); }

    if (toggle) {
      toggle.textContent = ui.toggleText;
      toggle.setAttribute('lang', ui.toggleTextLang);
      toggle.setAttribute('aria-label', ui.toggleLabel);
    }

    if (copyBtn) { copyBtn.setAttribute('aria-label', ui.copyLabel); }
    setCopyLabel(false);
  }

  if (toggle) {
    toggle.addEventListener('click', function () {
      setLanguage(currentLang === 'en' ? 'ar' : 'en');
    });
  }

  /* ---- 2. copy the email address ----------------------------------- */

  var copyEn = copyBtn ? copyBtn.querySelector('[data-lang="en"]') : null;
  var copyAr = copyBtn ? copyBtn.querySelector('[data-lang="ar"]') : null;
  var copyTimer = null;

  function setCopyLabel(done) {
    if (!copyEn || !copyAr) { return; }
    copyEn.textContent = done ? UI.en.copied : UI.en.copy;
    copyAr.textContent = done ? UI.ar.copied : UI.ar.copy;
  }

  function confirmCopy() {
    setCopyLabel(true);
    window.clearTimeout(copyTimer);
    copyTimer = window.setTimeout(function () { setCopyLabel(false); }, 2000);
  }

  function fallbackCopy(text) {
    var field = document.createElement('textarea');
    field.value = text;
    field.setAttribute('readonly', '');
    field.style.position = 'fixed';
    field.style.top = '-1000px';
    field.style.opacity = '0';
    document.body.appendChild(field);
    field.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (err) { ok = false; }
    document.body.removeChild(field);
    return ok;
  }

  if (copyBtn) {
    copyBtn.addEventListener('click', function () {
      var text = copyBtn.getAttribute('data-copy') || '';
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(confirmCopy, function () {
          if (fallbackCopy(text)) { confirmCopy(); }
        });
      } else if (fallbackCopy(text)) {
        confirmCopy();
      }
    });
  }

  /* ---- 3. sticky nav highlighting ---------------------------------- */

  var links = [].slice.call(document.querySelectorAll('.site-nav a[href^="#"]'));
  var sections = [];

  links.forEach(function (link) {
    var section = document.getElementById(link.getAttribute('href').slice(1));
    if (section) { sections.push(section); }
  });

  function setActive(id) {
    links.forEach(function (link) {
      var on = link.getAttribute('href') === '#' + id;
      link.classList.toggle('is-current', on);
      if (on) {
        link.setAttribute('aria-current', 'true');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }

  if (sections.length && 'IntersectionObserver' in window) {
    var inView = [];
    var atEnd = false;
    var footer = document.querySelector('.site-footer');

    /* The closing section is too short to reach the top of the viewport,
       so a visible footer stands in for "the end of the page". */
    var refresh = function () {
      if (atEnd) {
        setActive(sections[sections.length - 1].id);
        return;
      }
      if (!inView.length) { return; }
      inView.sort(function (a, b) {
        return sections.indexOf(a) - sections.indexOf(b);
      });
      setActive(inView[0].id);
    };

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var at = inView.indexOf(entry.target);
        if (entry.isIntersecting && at === -1) { inView.push(entry.target); }
        if (!entry.isIntersecting && at > -1) { inView.splice(at, 1); }
      });
      refresh();
    }, { rootMargin: '-100px 0px -55% 0px', threshold: 0 });

    sections.forEach(function (section) { observer.observe(section); });

    if (footer) {
      new IntersectionObserver(function (entries) {
        atEnd = entries[0].isIntersecting;
        refresh();
      }, { threshold: 0 }).observe(footer);
    }
  }

  setActive(sections.length ? sections[0].id : '');
  setLanguage(currentLang);
}());
