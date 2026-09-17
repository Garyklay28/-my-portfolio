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
  canEncodeAudio,
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
 * 这段视频的声音压缩后会怎样 / 이 영상의 오디오가 압축 후 어떻게 되는지
 * - 'none'   没有音轨 / 오디오 트랙 없음
 * - 'copy'   已经是 AAC，原样保留，不需要重新编码（任何浏览器都行）
 *            이미 AAC 라 재인코딩 없이 그대로 유지 (모든 브라우저 가능)
 * - 'encode' 需要转成 AAC，这个浏览器支持 / AAC 로 변환 필요, 이 브라우저가 지원
 * - 'drop'   需要转成 AAC，但这个浏览器不支持 → 压缩后会没有声音
 *            AAC 변환이 필요한데 이 브라우저가 미지원 → 압축하면 소리가 사라짐
 */
export async function audioPlan(audioCodec) {
  if (!audioCodec) return 'none'
  if (audioCodec === 'aac') return 'copy'
  try {
    if (typeof AudioEncoder !== 'undefined' && (await canEncodeAudio('aac'))) return 'encode'
  } catch { /* 视为不支持 / 미지원으로 간주 */ }
  return 'drop'
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
export async function compressVideo(file, { targetMB = 40, maxEdge = 1920, allowDropAudio = false, onProgress, signal } = {}) {
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

    const audioBps = 128_000 // 只用于估算视频码率 / 영상 비트레이트 계산용
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
      // 不给音频指定码率：源文件已经是 AAC 时会原样复制，不经过编码器。
      // 之前指定了码率，会强制重新编码，在不支持音频编码的浏览器（如 Safari 18）里音轨被丢掉。
      // 오디오 비트레이트를 지정하지 않음: 원본이 AAC 면 인코더를 거치지 않고 그대로 복사.
      // 이전에는 비트레이트 지정으로 재인코딩이 강제되어, 오디오 인코딩 미지원 브라우저(Safari 18 등)에서 오디오가 빠졌음.
      audio: { codec: 'aac' },
      showWarnings: false,
    })

    if (!conversion.isValid) {
      const reasons = conversion.discardedTracks.map((d) => d.reason).join(', ')
      throw new Error(`这个浏览器无法转换这个视频（${reasons}）。请用 Chrome，或用电脑上的压缩脚本。/ 이 브라우저에서 변환할 수 없습니다 (${reasons}). Chrome 을 쓰거나 컴퓨터의 압축 스크립트를 사용하세요.`)
    }
    const hadAudio = Boolean(await input.getPrimaryAudioTrack())
    const droppedAudio = hadAudio && conversion.discardedTracks.some((d) => d.track.type === 'audio')
    // 默认绝不悄悄产出没有声音的视频 / 기본적으로 소리 없는 영상을 조용히 만들지 않음
    if (droppedAudio && !allowDropAudio) {
      const reasons = conversion.discardedTracks.filter((d) => d.track.type === 'audio').map((d) => d.reason).join(', ')
      throw new Error(`这个浏览器无法处理这段视频的音频（${reasons}），压缩后会没有声音，所以已停止。请用 Chrome 打开管理页面，或用电脑上的压缩脚本。/ 이 브라우저가 이 영상의 오디오를 처리할 수 없어(${reasons}) 압축하면 소리가 사라지므로 중단했습니다. Chrome 으로 관리 페이지를 열거나 컴퓨터의 압축 스크립트를 사용하세요.`)
    }

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
