-- ============================================================
-- CDAI Intranet — schema completo
-- Rode este arquivo inteiro no SQL Editor do seu projeto Supabase
-- (Dashboard -> SQL Editor -> New query -> colar -> Run)
-- ============================================================

create extension if not exists pgcrypto;

-- ============================================================
-- Tabelas
-- ============================================================

create table if not exists competencias (
  id uuid primary key default gen_random_uuid(),
  mes int not null check (mes between 1 and 12),
  ano int not null check (ano between 2000 and 2100),
  label text not null,
  created_at timestamptz not null default now(),
  unique (mes, ano)
);

create table if not exists convenios (
  id uuid primary key default gen_random_uuid(),
  nome text not null unique,
  grupo text not null check (grupo in ('DIRETO', 'AMHP')),
  created_at timestamptz not null default now()
);

create table if not exists uploads (
  id uuid primary key default gen_random_uuid(),
  competencia_id uuid not null references competencias(id) on delete cascade,
  tipo text not null check (tipo in ('producao', 'pendencia')),
  nome_arquivo text not null,
  linhas_processadas int not null default 0,
  enviado_por uuid references auth.users(id),
  enviado_em timestamptz not null default now()
);

create table if not exists producao_convenio (
  id uuid primary key default gen_random_uuid(),
  competencia_id uuid not null references competencias(id) on delete cascade,
  convenio_id uuid not null references convenios(id) on delete cascade,
  quantidade int not null default 0,
  produzido numeric(14,2) not null default 0,
  cobrado numeric(14,2) not null default 0,
  recebido numeric(14,2) not null default 0,
  ir numeric(14,2) not null default 0,
  liquido numeric(14,2) not null default 0,
  upload_id uuid references uploads(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (competencia_id, convenio_id)
);

create table if not exists pendencias (
  id uuid primary key default gen_random_uuid(),
  competencia_id uuid not null references competencias(id) on delete cascade,
  convenio_id uuid not null references convenios(id) on delete cascade,
  data_atendimento date,
  paciente text not null,
  tipo_procedimento text,
  medico text,
  executante text,
  valor_produzido numeric(14,2) not null default 0,
  status text not null default 'pendente' check (status in ('pendente', 'justificada')),
  categoria_justificativa text check (categoria_justificativa in (
    'aguardando_laudo', 'atendimento_retorno', 'erro_lancamento',
    'fora_janela_envio', 'guia_cancelada', 'paciente_desistiu'
  )),
  observacao text,
  justificado_por uuid references auth.users(id),
  justificado_em timestamptz,
  upload_id uuid references uploads(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists glosas (
  id uuid primary key default gen_random_uuid(),
  competencia_id uuid not null references competencias(id) on delete cascade,
  convenio_id uuid not null references convenios(id) on delete cascade,
  paciente text,
  motivo text not null,
  codigo text,
  valor numeric(14,2) not null default 0,
  observacao text,
  criado_por uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create index if not exists idx_producao_competencia on producao_convenio(competencia_id);
create index if not exists idx_pendencias_competencia on pendencias(competencia_id);
create index if not exists idx_pendencias_convenio on pendencias(convenio_id);
create index if not exists idx_pendencias_status on pendencias(status);
create index if not exists idx_glosas_competencia on glosas(competencia_id);
create index if not exists idx_glosas_convenio on glosas(convenio_id);

-- ============================================================
-- Papel do usuario, lido do user_metadata embutido no JWT
-- (user_metadata.role e definido ao criar/editar usuario em /dashboard/usuarios)
-- ============================================================

create or replace function public.current_role()
returns text
language sql stable
as $$
  select coalesce(auth.jwt() -> 'user_metadata' ->> 'role', 'gestor');
$$;

create or replace function public.pode_editar()
returns boolean
language sql stable
as $$
  select public.current_role() in ('faturista', 'admin');
$$;

-- Envio/exclusao de arquivos fica restrito a este e-mail especifico,
-- independente do papel do usuario logado.
create or replace function public.email_permitido_upload()
returns boolean
language sql stable
as $$
  select auth.jwt() ->> 'email' = 'rafah.souza2@gmail.com';
$$;

-- ============================================================
-- RLS — leitura liberada para qualquer autenticado. Upload/exclusao de
-- arquivos (competencias, convenios, uploads, producao_convenio, e
-- insert/delete em pendencias) restrito ao e-mail em email_permitido_upload().
-- Justificar pendencia (update) continua liberado para faturista/admin.
-- Gestao de usuarios (criar/editar/excluir contas) e feito via Service Role
-- nas server actions, fora do alcance do RLS.
-- ============================================================

alter table competencias enable row level security;
alter table convenios enable row level security;
alter table uploads enable row level security;
alter table producao_convenio enable row level security;
alter table pendencias enable row level security;
alter table glosas enable row level security;

create policy "leitura autenticada" on competencias for select to authenticated using (true);
create policy "leitura autenticada" on convenios for select to authenticated using (true);
create policy "leitura autenticada" on uploads for select to authenticated using (true);
create policy "leitura autenticada" on producao_convenio for select to authenticated using (true);
create policy "leitura autenticada" on pendencias for select to authenticated using (true);
create policy "leitura autenticada" on glosas for select to authenticated using (true);

create policy "escrita upload" on competencias for all to authenticated
  using (public.email_permitido_upload()) with check (public.email_permitido_upload());
create policy "escrita upload" on convenios for all to authenticated
  using (public.email_permitido_upload()) with check (public.email_permitido_upload());
create policy "escrita upload" on uploads for all to authenticated
  using (public.email_permitido_upload()) with check (public.email_permitido_upload());
create policy "escrita upload" on producao_convenio for all to authenticated
  using (public.email_permitido_upload()) with check (public.email_permitido_upload());

create policy "upload insere pendencias" on pendencias for insert to authenticated
  with check (public.email_permitido_upload());
create policy "upload exclui pendencias" on pendencias for delete to authenticated
  using (public.email_permitido_upload());
create policy "faturista justifica pendencias" on pendencias for update to authenticated
  using (public.pode_editar()) with check (public.pode_editar());

create policy "faturista lanca glosas" on glosas for all to authenticated
  using (public.pode_editar()) with check (public.pode_editar());

-- ============================================================
-- Primeiro usuario admin
-- ============================================================
-- 1. Crie o usuario em Authentication -> Users -> Add user (defina email/senha).
-- 2. Rode o update abaixo trocando o e-mail e o nome:
--
-- update auth.users
-- set raw_user_meta_data = raw_user_meta_data
--   || jsonb_build_object('role', 'admin', 'full_name', 'Nome do Admin')
-- where email = 'admin@cdai.com.br';
--
-- Depois disso, use a tela /dashboard/usuarios (logado como esse admin) para
-- criar os demais usuarios (faturista, gestor) pela propria interface.

-- ============================================================
-- Migracao: novas categorias de justificativa de pendencia (2026-07-12)
-- Rode isto no SQL Editor se o projeto ja existia com as categorias antigas
-- (glosa, aguardando_nf, recurso_andamento, erro_cadastral, cancelado, outro).
-- ============================================================
--
-- alter table pendencias drop constraint if exists pendencias_categoria_justificativa_check;
-- alter table pendencias add constraint pendencias_categoria_justificativa_check
--   check (categoria_justificativa in (
--     'aguardando_laudo', 'atendimento_retorno', 'erro_lancamento',
--     'fora_janela_envio', 'guia_cancelada', 'paciente_desistiu'
--   ));

-- ============================================================
-- Migracao: upload/exclusao de arquivos restrito a um unico e-mail (2026-07-12)
-- Rode isto no SQL Editor se o projeto ja existia com as politicas antigas
-- de "escrita faturista/admin".
-- ============================================================
--
-- create or replace function public.email_permitido_upload()
-- returns boolean
-- language sql stable
-- as $$
--   select auth.jwt() ->> 'email' = 'rafah.souza2@gmail.com';
-- $$;
--
-- drop policy if exists "escrita faturista/admin" on competencias;
-- create policy "escrita upload" on competencias for all to authenticated
--   using (public.email_permitido_upload()) with check (public.email_permitido_upload());
--
-- drop policy if exists "escrita faturista/admin" on convenios;
-- create policy "escrita upload" on convenios for all to authenticated
--   using (public.email_permitido_upload()) with check (public.email_permitido_upload());
--
-- drop policy if exists "escrita faturista/admin" on uploads;
-- create policy "escrita upload" on uploads for all to authenticated
--   using (public.email_permitido_upload()) with check (public.email_permitido_upload());
--
-- drop policy if exists "escrita faturista/admin" on producao_convenio;
-- create policy "escrita upload" on producao_convenio for all to authenticated
--   using (public.email_permitido_upload()) with check (public.email_permitido_upload());
--
-- drop policy if exists "escrita faturista/admin" on pendencias;
-- create policy "upload insere pendencias" on pendencias for insert to authenticated
--   with check (public.email_permitido_upload());
-- create policy "upload exclui pendencias" on pendencias for delete to authenticated
--   using (public.email_permitido_upload());
-- create policy "faturista justifica pendencias" on pendencias for update to authenticated
--   using (public.pode_editar()) with check (public.pode_editar());

-- ============================================================
-- Migracao: aba de Lancamento de Glosas (2026-07-13)
-- Rode isto no SQL Editor se o projeto ja existia sem a tabela glosas.
-- ============================================================
--
-- create table if not exists glosas (
--   id uuid primary key default gen_random_uuid(),
--   competencia_id uuid not null references competencias(id) on delete cascade,
--   convenio_id uuid not null references convenios(id) on delete cascade,
--   paciente text,
--   motivo text not null,
--   codigo text,
--   valor numeric(14,2) not null default 0,
--   observacao text,
--   criado_por uuid references auth.users(id),
--   created_at timestamptz not null default now()
-- );
--
-- create index if not exists idx_glosas_competencia on glosas(competencia_id);
-- create index if not exists idx_glosas_convenio on glosas(convenio_id);
--
-- alter table glosas enable row level security;
-- create policy "leitura autenticada" on glosas for select to authenticated using (true);
-- create policy "faturista lanca glosas" on glosas for all to authenticated
--   using (public.pode_editar()) with check (public.pode_editar());
