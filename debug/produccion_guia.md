# Guía de Producción y Estado Actual

## 1. Estado del Proyecto
- **Login**: ✅ Funcional.
  - **Admin**: `admin@casajavorai.com` / `admin123`
  - **Gestor**: `ana@casajavorai.com` / `gestor123`
  - **Usuario**: `user@casajavorai.com` / `user123` (Rol 'user' habilitado para prueba)
- **Base de Datos**: ✅ Conectada (SQLite local `dev.db`).
- **Versión Prisma**: 5.22.0 (Estable para Windows).

## 2. Cómo Simular Producción Localmente
Para ver cómo se comportará la aplicación en un entorno real (sin el modo desarrollador lento):

1.  **Construir la aplicación**:
    ```bash
    npm run build
    ```
    *Esto optimiza el código y genera la carpeta `.next`.*

2.  **Iniciar el servidor de producción**:
    ```bash
    npm start
    ```
    *La aplicación correrá en `localhost:3000` pero modo optimizado/rápido.*

## 3. Lista de Pendientes para Producción Real (Checklist)

### A. Base de Datos
Actualmente usas **SQLite** (`dev.db`), que es un archivo local.
- [ ] **Migrar a PostgreSQL o MySQL**: SQLite no maneja bien muchos usuarios simultáneos.
  - Cambiar `provider = "sqlite"` a `"postgresql"` en `schema.prisma`.
  - Configurar `DATABASE_URL` en el servidor con la URL real (ej. Supabase, AWS, Neon).
  - Ejecutar `npx prisma db push` o migraciones contra la nueva DB.

### B. Seguridad y Autenticación
- [ ] **Encriptar Contraseñas**:
  - Actualmente las contraseñas se comparan en texto plano en `route.ts`.
  - **Urgente**: Implementar `bcrypt` para hashear contraseñas antes de guardarlas y compararlas.
- [ ] **Validación de Sesión**:
  - Implementar sesiones seguras (JWT o Cookies HTTP-only). Actualmente es un login básico.
- [ ] **Formulario de Login Real**:
  - La página `/login` tiene botones directos para prueba.
  - **Falta**: Crear campos `<input>` para email y contraseña para que el usuario escriba sus credenciales reales.

### C. Variables de Entorno (.env)
- [ ] **Proteger Secretos**:
  - Asegúrate de tener una variable `SECRET_KEY` o `NEXTAUTH_SECRET` larga y aleatoria.
  - Nunca subir `.env` a GitHub.

## 4. Errores Conocidos y Notas Técnicas
- **`src/lib/db.ts`**: Verás un `@ts-ignore` sobre `datasources`.
  - *Causa*: Diferencia estricta de tipos en Prisma.
  - *Estado*: **Ignorable**. El código funciona correctamente en runtime.
- **Botón "Usuario"**: Se agregó temporalmente al Login para facilitar tus pruebas con el rol `user`.

---
**Resumen**: El sistema "funciona" lógicamente, pero para salir a internet (producción real) necesitas **cambiar la base de datos** y **mejorar la seguridad del login**.
