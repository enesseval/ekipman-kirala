-- ============================================================
-- ekipman-kirala — Supabase Schema
-- Run this in Supabase SQL Editor: https://app.supabase.com
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─── Equipment ────────────────────────────────────────────────────────────────

create table if not exists equipment (
  id                        text primary key,          -- e.g. EM-001
  name                      text not null,
  type                      text not null check (type in ('espresso_machine', 'grinder')),
  brand                     text not null,
  model                     text not null,
  serial_number             text not null unique,
  status                    text not null default 'available'
                              check (status in ('available', 'rented', 'maintenance')),
  health_status             text not null default 'green'
                              check (health_status in ('green', 'yellow', 'red')),
  cups_served_since_service integer not null default 0,
  cups_service_threshold    integer not null,
  total_cups_served         integer not null default 0,
  location_id               text references locations(id) on delete set null,
  last_service_date         date not null,
  next_service_due          date not null,
  daily_rental_rate         integer not null,           -- kuruş (TL × 100)
  notes                     text not null default '',
  image_url                 text,
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now()
);

-- ─── Locations ───────────────────────────────────────────────────────────────

create table if not exists locations (
  id               text primary key,                   -- e.g. LOC-001
  name             text not null,
  venue_type       text not null check (venue_type in ('cafe','festival','wedding','corporate','other')),
  address          text not null,
  city             text not null,
  country          text not null default 'TR',
  lat              numeric,
  lng              numeric,
  contact_name     text not null,
  contact_email    text not null default '',
  contact_phone    text not null default '',
  active_event_id  text,
  start_date       date,
  end_date         date,
  notes            text not null default '',
  created_at       timestamptz not null default now()
);

-- Add FK after both tables exist
alter table equipment
  add constraint fk_equipment_location
  foreign key (location_id) references locations(id) on delete set null;

-- ─── Events ──────────────────────────────────────────────────────────────────

create table if not exists events (
  id                    text primary key,              -- e.g. EVT-001
  name                  text not null,
  type                  text not null check (type in ('cafe','festival','wedding','corporate','other')),
  status                text not null default 'upcoming'
                          check (status in ('upcoming','active','completed','cancelled')),
  client_name           text not null,
  client_email          text not null default '',
  client_phone          text not null default '',
  location_id           text references locations(id) on delete set null,
  venue_name            text not null,
  venue_address         text not null,
  start_date            date not null,
  end_date              date,
  expected_attendees    integer not null default 0,
  expected_cups_per_day integer not null default 0,
  barista_count         integer not null default 1,
  quote_id              text,
  notes                 text not null default '',
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

-- Junction: event ↔ equipment
create table if not exists event_equipment (
  event_id     text not null references events(id) on delete cascade,
  equipment_id text not null references equipment(id) on delete cascade,
  primary key (event_id, equipment_id)
);

-- ─── Maintenance Records ─────────────────────────────────────────────────────

create table if not exists maintenance_records (
  id               uuid primary key default uuid_generate_v4(),
  equipment_id     text not null references equipment(id) on delete cascade,
  service_type     text not null check (service_type in ('routine','repair','deep_clean','part_replacement')),
  performed_by     text not null,
  performed_at     date not null,
  cups_at_service  integer not null default 0,
  description      text not null,
  cost             integer not null default 0,         -- kuruş
  next_service_at  integer not null default 0,
  created_at       timestamptz not null default now()
);

-- ─── Quotes ──────────────────────────────────────────────────────────────────

create table if not exists quotes (
  id                text primary key,                  -- e.g. QT-2026-0001
  quote_number      text not null unique,
  status            text not null default 'draft'
                      check (status in ('draft','sent','accepted','rejected','expired')),
  client_name       text not null,
  client_email      text not null default '',
  client_phone      text not null default '',
  event_id          text references events(id) on delete set null,
  subtotal          integer not null default 0,        -- kuruş
  tax_rate          numeric not null default 0.20,
  tax_amount        integer not null default 0,        -- kuruş
  discount_amount   integer not null default 0,        -- kuruş
  total             integer not null default 0,        -- kuruş
  valid_until       date,
  notes             text not null default '',
  generated_by_ai   boolean not null default false,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create table if not exists quote_line_items (
  id               uuid primary key default uuid_generate_v4(),
  quote_id         text not null references quotes(id) on delete cascade,
  equipment_id     text not null references equipment(id) on delete restrict,
  equipment_name   text not null,                      -- snapshot at quote time
  equipment_type   text not null,
  days             integer not null default 1,
  daily_rate       integer not null,                   -- kuruş — snapshot at quote time
  subtotal         integer not null,                   -- kuruş
  notes            text not null default ''
);

-- ─── Indexes ─────────────────────────────────────────────────────────────────

create index if not exists idx_equipment_status        on equipment(status);
create index if not exists idx_equipment_location      on equipment(location_id);
create index if not exists idx_equipment_health        on equipment(health_status);
create index if not exists idx_events_status           on events(status);
create index if not exists idx_events_start_date       on events(start_date);
create index if not exists idx_maintenance_equipment   on maintenance_records(equipment_id, performed_at desc);
create index if not exists idx_quotes_status           on quotes(status);
create index if not exists idx_quotes_event            on quotes(event_id);
create index if not exists idx_line_items_quote        on quote_line_items(quote_id);

-- ─── Updated_at trigger ──────────────────────────────────────────────────────

create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_equipment_updated_at
  before update on equipment
  for each row execute function update_updated_at();

create trigger trg_events_updated_at
  before update on events
  for each row execute function update_updated_at();

create trigger trg_quotes_updated_at
  before update on quotes
  for each row execute function update_updated_at();

-- ─── Row Level Security ───────────────────────────────────────────────────────
-- For Phase 1 demo: allow all operations without auth
-- In Phase 2+: add proper auth policies

alter table equipment         enable row level security;
alter table locations         enable row level security;
alter table events            enable row level security;
alter table event_equipment   enable row level security;
alter table maintenance_records enable row level security;
alter table quotes            enable row level security;
alter table quote_line_items  enable row level security;

-- Temporary: allow all (replace with auth policies in Phase 2)
create policy "allow_all_equipment"          on equipment          for all using (true) with check (true);
create policy "allow_all_locations"          on locations          for all using (true) with check (true);
create policy "allow_all_events"             on events             for all using (true) with check (true);
create policy "allow_all_event_equipment"    on event_equipment    for all using (true) with check (true);
create policy "allow_all_maintenance"        on maintenance_records for all using (true) with check (true);
create policy "allow_all_quotes"             on quotes             for all using (true) with check (true);
create policy "allow_all_line_items"         on quote_line_items   for all using (true) with check (true);

-- ─── Realtime ─────────────────────────────────────────────────────────────────

alter publication supabase_realtime add table equipment;
alter publication supabase_realtime add table events;
alter publication supabase_realtime add table quotes;
alter publication supabase_realtime add table maintenance_records;
