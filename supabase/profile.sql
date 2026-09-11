-- ============================================================
-- 简介页内容表 / 프로필 페이지 콘텐츠 테이블
-- 在 Supabase → SQL Editor 里整段粘贴运行
-- Supabase → SQL Editor 에 전체 붙여넣고 실행
-- 可重复运行 / 반복 실행 가능
-- ============================================================

-- 单行表：整个网站只有一份简介，用 id = 1 锁死
-- 단일 행 테이블: 사이트 전체에 프로필은 하나뿐이므로 id = 1 로 고정
create table if not exists public.portfolio_profile (
  id          int primary key default 1 check (id = 1),
  name        text,
  name_cn     text,
  role        text,
  tagline     text,
  quote       text,
  bio         text,
  bio_en      text,
  portrait    text,
  disciplines jsonb not null default '[]'::jsonb,  -- [{en, cn}]
  laurels     jsonb not null default '[]'::jsonb,  -- ["url", ...]
  contact     jsonb not null default '[]'::jsonb,  -- [{label, value, href}]
  education   jsonb not null default '[]'::jsonb,  -- [{degree, school}]
  credits     jsonb not null default '[]'::jsonb,  -- [{title, kind, role}]
  work        jsonb not null default '[]'::jsonb,  -- [{org, role}]
  awards      jsonb not null default '[]'::jsonb,  -- [{festival, prize, status}]
  updated_at  timestamptz not null default now()
);

alter table public.portfolio_profile enable row level security;

drop policy if exists "pf_profile_public_read" on public.portfolio_profile;
create policy "pf_profile_public_read" on public.portfolio_profile
  for select using (true);

drop policy if exists "pf_profile_auth_write" on public.portfolio_profile;
create policy "pf_profile_auth_write" on public.portfolio_profile
  for all to authenticated using (true) with check (true);

select '✅ 简介表建立完成 / 프로필 테이블 생성 완료' as status;
