# W8 사용한 프롬프트 / 使用的提示词

Figma 파일 / Figma 文件: https://www.figma.com/design/qgafG5BJ533cOKJ7ACpHPE

도구 / 工具: Claude Code + Figma 플러그인(MCP) — `use_figma`, `upload_assets`, `generate_image` (모델 / 模型: Gemini 3.1 Flash Image)

## 1. Claude Code에 준 작업 지시 / 给 Claude Code 的任务指令

1. 과제 설명 전체 + "请与我一起完成这项和figma与作品集网站相关的作业 使用figma的扩展来做"
2. "整个figma页面中只留下电脑，ipad，手机三个版本 … 我要与我的作品集完全相同 … 不可进行任何对我原作品集网站的省略"
3. "各版本应该是一个竖着的长条 … 简介的Z1Z2Z3区只显示在顶头 … 直到项目那个part的最后才接项目的z6"
4. "作品集网站设置的是鼠标移动到图片上图片才显色 … figma上图片都是黑白的了，请帮我解决"
5. "以作品集网站为核心,制作1页宣传册PDF / 用Figma制作名片(主页Logo用图像生成,名片也用图像生成)(名片图片2张) … 我想沿用昆汀电影美学的风格去做，希望能有一些胶片的风格化在里面"

## 2. 이미지 생성 프롬프트 (타란티노 · 그라인드하우스 · 필름) / 生图提示词（昆汀 · Grindhouse · 胶片）

### ① 홈페이지 로고 / 主页 Logo (1024 × 1024)

```
Logo for a filmmaker's portfolio website: a 1970s grindhouse cinema emblem. Bold chunky
slab-serif letters "YG" set inside a circular 35mm film reel with sprocket holes around the
rim, one small red star. Colors only: yellow #FFD400, black #0D0D0D and blood red #C8102E.
Flat vector logo, slightly distressed screen-print texture, centered on a plain cream
(#F1E7D0) background. Only the letters YG, no other words.
```

### ② 브로슈어 키 비주얼 / 宣传册主视觉 (세로 / 竖版)

```
Key art for a 1970s grindhouse exploitation movie poster, hand-painted pulp illustration
style, absolutely no text, no letters, no logos. A lone young filmmaker seen in silhouette
from a dramatic low angle (looking up from the ground, like a trunk shot), carrying a vintage
16mm film camera on his shoulder, standing in a windy rice field at dusk. A huge flat yellow
(#FFD400) sun behind him, palette of black, yellow and blood red (#C8102E), halftone dot
printing with slightly misregistered colors, distressed cream paper with fold creases, film
scratches, dust, an orange light leak, heavy 35mm film grain. Strong graphic composition
with calm empty space in the lower third.
```

### ③ 명함 앞면 / 名片正面

```
Print-ready business card artwork, flat and full-bleed edge to edge, NOT a mockup: no table,
no shadow, no perspective, no rounded corners, absolutely no text or numbers. 1970s grindhouse
cinema aesthetic: solid yellow (#FFD400) background with distressed screen-print texture, a
bold black diagonal band with a thin blood-red (#C8102E) stripe running across the lower right
corner, a red halftone sun circle in the top right, film grain, scratches and dust like a worn
35mm print. The left two-thirds stays plain yellow for typography.
```

### ④ 명함 뒷면 / 名片背面

```
Print-ready business card artwork, flat and full-bleed edge to edge, NOT a mockup: no table,
no shadow, no perspective, absolutely no text, letters or numbers. A black 35mm film strip
fills the whole card horizontally: a row of rectangular sprocket holes along the top edge and
along the bottom edge, the middle is one dark empty film frame. Orange-red film burn and light
leak bleeding in from the right edge, fine vertical scratches, dust specks, heavy film grain,
slight vignette, 1970s grindhouse cinema feel.
```

## 2-B. 명함 v2 (미니멀) / 名片 v2（极简）

지시 / 指令: "现在的设计过于复杂了，能否参照我图中的极简风格去做。根据不同的昆汀电影美学的色彩方案给我4套及以上的设计供我选择，关于我的logo，就设计一个我名字 郭宇骅 的艺术字签名好了"

### ⑤ 로고: 이름 서명 / Logo：姓名艺术字签名

```
An artist's autograph: expressive Chinese brush-calligraphy signature of the name 郭宇骅
(exactly three characters: 郭, 宇, 骅), written in flowing running script (行书) with fast,
confident, connected strokes and dry-brush edges, like a film director's signature. Pure white
ink on a solid pure black background. Only these three characters, no seal stamp, no other
text, no frame, centered with generous margins, high contrast, crisp edges.
```

흰 글씨 / 검정 배경으로 생성한 뒤 투명 PNG로 변환 → Figma에서 마스크로 써서 어떤 색으로도 바꿀 수 있음.
生成白字黑底后转成透明 PNG，在 Figma 里作为遮罩使用，可以换成任意颜色。

### ⑥ 서명 후보 B: 행초 연필 / 签名候选 B：行草连笔

```
A personal autograph signature of the Chinese name 郭宇骅 (exactly three characters: 郭, 宇,
骅), written as ONE fast continuous connected stroke in cursive running-grass script (行草),
like a celebrity signing an autograph with a brush pen: characters overlap and flow into each
other, a long sweeping underline flourish at the end. Pure white ink on a solid pure black
background. Only these three characters, no seal, no other text, centered, crisp edges.
```

후보 C–F는 Figma AI 크레딧이 소진되어 서예 글꼴(志莽行书 / 柳建毛草 / 龙藏体 / 马善政)로 만든 시안. 최종 선택은 **C 志莽行书**, 색 조합은 **01 Kill Bill**.
候选 C–F 是 Figma AI 额度用完后，用书法字体（志莽行书 / 柳建毛草 / 龙藏体 / 马善政）做的样稿。最终选定 **C 志莽行书**，配色用 **01 Kill Bill**。

### 6가지 타란티노 색 조합 / 6 套昆汀配色

| # | 영화 / 电影 | 앞면 (바탕 / 서명 / 포인트) / 正面（底 / 签名 / 点缀） | 뒷면 (바탕 / 글자) / 背面（底 / 字） |
|---|---|---|---|
| 01 | Kill Bill 杀死比尔 | #FFD400 / #0D0D0D / #C8102E | #0D0D0D / #FFD400 |
| 02 | Pulp Fiction 低俗小说 | #EFE4CC / #141414 / #B3121B | #B3121B / #F3E9D2 |
| 03 | Reservoir Dogs 落水狗 | #F4F3EF / #0B0B0B / #A3121A | #0B0B0B / #F4F3EF |
| 04 | Once Upon a Time in Hollywood 好莱坞往事 | #EAD7B5 / #C4501B / #1F5F66 | #1F5F66 / #EAD7B5 |
| 05 | Django Unchained 被解救的姜戈 | #E6D8BE / #3B1F12 / #9A3412 | #2A1A12 / #E6D8BE |
| 06 | The Hateful Eight 八恶人 | #E7EBED / #1E2A33 / #8C1C13 | #1E2A33 / #E7EBED |

## 3. 디자인 메모 / 设计说明

- **콘셉트 / 概念**: 포트폴리오 사이트를 70년대 그라인드하우스 영화 포스터로. 사이트의 5개 구역(PROFILE · FILM · IMAGES · PROJECTS · CONTACT)을 타란티노식 "CHAPTER 1–5"로 나눔.
  把作品集网站做成一张 70 年代 grindhouse 电影海报，网站的 5 个部分对应昆汀式的"CHAPTER 1–5"。
- **필름 요소 / 胶片元素**: 스프로킷 구멍이 있는 35mm 필름 스트립(사이트 실제 사진 5장), 세로 필름 엣지 코드, 필름 번(burn)·스크래치·그레인, 포스터식 빌링 블록(크레딧), "NOW SHOWING".
  带齿孔的 35mm 胶片条（放网站上的 5 张真实照片）、竖排片边编码、烧片/划痕/颗粒、海报式演职员表、"NOW SHOWING"。
- **색 / 配色**: 노랑 #FFD400 · 검정 #0D0D0D · 피의 빨강 #C8102E · 크림 종이 #F1E7D0 (사이트 노랑과 같은 색).
  黄 #FFD400 · 黑 #0D0D0D · 血红 #C8102E · 米色纸 #F1E7D0（黄色和网站一致）。
- **글꼴 / 字体**: Alfa Slab One (제목), Bebas Neue (빌링·라벨), Courier Prime (타자기·시나리오 느낌), Noto Sans SC/KR.
- AI 이미지에는 글자를 넣지 않고, 이름·연락처·문구는 Figma 텍스트 레이어로 올려서 정확하고 수정 가능하게 함. 사진·월계관·QR(사이트 주소)은 사이트 실제 자료.
  AI 图里不放文字；姓名、联系方式、文案都是 Figma 文本图层，准确且可编辑。照片、桂冠和二维码（网站地址）用的是网站上的真实素材。
