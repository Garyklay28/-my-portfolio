#!/usr/bin/env bash
# ============================================================
# 把视频压缩成适合网页播放、且小于 Supabase 上限的 MP4
# 웹 재생에 적합하고 Supabase 제한보다 작은 MP4 로 영상 압축
#
# 用法 / 사용법:
#   bash scripts/compress-video.sh "输入视频.mp4" [目标MB，默认 40]
#
# 输出：同目录下 "原文件名-web.mp4"
# 출력: 같은 폴더에 "원본이름-web.mp4"
#
# 做了什么 / 처리 내용:
#   - 转成 H.264 + AAC（所有浏览器都能播，包括 Chrome/Firefox 不支持的 HEVC 原片）
#     H.264 + AAC 로 변환 (HEVC 원본도 모든 브라우저에서 재생 가능)
#   - 长边限制 1920px（1080p）/ 긴 변 1920px 제한
#   - 按时长计算码率，保证文件小于目标大小 / 길이에 맞춰 비트레이트 계산, 목표 크기 이하 보장
#   - faststart：网页上不用下载完就能开始播放 / 전체 다운로드 전에 재생 시작 가능
# ============================================================
set -euo pipefail

command -v ffmpeg >/dev/null || { echo "❌ 需要 ffmpeg / ffmpeg 필요: brew install ffmpeg"; exit 1; }

IN="${1:?用法 / 사용법: bash scripts/compress-video.sh \"视频.mp4\" [目标MB]}"
TARGET_MB="${2:-40}"
[ -f "$IN" ] || { echo "❌ 找不到文件 / 파일 없음: $IN"; exit 1; }

OUT="${IN%.*}-web.mp4"
DUR=$(ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "$IN")
AUDIO_K=128
# 总码率 = 目标大小 / 时长；留 5% 余量给容器开销
# 총 비트레이트 = 목표 크기 / 길이, 컨테이너 오버헤드용 5% 여유
VIDEO_K=$(python3 -c "print(max(600, int($TARGET_MB*8192*0.95/$DUR - $AUDIO_K)))")

echo "输入 / 입력 : $IN ($(du -h "$IN" | cut -f1), ${DUR%.*}s)"
echo "目标 / 목표 : ≤ ${TARGET_MB}MB → 视频码率 / 영상 비트레이트 ${VIDEO_K}k"

ffmpeg -hide_banner -loglevel error -stats -y -i "$IN" \
  -vf "scale='if(gt(iw,ih),min(1920,iw),-2)':'if(gt(iw,ih),-2,min(1920,ih))'" \
  -c:v libx264 -preset slow -profile:v high -pix_fmt yuv420p \
  -b:v "${VIDEO_K}k" -maxrate "$((VIDEO_K * 3 / 2))k" -bufsize "$((VIDEO_K * 2))k" \
  -c:a aac -b:a "${AUDIO_K}k" -ac 2 \
  -movflags +faststart \
  "$OUT"

echo ""
echo "✅ 完成 / 완료: $OUT ($(du -h "$OUT" | cut -f1))"
