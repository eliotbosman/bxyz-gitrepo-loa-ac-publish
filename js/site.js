// BXYZ:..:eliot@bosmanxyz.xyz:..:.www.bosmanxyz.xyz
(function () {
  var html = document.documentElement;
  var listaNod = document.getElementById('bilder-lista');
  var texterNod = document.getElementById('texter-lista');
  var bilder = listaNod ? JSON.parse(listaNod.textContent) : [];
  var texter = texterNod ? JSON.parse(texterNod.textContent) : [];
  var kort = bilder.slice();
  var lenis = null;
  var bars = document.querySelector('.bars');
  var minskad = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var matt = { u: 36, huvud: 108, falt: 900 };
  var sida = document.querySelector('.home') ? 'hem' : bars ? 'index' : document.querySelector('.project') ? 'projekt' : 'info';
  var flode = {
    hem: { vila: 'topp-hoger' },
    index: { vila: 'botten-hoger', ned: 'botten-mitten', upp: 'botten-hoger' },
    projekt: { vila: document.querySelector('.project[data-form="rulle"]') ? 'topp-hoger' : 'botten-hoger' },
    info: { vila: 'topp-hoger', ned: 'botten-hoger', upp: 'topp-hoger', slut: 'botten-hoger', guide: false, steg: 6 }
  };
  var vantande = '';
  var fallN = 0;
  var acc = 0;
  var senY = window.scrollY;
  var ram = 0;

  function mat(prop) {
    var prov = document.createElement('i');
    prov.style.cssText = 'position:absolute;visibility:hidden;block-size:' + prop;
    document.body.appendChild(prov);
    var n = prov.getBoundingClientRect().height;
    prov.remove();
    return n || 36;
  }
  function tauMs() { return parseFloat(getComputedStyle(html).getPropertyValue('--tau')) || 80; }
  function ease(t) { return 1 - Math.pow(1 - t, 3); }
  function matOm() {
    matt.u = mat('var(--u)') || 36;
    matt.huvud = mat('var(--huvud)') || matt.u * 3;
    matt.falt = mat('var(--falt-block)') || window.innerHeight;
    html.style.setProperty('--flip-rader', String(Math.max(1, Math.round(matt.falt / matt.u))));
  }
  var rang = { lage: 1, fall: 2, vand: 3, meny: 4 };
  var FALL_VAL = '.bar, .project__band, .info__fall, .fot';
  var FALL_OPPEN = '.bar[data-open], .project__band[data-open], .info__fall[data-open], .fot[data-open]';
  function lasPa(orsak) {
    if (minskad || tauMs() === 0) return;
    var nu = html.dataset.las;
    if (nu && (rang[nu] || 0) > (rang[orsak] || 0)) return;
    html.dataset.las = orsak;
  }
  function lasAv(orsak) {
    if (html.dataset.las !== orsak) return;
    delete html.dataset.las;
    if (!vantande) return;
    var nasta = vantande;
    var led = html.dataset.vantLed || '';
    vantande = '';
    delete html.dataset.vantLed;
    sattLage(nasta, led);
  }
  function lasFall() {
    if (minskad || tauMs() === 0) return;
    if (html.dataset.las && (rang[html.dataset.las] || 0) > rang.fall) return;
    fallN += 1;
    html.dataset.las = 'fall';
  }
  function fallKlar() {
    fallN = Math.max(0, fallN - 1);
    if (fallN) return;
    lasAv('fall');
  }
  function stegFor(fran, till) {
    if (!fran || fran === till) return 3;
    var plan = flode[sida];
    if (plan && plan.steg) return plan.steg;
    var topp = function (n) { return n.indexOf('topp') === 0; };
    return topp(fran) !== topp(till) ? Math.max(1, Math.round(matt.falt / matt.u)) : 3;
  }
  function menyOppet() { return menu && menu.hasAttribute('data-open'); }
  function sattMark() {
    var nasta = sida === 'projekt' ? 'projekt' : 'vila';
    if (html.dataset.syfte === 'led') nasta = 'led';
    if (document.querySelector(FALL_OPPEN)) nasta = 'fall';
    if (menyOppet()) nasta = 'meny';
    html.dataset.mark = nasta;
  }
  function markRoll() {}
  function sattLage(nasta, led) {
    if (!nasta || nasta === html.dataset.lage) return;
    if (menyOppet() || html.dataset.las) { vantande = nasta; html.dataset.vantLed = led || ''; return; }
    html.style.setProperty('--mark-steg', String(stegFor(html.dataset.lage || '', nasta)));
    html.dataset.lage = nasta;
    var plan = flode[sida];
    var guide = !(plan && plan.guide === false) && (nasta === 'botten-mitten' || led === 'upp');
    html.dataset.syfte = guide ? 'led' : 'meny';
    if (guide) html.dataset.led = led || 'ned';
    else delete html.dataset.led;
    markRoll();
    lasPa('lage');
    sattMark();
  }
  function rulla(mal, direkt) {
    if (!mal) return;
    var u = matt.u;
    var offset = -matt.huvud;
    var dist = Math.abs(mal.getBoundingClientRect().top + offset);
    var rader = Math.max(1, Math.min(12, Math.round(dist / u)));
    var sek = (tauMs() * rader) / 1000;
    if (lenis && !direkt && !minskad) {
      lenis.scrollTo(mal, { offset: offset, duration: sek, easing: ease, lerp: undefined });
      return;
    }
    mal.scrollIntoView({ behavior: direkt || minskad ? 'auto' : 'smooth', block: 'start' });
  }
  function aterLage() {
    var plan = flode[sida];
    if (!plan) return;
    var y = window.scrollY;
    var max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    var nasta = plan.vila;
    var led = '';
    if (plan.ned && y >= matt.u && max - y >= matt.u * 2) { nasta = plan.ned; led = 'ned'; }
    else if (plan.slut && max - y < matt.u * 2) nasta = plan.slut;
    sattLage(nasta, led);
  }
  function visaMer() {
    var mer = document.querySelector('.mark__mer');
    var bar = document.querySelector('.bar[data-open]');
    if (!mer || !bar) { delete html.dataset.mer; aterLage(); return false; }
    var rut = bar.getBoundingClientRect();
    if (rut.bottom <= 0 || rut.top >= window.innerHeight) { delete html.dataset.mer; aterLage(); return false; }
    sattLage('botten-mitten', 'ned');
    var visa = true;
    if (bar.hasAttribute('data-scroll')) {
      var forsta = bar.querySelector('.bar__yta');
      var bild = forsta ? forsta.getBoundingClientRect() : null;
      visa = !!(bild && bild.top < window.innerHeight && rut.bottom > window.innerHeight - matt.u * 2);
    }
    if (!visa) { delete html.dataset.mer; sattMark(); return true; }
    mer.href = bar.dataset.slug + '/index.html';
    html.dataset.mer = 'pa';
    sattMark();
    return true;
  }
  function hashMal() {
    var id = location.hash.slice(1);
    if (!id) return null;
    return document.getElementById(id) || document.querySelector('[data-slug="' + id + '"]');
  }
  function markera(img) {
    img.setAttribute('data-laddad', '');
    img.setAttribute('data-visad', '');
  }
  function ladda(img) {
    if (!img) return;
    img.removeAttribute('data-laddad');
    var visa = function () { markera(img); };
    if (img.complete && img.naturalWidth) { requestAnimationFrame(function () { requestAnimationFrame(visa); }); return; }
    img.addEventListener('load', visa, { once: true });
  }
  function bytBild(img, src) {
    if (!img || !src) return;
    if (img.getAttribute('src') === src && img.complete && img.naturalWidth) { markera(img); return; }
    if (!img.hasAttribute('data-visad')) img.removeAttribute('data-laddad');
    img.addEventListener('load', function () { markera(img); }, { once: true });
    img.src = src;
    if (img.complete && img.naturalWidth) markera(img);
  }
  function skrivTal(g, i) {
    var n = Number(g.dataset.antal) || 1;
    var ix = g.querySelector('[data-roll="index"]');
    var an = g.querySelector('[data-roll="antal"]');
    if (ix) ix.textContent = ix.classList.contains('project__tal') ? String(i + 1).padStart(2, '0') : String(i + 1);
    if (an) an.textContent = an.classList.contains('project__tal') ? String(n).padStart(2, '0') : String(n);
    var text = g.querySelector('[data-roll="text"]');
    if (text && texter.length) text.textContent = texter[i % texter.length];
    var mer = g.querySelector('[data-roll="mer"]');
    if (mer && texter.length) mer.textContent = texter.join(' ');
  }
  function slappZoom(nod) {
    if (!nod) return;
    nod.removeAttribute('data-zoom');
    var yta = nod.querySelector && nod.querySelector('.galleri__yta');
    if (yta) yta.removeAttribute('data-zoom');
  }
  function stangAutoBand() {
    document.querySelectorAll('.project__band[data-open]:not([data-hall])').forEach(function (band) {
      band.removeAttribute('data-open');
      var knapp = band.querySelector('.project__head');
      if (knapp) knapp.setAttribute('aria-expanded', 'false');
    });
    sattMark();
  }
  function oppnaAutoBand() {
    document.querySelectorAll('.project__band').forEach(function (band) {
      if (band.hasAttribute('data-hall')) return;
      band.setAttribute('data-open', '');
      var knapp = band.querySelector('.project__head');
      if (knapp) knapp.setAttribute('aria-expanded', 'true');
    });
    sattMark();
  }
  function zooma(yta) {
    if (!yta) return;
    stangAutoBand();
    if (yta.getAttribute('data-zoom') === 'in') yta.removeAttribute('data-zoom');
    else yta.setAttribute('data-zoom', 'in');
  }
  function visaGalleri(g) {
    var n = Number(g.dataset.antal) || 1;
    var i = ((Number(g.dataset.index) % n) + n) % n;
    g.dataset.index = String(i);
    g.dataset.klar = 'nasta';
    skrivTal(g, i);
    var nu = g.querySelector('[data-sida="nu"]');
    var inn = g.querySelector('[data-sida="in"]');
    if (nu && kort.length) bytBild(nu, kort[i]);
    if (inn && kort.length) bytBild(inn, kort[(i + 1) % n]);
  }
  function steg(g, d) {
    if (!g) return;
    if (g.classList.contains('project__galleri')) stangAutoBand();
    var n = Number(g.dataset.antal) || 1;
    if (n < 2) return;
    var fran = ((Number(g.dataset.index) % n) + n) % n;
    var till = (fran + d + n) % n;
    g.removeAttribute('data-vand');
    slappZoom(g);
    g.dataset.index = String(till);
    if (g.classList.contains('project__galleri')) {
      g.style.setProperty('--svep', '0');
      window.scrollTo({ top: till * window.innerHeight, behavior: 'auto' });
      lasBild();
      return;
    }
    visaGalleri(g);
  }
  function lasBild() {
    var g = document.querySelector('.project .galleri');
    if (!g || g.hasAttribute('data-vand')) return;
    var n = Number(g.dataset.antal) || 1;
    var vh = window.innerHeight || 1;
    var y = window.scrollY / vh;
    if (y < 0) y = 0;
    if (y > n - 1) y = n - 1;
    var i = Math.floor(y + 1e-4);
    if (i > n - 1) i = n - 1;
    var f = i >= n - 1 ? 0 : y - i;
    g.style.setProperty('--svep', String(f));
    if (i >= n - 1) g.setAttribute('data-slut', '');
    else g.removeAttribute('data-slut');
    if (String(i) !== g.dataset.index) {
      g.dataset.index = String(i);
      skrivTal(g, i);
      slappZoom(g);
      if (i) stangAutoBand();
    }
    var nu = g.querySelector('[data-sida="nu"]');
    var inn = g.querySelector('[data-sida="in"]');
    if (nu && kort.length) bytBild(nu, kort[i]);
    if (inn && kort.length) bytBild(inn, kort[Math.min(n - 1, i + 1)]);
  }
  function shut() {
    if (!bars) return 0;
    var oppna = bars.querySelectorAll('.bar[data-open]');
    oppna.forEach(function (b) {
      b.removeAttribute('data-open');
      b.querySelector('.bar__head').setAttribute('aria-expanded', 'false');
    });
    return oppna.length;
  }
  var kantFarger = ['var(--gul)', 'var(--vit)', 'var(--rok)', 'var(--silver)', 'var(--dim)', 'var(--rosa)', 'var(--bla)', 'var(--tra)', 'var(--oliv)', 'var(--svart)'];
  function fallHuvud(el) {
    return el.querySelector('.bar__head, .project__head, .info__head, .fot__rad') || el;
  }
  function genomskinlig(f) { return !f || f === 'transparent' || /,\s*0\)$/.test(f); }
  function bakgrund(el) {
    var nod = el;
    while (nod && nod !== document.documentElement) {
      var f = getComputedStyle(nod).backgroundColor;
      if (!genomskinlig(f)) return f;
      nod = nod.parentElement;
    }
    return getComputedStyle(document.body).backgroundColor;
  }
  function slumpKant(bar) {
    var falt = bakgrund(fallHuvud(bar));
    var probe = document.createElement('i');
    probe.style.cssText = 'position:absolute;visibility:hidden';
    document.body.appendChild(probe);
    var vald = kantFarger[0];
    for (var n = 0; n < kantFarger.length; n++) {
      vald = kantFarger[Math.floor(Math.random() * kantFarger.length)];
      probe.style.background = vald;
      if (getComputedStyle(probe).backgroundColor !== falt) break;
    }
    probe.remove();
    bar.style.setProperty('--kant', vald);
  }
  function fallFarg(foredrag) {
    if (foredrag && foredrag.hasAttribute('data-open')) { colour(foredrag); return; }
    var vald = null;
    document.querySelectorAll(FALL_VAL).forEach(function (el) {
      if (el.hasAttribute('data-open')) vald = el;
    });
    colour(vald);
  }
  function colour(bar) {
    if (!bar) {
      html.style.removeProperty('--field');
      html.style.removeProperty('--accent');
      html.style.removeProperty('--rad-text');
      html.style.removeProperty('--kant');
      return;
    }
    var par = getComputedStyle(bar);
    html.style.setProperty('--field', bar.style.getPropertyValue('--field') || par.getPropertyValue('--field').trim());
    html.style.setProperty('--accent', bar.style.getPropertyValue('--accent') || par.getPropertyValue('--accent').trim());
    html.style.setProperty('--rad-text', bar.style.getPropertyValue('--rad-text') || par.getPropertyValue('--rad-text').trim());
    html.style.setProperty('--kant', bar.style.getPropertyValue('--kant'));
  }
  function sattFlipRader() { matOm(); }
  function hemTal(hem) {
    var n = bilder.length;
    var i = Number(hem.dataset.index) || 0;
    var ix = hem.querySelector('[data-roll="index"]');
    var an = hem.querySelector('[data-roll="antal"]');
    if (ix) ix.textContent = String(i + 1);
    if (an) an.textContent = String(n);
  }
  function lagraBlad(i) {
    try { sessionStorage.setItem('loa-hem-index', String(i)); } catch (err) {}
  }
  function slumpBlad(n) {
    var raw = null;
    try { raw = sessionStorage.getItem('loa-hem-index'); } catch (err) { raw = null; }
    var last = raw === null || raw === '' ? -1 : Number(raw);
    var i = Math.floor(Math.random() * n);
    if (n > 1 && i === last) i = (i + 1) % n;
    return i;
  }
  function visaSida(hem, i) {
    var n = bilder.length;
    if (!n) return;
    i = ((i % n) + n) % n;
    slappZoom(hem);
    hem.dataset.index = String(i);
    var nu = hem.querySelector('[data-sida="nu"]');
    var inn = hem.querySelector('[data-sida="in"]');
    if (nu) bytBild(nu, bilder[i]);
    if (inn) bytBild(inn, bilder[(i + 1) % n]);
    hemTal(hem);
    lagraBlad(i);
  }
  function vandra(hem, d) {
    var n = bilder.length;
    if (!hem || !n) return;
    visaSida(hem, (Number(hem.dataset.index) + d + n) % n);
  }
  function startaHem() {
    var hem = document.querySelector('.home');
    if (!hem || !bilder.length) return;
    sattFlipRader();
    hem.dataset.riktning = 'nasta';
    hem.dataset.klar = 'nasta';
    visaSida(hem, slumpBlad(bilder.length));
    hem.addEventListener('pointermove', function (e) {
      if (hem.hasAttribute('data-vand')) return;
      var r = hem.getBoundingClientRect();
      var t = (e.clientX - r.left) / r.width;
      hem.dataset.riktning = t < 0.5 ? 'fore' : 'nasta';
    });
  }
  function bildMatt(img) {
    var w = Number(img.getAttribute('width')) || img.naturalWidth || 0;
    var h = Number(img.getAttribute('height')) || img.naturalHeight || 0;
    return { w: w, h: h, port: h > w && w > 0 };
  }
  function grupperaYta(rot) {
    var i = 0;
    while (i < rot.children.length) {
      var el = rot.children[i];
      if (el.tagName !== 'IMG') { i += 1; continue; }
      var a = bildMatt(el);
      var nasta = rot.children[i + 1];
      var b = nasta && nasta.tagName === 'IMG' ? bildMatt(nasta) : null;
      var yta = document.createElement('div');
      yta.className = 'bar__yta';
      if (a.port && b && b.port) {
        yta.dataset.yta = 'par';
        yta.style.setProperty('--rad-kvot', String(2 / Math.max(a.h / a.w, b.h / b.w)));
        rot.insertBefore(yta, el);
        yta.appendChild(el);
        yta.appendChild(nasta);
      } else {
        yta.dataset.yta = 'vid';
        rot.insertBefore(yta, el);
        yta.appendChild(el);
      }
    }
  }
  document.querySelectorAll('.bar__sida, .bar__rulle').forEach(grupperaYta);

  function openBar(bar, rullaDit) {
    if (!bars || !bar) return;
    shut();
    bar.setAttribute('data-open', '');
    bar.querySelector('.bar__head').setAttribute('aria-expanded', 'true');
    slumpKant(bar);
    fallFarg(bar);
    markRoll();
    sattMark();
    requestAnimationFrame(function () {
      if (lenis) lenis.resize();
      if (rullaDit) rulla(bar);
      visaMer();
    });
  }

  if (kort.length) {
    for (var i = kort.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = kort[i];
      kort[i] = kort[j];
      kort[j] = t;
    }
    document.querySelectorAll('.shot__bild').forEach(function (el, n) {
      el.src = kort[n % kort.length];
    });
    startaHem();
    document.querySelectorAll('.galleri').forEach(function (g, n) {
      g.dataset.index = String(n % kort.length);
      g.dataset.antal = String(kort.length);
      var artikel = g.closest('.project');
      if (artikel) artikel.style.setProperty('--antal', String(kort.length));
      visaGalleri(g);
    });
    if (document.querySelector('.project .galleri')) { lasBild(); oppnaAutoBand(); }
    var rulle = document.querySelector('.project[data-form="rulle"] .project__rulle');
    if (rulle) {
      kort.forEach(function (src) {
        var img = document.createElement('img');
        img.alt = '';
        img.width = 1600;
        img.height = 1200;
        rulle.appendChild(img);
        bytBild(img, src);
      });
    }
  }
  document.querySelectorAll('.home__image, .galleri__bild, .project__rulle img').forEach(ladda);

  document.querySelectorAll('.galleri__yta').forEach(function (yta) {
    yta.dataset.riktning = 'nasta';
    yta.addEventListener('pointermove', function (e) {
      var r = yta.getBoundingClientRect();
      var t = (e.clientX - r.left) / r.width;
      if (yta.closest('.bar')) { yta.dataset.riktning = t < 0.5 ? 'fore' : 'nasta'; return; }
      var zoomaYta = !!yta.closest('.project');
      yta.dataset.riktning = zoomaYta ? (t < 0.369 ? 'fore' : t > 0.631 ? 'nasta' : 'plus') : (t < 0.5 ? 'fore' : 'nasta');
    });
  });

  var mark = document.querySelector('.mark');
  var menu = document.querySelector('.menu');
  sattMark();
  var menyTid = 0;
  function menyHallMs() {
    var n = parseFloat(getComputedStyle(html).getPropertyValue('--meny-hall-tal'));
    return tauMs() * (n || 125);
  }
  function menyStang() {
    if (!menu) return;
    clearTimeout(menyTid);
    menyTid = 0;
    html.style.setProperty('--mark-steg', '3');
    menu.removeAttribute('data-open');
    lasAv('meny');
    sattMark();
  }
  function menyStangSen() {
    clearTimeout(menyTid);
    menyTid = setTimeout(menyStang, menyHallMs());
  }
  function menyOppna() {
    clearTimeout(menyTid);
    menyTid = 0;
    if (menyOppet()) return;
    var n = Number(html.dataset.satt || 0);
    html.dataset.satt = String((n + 1) % 9);
    html.style.setProperty('--mark-steg', '3');
    if (!html.style.getPropertyValue('--kant')) html.style.setProperty('--kant', kantFarger[Math.floor(Math.random() * kantFarger.length)]);
    lasPa('meny');
    html.dataset.syfte = 'meny';
    delete html.dataset.led;
    menu.setAttribute('data-open', '');
    sattMark();
    requestAnimationFrame(lasTon);
  }
  function inomNav(nod) {
    return !!(nod && ((mark && mark.contains(nod)) || (menu && menu.contains(nod))));
  }
  if (mark && menu) {
    mark.addEventListener('pointerenter', menyOppna);
    menu.addEventListener('pointerenter', menyOppna);
    mark.addEventListener('pointerleave', function (e) { if (!inomNav(e.relatedTarget)) menyStangSen(); });
    menu.addEventListener('pointerleave', function (e) { if (!inomNav(e.relatedTarget)) menyStangSen(); });
    mark.addEventListener('transitionend', function (e) {
      if (e.target !== mark || e.propertyName !== 'translate' || menyOppet()) return;
      if (html.dataset.led === 'upp' && html.dataset.lage !== 'botten-mitten') {
        html.style.setProperty('--mark-steg', '3');
        html.dataset.syfte = 'meny';
        delete html.dataset.led;
      }
      lasAv('lage');
    });
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      menyStang();
    });
  }

  document.addEventListener('click', function (e) {
    var atg = e.target.closest('[data-atgard]');
    if (atg) {
      var g = atg.closest('.galleri');
      var kod = atg.getAttribute('data-atgard');
      if (kod === 'bar/vaxla') {
        var head = atg.closest('.bar__head');
        var bar = head && head.closest('.bar');
        if (!bar) return;
        if (bar.hasAttribute('data-open')) { shut(); fallFarg(); markRoll(); sattMark(); visaMer(); return; }
        openBar(bar);
        history.replaceState(null, '', '#' + bar.dataset.slug);
        return;
      }
      if (kod === 'band/vaxla' || kod === 'fot/vaxla' || kod === 'remsa/vaxla') {
        var band = atg.closest('.project__band, .info__fall, .fot, .project__remsa');
        if (!band) return;
        var oppna = band.hasAttribute('data-open');
        if (oppna) {
          band.removeAttribute('data-open');
          band.removeAttribute('data-hall');
        } else {
          band.setAttribute('data-open', '');
          if (band.classList.contains('project__band')) band.setAttribute('data-hall', '');
          slumpKant(band);
        }
        atg.setAttribute('aria-expanded', oppna ? 'false' : 'true');
        fallFarg(band);
        markRoll();
        sattMark();
        return;
      }
      if (kod === 'hem/blad') {
        var hem = atg.classList.contains('home') ? atg : atg.closest('.home');
        if (!hem) return;
        e.preventDefault();
        vandra(hem, hem.dataset.riktning === 'fore' ? -1 : 1);
        return;
      }
      if (g && kod === 'galleri/nasta') { e.preventDefault(); steg(g, 1); return; }
      if (g && kod === 'galleri/fore') { e.preventDefault(); steg(g, -1); return; }
      if (g && kod === 'galleri/steg') {
        if (g.closest('.bar')) { e.preventDefault(); steg(g, atg.dataset.riktning === 'fore' ? -1 : 1); return; }
        if (atg.dataset.riktning === 'plus' && g.classList.contains('project__galleri')) { e.preventDefault(); zooma(atg); return; }
        e.preventDefault();
        steg(g, atg.dataset.riktning === 'fore' ? -1 : 1);
        return;
      }
    }
    var a = e.target.closest('a[href]');
    if (!a) return;
    var url;
    try { url = new URL(a.href); } catch (err) { return; }
    if (url.pathname !== location.pathname || !url.hash) return;
    var slug = url.hash.slice(1);
    var mal = document.getElementById(slug) || document.querySelector('[data-slug="' + slug + '"]');
    if (!mal) return;
    e.preventDefault();
    history.replaceState(null, '', url.hash);
    if (mal.classList.contains('bar')) openBar(mal, true);
    else rulla(mal);
    menyStang();
  });

  document.addEventListener('keydown', function (e) {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.classList && e.target.classList.contains('home')) {
      e.preventDefault();
      vandra(e.target, e.target.dataset.riktning === 'fore' ? -1 : 1);
      return;
    }
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    if (menyOppet()) return;
    var g = e.target.closest && e.target.closest('.galleri');
    if (!g) {
      if (e.target.closest('a, button, input, textarea')) return;
      var hem = document.querySelector('.home');
      if (hem) { e.preventDefault(); vandra(hem, e.key === 'ArrowRight' ? 1 : -1); return; }
      g = document.querySelector('.project .galleri');
      if (!g) return;
    }
    e.preventDefault();
    steg(g, e.key === 'ArrowRight' ? 1 : -1);
  });

  var start = hashMal();
  if (start && !start.classList.contains('bar')) start.scrollIntoView({ behavior: 'auto', block: 'start' });

  if (globalThis.Lenis && !minskad) {
    lenis = new globalThis.Lenis({ autoRaf: true, smoothWheel: true, lerp: 0.1 });
  }

  matOm();
  window.addEventListener('resize', matOm);
  function pixelBild(img, x, y) {
    if (!img.naturalWidth) return null;
    var r = img.getBoundingClientRect();
    var nw = img.naturalWidth;
    var nh = img.naturalHeight;
    var skala = Math.max(r.width / nw, r.height / nh);
    var sx = Math.max(0, Math.min(nw - 1, (x - r.left - (r.width - nw * skala) / 2) / skala));
    var sy = Math.max(0, Math.min(nh - 1, (y - r.top - (r.height - nh * skala) / 2) / skala));
    var yta = document.createElement('canvas');
    yta.width = 1;
    yta.height = 1;
    try {
      var ctx = yta.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(img, sx, sy, 1, 1, 0, 0, 1, 1);
      var d = ctx.getImageData(0, 0, 1, 1).data;
      return [d[0], d[1], d[2]];
    } catch (err) { return null; }
  }
  function fargUnder(x, y) {
    var lista = document.querySelectorAll('.menu a, .project__steg, .mark, .mark__mer');
    var dold = [];
    lista.forEach(function (el) {
      if (getComputedStyle(el).visibility === 'hidden') return;
      dold.push(el);
      el.style.visibility = 'hidden';
    });
    var el = document.elementFromPoint(x, y);
    dold.forEach(function (nod) { nod.style.visibility = ''; });
    if (!el) return null;
    if (el.tagName === 'IMG') return pixelBild(el, x, y);
    var nod = el;
    while (nod && nod !== document.body) {
      var bg = getComputedStyle(nod).backgroundColor;
      var m = bg && bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
      if (m && (m[4] === undefined || Number(m[4]) > 0.45)) return [Number(m[1]), Number(m[2]), Number(m[3])];
      nod = nod.parentElement;
    }
    return [255, 255, 255];
  }
  function lasTon() {
    document.querySelectorAll('.menu a, .project__steg, .mark__mer').forEach(function (el) {
      var stil = getComputedStyle(el);
      if (stil.visibility === 'hidden' || Number(stil.opacity) === 0) { el.removeAttribute('data-ton'); return; }
      var ruta = el.getBoundingClientRect();
      if (ruta.width < 1 || ruta.height < 1) return;
      var rgb = fargUnder(ruta.left + ruta.width / 2, ruta.top + ruta.height / 2);
      if (!rgb) { el.removeAttribute('data-ton'); return; }
      var ljus = (0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]) / 255;
      if (ljus < 0.45) el.dataset.ton = 'vit';
      else el.removeAttribute('data-ton');
    });
  }
  function lasScroll() {
    ram = 0;
    lasBild();
    var plan = flode[sida];
    if (!plan || !plan.ned) return;
    var y = window.scrollY;
    var d = y - senY;
    senY = y;
    if (!d) return;
    acc = acc === 0 || Math.sign(d) === Math.sign(acc) ? acc + d : d;
    if (Math.abs(acc) < matt.u) return;
    var dir = acc > 0 ? 1 : -1;
    acc = 0;
    var max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    var nasta = plan.vila;
    var led = '';
    if (y >= matt.u && max - y >= matt.u * 2) {
      nasta = dir > 0 ? plan.ned : plan.upp;
      led = dir > 0 ? 'ned' : (nasta.indexOf('topp') === 0 ? 'upp' : '');
    } else if (max - y < matt.u * 2) nasta = plan.slut || plan.vila;
    if (visaMer()) return;
    sattLage(nasta, led);
    sattMark();
  }
  window.addEventListener('scroll', function () {
    if (ram) return;
    ram = requestAnimationFrame(function () { lasScroll(); lasTon(); });
  }, { passive: true });
  document.querySelectorAll('.galleri__bild, .home__image, .project__rulle img').forEach(function (img) { img.addEventListener('load', lasTon); });
  requestAnimationFrame(lasTon);

  if (!bars) return;
  if (lenis && typeof ResizeObserver !== 'undefined') {
    new ResizeObserver(function () { lenis.resize(); }).observe(bars);
  }
  bars.addEventListener('transitionend', function (e) {
    if (!e.target.classList || !e.target.classList.contains('bar__fold')) return;
    if (e.propertyName !== 'grid-template-rows') return;
    fallKlar();
  });
  var startBar = start && start.classList.contains('bar') ? start : null;
  if (!startBar) {
    var slug = location.hash.slice(1);
    startBar = slug && bars.querySelector('.bar[data-slug="' + slug + '"]');
  }
  if (startBar) openBar(startBar, true);
})();
