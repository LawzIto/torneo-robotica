-- Correcciones de seguridad CIRI 2026
-- Ejecutar en Supabase → SQL Editor. Es una transacción: se aplica todo o nada.

begin;

-- 1. El capitán no puede aprobar su propia inscripción.
--    Solo admin/organizador cambian "estado". Si el capitán cambia de
--    categoría o equipo, la inscripción vuelve a "pendiente".
--    auth.uid() nulo = SQL Editor / backend: no se restringe.
create or replace function public.proteger_estado_inscripcion()
returns trigger
language plpgsql
set search_path = public
as $fn$
begin
  if auth.uid() is not null
     and coalesce(mi_rol(), '') not in ('admin', 'organizador') then
    if tg_op = 'INSERT' then
      new.estado := 'pendiente';
    else
      new.estado := old.estado;
      if new.categoria_id is distinct from old.categoria_id
         or new.equipo_id is distinct from old.equipo_id then
        new.estado := 'pendiente';
      end if;
    end if;
  end if;
  return new;
end;
$fn$;

drop trigger if exists trg_proteger_estado_inscripcion on public.inscripciones;
create trigger trg_proteger_estado_inscripcion
  before insert or update on public.inscripciones
  for each row execute function public.proteger_estado_inscripcion();

-- 2. Un perfil nuevo nunca debe nacer como admin por defecto.
alter table public.perfiles alter column rol set default 'capitan';

-- 3. search_path fijo en todas las funciones (aviso "Function Search Path Mutable").
alter function public.actualizar_timestamp() set search_path = public;
alter function public.agregar_capitan_como_participante() set search_path = public;
alter function public.auto_inscribir_innovacion_libre() set search_path = public;
alter function public.crear_perfil_nuevo_usuario() set search_path = public;
alter function public.es_capitan_de_inscripcion(uuid) set search_path = public;
alter function public.es_capitan_del_equipo(uuid) set search_path = public;
alter function public.handle_new_user() set search_path = public;
alter function public.mi_rol() set search_path = public;
alter function public.proteger_cambio_de_rol() set search_path = public;
alter function public.validar_limite_participantes() set search_path = public;

-- 4. Las funciones de trigger no deben poder llamarse desde la API.
--    Los triggers siguen funcionando igual. mi_rol y es_capitan_* se
--    dejan: las usan las políticas RLS y solo devuelven datos propios.
revoke execute on function
  public.actualizar_timestamp(),
  public.agregar_capitan_como_participante(),
  public.auto_inscribir_innovacion_libre(),
  public.crear_perfil_nuevo_usuario(),
  public.handle_new_user(),
  public.proteger_cambio_de_rol(),
  public.validar_limite_participantes(),
  public.proteger_estado_inscripcion()
from public, anon, authenticated;

commit;
