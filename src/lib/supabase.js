// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

// ─── Supabase SQL schema — run this in your Supabase SQL editor ────────────
//
// -- Organizations (one per company / tenant)
// create table organizations (
//   id uuid primary key default gen_random_uuid(),
//   name text not null,
//   cage_code text,
//   duns text,
//   iso_cert text,
//   iatf_cert text,
//   as9100_cert text,
//   quality_manager text,
//   from_email text,
//   logo_url text,
//   stripe_customer_id text,
//   stripe_subscription_id text,
//   plan text default 'trial',          -- trial | starter | professional | enterprise
//   plan_status text default 'active',  -- active | past_due | canceled
//   created_at timestamptz default now()
// );
//
// -- Organization members (users belong to one org)
// create table org_members (
//   id uuid primary key default gen_random_uuid(),
//   org_id uuid references organizations(id) on delete cascade,
//   user_id uuid references auth.users(id) on delete cascade,
//   role text default 'member',  -- owner | admin | member | viewer
//   created_at timestamptz default now(),
//   unique(org_id, user_id)
// );
//
// -- Generated documents
// create table documents (
//   id uuid primary key default gen_random_uuid(),
//   org_id uuid references organizations(id) on delete cascade,
//   created_by uuid references auth.users(id),
//   doc_type text not null,   -- coc | coa | coo | psw | fair | ...
//   doc_number text,
//   title text,
//   content text,             -- AI-generated text content
//   fields jsonb,             -- form field values used to generate
//   status text default 'draft',  -- draft | final | approved | void
//   customer text,
//   part_number text,
//   lot_number text,
//   pdf_url text,             -- Supabase Storage URL after PDF export
//   created_at timestamptz default now(),
//   updated_at timestamptz default now()
// );
//
// -- Nonconformances
// create table nonconformances (
//   id uuid primary key default gen_random_uuid(),
//   org_id uuid references organizations(id) on delete cascade,
//   ncr_number text not null,
//   title text,
//   description text,
//   severity text,  -- critical | major | minor
//   status text default 'open',  -- open | in_progress | closed | void
//   disposition text,
//   assignee text,
//   due_date date,
//   created_at timestamptz default now()
// );
//
// -- PPAP packages
// create table ppap_packages (
//   id uuid primary key default gen_random_uuid(),
//   org_id uuid references organizations(id) on delete cascade,
//   part_number text not null,
//   customer text,
//   submission_level text,
//   status text default 'in_progress',
//   elements_complete jsonb default '[]',
//   cpk_results jsonb,
//   created_at timestamptz default now()
// );
//
// -- Enable Row Level Security on all tables
// alter table organizations enable row level security;
// alter table org_members enable row level security;
// alter table documents enable row level security;
// alter table nonconformances enable row level security;
// alter table ppap_packages enable row level security;
//
// -- RLS: users can only see data for their org
// create policy "org_members_own_org" on org_members
//   for all using (user_id = auth.uid());
//
// create policy "documents_own_org" on documents
//   for all using (
//     org_id in (select org_id from org_members where user_id = auth.uid())
//   );
//
// create policy "nonconformances_own_org" on nonconformances
//   for all using (
//     org_id in (select org_id from org_members where user_id = auth.uid())
//   );
//
// create policy "ppap_own_org" on ppap_packages
//   for all using (
//     org_id in (select org_id from org_members where user_id = auth.uid())
//   );
