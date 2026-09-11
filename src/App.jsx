import { useCallback, useEffect, useState } from 'react'
import { PROFILE, TABS, FILMS, IMAGE_GROUPS } from './data/works.js'
import { loadContent } from './lib/content.js'
import FilmSection from './components/FilmSection.jsx'
import ImageSection from './components/ImageSection.jsx'
import Profile from './components/Profile.jsx'
import WorkDetail from './components/WorkDetail.jsx'
import AuthModal from './components/AuthModal.jsx'
import AdminPanel from './components/AdminPanel.jsx'
import { supabase, isAuthConfigured } from './lib/supabase.js'

export default function App() {
  const [tab, setTab] = useState('profile')
  const [authOpen, setAuthOpen] = useState(false)
  const [adminOpen, setAdminOpen] = useState(false)
  const [user, setUser] = useState(null)
  // 内容：先用代码里的示例数据渲染，再尝试从 Supabase 覆盖
  // 콘텐츠: 먼저 샘플 데이터로 렌더링 후 Supabase 에서 덮어쓰기 시도
  const [content, setContent] = useState({ source: 'static', films: FILMS, groups: IMAGE_GROUPS })

  const refreshContent = useCallback(() => {
    loadContent().then(setContent)
  }, [])

  useEffect(() => { refreshContent() }, [refreshContent])

  // 监听登录状态。未配置 Supabase 时直接跳过，不影响站点其余部分。
  // 로그인 상태 감시. Supabase 미설정 시 건너뛰며 사이트 나머지에는 영향 없음.
  useEffect(() => {
    if (!isAuthConfigured) return
    let active = true
    supabase.auth.getSession().then(({ data }) => {
      if (active) setUser(data.session?.user ?? null)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
    })
    return () => {
      active = false
      sub.subscription.unsubscribe()
    }
  }, [])

  const signOut = useCallback(async () => {
    if (isAuthConfigured) await supabase.auth.signOut()
  }, [])

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

            {user ? (
              <span className="nav__auth">
                <button className="nav__manage" onClick={() => setAdminOpen(true)}>Manage</button>
                <span className="nav__user" title={user.email}>{user.email}</span>
                <button className="nav__signout" onClick={signOut}>Sign Out</button>
              </span>
            ) : (
              <button className="nav__signin" onClick={() => setAuthOpen(true)}>Sign In</button>
            )}
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
        {tab === 'film' && <FilmSection films={content.films} onOpen={(i) => openDetail(content.films, i)} />}
        {tab === 'images' && <ImageSection groups={content.groups} onOpen={openDetail} />}
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
      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}

      {adminOpen && user && (
        <AdminPanel
          onClose={() => setAdminOpen(false)}
          onChanged={refreshContent}
          contentSource={content.source}
        />
      )}

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
