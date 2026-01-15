"use client";

import { useState } from "react";
import {
    Combobox,
    ComboboxContent,
    ComboboxGroup,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
    ComboboxTrigger,
    ComboboxEmpty
} from "@/components/ui/shadcn-io/combobox";
import { useContacts } from "@/hooks/queries/useContacts";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import type { Contact } from "@/types";

interface ContactMultiSelectProps {
    value?: string[]; // Array of contact IDs
    onChange?: (value: string[]) => void;
    placeholder?: string;
    className?: string;
}

export function ContactMultiSelect({
    value = [],
    onChange,
    placeholder = "Seleccionar contactos...",
    className,
}: ContactMultiSelectProps) {
    const [open, setOpen] = useState(false);
    const { data: contacts = [], isLoading } = useContacts();

    const comboboxData = contacts.map(c => ({
        label: c.name,
        value: c.id
    }));

    return (
        <Combobox
            data={comboboxData}
            onOpenChange={setOpen}
            onValueChange={onChange}
            value={value}
            open={open}
            multiple
            type="contacto"
            className={className}
        >
            <ComboboxTrigger className="h-auto min-h-10 py-1 justify-start">
                <div className="flex flex-wrap gap-1">
                    {value.length > 0 ? (
                        contacts
                            .filter(c => value.includes(c.id))
                            .map(contact => (
                                <Badge
                                    key={contact.id}
                                    variant="secondary"
                                    className="gap-1 px-1 py-0"
                                >
                                    {contact.name}
                                    <button
                                        title="close-button"
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onChange?.(value.filter(id => id !== contact.id));
                                        }}
                                        className="ml-1 ring-offset-background  rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 hover:bg-muted"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </Badge>
                            ))
                    ) : (
                        <span className="text-muted-foreground">{placeholder}</span>
                    )}
                </div>
            </ComboboxTrigger>
            <ComboboxContent>
                <ComboboxInput />
                <ComboboxEmpty />
                <ComboboxList>
                    <ComboboxGroup>
                        {contacts.map((contact) => (
                            <ComboboxItem key={contact.id} value={contact.id}>
                                {contact.name}
                            </ComboboxItem>
                        ))}
                    </ComboboxGroup>
                </ComboboxList>
            </ComboboxContent>
        </Combobox>
    );
}
