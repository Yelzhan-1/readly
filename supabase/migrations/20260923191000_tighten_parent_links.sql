-- Tighten parent_child_links so a signed-in parent cannot attach
-- another family's child by UUID, and allow story updates the client already sends.
-- Safe to re-run. Does not drop tables or rows.

create schema if not exists private;

create or replace function private.caller_owns_child(target uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.child_profiles c
    where c.id = target and c.owner_id = auth.uid()
  );
$$;

revoke all on function private.caller_owns_child(uuid) from public;
grant usage on schema private to authenticated;
grant execute on function private.caller_owns_child(uuid) to authenticated;

drop policy if exists parent_child_links_insert on public.parent_child_links;
create policy parent_child_links_insert on public.parent_child_links
  for insert to authenticated
  with check (
    parent_id = auth.uid()
    and private.caller_owns_child(child_id)
  );

drop policy if exists stories_update on public.stories;
create policy stories_update on public.stories
  for update to authenticated
  using (private.caller_owns_child(child_id))
  with check (private.caller_owns_child(child_id));
