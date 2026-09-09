import { useCallback, useState } from 'react'
import { PROFILE, TABS, FILMS, IMAGE_GROUPS } from './data/works.js'
import FilmSection from './components/FilmSection.jsx'
import ImageSection from './components/ImageSection.jsx'
import Profile from './components/Profile.jsx'
import WorkDetail from './components/WorkDetail.jsx'

export default function App() {
  const [tab, setTab] = useState('profile')
  // 详情：{ list, index } —— list 让图片页每个项目各自独立翻页
  const [detail, setDetail] = useState(null)

  const goTab = useCallback((id) => {
    setTab(id)
    setDetail(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const openDetail = useCallback((list, index) => setDetail({ list, index }), [])

  const step = useCallback(
    (delta) =>
      setDetail((d) =>
        d ? { ...d, index: Math.min(Math.max(d.index + delta, 0), d.list.length - 1) } : d,
      ),
    [],
  )

  return (
    <>
      <div className="grain" aria-hidden="true" />

      {/* ---------- NAV ---------- */}
      <header className="nav">
        <div className="wrap nav__bar">
          <button className="nav__name" onClick={() => goTab('profile')}>
            {PROFILE.name}
            <span className="nav__suffix"> <b>/</b> Filmmaker</span>
          </button>
          <nav className="nav__links">
            <button className="nav__link" onClick={() => goTab('film')}>Works</button>
            <button className="nav__link" onClick={() => goTab('profile')}>About</button>
            <a className="nav__link" href="#contact">Contact</a>
          </nav>
        </div>
        <div className="wrap">
          <div className="tabs" role="tablist" aria-label="作品分类">
            {TABS.map((t) => (
              <button
                key={t.id}
                className="tab"
                role="tab"
                aria-selected={tab === t.id}
                onClick={() => goTab(t.id)}
              >
                {t.label}
                <small>{t.sub}</small>
              </button>
            ))}
          </div>
        </div>
      </header>

      <main id="top">
        {/* ---------- HERO ---------- */}
        <section className="wrap hero">
          <div className="hero__grid">
            <div>
              <p className="eyebrow">{PROFILE.role} · Seoul / Beijing</p>
              <h1 className="slab hero__name">{PROFILE.name}</h1>
              <p className="hero__tagline">
                Behind <em>The</em> Image
              </p>
            </div>

            <aside className="hero__aside">
              <blockquote className="quote">{PROFILE.quote}</blockquote>
              <div className="hero__roles">
                {PROFILE.disciplines.map((d) => (
                  <div className="hero__roleitem" key={d.en}>
                    <strong>{d.en}</strong>
                    <small>{d.cn}</small>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </section>

        {/* ---------- TAB PANELS ---------- */}
        {tab === 'profile' && <Profile />}
        {tab === 'film' && <FilmSection films={FILMS} onOpen={(i) => openDetail(FILMS, i)} />}
        {tab === 'images' && <ImageSection groups={IMAGE_GROUPS} onOpen={openDetail} />}
      </main>

      {/* ---------- CONTACT ---------- */}
      <footer className="contact" id="contact">
        <div className="wrap contact__inner">
          <p className="eyebrow" style={{ color: 'var(--yellow)' }}>Get in touch / 联系方式</p>
          <h2 className="slab contact__title">Contact</h2>
          <dl className="contact__list">
            {PROFILE.contact.map((c) => (
              <div className="contact__item" key={c.label}>
                <dt>{c.label}</dt>
                <dd>
                  {c.href ? (
                    <a href={c.href} target={c.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer">
                      {c.value}
                    </a>
                  ) : (
                    c.value
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="wrap contact__foot">
          <span>© {new Date().getFullYear()} {PROFILE.name} — {PROFILE.tagline}</span>
          <span>Built with React + Vite</span>
        </div>
      </footer>

      {/* ---------- DETAIL ---------- */}
      {detail && (
        <WorkDetail
          works={detail.list}
          index={detail.index}
          onClose={() => setDetail(null)}
          onStep={step}
        />
      )}
    </>
  )
}
