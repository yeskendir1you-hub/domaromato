/* Dom Aromatov — drawn flacons.
   Each brand gets a silhouette close to its real bottle family; each perfume tints the juice.
   If a product has `photo` in data.js, the photo is used instead (see app.js). */
(function () {
  "use strict";

  var METAL = {
    gold:   [["0", "#8a6428"], [".18", "#f6e2b0"], [".42", "#c9a05a"], [".7", "#f0d79c"], ["1", "#7b5823"]],
    silver: [["0", "#6f747b"], [".2", "#fbfbfb"], [".45", "#b9bdc3"], [".72", "#eef0f2"], ["1", "#686d74"]],
    black:  [["0", "#050506"], [".22", "#3b3b40"], [".5", "#111114"], [".78", "#2c2c31"], ["1", "#040405"]],
    white:  [["0", "#bdb6ab"], [".25", "#ffffff"], [".55", "#ece7df"], [".8", "#fbf9f5"], ["1", "#b3ab9f"]],
    copper: [["0", "#5a2f17"], [".2", "#f0b78a"], [".45", "#a8643a"], [".72", "#e5a77a"], ["1", "#4f2913"]],
    wood:   [["0", "#3a2414"], [".3", "#8a5b36"], [".6", "#5e3b22"], ["1", "#2c1a0e"]]
  };

  /* body: rect | round | tall | oval | flask | cyl | can
     cap:  block | cyl | facet | crown | sphere | tall | disc
     glass: clear | dark | frosted ; label: dark | light | gold | none ; medal: medallion on the body */
  var BRAND = {
    "Creed":                { body: "rect",  w: 66, h: 118, r: 7,  cap: "cyl",    capW: 46, capH: 34, metal: "silver", glass: "clear",  label: "light" },
    "Kilian":               { body: "rect",  w: 74, h: 104, r: 4,  cap: "block",  capW: 50, capH: 40, metal: "black",  glass: "clear",  label: "dark", band: "gold", base: 14 },
    "Parfums de Marly":     { body: "rect",  w: 76, h: 112, r: 16, cap: "block",  capW: 44, capH: 30, metal: "gold",   glass: "clear",  label: "none", medal: true },
    "Louis Vuitton":        { body: "round", w: 82, h: 98,  r: 24, cap: "block",  capW: 40, capH: 30, metal: "gold",   glass: "clear",  label: "none", engrave: "LOUIS VUITTON" },
    "Amouage":              { body: "oval",  w: 84, h: 104,        cap: "crown",  capW: 40, capH: 44, metal: "gold",   glass: "clear",  label: "none", medal: true },
    "Initio":               { body: "tall",  w: 58, h: 128, r: 6,  cap: "tall",   capW: 42, capH: 46, metal: "black",  glass: "dark",   label: "gold", band: "gold" },
    "Ex Nihilo":            { body: "tall",  w: 60, h: 124, r: 4,  cap: "block",  capW: 60, capH: 34, metal: "gold",   glass: "clear",  label: "light" },
    "Montale":              { body: "can",   w: 56, h: 128,        cap: "cyl",    capW: 56, capH: 30, metal: "black",  glass: "metal",  label: "none", engrave: "MONTALE" },
    "Escentric Molecules":  { body: "cyl",   w: 50, h: 136,        cap: "cyl",    capW: 34, capH: 30, metal: "silver", glass: "clear",  label: "none", engrave: "MOLECULE 01" },
    "Marc-Antoine Barrois": { body: "tall",  w: 60, h: 128, r: 3,  cap: "block",  capW: 38, capH: 38, metal: "black",  glass: "clear",  label: "none", engrave: "MARC-ANTOINE BARROIS" },
    "Essential Parfums":    { body: "rect",  w: 64, h: 114, r: 6,  cap: "cyl",    capW: 30, capH: 34, metal: "wood",   glass: "clear",  label: "light" },
    "Liquides Imaginaires": { body: "flask", w: 88, h: 96,         cap: "sphere", capW: 40, capH: 40, metal: "black",  glass: "clear",  label: "none" },
    "Thomas Kosmala":       { body: "rect",  w: 70, h: 110, r: 10, cap: "block",  capW: 36, capH: 34, metal: "black",  glass: "clear",  label: "dark" },
    "Chanel":               { body: "rect",  w: 76, h: 100, r: 3,  cap: "facet",  capW: 46, capH: 30, metal: "glass",  glass: "clear",  label: "light" },
    "Prada":                { body: "rect",  w: 70, h: 112, r: 12, cap: "block",  capW: 44, capH: 28, metal: "silver", glass: "clear",  label: "none", engrave: "PRADA" },
    "Dolce & Gabbana":      { body: "rect",  w: 66, h: 116, r: 6,  cap: "block",  capW: 40, capH: 30, metal: "white",  glass: "clear",  label: "none", engrave: "DOLCE & GABBANA" },
    "Chopard":              { body: "oval",  w: 86, h: 100,        cap: "facet",  capW: 44, capH: 40, metal: "gold",   glass: "clear",  label: "none", medal: true },
    "Attar Collection":     { body: "rect",  w: 68, h: 106, r: 8,  cap: "tall",   capW: 46, capH: 48, metal: "gold",   glass: "clear",  label: "gold" },
    _default:               { body: "round", w: 78, h: 102, r: 20, cap: "facet",  capW: 44, capH: 40, metal: "gold",   glass: "clear",  label: "gold" }
  };
  // per-perfume touches that make a bottle read as "that one"
  var OVERRIDE = {
    "creed-aventus":   { metal: "black" },
    "creed-absolu":    { metal: "black", glass: "dark" },
    "creed-centaurus": { metal: "black" },
    "creed-carmina":   { metal: "gold" },
    "creed-wild-vetiver": { metal: "silver" },
    "kilian-ggb":      { metal: "white", band: "gold" },
    "kilian-apple":    { metal: "black", band: "gold" },
    "pdm-delina":      { metal: "silver", glass: "frosted" },
    "pdm-valaya":      { metal: "silver", glass: "frosted" },
    "lv-imagination":  { body: "tall", w: 62, h: 122, r: 8, metal: "silver" },
    "lv-attrape":      { metal: "gold", glass: "frosted" },
    "montale-cafe":    { canMetal: "copper" },
    "montale-roses":   { canMetal: "white" },
    "montale-capri":   { canMetal: "gold" },
    "exn-fleur":       { metal: "silver" },
    "amouage-honour":  { metal: "silver" },
    "initio-narcotic": { glass: "clear" }
  };

  function cfg(p) {
    var base = BRAND[p.brand] || BRAND._default, o = OVERRIDE[p.id] || {}, c = {};
    for (var k in base) c[k] = base[k];
    for (var j in o) c[j] = o[j];
    return c;
  }
  function grad(id, stops, x2, y2) {
    return '<linearGradient id="' + id + '" x1="0" y1="0" x2="' + (x2 || 1) + '" y2="' + (y2 || 0) + '">' +
      stops.map(function (s) { return '<stop offset="' + s[0] + '" stop-color="' + s[1] + '"' + (s[2] != null ? ' stop-opacity="' + s[2] + '"' : "") + "/>"; }).join("") + "</linearGradient>";
  }
  function shade(hex, f) { // f<0 darker, f>0 lighter
    var n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    var t = f < 0 ? 0 : 255, a = Math.abs(f);
    r = Math.round(r + (t - r) * a); g = Math.round(g + (t - g) * a); b = Math.round(b + (t - b) * a);
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  function bodyPath(c, x, y) {
    var w = c.w, h = c.h, r = c.r || 0;
    if (c.body === "oval") return "M" + (x + w / 2) + " " + y + " C" + (x + w * 1.02) + " " + y + " " + (x + w) + " " + (y + h * .3) + " " + (x + w) + " " + (y + h * .55) +
      " C" + (x + w) + " " + (y + h * .92) + " " + (x + w * .8) + " " + (y + h) + " " + (x + w / 2) + " " + (y + h) +
      " C" + (x + w * .2) + " " + (y + h) + " " + x + " " + (y + h * .92) + " " + x + " " + (y + h * .55) +
      " C" + x + " " + (y + h * .3) + " " + (x - w * .02) + " " + y + " " + (x + w / 2) + " " + y + "Z";
    if (c.body === "flask") { var cx = x + w / 2, cy = y + h / 2; return "M" + cx + " " + y + " a" + w / 2 + " " + h / 2 + " 0 1 0 0.01 0Z"; }
    if (c.body === "cyl" || c.body === "can") r = 4;
    return "M" + (x + r) + " " + y + " H" + (x + w - r) + " Q" + (x + w) + " " + y + " " + (x + w) + " " + (y + r) +
      " V" + (y + h - r) + " Q" + (x + w) + " " + (y + h) + " " + (x + w - r) + " " + (y + h) +
      " H" + (x + r) + " Q" + x + " " + (y + h) + " " + x + " " + (y + h - r) + " V" + (y + r) + " Q" + x + " " + y + " " + (x + r) + " " + y + "Z";
  }

  function capSVG(c, cx, top, fill, id) {
    var w = c.capW, h = c.capH, x = cx - w / 2, out = "";
    switch (c.cap) {
      case "cyl":
        out = '<rect x="' + x + '" y="' + top + '" width="' + w + '" height="' + h + '" rx="3" fill="' + fill + '"/>' +
              '<ellipse cx="' + cx + '" cy="' + top + '" rx="' + w / 2 + '" ry="3" fill="' + fill + '" opacity=".9"/>' +
              '<rect x="' + x + '" y="' + (top + h - 3) + '" width="' + w + '" height="3" fill="#000" opacity=".25"/>';
        break;
      case "facet":
        out = '<path d="M' + (x + 4) + " " + (top + h) + " L" + (x + w - 4) + " " + (top + h) + " L" + (x + w) + " " + (top + h * .45) + " L" + (x + w * .72) + " " + top +
              " L" + (x + w * .28) + " " + top + " L" + x + " " + (top + h * .45) + 'Z" fill="' + fill + '"/>' +
              '<path d="M' + cx + " " + top + " V" + (top + h) + " M" + x + " " + (top + h * .45) + " H" + (x + w) + '" stroke="#fff" stroke-opacity=".28" stroke-width=".8"/>';
        break;
      case "crown":
        out = '<rect x="' + (x + 4) + '" y="' + (top + h * .45) + '" width="' + (w - 8) + '" height="' + h * .55 + '" rx="3" fill="' + fill + '"/>' +
              '<path d="M' + x + " " + (top + h * .5) + " Q" + (x + w * .12) + " " + (top + h * .08) + " " + (x + w * .26) + " " + (top + h * .34) + " Q" + cx + " " + (top - h * .12) + " " + (x + w * .74) + " " + (top + h * .34) +
              " Q" + (x + w * .88) + " " + (top + h * .08) + " " + (x + w) + " " + (top + h * .5) + 'Z" fill="' + fill + '"/>' +
              '<circle cx="' + cx + '" cy="' + (top + h * .2) + '" r="' + w * .09 + '" fill="' + fill + '"/>';
        break;
      case "sphere":
        out = '<circle cx="' + cx + '" cy="' + (top + h / 2) + '" r="' + w / 2 + '" fill="' + fill + '"/>' +
              '<ellipse cx="' + (cx - w * .16) + '" cy="' + (top + h * .3) + '" rx="' + w * .12 + '" ry="' + w * .07 + '" fill="#fff" opacity=".35"/>';
        break;
      case "tall":
        out = '<rect x="' + x + '" y="' + top + '" width="' + w + '" height="' + h + '" rx="2" fill="' + fill + '"/>';
        break;
      default:
        out = '<rect x="' + x + '" y="' + top + '" width="' + w + '" height="' + h + '" rx="' + (c.metal === "black" ? 3 : 5) + '" fill="' + fill + '"/>';
    }
    if (c.band) out += '<rect x="' + (x + (c.cap === "crown" ? 4 : 0)) + '" y="' + (top + h - 6) + '" width="' + (w - (c.cap === "crown" ? 8 : 0)) + '" height="2.4" fill="url(#' + id + 'b)"/>';
    return out;
  }

  /* returns SVG markup; uid must be unique per instance in the document */
  window.DA_BOTTLE = function (p, uid) {
    var c = cfg(p), id = "b" + uid;
    var W = 140, H = 230, ground = 222;
    var neckH = 10, neckW = Math.min(c.capW * .5, 22);
    var bx = (W - c.w) / 2, by = ground - c.h;
    var capTop = by - neckH - c.capH + 2;
    var cx = W / 2;
    var liq = p.color || "#e2bf86";
    var path = bodyPath(c, bx, by);
    var level = c.body === "flask" ? .62 : .78;
    var ly = by + c.h * (1 - level);
    var metal = c.metal === "glass" ? null : (METAL[c.metal] || METAL.gold);
    var canMetal = METAL[c.canMetal || "silver"];
    var d = "<defs>" +
      grad(id + "l", [["0", shade(liq, .35)], [".5", liq], ["1", shade(liq, -.35)]], 0, 1) +
      grad(id + "lx", [["0", "#000", .35], [".25", "#000", 0], [".75", "#000", 0], ["1", "#000", .4]]) +
      grad(id + "g", [["0", "#fff", .22], [".12", "#fff", .04], [".85", "#fff", .03], ["1", "#fff", .16]]) +
      (metal ? grad(id + "m", metal) : grad(id + "m", [["0", "#ffffff", .5], [".3", "#ffffff", .15], [".7", "#ffffff", .25], ["1", "#ffffff", .5]])) +
      grad(id + "b", METAL.gold) +
      grad(id + "c", canMetal) +
      '<clipPath id="' + id + 'k"><path d="' + path + '"/></clipPath>' +
      '<radialGradient id="' + id + 's" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#000" stop-opacity=".55"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>' +
      "</defs>";
    var s = '<svg class="flc" viewBox="0 0 ' + W + " " + H + '" aria-hidden="true">' + d;
    s += '<ellipse cx="' + cx + '" cy="' + (ground + 2) + '" rx="' + (c.w * .62) + '" ry="5" fill="url(#' + id + 's)"/>';

    // neck
    s += '<rect x="' + (cx - neckW / 2) + '" y="' + (by - neckH) + '" width="' + neckW + '" height="' + (neckH + 2) + '" fill="' + (c.body === "can" ? "url(#" + id + "c)" : "rgba(255,255,255,.18)") + '"/>';

    if (c.body === "can") {
      s += '<path d="' + path + '" fill="url(#' + id + 'c)"/>';
      s += '<path d="' + path + '" fill="' + liq + '" opacity=".12"/>';
    } else {
      // glass body
      var glassFill = c.glass === "dark" ? "#141216" : c.glass === "frosted" ? "rgba(255,255,255,.16)" : "rgba(255,255,255,.06)";
      s += '<path d="' + path + '" fill="' + glassFill + '"/>';
      s += '<g clip-path="url(#' + id + 'k)">';
      if (c.glass !== "dark") {
        s += '<rect x="0" y="' + ly + '" width="' + W + '" height="' + (ground - ly) + '" fill="url(#' + id + 'l)"' + (c.glass === "frosted" ? ' opacity=".8"' : "") + "/>";
        s += '<rect x="0" y="' + (ly - 1) + '" width="' + W + '" height="2.5" fill="#fff" opacity=".35"/>';
        s += '<rect x="0" y="' + ly + '" width="' + W + '" height="' + (ground - ly) + '" fill="url(#' + id + 'lx)"/>';
      } else {
        s += '<rect x="0" y="' + ly + '" width="' + W + '" height="' + (ground - ly) + '" fill="' + liq + '" opacity=".18"/>';
      }
      if (c.base) s += '<rect x="0" y="' + (ground - c.base) + '" width="' + W + '" height="' + c.base + '" fill="#fff" opacity=".12"/>';
      else s += '<rect x="0" y="' + (ground - 6) + '" width="' + W + '" height="6" fill="#fff" opacity=".1"/>';
      s += "</g>";
    }
    // glass sheen + edge
    s += '<path d="' + path + '" fill="url(#' + id + 'g)"/>';
    s += '<g clip-path="url(#' + id + 'k)"><rect x="' + (bx + c.w * .1) + '" y="' + (by + 6) + '" width="' + Math.max(3, c.w * .07) + '" height="' + (c.h - 16) + '" rx="3" fill="#fff" opacity=".28"/>' +
         '<rect x="' + (bx + c.w * .84) + '" y="' + (by + 10) + '" width="2" height="' + (c.h - 24) + '" rx="1" fill="#fff" opacity=".18"/></g>';
    s += '<path d="' + path + '" fill="none" stroke="' + (c.body === "can" ? "rgba(0,0,0,.35)" : "rgba(255,248,235,.42)") + '" stroke-width="1"/>';

    // label / medallion / engraving
    var labY = by + c.h * .5;
    if (c.label === "dark" || c.label === "light" || c.label === "gold") {
      var lw = Math.min(c.w - 16, 52), lh = 22;
      var lf = c.label === "dark" ? "#0d0c0e" : c.label === "gold" ? "url(#" + id + "b)" : "#f3eee6";
      var tf = c.label === "light" ? "#1b1712" : c.label === "gold" ? "#2a1d0b" : "#e7c98f";
      s += '<rect x="' + (cx - lw / 2) + '" y="' + (labY - lh / 2) + '" width="' + lw + '" height="' + lh + '" rx="1.5" fill="' + lf + '"/>';
      s += '<text x="' + cx + '" y="' + (labY + 2.4) + '" text-anchor="middle" font-family="Manrope, sans-serif" font-weight="700" font-size="5.6" letter-spacing="1.1" fill="' + tf + '">' + esc((p.brand || "DOM AROMATOV").toUpperCase().slice(0, 16)) + "</text>";
    }
    if (c.medal) {
      s += '<circle cx="' + cx + '" cy="' + (labY - 4) + '" r="9" fill="url(#' + id + 'b)"/><circle cx="' + cx + '" cy="' + (labY - 4) + '" r="6.2" fill="none" stroke="#5b3f15" stroke-opacity=".5" stroke-width=".8"/>';
    }
    if (c.engrave) {
      s += '<text x="' + cx + '" y="' + (labY + (c.medal ? 14 : 2)) + '" text-anchor="middle" font-family="Manrope, sans-serif" font-weight="600" font-size="' + (c.engrave.length > 14 ? 4.2 : 5.6) + '" letter-spacing="1.2" fill="' + (c.body === "can" ? "#1d1a17" : "#fff") + '" opacity="' + (c.body === "can" ? ".75" : ".75") + '">' + esc(c.engrave) + "</text>";
    }
    // cap
    s += capSVG(c, cx, capTop, metal ? "url(#" + id + "m)" : "rgba(255,255,255,.22)", id);
    if (!metal) s += '<path d="M' + (cx - c.capW / 2 + 4) + " " + (capTop + c.capH) + " L" + (cx + c.capW / 2 - 4) + " " + (capTop + c.capH) + '" stroke="#fff" stroke-opacity=".5"/>';
    return s + "</svg>";
  };
})();
