# week6_skills_package — 단편영화 자막 중→영 번역 스킬 패키지

과제1. Skill Creation · 곽우화 (郭宇骅, [@Garyklay28](https://github.com/Garyklay28))

## 1. 과제 / 任务

**한국어** 직접 만든 단편영화의 중국어 대사 자막(97줄)을 영어 자막으로 번역합니다. 영상학 전공으로서 영화제 출품이나 상영에 실제로 필요한 작업입니다. 같은 입력과 같은 영화 배경 설명으로 두 번 번역합니다. **A**는 프롬프트만 쓰고, **B**는 오픈소스 스킬 6개와 직접 만든 총괄 스킬, 검사 스크립트로 이루어진 스킬 패키지를 씁니다.

**中文** 把自己短片的中文对白字幕（97 行）翻成英文字幕。这是影像专业做影展投稿、放映时真实需要的工作。同一份输入、同一段影片背景，翻两次：**A** 只用提示词；**B** 用技能包（6 个开源 skill + 自己写的总控 skill + 检查脚本）。

> 영화 배경 / 影片背景: 두 아이가 폐선로 터널 근처에서 숨바꼭질을 한다. 한 아이는 터널에서 노인이 나와 기차가 온다고 경고했다고 하고, 다른 아이는 믿지 않는다. 마지막에 정말 기차가 온다. / 两个小孩在废弃铁路隧道附近玩捉迷藏，一个说隧道里跑出个老头提醒火车要来，另一个不信；结尾火车真的来了。

## 2. 저장소 구조 / 仓库结构

```
input/字幕文件中文.txt          원문 자막 97줄 (타임코드 없음) / 中文原字幕 97 行（无时间码）
A_no_skills/
  PROMPT.md                    A에 준 프롬프트 전문 / 给 A 的完整提示词
  result_en.txt                A 결과 / A 结果
B_with_skills/
  PROMPT.md                    B에 준 프롬프트 전문 (A와 같고 스킬 사용 지시만 추가) / 给 B 的提示词（与 A 相同，只多了用技能包）
  skills/                      스킬 패키지 / 技能包
    subtitle-zh-en-pipeline/   ★ 직접 작성한 총괄 스킬 / 自己写的总控 skill
    baoyu-translate/  subtitle-translation/  srt-translator/
    alterlab-cdm-subtitle-loc/  humanizer/  verification-before-completion/
    SOURCES.md                 출처·커밋·라이선스 / 来源、commit、许可证
  scripts/
    subtitle_check.py          자막 검사 스크립트 / 字幕检查脚本
    eval_terms.json            용어 일관성 검사 목록 / 术语一致性检查表
  .baoyu-skills/baoyu-translate/EXTEND.md   baoyu-translate 설정 / 配置
  work/                        B의 중간 산출물 (분석→용어집→초안→검사→비평→수정→최종) / B 的中间文件
  result_en.txt                B 결과 / B 结果
  check_report.md              B 최종 검사 결과 / B 最终检查报告
eval/
  compare.py                   A·B를 같은 검사기로 채점 / 用同一个检查器给 A、B 打分
  COMPARISON.md                전체 비교표 + 줄별 비교 / 完整对比表 + 逐行对比
export/
  skills/                      바로 설치할 수 있는 7개 스킬 (8절) / 可直接安装的 7 个 skill（见第 8 节）
  zips/                        claude.ai 업로드용 zip / 上传 claude.ai 用的 zip
```

## 3. 실험 방법 / 实验方法

**한국어**
- A와 B는 각각 **새로 띄운 독립 서브에이전트**(Claude Opus 5.5)가 실행했습니다. 서로의 폴더를 열지 못하게 하고, 웹 검색은 쓰지 않았습니다.
- 두 프롬프트의 영화 배경과 출력 조건(97줄, 줄 단위 1:1 대응)은 글자 하나까지 같습니다. 차이는 B에 "스킬 패키지를 따르라"는 한 단락이 더 있다는 것뿐입니다.
- A는 번역 후 바로 저장합니다. B는 총괄 스킬의 6단계를 따릅니다: ① baoyu-translate로 분석·용어집 작성 → ② subtitle-translation·srt-translator 규칙으로 초안 작성 → ③ `subtitle_check.py`로 측정 → ④ baoyu-translate 비평 + humanizer 패턴 + alterlab 자막 규격으로 진단 → ⑤ 수정·다듬기 → ⑥ verification-before-completion에 따라 검사 통과 전에는 완료라고 하지 않음.
- 채점: `eval/compare.py`가 **같은 검사기, 같은 용어 목록**으로 A와 B 결과를 채점합니다.

**中文**
- A、B 各由一个**全新的独立子代理**（Claude Opus 5.5）运行，互相不能看对方的文件夹，也不联网搜索。
- 两份提示词的影片背景和输出要求（97 行、逐行对应）一字不差，B 只多一段"按技能包做"。
- A 翻完直接保存。B 按总控 skill 走 6 步：① baoyu-translate 分析、建术语表 → ② 按 subtitle-translation、srt-translator 的规则出初稿 → ③ 用 `subtitle_check.py` 测量 → ④ 用 baoyu-translate 审校 + humanizer 模式 + alterlab 字幕规范做诊断 → ⑤ 修改、润色 → ⑥ 按 verification-before-completion，检查不通过不算完成。
- 评分：`eval/compare.py` 用**同一个检查器、同一份术语表**给 A、B 打分。

## 4. A vs B 비교 / 对比

### 4.1 검사기 수치 / 检查器数据

| 항목 / 指标 | A (스킬 없음 / 无技能) | B (스킬 패키지 / 技能包) |
|---|---|---|
| 필수 검사 (줄 수·중국어 잔존·대시) / 硬性检查 | PASS | PASS |
| 총 글자 수 / 总字符数 | 2172 | **1786** (−18%) |
| 줄당 평균 글자 / 每行平均 | 22.4 | **18.4** |
| 최장 줄 / 最长一行 | 51 | **47** |
| 42자 초과 줄 (한 줄에 안 들어감) / 超过 42 字符 | 5 | **1** |
| 추정 읽기 속도 17 CPS 초과 줄 / 估算阅读速度超 17 CPS | 45 | **11** |
| AI 상투어·세미콜론·비축약형 / AI 套话、分号、未缩写 | 0 | 0 |
| 용어 불일치 / 术语不一致 | 0 | 0 |
| 비용 (서브에이전트 토큰 / 도구 호출 / 시간) / 成本 | 약 63k / 3 / 29초 | 약 127k / 19 / 286초 |

전체 표와 줄별 비교: [`eval/COMPARISON.md`](eval/COMPARISON.md) / 完整表格与逐行对比见该文件。

### 4.2 줄별 예시 / 逐行示例

| # | 원문 / 原文 | A | B | 메모 / 备注 |
|---|---|---|---|---|
| 6 | 我说你是不是被我抓傻了？ | Have I caught you so many times you've gone dumb? | Did getting caught fry your brain? | A는 "여러 번 잡혔다"를 덧붙임(원문에 없음). B가 더 정확하고 짧음 / A 加了原文没有的"抓了很多次"；B 更准更短 |
| 16 | 让咱赶紧走 | and told us to get out of here fast. | Said we gotta go. | B는 아이 말투, 35→17자 / B 是小孩口吻 |
| 69 | 就开个玩笑嘛至于吗 | It was just a joke. Is it really that big a deal? | It was just a joke. Relax. | "至于吗"를 직역하지 않고 의도대로 / 不直译"至于吗"，译出意图 |
| 83 | 你还敢自己出来 | You actually came out on your own? | You dare show yourself? | A는 "敢"(감히)의 도발을 놓침 / A 丢了"敢"的挑衅 |
| 95 | 火车来了 拽不动你 | The train's coming--I can't pull you out! | Train's coming! I can't pull you out! | A는 `--` 대시 사용 (아래 한계 참고) / A 用了 `--` 破折号 |
| 12 | 我怎么没看见 | How come I didn't see him? | I didn't see him. | **A가 나음**: B는 "怎么"의 의문 뉘앙스를 잃음 / **A 更好**：B 丢了"怎么"的疑问语气 |
| 82 | 不抓你 人呢 | I won't tag you. Where'd you go? | I won't! Where are you? | B는 짧지만 "안 잡을게"가 앞줄에 기대야 이해됨 / B 短，但要靠上一行才懂 |

### 4.3 결론 / 结论

**한국어** 두 결과 모두 필수 검사를 통과했고, 용어도 일관됐습니다. A도 "그럭저럭 쓸 만한" 수준이었습니다. 차이는 **자막으로서의 적합성**에서 났습니다. B는 42자 초과 줄이 5개에서 1개로, 추정 읽기 속도 초과 줄이 45개에서 11개로 줄었고, 직역투(6, 69, 83번 줄)도 줄었습니다. 이는 스킬이 "측정 → 비평 → 수정" 루프를 강제했기 때문입니다. B 자신의 초안도 49줄이 속도 초과였는데, 검사 스크립트와 비평 단계를 거쳐 11줄이 되었습니다(`work/03-draft-check.md` → `check_report.md`). 대가로 토큰은 약 2배, 시간은 약 10배가 들었고, 줄이는 과정에서 뉘앙스를 잃은 줄(12번)도 있었습니다.

**中文** 两份结果都通过了硬性检查，术语也都统一，A 本身已经"基本能用"。差别在**作为字幕是否合格**：B 把超过 42 字符的行从 5 行降到 1 行，估算阅读速度超标的行从 45 行降到 11 行，直译腔（第 6、69、83 行）也少了。原因是技能包强制走"测量 → 审校 → 修改"的循环：B 自己的初稿也有 49 行超速，经过检查脚本和审校后才降到 11 行（`work/03-draft-check.md` → `check_report.md`）。代价是 token 约 2 倍、时间约 10 倍，而且压缩时有的行丢了语气（第 12 行）。

## 5. 스킬 출처 / 技能来源

6개 오픈소스 스킬은 원본 그대로 복사했고, 각 폴더에 원본 저장소의 `LICENSE`를 함께 두었습니다. 커밋까지 고정한 링크는 [`B_with_skills/skills/SOURCES.md`](B_with_skills/skills/SOURCES.md)에 있습니다. / 6 个开源 skill 原样复制，每个文件夹都附上原仓库的 `LICENSE`；固定到 commit 的链接见 SOURCES.md。

| 스킬 / Skill | 역할 / 作用 | 출처 / 来源 | 라이선스 / 许可证 |
|---|---|---|---|
| baoyu-translate | 분석→용어집→초안→비평→수정→다듬기 (refined 모드) / 精翻流程 | [JimLiu/baoyu-skills](https://github.com/JimLiu/baoyu-skills/tree/main/skills/baoyu-translate) | MIT |
| subtitle-translation | 구어체·간결함·화면 가독성 / 口语化、简短、可读 | [srmdn/open-writing](https://github.com/srmdn/open-writing/tree/main/skills/subtitle-translation) | Apache-2.0 |
| srt-translator | 자막 구조·타이밍 고정, 현지화 / 保持结构与时间轴、本地化 | [nicepkg/ai-workflow](https://github.com/nicepkg/ai-workflow/tree/main/workflows/video-creator-workflow/.claude/skills/srt-translator) | MIT |
| alterlab-cdm-subtitle-loc | 42자·2줄·17 CPS 규격, 캐릭터 말투 일관성 / 字幕规范 | [AlterLab-IEU/AlterLab-FC-Skills](https://github.com/AlterLab-IEU/AlterLab-FC-Skills/tree/main/skills/cdm/alterlab-cdm-subtitle-loc) | MIT |
| humanizer | AI 문체 제거 (Wikipedia "Signs of AI writing" 기반) / 去 AI 腔 | [blader/humanizer](https://github.com/blader/humanizer) | MIT |
| verification-before-completion | 검사 결과 없이 "완료"라고 하지 않기 / 没有检查结果不许说完成 | [obra/superpowers](https://github.com/obra/superpowers/tree/main/skills/verification-before-completion) | MIT |
| subtitle-zh-en-pipeline | 위 6개를 어느 단계에서 쓸지 정하는 총괄 스킬 / 总控 skill | 이 저장소 (직접 작성) / 本仓库自写 | MIT |

`subtitle_check.py`, `eval_terms.json`, `eval/compare.py`도 이 과제를 위해 직접 작성했습니다. / 这几个脚本也是为本作业自己写的。

## 6. 재현 / 复现

```bash
python3 B_with_skills/scripts/subtitle_check.py input/字幕文件中文.txt B_with_skills/result_en.txt --terms B_with_skills/scripts/eval_terms.json
```

```bash
python3 eval/compare.py
```

Python 3 표준 라이브러리만 사용합니다. / 只用 Python 3 标准库。

## 7. 한계 / 局限

**한국어**
- 원문에 타임코드가 없어 읽기 속도(CPS)는 **추정치**입니다(중국어 초당 4.5자, 최소 1초 가정). 실제 SRT가 있으면 정확히 잴 수 있습니다.
- 검사기는 em/en 대시(—, –)만 잡고 ASCII `--`는 놓칩니다. A의 92·95번 줄이 이 경우입니다. 실험 후에 채점 기준을 바꾸지 않으려고 검사기는 그대로 두고 여기에 기록합니다.
- 검사기는 형식과 길이만 봅니다. 번역의 정확성은 4.2절의 수작업 비교로만 판단했습니다.
- A와 B 모두 1회씩만 실행했습니다(같은 모델이라도 실행마다 결과가 다를 수 있음).

**中文**
- 原文没有时间码，阅读速度（CPS）是**估算值**（假设中文每秒 4.5 字、每条至少 1 秒）。有真实 SRT 就能精确测量。
- 检查器只抓 em/en 破折号（—、–），漏掉了 ASCII `--`，A 的第 92、95 行就是这种情况。为了不在实验后改评分标准，检查器保持原样，在这里记录。
- 检查器只看格式和长度，翻译准确性只靠 4.2 节的人工对比。
- A、B 各只跑了一次（同一模型每次结果也可能不同）。

## 8. 설치 / 安装

**한국어** `B_with_skills/skills/`는 이 저장소 안에서 실험하기 위한 버전입니다(저장소 경로에 묶여 있음). 다른 프로젝트에서 쓰려면 `export/skills/`를 설치하세요. 실험 버전과 다른 점:
- 총괄 스킬이 검사 스크립트를 자기 폴더(`scripts/`)에 포함하고, 다른 6개 스킬을 같은 위치의 형제 폴더에서 찾습니다.
- baoyu-translate 설정 파일이 없으면 `assets/EXTEND.md`를 프로젝트에 복사해서 첫 설정 단계에서 멈추지 않습니다.
- 용어 일관성 목록(`terms.json`)을 작품마다 용어집에서 자동으로 만듭니다.
- SRT 입력도 받으며, 번호와 타임코드는 그대로 복사합니다.
- 검사 스크립트가 ASCII `--`도 필수 위반으로 잡습니다. 4절 점수는 실험 당시 검사기로 낸 것이라 바꾸지 않았습니다(새 검사기로는 A의 92·95번 줄이 걸림).

**中文** `B_with_skills/skills/` 是在本仓库里做实验用的版本（写死了仓库路径）。要在别的项目里用，请安装 `export/skills/`。和实验版的区别：
- 总控 skill 把检查脚本放在自己的 `scripts/` 里，其余 6 个 skill 按同级文件夹去找。
- 找不到 baoyu-translate 的配置文件时，把 `assets/EXTEND.md` 复制到项目里，不会卡在初次设置。
- 术语一致性列表（`terms.json`）按每部片子的术语表自动生成。
- 支持 SRT 输入，序号和时间码原样复制。
- 检查脚本把 ASCII `--` 也算作硬性错误。第 4 节的分数是用实验时的检查器算的，没有改（用新检查器的话，A 的第 92、95 行会被标出）。

Claude Code (개인 스킬 / 个人 skill):

```bash
mkdir -p ~/.claude/skills && cp -R export/skills/. ~/.claude/skills/
```

claude.ai: Settings → Capabilities → Skills에서 `export/zips/`의 zip 7개를 하나씩 업로드 / 在 Settings → Capabilities → Skills 里逐个上传 `export/zips/` 中的 7 个 zip。

**호출 / 调用**
- Claude Code: 스킬 이름은 **`字幕翻译`** 입니다. 새 세션에서 `/字幕翻译 <파일 경로>`를 입력하세요. 폴더 이름인 `/subtitle-zh-en-pipeline`도 계속 작동합니다. / Claude Code 里 skill 名是 **`字幕翻译`**，新会话里输入 `/字幕翻译 <文件路径>`；用文件夹名 `/subtitle-zh-en-pipeline` 也照样能调用。
- claude.ai: Agent Skills 규격상 이름에는 소문자 영문·숫자·하이픈만 쓸 수 있어서, zip은 `subtitle-zh-en-pipeline`이라는 이름을 유지합니다. 설명에 「字幕翻译」를 넣어 두었으니 "字幕翻译"라고 말하면 선택됩니다. / Agent Skills 规范要求名字只能用小写英文、数字和连字符，所以 zip 里的名字仍是 `subtitle-zh-en-pipeline`；描述里写了「字幕翻译」，说"字幕翻译"就会选中它。
- 자연어로 "이 중국어 자막을 영어로 번역해 줘" / "把这个中文字幕翻成英文"라고 해도 됩니다. / 直接用自然语言说也可以。
