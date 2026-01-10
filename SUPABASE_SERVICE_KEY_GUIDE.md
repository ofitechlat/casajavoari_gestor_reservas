# Cómo Obtener el Service Role Key de Supabase

Para completar la migración de usuarios, necesitas obtener el **Service Role Key** de tu proyecto de Supabase.

## Pasos para Obtener la Clave

1. **Ir al Dashboard de Supabase:**
   - Abre tu navegador
   - Ve a: https://supabase.com/dashboard

2. **Iniciar Sesión:**
   - Si no has iniciado sesión, ingresa tus credenciales

3. **Seleccionar tu Proyecto:**
   - Click en el proyecto `casajavorai_reservas`

4. **Ir a Configuración de API:**
   - En el menú lateral, click en **Settings** (⚙️)
   - Luego click en **API**
   - O ve directamente a: https://supabase.com/dashboard/project/rppgqniszjvayrgxnyka/settings/api

5. **Copiar el Service Role Key:**
   - Busca la sección **Project API keys**
   - Encuentra la clave llamada **`service_role`**
   - Debería tener una advertencia: ⚠️ "This key has the ability to bypass Row Level Security. Never share it publicly."
   - Click en el ícono de copiar (📋) o selecciona y copia la clave completa
   - La clave empieza con `eyJ...`

## Agregar la Clave al Archivo .env

Una vez que tengas la clave:

1. Abre el archivo `.env` en la raíz del proyecto
2. Busca la línea:
   ```
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```
3. Reemplaza `your_service_role_key_here` con la clave que copiaste
4. Guarda el archivo

## Ejemplo

Tu archivo `.env` debería verse así:

```env
# Supabase Service Role Key (for server-side admin operations only - NEVER expose to client)
# Get this from: Supabase Dashboard > Project Settings > API > service_role key
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwcGdxbmlzemp2YXlyZ3hueWthIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzk4MTQ1OCwiZXhwIjoyMDgzNTU3NDU4fQ.XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

> ⚠️ **IMPORTANTE**: Esta clave tiene permisos completos sobre tu base de datos. NUNCA la compartas públicamente ni la expongas en el código del cliente.

## Después de Agregar la Clave

Una vez que agregues la clave al archivo `.env`, estarás listo para ejecutar los scripts de migración:

1. Actualizar emails: `npx tsx scripts/update-user-emails.ts`
2. Migrar usuarios: `npx tsx scripts/migrate-users-to-supabase.ts`
