/* Questling — haptics, sound, confetti, toasts, sheets, notifications, wake lock. */
(function (Q) {
  'use strict';
  var art = Q.art;

  /* ---------------- haptics ----------------
     navigator.vibrate covers Android. iOS Safari has no Vibration API, but
     toggling a <input type="checkbox" switch> plays the system tick on
     iOS 17.4+, so that is the fallback. Either may silently do nothing. */
  var swEl = null;
  function iosTick() {
    if (!swEl) {
      swEl = document.createElement('input');
      swEl.type = 'checkbox';
      swEl.setAttribute('switch', '');
      swEl.className = 'hapticSwitch';
      swEl.setAttribute('aria-hidden', 'true');
      swEl.tabIndex = -1;
      document.body.appendChild(swEl);
    }
    try { swEl.checked = !swEl.checked; swEl.dispatchEvent(new Event('change')); } catch (e) {}
  }
  var PAT = { tap: [9], ok: [14], win: [18, 44, 26], big: [22, 50, 22, 50, 40], err: [34, 46, 34] };
  function haptic(kind) {
    if (!Q.S.settings.haptics) return;
    var p = PAT[kind] || PAT.tap;
    if (navigator.vibrate) { try { navigator.vibrate(p); return; } catch (e) {} }
    iosTick();
  }
  function hapticSupport() {
    return navigator.vibrate ? 'vibration' : 'ios-tick';
  }

  /* ---------------- sound (synthesised, no files) ---------------- */
  var ac = null;
  function ctx() {
    if (!ac) { var C = window.AudioContext || window.webkitAudioContext; if (C) ac = new C(); }
    if (ac && ac.state === 'suspended') ac.resume();
    return ac;
  }
  function tone(freq, start, dur, vol, type) {
    var a = ctx(); if (!a) return;
    var o = a.createOscillator(), g = a.createGain();
    o.type = type || 'sine'; o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, a.currentTime + start);
    g.gain.exponentialRampToValueAtTime(vol, a.currentTime + start + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + start + dur);
    o.connect(g); g.connect(a.destination);
    o.start(a.currentTime + start); o.stop(a.currentTime + start + dur + 0.02);
  }
  var SFX = {
    tap: function () { tone(660, 0, 0.07, 0.05, 'triangle'); },
    done: function () { tone(784, 0, 0.1, 0.09, 'triangle'); tone(1175, 0.07, 0.14, 0.06, 'sine'); },
    undo: function () { tone(440, 0, 0.09, 0.05, 'triangle'); tone(330, 0.06, 0.1, 0.04, 'sine'); },
    coin: function () { tone(988, 0, 0.07, 0.06, 'square'); tone(1319, 0.05, 0.1, 0.04, 'square'); },
    level: function () { [523, 659, 784, 1047].forEach(function (f, i) { tone(f, i * 0.09, 0.26, 0.085, 'triangle'); }); },
    win: function () { [659, 784, 988, 1319, 1568].forEach(function (f, i) { tone(f, i * 0.08, 0.34, 0.08, 'triangle'); }); },
    chime: function () { tone(880, 0, 0.5, 0.08, 'sine'); tone(1320, 0.02, 0.6, 0.05, 'sine'); },
    err: function () { tone(220, 0, 0.16, 0.06, 'sawtooth'); }
  };
  function sfx(k) { if (!Q.S.settings.sound) return; try { (SFX[k] || SFX.tap)(); } catch (e) {} }

  function feedback(kind) {
    var map = { tap: ['tap', 'tap'], done: ['ok', 'done'], undo: ['tap', 'undo'], coin: ['ok', 'coin'],
      level: ['win', 'level'], win: ['big', 'win'], err: ['err', 'err'], chime: ['win', 'chime'] };
    var m = map[kind] || map.tap;
    haptic(m[0]); sfx(m[1]);
  }

  /* ---------------- toast ---------------- */
  function toast(msg, icon) {
    var host = document.getElementById('toasts');
    if (!host) return;
    var el = document.createElement('div');
    el.className = 'toast';
    el.innerHTML = (icon ? '<span class="ti">' + icon + '</span>' : '') + '<span>' + art.esc(msg) + '</span>';
    host.appendChild(el);
    setTimeout(function () { el.classList.add('out'); setTimeout(function () { el.remove(); }, 320); }, 2200);
  }

  /* ---------------- confetti ---------------- */
  function confetti(n) {
    if (!Q.S.settings.confetti) return '';
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return '';
    var cols = ['var(--c-gold)', 'var(--c-str)', 'var(--c-mind)', 'var(--c-body)', 'var(--c-calm)', 'var(--accent)'];
    var s = '';
    for (var i = 0; i < (n || 34); i++) {
      s += '<i class="cf" style="left:' + ((i * 37) % 100) + '%;background:' + cols[i % cols.length] +
        ';animation-delay:' + ((i % 12) * 0.18).toFixed(2) + 's;animation-duration:' + (2.1 + (i % 6) * 0.35).toFixed(2) +
        's;width:' + (6 + (i % 4)) + 'px;height:' + (10 + (i % 5) * 2) + 'px"></i>';
    }
    return s;
  }

  /* ---------------- bottom sheet ---------------- */
  var sheetCloser = null;
  function sheet(title, body, opts) {
    opts = opts || {};
    var host = document.getElementById('sheet');
    host.innerHTML =
      '<div class="scrim"></div>' +
      '<div class="sh" role="dialog" aria-modal="true" aria-label="' + art.esc(title) + '">' +
        '<div class="shGrip" aria-hidden="true"><span></span></div>' +
        '<div class="shHead"><h2>' + art.esc(title) + '</h2>' +
          '<button class="iconBtn" data-sheet="close" aria-label="Close">' +
            '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>' +
          '</button></div>' +
        '<div class="shBody">' + body + '</div>' +
      '</div>';
    host.hidden = false;
    document.body.classList.add('noscroll');
    sheetCloser = opts.onClose || null;
    requestAnimationFrame(function () { host.classList.add('on'); });
    var sh = host.querySelector('.sh');
    var f = sh.querySelector('input,select,textarea,button:not([data-sheet])');
    if (f && opts.focus !== false) setTimeout(function () { try { f.focus(); } catch (e) {} }, 320);
    dragify(sh, host);
  }
  function closeSheet() {
    var host = document.getElementById('sheet');
    if (!host || host.hidden) return;
    host.classList.remove('on');
    document.body.classList.remove('noscroll');
    setTimeout(function () {
      host.hidden = true; host.innerHTML = '';
      var f = sheetCloser; sheetCloser = null;
      if (f) f();
    }, 280);
  }
  function dragify(sh, host) {
    var y0 = null, dy = 0, grip = sh.querySelector('.shGrip');
    function down(e) { y0 = e.clientY; dy = 0; sh.style.transition = 'none'; grip.setPointerCapture(e.pointerId); }
    function move(e) {
      if (y0 === null) return;
      dy = Math.max(0, e.clientY - y0);
      sh.style.transform = 'translateY(' + dy + 'px)';
      host.querySelector('.scrim').style.opacity = String(Math.max(0, 1 - dy / 320));
    }
    function up() {
      if (y0 === null) return;
      sh.style.transition = ''; sh.style.transform = '';
      host.querySelector('.scrim').style.opacity = '';
      if (dy > 110) closeSheet();
      y0 = null;
    }
    grip.addEventListener('pointerdown', down);
    grip.addEventListener('pointermove', move);
    grip.addEventListener('pointerup', up);
    grip.addEventListener('pointercancel', up);
  }

  /* ---------------- celebration modal ---------------- */
  var queue = [];
  function celebrate(item) { queue.push(item); drain(); }
  function drain() {
    var host = document.getElementById('modal');
    if (!host || host.firstChild || !queue.length) return;
    var m = queue.shift();
    host.innerHTML = '<div class="overlay">' + confetti(m.big ? 46 : 30) +
      '<div class="dlg" role="dialog" aria-modal="true" aria-labelledby="dlgT">' +
        (m.kicker ? '<div class="kick">' + art.esc(m.kicker) + '</div>' : '') +
        '<h2 id="dlgT">' + art.esc(m.title) + '</h2>' +
        (m.art || '') +
        '<p class="dlgB">' + art.esc(m.body) + '</p>' +
        (m.reward ? '<div class="reward">' + m.reward + '</div>' : '') +
        '<button class="btn lg" data-act="closeModal">' + art.esc(m.cta || 'Keep going') + '</button>' +
      '</div></div>';
    var b = host.querySelector('[data-act="closeModal"]'); if (b) b.focus();
    var hop = host.querySelector('.hop'); if (hop) hop.classList.add('go');
    feedback(m.big ? 'win' : 'level');
  }
  function closeModal() {
    var host = document.getElementById('modal'), o = host && host.querySelector('.overlay');
    if (!o || o.classList.contains('out')) return;
    o.classList.add('out');
    setTimeout(function () { host.innerHTML = ''; drain(); }, 240);
  }
  function modalOpen() { var h = document.getElementById('modal'); return !!(h && h.firstChild); }

  /* ---------------- notifications ----------------
     Reminders fire while the app is open or recently backgrounded. iOS cannot
     wake a closed web app on a schedule without a push server, which this app
     deliberately does not have. */
  var timers = [];
  function notifyState() {
    if (!('Notification' in window)) return 'unsupported';
    return Notification.permission;
  }
  function askNotify() {
    if (!('Notification' in window)) return Promise.resolve('unsupported');
    return Notification.requestPermission();
  }
  function fire(title, body, tag) {
    if (notifyState() !== 'granted') return;
    var opts = { body: body, tag: tag, icon: 'icon-192.png', badge: 'icon-192.png' };
    if (navigator.serviceWorker && navigator.serviceWorker.ready) {
      navigator.serviceWorker.ready.then(function (r) { r.showNotification(title, opts); })
        .catch(function () { try { new Notification(title, opts); } catch (e) {} });
    } else { try { new Notification(title, opts); } catch (e) {} }
  }
  function clearTimers() { timers.forEach(clearTimeout); timers = []; }
  function scheduleReminders() {
    clearTimers();
    if (!Q.S.settings.notifications || notifyState() !== 'granted') return;
    var k = Q.d.today(), d = Q.S.log[k], now = new Date();
    Q.db.scheduled(k).forEach(function (q) {
      if (!q.reminder) return;
      if (d && d.done.indexOf(q.id) >= 0) return;
      var p = q.reminder.split(':');
      var at = new Date(); at.setHours(+p[0], +p[1], 0, 0);
      var ms = at - now;
      if (ms <= 0 || ms > 20 * 3600 * 1000) return;
      timers.push(setTimeout(function () {
        var cur = Q.S.log[Q.d.today()];
        if (cur && cur.done.indexOf(q.id) >= 0) return;
        fire(q.name, 'Quest waiting in Questling', 'q-' + q.id);
      }, ms));
    });
  }

  /* ---------------- wake lock ---------------- */
  var lock = null;
  function keepAwake(on) {
    if (!navigator.wakeLock) return;
    if (on) {
      navigator.wakeLock.request('screen').then(function (l) { lock = l; }).catch(function () {});
    } else if (lock) { try { lock.release(); } catch (e) {} lock = null; }
  }

  Q.fx = {
    haptic: haptic, hapticSupport: hapticSupport, sfx: sfx, feedback: feedback, toast: toast,
    confetti: confetti, sheet: sheet, closeSheet: closeSheet, celebrate: celebrate,
    closeModal: closeModal, modalOpen: modalOpen, drain: drain,
    notifyState: notifyState, askNotify: askNotify, scheduleReminders: scheduleReminders, fire: fire,
    keepAwake: keepAwake, warmAudio: function () { if (Q.S.settings.sound) ctx(); }
  };
})(window.Q);
