/* Questling — screens. Every view returns an HTML string. */
(function (Q) {
  'use strict';
  var art = Q.art, esc = art.esc, ICON = art.ICON, K = Q.K, d = Q.d, db = Q.db;
  var V = {};

  function S() { return Q.S; }
  function card(inner, cls) { return '<section class="card' + (cls ? ' ' + cls : '') + '">' + inner + '</section>'; }
  function h2(t, aside) { return '<div class="cardHead"><h2>' + esc(t) + '</h2>' + (aside || '') + '</div>'; }
  function empty(title, body, cta) {
    return '<div class="emptyState"><div class="esIcon">' + ICON.spark + '</div><p class="esT">' + esc(title) + '</p><p class="esB">' + esc(body) + '</p>' + (cta || '') + '</div>';
  }
  function dot(statKey) { return '<i class="dot" style="--c:var(' + K.STAT[statKey].v + ')"></i>'; }
  function stageOf() { return db.stage(db.level(S().xp).l); }
  function moodNow() {
    var h = new Date().getHours(), t = db.plannedIds(d.today()).length;
    var f = t ? db.doneIds(d.today()).length / t : 0;
    if (t && f >= 1) return 'great';
    if (h >= 23 || h < 5) return 'sleepy';
    if (f >= 0.4) return 'good';
    if (f > 0) return 'ok';
    return h >= 15 ? 'sad' : 'ok';
  }
  function sceneHTML(label) {
    return art.companion({ equip: S().equip, mood: moodNow(), stage: stageOf(), label: label || S().profile.name });
  }
  function timeLabel(t) {
    if (!t) return '';
    var p = t.split(':'), h = +p[0];
    return (h % 12 || 12) + ':' + p[1] + ' ' + (h < 12 ? 'AM' : 'PM');
  }
  function daysLabel(days) {
    if (days.length === 7) return 'Every day';
    if (days.length === 5 && [1,2,3,4,5].every(function (x) { return days.indexOf(x) >= 0; })) return 'Weekdays';
    if (days.length === 2 && days.indexOf(0) >= 0 && days.indexOf(6) >= 0) return 'Weekends';
    if (!days.length) return 'Never';
    return days.slice().sort().map(function (i) { return K.DAY_SHORT[i]; }).join(', ');
  }

  /* ---------------- greeting ---------------- */
  function pickLine(arr) { return arr[Math.floor(d.parse(d.today()).getTime() / 864e5) % arr.length]; }
  function speech() {
    var t = db.plannedIds(d.today()).length, n = db.doneIds(d.today()).length;
    var h = new Date().getHours(), st = db.streak(), g = db.goalFor(d.today());
    if (!S().quests.length) return 'Add your first quest and we can start.';
    if (!t) return 'Nothing scheduled today. Rest counts too.';
    if (n >= t) return pickLine(['Every quest done. That is a full day.', 'Clean sweep. Rest up.', 'All clear. Same again tomorrow?']);
    if (n === 0) {
      if (h >= 23 || h < 5) return 'It is late. Sleep is a quest too.';
      if (h < 12) return pickLine(['Morning. Pick one and start there.', 'New day. The first one is the hardest.', 'Small start counts. Pick one.']);
      if (h < 17) return 'Plenty of day left. Start small.';
      return 'Still time. One quest keeps the streak alive.';
    }
    if (n < g) return (g - n) + ' more to hit today’s goal.';
    return n + ' down, ' + (t - n) + ' to go.' + (st >= 3 ? ' ' + st + ' day streak holding.' : '');
  }

  /* ================= TODAY ================= */
  function questRow(q, rec) {
    var on = !!rec && rec.done.indexOf(q.id) >= 0;
    var df = K.DIFF[q.diff] || K.DIFF.med, qs = db.questStreak(q.id);
    var t = on && rec.earn[q.id] && rec.earn[q.id].t ? d.clockOf(rec.earn[q.id].t) : '';
    return '<li><button class="q" data-act="toggle" data-id="' + q.id + '" aria-pressed="' + on + '">' +
      '<span class="box">' + ICON.check + '</span>' +
      '<span class="qb"><span class="qn">' + esc(q.name) + '</span>' +
      '<span class="qm">' + dot(q.stat) + '<span>' + K.STAT[q.stat].l + '</span><span class="sep">·</span><span>+' + df.xp + ' XP</span>' +
      (q.reminder ? '<span class="sep">·</span><span class="rem">' + ICON.bell + timeLabel(q.reminder) + '</span>' : '') +
      '<span class="qs">' + (on && t ? '<span class="sep">·</span>' + esc(t) : (qs > 1 ? '<span class="sep">·</span>' + qs + ' day streak' : '')) + '</span></span></span>' +
      '<span class="qGo" aria-hidden="true"></span></button></li>';
  }

  V.today = function () {
    var k = d.today(), rec = S().log[k], planned = db.scheduled(k), total = planned.length;
    var done = db.doneIds(k).length, goal = db.goalFor(k), st = db.streak();
    var html = '';

    html += '<div class="hero" id="heroBox">' +
      '<div class="scene" id="scene" data-sig="' + esc(sceneSig()) + '">' + sceneHTML() + '</div>' +
      '<div class="bubble"><span id="btxt">' + esc(speech()) + '</span></div></div>';

    html += '<div class="statRow">' +
      '<div class="stat"><div class="sv" id="svDone">' + done + '<span class="sunit">/' + total + '</span></div><div class="sl">Quests done</div></div>' +
      '<div class="stat"><div class="sv">' + st + '<span class="sunit">d</span></div><div class="sl">Streak' + (S().freezes ? ' · ' + S().freezes + ' freeze' + (S().freezes > 1 ? 's' : '') : '') + '</div></div>' +
      '<div class="stat"><div class="sv">' + goal + '</div><div class="sl">Goal to keep it</div></div>' +
      '</div>';

    var mv = rec ? rec.mood : 0, ev = rec ? rec.energy : 0;
    html += card(
      h2('Check in', mv && ev ? '<span class="pillOk">Logged</span>' : '') +
      '<p class="hint">How are you feeling?</p>' +
      '<div class="scaleRow" role="group" aria-label="Mood">' + K.MOODS.map(function (m, i) {
        return '<button class="scale" data-act="mood" data-v="' + (i + 1) + '" aria-pressed="' + (mv === i + 1) + '"><span class="sFace">' + ['☹','–','•','●','★'][i] + '</span>' + esc(m) + '</button>';
      }).join('') + '</div>' +
      '<p class="hint mt">Energy today?</p>' +
      '<div class="scaleRow" role="group" aria-label="Energy">' + K.ENERGY.map(function (m, i) {
        return '<button class="scale" data-act="energy" data-v="' + (i + 1) + '" aria-pressed="' + (ev === i + 1) + '">' + esc(m) + '</button>';
      }).join('') + '</div>' +
      '<p class="hint mt" id="mhint">' + (rec && rec.moodPaid ? 'Checked in. The Coach uses this to find patterns.' : 'First check-in each day earns 5 XP.') + '</p>'
    );

    if (!S().quests.length) {
      html += card(h2('Quests') + empty('No quests yet', 'Build the list you want to run every day. Start with three.',
        '<button class="btn" data-act="addQuest">Add your first quest</button>'));
    } else if (!total) {
      html += card(h2('Quests') + empty('Nothing scheduled today', 'None of your quests run on ' + K.DAY_SHORT[d.weekday(k)] + '. A planned rest day is fine.',
        '<a class="btn ghost" href="#quests">Edit the schedule</a>'));
    } else {
      var groups = K.SLOTS.map(function (sl) {
        return { sl: sl, items: planned.filter(function (q) { return (q.slot || 'any') === sl.k; }) };
      }).filter(function (g) { return g.items.length; });
      var body = h2('Today’s quests', '<span class="count" id="qcount">' + done + ' of ' + total + '</span>');
      body += '<div class="goalBar" role="progressbar" aria-label="Progress to today’s goal" aria-valuemin="0" aria-valuemax="' + total + '" aria-valuenow="' + done + '">' +
        '<i id="goalFill" style="width:' + (total ? done / total * 100 : 0) + '%"></i>' +
        '<span class="goalMark" style="left:' + (total ? goal / total * 100 : 0) + '%" title="Daily goal"></span></div>';
      groups.forEach(function (g) {
        body += '<div class="slotHead">' + esc(g.sl.l) + '</div><ul class="qlist">' +
          g.items.map(function (q) { return questRow(q, rec); }).join('') + '</ul>';
      });
      body += '<button class="btn ghost full mt" data-act="addQuest">' + ICON.plus + 'Add a quest</button>';
      html += card(body);
    }

    var b = S().boss, bs = K.BOSSES[b.idx], left = 7 - ((d.weekday(k) + 6) % 7);
    html += card(
      '<div class="boss' + (b.dead ? ' dead' : '') + '" id="boss">' +
        '<span id="bsvg">' + art.boss(bs.c, b.dead) + '</span>' +
        '<div class="bossi"><div class="kicker">Weekly boss</div><div class="bn">' + esc(bs.n) + '</div>' +
        '<div class="bar hp" id="bbar" role="progressbar" aria-label="Boss health" aria-valuemin="0" aria-valuemax="' + b.max + '" aria-valuenow="' + b.hp + '"><i id="bfill" style="width:' + (b.hp / b.max * 100) + '%"></i></div>' +
        '<div class="hint" id="bhint">' + esc(b.dead ? 'Defeated. A new one arrives Monday.' : b.hp + ' HP left · ' + left + ' day' + (left > 1 ? 's' : '') + ' · 100 coins') + '</div>' +
        '</div></div>' +
      '<p class="hint mt">' + esc(bs.t) + ' Every quest you finish deals its XP as damage.</p>'
    );
    return html;
  };
  function sceneSig() { return JSON.stringify(S().equip) + '|' + moodNow() + '|' + stageOf(); }
  V.sceneSig = sceneSig;
  V.sceneHTML = sceneHTML;
  V.speech = speech;

  /* ================= FOCUS ================= */
  V.focus = function () {
    var t = Q.timer, k = d.today();
    var mins = t.running || t.paused ? Math.ceil(t.left / 60) : t.len;
    var secs = t.running || t.paused ? t.left % 60 : 0;
    var pctLeft = (t.running || t.paused) ? 1 - t.left / (t.len * 60) : 0;
    var todayMin = 0, weekMin = 0, cut = d.shift(k, -7);
    S().focus.forEach(function (f) { if (f.date === k) todayMin += f.min; if (f.date > cut) weekMin += f.min; });
    var linked = t.quest ? db.byId(t.quest) : null;

    var html = card(
      '<div class="timerWrap">' +
        '<div class="timerRing">' + art.ring(pctLeft, 230, 14, '', '') +
          '<div class="timerText"><div class="tt" id="ttime">' + mins + ':' + d.pad(secs) + '</div>' +
          '<div class="tl">' + (t.phase === 'break' ? 'Break' : 'Focus') + (linked ? ' · ' + esc(linked.name) : '') + '</div></div>' +
        '</div>' +
        '<div class="timerBtns">' +
          (t.running
            ? '<button class="btn lg" data-act="tPause">' + ICON.pause + 'Pause</button>'
            : '<button class="btn lg" data-act="tStart">' + ICON.play + (t.paused ? 'Resume' : 'Start') + '</button>') +
          (t.running || t.paused ? '<button class="btn ghost lg" data-act="tStop">' + ICON.stop + 'Stop</button>' : '') +
        '</div>' +
      '</div>' +
      (t.running || t.paused ? '' :
        '<div class="chipbar center mt">' + [15, 25, 45, 50, 90].map(function (m) {
          return '<button class="fc" data-act="tLen" data-v="' + m + '" aria-pressed="' + (t.len === m) + '">' + m + ' min</button>';
        }).join('') + '</div>' +
        '<button class="btn ghost full mt" data-act="tLink">' + (linked ? 'Linked to: ' + esc(linked.name) : 'Link to a quest (optional)') + '</button>')
    );

    html += card(
      h2('Today') +
      '<div class="statRow flat">' +
        '<div class="stat"><div class="sv">' + Math.floor(todayMin / 60) + '<span class="sunit">h</span> ' + (todayMin % 60) + '<span class="sunit">m</span></div><div class="sl">Focused today</div></div>' +
        '<div class="stat"><div class="sv">' + Math.round(weekMin / 60 * 10) / 10 + '<span class="sunit">h</span></div><div class="sl">Last 7 days</div></div>' +
        '<div class="stat"><div class="sv">' + S().focus.length + '</div><div class="sl">Sessions all time</div></div>' +
      '</div>' +
      '<p class="hint mt">Every 25 minutes of focus is worth 15 XP toward Mind. The timer keeps counting if you switch apps.</p>'
    );

    var recent = S().focus.slice(-8).reverse();
    html += card(h2('Recent sessions') + (recent.length
      ? '<ul class="plain">' + recent.map(function (f) {
          return '<li class="rowLine"><span>' + esc(d.pretty(f.date)) + (f.label ? ' · ' + esc(f.label) : '') + '</span><b>' + f.min + ' min</b></li>';
        }).join('') + '</ul>'
      : empty('No sessions yet', 'Start a timer above. Good for study blocks, reading, or anything that needs an unbroken hour.')));
    return html;
  };

  /* ================= COACH ================= */
  V.coach = function () {
    var ins = Q.coach.insights(), rows = Q.coach.questTable(), rev = Q.coach.weeklyReview();
    var html = '';

    html += card(
      '<div class="kicker">Coach</div>' +
      (ins.w7
        ? '<div class="bigNum">' + Math.round(ins.w7.rate * 100) + '<span class="pc">%</span></div>' +
          '<p class="bigSub">of scheduled quests finished over the last ' + ins.w7.days + ' day' + (ins.w7.days > 1 ? 's' : '') + '</p>' +
          '<p class="hint mt">' + ins.w7.done + ' of ' + ins.w7.planned + ' quests' + (ins.w30 ? ' · ' + Math.round(ins.w30.rate * 100) + '% over 30 days' : '') + '</p>'
        : '<p class="hint">Log a few days and the numbers start here.</p>') +
      '<p class="note mt">Everything on this screen is calculated from your own log, on this device. Nothing is sent anywhere.</p>'
    );

    if (ins.list.length) {
      html += '<div class="insights">' + ins.list.map(function (i) {
        return '<article class="ins ' + i.tone + '"><div class="insTop"><span class="insTag">' + esc(i.tag) + '</span>' +
          '<span class="insN" title="How many days or events this is based on">n = ' + i.n + '</span></div>' +
          '<h3>' + esc(i.title) + '</h3><p>' + esc(i.body) + '</p></article>';
      }).join('') + '</div>';
    } else {
      html += card(empty('Not enough data yet', 'The Coach needs about a week of logged days before patterns mean anything. Keep checking off quests.'));
    }

    if (rev) {
      html += card(
        h2('Last week', '<span class="count">' + esc(d.pretty(rev.start)) + ' – ' + esc(d.pretty(rev.end)) + '</span>') +
        '<div class="statRow flat">' +
          '<div class="stat"><div class="sv">' + Math.round(rev.rate * 100) + '<span class="sunit">%</span></div><div class="sl">Completion</div></div>' +
          '<div class="stat"><div class="sv">' + rev.met + '<span class="sunit">/7</span></div><div class="sl">Goal days</div></div>' +
          '<div class="stat"><div class="sv">' + rev.xp + '</div><div class="sl">XP earned</div></div>' +
        '</div>' +
        (rev.top ? '<p class="hint mt">Most reliable quest: <b>' + esc(rev.top.q.name) + '</b> at ' + Math.round(rev.top.rate * 100) + '%.</p>' : '')
      );
    }

    if (rows.length) {
      html += card(
        h2('Quest reliability', '<span class="count">Last 28 days</span>') +
        '<ul class="relList">' + rows.map(function (r) {
          var p = r.rate === null ? 0 : r.rate;
          var tone = r.rate === null ? 'none' : (p >= 0.8 ? 'good' : p >= 0.5 ? 'mid' : 'low');
          return '<li class="rel"><div class="relTop"><span class="relN">' + dot(r.q.stat) + esc(r.q.name) + '</span>' +
            '<b class="relV ' + tone + '">' + (r.rate === null ? '–' : Math.round(p * 100) + '%') + '</b></div>' +
            '<div class="bar sm ' + tone + '"><i style="width:' + (p * 100) + '%"></i></div>' +
            '<div class="relSub">' + (r.rate === null ? 'Not scheduled in this window' : r.hit + ' of ' + r.due + ' scheduled days') +
            (r.streak > 1 ? ' · ' + r.streak + ' day streak' : '') + '</div></li>';
        }).join('') + '</ul>' +
        '<p class="hint mt">Sorted weakest first. Anything under 50% is either too big or in the wrong slot.</p>'
      );
    }
    return html;
  };

  /* ================= PROGRESS ================= */
  V.progress = function () {
    var L = db.level(S().xp), t = db.totals(), st = db.streak();
    if (st > S().best) S().best = st;
    var html = '';

    html += card(
      '<div class="lvlTop"><div class="lvlArt">' + sceneHTML() + '</div>' +
      '<div class="lvlInfo"><div class="kicker">' + esc(stageOf()) + '</div><div class="lvlN">Level ' + L.l + '</div>' +
      '<div class="bar xp"><i style="width:' + (L.r / L.n * 100) + '%"></i></div>' +
      '<div class="hint">' + L.r + ' / ' + L.n + ' XP to level ' + (L.l + 1) + '</div></div></div>'
    );

    html += card(
      h2('Stats', '<span class="count">120 XP per stat level</span>') +
      '<div class="radarWrap">' + art.radar(
        K.STAT_KEYS.map(function (s) { return db.statLevel(S().statXp[s]); }),
        K.STAT_KEYS.map(function (s) { return K.STAT[s].l; })
      ) + '</div>' +
      '<ul class="plain statList">' + K.STAT_KEYS.map(function (s) {
        var xp = S().statXp[s] || 0;
        return '<li class="sbar"><span class="sbn">' + dot(s) + K.STAT[s].l + '</span>' +
          '<div class="bar sm" style="--c:var(' + K.STAT[s].v + ')"><i style="width:' + (xp % 120 / 120 * 100) + '%"></i></div>' +
          '<small>Lv ' + db.statLevel(xp) + '</small></li>';
      }).join('') + '</ul>'
    );

    /* heatmap: 12 weeks, sequential single hue */
    var cells = '', start = d.shift(d.mondayOf(d.today()), -77), tk = d.today();
    K.DAY_LETTER.slice(1).concat(K.DAY_LETTER[0]).forEach(function (x) { cells += '<div class="dn">' + x + '</div>'; });
    for (var i = 0; i < 84; i++) {
      var dk = d.shift(start, i), fut = dk > tk;
      var p = fut ? 0 : db.ratio(dk), has = db.plannedIds(dk).length > 0 && dk >= S().created;
      var bgStyle = (!fut && has && p > 0)
        ? 'background:color-mix(in srgb, var(--accent) ' + Math.round(18 + p * 82) + '%, var(--surface2));border-color:transparent'
        : '';
      cells += '<div class="cell' + (dk === tk ? ' td' : '') + (fut ? ' fu' : '') + (S().log[dk] && S().log[dk].frozen ? ' frz' : '') + '" style="--j:' + i + ';' + bgStyle + '" title="' + dk + ': ' + Math.round(p * 100) + '%"></div>';
    }
    html += card(
      h2('Last 12 weeks') +
      '<div class="heat" role="img" aria-label="Daily completion over the last twelve weeks">' + cells + '</div>' +
      '<div class="legend"><span class="lgT">Less</span>' +
        [0, 0.25, 0.5, 0.75, 1].map(function (p) {
          return '<span class="lgC" style="background:color-mix(in srgb, var(--accent) ' + Math.round(18 + p * 82) + '%, var(--surface2))"></span>';
        }).join('') + '<span class="lgT">More</span>' +
        '<span class="lgT frzKey">' + ICON.snow + 'Freeze used</span></div>'
    );

    var pts = [], mPts = [], any = false, marks = [0, 4, 9, 13];
    for (var j = 13; j >= 0; j--) {
      var key = d.shift(tk, -j), lab = marks.indexOf(13 - j) >= 0 ? K.DAY_SHORT[d.weekday(key)] : '';
      pts.push({ v: Math.round(db.ratio(key) * 100), lab: lab });
      var r = S().log[key];
      mPts.push({ v: r && r.mood ? r.mood : 0, lab: lab });
      if (r && r.mood) any = true;
    }
    html += card(
      h2('Completion', '<span class="count">Last 14 days</span>') +
      art.trend(pts, { max: 100, ticks: [0, 50, 100], fmt: function (v) { return v + '%'; }, label: 'Daily completion percentage over the last 14 days' }) +
      '<p class="hint mt">Share of that day’s scheduled quests you finished.</p>'
    );
    html += card(
      h2('Mood', '<span class="count">Last 14 days</span>') +
      (any
        ? art.trend(mPts, { max: 5, ticks: [1, 3, 5], padLeft: 46, fmt: function (v) { return K.MOODS[Math.max(0, Math.round(v) - 1)]; }, label: 'Daily mood over the last 14 days' }) +
          '<p class="hint mt">Gaps are days you did not check in.</p>'
        : empty('No check-ins yet', 'Log your mood on the Today tab and it charts here.'))
    );

    html += card(
      h2('All time') +
      '<dl class="tot">' +
        '<dt>Quests finished</dt><dd>' + t.done + '</dd>' +
        '<dt>Clean sweep days</dt><dd>' + t.perfect + '</dd>' +
        '<dt>Days logged</dt><dd>' + t.days + '</dd>' +
        '<dt>Current streak</dt><dd>' + st + ' days</dd>' +
        '<dt>Best streak</dt><dd>' + S().best + ' days</dd>' +
        '<dt>Bosses defeated</dt><dd>' + S().bossWins + '</dd>' +
        '<dt>Focused time</dt><dd>' + Math.round(t.focusMin / 60 * 10) / 10 + ' h</dd>' +
        '<dt>Total XP</dt><dd>' + S().xp + '</dd>' +
      '</dl>'
    );

    var earned = Object.keys(S().achievements).length;
    html += card(
      h2('Achievements', '<a class="count link" href="#achievements">See all</a>') +
      '<div class="badgeRow">' + K.ACH.slice(0, 8).map(function (a) {
        var got = !!S().achievements[a.id];
        return '<div class="badge' + (got ? ' on' : '') + '" title="' + esc(a.n + ': ' + a.d) + '">' + ICON.trophy + '</div>';
      }).join('') + '</div>' +
      '<p class="hint mt">' + earned + ' of ' + K.ACH.length + ' unlocked.</p>'
    );
    return html;
  };

  /* ================= MORE ================= */
  V.more = function () {
    var items = [
      ['#quests', ICON.quests, 'Quests', 'Add, edit, schedule, remind'],
      ['#shop', ICON.shop, 'Shop', S().coins + ' coins to spend'],
      ['#journal', ICON.journal, 'Journal', 'Daily reflection'],
      ['#achievements', ICON.trophy, 'Achievements', Object.keys(S().achievements).length + ' of ' + K.ACH.length],
      ['#settings', ICON.settings, 'Settings', 'Theme, haptics, reminders, data'],
      ['#help', ICON.help, 'How it works', 'Every rule and number']
    ];
    return '<div class="menu">' + items.map(function (i) {
      return '<a class="menuItem" href="' + i[0] + '"><span class="mi">' + i[1] + '</span>' +
        '<span class="mt2"><b>' + esc(i[2]) + '</b><small>' + esc(i[3]) + '</small></span>' +
        '<span class="chev" aria-hidden="true"></span></a>';
    }).join('') + '</div>' +
    '<p class="foot">Questling · runs entirely on this device</p>';
  };

  /* ================= QUESTS ================= */
  V.quests = function () {
    var qs = S().quests.filter(function (q) { return !q.archived; });
    var arch = S().quests.filter(function (q) { return q.archived; });
    var html = card(
      h2('Your quests', '<span class="count">' + qs.length + '</span>') +
      '<p class="hint">These are the things you want to run. Keep the list short enough that a full clear is realistic.</p>' +
      '<button class="btn full mt" data-act="addQuest">' + ICON.plus + 'Add a quest</button>'
    );
    if (!qs.length) {
      html += card(empty('Nothing here yet', 'Start with three. You can always add more once they stick.'));
    } else {
      html += '<ul class="plain qEdit">' + qs.map(function (q) {
        var df = K.DIFF[q.diff] || K.DIFF.med;
        return '<li><button class="qrow" data-act="editQuest" data-id="' + q.id + '">' +
          '<span class="qrb"><span class="qn">' + esc(q.name) + '</span>' +
          '<span class="qm">' + dot(q.stat) + '<span>' + K.STAT[q.stat].l + '</span><span class="sep">·</span><span>' + df.l + '</span>' +
          '<span class="sep">·</span><span>' + esc(daysLabel(q.days)) + '</span>' +
          (q.reminder ? '<span class="sep">·</span><span class="rem">' + ICON.bell + timeLabel(q.reminder) + '</span>' : '') +
          '</span></span><span class="chev" aria-hidden="true"></span></button></li>';
      }).join('') + '</ul>';
    }
    if (arch.length) {
      html += card(h2('Archived', '<span class="count">' + arch.length + '</span>') +
        '<ul class="plain">' + arch.map(function (q) {
          return '<li class="rowLine"><span>' + esc(q.name) + '</span><button class="btn ghost sm" data-act="unarchive" data-id="' + q.id + '">Restore</button></li>';
        }).join('') + '</ul>' +
        '<p class="hint mt">Archived quests keep their history but stop appearing on Today.</p>');
    }
    return html;
  };

  V.questForm = function (q) {
    var isNew = !q;
    q = q || { id: '', name: '', stat: 'calm', diff: 'med', days: [0,1,2,3,4,5,6], slot: 'any', reminder: '', note: '' };
    return '<form id="qForm" data-id="' + esc(q.id) + '">' +
      '<label class="l" for="fName">Quest</label>' +
      '<input id="fName" maxlength="48" placeholder="Read 20 pages" value="' + esc(q.name) + '" required>' +
      '<label class="l mt" for="fStat">Stat it builds</label>' +
      '<div class="segRow" id="fStat">' + K.STAT_KEYS.map(function (s) {
        return '<button type="button" class="seg" data-seg="stat" data-v="' + s + '" aria-pressed="' + (q.stat === s) + '">' + dot(s) + K.STAT[s].l + '</button>';
      }).join('') + '</div>' +
      '<p class="hint sm" id="statHint">' + esc(K.STAT[q.stat].d) + '</p>' +
      '<label class="l mt">Difficulty</label>' +
      '<div class="segRow">' + Object.keys(K.DIFF).map(function (x) {
        return '<button type="button" class="seg" data-seg="diff" data-v="' + x + '" aria-pressed="' + (q.diff === x) + '">' + K.DIFF[x].l + '<small>+' + K.DIFF[x].xp + '</small></button>';
      }).join('') + '</div>' +
      '<p class="hint sm" id="diffHint">' + esc(K.DIFF[q.diff].d) + ' · ' + K.DIFF[q.diff].xp + ' XP and ' + K.DIFF[q.diff].c + ' coins</p>' +
      '<label class="l mt">Days</label>' +
      '<div class="dayRow">' + K.DAY_LETTER.map(function (ltr, i) {
        return '<button type="button" class="day" data-day="' + i + '" aria-pressed="' + (q.days.indexOf(i) >= 0) + '" aria-label="' + K.DAY_SHORT[i] + '">' + ltr + '</button>';
      }).join('') + '</div>' +
      '<div class="chipbar mt"><button type="button" class="fc" data-preset="all">Every day</button>' +
        '<button type="button" class="fc" data-preset="week">Weekdays</button>' +
        '<button type="button" class="fc" data-preset="end">Weekends</button></div>' +
      '<label class="l mt">Time of day</label>' +
      '<div class="segRow">' + K.SLOTS.map(function (s) {
        return '<button type="button" class="seg" data-seg="slot" data-v="' + s.k + '" aria-pressed="' + ((q.slot || 'any') === s.k) + '">' + s.l + '</button>';
      }).join('') + '</div>' +
      '<label class="l mt" for="fRem">Reminder</label>' +
      '<input id="fRem" type="time" value="' + esc(q.reminder || '') + '">' +
      '<p class="hint sm">Fires while Questling is open or recently used. See Settings for what your phone can and cannot do.</p>' +
      '<label class="l mt" for="fNote">Note <span class="opt">optional</span></label>' +
      '<textarea id="fNote" maxlength="200" placeholder="What counts as done?">' + esc(q.note || '') + '</textarea>' +
      '<div class="sheetBtns">' +
        '<button class="btn lg full" type="submit">' + (isNew ? 'Add quest' : 'Save') + '</button>' +
        (isNew ? '' : '<button class="btn ghost full" type="button" data-act="archiveQuest" data-id="' + esc(q.id) + '">Archive</button>' +
          '<button class="btn danger full" type="button" data-act="deleteQuest" data-id="' + esc(q.id) + '">Delete for good</button>') +
      '</div></form>';
  };

  V.templates = function () {
    var byArea = {};
    K.TEMPLATES.forEach(function (t) { (byArea[t.f] = byArea[t.f] || []).push(t); });
    return '<p class="hint">Tap one to use it as a starting point. You can edit everything after.</p>' +
      K.FOCUS_AREAS.map(function (a) {
        if (!byArea[a.k]) return '';
        return '<div class="tplGroup"><div class="slotHead">' + esc(a.l) + '</div>' +
          byArea[a.k].map(function (t, i) {
            var idx = K.TEMPLATES.indexOf(t);
            return '<button class="tpl" data-act="useTpl" data-i="' + idx + '">' + dot(t.s) + '<span>' + esc(t.n) + '</span><span class="tplXp">+' + K.DIFF[t.d].xp + '</span></button>';
          }).join('') + '</div>';
      }).join('') +
      '<button class="btn ghost full mt" data-act="blankQuest">Start from blank instead</button>';
  };

  /* ================= SHOP ================= */
  V.shop = function () {
    var cats = [['all', 'All'], ['hat', 'Hats'], ['scarf', 'Scarves'], ['face', 'Faces'], ['bg', 'Scenes'], ['fur', 'Colors']];
    var cur = Q.ui.shopCat;
    var html = card(
      h2('Shop', '<span class="chip">' + ICON.coin + '<span>' + S().coins + '</span></span>') +
      '<p class="hint">Quests and achievements pay coins. Nothing here costs real money, and nothing is locked behind one.</p>' +
      '<div class="chipbar mt">' + cats.map(function (c) {
        return '<button class="fc" data-act="shopCat" data-v="' + c[0] + '" aria-pressed="' + (cur === c[0]) + '">' + c[1] + '</button>';
      }).join('') + '</div>'
    );
    var list = K.ITEMS.filter(function (i) { return cur === 'all' || i.cat === cur; });
    html += '<div class="shopGrid">' + list.map(function (it, ix) {
      var id = it.cat + ':' + it.key, owned = S().inv.indexOf(id) >= 0, eq = S().equip[it.cat] === it.key;
      var preview = { hat: S().equip.hat, scarf: S().equip.scarf, face: S().equip.face, bg: S().equip.bg, fur: S().equip.fur };
      preview[it.cat] = it.key;
      if (it.cat === 'bg' || it.cat === 'fur') { preview.hat = null; preview.scarf = null; preview.face = null; }
      var btn;
      if (owned) {
        btn = (it.cat === 'bg' || it.cat === 'fur')
          ? (eq ? '<button class="btn ghost sm" disabled>Equipped</button>' : '<button class="btn sm" data-act="equip" data-id="' + id + '">Equip</button>')
          : '<button class="btn ' + (eq ? 'ghost ' : '') + 'sm" data-act="equip" data-id="' + id + '">' + (eq ? 'Take off' : 'Equip') + '</button>';
      } else {
        btn = '<button class="btn sm" data-act="buy" data-id="' + id + '"' + (S().coins < it.price ? ' disabled' : '') + '>' + it.price + ' coins</button>';
      }
      return '<div class="item' + (eq ? ' eq' : '') + '" style="--j:' + ix + '">' +
        '<div class="itemArt">' + art.companion({ equip: preview, mood: 'good', stage: 'Scout', label: it.name }) +
        '<span class="rar ' + it.r + '">' + it.r + '</span></div>' +
        '<div class="itemT">' + esc(it.name) + '</div>' +
        '<div class="itemP">' + (owned ? (eq ? 'Equipped' : 'Owned') : it.price + ' coins') + '</div>' + btn + '</div>';
    }).join('') + '</div>';
    return html;
  };

  /* ================= JOURNAL ================= */
  V.journal = function () {
    var k = d.today(), e = S().journal[k];
    var prompt = K.PROMPTS[d.parse(k).getDate() % K.PROMPTS.length];
    var keys = Object.keys(S().journal).sort().reverse().filter(function (x) { return x !== k; });
    var html = card(
      h2('Today', '<span class="count">' + esc(d.pretty(k)) + '</span>') +
      '<p class="prompt">' + esc(e && e.prompt ? e.prompt : prompt) + '</p>' +
      '<textarea id="jText" class="jt" placeholder="A few lines is plenty." maxlength="4000">' + esc(e ? e.text : '') + '</textarea>' +
      '<div class="row mt"><button class="btn" data-act="saveJournal" data-prompt="' + esc(prompt) + '">' + (e ? 'Save changes' : 'Save entry') + '</button>' +
      '<span class="hint" id="jState">' + (e ? 'Saved ' + esc(d.pretty(k)) : 'First entry each day earns 10 XP') + '</span></div>'
    );
    html += card(h2('Past entries', '<span class="count">' + keys.length + '</span>') + (keys.length
      ? '<ul class="plain jList">' + keys.slice(0, 40).map(function (x) {
          var j = S().journal[x];
          return '<li><button class="jItem" data-act="openJournal" data-k="' + x + '"><b>' + esc(d.pretty(x)) + '</b><span>' + esc(j.text.slice(0, 110)) + (j.text.length > 110 ? '…' : '') + '</span></button></li>';
        }).join('') + '</ul>'
      : empty('Nothing written yet', 'Entries stay on this device. Nobody else can read them, including me.')));
    return html;
  };

  /* ================= ACHIEVEMENTS ================= */
  V.achievements = function () {
    var got = S().achievements;
    var n = Object.keys(got).length;
    return card(
      h2('Achievements', '<span class="count">' + n + ' of ' + K.ACH.length + '</span>') +
      '<div class="bar xp mt"><i style="width:' + (n / K.ACH.length * 100) + '%"></i></div>'
    ) +
    '<ul class="plain achList">' + K.ACH.map(function (a) {
      var on = !!got[a.id];
      return '<li class="ach' + (on ? ' on' : '') + '"><span class="achI">' + ICON.trophy + '</span>' +
        '<span class="achT"><b>' + esc(a.n) + '</b><small>' + esc(a.d) + '</small></span>' +
        '<span class="achC">' + (on ? esc(d.pretty(got[a.id])) : '+' + a.c + ' coins') + '</span></li>';
    }).join('') + '</ul>';
  };

  /* ================= SETTINGS ================= */
  function toggleRow(key, label, sub, act) {
    var on = S().settings[key];
    return '<div class="setRow"><div class="setT"><b>' + esc(label) + '</b><small>' + esc(sub) + '</small></div>' +
      '<button class="sw" role="switch" aria-checked="' + on + '" data-act="' + (act || 'toggle') + '" data-k="' + key + '" aria-label="' + esc(label) + '"><span></span></button></div>';
  }
  V.settings = function () {
    var st = S().settings, ns = Q.fx.notifyState();
    var html = card(
      h2('Appearance') +
      '<label class="l">Theme</label>' +
      '<div class="segRow">' + [['auto', 'Auto'], ['light', 'Light'], ['dark', 'Dark']].map(function (t) {
        return '<button class="seg" data-act="theme" data-v="' + t[0] + '" aria-pressed="' + (st.theme === t[0]) + '">' + t[1] + '</button>';
      }).join('') + '</div>' +
      '<label class="l mt">Colour</label>' +
      '<div class="palRow">' + K.PALETTES.map(function (p) {
        return '<button class="pal" data-act="palette" data-v="' + p.k + '" aria-pressed="' + (st.palette === p.k) + '" aria-label="' + p.l + '" title="' + p.l + '">' +
          '<span style="background:hsl(' + p.h + ' ' + p.s + '% 44%)"></span><span style="background:hsl(' + p.h2 + ' 70% 55%)"></span><small>' + p.l + '</small></button>';
      }).join('') + '</div>'
    );

    html += card(
      h2('Feel') +
      toggleRow('haptics', 'Haptics', 'Vibration on taps and wins. Using: ' + Q.fx.hapticSupport() + '.') +
      toggleRow('sound', 'Sound', 'Short tones, generated on the fly. No audio files.') +
      toggleRow('confetti', 'Celebrations', 'Confetti on level ups and boss kills.') +
      '<p class="hint mt">iPhone has no vibration API for web apps. Questling falls back to the system toggle tick, which works on iOS 17.4 and up. If you feel nothing, your phone does not support it.</p>'
    );

    html += card(
      h2('Reminders') +
      toggleRow('notifications', 'Quest reminders', ns === 'granted' ? 'Permission granted.' : ns === 'denied' ? 'Blocked in your browser settings.' : 'Permission not asked yet.', 'notifToggle') +
      '<p class="hint mt">Set a time on any quest in the Quests tab. Reminders fire while Questling is open or recently backgrounded.</p>' +
      '<p class="note mt">What your phone will not do: iOS cannot wake a closed web app on a schedule without a push server, and this app deliberately has no server. For an alarm you cannot miss, use the Clock app.</p>' +
      (ns === 'denied' ? '<p class="warnNote mt">Notifications are blocked. Turn them back on in Settings, then Safari, then Notifications.</p>' : '')
    );

    html += card(
      h2('Rules') +
      '<label class="l" for="setGoal">Daily goal</label>' +
      '<div class="segRow">' + [[34, 'A third'], [50, 'Half'], [75, 'Most'], [100, 'All of them']].map(function (g) {
        return '<button class="seg" data-act="goalPct" data-v="' + g[0] + '" aria-pressed="' + (st.goalPct === g[0]) + '">' + g[1] + '</button>';
      }).join('') + '</div>' +
      '<p class="hint sm">How much of a day’s list counts as a win and keeps the streak alive.</p>' +
      '<label class="l mt">Day starts at</label>' +
      '<div class="segRow">' + [0, 3, 4, 5, 6].map(function (hh) {
        return '<button class="seg" data-act="dayStart" data-v="' + hh + '" aria-pressed="' + (st.dayStart === hh) + '">' + (hh === 0 ? 'Midnight' : hh + ' AM') + '</button>';
      }).join('') + '</div>' +
      '<p class="hint sm">Anything before this counts as the previous day, so a late night does not cost you a streak.</p>'
    );

    html += card(
      h2('Companion') +
      '<label class="l" for="setName">Name</label>' +
      '<input id="setName" maxlength="16" value="' + esc(S().profile.name) + '" data-field="cname">'
    );

    html += card(
      h2('Your data') +
      '<p class="hint">Everything lives in this browser on this device. It is never uploaded, and I cannot see it.</p>' +
      '<div class="row mt"><button class="btn" data-act="exportCode">Copy backup code</button>' +
      (Q.canDownload ? '<button class="btn ghost" data-act="exportFile">Download file</button>' : '') + '</div>' +
      '<textarea id="bkOut" class="mono" readonly placeholder="Your backup code appears here if copying is blocked." aria-label="Backup code"></textarea>' +
      '<label class="l mt" for="bkIn">Restore from a code</label>' +
      '<textarea id="bkIn" class="mono" placeholder="Paste a backup code"></textarea>' +
      '<div class="row mt"><button class="btn ghost" data-act="importCode">Restore</button>' +
      '<button class="btn danger" data-act="reset">' + (Q.ui.resetArm ? 'Tap again to erase everything' : 'Reset all progress') + '</button></div>'
    );
    html += '<p class="foot">Questling · version 2 · no account, no server, no tracking</p>';
    return html;
  };

  /* ================= HELP ================= */
  V.help = function () {
    var S0 = S();
    return card(
      h2('The loop') +
      '<p class="body">Set the quests you want to run. Finish them. Your companion gains XP and levels up, you earn coins, and the week’s boss takes damage. That is the whole game.</p>'
    ) +
    card(
      h2('XP and coins') +
      '<ul class="plain rules">' +
        Object.keys(K.DIFF).map(function (x) {
          return '<li class="rowLine"><span>' + K.DIFF[x].l + ' quest · ' + K.DIFF[x].d.toLowerCase() + '</span><b>' + K.DIFF[x].xp + ' XP · ' + K.DIFF[x].c + ' coins</b></li>';
        }).join('') +
        '<li class="rowLine"><span>Daily check-in</span><b>5 XP</b></li>' +
        '<li class="rowLine"><span>Journal entry</span><b>10 XP</b></li>' +
        '<li class="rowLine"><span>25 minutes of focus</span><b>15 XP</b></li>' +
        '<li class="rowLine"><span>Clearing every quest in a day</span><b>25 XP · 20 coins</b></li>' +
        '<li class="rowLine"><span>Killing the weekly boss</span><b>100 coins</b></li>' +
      '</ul>' +
      '<p class="hint mt">Streak bonus adds 5% XP for every 3 days running, up to 50%. You are at ' +
        Math.round(Math.min(0.5, Math.floor(db.streak() / 3) * 0.05) * 100) + '% right now.</p>'
    ) +
    card(
      h2('Levels') +
      '<p class="body">Level 2 needs 100 XP, and each level after costs 20 more than the last. Your companion changes shape at levels 5, 10, 20 and 35.</p>' +
      '<ul class="plain rules">' +
        [['Hatchling', 'Levels 1 to 4'], ['Scout', '5 to 9'], ['Ranger', '10 to 19'], ['Champion', '20 to 34'], ['Mythic', '35 and up']].map(function (x) {
          return '<li class="rowLine"><span>' + x[0] + '</span><b>' + x[1] + '</b></li>';
        }).join('') + '</ul>'
    ) +
    card(
      h2('Streaks and freezes') +
      '<p class="body">A day counts when you finish your daily goal, currently ' + S0.settings.goalPct + '% of that day’s scheduled quests. Miss a day and a streak freeze is spent automatically to protect the run. You hold ' + S0.freezes + ' right now, and you earn one for every 7 days running, up to 3. With none left, a missed day ends the streak.</p>' +
      '<p class="hint mt">Days with nothing scheduled never break a streak, so a planned rest day is safe.</p>'
    ) +
    card(
      h2('The Coach') +
      '<p class="body">The Coach is statistics, not a chatbot. It reads your own log on this device and reports what it finds: weekday patterns, quests that are slipping, which quest predicts a good day, and how mood and energy correlate with follow-through. Every card shows the number of days it is based on, so you can judge whether to believe it.</p>' +
      '<p class="note mt">There is no language model inside Questling. One would need a server and a paid API key, and the app would stop working offline.</p>'
    ) +
    card(
      h2('What this app will not do') +
      '<p class="body">It will not make you consistent on its own. Points and streaks help you notice what you are doing, but the evidence on gamified habit apps is modest and mixed, and the effect fades once the novelty does. What reliably helps is a short list, a fixed time, and a cue you cannot miss. Use the app to see the pattern, not to supply the motivation.</p>'
    ) +
    card(
      h2('Privacy') +
      '<p class="body">No account, no server, no analytics. Your quests, journal and logs are stored in this browser only. Clearing site data erases them, so take a backup from Settings now and then.</p>'
    );
  };

  /* ================= ONBOARDING ================= */
  V.onboard = function () {
    var st = Q.ui.obStep || 0;
    var body = '';
    if (st === 0) {
      body = '<div class="obArt">' + art.companion({ equip: { hat: null, scarf: null, face: null, bg: 'meadow', fur: 'moss' }, mood: 'great', stage: 'Hatchling', label: 'A new companion' }) + '</div>' +
        '<h1>Questling</h1><p class="obB">A small creature that grows when you do. Finish real quests, earn XP, and watch it level up.</p>' +
        '<button class="btn lg full" data-act="obNext">Start</button>' +
        '<button class="btn ghost full" data-act="obRestore">I have a backup code</button>';
    } else if (st === 1) {
      body = '<h1>Name your companion</h1><p class="obB">You can change this later.</p>' +
        '<input id="obName" maxlength="16" value="' + esc(S().profile.name) + '" placeholder="Ember">' +
        '<div class="palRow mt">' + Object.keys(K.FUR).map(function (f) {
          return '<button class="pal fur" data-act="obFur" data-v="' + f + '" aria-pressed="' + (S().equip.fur === f) + '" aria-label="' + f + '"><span style="background:' + K.FUR[f][0] + '"></span><span style="background:' + K.FUR[f][1] + '"></span></button>';
        }).join('') + '</div>' +
        '<button class="btn lg full mt" data-act="obNext">Next</button>';
    } else if (st === 2) {
      body = '<h1>What are you working on?</h1><p class="obB">Pick a few. I will suggest quests that fit.</p>' +
        '<div class="obPick">' + K.FOCUS_AREAS.map(function (a) {
          return '<button class="pick" data-act="obFocus" data-v="' + a.k + '" aria-pressed="' + (S().profile.focus.indexOf(a.k) >= 0) + '">' + esc(a.l) + '</button>';
        }).join('') + '</div>' +
        '<button class="btn lg full mt" data-act="obNext">Next</button>';
    } else {
      var picks = K.TEMPLATES.filter(function (t) { return S().profile.focus.indexOf(t.f) >= 0; });
      if (!picks.length) picks = K.TEMPLATES.slice(0, 8);
      body = '<h1>Pick your first quests</h1><p class="obB">Three or four is plenty. You can change everything later.</p>' +
        '<div class="obList">' + picks.map(function (t) {
          var i = K.TEMPLATES.indexOf(t);
          return '<button class="pick wide" data-act="obTpl" data-i="' + i + '" aria-pressed="' + (Q.ui.obPicks.indexOf(i) >= 0) + '">' + dot(t.s) + '<span>' + esc(t.n) + '</span></button>';
        }).join('') + '</div>' +
        '<button class="btn lg full mt" data-act="obDone">' + (Q.ui.obPicks.length ? 'Start with ' + Q.ui.obPicks.length + ' quest' + (Q.ui.obPicks.length > 1 ? 's' : '') : 'Skip for now') + '</button>';
    }
    return '<div class="onboard"><div class="obCard">' + body + '</div>' +
      '<div class="obDots">' + [0,1,2,3].map(function (i) { return '<i class="' + (i === st ? 'on' : '') + '"></i>'; }).join('') + '</div></div>';
  };

  Q.views = V;
  Q.helpers = { card: card, h2: h2, empty: empty, dot: dot, timeLabel: timeLabel, daysLabel: daysLabel, questRow: questRow };
})(window.Q);
