-- Kjør dette i Supabase SQL Editor (https://supabase.com/dashboard → SQL Editor)

create table teams (
  id bigint generated always as identity primary key,
  name text not null unique,
  email text unique,
  created_at timestamptz default now()
);

create table articles (
  id bigint generated always as identity primary key,
  name text not null,
  article_number text not null unique,
  price numeric not null default 0,
  sizes jsonb not null default '[]',
  created_at timestamptz default now()
);

create table orders (
  id bigint generated always as identity primary key,
  team_id bigint not null references teams(id) on delete cascade,
  contact_person text not null,
  status text not null default 'Utkast' check (status in ('Utkast', 'Sendt', 'Bekreftet')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table order_items (
  id bigint generated always as identity primary key,
  order_id bigint not null references orders(id) on delete cascade,
  article_id bigint not null references articles(id),
  size text not null default '',
  quantity integer not null default 1,
  print_name text not null default '',
  print_number text not null default ''
);

-- Hvis du allerede har kjørt skjemaet, kjør bare disse to linjene:
-- alter table order_items add column if not exists print_name text not null default '';
-- alter table order_items add column if not exists print_number text not null default '';

-- Skru av Row Level Security (appen håndterer tilgang selv)
alter table teams enable row level security;
alter table articles enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

create policy "Allow all for authenticated" on teams for all to authenticated using (true) with check (true);
create policy "Allow all for authenticated" on articles for all to authenticated using (true) with check (true);
create policy "Allow all for authenticated" on orders for all to authenticated using (true) with check (true);
create policy "Allow all for authenticated" on order_items for all to authenticated using (true) with check (true);
