create table public.leaderboard (
  id uuid not null default gen_random_uuid (),
  player uuid null,
  position numeric null,
  created_at timestamp with time zone not null default now(),
  constraint leaderboard_pkey primary key (id),
  constraint leaderboard_player_fkey foreign KEY (player) references players (id) on update CASCADE on delete set null
) TABLESPACE pg_default;

create table public.match_players (
  id serial not null,
  match_id uuid null,
  player_id uuid null,
  team text not null,
  constraint match_players_pkey primary key (id),
  constraint match_players_match_id_fkey foreign KEY (match_id) references matches (id) on delete CASCADE,
  constraint match_players_player_id_fkey foreign KEY (player_id) references players (id) on delete CASCADE
) TABLESPACE pg_default;

create table public.matches (
  id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone not null default now(),
  home_score numeric not null default '0'::numeric,
  away_score numeric not null default '0'::numeric,
  status text null,
  constraint matches_pkey primary key (id)
) TABLESPACE pg_default;

create table public.players (
  id uuid not null default gen_random_uuid (),
  label text not null,
  created_at timestamp with time zone not null default now(),
  elo_rating numeric null default '1500'::numeric,
  constraint players_pkey primary key (id)
) TABLESPACE pg_default;

create trigger on_player_create_add_to_leaderboard
after INSERT on players for EACH row
execute FUNCTION set_initial_leaderboard_position ();