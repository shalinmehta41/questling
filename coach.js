/* Questling — Coach. Pattern analysis over the user's own log. No network, no model. */
(function (Q) {
  'use strict';
  var d = Q.d, db = Q.db, K = Q.K;

  function window_(n, endOffset) {
    var out = [], k = d.shift(d.today(), -(endOffset || 0));
    for (var i = 0; i < n; i++) { out.push(k); k = d.shift(k, -1); }
    return out;
  }
  function active(keys) {
    return keys.filter(function (k) { return k >= Q.S.created && db.plannedIds(k).length > 0; });
  }
  function rateOver(keys) {
    var ks = active(keys);
    if (!ks.length) return null;
    var done = 0, planned = 0;
    ks.forEach(function (k) { done += db.doneIds(k).length; planned += db.plannedIds(k).length; });
    return planned ? { rate: done / planned, days: ks.length, done: done, planned: planned } : null;
  }
  function pearson(xs, ys) {
    var n = xs.length; if (n < 3) return null;
    var mx = xs.reduce(function (a, b) { return a + b; }, 0) / n;
    var my = ys.reduce(function (a, b) { return a + b; }, 0) / n;
    var sx = 0, sy = 0, sxy = 0;
    for (var i = 0; i < n; i++) {
      var dx = xs[i] - mx, dy = ys[i] - my;
      sx += dx * dx; sy += dy * dy; sxy += dx * dy;
    }
    if (sx === 0 || sy === 0) return null;
    return sxy / Math.sqrt(sx * sy);
  }
  function pct(x) { return Math.round(x * 100) + '%'; }

  /* per-quest reliability over a window */
  function reliability(q, keys) {
    var due = 0, hit = 0;
    keys.forEach(function (k) {
      if (k < Q.S.created) return;
      if (q.days.indexOf(d.weekday(k)) < 0) return;
      due++;
      var r = Q.S.log[k];
      if (r && r.done.indexOf(q.id) >= 0) hit++;
    });
    return { due: due, hit: hit, rate: due ? hit / due : null };
  }

  function questTable() {
    var keys = window_(28);
    return db.live().map(function (q) {
      var r = reliability(q, keys);
      return { q: q, due: r.due, hit: r.hit, rate: r.rate, streak: db.questStreak(q.id) };
    }).sort(function (a, b) {
      if (a.rate === null) return 1;
      if (b.rate === null) return -1;
      return a.rate - b.rate;
    });
  }

  function insights() {
    var out = [], S = Q.S;
    var w7 = rateOver(window_(7)), w7prev = rateOver(window_(7, 7)), w30 = rateOver(window_(30));
    var keys28 = window_(28);

    /* 1. trend */
    if (w7 && w7.days >= 3) {
      if (w7prev && w7prev.days >= 3) {
        var delta = w7.rate - w7prev.rate;
        if (Math.abs(delta) >= 0.08) {
          out.push({
            tone: delta > 0 ? 'good' : 'warn',
            tag: 'Trend',
            title: delta > 0 ? 'You are up ' + Math.round(delta * 100) + ' points this week' : 'You are down ' + Math.round(-delta * 100) + ' points this week',
            body: 'Last 7 days you finished ' + pct(w7.rate) + ' of scheduled quests, against ' + pct(w7prev.rate) + ' the week before.',
            n: w7.days + w7prev.days
          });
        } else {
          out.push({ tone: 'info', tag: 'Trend', title: 'Holding steady at ' + pct(w7.rate),
            body: 'Within a few points of last week. Consistency is the thing that compounds.', n: w7.days + w7prev.days });
        }
      } else {
        out.push({ tone: 'info', tag: 'Trend', title: pct(w7.rate) + ' over the last 7 days',
          body: w7.done + ' of ' + w7.planned + ' scheduled quests. Another week of data and I can compare.', n: w7.days });
      }
    }

    /* 2. best and worst weekday */
    var byDay = [0,1,2,3,4,5,6].map(function () { return { done: 0, planned: 0, days: 0 }; });
    active(window_(56)).forEach(function (k) {
      var b = byDay[d.weekday(k)];
      b.done += db.doneIds(k).length; b.planned += db.plannedIds(k).length; b.days++;
    });
    var ranked = byDay.map(function (b, i) { return { i: i, r: b.planned ? b.done / b.planned : null, days: b.days }; })
      .filter(function (x) { return x.r !== null && x.days >= 3; })
      .sort(function (a, b) { return b.r - a.r; });
    if (ranked.length >= 4) {
      var best = ranked[0], worst = ranked[ranked.length - 1];
      if (best.r - worst.r >= 0.15) {
        out.push({
          tone: 'info', tag: 'Weekly shape',
          title: K.DAY_SHORT[worst.i] + ' is your weak day',
          body: K.DAY_SHORT[best.i] + ' runs at ' + pct(best.r) + ' and ' + K.DAY_SHORT[worst.i] + ' at ' + pct(worst.r) +
            '. Either lighten ' + K.DAY_SHORT[worst.i] + "'s schedule or move the hard quest off it.",
          n: best.days + worst.days
        });
      }
    }

    /* 3. slipping quest */
    var slip = null;
    db.live().forEach(function (q) {
      var recent = reliability(q, window_(7)), prior = reliability(q, window_(21, 7));
      if (recent.due < 3 || prior.due < 5 || prior.rate === null || recent.rate === null) return;
      var drop = prior.rate - recent.rate;
      if (drop >= 0.3 && (!slip || drop > slip.drop)) slip = { q: q, drop: drop, recent: recent, prior: prior };
    });
    if (slip) {
      out.push({
        tone: 'warn', tag: 'Slipping',
        title: '"' + slip.q.name + '" is falling off',
        body: 'You hit it ' + slip.recent.hit + ' of ' + slip.recent.due + ' times this week, down from ' + pct(slip.prior.rate) +
          ' over the three weeks before. Shrink it or move it earlier rather than dropping it.',
        n: slip.recent.due + slip.prior.due
      });
    }

    /* 4. anchor quest: the one most associated with a full day */
    var anchor = null;
    db.live().forEach(function (q) {
      var withQ = 0, withQFull = 0, without = 0, withoutFull = 0;
      keys28.forEach(function (k) {
        if (k < Q.S.created || q.days.indexOf(d.weekday(k)) < 0) return;
        if (!db.plannedIds(k).length) return;
        var r = Q.S.log[k], hit = r && r.done.indexOf(q.id) >= 0;
        var full = db.dayMet(k);
        if (hit) { withQ++; if (full) withQFull++; } else { without++; if (full) withoutFull++; }
      });
      if (withQ < 4 || without < 3) return;
      var lift = (withQFull / withQ) - (withoutFull / without);
      if (lift >= 0.3 && (!anchor || lift > anchor.lift)) anchor = { q: q, lift: lift, withQ: withQ, without: without, a: withQFull / withQ, b: withoutFull / without };
    });
    if (anchor) {
      out.push({
        tone: 'good', tag: 'Keystone',
        title: '"' + anchor.q.name + '" pulls the rest of your day',
        body: 'On days you finish it you hit your daily goal ' + pct(anchor.a) + ' of the time. On days you skip it, ' + pct(anchor.b) +
          '. If a day is going badly, do this one first.',
        n: anchor.withQ + anchor.without
      });
    }

    /* 5. mood and energy correlation */
    [['mood', 'Mood', K.MOODS], ['energy', 'Energy', K.ENERGY]].forEach(function (pair) {
      var xs = [], ys = [];
      window_(60).forEach(function (k) {
        var r = Q.S.log[k];
        if (!r || !r[pair[0]] || !db.plannedIds(k).length || k < Q.S.created) return;
        xs.push(r[pair[0]]); ys.push(db.ratio(k));
      });
      if (xs.length < 8) return;
      var r = pearson(xs, ys);
      if (r === null || Math.abs(r) < 0.35) return;
      out.push({
        tone: r > 0 ? 'info' : 'warn', tag: pair[1],
        title: r > 0 ? pair[1] + ' and follow-through move together' : pair[1] + ' runs against your follow-through',
        body: (r > 0
          ? 'Across ' + xs.length + ' logged days, better ' + pair[1].toLowerCase() + ' lines up with finishing more quests (r = ' + r.toFixed(2) + '). That cuts both ways, so protect the inputs that lift it.'
          : 'Across ' + xs.length + ' logged days, higher ' + pair[1].toLowerCase() + ' lines up with finishing fewer quests (r = ' + r.toFixed(2) + '). Worth a look at what you do on the good days.'),
        n: xs.length
      });
    });

    /* 6. start time */
    var early = { done: 0, planned: 0, n: 0 }, late = { done: 0, planned: 0, n: 0 }, hours = [];
    active(window_(45)).forEach(function (k) {
      var h = db.firstHour(k); if (h === null) return;
      hours.push(h);
    });
    if (hours.length >= 8) {
      var sorted = hours.slice().sort(function (a, b) { return a - b; });
      var med = sorted[Math.floor(sorted.length / 2)];
      active(window_(45)).forEach(function (k) {
        var h = db.firstHour(k); if (h === null) return;
        var b = h <= med ? early : late;
        b.done += db.doneIds(k).length; b.planned += db.plannedIds(k).length; b.n++;
      });
      if (early.planned && late.planned && early.n >= 3 && late.n >= 3) {
        var er = early.done / early.planned, lr = late.done / late.planned;
        var hh = Math.floor(med), mm = Math.round((med - hh) * 60);
        var clock = (hh % 12 || 12) + ':' + (mm < 10 ? '0' + mm : mm) + ' ' + (hh < 12 ? 'AM' : 'PM');
        if (er - lr >= 0.12) {
          out.push({
            tone: 'good', tag: 'Timing',
            title: 'Starting early is worth ' + Math.round((er - lr) * 100) + ' points',
            body: 'Your typical first quest lands at ' + clock + '. On days you start by then you finish ' + pct(er) + ' of your quests, against ' + pct(lr) + ' on later days.',
            n: early.n + late.n
          });
        } else {
          out.push({ tone: 'info', tag: 'Timing', title: 'You usually start around ' + clock,
            body: 'Start time does not change your completion much, so the bottleneck is elsewhere.', n: early.n + late.n });
        }
      }
    }

    /* 7. today's risk */
    var tk = d.today(), planned = db.plannedIds(tk).length;
    if (planned) {
      var doneNow = db.doneIds(tk).length, goal = db.goalFor(tk), hr = new Date().getHours();
      if (doneNow < goal && hr >= 17) {
        out.push({
          tone: 'warn', tag: 'Today',
          title: doneNow >= goal ? 'Goal met' : (goal - doneNow) + ' more to keep the streak',
          body: 'It is after 5 PM and you are at ' + doneNow + ' of ' + goal + '. Pick the cheapest one on the list and clear it.',
          n: 1, pin: true
        });
      } else if (doneNow >= planned && planned > 1) {
        out.push({ tone: 'good', tag: 'Today', title: 'Everything is done', body: 'Full clear. Nothing left to chase today.', n: 1, pin: true });
      }
    }

    /* 8. focus time */
    var fw = 0, fp = 0;
    var cut = d.shift(d.today(), -7), cut2 = d.shift(d.today(), -14);
    Q.S.focus.forEach(function (f) {
      if (f.date > cut) fw += f.min; else if (f.date > cut2) fp += f.min;
    });
    if (fw || fp) {
      out.push({
        tone: fw >= fp ? 'good' : 'info', tag: 'Focus',
        title: Math.round(fw / 60 * 10) / 10 + ' hours focused this week',
        body: fp ? 'Against ' + Math.round(fp / 60 * 10) / 10 + ' hours the week before.' : 'First week of focus sessions logged.',
        n: Q.S.focus.length
      });
    }

    /* 9. streak safety */
    var st = db.streak();
    if (st >= 3) {
      out.push({
        tone: 'good', tag: 'Streak', title: st + ' days running',
        body: Q.S.freezes > 0
          ? 'You hold ' + Q.S.freezes + ' streak freeze' + (Q.S.freezes > 1 ? 's' : '') + ', so one bad day will not end it. Two in a row still will.'
          : 'No freezes left. The next missed day ends the run, so protect tomorrow.',
        n: st
      });
    }

    out.sort(function (a, b) {
      if (!!b.pin !== !!a.pin) return b.pin ? 1 : -1;
      var w = { warn: 0, good: 1, info: 2 };
      return w[a.tone] - w[b.tone];
    });
    return { list: out, w7: w7, w30: w30 };
  }

  function weeklyReview() {
    var start = d.mondayOf(d.shift(d.today(), -7)), keys = [];
    for (var i = 0; i < 7; i++) keys.push(d.shift(start, i));
    var r = rateOver(keys);
    if (!r) return null;
    var perfect = keys.filter(db.perfect).length, met = keys.filter(db.dayMet).length;
    var xp = 0;
    keys.forEach(function (k) {
      var rec = Q.S.log[k]; if (!rec) return;
      Object.keys(rec.earn).forEach(function (id) { xp += rec.earn[id].xp || 0; });
    });
    var top = null;
    db.live().forEach(function (q) {
      var rel = reliability(q, keys);
      if (rel.due >= 2 && rel.rate !== null && (!top || rel.rate > top.rate)) top = { q: q, rate: rel.rate, rel: rel };
    });
    return { start: start, end: keys[6], rate: r.rate, done: r.done, planned: r.planned, perfect: perfect, met: met, xp: xp, top: top };
  }

  Q.coach = { insights: insights, questTable: questTable, weeklyReview: weeklyReview, reliability: reliability, rateOver: rateOver, window_: window_, pct: pct };
})(window.Q);
