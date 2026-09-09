// 作品数据 —— 之后接后台/上传功能时，只要替换这个文件的内容即可。
// image 字段指向 public/images/... 找不到文件时组件会自动显示占位符。

export const PROFILE = {
  name: 'Yuhua Guo',
  nameCn: '郭宇骅',
  role: 'Film Maker',
  tagline: 'Behind The Image',
  quote:
    'Every frame is a decision. I work behind the image — cutting, mixing, lighting, and grading until the story stops explaining itself and simply happens.',
  portrait: '/images/profile/director.jpg',
  // 首页引言下方的职能条（英文 + 中文小字，沿用标签页的排版模式）
  disciplines: [
    { en: 'Director', cn: '导演' },
    { en: 'Screenwriter', cn: '编剧' },
    { en: 'Editor', cn: '剪辑' },
    { en: 'Sound', cn: '声音指导' },
  ],
  // 个人简介（简介页姓名下方）
  bio:
    '郭宇骅，导演／剪辑／声音指导。庆熙大学戏剧电影学学士，成均馆大学影像·多媒体硕士。' +
    '导演作品《持枪信使》获纽约独立艺术电影节最佳学生影片，并在罗马 Prisma 电影奖拿下最佳男主角与最佳海报，并入围多项电影节提名。' +
    '曾任职网易科技传媒，担任导演与后期剪辑；也长期在纪录片与艺术片中负责导演，录音，摄影等工作。',
  bioEn:
    'Guo Yuhua — director, editor and sound supervisor. B.A. in Theatre & Film, Kyung Hee University; ' +
    'M.A. in Film, Television and Multimedia, Sungkyunkwan University. The directorial feature The Little Postman with a Gun ' +
    'won Best Student Film at the New York Independent Art Film Festival and took Best Actor and Best Poster at the ' +
    'Rome Prisma Film Awards, with nominations and official selections at several further festivals. ' +
    'Formerly at NetEase Technology Media as director and post-production editor; ' +
    'continues to work across documentary and art film as director, sound recordist and cinematographer.',
  // 电影节桂冠（无边框、无说明文字，自然融入背景）
  laurels: [
    '/images/laurels/ny-independent-winner.png',
    '/images/laurels/isa-platinum.png',
    '/images/laurels/prisma-best-poster.png',
    '/images/laurels/prisma-best-supporting-actor.png',
    '/images/laurels/prisma-best-trailer.png',
    '/images/laurels/liftoff-newyork.png',
    '/images/laurels/monthly-picks.png',
  ],
  contact: [
    { label: 'Email', value: 'g2479973499@163.com', href: 'mailto:g2479973499@163.com' },
    { label: 'Instagram', value: '@k1ony_', href: 'https://instagram.com/k1ony_' },
    { label: 'WeChat', value: 'Klay_Savage0828', href: null },
    { label: 'KakaoTalk', value: 'KlayGuo0828', href: null },
  ],
  education: [
    { degree: 'B.A. in Theatre & Film', school: 'Kyung Hee University' },
    { degree: 'M.A. in Film, Television and Multimedia', school: 'Sungkyunkwan University' },
  ],
  credits: [
    { title: '持枪信使 · The Little Postman with a Gun', kind: 'Feature', role: 'Director / Screenwriter / Editor' },
    { title: '消失的记忆 · Lost Memory', kind: 'Feature', role: 'Storyboard Supervisor / Sound Supervisor' },
    { title: '消化 · Digestion', kind: 'Art Film', role: 'Sound Supervisor' },
    { title: '种茄子的人 · The Eggplant Grower', kind: 'Documentary', role: 'Sound Supervisor' },
    { title: '胡同 · Hutong', kind: 'Documentary', role: 'Director of Photography / Gaffer / Sound Supervisor' },
    { title: '阶梯间之影 · Shadow in the Stairwell', kind: 'Short', role: 'Director / Editor / Colorist' },
    { title: '消失的她 · The Vanished', kind: 'Short', role: 'Sound Supervisor' },
    { title: '时间满格 · Full Signal', kind: 'Short', role: 'Production Sound Mixer' },
    { title: '落暮 · Dusk', kind: 'Feature', role: 'Second Assistant Director / Still Photographer' },
    { title: '末未 · The Last', kind: 'Feature', role: 'Sound Supervisor' },
    { title: '回声 · Echo', kind: 'Short', role: 'Editor / Colorist / Re-recording Mixer' },
  ],
  work: [
    { org: 'NetEase Technology Media (Beijing)', role: 'Directing Intern / Post-Production Editing Intern' },
    { org: 'NetEase — Future Open Class (2024 film series)', role: 'Director' },
    { org: 'CITIC Press (Beijing) — "This Is China" commercial', role: 'Editor' },
    { org: 'NetEase AIGC', role: 'Director / Producer / Editor' },
    { org: 'Bilibili creator (1M+ followers)', role: 'Cinematographer' },
    { org: 'ACG International Art Alliance', role: 'Film Editor / Colorist / Re-recording Mixer' },
    { org: 'Korean Society of Visual Studies', role: 'Operations Assistant' },
    { org: '2026 FIRST International Film Festival — Surprise Selection Committee', role: 'Member' },
  ],
  awards: [
    { festival: 'New York Independent Art Film Festival', prize: 'Best Student Film', status: 'Winner' },
    { festival: 'Independent Shorts Awards', prize: 'Best Student Film', status: 'Winner' },
    { festival: 'Rome Prisma Film Awards', prize: 'Best Actor', status: 'Winner' },
    { festival: 'Rome Prisma Film Awards', prize: 'Best Poster', status: 'Winner' },
    { festival: 'Rome Prisma Film Awards', prize: 'Best Short Film', status: 'Official Selection' },
    { festival: 'Rome Prisma Film Awards', prize: 'Best Trailer', status: 'Official Selection' },
    { festival: 'New York LIFT-OFF Film Festival', prize: 'Best Student Film', status: 'Shortlisted' },
    { festival: 'Gyeonggi Film School Film Festival', prize: 'Production Support Program', status: 'Selected' },
  ],
}

// 标签页顺序：简介 → 影片 → 图片
export const TABS = [
  { id: 'profile', label: 'Profile', sub: '简介' },
  { id: 'film', label: 'Film', sub: '影片' },
  { id: 'images', label: 'Images', sub: '图片' },
]

// ---------------- FILM ----------------
export const FILMS = [
  {
    id: 'film-postman',
    title: 'The Little Postman with a Gun',
    titleCn: '持枪信使',
    meta: 'Feature · 2025',
    role: 'Director · Screenwriter · Editor',
    image: '/images/posters/postman.png',
    ratio: '2 / 3',
    body:
      '屡获殊荣的《持枪信使》。一名邮差在送出最后一封信之前，决定改写它的内容。' +
      '影片入围并获得纽约独立艺术电影节最佳学生影片、获得 Independent Shorts Awards International Film Festival 春季单元最佳学生电影，' +
      '罗马 Prisma 电影奖春季单元最佳男主角与最佳海报。',
    bodyEn:
      'The award-winning feature The Little Postman with a Gun. A postman decides to rewrite the last letter before delivering it. ' +
      'Winner of Best Student Film at the New York Independent Art Film Festival; Best Student Film in the Spring season of the ' +
      'Independent Shorts Awards International Film Festival; and Best Actor and Best Poster in the Spring season of the Rome Prisma Film Awards.',
  },
  {
    id: 'film-dusk',
    title: 'Dusk',
    titleCn: '落暮',
    meta: 'Feature',
    role: 'Second Assistant Director · Still Photographer',
    image: '/images/posters/dusk.jpg',
    ratio: '2 / 3',
    body: '担任第二副导演。负责现场监督与跟进，同时担任剧照师。',
    bodyEn:
      'Second Assistant Director — floor supervision and scene follow-up — while also serving as the production’s still photographer.',
  },
  {
    id: 'film-digestion',
    video: '/videos/digestion-trailer.mp4',
    title: 'Digestion',
    titleCn: '消化',
    meta: 'Art Film',
    role: 'Sound Supervisor',
    image: '/images/posters/digestion.jpeg',
    ratio: '2 / 3',
    body: '实验／艺术片。声音统筹，负责整片的录音规划与声音录制。',
    bodyEn:
      'An experimental art film. As Sound Supervisor, responsible for the production sound plan and all location recording.',
  },
  {
    id: 'film-eggplant',
    video: '/videos/eggplant-trailer.mp4',
    title: 'The Eggplant Grower',
    titleCn: '种茄子的人',
    meta: 'Documentary',
    role: 'Sound Supervisor',
    image: '/images/posters/eggplant.png',
    ratio: '2 / 3',
    body: '纪录片声音统筹。长期跟拍的现场录音，重点是在不干扰被摄者的前提下拿到干净的对白。',
    bodyEn:
      'Sound Supervisor on a long-form observational documentary. The challenge was clean dialogue captured without ever intruding on the subject.',
  },
  {
    id: 'film-echo',
    title: 'Echo',
    titleCn: '回声',
    meta: 'Short',
    role: 'Editor · Colorist · Re-recording Mixer',
    image: '/images/stills/echo/still-01.jpg',
    ratio: '16 / 9',
    body: '短片《回声》。一人完成剪辑、调色与 2.0 立体声终混三道后期工序。',
    bodyEn:
      'The short film Echo. Edit, colour grade and the final 2.0 stereo mix — all three post departments handled single-handedly.',
  },
  {
    id: 'film-stairwell',
    title: 'Shadow in the Stairwell',
    titleCn: '阶梯间之影',
    meta: 'Short',
    role: 'Director · Editor · Colorist',
    image: '/images/films/stairwell.png',
    ratio: '8 / 5',
    body: '短片。导演／剪辑／调色。全片在一个楼梯间内完成，用蒙太奇叙事完成讲叙。',
    bodyEn:
      'A short film directed, edited and graded solo. Shot entirely inside a single stairwell, the story is carried by montage.',
  },
  {
    id: 'film-hutong',
    title: 'Hutong',
    titleCn: '胡同',
    meta: 'Documentary',
    role: 'Director of Photography · Gaffer · Sound Supervisor',
    image: '/images/films/hutong.png',
    ratio: '8 / 5',
    body: '纪录片。同时担任摄影指导、灯光与声音统筹。窄巷空间里以自然光为主，最小化设备介入。',
    bodyEn:
      'A documentary on which I was simultaneously DP, gaffer and sound supervisor — available light in narrow alleys, with the smallest possible equipment footprint.',
  },
  {
    id: 'film-netease',
    title: 'Future Open Class',
    titleCn: '未来公开课',
    meta: 'NetEase · Series · 2024',
    role: 'Director',
    image: '/images/films/netease.svg',
    ratio: '16 / 9',
    body: '网易 2024 影像系列《未来公开课》导演。同时负责社媒版本的剪辑与 AIGC 项目的导演／制片／剪辑。',
    bodyEn:
      'Director of NetEase’s 2024 film series Future Open Class, plus the social cut-downs, and director/producer/editor on NetEase AIGC.',
  },
]

// ---------------- IMAGES（按项目分组，仅取自《参与影片静帧展示》）----------------
export const IMAGE_GROUPS = [
  {
    id: 'grp-postman',
    title: 'The Little Postman with a Gun',
    titleCn: '持枪信使',
    meta: 'Feature · 2025',
    role: 'Director · Screenwriter · Editor',
    items: [
      {
        id: 'postman-01', title: 'Opening Frame', titleCn: '开场', meta: 'Still', ratio: '16 / 9',
        image: '/images/stills/postman/still-01.jpg',
        body: '门框构成框中框，左侧信箱墙与暗部压住画面，两个人物落在右侧唯一的亮区。',
        bodyEn: 'The doorway makes a frame within the frame: the mailbox wall and shadow hold the left, the two figures sit in the only bright area on the right.',
      },
      {
        id: 'postman-02', title: 'Reverse', titleCn: '反打', meta: 'Still', ratio: '16 / 9',
        image: '/images/stills/postman/still-02.jpg',
        body: '道具沿对角线从右下切入，前景草叶虚化，天空留出大片空白。',
        bodyEn: 'The prop cuts in on a diagonal from the lower right; foreground grass falls out of focus and the sky is left open.',
      },
      {
        id: 'postman-03', title: 'Daylight Exterior', titleCn: '外景日戏', meta: 'Still', ratio: '16 / 9',
        image: '/images/stills/postman/still-03.jpg',
        body: '地平线压在下三分之一，两个人物并置于中央，其余交给天空。',
        bodyEn: 'The horizon sits on the lower third, the two figures are paired at centre, and the rest is given to sky.',
      },
      {
        id: 'postman-04', title: 'Handheld Follow', titleCn: '手持跟拍', meta: 'Still', ratio: '16 / 9',
        image: '/images/stills/postman/still-04.jpg',
        body: '人物落在右侧三分之一，树干在左侧形成竖向分割，背景走浅景深。',
        bodyEn: 'The figure lands on the right third, tree trunks divide the left vertically, and the background is held shallow.',
      },
      {
        id: 'postman-05', title: 'Letter, Gun, Knuckles', titleCn: '信 · 枪 · 手', meta: 'Still', ratio: '16 / 9',
        image: '/images/stills/postman/still-05.jpg',
        body: '走廊门洞做框中框，暗部占去左半幅，人物在右侧窗光里。',
        bodyEn: 'A hallway opening frames the shot; shadow takes the left half and the figure sits in window light on the right.',
      },
      {
        id: 'postman-06', title: 'Closing Sequence', titleCn: '结尾段落', meta: 'Still', ratio: '16 / 9',
        image: '/images/stills/postman/still-06.jpg',
        body: '大景别室内，亮部窗帘居中，人物贴右缘入画，左右形成重量拉扯。',
        bodyEn: 'A wide interior: the bright curtain holds centre while the figure enters hard against the right edge, pulling the weight sideways.',
      },
    ],
  },
  {
    id: 'grp-echo',
    title: 'Echo',
    titleCn: '回声',
    meta: 'Short',
    role: 'Editor · Colorist · Re-recording Mixer',
    items: [
      {
        id: 'echo-01', title: 'Grading Reference', titleCn: '调色参考', meta: 'Still', ratio: '16 / 9',
        image: '/images/stills/echo/still-01.jpg',
        body: '背影在左前景，站姿人物在右，窗光从后打入，画面分出前后两层。',
        bodyEn: 'A back sits in the left foreground and a standing figure on the right, with window light from behind separating the two planes.',
      },
      {
        id: 'echo-02', title: 'The Silence Before', titleCn: '静默', meta: 'Still', ratio: '16 / 9',
        image: '/images/stills/echo/still-02.jpg',
        body: '人物居中而坐，屋檐横向铺满上半幅，左后景留一个小人影拉出纵深。',
        bodyEn: 'The seated figure holds centre, the roofline runs flat across the upper half, and a small figure in the left background opens up depth.',
      },
      {
        id: 'echo-03', title: 'Four Frames', titleCn: '四帧', meta: 'Still', ratio: '16 / 9',
        image: '/images/stills/echo/still-03.jpg',
        body: '门框与立柱把画面切成三段，前景桌面虚化，人物退到右侧远处。',
        bodyEn: 'Door frame and post cut the image into three bands; the foreground table blurs and the figure retreats to the far right.',
      },
      {
        id: 'echo-04', title: 'Final Shot', titleCn: '收尾镜头', meta: 'Still', ratio: '16 / 9',
        image: '/images/stills/echo/still-04.jpg',
        body: '人物正面居中，桌沿横线压住下缘，背景绿色斑驳虚化。',
        bodyEn: 'The subject is centred and frontal, the table edge pins the lower border, and the green background breaks into dapple.',
      },
    ],
  },
  {
    id: 'grp-dusk',
    title: 'Dusk',
    titleCn: '落暮',
    meta: 'Feature',
    role: 'Second Assistant Director · Still Photographer',
    items: [
      {
        id: 'dusk-01', title: 'Magic Hour', titleCn: '魔术时刻', meta: 'Still', ratio: '3 / 2',
        image: '/images/stills/dusk/still-01.jpg',
        body: '严格对称构图，墙面画作与桌面共用中轴，暖光自左侧铺开。',
        bodyEn: 'A strictly symmetrical composition: the wall painting and the table share one central axis, with warm light spreading from the left.',
      },
      {
        id: 'dusk-02', title: 'Second Camera', titleCn: '第二机位', meta: 'Still', ratio: '3 / 2',
        image: '/images/stills/dusk/still-02.jpg',
        body: '一卧一立分置左下与右侧，散落的橙子沿对角线把两端连起来。',
        bodyEn: 'One figure lies at the lower left, another stands at the right, and scattered oranges run a diagonal that ties the two ends together.',
      },
    ],
  },
]
