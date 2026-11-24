/* Questling — router, interactions, timer, persistence glue. */
(function (Q) {
  'use strict';
  var art = Q.art, esc = art.esc, ICON = art.ICON, K = Q.K, d = Q.d, db = Q.db, fx = Q.fx, V;
  var $ = function (s) { return document.querySelector(s); };

  var TABS = [
    { k: 'today', l: 'Today' }, { k: 'focus', l: 'Focus' }, { k: 'coach', l: 'Coach' },
    { k: 'progress', l: 'Progress' }, { k: 'more', l: 'More' }
  ];
  var SUB = { quests: 'Quests', shop: 'Shop', journal: 'Journal', achievements: 'Achievements', settings: 'Settings', help: 'How it works' };

  Q.ui = { shopCat: 'all', resetArm: false, obStep: 0, obPicks: [], lastTab: 0, hit: false, grow: true };
  Q.timer = { len: 25, left: 0, running: false, paused: false, phase: 'focus', quest: null, endAt: 0 };

  var coinShown = null, coinRaf = 0, lastLevel = null, enterT = 0, lastDay = null;

  function S() { return Q.S; }
  function route() {
    var h = location.hash.slice(1);
    if (TABS.some(function (t) { return t.k === h; }) || SUB[h]) return h;
    return 'today';
  }
  function isTab(r) { return TABS.some(function (t) { return t.k === r; }); }

  /* ---------------- theme ---------------- */
  function applyTheme() {
    var st = S().settings, root = document.documentElement;
    if (st.theme === 'auto') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', st.theme);
    root.setAttribute('data-palette', st.palette);
    var dark = st.theme === 'dark' || (st.theme === 'auto' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
    var m = document.querySelector('meta[name="theme-color"]');
    if (m) m.setAttribute('content', dark ? '#0d1a1e' : '#e7f0ec');
  }

  /* ---------------- header ---------------- */
  function initHeader() {
    $('#hdr').innerHTML =
      '<div class="hTab" id="hTab">' +
        '<div class="hrow"><div class="who"><div class="nm" id="hnm"></div><div class="sub" id="hsub"></div></div>' +
        '<div class="chips"><span class="chip" title="Day streak">' + ICON.flame + '<span id="hst"></span></span>' +
        '<span class="chip" id="hcoin" title="Coins">' + ICON.coin + '<span id="hco"></span></span></div></div>' +
        '<div class="xp" id="hxp" role="progressbar" aria-label="XP to next level" aria-valuemin="0"><i id="hxi" style="width:0%"></i></div>' +
        '<div class="xpl" id="hxl"></div>' +
      '</div>' +
      '<div class="hSub" id="hSub" hidden><button class="iconBtn" data-act="back" aria-label="Back">' + ICON.back + '</button><h1 id="hTitle"></h1></div>';
  }
  function tweenCoins(to) {
    var el = $('#hco'); if (!el) return;
    var chip = $('#hcoin');
    if (coinShown === null || coinShown === to) { el.textContent = to; coinShown = to; return; }
    var from = coinShown; coinShown = to;
    cancelAnimationFrame(coinRaf);
    if (to > from && chip) { chip.classList.remove('bump'); void chip.offsetWidth; chip.classList.add('bump'); }
    var t0 = performance.now();
    (function step(t) {
      var p = Math.min(1, (t - t0) / 560), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(from + (to - from) * e);
      if (p < 1) coinRaf = requestAnimationFrame(step);
    })(t0);
  }
  function renderHeader(r) {
    var tab = isTab(r);
    $('#hTab').hidden = !tab;
    $('#hSub').hidden = tab;
    if (!tab) { $('#hTitle').textContent = SUB[r] || ''; return; }
    var L = db.level(S().xp), st = db.streak(), pctv = L.r / L.n * 100, bar = $('#hxi');
    if (st > S().best) S().best = st;
    $('#hnm').textContent = S().profile.name;
    $('#hsub').textContent = 'Level ' + L.l + ' ' + db.stage(L.l);
    $('#hst').textContent = st + 'd';
    tweenCoins(S().coins);
    var xp = $('#hxp'); xp.setAttribute('aria-valuemax', L.n); xp.setAttribute('aria-valuenow', L.r);
    $('#hxl').textContent = L.r + ' / ' + L.n + ' XP to level ' + (L.l + 1);
    if (lastLevel === null) {
      bar.style.width = '0%';
      requestAnimationFrame(function () { requestAnimationFrame(function () { bar.style.width = pctv + '%'; }); });
    } else if (L.l > lastLevel) {
      bar.style.width = '100%';
      setTimeout(function () {
        bar.style.transition = 'none'; bar.style.width = '0%'; void bar.offsetWidth;
        bar.style.transition = ''; bar.style.width = pctv + '%';
      }, 900);
    } else bar.style.width = pctv + '%';
    lastLevel = L.l;
  }

  /* ---------------- render ---------------- */
  function render(animate) {
    db.ensureBoss();
    var r = route(), main = $('#main');
    if (!S().profile.onboarded) {
      document.body.classList.add('onb');
      main.innerHTML = V.onboard();
      $('#hdr').hidden = true; $('#navBar').hidden = true;
      return;
    }
    document.body.classList.remove('onb');
    $('#hdr').hidden = false; $('#navBar').hidden = false;
    renderHeader(r);
    if (!animate) main.classList.remove('enter');
    main.innerHTML = (V[r] || V.today)();
    var idx = TABS.map(function (t) { return t.k; }).indexOf(r);
    $('#nav').innerHTML = TABS.map(function (t) {
      return '<a href="#' + t.k + '"' + (t.k === r ? ' aria-current="page"' : '') + '>' + ICON[t.k] + '<span>' + t.l + '</span></a>';
    }).join('');
    document.title = (isTab(r) ? TABS[idx].l : SUB[r]) + ' · Questling';
    if (animate) {
      Array.prototype.forEach.call(main.children, function (c, i) { c.style.setProperty('--i', i); });
      main.classList.add('enter');
      clearTimeout(enterT);
      enterT = setTimeout(function () { main.classList.remove('enter'); }, 1500);
    }
    if (r === 'focus') paintTimer();
    fx.scheduleReminders();
  }
  Q.render = render;

  /* ---------------- today, patched in place ---------------- */
  function patchToday() {
    renderHeader(route());
    var k = d.today(), rec = S().log[k];
    var sc = $('#scene');
    if (sc) {
      var sig = V.sceneSig();
      if (sc.getAttribute('data-sig') !== sig) { sc.innerHTML = V.sceneHTML(); sc.setAttribute('data-sig', sig); }
    }
    var bt = $('#btxt');
    if (bt) {
      var nt = V.speech();
      if (bt.textContent !== nt) { bt.textContent = nt; bt.classList.remove('swap'); void bt.offsetWidth; bt.classList.add('swap'); }
    }
    var mv = rec ? rec.mood : 0, ev = rec ? rec.energy : 0;
    document.querySelectorAll('[data-act="mood"]').forEach(function (el) { el.setAttribute('aria-pressed', String(+el.getAttribute('data-v') === mv)); });
    document.querySelectorAll('[data-act="energy"]').forEach(function (el) { el.setAttribute('aria-pressed', String(+el.getAttribute('data-v') === ev)); });
    var mh = $('#mhint');
    if (mh) mh.textContent = rec && rec.moodPaid ? 'Checked in. The Coach uses this to find patterns.' : 'First check-in each day earns 5 XP.';
    db.scheduled(k).forEach(function (q) {
      var el = document.querySelector('.q[data-id="' + q.id + '"]'); if (!el) return;
      var on = !!rec && rec.done.indexOf(q.id) >= 0;
      el.setAttribute('aria-pressed', String(on));
      var qs = el.querySelector('.qs');
      if (qs) {
        var t = on && rec.earn[q.id] && rec.earn[q.id].t ? d.clockOf(rec.earn[q.id].t) : '';
        var strk = db.questStreak(q.id);
        qs.innerHTML = on && t ? '<span class="sep">·</span>' + esc(t) : (strk > 1 ? '<span class="sep">·</span>' + strk + ' day streak' : '');
      }
    });
    var total = db.plannedIds(k).length, done = db.doneIds(k).length;
    var qc = $('#qcount'); if (qc) qc.textContent = done + ' of ' + total;
    var sv = $('#svDone'); if (sv) sv.innerHTML = done + '<span class="sunit">/' + total + '</span>';
    var gf = $('#goalFill'); if (gf) gf.style.width = (total ? done / total * 100 : 0) + '%';
    var b = S().boss, bf = $('#bfill');
    if (bf) {
      bf.style.width = (b.hp / b.max * 100) + '%';
      $('#bbar').setAttribute('aria-valuenow', b.hp);
      var left = 7 - ((d.weekday(k) + 6) % 7);
      $('#bhint').textContent = b.dead ? 'Defeated. A new one arrives Monday.' : b.hp + ' HP left · ' + left + ' day' + (left > 1 ? 's' : '') + ' · 100 coins';
      var bo = $('#boss');
      if (bo.classList.contains('dead') !== !!b.dead) { bo.classList.toggle('dead', !!b.dead); $('#bsvg').innerHTML = art.boss(K.BOSSES[b.idx].c, b.dead); }
      if (Q.ui.hit) { bo.classList.remove('hit'); void bo.offsetWidth; bo.classList.add('hit'); Q.ui.hit = false; }
    }
  }
  function hop() {
    var el = document.querySelector('#scene .hop'); if (!el) return;
    el.classList.remove('go'); void el.getBoundingClientRect(); el.classList.add('go');
  }

  /* ---------------- mutations ---------------- */
  function award(xp, coins, stat) {
    S().xp += xp; S().coins += coins;
    if (stat) S().statXp[stat] = (S().statXp[stat] || 0) + xp;
  }
  function damageBoss(xp) {
    var b = S().boss; if (!b || b.dead) return;
    b.hp = Math.max(0, b.hp - xp); Q.ui.hit = true;
    if (b.hp === 0) {
      b.dead = true; S().coins += 100; S().bossWins++;
      fx.celebrate({ kicker: 'Boss defeated', title: K.BOSSES[b.idx].n, body: 'A week of quests broke it. A new one arrives Monday.',
        art: '<div class="dlgArt">' + art.boss(K.BOSSES[b.idx].c, true, 110) + '</div>', reward: ICON.coin + ' +100 coins', big: true });
    }
  }
  function afterGain(beforeLevel) {
    var after = db.level(S().xp).l;
    if (after > beforeLevel) {
      var ns = db.stage(after), evolved = ns !== db.stage(beforeLevel);
      fx.celebrate({
        kicker: evolved ? 'Evolution' : 'Level up', title: 'Level ' + after,
        body: evolved ? S().profile.name + ' evolved into a ' + ns + '.' : S().profile.name + ' is getting stronger.',
        art: '<div class="dlgArt">' + art.companion({ equip: S().equip, mood: 'great', stage: ns, label: S().profile.name }) + '</div>',
        big: evolved
      });
    }
    (db.checkAchievements() || []).forEach(function (a) {
      fx.celebrate({ kicker: 'Achievement', title: a.n, body: a.d,
        art: '<div class="dlgArt achBig">' + ICON.trophy + '</div>', reward: ICON.coin + ' +' + a.c + ' coins' });
    });
  }

  function toggleQuest(id) {
    var q = db.byId(id); if (!q) return;
    var k = d.today(), rec = db.rec(k, true), before = db.level(S().xp).l;
    var i = rec.done.indexOf(id), added = false, gain = 0;
    rec.planned = db.scheduled(k).map(function (x) { return x.id; });
    if (i >= 0) {
      var e = rec.earn[id] || { xp: 0, c: 0 };
      rec.done.splice(i, 1); delete rec.earn[id];
      S().xp = Math.max(0, S().xp - e.xp); S().coins = Math.max(0, S().coins - e.c);
      S().statXp[q.stat] = Math.max(0, (S().statXp[q.stat] || 0) - e.xp);
      if (S().boss && !S().boss.dead) S().boss.hp = Math.min(S().boss.max, S().boss.hp + e.xp);
      if (rec.bonus && db.doneIds(k).length < db.plannedIds(k).length) {
        S().coins = Math.max(0, S().coins - rec.bonus); S().xp = Math.max(0, S().xp - 25); rec.bonus = 0;
      }
      fx.feedback('undo');
    } else {
      var df = K.DIFF[q.diff] || K.DIFF.med;
      var mult = 1 + Math.min(0.5, Math.floor(db.streak() / 3) * 0.05);
      var xp = Math.round(df.xp * mult);
      rec.done.push(id); rec.earn[id] = { xp: xp, c: df.c, t: Date.now() };
      award(xp, df.c, q.stat);
      damageBoss(xp);
      added = true; gain = xp;
      fx.feedback('done');
      if (db.doneIds(k).length >= db.plannedIds(k).length && !rec.bonus) {
        rec.bonus = 20; S().coins += 20; S().xp += 25;
        fx.toast('Clean sweep. +25 XP and 20 coins', ICON.spark);
      }
    }
    afterGain(before);
    db.save();
    if (route() !== 'today') { render(false); fx.drain(); return; }
    patchToday();
    if (added) {
      var row = document.querySelector('.q[data-id="' + id + '"]');
      if (row) {
        row.classList.remove('pop'); void row.offsetWidth; row.classList.add('pop');
        var f = document.createElement('span');
        f.className = 'fx'; f.textContent = '+' + gain + ' XP';
        row.appendChild(f);
        setTimeout(function () { f.remove(); }, 1050);
      }
      hop();
    }
    fx.drain();
  }

  /* ---------------- focus timer ---------------- */
  function paintTimer() {
    var t = Q.timer;
    var el = $('#ttime'); if (!el) return;
    var left = t.running ? Math.max(0, Math.round((t.endAt - Date.now()) / 1000)) : t.left;
    var total = t.len * 60;
    if (!t.running && !t.paused) { el.textContent = t.len + ':00'; }
    else el.textContent = Math.floor(left / 60) + ':' + d.pad(left % 60);
    var c = $('.timerRing .rv');
    if (c) {
      var len = parseFloat(c.getAttribute('stroke-dasharray'));
      var p = (t.running || t.paused) ? 1 - left / total : 0;
      c.setAttribute('stroke-dashoffset', (len * (1 - p)).toFixed(1));
    }
  }
  function tick() {
    var t = Q.timer;
    if (!t.running) return;
    var left = Math.max(0, Math.round((t.endAt - Date.now()) / 1000));
    t.left = left;
    if (route() === 'focus') paintTimer();
    if (left <= 0) finishTimer();
  }
  function finishTimer() {
    var t = Q.timer;
    t.running = false; t.paused = false;
    fx.keepAwake(false);
    if (t.phase === 'focus') {
      var min = t.len;
      var q = t.quest ? db.byId(t.quest) : null;
      S().focus.push({ date: d.today(), min: min, label: q ? q.name : '' });
      var before = db.level(S().xp).l;
      var xp = Math.round(min / 25 * 15);
      award(xp, Math.round(min / 25 * 5), 'mind');
      afterGain(before);
      db.save();
      fx.feedback('chime');
      fx.fire('Focus session done', min + ' minutes logged. +' + xp + ' XP.', 'focus');
      fx.celebrate({ kicker: 'Focus complete', title: min + ' minutes', body: q ? 'Logged against "' + q.name + '".' : 'Logged to Mind.',
        reward: '+' + xp + ' XP', cta: 'Nice' });
      t.phase = 'break'; t.len = min >= 45 ? 10 : 5; t.left = t.len * 60;
    } else {
      fx.feedback('chime');
      t.phase = 'focus'; t.len = 25; t.left = 0; t.quest = null;
    }
    if (route() === 'focus') render(false);
  }
  setInterval(tick, 250);

  /* ---------------- sheets ---------------- */
  function openQuestSheet(q) {
    fx.sheet(q ? 'Edit quest' : 'New quest', V.questForm(q), { focus: !q });
  }
  function openTemplates() { fx.sheet('Add a quest', V.templates(), { focus: false }); }
  function openLinkSheet() {
    var list = db.live();
    var body = '<p class="hint">Pick what this session counts toward. Optional.</p>' +
      '<ul class="plain">' + list.map(function (q) {
        return '<li><button class="qrow" data-act="pickLink" data-id="' + q.id + '"><span class="qrb"><span class="qn">' + esc(q.name) + '</span></span></button></li>';
      }).join('') + '</ul>' +
      '<button class="btn ghost full mt" data-act="pickLink" data-id="">No quest</button>';
    fx.sheet('Link to a quest', list.length ? body : '<p class="hint">No quests yet.</p>', { focus: false });
  }
  function readQuestForm() {
    var f = $('#qForm'); if (!f) return null;
    var days = [];
    f.querySelectorAll('.day').forEach(function (b) { if (b.getAttribute('aria-pressed') === 'true') days.push(+b.getAttribute('data-day')); });
    var seg = function (name) {
      var el = f.querySelector('[data-seg="' + name + '"][aria-pressed="true"]');
      return el ? el.getAttribute('data-v') : null;
    };
    return {
      id: f.getAttribute('data-id'),
      name: $('#fName').value.trim(),
      stat: seg('stat') || 'calm',
      diff: seg('diff') || 'med',
      slot: seg('slot') || 'any',
      days: days.length ? days : [0,1,2,3,4,5,6],
      reminder: $('#fRem').value || null,
      note: $('#fNote').value.trim()
    };
  }

  /* ---------------- data ---------------- */
  function encode() { return 'QST2.' + btoa(unescape(encodeURIComponent(JSON.stringify(S())))); }
  function decode(raw) {
    raw = (raw || '').trim();
    var body = raw.indexOf('QST2.') === 0 ? raw.slice(5) : (raw.indexOf('QST1.') === 0 ? raw.slice(5) : null);
    if (body === null) throw new Error('bad');
    var o = JSON.parse(decodeURIComponent(escape(atob(body))));
    if (o.v === 1) o = db.upgrade(o);
    if (!o || o.v !== 2 || !Array.isArray(o.quests)) throw new Error('bad');
    return o;
  }

  /* ---------------- events ---------------- */
  document.addEventListener('click', function (ev) {
    var seg = ev.target.closest('[data-seg]');
    if (seg) {
      var grp = seg.getAttribute('data-seg');
      seg.closest('form').querySelectorAll('[data-seg="' + grp + '"]').forEach(function (b) { b.setAttribute('aria-pressed', String(b === seg)); });
      if (grp === 'stat') $('#statHint').textContent = K.STAT[seg.getAttribute('data-v')].d;
      if (grp === 'diff') { var dd = K.DIFF[seg.getAttribute('data-v')]; $('#diffHint').textContent = dd.d + ' · ' + dd.xp + ' XP and ' + dd.c + ' coins'; }
      fx.haptic('tap'); return;
    }
    var day = ev.target.closest('.day');
    if (day) { day.setAttribute('aria-pressed', String(day.getAttribute('aria-pressed') !== 'true')); fx.haptic('tap'); return; }
    var pre = ev.target.closest('[data-preset]');
    if (pre) {
      var p = pre.getAttribute('data-preset');
      var want = p === 'all' ? [0,1,2,3,4,5,6] : p === 'week' ? [1,2,3,4,5] : [0,6];
      $('#qForm').querySelectorAll('.day').forEach(function (b) { b.setAttribute('aria-pressed', String(want.indexOf(+b.getAttribute('data-day')) >= 0)); });
      fx.haptic('tap'); return;
    }
    if (ev.target.closest('[data-sheet="close"]') || ev.target.closest('#sheet .scrim')) { fx.closeSheet(); return; }

    var el = ev.target.closest('[data-act]'); if (!el) return;
    var a = el.getAttribute('data-act'), id = el.getAttribute('data-id'), v = el.getAttribute('data-v');

    switch (a) {
      case 'toggle': return toggleQuest(id);
      case 'closeModal': return fx.closeModal();
      case 'back': history.length > 1 ? history.back() : (location.hash = 'more'); return;

      case 'mood': case 'energy': {
        var rec = db.rec(d.today(), true), before = db.level(S().xp).l;
        rec[a] = +v;
        if (!rec.moodPaid && rec.mood) { rec.moodPaid = true; S().xp += 5; fx.toast('+5 XP for checking in', ICON.spark); }
        fx.feedback('tap');
        afterGain(before); db.save(); patchToday(); fx.drain(); return;
      }

      case 'addQuest': return openTemplates();
      case 'blankQuest': fx.closeSheet(); setTimeout(function () { openQuestSheet(null); }, 300); return;
      case 'useTpl': {
        var t = K.TEMPLATES[+el.getAttribute('data-i')];
        fx.closeSheet();
        setTimeout(function () {
          openQuestSheet({ id: '', name: t.n, stat: t.s, diff: t.d, slot: t.sl, days: [0,1,2,3,4,5,6], reminder: '', note: '' });
        }, 300);
        return;
      }
      case 'editQuest': return openQuestSheet(db.byId(id));
      case 'archiveQuest': {
        var q0 = db.byId(id); if (q0) q0.archived = true;
        db.save(); fx.closeSheet(); fx.toast('Archived'); render(false); return;
      }
      case 'unarchive': {
        var q1 = db.byId(id); if (q1) q1.archived = false;
        db.save(); fx.toast('Restored'); render(false); return;
      }
      case 'deleteQuest': {
        if (Q.ui.delArm === id) {
          S().quests = S().quests.filter(function (x) { return x.id !== id; });
          Q.ui.delArm = null; db.save(); fx.closeSheet(); fx.toast('Deleted'); render(false);
        } else {
          Q.ui.delArm = id; el.textContent = 'Tap again to delete'; el.classList.add('armed'); fx.haptic('err');
        }
        return;
      }

      case 'tStart': {
        var tm = Q.timer;
        if (!tm.paused) tm.left = tm.len * 60;
        tm.endAt = Date.now() + tm.left * 1000;
        tm.running = true; tm.paused = false;
        fx.warmAudio(); fx.keepAwake(true); fx.feedback('tap');
        render(false); return;
      }
      case 'tPause': {
        Q.timer.left = Math.max(0, Math.round((Q.timer.endAt - Date.now()) / 1000));
        Q.timer.running = false; Q.timer.paused = true;
        fx.keepAwake(false); fx.feedback('tap'); render(false); return;
      }
      case 'tStop': {
        Q.timer.running = false; Q.timer.paused = false; Q.timer.left = 0; Q.timer.phase = 'focus';
        fx.keepAwake(false); fx.feedback('tap'); render(false); return;
      }
      case 'tLen': Q.timer.len = +v; Q.timer.left = 0; fx.haptic('tap'); render(false); return;
      case 'tLink': return openLinkSheet();
      case 'pickLink': Q.timer.quest = id || null; fx.closeSheet(); render(false); return;

      case 'shopCat': Q.ui.shopCat = v; fx.haptic('tap'); render(false); return;
      case 'buy': {
        var it = K.ITEMS.filter(function (x) { return x.cat + ':' + x.key === id; })[0];
        if (it && S().inv.indexOf(id) < 0 && S().coins >= it.price) {
          S().coins -= it.price; S().inv.push(id); S().equip[it.cat] = it.key;
          fx.feedback('coin'); fx.toast(it.name + ' is yours', ICON.coin);
          db.checkAchievements(); db.save(); render(false); fx.drain();
        }
        return;
      }
      case 'equip': {
        var parts = id.split(':');
        S().equip[parts[0]] = (S().equip[parts[0]] === parts[1] && parts[0] !== 'bg' && parts[0] !== 'fur') ? null : parts[1];
        fx.feedback('tap'); db.save(); render(false); return;
      }

      case 'saveJournal': {
        var txt = $('#jText').value.trim();
        var k2 = d.today(), had = !!S().journal[k2];
        if (!txt) { delete S().journal[k2]; db.save(); fx.toast('Entry cleared'); render(false); return; }
        var b4 = db.level(S().xp).l;
        S().journal[k2] = { text: txt, prompt: el.getAttribute('data-prompt'), at: Date.now() };
        if (!had) { S().xp += 10; fx.toast('+10 XP for writing', ICON.spark); }
        fx.feedback('tap'); afterGain(b4); db.save(); render(false); fx.drain(); return;
      }
      case 'openJournal': {
        var j = S().journal[el.getAttribute('data-k')];
        fx.sheet(d.pretty(el.getAttribute('data-k')), '<p class="prompt">' + esc(j.prompt || '') + '</p><p class="jFull">' + esc(j.text) + '</p>', { focus: false });
        return;
      }

      case 'theme': S().settings.theme = v; applyTheme(); db.save(); fx.haptic('tap'); render(false); return;
      case 'palette': S().settings.palette = v; applyTheme(); db.save(); fx.haptic('tap'); render(false); return;
      case 'goalPct': S().settings.goalPct = +v; db.save(); fx.haptic('tap'); render(false); return;
      case 'dayStart': S().settings.dayStart = +v; db.save(); fx.haptic('tap'); render(false); return;
      case 'toggle2': return;
      case 'toggle': {
        var key = el.getAttribute('data-k');
        S().settings[key] = !S().settings[key];
        db.save(); fx.feedback('tap'); render(false); return;
      }
      case 'notifToggle': {
        if (S().settings.notifications) { S().settings.notifications = false; db.save(); render(false); return; }
        fx.askNotify().then(function (p) {
          S().settings.notifications = p === 'granted';
          db.save(); render(false);
          if (p === 'granted') { fx.toast('Reminders on'); fx.scheduleReminders(); }
          else if (p === 'denied') fx.toast('Your browser blocked notifications');
          else fx.toast('Notifications are not available here');
        });
        return;
      }

      case 'exportCode': {
        var code = encode(), ta = $('#bkOut');
        var fallback = function () { ta.value = code; ta.select(); fx.toast('Select and copy the code'); };
        try {
          navigator.clipboard.writeText(code).then(function () { fx.toast('Backup code copied'); ta.value = ''; }, fallback);
        } catch (e) { fallback(); }
        return;
      }
      case 'exportFile': {
        try {
          var blob = new Blob([JSON.stringify(S(), null, 2)], { type: 'application/json' });
          var url = URL.createObjectURL(blob), a2 = document.createElement('a');
          a2.href = url; a2.download = 'questling-' + d.today() + '.json';
          document.body.appendChild(a2); a2.click(); a2.remove();
          setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
          fx.toast('File saved');
        } catch (e) { fx.toast('Download blocked here, use the code'); }
        return;
      }
      case 'importCode': {
        try {
          var next = decode($('#bkIn').value);
          Q.set(next); db.save(); coinShown = null; lastLevel = null;
          applyTheme(); fx.toast('Progress restored'); location.hash = 'today'; render(true);
        } catch (e2) { fx.feedback('err'); fx.toast('That code did not work'); }
        return;
      }
      case 'reset': {
        if (Q.ui.resetArm) {
          Q.set(db.fresh()); Q.ui.resetArm = false; coinShown = null; lastLevel = null;
          db.save(); applyTheme(); fx.toast('Fresh start'); location.hash = 'today'; render(true);
        } else { Q.ui.resetArm = true; fx.haptic('err'); render(false); }
        return;
      }

      case 'obNext': {
        if (Q.ui.obStep === 1) { var n = $('#obName').value.trim(); if (n) S().profile.name = n.slice(0, 16); }
        Q.ui.obStep++; fx.haptic('tap'); db.save(); render(true); return;
      }
      case 'obFur': S().equip.fur = v; if (S().inv.indexOf('fur:' + v) < 0) S().inv.push('fur:' + v); fx.haptic('tap'); render(false); return;
      case 'obFocus': {
        var f2 = S().profile.focus, ix = f2.indexOf(v);
        if (ix >= 0) f2.splice(ix, 1); else f2.push(v);
        fx.haptic('tap'); render(false); return;
      }
      case 'obTpl': {
        var i2 = +el.getAttribute('data-i'), at = Q.ui.obPicks.indexOf(i2);
        if (at >= 0) Q.ui.obPicks.splice(at, 1); else Q.ui.obPicks.push(i2);
        fx.haptic('tap'); render(false); return;
      }
      case 'obDone': {
        Q.ui.obPicks.forEach(function (i3) {
          var t3 = K.TEMPLATES[i3];
          S().quests.push({ id: 'q' + (S().nid++), name: t3.n, stat: t3.s, diff: t3.d, days: [0,1,2,3,4,5,6], slot: t3.sl, reminder: null, note: '', archived: false, created: d.today() });
        });
        S().profile.onboarded = true; db.save();
        location.hash = 'today'; fx.feedback('win'); render(true); return;
      }
      case 'obRestore': {
        fx.sheet('Restore a backup', '<label class="l" for="obIn">Backup code</label><textarea id="obIn" class="mono" placeholder="QST2..."></textarea>' +
          '<button class="btn lg full mt" data-act="obRestoreGo">Restore</button>', { focus: false });
        return;
      }
      case 'obRestoreGo': {
        try {
          var nx = decode($('#obIn').value);
          Q.set(nx); nx.profile.onboarded = true; db.save(); applyTheme();
          fx.closeSheet(); fx.toast('Progress restored'); location.hash = 'today'; render(true);
        } catch (e3) { fx.feedback('err'); fx.toast('That code did not work'); }
        return;
      }
    }
  });

  document.addEventListener('submit', function (ev) {
    if (ev.target.id !== 'qForm') return;
    ev.preventDefault();
    var data = readQuestForm();
    if (!data || !data.name) { fx.feedback('err'); return; }
    if (data.id) {
      var q = db.byId(data.id);
      if (q) { q.name = data.name; q.stat = data.stat; q.diff = data.diff; q.slot = data.slot; q.days = data.days; q.reminder = data.reminder; q.note = data.note; }
      fx.toast('Saved');
    } else {
      if (db.live().length >= 16) { fx.toast('16 active quests is the limit'); return; }
      S().quests.push({ id: 'q' + (S().nid++), name: data.name, stat: data.stat, diff: data.diff,
        days: data.days, slot: data.slot, reminder: data.reminder, note: data.note, archived: false, created: d.today() });
      fx.feedback('tap'); fx.toast('Quest added');
    }
    db.save(); fx.closeSheet(); render(false); fx.scheduleReminders();
  });

  document.addEventListener('change', function (ev) {
    var f = ev.target.getAttribute && ev.target.getAttribute('data-field');
    if (f === 'cname') {
      S().profile.name = (ev.target.value.trim() || 'Ember').slice(0, 16);
      db.save(); renderHeader(route());
    }
  });

  document.addEventListener('keydown', function (ev) {
    if (ev.key !== 'Escape') return;
    if (fx.modalOpen()) fx.closeModal();
    else if (!$('#sheet').hidden) fx.closeSheet();
  });

  window.addEventListener('hashchange', function () {
    Q.ui.resetArm = false; Q.ui.delArm = null;
    render(true); window.scrollTo(0, 0);
  });

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) return;
    var t = d.today(), changed = t !== lastDay;
    lastDay = t;
    db.rollover(); db.ensureBoss();
    if (changed) { db.save(); render(true); }
    else if (route() === 'today') patchToday();
    else if (route() === 'focus') paintTimer();
    fx.scheduleReminders();
  });

  if (window.matchMedia) {
    var mq = window.matchMedia('(prefers-color-scheme: dark)');
    if (mq.addEventListener) mq.addEventListener('change', applyTheme);
  }

  /* ---------------- boot ---------------- */
  function boot() {
    V = Q.views;
    /* The artifact viewer runs the page in a frame and blocks page-initiated
       downloads, so the file export only appears where it actually works. */
    try { Q.canDownload = window.self === window.top; } catch (e) { Q.canDownload = false; }
    db.hydrate();
    db.rollover();
    db.ensureBoss();
    applyTheme();
    initHeader();
    lastDay = d.today();
    db.save();
    render(true);
    if (document.body.getAttribute('data-sw') === 'on' && 'serviceWorker' in navigator && /^https?:/.test(location.protocol)) {
      navigator.serviceWorker.register('sw.js').catch(function () {});
    }
    document.addEventListener('pointerdown', function once() {
      fx.warmAudio(); document.removeEventListener('pointerdown', once);
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})(window.Q);
