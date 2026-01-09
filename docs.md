# Documentación Técnica: Casa Javorai Booking System

Este documento proporciona una visión técnica detallada del sistema de gestión de espacios y reservas de Casa Javorai.

## 1. Resumen del Proyecto
Casa Javorai es una plataforma diseñada para gestionar la reserva de salas y espacios culturales. Permite a los usuarios solicitar espacios, a los gestores revisar solapamientos y a los administradores configurar el mapa de espacios.

### Características Principales
*   **Gestión de Espacios**: Configuración visual de salas (mapa interactivo).
*   **Sistema de Reservas**: Soporte para reservas recurrentes (diarias, semanales, mensuales).
*   **Detección de Conflictos**: Motor lógico que valida solapamientos de tiempo, niveles de ruido y exclusividad de espacios.
*   **Roles de Usuario**: Simulación de Admin, Gestor y Usuario estándar.

## 2. Stack Tecnológico
*   **Framework**: [Next.js 15+](https://nextjs.org/) (App Router).
*   **Lenguaje**: TypeScript.
*   **Base de Datos**: SQLite (vía Prisma).
*   **ORM**: [Prisma](https://www.prisma.io/).
*   **Estilos**: Tailwind CSS + Radix UI.
*   **Iconos**: Lucide React.
*   **Manejo de Fechas**: date-fns.

## 3. Estructura del Proyecto
```text
web-app/
├── prisma/                  # Esquema de base de datos y migraciones
│   ├── schema.prisma        # Definición de modelos (User, Space, Booking)
│   └── seed.ts              # Datos iniciales para desarrollo
├── src/
│   ├── app/                 # Rutas de la aplicación (Next.js App Router)
│   │   ├── api/             # Endpoints de API (Backend)
│   │   ├── dashboard/       # Interfaz principal de gestión
│   │   └── login/           # Autenticación (Simulada)
│   ├── components/          # Componentes de React reutilizables
│   │   ├── ui/              # Componentes base (Botones, Inputs, etc.)
│   │   ├── booking-form.tsx # Formulario principal de solicitudes
│   │   └── space-map.tsx    # Mapa interactivo de espacios
│   ├── contexts/            # Estados globales (Auth, Bookings)
│   ├── lib/                 # Utilidades y configuración de DB (Prisma Client)
│   └── types/               # Definiciones de interfaces TypeScript
├── public/                  # Activos estáticos
└── produccion_guia.md       # Guía específica para despliegue
```

## 4. Modelo de Datos (Prisma)
El sistema utiliza tres modelos principales interconectados:

*   **User**: Almacena información del usuario y su rol (`admin`, `manager`, `user`).
*   **Space**: Define los espacios físicos disponibles, incluyendo su tarifa horaria y configuración geométrica para el mapa (`mapConfig`).
*   **Booking**: Registra las reservas, incluyendo tiempos, estados (`pending`, `approved`, `rejected`) y patrones de recurrencia almacenados como JSON.

> [!NOTE]
> El esquema completo se encuentra en `prisma/schema.prisma`.

## 5. Referencia de la API

### Autenticación (`/api/auth/login`)
*   **POST**: Valida credenciales contra la base de datos.
    *   *Nota*: Actualmente implementa una lógica de bypass de contraseña (`123`) para facilitar pruebas de desarrollo.

### Reservas (`/api/bookings`)
*   **GET**: Retorna todas las reservas con sus relaciones (`user` y `space`).
*   **POST**: Crea una nueva reserva. Realiza validaciones básicas de fecha.
*   **PUT**: Actualiza una reserva existente (ej. cambio de estado o edición de horario).

### Espacios (`/api/spaces`)
*   **GET**: Retorna la lista de espacios.
*   **POST/PUT/DELETE**: Operaciones CRUD para la gestión de salas (restringido a administradores en la UI).

## 6. Lógica de Conflictos de Reserva
El motor de conflictos reside principalmente en `src/contexts/BookingContext.tsx` a través de la función `checkConflicts`.

### Reglas de Validación:
1.  **Solapamiento Temporal**: No pueden existir dos reservas en el mismo espacio al mismo tiempo.
2.  **Nivel de Ruido**:
    *   Si una actividad requiere **Silencio**, no puede coexistir con una actividad marcada como **Ruidosa** en un espacio adyacente (u global si el sistema se escala).
3.  **Exclusividad**: Si una reserva se marca como **Exclusiva**, bloquea el uso de otros espacios durante ese intervalo (dependiendo de la configuración del centro).
4.  **Recurrencia**: La validación expande automáticamente las reglas de recurrencia (ej. "todos los lunes por 3 meses") para verificar conflictos en cada instancia futura.

## 7. Flujo de Desarrollo

### Requisitos Previos
*   Node.js 18+
*   npm o yarn

### Instalación y Setup
1. Instalar dependencias: `npm install`
2. Generar cliente Prisma: `npx prisma generate`
3. Inicializar base de datos y datos de prueba: `npx prisma db seed`
4. Ejecutar en desarrollo: `npm run dev`

### Comandos Útiles
*   `npx prisma studio`: Abre un explorador visual de la base de datos en `localhost:5555`.
*   `npm run build`: Prepara la aplicación para producción.

## 8. Roadmap y Pendientes Técnicos
*   **Seguridad**: Reemplazar la comparación de texto plano por hashing de contraseñas (`bcrypt`).
*   **Base de Datos**: Migrar de SQLite a PostgreSQL para entornos multi-usuario.
*   **Sesiones**: Implementar NextAuth.js para manejo de sesiones seguro.
*   **Notificaciones**: Añadir avisos por correo cuando una reserva cambie de estado.

---
*Ultima actualización: Diciembre 2025*
