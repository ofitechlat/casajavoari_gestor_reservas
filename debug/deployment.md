# Guía de Despliegue - Casa Javorai

Este documento detalla los pasos para desplegar la aplicación en un entorno de producción compartido (cPanel) utilizando una base de datos MySQL.

## Requisitos Previos
- Acceso a cPanel.
- Node.js instalado en el entorno de desarrollo (para construir).
- Acceso para crear bases de datos MySQL en cPanel.

## 1. Construcción (Build)

En tu máquina local, genera los archivos estáticos y de servidor:
```bash
npm run build
```
Esto creará una carpeta `.next` y `public`.

*Nota: Para Next.js en cPanel, a menudo se requiere un servidor Node.js personalizado (`server.js`) o usar un servicio de hosting compatible con Next.js (Vercel/Netlify) es más fácil. Si usas cPanel con "Setup Node.js App":*

1.  Sube todo el contenido del proyecto (excepto `node_modules` y `.git`) o clona tu repositorio en el servidor.
2.  Entra a la configuración de "Setup Node.js App" en cPanel.
3.  Crea una aplicación apuntando a la carpeta de tu proyecto.
4.  Instala las dependencias desde el panel (`Run NPM Install`).

## 2. Configuración de Base de Datos (MySQL)

1.  **Crear Base de Datos**:
    - Ve a "Bases de Datos MySQL" en cPanel.
    - Crea una nueva DB (ej. `casajavo_db`).
    - Crea un nuevo Usuario (ej. `casajavo_user`) y contraseña segura.
    - Asigna el usuario a la DB con "Todos los Privilegios".

2.  **Configurar Variables de Entorno**:
    - En la raíz de tu aplicación en el servidor, crea un archivo `.env` (si no existe).
    - Agrega la cadena de conexión usando los datos anteriores:
    ```env
    DATABASE_URL="mysql://casajavo_user:password123@localhost:3306/casajavo_db"
    ```

3.  **Migración de Esquema**:
    - Necesitas crear las tablas en la nueva DB.
    - Si tienes acceso SSH:
      ```bash
      npx prisma db push
      ```
    - Si no tienes SSH, puedes ejecutar la ruta de seed una vez o usar un script local conectado a la DB remota (si el hosting permite conexiones remotas).

## 3. Configuración del Panel de Admin

Una vez la aplicación esté corriendo:
1.  Logueate como Administrador (`admin@casajavorai.com`).
2.  Ve al **Mapa de Espacios** y haz clic en el engranaje (Configuración).
3.  Ve a la pestaña **Base de Datos**.
4.  Ingresa las credenciales de producción ahí si deseas modificar la configuración futura o generar el string de conexión nuevamente.

## 4. Usuarios Iniciales

Si la base de datos está vacía, puedes poblarla visitando la siguiente ruta oculta una vez desplegado:
`https://tusitio.com/api/seed`

Esto creará los usuarios por defecto:
- **Admin**: `admin@casajavorai.com`
- **Gestor**: `ana@casajavorai.com`

---
**Soporte**: Contacta al desarrollador si `npm install` falla en el servidor.
