"use client";

import * as React from "react";
import { useUsers } from "@/hooks/queries/useBookings";
import {
  MultiSelect,
  MultiSelectTrigger,
  MultiSelectValue,
  MultiSelectContent,
  MultiSelectSearch,
  MultiSelectList,
  MultiSelectItem,
  MultiSelectEmpty,
  MultiSelectGroup,
  MultiSelectBadge,
  MultiSelectSeparator,
} from "@/components/ui/multi-select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useContacts } from "@/hooks/queries";
import { NewContactModal } from "@/components/dialog/new-contact";

interface UserMultiSelectProps {
  value: string[];
  onValueChange: (value: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function UserMultiSelect({
  value,
  onValueChange,
  placeholder = "Seleccionar usuarios...",
  className,
}: UserMultiSelectProps) {
  const { data: userMap, isLoading } = useUsers();
  const { data: contactMap, isLoading: isLoadingContacts } = useContacts();
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const contactOptions = React.useMemo(() => {
    if (!contactMap) return [];
    return Object.entries(contactMap).map(([id, contact]) => ({
      id,
      name: contact.name,
      email: contact.email,
      initials: contact.name
        .split(" ")
        .filter(Boolean)
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase() || "??",
    }));
  }, [contactMap]);

  const userOptions = React.useMemo(() => {
    if (!userMap) return [];
    return Object.entries(userMap).map(([id, user]) => ({
      id,
      name: user.name,
      email: user.email,
      initials: user.name
        .split(" ")
        .filter(Boolean)
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase() || "??",
    }));
  }, [userMap]);

  if (isLoading || isLoadingContacts) {
    return <Skeleton className="h-10 w-full" />;
  }

  return (
    <>
      <MultiSelect value={value} onValueChange={onValueChange}>
        <MultiSelectTrigger className={className}>
          <MultiSelectValue placeholder={placeholder}>
            {(selectedIds) =>
              selectedIds.map((id) => {
                const user = userOptions.find((u) => u.id === id);
                const contact = contactOptions.find((c) => c.id === id);
                return (
                  <MultiSelectBadge key={id} value={id}>
                    <div className="flex items-center gap-1.5">
                      <Avatar className="h-4 w-4 text-[6px]">
                        <AvatarFallback className="font-bold">
                          {user?.initials || contact?.initials || "??"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="truncate">{user?.name || contact?.name || id}</span>
                    </div>
                  </MultiSelectBadge>
                );
              })
            }
          </MultiSelectValue>
        </MultiSelectTrigger>
        <MultiSelectContent>
          <MultiSelectSearch placeholder="Buscar usuarios..." />
          <MultiSelectList>
            <MultiSelectEmpty>No se encontraron usuarios.</MultiSelectEmpty>
            <MultiSelectGroup>
              {userOptions.map((user) => (
                <MultiSelectItem key={user.id} value={user.id}>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6 text-[10px]">
                      <AvatarFallback className="font-bold">
                        {user.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium leading-none">
                        {user.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {user.email}
                      </span>
                    </div>
                  </div>
                </MultiSelectItem>
              ))}
              {contactOptions.map((contact) => (
                <MultiSelectItem key={contact.id} value={contact.id}>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6 text-[10px]">
                      <AvatarFallback className="font-bold">
                        {contact.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium leading-none">
                        {contact.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {contact.email}
                      </span>
                    </div>
                  </div>
                </MultiSelectItem>
              ))}

              <MultiSelectSeparator />

              <MultiSelectItem
                value="add-contact"
                onSelect={() => setIsModalOpen(true)}
              >
                <div className="flex items-center gap-2 w-full">
                  <Avatar className="h-6 w-6 text-[10px] bg-primary/10">
                    <AvatarFallback className="font-bold text-primary">
                      +
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium leading-none">
                      Agregar nuevo contacto
                    </span>
                  </div>
                </div>
              </MultiSelectItem>

              {userOptions.length === 0 && contactOptions.length === 0 && (
                <MultiSelectEmpty>No se encontraron usuarios ni contactos.</MultiSelectEmpty>
              )}
            </MultiSelectGroup>
          </MultiSelectList>
        </MultiSelectContent>
      </MultiSelect>

      <NewContactModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </>
  );
}

