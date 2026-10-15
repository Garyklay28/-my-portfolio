---
name: today-news-pdf
description: 今日新闻PDF。生成一页A4《今日NBA·足球热点简报》PDF：从ESPN、腾讯体育、虎扑等权威媒体取当日热点，跨平台交叉验证，过滤营销号与未证实传闻，按固定版式排版。用户要看今日或最新的NBA、足球新闻、热点、比分、转会动态，或要体育日报、简报、早报时使用，即使没提PDF。
---

# 今日新闻PDF

把当天 NBA 和足球界真正发生的事，核实后排成一页 A4 的 PDF。读者要的是一页可以直接信的纸，所以重心是核验，其次才是排版：宁可少一条，也不放一条没核实的。

## 流程

1. **定时间窗。** 以用户当地日期为刊期，默认只收过去约 36 小时内的新进展。NBA 比赛在美国晚间进行，对应北京时间次日；文中比赛日期统一按北京时间，并在页脚说明。
2. **采集候选。** 按「信源与入口」把 ESPN、虎扑、腾讯的当日头条各扫一遍，多个抓取和搜索放在同一轮并行发出。先列 15–20 条候选，NBA 和足球大致各半。
3. **逐条核验。** 按「交叉验证」给每条定状态；过不了的放进 `dropped` 并写明原因，不上版面。
4. **写 `brief.json`。** 按「版面规格」填。
5. **生成并检查。** 取出文末脚本运行。它会拦下核验不达标的数据，溢出一页时报错。生成后把 PDF 转成图片看一眼（`pdftoppm -r 80 -png`），确认没有文字出框或难看的折行。
6. **交付。** 把 PDF 发给用户。回复只写一两句当日要点，再列出标了「仅X报道」的条目、被剔除的条目及原因。用户需要知道筛掉了什么，不需要你复述版面。

只要一个项目（只要 NBA 或只要足球）时版式不变：用 `title` 改刊名（如「今日NBA热点简报」），摘要第 2、3 句换成该项目的两个侧面。

## 信源与入口

**可采信的来源**

- 官方：NBA.com、球队与俱乐部官网，英超、欧足联、FIFA、各国足协官网，球员或俱乐部认证账号发布的声明原文。
- 权威媒体（英文）：ESPN、Sky Sports、The Athletic、BBC Sport、路透社、美联社。
- 权威媒体（中文）：腾讯体育编辑稿、虎扑新闻（带出处的编辑转译）、新华社、央视体育、懂球帝、新浪体育编辑稿。
- 具名记者：Shams Charania（ESPN）、David Ornstein（The Athletic）、Fabrizio Romano 等，以本人或所属媒体发布的为准。

**实测可用的入口。** 站点会变，一条路不通就换下一条。被 robots 或站点拒绝的页面，不要用 curl、镜像、缓存去绕，换别的权威来源。

- **ESPN**：网页是 JS 渲染的空壳，用 WebFetch 读它的 JSON 接口。
  - 新闻列表：`https://site.api.espn.com/apis/site/v2/sports/basketball/nba/news?limit=30`；足球把路径换成 `soccer/all`，或 `soccer/eng.1`、`soccer/esp.1`、`soccer/uefa.champions`。
  - 文章全文：`https://now.core.api.espn.com/v1/sports/news/{文章id}`，id 是文章网址里 `/id/` 后面的数字。
  - 比分与技术统计：`https://site.web.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard?dates=YYYYMMDD` 和 `.../nba/summary?event={比赛id}`。
  - 这些接口有时返回几天前、或比赛还在进行中的旧快照。每条都看 `published` 时间；比赛状态不是 Final 就不写比分，改查 summary 接口，或用 WebSearch（`allowed_domains: ["espn.com"]`）找战报。
- **NBA.com**：`/news/` 下的文章页可读，伤病和官方通告以它为准；赛程页读不出比分。
- **虎扑**：`nba.hupu.com`、`soccer.hupu.com` 首页可读，能拿到当日标题和出处前缀（「ESPN：」「TA：」「每体：」）。帖子页 bbs.hupu.com 拒绝抓取，标题已够用来判断热度、对照数字。首页混有球迷帖，只取带出处的新闻条目。
- **腾讯**：`sports.qq.com` 首页拒绝抓取。用 WebSearch（`allowed_domains: ["qq.com"]`）找 `news.qq.com/rain/a/…` 文章页，可读；打开后先看署名（见「识别营销号与水军」）。
- **Sky Sports、英超官网 premierleague.com**：文章页可读，是足球英文侧最方便的第二信源。BBC、卫报拒绝抓取。
- 中文关键词直接搜会被自媒体刷屏，搜索时用 `allowed_domains` 限定到 `qq.com`、`hupu.com` 等。

## 交叉验证

每条核心事实带一个 `status` 和它的 `sources`（媒体名列表）：

- `official`：有官方通告或声明原文。一个官方来源即成立。
- `confirmed`：至少两家权威媒体各自报道，且人名、数字、日期一致。优先凑成「英文一家 + 中文一家」（如 ESPN + 虎扑或腾讯），这样同时核对了事实和译名。比分与数据要有一方是技术统计（ESPN 或 NBA.com，状态 Final）。
- `reported`：只有一家权威媒体或一位具名记者在报，其他平台没跟进，或都在转述它。全刊最多 2 条，脚本会自动在文末加「（仅X报道）」，不能写进摘要导语。
- 其余一律进 `dropped`。

判断时注意：

- **转述不等于第二信源。** 虎扑、腾讯的很多稿子是翻译 ESPN。对已经公开的事实（比分、官宣、公开声明、发布会原话），中文平台的转译足以算 `confirmed`。对来自匿名消息源的爆料（交易、签约、转会、内幕），所有平台都指向同一位记者时仍是 `reported`，要等官宣或第二位独立记者确认。未官宣的交易写「达成协议（据ESPN）」，不写成既成事实。
- **数字打架时**以官方和技术统计为准。裁定不了，就用各方都成立的保守说法（各家分别说 114 项、115 项、「逾百项」时写「逾100项」），或者不写这个数字。
- **查日期。** 看原文发布时间，防止旧闻被翻出来当新闻。背景和时间线可以用更早的事实，同样要有出处。
- **只写原文里有的。** 不补推测，不替当事人下结论。「影响·看点」里写的也应是有出处的事实或已排定的日程。
- 译名用腾讯、虎扑的通行译法，拿不准的保留英文。

## 识别营销号与水军

出现下列任一特征的内容不作信源，也不能用来凑「第二家」：

- **发布位置**：新浪看点（k.sina.com.cn/article_…）、网易号（163.com/dy/）、百家号、搜狐号、头条号、公众号、微博、短视频平台；腾讯新闻里署名为个人或「XX说球」「XX体育」并标着「创作者」的企鹅号；自动聚合的「热点小时报」。脚本会拦截这类网址进入来源表。
- **标题腔**：一文看懂、全解读、内幕曝光、彻底摊牌；「……为何……？」「……如何收场？」式的问句标题；写着「曝」「震惊」「官宣」却没有官方链接。
- **内容破绽**：没有具名信源和原文链接；同一账号短时间内就同一件事发出多篇说法互相矛盾的稿子；人名张冠李戴；数据与技术统计对不上；把评论和猜测写成事实；仿冒知名记者的账号。
- **足球转会流言**：出处是太阳报、TEAMtalk、Football Insider、Fichajes、El Nacional、Don Balón 这类来源，或 ESPN 等媒体「转会流言汇总」栏里的转述，按传闻处理，默认不收。
- **虎扑步行街和球迷帖**是观点，不是新闻。

## 版面规格

版式是照用户指定的参考样张逐项对齐的，配色、字号、分区、间距都固定在脚本里，所以只填内容，不改样式。整页很满，下面的字数上限是真实约束：

| 字段 | 内容 | 限制 |
|---|---|---|
| `date`、`basis` | 刊期 `YYYY-MM-DD`；抬头右侧「资讯截至」后的文字 | 如 `2026.10.07~08 报道` |
| `summary` | 3 句：导语（粗体）、NBA 一句、足球一句 | 导语 ≤45 字，另两句各 ≤48 字 |
| `facts` | 01 核心事实：`tag` 板块、`text` 内容、`value` 数据、`alert`、`status`、`sources` | 8–9 行；tag ≤4 字；text ≤30 字（两行）；value ≤5 字，放比分、金额、日期或名次；伤病、处罚、失利等负面项设 `alert: true`（红色） |
| `bars_title`、`bars`、`bars_note` | 02 数据条：`label`、`value`、`ratio`（0–1，数值÷基准）、`alert` | 4 条；同一量纲，并在 note 里写明基准和红蓝含义；note ≤2 行 |
| `context` | 03 背景·脉络：`text` 主句 + `subs` 子句 | 3 条主句各 ≤40 字；每条 1–2 个子句，各 ≤32 字 |
| `impact` | 04 影响·看点：`label` + `text` | 4 条，各 ≤45 字 |
| `timeline` | 05 时间线：`date`（如 10.08）+ `label` | 5 个节点，label ≤7 字；默认高亮最后一个（今天），可用 `highlight` 指定序号 |
| `sources` | 06 来源：`media`、`title`、`date`、`url` | 6–7 行；title 用原文标题原样，不翻译；date 写 `YYYY.MM.DD`；url 直达原文 |
| `footnote` | 页脚一行 | 写明核验口径和读者需要知道的保留 |
| `dropped` | 不上版面，只用于回复：`item` + `reason` | 每条一句 |

核心事实和来源合计约 15 行（9+6 或 8+7），再多就溢出。每条核心事实至少有一个信源出现在来源表里。某个项目当天确实平淡就如实少写，不凑数。

```json
{
  "date": "2026-10-08",
  "basis": "2026.10.07~08 报道",
  "summary": ["导语：一句话概括两个项目当天最重要的事。", "NBA：……", "足球：……"],
  "facts": [
    {"tag": "开拓者", "text": "季前赛胜勇士，杨瀚森12分钟6分2篮板4助攻", "value": "123-118", "status": "confirmed", "sources": ["ESPN", "虎扑"]},
    {"tag": "爵士", "text": "努尔基奇右脚第二趾跖板部分撕裂，四周后复查", "value": "4周", "alert": true, "status": "official", "sources": ["NBA.com"]},
    {"tag": "湖人", "text": "巴斯五兄妹递交36页文件，反驳珍妮阻止售股", "value": "17.82%", "status": "reported", "sources": ["ESPN"]}
  ],
  "bars_title": "焦点数据",
  "bars": [
    {"label": "阿夫迪亚（开拓者）", "value": "23分", "ratio": 0.767},
    {"label": "迈尔斯·凯利（勇士）", "value": "24分", "ratio": 0.8, "alert": true}
  ],
  "bars_note": "※ 条长基准：30分。蓝色为开拓者，红色为勇士；数据取自 ESPN 技术统计。",
  "context": [{"text": "主句，交代来龙去脉。", "subs": ["补充细节或另一方说法。"]}],
  "impact": [{"label": "英超", "text": "接下来会发生什么，出处是谁。"}],
  "timeline": [{"date": "9.29", "label": "曼城裁决公布"}, {"date": "10.01", "label": "曼城提出上诉"}, {"date": "10.07", "label": "巴斯兄妹递文件"}, {"date": "10.08", "label": "开拓者胜勇士"}],
  "sources": [{"media": "NBA.com（官方）", "title": "Utah Jazz center Jusuf Nurkić to be re-evaluated in 4 weeks with foot injury", "date": "2026.10.08", "url": "https://www.nba.com/news/jazz-jusuf-nurkic-foot-injury"}],
  "footnote": "※ 各条目均有官方通告，或经至少两家权威平台交叉核对；标“仅X报道”者为单一信源。NBA比赛日期按北京时间。",
  "dropped": [{"item": "某转会传闻", "reason": "仅见于转会流言栏，无第二家权威媒体证实"}]
}
```

## 生成脚本

脚本就在本文件末尾。从本 skill 的 SKILL.md 里取出来用，不要凭记忆重写：

```bash
python3 - "<本 skill 目录>/SKILL.md" <<'EOF'
import re, sys
s = open(sys.argv[1], encoding="utf-8").read()
open("build_brief.py", "w", encoding="utf-8").write(re.search(r"\n(# build_brief\.py —.*?\n    main\(\)\n)", s, re.S).group(1))
EOF
python3 build_brief.py brief.json
```

拿不到本文件路径时，把下面的代码块原样写入 `build_brief.py`。脚本依次尝试 Playwright、Chromium 命令行、WeasyPrint 三种渲染方式，输出 `NBA足球热点简报_日期.pdf`，并打印每条事实的核验状态。报「未通过核验」或「版式溢出」时，改 `brief.json` 再跑，不要绕过检查。

```python
# build_brief.py — 把 brief.json 渲染成一页 A4 简报 PDF。版式固定，不要改样式。
# 用法: python3 build_brief.py brief.json [输出.pdf]
import sys, json, html, glob, os, shutil, subprocess, datetime

SELF_MEDIA = ["k.sina.com.cn/article", "k.sina.cn/article", "163.com/dy/", "baijiahao.baidu.com",
              "sohu.com/a/", "toutiao.com", "mp.weixin.qq.com", "zhihu.com", "weibo.com",
              "bilibili.com", "douyin.com", "xiaohongshu.com"]
NEED = {"official": 1, "confirmed": 2, "reported": 1}  # 每种核验状态至少需要的信源数

CSS = """
@page{size:595.28pt 841.89pt;margin:0}
*{box-sizing:border-box;margin:0;padding:0}
body{width:595.28pt;font-family:Pretendard,Inter,"Noto Sans CJK SC","Noto Sans SC","Source Han Sans SC","PingFang SC","Microsoft YaHei","WenQuanYi Micro Hei",sans-serif;font-size:10pt;line-height:13pt;color:#5a6577;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.hd{height:58pt;background:#1b2a4a;color:#fff;position:relative}
.hd h1{position:absolute;left:18pt;top:15pt;font-size:22pt;line-height:28pt;font-weight:700}
.hd div{position:absolute;right:18pt;top:18pt;text-align:right;font-size:9.5pt;line-height:14pt}
.pg{padding:12pt 18pt 0}
.sum{border:.6pt solid #000;padding:7pt 9pt 6pt;font-size:11.2pt;line-height:16.6pt}
.sum b{display:block;font-size:11.9pt;color:#000}
h2{font-size:15pt;line-height:15pt;font-weight:700;color:#1b2a4a;margin:17pt 0 9.5pt;border-bottom:1.5pt solid #2e5bba}
h2 i{display:inline-block;width:10.5pt;height:10.5pt;border-radius:2.5pt;background:#1b2a4a;margin-right:6pt;vertical-align:-.5pt}
table{border-collapse:collapse;width:100%;table-layout:fixed}
td.c{vertical-align:top;width:273.64pt}td.g{width:12pt}
.t th{background:#1b2a4a;color:#fff;font-weight:700;font-size:10.6pt;height:17pt;text-align:left;padding:0 4pt}
.t td{padding:4.2pt 4pt 2.1pt;vertical-align:top;border-bottom:.35pt solid #d1d5db;overflow-wrap:anywhere}
.t tbody tr:nth-child(odd) td{background:#f4f6f9}
.k{font-weight:700;color:#1b2a4a}.v{font-weight:700;color:#2e5bba;white-space:nowrap}.v.al{color:#c0392b}
.b{margin-top:-4.2pt}.b td{height:24pt;vertical-align:middle}.b .bl{width:104pt;padding-left:2pt;font-weight:500;color:#1b2a4a}.b .bt{width:103.6pt}.b .v{padding-left:5pt}
.tr{height:9pt;border-radius:4.5pt;background:#d1d5db}.fl{height:9pt;border-radius:4.5pt;background:#2e5bba}.fl.al{background:#c0392b}
.nt{font-size:8.8pt;line-height:12pt;margin-top:5.8pt}.pg>.nt{margin-top:3.6pt}.pg>h2{margin-top:11.5pt}
.m{font-size:10.4pt;line-height:14.3pt;color:#000;padding-left:8pt;text-indent:-8pt;margin-top:3pt}h2+.m{margin-top:.5pt}
.s{font-size:9.8pt;line-height:14pt;padding-left:15pt;text-indent:-7pt;margin-top:2pt}
.i{line-height:13.8pt;padding-left:8pt;text-indent:-8pt;margin-bottom:3.2pt}
.m::before{content:"• "}.s::before{content:"· "}.i::before{content:"◦ "}
.tl{position:relative;height:50pt;margin:9pt 24pt 0}
.tl .ln{position:absolute;left:0;right:0;top:19pt;height:2pt;background:#2e5bba}
.nd{position:absolute;top:0;width:62pt;margin-left:-31pt;text-align:center}
.nd b{display:block;font-size:10.6pt;line-height:13pt;color:#1b2a4a}
.nd i{display:block;width:7.6pt;height:7.6pt;border-radius:50%;background:#1b2a4a;margin:3.2pt auto 0}
.nd span{display:block;font-size:8.5pt;line-height:9.5pt;margin-top:5.5pt}
.nd.on b{color:#2e5bba}
.nd.on i{width:14pt;height:14pt;background:#fff;border:1pt solid #2e5bba;padding:1.8pt;margin-top:0}
.nd.on u{display:block;width:8.4pt;height:8.4pt;border-radius:50%;background:#2e5bba}
.nd.on span{margin-top:2.3pt}
.r th{height:16pt;font-size:10pt}
.r td{height:20.8pt;padding:0 4pt;vertical-align:middle;font-size:9.2pt}
.r .k,.r a{font-size:9.5pt}.r a{color:#2e5bba}
.r .tt{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
"""

e = html.escape


def width(s):  # 粗略字宽：汉字算 1，西文算 0.55
    return sum(1 if ord(ch) > 0x2E7F else 0.55 for ch in s)


def check(d):
    err, warn = [], []
    for key in ["date", "basis", "summary", "facts", "bars_title", "bars", "context", "impact", "timeline", "sources", "footnote"]:
        if key not in d:
            err.append(f"缺少字段 {key}")
    if err:
        return err, warn
    if len(d["summary"]) != 3:
        err.append("summary 必须正好 3 句：导语、NBA、足球")
    media = [s["media"] for s in d["sources"]]
    for s in d["sources"]:
        url = s.get("url", "")
        if not url.startswith("http"):
            err.append(f"来源缺少有效链接：{s.get('media')}")
        if any(bad in url for bad in SELF_MEDIA):
            err.append(f"来源是自媒体/社交平台，不能作为信源：{url}")
    reported = 0
    for f in d["facts"]:
        st, srcs = f.get("status"), list(dict.fromkeys(f.get("sources", [])))
        if st not in NEED:
            err.append(f"[{f['tag']}] status 只能是 official / confirmed / reported")
            continue
        if len(srcs) < NEED[st]:
            err.append(f"[{f['tag']}] 状态 {st} 至少需要 {NEED[st]} 个不同信源，现有 {len(srcs)} 个")
            continue
        if st == "reported":
            reported += 1
            note = f"（仅{srcs[0]}报道）"
            if note not in f["text"]:
                f["text"] += note
        if not any(a in b or b in a for a in srcs for b in media):
            warn.append(f"[{f['tag']}] 的信源 {srcs} 没有出现在来源表里")
        if width(f["text"]) > 31:
            warn.append(f"[{f['tag']}] 内容偏长（{width(f['text']):.0f} 字宽），可能折成三行")
    if reported > 2:
        err.append(f"单一信源条目有 {reported} 条，最多 2 条；其余请补第二信源或移入 dropped")
    if not 6 <= len(d["facts"]) <= 9:
        warn.append("核心事实建议 6–9 行")
    if not 3 <= len(d["bars"]) <= 5:
        warn.append("数据条建议 3–5 条")
    if not 4 <= len(d["timeline"]) <= 6:
        err.append("时间线需要 4–6 个节点")
    return err, warn


def build(d):
    day = datetime.date.fromisoformat(d["date"])
    stamp = f"{day:%Y.%m.%d} (周{'一二三四五六日'[day.weekday()]})"
    al = lambda x: " al" if x.get("alert") else ""
    h2 = lambda n, t: f"<h2><i></i>{n:02d}&nbsp;&nbsp;{e(t)}</h2>"
    facts = "".join(f'<tr><td class="k">{e(f["tag"])}</td><td>{e(f["text"])}</td><td class="v{al(f)}">{e(str(f["value"]))}</td></tr>' for f in d["facts"])
    bars = "".join(
        f'<tr><td class="bl">{e(b["label"])}</td><td class="bt"><div class="tr"><div class="fl{al(b)}" style="width:{max(0.0, min(1.0, float(b["ratio"]))) * 100:.1f}%"></div></div></td><td class="v{al(b)}">{e(str(b["value"]))}</td></tr>'
        for b in d["bars"])
    ctx = "".join(f'<p class="m">{e(c["text"])}</p>' + "".join(f'<p class="s">{e(s)}</p>' for s in c.get("subs", [])) for c in d["context"])
    imp = "".join(f'<p class="i">{e(x["label"])} : {e(x["text"])}</p>' for x in d["impact"])
    n = len(d["timeline"])
    hi = d.get("highlight", n - 1) % n
    tl = "".join(
        f'<div class="nd{" on" if k == hi else ""}" style="left:{k / (n - 1) * 100:.2f}%"><b>{e(x["date"])}</b><i><u></u></i><span>{e(x["label"])}</span></div>'
        for k, x in enumerate(d["timeline"]))
    src = "".join(
        f'<tr><td class="k">{e(s["media"])}</td><td class="tt">{e(s["title"])}</td><td>{e(s["date"])}</td><td><a href="{e(s["url"], quote=True)}">查看原文</a></td></tr>'
        for s in d["sources"])
    note = f'<p class="nt">{e(d["bars_note"])}</p>' if d.get("bars_note") else ""
    return f"""<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><title>{e(d.get("title", "今日NBA·足球热点简报"))} {stamp}</title><style>{CSS}</style></head><body>
<div class="hd"><h1>{e(d.get("title", "今日NBA·足球热点简报"))}</h1><div>{stamp}<br>资讯截至 : {e(d["basis"])}</div></div>
<div class="pg"><div class="sum"><b>{e(d["summary"][0])}</b>{e(d["summary"][1])}<br>{e(d["summary"][2])}</div>
<table><tr><td class="c">{h2(1, "核心事实")}
<table class="t"><thead><tr><th style="width:56pt">板块</th><th>内容</th><th style="width:58pt">数据</th></tr></thead><tbody>{facts}</tbody></table>
{h2(2, d["bars_title"])}<table class="b">{bars}</table>{note}</td><td class="g"></td>
<td class="c">{h2(3, "背景·脉络")}{ctx}{h2(4, "影响·看点")}{imp}{h2(5, "时间线")}<div class="tl"><div class="ln"></div>{tl}</div></td></tr></table>
{h2(6, "来源")}<table class="t r"><thead><tr><th style="width:112pt">媒体</th><th>文章标题</th><th style="width:60pt">日期</th><th style="width:54pt">链接</th></tr></thead><tbody>{src}</tbody></table>
<p class="nt">{e(d["footnote"])}</p></div></body></html>"""


def find_chrome():
    for name in ["chromium", "chromium-browser", "google-chrome", "google-chrome-stable", "chrome"]:
        if shutil.which(name):
            return shutil.which(name)
    pats = ["/opt/pw-browsers/chromium-*/chrome-linux*/chrome", "/opt/pw-browsers/chromium", os.path.expanduser("~/.cache/ms-playwright/chromium-*/chrome-linux*/chrome"),
            "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "/Applications/Chromium.app/Contents/MacOS/Chromium"]
    hits = [p for pat in pats for p in sorted(glob.glob(pat)) if os.path.isfile(p)]
    return hits[-1] if hits else None


def render(html_file, pdf_file):
    url, tried = "file://" + os.path.abspath(html_file), []
    try:
        from playwright.sync_api import sync_playwright
        with sync_playwright() as p:
            try:
                br = p.chromium.launch()
            except Exception:
                br = p.chromium.launch(executable_path=find_chrome())
            pg = br.new_page()
            pg.goto(url)
            pg.pdf(path=pdf_file, print_background=True, prefer_css_page_size=True)
            br.close()
        return "playwright"
    except Exception as ex:
        tried.append(f"playwright: {str(ex)[:80]}")
    exe = find_chrome()
    if exe:
        cmd = [exe, "--headless", "--no-sandbox", "--disable-gpu", "--no-pdf-header-footer", "--print-to-pdf-no-header", f"--print-to-pdf={pdf_file}", url]
        subprocess.run(cmd, capture_output=True, timeout=120)
        if os.path.exists(pdf_file):
            return "chromium"
        tried.append("chromium 命令行未生成文件")
    try:
        from weasyprint import HTML
        HTML(filename=html_file).write_pdf(pdf_file)
        return "weasyprint"
    except Exception as ex:
        tried.append(f"weasyprint: {str(ex)[:80]}")
    sys.exit("没有可用的 PDF 渲染器（需要 Playwright/Chromium，或 pip install weasyprint）。\n" + "\n".join(tried))


def pages(pdf_file):
    try:
        from pypdf import PdfReader
        return len(PdfReader(pdf_file).pages)
    except Exception:
        raw = open(pdf_file, "rb").read()
        return (raw.count(b"/Type /Page") - raw.count(b"/Type /Pages")) or 1


def main():
    src = sys.argv[1]
    d = json.load(open(src, encoding="utf-8"))
    out = sys.argv[2] if len(sys.argv) > 2 else f"NBA足球热点简报_{d.get('date', 'draft')}.pdf"
    err, warn = check(d)
    for w in warn:
        print("提醒:", w)
    if err:
        sys.exit("未通过核验，没有生成 PDF：\n- " + "\n- ".join(err))
    try:
        if not subprocess.run(["fc-list", ":lang=zh"], capture_output=True, timeout=20).stdout.strip():
            print("提醒: 系统里没找到中文字体，汉字可能显示成方框")
    except Exception:
        pass
    html_file = os.path.splitext(out)[0] + ".html"
    open(html_file, "w", encoding="utf-8").write(build(d))
    backend = render(html_file, out)
    n = pages(out)
    print(f"已生成 {out}（{backend}，{n} 页）")
    label = {"official": "官方", "confirmed": "多源", "reported": "单源"}
    for f in d["facts"]:
        print(f"  [{label[f['status']]}] {f['tag']}: {' + '.join(f['sources'])}")
    for x in d.get("dropped", []):
        print(f"  [剔除] {x['item']} —— {x['reason']}")
    if n != 1:
        sys.exit(f"版式溢出：共 {n} 页，必须是 1 页。请删一行核心事实或来源，或压缩背景/看点的文字后重跑。")


if __name__ == "__main__":
    main()
```
