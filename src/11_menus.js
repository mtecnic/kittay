/* ================================================================
   Store, Wardrobe, Quests, My Pets, Help, Settings, Credits, Backup
   ================================================================ */
Object.assign(ICON_ART, {
  f_bed: ['..llllllll..', '.lppppppppl.', 'lpwwwwwwwwpl', 'lppppppppppl', '.LLLLLLLLLL.'],
  f_rug: ['..yyyyyyyy..', '.yppppppppy.', 'ypwwwwwwwwpy', '.yppppppppy.', '..yyyyyyyy..'],
  f_lamp: ['..yyyy..', '.yyyyyy.', 'yyyyyyyy', '...dd...', '...dd...', '...dd...', '...dd...', '.dddddd.'],
  f_tree: ['...lllll', '...lKlll', '...lllll', 'LLLLLLLL', '..t.....', '..t.....', 'LLLLLL..', '..t.....', '..t.....', 'LLLLLLL.'],
  f_toys: ['..p..b...', '.ppp.bb.r', '..p..b..r', 'nnnnnnnnn', 'ntntntntn', 'nnnnnnnnn'],
  f_portrait: ['yyyyyyyyyy', 'yTTTTTTTTy', 'yToTTTToTy', 'yTooooooTy', 'yTokooko Ty', 'yToooooo Ty', 'yTTooooTTy', 'yyyyyyyyyy'],
  f_tank: ['ssssssssssss', 'sbbbbbbbbbbs', 'sbbobbbbbbbs', 'sbbbbbbybbbs', 'sbgbbgbbbgbs', 'sttttttttttS', 'nnnnnnnnnnnn', 'nNnnnnnnnnNn'],
  f_lights: ['G..G..G..G..G', '.GG.GG.GG.GG.', '.r..y..b..p..', '.r..y..b..p..'],
  f_clock: ['..pppp..', '.pwwwwp.', 'pwwkwwwp', 'pwwkwwwp', 'pwwkkkwp', 'pwwwwwwp', '.pwwwwp.', '..pppp..'],
  f_castle: ['t.t.t.t.t.t', 'ttttttttttt', 'tttnttttntt', 'ttttttttttt', 'ttttKKKtttt', 'ttttKKKtttt', 'ttttKKKtttt'],
  f_disco: ['....d....', '...sws...', '..swsws..', '.wswswsw.', '..swsws..', '...sws...'],
});
for (const k of ['f_portrait']) ICON_ART[k] = ICON_ART[k].map((r) => r.replace(/ /g, ''));
const FURN_ICON = { bed: 'f_bed', rug: 'f_rug', plant: 'pot', lamp: 'f_lamp', tree: 'f_tree', toys: 'f_toys', portrait: 'f_portrait', tank: 'f_tank', lights: 'f_lights', clock: 'f_clock', castle: 'f_castle', disco: 'f_disco' };
function accIcon(a) {
  if (a.art) return a.art;
  if (a.neck) return 'acc_' + a.neck;
  return 'lens_' + a.lens;
}
function swatch(cx, cy, s, cols) {
  rrect(cx - s / 2 - 1, cy - s / 2 - 1, s + 2, s + 2, COL.ink, 2);
  rect(cx - s / 2, cy - s / 2, s, s, cols[0]);
  for (let y = 0; y < s; y += 4) for (let x = (y / 4) % 2 ? 2 : 0; x < s; x += 4) rect(cx - s / 2 + x, cy - s / 2 + y, 2, 2, cols[1]);
}
function itemIcon(tab, it, cx, cy, sc) {
  if (tab === 0) iconC(it.icon, cx, cy, sc);
  else if (tab === 1) iconC(accIcon(it), cx, cy, sc);
  else if (it.type === 'furn') iconC(FURN_ICON[it.id], cx, cy, sc);
  else swatch(cx, cy, 10 * sc, it.sw);
}

/* ---------- Shop ---------- */
Scenes.store = {
  sim: true,
  enter(a) { this.tab = a && a.tab != null ? a.tab : this.tab || 0; this.sc = new Scroller(); Music.play('home'); },
  leave() { Game.save(); },
  items() {
    if (this.tab === 0) return FOODS.filter((f) => f.price > 0);
    if (this.tab === 1) return ACCS;
    if (this.tab === 2) return ROOM.filter((r) => r.price > 0 || SAVE.room.includes(r.id));
    return [];
  },
  owned(it) {
    if (this.tab === 0) return SAVE.inv[it.id] || 0;
    if (this.tab === 1) return SAVE.acc.includes(it.id);
    return SAVE.room.includes(it.id);
  },
  update(dt) {},
  draw(dt) {
    rect(0, 0, W, H, '#ffe8f2');
    for (let y = 0; y < H; y += 20) for (let x = (y / 20) % 2 ? 10 : 0; x < W; x += 20) iconC('paw', x + 5, y + 5, 1, { sil: '#ffd6e8', noOutline: true });
    // awning
    for (let x = 0; x < W; x += 16) { rect(x, 0, 8, 26, '#ff6fa8'); rect(x + 8, 0, 8, 26, '#ffffff'); disc(x + 4, 26, 4, '#ff6fa8'); disc(x + 12, 26, 4, '#ffffff'); }
    rect(0, 0, W, 2, COL.ink);
    ribbon(W / 2, 5, 'Pet Shop', 'purple');
    if (backButton('stback', 6, 4)) go('home');
    const ct = String(SAVE.c), cw = textWidth(ct) + 18;
    rrect(W - cw - 6, 5, cw, 16, COL.ink, 3); rrect(W - cw - 5, 6, cw - 2, 14, '#5a3a8a', 2);
    iconC('coin', W - cw + 1, 13, 1); text(ct, W - cw + 8, 9, { color: '#ffffff' });
    HUD_COIN = { x: W - cw + 1, y: 13 };
    const nt = tabs('sttab', 6, 34, W - 12, 18, [{ icon: 'fish', label: 'Food' }, { icon: 'bow', label: 'Style' }, { icon: 'f_lamp', label: 'Room' }, { icon: 'paw', label: 'Pets' }], this.tab);
    if (nt !== this.tab) { this.tab = nt; this.sc = new Scroller(); }
    const top = 56, vh = H - top - 4;
    if (this.tab === 3) { this.drawPetsTab(top); return; }
    const items = this.items();
    const cw2 = 60, ch = 72, gap = 6;
    const cols = Math.max(2, Math.floor((W - 12 + gap) / (cw2 + gap)));
    const cwF = Math.floor((W - 12 - gap * (cols - 1)) / cols);
    const rows = Math.ceil(items.length / cols);
    this.sc.update(dt, 0, top, W, vh, rows * (ch + gap) + 4);
    const oy = this.sc.begin(0, top, W, vh);
    items.forEach((it, i) => {
      const c = i % cols, r = Math.floor(i / cols);
      const x = 6 + c * (cwF + gap), y = top + 2 + r * (ch + gap) + oy;
      if (y > H || y + ch < top) return;
      const locked = it.lv > SAVE.ol;
      const own = this.owned(it);
      const using = this.tab === 2 && (SAVE.wall === it.id || SAVE.floor === it.id || (it.type === 'furn' && own && !SAVE.hide.includes(it.id)));
      const col = locked ? 'gray' : own && this.tab !== 0 ? 'mint' : 'paper';
      if (button('item' + this.tab + i, x, y, cwF, ch, { color: col, scroll: true })) this.detail(it);
      itemIcon(this.tab, it, x + cwF / 2, y + 22, 2);
      if (locked) { iconC('lock', x + cwF - 9, y + 9, 1); }
      const nm = wrapText(it.name, cwF - 6);
      nm.slice(0, 2).forEach((l, k) => text(l, x + cwF / 2, y + 38 + k * 9 - (nm.length > 1 ? 4 : 0), { align: 'center', color: col === 'paper' ? COL.ink : '#ffffff', shadow: col === 'paper' ? null : BTN[col].d }));
      const ly = y + ch - 15;
      if (locked) text('★ Level ' + it.lv, x + cwF / 2, ly, { align: 'center', color: '#ffffff', shadow: BTN.gray.d });
      else if (own && this.tab !== 0) text(using ? 'In use ✓' : 'Owned', x + cwF / 2, ly, { align: 'center', color: '#ffffff', shadow: BTN.mint.d });
      else {
        coinLabel(x + cwF / 2, ly, it.price, 'center');
        if (this.tab === 0 && own) text('x' + own, x + cwF - 4, y + 4, { align: 'right', color: COL.purpleD });
      }
    });
    this.sc.end(0, top, W, vh);
  },
  drawPetsTab(top) {
    const n = SAVE.p.length;
    const w = Math.min(W - 30, 260);
    panel(W / 2 - w / 2, top + 6, w, 40);
    text('You have ' + n + ' of ' + MAX_PETS + ' pets', W / 2, top + 14, { align: 'center', color: COL.ink });
    text('More pets = more fun!', W / 2, top + 26, { align: 'center', color: COL.grayD });
    const bw = Math.min(150, (W - 30) / (PORTRAIT ? 1 : 2));
    const by = top + 56;
    const kx = PORTRAIT ? W / 2 - bw / 2 : W / 2 - bw - 5, dx = PORTRAIT ? W / 2 - bw / 2 : W / 2 + 5;
    const dy = PORTRAIT ? by + 92 : by;
    if (button('adoptcat', kx, by, bw, 84, { color: 'pink' })) go('adopt', {});
    drawPet({ b: Math.floor(T / 2) % 8, lv: 1, eq: {} }, kx + bw / 2, by + 52, 2, { expr: 'happy' });
    text('Adopt a Kitten', kx + bw / 2, by + 58, { align: 'center', color: '#ffffff', shadow: BTN.pink.d });
    coinLabel(kx + bw / 2, by + 70, ADOPT_PRICE.cat, 'center');
    const dogLocked = SAVE.ol < DOG_LEVEL;
    if (button('adoptdog', dx, dy, bw, 84, { color: dogLocked ? 'gray' : 'sky' })) go('adopt', { dogs: true });
    drawPet({ b: 8 + (Math.floor(T / 2) % 4), lv: 1, eq: {} }, dx + bw / 2, dy + 52, 2, dogLocked ? { sil: '#5a4a6a', noAcc: true } : { expr: 'happy' });
    text('Adopt a Puppy', dx + bw / 2, dy + 58, { align: 'center', color: '#ffffff', shadow: COL.ink });
    if (dogLocked) text('★ Star Level ' + DOG_LEVEL, dx + bw / 2, dy + 70, { align: 'center', color: '#ffffff', shadow: COL.ink });
    else coinLabel(dx + bw / 2, dy + 70, ADOPT_PRICE.dog, 'center');
  },
  detail(it) {
    const tab = this.tab, self = this;
    const ov = pushOverlay({
      t: 0, update(dt) { this.t += dt; },
      draw() {
        g.fillStyle = 'rgba(18,10,30,0.55)'; g.fillRect(0, 0, W, H);
        const k = Ease.outBack(clamp(this.t / 0.25, 0, 1));
        const w = Math.min(W - 24, 230), h = 168, x = W / 2 - w / 2, y = H / 2 - h / 2 + (1 - k) * 50;
        panel(x, y, w, h, { title: it.name, color: 'pink' });
        if (button('dx', x + w - 26, y + 6, 20, 18, { label: '✗', color: 'red', sfx: 'back' })) { popOverlay(ov); return; }
        const locked = it.lv > SAVE.ol;
        const own = self.owned(it);
        // preview
        if (tab === 1) {
          const pet = Game.pet();
          const eq = Object.assign({}, pet.eq, { [it.slot]: it.id });
          drawPet({ b: pet.b, lv: pet.lv, eq }, x + 40, y + 76, 2, { expr: 'happy' });
        } else itemIcon(tab, it, x + 40, y + 46, 3);
        let ty = y + 28;
        const tx = x + 80, tw = w - 90;
        const desc = it.desc || (tab === 1 ? { h: 'A cute hat for your pet.', n: 'Something nice to wear around the neck.', f: 'Super stylish eyewear!' }[it.slot] : it.type === 'wall' ? 'New wallpaper for your room.' : 'A new floor for your room.');
        wrapText(desc, tw).forEach((l) => { text(l, tx, ty, { color: COL.ink }); ty += 10; });
        ty += 4;
        if (tab === 0) {
          const stats = [[0, it.hun], [1, it.hap], [2, it.en]].filter((s) => s[1]);
          stats.forEach(([ni, v]) => { iconC(NEEDS[ni].icon, tx + 4, ty + 3, 1); text('+' + v, tx + 12, ty, { color: COL.mintD }); ty += 11; });
          text('You have: ' + (SAVE.inv[it.id] || 0), tx, ty + 2, { color: COL.purpleD });
        }
        const by = y + h - 34;
        if (locked) { text('Reach ★ Star Level ' + it.lv + ' to buy!', W / 2, by + 6, { align: 'center', color: COL.redD }); return; }
        if (tab === 0) {
          const can1 = SAVE.c >= it.price, can5 = SAVE.c >= it.price * 5;
          const bw = (w - 30) / 2;
          if (button('buy1', x + 10, by, bw, 24, { label: 'Buy 1  ' + it.price + '¢', color: 'mint', disabled: !can1, sfx: 'buy' })) self.buy(it, 1);
          if (button('buy5', x + 20 + bw, by, bw, 24, { label: 'Buy 5  ' + it.price * 5 + '¢', color: 'sky', disabled: !can5, sfx: 'buy' })) self.buy(it, 5);
        } else if (!own) {
          const can = SAVE.c >= it.price;
          if (button('buyx', x + 20, by, w - 40, 24, { label: can ? 'Buy for ' + it.price + '¢' : 'Need ' + it.price + '¢', color: 'mint', disabled: !can, sfx: 'buy' })) self.buy(it, 1);
        } else if (tab === 1) {
          const pet = Game.pet();
          const worn = pet.eq[it.slot] === it.id;
          if (button('wear', x + 20, by, w - 40, 24, { label: worn ? 'Take off' : 'Wear it!', color: worn ? 'paper' : 'pink' })) { pet.eq[it.slot] = worn ? '' : it.id; Snd.play('sparkle'); popOverlay(ov); }
        } else if (it.type === 'furn') {
          const hidden = SAVE.hide.includes(it.id);
          if (button('show', x + 20, by, w - 40, 24, { label: hidden ? 'Put in room' : 'Put away', color: hidden ? 'mint' : 'paper' })) {
            if (hidden) SAVE.hide = SAVE.hide.filter((h2) => h2 !== it.id); else SAVE.hide.push(it.id);
            Snd.play('pop'); popOverlay(ov);
          }
        } else {
          const using = SAVE.wall === it.id || SAVE.floor === it.id;
          if (button('use', x + 20, by, w - 40, 24, { label: using ? 'In use ✓' : 'Use it!', color: 'mint', disabled: using })) { if (it.type === 'wall') SAVE.wall = it.id; else SAVE.floor = it.id; Snd.play('sparkle'); popOverlay(ov); }
        }
      },
    });
  },
  buy(it, n) {
    const cost = it.price * n;
    if (!Game.spend(cost)) { Snd.play('error'); return; }
    if (this.tab === 0) SAVE.inv[it.id] = (SAVE.inv[it.id] || 0) + n;
    else if (this.tab === 1) { SAVE.acc.push(it.id); Game.pet().eq[it.slot] = it.id; }
    else {
      SAVE.room.push(it.id);
      SAVE.st.decorBought = (SAVE.st.decorBought || 0) + 1;
      if (it.type === 'wall') SAVE.wall = it.id;
      if (it.type === 'floor') SAVE.floor = it.id;
    }
    Game.track('buy');
    Game.checkAdventures();
    burst('sparkle', W / 2, H / 2, 14, { speed: 80, props: { size: 3, color: '#ffd84a', layer: 1 } });
    floatText('-' + cost + '¢', HUD_COIN.x, HUD_COIN.y + 8, '#ffd84a');
    Toasts.list.length = 0;
    Toasts.add(this.tab === 1 ? 'Bought ' + it.name + '! ' + Game.pet().n + ' is wearing it.' : 'Bought ' + it.name + '!', 'bag', 'mint');
    Game.save();
  },
};

/* ---------- Wardrobe ---------- */
Scenes.wardrobe = {
  sim: true,
  enter() { this.tab = 0; Music.play('home'); },
  leave() { Game.save(); },
  draw(dt) {
    const pet = Game.pet();
    rect(0, 0, W, H, '#f0e4ff');
    for (let x = 0; x < W; x += 24) rect(x, 0, 12, H, '#e8daff');
    ribbon(W / 2, 6, 'Dress Up', 'mint');
    if (backButton('wback', 6, 6)) go('home');
    const port = PORTRAIT;
    const mw = port ? Math.min(150, W - 60) : Math.min(150, W * 0.46);
    const mTop = 30, mh = port ? Math.round(H * 0.42) : H - mTop - 22;
    const px = port ? W / 2 : 10 + mw / 2;
    const gy = mTop + mh - 8;
    // mirror
    rrect(px - mw / 2 - 3, mTop - 3, mw + 6, mh + 6, COL.ink, 5);
    rrect(px - mw / 2, mTop, mw, mh, '#ffd84a', 4);
    rrect(px - mw / 2 + 4, mTop + 4, mw - 8, mh - 8, '#dff4ff', 3);
    for (let i = 0; i < 4; i++) line(px - mw / 2 + 10 + i * 6, mTop + 10, px - mw / 2 + 20 + i * 6, mTop + 22, '#ffffff');
    ellipseFill(px, gy, mw / 2 - 14, 4, '#c8e8ff');
    const sc = petHeight(pet, 'sit') * 3 + 24 < mh ? 3 : 2;
    drawPet(pet, px, gy, sc, { expr: 'happy', tail: Math.round(Math.sin(T * 3) * 2), breath: Math.floor(T * 1.6) % 2 });
    rrect(px - textWidth(pet.n) / 2 - 5, mTop + mh - 4, textWidth(pet.n) + 10, 12, COL.ink, 2);
    text(pet.n, px, mTop + mh - 2, { align: 'center', color: '#ffffff' });
    // item picker
    const lx = port ? 8 : mw + 22, lw = port ? W - 16 : W - mw - 30;
    const top = port ? mTop + mh + 14 : 32;
    const slots = ['h', 'n', 'f'];
    this.tab = tabs('wtab', lx, top, lw, 18, ['Hats', 'Neck', 'Face'], this.tab, { color: 'mint' });
    const slot = slots[this.tab];
    const owned = ACCS.filter((a) => a.slot === slot && SAVE.acc.includes(a.id));
    const list = [null, ...owned];
    const cs = 40, gap = 4;
    const cols = Math.max(2, Math.floor((lw + gap) / (cs + gap)));
    list.forEach((a, i) => {
      const x = lx + (i % cols) * (cs + gap), y = top + 24 + Math.floor(i / cols) * (cs + gap);
      const worn = a ? pet.eq[slot] === a.id : !pet.eq[slot];
      if (button('wi' + i, x, y, cs, cs, { color: worn ? 'pink' : 'paper' })) { pet.eq[slot] = a ? a.id : ''; Snd.play(a ? 'sparkle' : 'pop'); }
      if (a) iconC(accIcon(a), x + cs / 2, y + cs / 2 - 2, 2);
      else text('None', x + cs / 2, y + cs / 2 - 5, { align: 'center', color: worn ? '#fff' : COL.grayD });
    });
    const ny = top + 24 + Math.ceil(list.length / cols) * (cs + gap) + 4;
    if (!owned.length) text('No items yet!', lx + lw / 2, ny, { align: 'center', color: COL.grayD });
    if (ny + 30 < H && button('wshop', lx + lw / 2 - 60, Math.min(H - 30, ny + (owned.length ? 0 : 14)), 120, 24, { label: 'Get more', icon: 'bag', color: 'purple' })) go('store', { tab: 1 });
  },
};

/* ---------- Quests ---------- */
Scenes.quests = {
  sim: true,
  enter() { this.tab = 0; this.sc = new Scroller(); Game.refreshDaily(); Music.play('home'); },
  leave() { Game.save(); },
  claim(coins, x, y) {
    Snd.play('quest');
    Game.addCoins(coins, x, y);
    Game.addXP(Math.round(coins / 3));
    burst('star', x, y, 8, { speed: 70, props: { layer: 1 } });
    Game.save();
  },
  draw(dt) {
    rect(0, 0, W, H, '#fff4d8');
    for (let y = 0; y < H; y += 6) rect(0, y, W, 1, '#f6e8c4');
    ribbon(W / 2, 6, 'Quests', 'sun');
    if (backButton('qback', 6, 6)) go('home');
    coinLabel(W - 8, 10, SAVE.c, 'right');
    HUD_COIN = { x: W - textWidth(String(SAVE.c)) - 16, y: 13 };
    const dailyClaim = SAVE.dq.q.some((q) => !q[2] && q[1] >= DAILY[q[0]].n);
    const advClaim = ADVENTURES.some((a) => !SAVE.aq.includes(a.id) && Game.advProgress(a) >= a.n);
    const nt = tabs('qtab', 8, 30, W - 16, 18, [(dailyClaim ? '! ' : '') + 'Daily', (advClaim ? '! ' : '') + 'Adventures'], this.tab, { color: 'sun' });
    if (nt !== this.tab) { this.tab = nt; this.sc = new Scroller(); }
    const top = 54, rowH = 34, w = W - 16;
    if (this.tab === 0) {
      const now = new Date(), mid = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      const mins = Math.floor((mid - now) / 60000);
      text('New quests in ' + Math.floor(mins / 60) + 'h ' + (mins % 60) + 'm', W / 2, top, { align: 'center', color: COL.grayD });
      SAVE.dq.q.forEach((q, i) => {
        const def = DAILY[q[0]];
        this.row('dq' + i, 8, top + 12 + i * (rowH + 4), w, rowH, def.text, Math.min(q[1], def.n), def.n, def.r, q[2], (x, y) => { q[2] = 1; this.claim(def.r, x, y); });
      });
      const by = top + 12 + 3 * (rowH + 4) + 4;
      const all = SAVE.dq.q.every((q) => q[2]);
      panel(8, by, w, 40, { bg: all && !SAVE.dq.bonus ? '#fff0a0' : COL.paper });
      iconC('gift', 26, by + 20, 2);
      text('Daily Bonus', 46, by + 8, { color: COL.ink });
      text(SAVE.dq.bonus ? 'Claimed! See you tomorrow.' : 'Finish all 3 quests!', 46, by + 20, { color: COL.grayD });
      if (!SAVE.dq.bonus) {
        if (button('dqbonus', 8 + w - 70, by + 9, 62, 22, { label: '50¢', color: all ? 'pink' : 'gray', disabled: !all, glow: all })) {
          SAVE.dq.bonus = 1; this.claim(50, 8 + w - 40, by + 20); confetti(50);
        }
      }
    } else {
      const list = ADVENTURES.slice().sort((a, b) => {
        const sa = SAVE.aq.includes(a.id) ? 2 : Game.advProgress(a) >= a.n ? 0 : 1;
        const sb = SAVE.aq.includes(b.id) ? 2 : Game.advProgress(b) >= b.n ? 0 : 1;
        return sa - sb;
      });
      const vh = H - top - 4;
      this.sc.update(dt, 0, top, W, vh, list.length * (rowH + 4));
      const oy = this.sc.begin(0, top, W, vh);
      list.forEach((a, i) => {
        const y = top + i * (rowH + 4) + oy;
        if (y > H || y + rowH < top) return;
        this.row('adv' + a.id, 8, y, w, rowH, a.text + ': ' + a.desc, Game.advProgress(a), a.n, a.r, SAVE.aq.includes(a.id), (x, yy) => { SAVE.aq.push(a.id); this.claim(a.r, x, yy); }, true);
      });
      this.sc.end(0, top, W, vh);
    }
  },
  row(id, x, y, w, h, label, prog, need, reward, claimed, onClaim, scroll) {
    const done = prog >= need;
    rrect(x, y, w, h, COL.ink, 3);
    rrect(x + 1, y + 1, w - 2, h - 2, claimed ? '#e0f8ec' : done ? '#fff6c0' : COL.paper, 2);
    iconC(claimed ? 'trophy' : done ? 'star' : 'scroll', x + 14, y + h / 2, 1);
    const bw = 58;
    const lines = wrapText(label, w - bw - 40);
    lines.slice(0, 2).forEach((l, k) => text(l, x + 28, y + 4 + k * 9, { color: COL.ink }));
    bar(x + 28, y + h - 9, Math.min(100, w - bw - 80), 5, prog / need, done ? '#4fd1a5' : '#ffc94a');
    text(prog + '/' + need, x + 32 + Math.min(100, w - bw - 80), y + h - 11, { color: COL.grayD });
    if (claimed) text('Done ✓', x + w - bw / 2 - 6, y + h / 2 - 3, { align: 'center', color: COL.mintD });
    else if (done) { if (button(id, x + w - bw - 6, y + 6, bw, h - 12, { label: 'Claim', color: 'pink', glow: true, scroll })) onClaim(x + w - bw / 2, y + h / 2); }
    else coinLabel(x + w - bw / 2 - 6, y + h / 2 - 3, reward, 'center');
  },
};

/* ---------- My Pets ---------- */
Scenes.pets = {
  sim: true,
  enter() { this.sc = new Scroller(); Music.play('home'); },
  leave() { Game.save(); },
  draw(dt) {
    rect(0, 0, W, H, '#e4f4ff');
    for (let y = 0; y < H; y += 16) for (let x = (y / 16) % 2 ? 8 : 0; x < W; x += 16) rect(x + 4, y + 4, 2, 2, '#cce8ff');
    ribbon(W / 2, 6, 'My Pets', 'purple');
    if (backButton('pback', 6, 6)) go('home');
    const list = [...SAVE.p.map((p, i) => i), -1];
    const cw = 96, ch = 104, gap = 8;
    const cols = Math.max(2, Math.floor((W - 16 + gap) / (cw + gap)));
    const cwF = Math.floor((W - 16 - gap * (cols - 1)) / cols);
    const top = 30, vh = H - top - 4;
    const rows = Math.ceil(list.length / cols);
    this.sc.update(dt, 0, top, W, vh, rows * (ch + gap));
    const oy = this.sc.begin(0, top, W, vh);
    list.forEach((pi, i) => {
      const x = 8 + (i % cols) * (cwF + gap), y = top + 2 + Math.floor(i / cols) * (ch + gap) + oy;
      if (pi < 0) {
        if (SAVE.p.length >= MAX_PETS) return;
        if (button('padopt', x, y, cwF, ch, { color: 'mint', scroll: true })) go('store', { tab: 3 });
        disc(x + cwF / 2, y + 40, 16, '#a8f0d4');
        text('+', x + cwF / 2 + 1, y + 30, { align: 'center', color: '#2a9474', scale: 3 });
        text('Adopt', x + cwF / 2, y + 70, { align: 'center', color: '#ffffff', shadow: BTN.mint.d });
        return;
      }
      const p = SAVE.p[pi];
      const active = pi === SAVE.ap;
      const onRename = active && I.x >= x + cwF - 24 && I.y < y + 22 && I.y >= y;
      if (button('pc' + pi, x, y, cwF, ch, { color: active ? 'pink' : 'paper', scroll: true }) && !onRename) {
        if (!active) {
          SAVE.ap = pi; RT.sleeping = false;
          Game.voice(p);
          Toasts.list.length = 0; Toasts.add(p.n + ' is ready to play!', 'paw', 'pink');
        }
        go('home');
      }
      const tc = active ? '#ffffff' : COL.ink;
      drawPet(p, x + cwF / 2, y + 64, 2, { expr: active ? 'happy' : 'open', tail: Math.round(Math.sin(T * 3 + i) * 2) });
      text(p.n, x + cwF / 2, y + 70, { align: 'center', color: tc, shadow: active ? BTN.pink.d : null });
      text('Lv ' + p.lv + ' ' + stageName(p), x + cwF / 2, y + 81, { align: 'center', color: active ? '#ffe0f0' : COL.purpleD });
      const avg = p.s.reduce((a, b) => a + b, 0) / 5;
      bar(x + 10, y + 92, cwF - 20, 5, avg / 100, avg < 35 ? '#ff4f5e' : '#4fd1a5');
      if (active) text('★', x + 8, y + 5, { color: '#ffd84a', outline: COL.ink });
      if (active && button('prename', x + cwF - 22, y + 4, 18, 16, { label: 'Aa', color: 'paper', scroll: true })) {
        go('name', { title: 'Rename your pet', initial: p.n, max: 10, pet: p, random: () => pick(NAMES), onBack: () => go('pets'), onDone: (nm) => { p.n = nm; Game.save(); go('pets'); } });
      }
    });
    this.sc.end(0, top, W, vh);
  },
};

/* ---------- How to play ---------- */
const HELP_PAGES = [
  { title: 'Welcome to Kittay!', icon: 'paw', lines: ['Adopt a kitten and take care of it.', 'Feed it, pet it, play with it, brush it and give it baths.', 'Happy pets grow up from Kitten to Young Cat to Cat!'] },
  { title: 'Keep the meters full', needs: true, lines: [] },
  { title: 'Grow & level up', icon: 'star', lines: ['Everything you do gives XP.', 'Pets grow up at Level 5 and Level 10.', 'Your Star Level unlocks new food, outfits, games and PUPPIES at Star Level 3!'] },
  { title: 'Coins & the Shop', icon: 'coin', lines: ['Earn coins by playing games, finishing quests, cleaning messes and opening your daily gift.', 'Spend them on yummy food, cute outfits, room decorations and new pets.'] },
  { title: 'Tricks & games', icon: 'wand', lines: ['Train your pet to learn 8 tricks, then show them off with the wand button.', 'Play Treat Catch, Mouse Pop and the Run game for coins!'] },
  { title: 'Saving', icon: 'heart', lines: ['Kittay saves by itself on this iPad.', 'Tip: tap Share, then "Add to Home Screen" to play like a real app!', 'Use "Backup Save" in the game menu to copy your pets to another device.'] },
];
Scenes.help = {
  enter(a) { this.p = 0; this.back = a && a.back; },
  draw(dt) {
    drawDreamBG(dt, { parade: false });
    const w = Math.min(W - 24, 280), h = Math.min(H - 30, 190), x = W / 2 - w / 2, y = (H - h) / 2 + 6;
    const pg = HELP_PAGES[this.p];
    panel(x, y, w, h, { title: pg.title, color: 'sky' });
    let ty = y + 16;
    if (pg.icon) { iconC(pg.icon, W / 2, ty + 10, 3); ty += 30; }
    if (pg.needs) {
      NEEDS.forEach((n, i) => {
        iconC(n.icon, x + 20, ty + 5, 1);
        text(n.name + ' - ' + ['Feed with yummy food', 'Pet, play and do tricks', 'Turn off the light to nap', 'Give a bubble bath', 'Brush out the tangles'][i], x + 32, ty, { color: COL.ink });
        ty += 16;
      });
      text('Low meters make your pet sad!', W / 2, ty + 4, { align: 'center', color: COL.redD });
    }
    for (const l of pg.lines) for (const wl of wrapText(l, w - 24)) { text(wl, W / 2, ty, { align: 'center', color: COL.ink }); ty += 10; }
    text((this.p + 1) + ' / ' + HELP_PAGES.length, W / 2, y + h - 22, { align: 'center', color: COL.grayD });
    if (this.p > 0 && button('hprev', x + 8, y + h - 28, 50, 20, { label: '← Back', color: 'paper' })) this.p--;
    if (this.p < HELP_PAGES.length - 1) { if (button('hnext', x + w - 58, y + h - 28, 50, 20, { label: 'Next →', color: 'pink' })) this.p++; }
    else if (button('hdone', x + w - 58, y + h - 28, 50, 20, { label: 'Done', color: 'mint' })) go(this.back || 'menu');
    if (backButton('hback', 6, 6)) go(this.back || 'menu');
  },
};

/* ---------- Settings (from the main menu) ---------- */
Scenes.settings = {
  enter() {},
  draw(dt) {
    drawDreamBG(dt, { parade: false });
    const w = Math.min(W - 30, 220), h = 168, x = W / 2 - w / 2, y = (H - h) / 2 + 6;
    panel(x, y, w, h, { title: 'Settings', color: 'mint' });
    const bw = w - 30;
    let by = y + 18;
    if (button('st_sfx', x + 15, by, bw, 24, { label: 'Sounds: ' + (CFG.sfx ? 'ON' : 'OFF'), color: CFG.sfx ? 'mint' : 'gray' })) { CFG.sfx = !CFG.sfx; Snd.setSfx(CFG.sfx); saveCfg(); }
    by += 30;
    if (button('st_mus', x + 15, by, bw, 24, { label: 'Music: ' + (CFG.mus ? 'ON' : 'OFF'), color: CFG.mus ? 'mint' : 'gray' })) { CFG.mus = !CFG.mus; Snd.setMusic(CFG.mus); saveCfg(); }
    by += 30;
    if (button('st_restore', x + 15, by, bw, 24, { label: 'Restore a Backup', color: 'sun' })) chooseRestoreSlot();
    by += 30;
    if (button('st_back', x + 15, by, bw, 24, { label: 'Back', color: 'pink' })) go('menu');
    if (backButton('stb', 6, 6)) go('menu');
  },
};
function chooseRestoreSlot() {
  const ov = pushOverlay({
    draw() {
      g.fillStyle = 'rgba(18,10,30,0.6)'; g.fillRect(0, 0, W, H);
      const w = Math.min(W - 30, 220), h = 134, x = W / 2 - w / 2, y = H / 2 - h / 2;
      panel(x, y, w, h, { title: 'Restore into...', color: 'sun' });
      text('Which player slot?', W / 2, y + 16, { align: 'center' });
      for (let i = 0; i < 3; i++) {
        const s = slotSummary(i);
        if (button('rs' + i, x + 15, y + 30 + i * 28, w - 30, 24, { label: 'Slot ' + (i + 1) + (s ? ' (' + s.n + ')' : ' (empty)'), color: ['pink', 'sky', 'mint'][i] })) { popOverlay(ov); showBackup(i); }
      }
      if (button('rsx', x + w - 26, y + 4, 20, 18, { label: '✗', color: 'red' })) popOverlay(ov);
    },
  });
}

/* ---------- backup / restore (DOM overlay so the code can be copied) ---------- */
function showBackup(slot) {
  const io = document.getElementById('io');
  const inGame = slot == null;
  if (inGame) { Game.save(); slot = SLOT; }
  const code = inGame ? 'KITTAY1:' + SaveIO.enc(SAVE) : '';
  io.innerHTML = '<div class="box"><h3>' + (inGame ? 'Backup Save' : 'Restore Slot ' + (slot + 1)) + '</h3>' +
    '<p>' + (inGame ? 'Copy this code and keep it somewhere safe (like the Notes app). To restore, paste a code below and tap Load.' : 'Paste a Kittay backup code below and tap Load. This replaces whatever is in this slot!') + '</p>' +
    '<textarea id="iocode" spellcheck="false"></textarea>' +
    '<p id="iomsg" style="color:#c8407a;min-height:18px"></p>' +
    '<div class="row">' + (inGame ? '<button id="iocopy">Copy</button>' : '') + '<button id="ioload" class="alt">Load</button><button id="ioclose" class="gray">Close</button></div></div>';
  io.hidden = false;
  const ta = document.getElementById('iocode'), msg = document.getElementById('iomsg');
  ta.value = code;
  const close = () => { io.hidden = true; io.innerHTML = ''; };
  document.getElementById('ioclose').onclick = close;
  const cp = document.getElementById('iocopy');
  if (cp) cp.onclick = () => {
    ta.focus(); ta.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(ta.value).then(() => { msg.textContent = 'Copied!'; }).catch(() => {});
    msg.textContent = ok ? 'Copied!' : 'Select the text and copy it.';
  };
  document.getElementById('ioload').onclick = () => {
    const v = ta.value.trim().replace(/^KITTAY1:/, '');
    const data = SaveIO.dec(v);
    if (!data || !Array.isArray(data.p) || !data.p.length) { msg.textContent = "Hmm, that code doesn't look right."; return; }
    data.t = Date.now();
    SaveIO.write(SLOT_KEYS[slot], fixSave(data));
    close();
    Game.start(slot, fixSave(data));
    Toasts.add('Save restored! Welcome back, ' + data.n + '!', 'heart', 'mint');
    go('home');
  };
}

/* ---------- Credits ---------- */
Scenes.credits = {
  enter() { this.t = 0; Music.play('title'); },
  update(dt) { this.t += dt; if (I.released && this.t > 0.5) go('menu'); },
  draw(dt) {
    drawDreamBG(dt);
    const lines = [
      ['KITTAY', 3, '#ff6fa8'], ['', 1], ['A game by', 1, '#ffffff'], ['MTEC LABS', 2, '#4fd1a5'], ['', 1],
      ['Game design, code, pixel art', 1, '#ffffff'], ['and chiptune music', 1, '#ffffff'], ['MTEC Labs', 1, '#ffd84a'], ['', 1],
      ['Starring', 1, '#ffffff'], ['8 kittens and 4 puppies', 1, '#ffd84a'], ['', 1],
      ['Made with ♥', 1, '#ff9ac8'], ['for kids who love pets', 1, '#ffffff'], ['', 1], ['Thanks for playing!', 2, '#ffffff'],
    ];
    let y = H - this.t * 22 + 10;
    const total = lines.reduce((a, l) => a + 10 * l[1] + 4, 0);
    if (y + total < 0) this.t = 0;
    for (const [s, sc, c] of lines) {
      if (s) text(s, W / 2, y, { align: 'center', scale: sc, color: c || '#fff', outline: COL.ink });
      y += 10 * sc + 4;
    }
    text('Tap to go back', W / 2, H - 12, { align: 'center', color: '#ffffff', outline: COL.ink });
  },
};
