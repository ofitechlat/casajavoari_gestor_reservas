"use client";

import { useState } from "react";
import { Mail, Phone, Loader2, Trash2, Edit2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useContacts, useDeleteContact } from "@/hooks/queries";
import { Contact } from "@/types";
import { NewContactModal } from "@/components/dialog/new-contact";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";

function LoadingContacts() {
  return (
    <>
    
    </>
  )
}

export default function ContactsPage() {
  const { data: contacts = [], isLoading } = useContacts();
  const deleteMutation = useDeleteContact();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedContactId, setSelectedContactId] = useState<string | undefined>();
  const [searchQuery, setSearchQuery] = useState("");

  const handleCreateNew = () => {
    setSelectedContactId(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (id: string) => {
    setSelectedContactId(id);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("¿Estás seguro de eliminar este contacto?")) {
      deleteMutation.mutate(id);
    }
  };

  const filteredContacts = contacts.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone?.includes(searchQuery)
  );

  return (
    <div className="p-6 space-y-6 h-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contactos Manuales</h1>
          <p className="text-muted-foreground">Usuarios registrados para alquiler de espacios sin acceso a la aplicación.</p>
        </div>

        <NewContactModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          contactId={selectedContactId}
        />

        <Button onClick={handleCreateNew} className="gap-2">
          Nuevo Contacto
        </Button>
      </div>

      {/**
       * TODO: Cambiar el componente de crudo a usar la ui kit que provee Shadcn
      */}

      {/**
       * 
       * <div className="relative">
       *  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
       *    <Input
       *      placeholder='Buscar contacto por nombre, correo o telefono...'
       *      className='pl-9'
       *      value={searchQuery}
       *      onChange={(e) => setSearchQuery(e.target.value)}
       *    />
       * </div>
       * 
       */}
      <InputGroup>
        <InputGroupAddon align='inline-start'>
          <Search />
        </InputGroupAddon>
        <InputGroupInput 
          placeholder="Buscar contacto por nombre, correo o teléfono..."
          className="pl-9"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </InputGroup>

      {isLoading ? (
/*         <div className="flex justify-center p-20 h-full">
          <Loader2 className="w-10 h-10 animate-spin text-primary opacity-50" />
        </div> */
        <LoadingContacts>
          
        </LoadingContacts>
      ) : filteredContacts.length === 0 ? (
        <div className="text-center p-20 border-2 border-dashed rounded-xl">
          <p className="text-muted-foreground">No se encontraron contactos.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredContacts.map(contact => (
            <Card key={contact.id} className="p-4 flex-row items-center justify-between group hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  {contact.name[0].toUpperCase()}
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{contact.name}</h3>
                  <div className="flex flex-col gap-0.5">
                    {contact.email && (
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Mail className="w-3 h-3" /> {contact.email}
                      </div>
                    )}
                    {contact.phone && (
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Phone className="w-3 h-3" /> {contact.phone}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button size="icon" variant="ghost" className="w-8 h-8 rounded-full" onClick={() => handleEdit(contact.id)}>
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="ghost" className="w-8 h-8 rounded-full text-destructive" onClick={() => handleDelete(contact.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
