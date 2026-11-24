/* Questling — data model, storage, and derived numbers. */
window.Q = window.Q || {};
(function (Q) {
  'use strict';

  var KEY = 'questling.v2', LEGACY = 'questling.v1';

  var STAT = {
    strength: { l: 'Strength', v: '--c-str', d: 'Training, sport, physical work' },
    mind:     { l: 'Mind',     v: '--c-mind', d: 'Study, reading, deep work' },
    body:     { l: 'Body',     v: '--c-body', d: 'Food, sleep, recovery' },
    calm:     { l: 'Calm',     v: '--c-calm', d: 'Routine, headspace, self care' }
  };
  var STAT_KEYS = ['strength', 'mind', 'body', 'calm'];
  var DIFF = {
    easy: { xp: 10, c: 4,  l: 'Easy',   d: 'Two minutes' },
    med:  { xp: 20, c: 8,  l: 'Medium', d: 'Fifteen to thirty minutes' },
    hard: { xp: 35, c: 14, l: 'Hard',   d: 'An hour or more' },
    epic: { xp: 55, c: 22, l: 'Epic',   d: 'The one you avoid' }
  };
  var SLOTS = [
    { k: 'morning', l: 'Morning', h: 4 },
    { k: 'day',     l: 'Afternoon', h: 12 },
    { k: 'evening', l: 'Evening', h: 17 },
    { k: 'any',     l: 'Anytime', h: 99 }
  ];
  var DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var DAY_LETTER = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  var MOODS = ['Rough', 'Low', 'Okay', 'Good', 'Great'];
  var ENERGY = ['Drained', 'Low', 'Steady', 'Strong', 'Wired'];

  var PALETTES = [
    { k: 'forest', l: 'Forest', h: 162, h2: 40, s: 46 },
    { k: 'dusk',   l: 'Dusk',   h: 258, h2: 196, s: 44 },
    { k: 'ember',  l: 'Ember',  h: 18,  h2: 44,  s: 54 },
    { k: 'tide',   l: 'Tide',   h: 202, h2: 172, s: 48 },
    { k: 'bloom',  l: 'Bloom',  h: 330, h2: 28,  s: 42 },
    { k: 'slate',  l: 'Slate',  h: 220, h2: 36,  s: 14 }
  ];

  var STAGES = [
    { min: 1,  k: 'Hatchling' }, { min: 5, k: 'Scout' }, { min: 10, k: 'Ranger' },
    { min: 20, k: 'Champion' }, { min: 35, k: 'Mythic' }
  ];

  var BOSSES = [
    { n: 'The Snooze Wraith', c: '#6B7FD7', t: 'Feeds on the third alarm.' },
    { n: 'Procrastination Golem', c: '#B5835A', t: 'Slow, heavy, always tomorrow.' },
    { n: 'Doomscroll Hydra', c: '#7C5CC4', t: 'Cut one head, two more load.' },
    { n: 'The Skip Day Slime', c: '#3DA35D', t: 'Just once will not hurt, it says.' },
    { n: 'Lord Half Effort', c: '#C0564A', t: 'Shows up, does nothing.' },
    { n: 'The Midnight Thief', c: '#3B6FA8', t: 'Steals tomorrow, one hour at a time.' }
  ];

  var FUR = {
    moss:  ['#7FB069', '#C9E4B5', '#F2A7A0', '#5E8C4D'],
    amber: ['#E9A84C', '#F7DCA6', '#F0907A', '#C2812F'],
    slate: ['#7C93C4', '#C7D3EE', '#F0A7B8', '#5B72A3'],
    rose:  ['#E58F9B', '#F8CFD5', '#F0A0A8', '#C06B78'],
    mint:  ['#6FC2B4', '#C6EDE5', '#F3B6A4', '#4E9B8E'],
    dusk:  ['#9B87D4', '#D8CDF2', '#F4B0C4', '#7663B0']
  };

  var ITEMS = [
    { cat: 'hat', key: 'beanie', name: 'Blue beanie', price: 40, r: 'common' },
    { cat: 'hat', key: 'band', name: 'Sweat headband', price: 50, r: 'common' },
    { cat: 'hat', key: 'cap', name: 'Backwards cap', price: 70, r: 'common' },
    { cat: 'hat', key: 'helmet', name: 'Iron helmet', price: 140, r: 'rare' },
    { cat: 'hat', key: 'wizard', name: 'Wizard hat', price: 180, r: 'rare' },
    { cat: 'hat', key: 'halo', name: 'Quiet halo', price: 260, r: 'epic' },
    { cat: 'hat', key: 'crown', name: 'Gold crown', price: 340, r: 'epic' },
    { cat: 'scarf', key: 'red', name: 'Red scarf', price: 50, r: 'common' },
    { cat: 'scarf', key: 'teal', name: 'Teal scarf', price: 50, r: 'common' },
    { cat: 'scarf', key: 'gold', name: 'Gold scarf', price: 110, r: 'rare' },
    { cat: 'scarf', key: 'storm', name: 'Storm cloak', price: 230, r: 'epic' },
    { cat: 'face', key: 'glasses', name: 'Round glasses', price: 70, r: 'common' },
    { cat: 'face', key: 'shades', name: 'Dark shades', price: 95, r: 'common' },
    { cat: 'face', key: 'visor', name: 'Focus visor', price: 190, r: 'rare' },
    { cat: 'bg', key: 'meadow', name: 'Meadow', price: 0, r: 'common' },
    { cat: 'bg', key: 'dawn', name: 'Sunrise hill', price: 90, r: 'common' },
    { cat: 'bg', key: 'night', name: 'Starry night', price: 110, r: 'common' },
    { cat: 'bg', key: 'gym', name: 'Training hall', price: 140, r: 'rare' },
    { cat: 'bg', key: 'library', name: 'Study hall', price: 140, r: 'rare' },
    { cat: 'bg', key: 'shore', name: 'Quiet shore', price: 170, r: 'rare' },
    { cat: 'bg', key: 'summit', name: 'Summit', price: 300, r: 'epic' },
    { cat: 'fur', key: 'moss', name: 'Moss', price: 0, r: 'common' },
    { cat: 'fur', key: 'amber', name: 'Amber', price: 60, r: 'common' },
    { cat: 'fur', key: 'slate', name: 'Slate blue', price: 60, r: 'common' },
    { cat: 'fur', key: 'rose', name: 'Rose', price: 60, r: 'common' },
    { cat: 'fur', key: 'mint', name: 'Sea mint', price: 120, r: 'rare' },
    { cat: 'fur', key: 'dusk', name: 'Dusk violet', price: 120, r: 'rare' }
  ];

  var TEMPLATES = [
    { f: 'body', n: 'Train: gym session', s: 'strength', d: 'hard', sl: 'morning' },
    { f: 'body', n: 'Walk 8,000 steps', s: 'body', d: 'med', sl: 'any' },
    { f: 'body', n: 'Hit protein target', s: 'body', d: 'med', sl: 'evening' },
    { f: 'body', n: 'Log every meal', s: 'body', d: 'easy', sl: 'evening' },
    { f: 'body', n: 'Stretch 10 minutes', s: 'body', d: 'easy', sl: 'evening' },
    { f: 'body', n: 'Drink 3 litres of water', s: 'body', d: 'easy', sl: 'any' },
    { f: 'study', n: 'Deep study block, 2 hours', s: 'mind', d: 'hard', sl: 'morning' },
    { f: 'study', n: 'Flashcard review', s: 'mind', d: 'med', sl: 'any' },
    { f: 'study', n: 'Read 20 pages', s: 'mind', d: 'med', sl: 'evening' },
    { f: 'study', n: 'Review today\'s lecture', s: 'mind', d: 'med', sl: 'evening' },
    { f: 'study', n: 'One practice problem set', s: 'mind', d: 'hard', sl: 'day' },
    { f: 'mind', n: 'Ten minutes of quiet', s: 'calm', d: 'easy', sl: 'morning' },
    { f: 'mind', n: 'Write in the journal', s: 'calm', d: 'easy', sl: 'evening' },
    { f: 'mind', n: 'No phone for the first hour', s: 'calm', d: 'med', sl: 'morning' },
    { f: 'mind', n: 'Plan tomorrow before bed', s: 'calm', d: 'easy', sl: 'evening' },
    { f: 'sleep', n: 'Up by 6:30 AM', s: 'calm', d: 'med', sl: 'morning' },
    { f: 'sleep', n: 'In bed by 11 PM', s: 'calm', d: 'med', sl: 'evening' },
    { f: 'sleep', n: 'Phone out of the room', s: 'calm', d: 'easy', sl: 'evening' },
    { f: 'care', n: 'Skincare, morning', s: 'calm', d: 'easy', sl: 'morning' },
    { f: 'care', n: 'Skincare, night', s: 'calm', d: 'easy', sl: 'evening' },
    { f: 'care', n: 'Make the bed', s: 'calm', d: 'easy', sl: 'morning' },
    { f: 'care', n: 'Tidy the room', s: 'calm', d: 'easy', sl: 'evening' },
    { f: 'social', n: 'Message someone I care about', s: 'calm', d: 'easy', sl: 'any' },
    { f: 'social', n: 'See a friend in person', s: 'calm', d: 'med', sl: 'any' },
    { f: 'work', n: 'Clear the inbox', s: 'mind', d: 'med', sl: 'day' },
    { f: 'work', n: 'One hour on the side project', s: 'mind', d: 'hard', sl: 'evening' }
  ];
  var FOCUS_AREAS = [
    { k: 'body', l: 'Fitness and food' }, { k: 'study', l: 'Study and school' },
    { k: 'mind', l: 'Headspace' }, { k: 'sleep', l: 'Sleep and mornings' },
    { k: 'care', l: 'Self care and space' }, { k: 'social', l: 'People' },
    { k: 'work', l: 'Work and projects' }
  ];

  var PROMPTS = [
    'What went better than you expected today?',
    'What did you avoid, and what was underneath it?',
    'Name one thing you would do differently tomorrow.',
    'Who or what helped you today?',
    'What is taking up the most space in your head right now?',
    'What is one small win nobody else noticed?',
    'Where did your energy go today?',
    'What are you putting off, and what is the smallest first step?',
    'What felt heavy today, and did it have to be?',
    'What is worth repeating from today?'
  ];

  /* ---------- date helpers (day rolls over at settings.dayStart) ---------- */
  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function ymd(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function parse(k) { var p = k.split('-'); return new Date(+p[0], +p[1] - 1, +p[2], 12); }
  function shift(k, n) { var d = parse(k); d.setDate(d.getDate() + n); return ymd(d); }
  function weekday(k) { return parse(k).getDay(); }
  function today() {
    var d = new Date();
    d.setHours(d.getHours() - (S.settings ? S.settings.dayStart : 4));
    return ymd(d);
  }
  function mondayOf(k) { var d = parse(k); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return ymd(d); }
  function pretty(k) {
    var d = parse(k), t = today();
    if (k === t) return 'Today';
    if (k === shift(t, -1)) return 'Yesterday';
    return DAY_SHORT[d.getDay()] + ' ' + d.getDate() + ' ' + ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getMonth()];
  }
  function clockOf(ts) { var d = new Date(ts); var h = d.getHours(), m = d.getMinutes(); var ap = h < 12 ? 'AM' : 'PM'; var hh = h % 12 || 12; return hh + ':' + pad(m) + ' ' + ap; }

  /* ---------- schema ---------- */
  function fresh() {
    return {
      v: 2, created: ymd(new Date()), lastSeen: null,
      profile: { name: 'Ember', owner: '', focus: [], onboarded: false },
      settings: {
        theme: 'auto', palette: 'forest', haptics: true, sound: true,
        notifications: false, dayStart: 4, goalPct: 50, confetti: true
      },
      xp: 0, coins: 40, statXp: { strength: 0, mind: 0, body: 0, calm: 0 },
      quests: [], log: {}, journal: {}, focus: [], achievements: {},
      inv: ['bg:meadow', 'fur:moss'],
      equip: { hat: null, scarf: null, face: null, bg: 'meadow', fur: 'moss' },
      boss: null, bossWins: 0, best: 0, freezes: 2, freezeMark: 0, nid: 1
    };
  }

  var S = fresh();

  function read() {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) { var o = JSON.parse(raw); if (o && o.v === 2) return o; }
      var old = localStorage.getItem(LEGACY);
      if (old) { var l = JSON.parse(old); if (l && l.v === 1) return upgrade(l); }
    } catch (e) {}
    return null;
  }
  function upgrade(o) {
    var n = fresh();
    n.profile.name = o.name || 'Ember';
    n.profile.onboarded = true;
    n.xp = o.xp || 0; n.coins = o.coins || 0;
    n.statXp = o.statXp || n.statXp;
    n.inv = o.inv || n.inv; n.equip = o.equip || n.equip;
    n.bossWins = o.bossWins || 0; n.best = o.best || 0;
    n.quests = (o.habits || []).map(function (h, i) {
      return { id: 'q' + (i + 1), name: h.name, stat: h.stat, diff: h.diff, days: [0,1,2,3,4,5,6], slot: 'any', reminder: null, note: '', archived: false, created: n.created };
    });
    n.nid = n.quests.length + 1;
    Object.keys(o.log || {}).forEach(function (k) {
      var d = o.log[k];
      n.log[k] = { done: d.done || [], earn: d.earn || {}, mood: d.mood || 0, energy: 0, moodPaid: !!d.moodPaid, bonus: d.bonus || 0, planned: null, frozen: false };
    });
    return n;
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }

  function hydrate() {
    var loaded = read();
    if (loaded) {
      var f = fresh();
      Object.keys(f).forEach(function (k) { if (loaded[k] === undefined) loaded[k] = f[k]; });
      Object.keys(f.settings).forEach(function (k) { if (loaded.settings[k] === undefined) loaded.settings[k] = f.settings[k]; });
      Object.keys(f.profile).forEach(function (k) { if (loaded.profile[k] === undefined) loaded.profile[k] = f.profile[k]; });
      Object.keys(f.equip).forEach(function (k) { if (loaded.equip[k] === undefined) loaded.equip[k] = f.equip[k]; });
      S = loaded;
    }
    Q.S = S;
    return S;
  }

  /* ---------- quests & days ---------- */
  function live() { return S.quests.filter(function (q) { return !q.archived; }); }
  function byId(id) { for (var i = 0; i < S.quests.length; i++) if (S.quests[i].id === id) return S.quests[i]; return null; }
  function scheduled(k) {
    var wd = weekday(k);
    return live().filter(function (q) { return q.days.indexOf(wd) >= 0; });
  }
  function rec(k, create) {
    var d = S.log[k];
    if (!d && create) d = S.log[k] = { done: [], earn: {}, mood: 0, energy: 0, moodPaid: false, bonus: 0, planned: null, frozen: false };
    return d;
  }
  function plannedIds(k) {
    var d = S.log[k];
    if (d && d.planned && k !== today()) return d.planned;
    return scheduled(k).map(function (q) { return q.id; });
  }
  function doneIds(k) {
    var d = S.log[k]; if (!d) return [];
    var p = plannedIds(k);
    return d.done.filter(function (id) { return p.indexOf(id) >= 0; });
  }
  function goalFor(k) {
    var n = plannedIds(k).length;
    return n ? Math.max(1, Math.ceil(n * (S.settings.goalPct / 100))) : 0;
  }
  function ratio(k) {
    var p = plannedIds(k).length;
    return p ? doneIds(k).length / p : 0;
  }
  function dayMet(k) {
    var g = goalFor(k); if (!g) return false;
    return doneIds(k).length >= g;
  }
  function perfect(k) {
    var p = plannedIds(k).length;
    return p > 0 && doneIds(k).length >= p;
  }
  function hasData(k) { var d = S.log[k]; return !!d && (d.done.length || d.mood || d.energy); }

  /* ---------- streak ---------- */
  function rollover() {
    var t = today();
    if (!S.lastSeen) { S.lastSeen = t; return; }
    var k = S.lastSeen, guard = 0;
    while (k < t && guard++ < 800) {
      if (k >= S.created && !dayMet(k) && plannedIds(k).length > 0) {
        var d = rec(k, true);
        if (!d.frozen && S.freezes > 0) { S.freezes--; d.frozen = true; }
      }
      // lock in what was actually scheduled that day
      var r = S.log[k];
      if (r && !r.planned) r.planned = plannedIds(k);
      k = shift(k, 1);
    }
    S.lastSeen = t;
  }
  function streak() {
    var k = today(), n = 0, guard = 0;
    if (!dayMet(k)) k = shift(k, -1);
    while (guard++ < 2000) {
      if (dayMet(k)) n++;
      else if (S.log[k] && S.log[k].frozen) { /* protected, streak survives */ }
      else break;
      if (k < S.created) break;
      k = shift(k, -1);
    }
    return n;
  }
  function questStreak(id) {
    var k = today(), n = 0, guard = 0;
    var hit = function (key) { var d = S.log[key]; return !!d && d.done.indexOf(id) >= 0; };
    var due = function (key) { var q = byId(id); return q && q.days.indexOf(weekday(key)) >= 0; };
    if (!hit(k)) k = shift(k, -1);
    while (guard++ < 400) {
      if (!due(k)) { k = shift(k, -1); continue; }
      if (hit(k)) n++; else break;
      if (k < S.created) break;
      k = shift(k, -1);
    }
    return n;
  }

  /* ---------- levels ---------- */
  function need(l) { return 80 + 20 * l; }
  function level(xp) {
    var l = 1, r = xp || 0;
    while (r >= need(l) && l < 999) { r -= need(l); l++; }
    return { l: l, r: r, n: need(l) };
  }
  function stage(l) {
    var s = STAGES[0];
    for (var i = 0; i < STAGES.length; i++) if (l >= STAGES[i].min) s = STAGES[i];
    return s.k;
  }
  function statLevel(xp) { return Math.floor((xp || 0) / 120) + 1; }

  /* ---------- boss ---------- */
  function ensureBoss() {
    var wk = mondayOf(today());
    if (S.boss && S.boss.week === wk) return;
    var weekly = 0;
    for (var i = 0; i < 7; i++) {
      var k = shift(wk, i);
      scheduled(k).forEach(function (q) { weekly += (DIFF[q.diff] || DIFF.med).xp; });
    }
    var max = Math.max(140, Math.round(weekly * 0.68));
    var idx = Math.floor(parse(wk).getTime() / 6048e5) % BOSSES.length;
    S.boss = { week: wk, idx: idx, max: max, hp: max, dead: false };
  }

  /* ---------- totals for achievements & coach ---------- */
  function totals() {
    var t = { done: 0, perfect: 0, days: 0, focusMin: 0, focusCount: S.focus.length, journal: 0, early: 0 };
    Object.keys(S.log).forEach(function (k) {
      var d = S.log[k];
      t.done += d.done.length;
      if (d.done.length) t.days++;
      if (perfect(k)) t.perfect++;
      var first = firstHour(k);
      if (first !== null && first < 8) t.early++;
    });
    S.focus.forEach(function (f) { t.focusMin += f.min; });
    t.journal = Object.keys(S.journal).length;
    return t;
  }
  function firstHour(k) {
    var d = S.log[k]; if (!d) return null;
    var ts = Object.keys(d.earn).map(function (id) { return d.earn[id].t; }).filter(Boolean);
    if (!ts.length) return null;
    var m = Math.min.apply(null, ts), dt = new Date(m);
    return dt.getHours() + dt.getMinutes() / 60;
  }

  var ACH = [
    { id: 'first',    n: 'First Step',     d: 'Finish your first quest',            c: 20,  t: function (x) { return x.done >= 1; } },
    { id: 'q25',      n: 'Getting Real',   d: 'Finish 25 quests',                   c: 40,  t: function (x) { return x.done >= 25; } },
    { id: 'q100',     n: 'Century',        d: 'Finish 100 quests',                  c: 90,  t: function (x) { return x.done >= 100; } },
    { id: 'q500',     n: 'Five Hundred',   d: 'Finish 500 quests',                  c: 250, t: function (x) { return x.done >= 500; } },
    { id: 'd3',       n: 'Momentum',       d: 'Reach a 3 day streak',               c: 25,  t: function (x) { return x.streak >= 3; } },
    { id: 'd7',       n: 'One Full Week',  d: 'Reach a 7 day streak',               c: 60,  t: function (x) { return x.streak >= 7; } },
    { id: 'd30',      n: 'A Month Deep',   d: 'Reach a 30 day streak',              c: 200, t: function (x) { return x.streak >= 30; } },
    { id: 'd100',     n: 'Triple Digits',  d: 'Reach a 100 day streak',             c: 600, t: function (x) { return x.streak >= 100; } },
    { id: 'perfect1', n: 'Clean Sweep',    d: 'Finish every quest in one day',      c: 40,  t: function (x) { return x.perfect >= 1; } },
    { id: 'perfect10',n: 'Ten Sweeps',     d: 'Ten clean sweep days',               c: 140, t: function (x) { return x.perfect >= 10; } },
    { id: 'lv5',      n: 'Scout',          d: 'Reach level 5',                      c: 50,  t: function (x) { return x.level >= 5; } },
    { id: 'lv10',     n: 'Ranger',         d: 'Reach level 10',                     c: 110, t: function (x) { return x.level >= 10; } },
    { id: 'lv20',     n: 'Champion',       d: 'Reach level 20',                     c: 240, t: function (x) { return x.level >= 20; } },
    { id: 'lv35',     n: 'Mythic',         d: 'Reach level 35',                     c: 500, t: function (x) { return x.level >= 35; } },
    { id: 'boss1',    n: 'Boss Slayer',    d: 'Defeat a weekly boss',               c: 60,  t: function (x) { return x.bossWins >= 1; } },
    { id: 'boss5',    n: 'Five Bosses',    d: 'Defeat five weekly bosses',          c: 180, t: function (x) { return x.bossWins >= 5; } },
    { id: 'focus1',   n: 'First Session',  d: 'Finish one focus session',           c: 20,  t: function (x) { return x.focusCount >= 1; } },
    { id: 'focus25',  n: 'Deep Worker',    d: 'Finish 25 focus sessions',           c: 110, t: function (x) { return x.focusCount >= 25; } },
    { id: 'focus10h', n: 'Ten Hours',      d: 'Ten hours of focused time',          c: 150, t: function (x) { return x.focusMin >= 600; } },
    { id: 'journal7', n: 'Seven Entries',  d: 'Write seven journal entries',        c: 70,  t: function (x) { return x.journal >= 7; } },
    { id: 'journal30',n: 'Thirty Entries', d: 'Write thirty journal entries',       c: 180, t: function (x) { return x.journal >= 30; } },
    { id: 'early10',  n: 'Early Start',    d: 'Start before 8 AM on ten days',      c: 100, t: function (x) { return x.early >= 10; } },
    { id: 'shop5',    n: 'Dressed Up',     d: 'Own five shop items',                c: 50,  t: function (x) { return x.inv >= 7; } },
    { id: 'rich',     n: 'Treasury',       d: 'Hold 500 coins at once',             c: 80,  t: function (x) { return x.coins >= 500; } }
  ];
  function achSnapshot() {
    var t = totals();
    return {
      done: t.done, perfect: t.perfect, focusCount: t.focusCount, focusMin: t.focusMin,
      journal: t.journal, early: t.early, streak: streak(), level: level(S.xp).l,
      bossWins: S.bossWins, inv: S.inv.length, coins: S.coins
    };
  }
  function checkAchievements() {
    var snap = achSnapshot(), won = [];
    ACH.forEach(function (a) {
      if (S.achievements[a.id]) return;
      if (a.t(snap)) { S.achievements[a.id] = today(); S.coins += a.c; won.push(a); }
    });
    return won;
  }

  Q.K = { STAT: STAT, STAT_KEYS: STAT_KEYS, DIFF: DIFF, SLOTS: SLOTS, DAY_SHORT: DAY_SHORT, DAY_LETTER: DAY_LETTER,
    MOODS: MOODS, ENERGY: ENERGY, PALETTES: PALETTES, BOSSES: BOSSES, FUR: FUR, ITEMS: ITEMS,
    TEMPLATES: TEMPLATES, FOCUS_AREAS: FOCUS_AREAS, PROMPTS: PROMPTS, ACH: ACH };
  Q.d = { pad: pad, ymd: ymd, parse: parse, shift: shift, weekday: weekday, today: today, mondayOf: mondayOf, pretty: pretty, clockOf: clockOf };
  Q.db = {
    hydrate: hydrate, save: save, fresh: fresh, upgrade: upgrade, KEY: KEY,
    live: live, byId: byId, scheduled: scheduled, rec: rec, plannedIds: plannedIds, doneIds: doneIds,
    goalFor: goalFor, ratio: ratio, dayMet: dayMet, perfect: perfect, hasData: hasData,
    rollover: rollover, streak: streak, questStreak: questStreak,
    need: need, level: level, stage: stage, statLevel: statLevel,
    ensureBoss: ensureBoss, totals: totals, firstHour: firstHour, checkAchievements: checkAchievements
  };
  Q.set = function (next) { S = next; Q.S = S; };
})(window.Q);
