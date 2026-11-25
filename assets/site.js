/* Pristacla Holdings: menu behaviour.
   - Builds the Products menu (desktop panel + mobile sheet) from the product cards in #products, so
     adding a card is the only step needed to list a new product. A product whose card is a link
     (it has a public site) links there from the menu; a product in development links to its card.
   - Products and Legal buttons: click or ArrowDown opens; arrow keys, Home and End move between links;
     Escape, a click outside, or moving keyboard focus out of the menu closes it. One menu at a time.
   - Opening the page at #menu or #legal shows that menu open (on phones both open the menu sheet). */
(function(){
  var d = document, root = d.documentElement;
  var mq = window.matchMedia('(max-width: 760px)');
  var cards = [].slice.call(d.querySelectorAll('#products .card'));

  /* ---------- Products menu entries (thumbnail = clone of the card's screen) ---------- */
  function cardName(card){
    var h = card.querySelector('.name');
    return card.dataset.name || (h ? h.textContent.trim() : '');
  }
  function thumb(card){
    var src = card.querySelector('[data-thumb]');
    var t = d.createElement('span');
    t.className = 'mthumb'; t.setAttribute('aria-hidden', 'true');
    t.dataset.shape = card.dataset.shape || 'land';
    var s = d.createElement('span'); s.className = 'screen';
    if (src) {
      var r = src.getBoundingClientRect();
      if (r.width && r.height) s.style.aspectRatio = (r.width / r.height).toFixed(4);
      if (src.firstElementChild) {
        var c = src.firstElementChild.cloneNode(true);
        if (c.tagName === 'IMG') c.removeAttribute('loading');
        s.appendChild(c);
      }
    }
    t.appendChild(s);
    return t;
  }
  function entry(card){
    var li = d.createElement('li');
    var a = d.createElement('a'); a.className = 'pitem';
    a.href = card.tagName === 'A' ? card.getAttribute('href') : (card.id ? '#' + card.id : '#products');
    var accent = card.style.getPropertyValue('--accent');
    if (accent) a.style.setProperty('--accent', accent);
    a.appendChild(thumb(card));
    var txt = d.createElement('div');
    var nm = d.createElement('span'); nm.className = 'pitem__name'; nm.textContent = cardName(card);
    txt.appendChild(nm);
    var chips = card.querySelector('.chips');
    if (chips) txt.appendChild(chips.cloneNode(true));
    a.appendChild(txt); li.appendChild(a);
    return li;
  }
  [].forEach.call(d.querySelectorAll('[data-plist]'), function(list){
    cards.forEach(function(c){ list.appendChild(entry(c)); });
  });
  [].forEach.call(d.querySelectorAll('[data-count]'), function(el){ el.textContent = String(cards.length).padStart(2, '0'); });

  /* ---------- Open / close ---------- */
  var menus = [
    ['products-btn', 'products-menu'],
    ['legal-btn', 'legal-menu'],
    ['menu-btn', 'mobile-nav']
  ].map(function(ids){ return { btn: d.getElementById(ids[0]), panel: d.getElementById(ids[1]) }; })
   .filter(function(m){ return m.btn && m.panel; });
  var sheet = d.getElementById('mobile-nav');

  function links(panel){ return [].slice.call(panel.querySelectorAll('a')); }
  function isOpen(m){ return m.panel.classList.contains('open'); }
  function visibleButton(m){
    if (m.btn.getClientRects().length) return m.btn;
    return d.getElementById(mq.matches ? 'menu-btn' : 'products-btn');
  }
  function setOpen(m, open, focus){
    if (open) menus.forEach(function(o){ if (o !== m && isOpen(o)) setOpen(o, false); });
    m.panel.classList.toggle('open', open);
    m.panel.inert = !open;  /* a closing panel can't take focus while it fades out */
    m.btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open && m.panel === sheet) updateFade();
    if (open && focus) { var l = links(m.panel)[0]; if (l) l.focus(); }
  }
  function closeAll(returnFocus){
    menus.forEach(function(m){
      if (!isOpen(m)) return;
      var hadFocus = m.panel.contains(d.activeElement);
      setOpen(m, false);
      if (returnFocus || hadFocus) { var b = visibleButton(m); if (b) b.focus(); }
    });
  }

  menus.forEach(function(m){
    m.panel.inert = !isOpen(m);
    m.btn.addEventListener('click', function(){ setOpen(m, !isOpen(m)); });
    m.btn.addEventListener('keydown', function(e){
      if (e.key === 'ArrowDown') { e.preventDefault(); setOpen(m, true, true); }
    });
    m.panel.addEventListener('keydown', function(e){
      var ls = links(m.panel), i = ls.indexOf(d.activeElement);
      if (i < 0) return;
      var n = null;
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') n = (i + 1) % ls.length;
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') n = (i - 1 + ls.length) % ls.length;
      if (e.key === 'Home') n = 0;
      if (e.key === 'End') n = ls.length - 1;
      if (n !== null) { e.preventDefault(); ls[n].focus(); }
    });
    m.panel.addEventListener('click', function(e){ if (e.target.closest('a')) setOpen(m, false); });
    /* Keyboard focus moving out of the button + menu closes the menu */
    var onFocusOut = function(e){
      var to = e.relatedTarget;
      if (to && isOpen(m) && !m.panel.contains(to) && !m.btn.contains(to)) setOpen(m, false);
    };
    m.btn.addEventListener('focusout', onFocusOut);
    m.panel.addEventListener('focusout', onFocusOut);
  });
  d.addEventListener('keydown', function(e){ if (e.key === 'Escape') closeAll(false); });

  /* A click outside an open menu only closes it: it doesn't also follow the link underneath */
  var eatClick = function(ev){ ev.preventDefault(); ev.stopPropagation(); };
  d.addEventListener('pointerdown', function(e){
    var closed = false;
    menus.forEach(function(m){
      if (isOpen(m) && !m.panel.contains(e.target) && !m.btn.contains(e.target)) { setOpen(m, false); closed = true; }
    });
    d.removeEventListener('click', eatClick, true);
    if (closed && !e.target.closest('.topbar')) {
      d.addEventListener('click', eatClick, { capture: true, once: true });
      setTimeout(function(){ d.removeEventListener('click', eatClick, true); }, 600);
    }
  });
  var onMq = function(){ closeAll(false); };
  if (mq.addEventListener) mq.addEventListener('change', onMq); else if (mq.addListener) mq.addListener(onMq);

  /* ---------- Mobile sheet: fade its bottom edge while there's more to scroll ---------- */
  function updateFade(){
    if (!sheet) return;
    var more = sheet.scrollTop + sheet.clientHeight < sheet.scrollHeight - 2;
    sheet.classList.toggle('more', more);
  }
  if (sheet) {
    sheet.addEventListener('scroll', updateFade, { passive: true });
    window.addEventListener('resize', updateFade);
  }

  /* ---------- Deep links: #menu opens Products, #legal opens Legal ---------- */
  function openFromHash(){
    var deep = { '#menu': 'products-menu', '#legal': 'legal-menu' }[location.hash];
    if (!deep) return;
    var m = menus.filter(function(x){ return x.panel.id === (mq.matches ? 'mobile-nav' : deep); })[0];
    if (!m) return;
    m.panel.style.transition = 'none';
    setOpen(m, true);
    if (deep === 'legal-menu' && m.panel === sheet) {
      var g = sheet.querySelector('.sheet__group');
      if (g) sheet.scrollTop = g.offsetTop - 8;
      updateFade();
    }
    void m.panel.offsetWidth;
    requestAnimationFrame(function(){ requestAnimationFrame(function(){ m.panel.style.transition = ''; }); });
  }
  openFromHash();
  window.addEventListener('hashchange', openFromHash);

  /* ---------- Menu bar state on scroll ---------- */
  var onScroll = function(){ root.classList.toggle('is-scrolled', window.scrollY > 8); };
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
})();
