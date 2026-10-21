create type public.app_role as enum ('admin', 'user');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.user_roles where user_id = _user_id and role = _role) $$;

create policy "Users read own roles" on public.user_roles for select to authenticated using (user_id = auth.uid());

-- First user to sign up becomes admin
create or replace function public.handle_new_user_role()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  if not exists (select 1 from public.user_roles where role = 'admin') then
    insert into public.user_roles (user_id, role) values (new.id, 'admin');
  else
    insert into public.user_roles (user_id, role) values (new.id, 'user');
  end if;
  return new;
end; $$;
create trigger on_auth_user_created_role after insert on auth.users
for each row execute function public.handle_new_user_role();

create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  category text not null default 'TVs',
  price numeric not null default 0,
  old_price numeric,
  image_url text,
  gallery text[] not null default '{}',
  features text[] not null default '{}',
  description text not null default '',
  specs jsonb not null default '{}'::jsonb,
  badge text,
  featured boolean not null default false,
  in_stock boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.products to anon, authenticated;
grant insert, update, delete on public.products to authenticated;
grant all on public.products to service_role;
alter table public.products enable row level security;
create policy "Anyone can view products" on public.products for select to anon, authenticated using (true);
create policy "Admins insert products" on public.products for insert to authenticated with check (public.has_role(auth.uid(), 'admin'));
create policy "Admins update products" on public.products for update to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "Admins delete products" on public.products for delete to authenticated using (public.has_role(auth.uid(), 'admin'));

create or replace function public.touch_updated_at() returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end; $$;
create trigger products_touch before update on public.products for each row execute function public.touch_updated_at();

insert into public.products (name, slug, category, price, old_price, image_url, features, description, specs, badge, featured, sort_order) values
('TCL C745 55" QLED Gaming Google TV','tcl-c745-55','TVs',87999,109999,'/products/tv-c745.jpg',array['Screen size: 55 inches','OS: Google TV','144Hz VRR Game Master'],'A QLED gaming powerhouse with 144Hz VRR, Dolby Vision & Atmos and a frameless design that disappears into your living room.','{"Resolution":"4K UHD 3840x2160","Refresh rate":"144Hz VRR","HDR":"Dolby Vision, HDR10+","Audio":"Dolby Atmos","USB ports":"2"}','-20%',true,1),
('TCL S5400 43" FHD Android TV','tcl-s5400-43','TVs',27499,null,'/products/tv-s5400.jpg',array['43-inch Display','LED Screen','Full HD 1920x1080'],'Sharp Full HD picture with Android TV, voice remote and Dolby Audio in a metallic bezel-less frame.','{"Resolution":"1920x1080","OS":"Android TV","Audio":"Dolby Audio","HDMI":"2"}',null,false,2),
('TCL P7L 50" Premium QLED TV','tcl-p7l-50','TVs',54999,64999,'/products/tv-p7l.jpg',array['Display: 50 inch','Technology: QLED','Smart OS: Google TV'],'Quantum Dot colour, slim uni-body and Google TV built in.','{"Resolution":"4K UHD","Panel":"QLED","OS":"Google TV"}','New',true,3),
('TCL C6K 98" QD-MiniLED TV','tcl-c6k-98','TVs',379999,400000,'/products/tv-c6k.jpg',array['Precise Dimming up to 512 zones','High HDR Brightness','ONKYO 2.1 Hi-Fi'],'Cinema-scale 98 inch QD-MiniLED with precise local dimming and ONKYO sound.','{"Size":"98 inch","Panel":"QD-MiniLED","Dimming zones":"512","Audio":"ONKYO 2.1"}','Flagship',true,4),
('TCL Q85H 7.1.4 Dolby Atmos Soundbar','tcl-q85h-soundbar','Soundbars',89999,99999,'/products/soundbar.jpg',array['7.1.4 channels','Dolby Atmos & DTS:X','Wireless subwoofer'],'Immersive 3D sound with up-firing drivers and deep wireless bass.','{"Channels":"7.1.4","Power":"860W","Connectivity":"HDMI eARC, Bluetooth, Wi-Fi"}',null,false,5),
('TCL 460L French Door Refrigerator','tcl-fridge-460','Refrigerators',129999,145999,'/products/fridge.jpg',array['Capacity: 460L','Inverter compressor','Frost free'],'Spacious French door design with smart inverter cooling and stainless finish.','{"Capacity":"460L","Type":"French Door","Energy":"Inverter A++"}',null,true,6),
('TCL 10kg Front Load Washing Machine','tcl-washer-10','Washing Machines',64999,72999,'/products/washer.jpg',array['Capacity: Wash 10kg','Front Load | Fully Automatic','Spin speed: 1400rpm'],'Quiet inverter motor, steam care and 15 smart programs.','{"Capacity":"10kg","Spin":"1400rpm","Type":"Front Load"}',null,false,7),
('TCL 10.5kg Washer & Dryer Combo','tcl-washer-dryer','Washing Machines',84999,94999,'/products/washer-dryer.jpg',array['Wash 10.5kg / Dry 6kg','Front Load | Fully Automatic','Spin speed: 1200rpm'],'Wash and dry in one machine with AI fabric care.','{"Wash":"10.5kg","Dry":"6kg","Spin":"1200rpm"}','Combo',false,8);