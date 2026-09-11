-- ============================================================
-- 作品集内容表 / 포트폴리오 콘텐츠 스키마
-- 在 Supabase → SQL Editor 里整段粘贴运行
-- Supabase → SQL Editor 에 전체 붙여넣고 실행
-- 可重复运行，不会破坏已有数据 / 반복 실행해도 기존 데이터 안전
-- ============================================================

-- ---------- 表 / 테이블 ----------
-- 表名带 portfolio_ 前缀，避免与项目里已有的同名表冲突
-- portfolio_ 접두사로 기존 동일 이름 테이블과의 충돌 방지

-- 图片板块的项目分组（持枪信使 / 回声 / 落暮 这一层）
-- 이미지 탭의 프로젝트 그룹
create table if not exists public.portfolio_projects (
  id         uuid primary key default gen_random_uuid(),
  title      text not null,
  title_cn   text,
  meta       text,
  role       text,
  sort_order int  not null default 0,
  created_at timestamptz not null default now()
);

-- 作品：影片(film) 与 静帧(image) 共用一张表
-- 작품: 영화(film)와 스틸(image) 공용 테이블
create table if not exists public.portfolio_works (
  id         uuid primary key default gen_random_uuid(),
  kind       text not null check (kind in ('film', 'image')),
  project_id uuid references public.portfolio_projects(id) on delete cascade,
  title      text not null,
  title_cn   text,
  meta       text,
  role       text,
  body       text,
  body_en    text,
  image_url  text,
  video_url  text,
  ratio      text not null default '16 / 9',
  sort_order int  not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists pf_works_kind_sort_idx    on public.portfolio_works (kind, sort_order);
create index if not exists pf_works_project_sort_idx on public.portfolio_works (project_id, sort_order);

-- ---------- 行级安全 / 행 수준 보안 (RLS) ----------
-- 核心规则：任何访客都能「读」，只有登录用户能「写」
-- 핵심 규칙: 방문자는 읽기만, 로그인 사용자만 쓰기 가능

alter table public.portfolio_projects enable row level security;
alter table public.portfolio_works    enable row level security;

drop policy if exists "pf_projects_public_read" on public.portfolio_projects;
create policy "pf_projects_public_read" on public.portfolio_projects
  for select using (true);

drop policy if exists "pf_projects_auth_write" on public.portfolio_projects;
create policy "pf_projects_auth_write" on public.portfolio_projects
  for all to authenticated using (true) with check (true);

drop policy if exists "pf_works_public_read" on public.portfolio_works;
create policy "pf_works_public_read" on public.portfolio_works
  for select using (true);

drop policy if exists "pf_works_auth_write" on public.portfolio_works;
create policy "pf_works_auth_write" on public.portfolio_works
  for all to authenticated using (true) with check (true);

-- ---------- 文件存储 / 파일 저장소 ----------
-- 建一个名为 media 的公开桶，存图片和视频
-- media 라는 공개 버킷 생성, 이미지·영상 저장

insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

drop policy if exists "media_public_read" on storage.objects;
create policy "media_public_read" on storage.objects
  for select using (bucket_id = 'media');

drop policy if exists "media_auth_insert" on storage.objects;
create policy "media_auth_insert" on storage.objects
  for insert to authenticated with check (bucket_id = 'media');

drop policy if exists "media_auth_update" on storage.objects;
create policy "media_auth_update" on storage.objects
  for update to authenticated using (bucket_id = 'media');

drop policy if exists "media_auth_delete" on storage.objects;
create policy "media_auth_delete" on storage.objects
  for delete to authenticated using (bucket_id = 'media');

-- ---------- 完成 / 완료 ----------
select '✅ 建表完成 / 테이블 생성 완료' as status;
