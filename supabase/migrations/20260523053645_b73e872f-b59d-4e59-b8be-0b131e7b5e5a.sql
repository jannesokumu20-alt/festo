
create table if not exists public.site_content (
  key text primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.site_content enable row level security;

create policy "site_content public read"
  on public.site_content for select
  using (true);

create policy "site_content public insert"
  on public.site_content for insert
  with check (true);

create policy "site_content public update"
  on public.site_content for update
  using (true) with check (true);

insert into public.site_content (key, data) values ('main', '{}'::jsonb)
  on conflict (key) do nothing;

insert into storage.buckets (id, name, public)
  values ('site-images', 'site-images', true)
  on conflict (id) do nothing;

create policy "site-images public read"
  on storage.objects for select
  using (bucket_id = 'site-images');

create policy "site-images public insert"
  on storage.objects for insert
  with check (bucket_id = 'site-images');

create policy "site-images public update"
  on storage.objects for update
  using (bucket_id = 'site-images') with check (bucket_id = 'site-images');

create policy "site-images public delete"
  on storage.objects for delete
  using (bucket_id = 'site-images');
