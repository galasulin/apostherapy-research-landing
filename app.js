/* Apostherapy LP - visual interactions (unchanged from production). The demo form lives in demo-form.js */
(function(){
  'use strict';

  /* ---- Nav scroll state ---- */
  var nav = document.querySelector('.nav');
  function onScroll(){
    if(window.scrollY > 24) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  }
  window.addEventListener('scroll', onScroll, {passive:true});
  onScroll();

  /* ---- Mobile "open form" button → scroll to form ---- */
  var openBtn = document.querySelector('.open-btn');
  if(openBtn){
    openBtn.addEventListener('click', function(){
      var lead = document.getElementById('lead');
      if(lead) lead.scrollIntoView({behavior:'smooth', block:'start'});
    });
  }

  /* ---- 3D hero engine: interactive orbit / tilt ---- */
  var stage = document.querySelector('.stage');
  var shoe = document.querySelector('.shoe3d');
  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if(stage && shoe){
    var hmode = stage.getAttribute('data-hero-mode') || 'orbit';
    var hovering = false, dragging = false, lastX = 0;
    var npx = 0, npy = 0, spin = 0, curRx = 0, curRy = 0;
    var phase = 0, lastTs = 0, raf = null, inView = true;

    function loop(ts){
      var dt = lastTs ? Math.min((ts - lastTs) / 1000, 0.05) : 0.016;
      lastTs = ts;
      var tx = 0, ty = 0;
      if(hmode === 'tilt'){
        if(hovering){ ty = npx * 22; tx = -npy * 15; }
      } else if(hmode === 'orbit'){
        if(hovering){ ty = spin + npx * 30; tx = -npy * 18; }
        else if(prefersReduced){ spin *= 0.96; ty = spin; tx = 0; }
        else { phase += dt * 0.55; spin *= 0.96; ty = spin + Math.sin(phase) * 23; tx = Math.sin(phase * 0.8) * 4; }
      }
      curRx += (tx - curRx) * 0.10;
      curRy += (ty - curRy) * 0.10;
      shoe.style.setProperty('--rx', curRx.toFixed(2) + 'deg');
      shoe.style.setProperty('--ry', curRy.toFixed(2) + 'deg');
      raf = requestAnimationFrame(loop);
    }
    function start(){ if(!raf && inView && hmode !== 'stage'){ lastTs = 0; raf = requestAnimationFrame(loop); } }
    function stop(){ if(raf){ cancelAnimationFrame(raf); raf = null; } }

    function ptr(e){
      var r = stage.getBoundingClientRect();
      npx = Math.max(-1.4, Math.min(1.4, (e.clientX - (r.left + r.width / 2)) / (r.width / 2)));
      npy = Math.max(-1.4, Math.min(1.4, (e.clientY - (r.top + r.height / 2)) / (r.height / 2)));
    }
    stage.addEventListener('pointerenter', function(e){ hovering = true; ptr(e); start(); });
    stage.addEventListener('pointermove', function(e){
      hovering = true;
      if(dragging){ spin += (e.clientX - lastX) * 0.45; lastX = e.clientX; }
      ptr(e); start();
    });
    stage.addEventListener('pointerleave', function(){ hovering = false; dragging = false; stage.classList.remove('grabbing'); });
    stage.addEventListener('pointerdown', function(e){ dragging = true; lastX = e.clientX; stage.classList.add('grabbing'); start(); });
    window.addEventListener('pointerup', function(){ dragging = false; stage.classList.remove('grabbing'); });

    if('IntersectionObserver' in window){
      new IntersectionObserver(function(es){
        es.forEach(function(en){ inView = en.isIntersecting; if(inView) start(); else stop(); });
      }, {threshold:0.05}).observe(stage);
    }
    start();
  }

  /* ---- Scroll reveal ---- */
  if('IntersectionObserver' in window){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if(en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, {threshold:0.16, rootMargin:'0px 0px -8% 0px'});
    document.querySelectorAll('.reveal').forEach(function(el){ io.observe(el); });
  } else {
    document.querySelectorAll('.reveal').forEach(function(el){ el.classList.add('in'); });
  }

  /* ---- Counters ---- */
  function animateCount(el){
    var target = parseFloat(el.getAttribute('data-count'));
    var dur = 1500, startT = null;
    function step(ts){
      if(!startT) startT = ts;
      var p = Math.min((ts - startT) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased).toLocaleString('en-US');
      if(p < 1) requestAnimationFrame(step);
      else el.textContent = target.toLocaleString('en-US');
    }
    requestAnimationFrame(step);
  }
  if('IntersectionObserver' in window){
    var cio = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if(en.isIntersecting){ animateCount(en.target); cio.unobserve(en.target); }
      });
    }, {threshold:0.6});
    document.querySelectorAll('[data-count]').forEach(function(el){ cio.observe(el); });
  }

  /* ---- Video: click-to-load facade, see demo-form.js ---- */
})();
