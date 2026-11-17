(function () {
  var c = window.EB_CONFIG || {};
  var $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };
  var pct = Math.round((1 - c.price / c.priceAfter) * 100);

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
    a.href = c.checkoutUrl || "checkout";
    a.addEventListener("click", function () { if (window.fbq) fbq("track", "InitiateCheckout", { value: c.price, currency: "EUR" }); });
  });
  $$("[data-access]").forEach(function (a) { if (c.accessUrl) a.href = c.accessUrl; });
  $$("[data-calendly]").forEach(function (a) { if (c.calendlyUrl) a.href = c.calendlyUrl; });

  // Places Bilan
  $$("[data-slotbar]").forEach(function (bar) {
    var n = c.bilanSlotsPerWeek || 10;
    bar.style.gridTemplateColumns = "repeat(" + n + ", 1fr)";
    for (var i = 0; i < n; i++) { var x = document.createElement("i"); if (i < Math.ceil(n * 0.4)) x.className = "taken"; bar.appendChild(x); }
  });

  // Compte à rebours
  var end = new Date(c.launchEndsAt).getTime(), cds = $$("[data-countdown]");
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function tick() {
    var s = Math.max(0, Math.floor((end - Date.now()) / 1000));
    var d = Math.floor(s / 86400), h = Math.floor(s % 86400 / 3600), m = Math.floor(s % 3600 / 60);
    cds.forEach(function (el) { el.textContent = s === 0 ? "quelques heures" : d + " j " + pad(h) + " h " + pad(m) + " min"; });
  }
  if (cds.length) { tick(); setInterval(tick, 20000); }

  // Barre mobile : apparaît après le CTA du hero
  var sticky = document.querySelector(".sticky"), heroCta = document.querySelector(".hero .btn"), finalSec = document.querySelector(".final");
  if (sticky && heroCta && "IntersectionObserver" in window) {
    var pastHero = false, atFinal = false;
    function upd() { sticky.classList.toggle("on", pastHero && !atFinal); }
    new IntersectionObserver(function (e) { pastHero = !e[0].isIntersecting && e[0].boundingClientRect.top < 0; upd(); }).observe(heroCta);
    if (finalSec) new IntersectionObserver(function (e) { atFinal = e[0].isIntersecting; upd(); }).observe(finalSec);
  }

  // Checkout (maquette) : bump + total
  var bump = document.getElementById("bump");
  if (bump) {
    var paint = function () {
      var on = bump.checked, total = c.price + (on ? c.bumpPrice : 0);
      $$("[data-total]").forEach(function (el) { el.textContent = total; });
      $$("[data-bump-line]").forEach(function (el) { el.hidden = !on; });
    };
    bump.addEventListener("change", paint); paint();
    var pay = document.getElementById("pay");
    pay.addEventListener("click", function (e) {
      e.preventDefault();
      location.href = "merci" + (bump.checked ? "?bump=1" : "");
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

  // Meta Pixel
  if (c.metaPixelId) {
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
    fbq("init", c.metaPixelId); fbq("track", "PageView");
  }
})();
