-- ============================================================
-- Projects（课程作业）内容表 / Projects(수업 과제) 콘텐츠 테이블
-- 在 Supabase → SQL Editor 里整段粘贴运行 / Supabase → SQL Editor 에 붙여넣고 실행
-- 可重复运行 / 반복 실행 가능
-- ============================================================

create table if not exists public.portfolio_assignments (
  id         uuid primary key default gen_random_uuid(),
  week       text,                                   -- W2, W3 …
  date       text,                                   -- 2026-09-13
  title      text not null,
  title_cn   text,
  body       text,
  body_cn    text,
  video      jsonb,                                  -- {src, poster, captions, ratio}
  image      jsonb,                                  -- {src, alt, ratio, href}
  files      jsonb not null default '[]'::jsonb,     -- [{kind, label, href}]
  sort_order int  not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists pf_assignments_sort_idx on public.portfolio_assignments (sort_order);

-- 任何人可读，只有登录用户能改 / 누구나 읽기, 로그인 사용자만 쓰기
alter table public.portfolio_assignments enable row level security;

drop policy if exists "pf_assignments_public_read" on public.portfolio_assignments;
create policy "pf_assignments_public_read" on public.portfolio_assignments
  for select using (true);

drop policy if exists "pf_assignments_auth_write" on public.portfolio_assignments;
create policy "pf_assignments_auth_write" on public.portfolio_assignments
  for all to authenticated using (true) with check (true);

select '✅ Projects 表建立完成 / Projects 테이블 생성 완료' as status;
