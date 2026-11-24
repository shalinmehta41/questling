/* Questling — SVG art: companion, scenes, bosses, icons, charts. */
(function (Q) {
  'use strict';
  var UID = 0, FUR = Q.K.FUR;
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* ---------------- scenes ---------------- */
  function scene(id, u) {
    var sky = function (a, b) {
      return '<defs><linearGradient id="sk' + u + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + a + '"/><stop offset="1" stop-color="' + b + '"/></linearGradient></defs><rect width="320" height="220" fill="url(#sk' + u + ')"/>';
    };
    if (id === 'dawn') {
      return sky('#F09A72', '#FCE7BC') +
        '<circle cx="236" cy="150" r="38" fill="#FFE9A8" opacity=".95"/><circle cx="236" cy="150" r="54" fill="#FFE9A8" opacity=".25"/>' +
        '<path d="M0 162 Q70 128 150 158 T320 146 V220 H0Z" fill="#7C9A72"/>' +
        '<path d="M0 182 Q90 156 190 180 T320 172 V220 H0Z" fill="#62805C"/><rect y="200" width="320" height="20" fill="#4E6B4C"/>';
    }
    if (id === 'night') {
      var st = '';
      [[28,30,2],[82,58,1.3],[132,22,1.8],[198,42,1.3],[268,26,2],[292,78,1.4],[48,108,1.3],[238,96,1.7],[168,68,1.2],[112,92,1.4],[14,72,1.2]]
        .forEach(function (p) { st += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="' + p[2] + '" fill="#FFF6C9" opacity=".9"/>'; });
      return sky('#0E1838', '#30406F') + st +
        '<circle cx="260" cy="50" r="21" fill="#F6EBC0"/><circle cx="269" cy="44" r="18" fill="#182449"/>' +
        '<path d="M0 176 Q90 150 170 174 T320 164 V220 H0Z" fill="#223A5C"/><rect y="198" width="320" height="22" fill="#18293F"/>';
    }
    if (id === 'gym') {
      return '<rect width="320" height="220" fill="#3C4C54"/><rect y="38" width="320" height="3" fill="#33424A"/>' +
        '<rect x="208" y="54" width="92" height="70" rx="5" fill="#9CC7D8" opacity=".9"/><path d="M254 54V124M208 89H300" stroke="#3C4C54" stroke-width="5"/>' +
        '<rect x="16" y="120" width="104" height="7" rx="3.5" fill="#AAB6BD"/>' +
        '<rect x="24" y="102" width="10" height="42" rx="4" fill="#E4572E"/><rect x="37" y="109" width="8" height="28" rx="3" fill="#C9D2D7"/>' +
        '<rect x="102" y="102" width="10" height="42" rx="4" fill="#E4572E"/><rect x="91" y="109" width="8" height="28" rx="3" fill="#C9D2D7"/>' +
        '<rect y="194" width="320" height="26" fill="#242E34"/>';
    }
    if (id === 'library') {
      var b = '', cols = ['#C0453A', '#3B82C4', '#E39E0F', '#3DA35D', '#7C5CC4', '#E8DCC8'];
      [24, 80, 136].forEach(function (y, r) {
        var x = 12;
        for (var i = 0; i < 13; i++) {
          var w = 10 + ((i * 7 + r * 5) % 9), h = 28 + ((i * 11 + r * 3) % 18);
          b += '<rect x="' + x + '" y="' + (y + 46 - h) + '" width="' + w + '" height="' + h + '" rx="1.5" fill="' + cols[(i + r) % 6] + '"/>';
          x += w + 2;
        }
        b += '<rect x="6" y="' + (y + 46) + '" width="308" height="6" rx="2" fill="#5A3F2A"/>';
      });
      return '<rect width="320" height="220" fill="#8A6444"/>' + b + '<rect y="194" width="320" height="26" fill="#4A3322"/>';
    }
    if (id === 'shore') {
      return sky('#AEE0E8', '#E9F6F2') +
        '<circle cx="64" cy="44" r="20" fill="#FFF0B8"/>' +
        '<path d="M0 148 H320 V186 H0Z" fill="#6FB8C9"/><path d="M0 160 q30 -7 60 0 t60 0 t60 0 t60 0 t60 0" stroke="#A9DCE6" stroke-width="3" fill="none" opacity=".8"/>' +
        '<path d="M0 176 q30 -6 60 0 t60 0 t60 0 t60 0 t60 0" stroke="#CDEBF0" stroke-width="3" fill="none" opacity=".7"/>' +
        '<path d="M0 186 Q160 176 320 186 V220 H0Z" fill="#EEDCB4"/><rect y="206" width="320" height="14" fill="#E0CCA2"/>';
    }
    if (id === 'summit') {
      return sky('#2B3F6B', '#E88A6B') +
        '<circle cx="246" cy="62" r="26" fill="#FFD98A"/>' +
        '<path d="M-10 190 L70 74 L120 134 L170 60 L250 190Z" fill="#43527E"/>' +
        '<path d="M70 74 L92 100 L80 106 L58 98Z" fill="#E8EFF6"/><path d="M170 60 L194 90 L178 96 L156 86Z" fill="#E8EFF6"/>' +
        '<path d="M-10 196 Q160 178 330 196 V220 H-10Z" fill="#32406A"/>';
    }
    return sky('#C2E5E1', '#ECF7EF') +
      '<circle cx="56" cy="48" r="23" fill="#FFE08A"/><circle cx="56" cy="48" r="34" fill="#FFE08A" opacity=".25"/>' +
      '<path d="M0 158 Q80 118 170 154 T320 144 V220 H0Z" fill="#9AD08A"/>' +
      '<path d="M0 178 Q100 148 200 176 T320 170 V220 H0Z" fill="#78B86A"/><rect y="198" width="320" height="22" fill="#5FA356"/>';
  }

  /* ---------------- companion ---------------- */
  function creature(o) {
    var e = o.equip, f = FUR[e.fur] || FUR.moss, m = o.mood, u = o.uid, D = '#1B2B2F', s = '';
    var st = 'stroke="' + D + '" stroke-width="3.5" fill="none" stroke-linecap="round"';
    s += '<defs>' +
      '<radialGradient id="bd' + u + '" cx="38%" cy="28%" r="78%"><stop offset="0" stop-color="' + f[1] + '"/><stop offset="0.52" stop-color="' + f[0] + '"/><stop offset="1" stop-color="' + f[3] + '"/></radialGradient>' +
      '<radialGradient id="hd' + u + '" cx="36%" cy="24%" r="80%"><stop offset="0" stop-color="' + f[1] + '"/><stop offset="0.5" stop-color="' + f[0] + '"/><stop offset="1" stop-color="' + f[3] + '"/></radialGradient>' +
      '<radialGradient id="au' + u + '" cx="50%" cy="50%" r="50%"><stop offset="0.5" stop-color="#FFE08A" stop-opacity=".65"/><stop offset="1" stop-color="#FFE08A" stop-opacity="0"/></radialGradient>' +
      '</defs>';
    if (o.stage === 'Champion' || o.stage === 'Mythic') s += '<circle cx="100" cy="104" r="98" fill="url(#au' + u + ')"/>';
    if (o.stage === 'Mythic') {
      s += '<g class="wings"><path d="M58 112 Q6 74 16 36 Q44 64 64 92Z" fill="' + f[1] + '" opacity=".85"/><path d="M142 112 Q194 74 184 36 Q156 64 136 92Z" fill="' + f[1] + '" opacity=".85"/></g>';
    }
    if (o.stage === 'Ranger' || o.stage === 'Champion' || o.stage === 'Mythic') {
      s += '<path d="M62 118 Q38 162 50 182 L150 182 Q162 162 138 118 Z" fill="#B8433A"/><path d="M62 118 Q100 134 138 118 L140 126 Q100 142 60 126Z" fill="#9A362E"/>';
    }
    s += '<g class="tail"><path d="M140 152 Q186 152 178 110 Q172 136 146 136 Z" fill="' + f[3] + '"/><path d="M146 148 Q176 146 172 120" stroke="' + f[1] + '" stroke-width="3" fill="none" opacity=".7"/></g>';
    s += '<ellipse cx="78" cy="173" rx="17" ry="9.5" fill="' + f[3] + '"/><ellipse cx="122" cy="173" rx="17" ry="9.5" fill="' + f[3] + '"/>';
    s += '<g class="breath"><ellipse cx="100" cy="136" rx="45" ry="41" fill="url(#bd' + u + ')"/><ellipse cx="100" cy="146" rx="27" ry="26" fill="' + f[1] + '" opacity=".92"/></g>';
    s += '<g class="ear l"><path d="M58 70 L53 26 L91 52 Z" fill="' + f[0] + '"/><path d="M64 62 L62 40 L81 53 Z" fill="' + f[2] + '"/></g>' +
         '<g class="ear r"><path d="M142 70 L147 26 L109 52 Z" fill="' + f[0] + '"/><path d="M136 62 L138 40 L119 53 Z" fill="' + f[2] + '"/></g>';
    s += '<ellipse cx="100" cy="92" rx="53" ry="45" fill="url(#hd' + u + ')"/>';
    s += '<ellipse cx="67" cy="105" rx="10" ry="6.5" fill="' + f[2] + '" opacity=".55"/><ellipse cx="133" cy="105" rx="10" ry="6.5" fill="' + f[2] + '" opacity=".55"/>';
    if (m === 'sleepy') s += '<path d="M73 93 Q82 100 91 93" ' + st + '/><path d="M109 93 Q118 100 127 93" ' + st + '/>';
    else if (m === 'great') s += '<path d="M73 96 Q82 83 91 96" ' + st + '/><path d="M109 96 Q118 83 127 96" ' + st + '/>';
    else {
      s += '<g class="eyes"><ellipse cx="82" cy="92" rx="7" ry="7.5" fill="' + D + '"/><ellipse cx="118" cy="92" rx="7" ry="7.5" fill="' + D + '"/>' +
        '<circle cx="84.6" cy="89" r="2.4" fill="#fff"/><circle cx="120.6" cy="89" r="2.4" fill="#fff"/>' +
        '<circle cx="79.4" cy="95.6" r="1.2" fill="#fff" opacity=".65"/><circle cx="115.4" cy="95.6" r="1.2" fill="#fff" opacity=".65"/></g>';
      if (m === 'sad') s += '<path d="M73 83 L91 77" ' + st + '/><path d="M127 83 L109 77" ' + st + '/>';
    }
    s += '<ellipse cx="100" cy="102" rx="5" ry="3.4" fill="' + D + '"/>';
    if (m === 'great') s += '<path d="M87 108 Q100 128 113 108 Z" fill="#7A2E3A"/><path d="M94 122 Q100 127 106 122" fill="#E5737F"/>';
    else if (m === 'good') s += '<path d="M89 109 Q100 120 111 109" ' + st + '/>';
    else if (m === 'sad') s += '<path d="M91 116 Q100 108 109 116" ' + st + '/>';
    else if (m === 'sleepy') s += '<ellipse cx="100" cy="112" rx="4.5" ry="3.4" fill="' + D + '"/>';
    else s += '<path d="M91 111 Q100 116 109 111" ' + st + '/>';
    if (e.face === 'glasses') s += '<g fill="none" stroke="' + D + '" stroke-width="3"><circle cx="82" cy="92" r="14"/><circle cx="118" cy="92" r="14"/><path d="M96 91 H104"/></g>';
    if (e.face === 'shades') s += '<rect x="65" y="81" width="34" height="21" rx="9" fill="#12181B"/><rect x="101" y="81" width="34" height="21" rx="9" fill="#12181B"/><path d="M97 88 H103" stroke="#12181B" stroke-width="4"/><path d="M71 86 L80 86" stroke="#6C7A84" stroke-width="2.5" stroke-linecap="round"/><path d="M107 86 L116 86" stroke="#6C7A84" stroke-width="2.5" stroke-linecap="round"/>';
    if (e.face === 'visor') s += '<path d="M58 78 Q100 66 142 78 L142 98 Q100 110 58 98Z" fill="#1E3A4C" opacity=".92"/><path d="M62 82 Q100 72 138 82" stroke="#64E0C8" stroke-width="2.5" fill="none"/>';
    if (e.scarf) {
      var sc = { red: '#D9534F', teal: '#2FA39B', gold: '#E8A317', storm: '#44506B' }[e.scarf];
      s += '<path d="M59 126 Q100 151 141 126 L143 141 Q100 168 57 141 Z" fill="' + sc + '"/><path d="M122 147 L135 180 L118 180 L109 153 Z" fill="' + sc + '"/>';
      if (e.scarf === 'storm') s += '<path d="M57 141 Q100 168 143 141 L146 186 Q100 200 54 186Z" fill="' + sc + '" opacity=".55"/>';
    }
    if (e.hat === 'beanie') s += '<path d="M55 70 Q57 20 100 18 Q143 20 145 70 Z" fill="#2F6FB5"/><rect x="51" y="61" width="98" height="15" rx="7.5" fill="#27598F"/><circle cx="100" cy="16" r="8.5" fill="#E8EEF2"/>';
    if (e.hat === 'band') s += '<path d="M49 76 Q100 55 151 76" stroke="#E4572E" stroke-width="10" fill="none" stroke-linecap="round"/><path d="M150 71 L166 60 M150 78 L168 84" stroke="#E4572E" stroke-width="6" stroke-linecap="round"/>';
    if (e.hat === 'cap') s += '<path d="M56 70 Q58 26 100 24 Q142 26 144 70 Z" fill="#2E8B7A"/><path d="M52 70 Q46 56 36 58 Q40 72 52 74Z" fill="#24705F"/><circle cx="100" cy="24" r="5" fill="#1D5B4E"/>';
    if (e.hat === 'helmet') s += '<path d="M49 80 Q49 28 100 26 Q151 28 151 80 Z" fill="#8A97A3"/><rect x="47" y="71" width="106" height="11" rx="5.5" fill="#6B7884"/><path d="M100 26 V62" stroke="#B7C2CC" stroke-width="7"/><circle cx="100" cy="22" r="5" fill="#C0453A"/>';
    if (e.hat === 'wizard') s += '<path d="M61 68 L103 2 L141 68 Z" fill="#5B4BB5"/><ellipse cx="100" cy="68" rx="55" ry="11" fill="#4A3C9C"/><circle cx="107" cy="36" r="5.5" fill="#F5C84A"/><circle cx="94" cy="50" r="3" fill="#F5C84A" opacity=".8"/>';
    if (e.hat === 'halo') s += '<ellipse cx="100" cy="26" rx="34" ry="9" fill="none" stroke="#FFE08A" stroke-width="6"/><ellipse cx="100" cy="26" rx="34" ry="9" fill="none" stroke="#FFF7DC" stroke-width="2"/>';
    if (e.hat === 'crown') s += '<path d="M63 64 L67 30 L84 50 L100 24 L116 50 L133 30 L137 64 Z" fill="#F2B632" stroke="#C48A12" stroke-width="2"/><circle cx="100" cy="26" r="4.5" fill="#E4572E"/><circle cx="70" cy="33" r="3" fill="#3B82C4"/><circle cx="130" cy="33" r="3" fill="#3DA35D"/>';
    if (m === 'great') {
      var sp = function (x, y, r) { return '<path class="twk" style="--d:' + r + 's" d="M' + x + ' ' + y + ' l3.4 9 9 3.4 -9 3.4 -3.4 9 -3.4 -9 -9 -3.4 9 -3.4z" fill="#F5C84A"/>'; };
      s += sp(20, 58, 0) + sp(168, 38, -0.8) + sp(178, 102, -1.6);
    }
    return s;
  }

  var SCALE = { Hatchling: 0.84, Scout: 0.92, Ranger: 1, Champion: 1.05, Mythic: 1.1 };
  function companion(o) {
    var u = ++UID, sc = SCALE[o.stage] || 1, tx = 160 - 100 * sc, ty = 200 - 182 * sc;
    var n = Date.now();
    var ph = '--p1:-' + (n % 3400) + 'ms;--p2:-' + (n % 2800) + 'ms;--p3:-' + (n % 6000) + 'ms;--p4:-' + (n % 5200) + 'ms';
    return '<svg class="sceneSvg" viewBox="0 0 320 220" role="img" style="' + ph + '" aria-label="' + esc(o.label || 'Your companion') + '">' +
      scene(o.equip.bg, u) +
      '<ellipse cx="160" cy="199" rx="55" ry="7.5" fill="#000" opacity=".2"/>' +
      '<g transform="translate(' + tx + ',' + ty + ') scale(' + sc + ')"><g class="bob"><g class="hop">' +
      creature({ equip: o.equip, mood: o.mood, stage: o.stage, uid: u }) +
      '</g></g></g></svg>';
  }

  function boss(c, dead, size) {
    size = size || 78;
    return '<svg class="b" viewBox="0 0 110 110" width="' + size + '" height="' + size + '" aria-hidden="true">' +
      '<defs><radialGradient id="bg' + (++UID) + '" cx="38%" cy="26%" r="80%"><stop offset="0" stop-color="#ffffff" stop-opacity=".32"/><stop offset="1" stop-color="#000000" stop-opacity=".22"/></radialGradient></defs>' +
      '<path d="M16 100 V50 Q16 6 55 6 Q94 6 94 50 V100 L80 89 L67 100 L55 89 L43 100 L30 89 Z" fill="' + c + '"/>' +
      '<path d="M16 100 V50 Q16 6 55 6 Q94 6 94 50 V100 L80 89 L67 100 L55 89 L43 100 L30 89 Z" fill="url(#bg' + UID + ')"/>' +
      (dead
        ? '<path d="M35 45 l13 13 M48 45 l-13 13 M62 45 l13 13 M75 45 l-13 13" stroke="#fff" stroke-width="4.5" stroke-linecap="round"/><path d="M41 80 Q55 88 69 80" stroke="#1B2B2F" stroke-width="4" fill="none" stroke-linecap="round"/>'
        : '<ellipse cx="42" cy="52" rx="9.5" ry="10.5" fill="#fff"/><ellipse cx="68" cy="52" rx="9.5" ry="10.5" fill="#fff"/>' +
          '<circle cx="44" cy="55" r="4.8" fill="#1B2B2F"/><circle cx="66" cy="55" r="4.8" fill="#1B2B2F"/>' +
          '<path d="M29 37 L50 44 M81 37 L60 44" stroke="#1B2B2F" stroke-width="4.5" stroke-linecap="round"/>' +
          '<path d="M42 79 Q55 70 68 79" stroke="#1B2B2F" stroke-width="4" fill="none" stroke-linecap="round"/>') +
      '</svg>';
  }

  /* ---------------- icons ---------------- */
  function ic(p, w) {
    return '<svg width="' + (w || 22) + '" height="' + (w || 22) + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + p + '</svg>';
  }
  var ICON = {
    today: ic('<path d="M4 11l8-7 8 7v9H4z"/><path d="M10 20v-6h4v6"/>'),
    focus: ic('<circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/>'),
    coach: ic('<path d="M3 17l5-5 4 3 6-7"/><path d="M15 8h4v4"/>'),
    progress: ic('<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>'),
    more: ic('<circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/>'),
    quests: ic('<path d="M5 4h11l3 3v13H5z"/><path d="M9 11l2 2 4-4M9 17h6"/>'),
    shop: ic('<path d="M5 8h14l-1 12H6z"/><path d="M9 8a3 3 0 0 1 6 0"/>'),
    journal: ic('<path d="M6 3h12v18l-6-3-6 3z"/><path d="M9 8h6M9 12h4"/>'),
    trophy: ic('<path d="M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M7 6H4v2a3 3 0 0 0 3 3M17 6h3v2a3 3 0 0 1-3 3"/><path d="M10 19h4M12 14v5"/>'),
    settings: ic('<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>'),
    help: ic('<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3 2.5v1.5"/><circle cx="12" cy="17" r="1" fill="currentColor" stroke="none"/>'),
    back: ic('<path d="M15 5l-7 7 7 7"/>'),
    plus: ic('<path d="M12 5v14M5 12h14"/>'),
    play: ic('<path d="M7 4l12 8-12 8z" fill="currentColor" stroke="none"/>'),
    pause: ic('<path d="M8 5v14M16 5v14" stroke-width="3"/>'),
    stop: ic('<rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor" stroke="none"/>'),
    bell: ic('<path d="M6 9a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6z"/><path d="M10 19a2 2 0 0 0 4 0"/>', 18),
    snow: ic('<path d="M12 3v18M4.5 7.5l15 9M19.5 7.5l-15 9"/>', 14),
    flame: '<svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2c1 4 6 6 6 12a6 6 0 0 1-12 0c0-3 2-4 3-6 1 2 2 2 2 0 0-2 0-4 1-6z" fill="var(--c-flame)"/></svg>',
    coin: '<svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="var(--c-gold)"/><circle cx="12" cy="12" r="6" fill="none" stroke="var(--surface)" stroke-width="2" opacity=".55"/></svg>',
    check: '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="var(--accent-ink)" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
    up: ic('<path d="M12 19V5M6 11l6-6 6 6"/>', 16),
    down: ic('<path d="M12 5v14M6 13l6 6 6-6"/>', 16),
    spark: ic('<path d="M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2z"/>', 16)
  };

  /* ---------------- charts ----------------
     One scale per chart, recessive grid, direct labels, theme tokens for text. */
  function ring(pct, size, stroke, label, sub) {
    var r = (size - stroke) / 2, c = 2 * Math.PI * r, off = c * (1 - Math.max(0, Math.min(1, pct)));
    return '<svg class="ring" viewBox="0 0 ' + size + ' ' + size + '" width="' + size + '" height="' + size + '" role="img" aria-label="' + esc(label + ' ' + Math.round(pct * 100) + ' percent') + '">' +
      '<circle cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + r + '" fill="none" stroke="var(--surface2)" stroke-width="' + stroke + '"/>' +
      '<circle class="rv" cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + r + '" fill="none" stroke="var(--accent)" stroke-width="' + stroke + '" stroke-linecap="round" stroke-dasharray="' + c.toFixed(1) + '" stroke-dashoffset="' + off.toFixed(1) + '" transform="rotate(-90 ' + size / 2 + ' ' + size / 2 + ')"/>' +
      '<text x="50%" y="48%" text-anchor="middle" class="rt">' + label + '</text>' +
      (sub ? '<text x="50%" y="68%" text-anchor="middle" class="rs">' + esc(sub) + '</text>' : '') +
      '</svg>';
  }

  /* area+line, single series, with hover crosshair handled in app.js */
  function trend(points, opt) {
    opt = opt || {};
    var W = 320, H = 132, pl = opt.padLeft || 30, pr = 12, pt = 12, pb = 24;
    var iw = W - pl - pr, ih = H - pt - pb;
    var max = opt.max != null ? opt.max : Math.max(1, Math.max.apply(null, points.map(function (p) { return p.v; })));
    var n = points.length;
    var X = function (i) { return pl + (n <= 1 ? iw / 2 : i * iw / (n - 1)); };
    var Y = function (v) { return pt + ih - (v / max) * ih; };
    var g = '', ticks = opt.ticks || [0, max / 2, max];
    ticks.forEach(function (t) {
      g += '<line x1="' + pl + '" y1="' + Y(t).toFixed(1) + '" x2="' + (W - pr) + '" y2="' + Y(t).toFixed(1) + '" class="grid"/>' +
        '<text x="' + (pl - 6) + '" y="' + (Y(t) + 3.5).toFixed(1) + '" text-anchor="end" class="ax">' + (opt.fmt ? opt.fmt(t) : Math.round(t)) + '</text>';
    });
    var d = points.map(function (p, i) { return (i ? 'L' : 'M') + X(i).toFixed(1) + ' ' + Y(p.v).toFixed(1); }).join(' ');
    var area = d + ' L' + X(n - 1).toFixed(1) + ' ' + Y(0).toFixed(1) + ' L' + X(0).toFixed(1) + ' ' + Y(0).toFixed(1) + ' Z';
    var lab = '';
    points.forEach(function (p, i) {
      if (p.lab) lab += '<text x="' + X(i).toFixed(1) + '" y="' + (H - 7) + '" text-anchor="middle" class="ax">' + esc(p.lab) + '</text>';
    });
    var last = n - 1;
    return '<svg class="chart" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(opt.label || 'Trend') + '">' +
      '<defs><linearGradient id="fa' + (++UID) + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--accent)" stop-opacity=".30"/><stop offset="1" stop-color="var(--accent)" stop-opacity="0"/></linearGradient></defs>' +
      g + '<path d="' + area + '" fill="url(#fa' + UID + ')"/>' +
      '<path class="cl" d="' + d + '" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>' +
      (n ? '<circle cx="' + X(last).toFixed(1) + '" cy="' + Y(points[last].v).toFixed(1) + '" r="4.5" fill="var(--accent)" stroke="var(--surface)" stroke-width="2"/>' : '') +
      lab + '</svg>';
  }

  function radar(vals, labels) {
    var W = 280, H = 214, cx = 140, cy = 96, R = 64;
    var n = vals.length, max = Math.max(1, Math.max.apply(null, vals));
    var pt = function (i, r) {
      var a = -Math.PI / 2 + i * 2 * Math.PI / n;
      return [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
    };
    var rings = '';
    [0.33, 0.66, 1].forEach(function (f) {
      var p = []; for (var i = 0; i < n; i++) p.push(pt(i, R * f).map(function (x) { return x.toFixed(1); }).join(','));
      rings += '<polygon points="' + p.join(' ') + '" class="grid" fill="none"/>';
    });
    var spokes = '', labs = '', poly = [];
    for (var i = 0; i < n; i++) {
      var o = pt(i, R), v = pt(i, R * (vals[i] / max));
      spokes += '<line x1="' + cx + '" y1="' + cy + '" x2="' + o[0].toFixed(1) + '" y2="' + o[1].toFixed(1) + '" class="grid"/>';
      poly.push(v[0].toFixed(1) + ',' + v[1].toFixed(1));
      var lp = pt(i, R + 20);
      var anchor = Math.abs(lp[0] - cx) < 6 ? 'middle' : (lp[0] > cx ? 'start' : 'end');
      var above = lp[1] < cy - 10;
      var ty = above ? lp[1] - 4 : lp[1] + 8;
      labs += '<text x="' + lp[0].toFixed(1) + '" y="' + ty.toFixed(1) + '" text-anchor="' + anchor + '" class="ax strong">' + esc(labels[i]) + '</text>' +
        '<text x="' + lp[0].toFixed(1) + '" y="' + (ty + 13).toFixed(1) + '" text-anchor="' + anchor + '" class="ax">Lv ' + vals[i] + '</text>';
    }
    return '<svg class="chart radar" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Stat levels: ' + esc(labels.map(function (l, j) { return l + ' level ' + vals[j]; }).join(', ')) + '">' +
      rings + spokes + '<polygon class="rp" points="' + poly.join(' ') + '" fill="var(--accent)" fill-opacity=".26" stroke="var(--accent)" stroke-width="2" stroke-linejoin="round"/>' + labs + '</svg>';
  }

  Q.art = { esc: esc, scene: scene, creature: creature, companion: companion, boss: boss, ICON: ICON, ring: ring, trend: trend, radar: radar };
})(window.Q);
