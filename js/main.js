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
  function renderSocial() {
    const wrap = document.getElementById("footerSocial");
    const icons = { facebook: "f", youtube: "▶", telegram: "✈", x: "𝕏", instagram: "◎" };
    const social = CONFIG.social || {};
    wrap.innerHTML = "";
    Object.keys(social).forEach((key) => {
      if (social[key]) {
        const a = document.createElement("a");
        a.href = social[key];
        a.target = "_blank";
        a.rel = "noopener";
        a.textContent = icons[key] || "•";
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
    ["gallery1", "gallery2", "gallery3", "gallery4"].forEach((key) => {
      const src = CONFIG.images && CONFIG.images[key];
      const el = document.createElement("div");
      el.className = "phone-mock reveal";
      el.innerHTML = src
        ? `<img src="${src}" alt="">`
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
        <button class="faq-q">
          <span>${t("faq_q" + n)}</span>
          <span class="plus">+</span>
        </button>
        <div class="faq-a"><p>${t("faq_a" + n)}</p></div>`;
      item.querySelector(".faq-q").addEventListener("click", () => {
        const wasOpen = item.classList.contains("open");
        list.querySelectorAll(".faq-item").forEach((i) => i.classList.remove("open"));
        if (!wasOpen) item.classList.add("open");
      });
      list.appendChild(item);
    });
  }

  /* ---------- apply data-i18n / data-i18n-attr / data-config ---------- */
  function applyTranslations() {
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      const val = t(key);
      if (val) el.textContent = val;
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
    toggle.addEventListener("click", () => links.classList.toggle("open"));
    links.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => links.classList.remove("open"))
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
    setupLangToggle();
    setupCounterTrigger();
    observeReveal();

    document.body.style.transition = "opacity .25s ease";
    setTimeout(() => {
      document.getElementById("pageLoader").classList.add("hidden");
    }, 350);
  });
})();
