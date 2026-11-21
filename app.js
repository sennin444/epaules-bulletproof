(function () {
  var c = window.EB_CONFIG || {};
  var $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };
  var pct = c.discountPct || Math.round((1 - c.price / c.priceAfter) * 100);
  // Après la fin du lancement : prix plein, plus de bandeau ni de prix barré
  var ended = c.launchEndsAt && Date.now() > new Date(c.launchEndsAt).getTime();
  if (ended) {
    c = Object.assign({}, c, { price: c.priceAfter, showDiscountBadge: false });
    $$("[data-launch-only], s.was, .big-was, .sticky s").forEach(function (el) { el.hidden = true; el.style.display = "none"; });
  }
  if (c.whopUrl) {
    c.showMockTags = false;
    $$("#paiement .express, #paiement .or, #paiement .field").forEach(function (el) { el.parentNode.removeChild(el); });
    $$("[data-whop-note]").forEach(function (el) { el.hidden = false; });
    if (!c.whopUrlBump) $$("#paiement .bump, [data-bump-line]").forEach(function (el) { el.parentNode.removeChild(el); });
  }
  if (c.showMockTags === false) $$(".mock-tag, .mock-note").forEach(function (el) { el.remove(); });

  $$("[data-price]").forEach(function (el) { el.textContent = c.price; });
  $$("[data-price-after]").forEach(function (el) { el.textContent = c.priceAfter; });
  $$("[data-save]").forEach(function (el) { el.textContent = c.priceAfter - c.price; });
  $$("[data-pct]").forEach(function (el) { el.textContent = pct; });
  $$("[data-bump-price]").forEach(function (el) { el.textContent = c.bumpPrice; });
  $$("[data-upsell-price]").forEach(function (el) { el.textContent = c.upsellPrice; });
  $$("[data-slots]").forEach(function (el) { el.textContent = c.bilanSlotsPerWeek || 10; });
  if (!c.showDiscountBadge) $$(".badge").forEach(function (el) { el.hidden = true; });
  if (!c.showProofSlots) $$("[data-proof-slot]").forEach(function (el) { el.remove(); });

  // Liens
  $$("[data-checkout]").forEach(function (a) {
    a.href = c.checkoutUrl || "#paiement";
  });
  $$("[data-access]").forEach(function (a) { if (c.accessUrl) a.href = c.accessUrl; });
  $$("[data-calendly]").forEach(function (a) { if (c.calendlyUrl) a.href = c.calendlyUrl; });

  // Meta : InitiateCheckout une seule fois, quand on commence vraiment à payer
  var icSent = false;
  function ic() { if (icSent || !window.fbq) return; icSent = true; fbq("track", "InitiateCheckout", { value: c.price, currency: "EUR" }); }
  $$("[data-ic]").forEach(function (el) { el.addEventListener("focus", ic); el.addEventListener("click", ic); });

  // Compte à rebours
  var end = new Date(c.launchEndsAt).getTime(), cds = $$("[data-countdown]");
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function tick() {
    var s = Math.max(0, Math.floor((end - Date.now()) / 1000));
    var d = Math.floor(s / 86400), h = Math.floor(s % 86400 / 3600), m = Math.floor(s % 3600 / 60);
    cds.forEach(function (el) {
      if (s === 0) { el.textContent = "quelques heures"; return; }
      el.textContent = el.hasAttribute("data-compact") ? d + "j " + pad(h) + "h " + pad(m) + "m" : d + " j " + pad(h) + " h " + pad(m) + " min";
    });
  }
  if (cds.length) { tick(); setInterval(tick, 20000); }
  var bigs = $$("[data-cd]");
  function tickBig() {
    var s = Math.max(0, Math.floor((end - Date.now()) / 1000));
    var v = { d: Math.floor(s / 86400), h: Math.floor(s % 86400 / 3600), m: Math.floor(s % 3600 / 60), s: s % 60 };
    bigs.forEach(function (el) { el.textContent = pad(v[el.getAttribute("data-cd")]); });
  }
  if (bigs.length) { tickBig(); setInterval(tickBig, 1000); }

  // Barre mobile : apparaît après le CTA du hero
  var sticky = document.querySelector(".sticky"), heroCta = document.querySelector(".hero .btn"), finalSec = document.querySelector(".final");
  if (sticky && heroCta && "IntersectionObserver" in window) {
    var pastHero = false, atFinal = false;
    function upd() { sticky.classList.toggle("on", pastHero && !atFinal); }
    new IntersectionObserver(function (e) { pastHero = !e[0].isIntersecting && e[0].boundingClientRect.top < 0; upd(); }).observe(heroCta);
    var hide = [finalSec, document.getElementById("paiement")].filter(Boolean), vis = new Map();
    hide.forEach(function (el) { new IntersectionObserver(function (e) { vis.set(el, e[0].isIntersecting); atFinal = Array.from(vis.values()).some(Boolean); upd(); }).observe(el); });
  }

  // Paiement : bump + total, puis Whop (ou la maquette tant que whopUrl est vide)
  var bump = document.getElementById("bump"), pay = document.getElementById("pay");
  var bumpOn = function () { return !!(bump && bump.isConnected && bump.checked); };
  if (pay) {
    var paint = function () {
      var on = bumpOn(), total = c.price + (on ? c.bumpPrice : 0);
      $$("[data-total]").forEach(function (el) { el.textContent = total; });
      $$("[data-bump-line]").forEach(function (el) { el.hidden = !on; });
    };
    if (bump) bump.addEventListener("change", paint);
    paint();
    var consent = document.getElementById("consent"), err = document.getElementById("consent-err"), wrap = document.getElementById("consent-wrap");
    if (consent) consent.addEventListener("change", function () { if (consent.checked) { err.hidden = true; wrap.classList.remove("need"); } });
    pay.addEventListener("click", function (e) {
      e.preventDefault();
      if (consent && !consent.checked) { err.hidden = false; wrap.classList.add("need"); consent.focus(); return; }
      ic();
      if (c.whopUrl) { location.href = (bumpOn() && c.whopUrlBump) ? c.whopUrlBump : c.whopUrl; return; }
      location.href = "acces?total=" + (c.price + (bumpOn() ? c.bumpPrice : 0)) + (bumpOn() ? "&bump=1" : "");
    });
  }

  // Upsell
  $$("[data-upsell]").forEach(function (a) {
    a.href = c.upsellUrl || ("acces?upsell=1" + (/bump=1/.test(location.search) ? "&bump=1" : ""));
  });
  $$("[data-skip]").forEach(function (a) { a.href = "acces" + (/bump=1/.test(location.search) ? "?bump=1" : ""); });

  // Accès
  if (/upsell=1/.test(location.search)) $$("[data-if-upsell]").forEach(function (el) { el.hidden = false; });
  if (/bump=1/.test(location.search)) $$("[data-if-bump]").forEach(function (el) { el.hidden = false; });

  // Animations : entrée au scroll (une seule fois) + compteurs
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  function countUp(el) {
    var to = parseFloat(el.getAttribute("data-count")), from = parseFloat(el.getAttribute("data-from") || 0);
    if (reduce || isNaN(to)) { el.textContent = to; return; }
    var t0 = null, dur = 900;
    function step(t) {
      if (!t0) t0 = t;
      var k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      el.textContent = Math.round(from + (to - from) * e);
      if (k < 1) requestAnimationFrame(step);
    }
    el.textContent = from; requestAnimationFrame(step);
  }
  if ("IntersectionObserver" in window) {
    var delays = [0, 60, 110, 150, 180];
    var io = new IntersectionObserver(function (entries) {
      var batch = entries.filter(function (e) { return e.isIntersecting; });
      batch.forEach(function (e, i) {
        var el = e.target; io.unobserve(el);
        if (el.hasAttribute("data-count")) { countUp(el); return; }
        el.style.transitionDelay = (reduce ? 0 : delays[Math.min(i, delays.length - 1)]) + "ms";
        el.classList.add("in");
      });
    }, { rootMargin: "0px 0px -10% 0px" });
    $$("[data-reveal], [data-count]").forEach(function (el) { io.observe(el); });
  } else {
    $$("[data-reveal]").forEach(function (el) { el.classList.add("in"); });
  }

  // Check-list : compteur
  var cl = document.querySelector("[data-checklist]"), cc = document.querySelector("[data-check-count]");
  if (cl && cc) cl.addEventListener("change", function () {
    var n = cl.querySelectorAll("input:checked").length;
    cc.innerHTML = n === 0 ? "Coche les cases qui te ressemblent." : "<b>" + n + "/6</b> coché" + (n > 1 ? "es" : "e") + ".";
  });

  // Une seule vidéo témoignage à la fois
  var vids = Array.prototype.slice.call(document.querySelectorAll(".story-vid video"));
  vids.forEach(function (v) { v.addEventListener("play", function () { vids.forEach(function (o) { if (o !== v) o.pause(); }); }); });

  // Meta Pixel
  if (c.metaPixelId) {
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
    fbq("init", c.metaPixelId); fbq("track", "PageView");
    var mt = /[?&]total=(\d+)/.exec(location.search);
    if (mt && /acces/.test(location.pathname)) fbq("track", "Purchase", { value: +mt[1], currency: "EUR" });
  }
})();
