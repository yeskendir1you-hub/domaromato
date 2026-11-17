/* Dom Aromatov — motion: intro, smooth scroll, scroll-driven pour, reveals, cursor. */
(function () {
  "use strict";
  var S = (window.DA_STATE = window.DA_STATE || { pour: 0, intro: 0, shift: 0, lift: 0, opacity: 1, mx: 0, my: 0 });
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia("(pointer: fine)").matches;
  var mobile = window.matchMedia("(max-width: 767px)").matches;
  var $ = function (s) { return document.querySelector(s); };
  var $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };
  var hasGsap = !!(window.gsap && window.ScrollTrigger);
  if (S.giant == null) S.giant = 1;
  var baseLift = mobile ? 0.55 : 0;
  S.lift = baseLift;

  /* ---------- header gets a solid backdrop once the page moves ---------- */
  var barEl = document.querySelector(".bar");
  function syncBar() { barEl.classList.toggle("solid", window.scrollY > 40); }
  window.addEventListener("scroll", syncBar, { passive: true });
  syncBar();

  /* ---------- intro ---------- */
  var intro = $("#intro"), bar = $("#introBar");
  var sceneReady = false, introDone = false;
  window.addEventListener("da:scene-ready", function () { sceneReady = true; });

  function finishIntro() {
    if (introDone) return; introDone = true;
    document.documentElement.classList.add("ready");
    if (!hasGsap || reduced) {
      intro.remove(); S.intro = 1;
      return;
    }
    var tl = gsap.timeline();
    tl.to(bar, { scaleX: 1, duration: 0.35, ease: "power2.out" })
      .to(".intro-word span", { yPercent: -110, duration: 0.6, ease: "power3.in", stagger: 0.025 }, "+=0.05")
      .to(intro, { clipPath: "inset(0 0 100% 0)", duration: 0.9, ease: "expo.inOut", onComplete: function () { intro.remove(); } }, "-=0.25")
      .add(function () { S.intro = 1; }, "-=0.6")
      .from(".hero-giant .ch, .hero-giant", { yPercent: 110, duration: 1.3, ease: "expo.out", stagger: 0.04 }, "-=0.55")
      .from(".hero-title .ln > span", { yPercent: 110, duration: 1.1, ease: "expo.out", stagger: 0.08 }, "-=1.1")
      .from(".hero-lede, .hero-cta, .scroll-cue, .bar", { opacity: 0, y: 16, duration: 1, ease: "power3.out", stagger: 0.06 }, "-=0.8");
  }

  // split the giant word into letters
  $$("[data-split]").forEach(function (el) {
    el.innerHTML = el.textContent.split("").map(function (c) { return '<span class="ch">' + c + "</span>"; }).join("");
  });

  if (hasGsap && !reduced) {
    gsap.set(bar, { scaleX: 0, transformOrigin: "0 50%" });
    gsap.from(".intro-word span", { yPercent: 110, duration: 0.9, ease: "expo.out", stagger: 0.04 });
    gsap.to(bar, { scaleX: 0.85, duration: 1.6, ease: "power2.out" });
    var started = performance.now();
    (function wait() {
      var t = performance.now() - started;
      if ((sceneReady && t > 1300) || t > 3200) finishIntro(); else requestAnimationFrame(wait);
    })();
  } else {
    finishIntro();
  }

  if (!hasGsap) { S.pour = 1; return; }
  gsap.registerPlugin(ScrollTrigger);

  /* ---------- smooth scroll ---------- */
  var lenis = null;
  if (!reduced && window.Lenis) {
    lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 1, smoothWheel: true });
    window.DA_LENIS = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
    // anchor links glide
    document.addEventListener("click", function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (!a) return;
      var id = a.getAttribute("href");
      if (id.length < 2) return;
      var el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      lenis.scrollTo(el, { offset: id === "#top" ? 0 : -70, duration: 1.6 });
    });
    // freeze page while the set drawer is open
    new MutationObserver(function () {
      if (document.body.classList.contains("locked")) lenis.stop(); else lenis.start();
    }).observe(document.body, { attributes: true, attributeFilter: ["class"] });
  }

  /* ---------- the pour (pinned section) ---------- */
  var num = $("#pourNum");
  if (reduced) {
    S.pour = 1; S.intro = 1;
    $$(".st").forEach(function (s) { s.style.opacity = 1; });
  } else {
    ScrollTrigger.create({
      trigger: "#pour", start: "top top", end: "bottom bottom", scrub: true,
      onUpdate: function (self) { S.pour = self.progress; }
    });
    var stl = gsap.timeline({ scrollTrigger: { trigger: "#pour", start: "top top", end: "bottom bottom", scrub: 0.6 } });
    [".st-1", ".st-2", ".st-3", ".st-4"].forEach(function (sel, i) {
      var at = i * 1;
      stl.fromTo(sel, { opacity: 0, y: 60, filter: "blur(10px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.35, ease: "power2.out" }, at + 0.05);
      if (i < 3) stl.to(sel, { opacity: 0, y: -60, filter: "blur(10px)", duration: 0.3, ease: "power2.in" }, at + 0.75);
    });
    stl.to({}, { duration: 0.3 });
    gsap.ticker.add(function () { if (S.level != null) num.textContent = Math.round(S.level * 100); });

    // hero → pour: giant word drifts, copy fades
    gsap.to(".hero-giant", { yPercent: -30, opacity: 0.15, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
    gsap.to(S, { giant: 0.22, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
    gsap.to(".hero-foot", { y: -80, opacity: 0, ease: "none", scrollTrigger: { trigger: ".hero", start: "40% top", end: "bottom top", scrub: true } });

    // after the pour: flacon floats up and away, canvas fades out
    var exit = { v: 0 };
    gsap.to(exit, {
      v: 1, ease: "none",
      scrollTrigger: { trigger: ".marquee", start: "top bottom", end: "bottom top+=20%", scrub: true },
      onUpdate: function () {
        S.lift = baseLift + exit.v * 2.4;
        S.shift = (mobile ? 0 : 1.2) * exit.v;
        S.opacity = 1 - exit.v;
      }
    });
  }

  /* ---------- marquee speeds up with scroll velocity ---------- */
  var mq = gsap.to("#mqTrack", { xPercent: -50, duration: 38, ease: "none", repeat: -1 });
  if (lenis) lenis.on("scroll", function (e) {
    var v = Math.min(6, Math.abs(e.velocity) * 0.12);
    gsap.to(mq, { timeScale: (e.direction < 0 ? -1 : 1) * (1 + v), duration: 0.4, overwrite: true });
  });
  if (reduced) mq.pause();

  /* ---------- host photo ---------- */
  if (!reduced) {
    gsap.fromTo(".lp-frame", { clipPath: "inset(18% 12% 18% 12% round 220px 220px 24px 24px)" },
      { clipPath: "inset(0% 0% 0% 0% round 240px 240px 24px 24px)", ease: "none", scrollTrigger: { trigger: ".live", start: "top bottom", end: "center center", scrub: true } });
    gsap.fromTo(".lp-frame img", { scale: 1.25, yPercent: -6 }, { scale: 1.02, yPercent: 6, ease: "none", scrollTrigger: { trigger: ".live", start: "top bottom", end: "bottom top", scrub: true } });
    gsap.to(".foot-giant", { xPercent: -8, ease: "none", scrollTrigger: { trigger: ".foot", start: "top bottom", end: "bottom bottom", scrub: true } });
  }

  /* ---------- reveals ---------- */
  if (!reduced) {
    $$(".reveal").forEach(function (el) {
      gsap.from(el, { y: 50, opacity: 0, duration: 1.2, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 88%", once: true } });
    });
  }

  /* ---------- pointer: tilt the flacon, custom cursor, magnetic buttons ---------- */
  window.addEventListener("pointermove", function (e) {
    S.mx = (e.clientX / window.innerWidth) * 2 - 1;
    S.my = (e.clientY / window.innerHeight) * 2 - 1;
  }, { passive: true });

  if (fine && !reduced) {
    var cur = $("#cursor"), cx = -100, cy = -100, tx = -100, ty = -100;
    document.documentElement.classList.add("has-cursor");
    window.addEventListener("pointermove", function (e) { tx = e.clientX; ty = e.clientY; }, { passive: true });
    gsap.ticker.add(function () {
      cx += (tx - cx) * 0.2; cy += (ty - cy) * 0.2;
      cur.style.transform = "translate(" + cx + "px," + cy + "px)";
    });
    document.addEventListener("pointerover", function (e) {
      var hot = e.target.closest("a, button, select, input, textarea, label");
      cur.classList.toggle("hot", !!hot);
    });
    $$(".magnet").forEach(function (b) {
      b.addEventListener("pointermove", function (e) {
        var r = b.getBoundingClientRect();
        gsap.to(b, { x: (e.clientX - r.left - r.width / 2) * 0.25, y: (e.clientY - r.top - r.height / 2) * 0.35, duration: 0.5, ease: "power3.out" });
      });
      b.addEventListener("pointerleave", function () { gsap.to(b, { x: 0, y: 0, duration: 0.8, ease: "elastic.out(1, .4)" }); });
    });
    // product cards: tilt toward the cursor
    document.addEventListener("pointermove", function (e) {
      var card = e.target.closest && e.target.closest(".p-stage");
      $$(".p-stage.tilt").forEach(function (c) { if (c !== card) { c.classList.remove("tilt"); c.style.removeProperty("--rx"); c.style.removeProperty("--ry"); } });
      if (!card) return;
      var r = card.getBoundingClientRect();
      card.classList.add("tilt");
      card.style.setProperty("--rx", (((e.clientY - r.top) / r.height) - 0.5) * -6 + "deg");
      card.style.setProperty("--ry", (((e.clientX - r.left) / r.width) - 0.5) * 8 + "deg");
      card.style.setProperty("--gx", ((e.clientX - r.left) / r.width) * 100 + "%");
      card.style.setProperty("--gy", ((e.clientY - r.top) / r.height) * 100 + "%");
    }, { passive: true });
  }

  window.addEventListener("load", function () { ScrollTrigger.refresh(); });
})();
