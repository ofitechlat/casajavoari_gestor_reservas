# Cómo Ver y Acceder a los Usuarios en Supabase

## Por Qué No Ves la Tabla de Usuarios

La tabla de usuarios de Supabase (`auth.users`) está en el **schema `auth`**, no en el schema `public`. Por eso no aparece en el Table Editor junto con tus otras tablas.

![Schema actual](file:///C:/Users/velez/.gemini/antigravity/brain/b5128f20-86be-4da7-99f9-09bb8f7676ed/uploaded_image_1768001316882.png)

## Dónde Ver los Usuarios

### Opción 1: Authentication > Users (Recomendado)

1. En el dashboard de Supabase, ve a **Authentication** en el menú lateral
2. Click en **Users**
3. Aquí verás todos los usuarios registrados
4. Puedes:
   - Ver detalles de cada usuario
   - Editar user metadata
   - Crear nuevos usuarios
   - Eliminar usuarios
   - Ver sesiones activas

**URL directa:** https://supabase.com/dashboard/project/rppgqniszjvayrgxnyka/auth/users

### Opción 2: SQL Editor

Puedes consultar directamente la tabla `auth.users`:

```sql
SELECT 
  id,
  email,
  raw_user_meta_data,
  created_at,
  email_confirmed_at,
  last_sign_in_at
FROM auth.users;
```

### Opción 3: Usar la Función que Creamos

Desde tu aplicación, usa la función `get_users()`:

```typescript
const { data: users, error } = await supabase
  .rpc('get_users');

console.log(users);
```

## Estructura de auth.users

La tabla `auth.users` tiene estos campos principales:

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | uuid | ID único del usuario |
| `email` | text | Email del usuario |
| `encrypted_password` | text | Contraseña encriptada |
| `email_confirmed_at` | timestamptz | Cuándo confirmó el email |
| `last_sign_in_at` | timestamptz | Último login |
| `raw_user_meta_data` | jsonb | **Metadata personalizado (aquí van nombre y rol)** |
| `raw_app_meta_data` | jsonb | Metadata de la app |
| `created_at` | timestamptz | Fecha de creación |
| `updated_at` | timestamptz | Última actualización |

## Cómo Crear Usuarios

### Desde el Dashboard (Recomendado)

1. Ve a **Authentication > Users**
2. Click en **"Add user"** (botón verde arriba a la derecha)
3. Selecciona **"Create new user"**
4. Completa:
   - **Email**: `mercedes@casajavoari.com`
   - **Password**: `CasaJavoari2026!`
   - **Auto Confirm User**: ✅ (marca esta opción)
5. Expande **"User Metadata"** (Advanced)
6. En el editor JSON, agrega:
   ```json
   {
     "name": "Mercedes Gestora",
     "role": "gestor"
   }
   ```
7. Click en **"Create user"**

### Desde SQL

```sql
-- Nota: Esto requiere permisos especiales
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'mercedes@casajavoari.com',
  crypt('CasaJavoari2026!', gen_salt('bf')),
  now(),
  '{"name": "Mercedes Gestora", "role": "gestor"}'::jsonb,
  now(),
  now()
);
```

**⚠️ Advertencia:** Insertar directamente en `auth.users` no es recomendado. Usa el Dashboard o la API de Supabase.

## Cómo Acceder a los Datos desde tu App

### Obtener Usuario Actual

```typescript
import { useAuth, getUserRole, getUserName } from "@/contexts/AuthContext";

function MyComponent() {
  const { user } = useAuth();
  
  if (!user) return <div>No autenticado</div>;
  
  const name = getUserName(user);
  const role = getUserRole(user);
  
  return (
    <div>
      <p>ID: {user.id}</p>
      <p>Email: {user.email}</p>
      <p>Nombre: {name}</p>
      <p>Rol: {role}</p>
    </div>
  );
}
```

### Listar Todos los Usuarios (Solo Admins)

```typescript
const { data: users, error } = await supabase
  .rpc('get_users');

// Si eres admin, verás todos los usuarios
// Si eres usuario normal, solo verás tu propio perfil
```

## Verificar Usuarios Existentes

Para ver si ya tienes usuarios creados, ejecuta en SQL Editor:

```sql
SELECT 
  id,
  email,
  raw_user_meta_data->>'name' as name,
  raw_user_meta_data->>'role' as role,
  email_confirmed_at,
  created_at
FROM auth.users
ORDER BY created_at DESC;
```

## Próximos Pasos

1. ✅ Ve a **Authentication > Users** en el dashboard
2. ✅ Crea los usuarios Mercedes y Admin
3. ✅ Agrega el metadata con nombre y rol
4. ✅ Prueba el login desde tu aplicación

## Notas Importantes

- ⚠️ **Nunca** modifiques `auth.users` directamente en producción
- ✅ Usa el Dashboard o la API de Supabase para gestionar usuarios
- ✅ Los roles van en `raw_user_meta_data`, no en una columna separada
- ✅ La función `get_users()` que creamos respeta los permisos (admins ven todo, usuarios normales solo se ven a sí mismos)
