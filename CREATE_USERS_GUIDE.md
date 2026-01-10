# Crear Usuarios en Supabase Dashboard

Ya que los roles vienen directamente de Supabase, puedes crear los usuarios manualmente desde el Dashboard de Supabase.

## Pasos para Crear Usuarios

### 1. Ir al Dashboard de Supabase

1. Abre: https://supabase.com/dashboard/project/rppgqniszjvayrgxnyka/auth/users
2. Inicia sesión si es necesario

### 2. Crear Usuario: Mercedes (Gestor)

1. Click en **"Add user"** o **"Invite"**
2. Selecciona **"Create new user"**
3. Completa el formulario:
   - **Email**: `mercedes@casajavoari.com`
   - **Password**: `CasaJavoari2026!` (o la que prefieras)
   - **Auto Confirm User**: ✅ Activado (para que no necesite verificar email)
4. En **User Metadata** (sección avanzada), agrega:
   ```json
   {
     "name": "Mercedes Gestora",
     "role": "gestor"
   }
   ```
5. Click en **"Create user"**

### 3. Crear Usuario: Admin

1. Click en **"Add user"** nuevamente
2. Selecciona **"Create new user"**
3. Completa el formulario:
   - **Email**: `admin@casajavoari.com`
   - **Password**: `CasaJavoari2026!` (o la que prefieras)
   - **Auto Confirm User**: ✅ Activado
4. En **User Metadata**, agrega:
   ```json
   {
     "name": "Carlos Admin",
     "role": "admin"
   }
   ```
5. Click en **"Create user"**

## Verificar Usuarios Creados

Después de crear los usuarios, deberías verlos en la lista de usuarios con:
- ✅ Email confirmado
- ✅ Metadata con nombre y rol

## Probar Login

1. Ve a tu aplicación en `/login`
2. Prueba con:
   - Email: `mercedes@casajavoari.com`
   - Password: `CasaJavoari2026!`
3. Verifica que:
   - El login funciona
   - El rol se carga correctamente
   - Redirige al dashboard

## Notas Importantes

- ✅ **AuthContext actualizado**: Ahora lee el rol desde `user_metadata` de Supabase
- ✅ **Emails actualizados**: Los emails en la tabla `User` de Prisma ya están en formato válido
- ✅ **Sincronización automática**: Cuando un usuario inicia sesión, se crea/actualiza su perfil en la tabla `User` de Prisma

## Alternativa: Usar Signup

Si prefieres, los usuarios también pueden registrarse usando la página de signup (cuando la crees):
1. El usuario completa el formulario de registro
2. Supabase crea la cuenta
3. El rol se guarda en `user_metadata`
4. Se crea el perfil en la tabla `User` de Prisma
