/* =========================================================
   REDOTPAY LANDING — MAIN JS
   Reads CONFIG (config.js) and TRANSLATIONS_EN/AR (lang/*.js)
   No visible UI text or links are hardcoded here or in HTML —
   everything is rendered from those two sources.
   ========================================================= */

(function () {
  "use strict";

  const LANGS = { en: TRANSLATIONS_EN, ar: TRANSLATIONS_AR };

  /* ---------- language detection & persistence ---------- */
  function detectInitialLang() {
    const saved = localStorage.getItem("redotpay_lang");
    if (saved && LANGS[saved]) return saved;
    const nav = (navigator.language || "en").toLowerCase();
    return nav.startsWith("ar") ? "ar" : "en";
  }

  let currentLang = detectInitialLang();

  function t(key) {
    return (LANGS[currentLang] && LANGS[currentLang][key]) || (LANGS.en[key]) || "";
  }

  function getConfigValue(path) {
    return path.split(".").reduce((obj, k) => (obj ? obj[k] : undefined), CONFIG);
  }

  /* ---------- apply CSS theme tokens from CONFIG ---------- */
  function applyTheme() {
    const root = document.documentElement;
    const th = CONFIG.theme || {};
    const map = {
      primary: "--primary", secondary: "--secondary", accent: "--accent",
      bg: "--bg", bgElevated: "--bg-elevated", bgElevated2: "--bg-elevated-2",
      border: "--border", textPrimary: "--text", textMuted: "--text-muted"
    };
    Object.keys(map).forEach((k) => {
      if (th[k]) root.style.setProperty(map[k], th[k]);
    });
  }

  /* ---------- apply referral link + video url to all CTAs ---------- */
  function applyLinks() {
    document.querySelectorAll("[data-cta]").forEach((el) => {
      el.setAttribute("href", CONFIG.referralLink || "#");
      el.setAttribute("target", "_blank");
      el.setAttribute("rel", "noopener sponsored");
    });
    document.querySelectorAll("[data-video-trigger]").forEach((el) => {
      el.addEventListener("click", (e) => {
        e.preventDefault();
        openVideoModal();
      });
      // Keyboard support for non-anchor triggers (e.g. the video frame div)
      el.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openVideoModal();
        }
      });
    });
  }

  function toEmbedUrl(url) {
    if (!url) return "";
    try {
      const u = new URL(url);
      if (u.hostname.includes("youtu.be")) return `https://www.youtube.com/embed/${u.pathname.slice(1)}`;
      if (u.searchParams.get("v")) return `https://www.youtube.com/embed/${u.searchParams.get("v")}`;
      if (u.pathname.includes("/embed/")) return url;
    } catch (e) { /* not a valid URL */ }
    return "";
  }

  function openVideoModal() {
    const modal = document.getElementById("videoModal");
    const body = document.getElementById("videoModalBody");
    const embed = toEmbedUrl(CONFIG.youtubeVideo);
    if (embed) {
      body.innerHTML = `<iframe src="${embed}" style="width:100%;height:100%;border:0;border-radius:12px" allow="autoplay; encrypted-media" allowfullscreen title="tutorial"></iframe>`;
    } else {
      body.innerHTML = `<span>Set <code>CONFIG.youtubeVideo</code> in config.js to embed the tutorial</span>`;
    }
    modal.style.display = "flex";
  }
  function closeVideoModal() {
    document.getElementById("videoModal").style.display = "none";
    document.getElementById("videoModalBody").innerHTML = "";
  }

  /* ---------- apply images from CONFIG.images with graceful fallback ---------- */
  function applyImages() {
    document.querySelectorAll("[data-img]").forEach((img) => {
      const key = img.getAttribute("data-img");
      const src = CONFIG.images && CONFIG.images[key];
      if (src) {
        img.src = src;
        img.style.display = "block";
        const fallback = document.querySelector(`[data-img-fallback="${key}"]`);
        if (fallback) fallback.style.display = "none";
      }
    });
    const logo = CONFIG.logo;
    if (logo) {
      document.querySelectorAll("#navLogo, .nav-logo").forEach((wrap) => {
        wrap.innerHTML = `<img src="${logo}" alt="RedotPay logo">`;
      });
    }
    if (CONFIG.favicon) {
      document.getElementById("favicon-link").setAttribute("href", CONFIG.favicon);
    }

    // Open Graph / Twitter preview image — prefers a square favicon/logo asset,
    // falls back to the hero image so a share preview always has *something*.
    const previewImage = CONFIG.favicon || logo || (CONFIG.images && CONFIG.images.hero) || "";
    if (previewImage) {
      const ogImage = document.getElementById("og-image");
      const twitterImage = document.getElementById("twitter-image");
      if (ogImage) ogImage.setAttribute("content", previewImage);
      if (twitterImage) twitterImage.setAttribute("content", previewImage);
    }
    const ogUrl = document.getElementById("og-url");
    if (ogUrl) ogUrl.setAttribute("content", window.location.href);
  }

  /* ---------- render footer social links (only show configured ones) ---------- */
  const SOCIAL_ICONS = {
    facebook: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13.5 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.25-1.5 1.55-1.5h1.65V3.6c-.3-.04-1.3-.13-2.45-.13-2.4 0-4.05 1.47-4.05 4.17v2.33H7.5V13h2.7v8h3.3z"/></svg>',
    youtube: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M23 12s0-3.85-.5-5.7c-.27-1-1.08-1.8-2.1-2.07C18.55 3.75 12 3.75 12 3.75s-6.55 0-8.4.48c-1.02.27-1.83 1.07-2.1 2.07C1 8.15 1 12 1 12s0 3.85.5 5.7c.27 1 1.08 1.8 2.1 2.07 1.85.48 8.4.48 8.4.48s6.55 0 8.4-.48c1.02-.27 1.83-1.07 2.1-2.07.5-1.85.5-5.7.5-5.7zM9.75 15.5v-7L15.5 12l-5.75 3.5z"/></svg>',
    telegram: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M21.9 4.1c.3-1.2-.85-1.85-1.9-1.4L2.55 10.06c-1.15.46-1.1 1.65.02 1.98l4.44 1.39 1.7 5.34c.3.86 1.3 1.06 1.9.4l2.6-2.6 4.5 3.32c.83.61 2.03.16 2.24-.85L21.9 4.1zM8.6 12.9l8.3-5.2c.4-.25.8.3.44.6l-6.6 5.97-.26 3.05-1.88-4.42z"/></svg>',
    x: '<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.9 2H22l-7.03 8.03L23.25 22H16.7l-5.13-6.7L5.7 22H2.55l7.52-8.6L1.25 2H8l4.63 6.13L18.9 2zm-1.1 18.1h1.72L7.08 3.8H5.23L17.8 20.1z"/></svg>',
    instagram: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.16c3.2 0 3.58.01 4.85.07 3.25.15 4.77 1.7 4.92 4.92.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.15 3.22-1.66 4.77-4.92 4.92-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-3.26-.15-4.77-1.7-4.92-4.92C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85C2.38 3.93 3.9 2.38 7.15 2.23 8.42 2.17 8.8 2.16 12 2.16zm0 3.68a6.16 6.16 0 100 12.32 6.16 6.16 0 000-12.32zm0 10.16a4 4 0 110-8 4 4 0 010 8zm6.4-11.85a1.44 1.44 0 100 2.88 1.44 1.44 0 000-2.88z"/></svg>'
  };
  function renderSocial() {
    const wrap = document.getElementById("footerSocial");
    const social = CONFIG.social || {};
    wrap.innerHTML = "";
    Object.keys(social).forEach((key) => {
      if (social[key]) {
        const a = document.createElement("a");
        // Config values are kept as-is; only ensure the href is absolute so the
        // browser doesn't treat "facebook.com/..." as a relative path.
        const url = social[key];
        a.href = /^https?:\/\//i.test(url) ? url : "https://" + url;
        a.target = "_blank";
        a.rel = "noopener";
        a.innerHTML = SOCIAL_ICONS[key] || "•";
        a.setAttribute("aria-label", key);
        wrap.appendChild(a);
      }
    });
  }

  /* ---------- data-driven repeating sections ---------- */
  const FEATURE_ICONS = {
    feat_virtual_card: "💳", feat_physical_card: "🪪", feat_worldwide: "🌍",
    feat_multicurrency: "👛", feat_crypto: "◎", feat_p2p: "🤝",
    feat_transfers: "⚡", feat_rewards: "🎁", feat_security: "🔒", feat_support: "🎧"
  };
  function renderFeatures() {
    const grid = document.getElementById("featureGrid");
    grid.innerHTML = "";
    Object.keys(FEATURE_ICONS).forEach((prefix) => {
      const card = document.createElement("div");
      card.className = "card reveal";
      card.innerHTML = `
        <div class="card-icon">${FEATURE_ICONS[prefix]}</div>
        <h4>${t(prefix + "_title")}</h4>
        <p>${t(prefix + "_desc")}</p>`;
      grid.appendChild(card);
    });
    observeReveal();
  }

  const USECASE_ICONS = {
    usecase_shopping: "🛍", usecase_online: "💻", usecase_subscriptions: "🔁",
    usecase_travel: "✈️", usecase_withdraw: "🏧", usecase_transfer: "↔️",
    usecase_store: "🗄", usecase_pay: "🌐"
  };
  function renderUsecases() {
    const grid = document.getElementById("usecaseGrid");
    grid.innerHTML = "";
    Object.keys(USECASE_ICONS).forEach((key) => {
      const el = document.createElement("div");
      el.className = "usecase-pill reveal";
      el.innerHTML = `<span class="ic">${USECASE_ICONS[key]}</span><span>${t(key)}</span>`;
      grid.appendChild(el);
    });
    observeReveal();
  }

  function renderSteps() {
    const grid = document.getElementById("stepsGrid");
    grid.innerHTML = "";
    [1, 2, 3, 4].forEach((n) => {
      const el = document.createElement("div");
      el.className = "timeline-step reveal";
      el.innerHTML = `
        <div class="timeline-num">${n}</div>
        <h4>${t("step_" + n + "_title")}</h4>
        <p>${t("step_" + n + "_desc")}</p>`;
      grid.appendChild(el);
    });
    observeReveal();
  }

  function renderGallery() {
    const grid = document.getElementById("galleryGrid");
    grid.innerHTML = "";
    ["gallery1", "gallery2", "gallery3", "gallery4"].forEach((key, i) => {
      const src = CONFIG.images && CONFIG.images[key];
      const el = document.createElement("div");
      el.className = "phone-mock reveal";
      const altText = (currentLang === "ar" ? "لقطة من تطبيق RedotPay " : "RedotPay app screenshot ") + (i + 1);
      el.innerHTML = src
        ? `<img src="${src}" alt="${altText}" loading="lazy" decoding="async">`
        : `<div class="placeholder-fill">${key}</div>`;
      grid.appendChild(el);
    });
    observeReveal();
  }

  let testiIndex = 0;
  function renderTestimonials() {
    const track = document.getElementById("testiTrack");
    track.innerHTML = "";
    [1, 2, 3, 4, 5].forEach((n) => {
      const el = document.createElement("div");
      el.className = "testi-card";
      el.innerHTML = `
        <div class="testi-stars">★★★★★</div>
        <p class="testi-text">${t("t" + n + "_text")}</p>
        <div class="testi-source"><span>—</span><span>${t("t" + n + "_source")}</span></div>`;
      track.appendChild(el);
    });
    testiIndex = 0;
    updateTestiPosition();
  }
  function updateTestiPosition() {
    const track = document.getElementById("testiTrack");
    const card = track.querySelector(".testi-card");
    if (!card) return;
    const gap = 20;
    const width = card.getBoundingClientRect().width + gap;
    const dir = currentLang === "ar" ? 1 : -1;
    track.style.transform = `translateX(${dir * testiIndex * width}px)`;
  }

  function renderFaq() {
    const list = document.getElementById("faqList");
    list.innerHTML = "";
    [1, 2, 3, 4, 5, 6].forEach((n) => {
      const item = document.createElement("div");
      item.className = "faq-item";
      item.innerHTML = `
        <button class="faq-q" aria-expanded="false">
          <span>${t("faq_q" + n)}</span>
          <span class="plus" aria-hidden="true">+</span>
        </button>
        <div class="faq-a"><p>${t("faq_a" + n)}</p></div>`;
      item.querySelector(".faq-q").addEventListener("click", () => {
        const wasOpen = item.classList.contains("open");
        list.querySelectorAll(".faq-item").forEach((i) => {
          i.classList.remove("open");
          i.querySelector(".faq-q").setAttribute("aria-expanded", "false");
        });
        if (!wasOpen) {
          item.classList.add("open");
          item.querySelector(".faq-q").setAttribute("aria-expanded", "true");
        }
      });
      list.appendChild(item);
    });
  }

  /* ---------- apply data-i18n / data-i18n-attr / data-config ---------- */
  function applyTranslations() {
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      const val = t(key);
      if (val) {
        el.textContent = val;
        el.style.removeProperty("display");
      } else if (el.matches(".footer-links a")) {
        // Hide footer links that have no translation text (e.g. empty privacy/terms)
        el.style.display = "none";
      }
    });
    document.querySelectorAll("[data-i18n-attr]").forEach((el) => {
      const [attr, key] = el.getAttribute("data-i18n-attr").split(":");
      const val = t(key);
      if (val) el.setAttribute(attr, val);
    });
    document.querySelectorAll("[data-config]").forEach((el) => {
      const val = getConfigValue(el.getAttribute("data-config"));
      if (val !== undefined) el.textContent = val;
    });
    document.getElementById("langToggleLabel").textContent = t("lang_switch");
    document.title = t("meta_title");
    // Keep og:locale in sync with the active language for correct share previews
    const ogLocale = document.querySelector('meta[property="og:locale"]');
    if (ogLocale) ogLocale.setAttribute("content", currentLang === "ar" ? "ar_AR" : "en_US");
  }

  function setDirection() {
    const html = document.documentElement;
    html.setAttribute("lang", currentLang);
    html.setAttribute("dir", currentLang === "ar" ? "rtl" : "ltr");
  }

  function renderAll() {
    setDirection();
    applyTranslations();
    renderFeatures();
    renderUsecases();
    renderSteps();
    renderGallery();
    renderTestimonials();
    renderFaq();
  }

  function switchLang(lang) {
    if (!LANGS[lang]) return;
    currentLang = lang;
    localStorage.setItem("redotpay_lang", lang);
    document.body.style.opacity = "0";
    setTimeout(() => {
      renderAll();
      document.body.style.opacity = "1";
    }, 150);
  }

  /* ---------- animated counters ---------- */
  function animateCounters() {
    document.querySelectorAll("[data-counter]").forEach((el) => {
      if (el.dataset.done) return;
      const target = parseFloat(el.getAttribute("data-value"));
      const prefix = el.getAttribute("data-prefix") || "";
      const suffix = el.getAttribute("data-suffix") || "";
      const decimals = (el.getAttribute("data-value").split(".")[1] || "").length;
      let current = 0;
      const duration = 1400;
      const start = performance.now();
      function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        current = target * eased;
        el.textContent = prefix + current.toFixed(decimals) + suffix;
        if (progress < 1) requestAnimationFrame(tick);
        else el.dataset.done = "true";
      }
      requestAnimationFrame(tick);
    });
  }

  /* ---------- scroll reveal ---------- */
  let revealObserver;
  function observeReveal() {
    if (!revealObserver) {
      revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("in-view");
              revealObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15 }
      );
    }
    document.querySelectorAll(".reveal:not(.in-view)").forEach((el) => revealObserver.observe(el));
  }

  /* ---------- counters trigger on scroll into view ---------- */
  function setupCounterTrigger() {
    const section = document.querySelector(".trust-section");
    if (!section) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounters();
            obs.disconnect();
          }
        });
      },
      { threshold: 0.4 }
    );
    obs.observe(section);
  }

  /* ---------- nav toggle (mobile) ---------- */
  function setupNav() {
    const toggle = document.getElementById("navToggle");
    const links = document.getElementById("navLinks");
    toggle.setAttribute("aria-expanded", "false");
    toggle.addEventListener("click", () => {
      const open = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    links.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => {
        links.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      })
    );
  }

  /* ---------- floating cta + back to top ---------- */
  function setupScrollUI() {
    const floating = document.getElementById("floatingCta");
    const backToTop = document.getElementById("backToTop");
    window.addEventListener("scroll", () => {
      const show = window.scrollY > 600;
      floating.classList.toggle("visible", show);
      backToTop.classList.toggle("visible", show);
    });
    backToTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  }

  /* ---------- testimonial controls ---------- */
  function setupTestiControls() {
    document.getElementById("testiNext").addEventListener("click", () => {
      const max = document.querySelectorAll(".testi-card").length - 1;
      testiIndex = Math.min(testiIndex + 1, max);
      updateTestiPosition();
    });
    document.getElementById("testiPrev").addEventListener("click", () => {
      testiIndex = Math.max(testiIndex - 1, 0);
      updateTestiPosition();
    });
    window.addEventListener("resize", updateTestiPosition);
  }

  /* ---------- video modal close handlers ---------- */
  function setupVideoModal() {
    document.getElementById("videoModalClose").addEventListener("click", closeVideoModal);
    document.getElementById("videoModal").addEventListener("click", (e) => {
      if (e.target.id === "videoModal") closeVideoModal();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeVideoModal();
    });
  }

  /* ---------- promo codes: copy buttons + contact link ---------- */
  function setupPromoCodes() {
    document.querySelectorAll("[data-copy-config]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const value = getConfigValue(btn.getAttribute("data-copy-config"));
        if (!value) return;
        const done = () => {
          const label = btn.querySelector("[data-i18n]");
          if (label) {
            label.textContent = t("code_copied");
            setTimeout(() => { label.textContent = t("code_copy"); }, 1800);
          }
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(value).then(done).catch(done);
        } else {
          // Fallback for older browsers / non-secure contexts
          const ta = document.createElement("textarea");
          ta.value = value;
          ta.style.position = "fixed";
          ta.style.opacity = "0";
          document.body.appendChild(ta);
          ta.select();
          try { document.execCommand("copy"); } catch (e) { /* ignore */ }
          document.body.removeChild(ta);
          done();
        }
      });
    });

    const contactBtn = document.getElementById("contactFacebookBtn");
    if (contactBtn && CONFIG.contactFacebook) {
      const url = CONFIG.contactFacebook;
      contactBtn.href = /^https?:\/\//i.test(url) ? url : "https://" + url;
    }
  }

  /* ---------- lang toggle button ---------- */
  function setupLangToggle() {
    document.getElementById("langToggle").addEventListener("click", () => {
      switchLang(currentLang === "ar" ? "en" : "ar");
    });
  }

  /* ---------- init ---------- */
  document.addEventListener("DOMContentLoaded", () => {
    applyTheme();
    applyLinks();
    applyImages();
    renderSocial();
    renderAll();
    setupNav();
    setupScrollUI();
    setupTestiControls();
    setupVideoModal();
    setupPromoCodes();
    setupLangToggle();
    setupCounterTrigger();
    observeReveal();

    document.body.style.transition = "opacity .25s ease";
    setTimeout(() => {
      document.getElementById("pageLoader").classList.add("hidden");
    }, 350);
  });
})();
