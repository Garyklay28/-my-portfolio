// 课程作业（프롬프트 엔지니어링 수업 Week 2 ~ 9）
// 수업 과제 목록. 파일은 public/assignments/ 아래에 있고, 이 목록만 고치면 페이지가 바뀝니다.
//
// files[].kind
//   'md'    → 页面内打开 Markdown 阅读器 / 페이지 안에서 Markdown 뷰어로 열기
//   'pdf'   → 新标签页打开 / 새 탭에서 열기
//   'code'  → 新标签页打开源码 / 새 탭에서 소스 열기
//   'play'  → 可直接游玩的网页 / 바로 플레이할 수 있는 웹 페이지
//   'repo'  → GitHub 仓库 / GitHub 저장소
//   'figma' → Figma 文件 / Figma 파일
//   'img'   → 新标签页打开图片 / 새 탭에서 이미지 열기
//
// video 대신 image: { src, alt, ratio } 를 넣으면 왼쪽에 이미지가 표시됩니다 / 用 image 代替 video 时左侧显示图片
// 둘 다 넣으면 영상 아래에 이미지가 붙고, image.href 가 있으면 클릭 시 원본을 엽니다 / 两者都有时图片接在视频下方，image.href 为点击打开的原图

const GAME_URL = 'https://coffee-delivery-game-week3-sigma.vercel.app'
const GAME_REPO = 'https://github.com/Garyklay28/coffee-delivery-game-week3'

export const ASSIGNMENTS = [
  {
    id: 'w02',
    week: 'W2',
    date: '2026-09-13',
    title: 'WHO I AM — 자기소개 영상',
    titleCn: '我是谁 · 自我介绍影片',
    body: 'AI 도구로 만든 3분 자기소개 영상과, 이 포트폴리오 사이트(React + Supabase) 자체.',
    bodyCn: '用 AI 工具制作的 3 分钟自我介绍影片，以及这个作品集网站本身（React + Supabase）。',
    video: {
      src: '/assignments/w02/who-i-am.mp4',
      poster: '/assignments/w02/who-i-am.jpg',
      captions: '/assignments/w02/who-i-am.vtt',
      ratio: '16 / 9',
    },
    files: [
      { kind: 'repo', label: 'Portfolio repo', href: 'https://github.com/Garyklay28/-my-portfolio' },
    ],
  },
  {
    id: 'w03',
    week: 'W3',
    date: '2026-09-30',
    title: '프롬프트 구조화 실습 — 커피 배달 게임',
    titleCn: '提示词结构化练习 · 咖啡配送游戏',
    body: '막연한 프롬프트(A)와 구조화한 프롬프트(B)를 같은 게임에 적용해 비교한 기록지와 발표 원고.',
    bodyCn: '把模糊提示词（A）和结构化提示词（B）用在同一个游戏上做对比的记录表，以及发表稿。',
    files: [
      { kind: 'md', label: 'WORKSHEET.md', href: '/assignments/w03/WORKSHEET.md' },
      { kind: 'pdf', label: '발표 원고 / 发表稿', href: '/assignments/w03/presentation-script.pdf' },
      { kind: 'repo', label: 'GitHub', href: GAME_REPO },
    ],
  },
  {
    id: 'w05',
    week: 'W5',
    date: '2026-09-30',
    title: '커피게임 고도화 — 1인칭 밀수 배달',
    titleCn: '咖啡游戏升级 · 第一人称走私配送',
    body: '커피 배달에 비밀 꾸러미 운반, 시야 90°로 순찰하는 경찰, 군중 속 숨기를 더한 1인칭 버전. Vercel에 배포.',
    bodyCn: '在送咖啡之外加入秘密包裹、视野 90° 的巡逻警察和人群中躲藏的第一人称版本，已部署到 Vercel。',
    video: {
      src: '/assignments/w05/smuggling-run.mp4',
      poster: '/assignments/w05/smuggling-run.jpg',
      ratio: '3 / 2',
    },
    files: [
      { kind: 'play', label: 'Play (Vercel)', href: GAME_URL },
      { kind: 'repo', label: 'GitHub', href: GAME_REPO },
    ],
  },
  {
    id: 'w06',
    week: 'W6',
    date: '2026-10-07',
    title: '상대방 게임과 동일하게 만들기 — 링이',
    titleCn: '复刻对方的游戏 · 링이',
    body: '링이의 A 버전에서 출발해 링이의 프롬프트 13개를 순서대로 실행해 B 결과물을 재현하고, 어긋난 지점을 비교했다.',
    bodyCn: '从링이的 A 版出发，按顺序执行她的 13 条提示词复刻 B 版，并对比两边不一致的地方。',
    video: {
      src: '/assignments/w06/lingyi-repro.mp4',
      poster: '/assignments/w06/lingyi-repro.jpg',
      ratio: '3 / 2',
    },
    files: [
      { kind: 'md', label: '링이.md', href: '/assignments/w06/lingyi.md' },
      { kind: 'play', label: 'Play 링이.html', href: `${GAME_URL}/${encodeURIComponent('링이')}.html` },
      { kind: 'repo', label: 'GitHub', href: GAME_REPO },
    ],
  },
  {
    id: 'w06-prompt',
    week: 'W6',
    date: '2026-10-08',
    title: '시스템 프롬프트 추출 — 커피 게임',
    titleCn: '从代码提取系统提示词 · 咖啡游戏',
    body: 'GitHub의 게임 코드에서 시스템 프롬프트를 거꾸로 뽑아내고, 검토 체크리스트와 "바꾸면 안 되는 값" 검사 스크립트를 만들었다.',
    bodyCn: '从 GitHub 上的游戏代码反推出系统提示词，并写了检查清单和“不能改的值”校验脚本。',
    files: [
      { kind: 'md', label: 'SYSTEM_PROMPT.md', href: '/assignments/w06-prompt/SYSTEM_PROMPT.md' },
      { kind: 'md', label: 'CHECKLIST.md', href: '/assignments/w06-prompt/CHECKLIST.md' },
      { kind: 'code', label: 'verify.cjs', href: '/assignments/w06-prompt/verify.cjs' },
    ],
  },
  {
    id: 'w07',
    week: 'W7',
    date: '2026-10-15',
    title: 'Skill Creation — 자막 중→영 번역 스킬 패키지',
    titleCn: '技能包 · 中译英字幕翻译',
    body: '단편영화 자막 97줄을 프롬프트만으로 번역(A)한 결과와, 오픈소스 스킬 6개 + 총괄 스킬 + 검사 스크립트로 번역(B)한 결과를 비교.',
    bodyCn: '短片字幕 97 行：只用提示词翻译（A）对比用 6 个开源 skill + 总控 skill + 检查脚本翻译（B）。',
    files: [
      { kind: 'md', label: 'README.md', href: '/assignments/w07/README.md' },
      { kind: 'repo', label: 'week6_skills_package', href: 'https://github.com/Garyklay28/week6_skills_package' },
    ],
  },
  {
    id: 'w08',
    week: 'W8',
    date: '2026-10-18',
    title: 'Figma 플러그인 — 포트폴리오 캔버스 · 브로슈어 · 명함',
    titleCn: 'Figma 插件 · 作品集画布 · 宣传册 · 名片',
    body: 'Claude Code + Figma 플러그인(MCP)으로 이 사이트를 구역(Z1–Z22)으로 나눠 데스크톱 1440 · 아이패드 834 · 모바일 390 세로 캔버스로 1:1 재현(텍스트 · 사진 개별 편집 가능). 같은 페이지에 사이트 배색(흑 · 백 · 파랑 · 노랑)을 따른 텍스트 중심 미니멀 브로슈어 1장과, 郭宇骅 서명 로고를 넣은 Kill Bill 배색 명함(앞 · 뒤)을 추가했다.',
    bodyCn: '用 Claude Code + Figma 插件（MCP）把这个网站按区域（Z1–Z22）拆分，1:1 还原成桌面 1440 · iPad 834 · 手机 390 三条竖向画布（文字、照片都可单独编辑）。同一页面里加入了沿用网站配色（黑 · 白 · 蓝 · 黄）、只用文字的极简宣传册 1 页，以及带“郭宇骅”签名 Logo 的 Kill Bill 配色名片（正反面）。',
    image: {
      src: '/assignments/w08/preview.jpg',
      alt: '브로슈어와 명함 앞·뒤 / 宣传册与名片正反面',
      ratio: '3 / 2',
    },
    files: [
      { kind: 'figma', label: 'Figma 파일 / 文件', href: 'https://www.figma.com/design/qgafG5BJ533cOKJ7ACpHPE' },
      { kind: 'pdf', label: '브로슈어 / 宣传册', href: '/assignments/w08/brochure-behind-the-image.pdf' },
      { kind: 'img', label: '명함 앞면 / 名片正面', href: '/assignments/w08/business-card-front.png' },
      { kind: 'img', label: '명함 뒷면 / 名片背面', href: '/assignments/w08/business-card-back.png' },
      { kind: 'md', label: 'PROMPTS.md', href: '/assignments/w08/PROMPTS.md' },
    ],
  },
  {
    id: 'w09',
    week: 'W9',
    date: '2026-10-22',
    title: 'Next Big Thing — TapNow AI 단편 · 지하철 훔쳐보기',
    titleCn: 'Next Big Thing · TapNow AI 短片 · 地铁偷瞄',
    body: '시드니 지하철에서 청년이 옆자리 아저씨의 휴대폰을 훔쳐보는데, 화면에 떠 있는 건 자신의 포트폴리오. Claude로 11컷 콘티를 쓰고, TapNow 캔버스에서 Nano Banana로 주인공 4면도 · 빈 객차 · 소품 · 키프레임을 만든 뒤 Seedance 2.5에 레퍼런스 8장과 타임코드 프롬프트 하나를 넣어 25초를 한 번에 생성했다.',
    bodyCn: '悉尼地铁上，年轻人偷瞄邻座大叔的手机，屏幕上正在看的是他自己的作品集。先用 Claude 写 11 镜分镜，再在 TapNow 画布里用 Nano Banana 做主角四视图、空车厢、道具和定帧，最后把 8 张参考图和一条带时间码的提示词交给 Seedance 2.5，一次生成 25 秒。',
    video: {
      src: '/assignments/w09/next-big-thing.mp4',
      poster: '/assignments/w09/next-big-thing.jpg',
      ratio: '16 / 9',
    },
    image: {
      src: '/assignments/w09/workflow-preview.jpg',
      href: '/assignments/w09/workflow.jpg',
      alt: '제작 과정 이미지 / 制作流程图',
      ratio: '16 / 9',
    },
    files: [
      { kind: 'img', label: '제작 과정 / 制作流程图', href: '/assignments/w09/workflow.jpg' },
      { kind: 'md', label: 'PROMPTS.md', href: '/assignments/w09/PROMPTS.md' },
    ],
  },
  {
    id: 'extra',
    week: '+',
    date: '2026-10-08',
    title: '개인 스킬 — 오늘의 NBA·축구 뉴스 PDF',
    titleCn: '个人技能 · 今日 NBA·足球简报 PDF',
    body: '여러 매체에서 당일 소식을 모아 교차 검증한 뒤 A4 한 장 PDF로 만드는 Claude 스킬.',
    bodyCn: '从多家媒体收集当天新闻、交叉核实后排成一页 A4 PDF 的 Claude 技能。',
    files: [
      { kind: 'md', label: 'SKILL.md', href: '/assignments/extra/today-news-pdf-SKILL.md' },
    ],
  },
]
