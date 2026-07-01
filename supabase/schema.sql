-- Core ERP product catalog
create table if not exists public.erp_products (
  id uuid primary key default gen_random_uuid(),
  sku text not null unique,
  name text not null,
  on_floor_qty integer not null default 0,
  created_at timestamptz not null default now()
);

-- QBO product mirror for mapping
create table if not exists public.qbo_products (
  id uuid primary key default gen_random_uuid(),
  qbo_product_id text not null unique,
  qbo_name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.product_mappings (
  id uuid primary key default gen_random_uuid(),
  qbo_product_id uuid not null references public.qbo_products(id) on delete cascade,
  erp_product_id uuid not null references public.erp_products(id) on delete cascade,
  mapped_at timestamptz not null default now(),
  unique(qbo_product_id)
);

create table if not exists public.customer_invoices (
  id uuid primary key default gen_random_uuid(),
  invoice_no text not null unique,
  customer_name text not null,
  payment_status text not null check (payment_status in ('Paid', 'Partially Paid', 'Unpaid')),
  approved_by_shipping boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.customer_invoice_lines (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.customer_invoices(id) on delete cascade,
  erp_product_id uuid not null references public.erp_products(id),
  qty integer not null check (qty > 0)
);

create table if not exists public.container_shipments (
  id text primary key,
  po_number text not null,
  container_no text not null,
  supplier text not null,
  tracking_number text,
  tracking_source text,
  origin text,
  origin_port_date date,
  on_ship_date date,
  po_date date,
  port_date date,
  delivery_date date,
  port_name text,
  payment_status text not null check (payment_status in ('Paid', 'Partially Paid', 'Unpaid')),
  status text not null check (
    status in (
      'At origin port',
      'On the ship',
      'At destination port',
      'Released from port',
      'Arrived at warehouse',
      'Received into inventory'
    )
  ),
  inventory_status text not null check (inventory_status in ('On Order', 'Partially Received', 'Received')),
  uploaded_at date,
  tracking_connected boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.container_items (
  id uuid primary key default gen_random_uuid(),
  container_id text not null references public.container_shipments(id) on delete cascade,
  erp_product_id uuid not null references public.erp_products(id),
  qty integer not null check (qty > 0)
);

create table if not exists public.container_milestones (
  id uuid primary key default gen_random_uuid(),
  container_id text not null references public.container_shipments(id) on delete cascade,
  stage text not null check (
    stage in (
      'At origin port',
      'On the ship',
      'At destination port',
      'Released from port',
      'Arrived at warehouse',
      'Received into inventory'
    )
  ),
  milestone_date date not null,
  created_at timestamptz not null default now(),
  unique(container_id, stage)
);

create table if not exists public.container_unload_plans (
  container_id text primary key references public.container_shipments(id) on delete cascade,
  scheduled_unload_date date,
  scheduled_unload_time time,
  warehouse_bay text,
  forklift_needed boolean not null default true,
  staff_assigned text[] not null default '{}',
  estimated_pallets integer not null default 0,
  estimated_units integer not null default 0,
  notes text not null default '',
  status text not null check (status in ('Not Scheduled', 'Scheduled', 'Ready to Unload', 'Unloaded')),
  updated_at timestamptz not null default now()
);

create table if not exists public.container_documents (
  id uuid primary key default gen_random_uuid(),
  container_id text not null references public.container_shipments(id) on delete cascade,
  doc_label text not null,
  status text not null check (status in ('Uploaded', 'Missing')),
  uploaded_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(container_id, doc_label)
);

create table if not exists public.container_internal_notes (
  container_id text primary key references public.container_shipments(id) on delete cascade,
  notes text not null default '',
  updated_at timestamptz not null default now()
);

create index if not exists idx_container_milestones_container_id on public.container_milestones(container_id);
create index if not exists idx_container_items_container_id on public.container_items(container_id);
create index if not exists idx_invoice_lines_invoice_id on public.customer_invoice_lines(invoice_id);
create index if not exists idx_container_documents_container_id on public.container_documents(container_id);
