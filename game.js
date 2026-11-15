/* =========================================================
   Cuisine Quest
   A click-to-cook game: travel the world city by city with
   Chef Cherie. This demo has the first 5 cities. Plain HTML + CSS + JavaScript, no libraries.
   All art is drawn with SVG and all music and sound effects
   are generated in code (Web Audio API).
   ========================================================= */
(() => {
'use strict';

/* =========================================================
   GAME DATA
   ========================================================= */
const INGREDIENTS = {
  // Vietnam
  noodles:  'Noodles',   beef: 'Beef',       herbs: 'Herbs',      ricepaper: 'Rice Paper', shrimp: 'Shrimp',
  // Japan
  rice:     'Rice',      salmon: 'Salmon',   nori: 'Seaweed',     wasabi: 'Wasabi',
  pork:     'Pork',      egg: 'Egg',         scallion: 'Scallion',
  // China
  wrapper:  'Wrapper',   peas: 'Peas',       baobun: 'Bao Bun',   cucumber: 'Cucumber',
  // Italy
  dough:    'Dough',     sauce: 'Sauce',     cheese: 'Cheese',    basil: 'Basil',
  pasta:    'Pasta',     meatballs: 'Meatballs', cone: 'Cone',    gelato: 'Gelato',     sprinkles: 'Sprinkles',
  // New York
  bun:      'Bun',       patty: 'Patty',     lettuce: 'Lettuce',  sausage: 'Sausage',   mustard: 'Mustard',
  bagel:    'Bagel',     icecream: 'Ice Cream', whipped: 'Whipped Cream', cherry: 'Cherry',
  // Add-ons (extra requests)
  ginger: 'Ginger', corn: 'Corn', chili: 'Chili', sesame: 'Sesame', bokchoy: 'Bok Choy',
  mushrooms: 'Mushrooms', olives: 'Olives', pepperoni: 'Pepperoni', chocolate: 'Chocolate',
  lime: 'Lime', peanut: 'Peanut Sauce',
  bacon: 'Bacon', pickles: 'Pickles', onions: 'Onions', ketchup: 'Ketchup', syrup: 'Choc Syrup',
};

// base   = main ingredient that is never left out
// addons = extras a customer may ask for ("ADD ___!")
// Every other recipe ingredient can be left out ("NO ___!").
const DISHES = {
  pho:       { name: 'Pho',          price: 12, ingredients: ['noodles', 'beef', 'herbs'],             base: ['noodles'],   addons: ['lime'],              look: 'bowl', hot: true },
  springroll:{ name: 'Spring Rolls', price: 10, ingredients: ['ricepaper', 'shrimp', 'herbs'],          base: ['ricepaper'], addons: ['peanut'],            look: 'springroll' },
  sushi:     { name: 'Sushi',        price: 14, ingredients: ['rice', 'salmon', 'nori', 'wasabi'],      base: ['rice', 'salmon'], addons: ['ginger'],      look: 'sushi' },
  ramen:     { name: 'Ramen',        price: 13, ingredients: ['noodles', 'pork', 'egg', 'scallion'],    base: ['noodles'],   addons: ['corn'],              look: 'bowl', hot: true, band: '#d9443a', broth: '#e9b979' },
  dumplings: { name: 'Dumplings',    price: 11, ingredients: ['wrapper', 'pork', 'scallion'],           base: ['wrapper', 'pork'], addons: ['chili', 'sesame'], look: 'dumplings' },
  friedrice: { name: 'Fried Rice',   price: 12, ingredients: ['rice', 'egg', 'peas'],                   base: ['rice'],      addons: ['chili', 'bokchoy', 'sesame'], look: 'friedrice', band: '#3d7fd6' },
  bao:       { name: 'Bao Buns',     price: 10, ingredients: ['baobun', 'pork', 'cucumber'],            base: ['baobun'],    addons: ['chili', 'sesame'],   look: 'bao' },
  pizza:     { name: 'Pizza',        price: 15, ingredients: ['dough', 'sauce', 'cheese', 'basil'],     base: ['dough', 'sauce'], addons: ['mushrooms', 'olives', 'pepperoni'], look: 'pizza' },
  spaghetti: { name: 'Spaghetti',    price: 14, ingredients: ['pasta', 'sauce', 'meatballs', 'cheese'], base: ['pasta', 'sauce'], addons: ['mushrooms', 'olives'], look: 'spaghetti' },
  gelato:    { name: 'Gelato',       price: 8,  ingredients: ['cone', 'gelato', 'sprinkles'],           base: ['cone', 'gelato'], addons: ['chocolate'],    look: 'gelato' },
  burger:    { name: 'Burger',       price: 15, ingredients: ['bun', 'patty', 'cheese', 'lettuce'],     base: ['bun', 'patty'], addons: ['bacon', 'pickles', 'onions', 'ketchup', 'egg'], look: 'burger' },
  hotdog:    { name: 'Hot Dog',      price: 10, ingredients: ['bun', 'sausage', 'mustard'],             base: ['bun', 'sausage'], addons: ['onions', 'ketchup', 'cheese', 'pickles'], look: 'hotdog' },
  bagel:     { name: 'Bagel',        price: 9,  ingredients: ['bagel', 'egg', 'cheese'],                base: ['bagel'],     addons: ['bacon', 'onions'],   look: 'bagel' },
  milkshake: { name: 'Milkshake',    price: 8,  ingredients: ['icecream', 'whipped', 'cherry'],         base: ['icecream'],  addons: ['syrup'],             look: 'milkshake' },
};
const removable = d => DISHES[d].ingredients.filter(i => !DISHES[d].base.includes(i));

// Tweak these numbers to make the game easier or harder.
// request = chance an order has a special request; both = chance it has a NO and an ADD
const LEVELS = [
  { id: 1, name: 'Hanoi', emoji: '🍜', theme: 'vietnam', goal: 50, dishes: ['pho', 'springroll'],
    seats: 2, spawnEvery: [6, 8], patience: 36, request: 0, both: 0, requestAt: [3],   // only the 3rd customer has a special request
    music: { tempo: 108, style: 'chip', transpose: 0 },
    tip: 'Customers only say the dish name. Check this menu!',
    intro: "Chef Cherie's quest starts in <b>Hanoi</b>! Customers only say the dish name, so check the menu board. Watch out: some customers say <b style='color:#e53935'>\"NO ___!\"</b> (leave it out) or <b style='color:#2e9e44'>\"ADD ___!\"</b> (add an extra)." },
  { id: 2, name: 'Tokyo', emoji: '🍣', theme: 'japan', goal: 70, dishes: ['sushi', 'ramen'],
    seats: 3, spawnEvery: [5.5, 7], patience: 34, request: 0.3, both: 0,
    music: { tempo: 100, style: 'koto', transpose: 2, pent: true },
    tip: '"NO ___!" = leave it out. "ADD ___!" = add it!',
    intro: 'Next stop: <b>Tokyo</b>! Make sushi and ramen. More customers, and more special requests.' },
  { id: 3, name: 'Shanghai', emoji: '🥟', theme: 'china', goal: 90, dishes: ['dumplings', 'friedrice', 'bao'],
    seats: 3, spawnEvery: [5, 6.5], patience: 33, request: 0.45, both: 0.2,
    music: { tempo: 114, style: 'pluck', transpose: -3, pent: true, block: true },
    tip: 'Read the special requests!',
    intro: 'Welcome to <b>Shanghai</b>! Three dishes, new extras like chili and sesame, and some orders now have <b>NO and ADD together</b>.' },
  { id: 4, name: 'Rome', emoji: '🍕', theme: 'italy', goal: 110, dishes: ['pizza', 'spaghetti', 'gelato'],
    seats: 3, spawnEvery: [4.5, 6], patience: 32, request: 0.55, both: 0.25,
    music: { tempo: 116, style: 'accordion', transpose: 5 },
    tip: 'Sauce and cheese go in more than one dish!',
    intro: 'Ciao, <b>Rome</b>! Pizza, spaghetti and gelato, with lots of extras. More than half the orders have special requests.' },
  { id: 5, name: 'New York', emoji: '🍔', theme: 'newyork', goal: 130, dishes: ['burger', 'hotdog', 'bagel', 'milkshake'],
    seats: 3, spawnEvery: [4, 5.5], patience: 32, request: 0.65, both: 0.35, critic: true,
    music: { tempo: 126, style: 'chip', transpose: 0, swing: 0.3 },
    tip: 'Then the critic arrives!',
    intro: 'The big city: <b>New York</b>! Four dishes, a busy kitchen, orders with <b>NO</b> and <b>ADD</b> together, and then the famous <b>food critic</b>.' },
];
const COMING_SOON = [['Seoul', '🍲'], ['Bangkok', '🍛'], ['Paris', '🥐'], ['Mexico City', '🌮'], ['Mumbai', '🫓']];
const WRONG_PENALTY = 5;

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'a', 's', 'd', 'f', 'g', 'h'];
const SAVE_KEY = 'cuisineQuest.save.v1';

/* ---------------- Helpers ---------------- */
const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
const rand = (a, b) => a + Math.random() * (b - a);
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const sameSet = (a, b) => a.length === b.length && a.every(x => b.includes(x));
function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const f = v => Math.max(0, Math.min(255, Math.round(v * (1 + amt))));
  return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`;
}
let seed = 7;
const srand = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };   // repeatable "random" for decorations

/* ---------------- Save data (stays in this browser) ---------------- */
function loadSave() {
  try {
    const s = JSON.parse(localStorage.getItem(SAVE_KEY));
    if (s && s.unlocked) return s;
  } catch (e) { /* storage not available */ }
  return { unlocked: 1, stars: {}, music: true };
}
const save = loadSave();
function writeSave() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch (e) { /* ignore */ } }

/* =========================================================
   SOUND — background song + effects, made with Web Audio.
   Same happy tune everywhere, with a different "flavor"
   (speed, instrument, scale) for each country.
   ========================================================= */
const Sound = (() => {
  let ctx = null, music, sfx, noiseBuf;
  let musicOn = save.music !== false, playing = false, step = 0, nextTime = 0, timer = null;
  let cfg = LEVELS[0].music;
  const f = m => 440 * Math.pow(2, (m - 69) / 12);

  function init() {
    if (ctx) return true;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    try { ctx = new AC(); } catch (e) { return false; }
    const master = ctx.createGain(); master.gain.value = 0.9; master.connect(ctx.destination);
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 3200; lp.connect(master);
    music = ctx.createGain(); music.gain.value = 0.5; music.connect(lp);
    sfx = ctx.createGain(); sfx.gain.value = 0.6; sfx.connect(master);
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 0.3, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return true;
  }
  function unlock() { if (!init()) return; if (ctx.state === 'suspended') ctx.resume().catch(() => {}); }

  function tone(t, freq, dur, type, vol, dest, slideTo, vib) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    if (vib) {
      const lfo = ctx.createOscillator(), lg = ctx.createGain();
      lfo.frequency.value = 5.5; lg.gain.value = vib; lfo.connect(lg); lg.connect(o.frequency);
      lfo.start(t); lfo.stop(t + dur + 0.03);
    }
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(dest); o.start(t); o.stop(t + dur + 0.03);
  }
  function noise(t, dur, vol, dest, hp) {
    const s = ctx.createBufferSource(); s.buffer = noiseBuf;
    const fl = ctx.createBiquadFilter(); fl.type = 'highpass'; fl.frequency.value = hp;
    const g = ctx.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(fl); fl.connect(g); g.connect(dest); s.start(t); s.stop(t + dur + 0.02);
  }

  // A cheerful 8-bar loop: C - G - Am - F - F - G - C - G
  const CHORDS = [[60,64,67],[55,59,62],[57,60,64],[53,57,60],[53,57,60],[55,59,62],[60,64,67],[55,59,62]];
  const _ = null;
  const MELODY = [
    76,79,84,79,76,79,81,79,  74,79,83,79,86,83,79,_,  72,76,81,76,84,81,79,76,  77,81,84,81,79,76,74,_,
    81,_,81,84,_,81,79,77,    79,_,79,83,_,86,83,79,   76,79,84,88,86,84,83,79,  81,79,77,74,79,_,_,_,
  ];
  // Pentatonic flavor (Japan / China): swap F → E and B → A
  const pent = m => (m % 12 === 5 ? m - 1 : m % 12 === 11 ? m - 2 : m);

  function lead(t, m, spb) {
    if (cfg.pent) m = pent(m);
    const fr = f(m + cfg.transpose);
    switch (cfg.style) {
      case 'koto':       // plucked, bell-like
        tone(t, fr, spb * 2.4, 'triangle', 0.14, music); tone(t, fr * 2, spb * 1.2, 'sine', 0.05, music); break;
      case 'pluck':      // bright plucked strings
        tone(t, fr, spb * 1.4, 'square', 0.045, music); tone(t, fr * 2, spb * 0.6, 'triangle', 0.05, music); break;
      case 'accordion':  // two slightly detuned reeds with vibrato
        tone(t, fr, spb * 0.95, 'sawtooth', 0.03, music, null, 4); tone(t, fr * 1.005, spb * 0.95, 'sawtooth', 0.03, music, null, 4); break;
      default:           // chiptune
        tone(t, fr, spb * 0.9, 'square', 0.05, music); tone(t, fr * 2, spb * 0.5, 'triangle', 0.025, music);
    }
  }
  function scheduleStep(s, t) {
    const spb = 60 / cfg.tempo / 2;
    const bar = Math.floor(s / 8) % 8, pos = s % 8, tr = cfg.transpose;
    const ch = CHORDS[bar].map(n => n + tr);
    if (pos % 2 === 1 && cfg.swing) t += spb * cfg.swing;
    if (pos % 2 === 0) {
      const root = ch[0] - 12;
      tone(t, f(pos % 4 === 0 ? root : root + 7), spb * 1.6, 'triangle', 0.35, music);
      if (pos % 4 === 0) tone(t, 150, 0.12, 'sine', 0.3, music, 50);
      if (cfg.block && pos === 2) tone(t, 1250, 0.04, 'sine', 0.18, music, 900);   // wood block
    } else {
      const wave = cfg.style === 'accordion' ? 'triangle' : 'square';
      ch.forEach(n => tone(t, f(n), spb * 0.8, wave, cfg.style === 'accordion' ? 0.06 : 0.025, music));
      noise(t, 0.04, 0.05, music, 7000);
    }
    const m = MELODY[s % 64];
    if (m) lead(t, m, spb);
  }
  function tick() {
    if (!playing) return;
    if (nextTime < ctx.currentTime - 0.2) nextTime = ctx.currentTime + 0.05;
    while (nextTime < ctx.currentTime + 0.15) { scheduleStep(step, nextTime); nextTime += 60 / cfg.tempo / 2; step++; }
  }
  function start() {
    unlock();
    if (!ctx || playing || !musicOn) return;
    playing = true; step = 0; nextTime = ctx.currentTime + 0.06;
    timer = setInterval(tick, 30); tick();
  }
  function stop() { playing = false; clearInterval(timer); }
  function toggle() { musicOn = !musicOn; save.music = musicOn; writeSave(); musicOn ? start() : stop(); return musicOn; }
  const play = fn => { unlock(); if (ctx) fn(ctx.currentTime + 0.01); };

  return {
    start, stop, toggle, unlock,
    setStyle: c => { cfg = c; },
    get on() { return musicOn; },
    click:   () => play(t => tone(t, 880, 0.05, 'sine', 0.15, sfx)),
    pop:     () => play(t => tone(t, 520, 0.09, 'sine', 0.35, sfx, 980)),
    nope:    () => play(t => tone(t, 220, 0.12, 'square', 0.1, sfx, 180)),
    trash:   () => play(t => { noise(t, 0.25, 0.25, sfx, 1200); tone(t, 400, 0.2, 'triangle', 0.15, sfx, 120); }),
    coin:    () => play(t => { tone(t, f(83), 0.09, 'square', 0.12, sfx); tone(t + 0.08, f(88), 0.28, 'square', 0.12, sfx); }),
    wrong:   () => play(t => { tone(t, f(52), 0.18, 'sawtooth', 0.1, sfx); tone(t + 0.16, f(49), 0.28, 'sawtooth', 0.1, sfx); }),
    angry:   () => play(t => { tone(t, f(45), 0.15, 'square', 0.12, sfx, f(43)); tone(t + 0.15, f(41), 0.3, 'square', 0.12, sfx, f(36)); }),
    bell:    () => play(t => { tone(t, f(88), 0.5, 'sine', 0.16, sfx); tone(t + 0.12, f(84), 0.6, 'sine', 0.13, sfx); }),
    fanfare: () => play(t => [67, 72, 76, 79, 84].forEach((m, i) => tone(t + i * 0.09, f(m), 0.28, 'square', 0.1, sfx))),
    win:     () => play(t => [72, 76, 79, 84].forEach((m, i) => tone(t + i * 0.12, f(m), 0.32, 'square', 0.12, sfx))),
    bigwin:  () => play(t => [72, 76, 79, 84, 79, 84, 88].forEach((m, i) => tone(t + i * 0.11, f(m), 0.36, 'square', 0.12, sfx))),
    fail:    () => play(t => [67, 64, 60, 55].forEach((m, i) => tone(t + i * 0.16, f(m), 0.36, 'triangle', 0.22, sfx))),
  };
})();

/* =========================================================
   ART: INGREDIENT ICONS (64 x 64)
   ========================================================= */
const SH = (cx = 32, cy = 52, rx = 24) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="5" fill="#000" opacity=".08"/>`;
const ICON = {
  noodles: `${SH()}<g fill="none" stroke="#e8c15a" stroke-width="5" stroke-linecap="round">
      <path d="M8 20 q6 -7 12 0 t12 0 t12 0 t12 0"/><path d="M8 30 q6 -7 12 0 t12 0 t12 0 t12 0"/><path d="M8 40 q6 -7 12 0 t12 0 t12 0 t12 0"/></g>
    <g fill="none" stroke="#fff3c4" stroke-width="2" stroke-linecap="round"><path d="M9 19 q6 -7 12 0 t12 0"/><path d="M33 39 q6 -7 12 0 t12 0"/></g>`,
  beef: `${SH()}<path d="M10 38 Q14 18 36 20 Q56 22 54 36 Q50 48 30 46 Q12 46 10 38Z" fill="#c4544a"/>
    <path d="M16 36 Q24 28 36 30 Q46 31 50 36" fill="none" stroke="#f6cfc3" stroke-width="3" stroke-linecap="round"/>
    <path d="M20 27 Q30 24 40 26" fill="none" stroke="#f6cfc3" stroke-width="2" stroke-linecap="round"/>`,
  herbs: `<path d="M32 58 L32 24" stroke="#3a8a3a" stroke-width="3" stroke-linecap="round"/>
    <ellipse cx="22" cy="30" rx="11" ry="6" transform="rotate(-35 22 30)" fill="#4caf50"/><ellipse cx="42" cy="30" rx="11" ry="6" transform="rotate(35 42 30)" fill="#5cc45f"/>
    <ellipse cx="22" cy="44" rx="10" ry="5.5" transform="rotate(-25 22 44)" fill="#3fa043"/><ellipse cx="42" cy="44" rx="10" ry="5.5" transform="rotate(25 42 44)" fill="#4caf50"/>
    <ellipse cx="32" cy="15" rx="6" ry="11" fill="#66cc66"/>`,
  ricepaper: `${SH()}<circle cx="32" cy="32" r="23" fill="#fbf3e2" stroke="#e5d3ad" stroke-width="3"/>
    <g stroke="#ecdcbb" stroke-width="1.6"><path d="M14 26 L50 26 M12 34 L52 34 M15 42 L49 42 M24 12 L24 52 M32 10 L32 54 M40 12 L40 52"/></g>`,
  shrimp: `${SH()}<path d="M46 16 Q18 12 14 34 Q12 52 32 52 Q42 52 44 44 Q32 46 28 38 Q26 26 46 26 Z" fill="#ff8a65"/>
    <path d="M22 26 L28 32 M18 34 L26 36 M20 44 L28 41" stroke="#ffccbc" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M46 16 L56 10 L54 22 Z M46 26 L56 30 L50 20Z" fill="#ff7043"/><circle cx="40" cy="21" r="2" fill="#3b2a20"/>`,
  rice: `${SH()}<path d="M8 46 Q8 20 32 18 Q56 20 56 46 Z" fill="#fff" stroke="#e6e0d4" stroke-width="2"/>
    <g fill="#ece6d8">${[[20, 34], [30, 28], [40, 33], [26, 40], [36, 41], [46, 40], [18, 42], [32, 22]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="3" ry="1.6"/>`).join('')}</g>`,
  salmon: `${SH()}<rect x="8" y="22" width="48" height="22" rx="7" fill="#ff8a5b"/>
    <path d="M16 23 L24 43 M28 23 L36 43 M40 23 L48 43" stroke="#ffd2bd" stroke-width="3.5"/>`,
  nori: `<rect x="12" y="12" width="40" height="40" rx="4" fill="#2e4a35"/><path d="M16 22 L48 20 M16 32 L48 31 M16 42 L48 43" stroke="#3f6449" stroke-width="2"/>`,
  wasabi: `${SH(32, 50, 18)}<path d="M16 46 Q10 30 24 26 Q28 14 40 20 Q54 22 50 36 Q52 48 36 48Z" fill="#8cc63f"/><ellipse cx="28" cy="32" rx="5" ry="3" fill="#b5e07a"/>`,
  pork: `${SH()}<circle cx="32" cy="32" r="21" fill="#f1b9a3" stroke="#a7563d" stroke-width="5"/>
    <path d="M32 32 m-9 0 a9 9 0 1 1 9 9" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".8"/>`,
  egg: `${SH()}<ellipse cx="32" cy="32" rx="19" ry="23" fill="#fff" stroke="#ece6dc" stroke-width="2"/><circle cx="32" cy="35" r="11" fill="#ffb300"/><circle cx="29" cy="32" r="3" fill="#ffd54f"/>`,
  scallion: `<g fill="#cfeaa8" stroke="#5aa832" stroke-width="3.5">${[[20, 22], [40, 20], [30, 36], [46, 40], [16, 42]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="7"/>`).join('')}</g>`,
  wrapper: `${SH()}<circle cx="32" cy="32" r="23" fill="#fdf1d6" stroke="#ead7ae" stroke-width="3"/>
    <g fill="#fff">${[[22, 26], [38, 22], [30, 38], [42, 38], [20, 40]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.8"/>`).join('')}</g>`,
  peas: `<g fill="#6cc04a" stroke="#4e9a32" stroke-width="2">${[[20, 26], [36, 22], [28, 38], [44, 36], [16, 42], [38, 48]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="7"/>`).join('')}</g>`,
  baobun: `${SH()}<path d="M8 38 Q8 16 32 16 Q56 16 56 38 Q56 48 32 48 Q8 48 8 38Z" fill="#fffaf0" stroke="#eadfcb" stroke-width="2.5"/>
    <path d="M10 35 Q32 28 54 35" stroke="#e5d7bd" fill="none" stroke-width="2.5"/>`,
  cucumber: `<g><circle cx="24" cy="30" r="15" fill="#5aa832"/><circle cx="24" cy="30" r="11" fill="#d6f0b5"/>
    <circle cx="42" cy="40" r="15" fill="#5aa832"/><circle cx="42" cy="40" r="11" fill="#d6f0b5"/>
    <g fill="#a8d67c"><circle cx="21" cy="28" r="1.5"/><circle cx="27" cy="31" r="1.5"/><circle cx="40" cy="38" r="1.5"/><circle cx="45" cy="42" r="1.5"/></g></g>`,
  dough: `${SH()}<ellipse cx="32" cy="36" rx="26" ry="17" fill="#f3d9a4" stroke="#e0bd7b" stroke-width="3"/><ellipse cx="26" cy="32" rx="8" ry="3" fill="#fbecc8"/>`,
  sauce: `${SH()}<path d="M8 36 Q8 22 32 22 Q56 22 56 36 Q56 50 32 50 Q8 50 8 36Z" fill="#d93a2b"/><ellipse cx="26" cy="30" rx="9" ry="3.5" fill="#f2665a"/>`,
  cheese: `<path d="M8 22 L56 22 L56 34 L50 34 L46 44 L42 34 L26 34 L21 46 L16 34 L8 34 Z" fill="#ffc933"/>
    <circle cx="20" cy="27" r="2.5" fill="#e8a800"/><circle cx="36" cy="29" r="3" fill="#e8a800"/><circle cx="48" cy="26" r="2" fill="#e8a800"/>`,
  basil: `<path d="M32 56 Q8 42 18 14 Q42 18 32 56Z" fill="#2e9e44"/><path d="M32 56 Q56 42 46 14 Q22 18 32 56Z" fill="#45b85a"/>
    <path d="M32 54 Q22 36 20 18 M32 54 Q42 36 44 18" stroke="#1f7a33" stroke-width="1.6" fill="none"/>`,
  pasta: `${SH()}<g fill="none" stroke="#f2c94c" stroke-width="3.5" stroke-linecap="round">
    <ellipse cx="32" cy="34" rx="22" ry="14"/><ellipse cx="30" cy="32" rx="16" ry="10" transform="rotate(12 30 32)"/><ellipse cx="34" cy="34" rx="10" ry="6" transform="rotate(-15 34 34)"/>
    <path d="M12 36 Q32 50 52 32"/></g>`,
  meatballs: `${SH()}<g fill="#8a4a2b"><circle cx="21" cy="36" r="11"/><circle cx="43" cy="36" r="11"/><circle cx="32" cy="24" r="11"/></g>
    <g fill="#a9643f"><circle cx="18" cy="33" r="3"/><circle cx="40" cy="33" r="3"/><circle cx="29" cy="21" r="3"/></g>`,
  cone: `<path d="M16 16 L48 16 L32 60Z" fill="#e0a65a"/><path d="M20 22 L42 44 M28 18 L46 36 M44 22 L24 44 M36 18 L20 34" stroke="#c78a3f" stroke-width="2"/>
    <rect x="14" y="12" width="36" height="7" rx="3" fill="#d39545"/>`,
  gelato: `<path d="M10 42 Q10 12 32 12 Q54 12 54 42 Q48 36 42 44 Q36 36 30 44 Q24 36 18 44 Q14 38 10 42Z" fill="#ffb3c7"/><ellipse cx="24" cy="22" rx="7" ry="4" fill="#ffd6e2"/>`,
  sprinkles: `<g stroke-width="4" stroke-linecap="round">${[['#ff6f61', 14, 20, 22, 16], ['#3fb2a6', 30, 14, 38, 20], ['#ffc93c', 46, 22, 52, 30], ['#a58bf0', 16, 36, 24, 40],
    ['#ff8ab3', 32, 30, 36, 38], ['#7ccc4f', 44, 42, 52, 40], ['#3d7fd6', 22, 50, 30, 48], ['#ff6f61', 38, 50, 42, 56]].map(([c, a, b, x, y]) => `<path d="M${a} ${b} L${x} ${y}" stroke="${c}"/>`).join('')}</g>`,
  bun: `${SH()}<path d="M8 44 Q8 14 32 14 Q56 14 56 44 Z" fill="#f0a94e"/><rect x="8" y="42" width="48" height="6" rx="3" fill="#d98b35"/>
    <g fill="#fff6dc"><ellipse cx="22" cy="27" rx="2.4" ry="1.4" transform="rotate(-20 22 27)"/><ellipse cx="32" cy="22" rx="2.4" ry="1.4"/>
    <ellipse cx="42" cy="27" rx="2.4" ry="1.4" transform="rotate(20 42 27)"/><ellipse cx="28" cy="34" rx="2.4" ry="1.4"/><ellipse cx="38" cy="35" rx="2.4" ry="1.4"/></g>`,
  patty: `${SH(32, 50)}<rect x="6" y="24" width="52" height="20" rx="10" fill="#6e3b22"/><rect x="10" y="27" width="44" height="5" rx="2.5" fill="#8a4f2e"/>
    <g fill="#4e2614"><circle cx="18" cy="38" r="1.7"/><circle cx="30" cy="36" r="1.7"/><circle cx="44" cy="39" r="1.7"/></g>`,
  lettuce: `<path d="M6 34 Q10 24 18 30 Q22 22 30 29 Q36 21 42 29 Q50 22 54 30 Q60 28 58 36 Q52 44 44 38 Q38 46 32 39 Q26 46 20 39 Q12 45 6 34 Z" fill="#7ccc4f"/>
    <path d="M10 34 Q32 30 54 34" fill="none" stroke="#5aa832" stroke-width="2"/>`,
  sausage: `${SH(32, 46)}<rect x="5" y="24" width="54" height="16" rx="8" fill="#c4572e"/><path d="M12 28 L50 28" stroke="#e07a50" stroke-width="3" stroke-linecap="round"/>`,
  mustard: `<path d="M24 54 L24 26 Q24 20 32 20 Q40 20 40 26 L40 54 Z" fill="#ffd21f"/><path d="M28 20 L30 8 L34 8 L36 20Z" fill="#e53935"/>
    <rect x="24" y="34" width="16" height="10" fill="#fff" opacity=".7"/>`,
  bagel: `${SH()}<path fill-rule="evenodd" d="M8 34 a24 18 0 1 0 48 0 a24 18 0 1 0 -48 0 M25 32 a7 5 0 1 0 14 0 a7 5 0 1 0 -14 0" fill="#d9974a"/>
    <g fill="#fff6dc">${[[16, 30], [22, 22], [34, 20], [46, 24], [50, 34], [42, 44], [20, 42]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="2" ry="1.2"/>`).join('')}</g>`,
  icecream: `<path d="M10 44 Q10 14 32 14 Q54 14 54 44 Q48 38 42 46 Q36 38 30 46 Q24 38 18 46 Q14 40 10 44Z" fill="#fff4dc" stroke="#ecdcbd" stroke-width="2"/>
    <g fill="#5b3a24">${[[22, 26], [34, 22], [42, 30], [28, 34]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.4"/>`).join('')}</g>`,
  whipped: `<path d="M12 48 Q6 36 18 34 Q14 20 30 18 Q36 8 42 18 Q56 20 50 34 Q60 38 52 48Z" fill="#fff" stroke="#e8e8e8" stroke-width="2"/>
    <path d="M18 38 Q32 30 46 38 M24 28 Q32 22 40 28" stroke="#ececec" stroke-width="2" fill="none"/>`,
  cherry: `<path d="M32 30 Q34 16 46 8" stroke="#5aa832" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="30" cy="40" r="14" fill="#e53935"/><ellipse cx="25" cy="35" rx="4" ry="3" fill="#ff8a80"/>`,
  lime: `<circle cx="32" cy="34" r="22" fill="#7cc242"/><circle cx="32" cy="34" r="17" fill="#d4f0a0"/>
    <g stroke="#9ccf5a" stroke-width="2.5">${[0, 45, 90, 135].map(a => `<line x1="32" y1="34" x2="${32 + 17 * Math.cos(a * Math.PI / 180)}" y2="${34 + 17 * Math.sin(a * Math.PI / 180)}"/><line x1="32" y1="34" x2="${32 - 17 * Math.cos(a * Math.PI / 180)}" y2="${34 - 17 * Math.sin(a * Math.PI / 180)}"/>`).join('')}</g>`,
  peanut: `${SH()}<path d="M10 36 Q10 24 32 24 Q54 24 54 36 Q54 50 32 50 Q10 50 10 36Z" fill="#fff" stroke="#e6ddd0" stroke-width="2"/>
    <ellipse cx="32" cy="32" rx="18" ry="6" fill="#b5651d"/><g fill="#e0a96d"><circle cx="26" cy="31" r="2"/><circle cx="36" cy="33" r="2"/><circle cx="31" cy="30" r="1.6"/></g>`,
  ginger: `<g fill="#ffb8ad" stroke="#f08a7c" stroke-width="2"><path d="M12 42 Q12 18 30 16 Q34 30 22 44Z"/><path d="M28 46 Q30 22 48 22 Q52 36 38 48Z"/><path d="M18 54 Q34 36 54 42 Q48 56 30 56Z"/></g>`,
  corn: `<g fill="#ffd54f" stroke="#e0a800" stroke-width="1.5">${[[14, 16], [26, 14], [38, 16], [50, 20], [12, 30], [24, 28], [36, 30], [48, 34], [16, 44], [28, 42], [40, 44], [30, 54]].map(([x, y]) => `<rect x="${x - 5}" y="${y - 5}" width="10" height="10" rx="4"/>`).join('')}</g>`,
  chili: `<path d="M18 22 Q8 34 16 46 Q26 60 52 54 Q32 46 30 32 Q28 22 18 22Z" fill="#e53935"/><path d="M16 30 Q14 40 22 46" stroke="#ff8a80" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M18 22 Q18 12 28 10" stroke="#3a9a3a" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M12 22 Q18 16 26 22 Q18 26 12 22Z" fill="#4caf50"/>`,
  sesame: `<g fill="#fff3d6" stroke="#c9a46e" stroke-width="1.3">${[[16, 20, 20], [30, 14, -30], [44, 22, 40], [22, 34, -10], [38, 36, 25], [50, 40, -40], [14, 46, 30], [30, 50, -20], [44, 52, 10]].map(([x, y, r]) => `<ellipse cx="${x}" cy="${y}" rx="5" ry="3" transform="rotate(${r} ${x} ${y})"/>`).join('')}</g>`,
  bokchoy: `<path d="M24 58 Q18 32 32 12 Q46 32 40 58Z" fill="#eef7dc" stroke="#cfe3b0" stroke-width="2"/>
    <path d="M32 10 Q8 18 12 42 Q22 30 30 34Z" fill="#3fa043"/><path d="M32 10 Q56 18 52 42 Q42 30 34 34Z" fill="#4caf50"/>`,
  mushrooms: `${SH()}<path d="M10 32 Q10 12 32 12 Q54 12 54 32Z" fill="#b07a55"/><rect x="24" y="30" width="16" height="20" rx="6" fill="#f3e3cf"/>
    <circle cx="22" cy="22" r="3.5" fill="#d9a77a"/><circle cx="38" cy="20" r="3" fill="#d9a77a"/><circle cx="46" cy="27" r="2.5" fill="#d9a77a"/>`,
  olives: `<g fill="none" stroke="#2f2f35" stroke-width="7"><circle cx="20" cy="24" r="9"/><circle cx="44" cy="22" r="9"/><circle cx="32" cy="44" r="9"/></g>`,
  pepperoni: `<circle cx="24" cy="26" r="15" fill="#c62828"/><circle cx="40" cy="40" r="15" fill="#d32f2f"/>
    <g fill="#8e1b1b"><circle cx="20" cy="22" r="2.5"/><circle cx="28" cy="30" r="2"/><circle cx="38" cy="36" r="2.5"/><circle cx="45" cy="44" r="2"/></g>`,
  chocolate: `<g transform="rotate(-10 32 32)"><rect x="10" y="16" width="44" height="32" rx="4" fill="#6d3b1f"/>
    <path d="M24.5 16 L24.5 48 M39.5 16 L39.5 48 M10 32 L54 32" stroke="#8a5432" stroke-width="2.5"/></g>`,
  bacon: `<path d="M4 26 q8 -8 16 0 t16 0 t16 0 t12 0 L64 40 q-8 -8 -16 0 t-16 0 t-16 0 t-12 0Z" fill="#c0503a"/>
    <path d="M6 32 q8 -7 16 0 t16 0 t16 0" stroke="#f3b2a2" stroke-width="3" fill="none"/>`,
  pickles: `<g>${[[20, 24], [42, 22], [30, 42]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="13" ry="11" fill="#7cb342"/><ellipse cx="${x}" cy="${y}" rx="9" ry="7.5" fill="#c5e1a5"/><circle cx="${x - 3}" cy="${y}" r="1.5" fill="#7cb342"/><circle cx="${x + 3}" cy="${y - 1}" r="1.5" fill="#7cb342"/>`).join('')}</g>`,
  onions: `<g fill="none"><ellipse cx="26" cy="28" rx="17" ry="13" stroke="#c39bd3" stroke-width="5"/><ellipse cx="26" cy="28" rx="9" ry="6" stroke="#e8d5f0" stroke-width="4"/>
    <ellipse cx="40" cy="42" rx="15" ry="11" stroke="#c39bd3" stroke-width="5"/></g>`,
  ketchup: `<path d="M24 56 L24 26 Q24 20 32 20 Q40 20 40 26 L40 56 Z" fill="#e53935"/><path d="M28 20 L30 8 L34 8 L36 20Z" fill="#fff"/>
    <rect x="24" y="34" width="16" height="10" fill="#fff" opacity=".8"/>`,
  syrup: `<path d="M24 56 L24 26 Q24 20 32 20 Q40 20 40 26 L40 56 Z" fill="#5b3a24"/><path d="M28 20 L30 8 L34 8 L36 20Z" fill="#ffd54f"/>
    <path d="M24 34 L40 34 L40 40 Q36 46 34 40 Q30 48 28 40 Q26 44 24 40Z" fill="#8a5432"/>`,
};
const icon = (id, s = 56) => `<svg viewBox="0 0 64 64" width="${s}" height="${s}" aria-hidden="true">${ICON[id]}</svg>`;
const iconAt = (id, x, y, s) => `<svg x="${x - s / 2}" y="${y - s / 2}" width="${s}" height="${s}" viewBox="0 0 64 64">${ICON[id]}</svg>`;

/* =========================================================
   ART: THE DISH BEING BUILT ON THE TRAY (300 x 194)
   ========================================================= */
const STEAM = `<g class="steam" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".85">
  <path d="M118 52 q-8 -11 0 -22 t0 -22"/><path d="M150 48 q-8 -11 0 -22 t0 -22"/><path d="M182 52 q-8 -11 0 -22 t0 -22"/></g>`;
function plate() {
  return `<ellipse cx="150" cy="170" rx="128" ry="20" fill="#000" opacity=".08"/>
    <ellipse cx="150" cy="162" rx="125" ry="26" fill="#fff" stroke="#e7d9c8" stroke-width="3"/>
    <ellipse cx="150" cy="160" rx="95" ry="17" fill="none" stroke="#f1e6d8" stroke-width="2"/>`;
}
function scatter(items, cy, size, gap) {
  const n = items.length;
  return items.map((id, i) => iconAt(id, 150 + (i - (n - 1) / 2) * gap, cy + (i % 2 ? 7 : -3), size)).join('');
}
function bowlBase(band, broth) {
  return `<ellipse cx="150" cy="184" rx="105" ry="10" fill="#000" opacity=".1"/>
    <path d="M38 98 Q44 180 150 182 Q256 180 262 98 Z" fill="#fff" stroke="#e3e9f2" stroke-width="2"/>
    <path d="M50 136 Q150 156 250 136" fill="none" stroke="${band}" stroke-width="5"/>
    <path d="M62 152 Q150 168 238 152" fill="none" stroke="${band}" stroke-width="2.5" stroke-dasharray="7 6"/>
    <ellipse cx="150" cy="98" rx="112" ry="24" fill="#fff" stroke="${band}" stroke-width="4"/>
    <ellipse cx="150" cy="100" rx="100" ry="18" fill="${broth}"/>`;
}
function steamerBase() {
  return `<ellipse cx="150" cy="176" rx="118" ry="14" fill="#000" opacity=".1"/>
    <path d="M36 112 L36 156 Q150 190 264 156 L264 112Z" fill="#e3c07e"/>
    <path d="M36 128 Q150 160 264 128 M36 144 Q150 176 264 144" stroke="#c99a52" stroke-width="3" fill="none"/>
    <ellipse cx="150" cy="112" rx="114" ry="28" fill="#c99a52"/><ellipse cx="150" cy="112" rx="100" ry="21" fill="#f6e7c8"/>`;
}
const DISH_ART = {
  bowl(D, items) {
    return `${bowlBase(D.band || '#3d7fd6', D.broth || '#e8ad62')}
      ${scatter(items, 92, items.length > 3 ? 52 : 60, items.length > 3 ? 48 : 58)}${D.hot ? STEAM : ''}`;
  },
  plate(D, items) { return plate() + scatter(items, 128, items.length > 3 ? 56 : 66, items.length > 3 ? 54 : 66); },
  dumplings(D, items) {
    const has = i => items.includes(i);
    if (!has('wrapper')) return steamerBase() + scatter(items, 104, 58, 62);
    let s = steamerBase();
    [[96, 108], [150, 100], [204, 108]].forEach(([x, y]) => {
      s += `<path d="M${x - 34} ${y + 8} Q${x} ${y - 40} ${x + 34} ${y + 8} Q${x} ${y + 18} ${x - 34} ${y + 8}Z" fill="#fdf1d6" stroke="#e5cf9f" stroke-width="2.5"/>
        <path d="M${x - 20} ${y - 12} l4 8 M${x - 8} ${y - 18} l3 9 M${x + 6} ${y - 18} l-2 9 M${x + 18} ${y - 12} l-4 8" stroke="#e5cf9f" stroke-width="2.5" stroke-linecap="round"/>`;
      if (has('pork')) s += `<ellipse cx="${x}" cy="${y}" rx="14" ry="6" fill="#f1b9a3" opacity=".55"/>`;
      if (has('scallion')) s += `<g fill="#cfeaa8" stroke="#5aa832" stroke-width="2"><circle cx="${x - 8}" cy="${y - 4}" r="3.5"/><circle cx="${x + 8}" cy="${y - 8}" r="3.5"/></g>`;
    });
    return s + STEAM;
  },
  bao(D, items) {
    const has = i => items.includes(i);
    if (!has('baobun')) return steamerBase() + scatter(items, 104, 58, 62);
    let s = steamerBase();
    [[108, 104], [192, 104]].forEach(([x, y]) => {
      s += `<path d="M${x - 38} ${y + 10} Q${x - 40} ${y - 26} ${x} ${y - 28} Q${x + 40} ${y - 26} ${x + 38} ${y + 10}Z" fill="#fffaf0" stroke="#eadfcb" stroke-width="2.5"/>`;
      if (has('pork')) s += `<path d="M${x - 34} ${y - 4} Q${x} ${y - 16} ${x + 34} ${y - 4} L${x + 32} ${y + 4} Q${x} ${y - 6} ${x - 32} ${y + 4}Z" fill="#c9765c"/>`;
      if (has('cucumber')) s += `<g fill="#d6f0b5" stroke="#5aa832" stroke-width="2.5"><circle cx="${x - 14}" cy="${y - 8}" r="6"/><circle cx="${x + 12}" cy="${y - 9}" r="6"/></g>`;
      s += `<path d="M${x - 38} ${y + 6} Q${x} ${y - 2} ${x + 38} ${y + 6} Q${x + 40} ${y + 22} ${x} ${y + 22} Q${x - 40} ${y + 22} ${x - 38} ${y + 6}Z" fill="#fffaf0" stroke="#eadfcb" stroke-width="2.5"/>`;
    });
    return s + STEAM;
  },
  friedrice(D, items) {
    const has = i => items.includes(i);
    let s = bowlBase(D.band, '#fff');
    if (has('rice')) s += `<path d="M48 100 Q60 58 150 54 Q240 58 252 100 Q150 118 48 100Z" fill="#f6dc9a"/>
      <g fill="#fff3cf">${[[90, 86], [118, 72], [150, 66], [184, 74], [212, 88], [130, 92], [170, 92], [104, 98], [196, 100]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="5" ry="2.6"/>`).join('')}</g>`;
    else s += scatter(items, 90, 58, 66);
    if (has('rice') && has('egg')) s += `<g fill="#ffd54f">${[[100, 80], [140, 70], [176, 84], [214, 94], [124, 96], [160, 60]].map(([x, y]) => `<path d="M${x} ${y} l9 -3 l4 7 l-8 4z"/>`).join('')}</g>`;
    if (has('rice') && has('peas')) s += `<g fill="#6cc04a" stroke="#4e9a32" stroke-width="1.5">${[[112, 84], [150, 78], [190, 90], [86, 96], [168, 70], [132, 64], [206, 80]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5"/>`).join('')}</g>`;
    return s + STEAM;
  },
  springroll(D, items) {
    const has = i => items.includes(i);
    if (!has('ricepaper')) return plate() + scatter(items, 128, 66, 66);
    let s = plate();
    [[108, 132, -12], [192, 128, 10]].forEach(([x, y, r]) => {
      s += `<g transform="translate(${x} ${y}) rotate(${r})">`;
      if (has('herbs')) s += `<ellipse cx="-14" cy="-2" rx="14" ry="7" fill="#4caf50"/><ellipse cx="14" cy="2" rx="14" ry="7" fill="#5cc45f"/>`;
      if (has('shrimp')) s += `<path d="M-30 4 Q-22 -14 -6 -6 Q-12 6 -30 4Z M2 6 Q10 -14 26 -6 Q20 6 2 6Z" fill="#ff8a65"/>`;
      s += `<rect x="-44" y="-20" width="88" height="40" rx="20" fill="#fbf3e2" opacity=".72" stroke="#e5d3ad" stroke-width="2.5"/>
        <path d="M-30 -20 L-30 20 M30 -20 L30 20" stroke="#e5d3ad" stroke-width="2" opacity=".7"/></g>`;
    });
    return s;
  },
  spaghetti(D, items) {
    const has = i => items.includes(i);
    if (!has('pasta')) return plate() + scatter(items, 128, 56, 54);
    let s = plate() + `<g fill="none" stroke="#f2c94c" stroke-width="5" stroke-linecap="round">
      <ellipse cx="150" cy="132" rx="84" ry="30"/><ellipse cx="146" cy="126" rx="64" ry="22" transform="rotate(6 146 126)"/>
      <ellipse cx="154" cy="124" rx="46" ry="15" transform="rotate(-8 154 124)"/><path d="M80 138 Q150 170 222 134 M92 120 Q150 100 210 122"/></g>`;
    if (has('sauce')) s += `<path d="M104 120 Q110 96 150 98 Q192 96 198 122 Q190 138 150 136 Q108 138 104 120Z" fill="#d93a2b"/><ellipse cx="136" cy="108" rx="14" ry="5" fill="#f2665a"/>`;
    if (has('meatballs')) s += `<g fill="#8a4a2b">${[[124, 112], [158, 104], [176, 122], [140, 126]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="13"/><circle cx="${x - 4}" cy="${y - 4}" r="3.5" fill="#a9643f"/>`).join('')}</g>`;
    if (has('cheese')) s += `<g fill="#fff3b0">${[[118, 100], [148, 92], [180, 108], [132, 132], [166, 132], [104, 124], [196, 126], [156, 116]].map(([x, y]) => `<rect x="${x}" y="${y}" width="7" height="3" rx="1.5" transform="rotate(${x % 50} ${x} ${y})"/>`).join('')}</g>`;
    return s;
  },
  sushi(D, items) {
    const has = i => items.includes(i);
    let s = `<ellipse cx="150" cy="172" rx="120" ry="10" fill="#000" opacity=".1"/>
      <rect x="40" y="132" width="220" height="30" rx="8" fill="#d9a066"/><rect x="40" y="152" width="220" height="10" rx="4" fill="#b97d43"/>
      <rect x="62" y="160" width="14" height="12" fill="#b97d43"/><rect x="224" y="160" width="14" height="12" fill="#b97d43"/>`;
    [100, 186].forEach(x => {
      if (has('rice')) s += `<rect x="${x - 36}" y="98" width="72" height="38" rx="16" fill="#fff" stroke="#e6e0d4" stroke-width="2"/>`;
      if (has('salmon')) s += `<path d="M${x - 42} ${has('rice') ? 102 : 116} Q${x} ${has('rice') ? 78 : 96} ${x + 42} ${has('rice') ? 102 : 116} L${x + 38} ${has('rice') ? 112 : 128} Q${x} ${has('rice') ? 94 : 110} ${x - 38} ${has('rice') ? 112 : 128}Z" fill="#ff8a5b"/>
        <path d="M${x - 22} ${has('rice') ? 94 : 108} l6 12 M${x - 4} ${has('rice') ? 89 : 103} l6 12 M${x + 14} ${has('rice') ? 90 : 104} l6 12" stroke="#ffd2bd" stroke-width="3.5"/>`;
      if (has('nori')) s += `<rect x="${x - 9}" y="84" width="18" height="54" rx="3" fill="#2e4a35"/>`;
    });
    if (has('wasabi')) s += iconAt('wasabi', 240, 120, 40);
    return s;
  },
  pizza(D, items, extras = []) {
    const has = i => items.includes(i);
    if (!has('dough')) return plate() + scatter(items, 128, 60, 64);
    let s = `<ellipse cx="150" cy="178" rx="120" ry="12" fill="#000" opacity=".1"/>
      <ellipse cx="150" cy="114" rx="128" ry="66" fill="#c8935a"/><ellipse cx="150" cy="110" rx="108" ry="54" fill="#f3d9a4" stroke="#e0ad62" stroke-width="10"/>`;
    if (has('sauce')) s += `<ellipse cx="150" cy="110" rx="92" ry="44" fill="#d93a2b"/>`;
    if (has('cheese')) s += `<g fill="#ffd54f">${[[118, 96, 26, 14], [176, 100, 28, 15], [146, 124, 30, 13], [104, 122, 18, 10], [196, 124, 18, 10], [150, 88, 18, 9]].map(([x, y, rx, ry]) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}"/>`).join('')}</g>`;
    if (extras.includes('pepperoni')) s += [[116, 106], [160, 92], [186, 116], [138, 128], [196, 96]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="11" fill="#c62828"/><circle cx="${x - 3}" cy="${y - 3}" r="2" fill="#8e1b1b"/>`).join('');
    if (extras.includes('mushrooms')) s += [[100, 112], [170, 128], [146, 104], [210, 108]].map(([x, y]) => `<path d="M${x - 9} ${y} Q${x - 9} ${y - 10} ${x} ${y - 10} Q${x + 9} ${y - 10} ${x + 9} ${y}Z" fill="#c8a07c"/><rect x="${x - 3}" y="${y}" width="6" height="6" fill="#efdcc6"/>`).join('');
    if (extras.includes('olives')) s += `<g fill="none" stroke="#2f2f35" stroke-width="4">${[[130, 92], [176, 106], [110, 128], [160, 132], [204, 120], [148, 112]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5"/>`).join('')}</g>`;
    if (has('basil')) s += [[120, 100, -20], [178, 96, 30], [150, 124, 10], [200, 120, -40], [100, 124, 50]].map(([x, y, r]) => `<g transform="translate(${x} ${y}) rotate(${r})"><ellipse rx="10" ry="6" fill="#2e9e44"/><path d="M-9 0 L9 0" stroke="#1f7a33" stroke-width="1.4"/></g>`).join('');
    return s;
  },
  burger(D, items, extras = []) {
    const has = i => items.includes(i) || extras.includes(i);
    let y = 160, s = plate();
    if (has('bun')) { s += `<path d="M80 ${y} L220 ${y} Q224 ${y - 16} 210 ${y - 18} L90 ${y - 18} Q76 ${y - 16} 80 ${y}Z" fill="#e39a45"/>`; y -= 16; }
    if (has('patty')) { s += `<rect x="70" y="${y - 24}" width="160" height="26" rx="13" fill="#6e3b22"/><rect x="82" y="${y - 20}" width="136" height="6" rx="3" fill="#8a4f2e"/>`; y -= 22; }
    if (has('ketchup')) s += `<path d="M80 ${y - 4} q10 6 20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0" stroke="#e53935" stroke-width="5" fill="none" stroke-linecap="round"/>`;
    if (has('bacon')) { s += `<path d="M68 ${y - 2} q10 -8 20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 L228 ${y - 12} q-10 -8 -20 0 t-20 0 t-20 0 t-20 0 t-20 0 t-20 0 t-20 0 t-20 0Z" fill="#c0503a"/>`; y -= 9; }
    if (has('egg')) { s += `<ellipse cx="150" cy="${y - 4}" rx="74" ry="9" fill="#fff" stroke="#eee" stroke-width="2"/><ellipse cx="150" cy="${y - 7}" rx="16" ry="7" fill="#ffb300"/>`; y -= 9; }
    if (has('cheese')) { s += `<path d="M72 ${y - 8} L228 ${y - 8} L228 ${y + 2} L214 ${y + 2} L206 ${y + 16} L198 ${y + 2} L120 ${y + 2} L110 ${y + 18} L100 ${y + 2} L72 ${y + 2}Z" fill="#ffc933"/>`; y -= 8; }
    if (has('pickles')) { s += [100, 150, 200].map(x => `<ellipse cx="${x}" cy="${y - 3}" rx="18" ry="5" fill="#7cb342"/><ellipse cx="${x}" cy="${y - 4}" rx="12" ry="3" fill="#c5e1a5"/>`).join(''); y -= 5; }
    if (has('onions')) { s += [110, 150, 190].map(x => `<ellipse cx="${x}" cy="${y - 3}" rx="18" ry="5" fill="none" stroke="#c39bd3" stroke-width="4"/>`).join(''); y -= 5; }
    if (has('lettuce')) { s += `<path d="M66 ${y} Q74 ${y - 14} 88 ${y - 6} Q100 ${y - 16} 114 ${y - 6} Q128 ${y - 16} 142 ${y - 6} Q156 ${y - 16} 170 ${y - 6} Q184 ${y - 16} 198 ${y - 6} Q212 ${y - 16} 226 ${y - 4} Q236 ${y + 4} 222 ${y + 6} Q150 ${y + 2} 76 ${y + 6} Q60 ${y + 6} 66 ${y}Z" fill="#7ccc4f"/>`; y -= 10; }
    if (has('bun')) {
      s += `<path d="M76 ${y + 2} Q76 ${y - 62} 150 ${y - 64} Q224 ${y - 62} 224 ${y + 2}Z" fill="#f0a94e"/>
        <path d="M94 ${y - 20} Q102 ${y - 48} 138 ${y - 54}" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="6" stroke-linecap="round"/>
        <g fill="#fff6dc">${[[120, -40], [150, -50], [180, -40], [135, -26], [165, -27], [105, -22], [196, -22]].map(([x, dy]) => `<ellipse cx="${x}" cy="${y + dy}" rx="4" ry="2.2"/>`).join('')}</g>`;
    }
    return s;
  },
  hotdog(D, items) {
    const has = i => items.includes(i);
    let s = plate();
    if (has('bun')) s += `<rect x="62" y="122" width="176" height="36" rx="18" fill="#d98b35"/>`;
    if (has('sausage')) s += `<rect x="46" y="110" width="208" height="28" rx="14" fill="#c4572e"/><path d="M60 117 L238 117" stroke="#e07a50" stroke-width="4" stroke-linecap="round"/>`;
    if (has('bun')) s += `<rect x="62" y="132" width="176" height="28" rx="14" fill="#f0a94e"/>`;
    if (has('mustard')) s += `<path d="M64 120 q8 -10 16 0 t16 0 t16 0 t16 0 t16 0 t16 0 t16 0 t16 0 t16 0 t16 0 t16 0" stroke="#ffd21f" stroke-width="6" fill="none" stroke-linecap="round"/>`;
    return s;
  },
  bagel(D, items) {
    const has = i => items.includes(i);
    let s = plate();
    if (has('bagel')) s += `<path fill-rule="evenodd" d="M66 132 a84 36 0 1 0 168 0 a84 36 0 1 0 -168 0 M128 128 a22 9 0 1 0 44 0 a22 9 0 1 0 -44 0" fill="#d9974a"/>
      <g fill="#fff6dc">${[[90, 118], [110, 108], [150, 102], [192, 108], [212, 120], [200, 146], [100, 146]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="4" ry="2.2"/>`).join('')}</g>`;
    if (has('egg')) s += `<path d="M96 120 Q92 92 124 96 Q140 78 170 92 Q206 90 204 116 Q206 134 170 134 Q140 140 120 134 Q96 136 96 120Z" fill="#fff" stroke="#eee" stroke-width="2"/><circle cx="150" cy="112" r="16" fill="#ffb300"/><circle cx="145" cy="107" r="5" fill="#ffd54f"/>`;
    if (has('cheese')) s += `<path d="M104 120 L196 112 L198 124 L184 126 L178 140 L172 127 L126 131 L118 146 L112 132 L106 132Z" fill="#ffc933" opacity=".95"/>`;
    return s;
  },
  gelato(D, items) {
    const has = i => items.includes(i);
    let s = `<ellipse cx="150" cy="184" rx="40" ry="6" fill="#000" opacity=".08"/>`;
    if (has('cone')) s += `<path d="M112 92 L188 92 L150 182Z" fill="#e0a65a"/><path d="M124 104 L166 156 M138 96 L176 128 M176 104 L134 156 M160 96 L124 124" stroke="#c78a3f" stroke-width="2.5"/>
      <rect x="108" y="86" width="84" height="12" rx="5" fill="#d39545"/>`;
    if (has('gelato')) s += `<path d="M104 96 Q100 30 150 28 Q200 30 196 96 Q184 86 174 100 Q162 86 150 100 Q138 86 126 100 Q114 86 104 96Z" fill="#ffb3c7"/><ellipse cx="130" cy="50" rx="12" ry="7" fill="#ffd6e2"/>`;
    if (has('sprinkles')) s += `<g stroke-width="5" stroke-linecap="round">${[['#ff6f61', 120, 60], ['#3fb2a6', 146, 44], ['#ffc93c', 172, 56], ['#a58bf0', 134, 76], ['#7ccc4f', 166, 78], ['#3d7fd6', 186, 70], ['#ff8ab3', 116, 82], ['#ffc93c', 152, 64]].map(([c, x, y], i) => `<path d="M${x} ${y} l${i % 2 ? 7 : -6} 5" stroke="${c}"/>`).join('')}</g>`;
    if (!has('cone') && !has('gelato')) s += scatter(items, 120, 60, 64);
    return s;
  },
  milkshake(D, items) {
    const has = i => items.includes(i);
    let s = `<ellipse cx="150" cy="182" rx="56" ry="7" fill="#000" opacity=".08"/>`;
    if (has('icecream')) s += `<path d="M188 70 L212 14" stroke="#ff6f61" stroke-width="8" stroke-linecap="round"/><path d="M193 58 L198 46 M202 36 L207 24" stroke="#fff" stroke-width="8"/>`;
    s += `<path d="M106 66 L194 66 L182 172 Q150 180 118 172Z" fill="rgba(210,235,250,.55)" stroke="#bcd3e2" stroke-width="3"/>`;
    if (has('icecream')) s += `<path d="M110 76 L190 76 L180 166 Q150 174 120 166Z" fill="#ffc9d6"/><path d="M114 96 L186 96" stroke="#ffe0e8" stroke-width="5"/>`;
    if (has('whipped')) s += `<path d="M100 70 Q92 52 112 50 Q108 30 132 30 Q142 12 160 26 Q186 24 184 46 Q206 50 198 70Z" fill="#fff" stroke="#e8e8e8" stroke-width="2"/>`;
    if (has('cherry')) s += `<path d="M152 26 Q154 8 170 2" stroke="#5aa832" stroke-width="3" fill="none"/><circle cx="150" cy="30" r="13" fill="#e53935"/><ellipse cx="145" cy="25" rx="4" ry="3" fill="#ff8a80"/>`;
    return s;
  },
};
function messArt() {
  return plate() + `<path d="M88 152 Q76 112 120 114 Q130 86 166 100 Q206 90 212 128 Q236 150 204 158 Z" fill="#a08060"/>
    <circle cx="130" cy="120" r="7" fill="#ffc933"/><circle cx="170" cy="112" r="6" fill="#7ccc4f"/><circle cx="185" cy="138" r="7" fill="#c4544a"/>
    <text x="150" y="76" text-anchor="middle" font-size="44" font-weight="700" fill="#ff6f61" font-family="Fredoka, sans-serif">?!</text>`;
}
// Which dishes of this level could the tray still become?
function trayCandidates(items) {
  return state.level.dishes.filter(d => items.every(i => DISHES[d].ingredients.includes(i) || DISHES[d].addons.includes(i)));
}
// extras sit on top of the dish as small pictures (pizza and burger draw their own)
const EXTRA_Y = { bowl: 82, plate: 112, steamer: 92, sushi: 82, friedrice: 72, springroll: 108, spaghetti: 98,
  gelato: 40, hotdog: 100, bagel: 100, milkshake: 44, dumplings: 84, bao: 82 };
function extrasArt(look, extras) {
  if (!extras.length || !(look in EXTRA_Y)) return '';
  const n = extras.length;
  return extras.map((id, i) => iconAt(id, 150 + (i - (n - 1) / 2) * 40 + (look === 'sushi' ? 0 : 0), EXTRA_Y[look] + (i % 2 ? 6 : -4), 36)).join('');
}
function trayArt(items) {
  let s;
  if (!items.length) {
    s = plate() + `<text x="150" y="110" text-anchor="middle" font-size="19" fill="#c09a78" font-family="Fredoka, sans-serif">Click ingredients</text>
      <text x="150" y="134" text-anchor="middle" font-size="19" fill="#c09a78" font-family="Fredoka, sans-serif">to build a dish</text>`;
  } else {
    const c = trayCandidates(items)[0];
    if (!c) s = messArt();
    else {
      const D = DISHES[c];
      const ordered = D.ingredients.filter(i => items.includes(i));
      const extras = items.filter(i => !D.ingredients.includes(i));
      s = DISH_ART[D.look](D, ordered, extras);
      if (D.look !== 'burger' && !(D.look === 'pizza' && items.includes('dough'))) s += extrasArt(D.look, extras);
    }
  }
  return `<svg viewBox="0 0 300 194" width="300" height="194">${s}</svg>`;
}

/* =========================================================
   ART: CHARACTERS
   ========================================================= */
function faceArt(mood, cx, cy, opt = {}) {
  const ink = '#3b2a20', L = cx - 22, R = cx + 22;
  let eyes = '', brows = '', mouth = '', extra = '', lashes = '';
  const lip = opt.lips ? '#e0566b' : ink;
  if (mood === 'happy') {
    eyes = [L, R].map(x => `<path d="M${x - 8} ${cy + 2} Q${x} ${cy - 9} ${x + 8} ${cy + 2}" fill="none" stroke="${ink}" stroke-width="4" stroke-linecap="round"/>`).join('');
    if (opt.lashes) lashes = `<path d="M${L - 8} ${cy + 2} l-6 -3 M${R + 8} ${cy + 2} l6 -3" stroke="${ink}" stroke-width="3" stroke-linecap="round"/>`;
    mouth = `<path d="M${cx - 13} ${cy + 14} Q${cx} ${cy + 33} ${cx + 13} ${cy + 14} Z" fill="#8a3a3a"/><path d="M${cx - 7} ${cy + 23} Q${cx} ${cy + 30} ${cx + 7} ${cy + 23}" fill="#ff8a8a"/>`;
  } else {
    eyes = [L, R].map(x => `<circle cx="${x}" cy="${cy}" r="7" fill="${ink}"/><circle cx="${x + 2.5}" cy="${cy - 2.5}" r="2.4" fill="#fff"/>`).join('');
    if (opt.lashes) lashes = `<path d="M${L - 6} ${cy - 4} l-6 -4 M${L - 2} ${cy - 7} l-3 -5 M${R + 6} ${cy - 4} l6 -4 M${R + 2} ${cy - 7} l3 -5" stroke="${ink}" stroke-width="2.6" stroke-linecap="round"/>`;
    if (mood === 'neutral') {
      mouth = `<path d="M${cx - 9} ${cy + 17} Q${cx} ${cy + 25} ${cx + 9} ${cy + 17}" fill="none" stroke="${lip}" stroke-width="3.5" stroke-linecap="round"/>`;
    } else if (mood === 'worried') {
      brows = `<path d="M${L - 9} ${cy - 13} L${L + 7} ${cy - 18}" stroke="${ink}" stroke-width="3.5" stroke-linecap="round"/><path d="M${R + 9} ${cy - 13} L${R - 7} ${cy - 18}" stroke="${ink}" stroke-width="3.5" stroke-linecap="round"/>`;
      mouth = `<path d="M${cx - 11} ${cy + 21} q5.5 -5 11 0 t11 0" fill="none" stroke="${lip}" stroke-width="3.5" stroke-linecap="round"/>`;
      extra = `<path d="M${cx + 42} ${cy - 24} q7 11 0 15 q-7 -4 0 -15z" fill="#7fd0ff"/>`;
    } else if (mood === 'angry') {
      brows = `<path d="M${L - 10} ${cy - 18} L${L + 8} ${cy - 9}" stroke="${ink}" stroke-width="4.5" stroke-linecap="round"/><path d="M${R + 10} ${cy - 18} L${R - 8} ${cy - 9}" stroke="${ink}" stroke-width="4.5" stroke-linecap="round"/>`;
      mouth = `<path d="M${cx - 12} ${cy + 26} Q${cx} ${cy + 13} ${cx + 12} ${cy + 26}" fill="none" stroke="${ink}" stroke-width="4" stroke-linecap="round"/>`;
      extra = `<g transform="translate(${cx + 40} ${cy - 44})" stroke="#ff3b3b" stroke-width="4" stroke-linecap="round" fill="none">
        <path d="M-9 -3 q6 0 6 -6"/><path d="M9 -3 q-6 0 -6 -6"/><path d="M-9 3 q6 0 6 6"/><path d="M9 3 q-6 0 -6 6"/></g>`;
    }
  }
  const cheek = mood === 'angry' ? '#ff5a5a' : '#ff8fa3';
  const cheeks = `<ellipse cx="${L - 10}" cy="${cy + 13}" rx="9" ry="5.5" fill="${cheek}" opacity=".55"/><ellipse cx="${R + 10}" cy="${cy + 13}" rx="9" ry="5.5" fill="${cheek}" opacity=".55"/>`;
  return cheeks + eyes + lashes + brows + mouth + extra;
}

/* --- customers --- */
const CUST_COLORS = ['#ffb3c7', '#a8e6cf', '#c9b6ff', '#ffd3a5', '#a7d8ff', '#fff1a8', '#e8c09a', '#ffc4a8', '#b8f0e0'];
function randomLook() {
  const look = { color: pick(CUST_COLORS), ears: pick(['cat', 'bear', 'bunny', 'none', 'none']), acc: pick(['bow', 'cap', 'glasses', 'flower', 'none']) };
  if (look.acc === 'cap') look.ears = 'none';
  return look;
}
function customerArt(look, mood) {
  const c = look.color, d = shade(c, -0.2);
  let ears = '';
  if (look.ears === 'cat') ears = `<path d="M30 74 L28 22 L72 50Z" fill="${c}" stroke="${d}" stroke-width="3" stroke-linejoin="round"/><path d="M38 62 L37 36 L60 50Z" fill="#ff9fb5"/>
    <path d="M130 74 L132 22 L88 50Z" fill="${c}" stroke="${d}" stroke-width="3" stroke-linejoin="round"/><path d="M122 62 L123 36 L100 50Z" fill="#ff9fb5"/>`;
  if (look.ears === 'bear') ears = `<circle cx="38" cy="52" r="19" fill="${c}" stroke="${d}" stroke-width="3"/><circle cx="38" cy="52" r="9" fill="${d}"/>
    <circle cx="122" cy="52" r="19" fill="${c}" stroke="${d}" stroke-width="3"/><circle cx="122" cy="52" r="9" fill="${d}"/>`;
  if (look.ears === 'bunny') ears = `<ellipse cx="56" cy="28" rx="12" ry="32" transform="rotate(-10 56 28)" fill="${c}" stroke="${d}" stroke-width="3"/><ellipse cx="56" cy="30" rx="5" ry="22" transform="rotate(-10 56 30)" fill="#ff9fb5"/>
    <ellipse cx="104" cy="28" rx="12" ry="32" transform="rotate(10 104 28)" fill="${c}" stroke="${d}" stroke-width="3"/><ellipse cx="104" cy="30" rx="5" ry="22" transform="rotate(10 104 30)" fill="#ff9fb5"/>`;
  const body = `<path d="M18 232 L18 112 Q18 42 80 42 Q142 42 142 112 L142 232 Z" fill="${c}" stroke="${d}" stroke-width="3"/>
    <ellipse cx="54" cy="74" rx="15" ry="9" fill="#fff" opacity=".4" transform="rotate(-30 54 74)"/>
    <ellipse cx="80" cy="186" rx="40" ry="32" fill="#fff" opacity=".3"/>`;
  let acc = '';
  if (look.acc === 'bow') acc = `<g transform="translate(116 54) rotate(20)"><path d="M0 0 L-15 -10 L-15 10Z M0 0 L15 -10 L15 10Z" fill="#ff5a8a"/><circle r="5" fill="#ff86a8"/></g>`;
  if (look.acc === 'cap') acc = `<path d="M30 74 Q30 36 80 36 Q130 36 130 74 Z" fill="#ff6f61"/><path d="M118 70 Q150 66 158 76 Q136 82 116 76Z" fill="#e0574a"/><circle cx="80" cy="38" r="5" fill="#e0574a"/>`;
  if (look.acc === 'glasses') acc = `<g fill="rgba(255,255,255,.25)" stroke="#3b2a20" stroke-width="3.5"><circle cx="58" cy="106" r="14"/><circle cx="102" cy="106" r="14"/></g><path d="M72 104 Q80 99 88 104" stroke="#3b2a20" stroke-width="3" fill="none"/>`;
  if (look.acc === 'flower') acc = `<g transform="translate(40 62)">${[0, 72, 144, 216, 288].map(r => `<ellipse rx="6" ry="10" transform="rotate(${r}) translate(0 -9)" fill="#fff"/>`).join('')}<circle r="6" fill="#ffc93c"/></g>`;
  return `<svg viewBox="0 0 160 230" width="160" height="230">${ears}${body}${faceArt(mood, 80, 106)}${acc}</svg>`;
}
function criticArt(mood, w = 160, h = 230) {
  const c = '#b7a3e6', d = shade(c, -0.25);
  return `<svg viewBox="0 0 160 230" width="${w}" height="${h}">
    <path d="M18 232 L18 112 Q18 42 80 42 Q142 42 142 112 L142 232 Z" fill="${c}" stroke="${d}" stroke-width="3"/>
    <ellipse cx="54" cy="74" rx="15" ry="9" fill="#fff" opacity=".4" transform="rotate(-30 54 74)"/>
    ${faceArt(mood, 80, 106)}
    <path d="M58 128 Q69 119 80 125 Q91 119 102 128 Q91 135 80 130 Q69 135 58 128Z" fill="#3b2a20"/>
    <circle cx="102" cy="106" r="15" fill="rgba(255,255,255,.25)" stroke="#d4a017" stroke-width="3.5"/>
    <path d="M116 112 Q126 140 118 170" stroke="#d4a017" stroke-width="2" fill="none"/>
    <ellipse cx="70" cy="46" rx="52" ry="17" transform="rotate(-8 70 46)" fill="#2d2440"/><circle cx="72" cy="28" r="6" fill="#2d2440"/>
    <path d="M62 172 L80 182 L62 192Z M98 172 L80 182 L98 192Z" fill="#e53935"/><circle cx="80" cy="182" r="5" fill="#ff6f61"/>
    <rect x="104" y="176" width="34" height="44" rx="4" fill="#fff" stroke="#ccc" stroke-width="2" transform="rotate(10 120 198)"/>
    <path d="M110 188 L132 192 M109 196 L131 200 M108 204 L124 207" stroke="#aaa" stroke-width="2" transform="rotate(10 120 198)"/>
  </svg>`;
}

/* --- Chef Cherie --- */
function chefArt(mood, w = 190, h = 256) {
  const skin = '#ffd7b0', hair = '#5a3825';
  const face = faceArt(mood === 'yay' ? 'happy' : mood === 'oops' ? 'worried' : 'neutral', 100, 122, { lashes: true, lips: true });
  return `<svg viewBox="0 0 200 270" width="${w}" height="${h}">
    <ellipse cx="100" cy="264" rx="72" ry="7" fill="#000" opacity=".12"/>
    <path d="M46 116 Q38 200 66 222 L134 222 Q162 200 154 116 Z" fill="${hair}"/>
    <path d="M38 272 Q36 176 100 170 Q164 176 162 272 Z" fill="#fff" stroke="#dcdcdc" stroke-width="3"/>
    <g fill="#ff8ab3"><circle cx="86" cy="206" r="4.5"/><circle cx="114" cy="206" r="4.5"/><circle cx="86" cy="234" r="4.5"/><circle cx="114" cy="234" r="4.5"/></g>
    <path d="M72 170 Q100 184 128 170 L120 188 Q100 196 80 188 Z" fill="#ff5a5a"/>
    <path d="M96 186 L88 214 L100 207 L112 214 L104 186Z" fill="#ff5a5a"/>
    <ellipse cx="44" cy="218" rx="15" ry="30" fill="#fff" stroke="#dcdcdc" stroke-width="3" transform="rotate(16 44 218)"/>
    <circle cx="37" cy="246" r="11" fill="${skin}"/>
    <ellipse cx="160" cy="202" rx="15" ry="28" fill="#fff" stroke="#dcdcdc" stroke-width="3" transform="rotate(-35 160 202)"/>
    <path d="M174 178 L178 112" stroke="#9aa5b1" stroke-width="6" stroke-linecap="round"/>
    <path d="M162 104 Q178 126 194 104 Z" fill="#b8c2cc" stroke="#9aa5b1" stroke-width="2"/>
    <circle cx="174" cy="180" r="11" fill="${skin}"/>
    <circle cx="100" cy="122" r="52" fill="${skin}"/>
    <path d="M50 112 Q56 74 100 72 Q144 74 150 112 Q146 92 128 90 Q118 100 98 96 Q78 104 64 96 Q54 100 50 112Z" fill="${hair}"/>
    <path d="M50 110 Q42 160 56 196 Q66 186 62 150 Q60 128 64 108Z" fill="${hair}"/>
    <path d="M150 110 Q158 160 144 196 Q134 186 138 150 Q140 128 136 108Z" fill="${hair}"/>
    ${face}
    <circle cx="72" cy="48" r="24" fill="#fff" stroke="#e2e2e2" stroke-width="3"/>
    <circle cx="128" cy="48" r="24" fill="#fff" stroke="#e2e2e2" stroke-width="3"/>
    <circle cx="100" cy="34" r="30" fill="#fff" stroke="#e2e2e2" stroke-width="3"/>
    <rect x="58" y="60" width="84" height="24" rx="8" fill="#fff" stroke="#e2e2e2" stroke-width="3"/>
    <rect x="60" y="56" width="80" height="8" fill="#fff"/>
    <g transform="translate(140 76) rotate(18)"><path d="M0 0 L-16 -11 L-16 11Z M0 0 L16 -11 L16 11Z" fill="#ff6f91"/><circle r="5.5" fill="#ff9ab5"/></g>
  </svg>`;
}

/* =========================================================
   ART: COUNTRY THEMES (background, ceiling, side decoration)
   ========================================================= */
function stringY(x, sag = 34, ends = 8) {   // follows two curved strings across the ceiling
  const seg = x < 640 ? 0 : 1, t = (x - seg * 640) / 640;
  return (1 - t) * (1 - t) * ends + 2 * (1 - t) * t * sag + t * t * ends;
}
const STRING = (col, w = 2.5) => `<path d="M0 8 Q320 60 640 8 Q960 60 1280 8" fill="none" stroke="${col}" stroke-width="${w}"/>`;
const PLANT = `<svg viewBox="0 0 110 190" width="110" height="190">
  <g fill="#4caf50"><ellipse cx="55" cy="60" rx="12" ry="40" transform="rotate(-8 55 60)"/>
  <ellipse cx="32" cy="80" rx="11" ry="34" transform="rotate(-38 32 80)" fill="#5cc45f"/><ellipse cx="80" cy="78" rx="11" ry="34" transform="rotate(36 80 78)" fill="#3fa043"/>
  <ellipse cx="22" cy="108" rx="9" ry="26" transform="rotate(-62 22 108)" fill="#66cc66"/><ellipse cx="90" cy="106" rx="9" ry="26" transform="rotate(60 90 106)"/></g>
  <path d="M22 128 L88 128 L80 188 L30 188 Z" fill="#e8835a"/><rect x="16" y="120" width="78" height="16" rx="6" fill="#f39c72"/></svg>`;

const THEMES = {
  vietnam: {
    vars: { wallA: '#fff3df', wallB: '#ffe9cc', wain: '#ffd2a6', trim: '#f3b77f', c1: '#d8955c', c2: '#b5713f', ctop: '#f0b47a' },
    top() {
      const colors = ['#ff5a5a', '#ffc93c', '#ff8a5b', '#ff6f91'];
      let s = STRING('#7a4b2a');
      for (let i = 0; i < 12; i++) {
        const x = 54 + i * 106, y = stringY(x), col = colors[i % 4];
        s += `<g class="lantern" style="animation-delay:${-i * 0.37}s"><line x1="${x}" y1="${y}" x2="${x}" y2="${y + 7}" stroke="#7a4b2a" stroke-width="2"/>
          <rect x="${x - 6}" y="${y + 6}" width="12" height="4" rx="2" fill="#c9932e"/><ellipse cx="${x}" cy="${y + 22}" rx="13" ry="14" fill="${col}"/>
          <path d="M${x - 6} ${y + 10} Q${x - 11} ${y + 22} ${x - 6} ${y + 34} M${x + 6} ${y + 10} Q${x + 11} ${y + 22} ${x + 6} ${y + 34}" stroke="#000" stroke-opacity=".13" stroke-width="2" fill="none"/>
          <rect x="${x - 6}" y="${y + 34}" width="12" height="4" rx="2" fill="#c9932e"/><line x1="${x}" y1="${y + 38}" x2="${x}" y2="${y + 48}" stroke="#ffc93c" stroke-width="3"/></g>`;
      }
      return s;
    },
    side: () => `<div class="open-sign">OPEN</div>${PLANT}`,
  },

  japan: {
    vars: { wallA: '#fdf6f0', wallB: '#f9ebe5', wain: 'repeating-linear-gradient(90deg,#e7c49a 0 58px,#d6ad7c 58px 61px)', trim: '#b9864f', c1: '#e3b37c', c2: '#c08a52', ctop: '#f2d2a2' },
    top() {
      seed = 11;
      let s = `<path d="M-10 10 Q200 42 420 18 T860 22 T1290 10" stroke="#7a4b35" stroke-width="8" fill="none" stroke-linecap="round"/>
        <path d="M180 30 q30 10 50 34 M520 22 q-20 20 -26 40 M760 26 q30 6 46 30 M1100 18 q-24 18 -30 36" stroke="#7a4b35" stroke-width="4" fill="none" stroke-linecap="round"/>`;
      for (let i = 0; i < 46; i++) {
        const x = i * 28 + srand() * 20, y = 14 + srand() * 34, r = 5 + srand() * 3, col = srand() > 0.5 ? '#ffc0d3' : '#ffd6e2';
        s += `<g transform="translate(${x} ${y})">${[0, 72, 144, 216, 288].map(a => `<ellipse rx="${r * 0.6}" ry="${r}" transform="rotate(${a}) translate(0 ${-r * 0.8})" fill="${col}"/>`).join('')}<circle r="${r * 0.35}" fill="#ff8fab"/></g>`;
      }
      [307, 592].forEach((x, i) => {
        s += `<g class="lantern" style="animation-delay:${-i * 0.6}s"><line x1="${x}" y1="20" x2="${x}" y2="32" stroke="#3b2a20" stroke-width="2"/>
          <rect x="${x - 10}" y="30" width="20" height="5" rx="2" fill="#2d2440"/><ellipse cx="${x}" cy="54" rx="17" ry="20" fill="#fff8ee"/>
          <path d="M${x - 17} 46 L${x + 17} 46 M${x - 17} 54 L${x + 17} 54 M${x - 16} 62 L${x + 16} 62" stroke="#f0d9c4" stroke-width="1.5"/>
          <circle cx="${x}" cy="54" r="8" fill="#e53935"/><rect x="${x - 10}" y="72" width="20" height="5" rx="2" fill="#2d2440"/>
          <line x1="${x}" y1="77" x2="${x}" y2="88" stroke="#e53935" stroke-width="3"/></g>`;
      });
      return s;
    },
    side: () => `<svg viewBox="0 0 110 285" width="110" height="285">
      <defs><clipPath id="jpwin"><circle cx="55" cy="62" r="46"/></clipPath><linearGradient id="jpsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bfe3ff"/><stop offset="1" stop-color="#ffe3ec"/></linearGradient></defs>
      <g clip-path="url(#jpwin)"><rect x="0" y="0" width="110" height="120" fill="url(#jpsky)"/><circle cx="80" cy="36" r="10" fill="#ff6f61"/>
        <path d="M0 112 L40 60 Q55 50 70 60 L110 112Z" fill="#7d9bd1"/><path d="M40 60 Q55 50 70 60 L63 70 L56 63 L49 71 L44 66Z" fill="#fff"/></g>
      <circle cx="55" cy="62" r="46" fill="none" stroke="#7a4b35" stroke-width="7"/>
      <g transform="translate(55 238)">
        <ellipse cx="0" cy="42" rx="34" ry="5" fill="#000" opacity=".1"/>
        <ellipse cx="0" cy="18" rx="30" ry="26" fill="#fff" stroke="#e2d6cc" stroke-width="2.5"/>
        <path d="M-22 -40 L-24 -58 L-8 -46Z M22 -40 L24 -58 L8 -46Z" fill="#fff" stroke="#e2d6cc" stroke-width="2.5"/>
        <circle cx="0" cy="-26" r="24" fill="#fff" stroke="#e2d6cc" stroke-width="2.5"/>
        <path d="M-12 -28 q4 -4 8 0 M4 -28 q4 -4 8 0" stroke="#3b2a20" stroke-width="2.5" fill="none" stroke-linecap="round"/>
        <path d="M-4 -18 q4 4 8 0" stroke="#3b2a20" stroke-width="2" fill="none"/><ellipse cx="-14" cy="-20" rx="5" ry="3" fill="#ffb3c7"/><ellipse cx="14" cy="-20" rx="5" ry="3" fill="#ffb3c7"/>
        <path d="M-20 -6 Q0 4 20 -6" stroke="#e53935" stroke-width="5" fill="none"/><circle cx="0" cy="2" r="5" fill="#ffc93c"/>
        <g class="wave"><ellipse cx="26" cy="-30" rx="9" ry="16" fill="#fff" stroke="#e2d6cc" stroke-width="2.5"/></g>
        <ellipse cx="-14" cy="26" rx="9" ry="7" fill="#fff" stroke="#e2d6cc" stroke-width="2"/>
      </g></svg>`,
    particles: 'petals',
  },

  china: {
    vars: { wallA: '#fff3e2', wallB: '#ffe6c8', wain: 'repeating-linear-gradient(45deg,#d9443a 0 16px,#cc3a31 16px 32px)', trim: '#f2c14e', c1: '#b34a3c', c2: '#842f27', ctop: '#d0675a' },
    top() {
      let s = STRING('#d4a017', 3);
      for (let i = 0; i < 8; i++) {
        const x = 80 + i * 160, y = stringY(x);
        s += `<g class="lantern" style="animation-delay:${-i * 0.45}s"><line x1="${x}" y1="${y}" x2="${x}" y2="${y + 8}" stroke="#d4a017" stroke-width="2"/>
          <rect x="${x - 10}" y="${y + 7}" width="20" height="6" rx="2" fill="#f2c14e"/>
          <ellipse cx="${x}" cy="${y + 30}" rx="22" ry="18" fill="#e53935"/>
          <path d="M${x - 10} ${y + 13} Q${x - 18} ${y + 30} ${x - 10} ${y + 47} M${x} ${y + 12} L${x} ${y + 48} M${x + 10} ${y + 13} Q${x + 18} ${y + 30} ${x + 10} ${y + 47}" stroke="#b71c1c" stroke-width="2" fill="none"/>
          <rect x="${x - 10}" y="${y + 46}" width="20" height="6" rx="2" fill="#f2c14e"/>
          <path d="M${x - 4} ${y + 52} L${x - 6} ${y + 68} M${x} ${y + 52} L${x} ${y + 70} M${x + 4} ${y + 52} L${x + 6} ${y + 68}" stroke="#e53935" stroke-width="2.5"/></g>`;
        if (i < 7) { const x2 = x + 80, y2 = stringY(x2); s += `<g transform="translate(${x2} ${y2 + 10})"><path d="M0 -8 L8 0 L0 8 L-8 0Z" fill="#e53935" stroke="#f2c14e" stroke-width="2"/><line x1="0" y1="8" x2="0" y2="20" stroke="#e53935" stroke-width="2"/></g>`; }
      }
      return s;
    },
    side: () => `<svg viewBox="0 0 110 285" width="110" height="285">
      <g transform="translate(55 52) rotate(45)"><rect x="-32" y="-32" width="64" height="64" rx="6" fill="#e53935" stroke="#f2c14e" stroke-width="5"/></g>
      <text x="55" y="66" text-anchor="middle" font-size="40" font-weight="700" fill="#f2c14e" font-family="serif">福</text>
      <path d="M55 98 L55 118" stroke="#f2c14e" stroke-width="3"/><path d="M50 118 L48 136 M55 118 L55 140 M60 118 L62 136" stroke="#e53935" stroke-width="3"/>
      ${[0, 1, 2].map(i => { const y = 268 - i * 32; return `<rect x="12" y="${y - 26}" width="86" height="28" fill="#e3c07e"/><path d="M12 ${y - 16} L98 ${y - 16} M12 ${y - 6} L98 ${y - 6}" stroke="#c99a52" stroke-width="2"/><ellipse cx="55" cy="${y}" rx="43" ry="7" fill="#c99a52"/>`; }).join('')}
      <path d="M12 178 Q55 150 98 178Z" fill="#d6ad62"/><circle cx="55" cy="160" r="5" fill="#c99a52"/>
      <g class="steam" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".9"><path d="M38 150 q-6 -9 0 -18 t0 -18"/><path d="M55 146 q-6 -9 0 -18 t0 -18"/><path d="M72 150 q-6 -9 0 -18 t0 -18"/></g>
      </svg>`,
  },

  italy: {
    vars: { wallA: '#fff8ec', wallB: '#fbefdb', wain: 'conic-gradient(#e53935 25%, #fff 0 50%, #e53935 0 75%, #fff 0) 0 0/40px 40px', trim: '#2e9e44', c1: '#b8794a', c2: '#8f5530', ctop: '#d39a66' },
    top() {
      seed = 5;
      let s = `<defs><radialGradient id="bulbglow"><stop offset="0" stop-color="#fff7c2"/><stop offset=".5" stop-color="#ffe066" stop-opacity=".8"/><stop offset="1" stop-color="#ffe066" stop-opacity="0"/></radialGradient></defs>`;
      s += `<path d="M0 8 Q160 44 320 10 Q480 44 640 10 Q800 44 960 10 Q1120 44 1280 8" fill="none" stroke="#4a3b30" stroke-width="2.5"/>`;
      const y4 = x => { const seg = Math.floor(x / 320), t = (x - seg * 320) / 320; return (1 - t) * (1 - t) * 10 + 2 * (1 - t) * t * 44 + t * t * 10; };
      for (let x = 20; x < 1280; x += 40) {
        const y = y4(x);
        if (srand() > 0.45) s += `<ellipse cx="${x + 12}" cy="${y - 2}" rx="8" ry="4" transform="rotate(${srand() * 60 - 30} ${x + 12} ${y - 2})" fill="${srand() > 0.5 ? '#4caf50' : '#2e9e44'}"/>`;
        s += `<rect x="${x - 3}" y="${y}" width="6" height="7" fill="#4a3b30"/><circle class="twinkle" style="animation-delay:${-srand() * 2}s" cx="${x}" cy="${y + 14}" r="16" fill="url(#bulbglow)"/><ellipse cx="${x}" cy="${y + 13}" rx="5" ry="7" fill="#fff3b0"/>`;
      }
      [[260, '#7b3fa0'], [1000, '#7b3fa0']].forEach(([x, c]) => {
        const y = y4(x) + 10;
        s += `<g>${[[0, 0], [8, 0], [16, 0], [4, 7], [12, 7], [8, 14]].map(([dx, dy]) => `<circle cx="${x + dx - 8}" cy="${y + dy}" r="5" fill="${c}"/>`).join('')}</g>`;
      });
      return s;
    },
    side: () => `<svg viewBox="0 0 110 285" width="110" height="285">
      <defs><clipPath id="itwin"><path d="M12 150 L12 62 Q12 18 55 18 Q98 18 98 62 L98 150Z"/></clipPath></defs>
      <g clip-path="url(#itwin)"><rect x="0" y="0" width="110" height="160" fill="#9fd8ff"/><circle cx="78" cy="44" r="11" fill="#ffd54f"/>
        <rect x="8" y="96" width="34" height="60" fill="#ffcc80"/><path d="M4 98 L25 80 L46 98Z" fill="#e2703a"/>
        <rect x="44" y="84" width="30" height="72" fill="#ffe0b2"/><path d="M40 86 L59 68 L78 86Z" fill="#d35400"/>
        <rect x="74" y="104" width="32" height="52" fill="#ffab91"/><path d="M70 106 L90 90 L110 106Z" fill="#e2703a"/>
        <g fill="#5d8bc7"><rect x="16" y="108" width="7" height="10"/><rect x="28" y="108" width="7" height="10"/><rect x="52" y="96" width="6" height="10"/><rect x="62" y="96" width="6" height="10"/><rect x="82" y="116" width="7" height="10"/><rect x="94" y="116" width="7" height="10"/></g>
        <rect x="54" y="20" width="6" height="64" fill="#e7c9a0"/></g>
      <path d="M12 150 L12 62 Q12 18 55 18 Q98 18 98 62 L98 150Z" fill="none" stroke="#2e9e44" stroke-width="7"/>
      <rect x="6" y="148" width="98" height="10" rx="3" fill="#2e9e44"/>
      <g transform="translate(55 210)"><rect x="-22" y="40" width="44" height="34" rx="4" fill="#e8835a"/><rect x="-26" y="34" width="52" height="10" rx="4" fill="#f39c72"/>
        ${[[-14, 10, -30], [0, 0, 0], [14, 10, 30], [-20, 26, -60], [20, 26, 60], [-6, 20, -15], [8, 20, 20]].map(([x, y, r]) => `<ellipse cx="${x}" cy="${y}" rx="8" ry="13" transform="rotate(${r} ${x} ${y})" fill="${r % 2 ? '#2e9e44' : '#45b85a'}"/>`).join('')}
        <circle cx="-10" cy="4" r="6" fill="#e53935"/><circle cx="12" cy="14" r="6" fill="#e53935"/></g>
      </svg>`,
  },

  newyork: {
    vars: { wallA: '#e8f8f5', wallB: '#d7f0eb', wain: 'conic-gradient(#3b3b48 25%, #fff 0 50%, #3b3b48 0 75%, #fff 0) 0 0/36px 36px', trim: '#ff6f61', c1: '#ff7b6e', c2: '#d4493d', ctop: '#dfe6ec' },
    top() {
      let s = `<defs><radialGradient id="lampglow"><stop offset="0" stop-color="#fff6c8" stop-opacity=".9"/><stop offset="1" stop-color="#fff6c8" stop-opacity="0"/></radialGradient></defs>`;
      for (let i = 0; i < 6; i++) {
        const x = 110 + i * 175, col = i % 2 ? '#ff6f61' : '#3fb2a6', len = 24 + (i % 2) * 10;
        s += `<g class="lantern" style="animation-delay:${-i * 0.5}s"><line x1="${x}" y1="0" x2="${x}" y2="${len}" stroke="#555" stroke-width="2"/>
          <ellipse cx="${x}" cy="${len + 30}" rx="34" ry="18" fill="url(#lampglow)"/>
          <path d="M${x - 30} ${len + 26} Q${x - 28} ${len} ${x} ${len} Q${x + 28} ${len} ${x + 30} ${len + 26}Z" fill="${col}"/>
          <rect x="${x - 31}" y="${len + 23}" width="62" height="5" rx="2" fill="${shade(col, -0.2)}"/><ellipse cx="${x}" cy="${len + 30}" rx="8" ry="5" fill="#fff8d0"/></g>`;
      }
      return s;
    },
    side: () => `<div class="open-sign" style="--neon:#29d3ff;--neonText:#9ff0ff;font-size:22px">DINER</div>
      <svg viewBox="0 0 110 285" width="110" height="285">
      <defs><linearGradient id="nysky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fd3ff"/><stop offset="1" stop-color="#ffd1e0"/></linearGradient></defs>
      <rect x="8" y="64" width="94" height="120" fill="url(#nysky)"/>
      <g fill="#5b6b8c"><rect x="10" y="120" width="18" height="64"/><rect x="30" y="96" width="16" height="88"/><rect x="48" y="84" width="14" height="100"/><path d="M50 84 L55 70 L60 84Z"/><line x1="55" y1="60" x2="55" y2="70" stroke="#5b6b8c" stroke-width="2"/><rect x="64" y="110" width="18" height="74"/><rect x="84" y="128" width="16" height="56"/></g>
      <g fill="#ffe066">${[[14, 128], [20, 140], [34, 104], [40, 118], [34, 132], [51, 92], [56, 106], [51, 122], [68, 118], [74, 132], [88, 136], [94, 150], [14, 156], [40, 150], [56, 146], [70, 160]].map(([x, y]) => `<rect x="${x}" y="${y}" width="4" height="5"/>`).join('')}</g>
      <rect x="8" y="64" width="94" height="120" fill="none" stroke="#fff" stroke-width="6"/><line x1="55" y1="64" x2="55" y2="184" stroke="#fff" stroke-width="4"/>
      <g transform="translate(0 0)"><rect x="22" y="232" width="20" height="44" rx="6" fill="#e53935"/><path d="M27 232 L29 216 L35 216 L37 232Z" fill="#c62828"/>
        <rect x="58" y="232" width="20" height="44" rx="6" fill="#ffd21f"/><path d="M63 232 L65 216 L71 216 L73 232Z" fill="#e53935"/>
        <rect x="26" y="248" width="12" height="10" fill="#fff" opacity=".7"/><rect x="62" y="248" width="12" height="10" fill="#fff" opacity=".7"/></g>
      </svg>`,
  },
};

function applyTheme(key) {
  const th = THEMES[key], st = $('#stage');
  Object.entries(th.vars).forEach(([k, v]) => st.style.setProperty('--' + k, v));
  $('#topdeco').innerHTML = th.top();
  $('#decor').innerHTML = th.side();
  const petals = $('#petals');
  petals.innerHTML = '';
  if (th.particles === 'petals') {
    for (let i = 0; i < 16; i++) {
      const p = document.createElement('div');
      p.className = 'petal';
      p.style.left = rand(0, 1240) + 'px';
      p.style.animationDuration = rand(6, 11) + 's';
      p.style.animationDelay = -rand(0, 11) + 's';
      p.style.setProperty('--dx', rand(30, 140) + 'px');
      petals.appendChild(p);
    }
  }
}

/* =========================================================
   GAME STATE
   ========================================================= */
const state = {
  level: LEVELS[0], money: 0, strikes: 0, tray: [], customers: [null, null, null], buttons: [],
  spawnTimer: 0, running: false, paused: false, criticPhase: 'none', run: 0,
};
const seatEls = $$('.seat');
let nextId = 1;

/* ---------------- UI helpers ---------------- */
let toastTimer;
function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 1600);
}
function banner(msg, ms = 2200) {
  const b = $('#banner'); b.textContent = msg; b.classList.add('show');
  setTimeout(() => b.classList.remove('show'), ms);
}
function replayClass(el, cls) { el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); }

let chefTimer, chefSayTimer;
function setChef(mood, ms) {
  $('#chef').innerHTML = chefArt(mood);
  clearTimeout(chefTimer);
  if (ms) chefTimer = setTimeout(() => { $('#chef').innerHTML = chefArt('neutral'); }, ms);
}
function chefAnim(cls) { replayClass($('#chef'), cls); }
function chefSay(text) {
  const el = $('#chef-say'); el.textContent = text; el.classList.add('show');
  clearTimeout(chefSayTimer); chefSayTimer = setTimeout(() => el.classList.remove('show'), 1400);
}

function showScreen(id) { $$('.screen').forEach(s => s.classList.toggle('show', s.id === id)); }
function hideScreens() { $$('.screen').forEach(s => s.classList.remove('show')); }
const isShown = id => $('#' + id).classList.contains('show');
const starsHTML = (n, max = 3) => Array.from({ length: max }, (_, i) => `<span class="${i < n ? 'on' : ''}">★</span>`).join('');

/* ---------------- HUD / menu / ingredients ---------------- */
function updateHUD() {
  const lv = state.level;
  $('#hud-level').textContent = `Level ${lv.id} · ${lv.name}`;
  const criticTime = lv.critic && state.criticPhase !== 'none';
  $('#hud-money').textContent = criticTime ? `$${state.money} · Critic!` : `$${state.money} / $${lv.goal}`;
  $('#goal-fill').style.width = Math.min(100, state.money / lv.goal * 100) + '%';
  $('#hud-hearts').innerHTML = [0, 1, 2].map(i => `<span class="heart ${i < 3 - state.strikes ? '' : 'lost'}">♥</span>`).join('');
  $('#btn-music').classList.toggle('off', !Sound.on);
}

function renderMenu() {
  const lv = state.level, many = lv.dishes.length > 3;
  let h = `<div class="menu-title">MENU</div><div class="menu-sub">${lv.name.toUpperCase()}</div>`;
  for (const k of lv.dishes) {
    const d = DISHES[k];
    h += `<div class="menu-item"><div class="mi-name">${d.name}<span class="mi-price">$${d.price}</span></div>
      <div class="mi-ings">${d.ingredients.map(i => icon(i, many ? 26 : 30)).join('')}</div></div>`;
  }
  h += `<div class="menu-tip">${lv.tip}</div>`;
  $('#menu-board').innerHTML = h;
}

// The buttons for this level: every ingredient used by its dishes, grouped by dish
function levelIngredients(lv) {
  const out = [];
  lv.dishes.forEach(d => DISHES[d].ingredients.forEach(i => { if (!out.includes(i)) out.push(i); }));
  lv.dishes.forEach(d => DISHES[d].addons.forEach(i => { if (!out.includes(i)) out.push(i); }));
  return out;
}
function buildIngredients() {
  const list = levelIngredients(state.level);
  state.buttons = list;
  const rows = list.length > 12 ? 3 : 2;
  const cols = Math.ceil(list.length / rows);
  const panel = $('#ing-panel');
  panel.style.setProperty('--cols', cols);
  panel.classList.toggle('narrow', cols >= 5);
  panel.classList.toggle('rows3', rows === 3);
  const size = rows === 3 ? 34 : cols >= 6 ? 46 : cols >= 5 ? 52 : 58;
  panel.innerHTML = list.map((id, i) => `<button class="ing-btn" data-ing="${id}">
      <kbd>${KEYS[i].toUpperCase()}</kbd><span class="ing-check">✓</span>${icon(id, size)}<span class="ing-name">${INGREDIENTS[id]}</span></button>`).join('');
}

function renderTray() {
  const tray = state.tray;
  $('#tray').innerHTML = trayArt(tray);
  $$('.ing-btn').forEach(b => b.classList.toggle('in-tray', tray.includes(b.dataset.ing)));
  const label = $('#tray-label');
  if (!tray.length) { label.textContent = ''; return; }
  const cands = trayCandidates(tray);
  if (!cands.length) label.textContent = "Uh oh, that's a mix-up! Trash it 🗑";
  else label.textContent = `${cands.map(c => DISHES[c].name).join(' or ')}? Click a customer to serve!`;
}

/* ---------------- Customers ---------------- */
// Build an order. Each order can have a "NO ___!" and/or an "ADD ___!" request.
function makeOrder(dish, forceRequest = false, forceBoth = false) {
  const lv = state.level, D = DISHES[dish];
  const canNo = removable(dish), canAdd = D.addons;
  let without = [], add = [];
  const wantRequest = forceRequest || Math.random() < lv.request;
  if (wantRequest && (canNo.length || canAdd.length)) {
    const both = forceBoth || Math.random() < lv.both;
    if (both && canNo.length && canAdd.length) { without = [pick(canNo)]; add = [pick(canAdd)]; }
    else if (canAdd.length && (!canNo.length || Math.random() < 0.5)) add = [pick(canAdd)];
    else without = [pick(canNo)];
  }
  return { dish, without, add, items: D.ingredients.filter(i => !without.includes(i)).concat(add) };
}
function freeSeats() {
  const out = [];
  for (let i = 0; i < state.level.seats; i++) if (!state.customers[i]) out.push(i);
  return out;
}
function bubbleHTML(c) {
  const o = c.courses[c.course];
  const reqs = o.without.map(i => `<div class="o-req no">NO ${INGREDIENTS[i].toUpperCase()}! <span class="no-ic">${icon(i, 26)}</span></div>`)
    .concat(o.add.map(i => `<div class="o-req add">ADD ${INGREDIENTS[i].toUpperCase()}! ${icon(i, 26)}</div>`)).join('');
  return `<div class="o-head ${reqs ? '' : 'plain'}">${c.isCritic ? '<span class="critic-tag">★ CRITIC</span>' : ''}<span>${DISHES[o.dish].name}</span>
      ${c.isCritic ? `<span class="o-course">${c.course + 1}/2</span>` : ''}</div>
    ${reqs}<div class="pbar"><div class="pfill"></div></div>`;
}
const artFor = c => (c.isCritic ? criticArt(c.mood) : customerArt(c.look, c.mood));

function spawnCustomer(seat, isCritic = false) {
  const lv = state.level;
  const c = { id: nextId++, seat, isCritic, course: 0, leaving: false, mood: 'happy' };
  if (isCritic) {
    const first = pick(lv.dishes);
    const second = pick(lv.dishes.filter(d => d !== first));
    c.courses = [makeOrder(first, true, true), makeOrder(second, true)];
    c.maxPatience = 26;
  } else {
    c.look = randomLook();
    state.served++;
    c.courses = [makeOrder(pick(lv.dishes), (lv.requestAt || []).includes(state.served))];
    c.maxPatience = lv.patience * rand(0.9, 1.1);
  }
  c.patience = c.maxPatience;
  state.customers[seat] = c;

  const el = seatEls[seat];
  el.classList.add('occupied');
  el.innerHTML = `<div class="cust-wrap enter">
      <div class="bubble ${isCritic ? 'critic' : ''}">${bubbleHTML(c)}</div>
      <div class="cust-body">${artFor(c)}</div>
      <div class="cust-speech"></div></div>`;
  c.wrap = el.querySelector('.cust-wrap');
  c.wrap.addEventListener('animationend', () => c.wrap.classList.remove('enter', 'shake'));
  c.bubble = el.querySelector('.bubble');
  c.fill = el.querySelector('.pfill');
  c.body = el.querySelector('.cust-body');
  c.speech = el.querySelector('.cust-speech');
  Sound.bell();
}

function say(c, text, ms = 1300) {
  c.speech.textContent = text; c.speech.classList.add('show');
  clearTimeout(c.sayTimer); c.sayTimer = setTimeout(() => c.speech.classList.remove('show'), ms);
}
function setMood(c, mood) {
  if (c.mood === mood) return;
  c.mood = mood; c.body.innerHTML = artFor(c);
}
function customerLeave(c, how) {
  c.leaving = true;
  setMood(c, how === 'happy' ? 'happy' : 'angry');
  c.wrap.classList.remove('enter', 'shake');
  c.wrap.classList.add(how === 'happy' ? 'leave-happy' : 'leave-angry');
  const run = state.run, el = seatEls[c.seat];
  setTimeout(() => {
    if (run !== state.run) return;
    if (state.customers[c.seat] === c) state.customers[c.seat] = null;
    el.innerHTML = ''; el.classList.remove('occupied');
  }, how === 'happy' ? 750 : 850);
}
function clearSeats() {
  seatEls.forEach((el, i) => {
    el.innerHTML = ''; el.classList.remove('occupied');
    el.classList.toggle('closed', i >= state.level.seats);
  });
  state.customers = [null, null, null];
}

/* ---------------- Player actions ---------------- */
const THANKS = {
  vietnam: ['Ngon quá!', 'Cảm ơn!', 'Yum!', 'Delicious!'],
  japan: ['Oishii!', 'Arigatou!', 'Yum!', 'Perfect!'],
  china: ['Hǎo chī!', 'Xièxie!', 'Yum!', 'So good!'],
  italy: ['Delizioso!', 'Grazie!', 'Mamma mia!', 'Bellissimo!'],
  newyork: ['Awesome!', 'Thanks!', 'So good!', 'Best in town!'],
};
const canPlay = () => state.running && !state.paused;

function addIngredient(id) {
  if (!canPlay() || !state.buttons.includes(id)) return;
  const btn = $(`.ing-btn[data-ing="${id}"]`);
  if (state.tray.includes(id)) { toast(`${INGREDIENTS[id]} is already on the tray!`); Sound.nope(); return; }
  state.tray.push(id);
  Sound.pop(); chefAnim('bounce');
  if (btn) { btn.classList.add('press'); setTimeout(() => btn.classList.remove('press'), 110); }
  renderTray();
}
function trash() {
  if (!canPlay() || !state.tray.length) return;
  state.tray = []; Sound.trash(); renderTray(); replayClass($('#tray'), 'wobble');
}
function serve(seat) {
  if (!canPlay()) return;
  const c = state.customers[seat];
  if (!c || c.leaving) return;
  if (!state.tray.length) { toast('Build a dish first, then click the customer!'); replayClass($('#tray'), 'wobble'); Sound.nope(); return; }
  const o = c.courses[c.course];

  if (sameSet(state.tray, o.items)) {
    const tip = Math.round((c.patience / c.maxPatience) * 5);
    const pay = DISHES[o.dish].price + tip;
    state.money += pay;
    floatMoney(seat, pay, tip);
    Sound.coin(); setChef('yay', 900); chefAnim('jump');
    state.tray = []; renderTray();

    if (c.isCritic) {
      c.course++;
      if (c.course < c.courses.length) {
        say(c, `Magnifique! Now... the ${DISHES[c.courses[c.course].dish].name}.`, 1800);
        c.patience = c.maxPatience;
        c.bubble.innerHTML = bubbleHTML(c); c.fill = c.bubble.querySelector('.pfill');
      } else {
        say(c, '★★★★★ Superb!', 1500);
        customerLeave(c, 'happy');
        state.running = false;
        setTimeout(levelComplete, 1300);
      }
    } else {
      say(c, pick(THANKS[state.level.theme]));
      customerLeave(c, 'happy');
    }
    updateHUD(); checkGoal();
  } else {
    // Wrong dish: lose money, the dish is thrown away, the customer keeps waiting
    const lost = Math.min(WRONG_PENALTY, state.money);
    state.money -= lost;
    floatMoney(seat, -WRONG_PENALTY);
    Sound.wrong(); setChef('oops', 800); chefAnim('oops');
    state.tray = []; renderTray(); replayClass($('#tray'), 'wobble');
    replayClass(c.wrap, 'shake');
    updateHUD();
  }
}
function floatMoney(seat, pay, tip) {
  const el = document.createElement('div');
  el.className = 'float-money' + (pay < 0 ? ' minus' : '');
  el.style.left = (parseInt(getComputedStyle(seatEls[seat]).left, 10) + 125) + 'px';
  el.style.top = '220px';
  el.innerHTML = pay < 0 ? `-$${-pay}<small>wrong dish!</small>` : `+$${pay}${tip ? `<small>incl. $${tip} tip</small>` : ''}`;
  $('#fx').appendChild(el);
  setTimeout(() => el.remove(), 1300);
}
function checkGoal() {
  const lv = state.level;
  if (state.money < lv.goal || !state.running) return;
  if (lv.critic) {
    if (state.criticPhase === 'none') {
      state.criticPhase = 'waiting';
      banner('⭐ The Food Critic is coming! ⭐', 2400);
      Sound.fanfare(); updateHUD();
    }
  } else {
    state.running = false;
    setTimeout(levelComplete, 700);
  }
}

/* ---------------- Level flow ---------------- */
function startLevel(id) {
  const lv = LEVELS[id - 1];
  state.run++;
  Object.assign(state, { level: lv, money: 0, strikes: 0, tray: [], served: 0, spawnTimer: 1.2, running: false, paused: false, criticPhase: 'none' });
  applyTheme(lv.theme);
  clearSeats(); buildIngredients(); renderTray(); renderMenu(); updateHUD(); setChef('neutral');
  Sound.setStyle(lv.music);
  $('#intro-kicker').textContent = `Level ${lv.id}`;
  $('#intro-title').textContent = `${lv.emoji} ${lv.name}`;
  $('#intro-text').innerHTML = lv.intro;
  $('#intro-dishes').innerHTML = lv.dishes.map(d => `<div class="intro-dish"><b>${DISHES[d].name}</b>${DISHES[d].ingredients.map(i => icon(i, 32)).join('')}</div>`).join('');
  $('#intro-goal').innerHTML = `🎯 Goal: earn <b>$${lv.goal}</b>${lv.critic ? ', then impress the food critic' : ''}`;
  showScreen('scr-intro');
}
function beginPlay() {
  hideScreens();
  state.running = true;
  chefSay("Let's cook!");
  Sound.start();
}
function levelComplete() {
  const lv = state.level;
  state.running = false;
  const stars = Math.max(1, 3 - state.strikes);
  save.stars[lv.id] = Math.max(save.stars[lv.id] || 0, stars);
  save.unlocked = Math.max(save.unlocked, Math.min(LEVELS.length, lv.id + 1));
  writeSave();
  if (lv.id === LEVELS.length) {
    Sound.bigwin();
    const total = LEVELS.reduce((sum, l) => sum + (save.stars[l.id] || 0), 0);
    $('#win-critic').innerHTML = criticArt('happy', 120, 172);
    $('#win-text').innerHTML = `Total stars: <b>${total} / ${LEVELS.length * 3} ⭐</b>. ${total === LEVELS.length * 3 ? 'A perfect score!' : 'Can you get them all?'}`;
    showScreen('scr-win');
    confetti();
  } else {
    Sound.win();
    const next = LEVELS[lv.id];
    $('#complete-title').textContent = `${lv.name} Complete! 🎉`;
    $('#complete-stars').innerHTML = starsHTML(stars);
    $('#complete-text').innerHTML = `You earned <b>$${state.money}</b> with ${state.strikes} angry customer${state.strikes === 1 ? '' : 's'}.<br>Next stop: <b>${next.emoji} ${next.name}</b>!`;
    showScreen('scr-complete');
  }
}
function levelFail(reason) {
  if (!state.running) return;
  state.running = false;
  Sound.fail(); setChef('oops');
  $('#fail-text').textContent = reason;
  setTimeout(() => showScreen('scr-fail'), 800);
}
function togglePause() {
  if (!state.running) return;
  state.paused = !state.paused;
  state.paused ? showScreen('scr-pause') : hideScreens();
}
function confetti() {
  const colors = ['#ff6f61', '#ffc93c', '#3fb2a6', '#a58bf0', '#ff8ab3', '#7ccc4f'];
  for (let i = 0; i < 110; i++) {
    const p = document.createElement('div');
    p.className = 'confetti';
    p.style.left = rand(0, 1280) + 'px';
    p.style.background = pick(colors);
    p.style.animationDuration = rand(2.2, 4) + 's';
    p.style.animationDelay = rand(0, 1.2) + 's';
    $('#fx').appendChild(p);
    setTimeout(() => p.remove(), 5500);
  }
}
function renderLevelCards() {
  $('#soon-cards').innerHTML = COMING_SOON.map(([n, e]) => `<div class="soon-card"><div class="sc-emoji">${e}</div><b>${n}</b><span>🔒 Coming soon</span></div>`).join('');
  $('#level-cards').innerHTML = LEVELS.map(l => {
    const locked = l.id > save.unlocked;
    return `<button class="level-card ${locked ? 'locked' : ''}" data-level="${l.id}" ${locked ? 'disabled' : ''}>
      <div class="lc-num">${locked ? '🔒' : l.id}</div>
      <div class="lc-emoji">${l.emoji}</div>
      <div class="lc-title">${l.name}</div>
      <div class="lc-goal">${l.dishes.length} dishes · $${l.goal}</div>
      <div class="stars">${starsHTML(save.stars[l.id] || 0)}</div></button>`;
  }).join('');
}

/* =========================================================
   MAIN LOOP — runs every frame
   ========================================================= */
function update(dt) {
  const lv = state.level;
  if (state.criticPhase === 'none') {
    state.spawnTimer -= dt;
    if (state.spawnTimer <= 0) {
      const free = freeSeats();
      if (free.length) { spawnCustomer(pick(free)); state.spawnTimer = rand(...lv.spawnEvery); }
      else state.spawnTimer = 0.6;
    }
  } else if (state.criticPhase === 'waiting') {
    const free = freeSeats();
    if (free.length) { spawnCustomer(free.includes(1) ? 1 : free[0], true); state.criticPhase = 'here'; }
  }

  for (const c of state.customers) {
    if (!c || c.leaving) continue;
    c.patience -= dt;
    const frac = Math.max(0, c.patience / c.maxPatience);
    c.fill.style.width = (frac * 100) + '%';
    c.fill.style.background = frac > 0.5 ? '#4cd964' : frac > 0.25 ? '#ffc93c' : '#ff5a5a';
    c.bubble.classList.toggle('urgent', frac < 0.25);
    setMood(c, frac > 0.55 ? 'happy' : frac > 0.3 ? 'neutral' : frac > 0.12 ? 'worried' : 'angry');

    if (c.patience <= 0) {
      if (c.isCritic) {
        say(c, 'Hmph! One star!', 1500);
        customerLeave(c, 'angry'); Sound.angry();
        levelFail('The food critic got tired of waiting and stormed out! Serve the critic faster next time.');
        return;
      }
      say(c, pick(['Too slow!', 'Hmph!', "I'm leaving!", 'Ugh!']));
      customerLeave(c, 'angry');
      state.strikes++; Sound.angry(); setChef('oops', 900); chefAnim('oops');
      updateHUD();
      if (state.strikes >= 3) { levelFail('3 customers left angry. Try serving the ones with red bars first!'); return; }
    }
  }
}
let last = performance.now();
function frame(now) {
  const dt = Math.min(0.1, (now - last) / 1000);
  last = now;
  if (canPlay()) update(dt);
  requestAnimationFrame(frame);
}

/* =========================================================
   INPUT
   ========================================================= */
function fit() {
  const s = Math.min(window.innerWidth / 1280, window.innerHeight / 720);
  $('#stage').style.transform = `translate(-50%, -50%) scale(${s})`;
}
window.addEventListener('resize', fit);

$('#ing-panel').addEventListener('click', e => {
  const b = e.target.closest('.ing-btn');
  if (b) addIngredient(b.dataset.ing);
});
seatEls.forEach((el, i) => el.addEventListener('click', () => serve(i)));
$('#btn-trash').addEventListener('click', trash);
$('#btn-pause').addEventListener('click', () => { Sound.click(); togglePause(); });
$('#btn-music').addEventListener('click', () => { Sound.toggle(); updateHUD(); });

let howReturn = 'scr-title';
const on = (id, fn) => $(id).addEventListener('click', () => { Sound.click(); fn(); });
on('#btn-play', () => { Sound.start(); renderLevelCards(); showScreen('scr-levels'); });
on('#btn-how', () => { howReturn = 'scr-title'; showScreen('scr-how'); });
on('#btn-levels-how', () => { howReturn = 'scr-levels'; showScreen('scr-how'); });
on('#btn-how-ok', () => { if (howReturn === 'scr-levels') renderLevelCards(); showScreen(howReturn); });
on('#btn-levels-back', () => showScreen('scr-title'));
on('#btn-reset', () => { save.unlocked = 1; save.stars = {}; writeSave(); renderLevelCards(); toast('Progress reset.'); });
$('#level-cards').addEventListener('click', e => {
  const b = e.target.closest('.level-card');
  if (b && !b.disabled) { Sound.click(); startLevel(+b.dataset.level); }
});
on('#btn-intro-go', beginPlay);
on('#btn-next', () => startLevel(Math.min(LEVELS.length, state.level.id + 1)));
on('#btn-complete-levels', () => { renderLevelCards(); showScreen('scr-levels'); });
on('#btn-retry', () => startLevel(state.level.id));
on('#btn-fail-levels', () => { renderLevelCards(); showScreen('scr-levels'); });
on('#btn-resume', togglePause);
on('#btn-restart', () => startLevel(state.level.id));
on('#btn-quit', () => { state.running = false; state.paused = false; renderLevelCards(); showScreen('scr-levels'); });
on('#btn-win-levels', () => { renderLevelCards(); showScreen('scr-levels'); });
on('#btn-win-title', () => showScreen('scr-title'));

document.addEventListener('keydown', e => {
  const k = e.key.toLowerCase();
  if (k === 'm') { Sound.toggle(); updateHUD(); return; }
  // Secret for presenting in class: press U on the city screen to unlock every level.
  if (k === 'u' && isShown('scr-levels')) { save.unlocked = LEVELS.length; writeSave(); renderLevelCards(); toast('All cities unlocked!'); return; }
  if (!state.running) return;
  if (k === 'p' || k === 'escape') { togglePause(); return; }
  if (state.paused) return;
  const idx = KEYS.indexOf(k);
  if (idx >= 0 && state.buttons[idx]) { addIngredient(state.buttons[idx]); return; }
  if (k === 'q') serve(0);
  else if (k === 'w') serve(1);
  else if (k === 'e') serve(2);
  else if (k === 'x' || k === 'backspace') { e.preventDefault(); trash(); }
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden && state.running && !state.paused) togglePause();
});

/* =========================================================
   START
   ========================================================= */
applyTheme('vietnam');
clearSeats();
buildIngredients();
renderTray();
renderMenu();
updateHUD();
setChef('neutral');
$('#title-chef').innerHTML = chefArt('yay', 290, 392);
fit();
requestAnimationFrame(frame);

// Small hook for automated testing (harmless in normal play)
window.__game = { state, startLevel, beginPlay, addIngredient, serve, trash, DISHES, makeOrder, pick };
})();
