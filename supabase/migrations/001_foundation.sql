-- SocialPilot Foundation Schema

create extension if not exists pgcrypto;

-- Users (extends Supabase auth.users)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  avatar_url text,
  plan text not null default 'free',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Social account connections (per user, per platform)
create table if not exists social_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  platform text not null,
  platform_user_id text,
  platform_username text,
  display_name text,
  avatar_url text,
  access_token text,
  refresh_token text,
  token_expires_at timestamptz,
  scopes text[],
  metadata jsonb default '{}',
  connected_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, platform, platform_user_id)
);

-- Posts
create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  media_urls text[] default '{}',
  platforms text[] not null default '{}',
  status text not null default 'draft',
  scheduled_at timestamptz,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Post results (per platform publish status)
create table if not exists post_results (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references posts(id) on delete cascade,
  platform text not null,
  platform_post_id text,
  status text not null default 'pending',
  error_message text,
  reach integer default 0,
  likes integer default 0,
  comments integer default 0,
  shares integer default 0,
  published_at timestamptz,
  created_at timestamptz not null default now()
);

-- AI generation history
create table if not exists ai_generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  topic text,
  tone text,
  platform text,
  content_type text,
  generated_content text,
  created_at timestamptz not null default now()
);

-- RLS
alter table profiles enable row level security;
alter table social_accounts enable row level security;
alter table posts enable row level security;
alter table post_results enable row level security;
alter table ai_generations enable row level security;

-- Profile policies
create policy "Users read own profile" on profiles for select using (auth.uid() = id);
create policy "Users update own profile" on profiles for update using (auth.uid() = id);
create policy "Users insert own profile" on profiles for insert with check (auth.uid() = id);

-- Social account policies
create policy "Users read own accounts" on social_accounts for select using (auth.uid() = user_id);
create policy "Users insert own accounts" on social_accounts for insert with check (auth.uid() = user_id);
create policy "Users update own accounts" on social_accounts for update using (auth.uid() = user_id);
create policy "Users delete own accounts" on social_accounts for delete using (auth.uid() = user_id);

-- Post policies
create policy "Users read own posts" on posts for select using (auth.uid() = user_id);
create policy "Users insert own posts" on posts for insert with check (auth.uid() = user_id);
create policy "Users update own posts" on posts for update using (auth.uid() = user_id);
create policy "Users delete own posts" on posts for delete using (auth.uid() = user_id);

-- Post results policies
create policy "Users read own results" on post_results for select
  using (post_id in (select id from posts where user_id = auth.uid()));
create policy "Service role manage results" on post_results for all using (true) with check (true);

-- AI generation policies
create policy "Users read own generations" on ai_generations for select using (auth.uid() = user_id);
create policy "Users insert own generations" on ai_generations for insert with check (auth.uid() = user_id);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', ''));
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
