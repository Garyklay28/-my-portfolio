import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { PROFILE, TABS, FILMS, IMAGE_GROUPS } from './data/works.js'
import { loadContent } from './lib/content.js'
import { useSwipeTabs } from './lib/useSwipeTabs.js'
import FilmSection from './components/FilmSection.jsx'
import ImageSection from './components/ImageSection.jsx'
import Profile from './components/Profile.jsx'
import WorkDetail from './components/WorkDetail.jsx'
import AuthModal from './components/AuthModal.jsx'
// 管理面板只有登录后才用得到，按需加载，访客不用下载这部分代码
// 관리 패널은 로그인 후에만 필요하므로 지연 로딩, 방문자는 이 코드를 받지 않음
const AdminPanel = lazy(() => import('./components/AdminPanel.jsx'))
import { supabase, isAuthConfigured } from './lib/supabase.js'

export default function App() {
  const [tab, setTab] = useState('profile')
  const [authOpen, setAuthOpen] = useState(false)
  const [adminOpen, setAdminOpen] = useState(false)
  const [user, setUser] = useState(null)
  // 内容：先用代码里的示例数据渲染，再尝试从 Supabase 覆盖
  // 콘텐츠: 먼저 샘플 데이터로 렌더링 후 Supabase 에서 덮어쓰기 시도
  const [content, setContent] = useState({ source: 'static', films: FILMS, groups: IMAGE_GROUPS, profile: PROFILE })
  const profile = content.profile ?? PROFILE

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

  // ---------- 手机左右滑动切换 / 모바일 스와이프 전환 ----------
  const mainRef = useRef(null)
  const panelRef = useRef(null)
  const TAB_IDS = TABS.map((t) => t.id)
  const tabIndex = TAB_IDS.indexOf(tab)

  // 滑动切换时不回到页面最顶端，而是停在内容区开头，避免每次都要重新往下滑
  // 스와이프 전환 시 페이지 맨 위가 아니라 콘텐츠 시작 지점에 머물러, 매번 다시 내릴 필요 없음
  const swipeTo = useCallback((id) => {
    setTab(id)
    setDetail(null)
    const panel = panelRef.current
    if (!panel) return
    const navH = document.querySelector('.nav')?.offsetHeight ?? 0
    const top = panel.getBoundingClientRect().top + window.scrollY - navH
    if (window.scrollY > top) window.scrollTo({ top, behavior: 'instant' })
  }, [])

  useSwipeTabs(mainRef, panelRef, {
    canPrev: () => tabIndex > 0,
    canNext: () => tabIndex < TAB_IDS.length - 1,
    onPrev: () => swipeTo(TAB_IDS[tabIndex - 1]),
    onNext: () => swipeTo(TAB_IDS[tabIndex + 1]),
  })

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
            {profile.name}
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

      <main id="top" ref={mainRef} className="swipe-area">
        {/* ---------- HERO ---------- */}
        <section className="wrap hero">
          <div className="hero__grid">
            <div>
              <p className="eyebrow">{profile.role} · Seoul / Beijing</p>
              <h1 className="slab hero__name">{profile.name}</h1>
              <p className="hero__tagline">
                Behind <em>The</em> Image
              </p>
            </div>

            <aside className="hero__aside">
              <blockquote className="quote">{profile.quote}</blockquote>
              <div className="hero__roles">
                {profile.disciplines.map((d) => (
                  <div className="hero__roleitem" key={d.en}>
                    <strong>{d.en}</strong>
                    <small>{d.cn}</small>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </section>

        {/* ---------- TAB PANELS（手机可左右滑动切换 / 모바일 스와이프 가능）---------- */}
        <div ref={panelRef} className="swipe-panel">
          {tab === 'profile' && <Profile profile={profile} />}
          {tab === 'film' && <FilmSection films={content.films} onOpen={(i) => openDetail(content.films, i)} />}
          {tab === 'images' && <ImageSection groups={content.groups} onOpen={openDetail} />}
        </div>
      </main>

      {/* ---------- CONTACT ---------- */}
      <footer className="contact" id="contact">
        <div className="wrap contact__inner">
          <p className="eyebrow" style={{ color: 'var(--yellow)' }}>Get in touch / 联系方式</p>
          <h2 className="slab contact__title">Contact</h2>
          <dl className="contact__list">
            {profile.contact.map((c) => (
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
          <span>© {new Date().getFullYear()} {profile.name} — {profile.tagline}</span>
          <span>Built with React + Vite</span>
        </div>
      </footer>

      {/* ---------- DETAIL ---------- */}
      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}

      {adminOpen && user && (
        <Suspense fallback={null}>
          <AdminPanel
            onClose={() => setAdminOpen(false)}
            onChanged={refreshContent}
            contentSource={content.source}
          />
        </Suspense>
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
