// 课程作业（프롬프트 엔지니어링 수업 Week 2 ~ 7）
// 수업 과제 목록. 파일은 public/assignments/ 아래에 있고, 이 목록만 고치면 페이지가 바뀝니다.
//
// files[].kind
//   'md'    → 页面内打开 Markdown 阅读器 / 페이지 안에서 Markdown 뷰어로 열기
//   'pdf'   → 新标签页打开 / 새 탭에서 열기
//   'code'  → 新标签页打开源码 / 새 탭에서 소스 열기
//   'play'  → 可直接游玩的网页 / 바로 플레이할 수 있는 웹 페이지
//   'repo'  → GitHub 仓库 / GitHub 저장소

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
