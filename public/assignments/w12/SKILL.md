---
name: "reference-style-video"
description: "分析参考视频（YouTube、Reels、Shorts 等）的形式，制作另一个主题的手绘白板风格讲解视频（浅色背景上的黑线火柴人、文字卡、编号结构）。在浏览器内渲染并编码包含韩语男声旁白和音效的 MP4（不加背景音乐）。用于制作与参考视频风格相似的视频、重做视频旁白、添加或调整音效等请求。"
---

# 制作参考风格视频

产出物横版 1920x1080、30fps 的 MP4 及其源文件夹。不使用外部可执行文件，只用浏览器和 Node。

- 时长：2～3 分钟，绝对不超过 3 分钟（180 秒）。目标 150～175 秒。
- 风格：与参考视频一致的手绘白板风格（见「5. 场景」）。
- 声音：韩语男声旁白 + 音效。不加背景音乐。

## 0. 多智能体分工

主会话担任调度者：不自己做具体步骤，而是按下表调用 `.claude/agents/` 里的子代理，并在每一步结束后检查产出文件。子代理之间不直接对话，只通过项目文件夹 `projects/<slug>/` 里的文件交接。

| 步骤 | 子代理 | 对应章节 | 读取 | 写出 |
|-|-|-|-|-|
| 1a | `reference-analyst` | 2. 参考视频分析 | `brief.md`、参考视频 | `analysis/reference.json`、`analysis/reference.md`、`analysis/frames/sheet.png` |
| 1b | `researcher` | 3. 文案（第 1 条） | `brief.md` | `research/facts.md` |
| 2 | `scriptwriter` | 3. 文案 | `analysis/reference.md`、`research/facts.md` | `script.json` |
| 3 | `narrator` | 4. 旁白 | `script.json` | `assets/voice/`、`timing.js`、`analysis/asr-check.json` |
| 4a | `scene-builder` | 5. 场景 | `timing.js`、`script.json`、`analysis/reference.md` | `index.html`、`qa/sheet-v<N>.png` |
| 4b | `sound-designer` | 6. 音频与编码（第 2 条） | `script.json`、`timing.js` | `assets/sfx/*.wav`、`assets/sfx/list.md` |
| 5 | `editor` | 6. 音频与编码 | `index.html`、`assets/` | `out/<slug>-v<N>.mp4`、`CREDITS.txt` |
| 6 | `qa-reviewer` | 7. 验证 | `out/*.mp4`、`script.json`、`timing.js` | `qa/report-v<N>.md` |

- 1a 和 1b 互不依赖，同时运行；4a 和 4b 也同时运行。其余按顺序。
- 已有的产出可以跳过对应步骤（例如本项目的参考视频分析已完成，直接从 1b 开始）。
- 每一步结束后，调度者在 `STATUS.md` 追加一行：步骤 · 负责者 · 状态 · 产出物 · 备注。
- 以下节点停下来等人确认：文案（`script.json` 与 `research/facts.md`）、音色、成片（附 qa-reviewer 报告）。
- 退回：
  - 转写一直对不上的句子：narrator → 调度者 → scriptwriter 改 `text` 和 `say` → narrator。
  - 画面切换太快：scriptwriter 加 `pause` → narrator 重新生成 timing → scene-builder、sound-designer。
  - 画面问题 → scene-builder；音效或音量问题 → sound-designer 或 editor。
  - 改了文案或 pause 之后，按“旁白 → 时间轴 → 场景与音效 → 编码 → 验证”的顺序重做。

## 1. 准备

在仓库根目录用 `node .claude/skills/reference-style-video/scripts/serve.mjs . 4801` 启动本地服务器。该服务器提供文件，并通过 `POST /__save?path=` 保存浏览器生成的文件。

## 2. 参考视频分析

1. 获取视频文件，放在 `references/videos/`。Instagram Reels 可以在页面 HTML 的 `video_versions` 里找到 `url`，fetch 它即可下载；YouTube 用 yt-dlp 下载。
2. 在页面内用 `video` 元素和 canvas 进行测量。
   - 帧总览：覆盖全片，共 40 张。
   - 剪切点：以 0.1 秒间隔比较相邻帧，差值突然跳高的位置。
   - 字幕切换：字幕带中白色像素蒙版发生变化的时刻。求出切换次数和间隔的中位数。
     没有字幕条、而是用浅色背景上的深色文字卡时，改为统计深色像素所在行的跨度，找出只有一行字的画面。
   - 声音：有无旁白、声音高度（F0）、每秒音节数、有无背景音乐。
3. 要借鉴的是形式：画面比例、时长、字幕位置与大小、字幕速度、叙事结构、标注方式、声音构成。

测量示例见 `references/examples/reference-analysis.md`。本项目的测量结果见 `projects/time-habits/analysis/reference.md`，结论如下：

- 横版 16:9，手绘白板风格，104 个画面，每个画面中位数 3.4 秒，画面内还会弹出新元素。
- 没有字幕条。关键短句做成整屏深色文字卡（画面高度约 50% 处，约 1 秒）。
- 结构：开头钩子 → 提出问题 → 解释原理 → 编号练习 1～4 → 最后一个练习 → 总结 → 结尾。
- 旁白从头讲到尾，句间停顿 0.3～0.6 秒，没有背景音乐。

## 3. 文案

1. 通过搜索核实主题相关的事实，并留下出处。方法名、人名、数字（如“25 分钟”“2 分钟”）都要有出处。
2. 编写 `script.json`。一行就是一句旁白。
   - `text`：这句话的书面形式。数字用阿拉伯数字。
   - `say`：语音合成用的文本。把数字用韩文写出读法。
   - `pause`：在这一行之前插入的停顿（秒）。只在段落切换处使用，0.3～0.6 秒。
   - `card`：设为 `true` 的行做成整屏文字卡（见「5. 场景」）。全片 8～12 张，只给钩子、编号标题、总结这类关键短句。
3. 每行 12～20 个字，读完 2～4 秒。全片 45～60 行，总时长 150～175 秒。
4. 沿用参考视频的结构，把“练习”换成“习惯”：

   | 段落 | 内容 | 约占时长 |
   |-|-|-|
   | 开头钩子 | 1～2 张文字卡，抛出问题 | 10 秒 |
   | 提出问题 | 时间总是不够用的火柴人 | 15 秒 |
   | 习惯 1～4 | 每个：编号牌 → 这个习惯是什么 → 为什么有用 → 怎么做 | 各 25 秒 |
   | 最后一个习惯 | 用更醒目的编号牌（类似 “FINAL”） | 25 秒 |
   | 总结 | 台阶或进步图，“그러니까 오늘부터,” 这类文字卡 | 15 秒 |
   | 结尾 | 一句行动号召。不做点赞、订阅画面 | 5 秒 |

示例：`assets/example-guro-market/script.json`

## 4. 旁白

1. 用 `scripts/tts.html` 为每句话生成 wav，语言 `ko`，音色用男声（M1～M5）。每句生成多个版本（5 个左右）。
   - 正式生成前，先用同一句话生成 M1～M5 五个样本，由人试听后选定一个音色，全片只用这一个。
   - 语速约每秒 5 个音节。
2. 用 `scripts/asr.html`（Whisper，WebGPU）把所有版本转写成文字。
3. 去掉空格和标点后，用编辑距离与文案比较。只采用一致的版本。像“예순/60”“미터/m”这样的写法差异视为一致。
4. 多次生成仍然读错的句子，在保持意思不变的前提下改写措辞。`text` 和 `say` 要一起改。
5. 用 `node scripts/build-timing.mjs <project> <takes 文件夹>` 裁掉前后静音，并生成 `timing.js`。
6. 总时长超过 180 秒时，删减或缩短文案后重新生成，不靠加快语速硬压。

合成语音经常漏词。不要只看时长就放行。

## 5. 场景

在一个 `index.html` 中用 2D canvas 绘制场景（手绘白板风格不需要 three.js）。必须遵守的结构：

- `renderAt(t)`：画面、物体出现、人物、标注、文字卡，全部由 `t` 计算得出。
- `c(n, offset)`：第 n 句旁白的开始时刻。出现时间表 `T` 全部用它来定义。
- 画风（与参考视频一致）：
  - 背景：浅灰色（约 `#ececec`，四周略暗），整片不变。
  - 线条：黑色圆头线条，粗细 4～6px。人物是火柴人：圆头、单线身体、简单表情。
  - 手绘感：线条加轻微抖动。抖动用固定种子的伪随机数生成，同一个 `t` 永远一样，不用 `Math.random`。
  - 强调色只用少量：红色（箭头、X 标记）、黄色（编号牌、指示牌）、橙色（点缀）。
  - 文字：手写感字体（如 Gaegu 或 Nanum Pen Script，OFL 授权），字体文件放在 `assets/fonts/`。
- 画面切换：一句或两句旁白一个画面，画面之间直接硬切，不做镜头移动。每个画面停留 2～5 秒。
- 出现方式：画面内的新元素在对应旁白说到时弹出（快速放大到原尺寸再稍微回弹），先出人物，再出标签、气泡、箭头。
- 标注：对话气泡、物体标签、红色箭头、红色 X 标记、黄色编号牌（如 “습관 1”），都画在 canvas 上。
- 文字卡：`card: true` 的行，整屏只显示这一句，深色手写字，位于画面高度约 50% 处，不叠加任何图。
- 不加底部字幕条。
- 音效提示点也由同一个 `T` 生成。改了场景时间，声音也会跟着变。

每次修改场景后，都用每句旁白的帧总览（`window.sheet(times, cols, width)`）确认。

## 6. 音频与编码

把 `scripts/export.js` 加入场景页面。

1. `mixAudio()`：旁白 1.0，音效 0.6 倍，不加背景音乐（`music: null`）。峰值超过 -1dBFS 时整体降低音量。
2. 音效：
   - 种类：元素弹出时短“噗”声、画面切换时轻微“唰”声、编号牌出现时“叮”声、写字时的笔划声。
   - 音效要轻，不能盖过旁白；同一句里最多 2～3 个，不要每个元素都配。
   - 来源：在浏览器里用 Web Audio 合成，或使用 CC0 等免费授权的音效。每个音效的出处和授权写进 `CREDITS.txt`。
3. `encStart()` → 每次 150 帧调用 `encFrames(f0, f1)` → `encFinish(path)`。
4. `encFinish` 的响应可能会中断。以保存下来的文件大小判断是否成功。

## 7. 验证

1. 用 `video` 元素打开 MP4，读取时长和分辨率，查看全片帧总览。时长必须在 120～180 秒之间。
2. 解码 MP4 的音频，测量峰值和 RMS。
3. 按旁白区间切分音频，用 `scripts/asr.html` 转写并与文案比较。
4. 对照参考视频的帧总览，确认画风一致：浅灰背景、黑线火柴人、少量强调色、文字卡、没有字幕条、没有空白画面。
5. 在报告中写明：通过的句子数、不一致的句子，以及没有亲耳听过这一点。

## 参考

- `references/examples/reference-analysis.md`：教授示例的参考视频测量值
- `references/examples/guro-market-example.md`：教授示例完成品的结构、数值和出处
- `projects/time-habits/analysis/reference.md`：本项目参考视频的测量值

## 脚本所需文件

- `scripts/tts.html` 会读取与 `helper.js` 同一文件夹下的 `assets/onnx`、`assets/voice_styles`（Supertonic 2 模型文件）。模型文件体积很大，不包含在本技能中。请从 Supertone 的公开仓库下载后放入。
- `scripts/asr.html` 用 `init('onnx-community/whisper-small', 'webgpu', {encoder_model:'fp32', decoder_model_merged:'q4'})` 初始化，用 `run([wav URL...])` 转写。结果累积在 `window.out` 中。
