(function () {
  "use strict";

  var CFG = window.DA_CONFIG;
  var ALL = window.DA_PERFUMES.map(function (p, i) { p.order = i; return p; });
  var VOLS = CFG.volumes;
  var STORE_KEY = "da-set-v1";

  var GENDERS = [
    { id: "all", label: "Все" },
    { id: "w", label: "Женские" },
    { id: "m", label: "Мужские" },
    { id: "u", label: "Унисекс" }
  ];
  var GENDER_LABEL = { w: "Женский", m: "Мужской", u: "Унисекс" };
  var FAMILIES = [
    { id: "all", label: "Все ноты" },
    { id: "fresh", label: "Свежие", color: "#cfe0a8" },
    { id: "floral", label: "Цветочные", color: "#f0b7c4" },
    { id: "woody", label: "Древесные", color: "#a98c5c" },
    { id: "oriental", label: "Восточные", color: "#d08a3a" },
    { id: "gourmand", label: "Гурманские", color: "#9b5a2a" },
    { id: "musk", label: "Мускусные", color: "#efe6d8" }
  ];
  var FAMILY_LABEL = {};
  FAMILIES.forEach(function (f) { FAMILY_LABEL[f.id] = f.label; });

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var fmt = function (n) { return n.toLocaleString("ru-RU").replace(/ /g, " ") + " " + CFG.currency; };
  var byId = {};
  ALL.forEach(function (p) { byId[p.id] = p; });
  var price = function (p, v) { return CFG.prices[p.tier][v]; };
  var brandOf = function (p) { return p.brand || "Селекция Dom Aromatov"; };
  var titleOf = function (p) { return p.brand && p.brand !== p.name ? p.brand + " — " + p.name : p.name; };
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- state ---------- */
  var state = { q: "", gender: "all", family: "all", brand: "all", sort: "live" };
  var chosenVol = {}; // id -> volume selected on the card
  var cart = load();

  function load() {
    try {
      var raw = localStorage.getItem(STORE_KEY);
      var data = raw ? JSON.parse(raw) : [];
      return Array.isArray(data) ? data.filter(function (l) { return byId[l.id] && VOLS.indexOf(l.vol) > -1 && l.qty > 0; }) : [];
    } catch (e) { return []; }
  }
  function save() { try { localStorage.setItem(STORE_KEY, JSON.stringify(cart)); } catch (e) {} }

  /* ---------- links ---------- */
  function waLink(text) {
    var num = (CFG.whatsapp || "").replace(/\D/g, "");
    return (num ? "https://wa.me/" + num : "https://wa.me/") + "?text=" + encodeURIComponent(text);
  }
  $("#heroWa").href = waLink("Здравствуйте! Хочу подобрать аромат.");
  $("#tiktokLink").href = CFG.tiktok;
  $("#factCount").textContent = ALL.length;

  /* ---------- filters UI ---------- */
  function chip(group, item, key) {
    var b = document.createElement("button");
    b.type = "button"; b.className = "chip";
    b.setAttribute("aria-pressed", String(state[key] === item.id));
    if (item.color) {
      var d = document.createElement("span"); d.className = "dot"; d.style.background = item.color; b.appendChild(d);
    }
    b.appendChild(document.createTextNode(item.label));
    b.addEventListener("click", function () {
      state[key] = item.id;
      group.querySelectorAll(".chip").forEach(function (c) { c.setAttribute("aria-pressed", String(c === b)); });
      render();
    });
    group.appendChild(b);
  }
  var gWrap = $("#genderChips"), fWrap = $("#familyChips");
  GENDERS.forEach(function (g) { chip(gWrap, g, "gender"); });
  FAMILIES.forEach(function (f) { chip(fWrap, f, "family"); });

  var brands = Array.from(new Set(ALL.map(brandOf))).sort(function (a, b) {
    var sa = a.indexOf("Селекция") === 0, sb = b.indexOf("Селекция") === 0;
    return (sa - sb) || a.localeCompare(b, "ru");
  });
  var bs = $("#brandSel");
  bs.innerHTML = '<option value="all">Все бренды</option>' + brands.map(function (b) {
    var n = ALL.filter(function (p) { return brandOf(p) === b; }).length;
    return '<option value="' + esc(b) + '">' + esc(b) + " · " + n + "</option>";
  }).join("");
  bs.addEventListener("change", function () { state.brand = bs.value; render(); });
  $("#sortSel").addEventListener("change", function (e) { state.sort = e.target.value; render(); });
  var qt;
  $("#q").addEventListener("input", function (e) {
    clearTimeout(qt); var v = e.target.value;
    qt = setTimeout(function () { state.q = v.trim().toLowerCase(); render(); }, 120);
  });
  $("#resetFilters").addEventListener("click", resetFilters);
  function resetFilters() {
    state = { q: "", gender: "all", family: "all", brand: "all", sort: state.sort };
    $("#q").value = ""; bs.value = "all";
    document.querySelectorAll("#genderChips .chip, #familyChips .chip").forEach(function (c, i) {
      c.setAttribute("aria-pressed", String(c.textContent === "Все" || c.textContent === "Все ноты"));
    });
    render();
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; });
  }

  /* ---------- vial svg ---------- */
  function qtyOf(id) { return cart.reduce(function (s, l) { return s + (l.id === id ? l.qty : 0); }, 0); }
  function lvl(id) { return Math.max(4, 30 - qtyOf(id) * 8) + "px"; }
  function vialSVG(p, uid) {
    var cid = "vc-" + uid;
    return '<svg viewBox="0 0 40 100" aria-hidden="true">' +
      '<defs><clipPath id="' + cid + '"><rect x="6" y="24" width="28" height="74" rx="6"/></clipPath></defs>' +
      '<rect class="v-glass" x="6" y="24" width="28" height="74" rx="6"/>' +
      '<g clip-path="url(#' + cid + ')"><rect class="v-liq" x="0" y="24" width="40" height="80" style="--lvl:' + lvl(p.id) + ';transform:translateY(var(--lvl))"/></g>' +
      '<rect class="v-shine" x="10" y="32" width="2.5" height="52" rx="1.2"/>' +
      '<rect class="v-glass" x="6" y="24" width="28" height="74" rx="6" style="fill:none"/>' +
      '<rect class="v-cap" x="15" y="18" width="10" height="7" rx="1"/>' +
      '<rect class="v-cap" x="11" y="0" width="18" height="18" rx="3"/>' +
      '<rect class="v-band" x="11" y="14" width="18" height="2.5"/>' +
      "</svg>";
  }

  /* ---------- catalog ---------- */
  var grid = $("#grid");
  function matches(p) {
    if (state.gender !== "all" && p.gender !== state.gender) return false;
    if (state.family !== "all" && p.family !== state.family) return false;
    if (state.brand !== "all" && brandOf(p) !== state.brand) return false;
    if (state.q) {
      var hay = [p.brand, p.name, p.notes, GENDER_LABEL[p.gender], FAMILY_LABEL[p.family]].join(" ").toLowerCase();
      if (state.q.split(/\s+/).some(function (w) { return hay.indexOf(w) === -1; })) return false;
    }
    return true;
  }
  function sorted(list) {
    var s = state.sort, c = list.slice();
    var cmp = function (a, b) { return a.localeCompare(b, "ru"); };
    if (s === "brand") c.sort(function (a, b) { return (!a.brand - !b.brand) || cmp(brandOf(a), brandOf(b)) || cmp(a.name, b.name); });
    else if (s === "name") c.sort(function (a, b) { return cmp(a.name, b.name); });
    else if (s === "price-asc") c.sort(function (a, b) { return price(a, VOLS[0]) - price(b, VOLS[0]) || a.order - b.order; });
    else if (s === "price-desc") c.sort(function (a, b) { return price(b, VOLS[0]) - price(a, VOLS[0]) || a.order - b.order; });
    else c.sort(function (a, b) { return a.order - b.order; });
    return c;
  }

  function card(p, i) {
    var v = chosenVol[p.id] || VOLS[1] || VOLS[0];
    chosenVol[p.id] = v;
    var tags = [];
    if (p.gender) tags.push(GENDER_LABEL[p.gender]);
    if (p.family) tags.push(FAMILY_LABEL[p.family]);
    var q = qtyOf(p.id);
    var el = document.createElement("article");
    el.className = "p"; el.dataset.id = p.id;
    el.style.setProperty("--liq", p.color);
    el.style.animationDelay = Math.min(i, 12) * 35 + "ms";
    el.innerHTML =
      '<div class="p-vial">' + vialSVG(p, p.id) + "</div>" +
      '<div class="p-head">' +
        '<p class="p-brand">' + esc(brandOf(p)) + "</p>" +
        '<h3 class="p-name">' + esc(p.name) + "</h3>" +
        (p.notes ? '<p class="p-notes">' + esc(p.notes) + "</p>"
                 : '<p class="p-notes unknown">Расскажем о нотах в WhatsApp или в эфире</p>') +
        (tags.length ? '<div class="p-tags">' + tags.map(function (t) { return '<span class="tag">' + t + "</span>"; }).join("") + "</div>" : "") +
      "</div>" +
      '<div class="p-actions">' +
        '<div class="vols" role="radiogroup" aria-label="Объём ' + esc(p.name) + '">' +
          VOLS.map(function (x) { return '<button type="button" class="vol" role="radio" aria-checked="' + (x === v) + '" data-v="' + x + '">' + x + " мл</button>"; }).join("") +
        "</div>" +
        '<div class="p-buy"><span class="price">' + fmt(price(p, v)) + "</span>" +
        '<button type="button" class="add" aria-label="Добавить ' + esc(titleOf(p)) + ' в сэт"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 4v12M4 10h12"/></svg>В сэт</button></div>' +
      "</div>" +
      (q ? '<span class="in-set">В сэте: ' + q + "</span>" : "");
    return el;
  }

  function render() {
    var list = sorted(ALL.filter(matches));
    grid.innerHTML = "";
    var frag = document.createDocumentFragment();
    var lastBrand = null, idx = 0;
    list.forEach(function (p) {
      if (state.sort === "brand" && brandOf(p) !== lastBrand) {
        lastBrand = brandOf(p);
        var n = list.filter(function (x) { return brandOf(x) === lastBrand; }).length;
        var h = document.createElement("h3"); h.className = "group-title";
        h.innerHTML = esc(lastBrand) + "<small>" + n + " " + plural(n, "аромат", "аромата", "ароматов") + "</small>";
        frag.appendChild(h);
      }
      frag.appendChild(card(p, idx++));
    });
    grid.appendChild(frag);
    $("#empty").hidden = list.length > 0;
    $("#resultLine").textContent = list.length === ALL.length
      ? ALL.length + " " + plural(ALL.length, "аромат", "аромата", "ароматов") + " · цены за отливант"
      : "Найдено: " + list.length + " из " + ALL.length;
  }
  function plural(n, one, few, many) {
    var m10 = n % 10, m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return one;
    if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
    return many;
  }

  grid.addEventListener("click", function (e) {
    var art = e.target.closest(".p"); if (!art) return;
    var p = byId[art.dataset.id];
    var vb = e.target.closest(".vol");
    if (vb) {
      chosenVol[p.id] = +vb.dataset.v;
      art.querySelectorAll(".vol").forEach(function (b) { b.setAttribute("aria-checked", String(b === vb)); });
      art.querySelector(".price").textContent = fmt(price(p, chosenVol[p.id]));
      return;
    }
    var add = e.target.closest(".add");
    if (add) addToSet(p, chosenVol[p.id], art, add);
  });

  /* ---------- set ---------- */
  function addToSet(p, vol, art, btn) {
    var line = cart.find(function (l) { return l.id === p.id && l.vol === vol; });
    if (line) line.qty++; else cart.push({ id: p.id, vol: vol, qty: 1 });
    save();
    // card feedback: liquid rises & sloshes
    var liq = art.querySelector(".v-liq");
    liq.style.setProperty("--lvl", lvl(p.id));
    art.classList.remove("slosh"); void art.offsetWidth; art.classList.add("slosh");
    var tag = art.querySelector(".in-set");
    if (!tag) { tag = document.createElement("span"); tag.className = "in-set"; art.appendChild(tag); }
    tag.textContent = "В сэте: " + qtyOf(p.id);
    btn.classList.add("done");
    btn.lastChild.textContent = "Добавлено";
    setTimeout(function () { btn.classList.remove("done"); btn.lastChild.textContent = "В сэт"; }, 1400);
    flyDrop(btn, p.color, function () { updateBadge(true); });
    toast(titleOf(p) + ", " + vol + " мл — в сэте");
  }

  function flyDrop(from, color, done) {
    var target = $("#setOpen");
    if (reduced || !target.animate) { done(); return; }
    var a = from.getBoundingClientRect(), b = target.querySelector(".set-vial").getBoundingClientRect();
    var d = document.createElement("div"); d.className = "drop-fly"; d.style.setProperty("--liq", color);
    d.style.left = a.left + a.width / 2 - 7 + "px"; d.style.top = a.top + a.height / 2 - 9 + "px";
    document.body.appendChild(d);
    var dx = b.left + b.width / 2 - (a.left + a.width / 2), dy = b.top + b.height / 2 - (a.top + a.height / 2);
    var lift = Math.min(160, Math.abs(dy) * .35 + 60);
    var anim = d.animate([
      { transform: "translate(0,0) scale(.4)", opacity: 0 },
      { transform: "translate(" + dx * .25 + "px," + (dy * .1 - lift) + "px) scale(1.1)", opacity: 1, offset: .3 },
      { transform: "translate(" + dx * .75 + "px," + (dy * .6 - lift * .4) + "px) scale(.9)", opacity: 1, offset: .7 },
      { transform: "translate(" + dx + "px," + dy + "px) scale(.3)", opacity: .2 }
    ], { duration: 820, easing: "cubic-bezier(.45,0,.55,1)" });
    anim.onfinish = function () { d.remove(); done(); };
  }

  function totals() {
    return cart.reduce(function (t, l) { t.qty += l.qty; t.sum += price(byId[l.id], l.vol) * l.qty; return t; }, { qty: 0, sum: 0 });
  }

  function updateBadge(bump) {
    var t = totals();
    $("#setCount").textContent = t.qty;
    var fill = Math.min(1, t.qty / 6);
    $("#miniLiquid").style.transform = "translateY(" + -25 * fill + "px)";
    var btn = $("#setOpen");
    btn.setAttribute("aria-label", "Мой сэт: " + t.qty + " " + plural(t.qty, "аромат", "аромата", "ароматов"));
    if (bump) { btn.classList.remove("bump"); void btn.offsetWidth; btn.classList.add("bump"); }
  }

  function renderSet() {
    var t = totals();
    var ul = $("#lines");
    ul.innerHTML = cart.map(function (l, i) {
      var p = byId[l.id];
      return '<li class="line" data-i="' + i + '">' +
        '<div><p class="line-name">' + esc(p.name) + '</p><p class="line-meta">' + esc(brandOf(p)) + " · " + fmt(price(p, l.vol)) + " за " + l.vol + " мл</p></div>" +
        '<div class="line-price">' + fmt(price(p, l.vol) * l.qty) + "</div>" +
        '<div class="line-ctrl">' +
          '<div class="qty"><button type="button" data-act="dec" aria-label="Меньше"><svg viewBox="0 0 14 14"><path d="M3 7h8"/></svg></button>' +
          "<output>" + l.qty + "</output>" +
          '<button type="button" data-act="inc" aria-label="Больше"><svg viewBox="0 0 14 14"><path d="M7 3v8M3 7h8"/></svg></button></div>' +
          '<button type="button" class="rm" data-act="rm"><svg viewBox="0 0 14 14"><path d="M3 3l8 8M11 3l-8 8"/></svg>Убрать</button>' +
        "</div></li>";
    }).join("");
    $("#drawerEmpty").hidden = cart.length > 0;
    $("#orderForm").hidden = cart.length === 0;
    $("#sumQty").textContent = t.qty;
    $("#sumTotal").textContent = fmt(t.sum);
    // shelf of vials — one per bottle in the set
    var shelf = "";
    cart.forEach(function (l, li) {
      for (var k = 0; k < l.qty && k < 12; k++) {
        var p = byId[l.id];
        var h = l.vol === 5 ? 0.62 : l.vol === 10 ? 0.8 : 1;
        shelf += '<svg viewBox="0 0 40 100" style="--liq:' + p.color + ";height:" + Math.round(64 * h) + 'px;width:auto" aria-hidden="true">' +
          '<rect class="v-glass" x="6" y="24" width="28" height="74" rx="6"/>' +
          '<rect x="8" y="40" width="24" height="56" rx="4" style="fill:var(--liq)"/>' +
          '<rect class="v-shine" x="10" y="32" width="2.5" height="52" rx="1.2"/>' +
          '<rect class="v-cap" x="11" y="0" width="18" height="18" rx="3"/><rect class="v-cap" x="15" y="18" width="10" height="7" rx="1"/>' +
          '<rect class="v-band" x="11" y="14" width="18" height="2.5"/></svg>';
      }
    });
    $("#shelf").innerHTML = shelf;
    $("#shelf").style.display = cart.length ? "" : "none";
  }

  $("#lines").addEventListener("click", function (e) {
    var b = e.target.closest("button[data-act]"); if (!b) return;
    var i = +b.closest(".line").dataset.i, l = cart[i];
    if (b.dataset.act === "inc") l.qty++;
    else if (b.dataset.act === "dec") { l.qty--; if (l.qty < 1) cart.splice(i, 1); }
    else cart.splice(i, 1);
    save(); renderSet(); updateBadge(false); syncCards();
  });

  function syncCards() {
    grid.querySelectorAll(".p").forEach(function (art) {
      var id = art.dataset.id, q = qtyOf(id);
      art.querySelector(".v-liq").style.setProperty("--lvl", lvl(id));
      var tag = art.querySelector(".in-set");
      if (q) { if (!tag) { tag = document.createElement("span"); tag.className = "in-set"; art.appendChild(tag); } tag.textContent = "В сэте: " + q; }
      else if (tag) tag.remove();
    });
  }

  /* ---------- drawer ---------- */
  var drawer = $("#setDrawer"), scrim = $("#scrim"), lastFocus = null;
  function openSet() {
    lastFocus = document.activeElement;
    renderSet();
    drawer.hidden = false; scrim.hidden = false;
    requestAnimationFrame(function () { drawer.classList.add("on"); scrim.classList.add("on"); });
    document.body.classList.add("locked");
    $("#setOpen").setAttribute("aria-expanded", "true");
    setTimeout(function () { $("#setClose").focus(); }, 60);
  }
  function closeSet() {
    drawer.classList.remove("on"); scrim.classList.remove("on");
    document.body.classList.remove("locked");
    $("#setOpen").setAttribute("aria-expanded", "false");
    setTimeout(function () { drawer.hidden = true; scrim.hidden = true; }, reduced ? 0 : 450);
    if (lastFocus) lastFocus.focus();
  }
  $("#setOpen").addEventListener("click", openSet);
  $("#setClose").addEventListener("click", closeSet);
  scrim.addEventListener("click", closeSet);
  $("#toCatalog").addEventListener("click", function () { closeSet(); location.hash = "catalog"; });
  document.addEventListener("keydown", function (e) {
    if (drawer.hidden) return;
    if (e.key === "Escape") closeSet();
    if (e.key === "Tab") { // focus trap
      var f = drawer.querySelectorAll("button, input, textarea, a[href], select");
      f = Array.prototype.filter.call(f, function (x) { return x.offsetParent !== null; });
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    }
  });

  /* ---------- order ---------- */
  function orderText() {
    var f = $("#orderForm"), t = totals();
    var lines = cart.map(function (l, i) {
      var p = byId[l.id];
      return (i + 1) + ". " + titleOf(p) + ", " + l.vol + " мл × " + l.qty + " = " + fmt(price(p, l.vol) * l.qty);
    });
    var out = ["Здравствуйте! Хочу заказать сэт с сайта Dom Aromatov:", ""].concat(lines, ["", "Итого: " + fmt(t.sum) + " (" + t.qty + " шт.)"]);
    var name = f.name.value.trim(), city = f.city.value.trim(), c = f.comment.value.trim();
    if (name) out.push("Имя: " + name);
    if (city) out.push("Город: " + city);
    if (c) out.push("Комментарий: " + c);
    return out.join("\n");
  }
  $("#orderForm").addEventListener("submit", function (e) {
    e.preventDefault();
    if (!cart.length) return;
    window.open(waLink(orderText()), "_blank", "noopener");
  });
  $("#copyBtn").addEventListener("click", function () {
    var txt = orderText();
    var ok = function () { toast("Текст заказа скопирован"); };
    if (navigator.clipboard) navigator.clipboard.writeText(txt).then(ok, function () { fallbackCopy(txt); ok(); });
    else { fallbackCopy(txt); ok(); }
  });
  function fallbackCopy(t) {
    var ta = document.createElement("textarea"); ta.value = t; ta.style.position = "fixed"; ta.style.opacity = "0";
    document.body.appendChild(ta); ta.select(); try { document.execCommand("copy"); } catch (e) {} ta.remove();
  }

  /* ---------- toast ---------- */
  var tt;
  function toast(msg) {
    var el = $("#toast"); el.textContent = msg; el.classList.add("on");
    clearTimeout(tt); tt = setTimeout(function () { el.classList.remove("on"); }, 2200);
  }

  /* ---------- hero pour ---------- */
  var flacon = $(".flacon");
  if (flacon && !reduced) flacon.classList.add("pouring");

  /* ---------- sticky offset for tools under header ---------- */
  function syncTop() {
    var h = $(".bar").offsetHeight;
    document.documentElement.style.setProperty("--bar-h", h + "px");
    document.documentElement.style.scrollPaddingTop = h + 120 + "px";
  }
  window.addEventListener("resize", syncTop);

  var curV = document.documentElement.getAttribute("data-theme") || "classic";
  document.querySelectorAll(".variants a").forEach(function (a) { a.setAttribute("aria-current", String(a.dataset.v === curV)); });

  syncTop();
  render();
  updateBadge(false);
})();
