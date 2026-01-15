import { LucideIcon } from "lucide-react";

export type Role = 'gestor' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl?: string;
}

export interface Contact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  metadata?: any;
  createdAt?: string;
  updatedAt?: string;
}



export interface NavItemProps {
  href: string;
  label?: string;
  title?: string;
  icon: LucideIcon;
  className?: string;
  button?: {
    onClick?: () => void;
    icon: LucideIcon;
    link?: string;
  };
  children?: {
    title: string;
    href: string;
    icon?: LucideIcon;
  }[];
}

export interface NavigationGroup {

  title?: string;
  links: {
    href: string;
    label?: string;
    title?: string;
    icon: LucideIcon;
    className?: string;
    action?: {
      onClick?: () => void;
      icon: LucideIcon;
      link?: string;
    };
    children?: {
      title: string;
      href: string;
      icon?: LucideIcon;
    }[];
  }[];
}

/* Seccion de Espacios */
export type SpaceId = 'sala' | 'verde' | 'planche' | 'multiuso' | string;

export interface Space {
  id: string; // UUID primary key
  slug: string; // sala, verde, etc.
  name: string;
  description?: string;
  capacity?: number;
  dimensions?: string;
  type: string;
  hourlyRate: number;
  color?: string;
  image?: string;
  mapConfig?: {
    x: number;
    y: number;
    width: number;
    height: number;
    borderRadius?: number;
    rotation?: number;
    path?: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

/* Seccion de Reservas */

export type NoiseLevel = 'silent' | 'moderate' | 'loud';
export type BookingStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';
export type RecurrenceFrequency = 'none' | 'daily' | 'weekly' | 'monthly';

export interface Booking {
  id: string;
  userId?: string;
  user?: User | { name: string; email: string }; // Added to see who made the request
  spaceId: string;
  title: string;
  description?: string;
  responsible?: string[]; // Legacy field (names as strings)
  responsibleContactIds?: string[]; // New field (contact IDs)
  responsibleContacts?: Contact[]; // Populated contacts (for display)
  startTime: Date;
  endTime: Date;
  activityType?: string;
  noiseLevel: string;
  needsSilence: boolean;
  exclusive: boolean;
  status: BookingStatus; // Use specialized type
  adminNotes?: string; // Admin notes when approving/rejecting
  rejectionReason?: string; // Reason for rejection
  totalPrice?: number;
  recurrence?: {
    frequency: RecurrenceFrequency;
    daysOfWeek?: number[];
    endDate?: Date;
  };
  warnings?: {
    type: 'noise_conflict' | 'silence_conflict' | 'overlap';
    message: string;
    severity: 'warning' | 'blocking';
  }[];
  warningsAcknowledged?: boolean; // User acknowledged warnings
  approvedAt?: Date; // When it was approved
  approvedBy?: string; // Admin who approved (user ID)
  contactId?: string;
  contact?: Contact;
  space?: Space;
  createdAt: Date;
  updatedAt: Date;
}

/* Seccion de Productos */

export interface Product {
  id: string;
  name: string;
  description?: string;
  price?: number;
  currency: string;
  category?: string;
  type: 'product' | 'service';
  size?: string;
  dimensions?: string;
  imageUrl?: string;
  videoUrl?: string;
  ventureId: string;
  createdAt?: string | Date;
}

/* Seccion de Actividades */

export interface Activity {
  id: string;
  title: string;
  description?: string;
  startAt: Date;
  endAt: Date;
  responsible?: string[]; // Legacy field (names as strings)
  responsibleContactIds?: string[]; // New field (contact IDs)
  responsibleContacts?: Contact[]; // Populated contacts (for display)
  imageUrl?: string;
  videoUrl?: string;
  instagram?: string;
  email?: string;
  tags?: string[]; // Standardized to string array
  createdAt?: string | Date;
  updatedAt?: string | Date;
  spaces?: Space[];
  ventureId?: string;
  venture?: Venture;
}

/* Seccion de Emprendimientos (Ventures) */

export interface Venture {
  id: string;
  name: string;
  description?: string;
  owner?: string; // Legacy text field
  ownerId?: string; // New structural field (ref auth.users)
  logoUrl?: string;
  ownerImageUrl?: string;
  whatsapp?: string;
  instagram?: string;
  facebook?: string;
  website?: string;
  email?: string;
  products?: Product[]; // Associated products
  createdAt: string | Date;
  updatedAt: string | Date;
}

