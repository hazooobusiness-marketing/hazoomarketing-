(function () {
  var root = document.documentElement;
  root.classList.add('js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var header = document.querySelector('.site-header');
  function onScroll() {
    header.classList.toggle('scrolled', window.scrollY > 8);
    var h = root.scrollHeight - window.innerHeight;
    header.style.setProperty('--p', h > 0 ? Math.min(1, window.scrollY / h) : 0);
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  var menu = document.querySelector('.menu');
  var nav = document.getElementById('nav');
  menu.addEventListener('click', function () {
    var open = nav.classList.toggle('open');
    menu.setAttribute('aria-expanded', open);
  });

  // contact page tabs
  var tabs = document.querySelectorAll('[role=tab]');
  function show(id) {
    tabs.forEach(function (t) {
      var on = t.getAttribute('aria-controls') === id;
      t.setAttribute('aria-selected', on);
      document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
    });
  }
  if (tabs.length) {
    var pick = function () { show(location.hash === '#call' ? 'call' : 'audit'); };
    tabs.forEach(function (t) {
      t.addEventListener('click', function () {
        var id = t.getAttribute('aria-controls');
        show(id);
        history.replaceState(null, '', '#' + id);
      });
    });
    window.addEventListener('hashchange', function () { pick(); window.scrollTo(0, 0); });
    pick();
    window.scrollTo(0, 0);
  }

  // FAQ: answers slide open and closed smoothly, one open at a time
  var ease = 'cubic-bezier(.2,.7,.2,1)';
  var gap = '12px';
  function openItem(d) {
    var answer = d.querySelector('summary + *');
    if (reduce || !answer.animate) { d.open = true; return; }
    d._busy = true;
    d.open = true;
    var h = answer.offsetHeight;
    answer.animate([
      { height: '0px', marginTop: '0px', opacity: 0, transform: 'translateY(-4px)' },
      { height: h + 'px', marginTop: gap, opacity: 1, transform: 'none' }
    ], { duration: 360, easing: ease }).onfinish = function () { d._busy = false; };
  }
  function closeItem(d) {
    var answer = d.querySelector('summary + *');
    if (reduce || !answer.animate) { d.open = false; return; }
    d._busy = true;
    var h = answer.offsetHeight;
    d.classList.add('closing');
    answer.animate([
      { height: h + 'px', marginTop: gap, opacity: 1 },
      { height: '0px', marginTop: '0px', opacity: 0 }
    ], { duration: 280, easing: ease }).onfinish = function () {
      d.open = false;
      d.classList.remove('closing');
      d._busy = false;
    };
  }
  document.querySelectorAll('details').forEach(function (d) {
    var summary = d.querySelector('summary');
    if (!summary || !d.querySelector('summary + *')) return;
    summary.addEventListener('click', function (e) {
      e.preventDefault();
      if (d._busy) return;
      if (d.open) { closeItem(d); return; }
      // close any other open question in the same list first
      Array.prototype.forEach.call(d.parentNode.querySelectorAll('details[open]'), function (other) {
        if (other !== d && !other._busy) closeItem(other);
      });
      openItem(d);
    });
  });

  // Apply page: show one question at a time
  document.querySelectorAll('form[data-steps]').forEach(function (form) {
    var steps = form.querySelectorAll('.step');
    var back = form.querySelector('[data-step-back]');
    var next = form.querySelector('[data-step-next]');
    var send = form.querySelector('[data-step-submit]');
    var now = form.querySelector('[data-step-now]');
    var total = form.querySelector('[data-step-total]');
    var bar = form.querySelector('[data-step-bar]');
    var i = 0;
    total.textContent = steps.length;
    function valid(step) {
      var fields = step.querySelectorAll('input, textarea');
      for (var k = 0; k < fields.length; k++) {
        if (!fields[k].checkValidity()) { fields[k].reportValidity(); return false; }
      }
      return true;
    }
    function show(n) {
      i = n;
      steps.forEach(function (s, k) { s.hidden = k !== i; });
      back.hidden = i === 0;
      next.hidden = i === steps.length - 1;
      send.hidden = i !== steps.length - 1;
      now.textContent = i + 1;
      bar.style.width = ((i + 1) / steps.length * 100) + '%';
      var first = steps[i].querySelector('textarea, input');
      if (first && n > 0) first.focus();
    }
    next.addEventListener('click', function () {
      if (!valid(steps[i])) return;
      var stopIf = steps[i].getAttribute('data-stop-if');
      var picked = steps[i].querySelector('input:checked');
      if (stopIf && picked && picked.value === stopIf) {
        form.classList.add('done');
        var msg = form.querySelector('.notfit');
        msg.hidden = false;
        msg.focus();
        return;
      }
      show(i + 1);
    });
    back.addEventListener('click', function () { show(i - 1); });
    form.addEventListener('submit', function (e) {
      if (!valid(steps[i])) { e.preventDefault(); e.stopImmediatePropagation(); }
    });
    show(0);
  });

  // Send form requests to the team's email through Web3Forms
  var ACCESS_KEY = '888f0834-9151-4b4b-9d07-35e78aab3169';
  function subjectFor(f) {
    if (f.dataset.subject) return f.dataset.subject;
    var panel = f.closest('[role=tabpanel]');
    if (panel && panel.id === 'call') return 'New free call request - Hazoo Marketing';
    if (panel && panel.id === 'audit') return 'New free call request - Hazoo Marketing';
    if (/consultation/.test(location.pathname)) return 'New consultation booking request - Hazoo Marketing';
    if (/contact/.test(location.pathname)) return 'New free call request - Hazoo Marketing';
    return 'New free call request - Hazoo Marketing';
  }
  document.querySelectorAll('form[data-form]').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = f.querySelector('button[type=submit]');
      var msg = f.querySelector('.ok');
      if (!msg.dataset.text) msg.dataset.text = msg.textContent;
      var label = btn.textContent;
      btn.disabled = true;
      btn.textContent = 'Sending...';
      var data = { access_key: ACCESS_KEY, subject: subjectFor(f), from_name: 'Hazoo Marketing website' };
      new FormData(f).forEach(function (v, k) { data[k] = v; });
      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(data)
      })
        .then(function (r) { return r.json(); })
        .then(function (res) {
          if (!res.success) throw new Error(res.message || 'Send failed');
          f.reset();
          if (f.hasAttribute('data-steps')) f.classList.add('done');
          msg.classList.remove('err');
          msg.textContent = msg.dataset.text;
        })
        .catch(function () {
          msg.classList.add('err');
          msg.textContent = 'Sorry, your request could not be sent. Please try again in a moment.';
        })
        .then(function () {
          btn.disabled = false;
          btn.textContent = label;
          msg.hidden = false;
          msg.focus();
        });
    });
  });
})();
