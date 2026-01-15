"use client"

import CalendarView from "@/components/dashboard/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


/**
 * @name CalendarPage
 * @description
 * 
 * TODO:  
 */


export default function CalendarPage() {


  return (
    <Tabs variant="folder" defaultValue="all-events" className="w-full">
      <div className="space-y-2 px-8 mb-8 z-10">
        <header className="py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight">Calendario</h1>
          </div>
        </header>
        <div className="max-w-5xl">
          <TabsList>
            <TabsTrigger value="all-events">Todas las reservas</TabsTrigger>
            <TabsTrigger value="shared">Reservas compartidas</TabsTrigger>
            <TabsTrigger value="public">Reservas publicas</TabsTrigger>
            <TabsTrigger value="archived">Reservas archivadas</TabsTrigger>
          </TabsList>
        </div>
      </div>

      <TabsContent value="all-events" className="px-8 pb-4 ">
        <CalendarView />
      </TabsContent>
    </Tabs>
  );
}
