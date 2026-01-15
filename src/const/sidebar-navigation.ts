import { HomeIcon, CalendarIcon, PlusCircleIcon, ListIcon, TicketIcon, StoreIcon, UsersIcon, MapPinIcon, ClipboardListIcon, ShieldCheckIcon } from "lucide-react"
import { NavigationGroup } from "@/types"


/**
 * @name navigationGroups
 * @description Configuración de la barra lateral para el dashboard de Casa Javorai
 * @type {NavigationGroup[]}
 * 
 * para modificar la barra lateral, agregar o eliminar items, modificar los iconos, etc.
 * este es el formato que se debe seguir:
 * 
 * {
 *   title: "Titulo del grupo", // si no hay titulo, no se muestra
 *   links: [
 *     {
 *       href: "ruta", // ruta a la que se dirige
 *       label: "etiqueta", // texto que se muestra
 *       icon: Icono // icono que se muestra
 *     },
 *   ]
 * }
 * 
 * @author Allan Velez
 */
export const sidebarNavigation: NavigationGroup[] = [
  {
    links: [
      {
        href: "/dashboard",
        label: "Inicio",
        icon: HomeIcon
      },
      {
        href: "/dashboard/calendar",
        label: "Calendario",
        icon: CalendarIcon
      },
      {
        href: "/dashboard/bookings",
        label: "Reservas",
        icon: ListIcon
      },
      {
        href: "/dashboard/create-booking",
        label: "Nueva Solicitud",
        icon: PlusCircleIcon,
        className: "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear"
      },
    ]
  },
  {
    title: "Mis Solicitudes",
    links: [
      {
        href: "/dashboard/my-bookings",
        label: "Mis Reservas",
        icon: ClipboardListIcon
      },
    ]
  },
  {
    title: "Administración",
    links: [
      {
        href: "/dashboard/admin/requests",
        label: "Gestión de Solicitudes",
        icon: ShieldCheckIcon
      },
      {
        href: "/dashboard/activities",
        label: "Eventos Culturales",
        icon: TicketIcon
      },
      {
        href: "/dashboard/contacts",
        label: "Contactos",
        icon: UsersIcon
      },
      {
        href: "/dashboard/ventures",
        label: "Emprendimientos",
        icon: StoreIcon
      },
    ]
  }
];
