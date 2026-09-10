import { createClient } from '@supabase/supabase-js'

// 环境变量在 .env.local（本地）和 Vercel 的 Environment Variables（线上）里配置。
// 환경변수는 .env.local(로컬)과 Vercel의 Environment Variables(배포)에서 설정합니다.
//
// 注意：VITE_ 开头的变量会被打包进前端代码，所以这里只能放 anon key（它本来就是公开的），
//      绝对不能放 service_role key。
// 주의: VITE_ 로 시작하는 변수는 프런트엔드 번들에 포함되므로 anon key(원래 공개용)만 넣습니다.
//      service_role key 는 절대 넣으면 안 됩니다.
const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

/** 是否已配置 Supabase。未配置时整个登录功能进入「准备中」状态，不会渲染密码输入框。 */
export const isAuthConfigured = Boolean(url && anonKey)

export const supabase = isAuthConfigured
  ? createClient(url, anonKey, {
      auth: { persistSession: true, autoRefreshToken: true },
    })
  : null
