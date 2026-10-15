// Checks a (modified) index.html against the "do not change" clauses in SYSTEM_PROMPT.md.
// Usage: node verify.cjs path/to/index.html
const fs = require('node:fs');
const vm = require('node:vm');

const file = process.argv[2];
if (!file) { console.error('usage: node verify.cjs path/to/index.html'); process.exit(2); }
const html = fs.readFileSync(file, 'utf8');
const results = [];
const check = (id, label, ok) => results.push({id, label, ok: !!ok});
const has = s => html.includes(s);

// N-1 single file, no external resources
check('N-1', 'no external <script src> / <link> / url(http)', !/<script[^>]+src=|<link\b|url\(\s*['"]?https?:|import\s*\(/.test(html));
check('N-1', 'exactly one <script> block', (html.match(/<script>/g) || []).length === 1);

// N-2 test marker and UMD export
check('N-2', 'marker `const game=Daldongne.mount` present', has('const game=Daldongne.mount'));
const script = (html.match(/<script>([\s\S]*?)<\/script>/) || [])[1] || '';
let g = null;
try {
  const ctx = {module: {exports: {}}};
  vm.runInNewContext(script.slice(0, script.indexOf('const game=Daldongne.mount')), ctx);
  g = ctx.module.exports;
} catch (e) { /* reported below */ }
check('N-2', 'game core loads without a browser', g && typeof g.newGame === 'function');
const exportsWanted = 'W,H,R,SITES,ORDERS,CAFE,POINTS,WIN_SCORE,VIEW_HALF,VIEW_RANGE,HIDE_RADIUS,HIDE_COUNT,sees,walkers,isHidden,look,TREES,FLAT,pt,newGame,start,pause,step,interact,nearest,target,chooseTarget,draw,mount,math,camera'.split(',');
check('N-2', 'all exports present', g && exportsWanted.every(k => k in g));

// N-3 locale
check('N-3', 'game.locale("en") kept', has('game.locale("en")'));
check('N-3', 'Korean-mode branches kept', has("korean?'#b9c998':'#b9cbb0'") && has("korean&&s.type!=='pavilion'"));

// N-4 person model
const person = [
  "ball(pos(0,.24,0),.17,color,1,1.5,.8)",
  "ball(pos(0,.53,0),.19,'#d7a576',1,1.07,.95)",
  "ball(pos(0,.68,.015),.145,hair,1,.55,1)",
  "ball(pos(-.061,.555,-.169),.025,'#3a4035');ball(pos(.061,.555,-.169),.025,'#3a4035')",
  "ball(pos(-.115,.47,-.14),.031,'#d88872',1,.6,.4);ball(pos(.115,.47,-.14),.031,'#d88872',1,.6,.4)",
  "ball(pos(-.09,.066,walk),.073,'#574e42',.75,.8,1.45);ball(pos(.09,.066,-walk),.073,'#574e42',.75,.8,1.45)",
  "ball(pos(-.195,.28,-.07),.067,'#d7a576',.7,1,1);ball(pos(.195,.28,-.07),.067,'#d7a576',.7,1,1)",
  "ball(pos(0,.7,0),.16,'#2f3d57',1,.5,1);ball(pos(0,.665,-.13),.09,'#26314a',1,.25,.8);ball(pos(0,.35,-.14),.03,'#e3c35a')",
];
person.forEach((s, i) => check('N-4', 'person part ' + (i + 1) + ' unchanged', has(s)));
check('N-4', 'person() still has exactly 15 ball() calls', (() => {
  const m = script.match(/function person\([\s\S]*?\n \}\n/); if (!m) return false;
  const body = m[0].split('if(isPlayer&&s.carrying)')[0];
  return (body.match(/\bball\(/g) || []).length === 15;
})());

// N-5 lighting
check('N-5', 'LIGHT=norm([-1,2,3])', has('const LIGHT=norm([-1,2,3]);'));
check('N-5', 'static shading .77+.23', has('k=.77+.23*Math.abs(dot(n,LIGHT))'));
check('N-5', 'person shading .82+.18', has('.82+.18*Math.abs(dot(n,LIGHT))'));
check('N-5', "sky gradient #eadac2 -> #f6eddc", has("bg.addColorStop(0,'#eadac2');bg.addColorStop(1,'#f6eddc')"));
check('N-5', 'no shadow/filter/blend added', !/shadowBlur|shadowColor|\.filter\s*=|globalCompositeOperation/.test(script));

// N-7 SITES
if (g) {
  const ids = 'cafe,books,store,laundry,pavilion,home4,home5,home1,home2,home3,market,bath,school,tea,barber,post,clinic,bakery,toys,bike,music,gallery,shrine,well';
  check('N-7', 'SITES order (24 ids)', g.SITES.map(s => s.id).join(',') === ids);
  check('N-7', 'ORDERS = books,store,laundry,pavilion', g.ORDERS.map(s => s.id).join(',') === 'books,store,laundry,pavilion');
}
check('N-7', 'cafe row unchanged', has("{id:'cafe',lon:-.36,lat:.29,name:'달동네 커피',en:'Little Cafe',type:'cafe',color:'#eedcb1',roof:'#465652',w:1.52,d:1.1,h:.79,"));

// N-8 seeds
check('N-8', 'seeds 4177 / 531 and LCG', has('rng(4177)') && has('rng(531)') && has('Math.imul(v,1664525)+1013904223'));
if (g) check('N-8', 'tree count stable', g.TREES.length === 113 || (console.log('   (tree count is ' + g.TREES.length + ')'), false));

// N-9 rules
check('N-9', 'rule constants', has('const TURN_SPEED=2.2,JOB_CHANCE=.5,POLICE_COUNT=18,POLICE_SPEED=A(.11),VIEW_HALF=Math.PI/4,VIEW_RANGE=A(.42),POINTS={coffee:2,smuggle:5,caught:-10},WIN_SCORE=20;'));
check('N-9', 'detect constants', has('const DETECT_NEAR=.7,DETECT_FAR=.275,DETECT_FADE=.5,POPUP_LIFE=1.8;'));
check('N-9', 'crowd constants', has('const CROWD_COUNT=18,SOLO_COUNT=16,HIDE_RADIUS=A(.2),HIDE_COUNT=3;'));
check('N-9', 'walk speed A(.37)', has('-y*dt*A(.37)'));

// N-10 camera
check('N-10', 'camera constants', has('const EYE=.56,FOCAL=620,CY=380,NEAR=.04,PITCH=.1,SIGHT=Math.cos(A(3.4)),NEAR_SIGHT=A(3.2);'));

// N-11 controls
check('N-11', 'buttons and data-dir', has('<button id="start">시작 / 계속</button><button id="pause">잠깐 멈추기</button><button id="reset">처음으로</button><button id="action">커피 받기 / 전하기</button><button data-dir="0,-1" aria-label="앞으로 걷기">↑</button><button data-dir="-1,0" aria-label="왼쪽으로 돌기">←</button><button data-dir="0,1" aria-label="뒤로 걷기">↓</button><button data-dir="1,0" aria-label="오른쪽으로 돌기">→</button>'));
check('N-11', 'key list', has("['arrowup','arrowdown','arrowleft','arrowright','w','a','s','d','e',' ']"));

// N-12 messages
['카페 앞에서 커피를 받아 보세요.', '안내 화살표를 따라 이웃 앞으로 다가가세요.', '이미 비밀 꾸러미를 들고 있어요. 먼저 전해 주세요.',
 '커피가 준비됐어요. 이웃에게 전해 주세요.', '“지금은 맡길 게 없어요.” 바리스타가 고개를 저어요.', '따뜻한 마음 네 잔, 배달을 시작해요.',
 '컵홀더 아래 비밀 꾸러미 하나… ', '이미 배달했어요. 다음 이웃을 찾아보세요.', '먼저 카페에서 커피를 받아 주세요.',
 ' · “…꾸러미도 잘 받았어요.”  +', ' · “고마워요! 좋은 하루 보내요.”  +', '새 주문이 들어왔어요 (',
 '경찰이 이쪽을 보고 있어요! 시야에서 벗어나거나 사람들 틈에 숨으세요.', '경찰에게 붙잡혔어요! 꾸러미를 압수당했어요.  ',
 '커피 한 잔, 꾸러미 하나', '잠깐 쉬어 가요', '오늘의 배달을 마쳤어요', 'A LITTLE WORLD, A WARM CUP', '서두르지 않아도 괜찮아요.',
].forEach(s => check('N-12', 'text: ' + s.trim().slice(0, 24), has(s)));

// N-13 HUD
check('N-13', 'HUD boxes', has('c.roundRect(923,30,237,176,8)') && has('c.translate(1065,256)') && has('c.roundRect(400,26,400,42,21)') && has('c.roundRect(278,284,644,296,12)') && has('mx=112,my=688,mr=88'));

// Behaviour smoke test
if (g) {
  const s = g.newGame(() => .9); // .9 > JOB_CHANCE, so no secret job: plain coffee path
  g.start(s); s.n = g.CAFE.door;
  const got = g.interact(s) && s.carrying === 4;
  s.n = g.ORDERS[0].door; const delivered = g.interact(s) && s.score === 2 && s.done.length === 1;
  const dup = !g.interact(s) && s.score === 2;
  check('F-2', 'pick up 4 cups at cafe', got);
  check('F-2', 'deliver +2, duplicate gives nothing', delivered && dup);
  g.pause(s); const t = s.time; g.step(s, .02); check('F-2', 'pause stops time', s.time === t && s.status === 'paused');
}

let fail = 0;
for (const r of results) { if (!r.ok) fail++; console.log((r.ok ? 'PASS ' : 'FAIL ') + r.id.padEnd(5) + r.label); }
console.log(`\n${results.length - fail}/${results.length} passed`);
process.exit(fail ? 1 : 0);
