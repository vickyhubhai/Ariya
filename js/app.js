document.addEventListener('DOMContentLoaded', () => {
  const nav = document.querySelector('nav');
  let navTick = false;
  window.addEventListener('scroll', () => {
    if (navTick) return;
    navTick = true;
    requestAnimationFrame(() => {
      nav.classList.toggle('scrolled', window.scrollY > 30);
      navTick = false;
    });
  }, { passive: true });

  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      let t = null;
      try { t = document.querySelector(a.getAttribute('href')); } catch { t = null; }
      if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // Scroll reveal
  const reveals = document.querySelectorAll('.reveal');
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); revealObs.unobserve(e.target); } });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  reveals.forEach(el => revealObs.observe(el));

  // 3D tilt — fine pointers only (no cost on touch), rAF-throttled
  const canTilt = matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (canTilt) {
    const attachTilt = (el, maxYaw, maxPitch) => {
      let pending = false;
      el.addEventListener('mousemove', e => {
        if (pending) return;
        pending = true;
        requestAnimationFrame(() => {
          pending = false;
          const r = el.getBoundingClientRect();
          const x = (e.clientX - r.left) / r.width - 0.5;
          const y = (e.clientY - r.top) / r.height - 0.5;
          el.style.transform = `perspective(800px) rotateY(${x * maxYaw}deg) rotateX(${-y * maxPitch}deg) translateY(-8px)`;
        });
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = 'perspective(800px) rotateY(0) rotateX(0) translateY(0)';
      });
    };
    document.querySelectorAll('.feature-card').forEach(card => attachTilt(card, 8, 8));
    const rc = document.querySelector('.release-card');
    if (rc) {
      attachTilt(rc, 5, 5);
      rc.addEventListener('mouseleave', () => { rc.style.transform = ''; });
    }
  }

  // Particles — single reflow via DocumentFragment
  const pWrap = document.getElementById('particles');
  if (pWrap) {
    const frag = document.createDocumentFragment();
    for (let i = 0; i < 30; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      p.style.left = Math.random() * 100 + '%';
      p.style.width = p.style.height = (Math.random() * 3 + 1) + 'px';
      p.style.animationDuration = (Math.random() * 15 + 10) + 's';
      p.style.animationDelay = (Math.random() * 15) + 's';
      p.style.opacity = Math.random() * 0.5 + 0.1;
      frag.appendChild(p);
    }
    pWrap.appendChild(frag);
  }

  Download.init();
  ReleaseSync.init();
  Discord.init();

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
});
