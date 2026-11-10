// Filesmith website: OS-aware download buttons, language memory, tabs, and the live command demo.
(function () {
  const FS = window.FS || {};
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
  };

  // First visit: send people to their own language once. A manual choice always wins afterwards.
  const chosen = store.get('fs-lang');
  if (!chosen && FS.lang === 'en') {
    const pref = (navigator.languages || [navigator.language || 'en']).map((l) => l.toLowerCase().slice(0, 2)).find((l) => FS.langs.includes(l));
    if (pref && pref !== 'en') {
      store.set('fs-lang', pref);
      location.replace(`${pref}/${FS.page === 'index' ? '' : `${FS.page}.html`}`);
      return;
    }
  }
  document.querySelectorAll('[data-set-lang]').forEach((a) => a.addEventListener('click', () => store.set('fs-lang', a.dataset.setLang)));
  document.addEventListener('click', (e) => {
    const open = document.querySelector('details.lang[open]');
    if (open && !open.contains(e.target)) open.removeAttribute('open');
  });

  // Download buttons point at the right installer for this computer.
  const ua = navigator.userAgent;
  const os = /Windows/i.test(ua) ? 'win' : (/Macintosh|Mac OS X/i.test(ua) && !/iPhone|iPad/i.test(ua) ? 'mac' : null);
  if (os) {
    document.querySelectorAll('[data-dl-label]').forEach((s) => { s.textContent = os === 'win' ? FS.t.win : FS.t.mac; });
    if (os === 'win') document.querySelectorAll('a[data-dl]').forEach((a) => { if (a.querySelector('[data-dl-label]')) a.href = FS.releases + FS.files.win; });
    const card = document.querySelector(`.dl-card[data-os="${os}"]`);
    if (card) { card.classList.add('mine'); card.parentElement.prepend(card); }
  }

  // Tabs (keyboard: arrow keys move between them), with an indicator that slides to the chosen tab.
  const tabs = [...document.querySelectorAll('[role="tab"]')];
  const tabBar = tabs[0] && tabs[0].parentElement;
  let ind = null;
  if (tabBar) { ind = document.createElement('span'); ind.className = 'tab-ind'; tabBar.prepend(ind); tabBar.classList.add('has-ind'); }
  const moveInd = (tab, instant) => {
    if (!ind || !tab) return;
    if (instant) ind.style.transition = 'none';
    ind.style.width = `${tab.offsetWidth}px`;
    ind.style.transform = `translate(${tab.offsetLeft}px, ${tab.offsetTop - 3}px)`;
    if (instant) { ind.offsetWidth; ind.style.transition = ''; }
  };
  const select = (tab) => {
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute('aria-selected', on);
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
    });
    moveInd(tab);
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => select(t));
    t.addEventListener('keydown', (e) => {
      const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!d) return;
      const n = tabs[(i + d + tabs.length) % tabs.length];
      select(n); n.focus();
    });
  });
  const current = () => tabs.find((t) => t.getAttribute('aria-selected') === 'true');
  if (tabs.length) {
    moveInd(current(), true);
    addEventListener('resize', () => moveInd(current(), true));
    if (document.fonts) document.fonts.ready.then(() => moveInd(current(), true));
  }

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Headings and lists arrive once, as they scroll into view.
  document.querySelectorAll('.sec-head, .proof, .final-in, .release, .panel, .dl-card').forEach((n) => n.classList.add('reveal'));
  document.querySelectorAll('.facts, .grid3, .faq, .steps').forEach((n) => {
    n.classList.add('stagger');
    [...n.children].forEach((c, i) => c.style.setProperty('--i', Math.min(i, 8)));
  });
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in');
    io.unobserve(e.target);
    if (e.target.classList.contains('proof')) countUp(e.target);
  }), { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal, .stagger').forEach((n) => io.observe(n));

  // Measured numbers count to their value: "149 MB → 9.1 MB" shrinks, "−88%" grows.
  function countUp(box) {
    if (reduce) return;
    box.querySelectorAll('.big').forEach((el) => {
      const text = el.textContent;
      const m = text.match(/(-?[\d.,]+)(?!.*\d)/);
      if (!m || /^0\D/.test(text.trim())) return;
      const comma = m[1].includes(',');
      const target = parseFloat(m[1].replace(',', '.'));
      const dec = (m[1].split(/[.,]/)[1] || '').length;
      const arrow = text.includes('→');
      const from = arrow ? parseFloat(text.match(/[\d.,]+/)[0].replace(',', '.')) : 0;
      const start = performance.now();
      const dur = 1400;
      const step = (now) => {
        const p = Math.min(1, (now - start) / dur);
        const e = 1 - Math.pow(1 - p, 4);
        let v = (from + (target - from) * e).toFixed(dec);
        if (comma) v = v.replace('.', ',');
        el.textContent = text.slice(0, m.index) + v + text.slice(m.index + m[1].length);
        if (p < 1) requestAnimationFrame(step); else el.textContent = text;
      };
      requestAnimationFrame(step);
    });
  }

  // The live command demo: types an outcome, shows the command, then the size bar shrinks to the result.
  const demo = document.querySelector('[data-demo]');
  if (demo && !reduce) {
    const data = JSON.parse(demo.dataset.demo);
    const q = demo.querySelector('.demo-q');
    const cmd = demo.querySelector('.demo-cmd');
    const row = demo.querySelector('.demo-row');
    const bar = demo.querySelector('.demo-bar');
    const barFill = bar.querySelector('i');
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    const ratioOf = (res) => {
      const n = res.match(/[\d]+(?:[.,]\d+)?/g);
      return res.includes('→') && n && n.length >= 2 ? parseFloat(n[1].replace(',', '.')) / parseFloat(n[0].replace(',', '.')) : null;
    };
    let visible = true;
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(demo);
    (async function loop() {
      await wait(1100);
      for (let i = 0; ; i = (i + 1) % data.q.length) {
        while (!visible || document.hidden) await wait(400);
        const r = data.r[i];
        cmd.classList.add('is-hidden'); row.classList.add('is-hidden');
        await wait(350);
        q.textContent = '';
        for (const ch of data.q[i]) { q.textContent += ch; await wait(50 + Math.random() * 45); }
        await wait(250);
        cmd.querySelector('b').textContent = r.cmd;
        cmd.querySelector('em').textContent = r.detail;
        cmd.classList.remove('is-hidden');
        await wait(650);
        const ratio = ratioOf(r.result);
        bar.classList.remove('shrunk');
        barFill.style.transition = 'none';
        barFill.style.setProperty('--to', 1);
        barFill.offsetWidth;
        barFill.style.transition = '';
        row.querySelector('.demo-file').textContent = r.file;
        row.querySelector('.demo-res').textContent = r.result;
        row.classList.remove('is-hidden');
        await wait(200);
        barFill.style.setProperty('--to', ratio ?? 1);
        bar.classList.add('shrunk');
        await wait(3000);
      }
    })();
  }
})();
