'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useBookings } from '@/hooks/queries';
import { RequestCard } from '@/components/dashboard/requests/request-card';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ClipboardList, Clock, CheckCircle2, XCircle, Ban, Plus, ExternalLink } from 'lucide-react';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { cva } from 'class-variance-authority';

function EmptyTab({
  title,
  description,
  icon,
  children
}: {
  title?: string,
  description?: string,
  icon?: React.ReactNode,
  children?: React.ReactNode
}) {
  return (

    <Empty className='border h-[calc(100vh-280px)]'>
      <EmptyMedia>
        {icon}
      </EmptyMedia>
      <EmptyHeader>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>
          {description}
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        {children}
      </EmptyContent>
    </Empty>
  );
}

const statCardVariants = cva(
  "text-2xl font-bold",
  {
    variants: {
      variant: {
        default: "text-primary",
        warning: "text-orange-500",
        success: "text-green-500",
        destructive: "text-destructive",
      },
    },
  }
)

function StatCard({
  title,
  description,
  variant = 'default',
  className
}: {
  title?: string,
  description?: number | string,
  variant?: 'default' | 'warning' | 'success' | 'destructive',
  className?: string
}) {
  return (
    <Card className="px-4 py-2">
      <div className="text-sm text-muted-foreground">{title}</div>
      <div className={cn(statCardVariants({ variant }), className)}>{description}</div>
    </Card>
  )
}

export default function RequestsPage() {
  const { user } = useAuth();
  const { data: bookings = [] } = useBookings();
  const [activeTab, setActiveTab] = useState('pending');

  // Only admins can access
  if (user?.user_metadata?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-full">
        <Empty>
          
        </Empty>
      </div>
    );
  }

  // Filter bookings by status
  const pendingBookings = bookings.filter(b => b.status === 'pending');
  const approvedBookings = bookings.filter(b => b.status === 'approved');
  const rejectedBookings = bookings.filter(b => b.status === 'rejected');
  const cancelledBookings = bookings.filter(b => b.status === 'cancelled');

  return (
    <div className="p-8 space-y-6 h-full">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <ClipboardList className="h-8 w-8" />
            Gestión de Solicitudes
          </h1>
          <p className="text-muted-foreground mt-1">
            Revisa y gestiona todas las solicitudes de reserva
          </p>
        </div>

        {/* Stats Cards */}
        <div className="flex gap-3">
          <StatCard
            variant='warning'
            title='Pendientes'
            description={pendingBookings.length}
          />
          <StatCard
            title='Aprobadas'
            description={approvedBookings.length}
            variant='success'
          />
          <StatCard 
            title='Rechazadas'
            description={rejectedBookings.length}
            variant='destructive'
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} variant="folder">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="pending" className="gap-2">
            <Clock className="h-4 w-4" />
            Pendientes ({pendingBookings.length})
          </TabsTrigger>
          <TabsTrigger value="approved" className="gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Aprobadas ({approvedBookings.length})
          </TabsTrigger>
          <TabsTrigger value="rejected" className="gap-2">
            <XCircle className="h-4 w-4" />
            Rechazadas ({rejectedBookings.length})
          </TabsTrigger>
          <TabsTrigger value="cancelled" className="gap-2">
            <Ban className="h-4 w-4" />
            Canceladas ({cancelledBookings.length})
          </TabsTrigger>
        </TabsList>

        {/* Scrollable Container for All Tabs */}
        <ScrollArea className="h-[calc(100vh-240px)] border-b border-r border-l">

          {/* Pending Tab */}
          <TabsContent value="pending" className="space-y-4 p-4">

            {pendingBookings.length === 0 ? (
              <EmptyTab
                title="No hay solicitudes pendientes"
                description="Todas las solicitudes han sido revisadas. ¡Buen trabajo!"
                icon={<ClipboardList className="h-8 w-8" />}
              >
                <Button className="gap-2" variant="link">
                  Read the documentation
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </EmptyTab>
            ) : (
              pendingBookings.map(booking => (
                <RequestCard
                  key={booking.id}
                  booking={booking}
                  showActions={true}
                />
              ))
            )}
          </TabsContent>

          {/* Approved Tab */}
          <TabsContent value="approved" className="space-y-4 p-4  h-full ">
            {approvedBookings.length === 0 ? (
              <EmptyTab
                title="No hay solicitudes aprobadas"
                description="Todas las solicitudes han sido revisadas. ¡Buen trabajo!"
                icon={<CheckCircle2 className="h-8 w-8" />}
              >
                <Button className="gap-2" variant="link">
                  Read the documentation
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </EmptyTab>
            ) : (
              approvedBookings.map(booking => (
                <RequestCard
                  key={booking.id}
                  booking={booking}
                  showActions={false}
                />
              ))
            )}
          </TabsContent>

          {/* Rejected Tab */}
          <TabsContent value="rejected" className="space-y-4 p-4  h-full ">
            {rejectedBookings.length === 0 ? (
              <Card className="p-12 text-center">
                <div className="text-6xl mb-4">📋</div>
                <h3 className="text-xl font-bold mb-2">No hay solicitudes rechazadas</h3>
                <p className="text-muted-foreground">
                  Las solicitudes rechazadas aparecerán aquí.
                </p>
              </Card>
            ) : (
              rejectedBookings.map(booking => (
                <RequestCard key={booking.id} booking={booking} showActions={false} />
              ))
            )}
          </TabsContent>

          {/* Cancelled Tab */}
          <TabsContent value="cancelled" className="space-y-4 p-4  h-full ">
            {cancelledBookings.length === 0 ? (
              <EmptyTab
                title="No hay solicitudes canceladas"
                description="Todas las solicitudes han sido revisadas. ¡Buen trabajo!"
                icon={<Ban className="h-8 w-8" />}
              />
            ) : (
              cancelledBookings.map(booking => (
                <RequestCard key={booking.id} booking={booking} showActions={false} />
              ))
            )}
          </TabsContent>

        </ScrollArea>
      </Tabs>
    </div>
  );
}
