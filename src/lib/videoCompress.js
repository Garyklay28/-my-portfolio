import {
  ALL_FORMATS,
  BlobSource,
  BufferTarget,
  Conversion,
  ConversionCanceledError,
  Input,
  Mp4OutputFormat,
  Output,
  Quality,
  canEncodeVideo,
} from 'mediabunny'

/**
 * 在浏览器里把视频压成 H.264 MP4（用电脑自带的硬件编解码，文件不经过服务器）。
 * 브라우저에서 영상을 H.264 MP4 로 압축 (컴퓨터 하드웨어 코덱 사용, 파일은 서버를 거치지 않음).
 *
 * 这个模块很大，只在管理面板里真正要处理视频时才动态加载。
 * 이 모듈은 크기가 커서, 관리 패널에서 실제로 영상을 처리할 때만 동적으로 불러옴.
 */

const CODEC_LABEL = { avc: 'H.264', hevc: 'HEVC (H.265)', vp8: 'VP8', vp9: 'VP9', av1: 'AV1' }
export const codecLabel = (c) => CODEC_LABEL[c] || c || '未知 / 알 수 없음'

const even = (n) => Math.max(2, Math.round(n / 2) * 2)

/** 读取视频信息（不解码画面，很快）/ 영상 정보 읽기 (디코딩 없이 빠름) */
export async function probeVideo(file) {
  const input = new Input({ formats: ALL_FORMATS, source: new BlobSource(file) })
  try {
    const video = await input.getPrimaryVideoTrack()
    const audio = await input.getPrimaryAudioTrack()
    return {
      duration: await input.computeDuration(),
      width: video ? await video.getDisplayWidth() : 0,
      height: video ? await video.getDisplayHeight() : 0,
      videoCodec: video ? await video.getCodec() : null,
      audioCodec: audio ? await audio.getCodec() : null,
    }
  } finally {
    input.dispose?.()
  }
}

/** 这个浏览器能不能在网页里压视频 / 이 브라우저에서 웹 영상 압축이 가능한지 */
export async function browserCanCompress() {
  if (typeof VideoEncoder === 'undefined' || typeof VideoDecoder === 'undefined') return false
  try {
    return await canEncodeVideo('avc', { width: 1920, height: 1080, quality: new Quality({ bitrate: 4_000_000 }) })
  } catch {
    return false
  }
}

/**
 * 压缩视频。
 * - 长边限制 1920px（1080p），宽高取偶数
 * - 按时长算码率，让结果在 targetMB 以内（码率限制在 0.8～8 Mbps 之间）
 * - 输出 H.264 + AAC，fastStart（网页上不用下载完就能播放）
 * - 浏览器无法处理音频时会省略音轨，并在结果里标出来
 *
 * 영상 압축.
 * - 긴 변 1920px(1080p) 제한, 가로세로는 짝수
 * - 길이에 맞춰 비트레이트를 계산해 targetMB 이하로 (0.8~8 Mbps 범위)
 * - H.264 + AAC, fastStart (웹에서 전체 다운로드 전에 재생 가능)
 * - 브라우저가 오디오를 처리하지 못하면 오디오를 빼고 결과에 표시
 */
export async function compressVideo(file, { targetMB = 40, maxEdge = 1920, onProgress, signal } = {}) {
  const input = new Input({ formats: ALL_FORMATS, source: new BlobSource(file) })
  try {
    const video = await input.getPrimaryVideoTrack()
    if (!video) throw new Error('这个文件里没有视频画面 / 이 파일에는 영상 트랙이 없습니다')

    const duration = await input.computeDuration()
    const w = await video.getDisplayWidth()
    const h = await video.getDisplayHeight()
    const scale = Math.min(1, maxEdge / Math.max(w, h))
    const width = even(w * scale)
    const height = even(h * scale)

    const audioBps = 128_000
    const videoBps = Math.min(8_000_000, Math.max(800_000, Math.floor((targetMB * 8 * 1048576 * 0.92) / duration - audioBps)))

    const output = new Output({
      format: new Mp4OutputFormat({ fastStart: 'in-memory' }),
      target: new BufferTarget(),
    })

    const conversion = await Conversion.init({
      input,
      output,
      tracks: 'primary',
      video: { codec: 'avc', width, height, fit: 'fill', quality: new Quality({ bitrate: videoBps }), forceTranscode: true },
      audio: { codec: 'aac', quality: new Quality({ bitrate: audioBps }) },
      showWarnings: false,
    })

    if (!conversion.isValid) {
      const reasons = conversion.discardedTracks.map((d) => d.reason).join(', ')
      throw new Error(`这个浏览器无法转换这个视频（${reasons}）。请用 Chrome，或用电脑上的压缩脚本。/ 이 브라우저에서 변환할 수 없습니다 (${reasons}). Chrome 을 쓰거나 컴퓨터의 압축 스크립트를 사용하세요.`)
    }
    const droppedAudio = conversion.discardedTracks.some((d) => d.track.type === 'audio')

    // 进度回调非常频繁（几秒内上千次），只在百分比变化时通知，避免界面反复重绘
    // 진행률 콜백이 매우 잦아(몇 초에 수천 번), 퍼센트가 바뀔 때만 알려 화면 재렌더링을 줄임
    let lastPct = -1
    conversion.onProgress = (p) => {
      const pct = Math.floor(Math.min(1, Math.max(0, p)) * 100)
      if (pct === lastPct) return
      lastPct = pct
      onProgress?.(pct / 100)
    }
    const onAbort = () => { conversion.cancel() }
    if (signal) {
      if (signal.aborted) throw new DOMException('已取消 / 취소됨', 'AbortError')
      signal.addEventListener('abort', onAbort, { once: true })
    }

    try {
      await conversion.execute()
    } catch (e) {
      if (e instanceof ConversionCanceledError) throw new DOMException('已取消 / 취소됨', 'AbortError')
      throw e
    } finally {
      signal?.removeEventListener('abort', onAbort)
    }

    const name = file.name.replace(/\.[^.]+$/, '') + '-web.mp4'
    return {
      file: new File([output.target.buffer], name, { type: 'video/mp4' }),
      width,
      height,
      videoBps,
      droppedAudio,
    }
  } finally {
    input.dispose?.()
  }
}
