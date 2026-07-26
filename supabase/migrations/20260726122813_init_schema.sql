-- Schema per docs/06_data_model.md. That doc is the source of truth;
-- if the doc and the live database ever disagree, migrate the database to match the doc.

create table requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  age_band text not null,
  theme text not null,
  difficulty_target text
);

create table concepts (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references requests (id),
  created_at timestamptz not null default now(),
  raw_output text not null,
  skills_claimed jsonb not null,
  ethics_flag text,
  was_chosen boolean not null default false
);

create table checks (
  id uuid primary key default gen_random_uuid(),
  concept_id uuid not null references concepts (id),
  check_type text not null,
  passed boolean not null,
  detail text not null,
  created_at timestamptz not null default now()
);

create table builds (
  id uuid primary key default gen_random_uuid(),
  concept_id uuid not null references concepts (id),
  created_at timestamptz not null default now(),
  pdf_path text not null,
  design_doc_version text not null
);

create index concepts_request_id_idx on concepts (request_id);
create index checks_concept_id_idx on checks (concept_id);
create index builds_concept_id_idx on builds (concept_id);
