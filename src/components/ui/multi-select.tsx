"use client";

import * as React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------------------------------
 * Context
 * -----------------------------------------------------------------------------------------------*/

interface MultiSelectContextValue {
  value: string[];
  onValueChange: (value: string[]) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  toggleValue: (val: string) => void;
}

const MultiSelectContext = React.createContext<MultiSelectContextValue | undefined>(
  undefined
);

function useMultiSelect() {
  const context = React.useContext(MultiSelectContext);
  if (!context) {
    throw new Error("useMultiSelect must be used within a MultiSelect");
  }
  return context;
}

/* -------------------------------------------------------------------------------------------------
 * MultiSelect (Root)
 * -----------------------------------------------------------------------------------------------*/

interface MultiSelectProps {
  children: React.ReactNode;
  value: string[];
  onValueChange: (value: string[]) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const MultiSelect = ({
  children,
  value,
  onValueChange,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
}: MultiSelectProps) => {
  const [internalOpen, setInternalOpen] = React.useState(false);

  const open = controlledOpen ?? internalOpen;
  const setOpen = setControlledOpen ?? setInternalOpen;

  const toggleValue = React.useCallback(
    (val: string) => {
      const newValue = value.includes(val)
        ? value.filter((v) => v !== val)
        : [...value, val];
      onValueChange(newValue);
    },
    [value, onValueChange]
  );

  return (
    <MultiSelectContext.Provider value={{ value, onValueChange, open, setOpen, toggleValue }}>
      <Popover open={open} onOpenChange={setOpen}>
        {children}
      </Popover>
    </MultiSelectContext.Provider>
  );
};

/* -------------------------------------------------------------------------------------------------
 * MultiSelectTrigger
 * -----------------------------------------------------------------------------------------------*/

interface MultiSelectTriggerProps extends React.ComponentPropsWithoutRef<typeof Button> {
  asChild?: boolean;
}

const MultiSelectTrigger = React.forwardRef<HTMLButtonElement, MultiSelectTriggerProps>(
  ({ className, children, ...props }, ref) => {
    const { open } = useMultiSelect();
    return (
      <PopoverTrigger asChild>
        <Button
          ref={ref}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between h-10 min-h-9 px-3", className)}
          {...props}
        >
          {children}
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
    );
  }
);
MultiSelectTrigger.displayName = "MultiSelectTrigger";

/* -------------------------------------------------------------------------------------------------
 * MultiSelectValue
 * -----------------------------------------------------------------------------------------------*/

interface MultiSelectValueProps {
  placeholder?: string;
  // This helper helps us lookup labels if we don't want to pass all options down manually
  // or we can just let the user map them in their own composition.
  children?: (selected: string[]) => React.ReactNode;
}

const MultiSelectValue = ({ placeholder, children }: MultiSelectValueProps) => {
  const { value } = useMultiSelect();

  if (value.length === 0) {
    return <span className="text-muted-foreground">{placeholder}</span>;
  }

  if (children) {
    return <div className="flex flex-wrap gap-1 py-1">{children(value)}</div>;
  }

  return (
    <div className="flex flex-wrap gap-1 py-1">
      {value.map((val) => (
        <Badge key={val} variant="secondary" className="mr-1">
          {val}
          <MultiSelectRemoveButton value={val} />
        </Badge>
      ))}
    </div>
  );
};

/** -------------------------------------------------------------------------------------------------
 * MultiSelectRemoveButton (Remove button for MultiSelect)
 * -----------------------------------------------------------------------------------------------*/

function MultiSelectRemoveButton({ value }: { value: string }) {
  const { toggleValue } = useMultiSelect();
  return (
    <Button variant="ghost" size="icon" className="rounded-full" 
      onClick={() => {
        toggleValue(value);
      }} 
      title="Eliminar"
      aria-label={`Eliminar ${value}`}
    >
      <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
    </Button>
  );
}


/* -------------------------------------------------------------------------------------------------
 * MultiSelectBadge
 * -----------------------------------------------------------------------------------------------*/

interface MultiSelectBadgeProps extends React.ComponentPropsWithoutRef<typeof Badge> {
  value: string;
}

const MultiSelectBadge = React.forwardRef<HTMLDivElement, MultiSelectBadgeProps>(
  ({ className, value: itemValue, children, ...props }, ref) => {
    const { toggleValue } = useMultiSelect();

    return (
      <Badge
        asChild
        ref={ref}
        variant="secondary"
        className={cn("mr-1", className)}
        {...props}
      >
        {children}
        <button
          className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              toggleValue(itemValue);
            }
          }}
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleValue(itemValue);
          }}
        >
          <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
        </button>
      </Badge>
    );
  }
);
MultiSelectBadge.displayName = "MultiSelectBadge";

/* -------------------------------------------------------------------------------------------------
 * MultiSelectContent
 * -----------------------------------------------------------------------------------------------*/

interface MultiSelectContentProps extends React.ComponentPropsWithoutRef<typeof PopoverContent> { }

const MultiSelectContent = React.forwardRef<
  React.ElementRef<typeof PopoverContent>,
  MultiSelectContentProps
>(({ className, children, ...props }, ref) => {
  return (
    <PopoverContent
      ref={ref}
      className={cn("w-(--radix-popover-trigger-width) p-0", className)}
      {...props}
    >
      <Command>{children}</Command>
    </PopoverContent>
  );
});
MultiSelectContent.displayName = "MultiSelectContent";

/* -------------------------------------------------------------------------------------------------
 * MultiSelectItem
 * -----------------------------------------------------------------------------------------------*/

interface MultiSelectItemProps extends React.ComponentPropsWithoutRef<typeof CommandItem> {
  value: string;
}

const MultiSelectItem = React.forwardRef<
  React.ElementRef<typeof CommandItem>,
  MultiSelectItemProps
>(({ className, value: itemValue, children, ...props }, ref) => {
  const { value, toggleValue } = useMultiSelect();
  const isSelected = value.includes(itemValue);

  return (
    <CommandItem
      ref={ref}
      onSelect={() => toggleValue(itemValue)}
      className={cn("cursor-pointer", className)}
      {...props}
    >
      <Check
        className={cn(
          "mr-2 h-4 w-4",
          isSelected ? "opacity-100" : "opacity-0"
        )}
      />
      {children}
    </CommandItem>
  );
});
MultiSelectItem.displayName = "MultiSelectItem";

/* -------------------------------------------------------------------------------------------------
 * Helper components (mostly aliases for Command/CommandList/etc)
 * -----------------------------------------------------------------------------------------------*/

const MultiSelectSearch = CommandInput;
const MultiSelectList = CommandList;
const MultiSelectEmpty = CommandEmpty;
const MultiSelectGroup = CommandGroup;
const MultiSelectSeparator = CommandSeparator;

export {
  MultiSelect,
  MultiSelectTrigger,
  MultiSelectValue,
  MultiSelectContent,
  MultiSelectSearch,
  MultiSelectList,
  MultiSelectItem,
  MultiSelectBadge,
  MultiSelectEmpty,
  MultiSelectGroup,
  MultiSelectSeparator,
};
