import { useEffect, useState } from 'react'
import { supabase, isAuthConfigured } from '../lib/supabase.js'

/**
 * 管理员登录 / 注册弹窗。
 * 관리자 로그인 / 가입 모달.
 *
 * 未配置 Supabase 时不渲染任何密码输入框 —— 避免出现「能输密码但其实无效」的表单。
 * Supabase 미설정 시 비밀번호 입력란을 아예 렌더링하지 않습니다.
 */
export default function AuthModal({ onClose }) {
  const [mode, setMode] = useState('signin') // signin | signup
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setNotice('')
    setBusy(true)
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setNotice('注册邮件已发送，请到邮箱点击确认链接。/ 확인 메일을 보냈습니다. 메일함에서 링크를 눌러주세요.')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        onClose()
      }
    } catch (err) {
      setError(err.message || String(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth" role="dialog" aria-modal="true" aria-label="Admin access">
      <div className="auth__backdrop" onClick={onClose} />

      <div className="auth__panel">
        <button className="auth__x" onClick={onClose} aria-label="关闭 / 닫기">×</button>

        <p className="eyebrow">Admin Access / 管理员 · 관리자</p>

        {!isAuthConfigured ? (
          <>
            <h2 className="slab auth__title">Coming Soon</h2>
            <p className="auth__lede">
              登录功能尚未接入认证服务，暂时无法使用。
              <br />
              로그인 기능이 아직 인증 서비스에 연결되지 않았습니다.
            </p>
            <p className="auth__hint">
              配置 <code>VITE_SUPABASE_URL</code> 与 <code>VITE_SUPABASE_ANON_KEY</code> 后即可启用。
              <br />
              <code>VITE_SUPABASE_URL</code> 과 <code>VITE_SUPABASE_ANON_KEY</code> 설정 후 활성화됩니다.
            </p>
          </>
        ) : (
          <>
            <h2 className="slab auth__title">{mode === 'signin' ? 'Sign In' : 'Sign Up'}</h2>

            <div className="auth__switch" role="tablist">
              <button
                role="tab"
                aria-selected={mode === 'signin'}
                onClick={() => { setMode('signin'); setError(''); setNotice('') }}
              >
                登录 / 로그인
              </button>
              <button
                role="tab"
                aria-selected={mode === 'signup'}
                onClick={() => { setMode('signup'); setError(''); setNotice('') }}
              >
                注册 / 가입
              </button>
            </div>

            <form className="auth__form" onSubmit={handleSubmit}>
              <label className="auth__field">
                <span>Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                />
              </label>

              <label className="auth__field">
                <span>Password</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                  placeholder="至少 8 位 / 8자 이상"
                />
              </label>

              {error && <p className="auth__error">{error}</p>}
              {notice && <p className="auth__notice">{notice}</p>}

              <button className="auth__submit" type="submit" disabled={busy}>
                {busy ? '处理中… / 처리 중…' : mode === 'signin' ? 'Sign In' : 'Sign Up'}
              </button>
            </form>

            <p className="auth__hint">
              仅供站点管理员使用。/ 사이트 관리자 전용입니다.
            </p>
          </>
        )}
      </div>
    </div>
  )
}
