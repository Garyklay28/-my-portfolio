import { lazy, Suspense, useState } from 'react'
import { ASSIGNMENTS as FALLBACK } from '../data/assignments.js'

// Markdown 阅读器只在点开文档时才加载 / Markdown 뷰어는 문서를 열 때만 로딩
const DocViewer = lazy(() => import('./DocViewer.jsx'))

const KIND_LABEL = { md: 'MD', pdf: 'PDF', code: 'CODE', play: 'PLAY', repo: 'GIT', figma: 'FIGMA', img: 'IMG' }

/** 课程作业页：按周排列，视频直接播放，文档在页面内阅读 / 과제 페이지: 주차별, 영상은 바로 재생, 문서는 페이지 안에서 읽기 */
export default function AssignmentSection({ assignments }) {
  const ASSIGNMENTS = assignments?.length ? assignments : FALLBACK
  const [doc, setDoc] = useState(null)

  return (
    <section className="wrap">
      <header className="sechead">
        <div>
          <p className="eyebrow">Prompt &amp; AI Projects / 项目</p>
          <h2 className="slab sechead__title">Projects</h2>
        </div>
        <p className="sechead__count">{String(ASSIGNMENTS.length).padStart(2, '0')} Projects — Week 2 to 9</p>
      </header>

      {ASSIGNMENTS.map((a) => (
        <article className="project asg" key={a.id}>
          <header className="project__head">
            <span className="project__num" aria-hidden="true">{a.week}</span>
            <div className="project__id">
              <h3 className="slab project__title">{a.title}</h3>
              <p className="project__cn">{a.titleCn}</p>
            </div>
            <p className="project__role">{a.date}</p>
          </header>

          <div className={a.video || a.image ? 'asg__grid' : 'asg__grid asg__grid--text'}>
            {(a.video || a.image) && (
              <div className="asg__media">
                {a.video && (
                  <video controls preload="none" playsInline poster={a.video.poster} style={{ aspectRatio: a.video.ratio }}>
                    <source src={a.video.src} type="video/mp4" />
                    {a.video.captions && (
                      <track kind="subtitles" src={a.video.captions} srcLang="en" label="English" default />
                    )}
                  </video>
                )}
                {a.image && (a.image.href ? (
                  <a href={a.image.href} target="_blank" rel="noreferrer">
                    <img src={a.image.src} alt={a.image.alt} loading="lazy" style={{ aspectRatio: a.image.ratio }} />
                  </a>
                ) : (
                  <img src={a.image.src} alt={a.image.alt} loading="lazy" style={{ aspectRatio: a.image.ratio }} />
                ))}
              </div>
            )}

            <div className="asg__body">
              <p className="asg__text">{a.body}</p>
              <p className="asg__text asg__text--cn">{a.bodyCn}</p>

              <ul className="asg__files">
                {a.files.map((f) => (
                  <li key={f.href}>
                    {f.kind === 'md' ? (
                      <button className="asg__file" onClick={() => setDoc(f)}>
                        <span className="asg__kind">{KIND_LABEL[f.kind]}</span>
                        {f.label}
                      </button>
                    ) : (
                      <a className="asg__file" href={f.href} target="_blank" rel="noreferrer">
                        <span className="asg__kind">{KIND_LABEL[f.kind]}</span>
                        {f.label}
                        <span aria-hidden="true"> ↗</span>
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </article>
      ))}

      {doc && (
        <Suspense fallback={null}>
          <DocViewer doc={doc} onClose={() => setDoc(null)} />
        </Suspense>
      )}
    </section>
  )
}
