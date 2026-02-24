-- TRIGGERS FOR STOCK MANAGEMENT

-- 1. Function to handle stock updates
create or replace function public.handle_stock_update()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  -- IF INSERTING
  if (TG_OP = 'INSERT') then
    if (new.type = 'ENTRY') then
      update public.variations
      set stock_quantity = stock_quantity + new.quantity
      where id = new.variation_id;
    elsif (new.type = 'SALE' or new.type = 'EXIT') then
      update public.variations
      set stock_quantity = stock_quantity - new.quantity
      where id = new.variation_id;
    end if;
    return new;
  end if;

  -- IF DELETING
  if (TG_OP = 'DELETE') then
    if (old.type = 'ENTRY') then
      -- Revert entry: subtract
      update public.variations
      set stock_quantity = stock_quantity - old.quantity
      where id = old.variation_id;
    elsif (old.type = 'SALE' or old.type = 'EXIT') then
      -- Revert exit: add back
      update public.variations
      set stock_quantity = stock_quantity + old.quantity
      where id = old.variation_id;
    end if;
    return old;
  end if;

  -- IF UPDATING
  if (TG_OP = 'UPDATE') then
    -- 1. Revert OLD
    if (old.type = 'ENTRY') then
      update public.variations
      set stock_quantity = stock_quantity - old.quantity
      where id = old.variation_id;
    elsif (old.type = 'SALE' or old.type = 'EXIT') then
      update public.variations
      set stock_quantity = stock_quantity + old.quantity
      where id = old.variation_id;
    end if;

    -- 2. Apply NEW
    if (new.type = 'ENTRY') then
      update public.variations
      set stock_quantity = stock_quantity + new.quantity
      where id = new.variation_id;
    elsif (new.type = 'SALE' or new.type = 'EXIT') then
      update public.variations
      set stock_quantity = stock_quantity - new.quantity
      where id = new.variation_id;
    end if;
    return new;
  end if;

  return null;
end;
$$;

-- 2. Create Trigger
drop trigger if exists on_movement_change on public.movements;

create trigger on_movement_change
  after insert or update or delete on public.movements
  for each row execute procedure public.handle_stock_update();
